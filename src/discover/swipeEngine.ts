import { DiscoveryOutfit } from '../types/index.ts';
import { Sound } from '../audio/sound.ts';
import { preferenceEngine } from './preferenceLearning.ts';
import { wardrobeManager } from './wardrobeManager.ts';

export const DISCOVERY_OUTFITS_POOL: DiscoveryOutfit[] = [
  {
    id: 'outfit-1',
    title: 'Áo Ngũ Thân Red Son',
    garment: 'AO_NGU_THAN',
    color: '#B22222',
    colorName: 'Đỏ Son',
    event: 'tet',
    eventLabel: 'Dạo Phố Tết',
    accessory: 'QUAT_GIAY',
    seal: '吉',
    desc: 'Sắc son thắm kết hợp quạt giấy xếp thư pháp đón mùa xuân thịnh vượng.'
  },
  {
    id: 'outfit-2',
    title: 'Bà Ba Nam Bộ Xanh Chàm',
    garment: 'AO_BA_BA',
    color: '#1D3557',
    colorName: 'Xanh Chàm',
    event: 'grad',
    eventLabel: 'Lễ Cử Nghiệp',
    accessory: 'KHAN_RAN',
    seal: '藝',
    desc: 'Áo bà ba thẫm màu chàm phối khăn rằn mộc mạc, đậm chất phù sa Nam Bộ.'
  },
  {
    id: 'outfit-3',
    title: 'Ngũ Thân Hoàng Cúc Cố Đô',
    garment: 'AO_NGU_THAN',
    color: '#E5A93C',
    colorName: 'Hoàng Cúc',
    event: 'tet',
    eventLabel: 'Du Xuân Kinh Thành',
    accessory: 'QUAT_GIAY',
    seal: '錦',
    desc: 'Ánh vàng hoàng cung rực rỡ tượng trưng cho phú quý, quyền uy và lòng trung hiếu.'
  },
  {
    id: 'outfit-4',
    title: 'Áo Ngũ Thân Cánh Gián Thiền Môn',
    garment: 'AO_NGU_THAN',
    color: '#2B1A12',
    colorName: 'Cánh Gián',
    event: 'temple',
    eventLabel: 'Cầu An Chùa Cổ',
    accessory: 'QUAT_GIAY',
    seal: '安',
    desc: 'Màu nâu cánh gián trầm tĩnh của đất mẹ, hòa vào tiếng chuông đồng tịch mịch an yên.'
  },
  {
    id: 'outfit-5',
    title: 'Bà Ba Đỏ Son Hội Phố',
    garment: 'AO_BA_BA',
    color: '#B22222',
    colorName: 'Đỏ Son',
    event: 'tet',
    eventLabel: 'Trẩy Hội Sông Nước',
    accessory: 'KHAN_RAN',
    seal: '福',
    desc: 'Áo bà ba xẻ tà phóng khoáng tôn vinh nét đẹp khỏe khoắn, tươi tắn của tuổi trẻ phương Nam.'
  },
  {
    id: 'outfit-6',
    title: 'Ngũ Thân Xanh Chàm Uyên Bác',
    garment: 'AO_NGU_THAN',
    color: '#1D3557',
    colorName: 'Xanh Chàm',
    event: 'grad',
    eventLabel: 'Vinh Quy Bái Tổ',
    accessory: 'QUAT_GIAY',
    seal: '文',
    desc: 'Sắc chàm thâm trầm như mực son thư phòng, dáng áo ngũ thân ngay ngắn đoan trang.'
  },
  {
    id: 'outfit-7',
    title: 'Áo Ngũ Thân Trắng Bưởi Tinh Khôi',
    garment: 'AO_NGU_THAN',
    color: '#F5F2EB',
    colorName: 'Trắng Bưởi',
    event: 'grad',
    eventLabel: 'Lễ Trưởng Thành',
    accessory: 'QUAT_GIAY',
    seal: '雅',
    desc: 'Sắc trắng ngà thanh tao như hoa bưởi tháng Ba, nét đoan trang thuần khiết tuổi hoa niên.'
  },
  {
    id: 'outfit-8',
    title: 'Bà Ba Hoàng Cúc Mùa Gặt',
    garment: 'AO_BA_BA',
    color: '#E5A93C',
    colorName: 'Hoàng Cúc',
    event: 'tet',
    eventLabel: 'Mùa Vàng Bội Thu',
    accessory: 'KHAN_RAN',
    seal: '豐',
    desc: 'Màu vàng óng ả của đồng lúa chín miền Tây, rộn ràng hương thơm trù phú ấm no.'
  },
  {
    id: 'outfit-9',
    title: 'Bà Ba Cánh Gián Miệt Vườn',
    garment: 'AO_BA_BA',
    color: '#2B1A12',
    colorName: 'Cánh Gián',
    event: 'temple',
    eventLabel: 'Viếng Cảnh Chùa Quê',
    accessory: 'KHAN_RAN',
    seal: '心',
    desc: 'Màu cánh gián mộc mạc chân phương, hòa mình vào sông nước tĩnh lặng bình yên.'
  }
];

export class SwipeEngine {
  public currentDeck: DiscoveryOutfit[] = [];
  private isDraggingCard: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private cardCurrentX: number = 0;
  private cardCurrentY: number = 0;
  private activeCardElement: HTMLElement | null = null;
  private onRemixCallback: ((outfit: DiscoveryOutfit) => void) | null = null;

  public init(onRemix: (outfit: DiscoveryOutfit) => void): void {
    this.onRemixCallback = onRemix;
    this.currentDeck = preferenceEngine.sortDeckByPreference(DISCOVERY_OUTFITS_POOL);
    this.setupSwipeButtons();
    this.renderDeckStack();
  }

  public renderDeckStack(): void {
    const container = document.getElementById('lacquer-card-stack');
    if (!container) return;
    container.innerHTML = '';

    if (this.currentDeck.length === 0) {
      this.currentDeck = preferenceEngine.sortDeckByPreference(DISCOVERY_OUTFITS_POOL);
    }

    const visibleCards = this.currentDeck.slice(0, 3);

    visibleCards.forEach((outfit, index) => {
      const card = document.createElement('article');
      card.className = `lacquer-card ${index === 0 ? 'card-top' : index === 1 ? 'card-behind-1' : 'card-behind-2'}`;
      card.dataset.outfitId = outfit.id;

      const score = preferenceEngine.calculateOutfitScore(outfit);
      const matchPct = Math.min(99, Math.max(65, Math.round(70 + score * 4)));

      card.innerHTML = `
        <div class="card-top-bar">
          <span class="seal-badge" style="background:#B22222; border-color:#E5A93C;">${outfit.seal}</span>
          <span class="card-match-badge">🎯 ${matchPct}% Hợp Gu</span>
          <span class="card-event-badge">${outfit.eventLabel}</span>
        </div>

        <div class="card-preview-area">
          <svg class="card-svg-preview" viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg">
            <circle cx="150" cy="200" r="110" fill="none" stroke="rgba(229,169,60,0.3)" stroke-width="1.5" stroke-dasharray="6,4" />
            <ellipse cx="150" cy="85" rx="22" ry="26" fill="#F7DCBF" stroke="#4A2E1B" stroke-width="1.5" />
            <path d="M 130,85 C 130,55 170,55 170,85 Z" fill="#1C1817" />
            
            ${
              outfit.garment === 'AO_NGU_THAN'
                ? `
              <path d="M 130,135 Q 150,140 170,135 L 185,200 L 195,350 L 105,350 L 115,200 Z" fill="${outfit.color}" stroke="#121110" stroke-width="2" />
              <path d="M 130,138 L 98,160 L 98,240 L 115,240 L 115,200 Z" fill="${outfit.color}" stroke="#121110" stroke-width="1.5" filter="brightness(0.92)" />
              <path d="M 170,138 L 202,160 L 202,240 L 185,240 L 185,200 Z" fill="${outfit.color}" stroke="#121110" stroke-width="1.5" filter="brightness(0.92)" />
              <rect x="138" y="112" width="24" height="22" rx="4" fill="${outfit.color}" stroke="#121110" stroke-width="1.6" />
              <path d="M 150,134 Q 166,155 170,180 L 170,270" fill="none" stroke="#121110" stroke-width="1.8" />
              <circle cx="150" cy="132" r="3" fill="#E5A93C" stroke="#7A5338" stroke-width="1" />
              <circle cx="160" cy="148" r="3" fill="#E5A93C" stroke="#7A5338" stroke-width="1" />
              <circle cx="168" cy="170" r="3" fill="#E5A93C" stroke="#7A5338" stroke-width="1" />
              <circle cx="170" cy="205" r="3" fill="#E5A93C" stroke="#7A5338" stroke-width="1" />
              <circle cx="170" cy="245" r="3" fill="#E5A93C" stroke="#7A5338" stroke-width="1" />
            `
                : `
              <path d="M 130,132 Q 150,150 170,132 L 182,195 L 192,345 L 108,345 L 118,195 Z" fill="${outfit.color}" stroke="#121110" stroke-width="2" />
              <path d="M 130,135 L 96,160 L 96,240 L 115,240 L 118,195 Z" fill="${outfit.color}" stroke="#121110" stroke-width="1.5" filter="brightness(0.92)" />
              <path d="M 170,135 L 204,160 L 204,240 L 185,240 L 182,195 Z" fill="${outfit.color}" stroke="#121110" stroke-width="1.5" filter="brightness(0.92)" />
              <line x1="150" y1="148" x2="150" y2="340" stroke="#121110" stroke-width="1.8" />
              <circle cx="150" cy="170" r="2.8" fill="#E5A93C" />
              <circle cx="150" cy="200" r="2.8" fill="#E5A93C" />
              <circle cx="150" cy="230" r="2.8" fill="#E5A93C" />
              <circle cx="150" cy="260" r="2.8" fill="#E5A93C" />
              <rect x="122" y="275" width="20" height="24" rx="3" fill="${outfit.color}" stroke="#121110" stroke-width="1.4" filter="brightness(0.95)" />
              <rect x="158" y="275" width="20" height="24" rx="3" fill="${outfit.color}" stroke="#121110" stroke-width="1.4" filter="brightness(0.95)" />
            `
            }

            ${
              outfit.accessory === 'KHAN_RAN'
                ? `
              <path d="M 138,135 L 133,265 L 144,265 L 147,142 Z" fill="#F5F2EB" stroke="#2B1A12" stroke-width="1.2" />
              <path d="M 162,135 L 167,265 L 156,265 L 153,142 Z" fill="#F5F2EB" stroke="#2B1A12" stroke-width="1.2" />
              <line x1="135" y1="180" x2="145" y2="180" stroke="#121110" stroke-width="1" />
              <line x1="134" y1="210" x2="144" y2="210" stroke="#121110" stroke-width="1" />
              <line x1="155" y1="180" x2="165" y2="180" stroke="#121110" stroke-width="1" />
              <line x1="156" y1="210" x2="166" y2="210" stroke="#121110" stroke-width="1" />
            `
                : `
              <g transform="translate(192, 235) rotate(-20) scale(0.7)">
                <path d="M -40,-35 Q 0,-65 40,-35 L 25,-15 Q 0,-30 -25,-15 Z" fill="#F5F2EB" stroke="#CFC8B8" stroke-width="1.5" />
                <path d="M -15,-40 Q 0,-50 15,-38" stroke="#B22222" stroke-width="2" fill="none" />
              </g>
            `
            }
          </svg>

          <div class="swipe-stamp stamp-like">THÍCH</div>
          <div class="swipe-stamp stamp-dislike">BỎ QUA</div>
          <div class="swipe-stamp stamp-remix">REMIX</div>
        </div>

        <div class="card-info-bottom">
          <h3 class="card-outfit-title">${outfit.title}</h3>
          <div class="card-palette-row">
            <span class="card-color-dot" style="background:${outfit.color};"></span>
            <span>Sắc: ${outfit.colorName}</span>
            <span style="opacity:0.4;">•</span>
            <span>${outfit.garment === 'AO_NGU_THAN' ? 'Áo Ngũ Thân' : 'Áo Bà Ba'}</span>
          </div>
        </div>
      `;

      if (index === 0) {
        this.attachSwipeHandlers(card, outfit);
      }

      container.appendChild(card);
    });
  }

  private attachSwipeHandlers(cardEl: HTMLElement, outfit: DiscoveryOutfit): void {
    this.activeCardElement = cardEl;

    const stampLike = cardEl.querySelector('.stamp-like') as HTMLElement | null;
    const stampDislike = cardEl.querySelector('.stamp-dislike') as HTMLElement | null;
    const stampRemix = cardEl.querySelector('.stamp-remix') as HTMLElement | null;

    const onPointerMove = (e: PointerEvent) => {
      if (!this.isDraggingCard) return;
      this.cardCurrentX = e.clientX - this.dragStartX;
      this.cardCurrentY = e.clientY - this.dragStartY;

      const rotateDeg = this.cardCurrentX * 0.08;
      cardEl.style.transform = `translate(${this.cardCurrentX}px, ${this.cardCurrentY}px) rotate(${rotateDeg}deg)`;

      if (this.cardCurrentX > 30) {
        const ratio = Math.min((this.cardCurrentX - 30) / 70, 1);
        if (stampLike) stampLike.style.opacity = ratio.toString();
        if (stampDislike) stampDislike.style.opacity = '0';
        if (stampRemix) stampRemix.style.opacity = '0';
      } else if (this.cardCurrentX < -30) {
        const ratio = Math.min((-this.cardCurrentX - 30) / 70, 1);
        if (stampDislike) stampDislike.style.opacity = ratio.toString();
        if (stampLike) stampLike.style.opacity = '0';
        if (stampRemix) stampRemix.style.opacity = '0';
      } else if (this.cardCurrentY < -40) {
        const ratio = Math.min((-this.cardCurrentY - 40) / 70, 1);
        if (stampRemix) stampRemix.style.opacity = ratio.toString();
        if (stampLike) stampLike.style.opacity = '0';
        if (stampDislike) stampDislike.style.opacity = '0';
      } else {
        if (stampLike) stampLike.style.opacity = '0';
        if (stampDislike) stampDislike.style.opacity = '0';
        if (stampRemix) stampRemix.style.opacity = '0';
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!this.isDraggingCard) return;
      this.isDraggingCard = false;
      cardEl.releasePointerCapture?.(e.pointerId);

      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);

      if (this.cardCurrentX > 100) {
        this.swipeCardOut('RIGHT', outfit);
      } else if (this.cardCurrentX < -100) {
        this.swipeCardOut('LEFT', outfit);
      } else if (this.cardCurrentY < -100) {
        this.swipeCardOut('UP', outfit);
      } else {
        cardEl.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)';
        cardEl.style.transform = 'translate(0px, 0px) rotate(0deg)';
        if (stampLike) stampLike.style.opacity = '0';
        if (stampDislike) stampDislike.style.opacity = '0';
        if (stampRemix) stampRemix.style.opacity = '0';
      }

      this.cardCurrentX = 0;
      this.cardCurrentY = 0;
    };

    const onPointerDown = (e: PointerEvent) => {
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

  public swipeCardOut(direction: 'RIGHT' | 'LEFT' | 'UP', outfit: DiscoveryOutfit): void {
    if (!this.activeCardElement) return;
    const card = this.activeCardElement;
    card.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.4s ease';

    if (direction === 'RIGHT') {
      Sound.playChime();
      card.style.transform = 'translate(600px, 40px) rotate(35deg)';
      card.style.opacity = '0';
      preferenceEngine.recordPreference(outfit, 'LIKE');
      wardrobeManager.saveWardrobeOutfit(outfit);
    } else if (direction === 'LEFT') {
      Sound.playClick();
      card.style.transform = 'translate(-600px, 40px) rotate(-35deg)';
      card.style.opacity = '0';
      preferenceEngine.recordPreference(outfit, 'DISLIKE');
    } else if (direction === 'UP') {
      Sound.playChime();
      card.style.transform = 'translate(0px, -650px) rotate(0deg)';
      card.style.opacity = '0';
      if (this.onRemixCallback) {
        this.onRemixCallback(outfit);
      }
      return;
    }

    setTimeout(() => {
      this.currentDeck.shift();
      this.renderDeckStack();
    }, 350);
  }

  private setupSwipeButtons(): void {
    const btnDislike = document.getElementById('btn-swipe-dislike');
    const btnRemix = document.getElementById('btn-swipe-remix');
    const btnLike = document.getElementById('btn-swipe-like');

    btnDislike?.addEventListener('click', () => {
      if (this.currentDeck.length > 0) this.swipeCardOut('LEFT', this.currentDeck[0]);
    });

    btnLike?.addEventListener('click', () => {
      if (this.currentDeck.length > 0) this.swipeCardOut('RIGHT', this.currentDeck[0]);
    });

    btnRemix?.addEventListener('click', () => {
      if (this.currentDeck.length > 0) this.swipeCardOut('UP', this.currentDeck[0]);
    });
  }
}

export const swipeEngine = new SwipeEngine();
