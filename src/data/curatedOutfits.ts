import { DiscoveryOutfit } from '../types/index.ts';
import { assembleFashionPrompt } from '../workshop/promptEngine.ts';

/**
 * BỘ 18 TRANG PHỤC KHÁM PHÁ & LOOKBOOK CHUẨN MỰC
 * Tỉ lệ: 6 Dáng Áo × 3 Tổ Hợp Đa Dạng = 18 Bộ
 * - Dáng áo: AO_NGU_THAN, AO_TAC, AO_NHAT_BINH, AO_TU_THAN, AO_BA_BA, AO_DAI_LEMUR
 * - Mỗi tổ hợp ghi lại đầy đủ 100% input cấu thành:
 *   + Dáng áo (garment, garmentLabel)
 *   + Màu sắc Hex & tên Việt (color, colorName)
 *   + 1-2 Thẻ phong cách (styles, style_mode)
 *   + 1-2 Phụ kiện (accessories, accessoryLabels)
 *   + Kiểu tóc đa dạng & chuyên sâu (hairstyle)
 *   + Độ % phá cách sáng tạo (creativityLevel)
 *   + Hồ sơ cá nhân người mặc (userProfile: chiều cao, cân nặng, vóc dáng, tông da, tóc)
 *   + Bối cảnh & Dịp mặc (event, eventLabel, bestOccasion)
 *   + Chất liệu / Hoa văn dệt (patternName)
 *   + Mã ID định danh chuẩn CDN (cdn_id: garment_[loai]_[01-03])
 *   + Đường dẫn tệp tin trên CDN (cdn_image_path)
 *   + Câu lệnh Master AI Image Prompt hoàn chỉnh (assembledPrompt)
 */

interface RawCuratedOutfitDef {
  id: string;
  cdn_id: string;
  cdn_image_path: string;
  fallback_image_url: string;
  title: string;
  creatorName: string;
  garment: 'AO_NGU_THAN' | 'AO_TAC' | 'AO_NHAT_BINH' | 'AO_TU_THAN' | 'AO_BA_BA' | 'AO_DAI_LEMUR';
  garmentLabel: string;
  color: string;
  colorName: string;
  styles: string[];
  accessories: string[];
  accessoryLabels: string[];
  hairstyle: string;
  creativityLevel: number;
  userProfile: {
    height: string;
    weight: string;
    shape: string;
    skin: string;
    hair: string;
  };
  event: string;
  eventLabel: string;
  bestOccasion: string;
  patternName: string;
  seal: string;
  desc: string;
  historicalStory: string;
}

const RAW_CURATED_DEFS: RawCuratedOutfitDef[] = [
  // =========================================================================
  // 1. ÁO NGŨ THÂN LẬP LĨNH (3 TỔ HỢP)
  // =========================================================================
  {
    id: 'outfit-ngu-than-01',
    cdn_id: 'garment_ngu_than_01',
    cdn_image_path: '/images/garments/curated/garment_ngu_than_01.webp',
    fallback_image_url: '/images/garments/ao-ngu-than.png',
    title: 'Áo Ngũ Thân Lập Lĩnh Hoàng Cúc Cố Đô',
    creatorName: 'Minh Thảo @GenZ Huế',
    garment: 'AO_NGU_THAN',
    garmentLabel: 'Áo Ngũ Thân Lập Lĩnh',
    color: '#E5A93C',
    colorName: 'Vàng Hoàng Cúc Cố Đô',
    styles: ['Thanh tao cung đình', 'Cổ điển hoài niệm'],
    accessories: ['QUAT_GIAY', 'TRAM_BAC'],
    accessoryLabels: ['Quạt Giấy Thư Họa Trúc', 'Trâm Bạc Hoa Mai'],
    hairstyle: 'Búi tóc bánh lái cài trâm bạc thanh thoát',
    creativityLevel: 25,
    userProfile: {
      height: '165cm',
      weight: '50kg',
      shape: 'Dáng liễu thon thả',
      skin: 'Sáng hồng hào',
      hair: 'Đen tuyền dài óng ả'
    },
    event: 'tet',
    eventLabel: 'Dạo Phố Tết',
    bestOccasion: 'Dạo Phố Du Xuân & Thưởng Trà Di Sản Cung Đình',
    patternName: 'Sa Nam Dệt Chìm Hoa Mây Ngũ Thân',
    seal: 'Lụa',
    desc: 'Tà ngũ thân năm thân lụa sa cài khuy đồng bọc ngọc, mang hàm ý ngũ thường Nhân-Lễ-Nghĩa-Trí-Tín, toát lên phong thái đĩnh đạc của văn nhân xứ Huế.',
    historicalStory: 'Áo ngũ thân lập lĩnh thời Nguyễn là chuẩn mực quốc phục Việt Nam thế kỷ 19, tượng trưng cho tứ thân phụ mẫu ôm ấp lấy thân con thảo hiền.'
  },
  {
    id: 'outfit-ngu-than-02',
    cdn_id: 'garment_ngu_than_02',
    cdn_image_path: '/images/garments/curated/garment_ngu_than_02.webp',
    fallback_image_url: '/images/garments/ao-ngu-than.jpg',
    title: 'Áo Ngũ Thân Lập Lĩnh Hồng Phấn Sen',
    creatorName: 'Bảo Trâm @HàThành',
    garment: 'AO_NGU_THAN',
    garmentLabel: 'Áo Ngũ Thân Lập Lĩnh',
    color: '#F4C9D6',
    colorName: 'Hồng Phấn Sen Thanh Nhã',
    styles: ['Thơ mộng trữ tình'],
    accessories: ['QUAT_GIAY'],
    accessoryLabels: ['Quạt Giấy Xếp Lụa Điệp'],
    hairstyle: 'Tóc vấn khăn lụa hồng buông lơi dịu dàng',
    creativityLevel: 40,
    userProfile: {
      height: '158cm',
      weight: '46kg',
      shape: 'Nhỏ nhắn thanh mảnh',
      skin: 'Trắng sứ mịn màng',
      hair: 'Tóc đen cúp nhẹ ngang vai'
    },
    event: 'tet',
    eventLabel: 'Du Xuân Phố Cổ',
    bestOccasion: 'Dạo Phố Tết Tràng Tiền & Check-in Cổ Trấn',
    patternName: 'Lụa Tơ Tằm Vạn Phúc Dệt Chìm Liên Hoa',
    seal: 'Nhã',
    desc: 'Tà ngũ thân phớt hồng cánh sen ban mai, tôn lên vẻ thuần khiết và nét duyên nền nã của thiếu nữ Việt trên phố xuân ngập nắng.',
    historicalStory: 'Sắc hồng sen tượng trưng cho tâm hồn thanh khiết không vướng bụi trần, phối hợp lập lĩnh đứng đắn tạo vẻ đẹp Á Đông kín đáo mà thu hút.'
  },
  {
    id: 'outfit-ngu-than-03',
    cdn_id: 'garment_ngu_than_03',
    cdn_image_path: '/images/garments/curated/garment_ngu_than_03.webp',
    fallback_image_url: '/images/garments/ao-ngu-than.png',
    title: 'Áo Ngũ Thân Tay Chẽn Nam Lam Khang',
    creatorName: 'Đăng Khoa @TràngAn',
    garment: 'AO_NGU_THAN',
    garmentLabel: 'Áo Ngũ Thân Nam Tay Chẽn',
    color: '#1D3557',
    colorName: 'Xanh Chàm Đêm Thượng Hải',
    styles: ['Trang trọng nho nhã', 'Đương đại tối giản'],
    accessories: ['QUAT_GIAY', 'TUI_GAM'],
    accessoryLabels: ['Quạt Nan Tre Thư Họa', 'Túi Gấm Đeo Hông'],
    hairstyle: 'Khăn đóng nam đen lập lĩnh đĩnh đạc',
    creativityLevel: 15,
    userProfile: {
      height: '176cm',
      weight: '66kg',
      shape: 'Cao ráo vững chãi',
      skin: 'Bánh mật ấm áp khỏe khoắn',
      hair: 'Cắt ngắn gọn gàng vấn khăn'
    },
    event: 'grad',
    eventLabel: 'Lễ Tốt Nghiệp',
    bestOccasion: 'Lễ Tốt Nghiệp Trọng Thể & Hội Thảo Di Sản',
    patternName: 'Gấm Dệt Nổi Vân Thủy Triều Trầm Mặc',
    seal: 'Trọng',
    desc: 'Thiết kế tay chẽn gọn gàng, cổ lập lĩnh đứng đắn, thể hiện cốt cách tự tin, uyên bác của nam thanh niên Việt trong các nghi thức trọng thể.',
    historicalStory: 'Áo tay chẽn ngũ thân nam giới là lễ phục phổ thông của tầng lớp trí thức và quan lại thời Nguyễn, tiện lợi cho việc di chuyển mà vẫn giữ trọn đạo mạo.'
  },

  // =========================================================================
  // 2. ÁO TẤC CUNG ĐÌNH (3 TỔ HỢP)
  // =========================================================================
  {
    id: 'outfit-tac-01',
    cdn_id: 'garment_tac_01',
    cdn_image_path: '/images/garments/curated/garment_tac_01.webp',
    fallback_image_url: '/images/garments/ao-tac.png',
    title: 'Áo Tấc Đại Lễ Xanh Ngọc Bích',
    creatorName: 'Bảo Nghi @CốĐô',
    garment: 'AO_TAC',
    garmentLabel: 'Áo Tấc Tay Thụng Đại Lễ',
    color: '#2A5A4E',
    colorName: 'Xanh Ngọc Bích Cung Đình',
    styles: ['Vương giả quyền quý', 'Cung đình uy nghi'],
    accessories: ['QUAT_GIAY', 'TRAM_GOM'],
    accessoryLabels: ['Quạt Xếp Gỗ Trầm Hương', 'Trâm Cài Gốm Men Lam'],
    hairstyle: 'Khăn vành dây bọc lụa xanh cung đình',
    creativityLevel: 20,
    userProfile: {
      height: '168cm',
      weight: '52kg',
      shape: 'Dáng cao thanh thoát',
      skin: 'Sáng trung bình',
      hair: 'Búi cao cài trâm gốm'
    },
    event: 'festival',
    eventLabel: 'Đại Lễ Cung Đình',
    bestOccasion: 'Đại Lễ Cung Đình & Nghi Thức Ngoại Giao',
    patternName: 'Sa Nam Dệt Hoa Dây Cố Đô',
    seal: 'Vương',
    desc: 'Ống tay thụng rộng dài uyển chuyển buông rủ ngang đầu gối, thể hiện phong thái tôn nghiêm, đài các chuẩn mực chốn cung đình Huế xưa.',
    historicalStory: 'Áo Tấc là đại lễ phục thời Nguyễn, chỉ được mặc trong các dịp tế tự, triều hội trang nghiêm, tượng trưng cho đức khiêm nhường và lòng tôn kính trời đất.'
  },
  {
    id: 'outfit-tac-02',
    cdn_id: 'garment_tac_02',
    cdn_image_path: '/images/garments/curated/garment_tac_02.webp',
    fallback_image_url: '/images/garments/ao-tac.jpg',
    title: 'Áo Tấc Đại Lễ Đỏ Huyết Dụ Song Hỷ',
    creatorName: 'Hoàng Long @DiSảnViệt',
    garment: 'AO_TAC',
    garmentLabel: 'Áo Tấc Lễ Cưới Cung Đình',
    color: '#8B1E1E',
    colorName: 'Đỏ Son Huyết Dụ Đại Triều',
    styles: ['Vương giả quyền quý'],
    accessories: ['TRAM_BAC', 'CHUOI_NGOC'],
    accessoryLabels: ['Trâm Phượng Hoàng Bạc', 'Chuỗi Ngọc Trai Cổ Điển'],
    hairstyle: 'Khăn đóng gấm thêu chỉ vàng trang nghiêm',
    creativityLevel: 30,
    userProfile: {
      height: '164cm',
      weight: '54kg',
      shape: 'Đầy đặn quý phái',
      skin: 'Sáng hồng tự nhiên',
      hair: 'Vấn khăn vành cung đình'
    },
    event: 'festival',
    eventLabel: 'Lễ Cưới Truyền Thống',
    bestOccasion: 'Lễ Cưới Truyền Thống & Đại Hỷ Gia Phong',
    patternName: 'Gấm Đoạn Triều Nguyễn Thêu Song Hỷ',
    seal: 'Hỷ',
    desc: 'Sắc đỏ huyết dụ nồng nàn trên nền gấm đoạn sang trọng, điểm xuyết trâm phượng hoàng bạc tinh xảo cho ngày đại hỷ ngập tràn hồng phúc.',
    historicalStory: 'Đỏ son huyết dụ kết hợp với tay thụng dài là biểu trưng của sự viên mãn và trường thọ, là lễ phục cưới hỏi cao quý nhất của các bậc quyền quý xưa.'
  },
  {
    id: 'outfit-tac-03',
    cdn_id: 'garment_tac_03',
    cdn_image_path: '/images/garments/curated/garment_tac_03.webp',
    fallback_image_url: '/images/garments/ao-tac.png',
    title: 'Áo Tấc Bạch Lụa Sương Mai Tối Giản',
    creatorName: 'Hải Đăng @TriểnLãmNghệThuật',
    garment: 'AO_TAC',
    garmentLabel: 'Áo Tấc Lụa Đũi Tối Giản',
    color: '#F5F2EB',
    colorName: 'Bạch Lụa Sương Mai Tinh Khôi',
    styles: ['Đương đại tối giản'],
    accessories: ['QUAT_GIAY'],
    accessoryLabels: ['Quạt Điệp Trắng Tinh Nan Tre'],
    hairstyle: 'Tóc búi củ tỏi tối giản điểm xuyết trâm mộc',
    creativityLevel: 55,
    userProfile: {
      height: '170cm',
      weight: '51kg',
      shape: 'Mảnh khảnh High-fashion',
      skin: 'Trắng sáng thanh tú',
      hair: 'Tóc suôn mượt buộc lơi'
    },
    event: 'yearbook',
    eventLabel: 'Kỷ Yếu Nghệ Thuật',
    bestOccasion: 'Triển Lãm Mỹ Thuật Đương Đại & Chụp Kỷ Yếu',
    patternName: 'Lụa Đũi Tơ Tằm Dệt Mộc Mạc',
    seal: 'Thuần',
    desc: 'Cảm hứng tối giản phương Đông: tay thụng áo tấc dệt từ lụa đũi tơ tằm thô mộc, tôn vinh hình khối tà áo và sự tĩnh tại của tâm hồn.',
    historicalStory: 'Sắc trắng ngà của lụa tơ sống thể hiện tinh thần tối giản Á Đông, hòa quyện giữa phom dáng cung đình cổ kính và mỹ học đương đại.'
  },

  // =========================================================================
  // 3. ÁO NHẬT BÌNH CUNG ĐÌNH (3 TỔ HỢP)
  // =========================================================================
  {
    id: 'outfit-nhat-binh-01',
    cdn_id: 'garment_nhat_binh_01',
    cdn_image_path: '/images/garments/curated/garment_nhat_binh_01.webp',
    fallback_image_url: '/images/garments/ao-nhat-binh.jpg',
    title: 'Áo Nhật Bình Hoàng Triều Ngũ Sắc',
    creatorName: 'Phương Anh @HoàngGiaHuế',
    garment: 'AO_NHAT_BINH',
    garmentLabel: 'Áo Nhật Bình Cung Đình Triều Nguyễn',
    color: '#C9A66B',
    colorName: 'Vàng Đất Cố Đô Vương Giả',
    styles: ['Vương giả quyền quý', 'Cổ điển hoài niệm'],
    accessories: ['TRAM_GOM', 'QUAT_GIAY'],
    accessoryLabels: ['Trâm Vàng Hoa Cúc', 'Quạt Lụa Cung Đình'],
    hairstyle: 'Khăn vành dây đỏ vàng ngũ sắc triều Nguyễn',
    creativityLevel: 10,
    userProfile: {
      height: '163cm',
      weight: '49kg',
      shape: 'Cân đối đoan trang',
      skin: 'Sáng hồng quý tộc',
      hair: 'Vấn khăn vành dây 5 vòng chuẩn mực'
    },
    event: 'festival',
    eventLabel: 'Đại Lễ Hoàng Triều',
    bestOccasion: 'Đại Lễ Hoàng Triều & Nghi Lễ Di Sản',
    patternName: 'Gấm Thêu Kim Tuyến Phượng Vũ Lập Thể',
    seal: 'Phượng',
    desc: 'Cổ áo đối khâm hình chữ nhật thêu phụng hoàng và dải mây ngũ sắc rực rỡ, trang phục cao quý bậc nhất của bậc Hoàng hậu, Phi tần triều Nguyễn.',
    historicalStory: 'Áo Nhật Bình có cổ áo hình chữ nhật đặc trưng, tay áo thêu dải ngũ sắc ngũ hành, tượng trưng cho sự hòa hợp trời đất và phẩm cấp cung đình.'
  },
  {
    id: 'outfit-nhat-binh-02',
    cdn_id: 'garment_nhat_binh_02',
    cdn_image_path: '/images/garments/curated/garment_nhat_binh_02.webp',
    fallback_image_url: '/images/garments/ao-nhat-binh.png',
    title: 'Áo Nhật Bình Tím Xứ Huế Trầm Mặc',
    creatorName: 'Khánh Vy @SôngHương',
    garment: 'AO_NHAT_BINH',
    garmentLabel: 'Áo Nhật Bình Quý Tộc Huế',
    color: '#5C3270',
    colorName: 'Tím Huế Mộng Mơ Trầm Mặc',
    styles: ['Thơ mộng trữ tình', 'Thanh tao cung đình'],
    accessories: ['TRAM_BAC'],
    accessoryLabels: ['Trâm Bạc Hoa Sen Đính Ngọc Tím'],
    hairstyle: 'Tóc búi trễ cài lược đồi mồi thanh tao',
    creativityLevel: 35,
    userProfile: {
      height: '160cm',
      weight: '47kg',
      shape: 'Thanh thoát dịu dàng',
      skin: 'Trắng ngọc Á Đông',
      hair: 'Tóc đen nhánh bồng bềnh'
    },
    event: 'festival',
    eventLabel: 'Đêm Hoàng Cung',
    bestOccasion: 'Đêm Hoàng Cung & Thưởng Nhã Nhạc Triều Đình',
    patternName: 'Lụa Gấm Cung Đình Viền Ngũ Sắc Cổ Điển',
    seal: 'Đài',
    desc: 'Sắc tím trầm mặc của ráng chiều sông Hương trên nền lụa gấm quý, viền cổ ngũ sắc tinh xảo gợi nhớ nét đài các của công chúa hoàng gia.',
    historicalStory: 'Sắc tím Cố đô hòa cùng viền Nhật Bình tôn nghiêm là hình ảnh tiêu biểu cho nét văn hóa quý tộc tao nhã và kín đáo của phụ nữ kinh kỳ.'
  },
  {
    id: 'outfit-nhat-binh-03',
    cdn_id: 'garment_nhat_binh_03',
    cdn_image_path: '/images/garments/curated/garment_nhat_binh_03.webp',
    fallback_image_url: '/images/garments/ao-nhat-binh.jpg',
    title: 'Áo Nhật Bình Thiên Thanh Runway Remix',
    creatorName: 'Thiên Kim @HauteCouture',
    garment: 'AO_NHAT_BINH',
    garmentLabel: 'Áo Nhật Bình Đương Đại Remix',
    color: '#3D7EA6',
    colorName: 'Xanh Thiên Thanh Đương Đại',
    styles: ['Phóng khoáng phá cách'],
    accessories: ['CHUOI_NGOC'],
    accessoryLabels: ['Vòng Cổ Ngọc Trai Đương Đại'],
    hairstyle: 'Tóc Bob tự nhiên cài kẹp bạc geometric hiện đại',
    creativityLevel: 70,
    userProfile: {
      height: '166cm',
      weight: '48kg',
      shape: 'Năng động hiện đại',
      skin: 'Sáng khỏe tự nhiên',
      hair: 'Tóc ngắn cá tính năng động'
    },
    event: 'yearbook',
    eventLabel: 'Tuần Lễ Thời Trang',
    bestOccasion: 'Tuần Lễ Thời Trang Di Sản (Fashion Week)',
    patternName: 'Lụa In Đồ Họa Cổ Phục Đương Đại',
    seal: 'Tân',
    desc: 'Bản remix đầy táo bạo kết hợp cấu trúc cổ áo Nhật Bình truyền thống với sắc xanh thiên thanh và phụ kiện ngọc trai phong cách runway quốc tế.',
    historicalStory: 'Sự sáng tạo của thế hệ trẻ khi đưa phom dáng cung đình vào thời trang đường phố đương đại, làm bừng sáng di sản trong hơi thở hiện đại.'
  },

  // =========================================================================
  // 4. ÁO TỨ THÂN KINH BẮC (3 TỔ HỢP)
  // =========================================================================
  {
    id: 'outfit-tu-than-01',
    cdn_id: 'garment_tu_than_01',
    cdn_image_path: '/images/garments/curated/garment_tu_than_01.webp',
    fallback_image_url: '/images/garments/ao-tu-than.png',
    title: 'Áo Tứ Thân Kinh Bắc Yếm Thắm Đỏ Son',
    creatorName: 'Hải Yến @QuanHọKinhBắc',
    garment: 'AO_TU_THAN',
    garmentLabel: 'Áo Tứ Thân Quan Họ Kinh Bắc',
    color: '#B22222',
    colorName: 'Đỏ Son Đại Triều & Yếm Thắm',
    styles: ['Dân gian mộc mạc', 'Nữ tính duyên dáng'],
    accessories: ['NON_QUAI_THAO'],
    accessoryLabels: ['Nón Quai Thao Quai Dệt Đổi Màu'],
    hairstyle: 'Khăn mỏ quạ & vấn tóc độn đuôi gà lúng liếng',
    creativityLevel: 15,
    userProfile: {
      height: '162cm',
      weight: '48kg',
      shape: 'Duyên dáng nụ cười duyên',
      skin: 'Trắng hồng bánh mật',
      hair: 'Tóc quấn đuôi gà truyền thống'
    },
    event: 'festival',
    eventLabel: 'Hội Lim Quan Họ',
    bestOccasion: 'Lễ Hội Lim & Giao Duyên Quan Họ Bắc Ninh',
    patternName: 'Đũi Nhuộm Nâu Sồng Đi Kèm Yếm Đào Tơ Tằm',
    seal: 'Hội',
    desc: 'Bốn vạt áo buông rủ thắt nút duyên dáng trước bụng, tà áo thướt tha hòa cùng chiếc nón quai thao trứ danh xứ Kinh Bắc ngọt ngào câu quan họ.',
    historicalStory: 'Áo Tứ Thân là biểu tượng trang phục lao động và lễ hội dân gian Bắc Bộ, với yếm đào thắm sắc và dải lụa thắt lưng buông lơi duyên dáng.'
  },
  {
    id: 'outfit-tu-than-02',
    cdn_id: 'garment_tu_than_02',
    cdn_image_path: '/images/garments/curated/garment_tu_than_02.webp',
    fallback_image_url: '/images/garments/ao-tu-than.png',
    title: 'Áo Tứ Thân Củ Nâu Đồng Nội Làng Nghề',
    creatorName: 'Như Quỳnh @ĐồngQuê',
    garment: 'AO_TU_THAN',
    garmentLabel: 'Áo Tứ Thân Nâu Sồng Cổ Truyền',
    color: '#6B4423',
    colorName: 'Nâu Cánh Gián Mộc Mạc Làng Quê',
    styles: ['Dân gian mộc mạc'],
    accessories: ['NON_LA'],
    accessoryLabels: ['Nón Lá Chóp Nhọn Quai Lụa Xanh'],
    hairstyle: 'Tóc thắt bím lệch một bên hiền hòa',
    creativityLevel: 25,
    userProfile: {
      height: '159cm',
      weight: '45kg',
      shape: 'Nhỏ nhắn thuần hậu',
      skin: 'Nắng đồng bánh mật ấm',
      hair: 'Tóc dài mượt mà buông vai'
    },
    event: 'festival',
    eventLabel: 'Lễ Hội Làng',
    bestOccasion: 'Trải Nghiệm Đồng Quê & Chụp Ảnh Làng Nghề',
    patternName: 'Vải Gai Thô Dệt Tay Cổ Truyền',
    seal: 'Mộc',
    desc: 'Mộc mạc sắc nâu củ nâu nhuộm thảo mộc tự nhiên, chiếc áo tứ thân mộc lưu giữ nếp sống đôn hậu, lam lũ mà nghĩa tình của người phụ nữ thôn quê.',
    historicalStory: 'Nhuộm củ nâu và bùn là kỹ thuật nhuộm dân gian lâu đời nhất Việt Nam, tạo nên chất vải mộc dày dặn, che chở người phụ nữ qua bao mưa nắng.'
  },
  {
    id: 'outfit-tu-than-03',
    cdn_id: 'garment_tu_than_03',
    cdn_image_path: '/images/garments/curated/garment_tu_than_03.webp',
    fallback_image_url: '/images/garments/ao-tu-than.png',
    title: 'Áo Tứ Thân Lụa Xanh Cốm Mùa Thu',
    creatorName: 'Hà My @MùaThuHàNội',
    garment: 'AO_TU_THAN',
    garmentLabel: 'Áo Tứ Thân Lụa Cốm Đương Đại',
    color: '#7A9A60',
    colorName: 'Xanh Cốm Mùa Thu Thanh Tân',
    styles: ['Đương đại tối giản', 'Thơ mộng trữ tình'],
    accessories: ['QUAT_GIAY', 'TRAM_BAC'],
    accessoryLabels: ['Quạt Giấy Điệp Trắng', 'Trâm Bạc Đính Ngọc Nhỏ'],
    hairstyle: 'Tóc xõa dài tự nhiên buông lơi bay bổng',
    creativityLevel: 60,
    userProfile: {
      height: '167cm',
      weight: '50kg',
      shape: 'Thanh mảnh nàng thơ',
      skin: 'Sáng trong ngọc bích',
      hair: 'Tóc nâu đen bồng bềnh tự nhiên'
    },
    event: 'tet',
    eventLabel: 'Mùa Thu Hà Nội',
    bestOccasion: 'Dạo Phố Mùa Thu Hà Nội & Check-in Hồ Gươm',
    patternName: 'Lụa Tơ Tằm Trơn Mềm Rủ Mát Lạnh',
    seal: 'Sắc',
    desc: 'Sắc xanh cốm non của mùa thu Hà Nội phảng phất trên bốn tà lụa mềm buông lơi, kết hợp trâm bạc thanh mảnh tạo nét thơ hiện đại xao xuyến.',
    historicalStory: 'Biến tấu tứ thân bằng chất liệu lụa tơ tằm thanh nhẹ giúp tà áo bay bổng tự nhiên trong gió thu, tôn vinh vẻ dịu dàng của người con gái đất kinh kỳ.'
  },

  // =========================================================================
  // 5. ÁO BÀ BA NAM BỘ (3 TỔ HỢP)
  // =========================================================================
  {
    id: 'outfit-ba-ba-01',
    cdn_id: 'garment_ba_ba_01',
    cdn_image_path: '/images/garments/curated/garment_ba_ba_01.webp',
    fallback_image_url: '/images/garments/ao-ba-ba.jpg',
    title: 'Áo Bà Ba Nam Bộ Xanh Ngọc Phù Sa',
    creatorName: 'Phương Nam @MiềnTâySôngNước',
    garment: 'AO_BA_BA',
    garmentLabel: 'Áo Bà Ba Nam Bộ Sông Nước',
    color: '#4A8577',
    colorName: 'Xanh Ngọc Lục Thủy Phù Sa',
    styles: ['Dân gian mộc mạc', 'Phóng khoáng phá cách'],
    accessories: ['KHAN_RAN'],
    accessoryLabels: ['Khăn Rằn Nam Bộ Ca-rô Đen Trắng'],
    hairstyle: 'Tóc buộc nửa đầu dịu dàng cài kẹp gỗ',
    creativityLevel: 20,
    userProfile: {
      height: '161cm',
      weight: '47kg',
      shape: 'Dáng tròn trịa đôn hậu',
      skin: 'Bánh mật ngọt ngào miền Tây',
      hair: 'Tóc buông xõa ngang lưng'
    },
    event: 'tet',
    eventLabel: 'Du Xuân Sông Nước',
    bestOccasion: 'Du Xuân Sông Nước & Chợ Nổi Cái Răng',
    patternName: 'Vải Ú Lụa Mộc Nam Bộ',
    seal: 'Thủy',
    desc: 'Chất liệu lụa ú mềm mát, xẻ tà phóng khoáng hai bên hông cùng chiếc khăn rằn mộc mạc, tôn trọn vẻ đẹp hào sảng và đôn hậu của miền sông nước Cửu Long.',
    historicalStory: 'Áo Bà Ba là linh hồn của thời trang phương Nam thế kỷ 19-20, tượng trưng cho tính cách hào sảng, phóng khoáng và siêng năng của người dân Nam Bộ.'
  },
  {
    id: 'outfit-ba-ba-02',
    cdn_id: 'garment_ba_ba_02',
    cdn_image_path: '/images/garments/curated/garment_ba_ba_02.webp',
    fallback_image_url: '/images/garments/ao-ba-ba.png',
    title: 'Áo Bà Ba Lãnh Mỹ A Đen Mun Cúc Bạc',
    creatorName: 'Tuyết Mai @TânChâuAnGiang',
    garment: 'AO_BA_BA',
    garmentLabel: 'Áo Bà Ba Lãnh Mỹ A Quý Tộc',
    color: '#222222',
    colorName: 'Hắc Xà Đen Mun Cổ Truyền',
    styles: ['Cổ điển hoài niệm'],
    accessories: ['KHAN_RAN', 'NON_LA'],
    accessoryLabels: ['Khăn Rằn Sọc Đỏ Nam Bộ', 'Nón Lá Ba Tri'],
    hairstyle: 'Tóc thắt bím đuôi sam dày dặn buông một bên vai',
    creativityLevel: 10,
    userProfile: {
      height: '165cm',
      weight: '52kg',
      shape: 'Khỏe khoắn nhanh nhẹn',
      skin: 'Rám nắng phù sa',
      hair: 'Bím tóc đuôi sam truyền thống'
    },
    event: 'festival',
    eventLabel: 'Lễ Kỷ Niệm Lịch Sử',
    bestOccasion: 'Lễ Kỷ Niệm Lịch Sử & Phim Văn Hóa Miền Nam',
    patternName: 'Vải Lãnh Mỹ A Tân Châu Nhuộm Mặc Nưa',
    seal: 'Đen',
    desc: 'Chất liệu Lãnh Mỹ A óng ả huyền bí như sơn mài đen, hàng cúc bấm bạc sáng bóng cùng nón lá Ba Tri tái hiện khí chất hào hiệp của người phụ nữ Nam Kỳ xưa.',
    historicalStory: 'Vải Lãnh Mỹ A dệt từ tơ tằm thượng hảo hạng và nhuộm quả mặc nưa hàng trăm lần, là báu vật gấm vóc phương Nam trứ danh khắp Đông Nam Á.'
  },
  {
    id: 'outfit-ba-ba-03',
    cdn_id: 'garment_ba_ba_03',
    cdn_image_path: '/images/garments/curated/garment_ba_ba_03.webp',
    fallback_image_url: '/images/garments/ao-ba-ba.jpg',
    title: 'Áo Bà Ba Sắc Vàng Nắng Sông Hậu',
    creatorName: 'Gia Hân @CầnThơGạoTrắng',
    garment: 'AO_BA_BA',
    garmentLabel: 'Áo Bà Ba Lụa Hoa Cách Điệu',
    color: '#F2B84B',
    colorName: 'Vàng Nắng Mật Ong Sông Hậu',
    styles: ['Nữ tính duyên dáng', 'Đương đại tối giản'],
    accessories: ['TUI_GAM', 'QUAT_GIAY'],
    accessoryLabels: ['Giỏ Cỏ Bàng Đan Tay', 'Quạt Lụa Vàng'],
    hairstyle: 'Tóc uốn lọn sóng buông lơi tự nhiên phóng khoáng',
    creativityLevel: 65,
    userProfile: {
      height: '163cm',
      weight: '49kg',
      shape: 'Thon thả eo con kiến',
      skin: 'Trắng sáng ấm áp',
      hair: 'Tóc lượn sóng trẻ trung'
    },
    event: 'festival',
    eventLabel: 'Dã Ngoại Sinh Thái',
    bestOccasion: 'Dã Ngoại Vườn Trái Cây & Check-in Cầu Khỉ',
    patternName: 'Lụa Tơ Tằm Điểm Hoa Mai Nhỏ',
    seal: 'Hòa',
    desc: 'Màu vàng nắng ấm áp như lúa chín đồng bằng, chiết eo nhẹ tôn dáng kết hợp túi cỏ bàng thủ công cho chuyến du ngoạn miệt vườn rạng rỡ.',
    historicalStory: 'Áo bà ba cải tiến với hoa văn lụa nhỏ và kỹ thuật chiết eo khéo léo mang lại diện mạo trẻ trung, tràn đầy năng lượng tích cực cho các bạn trẻ ngày nay.'
  },

  // =========================================================================
  // 6. ÁO DÀI LEMUR TÂN THỜI (3 TỔ HỢP)
  // =========================================================================
  {
    id: 'outfit-lemur-01',
    cdn_id: 'garment_lemur_01',
    cdn_image_path: '/images/garments/curated/garment_lemur_01.webp',
    fallback_image_url: '/images/garments/ao-dai-lemur.png',
    title: 'Áo Dài Lemur Tân Thời Bạch Ngọc 1930s',
    creatorName: 'Khánh An @HàThànhCổĐiển',
    garment: 'AO_DAI_LEMUR',
    garmentLabel: 'Áo Dài Lemur Cát Tường 1930',
    color: '#E8F3EE',
    colorName: 'Bạch Ngọc Sương Mai Tân Thời',
    styles: ['Cổ điển hoài niệm', 'Thanh tao cung đình'],
    accessories: ['CHUOI_NGOC'],
    accessoryLabels: ['Chuỗi Ngọc Trai Cổ Điển Ba Tầng'],
    hairstyle: 'Tóc uốn sóng minh tinh cổ điển thập niên 1930',
    creativityLevel: 30,
    userProfile: {
      height: '166cm',
      weight: '49kg',
      shape: 'Đồng hồ cát eo thon vai bồng',
      skin: 'Trắng sứ thanh tú',
      hair: 'Tóc uốn sóng Finger Wave 1930s'
    },
    event: 'yearbook',
    eventLabel: 'Chụp Kỷ Yếu',
    bestOccasion: 'Chụp Ảnh Kỷ Yếu Nghệ Thuật & Dạ Tiệc Tân Thời',
    patternName: 'Lụa Voan Thêu Hoa Nhỏ Cát Tường',
    seal: 'Tân',
    desc: 'Âm hưởng cách tân đầu thế kỷ 20 của họa sĩ Lemur Cát Tường với bờ vai bồng thanh lịch, chiết eo nhẹ nhàng tôn vóc dáng thiếu nữ tri thức Hà thành.',
    historicalStory: 'Áo Dài Lemur (1934) mở đầu cho cuộc cách mạng giải phóng phom dáng phụ nữ Việt Nam, kết hợp tinh tế giữa văn hóa phương Tây và nếp áo dài truyền thống.'
  },
  {
    id: 'outfit-lemur-02',
    cdn_id: 'garment_lemur_02',
    cdn_image_path: '/images/garments/curated/garment_lemur_02.webp',
    fallback_image_url: '/images/garments/ao-dai-lemur.png',
    title: 'Áo Dài Lemur Nhung Đỏ Dạ Hội',
    creatorName: 'Hoài Thương @DạHộiHàNội',
    garment: 'AO_DAI_LEMUR',
    garmentLabel: 'Áo Dài Lemur Nhung Tuyết Dạ Hội',
    color: '#9A1F38',
    colorName: 'Đỏ Nhung Rượu Vang Dạ Hội',
    styles: ['Vương giả quyền quý'],
    accessories: ['CHUOI_NGOC', 'TUI_GAM'],
    accessoryLabels: ['Khuyên Tai Ngọc Trai Nước Ngọt', 'Ví Đầm Lụa Satin'],
    hairstyle: 'Tóc búi kiểu Pháp kiêu sa quý phái',
    creativityLevel: 50,
    userProfile: {
      height: '169cm',
      weight: '52kg',
      shape: 'Lưng thon vai gầy thanh tú',
      skin: 'Sáng mịn kiêu kỳ',
      hair: 'Tóc búi cao thanh thoát lộ cần cổ'
    },
    event: 'festival',
    eventLabel: 'Dạ Tiệc Hòa Nhạc',
    bestOccasion: 'Dạ Tiệc Hòa Nhạc Thính Phòng & Gala Di Sản',
    patternName: 'Nhung Tuyết Lụa Thượng Hạng Sang Trọng',
    seal: 'Quý',
    desc: 'Chất nhung tuyết đỏ Bordeaux quý phái, cổ khoét giọt lệ cách tân tao nhã, toát lên khí chất quý cô đài các trong những đêm dạ tiệc thính phòng.',
    historicalStory: 'Nhung tuyết và lụa voan là hai chất liệu biểu tượng của phong trào Áo Dài Tân Thời, tạo nên nét đẹp quyến rũ kiêu sa cho giới trí thức thành thị.'
  },
  {
    id: 'outfit-lemur-03',
    cdn_id: 'garment_lemur_03',
    cdn_image_path: '/images/garments/curated/garment_lemur_03.webp',
    fallback_image_url: '/images/garments/ao-dai-lemur.png',
    title: 'Áo Dài Lemur Xanh Bạc Hà Pastel Remix',
    creatorName: 'Ngọc Diệp @GenZMuse',
    garment: 'AO_DAI_LEMUR',
    garmentLabel: 'Áo Dài Lemur Nàng Thơ Lãng Mạn',
    color: '#A3D9C9',
    colorName: 'Xanh Bạc Hà Pastel Dịu Mát',
    styles: ['Phóng khoáng phá cách', 'Thơ mộng trữ tình'],
    accessories: ['QUAT_GIAY'],
    accessoryLabels: ['Quạt Xếp Ren Trắng Tiểu Thư'],
    hairstyle: 'Tóc buộc đuôi ngựa thấp với nơ ruy băng lụa mềm',
    creativityLevel: 75,
    userProfile: {
      height: '162cm',
      weight: '46kg',
      shape: 'Nhỏ nhắn nàng thơ thanh xuân',
      skin: 'Sáng hồng hào tự nhiên',
      hair: 'Tóc tơ mềm mại buộc ruy băng'
    },
    event: 'yearbook',
    eventLabel: 'Triển Lãm Nghệ Thuật',
    bestOccasion: 'Triển Lãm Nhiếp Ảnh & Cà Phê Phố Cổ Chiều Thu',
    patternName: 'Lụa Tơ Chiffon Bay Bổng Tự Nhiên',
    seal: 'Mộng',
    desc: 'Sắc pastel xanh bạc hà mát rượi hòa cùng chất voan tơ bay bổng, tà áo mang tinh thần tự do của nàng thơ Gen Z yêu nghệ thuật và nhiếp ảnh.',
    historicalStory: 'Sắc màu pastel hiện đại trên nền phom dáng Lemur 1930 chứng minh sức sống bền bỉ và khả năng thích ứng tuyệt vời của di sản thời trang Việt.'
  }
];

/**
 * Tạo danh sách 18 bộ trang phục hoàn chỉnh với Prompt được tính toán chính xác
 */
export const CURATED_18_OUTFITS: DiscoveryOutfit[] = RAW_CURATED_DEFS.map((def) => {
  const assembledPrompt = assembleFashionPrompt(
    {
      garment: def.garment,
      color: def.color,
      colorName: def.colorName,
      styles: def.styles,
      style_mode: def.styles.join(', '),
      accessories: def.accessories,
      accessory: def.accessories[0] || 'QUAT_GIAY',
      hairstyle: def.hairstyle,
      creativityLevel: def.creativityLevel,
      event: def.event,
      bestOccasion: def.bestOccasion,
      eventLabel: def.eventLabel
    },
    {
      height: def.userProfile.height,
      weight: def.userProfile.weight,
      shape: def.userProfile.shape,
      skin: def.userProfile.skin,
      hair: def.userProfile.hair
    }
  );

  return {
    id: def.id,
    cdn_id: def.cdn_id,
    cdn_image_path: def.cdn_image_path,
    imageUrl: def.fallback_image_url,
    title: def.title,
    creatorName: def.creatorName,
    garment: def.garment,
    garmentLabel: def.garmentLabel,
    color: def.color,
    colorName: def.colorName,
    styles: def.styles,
    style_mode: def.styles.join(', '),
    accessories: def.accessories,
    accessoryLabels: def.accessoryLabels,
    accessory: def.accessories[0] || 'QUAT_GIAY',
    accessoryLabel: def.accessoryLabels[0] || 'Quạt Giấy',
    hairstyle: def.hairstyle,
    creativityLevel: def.creativityLevel,
    userProfile: def.userProfile,
    event: def.event,
    eventLabel: def.eventLabel,
    bestOccasion: def.bestOccasion,
    patternName: def.patternName,
    seal: def.seal,
    desc: def.desc,
    historicalStory: def.historicalStory,
    assembledPrompt: assembledPrompt
  };
});
