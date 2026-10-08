import { Sound } from '../audio/sound.ts';
import { garmentEngine } from '../workshop/garmentEngine.ts';
import { wardrobeManager } from '../discover/wardrobeManager.ts';
import { appRouter } from '../navigation/router.ts';
import { tailorJourneyEngine } from '../journey/tailorJourneyEngine.ts';
import {
  getCulturalTruth,
  checkMultipleStrictTaboos,
  getColorCulturalAnalysis,
  getAllSourcesForGarment
} from '../data/culturalTruths.ts';
import { WardrobeItem } from '../types/index.ts';

export interface CompareOutfitModel {
  id: string;
  sourceType: 'workshop' | 'lookbook';
  title: string;
  garment: string;
  color: string;
  colorName: string;
  event: string;
  accessories: string[];
  hairstyle?: string;
  imageUrl?: string;
  desc?: string;
}

const GARMENT_IMAGE_MAP: Record<string, string> = {
  AO_NGU_THAN: '/images/garments/ao-ngu-than.png',
  AO_TAC: '/images/garments/ao-tac.png',
  AO_NHAT_BINH: '/images/garments/ao-nhat-binh.png',
  AO_GIAO_LINH: '/images/garments/ao-giao-linh.png',
  AO_VIEN_LINH: '/images/garments/ao-vien-linh.png',
  AO_DOI_KHAM: '/images/garments/ao-doi-kham.png',
  AO_TU_THAN: '/images/garments/ao-tu-than.png',
  AO_BA_BA: '/images/garments/ao-ba-ba.png',
  AO_DAI_LEMUR: '/images/garments/ao-dai-lemur.png',
};

export class CompareEngine {
  public outfitA: CompareOutfitModel | null = null;
  public outfitB: CompareOutfitModel | null = null;
  private activeMobileSlot: 'a' | 'b' = 'a';

  public init(): void {
    this.setupUIEvents();
  }

  private setupUIEvents(): void {
    const selectA = document.getElementById('compare-select-a') as HTMLSelectElement | null;
    const selectB = document.getElementById('compare-select-b') as HTMLSelectElement | null;
    const btnSwap = document.getElementById('btn-compare-swap');
    const btnClose = document.getElementById('btn-close-compare');
    const mobileTabA = document.getElementById('btn-mobile-compare-slot-a');
    const mobileTabB = document.getElementById('btn-mobile-compare-slot-b');

    selectA?.addEventListener('change', () => {
      Sound.playClick();
      const val = selectA.value;
      this.outfitA = this.resolveOutfitById(val);
      this.renderComparison();
    });

    selectB?.addEventListener('change', () => {
      Sound.playClick();
      const val = selectB.value;
      this.outfitB = this.resolveOutfitById(val);
      this.renderComparison();
    });

    btnSwap?.addEventListener('click', () => {
      Sound.playChime();
      const temp = this.outfitA;
      this.outfitA = this.outfitB;
      this.outfitB = temp;
      this.syncSelectValues();
      this.renderComparison();
    });

    btnClose?.addEventListener('click', () => {
      Sound.playClick();
      appRouter.switchTab('lookbook');
    });

    mobileTabA?.addEventListener('click', () => {
      Sound.playClick();
      this.setMobileActiveSlot('a');
    });

    mobileTabB?.addEventListener('click', () => {
      Sound.playClick();
      this.setMobileActiveSlot('b');
    });
  }

  private setMobileActiveSlot(slot: 'a' | 'b'): void {
    this.activeMobileSlot = slot;
    const colA = document.getElementById('compare-col-a');
    const colB = document.getElementById('compare-col-b');
    const tabA = document.getElementById('btn-mobile-compare-slot-a');
    const tabB = document.getElementById('btn-mobile-compare-slot-b');

    if (slot === 'a') {
      colA?.classList.add('mobile-col-active');
      colB?.classList.remove('mobile-col-active');
      tabA?.classList.add('active');
      tabB?.classList.remove('active');
    } else {
      colB?.classList.add('mobile-col-active');
      colA?.classList.remove('mobile-col-active');
      tabB?.classList.add('active');
      tabA?.classList.remove('active');
    }
  }

  /**
   * Mở màn hình So Sánh: Chỉ cho phép so sánh giữa các bộ đã lưu trong Lookbook (hoặc với bộ đang làm trong Xưởng Phối)
   */
  public openCompare(presetAId?: string, presetBId?: string): void {
    const lookbookOutfits = wardrobeManager.savedWardrobe;

    // Kiểm tra số lượng bộ đồ trong Lookbook
    if (lookbookOutfits.length === 0) {
      appRouter.showToast('⚠️ Lookbook của bạn chưa có bộ đồ nào để so sánh. Hãy lưu ít nhất 2 bộ!');
      appRouter.switchTab('lookbook');
      return;
    }

    if (lookbookOutfits.length < 2 && !presetAId) {
      appRouter.showToast('💡 Bạn cần lưu ít nhất 2 bộ đồ trong Lookbook để tiến hành so sánh đối chiếu!');
      appRouter.switchTab('lookbook');
      return;
    }

    // Cập nhật danh sách dropdown chỉ gồm các bộ trong Lookbook
    this.populateSelectDropdowns();

    // 1. Thiết lập slot A
    if (presetAId) {
      this.outfitA = this.resolveOutfitById(presetAId);
    } else {
      this.outfitA = this.convertWardrobeToModel(lookbookOutfits[0]);
    }

    // 2. Thiết lập slot B
    if (presetBId) {
      this.outfitB = this.resolveOutfitById(presetBId);
    } else {
      // Ưu tiên chọn bộ trong Lookbook khác với bộ A
      const otherLookbook = lookbookOutfits.find((o) => `wardrobe-${o.id}` !== this.outfitA?.id) || lookbookOutfits[1] || lookbookOutfits[0];
      this.outfitB = this.convertWardrobeToModel(otherLookbook);
    }

    // Đồng bộ lại value của 2 thẻ select
    this.syncSelectValues();
    this.renderComparison();
    this.setMobileActiveSlot('a');
  }

  private getWorkshopCurrentOutfitModel(): CompareOutfitModel {
    const ws = garmentEngine.getCurrentOutfitState();
    const truth = getCulturalTruth(ws.garment);
    const allAcc = [
      ...(ws.accessories || (ws.accessory ? [ws.accessory] : ['QUAT_GIAY'])),
      ...(ws.custom_accessories || [])
    ];

    return {
      id: 'current-workshop',
      sourceType: 'workshop',
      title: `${truth.name} • ${ws.colorName || 'Lụa Thanh'}`,
      garment: ws.garment,
      color: ws.color,
      colorName: ws.colorName || 'Sắc Lụa',
      event: ws.event || 'tet',
      accessories: allAcc,
      hairstyle: ws.custom_hairstyle || ws.hairstyle || 'Tóc búi cao thanh thoát',
      imageUrl: GARMENT_IMAGE_MAP[ws.garment] || '/images/garments/ao-ngu-than.png',
      desc: 'Phương án đang được tinh chỉnh trực tiếp trong Xưởng Phối Đồ.'
    };
  }

  private convertWardrobeToModel(w: WardrobeItem): CompareOutfitModel {
    return {
      id: `wardrobe-${w.id}`,
      sourceType: 'lookbook',
      title: w.title,
      garment: w.garment,
      color: w.color,
      colorName: w.colorName,
      event: w.event,
      accessories: [w.accessory],
      imageUrl: w.imageUrl || GARMENT_IMAGE_MAP[w.garment] || '/images/garments/ao-ngu-than.png',
      desc: `Lưu trong Lookbook cá nhân lúc ${w.savedAt || 'gần đây'}.`
    };
  }

  private resolveOutfitById(id: string): CompareOutfitModel {
    if (id === 'current-workshop') {
      return this.getWorkshopCurrentOutfitModel();
    }

    if (id.startsWith('wardrobe-')) {
      const realId = id.replace('wardrobe-', '');
      const found = wardrobeManager.savedWardrobe.find((w) => w.id === realId);
      if (found) return this.convertWardrobeToModel(found);
    }

    // Mặc định fallback vào bộ đầu tiên trong Lookbook nếu có
    const lookbook = wardrobeManager.savedWardrobe;
    if (lookbook.length > 0) {
      return this.convertWardrobeToModel(lookbook[0]);
    }

    return this.getWorkshopCurrentOutfitModel();
  }

  public populateSelectDropdowns(): void {
    const selectA = document.getElementById('compare-select-a') as HTMLSelectElement | null;
    const selectB = document.getElementById('compare-select-b') as HTMLSelectElement | null;
    if (!selectA || !selectB) return;

    const lookbookItems = wardrobeManager.savedWardrobe;

    let optionsHtml = '';

    if (lookbookItems.length > 0) {
      optionsHtml += `
        <optgroup label="📖 Các Bộ Đã Lưu Trong Lookbook (${lookbookItems.length} bộ)">
          ${lookbookItems
            .map((item, idx) => `<option value="wardrobe-${item.id}">#${idx + 1} — ${item.title} (${item.colorName || 'Sắc Lụa'})</option>`)
            .join('')}
        </optgroup>
      `;
    }

    optionsHtml += `
      <optgroup label="🎨 Đang Phối Trong Xưởng Phối">
        <option value="current-workshop">✨ Bộ Đang Tinh Chỉnh Trong Xưởng (Hiện Tại)</option>
      </optgroup>
    `;

    selectA.innerHTML = optionsHtml;
    selectB.innerHTML = optionsHtml;
  }

  private syncSelectValues(): void {
    const selectA = document.getElementById('compare-select-a') as HTMLSelectElement | null;
    const selectB = document.getElementById('compare-select-b') as HTMLSelectElement | null;
    if (selectA && this.outfitA) selectA.value = this.outfitA.id;
    if (selectB && this.outfitB) selectB.value = this.outfitB.id;
  }

  public renderComparison(): void {
    if (!this.outfitA || !this.outfitB) return;

    this.renderSlot('a', this.outfitA);
    this.renderSlot('b', this.outfitB);
  }

  private renderSlot(slot: 'a' | 'b', outfit: CompareOutfitModel): void {
    const prefix = `compare-slot-${slot}`;
    const truth = getCulturalTruth(outfit.garment);
    const colorAnalysis = getColorCulturalAnalysis(outfit.color, outfit.garment, outfit.event);
    const tabooCheck = checkMultipleStrictTaboos(truth.id, outfit.accessories);
    const citations = getAllSourcesForGarment(outfit.garment);

    // 1. Ảnh & Tiêu đề
    const imgEl = document.getElementById(`${prefix}-img`) as HTMLImageElement | null;
    const titleEl = document.getElementById(`${prefix}-title`);
    const statusBadge = document.getElementById(`${prefix}-status-badge`);
    const sourceBadge = document.getElementById(`${prefix}-source-badge`);

    if (imgEl) {
      imgEl.src = outfit.imageUrl || GARMENT_IMAGE_MAP[outfit.garment] || '/images/garments/ao-ngu-than.png';
      imgEl.alt = outfit.title;
    }

    if (titleEl) {
      titleEl.textContent = outfit.title;
    }

    if (sourceBadge) {
      const sourceMap = {
        workshop: '🎨 Đang Phối',
        lookbook: '📖 Lookbook'
      };
      sourceBadge.textContent = sourceMap[outfit.sourceType] || 'Lookbook';
    }

    if (statusBadge) {
      if (tabooCheck.hasTaboo) {
        statusBadge.textContent = '⚡ Phá Cách / Kiêng Kỵ';
        statusBadge.className = 'compare-verdict-badge verdict-warn';
      } else {
        statusBadge.textContent = '✓ Chuẩn Mực Di Sản';
        statusBadge.className = 'compare-verdict-badge verdict-safe';
      }
    }

    // 2. Dáng áo & Niên đại
    const garmentNameEl = document.getElementById(`${prefix}-garment-name`);
    const eraEl = document.getElementById(`${prefix}-era`);
    const regionEl = document.getElementById(`${prefix}-region`);

    if (garmentNameEl) garmentNameEl.textContent = truth.name;
    if (eraEl) eraEl.textContent = truth.historicalEra;
    if (regionEl) {
      const regionMap: Record<string, string> = {
        BAC_BO: 'Bắc Bộ (Kinh Bắc / Thăng Long)',
        TRUNG_BO: 'Trung Bộ (Cố đô Huế)',
        NAM_BO: 'Nam Bộ (Sông nước Cửu Long)',
        TOAN_QUOC: 'Toàn Quốc (Quy chuẩn Minh Mạng)'
      };
      regionEl.textContent = regionMap[truth.originRegion] || 'Toàn Quốc';
    }

    // 3. Sắc lụa & Ngũ hành
    const colorDot = document.getElementById(`${prefix}-color-dot`);
    const colorNameEl = document.getElementById(`${prefix}-color-name`);
    const elementEl = document.getElementById(`${prefix}-element`);
    const harmonyEl = document.getElementById(`${prefix}-harmony`);

    const elementNameMap: Record<string, string> = {
      KIM: 'Hành Kim (Bạch Lạp)',
      MOC: 'Hành Mộc (Sinh Khí)',
      THUY: 'Hành Thủy (Dưỡng Sắc)',
      HOA: 'Hành Hỏa (Chu Tước)',
      THO: 'Hành Thổ (Trung Tâm)'
    };

    if (colorDot) colorDot.style.backgroundColor = outfit.color;
    if (colorNameEl) colorNameEl.textContent = `${outfit.colorName} (${outfit.color})`;
    if (elementEl) elementEl.textContent = elementNameMap[colorAnalysis.five_elements_element] || 'Ngũ Hành';
    if (harmonyEl) harmonyEl.textContent = `${colorAnalysis.harmony_title} — ${colorAnalysis.element_meaning}`;

    // 4. Phụ kiện & Kiểm định kiêng kỵ
    const accListEl = document.getElementById(`${prefix}-accessories`);
    const tabooWarningEl = document.getElementById(`${prefix}-taboo-notice`);

    if (accListEl) {
      accListEl.innerHTML = outfit.accessories
        .map((acc) => `<span class="compare-acc-tag">❖ ${acc.replace(/_/g, ' ')}</span>`)
        .join('');
    }

    if (tabooWarningEl) {
      if (tabooCheck.hasTaboo) {
        const conflict = tabooCheck.taboos[0];
        tabooWarningEl.innerHTML = `
          <div class="compare-taboo-box warn">
            <span class="taboo-icon">⚠</span>
            <div>
              <strong>Xung đột lịch sử:</strong> ${conflict.historicalConflictReason}
              <div class="taboo-fix"><em>Gợi ý thay thế:</em> ${conflict.suggestedAlternative}</div>
            </div>
          </div>
        `;
      } else {
        tabooWarningEl.innerHTML = `
          <div class="compare-taboo-box safe">
            <span class="taboo-icon">✓</span>
            <div><strong>Chuẩn mực:</strong> Không phạm kiêng kỵ văn hóa nào. Phụ kiện hài hòa di sản.</div>
          </div>
        `;
      }
    }

    // 5. Kiểu tóc & Trang điểm
    const hairEl = document.getElementById(`${prefix}-hair`);
    if (hairEl) {
      hairEl.textContent = outfit.hairstyle || 'Tóc búi cao thanh thoát cài trâm';
    }

    // 6. Sự kiện tối ưu
    const eventEl = document.getElementById(`${prefix}-event`);
    if (eventEl) {
      const eventMap: Record<string, string> = {
        tet: '🌸 Tết Nguyên Đán & Hội Xuân Cổ Truyền',
        grad: '🎓 Lễ Tốt Nghiệp & Tri Ân Trưởng Thành',
        temple: '🪷 Đi Chùa & Chiêm Bái Thanh Tịnh',
        wedding: '💍 Lễ Hằng Thuận & Đám Cưới Truyền Thống'
      };
      eventEl.textContent = eventMap[outfit.event] || colorAnalysis.event_suitability || 'Sinh hoạt & Hội lễ truyền thống';
    }

    // 7. Bảo chứng nguồn gốc
    const citeEl = document.getElementById(`${prefix}-citations`);
    if (citeEl) {
      if (citations.length > 0) {
        const first = citations[0];
        citeEl.innerHTML = `
          <div class="compare-cite-item">
            <strong>${first.title}</strong> (${first.authorOrInstitution})
            <a href="${first.url}" target="_blank" rel="noopener noreferrer" class="compare-cite-link">Xem nguồn ↗</a>
          </div>
        `;
      } else {
        citeEl.textContent = 'Khảo cứu mỹ thuật Nguyễn';
      }
    }

    // 8. Gắn hành động chân bảng (Remix / Tiệm may)
    const btnApply = document.getElementById(`${prefix}-btn-apply`);
    const btnTailor = document.getElementById(`${prefix}-btn-tailor`);

    if (btnApply) {
      btnApply.onclick = () => {
        Sound.playChime();
        this.applyOutfitToWorkshop(outfit);
      };
    }

    if (btnTailor) {
      btnTailor.onclick = () => {
        Sound.playClick();
        tailorJourneyEngine.openJourney(outfit.garment, outfit.title, outfit.colorName);
      };
    }
  }

  /**
   * Nạp phương án được chọn vào Xưởng Phối để remix tiếp
   */
  public applyOutfitToWorkshop(outfit: CompareOutfitModel): void {
    garmentEngine.setFabricColor(outfit.color, outfit.colorName);
    garmentEngine.setGarment(outfit.garment);
    if (outfit.accessories.length > 0) {
      garmentEngine.setAccessory(outfit.accessories[0], true);
    }
    garmentEngine.callCulturalAI(outfit.event, outfit.color, outfit.garment, outfit.accessories[0]);

    appRouter.switchTab('create');
    appRouter.showToast(`✨ Đã nạp phương án "${outfit.title}" vào Xưởng Phối để bạn tiếp tục tinh chỉnh!`);
  }
}

export const compareEngine = new CompareEngine();
