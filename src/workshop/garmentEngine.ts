import { CurrentOutfitState, CulturalGuardrailResult } from '../types/index.ts';
import { Sound } from '../audio/sound.ts';
import { culturalGuardrail, checkLocalCulturalRules, MOCK_HERITAGE_DATA } from './culturalGuardrail.ts';
import { patternEngine } from './patternEngine.ts';
import { assembleFashionPrompt } from './promptEngine.ts';
import { lookbookPipeline } from './lookbookPipeline.ts';
import { fetchCulturalAI } from '../services/api.ts';

export class GarmentEngine {
  public currentEvent: string = 'tet';
  public currentColor: string = '#B22222';
  public currentGarment: string = 'AO_NGU_THAN';
  public currentAccessory: string = 'QUAT_GIAY';
  public genzActive: boolean = false;

  private currentAIAbortController: AbortController | null = null;

  public init(): void {
    culturalGuardrail.setup((suggestedFix) => {
      this.setAccessory(suggestedFix, false);
    });

    patternEngine.init();
    lookbookPipeline.setupControls();

    this.bindEvents();

    // Initial load
    this.callCulturalAI(this.currentEvent, this.currentColor, this.currentGarment, this.currentAccessory);
  }

  public getCurrentOutfitState(): CurrentOutfitState {
    const colorTitle = document.getElementById('active-color-name');
    return {
      event: this.currentEvent,
      color: this.currentColor,
      colorName: colorTitle ? colorTitle.textContent?.trim() || 'Đỏ Son' : 'Đỏ Son',
      garment: this.currentGarment,
      accessory: this.currentAccessory,
      pattern: patternEngine.currentPattern || (patternEngine.savedPatterns.length > 0 ? patternEngine.savedPatterns[0] : null),
      genzActive: this.genzActive
    };
  }

  public updateAccessoryVisuals(accessory: string): void {
    this.currentAccessory = accessory;
    const fanLayer = document.getElementById('layer-accessory-fan');
    const scarfLayer = document.getElementById('layer-accessory-scarf');
    const nonLayer = document.getElementById('layer-accessory-non');

    if (fanLayer) fanLayer.style.display = accessory === 'QUAT_GIAY' ? 'block' : 'none';
    if (scarfLayer) scarfLayer.style.display = accessory === 'KHAN_RAN' ? 'block' : 'none';
    if (nonLayer) nonLayer.style.display = accessory === 'NON_QUAI_THAO' ? 'block' : 'none';

    document.querySelectorAll('[data-accessory]').forEach((pill) => {
      const el = pill as HTMLElement;
      if (el.dataset.accessory === accessory) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }

  public setGarment(garment: string): void {
    this.currentGarment = garment;
    document.querySelectorAll('[data-garment]').forEach((pill) => {
      const el = pill as HTMLElement;
      if (el.dataset.garment === garment) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    const titleBadge = document.getElementById('current-garment-title');
    if (titleBadge) {
      titleBadge.textContent = garment === 'AO_BA_BA' ? 'Áo Bà Ba Nam Bộ' : 'Áo Ngũ Thân Lập Lĩnh';
    }

    this.callCulturalAI(this.currentEvent, this.currentColor, this.currentGarment, this.currentAccessory);
  }

  public setAccessory(accessory: string, skipAICall: boolean = false): void {
    this.updateAccessoryVisuals(accessory);
    if (!skipAICall) {
      this.callCulturalAI(this.currentEvent, this.currentColor, this.currentGarment, this.currentAccessory);
    }
  }

  public setFabricColor(colorHex: string, colorName?: string): void {
    this.currentColor = colorHex;
    document.documentElement.style.setProperty('--mau-vai-chinh', colorHex);

    const colorTitle = document.getElementById('active-color-name');
    if (colorTitle && colorName) {
      colorTitle.textContent = colorName;
    }

    document.querySelectorAll('.ceramic-swatch').forEach((swatch) => {
      const el = swatch as HTMLElement;
      if (el.dataset.color?.toLowerCase() === colorHex.toLowerCase()) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    this.callCulturalAI(this.currentEvent, this.currentColor, this.currentGarment, this.currentAccessory);
  }

  public async callCulturalAI(
    selectedEvent: string,
    selectedColor: string,
    selectedGarment: string = 'AO_NGU_THAN',
    selectedAccessory: string = 'QUAT_GIAY'
  ): Promise<void> {
    const card = document.getElementById('heritage-info-card');
    const makeupEl = document.getElementById('info-makeup');
    const poseEl = document.getElementById('info-pose');
    const storyEl = document.getElementById('info-story');
    const contextTag = document.getElementById('heritage-context-tag');

    const localCheck = checkLocalCulturalRules(selectedGarment, selectedAccessory, 'TOAN_QUOC');

    const eventNames: Record<string, string> = {
      tet: 'Dạo Phố Tết',
      grad: 'Lễ Tốt Nghiệp',
      temple: 'Đi Chùa Cầu An'
    };
    const garmentNames: Record<string, string> = {
      AO_NGU_THAN: 'Áo Ngũ Thân',
      AO_BA_BA: 'Áo Bà Ba'
    };
    const colorNames: Record<string, string> = {
      '#B22222': 'Đỏ Son',
      '#1D3557': 'Xanh Chàm',
      '#E5A93C': 'Hoàng Cúc',
      '#2B1A12': 'Cánh Gián',
      '#F5F2EB': 'Trắng Bưởi'
    };

    const eventLabel = eventNames[selectedEvent] || 'Dạo Phố Tết';
    const garmentLabel = garmentNames[selectedGarment] || 'Áo Ngũ Thân';
    const colorLabel = colorNames[selectedColor.toUpperCase()] || selectedColor;

    if (contextTag) {
      contextTag.textContent = `${garmentLabel} • ${eventLabel} • ${colorLabel}`;
    }

    if (this.currentAIAbortController) {
      this.currentAIAbortController.abort();
    }
    this.currentAIAbortController = new AbortController();
    const signal = this.currentAIAbortController.signal;

    if (card) card.classList.add('is-loading');

    let fallbackData: CulturalGuardrailResult = {
      ...(MOCK_HERITAGE_DATA[selectedEvent] || MOCK_HERITAGE_DATA.tet)
    };

    if (!localCheck.is_culturally_accurate) {
      fallbackData.is_culturally_accurate = false;
      fallbackData.warning_level = 'WARNING';
      fallbackData.cultural_warning_msg = localCheck.cultural_warning_msg;
      fallbackData.suggested_fix = localCheck.suggested_fix;
    }

    const applyUI = (data: CulturalGuardrailResult) => {
      if (card) card.classList.remove('is-loading');
      culturalGuardrail.renderGuardrailUI(data);

      const makeupText = data.kieu_toc_va_trang_diem || fallbackData.kieu_toc_va_trang_diem || '';
      const poseText = data.dang_chup_anh || fallbackData.dang_chup_anh || '';
      const storyText = data.cau_chuyen_di_san || fallbackData.cau_chuyen_di_san || '';

      if (makeupEl) {
        makeupEl.textContent = makeupText;
        makeupEl.classList.remove('fade-in');
        void makeupEl.offsetWidth;
        makeupEl.classList.add('fade-in');
      }

      if (poseEl) {
        poseEl.textContent = poseText;
        poseEl.classList.remove('fade-in');
        void poseEl.offsetWidth;
        poseEl.classList.add('fade-in');
      }

      if (storyEl) {
        storyEl.textContent = storyText;
        storyEl.classList.remove('fade-in');
        void storyEl.offsetWidth;
        storyEl.classList.add('fade-in');
      }
    };

    let isCompleted = false;
    const fallbackTimer = setTimeout(() => {
      if (!isCompleted) {
        isCompleted = true;
        this.currentAIAbortController?.abort();
        console.warn('[Gemini Flash AI] Quá 3.5s, tự động áp dụng Fallback & Local Guardrail.');
        applyUI(fallbackData);
      }
    }, 3500);

    try {
      const contextPayload = {
        event: selectedEvent,
        primary_color: selectedColor,
        garment_type: selectedGarment,
        accessory: selectedAccessory,
        region: 'TOAN_QUOC'
      };

      const result = await fetchCulturalAI(contextPayload, signal);
      if (!isCompleted) {
        isCompleted = true;
        clearTimeout(fallbackTimer);
        if (result) {
          if (!localCheck.is_culturally_accurate) {
            result.is_culturally_accurate = false;
            result.warning_level = 'WARNING';
            result.cultural_warning_msg = localCheck.cultural_warning_msg;
            result.suggested_fix = localCheck.suggested_fix;
          }
          applyUI(result);
        } else {
          applyUI(fallbackData);
        }
      }
    } catch {
      if (!isCompleted) {
        isCompleted = true;
        clearTimeout(fallbackTimer);
        applyUI(fallbackData);
      }
    }
  }

  private bindEvents(): void {
    const titleBadge = document.getElementById('current-garment-title');
    const mainGarment = document.getElementById('layer-main-garment');
    const genzLayer = document.getElementById('layer-genz-style');

    // 1. Thẻ bối cảnh 1-chạm (Event Anchors)
    const anchorCards = document.querySelectorAll('.anchor-card');
    anchorCards.forEach((card) => {
      card.addEventListener('click', () => {
        Sound.playChime();
        anchorCards.forEach((c) => c.classList.remove('active'));
        card.classList.add('active');

        const anchorType = (card as HTMLElement).dataset.anchor || 'tet';
        this.currentEvent = anchorType;

        if (anchorType === 'tet') {
          if (titleBadge) {
            titleBadge.textContent =
              this.currentGarment === 'AO_BA_BA' ? 'Áo Bà Ba • Dạo Phố Tết' : 'Áo Ngũ Thân • Dạo Phố Tết';
          }
          this.setFabricColor('#B22222', 'Đỏ Son');
        } else if (anchorType === 'grad') {
          if (titleBadge) {
            titleBadge.textContent =
              this.currentGarment === 'AO_BA_BA' ? 'Áo Bà Ba • Lễ Tốt Nghiệp' : 'Áo Ngũ Thân • Lễ Tốt Nghiệp';
          }
          this.setFabricColor('#1D3557', 'Xanh Chàm');
        } else if (anchorType === 'temple') {
          if (titleBadge) {
            titleBadge.textContent =
              this.currentGarment === 'AO_BA_BA' ? 'Áo Bà Ba • Cầu An Tĩnh Tại' : 'Áo Ngũ Thân • Cầu An Tĩnh Tại';
          }
          this.setFabricColor('#2B1A12', 'Nâu Cánh Gián');
        }
      });
    });

    // 2. Bảng chọn màu vải gốm sứ
    const swatches = document.querySelectorAll('.ceramic-swatch');
    swatches.forEach((swatch) => {
      swatch.addEventListener('click', () => {
        Sound.playClick();
        const el = swatch as HTMLElement;
        const colorHex = el.dataset.color || '#B22222';
        const colorName = el.dataset.name || 'Đỏ Son';
        this.setFabricColor(colorHex, colorName);
      });
    });

    // 3. Thanh trượt vi mô: Saturation
    const sliderSat = document.getElementById('slider-saturation') as HTMLInputElement | null;
    const labelSatVal = document.getElementById('label-sat-val');
    if (sliderSat) {
      sliderSat.addEventListener('input', (e) => {
        const satValue = (e.target as HTMLInputElement).value;
        if (labelSatVal) labelSatVal.textContent = `${satValue}%`;
        if (mainGarment) {
          mainGarment.style.filter = `saturate(${satValue}%)`;
        }
      });
    }

    // 4. Thanh trượt phong cách Gen Z
    const sliderStyle = document.getElementById('slider-style') as HTMLInputElement | null;
    const labelStyleLeft = document.getElementById('label-style-left');
    const labelStyleRight = document.getElementById('label-style-right');
    if (sliderStyle) {
      sliderStyle.addEventListener('input', (e) => {
        const val = parseInt((e.target as HTMLInputElement).value, 10);
        this.genzActive = val > 40;
        if (genzLayer) {
          genzLayer.style.opacity = (val / 100).toString();
        }
        if (val > 50) {
          labelStyleRight?.classList.add('active-tag');
          labelStyleLeft?.classList.remove('active-tag');
        } else {
          labelStyleLeft?.classList.add('active-tag');
          labelStyleRight?.classList.remove('active-tag');
        }
      });
    }

    // 5. Thẩm định cổ phục & phụ kiện
    document.querySelectorAll('[data-garment]').forEach((pill) => {
      pill.addEventListener('click', () => {
        Sound.playClick();
        const g = (pill as HTMLElement).dataset.garment || 'AO_NGU_THAN';
        this.setGarment(g);
      });
    });

    document.querySelectorAll('[data-accessory]').forEach((pill) => {
      pill.addEventListener('click', () => {
        Sound.playClick();
        const a = (pill as HTMLElement).dataset.accessory || 'QUAT_GIAY';
        this.setAccessory(a);
      });
    });

    // 6. Nút Tạo Ảnh Lookbook AI CTA
    const btnGenLookbook = document.getElementById('btn-generate-ai-image');
    if (btnGenLookbook) {
      btnGenLookbook.addEventListener('click', () => {
        Sound.playClick();
        const outfitState = this.getCurrentOutfitState();
        const assembledPrompt = assembleFashionPrompt(outfitState);
        lookbookPipeline.generateLookbook(assembledPrompt);
      });
    }

    // 7. Âm thanh Toggle
    const soundBtn = document.getElementById('btn-toggle-sound');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        Sound.enabled = !Sound.enabled;
        soundBtn.style.opacity = Sound.enabled ? '1' : '0.5';
        if (Sound.enabled) Sound.playChime();
      });
    }
  }
}

export const garmentEngine = new GarmentEngine();
