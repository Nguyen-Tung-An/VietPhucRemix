import { DiscoveryOutfit } from '../types/index.ts';
import { Sound } from '../audio/sound.ts';
import { wardrobeManager } from './wardrobeManager.ts';
import { assetConfig } from '../config/assetConfig.ts';

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
    creatorName: 'Minh Thảo @GenZ Huế',
    garment: 'AO_NGU_THAN',
    garmentLabel: 'Áo Ngũ Thân Lập Lĩnh',
    color: '#F4C9D6',
    colorName: 'Hồng Phấn Sen',
    event: 'tet',
    eventLabel: 'Dạo phố Tết',
    bestOccasion: 'Dạo Phố Du Xuân & Check-in Phố Cổ',
    patternName: 'Lụa Tơ Tằm Hà Đông',
    mood: 'Thanh Tao Nhã Nhặn',
    hairstyle: 'Búi Tóc Cài Trâm Bạc',
    accessory: 'QUAT_GIAY',
    accessoryLabel: 'Quạt Giấy Xếp Trúc',
    seal: 'Lụa',
    desc: 'Tà ngũ thân năm thân lụa mềm mại dệt thủ công sắc hồng phấn sen, tôn phong thái tao nhã đón nắng mai.',
    imageUrl: '/images/garments/ao-ngu-than.jpg'
  },
  {
    id: 'outfit-2',
    title: 'Áo Nhật Bình Hoàng Triều Ngũ Sắc',
    creatorName: 'Hoàng Long @DiSảnViệt',
    garment: 'AO_NHAT_BINH',
    garmentLabel: 'Áo Nhật Bình Cung Đình',
    color: '#C9A66B',
    colorName: 'Vàng Đất Cố Đô',
    event: 'festival',
    eventLabel: 'Đại Lễ Cung Đình',
    bestOccasion: 'Đại Lễ Cung Đình & Sự Kiện Trọng Thể',
    patternName: 'Gấm Hoa Mây Ngũ Sắc',
    mood: 'Vương Giả Quý Tộc',
    hairstyle: 'Khăn Vành Dây Ngũ Sắc',
    accessory: 'TRAM_GOM',
    accessoryLabel: 'Trâm Cài Gốm Mạ Vàng',
    seal: 'Vương',
    desc: 'Viền cổ ngũ sắc thêu hoa mẫu đơn và phượng hoàng, phong vị hoàng gia triều Nguyễn uy nghi.',
    imageUrl: '/images/garments/ao-nhat-binh.jpg'
  },
  {
    id: 'outfit-3',
    title: 'Áo Tấc Đại Lễ Xanh Chàm',
    creatorName: 'Bảo Nghi @CốĐô',
    garment: 'AO_TAC',
    garmentLabel: 'Áo Tấc Tay Thụng',
    color: '#1D3557',
    colorName: 'Xanh Chàm Đêm',
    event: 'grad',
    eventLabel: 'Lễ Trọng Thể',
    bestOccasion: 'Lễ Tốt Nghiệp & Nghi Lễ Trưởng Thành',
    patternName: 'Sa Nam Dệt Chìm',
    mood: 'Trang Nghiêm Trí Tuệ',
    hairstyle: 'Khăn Đóng Truyền Thống',
    accessory: 'QUAT_GIAY',
    accessoryLabel: 'Quạt Xếp Gỗ Trầm',
    seal: 'Trọng',
    desc: 'Tay thụng rộng trang nghiêm tôn phong thái uy nghiêm, nho nhã và tri thức truyền đời.',
    imageUrl: '/images/garments/ao-tac.jpg'
  },
  {
    id: 'outfit-4',
    title: 'Áo Tứ Thân Kinh Bắc Yếm Đào',
    creatorName: 'Hải Yến @QuanHọ',
    garment: 'AO_TU_THAN',
    garmentLabel: 'Áo Tứ Thân Kinh Bắc',
    color: '#B22222',
    colorName: 'Đỏ Son Đại Triều',
    event: 'festival',
    eventLabel: 'Lễ Hội Quan Họ',
    bestOccasion: 'Lễ Hội Dân Gian & Hát Trống Quân',
    patternName: 'Tơ Tằm Nhuộm Củ Nâu & Son',
    mood: 'Duyên Dáng Dân Gian',
    hairstyle: 'Khăn Mỏ Quạ & Vấn Độn',
    accessory: 'NON_QUAI_THAO',
    accessoryLabel: 'Nón Quai Thao Quai Dệt',
    seal: 'Hội',
    desc: 'Bốn vạt lụa buông rủ thắt nút duyên dáng trước bụng cùng nón quai thao trứ danh xứ Kinh Bắc.',
    imageUrl: '/images/garments/ao-tu-than.png'
  },
  {
    id: 'outfit-5',
    title: 'Áo Bà Ba Nam Bộ Phù Sa',
    creatorName: 'Phương Nam @MiềnTây',
    garment: 'AO_BA_BA',
    garmentLabel: 'Áo Bà Ba Nam Bộ',
    color: '#4A8577',
    colorName: 'Xanh Ngọc Phù Sa',
    event: 'tet',
    eventLabel: 'Du Xuân Sông Nước',
    bestOccasion: 'Du Xuân Sông Nước & Dã Ngoại',
    patternName: 'Vải Ú Lụa Mộc Nam Bộ',
    mood: 'Khoáng Đạt Mộc Mạc',
    hairstyle: 'Tóc Buộc Nửa Đầu Dịu Dàng',
    accessory: 'KHAN_RAN',
    accessoryLabel: 'Khăn Rằn Sọc Nam Bộ',
    seal: 'Mộc',
    desc: 'Chất liệu lụa tơ mềm mát, xẻ tà phóng khoáng cùng khăn rằn mộc mạc sông nước phương Nam.',
    imageUrl: '/images/garments/ao-ba-ba.jpg'
  },
  {
    id: 'outfit-6',
    title: 'Áo Dài Lemur Thập Niên 1930',
    creatorName: 'Khánh An @HàThành',
    garment: 'AO_DAI_LEMUR',
    garmentLabel: 'Áo Dài Lemur Tân Thời',
    color: '#E8F3EE',
    colorName: 'Ngọc Sương Ban Mai',
    event: 'yearbook',
    eventLabel: 'Chụp Kỷ Yếu & Nghệ Thuật',
    bestOccasion: 'Chụp Kỷ Yếu Nghệ Thuật & Dạ Tiệc',
    patternName: 'Lụa Voan Thêu Hoa Nhỏ',
    mood: 'Tân Thời Quý Phái',
    hairstyle: 'Tóc Uốn Sóng Cổ Điển 1930s',
    accessory: 'CHUOI_NGOC',
    accessoryLabel: 'Chuỗi Ngọc Trai Cổ',
    seal: 'Tân',
    desc: 'Âm hưởng tân thời đầu thế kỷ 20 với bờ vai bồng thanh lịch, chiết eo nhẹ tôn vóc dáng thiếu nữ.',
    imageUrl: '/images/garments/ao-dai-lemur.png'
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
    // Vào thẳng trang explore không qua phân loại bối cảnh hay trang phục
    this.currentDeck = [...DISCOVERY_OUTFITS_POOL];
    this.setupSwipeButtons();
    this.renderDeckStack();
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

    // Lọc deck theo bối cảnh
    const filtered = DISCOVERY_OUTFITS_POOL.filter(
      (item) => item.event === eventKey || item.event === 'tet'
    );
    this.currentDeck = filtered.length >= 3 ? filtered : [...DISCOVERY_OUTFITS_POOL];

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
   * Cập nhật thông tin Hồ Sơ Cổ Phục & Bento Box trên giao diện Desktop
   * Hoàn toàn data-driven, ánh xạ chính xác các option từ Xưởng Phối
   */
  private updateDesktopDossier(outfit: DiscoveryOutfit): void {
    const creatorEl = document.getElementById('dossier-creator-name');
    const titleEl = document.getElementById('dossier-outfit-title');
    const descEl = document.getElementById('dossier-outfit-desc');
    const colorDot = document.getElementById('dossier-color-dot');
    const colorHex = document.getElementById('dossier-color-hex');
    const colorName = document.getElementById('dossier-color-name');
    const moodEl = document.getElementById('dossier-spec-mood');
    const garmentEl = document.getElementById('dossier-spec-garment');
    const materialEl = document.getElementById('dossier-spec-material');
    const occasionEl = document.getElementById('dossier-spec-occasion');
    const stylingEl = document.getElementById('dossier-spec-styling');
    const adviceEl = document.getElementById('dossier-remix-advice');

    if (creatorEl) creatorEl.textContent = `✨ Phối bởi: ${outfit.creatorName || 'Cộng đồng Việt Y Remix'}`;
    if (titleEl) titleEl.textContent = outfit.title;
    if (descEl) descEl.textContent = outfit.desc;

    // 1. Ô Mã Màu & Sắc Lụa
    if (colorDot) colorDot.style.backgroundColor = outfit.color;
    if (colorHex) colorHex.textContent = outfit.color.toUpperCase();
    if (colorName) colorName.textContent = outfit.colorName;

    // 2. Ô Phong Thái (Input Mood/Vibe)
    if (moodEl) moodEl.textContent = outfit.mood || 'Thanh Tao Nhã Nhặn';

    // 3. Ô Kiểu Dáng Cổ Phục
    if (garmentEl) garmentEl.textContent = outfit.garmentLabel || outfit.title;

    // 4. Ô Chất Liệu & Hoa Văn
    if (materialEl) materialEl.textContent = outfit.patternName || 'Lụa Tơ Tằm Tự Nhiên';

    // 5. Ô Bối Cảnh Phù Hợp Nhất
    if (occasionEl) occasionEl.textContent = outfit.bestOccasion || outfit.eventLabel;

    // 6. Ô Phụ Kiện & Kiểu Tóc Phối Kèm
    if (stylingEl) {
      const acc = outfit.accessoryLabel || (outfit.accessory === 'QUAT_GIAY' ? 'Quạt Giấy Xếp' : 'Phụ Kiện Di Sản');
      const hair = outfit.hairstyle || 'Tóc Búi Cài Trâm';
      stylingEl.textContent = `${acc} • ${hair}`;
    }

    // 7. Gợi ý remix đương đại
    if (adviceEl) {
      if (outfit.garment === 'AO_NGU_THAN') {
        adviceEl.textContent = `Tà ngũ thân sắc ${outfit.colorName} phối cùng ${outfit.accessoryLabel || 'phụ kiện di sản'}, tạo phong thái Gen Z tự tin, trang nhã khi ${outfit.eventLabel.toLowerCase()}.`;
      } else if (outfit.garment === 'AO_NHAT_BINH') {
        adviceEl.textContent = `Viền cổ ngũ sắc uy nghi của Nhật Bình hòa quyện với phong thái ${outfit.mood?.toLowerCase() || 'vương giả'}, cực kỳ nổi bật trong các đại lễ và sự kiện trang trọng.`;
      } else {
        adviceEl.textContent = `Thiết kế ${outfit.garmentLabel || outfit.title} buông rủ phóng khoáng, thích hợp mix cùng guốc mộc thanh hoặc túi gấm cho dịp ${outfit.eventLabel.toLowerCase()}.`;
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
      this.currentDeck = [...DISCOVERY_OUTFITS_POOL];
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

      card.innerHTML = `
        <div class="card-inner-top" style="justify-content: flex-end;">
          <span class="card-tag-subtle">📍 ${outfit.bestOccasion || outfit.eventLabel}</span>
        </div>

        <div class="card-illustration-box">
          <div class="card-image-wrap" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; border-radius: 16px;">
            ${outfit.imageUrl ? `
              <img src="${assetConfig.resolveAssetUrl(outfit.imageUrl)}" alt="${outfit.title}" class="card-garment-img" style="width: 100%; height: 100%; object-fit: cover; border-radius: 16px;" onerror="this.style.display='none'; const ph = this.parentElement.querySelector('.card-no-image-placeholder'); if (ph) ph.style.display='flex';" />
            ` : ''}
            <div class="card-no-image-placeholder" style="display: ${outfit.imageUrl ? 'none' : 'flex'}; flex-direction: column; align-items: center; justify-content: center; gap: 14px; text-align: center; padding: 24px 16px; width: 100%; height: 100%; box-sizing: border-box;">
              <div style="font-size: 3rem; opacity: 0.4;">🏛️</div>
              <p style="font-family: var(--font-body); font-size: 0.88rem; color: var(--color-text-muted); line-height: 1.5; max-width: 220px; margin: 0;">
                Tổ hợp này chưa có ảnh minh họa demo.
              </p>
              <span style="font-size: 0.74rem; color: var(--color-gold, #C9A66B); font-weight: 500;">
                ${outfit.title}
              </span>
            </div>
          </div>

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
