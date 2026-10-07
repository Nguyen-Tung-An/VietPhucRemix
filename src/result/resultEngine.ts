import { Sound } from '../audio/sound.ts';
import { garmentEngine } from '../workshop/garmentEngine.ts';
import { wardrobeManager } from '../discover/wardrobeManager.ts';
import { DiscoveryOutfit } from '../types/index.ts';
import { lookbookEngine } from '../lookbook/lookbookEngine.ts';
import { feedbackState } from '../services/feedbackState.ts';
import { appRouter } from '../navigation/router.ts';
import { getCulturalTruth, checkStrictTaboo, checkMultipleStrictTaboos } from '../data/culturalTruths.ts';

export class ResultEngine {
  private isKnowledgeRevealed: boolean = false;

  public init(): void {
    this.setupTriggers();
    this.setupKnowledgeToggle();
    this.setupActionButtons();
    this.setupKeyboardShortcuts();
    this.setupSwipeGestures();
  }

  /**
   * Mở Màn hình Kết quả và nạp dữ liệu từ Xưởng Phối
   */
  public showResult(): void {
    Sound.playChime();
    const resultScene = document.getElementById('result-scene');
    if (!resultScene) return;

    // Nạp dữ liệu phối đồ hiện tại
    const outfitState = garmentEngine.getCurrentOutfitState();
    const allAccessories = outfitState.accessories?.length ? outfitState.accessories : [outfitState.accessory];
    this.renderArtwork(outfitState.garment, outfitState.color, outfitState.accessory);
    this.renderBadgeAndHeadlines(outfitState.garment, outfitState.colorName, allAccessories);
    this.renderCulturalWarning(outfitState.garment, allAccessories);
    this.renderKnowledgeCard(outfitState.garment);

    // Đặt lại trạng thái ẩn mặc định cho Lớp 3 (Progressive Disclosure)
    this.setKnowledgeRevealed(false);

    // Kích hoạt màn hình kết quả
    resultScene.classList.add('scene-active');
  }

  /**
   * Đóng màn hình kết quả và quay về Xưởng Phối
   */
  public hideResult(): void {
    Sound.playClick();
    const resultScene = document.getElementById('result-scene');
    if (resultScene) {
      resultScene.classList.remove('scene-active');
    }
  }

  /**
   * LỚP 1 — Render minh họa trang phục hoàn chỉnh
   */
  private renderArtwork(_garment: string, _colorHex: string, _accessory: string): void {
    const displayBox = document.getElementById('result-croquis-display');
    const sourceSvg = document.getElementById('nguthan-svg');
    if (!displayBox || !sourceSvg) return;

    // Clone chính xác SVG từ xưởng phối với màu sắc và phụ kiện thực tế
    displayBox.innerHTML = '';
    const clonedSvg = sourceSvg.cloneNode(true) as SVGElement;
    clonedSvg.setAttribute('id', 'result-svg-cloned');
    displayBox.appendChild(clonedSvg);
  }

  /**
   * LỚP 1 — Badge góc trên và Tiêu đề
   */
  private renderBadgeAndHeadlines(garment: string, colorName: string, accessories: string[]): void {
    const badgeText = document.getElementById('result-badge-text');
    const heading = document.getElementById('result-outfit-heading');
    const subtitle = document.getElementById('result-outfit-subtitle');

    const truth = getCulturalTruth(garment);
    
    if (badgeText) {
      badgeText.textContent = `✨ 98% Chuẩn Lụa Thanh`;
    }

    if (heading) {
      heading.textContent = `${truth.name} • ${colorName}`;
    }

    if (subtitle) {
      const accListText = accessories.length > 0 ? ` kết hợp ${accessories.map(a => a.replace(/_/g, ' ')).join(', ')}` : '';
      subtitle.textContent = `Bộ phục trang hoàn chỉnh theo phong vị đương đại concept Lụa Thanh${accListText}.`;
    }
  }

  /**
   * LỚP 2 — Khung cảnh báo văn hóa (Chỉ hiện NẾU có cảnh báo)
   * - Nền màu Vàng Đất nhạt, viền 1px Vàng Đất, icon nhỏ bên trái
   * - Tối đa 1-2 câu nhắc nhở nhẹ nhàng, không gay gắt
   * - Nếu không có cảnh báo: khối này không hiển thị (display: none), không để trống
   */
  private renderCulturalWarning(garment: string, accessories: string[]): void {
    const warningLayer = document.getElementById('result-warning-layer');
    const warningDesc = document.getElementById('result-warning-desc');
    if (!warningLayer) return;

    const truth = getCulturalTruth(garment);
    const tabooCheck = checkMultipleStrictTaboos(truth.id, accessories);

    if (tabooCheck.hasTaboo && tabooCheck.taboos.length > 0) {
      if (warningDesc) {
        warningDesc.textContent = tabooCheck.taboos.map(t => t.historicalConflictReason).join(' ');
      }
      warningLayer.style.display = 'flex';
    } else {
      warningLayer.style.display = 'none';
    }
  }

  /**
   * LỚP 3 — Thẻ tri thức văn hóa có trích dẫn nguồn xác thực (Progressive Disclosure)
   */
  private renderKnowledgeCard(garment: string): void {
    const knowledgeText = document.getElementById('knowledge-text');
    const knowledgeTitle = document.getElementById('knowledge-title');
    if (!knowledgeText) return;

    const truth = getCulturalTruth(garment);
    if (knowledgeTitle) {
      knowledgeTitle.textContent = `${truth.name} • Tri Thức Di Sản Khảo Cứu`;
    }

    const citationHtml = `
      <div style="margin-top: 12px; padding-top: 8px; border-top: 1px dashed rgba(201,166,107,0.35); font-size: 11px;">
        <div style="color: #6B4E2E; font-weight: 500;">
          📜 <em>Nguồn:</em> <strong>${truth.sourceTitle}</strong> — ${truth.authorOrInstitution}
        </div>
        <div style="margin-top: 4px;">
          <a href="${truth.sourceUrl}" target="_blank" rel="noopener noreferrer" style="color: #4A8577; text-decoration: underline; font-weight: 600;">
            🔗 Đọc tài liệu khảo cứu gốc (${truth.sourceUrl}) ↗
          </a>
        </div>
      </div>
    `;

    knowledgeText.innerHTML = `
      <div>${truth.culturalSignificance}</div>
      <div style="margin-top: 8px; font-size: 12px; color: #555;">
        <strong>Niên đại lịch sử:</strong> ${truth.historicalEra}
      </div>
      <div style="margin-top: 6px; font-size: 12px; color: #555;">
        <strong>Vùng miền cội nguồn:</strong> ${truth.originRegion === 'BAC_BO' ? 'Bắc Bộ' : truth.originRegion === 'TRUNG_BO' ? 'Trung Bộ / Huế' : truth.originRegion === 'NAM_BO' ? 'Nam Bộ' : 'Toàn Quốc'}
      </div>
      ${citationHtml}
    `;
  }

  /**
   * Thiết lập đóng/mở Lớp 3 (Progressive Disclosure)
   */
  private setupKnowledgeToggle(): void {
    const btnToggle = document.getElementById('btn-toggle-knowledge');
    btnToggle?.addEventListener('click', () => {
      Sound.playClick();
      this.setKnowledgeRevealed(!this.isKnowledgeRevealed);
    });
  }

  private setKnowledgeRevealed(revealed: boolean): void {
    this.isKnowledgeRevealed = revealed;
    const layer = document.getElementById('result-knowledge-layer');
    const btnToggle = document.getElementById('btn-toggle-knowledge');
    const toggleLabel = document.getElementById('knowledge-toggle-label');

    if (layer) {
      if (revealed) {
        layer.classList.add('layer-knowledge-revealed');
      } else {
        layer.classList.remove('layer-knowledge-revealed');
      }
    }

    if (btnToggle) {
      btnToggle.setAttribute('aria-expanded', revealed ? 'true' : 'false');
    }

    if (toggleLabel) {
      toggleLabel.textContent = revealed ? 'Thu gọn tri thức' : 'Tìm hiểu thêm về di sản';
    }
  }

  /**
   * Thiết lập 2 nút hành động ở cuối màn hình
   */
  private setupActionButtons(): void {
    const btnSaveLookbook = document.getElementById('btn-result-save-lookbook');
    const btnRemix = document.getElementById('btn-result-remix');
    const btnBack = document.getElementById('btn-result-back');

    // Nút phụ: "Phối lại" -> Quay lại xưởng phối
    btnRemix?.addEventListener('click', () => {
      this.hideResult();
      appRouter.switchTab('create');
    });

    btnBack?.addEventListener('click', () => {
      this.hideResult();
      appRouter.switchTab('create');
    });

    // Nút chính: "Lưu vào Lookbook" (Pill Gradient) -> Lưu và chuyển sang màn Lookbook
    btnSaveLookbook?.addEventListener('click', () => {
      Sound.playChime();
      const outfitState = garmentEngine.getCurrentOutfitState();
      
      const savedOutfit: DiscoveryOutfit = {
        id: `custom-${Date.now()}`,
        title: `${outfitState.garment === 'AO_BA_BA' ? 'Áo Bà Ba' : 'Áo Ngũ Thân'} ${outfitState.colorName}`,
        garment: (outfitState.garment === 'AO_BA_BA' ? 'AO_BA_BA' : 'AO_NGU_THAN') as 'AO_NGU_THAN' | 'AO_BA_BA',
        color: outfitState.color,
        colorName: outfitState.colorName,
        event: outfitState.event,
        eventLabel: 'Bộ Phối Tự Chọn',
        accessory: (outfitState.accessory === 'KHAN_RAN' ? 'KHAN_RAN' : 'QUAT_GIAY') as 'QUAT_GIAY' | 'KHAN_RAN',
        seal: 'Lụa',
        desc: `Bộ phối ${outfitState.colorName} hoàn chỉnh theo phong vị đương đại Lụa Thanh.`
      };

      // Kích hoạt Trạng thái Đang Tải Lụa Thanh dùng chung
      feedbackState.showLoading({
        message: 'Đang lưu tà phục vào Lookbook...',
        submessage: 'Ghi nhận sắc lụa và đường may vào bộ sưu tập cá nhân...'
      });

      setTimeout(() => {
        feedbackState.hideLoading();
        wardrobeManager.saveWardrobeOutfit(savedOutfit);
        lookbookEngine.renderLookbook();

        // Phản hồi thị giác tức thì
        const btnText = document.getElementById('btn-save-lookbook-text');
        if (btnText) {
          const originalText = btnText.textContent;
          btnText.textContent = '✓ Đã Lưu Vào Lookbook!';
          btnSaveLookbook.style.transform = 'scale(0.97)';
          setTimeout(() => {
            btnSaveLookbook.style.transform = 'scale(1)';
          }, 150);

          setTimeout(() => {
            if (btnText) btnText.textContent = originalText;
          }, 2200);
        }

        // Tự động điều hướng sang màn Lookbook mượt mà theo đúng luồng
        setTimeout(() => {
          this.hideResult();
          appRouter.switchTab('lookbook');
          appRouter.showToast('📖 Đã lưu tà phục và chuyển sang Lookbook của bạn!');
        }, 450);
      }, 650);
    });
  }

  /**
   * Nút bấm mở màn hình kết quả từ Xưởng Phối kèm trạng thái Tải thẩm định
   */
  private setupTriggers(): void {
    const triggerButtons = [
      document.getElementById('btn-view-result'),
      document.getElementById('btn-sheet-view-result')
    ].filter(Boolean);

    triggerButtons.forEach((btn) => {
      btn?.addEventListener('click', () => {
        // Kiểm tra State-Proof Sanity trên toàn bộ input tự nhập
        const sanity = garmentEngine.validateCurrentInputs();
        if (!sanity.isValid) {
          garmentEngine.showSanityAlert(sanity.reason || 'Vui lòng kiểm tra lại phụ kiện hoặc kiểu tóc tự nhập theo thuần phong mỹ tục.');
          const tabAI = document.getElementById('tab-opt-ai-styling');
          tabAI?.click();
          return;
        }

        garmentEngine.hideSanityAlert();
        Sound.playClick();
        feedbackState.showLoading({
          message: 'Đang thẩm định & kết xuất tà lụa...',
          submessage: 'Hệ thống đối chiếu chuẩn mực di sản Lụa Thanh...',
          allowCancel: true
        });

        setTimeout(() => {
          feedbackState.hideLoading();
          this.showResult();
        }, 550);
      });
    });
  }

  /**
   * Phím tắt Desktop: Enter để lưu, Escape để phối lại
   */
  private setupKeyboardShortcuts(): void {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      const resultScene = document.getElementById('result-scene');
      if (!resultScene?.classList.contains('scene-active')) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        this.hideResult();
      } else if (e.key === 'Enter') {
        const btnSave = document.getElementById('btn-result-save-lookbook');
        btnSave?.click();
      }
    });
  }

  /**
   * Cử chỉ vuốt lên trên Mobile để hé lộ Lớp 3
   */
  private setupSwipeGestures(): void {
    const knowledgeLayer = document.getElementById('result-knowledge-layer');
    if (!knowledgeLayer) return;

    let touchStartY = 0;
    knowledgeLayer.addEventListener('touchstart', (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    knowledgeLayer.addEventListener('touchend', (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const diffY = touchStartY - touchEndY;

      // Vuốt lên > 30px: Hé lộ tri thức
      if (diffY > 30 && !this.isKnowledgeRevealed) {
        Sound.playClick();
        this.setKnowledgeRevealed(true);
      }
      // Vuốt xuống > 30px: Thu gọn tri thức
      else if (diffY < -30 && this.isKnowledgeRevealed) {
        Sound.playClick();
        this.setKnowledgeRevealed(false);
      }
    }, { passive: true });
  }
}

export const resultEngine = new ResultEngine();
