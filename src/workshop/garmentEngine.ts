import { CurrentOutfitState, MiniStylingResponse, StylingSuggestionItem } from '../types/index.ts';
import { Sound } from '../audio/sound.ts';
import { getCulturalTruth, validateUserInputSanity } from '../data/culturalTruths.ts';
import { fetchStylingSuggestionsAPI } from '../services/api.ts';

export class GarmentEngine {
  public currentColor: string = '#F4C9D6';
  public currentColorName: string = 'Hồng Phấn Sen';
  public currentGarment: string = 'AO_NGU_THAN';
  public currentStyle: string = 'THANH_TAO';
  public currentPersonality: string = 'Nho nhã đoan trang';

  // Multiple selection for accessories
  public selectedAccessories: string[] = ['QUAT_GIAY'];
  public customAccessories: string[] = [];

  // Single selection for hairstyle + custom input
  public selectedHairstyle: string = 'BUI_TRAM';
  public customHairstyle: string = '';

  // Mini Gemini styling suggestions cache
  public aiStylingData: MiniStylingResponse | null = null;
  public isGeneratingMiniStyling: boolean = false;

  public init(): void {
    this.setupSheetTabs();
    this.setupGarmentOptions();
    this.setupColorPickerAndPresets();
    this.setupStyleAndPersonalityOptions();
    this.setupAIStylingRound();
    this.setupWorkshopCta();
    this.applyAllVisuals();

    // Tự động nạp gợi ý phụ kiện & tóc ban đầu
    this.loadInitialStyling();
  }

  public getCurrentOutfitState(): CurrentOutfitState {
    const allAccessories = [...this.selectedAccessories, ...this.customAccessories];
    return {
      event: 'tet',
      color: this.currentColor,
      colorName: this.currentColorName,
      garment: this.currentGarment,
      accessory: allAccessories[0] || 'QUAT_GIAY',
      accessories: allAccessories,
      custom_accessories: this.customAccessories,
      hairstyle: this.customHairstyle || this.selectedHairstyle,
      custom_hairstyle: this.customHairstyle,
      pattern: null,
      genzActive: this.currentStyle === 'DUONG_DAI',
      style: this.currentStyle,
      personality: this.currentPersonality
    };
  }

  /**
   * 1. Điều hướng 4 Tabs ở Bento Sheet (Dáng Áo, Màu Sắc, Phong Cách, Gợi Ý AI & Tự Nhập)
   */
  private setupSheetTabs(): void {
    const tabs = document.querySelectorAll('.sheet-tab-btn');
    const panels = document.querySelectorAll('.sheet-options-panel');

    tabs.forEach((tab) => {
      tab.addEventListener('click', (e) => {
        Sound.playClick();
        const targetBtn = e.currentTarget as HTMLElement;
        const targetPanelId = targetBtn.dataset.target;

        tabs.forEach((t) => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        targetBtn.classList.add('active');
        targetBtn.setAttribute('aria-selected', 'true');

        panels.forEach((p) => {
          if (p.id === targetPanelId) {
            p.classList.add('active-panel');
          } else {
            p.classList.remove('active-panel');
          }
        });
      });
    });
  }

  /**
   * 2. Tùy chọn 6 Dáng Áo Di Sản
   */
  private setupGarmentOptions(): void {
    const garmentCards = document.querySelectorAll('[data-garment-select]');
    garmentCards.forEach((card) => {
      card.addEventListener('click', (e) => {
        Sound.playChime();
        const el = e.currentTarget as HTMLElement;
        const garmentKey = el.dataset.garmentSelect || 'AO_NGU_THAN';
        this.setGarment(garmentKey);
      });
    });
  }

  /**
   * 3. Color Picker tự do & Dải sắc lụa di sản
   */
  private setupColorPickerAndPresets(): void {
    const colorInput = document.getElementById('workshop-color-input') as HTMLInputElement | null;
    const hexInput = document.getElementById('workshop-color-hex-input') as HTMLInputElement | null;
    const livePreviewDot = document.getElementById('color-live-preview-dot');
    const colorSwatches = document.querySelectorAll('.sheet-color-circle');

    // Listener Native Color Picker
    colorInput?.addEventListener('input', (e) => {
      const val = (e.target as HTMLInputElement).value;
      this.setFabricColor(val, `Tùy Chọn (${val})`);
      if (hexInput) hexInput.value = val.toUpperCase();
      if (livePreviewDot) livePreviewDot.style.backgroundColor = val;
      colorSwatches.forEach((s) => s.classList.remove('active'));
    });

    // Listener Ô Nhập Hex Trực Tiếp
    hexInput?.addEventListener('input', (e) => {
      let val = (e.target as HTMLInputElement).value.trim();
      if (!val.startsWith('#') && val.length > 0) val = '#' + val;
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        this.setFabricColor(val, `Sắc Hex ${val}`);
        if (colorInput) colorInput.value = val;
        if (livePreviewDot) livePreviewDot.style.backgroundColor = val;
        colorSwatches.forEach((s) => s.classList.remove('active'));
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

        if (colorInput) colorInput.value = colorHex;
        if (hexInput) hexInput.value = colorHex.toUpperCase();
        if (livePreviewDot) livePreviewDot.style.backgroundColor = colorHex;

        this.setFabricColor(colorHex, colorName);
      });
    });

    // Nút chuyển bước sang "Phong Cách"
    const btnNext = document.getElementById('btn-color-next-acc');
    btnNext?.addEventListener('click', () => {
      Sound.playClick();
      const tabStyles = document.getElementById('tab-opt-styles');
      tabStyles?.click();
    });
  }

  /**
   * 4. Tùy chọn Phong Cách & Tính Cách
   */
  private setupStyleAndPersonalityOptions(): void {
    const styleCards = document.querySelectorAll('[data-style]');
    styleCards.forEach((card) => {
      card.addEventListener('click', (e) => {
        Sound.playChime();
        const el = e.currentTarget as HTMLElement;
        const styleKey = el.dataset.style || 'THANH_TAO';

        styleCards.forEach((c) => c.classList.remove('active'));
        el.classList.add('active');

        this.setStyle(styleKey);
      });
    });

    const personalityChips = document.querySelectorAll('.personality-chip');
    personalityChips.forEach((chip) => {
      chip.addEventListener('click', (e) => {
        Sound.playClick();
        const el = e.currentTarget as HTMLElement;
        const pVal = el.dataset.personality || 'Nho nhã đoan trang';

        personalityChips.forEach((c) => c.classList.remove('active'));
        el.classList.add('active');

        this.currentPersonality = pVal;
        this.updateDesktopGuidance();
      });
    });

    // Nút chuyển nhanh sang AI Styling
    const btnGotoAI = document.getElementById('btn-goto-ai-styling');
    btnGotoAI?.addEventListener('click', () => {
      Sound.playClick();
      const tabAI = document.getElementById('tab-opt-ai-styling');
      tabAI?.click();
    });
  }

  /**
   * 5. VÒNG MINI GEMINI & TỰ NHẬP PHỤ KIỆN / KIỂU TÓC
   */
  private setupAIStylingRound(): void {
    const btnTrigger = document.getElementById('btn-trigger-mini-gemini');
    btnTrigger?.addEventListener('click', () => {
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
        this.updateDesktopGuidance();
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
          this.updateDesktopGuidance();
        };
      }
      this.updateDesktopGuidance();
    };

    btnApplyCustomHair?.addEventListener('click', handleApplyHair);
    inputCustomHair?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleApplyHair();
      }
    });
  }

  private async loadInitialStyling(): Promise<void> {
    try {
      const data = await fetchStylingSuggestionsAPI({
        garment_type: this.currentGarment,
        primary_color: this.currentColor,
        style_mode: this.currentStyle,
        personality: this.currentPersonality
      });
      this.aiStylingData = data;
      this.renderAccessoriesList(data.accessories);
      this.renderHairstylesList(data.hairstyles);
    } catch {
      // Offline fallback
    }
  }

  private async triggerMiniGeminiGeneration(): Promise<void> {
    const btnTrigger = document.getElementById('btn-trigger-mini-gemini') as HTMLButtonElement | null;
    const spinner = document.getElementById('mini-gemini-spinner');
    const label = document.getElementById('mini-gemini-label');

    if (btnTrigger) btnTrigger.disabled = true;
    if (spinner) spinner.style.display = 'inline-block';
    if (label) label.textContent = 'AI Đang Sáng Tạo Gợi Ý...';

    try {
      const data = await fetchStylingSuggestionsAPI({
        garment_type: this.currentGarment,
        primary_color: this.currentColor,
        style_mode: this.currentStyle,
        personality: this.currentPersonality
      });

      this.aiStylingData = data;
      this.renderAccessoriesList(data.accessories);
      this.renderHairstylesList(data.hairstyles);
      Sound.playChime();
    } catch (err) {
      console.warn('Mini Gemini trigger failed:', err);
    } finally {
      if (btnTrigger) btnTrigger.disabled = false;
      if (spinner) spinner.style.display = 'none';
      if (label) label.textContent = '✨ Tạo Lại Gợi Ý AI (Mini Gemini)';
    }
  }

  /**
   * Render danh sách 3 phụ kiện gợi ý (Multiple Select)
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
          // Bỏ chọn (nhưng giữ ít nhất 1 phụ kiện nếu không có custom)
          if (this.selectedAccessories.length > 1 || this.customAccessories.length > 0) {
            this.selectedAccessories = this.selectedAccessories.filter((x) => x !== id);
          }
        } else {
          this.selectedAccessories.push(id);
        }

        // Cập nhật giao diện card
        const check = card.querySelector('.item-check-indicator');
        if (this.selectedAccessories.includes(id)) {
          card.classList.add('selected');
          if (check) check.textContent = '✓';
        } else {
          card.classList.remove('selected');
          if (check) check.textContent = '';
        }

        this.syncLegacyAccessoryVisual();
        this.updateSelectedAccessoriesCount();
        this.updateDesktopGuidance();
      });

      container.appendChild(card);
    });

    this.updateSelectedAccessoriesCount();
  }

  /**
   * Render danh sách 3 kiểu tóc gợi ý (Single Select)
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
        this.customHairstyle = ''; // Reset custom khi chọn gợi ý

        const customBadge = document.getElementById('custom-hair-active-badge');
        if (customBadge) customBadge.style.display = 'none';

        // Update all radio cards
        document.querySelectorAll('#hairstyles-single-container .styling-item-card').forEach((c) => {
          c.classList.remove('selected');
          const indicator = c.querySelector('.item-check-indicator');
          if (indicator) indicator.textContent = '';
        });

        card.classList.add('selected');
        const check = card.querySelector('.item-check-indicator');
        if (check) check.textContent = '●';

        this.syncLegacyHairstyleVisual(item.id);
        this.updateDesktopGuidance();
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
        this.updateDesktopGuidance();
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

  private syncLegacyAccessoryVisual(): void {
    const fan = document.getElementById('acc-fan');
    const scarf = document.getElementById('acc-scarf');
    const hairpin = document.getElementById('acc-hairpin');
    const pouch = document.getElementById('acc-pouch');

    const all = [...this.selectedAccessories, ...this.customAccessories];
    const hasFan = all.some((x) => x.toUpperCase().includes('QUAT'));
    const hasScarf = all.some((x) => x.toUpperCase().includes('KHAN_RAN') || x.toUpperCase().includes('KHĂN RẰN'));
    const hasHairpin = all.some((x) => x.toUpperCase().includes('TRAM') || x.toUpperCase().includes('TRÂM'));
    const hasPouch = all.some((x) => x.toUpperCase().includes('TUI') || x.toUpperCase().includes('TÚI'));

    if (fan) fan.style.display = hasFan ? 'block' : 'none';
    if (scarf) scarf.style.display = hasScarf ? 'block' : 'none';
    if (hairpin) hairpin.style.display = hasHairpin ? 'block' : 'none';
    if (pouch) pouch.style.display = hasPouch ? 'block' : 'none';
  }

  private syncLegacyHairstyleVisual(hairId: string): void {
    const buiTram = document.getElementById('hair-bui-tram');
    const xoaDai = document.getElementById('hair-xoa-dai');
    const vanKhan = document.getElementById('hair-van-khan');
    const buocThap = document.getElementById('hair-buoc-thap');

    if (buiTram) buiTram.style.display = hairId === 'BUI_TRAM' || hairId.includes('BUI') ? 'block' : 'none';
    if (xoaDai) xoaDai.style.display = hairId === 'XOA_DAI' || hairId.includes('XOA') ? 'block' : 'none';
    if (vanKhan) vanKhan.style.display = hairId === 'VAN_KHAN' || hairId.includes('VAN') ? 'block' : 'none';
    if (buocThap) buocThap.style.display = hairId === 'BUOC_THAP' || hairId.includes('BUOC') ? 'block' : 'none';
  }

  /**
   * Cập nhật màu sắc tà áo tức thì lên SVG
   */
  public setFabricColor(colorHex: string, colorName?: string): void {
    this.currentColor = colorHex;
    if (colorName) this.currentColorName = colorName;

    // Cập nhật SVG Áo Ngũ Thân
    const nguthanBody = document.getElementById('nguthan-body-fill');
    const nguthanLeft = document.getElementById('nguthan-left-sleeve');
    const nguthanRight = document.getElementById('nguthan-right-sleeve');
    const collarOuter = document.getElementById('collar-outer');

    if (nguthanBody) nguthanBody.setAttribute('fill', colorHex);
    if (nguthanLeft) nguthanLeft.setAttribute('fill', colorHex);
    if (nguthanRight) nguthanRight.setAttribute('fill', colorHex);
    if (collarOuter) collarOuter.setAttribute('fill', colorHex);

    // Cập nhật SVG Áo Bà Ba
    const babaBody = document.getElementById('baba-body-fill');
    const babaLeft = document.getElementById('baba-left-sleeve');
    const babaRight = document.getElementById('baba-right-sleeve');
    const babaPocketL = document.getElementById('baba-pocket-left');
    const babaPocketR = document.getElementById('baba-pocket-right');

    if (babaBody) babaBody.setAttribute('fill', colorHex);
    if (babaLeft) babaLeft.setAttribute('fill', colorHex);
    if (babaRight) babaRight.setAttribute('fill', colorHex);
    if (babaPocketL) babaPocketL.setAttribute('fill', colorHex);
    if (babaPocketR) babaPocketR.setAttribute('fill', colorHex);

    // Cập nhật nhãn màu đang chọn
    const labelEl = document.getElementById('color-selected-label');
    if (labelEl) {
      labelEl.innerHTML = `Sắc lụa: <strong>${this.currentColorName}</strong>`;
    }

    this.updateDesktopGuidance();
  }

  public setStyle(style: string): void {
    this.currentStyle = style;
    document.querySelectorAll('[data-style]').forEach((card) => {
      const el = card as HTMLElement;
      if (el.dataset.style === style) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    this.updateDesktopGuidance();
  }

  /**
   * Tùy biến Dáng Áo & Đồng bộ tiêu đề Stage Runway
   */
  public setGarment(garment: string): void {
    this.currentGarment = garment;
    const truth = getCulturalTruth(garment);

    document.querySelectorAll('[data-garment-select]').forEach((card) => {
      const el = card as HTMLElement;
      if (el.dataset.garmentSelect === garment) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    // Cập nhật tiêu đề trên Stage
    const stageTitle = document.getElementById('current-garment-title');
    const stageEra = document.getElementById('current-garment-era-pill');
    if (stageTitle) {
      stageTitle.textContent = truth.name;
    }
    if (stageEra) {
      stageEra.textContent = truth.historicalEra.split('(')[0].trim().slice(0, 32);
    }

    // Hiển thị croquis phù hợp (tạm thời giữ croquis hiện tại cho ngũ thân/bà ba theo chỉ đạo)
    const nguthanGroup = document.getElementById('garment-nguthan-group');
    const babaGroup = document.getElementById('garment-baba-group');

    if (garment === 'AO_BA_BA') {
      if (nguthanGroup) nguthanGroup.style.display = 'none';
      if (babaGroup) babaGroup.style.display = 'block';
    } else {
      if (nguthanGroup) nguthanGroup.style.display = 'block';
      if (babaGroup) babaGroup.style.display = 'none';
    }

    // Tự động load gợi ý tương ứng khi đổi áo
    this.triggerMiniGeminiGeneration();
    this.updateDesktopGuidance();
  }

  public setAccessory(acc: string, _isInitial?: boolean): void {
    this.selectedAccessories = [acc];
    this.customAccessories = [];
    this.syncLegacyAccessoryVisual();
    this.updateSelectedAccessoriesCount();
    this.updateDesktopGuidance();

    const cards = document.querySelectorAll('#accessories-multi-container .styling-item-card');
    cards.forEach((card) => {
      const el = card as HTMLElement;
      const check = el.querySelector('.item-check-indicator');
      if (el.dataset.accId === acc) {
        el.classList.add('selected');
        if (check) check.textContent = '✓';
      } else {
        el.classList.remove('selected');
        if (check) check.textContent = '';
      }
    });
  }

  public callCulturalAI(_event?: string, _color?: string, _garment?: string, _accessory?: string): void {
    this.triggerMiniGeminiGeneration();
  }

  private setupWorkshopCta(): void {
    const topBtnView = document.getElementById('btn-view-result');
    topBtnView?.addEventListener('click', () => {
      // Trigger kết quả
    });
  }

  private applyAllVisuals(): void {
    this.setFabricColor(this.currentColor, this.currentColorName);
    this.syncLegacyAccessoryVisual();
    this.syncLegacyHairstyleVisual(this.selectedHairstyle);
    this.updateDesktopGuidance();
  }

  private updateDesktopGuidance(): void {
    const noteEl = document.getElementById('workshop-cultural-note');
    const statusEl = document.getElementById('workshop-guidance-status');
    if (!noteEl) return;

    const truth = getCulturalTruth(this.currentGarment);
    const allAcc = [...this.selectedAccessories, ...this.customAccessories];

    // Kiểm tra xem có vi phạm điều kiêng kỵ nào không
    const hasConflict = truth.strictTaboos.some((t) =>
      allAcc.some((a) => a.toUpperCase().includes(t.incompatibleWith.toUpperCase()) || a.toUpperCase().includes(t.incompatibleName.toUpperCase()))
    );

    if (hasConflict) {
      if (statusEl) {
        statusEl.textContent = '⚡ Phá Cách Gen Z';
        statusEl.style.color = '#C9A66B';
      }
      noteEl.textContent = `${truth.name} sắc ${this.currentColorName} kết hợp phụ kiện thể nghiệm đương đại, mang nét tự do sáng tạo.`;
    } else {
      if (statusEl) {
        statusEl.textContent = '✓ Chuẩn Mực Di Sản';
        statusEl.style.color = '#4A8577';
      }
      noteEl.textContent = `${truth.name} sắc ${this.currentColorName} (${truth.historicalEra}) tôn phong thái ${this.currentPersonality.toLowerCase()} và đoan trang.`;
    }
  }
}

export const garmentEngine = new GarmentEngine();
