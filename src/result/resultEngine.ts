import { Sound } from '../audio/sound.ts';
import { garmentEngine } from '../workshop/garmentEngine.ts';
import { wardrobeManager } from '../discover/wardrobeManager.ts';
import { DiscoveryOutfit } from '../types/index.ts';
import { lookbookEngine } from '../lookbook/lookbookEngine.ts';
import { feedbackState } from '../services/feedbackState.ts';
import { appRouter } from '../navigation/router.ts';

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
    this.renderArtwork(outfitState.garment, outfitState.color, outfitState.accessory);
    this.renderBadgeAndHeadlines(outfitState.garment, outfitState.colorName, outfitState.accessory);
    this.renderCulturalWarning(outfitState.garment, outfitState.accessory);
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
  private renderBadgeAndHeadlines(garment: string, colorName: string, _accessory: string): void {
    const badgeText = document.getElementById('result-badge-text');
    const heading = document.getElementById('result-outfit-heading');
    const subtitle = document.getElementById('result-outfit-subtitle');

    const garmentTitle = garment === 'AO_NGU_THAN' ? 'Áo Ngũ Thân Lập Lĩnh' : 'Áo Bà Ba Nam Bộ';
    
    if (badgeText) {
      badgeText.textContent = `✨ 98% Chuẩn Lụa Thanh`;
    }

    if (heading) {
      heading.textContent = `${garmentTitle} ${colorName}`;
    }

    if (subtitle) {
      subtitle.textContent = `Bộ phục trang hoàn chỉnh theo phong vị đương đại concept Lụa Thanh.`;
    }
  }

  /**
   * LỚP 2 — Khung cảnh báo văn hóa (Chỉ hiện NẾU có cảnh báo)
   * - Nền màu Vàng Đất nhạt, viền 1px Vàng Đất, icon nhỏ bên trái
   * - Tối đa 1-2 câu nhắc nhở nhẹ nhàng, không gay gắt
   * - Nếu không có cảnh báo: khối này không hiển thị (display: none), không để trống
   */
  private renderCulturalWarning(garment: string, accessory: string): void {
    const warningLayer = document.getElementById('result-warning-layer');
    const warningDesc = document.getElementById('result-warning-desc');
    if (!warningLayer) return;

    // Điều kiện cảnh báo: Ngũ thân kết hợp Khăn rằn (vốn đặc trưng của áo bà ba)
    const hasCulturalDilemma = garment === 'AO_NGU_THAN' && accessory === 'KHAN_RAN';

    if (hasCulturalDilemma) {
      if (warningDesc) {
        warningDesc.textContent =
          'Phối hợp này hơi khác biệt so với truyền thống gốc, bạn có muốn xem bản chuẩn không?';
      }
      warningLayer.style.display = 'flex';
    } else {
      warningLayer.style.display = 'none';
    }
  }

  /**
   * LỚP 3 — Thẻ tri thức văn hóa (Ẩn mặc định, max 60 từ, từ khóa bôi đậm Vàng Đất)
   */
  private renderKnowledgeCard(garment: string): void {
    const knowledgeText = document.getElementById('knowledge-text');
    if (!knowledgeText) return;

    if (garment === 'AO_NGU_THAN') {
      knowledgeText.innerHTML =
        'Áo ngũ thân lập lĩnh định hình từ thời chúa <strong class="kw-gold">Nguyễn Phúc Khoát</strong> tại xứ <strong class="kw-gold">Đàng Trong</strong>, kế thừa tinh hoa phục sức phương Nam. Năm thân áo tượng trưng cho tứ thân phụ mẫu và chính mình, năm hạt cúc gốm biểu trưng cho ngũ thường Nhân - Lễ - Nghĩa - Trí - Tín, toát lên phong thái đĩnh đạc và đoan trang.';
    } else {
      knowledgeText.innerHTML =
        'Áo bà ba xẻ tà buông rủ mộc mạc, gắn liền với văn hóa sông nước trù phú miền <strong class="kw-gold">Nam Bộ</strong>. Chiếc áo tôn vinh nét bình dị, cần lao mà duyên dáng, hòa quyện cùng lụa tơ tằm dệt thủ công tạo nên phong vị thôn dã thanh thoát và giàu sức sống.';
    }
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
