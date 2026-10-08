import { Sound } from '../audio/sound.ts';
import { wardrobeManager } from '../discover/wardrobeManager.ts';
import { appRouter } from '../navigation/router.ts';
import { WardrobeItem } from '../types/index.ts';
import { feedbackState } from '../services/feedbackState.ts';
import { tailorJourneyEngine } from '../journey/tailorJourneyEngine.ts';

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

      card.innerHTML = `
        <div class="lookbook-card-top-tag">
          <span>✨</span>
          <span>${item.eventLabel || 'Lụa Thanh'}</span>
        </div>

        <div class="lookbook-card-thumb-box" style="position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; background: rgba(74, 133, 119, 0.06); border-radius: 12px; width: 100%; height: 180px;">
          ${item.imageUrl ? `
            <img src="${item.imageUrl}" alt="${item.title}" class="lookbook-card-img" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;" onerror="this.style.display='none'; const ph = this.parentElement.querySelector('.lookbook-card-no-img'); if (ph) ph.style.display='flex';" />
          ` : ''}
          <div class="lookbook-card-no-img" style="display: ${item.imageUrl ? 'none' : 'flex'}; flex-direction: column; align-items: center; justify-content: center; gap: 8px; text-align: center; padding: 16px; width: 100%; height: 100%;">
            <span style="font-size: 2.2rem; opacity: 0.4;">🏛️</span>
            <span style="font-family: var(--font-body); font-size: 0.78rem; color: var(--color-text-muted); line-height: 1.4;">Tổ hợp này chưa có ảnh minh họa demo</span>
          </div>
        </div>

        <div class="lookbook-card-meta">
          <h4 class="lookbook-card-name">${item.title}</h4>
          <span class="lookbook-card-desc">Sắc ${item.colorName || 'Lụa'} • ${item.savedAt || 'Mới lưu'}</span>
        </div>

        <div class="lookbook-card-actions">
          <button type="button" class="btn-card-remix" data-remix-id="${item.id}" title="Phối lại trang phục này trong Xưởng">
            <span>🎨 Remix</span>
          </button>
          <button type="button" class="btn-card-tailor" data-tailor-id="${item.id}" style="padding: 6px 10px; border-radius: 9999px; background: rgba(201,166,107,0.18); border: 1px solid rgba(201,166,107,0.35); color: #6B4E2E; font-size: 0.74rem; font-weight: 600; cursor: pointer;" title="Tìm tiệm may bộ này trên Google Maps">
            <span>📍 Tiệm May</span>
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
        if (target.closest('.btn-card-remove') || target.closest('.btn-card-remix') || target.closest('.btn-card-tailor')) {
          return;
        }
        Sound.playClick();
        card.style.transform = 'scale(0.96)';
        setTimeout(() => {
          card.style.transform = '';
          appRouter.remixToWorkshop(item);
        }, 150);
      });

      // Bắt sự kiện nút Tìm Tiệm May
      const tailorBtn = card.querySelector(`[data-tailor-id="${item.id}"]`);
      tailorBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        tailorJourneyEngine.openJourney(item.garment, item.title, item.colorName);
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
}

export const lookbookEngine = new LookbookEngine();
