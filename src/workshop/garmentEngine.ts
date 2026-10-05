import { CurrentOutfitState } from '../types/index.ts';
import { Sound } from '../audio/sound.ts';

export class GarmentEngine {
  public currentColor: string = '#F4C9D6';
  public currentColorName: string = 'Hồng Phấn Sen';
  public currentGarment: string = 'AO_NGU_THAN';
  public currentAccessory: string = 'QUAT_GIAY';
  public currentHairstyle: string = 'BUI_TRAM';
  public currentStyle: string = 'THANH_TAO';

  public init(): void {
    this.setupSheetTabs();
    this.setupColorOptions();
    this.setupAccessoryOptions();
    this.setupHairstyleOptions();
    this.setupStyleOptions();
    this.applyAllVisuals();
  }

  public getCurrentOutfitState(): CurrentOutfitState {
    return {
      event: 'tet',
      color: this.currentColor,
      colorName: this.currentColorName,
      garment: this.currentGarment,
      accessory: this.currentAccessory,
      pattern: null,
      genzActive: this.currentStyle === 'DUONG_DAI'
    };
  }

  /**
   * 1. Điều hướng 4 Tabs ở Bento Sheet (Màu sắc, Phụ kiện, Kiểu tóc, Phong cách)
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
   * 2. Tùy chọn Màu sắc (5 vòng tròn màu)
   */
  private setupColorOptions(): void {
    const colorSwatches = document.querySelectorAll('.sheet-color-circle');
    colorSwatches.forEach((swatch) => {
      swatch.addEventListener('click', (e) => {
        Sound.playClick();
        const el = e.currentTarget as HTMLElement;
        const colorHex = el.dataset.color || '#F4C9D6';
        const colorName = el.dataset.name || 'Hồng Phấn Sen';

        colorSwatches.forEach((s) => s.classList.remove('active'));
        el.classList.add('active');

        this.setFabricColor(colorHex, colorName);
      });
    });
  }

  /**
   * 3. Tùy chọn Phụ kiện (5 thẻ nhỏ)
   */
  private setupAccessoryOptions(): void {
    const accCards = document.querySelectorAll('[data-accessory]');
    accCards.forEach((card) => {
      card.addEventListener('click', (e) => {
        Sound.playChime();
        const el = e.currentTarget as HTMLElement;
        const accKey = el.dataset.accessory || 'QUAT_GIAY';

        accCards.forEach((c) => c.classList.remove('active'));
        el.classList.add('active');

        this.setAccessory(accKey);
      });
    });
  }

  /**
   * 4. Tùy chọn Kiểu tóc (4 thẻ nhỏ)
   */
  private setupHairstyleOptions(): void {
    const hairCards = document.querySelectorAll('[data-hair]');
    hairCards.forEach((card) => {
      card.addEventListener('click', (e) => {
        Sound.playClick();
        const el = e.currentTarget as HTMLElement;
        const hairKey = el.dataset.hair || 'BUI_TRAM';

        hairCards.forEach((c) => c.classList.remove('active'));
        el.classList.add('active');

        this.setHairstyle(hairKey);
      });
    });
  }

  /**
   * 5. Tùy chọn Phong cách (4 thẻ nhỏ)
   */
  private setupStyleOptions(): void {
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
  }

  /**
   * Cập nhật màu sắc tà áo tức thì lên SVG
   */
  public setFabricColor(colorHex: string, colorName?: string): void {
    this.currentColor = colorHex;
    if (colorName) this.currentColorName = colorName;

    // Cập nhật các element SVG của Áo Ngũ Thân
    const nguthanBody = document.getElementById('nguthan-body-fill');
    const nguthanLeft = document.getElementById('nguthan-left-sleeve');
    const nguthanRight = document.getElementById('nguthan-right-sleeve');
    const collarOuter = document.getElementById('collar-outer');

    if (nguthanBody) nguthanBody.setAttribute('fill', colorHex);
    if (nguthanLeft) nguthanLeft.setAttribute('fill', colorHex);
    if (nguthanRight) nguthanRight.setAttribute('fill', colorHex);
    if (collarOuter) collarOuter.setAttribute('fill', colorHex);

    // Cập nhật các element SVG của Áo Bà Ba
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

    // Đồng bộ trạng thái active của vòng tròn màu
    document.querySelectorAll('.sheet-color-circle').forEach((swatch) => {
      const el = swatch as HTMLElement;
      if (el.dataset.color?.toLowerCase() === colorHex.toLowerCase()) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    this.updateDesktopGuidance();
  }

  /**
   * Cập nhật phụ kiện tức thì lên SVG
   */
  public setAccessory(accessory: string, _skipAICall?: boolean): void {
    this.currentAccessory = accessory;

    const fan = document.getElementById('acc-fan');
    const scarf = document.getElementById('acc-scarf');
    const hairpin = document.getElementById('acc-hairpin');
    const pouch = document.getElementById('acc-pouch');

    if (fan) fan.style.display = accessory === 'QUAT_GIAY' ? 'block' : 'none';
    if (scarf) scarf.style.display = accessory === 'KHAN_RAN' ? 'block' : 'none';
    if (hairpin) hairpin.style.display = accessory === 'TRAM_GOM' ? 'block' : 'none';
    if (pouch) pouch.style.display = accessory === 'TUI_GAM' ? 'block' : 'none';

    document.querySelectorAll('[data-accessory]').forEach((card) => {
      const el = card as HTMLElement;
      if (el.dataset.accessory === accessory) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    this.updateDesktopGuidance();
  }

  /**
   * Cập nhật kiểu tóc tức thì lên SVG
   */
  public setHairstyle(hair: string): void {
    this.currentHairstyle = hair;

    const buiTram = document.getElementById('hair-bui-tram');
    const xoaDai = document.getElementById('hair-xoa-dai');
    const vanKhan = document.getElementById('hair-van-khan');
    const buocThap = document.getElementById('hair-buoc-thap');

    if (buiTram) buiTram.style.display = hair === 'BUI_TRAM' ? 'block' : 'none';
    if (xoaDai) xoaDai.style.display = hair === 'XOA_DAI' ? 'block' : 'none';
    if (vanKhan) vanKhan.style.display = hair === 'VAN_KHAN' ? 'block' : 'none';
    if (buocThap) buocThap.style.display = hair === 'BUOC_THAP' ? 'block' : 'none';

    document.querySelectorAll('[data-hair]').forEach((card) => {
      const el = card as HTMLElement;
      if (el.dataset.hair === hair) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }

  /**
   * Cập nhật phong cách tức thì lên SVG
   */
  public setStyle(style: string): void {
    this.currentStyle = style;

    const nguthanGroup = document.getElementById('garment-nguthan-group');
    const babaGroup = document.getElementById('garment-baba-group');
    const titleBadge = document.getElementById('current-garment-title');

    if (style === 'MOC_MAC') {
      this.currentGarment = 'AO_BA_BA';
      if (nguthanGroup) nguthanGroup.style.display = 'none';
      if (babaGroup) babaGroup.style.display = 'block';
      if (titleBadge) titleBadge.textContent = 'Áo Bà Ba Nam Bộ';
    } else {
      this.currentGarment = 'AO_NGU_THAN';
      if (nguthanGroup) nguthanGroup.style.display = 'block';
      if (babaGroup) babaGroup.style.display = 'none';
      if (titleBadge) {
        titleBadge.textContent =
          style === 'DUONG_DAI'
            ? 'Áo Ngũ Thân • Đương Đại'
            : style === 'LE_HOI'
            ? 'Áo Ngũ Thân • Lễ Hội'
            : 'Áo Ngũ Thân Lập Lĩnh';
      }
    }

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
   * Tương thích với router & swipe deck
   */
  public setGarment(garment: string): void {
    if (garment === 'AO_BA_BA') {
      this.setStyle('MOC_MAC');
    } else {
      this.setStyle('THANH_TAO');
    }
  }

  public callCulturalAI(
    _event: string,
    _color: string,
    _garment?: string,
    _accessory?: string
  ): void {
    // Tự động đồng bộ màu và phụ kiện
  }

  private applyAllVisuals(): void {
    this.setFabricColor(this.currentColor, this.currentColorName);
    this.setAccessory(this.currentAccessory);
    this.setHairstyle(this.currentHairstyle);
    this.setStyle(this.currentStyle);
    this.updateDesktopGuidance();
  }

  private updateDesktopGuidance(): void {
    const noteEl = document.getElementById('workshop-cultural-note');
    const statusEl = document.getElementById('workshop-guidance-status');
    if (!noteEl) return;

    if (this.currentGarment === 'AO_NGU_THAN') {
      if (this.currentAccessory === 'KHAN_RAN') {
        if (statusEl) {
          statusEl.textContent = '⚡ Phá Cách Gen Z';
          statusEl.style.color = '#C9A66B';
        }
        noteEl.textContent = `Tà ngũ thân ${this.currentColorName} kết hợp khăn rằn tạo phong vị thể nghiệm đương đại độc đáo.`;
      } else {
        if (statusEl) {
          statusEl.textContent = '✓ Chuẩn Mực Di Sản';
          statusEl.style.color = '#4A8577';
        }
        const accName =
          this.currentAccessory === 'QUAT_GIAY'
            ? 'quạt giấy thư pháp'
            : this.currentAccessory === 'TRAM_GOM'
            ? 'trâm gốm dát vàng'
            : this.currentAccessory === 'TUI_GAM'
            ? 'túi gấm hoa'
            : 'phom dáng tinh gọn';
        noteEl.textContent = `Tà ngũ thân ${this.currentColorName} kết hợp ${accName} tôn phong thái đoan trang, thanh nhã chuẩn mực.`;
      }
    } else {
      if (statusEl) {
        statusEl.textContent = '✓ Phong Vị Nam Bộ';
        statusEl.style.color = '#4A8577';
      }
      noteEl.textContent = `Áo bà ba xẻ tà ${this.currentColorName} mang vẻ đẹp bình dị, mộc mạc và gần gũi với nhịp sống phương Nam.`;
    }
  }
}

export const garmentEngine = new GarmentEngine();
