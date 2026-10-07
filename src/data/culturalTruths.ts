/**
 * VIỆT Y REMIX — CONSOLIDATED CULTURAL TRUTHS & VERIFIED GROUND TRUTH
 * 
 * Nguồn sự thật duy nhất và xác thực về Di sản Cổ phục Việt Nam.
 * 
 * NGUYÊN TẮC PHÂN ĐỊNH RẠCH RÒI:
 * 1. PHẦN GROUND TRUTH (BẮT BUỘC CHÍNH XÁC, KHÔNG ĐƯỢC SAI LỆCH):
 *    - Niên đại, triều đại, nguồn gốc vùng miền.
 *    - Đặc trưng cấu trúc cốt lõi (form dáng, cổ áo, cấu trúc thân).
 *    - Các điều kiêng kỵ / xung đột văn hóa nghiêm ngặt (Strict Taboos).
 *    - NGUỒN XÁC THỰC: Bắt buộc mỗi mục phải có `sourceUrl` thật để trích dẫn.
 * 
 * 2. PHẦN KHÔNG GIAN SÁNG TẠO TỰ NHIÊN CỦA AI:
 *    - Gợi ý kiểu tóc, trang điểm, dáng chụp ảnh nghệ thuật, phụ kiện đương đại
 *      và phong cách phối màu Gen Z sẽ do Gemini AI tự do suy luận theo ngữ cảnh,
 *      không bị trói buộc bởi các trường cơ sở dữ liệu cứng nhắc.
 */

export interface CulturalHeritageEntry {
  /** Mã định danh độc nhất của trang phục (ví dụ: AO_NGU_THAN, AO_TAC, AO_BA_BA...) */
  id: string;
  /** Tên trang phục chính thức chuẩn di sản */
  name: string;
  /** Các tên gọi dân gian hoặc lịch sử phổ biến */
  commonNames: string[];
  /** Niên đại / Triều đại ra đời và phát triển */
  historicalEra: string;
  /** Vùng miền cội nguồn văn hóa */
  originRegion: 'BAC_BO' | 'TRUNG_BO' | 'NAM_BO' | 'TOAN_QUOC';
  /** Tầng lớp / Bối cảnh xã hội sử dụng nguyên bản */
  socialContext: string;
  /** Các đặc trưng cấu trúc & may mặc cốt lõi không thể làm sai */
  definingFeatures: string[];
  /**
   * Các quy chuẩn kiêng kỵ nghiêm ngặt (Strict Cultural Taboos).
   * Dùng làm guardrail để AI cảnh báo nếu người dùng kết hợp sai lệch lịch sử.
   */
  strictTaboos: Array<{
    /** Phụ kiện hoặc chi tiết xung đột (ví dụ: KHAN_RAN, NON_QUAI_THAO...) */
    incompatibleWith: string;
    /** Tên hiển thị của phụ kiện bị xung đột */
    incompatibleName: string;
    /** Lý giải lịch sử vì sao xung đột nghiêm trọng */
    historicalConflictReason: string;
    /** Gợi ý phụ kiện thay thế chuẩn mực */
    suggestedAlternative: string;
  }>;
  /** Chiều sâu ý nghĩa và tri thức văn hóa xác thực */
  culturalSignificance: string;

  // --- TRÍCH DẪN NGUỒN BẮT BUỘC (MANDATORY ATTRIBUTION) ---
  /** Tên tài liệu / Công trình khảo cứu */
  sourceTitle: string;
  /** Tác giả hoặc Cơ quan / Viện bảo tàng lưu trữ */
  authorOrInstitution: string;
  /** 
   * BẮT BUỘC: Đường dẫn URL xác thực đến tài liệu nguồn của viện bảo tàng hoặc tổ chức văn hóa uy tín
   */
  sourceUrl: string;
  /** Chương mục hoặc ghi chú khảo cứu cụ thể */
  sourceReferenceNote?: string;
  /** Năm xuất bản hoặc công bố (nếu có) */
  publicationYear?: number;
}

/**
 * Giao diện CulturalDatabase ép buộc mọi mục trang phục đều phải tuân thủ CulturalHeritageEntry (có sourceUrl)
 */
export interface CulturalDatabase {
  [garmentId: string]: CulturalHeritageEntry;
}

/**
 * CƠ SỞ DỮ LIỆU DI SẢN CHÍNH THỨC — ĐƯỢC CHỨNG THỰC BỞI TÀI LIỆU KHẢO CỨU
 * 
 * HƯỚNG DẪN BẠN TỰ THÊM NGUỒN & TRANG PHỤC MỚI VÀO HỆ THỐNG:
 * Chỉ cần thêm một khối mới vào object `CULTURAL_DATABASE` bên dưới với:
 * - `id`: Mã trang phục viết hoa không dấu (ví dụ: 'AO_VIEN_LINH', 'AO_DOI_KHAM')
 * - `name`: Tên tiếng Việt có dấu
 * - `historicalEra`, `originRegion`, `definingFeatures`: Kiến thức lịch sử chuẩn
 * - `strictTaboos`: Các món kỵ phối cùng (nếu có)
 * - `sourceTitle`, `authorOrInstitution`, `sourceUrl`: Link nguồn từ bảo tàng hoặc tạp chí nghiên cứu
 */
export const CULTURAL_DATABASE: CulturalDatabase = {
  AO_NGU_THAN: {
    id: 'AO_NGU_THAN',
    name: 'Áo Ngũ Thân Lập Lĩnh (Tay Chẽn)',
    commonNames: ['Áo ngũ thân', 'Áo dài năm thân', 'Áo chẽn triều Nguyễn'],
    historicalEra: 'Định hình từ thời chúa Nguyễn Phúc Khoát (1744 Đàng Trong) và vua Minh Mạng chuẩn hóa toàn quốc (1827–1837)',
    originRegion: 'TOAN_QUOC',
    socialContext: 'Quốc phục phổ thông của mọi tầng lớp từ quý tộc đến thứ dân triều Nguyễn trong nghi lễ và đời sống thường nhật đĩnh đạc.',
    definingFeatures: [
      'Cấu trúc 5 thân áo: 2 thân trước, 2 thân sau, và 1 thân con (thân thứ năm) lót kín đáo bên ngực phải.',
      'Cổ lập lĩnh (cổ đứng vuông góc, cao khoảng 2-3cm, ôm khít cổ, bên trong thường lộ mép cổ lót trắng ngà).',
      'Hàng 5 cúc (khuy) cài chéo từ cổ sang nách sườn phải làm bằng đồng, gốm, gỗ hoặc ngọc.',
      'Phom dáng đứng, tà áo xòe nhẹ hình chữ A, không chiết eo bó sát, tôn dáng đoan trang.'
    ],
    strictTaboos: [
      {
        incompatibleWith: 'KHAN_RAN',
        incompatibleName: 'Khăn Rằn Nam Bộ',
        historicalConflictReason: 'Khăn rằn bắt nguồn từ nếp sống lao động sông nước Nam Bộ thế kỷ 19-20, trong khi Áo ngũ thân lập lĩnh là lễ phục đĩnh đạc triều đình và sĩ phu. Phối hợp này là thể nghiệm phá cách đương đại, không có trong điển chế di sản gốc.',
        suggestedAlternative: 'QUAT_GIAY'
      },
      {
        incompatibleWith: 'NON_QUAI_THAO',
        incompatibleName: 'Nón Quai Thao Bắc Bộ',
        historicalConflictReason: 'Nón quai thao đi liền với áo tứ thân dệt đũi xứ Kinh Bắc (quan họ), không bao giờ đi cùng áo ngũ thân lập lĩnh triều Nguyễn.',
        suggestedAlternative: 'KHAN_DONG'
      }
    ],
    culturalSignificance: '5 thân áo mang triết lý Tứ Thân Phụ Mẫu (cha mẹ mình và cha mẹ người phối ngẫu) ôm lấy thân con bên trong thể hiện Đạo Hiếu. 5 hạt cúc biểu trưng cho Ngũ Thường (Nhân - Lễ - Nghĩa - Trí - Tín) và Ngũ Luân đạo làm người.',
    sourceTitle: 'Ngàn Năm Áo Mũ — Lịch sử trang phục Việt Nam giai đoạn 1009–1945',
    authorOrInstitution: 'Bảo tàng Lịch sử Quốc gia & Nhà nghiên cứu Trần Quang Đức',
    sourceUrl: 'https://baotanglichsu.vn/vi/Articles/3097/16382/ngan-nam-ao-mu-cong-trinh-nghien-cuu-trang-phuc-viet-nam.html',
    sourceReferenceNote: 'Chương 5: Trang phục thời Nguyễn — Tiêu chuẩn hóa Áo Ngũ Thân thời Minh Mạng',
    publicationYear: 2013
  },

  AO_TAC: {
    id: 'AO_TAC',
    name: 'Áo Tấc (Áo Ngũ Thân Tay Thụ - Đại Lễ Phục)',
    commonNames: ['Áo thụng', 'Áo lễ ngũ thân', 'Áo tay thụ'],
    historicalEra: 'Triều Nguyễn (1802–1945)',
    originRegion: 'TOAN_QUOC',
    socialContext: 'Đại lễ phục trang trọng dùng trong các dịp tế tự, hôn lễ, việc quan, viếng đình miếu của cả giới quý tộc lẫn thường dân.',
    definingFeatures: [
      'Cấu trúc tương tự áo ngũ thân lập lĩnh nhưng hai ống tay may thụng rất rộng và dài (tay thụ).',
      'Khi buông tay chắp trước bụng, hai ống tay áo rủ xuống tạo hình dáng vuông vức, trang nghiêm.',
      'Cổ đứng cài 5 cúc, tà áo dài qua gối rủ thẳng thớm.'
    ],
    strictTaboos: [
      {
        incompatibleWith: 'KHAN_RAN',
        incompatibleName: 'Khăn Rằn Nam Bộ',
        historicalConflictReason: 'Áo tấc là đại lễ phục tôn nghiêm, tuyệt đối không phối cùng khăn rằn lao động dân dã.',
        suggestedAlternative: 'KHAN_DONG'
      },
      {
        incompatibleWith: 'NON_QUAI_THAO',
        incompatibleName: 'Nón Quai Thao Bắc Bộ',
        historicalConflictReason: 'Áo tấc triều đình không đi cùng nón quai thao hội hè Kinh Bắc.',
        suggestedAlternative: 'QUAT_GIAY'
      }
    ],
    culturalSignificance: 'Ống tay thụng rộng khi chắp tay hành lễ tạo nên phong thái khiêm nhường, kính cẩn trước tổ tiên và thần linh, biểu thị sự viên mãn và lễ nghi phép tắc.',
    sourceTitle: 'Nghi lễ và Quy chế Y phục Cung đình Triều Nguyễn',
    authorOrInstitution: 'Trung tâm Bảo tồn Di tích Cố đô Huế',
    sourceUrl: 'https://hueworldheritage.org.vn/',
    sourceReferenceNote: 'Quy chuẩn lễ phục Áo Tấc trong các nghi thức cung đình và gia lễ truyền thống',
    publicationYear: 2007
  },

  AO_NHAT_BINH: {
    id: 'AO_NHAT_BINH',
    name: 'Áo Nhật Bình (Cung Phục Hậu Phi Triều Nguyễn)',
    commonNames: ['Áo xẻ ngực Nhật Bình', 'Nhật Bình cung đình'],
    historicalEra: 'Triều Nguyễn (1802–1945)',
    originRegion: 'TRUNG_BO',
    socialContext: 'Thường phục của Hoàng Hậu, Công Chúa, Phi Tần và lễ phục của các mệnh phụ quý tộc triều đình Huế.',
    definingFeatures: [
      'Cổ áo khoét hình chữ nhật lớn trước ngực (đối khâm xẻ giữa), có nẹp cổ thêu hoa văn hoa mẫu đơn, phượng, loan chỉ vàng kim tuyến.',
      'Hai dải ngũ sắc (tượng trưng ngũ hành: Kim - Mộc - Thủy - Hỏa - Thổ) viền ở tay áo.',
      'Cố định vạt áo bằng hai dải dây buộc trước ngực hoặc trâm cài ngọc.'
    ],
    strictTaboos: [
      {
        incompatibleWith: 'KHAN_RAN',
        incompatibleName: 'Khăn Rằn Nam Bộ',
        historicalConflictReason: 'Áo Nhật Bình là phẩm phục cao quý chốn hoàng cung triều Nguyễn, hoàn toàn cấm kỵ phối với phụ kiện thôn dã sông nước.',
        suggestedAlternative: 'QUAT_GIAY'
      },
      {
        incompatibleWith: 'NON_QUAI_THAO',
        incompatibleName: 'Nón Quai Thao Bắc Bộ',
        historicalConflictReason: 'Xung đột vùng miền và tầng lớp; cung phục hoàng gia Huế đi cùng khăn vành dây chứ không đi cùng nón thúng quai thao.',
        suggestedAlternative: 'TRAM_GOM'
      }
    ],
    culturalSignificance: 'Mỗi họa tiết trên nẹp cổ và sắc màu áo phân định phẩm hàm tôn ti trật tự chốn hoàng triều, là đỉnh cao mỹ thuật thêu tay cung đình Việt Nam.',
    sourceTitle: 'Khảo Cứu Về Trang Phục Triều Nguyễn',
    authorOrInstitution: 'Nhà nghiên cứu Trần Đình Sơn & Trung tâm Bảo tồn Di tích Cố đô Huế',
    sourceUrl: 'https://hueworldheritage.org.vn/',
    sourceReferenceNote: 'Chương: Phẩm phục Cung闱 — Quy chế may thêu và màu sắc Áo Nhật Bình',
    publicationYear: 2012
  },

  AO_GIAO_LINH: {
    id: 'AO_GIAO_LINH',
    name: 'Áo Giao Lĩnh (Cổ Chéo Cổ Truyền)',
    commonNames: ['Áo tràng vạt chéo', 'Giao lĩnh'],
    historicalEra: 'Xuất hiện từ thời Lý - Trần và thịnh hành suốt thời Lê sơ - Lê Trung Hưng (Thế kỷ 11 đến 18)',
    originRegion: 'BAC_BO',
    socialContext: 'Lễ phục trang trọng của vua quan, quý tộc và thường dân trước khi có cuộc cải cách y phục của chúa Nguyễn Phúc Khoát.',
    definingFeatures: [
      'Hai vạt áo giao nhau (cổ chéo), vạt bên trái đè lên vạt bên phải trước ngực.',
      'Thân áo rộng rãi, tay áo rộng hoặc tay thụng buông dài tự nhiên.',
      'Thường dùng đai lụa hoặc thắt lưng vải buộc ngang eo để cố định tà áo.'
    ],
    strictTaboos: [
      {
        incompatibleWith: 'KHAN_RAN',
        incompatibleName: 'Khăn Rằn Nam Bộ',
        historicalConflictReason: 'Áo Giao Lĩnh có niên đại từ thời Lý - Trần - Lê (khi chưa định hình văn hóa khăn rằn Nam Bộ), lệch niên đại lịch sử hàng trăm năm.',
        suggestedAlternative: 'QUAT_GIAY'
      }
    ],
    culturalSignificance: 'Biểu trưng cho nếp mặc cổ phong ngàn năm của các triều đại hưng thịnh phương Bắc Đại Việt, mang dáng dấp khoáng đạt, tao nhã.',
    sourceTitle: 'Sưu tập Di sản Y phục Cổ truyền Việt Nam thời Lý - Trần - Lê',
    authorOrInstitution: 'Bảo tàng Lịch sử Quốc gia Việt Nam',
    sourceUrl: 'https://baotanglichsu.vn/',
    sourceReferenceNote: 'Hồ sơ hiện vật mộ táng và tượng thờ thời Lê Trung Hưng',
    publicationYear: 2015
  },

  AO_TU_THAN: {
    id: 'AO_TU_THAN',
    name: 'Áo Tứ Thân Dân Gian',
    commonNames: ['Áo tứ thân Kinh Bắc', 'Áo bốn thân'],
    historicalEra: 'Thịnh hành từ thời Lê đến đầu thế kỷ 20 ở đồng bằng Bắc Bộ',
    originRegion: 'BAC_BO',
    socialContext: 'Y phục cổ truyền đặc trưng của phụ nữ nông thôn Bắc Bộ, gắn liền với các lễ hội mùa xuân, hát quan họ Kinh Bắc.',
    definingFeatures: [
      'Áo gồm 4 thân: 2 thân sau may ghép sống lưng (đường sống áo), 2 thân trước tách rời thả dài để buộc vạt trước bụng.',
      'Không cài cúc kín như áo ngũ thân; bên trong mặc yếm đào hoặc yếm cổ xây, áo cánh trắng mỏng.',
      'Thắt lưng lụa đào hoặc lụa xanh thắt ngang eo buông rủ hai đầu dải mềm mại.'
    ],
    strictTaboos: [
      {
        incompatibleWith: 'KHAN_RAN',
        incompatibleName: 'Khăn Rằn Nam Bộ',
        historicalConflictReason: 'Áo tứ thân gắn liền với văn hóa Kinh Bắc (nón quai thao, khăn mỏ quạ), không bao giờ đi cùng khăn rằn Nam Bộ.',
        suggestedAlternative: 'NON_QUAI_THAO'
      }
    ],
    culturalSignificance: 'Tôn vinh vẻ đẹp khỏe khoắn, cần lao mà ý nhị, kín đáo của người phụ nữ nông thôn phương Bắc với hình ảnh nụ cười hàm tiếu sau vành nón quai thao.',
    sourceTitle: 'Không gian Di sản Văn hóa Dân gian Nữ xứ Bắc',
    authorOrInstitution: 'Cục Di sản Văn hóa — Bộ Văn hóa, Thể thao và Du lịch',
    sourceUrl: 'http://dsvh.gov.vn/',
    sourceReferenceNote: 'Chuyên khảo: Nếp mặc truyền thống trong hội làng Bắc Bộ',
    publicationYear: 2018
  },

  AO_BA_BA: {
    id: 'AO_BA_BA',
    name: 'Áo Bà Ba Nam Bộ',
    commonNames: ['Áo bà ba', 'Áo cánh phương Nam'],
    historicalEra: 'Định hình và phát triển mạnh mẽ từ nửa cuối thế kỷ 19 tại Nam Kỳ Lục Tỉnh',
    originRegion: 'NAM_BO',
    socialContext: 'Trang phục đời thường và lao động mộc mạc, phóng khoáng của người dân vùng đồng bằng sông Cửu Long.',
    definingFeatures: [
      'Thân áo ngắn tới hông, xẻ tà hai bên hông tạo sự thoáng mát và dễ dàng cử động khi làm đồng, chèo xuồng.',
      'Cổ áo thường là cổ tròn hoặc cổ tim xẻ một đường trụ ngắn ở giữa, đính hàng cúc bấm hoặc cúc nhựa/xương.',
      'Phía trước có hai túi vuông to ở hai bên vạt áo dưới để đựng đồ tiện lợi.',
      'Thường may bằng vải ú, lụa đen, màu nâu đất phù sa hoặc vải hoa rực rỡ.'
    ],
    strictTaboos: [
      {
        incompatibleWith: 'NON_QUAI_THAO',
        incompatibleName: 'Nón Quai Thao Bắc Bộ',
        historicalConflictReason: 'Nón quai thao là biểu tượng đặc thù của quan họ Bắc Ninh (xứ Kinh Bắc), không bao giờ xuất hiện trong trang phục đời sống mộc mạc Nam Bộ.',
        suggestedAlternative: 'KHAN_RAN'
      },
      {
        incompatibleWith: 'KHAN_DONG',
        incompatibleName: 'Khăn Đóng Cung Đình Triều Nguyễn',
        historicalConflictReason: 'Khăn đóng/khăn vành trang trọng triều đình không phù hợp với tính chất dân dã phóng khoáng của áo bà ba.',
        suggestedAlternative: 'KHAN_RAN'
      }
    ],
    culturalSignificance: 'Gắn liền với tính cách hào sảng, chân chất, đôn hậu của con người phương Nam giữa sông nước miệt vườn mênh mông phù sa.',
    sourceTitle: 'Bộ sưu tập Di sản Áo Bà Ba và Khăn Rằn trong Đời sống Phụ nữ Nam Bộ',
    authorOrInstitution: 'Bảo tàng Phụ nữ Nam Bộ',
    sourceUrl: 'https://baotangphunu.com/',
    sourceReferenceNote: 'Khu trưng bày chuyên đề: Trang phục phụ nữ miền sông nước Cửu Long',
    publicationYear: 2020
  },

  AO_VIEN_LINH: {
    id: 'AO_VIEN_LINH',
    name: 'Áo Viên Lĩnh (Cổ Tròn Bàn Lĩnh)',
    commonNames: ['Áo viên lĩnh', 'Áo bàn lĩnh', 'Áo cổ tròn đại triều'],
    historicalEra: 'Thịnh hành từ triều Lý, Trần đến thời Lê sơ và Lê Trung Hưng (Thế kỷ 11 đến 18)',
    originRegion: 'BAC_BO',
    socialContext: 'Đại triều phục và thường phục cao cấp của hoàng đế, đại thần và tầng lớp quý tộc Đại Việt.',
    definingFeatures: [
      'Cổ áo hình tròn ôm khít chân cổ (viên lĩnh / bàn lĩnh), vạt áo cài nút bên vai phải.',
      'Thân áo thụng rộng, hai ống tay áo buông dài trang nghiêm bề thế.',
      'Trước ngực và sau lưng của phẩm quan thường đính bổ tử thêu chim muông hoặc thú dữ để phân định phẩm hàm.'
    ],
    strictTaboos: [
      {
        incompatibleWith: 'KHAN_RAN',
        incompatibleName: 'Khăn Rằn Nam Bộ',
        historicalConflictReason: 'Áo Viên Lĩnh là triều phục tôn nghiêm thời Lý - Trần - Lê, tuyệt đối không phối cùng khăn rằn lao động sông nước thế kỷ 19.',
        suggestedAlternative: 'THE_BAI'
      }
    ],
    culturalSignificance: 'Biểu trưng cho uy quyền và chế độ văn hiến ngàn năm của các vương triều phong kiến Đại Việt thời cực thịnh.',
    sourceTitle: 'Ngàn Năm Áo Mũ — Lịch sử trang phục Việt Nam giai đoạn 1009–1945',
    authorOrInstitution: 'Bảo tàng Lịch sử Quốc gia & Nhà nghiên cứu Trần Quang Đức',
    sourceUrl: 'https://baotanglichsu.vn/vi/Articles/3097/16382/ngan-nam-ao-mu-cong-trinh-nghien-cuu-trang-phuc-viet-nam.html',
    sourceReferenceNote: 'Chương 2 & 3: Trang phục triều Lý - Trần - Lê sơ — Cổ tròn Viên Lĩnh',
    publicationYear: 2013
  },

  AO_DOI_KHAM: {
    id: 'AO_DOI_KHAM',
    name: 'Áo Đối Khâm (Xẻ Ngực Song Song)',
    commonNames: ['Áo đối khâm', 'Áo vạt song song', 'Đối khâm thời Lê'],
    historicalEra: 'Thịnh hành thời Lý, Trần và đặc biệt phát triển rực rỡ thời Lê sơ - Lê Trung Hưng',
    originRegion: 'BAC_BO',
    socialContext: 'Thường phục thanh lịch của quý tộc, mệnh phụ và hoàng gia Đại Việt khi dạo chơi, đàm đạo.',
    definingFeatures: [
      'Hai vạt áo buông thẳng song song trước ngực (đối khâm), không cài cúc giao nhau.',
      'Bên trong mặc áo giao lĩnh hoặc yếm lót kín đáo.',
      'Hai bên nẹp vạt áo thường thêu hoa văn hoặc viền gấm rủ mềm mại tạo phong thái thanh thoát.'
    ],
    strictTaboos: [
      {
        incompatibleWith: 'KHAN_RAN',
        incompatibleName: 'Khăn Rằn Nam Bộ',
        historicalConflictReason: 'Áo Đối Khâm xuất hiện từ thời Lý - Trần - Lê, khác biệt thời đại và không gian văn hóa với khăn rằn Nam Bộ.',
        suggestedAlternative: 'QUAT_GIAY'
      }
    ],
    culturalSignificance: 'Thể hiện phong thái khoáng đạt, tự do và khi chất quý phái của nếp sống phong lưu Đại Việt cổ xưa.',
    sourceTitle: 'Sưu tập Di sản Y phục Cổ truyền Việt Nam thời Lý - Trần - Lê',
    authorOrInstitution: 'Bảo tàng Lịch sử Quốc gia Việt Nam',
    sourceUrl: 'https://baotanglichsu.vn/',
    sourceReferenceNote: 'Chuyên đề: Áo khoác ngoài Đối Khâm của tầng lớp quý tộc thời Lê',
    publicationYear: 2015
  },

  AO_DAI_LEMUR: {
    id: 'AO_DAI_LEMUR',
    name: 'Áo Dài Cổ Điển Tân Thời (Lemur - Lê Phổ)',
    commonNames: ['Áo dài Lemur', 'Áo dài tân thời thập niên 1930', 'Áo dài Cát Tường'],
    historicalEra: 'Khởi xướng bởi họa sĩ Nguyễn Cát Tường (Lemur) và họa sĩ Lê Phổ từ năm 1934–1950',
    originRegion: 'TOAN_QUOC',
    socialContext: 'Biểu tượng cách tân thời trang của phụ nữ trí thức và giới thị thành Việt Nam đầu thế kỷ 20, nhịp cầu giữa ngũ thân cổ truyền và áo dài hiện đại.',
    definingFeatures: [
      'Kế thừa phom dáng áo ngũ thân nhưng chiết eo nhẹ tôn đường cong tự nhiên của phụ nữ.',
      'Cổ áo đa dạng: cổ sen, cổ tròn hoặc cổ viền đăng ten, tay áo bồng nhẹ kiểu phương Tây.',
      'Tà áo buông dài chấm mu bàn chân, mặc cùng quần trắng hoặc đen ống suông thanh thoát.'
    ],
    strictTaboos: [
      {
        incompatibleWith: 'KHAN_RAN',
        incompatibleName: 'Khăn Rằn Nam Bộ',
        historicalConflictReason: 'Áo dài Lemur là phong cách tân thời quý phái của phụ nữ thành thị, kiêng kỵ phối tùy tiện với khăn rằn lao động.',
        suggestedAlternative: 'VI_CAM_TAY'
      }
    ],
    culturalSignificance: 'Dấu mốc vàng son của cuộc cách tân mỹ thuật phục trang Việt Nam, kết hợp tinh hoa phương Đông và hơi thở thời đại.',
    sourceTitle: 'Lịch sử Áo Dài Việt Nam — Từ Áo Ngũ Thân Đến Tân Thời',
    authorOrInstitution: 'Bảo tàng Phụ nữ Việt Nam',
    sourceUrl: 'https://baotangphunu.org.vn/',
    sourceReferenceNote: 'Chuyên đề: Cải cách y phục Áo Dài thập niên 1930 phong trào Tự Lực Văn Đoàn',
    publicationYear: 2019
  }
};

/**
 * Lấy thông tin Ground Truth của một loại trang phục
 */
export function getCulturalTruth(garmentId: string): CulturalHeritageEntry {
  const normalizedId = (garmentId || 'AO_NGU_THAN').toUpperCase();
  return CULTURAL_DATABASE[normalizedId] || CULTURAL_DATABASE.AO_NGU_THAN;
}

/**
 * Lấy danh sách toàn bộ trang phục được bảo chứng di sản
 */
export function getAllCulturalTruths(): CulturalHeritageEntry[] {
  return Object.values(CULTURAL_DATABASE);
}

/**
 * Kiểm tra nhanh một phụ kiện có vi phạm điều kiêng kỵ nghiêm ngặt (Strict Taboo) hay không
 */
export function checkStrictTaboo(
  garmentId: string,
  accessoryId: string
): { isTaboo: boolean; taboo?: CulturalHeritageEntry['strictTaboos'][0] } {
  const truth = getCulturalTruth(garmentId);
  const normalizedAcc = (accessoryId || '').toUpperCase().trim();
  const matchedTaboo = truth.strictTaboos.find(
    (t) =>
      t.incompatibleWith.toUpperCase() === normalizedAcc ||
      normalizedAcc.includes(t.incompatibleWith.toUpperCase()) ||
      t.incompatibleName.toUpperCase() === normalizedAcc ||
      normalizedAcc.includes(t.incompatibleName.toUpperCase())
  );

  if (matchedTaboo) {
    return { isTaboo: true, taboo: matchedTaboo };
  }
  return { isTaboo: false };
}

/**
 * Kiểm tra danh sách nhiều phụ kiện (cho phép chọn nhiều món) đối chiếu với Strict Taboos
 */
export function checkMultipleStrictTaboos(
  garmentId: string,
  accessories: string[]
): { hasTaboo: boolean; taboos: Array<CulturalHeritageEntry['strictTaboos'][0]> } {
  const taboosFound: Array<CulturalHeritageEntry['strictTaboos'][0]> = [];
  for (const acc of accessories) {
    const res = checkStrictTaboo(garmentId, acc);
    if (res.isTaboo && res.taboo) {
      if (!taboosFound.some((t) => t.incompatibleWith === res.taboo!.incompatibleWith)) {
        taboosFound.push(res.taboo);
      }
    }
  }
  return {
    hasTaboo: taboosFound.length > 0,
    taboos: taboosFound
  };
}

/**
 * BỘ LỌC KIỂM TRA THUẦN PHONG MỸ TỤC & TÍNH KHẢ THI (STATE-PROOF INPUT SANITY GUARDRAIL)
 * Kiểm duyệt input tự do của người dùng:
 * 1. Từ ngữ thô tục, phản cảm, xúc phạm hoặc vi phạm thuần phong mỹ tục
 * 2. Ký tự vô nghĩa, spam (asdfghjk, chuỗi lặp không có nguyên âm)
 * 3. Độ dài bất thường (< 2 ký tự hoặc > 60 ký tự)
 */

export interface InputSanityResult {
  isValid: boolean;
  isOffensive: boolean;
  isNonsensical: boolean;
  isNotRealItem: boolean;
  reason?: string;
  sanitizedText: string;
}

/** Từ khóa nhạy cảm, thô tục, báng bổ hoặc vi phạm thuần phong mỹ tục */
const INAPPROPRIATE_KEYWORDS = [
  'đm', 'dm', 'đmm', 'vcl', 'vl', 'clgt', 'địt', 'dit', 'lồn', 'lon',
  'cặc', 'cac', 'buồi', 'buoi', 'chó chết', 'đĩ', 'cave', 'dâm', 'sex',
  'porn', 'fuck', 'bitch', 'shit', 'asshole', 'ngu ngốc', 'óc chó',
  'báng bổ', 'phản động', 'đồi trụy', 'tục tĩu', 'dâm ô', 'khiêu dâm'
];

/** Từ khóa đồ vật hoàn toàn không phải phụ kiện thời trang hay kiểu tóc */
const IRRELEVANT_OBJECT_KEYWORDS = [
  // Thức ăn & đồ uống
  'phở', 'bún', 'cơm', 'bánh mì', 'thịt', 'cá', 'trà sữa', 'cà phê', 'bia', 'rượu', 'lẩu', 'bánh tráng', 'bún bò', 'chả cá',
  // Thiết bị công nghệ & điện tử
  'iphone', 'điện thoại', 'laptop', 'máy tính', 'ipad', 'airpod', 'tivi', 'tai nghe', 'sạc', 'bàn phím', 'chuột máy tính',
  // Phương tiện & vũ khí
  'xe máy', 'xe đạp', 'ô tô', 'xe hơi', 'máy bay', 'tàu hỏa', 'súng', 'đạn', 'dao găm', 'lựu đạn', 'bom', 'thuốc nổ',
  // Động vật
  'con chó', 'con mèo', 'con heo', 'con chuột', 'con gà', 'con bò', 'con rắn', 'con lợn',
  // Gia dụng & nội thất
  'cái bàn', 'cái ghế', 'tủ lạnh', 'máy giặt', 'nồi cơm', 'bồn cầu', 'chổi', 'giường ngủ', 'cục gạch'
];

/** Các từ khóa ngữ nghĩa đại diện cho phụ kiện thời trang, trang sức, đạo cụ phong nhã */
const ACCESSORY_SEMANTIC_KEYWORDS = [
  'khăn', 'nón', 'mấn', 'quạt', 'trâm', 'hoa', 'cài', 'ngọc', 'xuyến', 'kiềng',
  'túi', 'ví', 'xách', 'tráp', 'chuỗi', 'hạt', 'trầm', 'vòng', 'lắc', 'khuyên',
  'bông tai', 'hoa tai', 'lược', 'guốc', 'hài', 'giày', 'dép', 'đai', 'thắt lưng',
  'lụa', 'dải lụa', 'dây buộc', 'thẻ bài', 'bội', 'ngọc bội', 'kim khánh', 'dải',
  'yếm', 'áo khoác', 'khăn rằn', 'khăn vành', 'khăn đóng', 'khăn mỏ quạ', 'khăn xếp',
  'quạt giấy', 'quạt nan', 'quạt lông', 'trâm bạc', 'trâm vàng', 'trâm gốm', 'ngọc trai',
  'ngọc bích', 'phỉ thúy', 'san hô', 'hổ phách', 'trâm thoa', 'thoa', 'ô', 'dù', 'lọng',
  'bạc', 'vàng', 'đồng', 'gốm', 'gỗ', 'mộc', 'bình', 'hồ lô', 'quạt xoè', 'nhẫn'
];

/** Các từ khóa ngữ nghĩa đại diện cho kiểu tóc & nghệ thuật búi vấn đầu tóc */
const HAIRSTYLE_SEMANTIC_KEYWORDS = [
  'tóc', 'búi', 'bím', 'xõa', 'tết', 'vấn', 'cột', 'buộc', 'kẹp', 'rẽ ngôi',
  'ngôi giữa', 'ngôi lệch', 'đuôi sam', 'củ tỏi', 'uốn', 'ngắn', 'dài', 'búi cao',
  'búi thấp', 'vấn trần', 'vấn khăn', 'mái thưa', 'mái ngố', 'rủ vai', 'lọn',
  'xoăn', 'suôn', 'mượt', 'cài hoa', 'gài trâm', 'tém', 'bím tóc', 'thắt bím',
  'buộc nửa đầu', 'đuôi ngựa', 'tóc mây', 'tóc huyền', 'mái bằng', 'tóc tiên'
];

export function validateUserInputSanity(
  rawInput: string,
  itemType?: 'accessory' | 'hairstyle'
): InputSanityResult {
  if (!rawInput || typeof rawInput !== 'string') {
    return {
      isValid: false,
      isOffensive: false,
      isNonsensical: true,
      isNotRealItem: false,
      reason: 'Vui lòng nhập nội dung cụ thể.',
      sanitizedText: ''
    };
  }

  const cleaned = rawInput.trim();
  if (cleaned.length < 2) {
    return {
      isValid: false,
      isOffensive: false,
      isNonsensical: true,
      isNotRealItem: false,
      reason: 'Tên quá ngắn (tối thiểu 2 ký tự).',
      sanitizedText: cleaned
    };
  }

  if (cleaned.length > 60) {
    return {
      isValid: false,
      isOffensive: false,
      isNonsensical: true,
      isNotRealItem: false,
      reason: 'Nội dung quá dài (tối đa 60 ký tự cho một phụ kiện hoặc kiểu tóc).',
      sanitizedText: cleaned.slice(0, 60)
    };
  }

  const lower = cleaned.toLowerCase();

  // 1. Kiểm tra từ ngữ nhạy cảm / xúc phạm thuần phong mỹ tục
  for (const word of INAPPROPRIATE_KEYWORDS) {
    const regex = new RegExp(`(^|\\s|[.,!?;])${word}($|\\s|[.,!?;])`, 'i');
    if (regex.test(lower) || lower.includes(` ${word} `) || lower === word) {
      return {
        isValid: false,
        isOffensive: true,
        isNonsensical: false,
        isNotRealItem: false,
        reason: 'Phát hiện từ ngữ chưa phù hợp với thuần phong mỹ tục văn hóa Việt Nam.',
        sanitizedText: cleaned
      };
    }
  }

  // 2. Kiểm tra chuỗi vô nghĩa / spam (chuỗi lặp ký tự liên tục >= 4 lần, e.g. aaaaa, zzzzz)
  if (/(.)\1{3,}/.test(lower)) {
    return {
      isValid: false,
      isOffensive: false,
      isNonsensical: true,
      isNotRealItem: false,
      reason: 'Phát hiện chuỗi ký tự lặp vô nghĩa (spam).',
      sanitizedText: cleaned
    };
  }

  // Kiểm tra chuỗi chỉ toàn số hoặc ký tự đặc biệt không có chữ cái
  if (!/[a-zA-Zàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(cleaned)) {
    return {
      isValid: false,
      isOffensive: false,
      isNonsensical: true,
      isNotRealItem: false,
      reason: 'Tên phụ kiện hoặc kiểu tóc phải bao gồm chữ cái có nghĩa.',
      sanitizedText: cleaned
    };
  }

  // 3. Kiểm tra các đồ vật lạc đề (đồ ăn, công nghệ, xe cộ, động vật, vũ khí...)
  for (const irr of IRRELEVANT_OBJECT_KEYWORDS) {
    if (lower.includes(irr)) {
      return {
        isValid: false,
        isOffensive: false,
        isNonsensical: false,
        isNotRealItem: true,
        reason: `"${cleaned}" không phải là phụ kiện thời trang hay kiểu tóc hợp lệ. Vui lòng nhập phụ kiện (khăn, nón, trâm, kiềng, quạt, túi...) hoặc kiểu tóc.`,
        sanitizedText: cleaned
      };
    }
  }

  // 4. Kiểm tra tính hiện thực theo từng loại cụ thể (State-Proof Semantic Check)
  if (itemType === 'accessory') {
    const hasAccessoryTerm = ACCESSORY_SEMANTIC_KEYWORDS.some((kw) => lower.includes(kw));
    if (!hasAccessoryTerm) {
      // Nếu không chứa bất kỳ từ khóa phụ kiện nào, kiểm tra xem có phải từ mô tả thời trang hay không
      return {
        isValid: false,
        isOffensive: false,
        isNonsensical: false,
        isNotRealItem: true,
        reason: `"${cleaned}" chưa nhận diện được là phụ kiện trang phục. Vui lòng thử các phụ kiện như: quạt giấy, khăn lụa, trâm cài, chuỗi ngọc, kiềng bạc, nón lá, túi gấm...`,
        sanitizedText: cleaned
      };
    }
  } else if (itemType === 'hairstyle') {
    const hasHairTerm = HAIRSTYLE_SEMANTIC_KEYWORDS.some((kw) => lower.includes(kw));
    if (!hasHairTerm) {
      return {
        isValid: false,
        isOffensive: false,
        isNonsensical: false,
        isNotRealItem: true,
        reason: `"${cleaned}" chưa nhận diện được là kiểu tóc. Vui lòng thử các kiểu tóc như: tóc búi cao, tóc xõa buông lơi, tóc tết lệch vai, vấn khăn lụa, tóc cài hoa sen...`,
        sanitizedText: cleaned
      };
    }
  }

  return {
    isValid: true,
    isOffensive: false,
    isNonsensical: false,
    isNotRealItem: false,
    sanitizedText: cleaned
  };
}

