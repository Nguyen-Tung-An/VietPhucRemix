import { Sound } from '../audio/sound.ts';
import { garmentEngine } from '../workshop/garmentEngine.ts';
import { getCulturalTruth } from '../data/culturalTruths.ts';

export interface TailorAtelier {
  id: string;
  name: string;
  city: 'Hà Nội' | 'Huế' | 'TP. Hồ Chí Minh' | 'Toàn Quốc (Online)';
  regionKey: 'hanoi' | 'hue' | 'hcm' | 'online';
  address: string;
  phone: string;
  specialty: string[];
  priceRange: string;
  description: string;
  mapQuery: string;
  searchKeywords: string;
  websiteUrl?: string;
  tags: string[];
}

export const VERIFIED_TAILOR_ATELIERS: TailorAtelier[] = [
  // --- HÀ NỘI ---
  {
    id: 'tailor-y-van-hien',
    name: 'Ỷ Vân Hiên (Ý Phục Xưa)',
    city: 'Hà Nội',
    regionKey: 'hanoi',
    address: '52 Phố Hàng Bè, Hoàn Kiếm / Thụy Khuê, Tây Hồ, Hà Nội',
    phone: '0988 567 890',
    specialty: ['Áo Ngũ Thân Lập Lĩnh', 'Áo Tấc', 'Áo Nhật Bình', 'Lễ phục triều Nguyễn'],
    priceRange: '2.500.000đ - 12.000.000đ (May đo theo số đo)',
    description: 'Thương hiệu tiên phong phục dựng cổ phục Việt Nam theo đúng quy chế lịch sử và kỹ thuật may thủ công truyền thống.',
    mapQuery: 'Ỷ Vân Hiên Hà Nội',
    searchKeywords: 'Ỷ Vân Hiên cổ phục việt nam may đo áo ngũ thân',
    websiteUrl: 'https://www.facebook.com/yvanhien/',
    tags: ['Chuyên gia phục dựng', 'Thủ công cao cấp', 'Đúng điển chế']
  },
  {
    id: 'tailor-vstyle',
    name: "V'style Cổ Phục",
    city: 'Hà Nội',
    regionKey: 'hanoi',
    address: 'Ngõ 82 Phạm Ngọc Thạch, Đống Đa, Hà Nội',
    phone: '0912 345 678',
    specialty: ['Áo Ngũ Thân nam/nữ', 'Áo Tấc lụa tơ tằm', 'Áo Tứ Thân'],
    priceRange: '1.800.000đ - 6.500.000đ (Có dịch vụ thuê & may đo)',
    description: 'Không gian Việt phục đương đại được đông đảo bạn trẻ yêu thích, phối màu trang nhã theo phong cách Lụa Thanh.',
    mapQuery: "V'style Cổ Phục Đống Đa Hà Nội",
    searchKeywords: "V'style Cổ Phục Hà Nội may đo áo dài ngũ thân",
    tags: ['Gen Z ưa chuộng', 'Lụa mềm mại', 'Tư vấn tận tâm']
  },
  {
    id: 'tailor-van-phuc-craft',
    name: 'Xưởng May Di Sản Lụa Vạn Phúc',
    city: 'Hà Nội',
    regionKey: 'hanoi',
    address: 'Làng lụa Vạn Phúc, Hà Đông, Hà Nội',
    phone: '024 3382 5678',
    specialty: ['Áo Ngũ Thân dệt gấm chìm', 'Áo Bà Ba lụa tơ tằm tự nhiên', 'Khăn lụa'],
    priceRange: '1.200.000đ - 4.500.000đ',
    description: 'Gốc làng nghề tơ lụa nghìn năm tuổi, may đo trực tiếp từ vải tơ tằm và gấm vân dệt thủ công tại xưởng.',
    mapQuery: 'Làng lụa Vạn Phúc Hà Đông Hà Nội',
    searchKeywords: 'may áo ngũ thân làng lụa Vạn Phúc Hà Đông',
    tags: ['Làng nghề truyền thống', 'Vải tơ tằm gốc', 'Giá xưởng']
  },

  // --- HUẾ ---
  {
    id: 'tailor-minh-dan-hue',
    name: 'Tiệm May Cổ Phục Minh Đan',
    city: 'Huế',
    regionKey: 'hue',
    address: 'Phan Đăng Lưu / Lê Lợi, TP. Huế',
    phone: '0905 123 456',
    specialty: ['Áo Dài Ngũ Thân truyền thống Huế', 'Áo Nhật Bình Cố đô', 'Áo Tấc'],
    priceRange: '1.500.000đ - 7.000.000đ',
    description: 'Gia đình nghệ nhân may đo áo dài cổ truyền Cố đô Huế qua nhiều thế hệ, giữ trọn đường kim mũi chỉ và phom dáng cổ điển.',
    mapQuery: 'May áo dài ngũ thân Huế Phan Đăng Lưu',
    searchKeywords: 'tiệm may áo dài ngũ thân truyền thống Huế uy tín',
    tags: ['Nghệ nhân xứ Huế', 'Chuẩn dáng hoàng triều', 'Tỉ mỉ thủ công']
  },
  {
    id: 'tailor-co-trang-hoang-cung',
    name: 'Cổ Trang Hoàng Cung Huế',
    city: 'Huế',
    regionKey: 'hue',
    address: 'Đường Nguyễn Huệ, TP. Huế',
    phone: '0234 382 9988',
    specialty: ['Áo Nhật Bình hoàng gia', 'Áo Tấc quý tộc', 'Phụ kiện kim bội & trâm'],
    priceRange: '2.000.000đ - 9.000.000đ',
    description: 'Chuyên gia may đo và phục dựng trang phục cung đình triều Nguyễn, phối hợp chặt chẽ với các nhà nghiên cứu di sản Huế.',
    mapQuery: 'Cổ Trang Hoàng Cung Huế Nguyễn Huệ',
    searchKeywords: 'Cổ Trang Hoàng Cung Huế may đo áo nhật bình',
    tags: ['Đậm chất Cố đô', 'Hoa văn cung đình', 'Phụ kiện đồng bộ']
  },

  // --- TP. HỒ CHÍ MINH ---
  {
    id: 'tailor-hoa-nien',
    name: 'Hoa Niên — Triều Nguyễn Cổ Phục',
    city: 'TP. Hồ Chí Minh',
    regionKey: 'hcm',
    address: 'Quận 1, TP. Hồ Chí Minh',
    phone: '0938 889 912',
    specialty: ['Áo Ngũ Thân cách tân & truyền thống', 'Áo Tấc', 'Áo Nhật Bình đương đại'],
    priceRange: '2.200.000đ - 8.500.000đ',
    description: 'Tổ hợp sáng tạo cổ phục danh tiếng tại Sài Gòn, giao thoa giữa chuẩn mực lịch sử và gu thẩm mỹ thanh lịch thế hệ mới.',
    mapQuery: 'Hoa Niên cổ phục Quận 1 Sài Gòn',
    searchKeywords: 'Hoa Niên triều nguyễn cổ phục Sài Gòn TPHCM',
    tags: ['Hiện đại & Thanh lịch', 'Chất liệu cao cấp', 'Bộ sưu tập độc bản']
  },
  {
    id: 'tailor-great-vietnam',
    name: 'Great Vietnam Atelier',
    city: 'TP. Hồ Chí Minh',
    regionKey: 'hcm',
    address: 'Quận 3, TP. Hồ Chí Minh',
    phone: '0909 678 123',
    specialty: ['Áo Ngũ Thân nam nữ', 'Áo Bà Ba lụa Nam Bộ', 'Áo Dài Lemur'],
    priceRange: '1.900.000đ - 6.000.000đ',
    description: 'Không gian may đo tôn vinh bản sắc Việt Nam với chất liệu sa lụa tự nhiên, may đo chuẩn form dáng người Việt hiện đại.',
    mapQuery: 'Great Vietnam Atelier Quận 3 Hồ Chí Minh',
    searchKeywords: 'Great Vietnam Atelier cổ phục may đo TPHCM',
    tags: ['Form dáng chuẩn', 'Sa lụa tự nhiên', 'Thủ công mỹ nghệ']
  },
  {
    id: 'tailor-nam-bo-ba-ba',
    name: 'Tiệm May Áo Bà Ba Sài Gòn — Lụa Nam Bộ',
    city: 'TP. Hồ Chí Minh',
    regionKey: 'hcm',
    address: 'Đường Hai Bà Trưng, Quận 3, TP. Hồ Chí Minh',
    phone: '0918 234 567',
    specialty: ['Áo Bà Ba lụa tơ tằm', 'Áo Bà Ba dệt hoa chìm', 'Khăn Rằn thủ công'],
    priceRange: '850.000đ - 2.500.000đ',
    description: 'Chuyên may đo Áo Bà Ba truyền thống Nam Bộ, tà lụa mềm mại, cổ tròn duyên dáng, cúc ngọc trai xà cừ.',
    mapQuery: 'May áo bà ba lụa tơ tằm Quận 3 Hồ Chí Minh',
    searchKeywords: 'tiệm may áo bà ba lụa tơ tằm đẹp uy tín TPHCM',
    tags: ['Áo Bà Ba chuyên sâu', 'Lụa tơ tằm Nam Bộ', 'Đường may tinh tế']
  },

  // --- TRỰC TUYẾN / TOÀN QUỐC ---
  {
    id: 'tailor-nha-xa-online',
    name: 'Lụa Nha Xá — Đặt May Trực Tuyến Toàn Quốc',
    city: 'Toàn Quốc (Online)',
    regionKey: 'online',
    address: 'Giao hàng tận nơi toàn quốc & Quốc tế',
    phone: '0983 112 233',
    specialty: ['May đo theo số đo online', 'Vải lụa tơ tằm Nha Xá', 'Áo Ngũ Thân & Áo Tấc'],
    priceRange: '1.400.000đ - 4.800.000đ',
    description: 'Dịch vụ tư vấn lấy số đo trực tuyến chi tiết qua video call, gửi mẫu vải lụa tận nhà trước khi cắt may.',
    mapQuery: 'Làng lụa Nha Xá Hà Nam',
    searchKeywords: 'đặt may áo dài ngũ thân online lụa Nha Xá',
    tags: ['Tư vấn số đo online', 'Giao tận nơi', 'Đổi trả bảo hành']
  },
  {
    id: 'tailor-cho-co-phuc',
    name: 'Cộng Đồng Chợ Cổ Phục Việt Nam & Atelier Partner',
    city: 'Toàn Quốc (Online)',
    regionKey: 'online',
    address: 'Hệ thống đối tác thợ may tại Hà Nội - Đà Nẵng - Huế - Sài Gòn',
    phone: '0901 888 999',
    specialty: ['Kết nối tiệm may theo yêu cầu', 'Tìm vải gấm độc bản', 'Phụ kiện phục dựng'],
    priceRange: 'Đa dạng theo từng phân khúc',
    description: 'Mạng lưới kết nối các nghệ nhân may đo cổ phục độc lập trên khắp 3 miền, hỗ trợ tìm kiếm tiệm may gần bạn nhất.',
    mapQuery: 'Cổ phục Việt Nam',
    searchKeywords: 'chợ cổ phục việt nam đặt may áo dài ngũ thân',
    tags: ['Mạng lưới thợ may', 'Tìm kiếm theo vùng', 'Hỗ trợ 24/7']
  }
];

export class TailorJourneyEngine {
  private currentFilter: 'all' | 'hanoi' | 'hue' | 'hcm' | 'online' = 'all';
  private currentGarmentName: string = 'Áo Ngũ Thân';
  private currentGarmentId: string = 'AO_NGU_THAN';
  private currentColorName: string = 'Hồng Phấn Sen';

  public init(): void {
    this.setupModalEvents();
    this.setupFilterTabs();
    this.setupCustomSearchEngine();
  }

  /**
   * Mở Hành trình Sở hữu Việt phục với dữ liệu từ bộ trang phục vừa phối
   */
  public openJourney(garmentId?: string, garmentName?: string, colorName?: string): void {
    Sound.playChime();
    const outfitState = garmentEngine.getCurrentOutfitState();
    const truth = getCulturalTruth(garmentId || outfitState.garment || 'AO_NGU_THAN');

    this.currentGarmentId = truth.id;
    this.currentGarmentName = garmentName || truth.name;
    this.currentColorName = colorName || outfitState.colorName || 'Lụa Thanh';

    const modal = document.getElementById('tailor-journey-modal');
    if (!modal) return;

    // Cập nhật banner trang phục mục tiêu
    const targetBanner = document.getElementById('journey-target-garment-title');
    const targetSub = document.getElementById('journey-target-garment-sub');
    if (targetBanner) {
      targetBanner.textContent = `🎯 Bộ bạn đang muốn sở hữu: ${this.currentGarmentName} (${this.currentColorName})`;
    }
    if (targetSub) {
      targetSub.textContent = `Hệ thống tự động kích hoạt bộ tìm kiếm Google Maps & Google Search giúp bạn kết nối trực tiếp với tiệm may đo phù hợp nhất.`;
    }

    this.updateGoogleSearchActionLinks();
    this.renderAtelierList();
    this.updateMapEmbed('all');

    modal.classList.add('modal-active');
  }

  public closeJourney(): void {
    Sound.playClick();
    const modal = document.getElementById('tailor-journey-modal');
    if (modal) {
      modal.classList.remove('modal-active');
    }
  }

  private setupModalEvents(): void {
    const btnClose = document.getElementById('btn-close-tailor-journey');
    const backdrop = document.getElementById('tailor-journey-backdrop');

    btnClose?.addEventListener('click', () => this.closeJourney());
    backdrop?.addEventListener('click', () => this.closeJourney());

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('tailor-journey-modal');
        if (modal?.classList.contains('modal-active')) {
          this.closeJourney();
        }
      }
    });
  }

  private setupFilterTabs(): void {
    const tabs = document.querySelectorAll('.journey-region-tab');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        Sound.playClick();
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        const region = tab.getAttribute('data-region') as 'all' | 'hanoi' | 'hue' | 'hcm' | 'online';
        this.currentFilter = region || 'all';
        this.renderAtelierList();
        this.updateMapEmbed(this.currentFilter);
      });
    });
  }

  private updateGoogleSearchActionLinks(): void {
    const btnSearchGoogle = document.getElementById('btn-journey-google-search') as HTMLAnchorElement;
    const btnSearchMaps = document.getElementById('btn-journey-google-maps') as HTMLAnchorElement;

    const garmentKeyword = this.currentGarmentName.replace(/\(.*?\)/g, '').trim();
    const fullQuery = `tiệm may đo ${garmentKeyword} uy tín chất lượng`;
    const mapsQuery = `tiệm may ${garmentKeyword} cổ phục việt nam`;

    if (btnSearchGoogle) {
      btnSearchGoogle.href = `https://www.google.com/search?q=${encodeURIComponent(fullQuery)}`;
      btnSearchGoogle.target = '_blank';
      btnSearchGoogle.rel = 'noopener noreferrer';
    }

    if (btnSearchMaps) {
      btnSearchMaps.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;
      btnSearchMaps.target = '_blank';
      btnSearchMaps.rel = 'noopener noreferrer';
    }
  }

  private updateMapEmbed(region: 'all' | 'hanoi' | 'hue' | 'hcm' | 'online'): void {
    const iframe = document.getElementById('journey-map-iframe') as HTMLIFrameElement;
    if (!iframe) return;

    let query = 'tiem+may+co+phuc+viet+phuc+viet+nam';
    let zoom = '12';

    if (region === 'hanoi') {
      query = 'tiem+may+co+phuc+viet+phuc+ha+noi';
      zoom = '13';
    } else if (region === 'hue') {
      query = 'tiem+may+ao+dai+ngu+than+hue';
      zoom = '14';
    } else if (region === 'hcm') {
      query = 'tiem+may+viet+phuc+ao+dai+tp+ho+chi+minh';
      zoom = '13';
    } else if (region === 'online') {
      query = 'lang+lua+van+phuc+ha+dong';
      zoom = '14';
    }

    iframe.src = `https://maps.google.com/maps?q=${query}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`;
  }

  private renderAtelierList(): void {
    const container = document.getElementById('journey-atelier-grid');
    if (!container) return;

    const filtered = VERIFIED_TAILOR_ATELIERS.filter((item) => {
      if (this.currentFilter === 'all') return true;
      return item.regionKey === this.currentFilter;
    });

    container.innerHTML = filtered
      .map((item) => {
        const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ' ' + item.address)}`;
        const searchLink = `https://www.google.com/search?q=${encodeURIComponent(item.searchKeywords)}`;

        return `
          <div class="atelier-card" id="${item.id}">
            <div class="atelier-card-header">
              <div class="atelier-city-badge">${item.city}</div>
              <h4 class="atelier-name">${item.name}</h4>
              <p class="atelier-address">📍 ${item.address}</p>
            </div>

            <p class="atelier-desc">${item.description}</p>

            <div class="atelier-meta-box">
              <div class="atelier-specialty">
                <strong>Chuyên may đo:</strong> ${item.specialty.join(', ')}
              </div>
              <div class="atelier-price">
                <strong>Chi phí ước tính:</strong> <span>${item.priceRange}</span>
              </div>
              <div class="atelier-phone">
                <strong>Hotline tư vấn:</strong> <a href="tel:${item.phone}">${item.phone}</a>
              </div>
            </div>

            <div class="atelier-tags">
              ${item.tags.map((t) => `<span class="atelier-tag">✓ ${t}</span>`).join('')}
            </div>

            <div class="atelier-actions-row">
              <a href="${mapsLink}" target="_blank" rel="noopener noreferrer" class="btn-atelier-map" title="Xem vị trí và chỉ đường trên Google Maps">
                🗺️ Mở Google Maps ↗
              </a>
              <a href="${searchLink}" target="_blank" rel="noopener noreferrer" class="btn-atelier-search" title="Tìm kiếm đánh giá và fanpage trên Google">
                🔍 Tìm Review Google ↗
              </a>
            </div>
          </div>
        `;
      })
      .join('');
  }

  private setupCustomSearchEngine(): void {
    const inputKeyword = document.getElementById('journey-custom-search-input') as HTMLInputElement;
    const btnSearch = document.getElementById('btn-journey-custom-search');

    const handleSearch = () => {
      const kw = (inputKeyword?.value || '').trim();
      const searchTarget = kw ? `tiệm may đo ${kw}` : `tiệm may đo ${this.currentGarmentName} uy tín`;
      window.open(`https://www.google.com/search?q=${encodeURIComponent(searchTarget)}`, '_blank');
    };

    btnSearch?.addEventListener('click', handleSearch);
    inputKeyword?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    });
  }
}

export const tailorJourneyEngine = new TailorJourneyEngine();
