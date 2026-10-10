import { CULTURAL_DATABASE } from '../data/culturalTruths.ts';
import { SIX_PLACEHOLDER_HERITAGE_PATTERNS } from '../workshop/patternEngine.ts';
import { DISCOVERY_OUTFITS_POOL } from '../discover/swipeEngine.ts';
import { assembleFashionPrompt } from '../workshop/promptEngine.ts';
import { Sound } from '../audio/sound.ts';
import { CurrentOutfitState } from '../types/index.ts';

export class AdminEngine {
  public init(): void {
    this.renderSystemOverview();
    this.renderGarmentsList();
    this.renderPatternsList();
    this.renderOutfitsList();
    this.setupExportActions();
    this.setupUrlRouteListener();
  }

  public openAdminScene(): void {
    Sound.playChime();
    const adminScene = document.getElementById('admin-scene');
    const mainNav = document.getElementById('main-nav-bar');
    const landing = document.getElementById('landing-scene');

    // Ẩn tất cả các scene khác
    document.querySelectorAll('section').forEach((sec) => {
      sec.classList.remove('scene-active');
    });

    landing?.classList.add('scene-hidden');
    mainNav?.classList.add('nav-active');

    if (adminScene) {
      adminScene.classList.remove('scene-hidden');
      adminScene.classList.add('scene-active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Cập nhật URL hash
    window.location.hash = 'admin';
  }

  public closeAdminScene(): void {
    Sound.playClick();
    const adminScene = document.getElementById('admin-scene');
    if (adminScene) {
      adminScene.classList.remove('scene-active');
      adminScene.classList.add('scene-hidden');
    }
    // Quay lại xưởng phối
    const createBtn = document.getElementById('tab-create');
    createBtn?.click();
    window.location.hash = '';
  }

  private setupUrlRouteListener(): void {
    const checkRoute = () => {
      const hash = window.location.hash;
      const search = window.location.search;
      if (hash === '#admin' || search.includes('page=admin') || search.includes('route=admin')) {
        this.openAdminScene();
      }
    };

    window.addEventListener('hashchange', checkRoute);
    checkRoute();

    // Nút đóng trang admin
    document.getElementById('btn-close-admin')?.addEventListener('click', () => {
      this.closeAdminScene();
    });

    // Nút mở trang admin trên thanh điều hướng hoặc footer
    document.getElementById('btn-open-admin-route')?.addEventListener('click', () => {
      this.openAdminScene();
    });

    // Phím tắt bàn phím: Ctrl + Shift + A
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        const adminScene = document.getElementById('admin-scene');
        if (adminScene?.classList.contains('scene-active')) {
          this.closeAdminScene();
        } else {
          this.openAdminScene();
        }
      }
    });
  }

  private renderSystemOverview(): void {
    const totalGarments = Object.keys(CULTURAL_DATABASE).length;
    const totalPatterns = SIX_PLACEHOLDER_HERITAGE_PATTERNS.length;
    const totalOutfits = DISCOVERY_OUTFITS_POOL.length;

    const countGarmentsEl = document.getElementById('admin-count-garments');
    const countPatternsEl = document.getElementById('admin-count-patterns');
    const countOutfitsEl = document.getElementById('admin-count-outfits');

    if (countGarmentsEl) countGarmentsEl.textContent = `${totalGarments} Dáng Áo`;
    if (countPatternsEl) countPatternsEl.textContent = `${totalPatterns} Hoa Văn`;
    if (countOutfitsEl) countOutfitsEl.textContent = `${totalOutfits} Bộ Phối`;
  }

  private renderGarmentsList(): void {
    const container = document.getElementById('admin-garments-table-body');
    if (!container) return;

    const garments = Object.values(CULTURAL_DATABASE);
    container.innerHTML = garments
      .map((g) => {
        const taboosText = g.strictTaboos.length > 0
          ? g.strictTaboos.map((t) => `<span class="admin-badge-taboo">Kỵ: ${t.incompatibleName}</span>`).join(' ')
          : '<span class="admin-badge-safe">Không có kiêng kỵ nghiêm trọng</span>';

        return `
          <tr>
            <td><code>${g.id}</code></td>
            <td><strong>${g.name}</strong></td>
            <td>${g.historicalEra}</td>
            <td>${g.originRegion}</td>
            <td>${taboosText}</td>
            <td>
              <a href="${g.sourceUrl}" target="_blank" rel="noopener noreferrer" class="admin-link">
                ${g.authorOrInstitution} ↗
              </a>
            </td>
          </tr>
        `;
      })
      .join('');
  }

  private renderPatternsList(): void {
    const container = document.getElementById('admin-patterns-grid');
    if (!container) return;

    container.innerHTML = SIX_PLACEHOLDER_HERITAGE_PATTERNS.map((pat) => {
      return `
        <div class="admin-data-card">
          <div class="admin-card-header">
            <div>
              <span class="admin-id-badge">ID: ${pat.id}</span>
              <h4 class="admin-item-title">${pat.name} (${pat.vietnameseTitle})</h4>
            </div>
            <span class="admin-type-pill">${pat.patternType}</span>
          </div>

          <div class="admin-meta-row">
            <span><strong>Niên đại:</strong> ${pat.dynastyEra}</span>
            <span><strong>Kỹ thuật:</strong> ${pat.technique}</span>
          </div>

          <div class="admin-meta-row">
            <span><strong>Tương thích:</strong> ${pat.compatibleGarments.join(', ')}</span>
          </div>

          <div class="admin-prompt-box">
            <div class="admin-prompt-label">AI Image Generation Prompt:</div>
            <div class="admin-prompt-text" id="prompt-pat-${pat.id}">${pat.fullImagePrompt}</div>
          </div>

          <div class="admin-card-actions" style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button type="button" class="btn-admin-action btn-copy-prompt-action" data-copy-target="prompt-pat-${pat.id}">
              📋 Copy Prompt Nhanh
            </button>
            <a href="https://gemini.google.com" target="_blank" rel="noopener noreferrer" class="btn-admin-action" style="text-decoration: none; color: #1a73e8; font-weight: 600;">
              ✨ Thử Trên Gemini AI ↗
            </a>
          </div>
        </div>
      `;
    }).join('');

    this.wireCopyButtons(container);
  }

  private renderOutfitsList(): void {
    const container = document.getElementById('admin-outfits-grid');
    if (!container) return;

    // Hiển thị Banner Hướng Dẫn Chuẩn Bị File Ảnh Trên CDN
    const cdnGuideHeader = `
      <div class="admin-data-card" style="grid-column: 1 / -1; background: linear-gradient(135deg, rgba(74,133,119,0.08) 0%, rgba(201,166,107,0.12) 100%); border: 1.5px solid rgba(74,133,119,0.3); padding: 18px 20px;">
        <div style="display: flex; align-items: flex-start; gap: 14px; flex-wrap: wrap;">
          <div style="font-size: 2.2rem; line-height: 1;">🏛️</div>
          <div style="flex: 1; min-width: 260px;">
            <h4 style="margin: 0 0 6px 0; font-family: var(--font-title); font-size: 1.15rem; color: #2A5A4E;">
              QUY CHUẨN ĐẶT TÊN CDN & GẮN ẢNH THỦ CÔNG (18 TỔ HỢP TRANG PHỤC)
            </h4>
            <p style="margin: 0 0 10px 0; font-size: 0.84rem; color: #444; line-height: 1.5;">
              Hệ thống đã phân bổ <strong>6 dáng áo × 3 tổ hợp = 18 bộ hoàn chỉnh</strong>. Mỗi bộ có sẵn cấu trúc Prompt AI, CDN ID và đường dẫn lưu trữ. Bạn có thể tự sao chép Prompt sang Gemini / Midjourney để tạo ảnh, sau đó đặt tên theo đúng CDN ID rồi đưa vào thư mục lưu trữ.
            </p>
            <div style="display: flex; gap: 12px; flex-wrap: wrap; font-size: 0.8rem;">
              <span style="background: rgba(255,255,255,0.85); padding: 5px 10px; border-radius: 6px; border: 1px solid rgba(74,133,119,0.2);">
                📁 <strong>Định dạng & Thư mục:</strong> <code>.webp</code> hoặc <code>.jpg</code> trong <code>/images/garments/curated/</code>
              </span>
              <span style="background: rgba(255,255,255,0.85); padding: 5px 10px; border-radius: 6px; border: 1px solid rgba(74,133,119,0.2);">
                📐 <strong>Kích thước đề xuất:</strong> Tỷ lệ 3:4 (1200 × 1600 px hoặc 768 × 1024 px)
              </span>
              <span style="background: rgba(255,255,255,0.85); padding: 5px 10px; border-radius: 6px; border: 1px solid rgba(74,133,119,0.2);">
                🏷️ <strong>Quy tắc đặt tên ID:</strong> <code>garment_[tên_áo]_[01-03]</code>
              </span>
            </div>
          </div>
        </div>
      </div>
    `;

    const outfitCards = DISCOVERY_OUTFITS_POOL.map((outfit) => {
      const cdnId = outfit.cdn_id || outfit.id;
      const cdnPath = outfit.cdn_image_path || `/images/garments/curated/${cdnId}.webp`;
      const assembledPrompt = outfit.assembledPrompt || assembleFashionPrompt({
        garment: outfit.garment,
        color: outfit.color,
        colorName: outfit.colorName,
        styles: outfit.styles || [outfit.style_mode || 'Thanh tao cung đình'],
        accessories: outfit.accessories || [outfit.accessory],
        hairstyle: outfit.hairstyle || 'Tóc búi cao thanh thoát',
        creativityLevel: outfit.creativityLevel || 35,
        event: outfit.event
      } as CurrentOutfitState, outfit.userProfile as any);

      const stylesText = outfit.styles?.join(', ') || outfit.style_mode || 'Thanh tao cung đình';
      const accessoriesText = outfit.accessoryLabels?.join(' • ') || outfit.accessoryLabel || outfit.accessory;
      const profileText = outfit.userProfile
        ? `Cao ${outfit.userProfile.height}, Nặng ${outfit.userProfile.weight}, ${outfit.userProfile.shape}, Da ${outfit.userProfile.skin}`
        : 'Tiêu chuẩn Á Đông';

      return `
        <div class="admin-data-card" id="admin-card-${outfit.id}">
          <div class="admin-card-header">
            <div>
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <span class="admin-id-badge" style="background: #2A5A4E; color: #FFFFFF; font-weight: 700;">CDN ID: ${cdnId}</span>
                <span style="font-size: 0.72rem; padding: 2px 8px; border-radius: 4px; background: rgba(229,169,60,0.18); color: #7A5338; font-weight: 700;">
                  ⚡ ${outfit.creativityLevel || 35}% Phá cách
                </span>
              </div>
              <h4 class="admin-item-title" style="margin: 0; font-size: 1.05rem;">${outfit.title}</h4>
            </div>
            <span class="admin-tag-color" style="background: ${outfit.color}; color: #FFFFFF; text-shadow: 0 1px 2px rgba(0,0,0,0.6); font-weight: 600;">
              ${outfit.colorName} (${outfit.color})
            </span>
          </div>

          <!-- Dòng thông tin đường dẫn CDN -->
          <div style="background: rgba(0,0,0,0.03); border-radius: 6px; padding: 6px 10px; margin: 8px 0; font-size: 0.76rem; display: flex; align-items: center; justify-content: space-between; gap: 6px; flex-wrap: wrap;">
            <span><strong>Đường dẫn CDN:</strong> <code id="path-${outfit.id}" style="color: #2A5A4E;">${cdnPath}</code></span>
            <button type="button" class="btn-admin-action btn-copy-inline" data-copy-text="${cdnPath}" style="padding: 2px 8px; font-size: 0.72rem;">
              Sao chép path
            </button>
          </div>

          <!-- Bảng các Input cấu thành nên tổ hợp -->
          <div style="background: rgba(74,133,119,0.04); border-radius: 8px; padding: 10px; margin-bottom: 10px; font-size: 0.78rem; display: flex; flex-direction: column; gap: 5px; border: 1px solid rgba(74,133,119,0.12);">
            <div style="display: flex; gap: 8px;">
              <span style="width: 105px; color: #666; flex-shrink: 0;">• Dáng áo:</span>
              <strong style="color: #2B2B28;">${outfit.garmentLabel || outfit.garment}</strong>
            </div>
            <div style="display: flex; gap: 8px;">
              <span style="width: 105px; color: #666; flex-shrink: 0;">• Phong cách:</span>
              <span style="color: #2A5A4E; font-weight: 600;">${stylesText}</span>
            </div>
            <div style="display: flex; gap: 8px;">
              <span style="width: 105px; color: #666; flex-shrink: 0;">• Phụ kiện:</span>
              <span style="color: #2B2B28;">${accessoriesText}</span>
            </div>
            <div style="display: flex; gap: 8px;">
              <span style="width: 105px; color: #666; flex-shrink: 0;">• Kiểu tóc:</span>
              <span style="color: #2B2B28;">${outfit.hairstyle || 'Tóc búi cài trâm'}</span>
            </div>
            <div style="display: flex; gap: 8px;">
              <span style="width: 105px; color: #666; flex-shrink: 0;">• Hồ sơ người mặc:</span>
              <span style="color: #555;">${profileText}</span>
            </div>
            <div style="display: flex; gap: 8px;">
              <span style="width: 105px; color: #666; flex-shrink: 0;">• Bối cảnh phù hợp:</span>
              <span style="color: #7A5338; font-weight: 600;">${outfit.bestOccasion || outfit.eventLabel}</span>
            </div>
            <div style="display: flex; gap: 8px;">
              <span style="width: 105px; color: #666; flex-shrink: 0;">• Chất liệu / Vải:</span>
              <span style="color: #555;">${outfit.patternName || 'Lụa Tơ Tằm Tự Nhiên'}</span>
            </div>
          </div>

          <p class="admin-item-desc" style="font-size: 0.8rem; line-height: 1.45; margin-bottom: 10px;">${outfit.desc}</p>

          <!-- Khối Master Prompt AI -->
          <div class="admin-prompt-box">
            <div class="admin-prompt-label" style="display: flex; justify-content: space-between; align-items: center;">
              <span>Master AI Image Generation Prompt:</span>
              <span style="font-size: 0.72rem; color: #888;">(Photorealistic & Heritage Guided)</span>
            </div>
            <div class="admin-prompt-text" id="prompt-outfit-${outfit.id}">${assembledPrompt}</div>
          </div>

          <div class="admin-card-actions" style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px;">
            <button type="button" class="btn-admin-action btn-copy-prompt-action" data-copy-target="prompt-outfit-${outfit.id}">
              📋 Copy Prompt Nhanh
            </button>
            <button type="button" class="btn-admin-action btn-copy-inline" data-copy-text="${cdnId}">
              🏷️ Copy CDN ID
            </button>
            <button type="button" class="btn-admin-action btn-copy-inline" data-copy-text="${cdnPath}">
              📁 Copy CDN Path
            </button>
            <a href="https://gemini.google.com" target="_blank" rel="noopener noreferrer" class="btn-admin-action" style="text-decoration: none; color: #1a73e8; font-weight: 600;">
              ✨ Thử Trên Gemini AI ↗
            </a>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = cdnGuideHeader + outfitCards;
    this.wireCopyButtons(container);
  }

  private wireCopyButtons(container: HTMLElement): void {
    // Copy target by element ID
    container.querySelectorAll('.btn-copy-prompt-action').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-copy-target');
        if (!targetId) return;
        const text = document.getElementById(targetId)?.textContent || '';
        navigator.clipboard.writeText(text).then(() => {
          Sound.playChime();
          const orig = btn.innerHTML;
          btn.innerHTML = '✓ Đã Copy Prompt!';
          setTimeout(() => {
            btn.innerHTML = orig;
          }, 2000);
        });
      });
    });

    // Copy direct text (CDN ID / CDN Path)
    container.querySelectorAll('.btn-copy-inline').forEach((btn) => {
      btn.addEventListener('click', () => {
        const textToCopy = btn.getAttribute('data-copy-text');
        if (!textToCopy) return;
        navigator.clipboard.writeText(textToCopy).then(() => {
          Sound.playChime();
          const orig = btn.innerHTML;
          btn.innerHTML = '✓ Đã Copy!';
          setTimeout(() => {
            btn.innerHTML = orig;
          }, 1800);
        });
      });
    });
  }

  private setupExportActions(): void {
    // 1. Tải toàn bộ Master Dataset (.json)
    document.getElementById('btn-admin-export-master')?.addEventListener('click', () => {
      this.exportDataset('viet_y_master_dataset.json', {
        exportedAt: new Date().toISOString(),
        system: 'Việt Y Remix Single Source of Truth',
        garments: CULTURAL_DATABASE,
        patterns: SIX_PLACEHOLDER_HERITAGE_PATTERNS,
        discoveryOutfits: DISCOVERY_OUTFITS_POOL.map((o) => ({
          ...o,
          assembledPrompt: o.assembledPrompt || assembleFashionPrompt({
            garment: o.garment,
            color: o.color,
            colorName: o.colorName,
            styles: o.styles || [o.style_mode || 'Thanh tao cung đình'],
            accessories: o.accessories || [o.accessory],
            hairstyle: o.hairstyle || 'Búi tóc truyền thống',
            creativityLevel: o.creativityLevel || 35,
            event: o.event
          } as CurrentOutfitState, o.userProfile as any)
        }))
      });
    });

    // 2. Tải danh sách Hoa Văn (.json)
    document.getElementById('btn-admin-export-patterns')?.addEventListener('click', () => {
      this.exportDataset('viet_y_patterns.json', SIX_PLACEHOLDER_HERITAGE_PATTERNS);
    });

    // 3. Tải danh sách Trang Phục Khám Phá (.json)
    document.getElementById('btn-admin-export-outfits')?.addEventListener('click', () => {
      this.exportDataset('viet_y_discovery_outfits.json', DISCOVERY_OUTFITS_POOL);
    });
  }

  /**
   * Tải trực tiếp file .json vật lý về máy tính người dùng (File Blob Download, không dùng LocalStorage)
   */
  public exportDataset(fileName: string, data: unknown): void {
    Sound.playChime();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const adminEngine = new AdminEngine();
