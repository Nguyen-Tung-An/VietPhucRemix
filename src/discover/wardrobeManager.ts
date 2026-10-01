import { WardrobeItem, DiscoveryOutfit } from '../types/index.ts';
import { Sound } from '../audio/sound.ts';
import { preferenceEngine } from './preferenceLearning.ts';

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
      if (raw) this.savedWardrobe = JSON.parse(raw);
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
      this.showToast(`❤️ Đã lưu "${outfit.title}" vào Tủ Đồ Yêu Thích! (+2 điểm Gu)`);
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

      card.innerHTML = `
        <div class="wardrobe-card-thumb">
          <svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="25" r="14" fill="#F7DCBF" />
            <path d="M 40,25 C 40,10 60,10 60,25 Z" fill="#1C1817" />
            <path d="M 38,40 Q 50,42 62,40 L 72,110 L 28,110 Z" fill="${item.color}" stroke="#121110" stroke-width="1.2" />
            ${
              item.garment === 'AO_NGU_THAN'
                ? `
              <path d="M 50,40 Q 56,48 60,60 L 60,95" fill="none" stroke="#121110" stroke-width="1" />
              <circle cx="54" cy="45" r="1.6" fill="#E5A93C" />
              <circle cx="57" cy="53" r="1.6" fill="#E5A93C" />
              <circle cx="59" cy="62" r="1.6" fill="#E5A93C" />
            `
                : `
              <line x1="50" y1="40" x2="50" y2="105" stroke="#121110" stroke-width="1" />
              <circle cx="50" cy="50" r="1.5" fill="#E5A93C" />
              <circle cx="50" cy="65" r="1.5" fill="#E5A93C" />
              <circle cx="50" cy="80" r="1.5" fill="#E5A93C" />
            `
            }
          </svg>
        </div>
        <div class="wardrobe-card-info">
          <h4 class="wardrobe-card-title">${item.title}</h4>
          <div class="wardrobe-card-meta">
            <span class="wardrobe-card-color-dot" style="background:${item.color};"></span>
            <span>${item.colorName}</span>
            <span>•</span>
            <span>${item.garment === 'AO_NGU_THAN' ? 'Ngũ Thân' : 'Bà Ba'}</span>
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
