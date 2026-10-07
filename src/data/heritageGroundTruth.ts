/**
 * VIỆT Y REMIX — NGUỒN SỰ THẬT DUY NHẤT VỀ DI SẢN (HERITAGE GROUND TRUTH KNOWLEDGE BASE)
 * 
 * Toàn bộ dữ liệu dưới đây được tổng hợp từ các nguồn nghiên cứu lịch sử trang phục,
 * viện bảo tàng và tài liệu chuyên khảo được xác nhận uy tín tại Việt Nam.
 * 
 * Đây là "Ground Truth" đóng vai trò System Instruction / Context Grounding bắt buộc
 * cho các mô hình AI (Gemini), nghiêm cấm mô hình tự suy diễn thông tin ngoài bộ dữ liệu này.
 */

export interface CitationSource {
  title: string;
  author_or_institution: string;
  publication_year?: number;
  url: string;
  reference_chapter_or_note: string;
}

export interface GarmentHeritageRecord {
  id: string;
  name: string;
  common_names: string[];
  historical_era: string; // Triều đại / Niên đại
  primary_region: 'BAC_BO' | 'TRUNG_BO' | 'NAM_BO' | 'TOAN_QUOC';
  social_stratum: 'CUNG_DINH_QUY_TOC' | 'THUONG_LUU_TRI_THUC' | 'BINH_DAN_LAO_DONG' | 'LE_PHUC_TOAN_DAN';
  structural_features: {
    flaps_count: number; // Số thân áo (4 thân, 5 thân...)
    collar_type: 'LAP_LINH_CO_DUNG' | 'GIAO_LINH_CO_CHEO' | 'TRUC_LINH_CO_THANG' | 'CO_TRON_BA_BA' | 'NHAT_BINH_HINH_CHU_NHAT';
    buttons_count: number;
    button_symbolism: string;
    body_symbolism: string;
  };
  recommended_events: string[];
  recommended_colors: Array<{ hex: string; name: string; cultural_meaning: string }>;
  compatible_accessories: string[];
  strictly_incompatible_accessories: Array<{
    accessory_id: string;
    accessory_name: string;
    historical_conflict_reason: string;
  }>;
  makeup_and_hair_guidelines: {
    hair_styles: string[];
    makeup_tone: string;
    photography_pose: string;
  };
  citations: CitationSource[];
}

export const HERITAGE_GROUND_TRUTH: Record<string, GarmentHeritageRecord> = {
  AO_NGU_THAN: {
    id: 'AO_NGU_THAN',
    name: 'Áo Ngũ Thân Lập Lĩnh (Tay Chẽn)',
    common_names: ['Áo ngũ thân', 'Áo dài năm thân', 'Áo ngũ thân chẽn tay'],
    historical_era: 'Định hình từ thời chúa Nguyễn Phúc Khoát (1744 Đàng Trong) và vua Minh Mạng chuẩn hóa toàn quốc (1827 - 1837 triều Nguyễn)',
    primary_region: 'TOAN_QUOC',
    social_stratum: 'LE_PHUC_TOAN_DAN',
    structural_features: {
      flaps_count: 5,
      collar_type: 'LAP_LINH_CO_DUNG',
      buttons_count: 5,
      button_symbolism: '5 hạt cúc cài chéo bên sườn phải tượng trưng cho Ngũ Thường (Nhân - Lễ - Nghĩa - Trí - Tín) và Ngũ Luân đạo làm người.',
      body_symbolism: 'Năm thân áo tượng trưng cho Tứ Thân Phụ Mẫu (cha mẹ mình và cha mẹ người phối ngẫu) bao bọc lấy thân con nhỏ bé bên trong (đạo hiếu).'
    },
    recommended_events: ['Dạo phố Tết', 'Lễ tốt nghiệp', 'Dạ tiệc truyền thống', 'Chụp ảnh kỷ niệm', 'Giao lưu văn hóa'],
    recommended_colors: [
      { hex: '#F4C9D6', name: 'Hồng Phấn Sen', cultural_meaning: 'Cốt cách đoan trang, thuần khiết của đóa sen đầu hạ.' },
      { hex: '#4A8577', name: 'Xanh Ngọc Đậm', cultural_meaning: 'Trầm mặc, nho nhã, tượng trưng cho học thức uyên bác và chí hướng quân tử.' },
      { hex: '#E8F3EE', name: 'Ngọc Sương', cultural_meaning: 'Sắc trắng ngà thanh khiết như giọt sương mai đọng trên tơ tằm.' },
      { hex: '#1C2B26', name: 'Rêu Đêm', cultural_meaning: 'Màu rêu cổ phong nhã nhặn, biểu thị sự khiêm nhường và đĩnh đạc.' },
      { hex: '#C9A66B', name: 'Vàng Đất', cultural_meaning: 'Hành Thổ trung tâm, biểu trưng cho đất mẹ chở che và sự hưng thịnh vững bền.' }
    ],
    compatible_accessories: ['QUAT_GIAY', 'TRAM_GOM', 'TUI_GAM', 'KHAN_DONG', 'GUOC_MOC', 'HAI_THEU'],
    strictly_incompatible_accessories: [
      {
        accessory_id: 'KHAN_RAN',
        accessory_name: 'Khăn Rằn Nam Bộ',
        historical_conflict_reason: 'Khăn rằn bắt nguồn từ văn hóa sông nước lao động Nam Bộ, trong khi Áo ngũ thân lập lĩnh là trang phục chính quy trang nghiêm. Phối hợp này là thể nghiệm phá cách đương đại, không phải quy chuẩn di sản gốc.'
      },
      {
        accessory_id: 'NON_QUAI_THAO',
        accessory_name: 'Nón Quai Thao Bắc Bộ',
        historical_conflict_reason: 'Nón quai thao đi liền với bộ áo Tứ Thân dệt đũi xứ Kinh Bắc (quan họ), không phối cùng áo ngũ thân lập lĩnh tay chẽn triều Nguyễn.'
      }
    ],
    makeup_and_hair_guidelines: {
      hair_styles: ['Búi cài trâm đồng/gốm', 'Vấn khăn đóng truyền thống', 'Buộc tóc thấp thanh lịch'],
      makeup_tone: 'Tông cam đào hoặc hồng đất tự nhiên, lông mày lá liễu mềm mại, son môi phớt hồng.',
      photography_pose: 'Đứng thẳng hoặc nghiêng người 45 độ, một tay khẽ che quạt giấy ngang ngực, tay kia buông tà năm thân thẳng thớm.'
    },
    citations: [
      {
        title: 'Ngàn Năm Áo Mũ — Lịch sử trang phục Việt Nam giai đoạn 1009–1945',
        author_or_institution: 'Trần Quang Đức',
        publication_year: 2013,
        url: 'https://baotanglichsu.vn/vi/Articles/3097/16382/ngan-nam-ao-mu-cong-trinh-nghien-cuu-trang-phuc-viet-nam.html',
        reference_chapter_or_note: 'Chương 5: Trang phục thời Nguyễn — Tiêu chuẩn hóa Áo Ngũ Thân thời Minh Mạng'
      },
      {
        title: 'Khảo Cứu Về Trang Phục Triều Nguyễn',
        author_or_institution: 'Trần Đình Sơn — Trung tâm Bảo tồn Di tích Cố đô Huế',
        publication_year: 2007,
        url: 'https://hueworldheritage.org.vn/',
        reference_chapter_or_note: 'Mục Quy chế thường phục và lễ phục của quan viên, sĩ tử và thường dân'
      }
    ]
  },

  AO_TAC: {
    id: 'AO_TAC',
    name: 'Áo Tấc (Áo Ngũ Thân Tay Thụng)',
    common_names: ['Áo tấc', 'Áo lễ ngũ thân', 'Áo thụng ngũ thân'],
    historical_era: 'Triều Nguyễn (1802 - 1945), quy chế lễ phục trang trọng của toàn thể sĩ thứ và cung đình',
    primary_region: 'TOAN_QUOC',
    social_stratum: 'LE_PHUC_TOAN_DAN',
    structural_features: {
      flaps_count: 5,
      collar_type: 'LAP_LINH_CO_DUNG',
      buttons_count: 5,
      button_symbolism: '5 cúc cài tượng trưng ngũ thường, tay thụng rộng 1 tấc (khoảng 30-40cm) tượng trưng cho lòng khoan dung, khí độ độ lượng.',
      body_symbolism: 'Vạt áo dài quá đầu gối, tà kép trang trọng phục vụ các nghi lễ tế tự, bái vọng tổ tiên, lễ cưới hỏi và đại lễ triều nghi.'
    },
    recommended_events: ['Đại lễ Gia tộc', 'Nghi thức Cưới hỏi', 'Tế lễ Đình đền', 'Lễ Trao bằng tốt nghiệp đại học'],
    recommended_colors: [
      { hex: '#8B1E1E', name: 'Đỏ Tía (Huyết Dụ)', cultural_meaning: 'Sắc màu đại hỷ, trang nghiêm tuyệt đối trong tế lễ cung đình.' },
      { hex: '#4A8577', name: 'Xanh Ngọc Bích', cultural_meaning: 'Biểu trưng cho phong thái nho nhã của giới trí thức Nho học.' },
      { hex: '#E8F3EE', name: 'Trắng Ngà Tơ Tằm', cultural_meaning: 'Màu sắc nguyên bản của tơ tằm dệt lụa sa, trơn không hoa văn.' }
    ],
    compatible_accessories: ['KHAN_DONG', 'QUAT_GIAY', 'HAI_THEU', 'CHUOI_NGOC'],
    strictly_incompatible_accessories: [
      {
        accessory_id: 'KHAN_RAN',
        accessory_name: 'Khăn Rằn',
        historical_conflict_reason: 'Áo Tấc là đại lễ phục trang trọng nhất của chế độ ngũ thân, tuyệt đối không kết hợp với khăn lao động dã ngoại như khăn rằn.'
      },
      {
        accessory_id: 'NON_LA',
        accessory_name: 'Nón Lá Bình Dân',
        historical_conflict_reason: 'Mặc áo tấc trong nghi lễ luôn đi kèm khăn đóng (khăn vấn), không đội nón lá chóp thông thường.'
      }
    ],
    makeup_and_hair_guidelines: {
      hair_styles: ['Khăn đóng chỉn chu', 'Búi tóc cài trâm quý'],
      makeup_tone: 'Trang điểm đoan trang cổ điển, lông mày cong đậm nét, môi son đỏ trầm.',
      photography_pose: 'Hai tay khoanh chữ V trước ngực để hai ống tay thụng buông rủ cân đối sang hai bên theo tư thế củng thủ (拱手).'
    },
    citations: [
      {
        title: 'Khâm Định Đại Nam Hội Điển Sự Lệ — Quy chế Điển Lễ Phục Sức',
        author_or_institution: 'Nội Các Triều Nguyễn — Bản dịch Viện Sử Học',
        publication_year: 1993,
        url: 'https://baotanglichsu.vn/',
        reference_chapter_or_note: 'Quyển 78: Lễ bộ — Trang phục tế tự và quan hôn tang tế của thần dân'
      }
    ]
  },

  AO_NHAT_BINH: {
    id: 'AO_NHAT_BINH',
    name: 'Áo Nhật Bình',
    common_names: ['Nhật Bình', 'Áo phi tần triều Nguyễn'],
    historical_era: 'Triều Nguyễn (1807 thời Gia Long quy định chính thức cho hậu phi, công chúa và mệnh phụ phu nhân)',
    primary_region: 'TRUNG_BO',
    social_stratum: 'CUNG_DINH_QUY_TOC',
    structural_features: {
      flaps_count: 5,
      collar_type: 'NHAT_BINH_HINH_CHU_NHAT',
      buttons_count: 1, // Khuy cài phía trước cổ
      button_symbolism: 'Cổ áo khoét hình chữ nhật lớn trước ngực, viền nẹp thêu hoa văn chỉ vàng kim tuyến và ngũ phúc.',
      body_symbolism: 'Tượng trưng cho cương vị cao quý của người phụ nữ Việt Nam trong cung đình; hai dải ngũ sắc nơi cổ tay tượng trưng cho ngũ hành tuần hoàn.'
    },
    recommended_events: ['Hỷ sự / Lễ cưới truyền thống', 'Lễ hội Festival Huế', 'Chụp ảnh di sản hoàng gia'],
    recommended_colors: [
      { hex: '#C93B2B', name: 'Đỏ Điều Hoàng Hậu', cultural_meaning: 'Sắc đỏ quyền quý bậc nhất chỉ dành cho Hoàng Hậu và Công Chúa triều Nguyễn.' },
      { hex: '#2B4C7E', name: 'Xanh Lam Mệnh Phụ', cultural_meaning: 'Sắc lam cung đình thể hiện đức độ và quyền quý tôn nghiêm.' },
      { hex: '#E5A93C', name: 'Vàng Hoàng Cúc', cultural_meaning: 'Sắc vàng ánh kim tượng trưng cho vương quyền và hưng thịnh.' }
    ],
    compatible_accessories: ['KHAN_VANH_DAY', 'TRAM_PHUONG', 'CHUOI_NGOC', 'HAI_THEU_HOA_PHUONG'],
    strictly_incompatible_accessories: [
      {
        accessory_id: 'NON_QUAI_THAO',
        accessory_name: 'Nón Quai Thao Bắc Bộ',
        historical_conflict_reason: 'Nhật Bình là áo triều phục/mệnh phụ triều đình Huế, đi cùng khăn vành dây vàng hoặc xanh lam, hoàn toàn đối nghịch với nón quai thao thôn dã Kinh Bắc.'
      },
      {
        accessory_id: 'KHAN_RAN',
        accessory_name: 'Khăn Rằn',
        historical_conflict_reason: 'Xung đột gay gắt giữa cung đình quý tộc triều Nguyễn và sinh hoạt thôn dã Nam Bộ.'
      }
    ],
    makeup_and_hair_guidelines: {
      hair_styles: ['Vấn khăn vành dây dát vàng', 'Búi tóc cài trâm phượng hoàng'],
      makeup_tone: 'Trang điểm cung đình quý phái, chân mày thanh mảnh, đuôi mắt phượng, môi son son đỏ thuần.',
      photography_pose: 'Đứng đoan tọa trên ghế ngai hoặc đứng chính diện, hai bàn tay đan nhẹ trong tà áo hoặc cầm quạt lụa thêu phượng.'
    },
    citations: [
      {
        title: 'Trang Phục Cung Đình Triều Nguyễn',
        author_or_institution: 'Bảo tàng Cổ vật Cung đình Huế',
        publication_year: 2014,
        url: 'https://hueworldheritage.org.vn/vi-vn/kham-pha-hue/bao-tang-co-vat-cung-dinh-hue',
        reference_chapter_or_note: 'Bộ sưu tập Áo Nhật Bình và quy định cấp bậc màu sắc qua các triều vua Nguyễn'
      }
    ]
  },

  AO_GIAO_LINH: {
    id: 'AO_GIAO_LINH',
    name: 'Áo Giao Lĩnh (Trực Lĩnh Cổ Chéo)',
    common_names: ['Giao lĩnh', 'Áo cổ chéo', 'Bổ phục giao lĩnh'],
    historical_era: 'Thời Lý, Trần, Hậu Lê (thế kỷ 11 - 18) và đầu triều Nguyễn',
    primary_region: 'TOAN_QUOC',
    social_stratum: 'LE_PHUC_TOAN_DAN',
    structural_features: {
      flaps_count: 4,
      collar_type: 'GIAO_LINH_CO_CHEO',
      buttons_count: 0, // Buộc dây hoặc cài nẹp
      button_symbolism: 'Không dùng cúc mà buộc vạt chéo phải đè vạt trái, tượng trưng cho văn hóa Nho giáo nguyên bản thời Tiền Nguyễn.',
      body_symbolism: 'Ống tay thụng rộng, vạt chéo uy nghi toát lên hào khí Lý - Trần và nếp sống bác học thời Lê Sơ.'
    },
    recommended_events: ['Hội thảo văn hóa lịch sử', 'Lễ hội Đền Hùng', 'Triển lãm cổ phong Đại Việt'],
    recommended_colors: [
      { hex: '#1C2B26', name: 'Xanh Huyền Chàm', cultural_meaning: 'Sắc chàm thâm trầm của bậc đại phu thời Hậu Lê.' },
      { hex: '#8C3826', name: 'Nâu Cánh Gián Thẫm', cultural_meaning: 'Màu sắc truyền thống gắn liền với men gốm và tơ tằm cổ.' },
      { hex: '#E8F3EE', name: 'Bạch Tuyết Sa', cultural_meaning: 'Lụa bạch ngọc trơn thoát tục.' }
    ],
    compatible_accessories: ['QUAT_LONG', 'QUAT_GIAY', 'GUOC_GO_CO', 'THAI_BO_DAI'],
    strictly_incompatible_accessories: [
      {
        accessory_id: 'KHAN_RAN',
        accessory_name: 'Khăn Rằn',
        historical_conflict_reason: 'Áo Giao Lĩnh thuộc giai đoạn trước thế kỷ 18, trong khi khăn rằn chỉ du nhập và phổ biến ở Nam Bộ từ thế kỷ 19.'
      }
    ],
    makeup_and_hair_guidelines: {
      hair_styles: ['Tóc búi củ hành cài trâm ngọc', 'Xõa tóc tự nhiên kiểu Đại Việt'],
      makeup_tone: 'Trang điểm mộc mạc thanh thoát, chân mày kẻ ngang nhẹ nhàng.',
      photography_pose: 'Đứng hơi nghiêng, hai vạt tay thụng giao nhau phía trước, bước đi ung dung khoan thai.'
    },
    citations: [
      {
        title: 'Đại Việt Sử Ký Toàn Thư — Kỷ Nhà Lê, Quy định Điển chế Thường phục',
        author_or_institution: 'Viện Hàn Lâm Khoa Học Xã Hội Việt Nam',
        publication_year: 1998,
        url: 'https://baotanglichsu.vn/',
        reference_chapter_or_note: 'Mục Điển chương lễ nhạc thời Lê Thái Tông và Lê Thánh Tông'
      }
    ]
  },

  AO_TU_THAN: {
    id: 'AO_TU_THAN',
    name: 'Áo Tứ Thân Kinh Bắc',
    common_names: ['Áo tứ thân', 'Áo mớ ba mớ bảy', 'Áo cô thôn nữ quan họ'],
    historical_era: 'Hình thành từ trước thế kỷ 18 và tồn tại phổ biến đến giữa thế kỷ 20 tại đồng bằng Bắc Bộ',
    primary_region: 'BAC_BO',
    social_stratum: 'BINH_DAN_LAO_DONG',
    structural_features: {
      flaps_count: 4,
      collar_type: 'TRUC_LINH_CO_THANG',
      buttons_count: 0, // Buộc hai vạt trước ngang hông
      button_symbolism: 'Hai tà trước buộc buông dải tượng trưng cho sự gắn bó lứa đôi tình tứ duyên nồng.',
      body_symbolism: 'Bốn thân áo tượng trưng cho tứ thân phụ mẫu ôm bọc lấy chiếc yếm đào nữ tính kín đáo bên trong.'
    },
    recommended_events: ['Hội xuân làng quan họ', 'Hát ca trù / Quan họ', 'Dã ngoại đồng quê Bắc Bộ'],
    recommended_colors: [
      { hex: '#5C3826', name: 'Nâu Đồng Cổ', cultural_meaning: 'Sắc áo nâu chân chất của người phụ nữ nông thôn Bắc Bộ cần cù.' },
      { hex: '#B22222', name: 'Yếm Đào Hoa Sen', cultural_meaning: 'Nét duyên thầm son trẻ của thiếu nữ Kinh Bắc e ấp.' },
      { hex: '#4A8577', name: 'Xanh Cốm Vườn Quê', cultural_meaning: 'Sức sống thanh tân của lúa non và làng quê thanh bình.' }
    ],
    compatible_accessories: ['NON_QUAI_THAO', 'KHAN_MO_QUA', 'YEM_DAO', 'GUOC_MOC_QUAN_HO', 'RUOT_TUONG'],
    strictly_incompatible_accessories: [
      {
        accessory_id: 'KHAN_RAN',
        accessory_name: 'Khăn Rằn',
        historical_conflict_reason: 'Khăn rằn thuộc Nam Bộ, hoàn toàn đối lập với khăn mỏ quạ và nón quai thao của xứ Kinh Bắc.'
      },
      {
        accessory_id: 'KHAN_VANH_DAY',
        accessory_name: 'Khăn Vành Dây Hoàng Gia',
        historical_conflict_reason: 'Khăn vành dây là nghi lễ cung đình triều Nguyễn, không thể kết hợp với trang phục dân gian Tứ thân.'
      }
    ],
    makeup_and_hair_guidelines: {
      hair_styles: ['Độn tóc vấn khăn mỏ quạ', 'Đuôi gà buông lơi duyên dáng'],
      makeup_tone: 'Trang điểm tươi tắn nụ hoa hồng, má phớt hồng nhẹ như phù sa sông Hồng.',
      photography_pose: 'Hai tay nâng quai nón thao ngang ngực, nụ cười chúm chím e ấp nghiêng nón liếc mắt đưa duyên.'
    },
    citations: [
      {
        title: 'Văn Hóa Dân Gian Xứ Bắc và Trang Phục Dân Tộc',
        author_or_institution: 'Viện Văn Hóa Nghệ Thuật Quốc Gia Việt Nam (VICAS)',
        publication_year: 2011,
        url: 'https://vicas.org.vn/',
        reference_chapter_or_note: 'Chương 3: Cấu tạo và tính biểu tượng của bộ trang phục Tứ thân Quan họ'
      }
    ]
  },

  AO_BA_BA: {
    id: 'AO_BA_BA',
    name: 'Áo Bà Ba Nam Bộ',
    common_names: ['Áo bà ba', 'Áo xẻ tà Nam Bộ', 'Áo tơ bà ba'],
    historical_era: 'Đầu thế kỷ 19 đến nay, gắn liền với công cuộc khai phá và đời sống sông nước miền Tây Nam Bộ',
    primary_region: 'NAM_BO',
    social_stratum: 'BINH_DAN_LAO_DONG',
    structural_features: {
      flaps_count: 2, // Thân trước xẻ ngực, thân sau liền mảnh
      collar_type: 'CO_TRON_BA_BA',
      buttons_count: 6, // Hoặc 5-6 cúc bấm/cúc gốm dọc giữa ngực
      button_symbolism: 'Cúc cài thẳng đứng giữa ngực biểu trưng cho tính cách bộc trực, ngay thẳng, hào sảng của người phương Nam.',
      body_symbolism: 'Áo chít eo nhẹ nhàng xẻ hai bên hông tạo sự linh hoạt tuyệt đối cho sinh hoạt chèo xuồng, cấy gặt sông nước.'
    },
    recommended_events: ['Du lịch miền Tây sông nước', 'Chợ nổi / Dã ngoại', 'Chụp ảnh thôn dã miệt vườn'],
    recommended_colors: [
      { hex: '#2B1A12', name: 'Nâu Vỏ Lựu Thổ Nhưỡng', cultural_meaning: 'Màu nâu mộc mạc nhuộm từ vỏ trâm vỏ đước chịu phèn sông nước.' },
      { hex: '#0E1714', name: 'Đen Tuyển Lãnh Mỹ A', cultural_meaning: 'Lụa đen bóng huyền thoại dệt từ Tân Châu nhuộm mủ mặc nưa.' },
      { hex: '#F4C9D6', name: 'Hồng Sen Phấn', cultural_meaning: 'Sắc hồng hoa sen miệt Đồng Tháp Mười tươi vui, đôn hậu.' }
    ],
    compatible_accessories: ['KHAN_RAN', 'NON_LA', 'GUOC_MOC_NAM_BO', 'GIO_CO_BUNG'],
    strictly_incompatible_accessories: [
      {
        accessory_id: 'NON_QUAI_THAO',
        accessory_name: 'Nón Quai Thao Bắc Bộ',
        historical_conflict_reason: 'Nón quai thao là biểu trưng quan họ Kinh Bắc, không bao giờ dùng chung với nếp sống chèo xuồng của Áo bà ba Nam Bộ.'
      },
      {
        accessory_id: 'KHAN_DONG',
        accessory_name: 'Khăn Đóng / Khăn Vấn Lễ',
        historical_conflict_reason: 'Khăn đóng mang tính lễ nghi cung đình trang trọng, phá vỡ tính mộc mạc gần gũi của chiếc áo bà ba.'
      }
    ],
    makeup_and_hair_guidelines: {
      hair_styles: ['Thắt bím đuôi sam buông lơi', 'Tóc xõa dài tự nhiên cài nhánh bông điên điển'],
      makeup_tone: 'Trang điểm mộc như phù sa, màu son cánh sen tươi tắn, nụ cười sảng khoái.',
      photography_pose: 'Ngồi bên mạn xuồng ba lá, tay khẽ giữ chéo vạt khăn rằn buông trước ngực hoặc tay cầm mái dầm khẽ cười duyên.'
    },
    citations: [
      {
        title: 'Văn Minh Miệt Vườn và Lịch Sử Áo Bà Ba Phương Nam',
        author_or_institution: 'Sơn Nam — Nhà xuất bản Trẻ',
        publication_year: 1993,
        url: 'https://baotanglichsu.vn/',
        reference_chapter_or_note: 'Chương 4: Nếp sinh hoạt, trang phục và phong thái người phương Nam'
      }
    ]
  }
};
