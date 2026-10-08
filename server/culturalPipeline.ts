/**
 * VIỆT Y REMIX — TWO-ROUND CULTURAL AI PIPELINE & MINI STYLING SUGGESTIONS
 * 
 * 1. MINI GEMINI ROUND:
 *    - Nhận input: Loại áo, màu sắc (color picker), phong cách, tính cách.
 *    - Sinh ra 3 gợi ý phụ kiện (multiple select) & 3 gợi ý kiểu tóc (single select).
 *    - Người dùng có thể tự gõ phụ kiện và kiểu tóc tùy ý.
 * 
 * 2. STATE-PROOF SANITY & CULTURAL GUARDRAIL:
 *    - Kiểm duyệt input tự do của người dùng: phát hiện từ ngữ thô tục, phản cảm, xúc phạm
 *      thuần phong mỹ tục hoặc chuỗi vô nghĩa/spam.
 *    - Kiểm tra tính tương thích văn hóa & kiêng kỵ lịch sử (Strict Taboos) đối với toàn bộ
 *      danh sách phụ kiện (cả chọn sẵn lẫn tự nhập).
 * 
 * 3. TWO-ROUND HERITAGE GROUNDED EVALUATION:
 *    - Vòng 1: Grounded Recommendation Generator (Ground Truth + CoT Reasoning).
 *    - Vòng 2: Heritage Auditor Critic (Thẩm định độc lập & đối chiếu URL thật).
 */

import { GoogleGenAI, Type } from '@google/genai';
import {
  CULTURAL_DATABASE,
  CulturalHeritageEntry,
  getCulturalTruth,
  checkMultipleStrictTaboos,
  validateUserInputSanity,
  getColorCulturalAnalysis
} from '../src/data/culturalTruths.ts';
import {
  CulturalRecommendationInput,
  GroundedRecommendationResult,
  CulturalAuditResult,
  TwoRoundCulturalResponse,
  CulturalGuardrailResult,
  CitationSource,
  MiniStylingResponse,
  StylingSuggestionItem
} from '../src/types/index.ts';

// -----------------------------------------------------------------------------
// 1. CHUYỂN ĐỔI BỘ CULTURAL DATABASE THÀNH SYSTEM CONTEXT ĐẦY ĐỦ CÓ NGUỒN XÁC THỰC
// -----------------------------------------------------------------------------
export function buildGroundTruthContextText(): string {
  const records = Object.values(CULTURAL_DATABASE);
  return records
    .map((r: CulturalHeritageEntry) => {
      const taboosList = r.strictTaboos
        .map(
          (t) =>
            `- Kỵ phụ kiện/chi tiết: [${t.incompatibleWith}] ${t.incompatibleName}` +
            `\n  Lý do lịch sử: ${t.historicalConflictReason}` +
            `\n  Gợi ý thay thế: ${t.suggestedAlternative}`
        )
        .join('\n      ');

      const featuresList = r.definingFeatures.map((f) => `  * ${f}`).join('\n');

      return `### LOẠI TRANG PHỤC: [${r.id}] ${r.name}
- Tên gọi khác: ${r.commonNames.join(', ')}
- Niên đại lịch sử: ${r.historicalEra}
- Vùng miền xuất xứ: ${r.originRegion}
- Tầng lớp & Không gian sử dụng: ${r.socialContext}
- CẤU TRÚC ĐẶC TRƯNG BẮT BUỘC (GROUND TRUTH - KHÔNG ĐƯỢC SAI):
${featuresList}
- QUY CHUẨN KIÊNG KỴ NGHIÊM NGẶT (STRICT TABOOS):
      ${taboosList || 'Không có kiêng kỵ vùng miền nghiêm trọng.'}
- Ý nghĩa & Chiều sâu văn hóa: ${r.culturalSignificance}
- BẢO CHỨNG NGUỒN GỐC UY TÍN (BẮT BUỘC TRÍCH DẪN):
  * Tên công trình/hồ sơ: "${r.sourceTitle}"
  * Tác giả/Viện bảo tàng: ${r.authorOrInstitution}
  * Đường dẫn URL xác thực: ${r.sourceUrl}
  * Ghi chú tham khảo: ${r.sourceReferenceNote || 'Hồ sơ nghiên cứu di sản'}`;
    })
    .join('\n\n=========================================\n\n');
}

// -----------------------------------------------------------------------------
// 2. SCHEMAS CẤU TRÚC DỮ LIỆU ĐẦU RA
// -----------------------------------------------------------------------------
const miniStylingSchema = {
  type: Type.OBJECT,
  properties: {
    accessories: {
      type: Type.ARRAY,
      description: 'Chính xác 3 gợi ý phụ kiện hài hòa với áo, màu sắc và phong cách',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          cultural_reason: { type: Type.STRING },
          vibe_tag: { type: Type.STRING }
        },
        required: ['id', 'name', 'cultural_reason', 'vibe_tag']
      }
    },
    hairstyles: {
      type: Type.ARRAY,
      description: 'Chính xác 3 gợi ý kiểu tóc phù hợp với dáng cổ áo và tính cách',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          cultural_reason: { type: Type.STRING },
          vibe_tag: { type: Type.STRING }
        },
        required: ['id', 'name', 'cultural_reason', 'vibe_tag']
      }
    },
    stylist_note: {
      type: Type.STRING,
      description: 'Lời khuyên stylist ngắn gọn, truyền cảm hứng cho Gen Z'
    },
    color_analysis: {
      type: Type.OBJECT,
      description: 'Phân tích màu sắc động cụ thể theo văn hóa và ngũ hành',
      properties: {
        cultural_meaning: { type: Type.STRING },
        five_elements: { type: Type.STRING },
        harmony_rating: { type: Type.STRING },
        visual_tone: { type: Type.STRING }
      },
      required: ['cultural_meaning', 'five_elements', 'harmony_rating', 'visual_tone']
    },
    personal_compatibility: {
      type: Type.OBJECT,
      description: 'Độ tương thích màu sắc và kiểu dáng với đặc điểm cá nhân người dùng',
      properties: {
        is_profile_provided: { type: Type.BOOLEAN },
        skin_tone_effect: { type: Type.STRING },
        silhouette_effect: { type: Type.STRING },
        tailoring_advice: { type: Type.STRING },
        missing_profile_reminder: { type: Type.STRING }
      },
      required: ['is_profile_provided', 'skin_tone_effect', 'silhouette_effect', 'tailoring_advice', 'missing_profile_reminder']
    },
    cultural_guardrail: {
      type: Type.OBJECT,
      description: 'Đánh giá cảnh báo phụ kiện và phối đồ di sản đúng hay không',
      properties: {
        is_safe: { type: Type.BOOLEAN },
        warning_msg: { type: Type.STRING },
        advice: { type: Type.STRING }
      },
      required: ['is_safe', 'warning_msg', 'advice']
    },
    pose_suggestions: {
      type: Type.STRING,
      description: 'Gợi ý 1-2 dáng chụp ảnh nghệ thuật tôn trang phục'
    },
    recommended_occasions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '2-3 dịp thích hợp nhất để diện bộ phục trang này'
    },
    visual_references: {
      type: Type.OBJECT,
      description: 'Thông tin và từ khóa tìm kiếm minh họa mẫu áo, mẫu tóc, phụ kiện',
      properties: {
        garment: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            desc: { type: Type.STRING },
            searchKeyword: { type: Type.STRING }
          },
          required: ['title', 'desc', 'searchKeyword']
        },
        hair: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            desc: { type: Type.STRING },
            searchKeyword: { type: Type.STRING }
          },
          required: ['title', 'desc', 'searchKeyword']
        },
        accessory: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            desc: { type: Type.STRING },
            searchKeyword: { type: Type.STRING }
          },
          required: ['title', 'desc', 'searchKeyword']
        }
      },
      required: ['garment', 'hair', 'accessory']
    }
  },
  required: [
    'accessories',
    'hairstyles',
    'stylist_note',
    'color_analysis',
    'personal_compatibility',
    'cultural_guardrail',
    'pose_suggestions',
    'recommended_occasions',
    'visual_references'
  ]
};

const round1ResponseSchema = {
  type: Type.OBJECT,
  properties: {
    set_name: { type: Type.STRING, description: 'Tên bộ trang phục mỹ miều chuẩn phong vị di sản đương đại' },
    garment_type: { type: Type.STRING, description: 'Mã định danh loại áo (AO_NGU_THAN, AO_TAC, AO_NHAT_BINH...)' },
    primary_color: { type: Type.STRING, description: 'Mã màu chính hex hoặc tên màu' },
    color_harmony_explanation: { type: Type.STRING, description: 'Giải thích sự hòa sắc theo ngũ hành hoặc tinh thần di sản đương đại' },
    recommended_accessories: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          purpose: { type: Type.STRING }
        },
        required: ['id', 'name', 'purpose']
      }
    },
    incompatible_accessories_detected: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          reason: { type: Type.STRING }
        },
        required: ['id', 'name', 'reason']
      }
    },
    kieu_toc_va_makeup: {
      type: Type.OBJECT,
      properties: {
        hair: { type: Type.STRING, description: 'Kiểu tóc đã chọn hoặc được gợi ý' },
        makeup: { type: Type.STRING, description: 'Gợi ý tông trang điểm sáng tạo tự nhiên của AI' }
      },
      required: ['hair', 'makeup']
    },
    dang_chup_anh: { type: Type.STRING, description: 'Gợi ý tư thế chụp ảnh nghệ thuật sống động, tự nhiên' },
    cau_chuyen_di_san: { type: Type.STRING, description: 'Câu chuyện cảm hứng thời trang kết nối di sản với Gen Z' },
    has_cultural_risk: { type: Type.BOOLEAN, description: 'true nếu vi phạm quy chuẩn kiêng kỵ trong Ground Truth' },
    cultural_risk_summary: { type: Type.STRING, description: 'Tóm tắt lý do xung đột hoặc xác nhận an toàn' },
    citations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          author_or_institution: { type: Type.STRING },
          url: { type: Type.STRING },
          reference_chapter_or_note: { type: Type.STRING }
        },
        required: ['title', 'author_or_institution', 'url', 'reference_chapter_or_note']
      }
    }
  },
  required: [
    'set_name',
    'garment_type',
    'primary_color',
    'color_harmony_explanation',
    'recommended_accessories',
    'incompatible_accessories_detected',
    'kieu_toc_va_makeup',
    'dang_chup_anh',
    'cau_chuyen_di_san',
    'has_cultural_risk',
    'cultural_risk_summary',
    'citations'
  ]
};

const round2AuditResponseSchema = {
  type: Type.OBJECT,
  properties: {
    audit_status: {
      type: Type.STRING,
      enum: ['APPROVED', 'NEEDS_REVISION', 'FLAGGED'],
      description: 'Kết luận thẩm định của Hội đồng'
    },
    confidence_score: { type: Type.NUMBER, description: 'Điểm tin cậy từ 0.0 đến 1.0' },
    cross_regional_check: {
      type: Type.OBJECT,
      properties: {
        is_valid: { type: Type.BOOLEAN },
        details: { type: Type.STRING }
      },
      required: ['is_valid', 'details']
    },
    historical_accuracy_check: {
      type: Type.OBJECT,
      properties: {
        is_valid: { type: Type.BOOLEAN },
        details: { type: Type.STRING }
      },
      required: ['is_valid', 'details']
    },
    citations_verified: { type: Type.BOOLEAN, description: 'Xác nhận URL trích dẫn có đúng từ Ground Truth hay không' },
    audit_verdict_message: { type: Type.STRING, description: 'Lời nhận xét thẩm định văn hóa chuẩn mực' },
    suggested_correction: { type: Type.STRING, description: 'Mã phụ kiện thay thế chuẩn chỉnh nếu có vi phạm', nullable: true }
  },
  required: [
    'audit_status',
    'confidence_score',
    'cross_regional_check',
    'historical_accuracy_check',
    'citations_verified',
    'audit_verdict_message'
  ]
};

// -----------------------------------------------------------------------------
// 3. MINI GEMINI ROUND: SÁNG TẠO 3 GỢI Ý PHỤ KIỆN & 3 KIỂU TÓC THEO BỐI CẢNH
// -----------------------------------------------------------------------------

export function getOfflineMiniStylingSuggestions(context: {
  garment_type: string;
  primary_color: string;
  style_mode?: string;
  personality?: string;
  user_profile?: any;
}): MiniStylingResponse {
  const truth = getCulturalTruth(context.garment_type);
  const garmentId = truth.id;

  // Dữ liệu gợi ý thông minh theo từng loại trang phục
  const suggestionsByGarment: Record<string, { accessories: StylingSuggestionItem[]; hairstyles: StylingSuggestionItem[] }> = {
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
        { id: 'BUI_HOANG_GIA', name: 'Búi Tóc Phượng Cài Trâm Đôi', cultural_reason: 'Tôn vinh tối đa nẹp cổ khoét sâu đối khâm thêu hoa văn ngũ hành.', vibe_tag: 'Đài Các' },
        { id: 'BUOC_THAP', name: 'Buộc Thấp Đính Dải Lụa Ngũ Sắc', cultural_reason: 'Đồng điệu với dải ngũ sắc ở viền tay áo Nhật Bình.', vibe_tag: 'Đương Đại' }
      ]
    },
    AO_GIAO_LINH: {
      accessories: [
        { id: 'DAI_LUA', name: 'Đai Lụa Buộc Vạt Thắt Nút Thả Dài', cultural_reason: 'Giữ vạt áo cổ chéo Lý - Trần - Lê buông rủ khoáng đạt.', vibe_tag: 'Cổ Phong' },
        { id: 'BOI_NGOC', name: 'Bội Ngọc Khắc Hình Rồng Mây Thời Lý', cultural_reason: 'Tôn nét hào hoa phong nhã của tầng lớp quý tộc Thăng Long.', vibe_tag: 'Trầm Mặc' },
        { id: 'QUAT_GIAY', name: 'Quạt Xếp Gỗ Mun Đề Thơ Cổ', cultural_reason: 'Phong thái văn nhân nho nhã dạo chơi danh lam thắng cảnh.', vibe_tag: 'Tao Nhã' }
      ],
      hairstyles: [
        { id: 'BUI_CUA_DONG', name: 'Búi Tóc Đỉnh Đầu Cài Trâm Gỗ', cultural_reason: 'Hình tượng phổ biến trên tượng đá và bia ký thời Lê.', vibe_tag: 'Cổ Điển' },
        { id: 'XOA_DAI', name: 'Tóc Xõa Dài Tự Nhiên Rẽ Ngôi Giữa', cultural_reason: 'Tự nhiên, mộc mạc đúng tinh thần nếp mặc phương Bắc xưa.', vibe_tag: 'Thanh Thuần' },
        { id: 'TET_BIEM', name: 'Tóc Thắt Bím Đuôi Sam Buông Lơi', cultural_reason: 'Nét trẻ trung duyên dáng của thiếu nữ đương đại phục dựng cổ phong.', vibe_tag: 'Thơ Mộng' }
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
    AO_VIEN_LINH: {
      accessories: [
        { id: 'THE_BAI', name: 'Thẻ Bài Sơn Mài Khảm Xà Cừ Triều Đình', cultural_reason: 'Tái hiện uy nghi hoàng gia triều Lý - Trần Đại Việt.', vibe_tag: 'Trang Nghiêm' },
        { id: 'BOI_NGOC', name: 'Đai Bội Ngọc Chạm Khắc Long Ẩn', cultural_reason: 'Phối cùng cổ tròn đại triều tôn phong thái bậc tôn quý.', vibe_tag: 'Quyền Quý' },
        { id: 'QUAT_GIAY', name: 'Quạt Xếp Thư Pháp Gỗ Hoàng Đàn', cultural_reason: 'Đạo cụ nhã nhặn của bậc vương hầu danh gia.', vibe_tag: 'Đĩnh Đạc' }
      ],
      hairstyles: [
        { id: 'BUI_TRAM', name: 'Búi Tóc Cao Vấn Đai Ngọc Triều Đình', cultural_reason: 'Để lộ đường viền tròn hoàn mỹ của cổ áo viên lĩnh.', vibe_tag: 'Uy Nghi' },
        { id: 'VAN_KHAN', name: 'Vấn Khăn Đóng Lụa Thêu Chỉ Kim Tuyến', cultural_reason: 'Quy chuẩn lễ phục tôn kính lịch sử.', vibe_tag: 'Chuẩn Mực' },
        { id: 'XOA_DAI', name: 'Tóc Dài Suôn Mượt Cài Bờm Ngọc Bích', cultural_reason: 'Nét thanh lịch đương đại giao thoa di sản ngàn năm.', vibe_tag: 'Đương Đại' }
      ]
    },
    AO_DOI_KHAM: {
      accessories: [
        { id: 'QUAT_GIAY', name: 'Quạt Giấy Thư Pháp Xứ Đoài', cultural_reason: 'Tôn nét phóng khoáng đàm đạo thi ca bên tà áo vạt thẳng song song.', vibe_tag: 'Thanh Tao' },
        { id: 'BOI_NGOC', name: 'Bội Ngọc Chạm Hoa Cúc Chu Đậu', cultural_reason: 'Thả nhẹ trước vạt áo hở tinh tế tôn nét duyên ngầm.', vibe_tag: 'Tinh Tế' },
        { id: 'TUI_GAM', name: 'Túi Gấm Thêu Chỉ Vàng Cổ Điển', cultural_reason: 'Phụ kiện cầm tay nhã nhặn chứa vật dụng khi du xuân.', vibe_tag: 'Duyên Dáng' }
      ],
      hairstyles: [
        { id: 'BUI_TRAM', name: 'Búi Tóc Tiên Nữ Cài Trâm Bạc', cultural_reason: 'Hình tượng mỹ nhân tao nhã trong tranh tượng thời Lê.', vibe_tag: 'Kiêu Kỳ' },
        { id: 'XOA_DAI', name: 'Tóc Xõa Tự Nhiên Rẽ Ngôi Thanh Thoát', cultural_reason: 'Tạo cảm giác bồng bềnh phiêu dật khi bước đi.', vibe_tag: 'Phiêu Dật' },
        { id: 'TET_BIEM', name: 'Tóc Tết Bím Đuôi Sam Kẹp Nơ Lụa', cultural_reason: 'Hiện đại, trẻ trung, kết nối nét cổ phong với Gen Z.', vibe_tag: 'Trẻ Trung' }
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

  // 1. Phân tích màu sắc động dựa trên mã màu HEX
  let cleanHex = (context.primary_color || '#F4C9D6').replace('#', '').trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  const r = parseInt(cleanHex.substring(0, 2) || 'F4', 16);
  const g = parseInt(cleanHex.substring(2, 4) || 'C9', 16);
  const b = parseInt(cleanHex.substring(4, 6) || 'D6', 16);

  const rNorm = r / 255, gNorm = g / 255, bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm), min = Math.min(rNorm, gNorm, bNorm);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
      case gNorm: h = (bNorm - rNorm) / d + 2; break;
      case bNorm: h = (rNorm - gNorm) / d + 4; break;
    }
    h *= 60;
  }

  let fiveElements = 'Thổ Hoàng Cúc (Trù Phú)';
  let culturalMeaning = `Sắc độ này gợi cảm giác nền nã, dung dị và ấm áp, biểu trưng cho nếp nhà gia phong và đạo trung dung bền vững.`;
  let harmonyRating = 'Hài Hòa Di Sản';
  let visualTone = 'Tông ấm tự nhiên, dịu mắt';

  if (l > 0.82 && s < 0.25) {
    fiveElements = 'Kim Bạch Lạp (Tinh Khôi)';
    culturalMeaning = `Sắc sáng ngà ngọc sương biểu trưng cho sự thanh khiết, chính trực và cốt cách tinh khôi của người quân tử.`;
    harmonyRating = 'Thanh Bạch Chuẩn Mực';
    visualTone = 'Tông sáng tinh khôi, bừng sáng diện mạo';
  } else if (l < 0.25) {
    fiveElements = 'Thủy Dưỡng Sắc (Huyền Bí)';
    culturalMeaning = `Sắc trầm sâu lắng biểu trưng cho sự thâm trầm, uy nghi, đĩnh đạc và bề dày tri thức uyên bác của tầng lớp sĩ đại phu.`;
    harmonyRating = 'Trang Trọng Quý Phái';
    visualTone = 'Tông tối đằm thắm, chiều sâu tương phản cao';
  } else if (h >= 330 || h < 25) {
    fiveElements = 'Hỏa Chu Tước (Khởi Sắc)';
    culturalMeaning = `Sắc đỏ son / hồng phấn biểu trưng cho vận hội hanh thông, tài lộc đầu năm và tấm lòng nhiệt huyết son sắt.`;
    harmonyRating = 'Rực Rỡ Hanh Thông';
    visualTone = 'Tông ấm rạng rỡ, giàu sinh khí';
  } else if (h >= 25 && h < 65) {
    fiveElements = 'Thổ Hoàng Cúc (Trù Phú)';
    culturalMeaning = `Sắc vàng đất / hoàng y biểu trưng cho đất mẹ chở che, phú quý thịnh vượng và sự điềm đạm bao dung.`;
    harmonyRating = 'An Định Hoàng Cung';
    visualTone = 'Tông ấm đằm thắm, cổ kính thân thuộc';
  } else if (h >= 65 && h < 175) {
    fiveElements = 'Mộc Sinh Khí (Trường Tồn)';
    culturalMeaning = `Sắc xanh rêu / ngọc bích biểu trưng cho sự sinh sôi nảy nở, trường tồn và nét tươi trẻ tự nhiên của non nước.`;
    harmonyRating = 'Sinh Khí Tươi Mới';
    visualTone = 'Tông mát dịu êm, thanh thoát an nhiên';
  } else {
    fiveElements = 'Thủy Hải Lam (Tri Thức)';
    culturalMeaning = `Sắc xanh chàm biểu trưng cho sự thông tuệ, biển học vô bờ và chí hướng thanh vân cao vời.`;
    harmonyRating = 'Thanh Vân Uyên Bác';
    visualTone = 'Tông lạnh thanh lịch, phong thái đĩnh đạc';
  }

  const dynamicColorAnalysis = {
    cultural_meaning: `${culturalMeaning} Khi phối cùng ${truth.name}, sắc thái này tôn trọn vẹn đường nét cổ phục.`,
    five_elements: fiveElements,
    harmony_rating: harmonyRating,
    visual_tone: visualTone
  };

  // 2. Độ tương thích cá nhân
  let personalCompatibility = {
    is_profile_provided: false,
    skin_tone_effect: '',
    silhouette_effect: '',
    tailoring_advice: '',
    missing_profile_reminder: '💡 Bạn chưa lưu thông tin ngoại hình trong Hồ Sơ Cá Nhân. Hãy mở Hồ Sơ để bổ sung chiều cao, cân nặng, tông da và nhấn "Cập nhật gợi ý AI" để nhận phân tích độ tương thích chuyên sâu cho riêng bạn!'
  };

  if (context.user_profile && (context.user_profile.skin || context.user_profile.height || context.user_profile.shape || context.user_profile.weight)) {
    const { height, weight, shape, skin } = context.user_profile;
    const numH = parseInt(height, 10) || 0;
    const numW = parseInt(weight, 10) || 0;

    let skinEffect = '';
    if (skin) {
      if (skin.includes('Trắng hồng') || skin.includes('Trắng')) {
        skinEffect = `Làn da ${skin} của bạn rất dễ tôn sắc phục; màu này tôn vẻ hồng hào tươi tắn, không làm bợt da.`;
      } else if (skin.includes('Bánh mật') || skin.includes('ngăm') || skin.includes('Nâu')) {
        if (l > 0.6) {
          skinEffect = `Tông màu tươi sáng tạo độ tương phản thời thượng với làn da ${skin} khỏe khoắn, giúp gương mặt bắt sáng rất tốt dưới nắng mai.`;
        } else {
          skinEffect = `Tông màu trầm ấm này hòa hợp tuyệt đối với làn da ${skin}, tôn nét mặn mà, đằm thắm và sang trọng chuẩn phong vị Á Đông.`;
        }
      } else {
        skinEffect = `Tông da ${skin} kết hợp màu này tạo cảm giác hài hòa, tươi sáng và không gây xỉn da.`;
      }
    } else {
      skinEffect = `Tông màu trang nhã, dễ phối và làm sáng gương mặt tự nhiên.`;
    }

    let silhouetteEffect = '';
    const hStr = numH > 0 ? `chiều cao ${numH}cm` : 'chiều cao của bạn';
    const sStr = shape ? `vóc dáng ${shape}` : 'vóc dáng của bạn';

    if (truth.id === 'AO_BA_BA') {
      silhouetteEffect = `Áo bà ba xẻ tà hai bên hông tạo đường thắt eo mềm mại, kết hợp quần lụa suông kéo dài đôi chân, rất tôn ${sStr} và giúp ${hStr} trông thanh thoát gọn gàng, không bị cảm giác dìm chiều cao.`;
    } else if (truth.id === 'AO_TAC') {
      silhouetteEffect = `Áo tấc tay thụng rộng mang tính lễ nghi trang nghiêm; với ${hStr}, nên căn chỉnh tà dài vừa qua bắp chân và kết hợp guốc mộc/giày độn nhẹ để tránh cảm giác bị nuốt dáng.`;
    } else if (truth.id === 'AO_NHAT_BINH') {
      silhouetteEffect = `Áo Nhật Bình vạt đối khâm thẳng song song trước ngực tạo trục dọc thị giác, giúp người mặc trông cao ráo, giấu khuyết điểm vòng 2 khéo léo.`;
    } else {
      silhouetteEffect = `Thiết kế 5 thân ghép dọc và nẹp áo lượn chữ S của ${truth.name} tạo hiệu ứng kéo dài trục cơ thể, giúp ${hStr} trông cao ráo, thanh mảnh và đĩnh đạc hơn, tôn trọn vẹn ${sStr}.`;
    }

    let tailoringAdvice = '';
    if (numH > 0 && numH < 162) {
      tailoringAdvice = `Gợi ý may đo: Gấu tà áo nên cách mắt cá chân khoảng 18-22cm, ống tay chẽn ôm vừa cổ tay để tỷ lệ cơ thể trông cao ráo, gọn gàng nhất.`;
    } else if (numH >= 162) {
      tailoringAdvice = `Gợi ý may đo: Dáng người cao ráo phù hợp để tà buông dài quét nhẹ mu bàn chân cùng quần ống rộng, tạo phong thái thướt tha uyển chuyển.`;
    } else {
      tailoringAdvice = `Gợi ý may đo: Cổ áo lập lĩnh ôm khít 2.5-3cm và thân áo khép kín vừa vặn để tôn dáng đứng thẳng trang nhã.`;
    }

    personalCompatibility = {
      is_profile_provided: true,
      skin_tone_effect: skinEffect,
      silhouette_effect: silhouetteEffect,
      tailoring_advice: tailoringAdvice,
      missing_profile_reminder: ''
    };
  }

  // 3. Cảnh báo phụ kiện đúng hay không
  let guardrailIsSafe = true;
  let guardrailWarning = '';
  let guardrailAdvice = `Các phụ kiện đi kèm hài hòa chuẩn mực với quy chuẩn di sản [${truth.originRegion}]. Không vi phạm kiêng kỵ lịch sử nào.`;

  if (truth.strictTaboos.length > 0) {
    const tabooNames = truth.strictTaboos.map((t) => t.incompatibleName).join(', ');
    guardrailAdvice = `Lưu ý chuẩn di sản: Tránh phối cùng ${tabooNames} để giữ trọn điển lễ ${truth.name}.`;
  }

  // 4. Gợi ý dáng chụp
  const poseSuggestions = truth.id === 'AO_BA_BA'
    ? 'Đứng nghiêng 45 độ bên mạn xuồng hoặc tựa nhẹ hàng rào tre, hai tay khẽ giữ vạt khăn rằn buông trước ngực, nụ cười tươi tắn hiền hòa.'
    : 'Đứng thẳng người đoan chính, một tay khẽ che quạt giấy ngang eo hoặc trước ngực, tay kia buông tà tự nhiên, ánh mắt nhìn thẳng thanh thoát.';

  // 5. Mặc trong 2-3 dịp gì
  const occasions = [
    'Dạo phố Tết truyền thống & du xuân',
    'Chụp kỷ yếu tốt nghiệp / lưu giữ thanh xuân',
    'Đi lễ chùa đầu năm & hội làng an tĩnh'
  ];

  // 6. Minh họa hình ảnh mẫu áo, mẫu tóc, phụ kiện
  const visualReferences = {
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
  };

  let note = `Gợi ý sáng tạo cho ${truth.name} sắc ${context.primary_color}: kết hợp hài hòa nét trang nhã di sản cùng phong thái tự tin đương đại.`;
  if (context.user_profile) {
    const { name, skin, shape, hair } = context.user_profile;
    const traits: string[] = [];
    if (skin) traits.push(`nước da ${skin}`);
    if (shape) traits.push(`vóc dáng ${shape}`);
    if (hair) traits.push(`mái tóc ${hair}`);
    if (traits.length > 0) {
      const greeting = name ? `${name} thân mến, ` : '';
      note = `${greeting}Dáng ${truth.name} sắc ${context.primary_color} rất tôn ${traits.join(' và ')}, tạo nên tổng thể thanh thoát và hài hòa.`;
    }
  }

  return {
    accessories: garmentSet.accessories,
    hairstyles: garmentSet.hairstyles,
    stylist_note: note,
    color_analysis: dynamicColorAnalysis,
    personal_compatibility: personalCompatibility,
    cultural_guardrail: {
      is_safe: guardrailIsSafe,
      warning_msg: guardrailWarning,
      advice: guardrailAdvice
    },
    pose_suggestions: poseSuggestions,
    recommended_occasions: occasions,
    visual_references: visualReferences
  };
}

export async function runOnlineMiniStylingSuggestions(
  ai: GoogleGenAI,
  context: {
    garment_type: string;
    primary_color: string;
    style_mode?: string;
    personality?: string;
    user_profile?: any;
  }
): Promise<MiniStylingResponse> {
  const truth = getCulturalTruth(context.garment_type);

  const userProfileStr = context.user_profile
    ? `\nĐặc điểm cá nhân của người mặc:\n- Tên/Biệt danh: ${context.user_profile.name || 'Người mặc'}\n- Chiều cao: ${context.user_profile.height ? context.user_profile.height + 'cm' : 'Chưa rõ'}\n- Cân nặng: ${context.user_profile.weight ? context.user_profile.weight + 'kg' : 'Chưa rõ'}\n- Dáng người: ${context.user_profile.shape || 'Chưa rõ'}\n- Màu da: ${context.user_profile.skin || 'Chưa rõ'}\n- Màu tóc: ${context.user_profile.hair || 'Chưa rõ'}`
    : '\nNgười mặc chưa nhập hồ sơ ngoại hình (cần để trống personal_compatibility.skin_tone_effect và gửi lời nhắc nhẹ nhàng trong missing_profile_reminder).';

  const prompt = `Bạn là Giám đốc Phong cách Cổ phục Việt Y đương đại.
Người dùng đang thiết kế bộ trang phục:
- Loại áo: [${truth.id}] ${truth.name} (Xuất xứ: ${truth.originRegion}, Niên đại: ${truth.historicalEra})
- Màu sắc chủ đạo: ${context.primary_color}
- Phong cách: ${context.style_mode || 'THANH_TAO'}
- Tính cách mong muốn: ${context.personality || 'Thanh lịch, tự tin, yêu di sản'}${userProfileStr}

Các kiêng kỵ nghiêm ngặt (KHÔNG ĐƯỢC GỢI Ý các món này):
${truth.strictTaboos.map((t) => `- Không gợi ý: ${t.incompatibleName} (Lý do: ${t.historicalConflictReason})`).join('\n')}

NHIỆM VỤ CỦA BẠN:
1. Gợi ý CHÍNH XÁC 3 phụ kiện và 3 kiểu tóc phù hợp với dáng áo và phong cách.
2. Phân tích màu sắc người dùng chọn (${context.primary_color}) theo văn hóa, ngũ hành, cảm xúc thị giác cụ thể (không dùng câu mẫu chung chung).
3. Đánh giá độ tương thích với cá nhân người dùng:
   - Nếu có thông tin ngoại hình: Phân tích cụ thể màu này làm sáng da hay tối da đối với tông da của họ; dáng áo này tôn chiều cao hay có làm cảm giác lùn/thấp đi không, và gợi ý may đo/tỷ lệ để khắc phục.
   - Nếu không có thông tin ngoại hình: Để trống skin_tone_effect, silhouette_effect, tailoring_advice và ghi lời nhắc nhẹ nhàng trong missing_profile_reminder yêu cầu bổ sung thông tin trong Hồ Sơ.
4. Đánh giá cảnh báo phụ kiện đúng hay không theo quy chuẩn di sản.
5. Gợi ý 1-2 dáng chụp ảnh nghệ thuật tôn trang phục.
6. Gợi ý 2-3 dịp thích hợp nhất để mặc.
7. Cung cấp từ khóa tìm kiếm Google Images chuẩn xác cho mẫu áo, mẫu tóc, phụ kiện.

Trả về định dạng JSON theo đúng schema được yêu cầu.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Bạn là chuyên gia tư vấn thời trang cổ phục Việt Y tinh tế và sáng tạo.',
        responseMimeType: 'application/json',
        responseSchema: miniStylingSchema,
        temperature: 0.3
      }
    });

    const parsed: MiniStylingResponse = JSON.parse(response.text || '{}');
    if (parsed.accessories?.length && parsed.hairstyles?.length && parsed.color_analysis) {
      return parsed;
    }
  } catch (err: any) {
    const isQuotaExceeded = err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('RESOURCE_EXHAUSTED');
    if (isQuotaExceeded) {
      console.log('Gemini API Quota 429: Chuyển sang Offline Heritage Generator mượt mà.');
    } else {
      console.warn('Lỗi gọi Gemini Mini Styling, dùng Offline Generator:', err?.message || err);
    }
  }

  return getOfflineMiniStylingSuggestions(context);
}

// -----------------------------------------------------------------------------
// 4. DETERMINISTIC OFFLINE ENGINE (BẢO VỆ QUOTA 100%, DỰA TRÊN CULTURAL DATABASE)
// -----------------------------------------------------------------------------
export function runOfflineCulturalPipeline(input: CulturalRecommendationInput): TwoRoundCulturalResponse {
  const startTime = Date.now();
  const truth = getCulturalTruth(input.garment_type);

  // 1. Kiểm tra State-Proof Sanity trên input tự nhập của người dùng
  for (const customAcc of input.custom_accessories || []) {
    const sanityCheck = validateUserInputSanity(customAcc, 'accessory');
    if (!sanityCheck.isValid) {
      const rejectCitations: CitationSource[] = [
        {
          title: truth.sourceTitle,
          author_or_institution: truth.authorOrInstitution,
          url: truth.sourceUrl,
          reference_chapter_or_note: truth.sourceReferenceNote || 'Tài liệu di sản'
        }
      ];

      return {
        recommendation: {
          set_name: `${truth.name} (Chưa hợp chuẩn)`,
          garment_type: truth.id,
          primary_color: input.primary_color || '#F4C9D6',
          color_harmony_explanation: 'Nội dung phụ kiện tự nhập cần được tinh chỉnh lại theo thuần phong mỹ tục hoặc tính hiện thực.',
          recommended_accessories: [],
          incompatible_accessories_detected: [],
          kieu_toc_va_makeup: { hair: 'Chưa xác định', makeup: 'Chưa xác định' },
          dang_chup_anh: 'Vui lòng điều chỉnh lại phụ kiện hoặc kiểu tóc hợp chuẩn.',
          cau_chuyen_di_san: 'Hệ thống bảo vệ thuần phong mỹ tục đã phát hiện từ ngữ hoặc đồ vật chưa phù hợp.',
          has_cultural_risk: true,
          cultural_risk_summary: sanityCheck.reason || 'Phụ kiện nhập vào chưa phù hợp.',
          citations: rejectCitations
        },
        audit: {
          audit_status: 'FLAGGED',
          confidence_score: 1.0,
          cross_regional_check: { is_valid: false, details: 'Phát hiện nội dung không phù hợp.' },
          historical_accuracy_check: { is_valid: false, details: 'Phụ kiện không hợp chuẩn hoặc không có thật.' },
          citations_verified: true,
          audit_verdict_message: sanityCheck.reason || 'Nội dung không hợp chuẩn.',
          suggested_correction: 'QUAT_GIAY'
        },
        final_guardrail: {
          is_culturally_accurate: false,
          warning_level: 'REJECTED',
          cultural_warning_msg: sanityCheck.reason || 'Phát hiện từ ngữ hoặc phụ kiện chưa phù hợp với thuần phong mỹ tục văn hóa Việt Nam.',
          suggested_fix: 'QUAT_GIAY',
          kieu_toc_va_trang_diem: 'Chưa hợp chuẩn',
          dang_chup_anh: 'Vui lòng chỉnh sửa lại từ ngữ nhập vào.',
          cau_chuyen_di_san: 'Vui lòng dùng tên phụ kiện trang sức, mũ nón, quạt hoặc trâm cài trang nhã.',
          citations: rejectCitations,
          set_name: truth.name,
          audit_passed: false,
          sanity_check_passed: false,
          inappropriate_terms_detected: [customAcc]
        },
        pipeline_metadata: {
          mode: 'OFFLINE_GROUND_TRUTH_ENGINE',
          model_round1: 'state-proof-sanity-filter',
          model_round2: 'state-proof-sanity-filter',
          latency_ms: Date.now() - startTime
        }
      };
    }
  }

  if (input.custom_hairstyle) {
    const sanityCheck = validateUserInputSanity(input.custom_hairstyle, 'hairstyle');
    if (!sanityCheck.isValid) {
      const rejectCitations: CitationSource[] = [
        {
          title: truth.sourceTitle,
          author_or_institution: truth.authorOrInstitution,
          url: truth.sourceUrl,
          reference_chapter_or_note: truth.sourceReferenceNote || 'Tài liệu di sản'
        }
      ];

      return {
        recommendation: {
          set_name: `${truth.name} (Chưa hợp chuẩn)`,
          garment_type: truth.id,
          primary_color: input.primary_color || '#F4C9D6',
          color_harmony_explanation: 'Nội dung kiểu tóc tự nhập cần được tinh chỉnh lại theo thuần phong mỹ tục hoặc tính hiện thực.',
          recommended_accessories: [],
          incompatible_accessories_detected: [],
          kieu_toc_va_makeup: { hair: 'Chưa xác định', makeup: 'Chưa xác định' },
          dang_chup_anh: 'Vui lòng điều chỉnh lại kiểu tóc hợp chuẩn.',
          cau_chuyen_di_san: 'Hệ thống bảo vệ thuần phong mỹ tục đã phát hiện từ ngữ hoặc kiểu tóc chưa phù hợp.',
          has_cultural_risk: true,
          cultural_risk_summary: sanityCheck.reason || 'Kiểu tóc nhập vào chưa phù hợp.',
          citations: rejectCitations
        },
        audit: {
          audit_status: 'FLAGGED',
          confidence_score: 1.0,
          cross_regional_check: { is_valid: false, details: 'Phát hiện nội dung không phù hợp.' },
          historical_accuracy_check: { is_valid: false, details: 'Kiểu tóc không hợp chuẩn hoặc không có thật.' },
          citations_verified: true,
          audit_verdict_message: sanityCheck.reason || 'Nội dung không hợp chuẩn.',
          suggested_correction: 'BUI_TRAM'
        },
        final_guardrail: {
          is_culturally_accurate: false,
          warning_level: 'REJECTED',
          cultural_warning_msg: sanityCheck.reason || 'Phát hiện từ ngữ hoặc kiểu tóc chưa phù hợp với thuần phong mỹ tục văn hóa Việt Nam.',
          suggested_fix: 'BUI_TRAM',
          kieu_toc_va_trang_diem: 'Chưa hợp chuẩn',
          dang_chup_anh: 'Vui lòng chỉnh sửa lại từ ngữ nhập vào.',
          cau_chuyen_di_san: 'Vui lòng dùng tên kiểu tóc hoặc cách vấn tóc trang nhã.',
          citations: rejectCitations,
          set_name: truth.name,
          audit_passed: false,
          sanity_check_passed: false,
          inappropriate_terms_detected: [input.custom_hairstyle]
        },
        pipeline_metadata: {
          mode: 'OFFLINE_GROUND_TRUTH_ENGINE',
          model_round1: 'state-proof-sanity-filter',
          model_round2: 'state-proof-sanity-filter',
          latency_ms: Date.now() - startTime
        }
      };
    }
  }

  // 2. Thu thập danh sách toàn bộ phụ kiện (cả chọn sẵn & tự nhập)
  const allAccessories: string[] = [
    ...(input.accessories || (input.accessory ? [input.accessory] : ['QUAT_GIAY'])),
    ...(input.custom_accessories || [])
  ];

  // 3. Kiểm tra Strict Taboos với toàn bộ danh sách phụ kiện
  const tabooCheck = checkMultipleStrictTaboos(truth.id, allAccessories);
  const hasRisk = tabooCheck.hasTaboo;
  const conflicts = tabooCheck.taboos;

  const primaryColor = input.primary_color || '#F4C9D6';
  const event = input.event || 'tet';
  const chosenHair = input.custom_hairstyle || input.hairstyle || 'Tóc búi cao thanh thoát cài trâm gốm';

  // AI Creativity Zone: Tùy biến sinh động theo sự kiện
  const eventCreativeStyles: Record<string, { hair: string; makeup: string; pose: string; story: string }> = {
    tet: {
      hair: chosenHair,
      makeup: 'Tông cam đào tươi tắn ấm áp, viền mắt nhẹ nhàng, điểm son đỏ cánh sen đón tân xuân nghênh tài lộc',
      pose: 'Nghiêng người 45 độ, tay khẽ giữ phụ kiện đoan trang, tà áo buông tự nhiên đón ánh nắng mai',
      story: `Sắc phục rạng rỡ chào xuân mới, kết hợp trọn vẹn triết lý di sản: ${truth.culturalSignificance}`
    },
    grad: {
      hair: chosenHair,
      makeup: 'Phong cách sương mai tông hồng đất tinh khôi, tôn phong thái tri thức đương đại',
      pose: 'Đứng thẳng người đoan chính, hai tay nâng cuốn kỷ yếu hoặc nhành hoa ngang eo, tà áo buông thẳng tắp vững chãi',
      story: `Khẳng định bản sắc cội nguồn trong ngày lễ trưởng thành cử nghiệp cùng dáng áo ${truth.name}`
    },
    temple: {
      hair: chosenHair,
      makeup: 'Trang điểm thuần khiết mộc mạc, môi hồng dưỡng tự nhiên thanh tịnh nơi thiền môn',
      pose: 'Bước chậm khoan thai bên bậc thềm đá rêu phong hoặc hai tay chắp nhẹ trước ngực an nhiên',
      story: `Nét trang nghiêm tịch tĩnh chốn thiền môn, gợi nhắc tâm hồn hướng thiện và đạo làm người bền vững`
    }
  };

  const currentCreative = eventCreativeStyles[event] || eventCreativeStyles.tet;
  const setName = `${truth.name} • Sắc Lụa Đương Đại`;

  const citations: CitationSource[] = [
    {
      title: truth.sourceTitle,
      author_or_institution: truth.authorOrInstitution,
      url: truth.sourceUrl,
      reference_chapter_or_note: truth.sourceReferenceNote || 'Tài liệu nghiên cứu di sản uy tín',
      publication_year: truth.publicationYear
    }
  ];

  const conflictMessage = conflicts.map((c) => c.historicalConflictReason).join(' ');

  const recommendation: GroundedRecommendationResult = {
    set_name: setName,
    garment_type: truth.id,
    primary_color: primaryColor,
    color_harmony_explanation: `Sự phối sắc hòa quyện giữa vẻ đẹp truyền thống của ${truth.name} và tinh thần đương đại Gen Z.`,
    recommended_accessories: allAccessories.map((acc) => ({
      id: acc,
      name: acc.replace(/_/g, ' '),
      purpose: 'Phụ kiện tôn nét phong nhã di sản theo lựa chọn cá nhân.'
    })),
    incompatible_accessories_detected: conflicts.map((c) => ({
      id: c.incompatibleWith,
      name: c.incompatibleName,
      reason: c.historicalConflictReason
    })),
    kieu_toc_va_makeup: {
      hair: currentCreative.hair,
      makeup: currentCreative.makeup
    },
    dang_chup_anh: currentCreative.pose,
    cau_chuyen_di_san: currentCreative.story,
    has_cultural_risk: hasRisk,
    cultural_risk_summary: hasRisk
      ? conflictMessage
      : 'Bộ phục trang hài hòa chuẩn mực di sản theo tài liệu khảo cứu.',
    citations
  };

  const audit: CulturalAuditResult = {
    audit_status: hasRisk ? 'FLAGGED' : 'APPROVED',
    confidence_score: hasRisk ? 0.98 : 1.0,
    cross_regional_check: {
      is_valid: !hasRisk,
      details: hasRisk
        ? `Phát hiện xung đột văn hóa: ${conflictMessage}`
        : `Phù hợp chuẩn mực vùng miền đặc trưng [${truth.originRegion}].`
    },
    historical_accuracy_check: {
      is_valid: true,
      details: `Khớp niên đại khảo cứu: ${truth.historicalEra}.`
    },
    citations_verified: true,
    audit_verdict_message: hasRisk
      ? `Phối hợp này mang tính thể nghiệm đương đại Gen Z, có sự khác biệt so với quy chuẩn di sản gốc.`
      : `Hài hòa di sản tuyệt đối. Bộ phục trang đạt chuẩn mực thẩm mỹ và lịch sử (${truth.sourceTitle}).`,
    suggested_correction: conflicts[0]?.suggestedAlternative || null
  };

  const finalGuardrail: CulturalGuardrailResult = {
    is_culturally_accurate: !hasRisk,
    warning_level: hasRisk ? 'WARNING' : 'SAFE',
    cultural_warning_msg: hasRisk ? conflictMessage : '',
    suggested_fix: conflicts[0]?.suggestedAlternative || 'QUAT_GIAY',
    kieu_toc_va_trang_diem: `${recommendation.kieu_toc_va_makeup.hair} — ${recommendation.kieu_toc_va_makeup.makeup}`,
    dang_chup_anh: recommendation.dang_chup_anh,
    cau_chuyen_di_san: recommendation.cau_chuyen_di_san,
    citations,
    set_name: setName,
    audit_passed: !hasRisk,
    sanity_check_passed: true,
    chosen_accessories: allAccessories,
    chosen_hairstyle: chosenHair,
    color_evaluation: getColorCulturalAnalysis(primaryColor, truth.id, event)
  };

  return {
    recommendation,
    audit,
    final_guardrail: finalGuardrail,
    pipeline_metadata: {
      mode: 'OFFLINE_GROUND_TRUTH_ENGINE',
      model_round1: 'local-deterministic-ground-truth',
      model_round2: 'local-heritage-auditor-rules',
      latency_ms: Date.now() - startTime
    }
  };
}

// -----------------------------------------------------------------------------
// 5. ONLINE GEMINI 2-ROUND PIPELINE (COT + GROUNDING SYSTEM INSTRUCTION)
// -----------------------------------------------------------------------------
export async function runOnlineGeminiCulturalPipeline(
  ai: GoogleGenAI,
  input: CulturalRecommendationInput
): Promise<TwoRoundCulturalResponse> {
  const startTime = Date.now();
  const truth = getCulturalTruth(input.garment_type);

  // 1. Kiểm tra State-Proof Sanity trên input tự nhập trước khi gọi API
  for (const customAcc of input.custom_accessories || []) {
    const sanity = validateUserInputSanity(customAcc, 'accessory');
    if (!sanity.isValid) {
      // Dừng sớm, không tiêu tốn token API
      return runOfflineCulturalPipeline(input);
    }
  }

  if (input.custom_hairstyle) {
    const sanity = validateUserInputSanity(input.custom_hairstyle, 'hairstyle');
    if (!sanity.isValid) {
      return runOfflineCulturalPipeline(input);
    }
  }

  const groundTruthContext = buildGroundTruthContextText();
  const allAccessories = [
    ...(input.accessories || (input.accessory ? [input.accessory] : ['QUAT_GIAY'])),
    ...(input.custom_accessories || [])
  ];
  const chosenHair = input.custom_hairstyle || input.hairstyle || 'Tóc búi cao thanh thoát cài trâm';

  // ---------------------------------------------------------------------------
  // VÒNG 1: GROUNDED RECOMMENDATION GENERATOR
  // ---------------------------------------------------------------------------
  const round1SystemInstruction = `Bạn là Chuyên gia Cố vấn Di sản Cổ phục Việt Y đương đại.

BỘ NGUỒN SỰ THẬT DUY NHẤT VỀ DI SẢN (HERITAGE GROUND TRUTH):
${groundTruthContext}

NGUYÊN TẮC HOẠT ĐỘNG PHÂN ĐỊNH RẠCH RÒI:
1. ĐIỀU BẮT BUỘC TUÂN THỦ THEO GROUND TRUTH (KHÔNG ĐƯỢC SAI):
   - Bạn PHẢI đối chiếu chính xác loại áo, niên đại, vùng miền và các đặc trưng cấu trúc từ Ground Truth.
   - Kiểm tra toàn bộ danh sách phụ kiện (cả món có sẵn và món người dùng tự nhập) đối với danh sách 'QUY CHUẨN KIÊNG KỴ NGHIÊM NGẶT (STRICT TABOOS)':
     + Nếu có phụ kiện thuộc danh sách kiêng kỵ (ví dụ: Áo Ngũ Thân Lập Lĩnh + Khăn Rằn, Áo Bà Ba + Nón Quai Thao, Áo Nhật Bình + Khăn Rằn), bạn PHẢI đánh dấu has_cultural_risk = true và nêu rõ lý do xung đột lịch sử.
     + Nếu không vi phạm, đánh dấu has_cultural_risk = false.
   - KIỂM ĐỊNH THUẦN PHONG MỸ TỤC TRÊN NỘI DUNG TỰ NHẬP:
     + Nếu phát hiện từ ngữ thô tục, báng bổ hoặc không phải phụ kiện/kiểu tóc có thật, đánh dấu has_cultural_risk = true và nêu rõ lý do.
   - BẮT BUỘC TRÍCH DẪN NGUỒN: Bạn PHẢI trích dẫn chính xác 'sourceUrl', 'title', 'author_or_institution' từ Ground Truth của loại trang phục đó vào mảng 'citations'. Tuyệt đối không bịa đặt link URL.

2. VÙNG SÁNG TẠO TỰ NHIÊN CỦA AI (CREATIVE FREEDOM):
   - Đánh giá sự hài hòa giữa màu sắc người dùng chọn, các phụ kiện đã chọn và kiểu tóc.
   - Sáng tạo phong cách trang điểm (kieu_toc_va_makeup.makeup), dáng chụp ảnh nghệ thuật (dang_chup_anh) và thông điệp di sản truyền cảm hứng cho Gen Z (cau_chuyen_di_san).`;

  const round1Prompt = `Người dùng yêu cầu tư vấn phối đồ:
- Loại trang phục: [${truth.id}] ${truth.name}
- Sự kiện / Bối cảnh: ${input.event || 'tet'}
- Màu sắc chủ đạo: ${input.primary_color}
- Danh sách phụ kiện chọn & tự nhập: ${JSON.stringify(allAccessories)}
- Kiểu tóc đã chọn hoặc tự nhập: "${chosenHair}"
- Phong cách mong muốn: ${input.style_mode || 'THANH_TAO'}
- Tính cách người mặc: ${input.personality || 'Đương đại, phóng khoáng, tự tin'}

Hãy áp dụng Chain-of-Thought (CoT):
1. Tra cứu loại trang phục trong Ground Truth và kiểm tra toàn bộ phụ kiện có phạm Strict Taboos không.
2. Kiểm tra xem các phụ kiện tự nhập và kiểu tóc có phù hợp thuần phong mỹ tục và hợp chuẩn hay không.
3. Sinh gợi ý makeup, dáng chụp ảnh và thông điệp di sản độc đáo theo bối cảnh.
4. Trích xuất chính xác nguồn tư liệu uy tín có kèm 'url' từ Ground Truth vào danh sách 'citations'.`;

  const round1Response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: round1Prompt,
    config: {
      systemInstruction: round1SystemInstruction,
      responseMimeType: 'application/json',
      responseSchema: round1ResponseSchema,
      temperature: 0.3
    }
  });

  const recommendation: GroundedRecommendationResult = JSON.parse(round1Response.text || '{}');

  // Đảm bảo citations luôn có sourceUrl từ Ground Truth nếu model trả thiếu
  if (!recommendation.citations || recommendation.citations.length === 0) {
    recommendation.citations = [
      {
        title: truth.sourceTitle,
        author_or_institution: truth.authorOrInstitution,
        url: truth.sourceUrl,
        reference_chapter_or_note: truth.sourceReferenceNote || 'Tài liệu nghiên cứu di sản'
      }
    ];
  }

  // ---------------------------------------------------------------------------
  // VÒNG 2: MULTI-ROUND CULTURAL AUDITOR AGENT
  // ---------------------------------------------------------------------------
  const round2SystemInstruction = `Bạn là Trưởng Ban Thẩm định Di sản Độc lập thuộc Hội đồng Cổ phục Việt Nam.

BỘ NGUỒN SỰ THẬT DUY NHẤT ĐỐI CHIẾU:
${groundTruthContext}

NHIỆM VỤ CỦA BẠN:
1. Bạn nhận bản kết quả tư vấn từ Vòng 1 và đối chiếu nghiêm ngặt từng yếu tố với Ground Truth.
2. Kiểm tra xung đột vùng miền (Cross-regional check): Có bị lẫn lộn giữa nón quai thao/áo tứ thân (Bắc Bộ), khăn vành/áo tấc/nhật bình/ngũ thân (Huế/Trung Bộ), và áo bà ba/khăn rằn (Nam Bộ) không?
3. Kiểm tra tính chính xác lịch sử (Historical accuracy check): Niên đại và cấu trúc có đúng như trong Ground Truth không?
4. Kiểm tra trích dẫn (Citations verification): Đảm bảo các URL trích dẫn dẫn về nguồn uy tín có trong Ground Truth.
5. Đưa ra phán quyết:
   - 'APPROVED': Hoàn toàn chuẩn mực di sản.
   - 'FLAGGED': Có vi phạm điều kiêng kỵ nghiêm ngặt (Strict Taboos) hoặc không hợp chuẩn thuần phong mỹ tục.`;

  const round2Prompt = `Hãy kiểm định bản đề xuất sau đây từ Vòng 1:
${JSON.stringify(recommendation, null, 2)}

Hãy đối chiếu với Ground Truth và đưa ra kết luận thẩm định JSON.`;

  const round2Response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: round2Prompt,
    config: {
      systemInstruction: round2SystemInstruction,
      responseMimeType: 'application/json',
      responseSchema: round2AuditResponseSchema,
      temperature: 0.1
    }
  });

  const audit: CulturalAuditResult = JSON.parse(round2Response.text || '{}');

  // Hợp nhất vào Final Guardrail Result
  const isSafe = audit.audit_status === 'APPROVED' && !recommendation.has_cultural_risk;
  const finalGuardrail: CulturalGuardrailResult = {
    is_culturally_accurate: isSafe,
    warning_level: isSafe ? 'SAFE' : 'WARNING',
    cultural_warning_msg: isSafe ? '' : (recommendation.cultural_risk_summary || audit.audit_verdict_message),
    suggested_fix: audit.suggested_correction || recommendation.recommended_accessories[0]?.id || 'QUAT_GIAY',
    kieu_toc_va_trang_diem: `${recommendation.kieu_toc_va_makeup.hair} — ${recommendation.kieu_toc_va_makeup.makeup}`,
    dang_chup_anh: recommendation.dang_chup_anh,
    cau_chuyen_di_san: recommendation.cau_chuyen_di_san,
    citations: recommendation.citations,
    set_name: recommendation.set_name,
    audit_passed: isSafe,
    sanity_check_passed: true,
    chosen_accessories: allAccessories,
    chosen_hairstyle: chosenHair,
    color_evaluation: getColorCulturalAnalysis(input.primary_color, truth.id, input.event)
  };

  return {
    recommendation,
    audit,
    final_guardrail: finalGuardrail,
    pipeline_metadata: {
      mode: 'ONLINE_GEMINI_PIPELINE',
      model_round1: 'gemini-3.8-flash',
      model_round2: 'gemini-3.8-flash',
      latency_ms: Date.now() - startTime
    }
  };
}
