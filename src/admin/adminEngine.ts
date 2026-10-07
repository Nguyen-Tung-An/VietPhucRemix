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

          <div class="admin-card-actions">
            <button type="button" class="btn-admin-action btn-copy-prompt-action" data-copy-target="prompt-pat-${pat.id}">
              📋 Copy Prompt Nhanh
            </button>
          </div>
        </div>
      `;
    }).join('');

    this.wireCopyButtons(container);
  }

  private renderOutfitsList(): void {
    const container = document.getElementById('admin-outfits-grid');
    if (!container) return;

    container.innerHTML = DISCOVERY_OUTFITS_POOL.map((outfit) => {
      // Tự động tạo câu prompt hoàn chỉnh đồng bộ từ promptEngine
      const mockState: CurrentOutfitState = {
        garment: outfit.garment,
        color: outfit.color,
        colorName: outfit.colorName,
        accessory: outfit.accessory,
        accessories: [outfit.accessory],
        custom_accessories: [],
        hairstyle: 'Tóc búi cao thanh thoát',
        event: outfit.event,
        genzActive: false,
        style: 'THANH_TAO',
        personality: 'Đoan trang nho nhã'
      };

      const assembledPrompt = assembleFashionPrompt(mockState);

      return `
        <div class="admin-data-card">
          <div class="admin-card-header">
            <div>
              <span class="admin-id-badge">ID: ${outfit.id}</span>
              <h4 class="admin-item-title">${outfit.title}</h4>
            </div>
            <span class="admin-tag-color" style="background: ${outfit.color};">${outfit.colorName}</span>
          </div>

          <div class="admin-meta-row">
            <span><strong>Áo:</strong> <code>${outfit.garment}</code></span>
            <span><strong>Phụ kiện:</strong> <code>${outfit.accessory}</code></span>
            <span><strong>Sự kiện:</strong> ${outfit.eventLabel}</span>
          </div>

          <p class="admin-item-desc">${outfit.desc}</p>

          <div class="admin-prompt-box">
            <div class="admin-prompt-label">Assembled Fashion Image Prompt:</div>
            <div class="admin-prompt-text" id="prompt-outfit-${outfit.id}">${assembledPrompt}</div>
          </div>

          <div class="admin-card-actions">
            <button type="button" class="btn-admin-action btn-copy-prompt-action" data-copy-target="prompt-outfit-${outfit.id}">
              📋 Copy Prompt Nhanh
            </button>
          </div>
        </div>
      `;
    }).join('');

    this.wireCopyButtons(container);
  }

  private wireCopyButtons(container: HTMLElement): void {
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
          assembledPrompt: assembleFashionPrompt({
            garment: o.garment,
            color: o.color,
            colorName: o.colorName,
            accessory: o.accessory,
            accessories: [o.accessory],
            custom_accessories: [],
            hairstyle: 'Búi tóc truyền thống',
            event: o.event
          } as CurrentOutfitState)
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
