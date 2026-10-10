import { WardrobeItem, DiscoveryOutfit } from '../types/index.ts';
import { Sound } from '../audio/sound.ts';
import { preferenceEngine } from './preferenceLearning.ts';
import { assetConfig } from '../config/assetConfig.ts';
import { CURATED_18_OUTFITS } from '../data/curatedOutfits.ts';

export class WardrobeManager {
  public savedWardrobe: WardrobeItem[] = [];
  private onRemixCallback: ((outfit: DiscoveryOutfit) => void) | null = null;

  public init(onRemix: (outfit: DiscoveryOutfit) => void): void {
    this.onRemixCallback = onRemix;
    this.loadWardrobe();
    this.setupUI();
  }

  public loadWardrobe(): void {
    try {
      const raw = localStorage.getItem('viet_y_wardrobe');
      if (raw) {
        const parsed: WardrobeItem[] = JSON.parse(raw);
        // Đồng bộ lại URL ảnh CDN và Prompt mới nhất nếu bộ đồ thuộc danh sách 18 bộ Curated
        this.savedWardrobe = parsed.map((item) => {
          const matchingCurated = CURATED_18_OUTFITS.find(
            (c) => c.id === item.id || (c.cdn_id && c.cdn_id === item.cdn_id)
          );
          if (matchingCurated) {
            return {
              ...item,
              cdn_id: matchingCurated.cdn_id,
              cdn_image_path: matchingCurated.cdn_image_path,
              imageUrl: assetConfig.resolveAssetUrl(
                matchingCurated.cdn_image_path || matchingCurated.imageUrl || ''
              ),
              assembledPrompt: matchingCurated.assembledPrompt,
              garmentLabel: item.garmentLabel || matchingCurated.garmentLabel,
              accessoryLabels: item.accessoryLabels || matchingCurated.accessoryLabels,
              styles: item.styles || matchingCurated.styles,
              hairstyle: item.hairstyle || matchingCurated.hairstyle,
              creativityLevel:
                typeof item.creativityLevel === 'number'
                  ? item.creativityLevel
                  : matchingCurated.creativityLevel
            };
          }
          if (item.cdn_image_path) {
            return {
              ...item,
              imageUrl: assetConfig.resolveAssetUrl(item.cdn_image_path)
            };
          }
          return item;
        });
        localStorage.setItem('viet_y_wardrobe', JSON.stringify(this.savedWardrobe));
      }
    } catch {
      this.savedWardrobe = [];
    }
    this.updateWardrobeUI();
  }

  public saveWardrobeOutfit(outfit: DiscoveryOutfit): void {
    if (!outfit) return;
    const exists = this.savedWardrobe.some((item) => item.id === outfit.id);
    if (!exists) {
      this.savedWardrobe.unshift({
        ...outfit,
        savedAt: new Date().toLocaleDateString('vi-VN')
      });
      try {
        localStorage.setItem('viet_y_wardrobe', JSON.stringify(this.savedWardrobe));
      } catch {}
      this.updateWardrobeUI();
      this.showToast(`❤️ Đã lưu "${outfit.title}" vào Tủ Đồ Yêu Thích!`);
    } else {
      this.showToast(`✨ "${outfit.title}" đã có sẵn trong Tủ Đồ.`);
    }
  }

  public removeWardrobeOutfit(outfitId: string): void {
    this.savedWardrobe = this.savedWardrobe.filter((item) => item.id !== outfitId);
    try {
      localStorage.setItem('viet_y_wardrobe', JSON.stringify(this.savedWardrobe));
    } catch {}
    this.updateWardrobeUI();
    Sound.playClick();
  }

  public updateWardrobeUI(): void {
    const countEl1 = document.getElementById('wardrobe-count');
    const countEl2 = document.getElementById('discover-wardrobe-count');
    const listEl = document.getElementById('wardrobe-list');
    const emptyEl = document.getElementById('wardrobe-empty-state');

    const count = this.savedWardrobe.length;
    if (countEl1) countEl1.textContent = count.toString();
    if (countEl2) countEl2.textContent = count.toString();

    if (!listEl || !emptyEl) return;

    if (count === 0) {
      listEl.innerHTML = '';
      emptyEl.classList.add('show');
      return;
    }

    emptyEl.classList.remove('show');
    listEl.innerHTML = '';

    this.savedWardrobe.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'wardrobe-card';
      const score = preferenceEngine.calculateOutfitScore(item);
      const matchPct = Math.min(99, Math.max(65, Math.round(70 + score * 4)));
      const rawThumbPath = item.cdn_image_path || item.imageUrl || '';
      const resolvedThumb = assetConfig.resolveAssetUrl(rawThumbPath);
      const fallbackThumb = assetConfig.resolveRawGithubUrl(rawThumbPath);
      const shortGarmentName =
        item.garmentLabel ||
        (item.garment === 'AO_NGU_THAN'
          ? 'Áo Ngũ Thân'
          : item.garment === 'AO_TAC'
            ? 'Áo Tấc'
            : item.garment === 'AO_NHAT_BINH'
              ? 'Áo Nhật Bình'
              : item.garment === 'AO_TU_THAN'
                ? 'Áo Tứ Thân'
                : item.garment === 'AO_DAI_LEMUR'
                  ? 'Áo Dài Lemur'
                  : 'Áo Bà Ba');

      card.innerHTML = `
        <div class="wardrobe-card-thumb" style="position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; background: rgba(74, 133, 119, 0.08); border-radius: 8px; width: 64px; height: 80px; flex-shrink: 0;">
          ${resolvedThumb ? `<img src="${resolvedThumb}" data-fallback-src="${fallbackThumb}" alt="${item.title}" class="wardrobe-thumb-img" style="width: 100%; height: 100%; object-fit: cover;" onerror="if (this.dataset.fallbackSrc && this.src !== this.dataset.fallbackSrc) { this.src = this.dataset.fallbackSrc; return; } this.style.display='none'; const ph = this.parentElement.querySelector('.wardrobe-thumb-placeholder'); if (ph) ph.style.display='flex';" />` : ''}
          <div class="wardrobe-thumb-placeholder" style="display: ${resolvedThumb ? 'none' : 'flex'}; width: 100%; height: 100%; align-items: center; justify-content: center;">
            <span style="font-size: 1.4rem; opacity: 0.45;">🏛️</span>
          </div>
        </div>
        <div class="wardrobe-card-info">
          <h4 class="wardrobe-card-title">${item.title}</h4>
          <div class="wardrobe-card-meta">
            <span class="wardrobe-card-color-dot" style="background:${item.color};"></span>
            <span>${item.colorName}</span>
            <span>•</span>
            <span>${shortGarmentName}</span>
          </div>
          <div class="wardrobe-card-match">🎯 ${matchPct}% Hợp Gu</div>
        </div>
        <div class="wardrobe-card-actions">
          <button type="button" class="btn-wardrobe-remix" data-remix-id="${item.id}" title="Chuyển về Xưởng Phối">
            <span>🔄</span> Remix
          </button>
          <button type="button" class="btn-wardrobe-del" data-del-id="${item.id}" title="Xóa khỏi Tủ đồ">
            Bỏ lưu
          </button>
        </div>
      `;

      card.querySelector('[data-remix-id]')?.addEventListener('click', () => {
        this.closeWardrobe();
        if (this.onRemixCallback) {
          this.onRemixCallback(item);
        }
      });

      card.querySelector('[data-del-id]')?.addEventListener('click', () => {
        this.removeWardrobeOutfit(item.id);
      });

      listEl.appendChild(card);
    });
  }

  public openWardrobe(): void {
    Sound.playClick();
    const drawer = document.getElementById('wardrobe-drawer');
    const backdrop = document.getElementById('wardrobe-backdrop');
    if (drawer) drawer.classList.add('open');
    if (backdrop) backdrop.classList.add('active');
  }

  public closeWardrobe(): void {
    const drawer = document.getElementById('wardrobe-drawer');
    const backdrop = document.getElementById('wardrobe-backdrop');
    if (drawer) drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');
  }

  private setupUI(): void {
    const btnOpen = document.getElementById('btn-open-wardrobe');
    const btnDiscoverOpen = document.getElementById('btn-discover-wardrobe');
    const btnClose = document.getElementById('btn-close-wardrobe');
    const backdrop = document.getElementById('wardrobe-backdrop');

    btnOpen?.addEventListener('click', () => this.openWardrobe());
    btnDiscoverOpen?.addEventListener('click', () => this.openWardrobe());
    btnClose?.addEventListener('click', () => this.closeWardrobe());
    backdrop?.addEventListener('click', () => this.closeWardrobe());
  }

  private showToast(msg: string): void {
    const toast = document.getElementById('pref-sync-toast');
    const msgEl = document.getElementById('pref-sync-toast-msg');
    if (!toast) return;
    if (msgEl) msgEl.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }
}

export const wardrobeManager = new WardrobeManager();
