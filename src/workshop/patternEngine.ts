import { PatternItem } from '../types/index.ts';
import { Sound } from '../audio/sound.ts';
import { fetchPatternAI } from '../services/api.ts';

export const DEFAULT_CURATED_PATTERNS: PatternItem[] = [
  {
    id: 'pat-may-nguyen',
    pattern_name: 'Mây Vờn Triều Nguyễn',
    pattern_type: 'SEAMLESS_JACQUARD',
    svg_path_data: 'M 10,30 Q 20,15 35,22 Q 50,10 60,25 Q 50,45 35,38 Q 20,50 10,30 Z',
    pattern_color: '#E5A93C',
    pattern_story: 'Họa tiết mây cuộn uyển chuyển thời Nguyễn, tượng trưng cho thiên thời tường thụy và tâm hồn tự do phóng khoáng.'
  },
  {
    id: 'pat-thuy-ba',
    pattern_name: 'Sóng Nước Thủy Ba',
    pattern_type: 'SEAMLESS_JACQUARD',
    svg_path_data: 'M 0,35 Q 15,10 30,35 T 60,35 M 10,50 Q 25,25 40,50 T 70,50',
    pattern_color: '#64B5F6',
    pattern_story: 'Dòng sóng thủy ba cuộn trào dưới chân áo triều phục, mang ước vọng bình an, mưa thuận gió hòa.'
  },
  {
    id: 'pat-kim-boi',
    pattern_name: 'Kim Bội Nhật Bình',
    pattern_type: 'CENTRAL_EMBLEM',
    svg_path_data:
      'M 0,-24 C 16,-24 24,-16 24,0 C 24,16 16,24 0,24 C -16,24 -24,16 -24,0 C -24,-16 -16,-24 0,-24 Z M 0,-14 C 9,-14 14,-9 14,0 C 14,9 9,14 0,14 C -9,14 -14,9 -14,0 C -14,-9 -9,-14 0,-14 Z M -18,0 L 18,0 M 0,-18 L 0,18',
    pattern_color: '#FFD700',
    pattern_story: 'Huy hiệu kim khánh cách điệu đặt giữa ngực áo, tôn vinh phẩm hạnh cao quý và cốt cách hoàng gia.'
  }
];

export class PatternEngine {
  public savedPatterns: PatternItem[] = [];
  public currentOverlayMode: 'SEAMLESS_JACQUARD' | 'CENTRAL_EMBLEM' = 'SEAMLESS_JACQUARD';
  public currentPattern: PatternItem | null = null;

  public init(): void {
    this.loadSavedPatterns();
    this.setupUI();
  }

  public loadSavedPatterns(): void {
    try {
      const stored = localStorage.getItem('viet_y_saved_patterns');
      if (stored) {
        this.savedPatterns = JSON.parse(stored);
      } else {
        this.savedPatterns = [...DEFAULT_CURATED_PATTERNS];
        localStorage.setItem('viet_y_saved_patterns', JSON.stringify(this.savedPatterns));
      }
    } catch {
      this.savedPatterns = [...DEFAULT_CURATED_PATTERNS];
    }
    this.renderSavedPatternList();
  }

  public renderSavedPatternList(): void {
    const container = document.getElementById('saved-pattern-list');
    const countEl = document.getElementById('saved-pattern-count');
    if (!container) return;

    container.innerHTML = '';
    if (countEl) {
      countEl.textContent = `(${this.savedPatterns.length} mẫu)`;
    }

    this.savedPatterns.forEach((pat) => {
      const bead = document.createElement('button');
      bead.type = 'button';
      bead.className = 'pattern-bead';
      bead.title = `${pat.pattern_name} (${pat.pattern_type === 'SEAMLESS_JACQUARD' ? 'Gấm chìm' : 'Huy hiệu'})`;
      bead.setAttribute('aria-label', pat.pattern_name);

      bead.style.background = pat.pattern_color || '#E5A93C';
      bead.innerHTML = pat.pattern_type === 'SEAMLESS_JACQUARD' ? '❖' : '✹';
      bead.style.color = '#121110';

      bead.addEventListener('click', () => {
        Sound.playChime();
        document.querySelectorAll('.pattern-bead').forEach((b) => b.classList.remove('active'));
        bead.classList.add('active');
        this.applyPatternToGarment(pat);
      });

      container.appendChild(bead);
    });
  }

  public applyPatternToGarment(patternData: PatternItem): void {
    this.currentPattern = patternData;
    const overlayPath = document.getElementById('layer-pattern-overlay');
    const emblemGroup = document.getElementById('layer-emblem');
    const dynPatternPath = document.getElementById('dynamic-ai-pattern-path');
    const storyDisplay = document.getElementById('pattern-story-display');

    if (patternData.pattern_type === 'SEAMLESS_JACQUARD') {
      if (dynPatternPath) {
        dynPatternPath.setAttribute('d', patternData.svg_path_data);
        dynPatternPath.setAttribute('stroke', patternData.pattern_color || '#E5A93C');
      }
      if (overlayPath) {
        overlayPath.style.display = 'block';
        overlayPath.style.mixBlendMode = 'multiply';
        overlayPath.style.opacity = '0.38';
      }
      if (emblemGroup) {
        emblemGroup.style.display = 'none';
      }
    } else {
      if (overlayPath) {
        overlayPath.style.display = 'none';
      }
      if (emblemGroup) {
        const color = patternData.pattern_color || '#FFD700';
        emblemGroup.innerHTML = `
          <circle cx="0" cy="0" r="32" fill="none" stroke="${color}" stroke-width="2.2" stroke-dasharray="5,3" filter="drop-shadow(0 0 6px ${color})" />
          <circle cx="0" cy="0" r="27" fill="rgba(30, 20, 15, 0.65)" stroke="${color}" stroke-width="1.2" />
          <path d="${patternData.svg_path_data}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
          <circle cx="0" cy="0" r="3.5" fill="${color}" />
        `;
        emblemGroup.style.display = 'block';
      }
    }

    if (storyDisplay && patternData.pattern_story) {
      storyDisplay.style.display = 'block';
      storyDisplay.innerHTML = `<strong>${patternData.pattern_name}:</strong> ${patternData.pattern_story}`;
    }
  }

  public async generateAIPattern(userKeyword: string, overlayMode: 'SEAMLESS_JACQUARD' | 'CENTRAL_EMBLEM'): Promise<void> {
    const keyword = (userKeyword || '').trim() || 'chiều mưa xứ Huế';
    const mode = overlayMode || 'SEAMLESS_JACQUARD';
    const mainGarment = document.getElementById('layer-main-garment');
    const btnGen = document.getElementById('btn-generate-pattern') as HTMLButtonElement | null;

    if (mainGarment) {
      mainGarment.classList.add('is-polishing');
    }
    if (btnGen) {
      btnGen.disabled = true;
      btnGen.innerHTML = '<span>⏳</span> Đang Mài Vóc...';
    }

    const fallbackResult: PatternItem = {
      pattern_name: mode === 'SEAMLESS_JACQUARD' ? 'Gấm Mây Thủy Ba' : 'Nhật Bình Kim Khánh',
      pattern_type: mode,
      svg_path_data:
        mode === 'SEAMLESS_JACQUARD'
          ? 'M 10,30 Q 25,12 40,28 T 60,30 M 5,45 Q 25,25 45,45'
          : 'M 0,-24 C 16,-24 24,-16 24,0 C 24,16 16,24 0,24 C -16,24 -24,16 -24,0 C -24,-16 -16,-24 0,-24 Z M -16,0 L 16,0 M 0,-16 L 0,16',
      pattern_color: '#E5A93C',
      pattern_story: `Khởi phát từ cảm hứng "${keyword}", hoa văn kết hợp dòng nước nguồn cội và nét chạm gốm mạ vàng tôn vinh cốt cách người mặc.`
    };

    let finalPattern: PatternItem | null = await fetchPatternAI(keyword, mode);
    if (!finalPattern) {
      finalPattern = fallbackResult;
    }

    // Giữ hiệu ứng mài vóc tối thiểu 1.2s để tạo cảm giác đúc men thủ công
    await new Promise((r) => setTimeout(r, 1200));

    if (mainGarment) {
      mainGarment.classList.remove('is-polishing');
    }
    if (btnGen) {
      btnGen.disabled = false;
      btnGen.innerHTML = '<span>✨</span> Thêu Hoa Văn AI';
    }

    this.applyPatternToGarment(finalPattern);

    finalPattern.id = 'pat-' + Date.now();
    this.savedPatterns.unshift(finalPattern);
    if (this.savedPatterns.length > 12) this.savedPatterns.pop();

    try {
      localStorage.setItem('viet_y_saved_patterns', JSON.stringify(this.savedPatterns));
    } catch {}

    this.renderSavedPatternList();
    Sound.playChime();
  }

  private setupUI(): void {
    const tabSeamless = document.getElementById('tab-mode-seamless');
    const tabEmblem = document.getElementById('tab-mode-emblem');
    const inputKeyword = document.getElementById('pattern-keyword') as HTMLInputElement | null;
    const btnGenPattern = document.getElementById('btn-generate-pattern');

    if (tabSeamless && tabEmblem) {
      tabSeamless.addEventListener('click', () => {
        Sound.playClick();
        this.currentOverlayMode = 'SEAMLESS_JACQUARD';
        tabSeamless.classList.add('active');
        tabEmblem.classList.remove('active');
      });

      tabEmblem.addEventListener('click', () => {
        Sound.playClick();
        this.currentOverlayMode = 'CENTRAL_EMBLEM';
        tabEmblem.classList.add('active');
        tabSeamless.classList.remove('active');
      });
    }

    if (btnGenPattern && inputKeyword) {
      const handleTriggerPattern = () => {
        const val = inputKeyword.value.trim() || 'chiều mưa xứ Huế';
        Sound.playClick();
        this.generateAIPattern(val, this.currentOverlayMode);
      };

      btnGenPattern.addEventListener('click', handleTriggerPattern);
      inputKeyword.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleTriggerPattern();
        }
      });
    }
  }
}

export const patternEngine = new PatternEngine();
