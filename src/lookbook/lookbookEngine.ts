import { Sound } from '../audio/sound.ts';
import { wardrobeManager } from '../discover/wardrobeManager.ts';
import { appRouter } from '../navigation/router.ts';
import { WardrobeItem } from '../types/index.ts';
import { feedbackState } from '../services/feedbackState.ts';

export class LookbookEngine {
  public init(): void {
    this.setupUI();
    this.renderLookbook();
  }

  /**
   * Thiết lập các sự kiện tương tác
   */
  private setupUI(): void {
    // 1. Nút nổi chia sẻ ở góc dưới phải (Floating Button)
    const btnShare = document.getElementById('btn-lookbook-share');
    btnShare?.addEventListener('click', () => {
      this.handleShareLookbook();
    });

    // 2. Nút quay lại màn hình khám phá từ Empty State
    const btnEmptyDiscover = document.getElementById('btn-empty-lookbook-discover');
    btnEmptyDiscover?.addEventListener('click', () => {
      Sound.playClick();
      appRouter.switchTab('discover');
    });
  }

  /**
   * Render danh sách bộ đồ trong Lookbook hoặc hiển thị Trạng Thái Rỗng
   */
  public renderLookbook(): void {
    const gridEl = document.getElementById('lookbook-grid');
    const emptyEl = document.getElementById('lookbook-empty-state');
    const countBadge = document.getElementById('lookbook-count-badge');
    const shareBtn = document.getElementById('btn-lookbook-share');

    const outfits = wardrobeManager.savedWardrobe;
    const count = outfits.length;

    // 1. Cập nhật số lượng bộ đồ đã lưu
    if (countBadge) {
      countBadge.textContent = `${count} bộ đồ đã lưu`;
    }

    if (!gridEl || !emptyEl) return;

    // 5. TRẠNG THÁI RỖNG (Empty State)
    if (count === 0) {
      gridEl.innerHTML = '';
      gridEl.style.display = 'none';
      emptyEl.classList.add('show');
      if (shareBtn) shareBtn.style.display = 'none';
      return;
    }

    // Hiển thị lưới
    emptyEl.classList.remove('show');
    gridEl.style.display = 'grid';
    gridEl.innerHTML = '';
    if (shareBtn) shareBtn.style.display = 'flex';

    // 2. Render từng ô bộ đồ đã lưu (Bo góc 16px, thẻ kính mờ)
    outfits.forEach((item: WardrobeItem) => {
      const card = document.createElement('article');
      card.className = 'lookbook-card card-base';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `Xem chi tiết ${item.title}`);

      // Sinh Croquis SVG chuẩn Lụa Thanh cho từng ô
      const isNguThan = item.garment === 'AO_NGU_THAN';
      const croquisSvg = isNguThan
        ? this.generateNguThanSvg(item.color)
        : this.generateBaBaSvg(item.color);

      card.innerHTML = `
        <div class="lookbook-card-top-tag">
          <span>✨</span>
          <span>${item.eventLabel || 'Lụa Thanh'}</span>
        </div>

        <div class="lookbook-card-thumb-box">
          ${croquisSvg}
        </div>

        <div class="lookbook-card-meta">
          <h4 class="lookbook-card-name">${item.title}</h4>
          <span class="lookbook-card-desc">Sắc ${item.colorName || 'Lụa'} • ${item.savedAt || 'Mới lưu'}</span>
        </div>

        <div class="lookbook-card-actions">
          <button type="button" class="btn-card-remix" data-remix-id="${item.id}" title="Phối lại trang phục này trong Xưởng">
            <span>🎨 Remix</span>
          </button>
          <button type="button" class="btn-card-remove" data-remove-id="${item.id}" title="Xóa khỏi Lookbook" aria-label="Xóa bộ đồ">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      `;

      // 3. Phản hồi thị giác khi chạm (scale nhẹ xuống rồi trở lại)
      card.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        // Tránh trigger khi bấm nút Xóa hoặc nút Remix trực tiếp
        if (target.closest('.btn-card-remove') || target.closest('.btn-card-remix')) {
          return;
        }
        Sound.playClick();
        card.style.transform = 'scale(0.96)';
        setTimeout(() => {
          card.style.transform = '';
          appRouter.remixToWorkshop(item);
        }, 150);
      });

      // Bắt sự kiện nút Remix
      const remixBtn = card.querySelector(`[data-remix-id="${item.id}"]`);
      remixBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        Sound.playChime();
        appRouter.remixToWorkshop(item);
      });

      // Bắt sự kiện nút Xóa
      const removeBtn = card.querySelector(`[data-remove-id="${item.id}"]`);
      removeBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        wardrobeManager.removeWardrobeOutfit(item.id);
        this.renderLookbook();
      });

      gridEl.appendChild(card);
    });
  }

  /**
   * 4. Xử lý chia sẻ Lookbook qua Floating Button
   */
  private handleShareLookbook(): void {
    Sound.playChime();
    const count = wardrobeManager.savedWardrobe.length;

    feedbackState.showLoading({
      message: 'Đang chuẩn bị thiệp Lookbook...',
      submessage: `Tổng hợp ${count} bộ tơ lụa di sản để chia sẻ cùng bạn bè...`
    });

    setTimeout(() => {
      feedbackState.hideLoading();

      const shareData = {
        title: 'Việt Y Remix — Lookbook Lụa Thanh',
        text: `Ghé xem Lookbook ${count} bộ cổ phục tơ lụa đương đại tôi vừa phối trên Việt Y Remix nhé!`,
        url: window.location.href
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        navigator.share(shareData).catch(() => {});
      } else {
        // Sao chép liên kết vào Clipboard
        try {
          navigator.clipboard.writeText(window.location.href);
        } catch {}
        appRouter.showToast('✨ Đã sao chép liên kết chia sẻ Lookbook Lụa Thanh của bạn!');
      }
    }, 700);
  }

  /**
   * Sinh SVG Croquis Áo Ngũ Thân thu nhỏ tinh xảo
   */
  private generateNguThanSvg(colorHex: string): string {
    return `
      <svg class="lookbook-card-svg" viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="100" cy="120" rx="70" ry="90" fill="rgba(74, 133, 119, 0.08)" />
        <ellipse cx="100" cy="36" rx="14" ry="17" fill="#F9E2CD" stroke="#5E402D" stroke-width="1" />
        <path d="M 85,35 C 85,18 115,18 115,35 Z" fill="#1C2B26" />
        <!-- Quần trắng ngà -->
        <path d="M 86,140 L 78,215 L 96,215 L 98,140 Z" fill="#FAF7F0" stroke="#D3CDC2" stroke-width="1" />
        <path d="M 102,140 L 104,215 L 122,215 L 114,140 Z" fill="#FAF7F0" stroke="#D3CDC2" stroke-width="1" />
        <!-- Thân áo ngũ thân -->
        <path d="M 82,56 Q 100,66 118,56 L 132,150 L 68,150 Z" fill="${colorHex}" stroke="#1C2B26" stroke-width="1.3" />
        <!-- Tay chẽn -->
        <path d="M 82,58 L 56,95 L 68,100 L 86,76 Z" fill="${colorHex}" stroke="#1C2B26" stroke-width="1.2" />
        <path d="M 118,58 L 144,95 L 132,100 L 114,76 Z" fill="${colorHex}" stroke="#1C2B26" stroke-width="1.2" />
        <!-- Cổ lập lĩnh & Cúc vàng 3D -->
        <rect x="91" y="46" width="18" height="12" rx="2" fill="${colorHex}" stroke="#1C2B26" stroke-width="1.2" />
        <path d="M 100,58 Q 110,72 114,90 L 114,140" fill="none" stroke="#1C2B26" stroke-width="1.2" />
        <circle cx="100" cy="58" r="2.2" fill="#C9A66B" stroke="#7A5338" stroke-width="0.5" />
        <circle cx="107" cy="68" r="2.2" fill="#C9A66B" stroke="#7A5338" stroke-width="0.5" />
        <circle cx="112" cy="80" r="2.2" fill="#C9A66B" stroke="#7A5338" stroke-width="0.5" />
      </svg>
    `;
  }

  /**
   * Sinh SVG Croquis Áo Bà Ba thu nhỏ tinh xảo
   */
  private generateBaBaSvg(colorHex: string): string {
    return `
      <svg class="lookbook-card-svg" viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="100" cy="120" rx="70" ry="90" fill="rgba(74, 133, 119, 0.08)" />
        <ellipse cx="100" cy="36" rx="14" ry="17" fill="#F9E2CD" stroke="#5E402D" stroke-width="1" />
        <path d="M 86,36 C 86,18 114,18 114,36 Z" fill="#1C2B26" />
        <!-- Quần suông đen rêu -->
        <path d="M 86,145 L 80,215 L 96,215 L 98,145 Z" fill="#1C2B26" />
        <path d="M 102,145 L 104,215 L 120,215 L 114,145 Z" fill="#1C2B26" />
        <!-- Thân áo bà ba xẻ tà -->
        <path d="M 82,56 Q 100,66 118,56 L 130,145 L 70,145 Z" fill="${colorHex}" stroke="#1C2B26" stroke-width="1.3" />
        <!-- Hàng cúc giữa -->
        <line x1="100" y1="62" x2="100" y2="142" stroke="#1C2B26" stroke-width="1.3" />
        <circle cx="100" cy="74" r="2" fill="#C9A66B" />
        <circle cx="100" cy="92" r="2" fill="#C9A66B" />
        <circle cx="100" cy="110" r="2" fill="#C9A66B" />
        <circle cx="100" cy="128" r="2" fill="#C9A66B" />
      </svg>
    `;
  }
}

export const lookbookEngine = new LookbookEngine();
