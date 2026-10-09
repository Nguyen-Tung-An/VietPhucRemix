import { Sound } from '../audio/sound.ts';
import { wardrobeManager } from '../discover/wardrobeManager.ts';
import { appRouter } from '../navigation/router.ts';
import { WardrobeItem } from '../types/index.ts';
import { feedbackState } from '../services/feedbackState.ts';
import { tailorJourneyEngine } from '../journey/tailorJourneyEngine.ts';
import { getCulturalTruth, getColorCulturalAnalysis } from '../data/culturalTruths.ts';
import { assetConfig } from '../config/assetConfig.ts';

export class LookbookEngine {
  public init(): void {
    this.setupUI();
    this.setupDetailModalEvents();
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

    // 3. Nút So Sánh trên tiêu đề Lookbook
    const btnCompareHead = document.getElementById('btn-lookbook-compare-head');
    btnCompareHead?.addEventListener('click', () => {
      Sound.playClick();
      const outfits = wardrobeManager.savedWardrobe;
      if (outfits.length === 0) {
        appRouter.showToast('⚠️ Lookbook của bạn chưa có bộ đồ nào đã lưu!');
        return;
      }
      if (outfits.length === 1) {
        appRouter.showToast('💡 Bạn cần lưu ít nhất 2 bộ đồ trong Lookbook để tiến hành so sánh đối chiếu!');
        return;
      }
      appRouter.openCompare(`wardrobe-${outfits[0].id}`, `wardrobe-${outfits[1].id}`);
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
    const btnCompareHead = document.getElementById('btn-lookbook-compare-head');

    const outfits = wardrobeManager.savedWardrobe;
    const count = outfits.length;

    // 1. Cập nhật số lượng bộ đồ đã lưu
    if (countBadge) {
      countBadge.textContent = `${count} bộ đồ đã lưu`;
    }

    // Cập nhật trạng thái nút So Sánh trong header Lookbook
    if (btnCompareHead) {
      if (count === 0) {
        btnCompareHead.style.display = 'none';
      } else {
        btnCompareHead.style.display = 'inline-flex';
        if (count < 2) {
          btnCompareHead.style.opacity = '0.55';
          btnCompareHead.title = 'Lưu thêm 1 bộ nữa vào Lookbook để bắt đầu so sánh';
        } else {
          btnCompareHead.style.opacity = '1';
          btnCompareHead.title = `So sánh giữa ${count} bộ đồ đã lưu trong Lookbook`;
        }
      }
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
          <span>📍</span>
          <span>Phù hợp: ${item.bestOccasion || item.eventLabel || 'Dạo phố Tết'}</span>
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
          <button type="button" class="btn-card-detail" data-detail-id="${item.id}" title="Xem chi tiết bộ đồ">
            <span>🔍 Chi Tiết</span>
          </button>
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

      // 3. Phản hồi thị giác khi chạm và MỞ MODAL CHI TIẾT ĐẦY ĐỦ CỦA BỘ ĐỒ
      card.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        // Tránh trigger khi bấm nút Xóa hoặc nút Remix trực tiếp
        if (target.closest('.btn-card-remove') || target.closest('.btn-card-remix')) {
          return;
        }
        Sound.playClick();
        this.openOutfitDetailModal(item);
      });

      // Bắt sự kiện nút Chi Tiết
      const detailBtn = card.querySelector(`[data-detail-id="${item.id}"]`);
      detailBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        Sound.playClick();
        this.openOutfitDetailModal(item);
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

  private currentDetailOutfit: WardrobeItem | null = null;

  private setupDetailModalEvents(): void {
    const modal = document.getElementById('lookbook-detail-modal');
    const btnClose = document.getElementById('btn-close-lookbook-detail');
    const btnRemix = document.getElementById('btn-detail-modal-remix');
    const btnCompare = document.getElementById('btn-detail-modal-compare');
    const btnTailor = document.getElementById('btn-detail-modal-tailor');
    const btnCopyPrompt = document.getElementById('btn-copy-lookbook-prompt');

    btnClose?.addEventListener('click', () => {
      this.closeOutfitDetailModal();
    });

    modal?.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeOutfitDetailModal();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal?.classList.contains('active')) {
        this.closeOutfitDetailModal();
      }
    });

    btnRemix?.addEventListener('click', () => {
      if (!this.currentDetailOutfit) return;
      const outfit = this.currentDetailOutfit;
      this.closeOutfitDetailModal();
      appRouter.remixToWorkshop(outfit);
    });

    btnCompare?.addEventListener('click', () => {
      if (!this.currentDetailOutfit) return;
      const outfitId = this.currentDetailOutfit.id;
      this.closeOutfitDetailModal();
      appRouter.openCompare(`wardrobe-${outfitId}`);
    });

    btnTailor?.addEventListener('click', () => {
      if (!this.currentDetailOutfit) return;
      const { garment, title, colorName } = this.currentDetailOutfit;
      this.closeOutfitDetailModal();
      tailorJourneyEngine.openJourney(garment, title, colorName);
    });

    btnCopyPrompt?.addEventListener('click', () => {
      const textarea = document.getElementById('lookbook-detail-prompt-textarea') as HTMLTextAreaElement | null;
      const hint = document.getElementById('lookbook-detail-copy-hint');
      if (textarea && textarea.value) {
        navigator.clipboard.writeText(textarea.value).then(() => {
          Sound.playChime();
          if (hint) {
            hint.style.display = 'inline';
            setTimeout(() => {
              hint.style.display = 'none';
            }, 2500);
          }
          appRouter.showToast('📋 Đã sao chép câu Prompt Gemini vào clipboard!');
        });
      }
    });
  }

  public openOutfitDetailModal(item: WardrobeItem): void {
    this.currentDetailOutfit = item;
    const modal = document.getElementById('lookbook-detail-modal');
    if (!modal) return;

    Sound.playChime();

    const truth = getCulturalTruth(item.garment);
    const colorAnalysis = getColorCulturalAnalysis(item.color, item.garment, item.event);

    // Tiêu đề & ngày lưu
    const titleEl = document.getElementById('lookbook-detail-title');
    const headingEl = document.getElementById('lookbook-detail-heading');
    const savedAtEl = document.getElementById('lookbook-detail-saved-at');
    const descEl = document.getElementById('lookbook-detail-desc');
    const occasionEl = document.getElementById('lookbook-detail-occasion-tag');

    if (titleEl) titleEl.textContent = item.title;
    if (headingEl) headingEl.textContent = item.title;
    if (savedAtEl) savedAtEl.textContent = `Đã lưu: ${item.savedAt || 'Gần đây'}`;
    if (descEl) descEl.textContent = item.desc || `Bộ phối ${item.colorName || 'Sắc Lụa'} theo phong vị đương đại Lụa Thanh.`;
    if (occasionEl) occasionEl.textContent = `🏷️ ${item.bestOccasion || item.eventLabel || 'Dạo Phố Tết'}`;

    // Hình ảnh
    const imgEl = document.getElementById('lookbook-detail-img') as HTMLImageElement | null;
    const phEl = document.getElementById('lookbook-detail-img-ph');
    const imageSrc = item.imageUrl || assetConfig.getGarmentImageUrl(item.garment);

    if (imgEl) {
      imgEl.src = imageSrc;
      imgEl.style.display = 'block';
      if (phEl) phEl.style.display = 'none';
      imgEl.onerror = () => {
        imgEl.style.display = 'none';
        if (phEl) phEl.style.display = 'flex';
      };
    }

    // Sắc lụa & Ngũ hành
    const dotEl = document.getElementById('lookbook-detail-color-dot');
    const colorNameEl = document.getElementById('lookbook-detail-color-name');
    const elementEl = document.getElementById('lookbook-detail-color-element');

    if (dotEl) dotEl.style.backgroundColor = item.color || '#F4C9D6';
    if (colorNameEl) colorNameEl.textContent = `${item.colorName || 'Sắc Lụa'} (${item.color || ''})`;
    if (elementEl) elementEl.textContent = `${colorAnalysis.five_elements_element || 'Ngũ Hành'} • ${colorAnalysis.harmony_title}`;

    // Phụ kiện & Kiểu tóc
    const accListEl = document.getElementById('lookbook-detail-acc-list');
    const hairEl = document.getElementById('lookbook-detail-hair');
    const allAcc = item.accessories && item.accessories.length > 0
      ? item.accessories
      : (item.accessory ? [item.accessory] : ['Quạt Giấy']);

    if (accListEl) {
      accListEl.innerHTML = allAcc
        .map((acc) => `<span class="matrix-badge-pill">❖ ${acc.replace(/_/g, ' ')}</span>`)
        .join('');
    }

    if (hairEl) {
      hairEl.textContent = item.hairstyle || item.custom_hairstyle || 'Tóc búi cao thanh thoát';
    }

    // Tri thức văn hóa & Lịch sử
    const storyEl = document.getElementById('lookbook-detail-cultural-story');
    const citationsEl = document.getElementById('lookbook-detail-citations');

    if (storyEl) {
      storyEl.innerHTML = `
        <strong>${truth.name} (${truth.historicalEra}):</strong> ${item.culturalStory || truth.culturalSignificance}
        <br/><span style="color: #4A8577; font-size: 0.78rem;">• Xuất xứ cội nguồn: ${truth.originRegion === 'BAC_BO' ? 'Bắc Bộ' : truth.originRegion === 'TRUNG_BO' ? 'Trung Bộ / Cố Đô Huế' : 'Nam Bộ'}</span>
      `;
    }

    if (citationsEl) {
      const citations = item.citations || [
        {
          title: truth.sourceTitle,
          author_or_institution: truth.authorOrInstitution,
          url: truth.sourceUrl
        }
      ];
      citationsEl.innerHTML = citations
        .map(
          (c, idx) => `
          <div style="margin-top: 4px;">
            [${idx + 1}] <strong>${c.title}</strong> — <em>${(c as any).author_or_institution || (c as any).authorOrInstitution || ''}</em>
            <a href="${c.url}" target="_blank" rel="noopener noreferrer" style="color: #4A8577; text-decoration: underline; margin-left: 6px;">Nguồn gốc ↗</a>
          </div>
        `
        )
        .join('');
    }

    // Khối Prompt AI (nếu bộ đồ có prompt được tạo từ AI)
    const promptSection = document.getElementById('lookbook-detail-prompt-section');
    const promptTextarea = document.getElementById('lookbook-detail-prompt-textarea') as HTMLTextAreaElement | null;

    if (item.assembledPrompt && promptSection && promptTextarea) {
      promptSection.style.display = 'block';
      promptTextarea.value = item.assembledPrompt;
    } else if (promptSection) {
      promptSection.style.display = 'none';
    }

    modal.style.display = 'flex';
    modal.classList.add('active');
    modal.classList.add('show');
  }

  public closeOutfitDetailModal(): void {
    Sound.playClick();
    const modal = document.getElementById('lookbook-detail-modal');
    if (modal) {
      modal.style.display = 'none';
      modal.classList.remove('active');
      modal.classList.remove('show');
    }
    this.currentDetailOutfit = null;
  }
}

export const lookbookEngine = new LookbookEngine();
