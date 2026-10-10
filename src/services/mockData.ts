import { CulturalGuardrailResult, PatternItem, CitationSource } from '../types/index.ts';
import {
  CULTURAL_DATABASE,
  getCulturalTruth,
  checkStrictTaboo,
  getColorCulturalAnalysis
} from '../data/culturalTruths.ts';

/**
 * MOCK DATA PROVIDER - BẢO VỆ QUOTA GOOGLE API
 * Cung cấp dữ liệu thẩm định di sản, hoa văn và lookbook nghệ thuật tức thì dựa trên Cultural Truths.
 */

export function getMockCulturalAI(context: {
  event: string;
  primary_color: string;
  garment_type: string;
  accessory: string;
  region?: string;
}): CulturalGuardrailResult {
  const { event, garment_type, accessory, primary_color } = context;
  const truth = getCulturalTruth(garment_type);
  const tabooCheck = checkStrictTaboo(truth.id, accessory);

  const citations: CitationSource[] = [
    {
      title: truth.sourceTitle,
      author_or_institution: truth.authorOrInstitution,
      url: truth.sourceUrl,
      reference_chapter_or_note: truth.sourceReferenceNote || 'Tài liệu nghiên cứu di sản',
      publication_year: truth.publicationYear
    }
  ];

  // 1. Kiểm tra lệch quy chuẩn văn hóa dựa trên Strict Taboos
  if (tabooCheck.isTaboo && tabooCheck.taboo) {
    const taboo = tabooCheck.taboo;
    return {
      is_culturally_accurate: false,
      warning_level: 'WARNING',
      cultural_warning_msg: taboo.historicalConflictReason,
      suggested_fix: taboo.suggestedAlternative,
      kieu_toc_va_trang_diem:
        'Tóc búi cao thanh thoát cài trâm hoặc thả tự nhiên; trang điểm nhẹ nhàng tôn phong thái đoan trang.',
      dang_chup_anh:
        'Đứng thẳng người đoan trang, một tay buông tà áo năm thân ngay ngắn, ánh mắt hướng về ống kính.',
      cau_chuyen_di_san: truth.culturalSignificance,
      citations,
      set_name: truth.name,
      audit_passed: false,
      color_evaluation: getColorCulturalAnalysis(primary_color, garment_type, event)
    };
  }

  // 2. Các trường hợp chuẩn mực (SAFE)
  const eventDetails: Record<string, { makeup: string; pose: string; story: string }> = {
    tet: {
      makeup:
        'Tóc búi cao điểm xuyết trâm hoa mai đồng hoặc vấn khăn lụa gấm; trang điểm sắc cam đào ấm áp, điểm xuyết son đỏ tươi cánh sen rực rỡ đón xuân tài lộc.',
      pose:
        'Nghiêng người 45 độ, một tay khẽ xòe quạt giấy xếp ngang ngực, tay kia buông tà tự nhiên, ánh mắt nhìn nghiêng thanh thoát đón ánh sáng tự nhiên trên tà áo.',
      story: `Sắc ${
        primary_color === '#F4C9D6' ? 'Hồng Phấn Sen' : primary_color === '#4A8577' ? 'Xanh Ngọc Đậm' : 'truyền thống'
      } trên tà áo tượng trưng cho vận hội hanh thông và thanh nhã. Năm cúc cài chéo nhắc nhở đạo hiếu gia phong của người Việt.`
    },
    grad: {
      makeup:
        'Tóc xõa tự nhiên kẹp gọn sau vành tai hoặc buộc thấp thanh lịch; trang điểm sương mai tông hồng đất tinh khôi, tôn phong thái tri thức Gen Z.',
      pose:
        'Đứng thẳng người đoan chính, hai tay nâng nhẹ cuốn kỷ yếu hoặc hoa tươi ngang eo, tà áo buông thẳng tắp tạo phom dáng cao ráo và vững chãi.',
      story:
        'Sắc Xanh Ngọc Đậm thâm trầm như ngọc bích biểu trưng cho tri thức uyên bác và chí hướng thanh vân trong ngày lễ cử nghiệp trưởng thành.'
    },
    temple: {
      makeup:
        'Tóc vấn khăn gọn gàng hoặc buộc thấp mộc mạc; trang điểm thuần khiết mộc mạc, thoa son dưỡng nhẹ nhàng giữ trọn nét đoan trang tịch tĩnh.',
      pose:
        'Hai tay chắp nhẹ trước ngực hoặc bước chậm khoan thai bên thềm đá rêu phong, nếp tà buông mềm mại giữ vẻ trang nghiêm, tĩnh tại và an nhiên.',
      story:
        'Sắc Rêu Đêm và Vàng Đất trầm mặc của đất mẹ và cửa thiền gợi nhắc tâm hồn hướng thiện, đức khiêm nhường và nếp sống tĩnh tại an yên.'
    }
  };

  const selectedEvent = eventDetails[event] || eventDetails.tet;

  return {
    is_culturally_accurate: true,
    warning_level: 'SAFE',
    cultural_warning_msg: '',
    suggested_fix: '',
    kieu_toc_va_trang_diem: selectedEvent.makeup,
    dang_chup_anh: selectedEvent.pose,
    cau_chuyen_di_san: selectedEvent.story,
    citations,
    set_name: truth.name,
    audit_passed: true,
    color_evaluation: getColorCulturalAnalysis(primary_color, garment_type, event)
  };
}

export function getMockPattern(keyword: string, overlay_mode: string): PatternItem {
  const isEmblem = overlay_mode === 'CENTRAL_EMBLEM';
  const cleanKw = (keyword || 'hoa sen').toLowerCase();

  let name = 'Gấm Mây Thủy Ba Cổ Truyền';
  let imageUrl = '/images/patterns/pat-may-ngu-sac.png';
  let color = '#C9A66B';
  let story = `Họa tiết sóng cuộn và mây vờn Nguyễn khởi sắc từ cảm hứng "${keyword}", tượng trưng cho khát vọng trường tồn và uyển chuyển.`;

  if (cleanKw.includes('sen') || cleanKw.includes('hoa') || cleanKw.includes('hồ')) {
    name = isEmblem ? 'Kim Liên Ngự Đạo' : 'Gấm Dệt Liên Hoa';
    color = '#F4C9D6';
    story = `Cảm hứng đóa sen thuần khiết từ "${keyword}", biểu trưng cho cốt cách thanh cao giữa đời thường.`;
    imageUrl = '/images/patterns/pat-tu-quy.png';
  } else if (cleanKw.includes('mưa') || cleanKw.includes('huế') || cleanKw.includes('sông') || cleanKw.includes('nước')) {
    name = isEmblem ? 'Thủy Ba Long Vân' : 'Gấm Mây Mưa Xứ Huế';
    color = '#4A8577';
    story = `Nét lượn sóng nước Thủy Ba êm đềm khởi nguồn từ "${keyword}", mang nỗi niềm hoài cổ cố đô.`;
    imageUrl = '/images/patterns/pat-thuy-ba-hoang-gia.png';
  } else if (cleanKw.includes('gốm') || cleanKw.includes('chu đậu') || cleanKw.includes('vàng') || cleanKw.includes('cúc')) {
    name = isEmblem ? 'Bạch Cúc Chu Đậu' : 'Gấm Hoàng Cúc Dát Vàng';
    color = '#C9A66B';
    story = `Men lam và nét vẽ cúc đại đóa gốm Chu Đậu từ "${keyword}", tôn vinh tài hoa mỹ nghệ ngàn năm.`;
    imageUrl = '/images/patterns/pat-cuc-day-nguyen.png';
  }

  return {
    pattern_name: name,
    pattern_type: (overlay_mode as 'SEAMLESS_JACQUARD' | 'CENTRAL_EMBLEM') || 'SEAMLESS_JACQUARD',
    pattern_color: color,
    pattern_story: story,
    imageUrl
  };
}

export function getMockFashionLookbook(_promptText: string): string {
  return "";
}

export function getMockStylingSuggestions(context: {
  garment_type: string;
  primary_color: string;
  style_mode?: string;
  personality?: string;
}) {
  const truth = getCulturalTruth(context.garment_type);
  const garmentId = truth.id;

  const suggestionsByGarment: Record<string, { accessories: any[]; hairstyles: any[] }> = {
    AO_NGU_THAN: {
      accessories: [
        { id: 'QUAT_GIAY', name: 'Quạt Giấy Thư Pháp Trầm Hương', cultural_reason: 'Tôn nét thanh nhã, đoan trang của sĩ phu và quý tộc triều Nguyễn khi dạo phố.', vibe_tag: 'Thanh Nhã' },
        { id: 'TRAM_GOM', name: 'Trâm Cài Gốm Chu Đậu Khảm Vàng', cultural_reason: 'Điểm xuyết mái tóc với nét tinh hoa men lam gốm sứ cổ truyền 500 năm.', vibe_tag: 'Tinh Xảo' },
        { id: 'TUI_GAM', name: 'Túi Gấm Dệt Kim Sa Cổ Phong', cultural_reason: 'Phụ kiện cầm tay tiện lợi chứa đồ cá nhân cho bạn trẻ dạo xuân.', vibe_tag: 'Duyên Dáng' }
      ],
      hairstyles: [
        { id: 'BUI_TRAM', name: 'Búi Tóc Cao Cài Trâm Đồng', cultural_reason: 'Để lộ trọn vẹn cổ áo lập lĩnh vuông vức cao 2-3cm trang nghiêm.', vibe_tag: 'Sang Trọng' },
        { id: 'VAN_KHAN', name: 'Vấn Khăn Đóng Lụa Gấm Xứ Huế', cultural_reason: 'Chuẩn phong vị lễ phục cung đình, tôn gương mặt sáng sủa thanh tú.', vibe_tag: 'Truyền Thống' },
        { id: 'XOA_DAI', name: 'Tóc Xõa Tự Nhiên Kẹp Bờm Ngọc', cultural_reason: 'Phá cách nhẹ nhàng đương đại dành cho Gen Z chụp ảnh phong cách thơ mộng.', vibe_tag: 'Đương Đại' }
      ]
    },
    AO_TAC: {
      accessories: [
        { id: 'KHAN_DONG', name: 'Khăn Đóng Lụa Dệt Chữ Thọ', cultural_reason: 'Phụ kiện nghi lễ bắt buộc khi khoác áo tấc hành đại lễ.', vibe_tag: 'Trang Trọng' },
        { id: 'THE_BAI', name: 'Thẻ Bài Sơn Mài Khắc Chữ Phúc', cultural_reason: 'Tái hiện phong vị quan viên và mệnh phụ triều Nguyễn.', vibe_tag: 'Quý Tộc' },
        { id: 'QUAT_GIAY', name: 'Quạt Giấy Xếp Lụa Đỏ Son', cultural_reason: 'Hài hòa khi đứng chắp tay thụng dự tiệc truyền thống.', vibe_tag: 'Đĩnh Đạc' }
      ],
      hairstyles: [
        { id: 'VAN_KHAN', name: 'Vấn Khăn Đóng Cung Đình', cultural_reason: 'Giữ nghiêm quy củ đại lễ phục, tôn nét tôn nghiêm lịch sử.', vibe_tag: 'Chuẩn Mực' },
        { id: 'BUI_TRAM', name: 'Búi Cao Cài Trâm Phượng', cultural_reason: 'Thanh thoát, phù hợp không gian cúng tế và hôn lễ cổ truyền.', vibe_tag: 'Đoan Trang' },
        { id: 'BUOC_THAP', name: 'Buộc Tóc Thấp Cột Dải Lụa', cultural_reason: 'Gọn gàng tao nhã giúp thoải mái khi cử động vạt tay thụng.', vibe_tag: 'Thanh Thoát' }
      ]
    },
    AO_NHAT_BINH: {
      accessories: [
        { id: 'TRAM_GOM', name: 'Trâm Cài Hoa Mai Cung Đình Mạ Vàng', cultural_reason: 'Điểm xuyết mái tóc cùng cung phục hậu phi lộng lẫy.', vibe_tag: 'Hoàng Gia' },
        { id: 'QUAT_TRON', name: 'Quạt Tròn Lụa Thêu Song Hỷ', cultural_reason: 'Hài hòa với nẹp cổ áo chữ nhật thêu chỉ kim tuyến.', vibe_tag: 'Quý Phái' },
        { id: 'BOI_NGOC', name: 'Dây Bội Ngọc Thắt Nút Đồng Tâm', cultural_reason: 'Đeo rủ trước ngực biểu trưng cho cát tường như ý.', vibe_tag: 'Cung Đình' }
      ],
      hairstyles: [
        { id: 'VAN_KHAN_VANH', name: 'Vấn Khăn Vành Dây Xứ Huế', cultural_reason: 'Quy chuẩn hoàng triều của các bậc hoàng thái hậu, công chúa triều Nguyễn.', vibe_tag: 'Quyền Quý' },
        { id: 'BUI_HOANG_GIA', name: 'Búi Tóc Phượng Cài Trâm Đôi', cultural_reason: 'Tôn vinh tối đa nẹp cổ Nhật Bình thêu hoa văn ngũ hành.', vibe_tag: 'Đài Các' },
        { id: 'BUOC_THAP', name: 'Buộc Thấp Đính Dải Lụa Ngũ Sắc', cultural_reason: 'Đồng điệu với dải ngũ sắc ở viền tay áo Nhật Bình.', vibe_tag: 'Đương Đại' }
      ]
    },
    AO_TU_THAN: {
      accessories: [
        { id: 'NON_QUAI_THAO', name: 'Nón Quai Thao Dệt Đũi Xứ Kinh Bắc', cultural_reason: 'Biểu tượng liền chị duyên dáng trong các hội Lim mùa xuân.', vibe_tag: 'Kinh Bắc' },
        { id: 'KHAN_MO_QUA', name: 'Khăn Mỏ Quạ Lụa Đen Tuyền', cultural_reason: 'Vấn nụ cười hàm tiếu che đi nét bẽn lẽn thôn nữ.', vibe_tag: 'Ý Nhị' },
        { id: 'RUA_BAC', name: 'Dây Xà Tích Bạc Treo Con Dao Nhỏ', cultural_reason: 'Trang sức bằng bạc truyền thống của phụ nữ đồng bằng Bắc Bộ.', vibe_tag: 'Dân Gian' }
      ],
      hairstyles: [
        { id: 'VAN_KHAN_MO_QUA', name: 'Tóc Vấn Khăn Mỏ Quạ Truyền Thống', cultural_reason: 'Khung hình chuẩn mực nhất gắn liền với nón quai thao.', vibe_tag: 'Chuẩn Mực' },
        { id: 'TET_BIEM', name: 'Tóc Buộc Đuôi Sam Thắt Dải Lụa Đào', cultural_reason: 'Tôn nét mộc mạc bên tà yếm thắm và thắt lưng xanh.', vibe_tag: 'Mộc Mạc' },
        { id: 'XOA_DAI', name: 'Tóc Dài Buông Tự Nhiên Khẽ Cài Hoa', cultural_reason: 'Phong cách chụp ảnh mùa xuân tươi trẻ thanh thuần.', vibe_tag: 'Tươi Trẻ' }
      ]
    },
    AO_BA_BA: {
      accessories: [
        { id: 'KHAN_RAN', name: 'Khăn Rằn Nam Bộ Kẻ Caro Đen Trắng', cultural_reason: 'Linh hồn phóng khoáng, mộc mạc của người phương Nam.', vibe_tag: 'Miệt Vườn' },
        { id: 'NON_LA', name: 'Nón Lá Chóp Mềm Nghiêng Che', cultural_reason: 'Hài hòa bên bờ kênh, mạn xuồng vùng sông nước Cửu Long.', vibe_tag: 'Duyên Dáng' },
        { id: 'GUOC_GOC', name: 'Guốc Mộc Quai Vải Hoa Li Ti', cultural_reason: 'Âm thanh gõ nhịp mộc mạc chân phương thôn dã.', vibe_tag: 'Chân Phương' }
      ],
      hairstyles: [
        { id: 'TET_BIEM', name: 'Tóc Bím Đuôi Sam Buông Một Bên Vai', cultural_reason: 'Nét e ấp dịu dàng của người con gái miền Tây Nam Bộ.', vibe_tag: 'Ngọt Ngào' },
        { id: 'XOA_DAI', name: 'Tóc Xõa Dài Thẳng Mượt Tự Nhiên', cultural_reason: 'Nổi bật vẻ mộc mạc thanh thoát khi mặc áo bà ba lụa mềm.', vibe_tag: 'Mộc Mạc' },
        { id: 'BUOC_THAP', name: 'Buộc Tóc Thấp Gọn Gàng Cài Nơ Vải', cultural_reason: 'Năng động, tươi trẻ dành cho các hoạt động trải nghiệm văn hóa.', vibe_tag: 'Năng Động' }
      ]
    },
    AO_DAI_LEMUR: {
      accessories: [
        { id: 'VI_CAM_TAY', name: 'Ví Cầm Tay Vintage Thập Niên 1930', cultural_reason: 'Biểu tượng quý cô thành thị tân thời Hà Thành - Sài Gòn.', vibe_tag: 'Quý Cô' },
        { id: 'CHUOI_NGOC', name: 'Chuỗi Ngọc Trai Cổ Điển', cultural_reason: 'Tôn vinh đường viền cổ áo cách tân và bờ vai thanh tú.', vibe_tag: 'Đài Các' },
        { id: 'QUAT_LUA', name: 'Quạt Lụa Phớt Hồng Cầm Tay', cultural_reason: 'Nét duyên dáng thanh lịch của nữ sinh tân thời.', vibe_tag: 'Thơ Mộng' }
      ],
      hairstyles: [
        { id: 'UON_SONG', name: 'Tóc Uốn Sóng Nước Kiểu Cô Ba Sài Gòn', cultural_reason: 'Trào lưu tóc uốn lượn sóng thịnh hành bậc nhất thập niên 1930.', vibe_tag: 'Vintage' },
        { id: 'BUI_CU_TOI', name: 'Búi Tóc Thấp Cài Kẹp Ngọc Trai', cultural_reason: 'Nét đoan trang của nữ sinh trường Đồng Khánh - Gia Long.', vibe_tag: 'Thanh Lịch' },
        { id: 'XOA_DAI', name: 'Tóc Xõa Ngang Vai Uốn Cụp Nữ Tính', cultural_reason: 'Nhẹ nhàng, thanh tân, chuẩn phong vị tân thời Lemur.', vibe_tag: 'Nữ Tính' }
      ]
    }
  };

  const garmentSet = suggestionsByGarment[garmentId] || suggestionsByGarment.AO_NGU_THAN;

  return {
    accessories: garmentSet.accessories,
    hairstyles: garmentSet.hairstyles,
    stylist_note: `Gợi ý sáng tạo cho ${truth.name} sắc ${context.primary_color}: kết hợp hài hòa nét trang nhã di sản cùng phong thái tự tin đương đại.`,
    color_analysis: {
      cultural_meaning: `Sắc độ này biểu trưng cho sự đôn hậu, vững chãi và an yên của nếp nhà truyền thống, tôn vinh dáng vẻ ${truth.name}.`,
      five_elements: 'Thổ Vị Trung Tâm',
      harmony_rating: 'Hài Hòa Di Sản',
      visual_tone: 'Tông màu trang nhã, dịu mắt'
    },
    personal_compatibility: {
      is_profile_provided: false,
      skin_tone_effect: '',
      silhouette_effect: '',
      tailoring_advice: '',
      missing_profile_reminder: 'Bạn chưa lưu thông tin ngoại hình trong Sợi Chỉ Của Tôi. Hãy mở hồ sơ để bổ sung chiều cao, cân nặng, tông da và chạm "Cập nhật gợi ý" để nhận phân tích độ tương thích chuyên sâu cho riêng bạn nhé!'
    },
    cultural_guardrail: {
      is_safe: true,
      warning_msg: '',
      advice: `Hài hòa chuẩn mực di sản [${truth.originRegion}]. Không vi phạm kiêng kỵ lịch sử nào.`
    },
    pose_suggestions: 'Đứng thẳng người đoan chính, một tay khẽ che quạt giấy ngang eo hoặc trước ngực, tay kia buông tà tự nhiên, ánh mắt nhìn thẳng thanh thoát.',
    recommended_occasions: [
      'Dạo phố Tết truyền thống & du xuân',
      'Chụp kỷ yếu tốt nghiệp / lưu giữ thanh xuân',
      'Đi lễ chùa đầu năm & hội làng an tĩnh'
    ],
    visual_references: {
      garment: {
        title: truth.name,
        desc: `${truth.originRegion} • ${truth.historicalEra}`,
        searchKeyword: `${truth.name} cổ phục Việt Nam`
      },
      hair: {
        title: garmentSet.hairstyles[0]?.name || 'Búi Tóc Cài Trâm',
        desc: garmentSet.hairstyles[0]?.cultural_reason || 'Kiểu tóc truyền thống thanh nhã',
        searchKeyword: `${garmentSet.hairstyles[0]?.name || 'Búi tóc cài trâm'} cổ phục`
      },
      accessory: {
        title: garmentSet.accessories[0]?.name || 'Quạt Giấy Thư Pháp',
        desc: garmentSet.accessories[0]?.cultural_reason || 'Phụ kiện đoan trang nho nhã',
        searchKeyword: `${garmentSet.accessories[0]?.name || 'Quạt giấy thư pháp'} truyền thống`
      }
    }
  };
}
