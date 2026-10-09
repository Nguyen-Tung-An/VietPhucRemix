import { CurrentOutfitState, MiniStylingResponse, StylingSuggestionItem, PatternItem, DiscoveryOutfit } from '../types/index.ts';
import { Sound } from '../audio/sound.ts';
import {
  getCulturalTruth,
  validateUserInputSanity,
  getColorCulturalAnalysis,
  checkMultipleStrictTaboos
} from '../data/culturalTruths.ts';
import { fetchStylingSuggestionsAPI } from '../services/api.ts';
import { assembleFashionPrompt } from './promptEngine.ts';
import { appRouter } from '../navigation/router.ts';

export class GarmentEngine {
  // 1. Dáng Áo (bắt đầu null khi reset)
  public selectedGarment: string | null = null;

  // 2. Màu Sắc (bắt đầu null khi reset)
  public selectedColor: string | null = null;
  public selectedColorName: string = '';

  // 3. Phong Cách (Multi-select Bubble buttons + Creativity slider)
  public selectedStyles: string[] = [];
  public creativityLevel: number = 35; // 0 - 100%

  // 4. Phụ Kiện (Multiple select + custom inputs)
  public selectedAccessories: string[] = [];
  public customAccessories: string[] = [];

  // Kiểu Tóc (Single select + custom input)
  public selectedHairstyle: string = '';
  public customHairstyle: string = '';

  // Họa tiết di sản đính kèm
  public currentPattern: PatternItem | null = null;

  // Trạng thái AI Styling & Cột Tổng Hợp
  public hasGeneratedAISuggestions: boolean = false;
  public needsReappraisal: boolean = false;
  public isGeneratingMiniStyling: boolean = false;
  public aiStylingData: MiniStylingResponse | null = null;

  public init(): void {
    this.setupSheetTabs();
    this.setupGarmentOptions();
    this.setupColorPickerAndPresets();
    this.setupStyleAndCreativity();
    this.setupAIStylingRound();
    this.setupWorkshopCta();

    // Khởi tạo ban đầu: Đưa về trạng thái trắng, chỉ sáng 3 tab đầu, tab 4 locked
    this.resetWorkshopState();
  }

  public setPattern(pattern: PatternItem | null): void {
    this.currentPattern = pattern;
    this.onOutfitInputModified();
  }

  public getCurrentOutfitState(): CurrentOutfitState {
    const allAccessories = [...this.selectedAccessories, ...this.customAccessories];
    return {
      event: 'tet',
      color: this.selectedColor || '#F4C9D6',
      colorName: this.selectedColorName || 'Hồng Phấn Sen',
      garment: this.selectedGarment || 'AO_NGU_THAN',
      accessory: allAccessories[0] || 'QUAT_GIAY',
      accessories: allAccessories.length ? allAccessories : ['QUAT_GIAY'],
      custom_accessories: this.customAccessories,
      hairstyle: this.customHairstyle || this.selectedHairstyle || 'BUI_TRAM',
      custom_hairstyle: this.customHairstyle,
      pattern: this.currentPattern,
      genzActive: this.creativityLevel > 50,
      style: this.selectedStyles.join(', ') || 'THANH_TAO',
      style_mode: this.selectedStyles.join(', '),
      styles: this.selectedStyles,
      creativityLevel: this.creativityLevel,
      personality: this.selectedStyles.join(', ') + ` (Độ phá cách sáng tạo: ${this.creativityLevel}%)`
    };
  }

  /**
   * Kiểm tra xem người dùng đã hoàn thành đủ 3 option đầu tiên chưa:
   * 1. Dáng áo
   * 2. Màu sắc
   * 3. Phong cách (ít nhất 1 style)
   */
  public areFirstThreeOptionsComplete(): boolean {
    return Boolean(this.selectedGarment && this.selectedColor && this.selectedStyles.length > 0);
  }

  /**
   * Cập nhật trạng thái mở khóa Tab 4 (Phụ Kiện) và trạng thái nút Thẩm Định
   */
  public checkOptionsProgress(): void {
    const tabAI = document.getElementById('tab-opt-ai-styling');
    const lockIndicator = document.getElementById('tab-lock-indicator');
    const btnViewResult = document.getElementById('btn-view-result');

    const isComplete = this.areFirstThreeOptionsComplete();

    if (isComplete) {
      if (tabAI) {
        tabAI.classList.remove('sheet-tab-locked');
        tabAI.removeAttribute('title');
      }
      if (lockIndicator) {
        lockIndicator.style.display = 'none';
      }
      // Gợi ý thị giác nhẹ nhàng nếu chưa bấm vào tab 4
      if (!this.hasGeneratedAISuggestions && tabAI) {
        tabAI.classList.add('tab-highlight-pulse');
      }
    } else {
      if (tabAI) {
        tabAI.classList.add('sheet-tab-locked');
        tabAI.classList.remove('tab-highlight-pulse');
        tabAI.setAttribute('title', 'Vui lòng chọn Dáng áo, Màu sắc và Phong cách trước');
      }
      if (lockIndicator) {
        lockIndicator.style.display = 'inline-block';
      }
    }

    // Cập nhật trạng thái nút Thẩm Định
    if (btnViewResult) {
      if (this.hasGeneratedAISuggestions) {
        btnViewResult.classList.remove('btn-cta-pending');
        btnViewResult.classList.add('btn-cta-ready');
        btnViewResult.setAttribute('title', 'Bấm để xem kết quả thẩm định hoàn chỉnh');
      } else {
        btnViewResult.classList.add('btn-cta-pending');
        btnViewResult.classList.remove('btn-cta-ready');
        btnViewResult.setAttribute('title', 'Vui lòng hoàn thành chọn lựa & xem gợi ý AI trước khi thẩm định');
      }
    }
  }

  /**
   * Kích hoạt khi người dùng chỉnh sửa BẤT KỲ input gì sau khi đã cho AI tư vấn:
   * Chặn không cho nhấn thẩm định & xem kết quả trực tiếp,
   * bắt buộc phải nhấn thẩm định lại để AI kiểm tra quy chuẩn.
   */
  public onOutfitInputModified(): void {
    if (this.hasGeneratedAISuggestions) {
      this.hasGeneratedAISuggestions = false;
      this.needsReappraisal = true;

      const btnViewResult = document.getElementById('btn-view-result');
      const btnViewResultText = document.getElementById('btn-view-result-text');
      if (btnViewResult) {
        btnViewResult.classList.add('btn-cta-pending');
        btnViewResult.classList.remove('btn-cta-ready');
        btnViewResult.setAttribute('title', 'Phối đồ đã thay đổi — Vui lòng nhấn nhờ AI tư vấn lại trước khi thẩm định');
      }
      if (btnViewResultText) {
        btnViewResultText.textContent = '🔄 Cần Nhờ AI Tư Vấn Lại';
      }

      // Đánh dấu trạng thái trong cột AI nếu đang mở
      const statusPill = document.getElementById('ai-guardrail-status-pill');
      if (statusPill) {
        statusPill.textContent = '⚠️ Đã Đổi — Cần Thẩm Định Lại';
        statusPill.style.background = 'rgba(201, 166, 107, 0.25)';
        statusPill.style.color = '#7A5338';
      }

      // Highlight gợi ý bấm nút Tư vấn lại
      const retriggerBtn = document.getElementById('btn-ai-header-retrigger');
      if (retriggerBtn) {
        retriggerBtn.classList.add('tab-highlight-pulse');
      }
      const centerTriggerBtn = document.getElementById('btn-trigger-mini-gemini');
      if (centerTriggerBtn) {
        centerTriggerBtn.classList.add('tab-highlight-pulse');
      }
    }
    this.checkOptionsProgress();
  }

  /**
   * Kiểm tra điều kiện khi người dùng nhấn nút Thẩm Định xem kết quả:
   * - Nếu chưa chọn đủ 3 options: Thông báo popup nhỏ bên dưới và chuyển tới tab tương ứng.
   * - Nếu vừa thay đổi input: Yêu cầu nhấn nhờ AI tư vấn lại trước.
   * - Nếu CHƯA tạo AI gợi ý lần nào: Yêu cầu nhấn Xem Gợi Ý AI trước.
   */
  public canProceedToResult(): boolean {
    if (!this.selectedGarment) {
      appRouter.showToast('Mẫu áo này đang được xem xét ra mắt cho các loại trang phục chưa có. Vui lòng chọn dáng áo đã ra mắt để tiếp tục!');
      this.switchSheetTab('panel-garments');
      return false;
    }

    if (!this.selectedColor) {
      appRouter.showToast('🎨 Vui lòng chọn sắc lụa di sản hoặc màu tùy chỉnh trước khi thẩm định!');
      this.switchSheetTab('panel-colors');
      return false;
    }

    if (this.selectedStyles.length === 0) {
      appRouter.showToast('🎭 Vui lòng chọn ít nhất 1 phong cách phối đồ mong muốn!');
      this.switchSheetTab('panel-styles');
      return false;
    }

    if (!this.hasGeneratedAISuggestions) {
      if (this.needsReappraisal) {
        appRouter.showToast('⚠️ Bạn vừa chỉnh sửa phối đồ! Bắt buộc nhấn "Nhờ AI Tư Vấn Lại" để kiểm tra quy chuẩn trước khi xem kết quả.');
      } else {
        appRouter.showToast('🪭 Vui lòng nhấn "Xem Gợi Ý AI" để thẩm định bộ phụ kiện & quy chuẩn di sản trước!');
      }

      this.switchSheetTab('panel-ai-styling');
      const centerTriggerBtn = document.getElementById('btn-trigger-mini-gemini');
      const retriggerBtn = document.getElementById('btn-ai-header-retrigger');
      const bottomRetriggerBtn = document.getElementById('btn-retrigger-mini-gemini');
      centerTriggerBtn?.classList.add('tab-highlight-pulse');
      retriggerBtn?.classList.add('tab-highlight-pulse');
      bottomRetriggerBtn?.classList.add('tab-highlight-pulse');
      setTimeout(() => {
        centerTriggerBtn?.classList.remove('tab-highlight-pulse');
        retriggerBtn?.classList.remove('tab-highlight-pulse');
        bottomRetriggerBtn?.classList.remove('tab-highlight-pulse');
      }, 3000);
      return false;
    }

    // Kiểm tra tính hợp lệ của input tự nhập
    const sanity = this.validateCurrentInputs();
    if (!sanity.isValid) {
      appRouter.showToast(`⚠️ ${sanity.reason || 'Vui lòng kiểm tra lại phụ kiện hoặc kiểu tóc tự nhập.'}`);
      this.switchSheetTab('panel-ai-styling');
      return false;
    }

    this.hideSanityAlert();
    return true;
  }

  /**
   * Reset hoàn toàn Xưởng Phối về trạng thái ban đầu:
   * Bất kì khi nào người dùng vào lại xưởng phối (trừ khi từ remixToWorkshop)
   * đều bắt người dùng chọn lại hết option.
   */
  public resetWorkshopState(): void {
    this.selectedGarment = null;
    this.selectedColor = null;
    this.selectedColorName = '';
    this.selectedStyles = [];
    this.creativityLevel = 35;
    this.selectedAccessories = [];
    this.customAccessories = [];
    this.selectedHairstyle = '';
    this.customHairstyle = '';
    this.hasGeneratedAISuggestions = false;
    this.needsReappraisal = false;
    this.aiStylingData = null;

    const btnViewResultText = document.getElementById('btn-view-result-text');
    if (btnViewResultText) {
      btnViewResultText.textContent = '✨ Thẩm Định & Xem Kết Quả';
    }

    // 1. Reset giao diện Dáng Áo
    document.querySelectorAll('[data-garment-select]').forEach((card) => {
      card.classList.remove('active');
    });
    const checkGarment = document.getElementById('badge-check-garment');
    if (checkGarment) checkGarment.style.display = 'none';

    // 2. Reset giao diện Màu Sắc
    document.querySelectorAll('.sheet-color-circle').forEach((swatch) => {
      swatch.classList.remove('active');
    });
    const colorInput = document.getElementById('workshop-color-input') as HTMLInputElement | null;
    const hexInput = document.getElementById('workshop-color-hex-input') as HTMLInputElement | null;
    const livePreviewDot = document.getElementById('color-live-preview-dot');
    if (colorInput) colorInput.value = '#F4C9D6';
    if (hexInput) hexInput.value = '';
    if (livePreviewDot) livePreviewDot.style.backgroundColor = '#E5E5E5';
    const checkColor = document.getElementById('badge-check-color');
    if (checkColor) checkColor.style.display = 'none';

    // 3. Reset giao diện Phong Cách
    document.querySelectorAll('.style-bubble-chip').forEach((chip) => {
      chip.classList.remove('selected');
    });
    const styleCount = document.getElementById('style-selected-count');
    if (styleCount) styleCount.textContent = 'Đã chọn: 0';
    const checkStyle = document.getElementById('badge-check-style');
    if (checkStyle) checkStyle.style.display = 'none';

    // Reset Slider
    const slider = document.getElementById('creativity-slider') as HTMLInputElement | null;
    if (slider) slider.value = '35';
    const sliderVal = document.getElementById('creativity-slider-val');
    if (sliderVal) sliderVal.textContent = 'Cân bằng di sản (35%)';

    // 4. Reset giao diện Phụ Kiện (Tab 4): khóa lại và chỉ hiện nút ở giữa khi mở
    const centerWrap = document.getElementById('ai-styling-center-trigger-wrap');
    const resultsWrap = document.getElementById('ai-styling-results-wrapper');
    if (centerWrap) centerWrap.style.display = 'flex';
    if (resultsWrap) resultsWrap.style.display = 'none';
    const accContainer = document.getElementById('accessories-multi-container');
    if (accContainer) accContainer.innerHTML = '';
    const hairContainer = document.getElementById('hairstyles-single-container');
    if (hairContainer) hairContainer.innerHTML = '';
    const customAccContainer = document.getElementById('custom-accessories-chips');
    if (customAccContainer) customAccContainer.innerHTML = '';
    const customHairBadge = document.getElementById('custom-hair-active-badge');
    if (customHairBadge) customHairBadge.style.display = 'none';

    // 5. Ẩn hoàn toàn cột AI Popup, trả về 1 cột Studio duy nhất
    const aiColumn = document.getElementById('workshop-ai-column');
    if (aiColumn) aiColumn.style.display = 'none';
    const workshopContainer = document.getElementById('workshop-container');
    if (workshopContainer) workshopContainer.classList.remove('has-ai-column');

    // 6. Chuyển active về Tab 1 (Dáng Áo)
    this.switchSheetTab('panel-garments');

    // 7. Cập nhật khóa Tab 4 và nút Thẩm Định
    this.checkOptionsProgress();
    this.hideSanityAlert();
  }

  /**
   * Nạp phục trang từ nguồn Remix (từ Lookbook hoặc Khám phá)
   * Giữ nguyên và mở khóa đầy đủ quy trình
   */
  public loadRemixOutfit(outfit: DiscoveryOutfit): void {
    // 1. Dáng áo
    this.selectedGarment = outfit.garment;
    document.querySelectorAll('[data-garment-select]').forEach((card) => {
      const el = card as HTMLElement;
      if (el.dataset.garmentSelect === outfit.garment) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
    const checkGarment = document.getElementById('badge-check-garment');
    if (checkGarment) checkGarment.style.display = 'inline-flex';

    // 2. Màu sắc
    this.selectedColor = outfit.color;
    this.selectedColorName = outfit.colorName;
    const colorInput = document.getElementById('workshop-color-input') as HTMLInputElement | null;
    const hexInput = document.getElementById('workshop-color-hex-input') as HTMLInputElement | null;
    const livePreviewDot = document.getElementById('color-live-preview-dot');
    if (colorInput) colorInput.value = outfit.color;
    if (hexInput) hexInput.value = outfit.color.toUpperCase();
    if (livePreviewDot) livePreviewDot.style.backgroundColor = outfit.color;

    document.querySelectorAll('.sheet-color-circle').forEach((swatch) => {
      const el = swatch as HTMLElement;
      if (el.dataset.color?.toLowerCase() === outfit.color.toLowerCase()) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
    const checkColor = document.getElementById('badge-check-color');
    if (checkColor) checkColor.style.display = 'inline-flex';

    // 3. Phong cách mặc định
    this.selectedStyles = ['Thanh tao cung đình'];
    document.querySelectorAll('.style-bubble-chip').forEach((chip) => {
      const el = chip as HTMLElement;
      if (el.dataset.style === 'Thanh tao cung đình') {
        el.classList.add('selected');
      } else {
        el.classList.remove('selected');
      }
    });
    const styleCount = document.getElementById('style-selected-count');
    if (styleCount) styleCount.textContent = 'Đã chọn: 1';
    const checkStyle = document.getElementById('badge-check-style');
    if (checkStyle) checkStyle.style.display = 'inline-flex';

    // 4. Phụ kiện
    this.selectedAccessories = [outfit.accessory];

    // Cập nhật tiến độ -> Mở khóa tab 4
    this.checkOptionsProgress();

    // Tự động kích hoạt gợi ý AI cho bộ trang phục remix để người dùng trải nghiệm ngay
    this.triggerMiniGeminiGeneration();
  }

  /**
   * Chuyển tab trong Studio
   */
  private switchSheetTab(panelId: string): void {
    const tabs = document.querySelectorAll('.sheet-tab-btn');
    const panels = document.querySelectorAll('.sheet-options-panel');

    tabs.forEach((tab) => {
      const el = tab as HTMLElement;
      if (el.dataset.target === panelId) {
        el.classList.add('active');
        el.setAttribute('aria-selected', 'true');
        el.classList.remove('tab-highlight-pulse');
      } else {
        el.classList.remove('active');
        el.setAttribute('aria-selected', 'false');
      }
    });

    panels.forEach((p) => {
      if (p.id === panelId) {
        p.classList.add('active-panel');
      } else {
        p.classList.remove('active-panel');
      }
    });
  }

  /**
   * 1. Điều hướng 4 Tabs ở Bento Sheet
   */
  private setupSheetTabs(): void {
    const tabs = document.querySelectorAll('.sheet-tab-btn');

    tabs.forEach((tab) => {
      tab.addEventListener('click', (e) => {
        const targetBtn = e.currentTarget as HTMLElement;
        const targetPanelId = targetBtn.dataset.target;

        // Nếu nhấn vào Tab 4 (Phụ Kiện) mà chưa chọn đủ 3 options đầu -> Chặn lại và hiện toast thông báo
        if (targetPanelId === 'panel-ai-styling' && !this.areFirstThreeOptionsComplete()) {
          if (!this.selectedGarment) {
            appRouter.showToast('Mẫu áo này đang được xem xét ra mắt cho các loại trang phục chưa có. Vui lòng chọn dáng áo đã ra mắt trước!');
            this.switchSheetTab('panel-garments');
          } else if (!this.selectedColor) {
            appRouter.showToast('🎨 Vui lòng chọn Sắc Lụa trước khi chuyển qua Phụ Kiện!');
            this.switchSheetTab('panel-colors');
          } else {
            appRouter.showToast('🎭 Vui lòng chọn ít nhất 1 Phong Cách trước khi chuyển qua Phụ Kiện!');
            this.switchSheetTab('panel-styles');
          }
          return;
        }

        Sound.playClick();
        if (targetPanelId) {
          this.switchSheetTab(targetPanelId);
        }

        // Nếu vừa vào Tab 4 Phụ Kiện: kiểm tra xem đã có gợi ý chưa để hiển thị đúng state
        if (targetPanelId === 'panel-ai-styling') {
          const centerWrap = document.getElementById('ai-styling-center-trigger-wrap');
          const resultsWrap = document.getElementById('ai-styling-results-wrapper');
          if (this.hasGeneratedAISuggestions) {
            if (centerWrap) centerWrap.style.display = 'none';
            if (resultsWrap) resultsWrap.style.display = 'block';
          } else {
            if (centerWrap) centerWrap.style.display = 'flex';
            if (resultsWrap) resultsWrap.style.display = 'none';
          }
        }
      });
    });
  }

  /**
   * 2. Tùy chọn Dáng Áo Di Sản (Option 1)
   */
  private setupGarmentOptions(): void {
    const garmentCards = document.querySelectorAll('[data-garment-select]');
    garmentCards.forEach((card) => {
      card.addEventListener('click', (e) => {
        Sound.playChime();
        const el = e.currentTarget as HTMLElement;
        const garmentKey = el.dataset.garmentSelect || 'AO_NGU_THAN';

        this.selectedGarment = garmentKey;
        garmentCards.forEach((c) => c.classList.remove('active'));
        el.classList.add('active');

        const checkBadge = document.getElementById('badge-check-garment');
        if (checkBadge) checkBadge.style.display = 'inline-flex';

        this.onOutfitInputModified();
        this.hideSanityAlert();
      });
    });

    // Thông báo cho các thẻ cổ phục đang nghiên cứu di sản (Ra mắt sau)
    const inactiveCards = document.querySelectorAll('.sheet-option-card-inactive');
    inactiveCards.forEach((card) => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        Sound.playClick();
        appRouter.showToast('Mẫu áo này đang được xem xét ra mắt cho các loại trang phục chưa có.');
      });
    });
  }

  /**
   * 3. Color Picker tự do & Dải sắc lụa di sản (Option 2)
   */
  private setupColorPickerAndPresets(): void {
    const colorInput = document.getElementById('workshop-color-input') as HTMLInputElement | null;
    const hexInput = document.getElementById('workshop-color-hex-input') as HTMLInputElement | null;
    const livePreviewDot = document.getElementById('color-live-preview-dot');
    const colorSwatches = document.querySelectorAll('.sheet-color-circle');

    const updateColorSelection = (hex: string, name?: string) => {
      this.selectedColor = hex;
      this.selectedColorName = name || `Sắc Hex ${hex}`;

      if (livePreviewDot) livePreviewDot.style.backgroundColor = hex;
      if (hexInput && hexInput.value.toUpperCase() !== hex.toUpperCase()) {
        hexInput.value = hex.toUpperCase();
      }
      if (colorInput && colorInput.value.toLowerCase() !== hex.toLowerCase()) {
        colorInput.value = hex;
      }

      const checkBadge = document.getElementById('badge-check-color');
      if (checkBadge) checkBadge.style.display = 'inline-flex';

      this.onOutfitInputModified();
      this.hideSanityAlert();
    };

    // Listener Native Color Picker
    colorInput?.addEventListener('input', (e) => {
      const val = (e.target as HTMLInputElement).value;
      colorSwatches.forEach((s) => s.classList.remove('active'));
      updateColorSelection(val, `Tùy Chọn (${val})`);
    });

    // Listener Ô Nhập Hex Trực Tiếp
    hexInput?.addEventListener('input', (e) => {
      let val = (e.target as HTMLInputElement).value.trim();
      if (!val.startsWith('#') && val.length > 0) val = '#' + val;
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        colorSwatches.forEach((s) => s.classList.remove('active'));
        updateColorSelection(val, `Sắc Hex ${val}`);
      }
    });

    // Listener Dải Màu Nhanh Di Sản
    colorSwatches.forEach((swatch) => {
      swatch.addEventListener('click', (e) => {
        Sound.playClick();
        const el = e.currentTarget as HTMLElement;
        const colorHex = el.dataset.color || '#F4C9D6';
        const colorName = el.dataset.name || 'Hồng Phấn Sen';

        colorSwatches.forEach((s) => s.classList.remove('active'));
        el.classList.add('active');

        updateColorSelection(colorHex, colorName);
      });
    });
  }

  /**
   * 4. Tùy chọn Phong Cách (Bubble Multi-Select + Slider Phá Cách) (Option 3)
   */
  private setupStyleAndCreativity(): void {
    const bubbleChips = document.querySelectorAll('.style-bubble-chip');
    bubbleChips.forEach((chip) => {
      chip.addEventListener('click', (e) => {
        Sound.playClick();
        const el = e.currentTarget as HTMLElement;
        const styleName = el.dataset.style || '';

        if (!styleName) return;

        if (this.selectedStyles.includes(styleName)) {
          this.selectedStyles = this.selectedStyles.filter((s) => s !== styleName);
          el.classList.remove('selected');
        } else {
          this.selectedStyles.push(styleName);
          el.classList.add('selected');
        }

        const countBadge = document.getElementById('style-selected-count');
        if (countBadge) {
          countBadge.textContent = `Đã chọn: ${this.selectedStyles.length}`;
        }

        const checkBadge = document.getElementById('badge-check-style');
        if (checkBadge) {
          checkBadge.style.display = this.selectedStyles.length > 0 ? 'inline-flex' : 'none';
        }

        this.onOutfitInputModified();
        this.hideSanityAlert();
      });
    });

    // Slider Độ phá cách của ý tưởng (Creativity Slider)
    const slider = document.getElementById('creativity-slider') as HTMLInputElement | null;
    const sliderValBadge = document.getElementById('creativity-slider-val');

    slider?.addEventListener('input', (e) => {
      const val = parseInt((e.target as HTMLInputElement).value, 10);
      this.creativityLevel = val;

      let labelText = '';
      if (val <= 20) {
        labelText = `Thuần khiết di sản (${val}%)`;
      } else if (val <= 50) {
        labelText = `Cân bằng di sản (${val}%)`;
      } else if (val <= 80) {
        labelText = `Đương đại phá cách (${val}%)`;
      } else {
        labelText = `Tiên phong siêu thực (${val}%)`;
      }

      if (sliderValBadge) {
        sliderValBadge.textContent = labelText;
      }

      this.onOutfitInputModified();
    });
  }

  /**
   * 5. VÒNG MINI GEMINI & TỰ NHẬP PHỤ KIỆN / KIỂU TÓC (Option 4)
   */
  private setupAIStylingRound(): void {
    // 1. Nút Xem Gợi Ý AI ở giữa màn hình (Trạng thái ban đầu)
    const btnCenterTrigger = document.getElementById('btn-trigger-mini-gemini');
    btnCenterTrigger?.addEventListener('click', () => {
      if (!this.areFirstThreeOptionsComplete()) {
        this.openValidationAlertModal('ACCESSORIES');
        return;
      }
      Sound.playChime();
      this.triggerMiniGeminiGeneration();
    });

    // 2. Nút Thẩm Định Lại & Cập Nhật Gợi Ý AI (ở cuối panel và trên đỉnh cột AI)
    const btnBottomRetrigger = document.getElementById('btn-retrigger-mini-gemini');
    btnBottomRetrigger?.addEventListener('click', () => {
      Sound.playChime();
      this.triggerMiniGeminiGeneration();
    });

    const btnHeaderRetrigger = document.getElementById('btn-ai-header-retrigger');
    btnHeaderRetrigger?.addEventListener('click', () => {
      Sound.playChime();
      this.triggerMiniGeminiGeneration();
    });

    // Ô Tự Nhập Phụ Kiện
    const inputCustomAcc = document.getElementById('input-custom-accessory') as HTMLInputElement | null;
    const btnAddCustomAcc = document.getElementById('btn-add-custom-accessory');

    const handleAddAcc = () => {
      if (!inputCustomAcc) return;
      const text = inputCustomAcc.value.trim();
      if (!text) return;

      const sanity = validateUserInputSanity(text, 'accessory');
      if (!sanity.isValid) {
        this.showSanityAlert(sanity.reason || 'Nội dung chưa phù hợp chuẩn mực phụ kiện thời trang hoặc thuần phong mỹ tục.');
        return;
      }

      this.hideSanityAlert();
      if (!this.customAccessories.includes(text)) {
        this.customAccessories.push(text);
        Sound.playClick();
        this.renderCustomAccessoriesChips();
        inputCustomAcc.value = '';
        this.updateSelectedAccessoriesCount();
        this.onOutfitInputModified();
      }
    };

    btnAddCustomAcc?.addEventListener('click', handleAddAcc);
    inputCustomAcc?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddAcc();
      }
    });

    // Ô Tự Nhập Kiểu Tóc
    const inputCustomHair = document.getElementById('input-custom-hair') as HTMLInputElement | null;
    const btnApplyCustomHair = document.getElementById('btn-apply-custom-hair');

    const handleApplyHair = () => {
      if (!inputCustomHair) return;
      const text = inputCustomHair.value.trim();
      if (!text) return;

      const sanity = validateUserInputSanity(text, 'hairstyle');
      if (!sanity.isValid) {
        this.showSanityAlert(sanity.reason || 'Nội dung chưa phù hợp chuẩn mực kiểu tóc hoặc thuần phong mỹ tục.');
        return;
      }

      this.hideSanityAlert();
      this.customHairstyle = text;
      Sound.playClick();
      this.onOutfitInputModified();

      // Bỏ active trên danh sách card gợi ý
      document.querySelectorAll('#hairstyles-single-container .styling-item-card').forEach((c) => {
        c.classList.remove('selected');
      });

      const badge = document.getElementById('custom-hair-active-badge');
      if (badge) {
        badge.style.display = 'block';
        badge.innerHTML = `<span>✓ Đang áp dụng: "<strong>${text}</strong>"</span> <span style="margin-left: 8px; opacity: 0.8; font-size: 0.8em;">(✕ Bỏ áp dụng)</span>`;
        badge.style.cursor = 'pointer';
        badge.title = 'Bấm để gỡ bỏ kiểu tóc tự nhập';
        badge.onclick = () => {
          this.customHairstyle = '';
          badge.style.display = 'none';
          Sound.playClick();
          this.onOutfitInputModified();
        };
      }
    };

    btnApplyCustomHair?.addEventListener('click', handleApplyHair);
    inputCustomHair?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleApplyHair();
      }
    });
  }

  /**
   * Gọi API Mini Gemini / Offline Generator và mở pop-up Cột Tổng Hợp bên cạnh Studio
   */
  public async triggerMiniGeminiGeneration(): Promise<void> {
    if (this.isGeneratingMiniStyling) return;
    this.isGeneratingMiniStyling = true;

    const btnCenter = document.getElementById('btn-trigger-mini-gemini') as HTMLButtonElement | null;
    const centerSpinner = document.getElementById('mini-gemini-spinner');
    const centerText = document.getElementById('center-trigger-btn-text');

    const btnRetrigger = document.getElementById('btn-retrigger-mini-gemini') as HTMLButtonElement | null;

    if (btnCenter) btnCenter.disabled = true;
    if (btnRetrigger) btnRetrigger.disabled = true;
    if (centerSpinner) centerSpinner.style.display = 'inline-block';
    if (centerText) centerText.textContent = 'AI Đang Phân Tích & Sáng Tạo...';

    try {
      let userProfile = null;
      try {
        const saved = localStorage.getItem('viet_y_user_profile');
        if (saved) userProfile = JSON.parse(saved);
      } catch (e) {}

      const stylesStr = this.selectedStyles.length ? this.selectedStyles.join(', ') : 'Thanh tao cung đình';

      const data = await fetchStylingSuggestionsAPI({
        garment_type: this.selectedGarment || 'AO_NGU_THAN',
        primary_color: this.selectedColor || '#F4C9D6',
        styles: this.selectedStyles,
        style_mode: stylesStr,
        creativity_level: this.creativityLevel,
        personality: stylesStr + ` (Độ phá cách sáng tạo: ${this.creativityLevel}%)`,
        user_profile: userProfile
      });

      this.aiStylingData = data;
      this.hasGeneratedAISuggestions = true;

      // Chọn mặc định món đầu tiên nếu chưa chọn món nào
      if (this.selectedAccessories.length === 0 && data.accessories?.length) {
        this.selectedAccessories = [data.accessories[0].id];
      }
      if (!this.selectedHairstyle && data.hairstyles?.length) {
        this.selectedHairstyle = data.hairstyles[0].id;
      }

      // 1. Chuyển đổi trạng thái giao diện Tab 4: Ẩn nút giữa, hiện danh sách và nút dưới cùng
      const centerTriggerWrap = document.getElementById('ai-styling-center-trigger-wrap');
      const resultsWrapper = document.getElementById('ai-styling-results-wrapper');
      if (centerTriggerWrap) centerTriggerWrap.style.display = 'none';
      if (resultsWrapper) resultsWrapper.style.display = 'block';

      // 2. Render các lựa chọn phụ kiện và tóc
      this.renderAccessoriesList(data.accessories || []);
      this.renderHairstylesList(data.hairstyles || []);
      this.renderStylistNote(data.stylist_note);

      // 3. POP-UP CỘT TỔNG HỢP THẨM ĐỊNH & GỢI Ý AI XUẤT HIỆN BÊN CẠNH STUDIO
      const aiColumn = document.getElementById('workshop-ai-column');
      const workshopContainer = document.getElementById('workshop-container');
      if (aiColumn) {
        aiColumn.style.display = 'flex';
      }
      if (workshopContainer) {
        workshopContainer.classList.add('has-ai-column');
      }

      // 4. Đồng bộ dữ liệu vào Cột Tổng Hợp
      this.populateAISynthesisColumn(data, userProfile);

      // 5. Cập nhật nút Thẩm Định sang trạng thái Sẵn Sàng (Ready)
      this.hasGeneratedAISuggestions = true;
      this.needsReappraisal = false;

      const btnViewResult = document.getElementById('btn-view-result');
      const btnViewResultText = document.getElementById('btn-view-result-text');
      if (btnViewResult) {
        btnViewResult.classList.remove('btn-cta-pending');
        btnViewResult.classList.add('btn-cta-ready');
      }
      if (btnViewResultText) {
        btnViewResultText.textContent = '✨ Thẩm Định & Xem Kết Quả';
      }
      const retriggerBtn = document.getElementById('btn-ai-header-retrigger');
      if (retriggerBtn) {
        retriggerBtn.classList.remove('tab-highlight-pulse');
      }
      const centerTriggerBtn = document.getElementById('btn-trigger-mini-gemini');
      if (centerTriggerBtn) {
        centerTriggerBtn.classList.remove('tab-highlight-pulse');
      }
      appRouter.showToast('✓ Đã hoàn tất thẩm định AI! Bạn có thể xem kết quả ngay.');
      this.checkOptionsProgress();

      Sound.playChime();
    } catch (err) {
      console.warn('Lỗi kích hoạt Mini Gemini Styling:', err);
    } finally {
      this.isGeneratingMiniStyling = false;
      if (btnCenter) btnCenter.disabled = false;
      if (btnRetrigger) btnRetrigger.disabled = false;
      if (centerSpinner) centerSpinner.style.display = 'none';
      if (centerText) centerText.textContent = 'Xem Gợi Ý AI';
    }
  }

  /**
   * Đổ toàn bộ dữ liệu vào Cột Tổng Hợp Thẩm Định & Gợi Ý AI
   */
  private populateAISynthesisColumn(data: MiniStylingResponse, userProfile: any): void {
    const truth = getCulturalTruth(this.selectedGarment || 'AO_NGU_THAN');

    // 1. Phân Tích Màu Sắc Động (Từ Gemini API)
    let colorMeaning = 'Sắc phục nền nã, tôn vinh nét đẹp văn hóa.';
    let colorFiveElements = 'Thổ Hoàng Cúc';
    let colorHarmony = 'Hài Hòa Di Sản';
    let colorTone = 'Tông sáng tươi mới, bừng sáng diện mạo.';

    if (data.color_analysis) {
      colorMeaning = data.color_analysis.cultural_meaning;
      colorFiveElements = data.color_analysis.five_elements;
      colorHarmony = data.color_analysis.harmony_rating;
      colorTone = data.color_analysis.visual_tone;
    } else {
      const fallbackColor = getColorCulturalAnalysis(this.selectedColor || '#F4C9D6', this.selectedGarment || 'AO_NGU_THAN', 'tet');
      colorMeaning = fallbackColor.cultural_symbolism;
      colorFiveElements = fallbackColor.element_meaning || 'Thổ Hoàng Cúc';
      colorHarmony = fallbackColor.harmony_title;
      colorTone = fallbackColor.event_suitability;
    }

    const elColorElement = document.getElementById('ai-color-element');
    const elColorDot = document.getElementById('ai-color-dot');
    const elColorName = document.getElementById('ai-color-name');
    const elColorHarmony = document.getElementById('ai-color-harmony');
    const elColorMeaning = document.getElementById('ai-color-meaning');
    const elColorTone = document.getElementById('ai-color-visual-tone');

    if (elColorElement) elColorElement.textContent = colorFiveElements;
    if (elColorDot) elColorDot.style.backgroundColor = this.selectedColor || '#F4C9D6';
    if (elColorName) elColorName.textContent = `Mã Sắc: ${this.selectedColor || '#F4C9D6'} • ${this.selectedColorName || 'Sắc Lụa'}`;
    if (elColorHarmony) elColorHarmony.textContent = `Độ Hòa Sắc: ${colorHarmony}`;
    if (elColorMeaning) elColorMeaning.textContent = colorMeaning;
    if (elColorTone) elColorTone.textContent = `🌸 Cảm giác thị giác: ${colorTone}`;

    // 3. Độ Tương Thích Cá Nhân Người Dùng (Personal Compatibility)
    const compatData = data.personal_compatibility;
    const elCompatProvided = document.getElementById('ai-compat-provided-content');
    const elCompatMissing = document.getElementById('ai-compat-missing-notice');
    const elMissingMsg = document.getElementById('ai-missing-profile-msg');
    const elCompatBadge = document.getElementById('ai-compat-badge');

    const hasProfileInfo = Boolean(
      compatData?.is_profile_provided ||
      (userProfile && (userProfile.height || userProfile.weight || userProfile.shape || userProfile.skin))
    );

    if (hasProfileInfo && compatData && compatData.skin_tone_effect) {
      if (elCompatProvided) elCompatProvided.style.display = 'block';
      if (elCompatMissing) elCompatMissing.style.display = 'none';
      if (elCompatBadge) elCompatBadge.textContent = 'Đã Phân Tích';

      const elSkinText = document.getElementById('ai-skin-effect-text');
      const elSilText = document.getElementById('ai-silhouette-effect-text');
      const elTailorText = document.getElementById('ai-tailoring-advice-text');

      if (elSkinText) elSkinText.textContent = compatData.skin_tone_effect;
      if (elSilText) elSilText.textContent = compatData.silhouette_effect;
      if (elTailorText) elTailorText.textContent = compatData.tailoring_advice;
    } else {
      // Khi người dùng chưa nhập hồ sơ: Để trống mục chi tiết và nhắc nhẹ nhàng
      if (elCompatProvided) elCompatProvided.style.display = 'none';
      if (elCompatMissing) elCompatMissing.style.display = 'flex';
      if (elCompatBadge) elCompatBadge.textContent = 'Chưa Có Hồ Sơ';
      if (elMissingMsg) {
        elMissingMsg.textContent =
          compatData?.missing_profile_reminder ||
          'Bạn chưa lưu đặc điểm ngoại hình trong mục Hồ Sơ. Hãy mở Hồ Sơ để bổ sung chiều cao, cân nặng, tông da và nhấn "Cập nhật gợi ý AI" để nhận tư vấn độ tương thích cá nhân chuyên sâu!';
      }
    }

    // 4. Cảnh Báo Phụ Kiện Đúng Hay Không (Cultural Guardrail)
    const allAccessories = [...this.selectedAccessories, ...this.customAccessories];
    const tabooCheck = checkMultipleStrictTaboos(truth.id, allAccessories);
    const guardrail = data.cultural_guardrail;

    const elGuardrailStatusPill = document.getElementById('ai-guardrail-status-pill');
    const elGuardrailFlag = document.getElementById('ai-guardrail-flag');
    const elGuardrailAdvice = document.getElementById('ai-guardrail-advice');

    const isSafe = !tabooCheck.hasTaboo && (guardrail ? guardrail.is_safe : true);

    if (isSafe) {
      if (elGuardrailStatusPill) {
        elGuardrailStatusPill.textContent = '✓ Chuẩn Mực Di Sản';
        elGuardrailStatusPill.style.color = '#4A8577';
        elGuardrailStatusPill.style.background = 'rgba(74, 133, 119, 0.14)';
      }
      if (elGuardrailFlag) {
        elGuardrailFlag.textContent = '✓ An Toàn Di Sản';
        elGuardrailFlag.className = 'insight-taboo-flag flag-safe';
      }
      if (elGuardrailAdvice) {
        elGuardrailAdvice.textContent =
          guardrail?.advice ||
          `Các phụ kiện được kết hợp hài hòa chuẩn mực với quy chuẩn di sản [${truth.originRegion}]. Không vi phạm kiêng kỵ lịch sử nào.`;
      }
    } else {
      if (elGuardrailStatusPill) {
        elGuardrailStatusPill.textContent = '⚡ Cảnh Báo Phá Cách';
        elGuardrailStatusPill.style.color = '#D32F2F';
        elGuardrailStatusPill.style.background = 'rgba(211, 47, 47, 0.14)';
      }
      if (elGuardrailFlag) {
        elGuardrailFlag.textContent = '⚠ Kiêng Kỵ Điển Lễ';
        elGuardrailFlag.className = 'insight-taboo-flag flag-warn';
      }
      const warningText = tabooCheck.hasTaboo
        ? tabooCheck.taboos.map((t) => t.historicalConflictReason).join(' ')
        : guardrail?.warning_msg || 'Phát hiện sự kết hợp phụ kiện cần lưu ý về điển lễ.';
      if (elGuardrailAdvice) {
        elGuardrailAdvice.textContent = warningText;
      }
    }

    // 5. Gợi Ý Dáng Chụp Ảnh
    const elPose = document.getElementById('ai-pose-text');
    if (elPose) {
      elPose.textContent =
        data.pose_suggestions ||
        'Đứng thẳng người đoan chính, một tay khẽ che quạt giấy ngang eo hoặc trước ngực, tay kia buông tà tự nhiên, ánh mắt nhìn thẳng thanh thoát.';
    }

    // 6. Mặc Trong 2-3 Dịp Gì
    const occasionsList = document.getElementById('ai-occasions-chips-list');
    if (occasionsList) {
      occasionsList.innerHTML = '';
      const occasions = data.recommended_occasions?.length
        ? data.recommended_occasions
        : ['🌸 Dạo phố Tết truyền thống & du xuân', '🎓 Chụp kỷ yếu tốt nghiệp / thanh xuân', '🏛️ Đi lễ chùa đầu năm & hội làng'];

      occasions.forEach((occ) => {
        const chip = document.createElement('span');
        chip.className = 'ai-occasion-chip';
        chip.textContent = occ.startsWith('🌸') || occ.startsWith('🎓') || occ.startsWith('🏛️') ? occ : `🏮 ${occ}`;
        occasionsList.appendChild(chip);
      });
    }
  }

  private renderStylistNote(note?: string): void {
    const noteBox = document.getElementById('ai-stylist-note-box');
    const noteContent = document.getElementById('ai-stylist-note-content');
    if (!noteBox || !noteContent) return;
    if (note && note.trim()) {
      noteContent.textContent = note;
      noteBox.style.display = 'block';
    } else {
      noteBox.style.display = 'none';
    }
  }

  /**
   * Render danh sách phụ kiện gợi ý (Multiple Select)
   */
  private renderAccessoriesList(items: StylingSuggestionItem[]): void {
    const container = document.getElementById('accessories-multi-container');
    if (!container) return;

    container.innerHTML = '';
    items.forEach((item) => {
      const card = document.createElement('div');
      const isSelected = this.selectedAccessories.includes(item.id);
      card.className = `styling-item-card ${isSelected ? 'selected' : ''}`;
      card.dataset.accId = item.id;

      card.innerHTML = `
        <div class="item-check-indicator">${isSelected ? '✓' : ''}</div>
        <div class="styling-item-content">
          <div class="styling-item-top">
            <span class="styling-item-name">${item.name}</span>
            ${item.vibe_tag ? `<span class="styling-vibe-tag">${item.vibe_tag}</span>` : ''}
          </div>
          <span class="styling-item-reason">${item.cultural_reason}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        Sound.playClick();
        const id = item.id;
        if (this.selectedAccessories.includes(id)) {
          if (this.selectedAccessories.length > 1 || this.customAccessories.length > 0) {
            this.selectedAccessories = this.selectedAccessories.filter((x) => x !== id);
          }
        } else {
          this.selectedAccessories.push(id);
        }

        const check = card.querySelector('.item-check-indicator');
        if (this.selectedAccessories.includes(id)) {
          card.classList.add('selected');
          if (check) check.textContent = '✓';
        } else {
          card.classList.remove('selected');
          if (check) check.textContent = '';
        }

        this.updateSelectedAccessoriesCount();
        this.onOutfitInputModified();
      });

      container.appendChild(card);
    });

    this.updateSelectedAccessoriesCount();
  }

  /**
   * Render danh sách kiểu tóc gợi ý (Single Select)
   */
  private renderHairstylesList(items: StylingSuggestionItem[]): void {
    const container = document.getElementById('hairstyles-single-container');
    if (!container) return;

    container.innerHTML = '';
    items.forEach((item) => {
      const card = document.createElement('div');
      const isSelected = this.selectedHairstyle === item.id && !this.customHairstyle;
      card.className = `styling-item-card radio-card ${isSelected ? 'selected' : ''}`;
      card.dataset.hairId = item.id;

      card.innerHTML = `
        <div class="item-check-indicator">${isSelected ? '●' : ''}</div>
        <div class="styling-item-content">
          <div class="styling-item-top">
            <span class="styling-item-name">${item.name}</span>
            ${item.vibe_tag ? `<span class="styling-vibe-tag">${item.vibe_tag}</span>` : ''}
          </div>
          <span class="styling-item-reason">${item.cultural_reason}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        Sound.playClick();
        this.selectedHairstyle = item.id;
        this.customHairstyle = '';

        const customBadge = document.getElementById('custom-hair-active-badge');
        if (customBadge) customBadge.style.display = 'none';

        document.querySelectorAll('#hairstyles-single-container .styling-item-card').forEach((c) => {
          c.classList.remove('selected');
          const indicator = c.querySelector('.item-check-indicator');
          if (indicator) indicator.textContent = '';
        });

        card.classList.add('selected');
        const check = card.querySelector('.item-check-indicator');
        if (check) check.textContent = '●';
        this.onOutfitInputModified();
      });

      container.appendChild(card);
    });
  }

  private renderCustomAccessoriesChips(): void {
    const container = document.getElementById('custom-accessories-chips');
    if (!container) return;

    container.innerHTML = '';
    this.customAccessories.forEach((accName) => {
      const chip = document.createElement('span');
      chip.className = 'custom-chip-item';
      chip.innerHTML = `
        <span>${accName}</span>
        <button type="button" class="custom-chip-remove" title="Xóa phụ kiện này" aria-label="Xóa ${accName}">✕</button>
      `;

      chip.querySelector('.custom-chip-remove')?.addEventListener('click', (e) => {
        e.stopPropagation();
        Sound.playClick();
        this.customAccessories = this.customAccessories.filter((x) => x !== accName);
        this.renderCustomAccessoriesChips();
        this.updateSelectedAccessoriesCount();
        this.onOutfitInputModified();
      });

      container.appendChild(chip);
    });
  }

  private updateSelectedAccessoriesCount(): void {
    const badge = document.getElementById('accessories-selected-count');
    const total = this.selectedAccessories.length + this.customAccessories.length;
    if (badge) {
      badge.textContent = `Đã chọn: ${total}`;
    }
  }

  public openValidationAlertModal(mode: 'ACCESSORIES' | 'RESULT'): void {
    Sound.playClick();
    if (!this.selectedGarment) {
      appRouter.showToast('Mẫu áo này đang được xem xét ra mắt cho các loại trang phục chưa có. Vui lòng chọn dáng áo đã ra mắt để tiếp tục!');
      this.switchSheetTab('panel-garments');
      return;
    }
    if (!this.selectedColor) {
      appRouter.showToast('🎨 Vui lòng chọn sắc lụa di sản hoặc màu tùy chỉnh!');
      this.switchSheetTab('panel-colors');
      return;
    }
    if (this.selectedStyles.length === 0) {
      appRouter.showToast('🎭 Vui lòng chọn ít nhất 1 phong cách phối đồ mong muốn!');
      this.switchSheetTab('panel-styles');
      return;
    }
    if (!this.hasGeneratedAISuggestions) {
      if (this.needsReappraisal) {
        appRouter.showToast('⚠️ Bạn vừa chỉnh sửa phối đồ! Bắt buộc nhấn "Nhờ AI Tư Vấn Lại" trước khi xem kết quả.');
      } else {
        appRouter.showToast('🪭 Vui lòng nhấn "Xem Gợi Ý AI" để hoàn tất thẩm định phụ kiện & quy chuẩn di sản!');
      }
      this.switchSheetTab('panel-ai-styling');
      const centerTriggerBtn = document.getElementById('btn-trigger-mini-gemini');
      const retriggerBtn = document.getElementById('btn-ai-header-retrigger');
      const bottomRetriggerBtn = document.getElementById('btn-retrigger-mini-gemini');
      centerTriggerBtn?.classList.add('tab-highlight-pulse');
      retriggerBtn?.classList.add('tab-highlight-pulse');
      bottomRetriggerBtn?.classList.add('tab-highlight-pulse');
      setTimeout(() => {
        centerTriggerBtn?.classList.remove('tab-highlight-pulse');
        retriggerBtn?.classList.remove('tab-highlight-pulse');
        bottomRetriggerBtn?.classList.remove('tab-highlight-pulse');
      }, 3000);
      return;
    }
  }

  public showSanityAlert(message: string): void {
    const alertEl = document.getElementById('styling-sanity-alert');
    const msgEl = document.getElementById('styling-sanity-msg');
    if (alertEl && msgEl) {
      msgEl.textContent = message;
      alertEl.style.display = 'flex';
      Sound.playClick();
    }
  }

  public hideSanityAlert(): void {
    const alertEl = document.getElementById('styling-sanity-alert');
    if (alertEl) alertEl.style.display = 'none';
  }

  public validateCurrentInputs(): { isValid: boolean; reason?: string } {
    for (const acc of this.customAccessories) {
      const check = validateUserInputSanity(acc, 'accessory');
      if (!check.isValid) {
        return { isValid: false, reason: check.reason || `Phụ kiện "${acc}" chưa phù hợp chuẩn mực hoặc thuần phong mỹ tục.` };
      }
    }
    if (this.customHairstyle) {
      const check = validateUserInputSanity(this.customHairstyle, 'hairstyle');
      if (!check.isValid) {
        return { isValid: false, reason: check.reason || `Kiểu tóc "${this.customHairstyle}" chưa phù hợp chuẩn mực hoặc thuần phong mỹ tục.` };
      }
    }
    return { isValid: true };
  }

  public setFabricColor(colorHex: string, colorName?: string): void {
    this.selectedColor = colorHex;
    if (colorName) this.selectedColorName = colorName;
    this.onOutfitInputModified();
  }

  public setGarment(garment: string): void {
    this.selectedGarment = garment;
    this.onOutfitInputModified();
  }

  public setAccessory(acc: string, _isInitial?: boolean): void {
    this.selectedAccessories = [acc];
    this.updateSelectedAccessoriesCount();
    this.onOutfitInputModified();
  }

  public callCulturalAI(_event?: string, _color?: string, _garment?: string, _accessory?: string): void {
    this.triggerMiniGeminiGeneration();
  }

  private setupWorkshopCta(): void {
    const btnView = document.getElementById('btn-view-result');
    btnView?.addEventListener('click', () => {
      // Logic thẩm định được bảo vệ bởi canProceedToResult()
    });
  }
}

export const garmentEngine = new GarmentEngine();
