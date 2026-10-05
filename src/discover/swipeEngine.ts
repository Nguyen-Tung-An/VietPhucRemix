import { DiscoveryOutfit } from '../types/index.ts';
import { Sound } from '../audio/sound.ts';
import { preferenceEngine } from './preferenceLearning.ts';
import { wardrobeManager } from './wardrobeManager.ts';

export interface EventContext {
  key: string;
  name: string;
  icon: string;
}

export const DISCOVERY_CONTEXTS: EventContext[] = [
  { key: 'tet', name: 'Dạo phố Tết', icon: '🌸' },
  { key: 'grad', name: 'Lễ tốt nghiệp', icon: '🎓' },
  { key: 'festival', name: 'Lễ hội làng', icon: '🏮' },
  { key: 'yearbook', name: 'Chụp kỷ yếu', icon: '📷' }
];

export const DISCOVERY_OUTFITS_POOL: DiscoveryOutfit[] = [
  {
    id: 'outfit-1',
    title: 'Áo Ngũ Thân Lập Lĩnh Hồng Sen',
    garment: 'AO_NGU_THAN',
    color: '#F4C9D6',
    colorName: 'Hồng Phấn Sen',
    event: 'tet',
    eventLabel: 'Dạo phố Tết',
    accessory: 'QUAT_GIAY',
    seal: 'Lụa',
    desc: 'Tà ngũ thân lụa mềm mại phối quạt thanh tao, tươi tắn đón nắng xuân.'
  },
  {
    id: 'outfit-2',
    title: 'Áo Ngũ Thân Xanh Ngọc Đậm',
    garment: 'AO_NGU_THAN',
    color: '#4A8577',
    colorName: 'Xanh Ngọc Đậm',
    event: 'grad',
    eventLabel: 'Lễ tốt nghiệp',
    accessory: 'QUAT_GIAY',
    seal: 'Thanh',
    desc: 'Sắc ngọc trầm tĩnh biểu trưng cho trí tuệ và chí hướng thanh vân.'
  },
  {
    id: 'outfit-3',
    title: 'Áo Bà Ba Trắng Bưởi Phù Sa',
    garment: 'AO_BA_BA',
    color: '#E8F3EE',
    colorName: 'Ngọc Sương',
    event: 'festival',
    eventLabel: 'Lễ hội làng',
    accessory: 'KHAN_RAN',
    seal: 'Mộc',
    desc: 'Áo bà ba xẻ tà buông rủ mộc mạc, điểm khăn rằn sông nước phương Nam.'
  },
  {
    id: 'outfit-4',
    title: 'Áo Ngũ Thân Vàng Đất Cố Đô',
    garment: 'AO_NGU_THAN',
    color: '#C9A66B',
    colorName: 'Vàng Đất',
    event: 'yearbook',
    eventLabel: 'Chụp kỷ yếu',
    accessory: 'QUAT_GIAY',
    seal: 'Cổ',
    desc: 'Ánh vàng đất hoài niệm, tạo chiều sâu nghệ thuật cho từng khung hình kỷ yếu.'
  },
  {
    id: 'outfit-5',
    title: 'Áo Bà Ba Hồng Phấn Du Xuân',
    garment: 'AO_BA_BA',
    color: '#F4C9D6',
    colorName: 'Hồng Phấn Sen',
    event: 'tet',
    eventLabel: 'Dạo phố Tết',
    accessory: 'KHAN_RAN',
    seal: 'Xuân',
    desc: 'Dáng áo bà ba cách điệu sắc hồng sen nhẹ nhàng bên bến hoa ngày Tết.'
  },
  {
    id: 'outfit-6',
    title: 'Áo Ngũ Thân Ngọc Sương Thanh Lịch',
    garment: 'AO_NGU_THAN',
    color: '#E8F3EE',
    colorName: 'Ngọc Sương',
    event: 'grad',
    eventLabel: 'Lễ tốt nghiệp',
    accessory: 'QUAT_GIAY',
    seal: 'Nhã',
    desc: 'Chất liệu lụa dệt sắc ngọc sương tinh khôi, tôn phong thái đĩnh đạc tự tin.'
  },
  {
    id: 'outfit-7',
    title: 'Áo Ngũ Thân Xanh Rêu Đêm Hội Phố',
    garment: 'AO_NGU_THAN',
    color: '#1C2B26',
    colorName: 'Rêu Đêm',
    event: 'festival',
    eventLabel: 'Lễ hội làng',
    accessory: 'QUAT_GIAY',
    seal: 'Hội',
    desc: 'Lập lĩnh tối màu đơm cúc mạ vàng, nổi bật lung linh dưới ánh đèn lồng cổ.'
  },
  {
    id: 'outfit-8',
    title: 'Áo Bà Ba Xanh Ngọc Đậm Kỷ Yếu',
    garment: 'AO_BA_BA',
    color: '#4A8577',
    colorName: 'Xanh Ngọc Đậm',
    event: 'yearbook',
    eventLabel: 'Chụp kỷ yếu',
    accessory: 'KHAN_RAN',
    seal: 'Kỷ',
    desc: 'Nét đẹp hồn nhiên tươi trẻ trong bộ bà ba xanh ngọc đậm cùng chúng bạn.'
  }
];

export class SwipeEngine {
  public currentDeck: DiscoveryOutfit[] = [];
  public selectedContext: EventContext | null = null;
  private isDraggingCard: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private cardCurrentX: number = 0;
  private cardCurrentY: number = 0;
  private activeCardElement: HTMLElement | null = null;
  private isAnimating: boolean = false;
  private onRemixCallback: ((outfit: DiscoveryOutfit) => void) | null = null;

  public init(onRemix: (outfit: DiscoveryOutfit) => void): void {
    this.onRemixCallback = onRemix;
    this.setupContextSelection();
    this.setupSwipeButtons();
    this.setupChangeContextButton();
  }

  /**
   * Thiết lập sự kiện chọn 4 bối cảnh ở Phần 1
   */
  private setupContextSelection(): void {
    const contextButtons = document.querySelectorAll('.context-card-item');
    contextButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const eventKey = target.dataset.eventKey || 'tet';
        this.selectContext(eventKey);
      });
    });
  }

  /**
   * Chọn bối cảnh và chuyển sang Phần 2
   */
  public selectContext(eventKey: string): void {
    Sound.playClick();
    const foundContext = DISCOVERY_CONTEXTS.find((c) => c.key === eventKey) || DISCOVERY_CONTEXTS[0];
    this.selectedContext = foundContext;

    // Cập nhật text & icon trên chip bối cảnh (cả mobile và desktop)
    const iconEl = document.getElementById('active-context-icon');
    const nameEl = document.getElementById('active-context-name');
    const desktopIconEl = document.getElementById('desktop-context-icon');
    const desktopNameEl = document.getElementById('desktop-context-name');
    if (iconEl) iconEl.textContent = foundContext.icon;
    if (nameEl) nameEl.textContent = foundContext.name;
    if (desktopIconEl) desktopIconEl.textContent = foundContext.icon;
    if (desktopNameEl) desktopNameEl.textContent = foundContext.name;

    // Lọc và sắp xếp deck theo bối cảnh & sở thích
    const filtered = DISCOVERY_OUTFITS_POOL.filter(
      (item) => item.event === eventKey || item.event === 'tet'
    );
    this.currentDeck = preferenceEngine.sortDeckByPreference(
      filtered.length >= 3 ? filtered : DISCOVERY_OUTFITS_POOL
    );

    // Chuyển màn hình: Ẩn phần 1, hiện phần 2
    const step1 = document.getElementById('discover-context-step');
    const step2 = document.getElementById('discover-stack-step');
    if (step1 && step2) {
      step1.classList.add('step-hidden');
      step2.classList.remove('step-hidden');
    }

    this.renderDeckStack();
  }

  /**
   * Nút "Đổi bối cảnh" quay lại Phần 1
   */
  private setupChangeContextButton(): void {
    const btnChangeMobile = document.getElementById('btn-change-context');
    const btnChangeDesktop = document.getElementById('btn-change-context-desktop');
    const handler = () => {
      Sound.playClick();
      const step1 = document.getElementById('discover-context-step');
      const step2 = document.getElementById('discover-stack-step');
      if (step1 && step2) {
        step2.classList.add('step-hidden');
        step1.classList.remove('step-hidden');
      }
    };

    btnChangeMobile?.addEventListener('click', handler);
    btnChangeDesktop?.addEventListener('click', handler);
  }

  /**
   * Cập nhật thông tin Hồ Sơ Cổ Phục trên giao diện Desktop
   */
  private updateDesktopDossier(outfit: DiscoveryOutfit): void {
    const titleEl = document.getElementById('dossier-outfit-title');
    const descEl = document.getElementById('dossier-outfit-desc');
    const silkEl = document.getElementById('dossier-spec-silk');
    const accEl = document.getElementById('dossier-spec-acc');
    const moodEl = document.getElementById('dossier-spec-mood');
    const adviceEl = document.getElementById('dossier-remix-advice');

    if (titleEl) titleEl.textContent = outfit.title;
    if (descEl) descEl.textContent = outfit.desc;
    if (silkEl) silkEl.textContent = `Lụa Tơ Tằm (${outfit.colorName})`;
    
    if (accEl) {
      const accMap: Record<string, string> = {
        QUAT_GIAY: 'Quạt Giấy Xếp',
        KHAN_RAN: 'Khăn Rằn Sông Nước',
        TRAM_GOM: 'Trâm Cài Gốm Vàng',
        TUI_GAM: 'Túi Gấm Thêu Hoa',
        NONE: 'Tối Giản Thuần Khiết'
      };
      accEl.textContent = accMap[outfit.accessory] || 'Quạt Giấy Xếp';
    }

    if (moodEl) {
      moodEl.textContent = outfit.garment === 'AO_NGU_THAN' ? 'Trang Nhã Đĩnh Đạc' : 'Mộc Mạc Khoáng Đạt';
    }

    if (adviceEl) {
      if (outfit.garment === 'AO_NGU_THAN') {
        adviceEl.textContent = `Phối tà ngũ thân sắc ${outfit.colorName} cùng phụ kiện tối giản, tạo phong thái Gen Z tự tin khi ${outfit.eventLabel.toLowerCase()}.`;
      } else {
        adviceEl.textContent = `Dáng áo bà ba buông rủ phóng khoáng, thích hợp mix cùng guốc mộc thanh hoặc túi cói cho dịp ${outfit.eventLabel.toLowerCase()}.`;
      }
    }
  }

  /**
   * Render Card Stack: 1 thẻ lớn ở giữa, 1-2 thẻ mờ xếp phía sau
   */
  public renderDeckStack(): void {
    const container = document.getElementById('lacquer-card-stack');
    if (!container) return;
    container.innerHTML = '';

    if (this.currentDeck.length === 0) {
      this.currentDeck = preferenceEngine.sortDeckByPreference(DISCOVERY_OUTFITS_POOL);
    }

    // Đồng bộ hồ sơ desktop với thẻ trên cùng
    if (this.currentDeck.length > 0) {
      this.updateDesktopDossier(this.currentDeck[0]);
    }

    const visibleCards = this.currentDeck.slice(0, 3);

    visibleCards.forEach((outfit, index) => {
      const card = document.createElement('article');
      card.className = `discovery-card card-base ${
        index === 0 ? 'card-top' : index === 1 ? 'card-behind-1' : 'card-behind-2'
      }`;
      card.dataset.outfitId = outfit.id;

      const score = preferenceEngine.calculateOutfitScore(outfit);
      const matchPct = Math.min(99, Math.max(72, Math.round(75 + score * 4)));

      card.innerHTML = `
        <div class="card-inner-top">
          <span class="card-match-pill">✨ ${matchPct}% hợp gu</span>
          <span class="card-tag-subtle">${outfit.eventLabel}</span>
        </div>

        <div class="card-illustration-box">
          <svg class="card-garment-svg" viewBox="0 0 280 340" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="sheen-${outfit.id}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.3" />
                <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.05" />
                <stop offset="100%" stop-color="#000000" stop-opacity="0.15" />
              </linearGradient>
            </defs>

            <!-- Vầng hào quang ngọc sương nhẹ -->
            <ellipse cx="140" cy="170" rx="95" ry="115" fill="rgba(74, 133, 119, 0.08)" />

            <!-- Gương mặt & búi tóc thanh thoát -->
            <path d="M 130,55 L 130,78 Q 140,74 150,78 L 150,55 Z" fill="#F7DCBF" stroke="#4A2E1B" stroke-width="1.2" />
            <ellipse cx="140" cy="50" rx="20" ry="24" fill="#F7DCBF" stroke="#4A2E1B" stroke-width="1.4" />
            <path d="M 120,50 C 120,24 160,24 160,50 C 160,34 120,34 120,50 Z" fill="#1C2B26" />
            <circle cx="140" cy="22" r="11" fill="#1C2B26" />
            <line x1="130" y1="20" x2="150" y2="20" stroke="#C9A66B" stroke-width="2" stroke-linecap="round" />

            <!-- Quần suông trắng ngà -->
            <path d="M 108,180 L 98,310 L 134,312 L 138,185 Z" fill="#F5F2EB" stroke="#D3CDC2" stroke-width="1" />
            <path d="M 172,180 L 182,310 L 146,312 L 142,185 Z" fill="#FAF7F0" stroke="#D3CDC2" stroke-width="1" />

            ${
              outfit.garment === 'AO_NGU_THAN'
                ? `
              <!-- Áo Ngũ Thân Lập Lĩnh Lụa Thanh -->
              <path d="M 115,82 Q 140,88 165,82 L 182,145 L 195,270 L 85,270 L 98,145 Z" fill="${outfit.color}" stroke="#1C2B26" stroke-width="1.6" />
              <path d="M 115,82 Q 140,88 165,82 L 182,145 L 195,270 L 85,270 L 98,145 Z" fill="url(#sheen-${outfit.id})" />
              <path d="M 115,85 L 75,115 L 72,185 L 94,180 L 98,145 Z" fill="${outfit.color}" stroke="#1C2B26" stroke-width="1.2" />
              <path d="M 165,85 L 205,115 L 208,185 L 186,180 L 182,145 Z" fill="${outfit.color}" stroke="#1C2B26" stroke-width="1.2" />
              <!-- Cổ lập lĩnh & cổ lót trắng -->
              <rect x="126" y="65" width="28" height="18" rx="3" fill="${outfit.color}" stroke="#1C2B26" stroke-width="1.4" />
              <rect x="129" y="66" width="22" height="4" fill="#F5F2EB" />
              <!-- Nẹp áo vắt chéo & 5 cúc vàng đất -->
              <path d="M 140,83 Q 156,105 160,128 L 160,205" fill="none" stroke="#1C2B26" stroke-width="1.4" />
              <circle cx="140" cy="82" r="2.8" fill="#C9A66B" stroke="#7A5338" stroke-width="0.8" />
              <circle cx="150" cy="98" r="2.8" fill="#C9A66B" stroke="#7A5338" stroke-width="0.8" />
              <circle cx="158" cy="118" r="2.8" fill="#C9A66B" stroke="#7A5338" stroke-width="0.8" />
              <circle cx="160" cy="146" r="2.8" fill="#C9A66B" stroke="#7A5338" stroke-width="0.8" />
              <circle cx="160" cy="180" r="2.8" fill="#C9A66B" stroke="#7A5338" stroke-width="0.8" />
            `
                : `
              <!-- Áo Bà Ba Thanh Thoát -->
              <path d="M 116,84 Q 140,94 164,84 L 178,140 L 188,255 L 92,255 L 102,140 Z" fill="${outfit.color}" stroke="#1C2B26" stroke-width="1.6" />
              <path d="M 116,84 Q 140,94 164,84 L 178,140 L 188,255 L 92,255 L 102,140 Z" fill="url(#sheen-${outfit.id})" />
              <path d="M 116,86 L 76,115 L 74,185 L 98,180 L 102,140 Z" fill="${outfit.color}" stroke="#1C2B26" stroke-width="1.2" />
              <path d="M 164,86 L 204,115 L 206,185 L 182,180 L 178,140 Z" fill="${outfit.color}" stroke="#1C2B26" stroke-width="1.2" />
              <line x1="140" y1="94" x2="140" y2="252" stroke="#1C2B26" stroke-width="1.4" />
              <circle cx="140" cy="115" r="2.4" fill="#C9A66B" />
              <circle cx="140" cy="140" r="2.4" fill="#C9A66B" />
              <circle cx="140" cy="165" r="2.4" fill="#C9A66B" />
              <circle cx="140" cy="190" r="2.4" fill="#C9A66B" />
              <circle cx="140" cy="215" r="2.4" fill="#C9A66B" />
              <!-- Túi áo mộc -->
              <rect x="114" y="210" width="16" height="20" rx="2" fill="${outfit.color}" stroke="#1C2B26" stroke-width="1" />
              <rect x="150" y="210" width="16" height="20" rx="2" fill="${outfit.color}" stroke="#1C2B26" stroke-width="1" />
            `
            }

            ${
              outfit.accessory === 'KHAN_RAN'
                ? `
              <path d="M 126,88 L 122,215 L 132,215 L 134,92 Z" fill="#F5F2EB" stroke="#1C2B26" stroke-width="1" />
              <path d="M 154,88 L 158,215 L 148,215 L 146,92 Z" fill="#F5F2EB" stroke="#1C2B26" stroke-width="1" />
              <line x1="124" y1="130" x2="132" y2="130" stroke="#1C2B26" stroke-width="1.5" />
              <line x1="123" y1="160" x2="131" y2="160" stroke="#1C2B26" stroke-width="1.5" />
              <line x1="150" y1="130" x2="157" y2="130" stroke="#1C2B26" stroke-width="1.5" />
              <line x1="150" y1="160" x2="157" y2="160" stroke="#1C2B26" stroke-width="1.5" />
            `
                : `
              <g transform="translate(194, 185) rotate(-20) scale(0.65)">
                <path d="M -40,-35 Q 0,-65 40,-35 L 25,-15 Q 0,-30 -25,-15 Z" fill="#F5F2EB" stroke="#C9A66B" stroke-width="1.2" />
                <path d="M -15,-40 Q 0,-50 15,-38" stroke="#4A8577" stroke-width="1.8" fill="none" />
              </g>
            `
            }
          </svg>

          <div class="card-stamp-feedback card-stamp-like">THÍCH</div>
          <div class="card-stamp-feedback card-stamp-dislike">BỎ QUA</div>
        </div>

        <div class="card-inner-bottom">
          <h3 class="card-garment-name">${outfit.title}</h3>
          <p class="card-short-desc">${outfit.desc}</p>
        </div>
      `;

      if (index === 0) {
        this.attachSwipeHandlers(card, outfit);
      } else {
        card.style.cursor = 'pointer';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('title', `Chạm để đưa ${outfit.title} vào Xưởng Phối`);
        card.addEventListener('click', () => {
          Sound.playChime();
          card.style.transform = 'scale(0.96)';
          setTimeout(() => {
            card.style.transform = '';
            if (this.onRemixCallback) {
              this.onRemixCallback(outfit);
            }
          }, 120);
        });
      }

      container.appendChild(card);
    });
  }

  /**
   * Đính kèm cử chỉ vuốt thẻ bằng con trỏ / cảm ứng
   */
  private attachSwipeHandlers(cardEl: HTMLElement, outfit: DiscoveryOutfit): void {
    this.activeCardElement = cardEl;
    cardEl.style.cursor = 'grab';
    cardEl.setAttribute('role', 'button');
    cardEl.setAttribute('tabindex', '0');
    cardEl.setAttribute('title', `Chạm để đưa ${outfit.title} vào Xưởng Phối (hoặc vuốt để thích/bỏ qua)`);

    const stampLike = cardEl.querySelector('.card-stamp-like') as HTMLElement | null;
    const stampDislike = cardEl.querySelector('.card-stamp-dislike') as HTMLElement | null;

    const onPointerMove = (e: PointerEvent) => {
      if (!this.isDraggingCard || this.isAnimating) return;
      this.cardCurrentX = e.clientX - this.dragStartX;
      this.cardCurrentY = e.clientY - this.dragStartY;

      const rotateDeg = this.cardCurrentX * 0.06;
      cardEl.style.transform = `translate(${this.cardCurrentX}px, ${this.cardCurrentY}px) rotate(${rotateDeg}deg)`;

      if (this.cardCurrentX > 25) {
        const ratio = Math.min((this.cardCurrentX - 25) / 60, 1);
        if (stampLike) stampLike.style.opacity = ratio.toString();
        if (stampDislike) stampDislike.style.opacity = '0';
      } else if (this.cardCurrentX < -25) {
        const ratio = Math.min((-this.cardCurrentX - 25) / 60, 1);
        if (stampDislike) stampDislike.style.opacity = ratio.toString();
        if (stampLike) stampLike.style.opacity = '0';
      } else {
        if (stampLike) stampLike.style.opacity = '0';
        if (stampDislike) stampDislike.style.opacity = '0';
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!this.isDraggingCard || this.isAnimating) return;
      this.isDraggingCard = false;
      cardEl.releasePointerCapture?.(e.pointerId);

      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);

      const dragDist = Math.hypot(this.cardCurrentX, this.cardCurrentY);

      // Chạm nhẹ vào thẻ (< 15px di chuyển) -> Điều hướng trực tiếp sang màn Phối Đồ
      if (dragDist < 15) {
        Sound.playChime();
        cardEl.style.transition = 'transform 0.16s ease';
        cardEl.style.transform = 'scale(0.96)';
        setTimeout(() => {
          cardEl.style.transform = 'scale(1)';
          if (this.onRemixCallback) {
            this.onRemixCallback(outfit);
          }
        }, 120);

        this.cardCurrentX = 0;
        this.cardCurrentY = 0;
        return;
      }

      if (this.cardCurrentX > 90) {
        this.actionLike(outfit);
      } else if (this.cardCurrentX < -90) {
        this.actionDislike(outfit);
      } else {
        cardEl.style.transition = 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)';
        cardEl.style.transform = 'translate(0px, 0px) rotate(0deg)';
        if (stampLike) stampLike.style.opacity = '0';
        if (stampDislike) stampDislike.style.opacity = '0';
      }

      this.cardCurrentX = 0;
      this.cardCurrentY = 0;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (this.isAnimating) return;
      this.isDraggingCard = true;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
      cardEl.setPointerCapture?.(e.pointerId);
      cardEl.style.transition = 'none';

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    };

    cardEl.addEventListener('pointerdown', onPointerDown);
  }

  /**
   * Hành động THÍCH:
   * Phản hồi thị giác ngay lập tức: scale nhẹ rồi trượt sang phải trước khi thẻ tiếp theo xuất hiện
   */
  public actionLike(outfit: DiscoveryOutfit): void {
    if (this.isAnimating || !this.activeCardElement) return;
    this.isAnimating = true;
    Sound.playChime();

    const card = this.activeCardElement;
    card.classList.add('card-anim-like');

    preferenceEngine.recordPreference(outfit, 'LIKE');
    wardrobeManager.saveWardrobeOutfit(outfit);

    setTimeout(() => {
      this.currentDeck.shift();
      this.isAnimating = false;
      this.renderDeckStack();
    }, 380);
  }

  /**
   * Hành động BỎ QUA:
   * Phản hồi thị giác tức thì: trượt sang trái
   */
  public actionDislike(outfit: DiscoveryOutfit): void {
    if (this.isAnimating || !this.activeCardElement) return;
    this.isAnimating = true;
    Sound.playClick();

    const card = this.activeCardElement;
    card.classList.add('card-anim-dislike');

    preferenceEngine.recordPreference(outfit, 'DISLIKE');

    setTimeout(() => {
      this.currentDeck.shift();
      this.isAnimating = false;
      this.renderDeckStack();
    }, 350);
  }

  /**
   * Hành động XÁO LẠI (Reshuffle):
   * Đảo thứ tự xấp thẻ và xoay nhẹ thẻ với phản hồi tức thì
   */
  public actionReshuffle(): void {
    if (this.isAnimating || !this.activeCardElement) return;
    this.isAnimating = true;
    Sound.playClick();

    const card = this.activeCardElement;
    card.classList.add('card-anim-reshuffle');

    // Xáo trộn mảng thẻ
    const shuffled = [...this.currentDeck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    this.currentDeck = shuffled;

    setTimeout(() => {
      this.isAnimating = false;
      this.renderDeckStack();
    }, 300);
  }

  /**
   * Gắn sự kiện cho 3 nút tròn phía dưới
   */
  private setupSwipeButtons(): void {
    const btnDislike = document.getElementById('btn-swipe-dislike');
    const btnReshuffle = document.getElementById('btn-swipe-remix');
    const btnLike = document.getElementById('btn-swipe-like');

    btnDislike?.addEventListener('click', () => {
      if (this.currentDeck.length > 0) {
        this.actionDislike(this.currentDeck[0]);
      }
    });

    btnReshuffle?.addEventListener('click', () => {
      this.actionReshuffle();
    });

    btnLike?.addEventListener('click', () => {
      if (this.currentDeck.length > 0) {
        this.actionLike(this.currentDeck[0]);
      }
    });

    // Nút "Đưa vào Xưởng Phối Ngay" trên Desktop Dossier
    const btnDossierRemix = document.getElementById('btn-dossier-remix-now');
    btnDossierRemix?.addEventListener('click', () => {
      if (this.currentDeck.length > 0 && this.onRemixCallback) {
        Sound.playChime();
        this.onRemixCallback(this.currentDeck[0]);
      }
    });

    // Phím tắt bàn phím cho Desktop: ← Bỏ qua, → Thích, Phím Cách Xáo lại
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      const discoverScene = document.getElementById('discover-scene');
      const step2 = document.getElementById('discover-stack-step');
      if (!discoverScene?.classList.contains('scene-active')) return;
      if (step2?.classList.contains('step-hidden')) return;
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (this.currentDeck.length > 0) {
          this.actionDislike(this.currentDeck[0]);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (this.currentDeck.length > 0) {
          this.actionLike(this.currentDeck[0]);
        }
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        this.actionReshuffle();
      }
    });
  }
}

export const swipeEngine = new SwipeEngine();
