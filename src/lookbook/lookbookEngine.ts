import { Sound } from '../audio/sound.ts';
import { wardrobeManager } from '../discover/wardrobeManager.ts';
import { appRouter } from '../navigation/router.ts';
import { WardrobeItem } from '../types/index.ts';
import { feedbackState } from '../services/feedbackState.ts';
import { tailorJourneyEngine } from '../journey/tailorJourneyEngine.ts';
import { getCulturalTruth, getColorCulturalAnalysis } from '../data/culturalTruths.ts';
import { assetConfig } from '../config/assetConfig.ts';
import { assembleFashionPrompt } from '../workshop/promptEngine.ts';

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
        appRouter.showToast('Rương Gấm của bạn hiện chưa có tác phẩm nào được lưu giữ.');
        return;
      }
      if (outfits.length === 1) {
        appRouter.showToast('Bạn hãy dệt và lưu ít nhất 2 tà áo trong Rương Gấm để bắt đầu so sánh nhé.');
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
      const isWarning = (item as any).warning_level === 'WARNING' || (item as any).is_culturally_accurate === false;
      const card = document.createElement('article');
      card.className = `lookbook-card card-base ${isWarning ? 'cultural-warning' : ''}`;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `Xem chi tiết ${item.title}`);

      const rawPath = item.cdn_image_path || item.imageUrl || '';
      const resolvedThumbUrl = assetConfig.resolveAssetUrl(rawPath);
      const fallbackRawUrl = assetConfig.resolveRawGithubUrl(rawPath);

      card.innerHTML = `
        <div class="lookbook-card-top-tag">
          <span>Phù hợp: ${item.bestOccasion || item.eventLabel || 'Dạo phố Tết'}</span>
        </div>

        <div class="lookbook-card-thumb-box" style="position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; background: rgba(74, 133, 119, 0.06); border-radius: 12px; width: 100%; height: 180px;">
          ${item.imageUrl ? `
            <img src="${item.imageUrl}" alt="${item.title}" class="lookbook-card-img" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;" onerror="this.style.display='none'; const ph = this.parentElement.querySelector('.lookbook-card-no-img'); if (ph) ph.style.display='flex';" />
          ` : ''}
          <div class="lookbook-card-no-img" style="display: ${item.imageUrl ? 'none' : 'flex'}; flex-direction: column; align-items: center; justify-content: center; gap: 8px; text-align: center; padding: 16px; width: 100%; height: 100%;">
            <img src="https://cdn.jsdelivr.net/gh/Nguyen-Tung-An/llgv-assets-demo@main/public/element/empty-loom.webp" alt="Khung dệt" style="width: 72px; height: 72px; object-fit: contain; opacity: 0.8;" />
            <span style="font-family: var(--font-body); font-size: 0.78rem; color: var(--color-text-muted); line-height: 1.4;">Tổ hợp đang đợi dệt hình minh họa</span>
          </div>
        </div>

        <div class="lookbook-card-meta">
          <h4 class="lookbook-card-name">${item.title}</h4>
          <span class="lookbook-card-desc">Sắc ${item.colorName || 'Lụa'} • ${item.savedAt || 'Mới lưu'}</span>
        </div>

        <div class="lookbook-card-actions">
          <button type="button" class="btn-card-detail" data-detail-id="${item.id}" title="Xem chi tiết bộ đồ">
            Chi Tiết
          </button>
          <button type="button" class="btn-card-remix" data-remix-id="${item.id}" title="Phối lại trang phục này trong Khung Dệt">
            Phối Lại
          </button>
          <button type="button" class="btn-card-remove" data-remove-id="${item.id}" title="Gỡ khỏi Rương Gấm" aria-label="Gỡ tác phẩm">
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
        title: 'Lụa Là Gấm Vóc — Rương Gấm',
        text: `Ghé xem ${count} tà áo cổ phục đương đại tôi vừa lưu giữ trong Rương Gấm trên Lụa Là Gấm Vóc nhé!`,
        url: window.location.href
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        navigator.share(shareData).catch(() => {});
      } else {
        // Sao chép liên kết vào Clipboard
        try {
          navigator.clipboard.writeText(window.location.href);
        } catch {}
        appRouter.showToast('Đã sao chép liên kết chia sẻ Rương Gấm của bạn.');
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
          appRouter.showToast('Đã sao chép câu lệnh tạo ảnh vào bộ nhớ tạm.');
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
    if (occasionEl) occasionEl.textContent = item.bestOccasion || item.eventLabel || 'Dạo Phố Tết';

    // Hình ảnh (Ưu tiên giải quyết qua CDN GitHub, dự phòng GitHub Raw nếu cache jsDelivr chưa cập nhật)
    const imgEl = document.getElementById('lookbook-detail-img') as HTMLImageElement | null;
    const phEl = document.getElementById('lookbook-detail-img-ph');
    const rawDetailPath = item.cdn_image_path || item.imageUrl || '';
    const primaryCdnSrc = assetConfig.resolveAssetUrl(rawDetailPath);
    const fallbackRawSrc = assetConfig.resolveRawGithubUrl(rawDetailPath);

    if (imgEl) {
      if (primaryCdnSrc) {
        imgEl.style.display = 'block';
        if (phEl) phEl.style.display = 'none';
        assetConfig.attachSafeImageLoad(imgEl, primaryCdnSrc, fallbackRawSrc, () => {
          imgEl.style.display = 'none';
          if (phEl) phEl.style.display = 'flex';
        });
      } else {
        imgEl.style.display = 'none';
        if (phEl) phEl.style.display = 'flex';
      }
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
    const baseAccDisplay =
      item.accessoryLabels && item.accessoryLabels.length > 0
        ? item.accessoryLabels
        : item.accessories && item.accessories.length > 0
          ? item.accessories
          : item.accessoryLabel
            ? [item.accessoryLabel]
            : item.accessory
              ? [item.accessory]
              : ['Quạt Giấy'];
    const allAcc = [
      ...baseAccDisplay,
      ...(item.custom_accessories || [])
    ];

    if (accListEl) {
      accListEl.innerHTML = allAcc
        .map((acc) => `<span class="matrix-badge-pill">${acc.replace(/_/g, ' ')}</span>`)
        .join('');
    }

    if (hairEl) {
      hairEl.textContent = item.custom_hairstyle || item.hairstyle || 'Tóc búi cao thanh thoát';
    }

    // Input cấu thành & Hồ sơ người mặc
    const styleTagsEl = document.getElementById('lookbook-detail-style-tags');
    const creativityEl = document.getElementById('lookbook-detail-creativity');
    const profileEl = document.getElementById('lookbook-detail-profile');
    const cdnIdEl = document.getElementById('lookbook-detail-cdn-id');
    const cdnPathEl = document.getElementById('lookbook-detail-cdn-path');

    if (styleTagsEl) {
      const styles = (item.styles && item.styles.length > 0)
        ? item.styles.join(', ')
        : (item.style_mode || item.mood || 'Thanh tao cung đình');
      styleTagsEl.textContent = styles;
    }

    if (creativityEl) {
      creativityEl.textContent = `${item.creativityLevel || 35}%`;
    }

    if (profileEl) {
      if (item.userProfile) {
        profileEl.textContent = `Chiều cao: ${item.userProfile.height || '165cm'}, Cân nặng: ${item.userProfile.weight || '50kg'}, Dáng: ${item.userProfile.shape || 'Thon thả'}, Da: ${item.userProfile.skin || 'Sáng hồng'}`;
      } else {
        profileEl.textContent = 'Phom dáng thiếu nữ Việt thanh thoát, tôn nét duyên tự nhiên';
      }
    }

    if (cdnIdEl) {
      cdnIdEl.textContent = item.cdn_id || item.id || 'garment_curated_01';
    }

    if (cdnPathEl) {
      cdnPathEl.textContent = item.cdn_image_path || `/images/garments/curated/${item.cdn_id || item.id}.webp`;
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

    // Khối Prompt AI (Luôn đảm bảo có Prompt chuẩn xác cho mọi bộ trang phục)
    const promptSection = document.getElementById('lookbook-detail-prompt-section');
    const promptTextarea = document.getElementById('lookbook-detail-prompt-textarea') as HTMLTextAreaElement | null;

    const computedPrompt =
      item.assembledPrompt ||
      assembleFashionPrompt(
        {
          garment: item.garment,
          garmentLabel: item.garmentLabel,
          color: item.color,
          colorName: item.colorName,
          styles: item.styles,
          style_mode: item.style_mode,
          accessories: item.accessories,
          accessoryLabels: item.accessoryLabels,
          custom_accessories: item.custom_accessories,
          accessory: item.accessory || 'QUAT_GIAY',
          hairstyle: item.hairstyle,
          custom_hairstyle: item.custom_hairstyle,
          creativityLevel: item.creativityLevel,
          event: item.event,
          bestOccasion: item.bestOccasion,
          eventLabel: item.eventLabel,
          patternName: item.patternName
        },
        item.userProfile
      );

    if (promptSection && promptTextarea) {
      promptSection.style.display = 'block';
      promptTextarea.value = computedPrompt;
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
