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

export interface CitationSource {
  /** Tiêu đề tài liệu / Công trình khảo cứu / Bài viết bảo tàng */
  title: string;
  /** Tác giả, Nhà nghiên cứu hoặc Viện bảo tàng / Cơ quan lưu trữ */
  authorOrInstitution: string;
  /** BẮT BUỘC: Đường dẫn URL xác thực đến tài liệu gốc */
  url: string;
  /** Chương mục, trang hoặc ghi chú khảo cứu cụ thể */
  note?: string;
  /** Năm xuất bản hoặc công bố */
  year?: number;
}

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
  /** Tên tài liệu / Công trình khảo cứu chính */
  sourceTitle: string;
  /** Tác giả hoặc Cơ quan / Viện bảo tàng lưu trữ chính */
  authorOrInstitution: string;
  /** 
   * BẮT BUỘC: Đường dẫn URL xác thực đến tài liệu nguồn của viện bảo tàng hoặc tổ chức văn hóa uy tín
   */
  sourceUrl: string;
  /** Chương mục hoặc ghi chú khảo cứu cụ thể */
  sourceReferenceNote?: string;
  /** Năm xuất bản hoặc công bố (nếu có) */
  publicationYear?: number;

  /**
   * HỖ TRỢ ĐA NGUỒN (MULTI-SOURCE CITATIONS):
   * Danh sách toàn bộ các nguồn khảo cứu uy tín bổ sung cho cùng một kiểu trang phục (hỗ trợ hàng chục đến hàng trăm nguồn).
   */
  sources?: CitationSource[];
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
 * - `id`: Mã trang phục viết hoa không dấu (ví dụ: 'AO_NGU_THAN', 'AO_NHAT_BINH')
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
    sourceUrl: 'https://baotanglichsu.vn/vi/Articles/3097/16382/ngan-nam-ao-mu.html',
    sourceReferenceNote: 'Chương 5: Trang phục thời Nguyễn — Tiêu chuẩn hóa Áo Ngũ Thân thời Minh Mạng',
    publicationYear: 2013,
    sources: [
      {
        title: 'Ngàn Năm Áo Mũ — Giới thiệu ấn phẩm nghiên cứu',
        authorOrInstitution: 'Bảo tàng Lịch sử Quốc gia',
        url: 'https://baotanglichsu.vn/vi/Articles/3097/16382/ngan-nam-ao-mu.html',
        note: 'Bài giới thiệu chuyên đề của Thư viện Bảo tàng Lịch sử Quốc gia',
        year: 2013
      },
      {
        title: 'Áo Dài Ngũ Thân — Hành Trình Trở Lại',
        authorOrInstitution: 'Bảo tàng Phụ nữ Nam Bộ',
        url: 'https://baotangphunu.com/ao-dai-ngu-than-hanh-trinh-tro-lai/',
        note: 'Khảo cứu về nguồn gốc Áo ngũ thân từ thời chúa Nguyễn Phúc Khoát (1744)',
        year: 2024
      },
      {
        title: 'Lễ trao tặng áo dài ngũ thân truyền thống nhân Ngày Di sản Văn hóa',
        authorOrInstitution: 'Bảo tàng Phụ nữ Nam Bộ',
        url: 'https://baotangphunu.com/le-trao-tang-ao-dai-ngu-than-truyen-thong-nhan-ngay-di-san-van-hoa-23-thang-11/',
        note: 'Tư liệu cấu trúc 5 thân, 5 cúc và kỹ thuật may chẽn truyền thống',
        year: 2021
      },
      {
        title: 'Đại Nam Thực Lục Chính Biên — Quy chế Y phục Triều Nguyễn',
        authorOrInstitution: 'Quốc Sử Quán Triều Nguyễn',
        url: 'https://vi.wikipedia.org/wiki/%C4%90%E1%BA%A1i_Nam_th%E1%BB%B1c_l%E1%BB%A5c',
        note: 'Đệ nhị kỷ: Chỉ dụ định chế y phục từ năm Minh Mạng thứ 8 đến thứ 18',
        year: 1844
      }
    ]
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
    sourceTitle: 'Muốn tôn vinh áo dài, cần hiểu đúng — Nghiên cứu về Áo Ngũ Thân và Áo Tấc',
    authorOrInstitution: 'Báo Quân đội nhân dân & TS. Phan Thanh Hải (Nguyên GĐ TT Bảo tồn Di tích Cố đô Huế)',
    sourceUrl: 'https://www.qdnd.vn/cuoi-tuan/dien-dan/muon-ton-vinh-ao-dai-can-hieu-dung-656360',
    sourceReferenceNote: 'Khảo luận chuyên sâu về quy chế phân biệt Áo tấc (tay rộng làm lễ phục) và Áo ngũ thân tay chẽn (thường phục)',
    publicationYear: 2021,
    sources: [
      {
        title: 'Muốn tôn vinh áo dài, cần hiểu đúng',
        authorOrInstitution: 'TS. Phan Thanh Hải — Giám đốc Sở VHTT Thừa Thiên Huế',
        url: 'https://www.qdnd.vn/cuoi-tuan/dien-dan/muon-ton-vinh-ao-dai-can-hieu-dung-656360',
        note: 'Khảo cứu về sự phục hồi của Áo Tấc trong nghi lễ truyền thống',
        year: 2021
      },
      {
        title: 'Bộ sưu tập áo dài phụ nữ Việt Nam',
        authorOrInstitution: 'Bảo tàng Phụ nữ Nam Bộ',
        url: 'https://baotangphunu.com/bo-suu-tap-ao-dai-phu-nu-viet-nam/',
        note: 'Khảo sát kiểu áo năm thân tay rộng và tay hẹp thời Nguyễn',
        year: 2022
      }
    ]
  },

  AO_NHAT_BINH: {
    id: 'AO_NHAT_BINH',
    name: 'Áo Nhật Bình (Cung Phục Hậu Phi Triều Nguyễn)',
    commonNames: ['Áo xẻ ngực Nhật Bình', 'Nhật Bình cung đình'],
    historicalEra: 'Triều Nguyễn (1802–1945)',
    originRegion: 'TRUNG_BO',
    socialContext: 'Thường phục của Hoàng Hậu, Công Chúa, Phi Tần và lễ phục của các mệnh phụ quý tộc triều đình Huế.',
    definingFeatures: [
      'Cổ áo khoét hình chữ nhật lớn trước ngực (xẻ giữa), có nẹp cổ thêu hoa văn hoa mẫu đơn, phượng, loan chỉ vàng kim tuyến.',
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
    sourceTitle: 'Áo Nhật Bình — Tư liệu Cổ phục Cung đình Triều Nguyễn',
    authorOrInstitution: 'Wikipedia tiếng Việt & Tư liệu Khâm Định Đại Nam Hội Điển Sự Lệ',
    sourceUrl: 'https://vi.wikipedia.org/wiki/%C3%81o_Nh%E1%BA%ADt_b%C3%ACnh',
    sourceReferenceNote: 'Mục: Lịch sử, quy chế phẩm hàm màu sắc và phụ kiện khăn vành đi kèm',
    publicationYear: 2023,
    sources: [
      {
        title: 'Áo Nhật bình — Điển chế phục trang Cung đình',
        authorOrInstitution: 'Wikipedia tiếng Việt',
        url: 'https://vi.wikipedia.org/wiki/%C3%81o_Nh%E1%BA%ADt_b%C3%ACnh',
        note: 'Tổng hợp quy chế phẩm phục hậu phi triều Nguyễn',
        year: 2023
      },
      {
        title: 'Ao Dai Nhat Binh: Elevating Vietnamese Tradition with Timeless Elegance',
        authorOrInstitution: 'Khám Phá Huế (Trung tâm Công nghệ Thông tin TT-Huế)',
        url: 'https://khamphahue.com.vn/en-us/culture/culture-folk/ao-dai-nhat-binh-elevating-vietnamese-tradition-with-timeless-elegance',
        note: 'Tư liệu chi tiết về cổ nẹp hình chữ nhật và dải ngũ sắc tay áo',
        year: 2023
      }
    ]
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
    sourceTitle: 'Dân ca Quan họ Bắc Ninh — Di sản Văn hóa Phi vật thể Đại diện của Nhân loại',
    authorOrInstitution: 'Cục Di sản Văn hóa — Bộ Văn hóa, Thể thao và Du lịch',
    sourceUrl: 'https://dsvh.gov.vn/dan-ca-quan-ho-bac-ninh-1191',
    sourceReferenceNote: 'Mục: Không gian văn hóa & Trang phục truyền thống (Áo mớ ba mớ bảy, áo tứ thân, nón quai thao)',
    publicationYear: 2012,
    sources: [
      {
        title: 'Hồ sơ Di sản Dân ca Quan họ Bắc Ninh',
        authorOrInstitution: 'Cục Di sản Văn hóa',
        url: 'https://dsvh.gov.vn/dan-ca-quan-ho-bac-ninh-1191',
        note: 'Quy chuẩn trang phục liền chị trong không gian văn hóa quan họ',
        year: 2012
      },
      {
        title: 'Áo Tứ Thân — Trang phục truyền thống phụ nữ Bắc Bộ',
        authorOrInstitution: 'Wikipedia tiếng Việt',
        url: 'https://vi.wikipedia.org/wiki/%C3%81o_t%E1%BB%A9_th%C3%A2n',
        note: 'Cấu tạo sống áo, yếm, dải lưng điều và nón quai thao',
        year: 2023
      }
    ]
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
    sourceTitle: 'Chiếc Khăn Rằn và Trang phục Áo Bà Ba trong Đời sống Phụ nữ Nam Bộ',
    authorOrInstitution: 'Bảo tàng Phụ nữ Nam Bộ',
    sourceUrl: 'https://baotangphunu.com/chiec-khan-ran-cua-me-viet-nam-anh-hung-nguyen-thi-sang/',
    sourceReferenceNote: 'Hiện vật và khảo luận: Chiếc áo bà ba đi cùng khăn rằn ô vuông truyền thống',
    publicationYear: 2013,
    sources: [
      {
        title: 'Chiếc khăn rằn của Mẹ Việt Nam Anh hùng Nguyễn Thị Sáng',
        authorOrInstitution: 'Bảo tàng Phụ nữ Nam Bộ',
        url: 'https://baotangphunu.com/chiec-khan-ran-cua-me-viet-nam-anh-hung-nguyen-thi-sang/',
        note: 'Tư liệu hiện vật áo bà ba và khăn rằn truyền thống Nam Bộ',
        year: 2013
      },
      {
        title: 'Áo bà ba — Trang phục dân dã Nam Bộ',
        authorOrInstitution: 'Wikipedia tiếng Việt',
        url: 'https://vi.wikipedia.org/wiki/%C3%81o_b%C3%A0_ba',
        note: 'Lịch sử xuất xứ, phom dáng xẻ tà hai bên hông và túi áo',
        year: 2023
      }
    ]
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
    sourceTitle: 'Bộ Sưu Tập Áo Dài Phụ Nữ Việt Nam — Tiến trình Cải cách Y phục Tân thời',
    authorOrInstitution: 'Bảo tàng Phụ nữ Nam Bộ',
    sourceUrl: 'https://baotangphunu.com/bo-suu-tap-ao-dai-phu-nu-viet-nam/',
    sourceReferenceNote: 'Mục: Giai đoạn 1932–1934 họa sĩ Cát Tường và Lê Phổ thiết kế áo dài Lemur cải cách từ áo ngũ thân',
    publicationYear: 2022,
    sources: [
      {
        title: 'Bộ sưu tập áo dài phụ nữ Việt Nam qua các thời kỳ',
        authorOrInstitution: 'Bảo tàng Phụ nữ Nam Bộ',
        url: 'https://baotangphunu.com/bo-suu-tap-ao-dai-phu-nu-viet-nam/',
        note: 'Tư liệu chi tiết về cuộc cách tân áo dài Le Mur thập niên 1930',
        year: 2022
      },
      {
        title: 'Lemur Cát Tường và Lịch sử Áo Dài Tân Thời',
        authorOrInstitution: 'Wikipedia tiếng Việt',
        url: 'https://vi.wikipedia.org/wiki/Lemur_C%C3%A1t_T%C6%B0%E1%BB%9Dng',
        note: 'Tiểu sử họa sĩ Nguyễn Cát Tường và trào lưu áo dài trên tuần báo Phong Hóa',
        year: 2023
      }
    ]
  },

  AO_GIAO_LINH: {
    id: 'AO_GIAO_LINH',
    name: 'Áo Giao Lĩnh (Cổ Chéo)',
    commonNames: ['Áo giao lĩnh', 'Áo tràng vạt', 'Cổ phục thời Hậu Lê'],
    historicalEra: 'Thời Lý, Trần và đạt đỉnh cao chuẩn mực định hình dưới triều Hậu Lê (thế kỷ 15–18)',
    originRegion: 'BAC_BO',
    socialContext: 'Cổ phục truyền thống của tầng lớp quý tộc, sĩ phu và quan lại trong các dịp đại lễ và tế tự thời Lê.',
    definingFeatures: [
      'Cổ áo giao chéo: Vạt bên trái vắt chéo đè lên vạt bên phải tạo thành cổ hình chữ Y cổ kính.',
      'Ống tay rộng vừa hoặc tay thụng uy nghiêm, vạt áo buông dài phủ gối.',
      'Thường buộc dây dải lụa ngang eo hoặc thắt đai đĩnh đạc.',
      'Chất liệu lụa tơ tằm dệt hoa chìm hoặc gấm hoa thời Lê.'
    ],
    strictTaboos: [
      {
        incompatibleWith: 'KHAN_RAN',
        incompatibleName: 'Khăn Rằn Nam Bộ',
        historicalConflictReason: 'Khăn rằn là phụ kiện sông nước Nam Bộ thế kỷ 19, không phù hợp với quy chuẩn cổ phục Giao Lĩnh thời Lê.',
        suggestedAlternative: 'QUAT_GIAY'
      }
    ],
    culturalSignificance: 'Biểu trưng cho nếp cổ phong ngàn năm văn hiến, thể hiện khí phách đoan chính và chuẩn mực văn hóa Đại Việt thời Lê.',
    sourceTitle: 'Ngàn Năm Áo Mũ — Khảo cứu Trang phục Triều Lý, Trần, Lê',
    authorOrInstitution: 'Bảo tàng Lịch sử Quốc gia & Trần Quang Đức',
    sourceUrl: 'https://baotanglichsu.vn/vi/Articles/3097/16382/ngan-nam-ao-mu.html',
    sourceReferenceNote: 'Chương 3 & 4: Y phục triều Hậu Lê — Phân tích chi tiết quy chế Áo Giao Lĩnh và Tràng Vạt',
    publicationYear: 2013,
    sources: [
      {
        title: 'Ngàn Năm Áo Mũ',
        authorOrInstitution: 'Bảo tàng Lịch sử Quốc gia',
        url: 'https://baotanglichsu.vn/vi/Articles/3097/16382/ngan-nam-ao-mu.html',
        note: 'Tài liệu Thư viện BTLSQG về cấu trúc áo giao lĩnh Đại Việt',
        year: 2013
      },
      {
        title: 'Giao Lĩnh — Cổ phục truyền thống',
        authorOrInstitution: 'Wikipedia tiếng Việt',
        url: 'https://vi.wikipedia.org/wiki/Giao_l%C4%A9nh',
        note: 'Khảo cứu về dạng thức cổ chéo chữ Y và cách mặc vạt trái đè vạt phải',
        year: 2023
      }
    ]
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
 * Lấy danh sách toàn bộ nguồn trích dẫn khảo cứu (kể cả nguồn chính và các nguồn bổ sung) cho một trang phục
 * Hỗ trợ hệ thống trích dẫn đa tầng và sẵn sàng tích hợp RAG với >100 nguồn.
 */
export function getAllSourcesForGarment(garmentId: string): CitationSource[] {
  const truth = getCulturalTruth(garmentId);
  const result: CitationSource[] = [];

  // Nguồn chính
  if (truth.sourceUrl) {
    result.push({
      title: truth.sourceTitle,
      authorOrInstitution: truth.authorOrInstitution,
      url: truth.sourceUrl,
      note: truth.sourceReferenceNote,
      year: truth.publicationYear
    });
  }

  // Các nguồn mở rộng
  if (truth.sources && Array.isArray(truth.sources)) {
    for (const src of truth.sources) {
      if (!result.some((existing) => existing.url === src.url)) {
        result.push(src);
      }
    }
  }

  return result;
}

/**
 * THẨM ĐỊNH MÀU SẮC DI SẢN & NGŨ HÀNH TƯƠNG SINH
 * Đánh giá chuyên sâu ý nghĩa văn hóa, ngũ hành và mức độ phù hợp sự kiện của màu sắc người dùng chọn.
 */
export function getColorCulturalAnalysis(
  colorHex: string,
  _garmentId?: string,
  _event?: string
): {
  rating: 'CHUAN_SAC' | 'HAI_HOA' | 'CAN_NHAC';
  harmony_title: string;
  cultural_symbolism: string;
  five_elements_element: 'KIM' | 'MOC' | 'THUY' | 'HOA' | 'THO';
  element_meaning: string;
  event_suitability: string;
} {
  const hex = (colorHex || '#F4C9D6').toUpperCase();

  const colorProfiles: Record<string, {
    rating: 'CHUAN_SAC' | 'HAI_HOA' | 'CAN_NHAC';
    harmony_title: string;
    cultural_symbolism: string;
    five_elements_element: 'KIM' | 'MOC' | 'THUY' | 'HOA' | 'THO';
    element_meaning: string;
    event_suitability: string;
  }> = {
    '#F4C9D6': {
      rating: 'CHUAN_SAC',
      harmony_title: 'Hồng Phấn Sen — Sắc Thắm Đoan Trang',
      cultural_symbolism: 'Hồng sen là sắc lụa truyền thống biểu trưng cho sự thanh tân, thuần khiết và tâm hồn hiền dịu của phụ nữ phương Nam và xứ Đoài.',
      five_elements_element: 'HOA',
      element_meaning: 'Hỏa sinh Thổ — ấm áp, tràn đầy sinh khí hưng vượng, xua tan hàn khí mùa lạnh.',
      event_suitability: 'Đặc biệt thích hợp cho ngày Tết, hội xuân, lễ tơ hồng và chụp ảnh kỷ niệm thanh xuân.'
    },
    '#4A8577': {
      rating: 'CHUAN_SAC',
      harmony_title: 'Xanh Ngọc Đậm — Cốt Cách Bích Ngọc',
      cultural_symbolism: 'Màu xanh ngọc bích thâm trầm gắn liền với tầng lớp văn nhân, quan viên và gia đình vọng tộc thời Nguyễn, toát lên phong thái điềm tĩnh, tri thức.',
      five_elements_element: 'MOC',
      element_meaning: 'Mộc khí — tượng trưng cho sự sinh sôi, trường thọ và bản lĩnh vững chãi.',
      event_suitability: 'Hoàn hảo cho lễ tốt nghiệp, thăm viếng đình miếu di tích và dạ tiệc đĩnh đạc.'
    },
    '#E8F3EE': {
      rating: 'HAI_HOA',
      harmony_title: 'Ngọc Sương — Bạch Lụa Thanh Thuần',
      cultural_symbolism: 'Sắc trắng ngà ánh sương gợi nhớ tơ tằm nguyên bản chưa nhuộm của các làng nghề Hà Đông, tôn vinh nét đoan trang tịch tĩnh.',
      five_elements_element: 'KIM',
      element_meaning: 'Kim khí — biểu trưng cho sự chính trực, minh bạch và phẩm hạnh thanh cao.',
      event_suitability: 'Rất trang nhã cho sự kiện học thuật, triển lãm văn hóa và lễ chùa an nhiên.'
    },
    '#1C2B26': {
      rating: 'HAI_HOA',
      harmony_title: 'Rêu Đêm — Huyền Sắc Vương Giả',
      cultural_symbolism: 'Sắc xanh rêu đen trầm mặc đại diện cho chiều sâu lịch sử, nét quyền quý kín đáo trong phục trang cung đình xưa.',
      five_elements_element: 'THUY',
      element_meaning: 'Thủy khí — thông tuệ, uyên bác và bao dung như biển sâu nghìn trượng.',
      event_suitability: 'Thích hợp cho không gian nghệ thuật, dạ hội cổ phục và trình diễn sân khấu.'
    },
    '#C9A66B': {
      rating: 'CHUAN_SAC',
      harmony_title: 'Vàng Đất — Hoàng Thổ Cung Đình',
      cultural_symbolism: 'Màu vàng đất đôn hậu đại diện cho cội nguồn hoàng thổ Đại Việt, mang lại cảm giác vương giả, sung túc và bền vững.',
      five_elements_element: 'THO',
      element_meaning: 'Thổ vị trung tâm — nuôi dưỡng vạn vật, nền tảng của thái bình thịnh trị.',
      event_suitability: 'Rực rỡ trong ngày đại lễ, hôn lễ cổ truyền và đón tết tài lộc.'
    }
  };

  if (colorProfiles[hex]) {
    return colorProfiles[hex];
  }

  return {
    rating: 'HAI_HOA',
    harmony_title: `Sắc Lụa Tự Phối (${colorHex})`,
    cultural_symbolism: `Sắc phục đương đại thể hiện dấu ấn cá nhân phóng khoáng, kết hợp hài hòa trên nền phom dáng truyền thống.`,
    five_elements_element: 'MOC',
    element_meaning: 'Sự giao thoa giữa di sản cổ truyền và cảm hứng đương đại của thế hệ mới.',
    event_suitability: 'Thích hợp cho các hoạt động sáng tạo, biểu diễn nghệ thuật và trải nghiệm văn hóa.'
  };
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
 * BỘ LỌC KIỂM TRA ĐỊNH DẠNG ĐẦU VÀO CƠ BẢN (CLIENT-SIDE FORMAT SANITY CHECK)
 * Kiểm tra định dạng kỹ thuật trên client trước khi gửi lên Gemini API:
 * - Chuỗi không rỗng, độ dài hợp lý (2 - 60 ký tự)
 * - Loại trừ spam ký tự lặp vô nghĩa (ví dụ: aaaaa, zzzzz)
 * Mọi đánh giá về thuần phong mỹ tục, văn hóa và tính phù hợp được giao trọn vẹn cho Gemini AI.
 */

export interface InputSanityResult {
  isValid: boolean;
  isOffensive: boolean;
  isNonsensical: boolean;
  isNotRealItem: boolean;
  reason?: string;
  sanitizedText: string;
}

export function validateUserInputSanity(
  rawInput: string,
  _itemType?: 'accessory' | 'hairstyle' | 'pattern'
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
  // Loại bỏ dấu câu và khoảng trắng đặc biệt để chuẩn hóa
  const normalizedNoPunct = lower.replace(/[\s\.\-_,\+]+/g, ' ');
  const collapsed = lower.replace(/[^a-zA-Z0-9àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/gi, '');

  // 1. Danh sách cụm từ nhạy cảm đa âm tiết (kiểm tra chuỗi)
  const MULTI_WORD_SENSITIVE = [
    'dương vật', 'duong vat', 'duongvat', 'dương cụ', 'duong cu',
    'âm vật', 'am vat', 'amvat', 'âm đạo', 'am dao', 'amdao',
    'bộ phận sinh dục', 'sinh dục', 'sinh duc', 'sinhduc', 'tinh hoàn', 'tinh hoan',
    'thủ dâm', 'thu dam', 'khiêu dâm', 'khieu dam', 'dâm dục', 'dam duc', 'dâm ô', 'dam o',
    'ngực trần', 'nguc tran', 'nhũ hoa', 'nhu hoa', 'khỏa thân', 'khoa than', 'lõa thể', 'loa the', 'khoe hàng', 'khoe hang',
    'con cu', 'chim cu', 'con cặc', 'con cac', 'bú cu', 'bu cu', 'bú lồn', 'bu lon'
  ];

  for (const term of MULTI_WORD_SENSITIVE) {
    if (lower.includes(term) || normalizedNoPunct.includes(term) || (term.length >= 5 && collapsed.includes(term.replace(/\s+/g, '')))) {
      return {
        isValid: false,
        isOffensive: true,
        isNonsensical: false,
        isNotRealItem: false,
        reason: 'Nội dung chứa từ ngữ nhạy cảm hoặc không phù hợp với thuần phong mỹ tục văn hóa Việt Nam.',
        sanitizedText: cleaned
      };
    }
  }

  // 2. Danh sách từ thô tục đơn âm tiết (BẮT BUỘC kiểm tra ranh giới từ để tránh bắt nhầm chữ như "hoàng gia", "du xuân", "ví dụ")
  const SINGLE_WORD_REGEX = /\b(đụ|địt|chịch|nện|xoạc|lồn|cặc|buồi|cứt|bựa|vú|ỉa|đái|dit|chich|nen|xoac|lon|cac|buoi|cut|bua|penis|vagina|dick|cock|pussy|fuck|boobs|tits|bitch|asshole|nude|porn|dildo)\b/i;
  if (SINGLE_WORD_REGEX.test(lower) || SINGLE_WORD_REGEX.test(normalizedNoPunct)) {
    return {
      isValid: false,
      isOffensive: true,
      isNonsensical: false,
      isNotRealItem: false,
      reason: 'Nội dung chứa từ ngữ nhạy cảm hoặc không phù hợp với thuần phong mỹ tục văn hóa Việt Nam.',
      sanitizedText: cleaned
    };
  }

  // Kiểm tra chuỗi lặp ký tự vô nghĩa (spam, ví dụ: aaaaa, zzzzz)
  if (/(.)\1{4,}/.test(lower)) {
    return {
      isValid: false,
      isOffensive: false,
      isNonsensical: true,
      isNotRealItem: false,
      reason: 'Phát hiện chuỗi ký tự lặp vô nghĩa.',
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
      reason: 'Vui lòng nhập tên bằng chữ cái có nghĩa.',
      sanitizedText: cleaned
    };
  }

  return {
    isValid: true,
    isOffensive: false,
    isNonsensical: false,
    isNotRealItem: false,
    sanitizedText: cleaned
  };
}

// Runtime exports for Node ESM compatibility
export const CulturalHeritageEntry = {};
export const CitationSource = {};

