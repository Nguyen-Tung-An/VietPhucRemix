import { PatternItem } from '../types/index.ts';
import { Sound } from '../audio/sound.ts';
import { feedbackState } from '../services/feedbackState.ts';
import { garmentEngine } from './garmentEngine.ts';
import { appRouter } from '../navigation/router.ts';
import { assembleFashionPrompt } from './promptEngine.ts';
import { assetConfig } from '../config/assetConfig.ts';
import { fetchPatternPromptAI } from '../services/api.ts';
import { validateUserInputSanity } from '../data/culturalTruths.ts';

export interface HeritagePatternEntry {
  id: string;
  name: string;
  vietnameseTitle: string;
  dynastyEra: string;
  technique: string;
  compatibleGarments: string[];
  historicalStory: string;
  aiPromptSnippet: string;
  fullImagePrompt: string;
  colorHex: string;
  imageUrl: string;
  previewBg: string;
  patternType: 'SEAMLESS_JACQUARD' | 'CENTRAL_EMBLEM';
}

export const SIX_PLACEHOLDER_HERITAGE_PATTERNS: HeritagePatternEntry[] = [
  {
    id: 'pat-may-ngu-sac',
    name: 'Mây Ngũ Sắc Triều Nguyễn',
    vietnameseTitle: 'Vân Vũ Ngũ Sắc Hoàng Triều',
    dynastyEra: 'Triều Nguyễn (Thế kỷ 19)',
    technique: 'Dệt gấm chìm Jacquard tơ tằm dệt kim tuyến',
    compatibleGarments: ['Áo Ngũ Thân', 'Áo Tấc', 'Áo Nhật Bình'],
    historicalStory: 'Họa tiết mây cuộn ngũ sắc uyển chuyển tượng trưng cho thiên thời tường thụy, vương khí hanh thông và sự tự do phóng khoáng của tâm hồn Việt.',
    aiPromptSnippet: 'Imperial five-color cloud swirls (Vân ngũ sắc), flowing silk damask jacquard, gold filigree reflections',
    fullImagePrompt: 'High-detail textile macro photography of authentic Vietnamese imperial cloud patterns (Vân Vũ Ngũ Sắc Triều Nguyễn), intricate continuous jacquard weave on luxury mulberry silk. Shimmering gold and jade threads, subtle tonal gradients, museum lighting. Designed seamlessly for traditional Vietnamese Ao Ngu Than robes. Strictly NO Hanfu motifs, NO cartoonish vectors, NO low resolution.',
    colorHex: '#C9A66B',
    imageUrl: '/images/patterns/pat-may-ngu-sac.png',
    previewBg: 'linear-gradient(135deg, rgba(201,166,107,0.2), rgba(28,43,38,0.85))',
    patternType: 'SEAMLESS_JACQUARD'
  },
  {
    id: 'pat-thuy-ba-hoang-gia',
    name: 'Sóng Nước Thủy Ba Cung Đình',
    vietnameseTitle: 'Thủy Ba Sóng Triều Đại Việt',
    dynastyEra: 'Thời Lê Trung Hưng & Triều Nguyễn',
    technique: 'Thêu nổi chỉ tơ đa sắc viền chân áo',
    compatibleGarments: ['Áo Tấc', 'Áo Nhật Bình', 'Áo Ngũ Thân'],
    historicalStory: 'Dòng sóng thủy ba cuộn trào dưới chân áo triều phục biểu trưng cho sự thái bình thịnh trị, cội nguồn văn minh sông nước và ước vọng mưa thuận gió hòa.',
    aiPromptSnippet: 'Dynamic Thuy Ba royal concentric water waves, jade green and earthen gold silk embroidery',
    fullImagePrompt: 'Editorial macro shot of Vietnamese imperial Thuy Ba water wave border patterns, hand-embroidered with fine silk floss and gold bullion cords. Layered rhythmic oceanic crests with sacred mountain peaks rising from foam. Soft cinematic studio light reflecting off lustrous Vietnamese raw silk. Authentic historical Vietnamese court costume pattern. NO Japanese seigaiha copy, NO flat vector, photorealistic 8k.',
    colorHex: '#4A8577',
    imageUrl: '/images/patterns/pat-thuy-ba-hoang-gia.png',
    previewBg: 'linear-gradient(135deg, rgba(74,133,119,0.25), rgba(13,23,20,0.9))',
    patternType: 'SEAMLESS_JACQUARD'
  },
  {
    id: 'pat-tu-quy',
    name: 'Tứ Quý Mai Lan Cúc Trúc',
    vietnameseTitle: 'Tứ Thời Cát Tường',
    dynastyEra: 'Di sản mỹ thuật truyền thống Việt Nam',
    technique: 'Thêu tay thủ công thanh nhã & in lụa chìm',
    compatibleGarments: ['Áo Ngũ Thân', 'Áo Bà Ba', 'Áo Dài Tân Thời'],
    historicalStory: 'Bốn loài hoa thảo biểu trưng cho bốn mùa luân chuyển, tiết tháo của bậc quân tử và phẩm hạnh đoan trang, dịu dàng của người phụ nữ Việt.',
    aiPromptSnippet: 'Four seasons botanical elegance (Apricot, Orchid, Chrysanthemum, Bamboo), delicate pastel silk weaving',
    fullImagePrompt: 'High-fashion editorial Vietnamese traditional garment textile swatch featuring Tu Quy (Mai Lan Cuc Truc) botanical motifs. Delicate blossoming apricot and slender bamboo silhouettes woven into organic Lotus Silk. Subtle lotus pink (#F4C9D6) and earthen gold undertones, poetic Asian aesthetics, hyper-detailed textile weave texture. Strictly Vietnamese cultural identity, NO Hanfu dragon robes.',
    colorHex: '#F4C9D6',
    imageUrl: '/images/patterns/pat-tu-quy.png',
    previewBg: 'linear-gradient(135deg, rgba(244,201,214,0.25), rgba(43,43,40,0.85))',
    patternType: 'SEAMLESS_JACQUARD'
  },
  {
    id: 'pat-cuc-day-nguyen',
    name: 'Hoa Cúc Dây Triều Nguyễn',
    vietnameseTitle: 'Cúc Dây Dệt Lụa Hoàng Gia',
    dynastyEra: 'Triều Nguyễn (Thế kỷ 19)',
    technique: 'Dệt gấm đoạn hoa cúc cuộn dây liên hoàn',
    compatibleGarments: ['Áo Ngũ Thân Tay Chẽn', 'Áo Tấc'],
    historicalStory: 'Dây cúc cuộn xoắn miên viễn tượng trưng cho sự trường thọ, trường tồn sinh sôi và cốt cách thanh sạch, không vướng bụi trần.',
    aiPromptSnippet: 'Continuous undulating chrysanthemum floral vine damask, lustrous ancient silk brocade',
    fullImagePrompt: 'Seamless textile pattern surface of authentic Vietnamese royal chrysanthemum scrolling vines (Cuc Day Trieu Nguyen). Intertwining gilded botanical lines on night moss deep green (#1C2B26) mulberry silk. Traditional Dong Ho and Hue imperial aesthetic resonance, high thread count natural sheen, soft directional side light highlighting thread relief. 8k, photorealistic fabric rendering.',
    colorHex: '#C9A66B',
    imageUrl: '/images/patterns/pat-cuc-day-nguyen.png',
    previewBg: 'linear-gradient(135deg, rgba(201,166,107,0.3), rgba(28,43,38,0.92))',
    patternType: 'SEAMLESS_JACQUARD'
  },
  {
    id: 'pat-hac-an-may',
    name: 'Hạc Ẩn Mây Tiên Cảnh',
    vietnameseTitle: 'Bạch Hạc Du Vân',
    dynastyEra: 'Thời Hậu Lê — Thời Nguyễn',
    technique: 'Huy hiệu thêu chỉ bạc và chỉ tơ trắng ngà',
    compatibleGarments: ['Áo Tấc', 'Áo Ngũ Thân', 'Khăn Đóng / Phụ kiện'],
    historicalStory: 'Chim hạc tiên sải cánh lượn giữa mây trời là biểu tượng tối cao của trường thọ, khí tiết thanh cao và sự siêu thoát của tâm hồn.',
    aiPromptSnippet: 'Sacred crane flying through billowing silk clouds, silver metallic threads on deep jade green',
    fullImagePrompt: 'High-end Vietnamese heritage circular emblem medal embroidered with a sacred Crane soaring through swirling clouds (Hac An May). Embroidered with real silver filament and ivory silk on jade-colored textured damask. Rim lighting, intricate needlework relief, museum archival piece quality. Strictly authentic Vietnamese iconography, NO modern stamps.',
    colorHex: '#E8F3EE',
    imageUrl: '/images/patterns/pat-hac-an-may.png',
    previewBg: 'linear-gradient(135deg, rgba(232,243,238,0.3), rgba(13,23,20,0.9))',
    patternType: 'CENTRAL_EMBLEM'
  },
  {
    id: 'pat-lien-hoa-bo-de',
    name: 'Liên Hoa Bồ Đề Thời Lý - Trần',
    vietnameseTitle: 'Liên Hoa Bồ Đề Cổ Kính',
    dynastyEra: 'Thời Lý - Trần (Thế kỷ 11–14)',
    technique: 'Huy hiệu chạm nổi mạ vàng / Thêu chỉ vàng kim',
    compatibleGarments: ['Áo Tấc', 'Áo Ngũ Thân', 'Áo Nhật Bình'],
    historicalStory: 'Cánh sen thanh tịnh lồng trong dáng lá bồ đề mang âm hưởng triết lý Phật giáo nhập thế rực rỡ thời Lý - Trần, tượng trưng cho sự thuần khiết và từ bi.',
    aiPromptSnippet: 'Ly-Tran dynasty sacred lotus inside bodhi leaf outline, Buddhist courtly elegance, gold leaf texture',
    fullImagePrompt: 'Editorial heritage design detail: Vietnamese Ly-Tran dynasty stylized sacred lotus enclosed inside a graceful Bodhi leaf silhouette. Intricate curling petal engravings inspired by ancient Thang Long Imperial Citadel ceramics, textured gold leaf foil stamped onto deep carmine and earthen brown natural raw silk. Crisp details, macro photography, luxury historical preservation aesthetic.',
    colorHex: '#C9A66B',
    imageUrl: '/images/patterns/pat-lien-hoa-bo-de.png',
    previewBg: 'linear-gradient(135deg, rgba(201,166,107,0.35), rgba(74,133,119,0.85))',
    patternType: 'CENTRAL_EMBLEM'
  }
];

export class PatternEngine {
  public savedPatterns: PatternItem[] = [];
  public currentOverlayMode: 'SEAMLESS_JACQUARD' | 'CENTRAL_EMBLEM' = 'SEAMLESS_JACQUARD';
  public currentPattern: PatternItem | null = null;
  public selectedTechnique: string = 'Gấm chìm Jacquard tơ tằm';
  public selectedGarmentTarget: string = 'Áo Ngũ Thân Lập Lĩnh';

  public init(): void {
    this.renderPlaceholderCards();
    this.setupCreativeStudio();
    this.setupModals();
  }

  /**
   * Render danh sách 6 mẫu hoa văn di sản mẫu (Placeholders)
   */
  public renderPlaceholderCards(): void {
    const grid = document.getElementById('pattern-placeholders-grid');
    if (!grid) return;

    grid.innerHTML = SIX_PLACEHOLDER_HERITAGE_PATTERNS.map((pat) => {
      return `
        <article class="pattern-heritage-card" id="card-${pat.id}">
          <div class="pattern-card-preview" style="background: ${pat.previewBg};">
            <div class="pattern-card-art-wrap" style="position: relative; width: 100%; height: 100%; overflow: hidden; display: flex; align-items: center; justify-content: center;">
              <img src="${assetConfig.resolveAssetUrl(pat.imageUrl)}" alt="${pat.name}" class="pattern-card-img" style="width: 100%; height: 100%; object-fit: cover; display: block;" onload="this.style.display='block'; const ph = this.parentElement.querySelector('.pattern-no-img-box'); if (ph) ph.style.display='none';" onerror="this.style.display='none'; const ph = this.parentElement.querySelector('.pattern-no-img-box'); if (ph) ph.style.display='flex';" />
              <div class="pattern-no-img-box" style="display: none; position: absolute; inset: 0; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 4px; padding: 12px; background: rgba(28,43,38,0.7);">
                <span style="font-size: 1.8rem; opacity: 0.55;">🏛️</span>
                <span style="font-family: var(--font-body); font-size: 0.76rem; color: var(--color-text-muted); line-height: 1.3;">Tổ hợp này chưa có ảnh minh họa demo</span>
              </div>
            </div>
            <div class="pattern-card-badge">${pat.patternType === 'SEAMLESS_JACQUARD' ? '❖ Gấm Chìm' : '✹ Huy Hiệu'}</div>
          </div>

          <div class="pattern-card-content">
            <div class="pattern-dynasty">${pat.dynastyEra}</div>
            <h4 class="pattern-title">${pat.name}</h4>
            <div class="pattern-technique">🪡 <em>Kỹ thuật:</em> ${pat.technique}</div>
            <p class="pattern-story">${pat.historicalStory}</p>

            <div class="pattern-compatibility">
              <strong>Tương thích:</strong>
              ${pat.compatibleGarments.map((g) => `<span class="compat-tag">${g}</span>`).join('')}
            </div>

            <div class="pattern-card-actions">
              <button type="button" class="btn-pattern-apply btn-pattern-apply-inactive" data-pattern-id="${pat.id}" title="Tính năng áp dụng lên áo đang được phát triển" aria-disabled="true">
                🎨 Áp Dụng Lên Áo
              </button>
              <button type="button" class="btn-pattern-view-prompt" data-pattern-id="${pat.id}" title="Xem câu lệnh AI Prompt đầy đủ dùng để sinh ảnh">
                🔍 Xem Prompt AI
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Gắn sự kiện cho các nút hành động trong từng thẻ
    grid.querySelectorAll('.btn-pattern-apply').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        Sound.playClick();
        appRouter.showToast('Tính năng áp dụng hoa văn lên áo đang được phát triển và sẽ ra mắt trong phiên bản tiếp theo, vui lòng thử lại sau!');
      });
    });

    grid.querySelectorAll('.btn-pattern-view-prompt').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-pattern-id');
        const found = SIX_PLACEHOLDER_HERITAGE_PATTERNS.find((p) => p.id === id);
        if (found) {
          this.openPromptInspectModal(found.name, found.fullImagePrompt, 'HOA_VAN');
        }
      });
    });
  }

  /**
   * Áp dụng hoa văn mẫu trực tiếp vào trang phục trong Xưởng Phối và chuyển tab
   */
  public applyToWorkshopAndNavigate(patternEntry: HeritagePatternEntry): void {
    Sound.playChime();
    const patternItem: PatternItem = {
      id: patternEntry.id,
      pattern_name: patternEntry.name,
      pattern_type: patternEntry.patternType,
      imageUrl: patternEntry.imageUrl,
      pattern_color: patternEntry.colorHex,
      pattern_story: patternEntry.historicalStory
    };

    garmentEngine.setPattern(patternItem);

    // Kích hoạt thông báo và chuyển tab sang Xưởng Phối
    feedbackState.showLoading({
      message: 'Đang đính hoa văn vào trang phục...',
      submessage: `Đang may dệt mẫu "${patternEntry.name}" vào nếp tơ Lụa Thanh...`
    });

    setTimeout(() => {
      feedbackState.hideLoading();
      appRouter.switchTab('create');
      appRouter.showToast(`✨ Đã gắn hoa văn "${patternEntry.name}" vào áo của bạn trong Xưởng Phối!`);
    }, 400);
  }

  /**
   * Thiết lập khu vực Sáng Tạo Hoa Văn Tự Do (Prompt Injector)
   */
  private setupCreativeStudio(): void {
    const inputKeyword = document.getElementById('custom-pattern-keyword') as HTMLInputElement | null;
    const btnGenerate = document.getElementById('btn-creative-generate-pattern');
    const techniquePills = document.querySelectorAll('.technique-pill');
    const garmentPills = document.querySelectorAll('.garment-pill');

    techniquePills.forEach((pill) => {
      pill.addEventListener('click', () => {
        Sound.playClick();
        techniquePills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        this.selectedTechnique = pill.getAttribute('data-tech') || 'Gấm chìm Jacquard';
      });
    });

    garmentPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        Sound.playClick();
        garmentPills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        this.selectedGarmentTarget = pill.getAttribute('data-garment') || 'Áo Ngũ Thân';
      });
    });

    const btnInlineCopy = document.getElementById('btn-inline-copy-pattern-prompt');
    btnInlineCopy?.addEventListener('click', () => {
      const promptText = document.getElementById('gen-pattern-prompt-display')?.textContent;
      if (promptText) {
        navigator.clipboard.writeText(promptText).then(() => {
          Sound.playChime();
          const orig = btnInlineCopy.innerHTML;
          btnInlineCopy.innerHTML = '<span>✓ Đã Sao Chép Prompt!</span>';
          setTimeout(() => {
            btnInlineCopy.innerHTML = orig;
          }, 2000);
        });
      }
    });

    btnGenerate?.addEventListener('click', () => {
      const keyword = inputKeyword?.value.trim() || '';
      if (!keyword) {
        appRouter.showToast('Vui lòng nhập cảm hứng hoặc hoa văn bạn muốn sáng tạo!');
        inputKeyword?.focus();
        return;
      }
      Sound.playClick();
      this.handleGenerateCreativePattern(keyword);
    });

    inputKeyword?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        btnGenerate?.click();
      }
    });
  }

  /**
   * Xử lý sinh ảnh hoa văn từ từ khóa người dùng (Gọi Gemini AI sinh Master Prompt & hiển thị Quota Notice cho BGK)
   */
  public async handleGenerateCreativePattern(userKeyword: string): Promise<void> {
    const btnGenerate = document.getElementById('btn-creative-generate-pattern');
    const inputKeyword = document.getElementById('custom-pattern-keyword') as HTMLInputElement | null;

    // 1. Kiểm tra thuần phong mỹ tục và từ ngữ nhạy cảm ngay từ đầu
    const sanity = validateUserInputSanity(userKeyword, 'pattern');
    if (!sanity.isValid) {
      Sound.playClick();
      appRouter.showToast(`⚠️ ${sanity.reason || 'Từ khóa chứa từ ngữ nhạy cảm hoặc không phù hợp với thuần phong mỹ tục văn hóa Việt Nam.'}`);
      if (inputKeyword) {
        inputKeyword.style.borderColor = '#C5534A';
        inputKeyword.focus();
        setTimeout(() => {
          if (inputKeyword) inputKeyword.style.borderColor = '';
        }, 3000);
      }
      return;
    }

    if (btnGenerate) {
      btnGenerate.classList.add('loading-active');
      btnGenerate.setAttribute('aria-busy', 'true');
    }

    feedbackState.showLoading({
      message: 'Gemini AI đang sáng tạo Prompt hoa văn...',
      submessage: `Chuyển hóa cảm hứng "${userKeyword}" thành Master Prompt dệt may di sản...`,
      allowCancel: true
    });

    try {
      const aiResult = await fetchPatternPromptAI({
        keyword: userKeyword,
        technique: this.selectedTechnique,
        garment: this.selectedGarmentTarget,
        colorHex: '#E5A93C'
      });

      feedbackState.hideLoading();
      Sound.playChime();

      const assembledPrompt = aiResult.pattern_prompt || this.constructPatternImagePrompt(
        userKeyword,
        this.selectedTechnique,
        this.selectedGarmentTarget
      );

      // Cập nhật khung kết quả trực quan
      const resultBox = document.getElementById('pattern-generated-result-box');
      const resultTitle = document.getElementById('gen-pattern-title');
      const resultPromptEl = document.getElementById('gen-pattern-prompt-display');
      const resultDesc = document.getElementById('gen-pattern-desc');

      if (resultBox) resultBox.classList.remove('box-hidden');
      if (resultTitle) resultTitle.textContent = `${aiResult.pattern_title || `Bản Thiết Kế: ${userKeyword}`} (${aiResult.technique_used || this.selectedTechnique})`;
      if (resultPromptEl) resultPromptEl.textContent = assembledPrompt;
      if (resultDesc) {
        resultDesc.textContent = aiResult.cultural_story
          ? `${aiResult.cultural_story} (Prompt đồ họa đã được Gemini AI sáng tạo chuyên biệt cho phom dáng ${this.selectedGarmentTarget}).`
          : `Hệ thống đã tự động chuyển hóa từ khóa "${userKeyword}" thành cấu trúc câu lệnh AI đồ họa chuyên sâu tương thích hoàn toàn với phom dáng ${this.selectedGarmentTarget}.`;
      }

      appRouter.showToast('✨ Đã khởi tạo thành công Master Prompt hoa văn AI!');

      // Mở modal thông cáo Quota và Prompt dành riêng cho Ban Giám khảo
      this.openPromptInspectModal(aiResult.pattern_title || `Hoa Văn Sáng Tạo: ${userKeyword}`, assembledPrompt, 'HOA_VAN');

      // Cuộn êm đến khung kết quả
      resultBox?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (err: any) {
      console.warn('Lỗi khi sinh Prompt hoa văn AI:', err);
      feedbackState.hideLoading();
      const errorMsg = err?.message || 'Hệ thống AI hiện đang quá tải hoặc tạm thời hết lượt yêu cầu. Vui lòng thử lại sau!';
      appRouter.showToast(`⚠️ ${errorMsg}`);
    } finally {
      if (btnGenerate) {
        btnGenerate.classList.remove('loading-active');
        btnGenerate.removeAttribute('aria-busy');
      }
    }
  }

  /**
   * Cơ chế ghép nối câu lệnh AI Image Generation chuyên sâu (Prompt Assembly)
   */
  public constructPatternImagePrompt(keyword: string, technique: string, targetGarment: string): string {
    return `Ultra-detailed textile macro editorial photography of traditional Vietnamese textile pattern: "${keyword}". Artistic technique: ${technique}, meticulously tailored for Vietnamese ${targetGarment}. Natural mulberry silk texture (tơ tằm tự nhiên) with fine jacquard relief weave, soft gold leaf highlights (#C9A66B) and jade undertones. Soft cinematic studio rim lighting, 8k resolution, authentic Vietnamese cultural heritage aesthetics. Strictly NO Hanfu imperial dragons, NO Kimono sash motifs, NO flat cartoon illustration, photorealistic textile fabric sample.`;
  }

  /**
   * Thiết lập Modal hiển thị Prompt & Thông cáo Quota
   */
  private setupModals(): void {
    const modal = document.getElementById('prompt-inspect-modal');
    const btnClose = document.getElementById('btn-close-prompt-modal');
    const backdrop = document.getElementById('prompt-modal-backdrop');
    const btnCopy = document.getElementById('btn-copy-prompt-text');

    const closeModal = () => {
      modal?.classList.remove('modal-active');
    };

    btnClose?.addEventListener('click', closeModal);
    backdrop?.addEventListener('click', closeModal);

    btnCopy?.addEventListener('click', () => {
      const promptText = document.getElementById('modal-prompt-content')?.textContent;
      if (promptText) {
        navigator.clipboard.writeText(promptText).then(() => {
          Sound.playChime();
          const origText = btnCopy.innerHTML;
          btnCopy.innerHTML = '✓ Đã Sao Chép Prompt!';
          setTimeout(() => {
            btnCopy.innerHTML = origText;
          }, 2000);
        });
      }
    });

    // Lắng nghe nút mở Prompt trang phục tại Xưởng Phối và Màn Kết Quả
    const triggerOutfitPromptBtns = [
      document.getElementById('btn-inspect-outfit-prompt'),
      document.getElementById('btn-result-prompt-inspect')
    ];

    triggerOutfitPromptBtns.forEach((btn) => {
      btn?.addEventListener('click', () => {
        Sound.playClick();
        const outfitState = garmentEngine.getCurrentOutfitState();
        const assembledOutfitPrompt = assembleFashionPrompt(outfitState);
        this.openPromptInspectModal(
          `Trang Phục Hoàn Chỉnh: ${outfitState.garment === 'AO_BA_BA' ? 'Áo Bà Ba' : 'Áo Ngũ Thân'} ${outfitState.colorName}`,
          assembledOutfitPrompt,
          'TRANG_PHUC'
        );
      });
    });
  }

  /**
   * Mở Modal hiển thị Prompt và Banner thông cáo Quota cho Giám khảo
   */
  public openPromptInspectModal(title: string, promptContent: string, mode: 'HOA_VAN' | 'TRANG_PHUC'): void {
    const modal = document.getElementById('prompt-inspect-modal');
    const titleEl = document.getElementById('modal-prompt-title');
    const contentEl = document.getElementById('modal-prompt-content');
    const badgeEl = document.getElementById('modal-prompt-type-badge');

    if (!modal) return;

    if (titleEl) titleEl.textContent = title;
    if (contentEl) contentEl.textContent = promptContent;
    if (badgeEl) {
      badgeEl.textContent = mode === 'HOA_VAN' ? '❖ Cấu Trúc Prompt Sinh Ảnh Hoa Văn' : '🎨 Cấu Trúc Prompt Sinh Ảnh Trang Phục';
    }

    modal.classList.add('modal-active');
  }
}

export const patternEngine = new PatternEngine();
