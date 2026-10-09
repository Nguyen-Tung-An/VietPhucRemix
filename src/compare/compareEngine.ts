import { Sound } from '../audio/sound.ts';
import { garmentEngine } from '../workshop/garmentEngine.ts';
import { wardrobeManager } from '../discover/wardrobeManager.ts';
import { appRouter } from '../navigation/router.ts';
import { tailorJourneyEngine } from '../journey/tailorJourneyEngine.ts';
import { DISCOVERY_OUTFITS_POOL } from '../discover/swipeEngine.ts';
import {
  getCulturalTruth,
  checkMultipleStrictTaboos,
  getColorCulturalAnalysis,
  getAllSourcesForGarment
} from '../data/culturalTruths.ts';
import { WardrobeItem, DiscoveryOutfit } from '../types/index.ts';
import { assetConfig } from '../config/assetConfig.ts';

export interface CompareOutfitModel {
  id: string;
  sourceType: 'workshop' | 'lookbook' | 'discovery';
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

export class CompareEngine {
  public outfitA: CompareOutfitModel | null = null;
  public outfitB: CompareOutfitModel | null = null;
  private activeMobileSlot: 'a' | 'b' = 'a';

  public init(): void {
    this.setupUIEvents();
    this.setupCollapsibles();
    this.setupScrollListener();
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

  private setupCollapsibles(): void {
    document.querySelectorAll('.btn-toggle-matrix-history, .btn-toggle-matrix-citations').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        Sound.playClick();
        const targetBtn = e.currentTarget as HTMLElement;
        const targetId = targetBtn.dataset.target;
        if (!targetId) return;
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          const isHidden = targetEl.style.display === 'none';
          targetEl.style.display = isHidden ? 'block' : 'none';
          const labelSpan = targetBtn.querySelector('span');
          if (labelSpan) {
            if (targetBtn.classList.contains('btn-toggle-matrix-history')) {
              labelSpan.textContent = isHidden ? '▲ Thu Gọn Lịch Sử' : '📜 Xem Lịch Sử Sâu ▼';
            } else {
              const countMatch = labelSpan.textContent?.match(/\d+/);
              const countStr = countMatch ? ` ${countMatch[0]}` : '';
              labelSpan.textContent = isHidden ? `▼ Thu gọn trích dẫn khảo cứu` : `► Xem${countStr} tài liệu trích dẫn khảo cứu`;
            }
          }
        }
      });
    });
  }

  private setupScrollListener(): void {
    const container = document.querySelector('.compare-container');
    const stickyBar = document.getElementById('compare-sticky-preview-bar');
    if (!container || !stickyBar) return;

    container.addEventListener('scroll', () => {
      if (container.scrollTop > 180) {
        stickyBar.style.display = 'flex';
      } else {
        stickyBar.style.display = 'none';
      }
    }, { passive: true });
  }

  private setMobileActiveSlot(slot: 'a' | 'b'): void {
    this.activeMobileSlot = slot;
    const matrixTable = document.getElementById('compare-matrix-table');
    const tabA = document.getElementById('btn-mobile-compare-slot-a');
    const tabB = document.getElementById('btn-mobile-compare-slot-b');

    if (slot === 'a') {
      matrixTable?.classList.remove('mobile-show-b');
      tabA?.classList.add('active');
      tabB?.classList.remove('active');
    } else {
      matrixTable?.classList.add('mobile-show-b');
      tabB?.classList.add('active');
      tabA?.classList.remove('active');
    }
  }

  /**
   * Mở màn hình So Sánh: Linh hoạt hỗ trợ Lookbook, Xưởng Phối, hoặc Bộ Sưu Tập Di Sản
   */
  public openCompare(presetAId?: string, presetBId?: string): void {
    const lookbookOutfits = wardrobeManager.savedWardrobe;

    // Cập nhật danh sách dropdown
    this.populateSelectDropdowns();

    // 1. Thiết lập slot A
    if (presetAId) {
      this.outfitA = this.resolveOutfitById(presetAId);
    } else if (lookbookOutfits.length > 0) {
      this.outfitA = this.convertWardrobeToModel(lookbookOutfits[0]);
    } else {
      this.outfitA = this.getWorkshopCurrentOutfitModel();
    }

    // 2. Thiết lập slot B
    if (presetBId) {
      this.outfitB = this.resolveOutfitById(presetBId);
    } else if (lookbookOutfits.length > 1) {
      const otherLookbook = lookbookOutfits.find((o) => `wardrobe-${o.id}` !== this.outfitA?.id) || lookbookOutfits[1];
      this.outfitB = this.convertWardrobeToModel(otherLookbook);
    } else if (lookbookOutfits.length === 1 && this.outfitA?.id === 'current-workshop') {
      this.outfitB = this.convertWardrobeToModel(lookbookOutfits[0]);
    } else {
      // Fallback sang bộ mẫu từ Discovery Pool nếu Lookbook chưa đủ 2 bộ
      const discoveryFallback = DISCOVERY_OUTFITS_POOL.find((d) => d.garment !== this.outfitA?.garment) || DISCOVERY_OUTFITS_POOL[1] || DISCOVERY_OUTFITS_POOL[0];
      this.outfitB = this.convertDiscoveryToModel(discoveryFallback);
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
      imageUrl: assetConfig.getGarmentImageUrl(ws.garment),
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
      accessories: w.accessories && w.accessories.length > 0 ? w.accessories : [w.accessory],
      hairstyle: w.hairstyle || 'Tóc búi cao thanh thoát',
      imageUrl: w.imageUrl || assetConfig.getGarmentImageUrl(w.garment),
      desc: `Lưu trong Lookbook cá nhân lúc ${w.savedAt || 'gần đây'}.`
    };
  }

  private convertDiscoveryToModel(d: DiscoveryOutfit): CompareOutfitModel {
    return {
      id: `discovery-${d.id}`,
      sourceType: 'discovery',
      title: d.title,
      garment: d.garment,
      color: d.color,
      colorName: d.colorName,
      event: d.event,
      accessories: [d.accessory],
      hairstyle: 'Tóc chuẩn mực di sản',
      imageUrl: d.imageUrl || assetConfig.getGarmentImageUrl(d.garment),
      desc: 'Bộ phục trang mẫu trong bộ sưu tập Khám Phá Di Sản.'
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

    if (id.startsWith('discovery-')) {
      const realId = id.replace('discovery-', '');
      const found = DISCOVERY_OUTFITS_POOL.find((d) => d.id === realId);
      if (found) return this.convertDiscoveryToModel(found);
    }

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

    optionsHtml += `
      <optgroup label="🎨 Đang Phối Trong Xưởng Phối">
        <option value="current-workshop">✨ Bộ Đang Tinh Chỉnh Trong Xưởng (Hiện Tại)</option>
      </optgroup>
    `;

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
      <optgroup label="🏛️ Bộ Mẫu Khảo Cứu Di Sản">
        ${DISCOVERY_OUTFITS_POOL
          .slice(0, 4)
          .map((item) => `<option value="discovery-${item.id}">❖ ${item.title} (${item.colorName})</option>`)
          .join('')}
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
    this.highlightDifferences();
    this.updateStickyBar();
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
    const occasionTag = document.getElementById(`${prefix}-occasion-tag`);

    if (imgEl) {
      imgEl.src = outfit.imageUrl || assetConfig.getGarmentImageUrl(outfit.garment);
      imgEl.alt = outfit.title;
    }

    if (titleEl) {
      titleEl.textContent = outfit.title;
    }

    if (sourceBadge) {
      const sourceMap = {
        workshop: '🎨 Đang Phối',
        lookbook: '📖 Lookbook',
        discovery: '🏛️ Khám Phá'
      };
      sourceBadge.textContent = sourceMap[outfit.sourceType] || 'Lookbook';
    }

    const eventNames: Record<string, string> = {
      tet: '🌸 Tết & Hội Xuân',
      grad: '🎓 Lễ Tốt Nghiệp',
      temple: '🪷 Chiêm Bái Chùa',
      wedding: '💍 Đại Lễ Cưới'
    };

    if (occasionTag) {
      occasionTag.textContent = eventNames[outfit.event] || '🏷️ Lễ Hội Cổ Truyền';
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
    const historyTextEl = document.getElementById(`${prefix}-history-text`);

    if (garmentNameEl) garmentNameEl.textContent = truth.name;
    if (eraEl) eraEl.textContent = truth.historicalEra;
    if (regionEl) {
      const regionMap: Record<string, string> = {
        BAC_BO: 'Bắc Bộ',
        TRUNG_BO: 'Trung Bộ / Huế',
        NAM_BO: 'Nam Bộ',
        TOAN_QUOC: 'Toàn Quốc'
      };
      regionEl.textContent = regionMap[truth.originRegion] || 'Toàn Quốc';
    }

    if (historyTextEl) {
      historyTextEl.innerHTML = `
        <strong>Cấu trúc đặc trưng:</strong> ${truth.definingFeatures.join('; ')}.<br/>
        <strong>Ý nghĩa di sản:</strong> ${truth.culturalSignificance}<br/>
        <strong>Không gian sử dụng:</strong> ${truth.socialContext}
      `;
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
        .map((acc) => `<span class="matrix-badge-pill">❖ ${acc.replace(/_/g, ' ')}</span>`)
        .join('');
    }

    if (tabooWarningEl) {
      if (tabooCheck.hasTaboo) {
        const conflict = tabooCheck.taboos[0];
        tabooWarningEl.innerHTML = `
          <div class="compare-taboo-box warn" style="margin-top: 6px; padding: 6px 8px; border-radius: 6px; background: rgba(201,166,107,0.18); font-size: 0.74rem; color: #7A5338;">
            ⚠ <strong>Lưu ý:</strong> ${conflict.historicalConflictReason}
          </div>
        `;
      } else {
        tabooWarningEl.innerHTML = '';
      }
    }

    // 5. Kiểu tóc
    const hairEl = document.getElementById(`${prefix}-hair`);
    if (hairEl) {
      hairEl.textContent = outfit.hairstyle || 'Tóc búi cao thanh thoát';
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
    const citeSummary = document.getElementById(`${prefix}-citations-summary`);

    if (citeSummary) {
      citeSummary.textContent = `► Xem ${citations.length} tài liệu trích dẫn khảo cứu`;
    }

    if (citeEl) {
      citeEl.innerHTML = citations
        .map((c, i) => {
          const year = (c as any).year || (c as any).publication_year || (c as any).publicationYear;
          const yearStr = year ? ` (${year})` : '';
          const author = (c as any).authorOrInstitution || (c as any).author_or_institution || '';
          return `
          <div style="margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px dotted rgba(74,133,119,0.2);">
            <div style="font-weight: 600; color: #2A5A4E;">[${i + 1}] ${c.title}${yearStr}</div>
            <div style="font-size: 0.72rem; color: #666;">${author}</div>
            <a href="${c.url}" target="_blank" rel="noopener noreferrer" style="color: #4A8577; text-decoration: underline; font-weight: 600; font-size: 0.72rem;">Đọc tài liệu gốc ↗</a>
          </div>
        `;
        })
        .join('');
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
   * Tự động phát hiện và NỔI BẬT ĐIỂM KHÁC BIỆT giữa 2 bộ đồ:
   * - Khác nhau: Thêm class .is-different (tô viền dát vàng mờ nhẹ)
   * - Giống nhau: Thêm class .is-same (làm mờ nhẹ)
   */
  private highlightDifferences(): void {
    if (!this.outfitA || !this.outfitB) return;

    // 1. So sánh Dáng áo
    const cellHistA = document.getElementById('cell-history-a');
    const cellHistB = document.getElementById('cell-history-b');
    const isGarmentDiff = this.outfitA.garment !== this.outfitB.garment;
    this.applyDifferenceClasses(cellHistA, cellHistB, isGarmentDiff);

    // 2. So sánh Màu sắc
    const cellColorA = document.getElementById('cell-color-a');
    const cellColorB = document.getElementById('cell-color-b');
    const isColorDiff = this.outfitA.color.toLowerCase() !== this.outfitB.color.toLowerCase();
    this.applyDifferenceClasses(cellColorA, cellColorB, isColorDiff);

    // 3. So sánh Bối cảnh
    const cellOccA = document.getElementById('cell-occasion-a');
    const cellOccB = document.getElementById('cell-occasion-b');
    const isOccDiff = this.outfitA.event !== this.outfitB.event;
    this.applyDifferenceClasses(cellOccA, cellOccB, isOccDiff);

    // 4. So sánh Phụ kiện & Kiểu tóc
    const cellAccA = document.getElementById('cell-acc-a');
    const cellAccB = document.getElementById('cell-acc-b');
    const accStrA = [...this.outfitA.accessories].sort().join(',');
    const accStrB = [...this.outfitB.accessories].sort().join(',');
    const isAccDiff = accStrA !== accStrB || this.outfitA.hairstyle !== this.outfitB.hairstyle;
    this.applyDifferenceClasses(cellAccA, cellAccB, isAccDiff);
  }

  private applyDifferenceClasses(elA: HTMLElement | null, elB: HTMLElement | null, isDifferent: boolean): void {
    if (!elA || !elB) return;
    if (isDifferent) {
      elA.classList.add('is-different');
      elA.classList.remove('is-same');
      elB.classList.add('is-different');
      elB.classList.remove('is-same');
    } else {
      elA.classList.add('is-same');
      elA.classList.remove('is-different');
      elB.classList.add('is-same');
      elB.classList.remove('is-different');
    }
  }

  private updateStickyBar(): void {
    if (!this.outfitA || !this.outfitB) return;

    const imgA = document.getElementById('compare-sticky-img-a') as HTMLImageElement | null;
    const nameA = document.getElementById('compare-sticky-name-a');
    const imgB = document.getElementById('compare-sticky-img-b') as HTMLImageElement | null;
    const nameB = document.getElementById('compare-sticky-name-b');

    if (imgA) imgA.src = this.outfitA.imageUrl || assetConfig.getGarmentImageUrl(this.outfitA.garment);
    if (nameA) nameA.textContent = this.outfitA.title;

    if (imgB) imgB.src = this.outfitB.imageUrl || assetConfig.getGarmentImageUrl(this.outfitB.garment);
    if (nameB) nameB.textContent = this.outfitB.title;
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

