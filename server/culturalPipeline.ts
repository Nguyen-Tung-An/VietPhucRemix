/**
 * VIỆT Y REMIX — TWO-ROUND CULTURAL AI PIPELINE
 * 
 * Kiến trúc 2 vòng kiểm định di sản theo chuẩn Prompt Engineering:
 * - Vòng 1: Grounded Recommendation Generator (CoT + Grounding Context + Structured Output)
 * - Vòng 2: Multi-Round Cultural Auditor Agent (Kiểm duyệt độc lập phát hiện nhầm lẫn vùng miền/thời kỳ)
 * 
 * Cả 2 vòng đều dùng HERITAGE_GROUND_TRUTH làm "Nguồn sự thật duy nhất" (Single Source of Truth)
 * và luôn kèm theo các trích dẫn URL đến tài liệu nguồn gốc uy tín.
 */

import { GoogleGenAI, Type } from '@google/genai';
import { HERITAGE_GROUND_TRUTH, GarmentHeritageRecord } from '../src/data/heritageGroundTruth.ts';
import {
  CulturalRecommendationInput,
  GroundedRecommendationResult,
  CulturalAuditResult,
  TwoRoundCulturalResponse,
  CulturalGuardrailResult
} from '../src/types/index.ts';

// -----------------------------------------------------------------------------
// 1. CHUYỂN ĐỔI BỘ GROUND TRUTH THÀNH PROMPT CONTEXT CÔ ĐỌNG
// -----------------------------------------------------------------------------
function buildGroundTruthContextText(): string {
  const records = Object.values(HERITAGE_GROUND_TRUTH);
  return records
    .map((r: GarmentHeritageRecord) => {
      const incompatibleList = r.strictly_incompatible_accessories
        .map((inc) => `- Kỵ phụ kiện: ${inc.accessory_name} (Lý do lịch sử: ${inc.historical_conflict_reason})`)
        .join('\n      ');

      const citationsList = r.citations
        .map((c) => `- Nguồn: "${c.title}" - Tác giả/Tổ chức: ${c.author_or_institution} - Link: ${c.url} (${c.reference_chapter_or_note})`)
        .join('\n      ');

      return `### LOẠI ÁO: [${r.id}] ${r.name}
- Tên thường gọi: ${r.common_names.join(', ')}
- Niên đại & Bối cảnh lịch sử: ${r.historical_era}
- Vùng miền đặc trưng: ${r.primary_region}
- Tầng lớp / Công năng: ${r.social_stratum}
- Cấu trúc: ${r.structural_features.flaps_count} thân áo, cổ [${r.structural_features.collar_type}], ${r.structural_features.buttons_count} cúc cài.
  + Ý nghĩa cúc: ${r.structural_features.button_symbolism}
  + Ý nghĩa thân áo: ${r.structural_features.body_symbolism}
- Sự kiện phù hợp: ${r.recommended_events.join(', ')}
- Phụ kiện hòa hợp: ${r.compatible_accessories.join(', ')}
- Quy chuẩn kiêng kỵ / Xung đột di sản:
      ${incompatibleList || 'Không có kiêng kỵ nghiêm trọng.'}
- Kiểu tóc & Trang điểm khuyến nghị: ${r.makeup_and_hair_guidelines.hair_styles.join('; ')} | Makeup: ${r.makeup_and_hair_guidelines.makeup_tone}
- Tư thế chụp ảnh: ${r.makeup_and_hair_guidelines.photography_pose}
- Tài liệu trích dẫn uy tín:
      ${citationsList}`;
    })
    .join('\n\n');
}

// -----------------------------------------------------------------------------
// 2. SCHEMAS CẤU TRÚC DỮ LIỆU ĐẦU RA (GEMINI STRUCTURED OUTPUTS)
// -----------------------------------------------------------------------------
const round1ResponseSchema = {
  type: Type.OBJECT,
  properties: {
    set_name: { type: Type.STRING, description: 'Tên bộ trang phục mỹ miều chuẩn phong vị di sản' },
    garment_type: { type: Type.STRING, description: 'Mã định danh loại áo (AO_NGU_THAN, AO_TAC, AO_NHAT_BINH...)' },
    primary_color: { type: Type.STRING, description: 'Mã màu chính hex hoặc tên màu' },
    color_harmony_explanation: { type: Type.STRING, description: 'Giải thích sự hòa sắc theo ngũ hành hoặc tinh thần di sản' },
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
        hair: { type: Type.STRING },
        makeup: { type: Type.STRING }
      },
      required: ['hair', 'makeup']
    },
    dang_chup_anh: { type: Type.STRING },
    cau_chuyen_di_san: { type: Type.STRING },
    has_cultural_risk: { type: Type.BOOLEAN },
    cultural_risk_summary: { type: Type.STRING },
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
    citations_verified: { type: Type.BOOLEAN, description: 'Tất cả link và tài liệu có khớp với Ground Truth không' },
    audit_verdict_message: { type: Type.STRING, description: 'Nhận xét ngắn gọn, mềm mại theo tinh thần Lụa Thanh' },
    suggested_correction: { type: Type.STRING, description: 'Gợi ý điều chỉnh nếu có xung đột, nếu không thì null' }
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
// 3. DETERMINISTIC OFFLINE ENGINE (TỐC ĐỘ <20MS, ZERO TOKEN, DỰA TRÊN GROUND TRUTH)
// -----------------------------------------------------------------------------
export function runOfflineCulturalPipeline(input: CulturalRecommendationInput): TwoRoundCulturalResponse {
  const startTime = Date.now();
  const garmentKey = (input.garment_type || 'AO_NGU_THAN').toUpperCase();
  const record = HERITAGE_GROUND_TRUTH[garmentKey] || HERITAGE_GROUND_TRUTH.AO_NGU_THAN;

  const currentAccessory = (input.accessory || 'QUAT_GIAY').toUpperCase();

  // Kiểm tra xung đột phụ kiện trong Ground Truth
  const conflict = record.strictly_incompatible_accessories.find(
    (inc) => inc.accessory_id.toUpperCase() === currentAccessory || currentAccessory.includes(inc.accessory_id)
  );

  const hasRisk = Boolean(conflict);

  const primaryColor = input.primary_color || '#F4C9D6';
  const matchedColor = record.recommended_colors.find(
    (c) => c.hex.toLowerCase() === primaryColor.toLowerCase()
  ) || record.recommended_colors[0];

  const setName = `${record.name} Sắc ${matchedColor.name}`;

  // Bước 1: Recommendation
  const recommendation: GroundedRecommendationResult = {
    set_name: setName,
    garment_type: record.id,
    primary_color: primaryColor,
    color_harmony_explanation: matchedColor.cultural_meaning,
    recommended_accessories: record.compatible_accessories.map((accId) => ({
      id: accId,
      name: accId.replace(/_/g, ' '),
      purpose: 'Tôn vinh tính trang nhã và nguyên bản của trang phục.'
    })),
    incompatible_accessories_detected: conflict
      ? [
          {
            id: conflict.accessory_id,
            name: conflict.accessory_name,
            reason: conflict.historical_conflict_reason
          }
        ]
      : [],
    kieu_toc_va_makeup: {
      hair: record.makeup_and_hair_guidelines.hair_styles[0] || 'Búi tóc thanh nhã',
      makeup: record.makeup_and_hair_guidelines.makeup_tone
    },
    dang_chup_anh: record.makeup_and_hair_guidelines.photography_pose,
    cau_chuyen_di_san: `${record.structural_features.button_symbolism} ${record.structural_features.body_symbolism}`,
    has_cultural_risk: hasRisk,
    cultural_risk_summary: conflict
      ? conflict.historical_conflict_reason
      : 'Bộ phục trang hài hòa chuẩn mực di sản theo tài liệu khảo cứu.',
    citations: record.citations
  };

  // Bước 2: Auditor Agent
  const audit: CulturalAuditResult = {
    audit_status: hasRisk ? 'FLAGGED' : 'APPROVED',
    confidence_score: hasRisk ? 0.98 : 1.0,
    cross_regional_check: {
      is_valid: !hasRisk,
      details: hasRisk
        ? `Phát hiện xung đột vùng miền: ${conflict?.historical_conflict_reason}`
        : `Phù hợp chuẩn mực vùng miền đặc trưng [${record.primary_region}].`
    },
    historical_accuracy_check: {
      is_valid: true,
      details: `Khớp niên đại khảo cứu: ${record.historical_era}.`
    },
    citations_verified: true,
    audit_verdict_message: hasRisk
      ? `Phối hợp này mang tính thể nghiệm đương đại Gen Z, có sự khác biệt so với quy chuẩn gốc triều đại.`
      : `Hài hòa di sản tuyệt đối. Bộ phục trang đạt chuẩn mực thẩm mỹ và lịch sử.`,
    suggested_correction: conflict ? record.compatible_accessories[0] : null
  };

  // Final Guardrail View Model
  const finalGuardrail: CulturalGuardrailResult = {
    is_culturally_accurate: !hasRisk,
    warning_level: hasRisk ? 'WARNING' : 'SAFE',
    cultural_warning_msg: hasRisk ? (conflict?.historical_conflict_reason || '') : '',
    suggested_fix: conflict ? record.compatible_accessories[0] : 'QUAT_GIAY',
    kieu_toc_va_trang_diem: `${recommendation.kieu_toc_va_makeup.hair} — ${recommendation.kieu_toc_va_makeup.makeup}`,
    dang_chup_anh: recommendation.dang_chup_anh,
    cau_chuyen_di_san: recommendation.cau_chuyen_di_san,
    citations: record.citations,
    set_name: setName,
    audit_passed: !hasRisk
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
// 4. ONLINE GEMINI 2-ROUND PIPELINE (COT + GROUNDING SYSTEM INSTRUCTION)
// -----------------------------------------------------------------------------
export async function runOnlineGeminiCulturalPipeline(
  ai: GoogleGenAI,
  input: CulturalRecommendationInput
): Promise<TwoRoundCulturalResponse> {
  const startTime = Date.now();
  const groundTruthContext = buildGroundTruthContextText();

  // ---------------------------------------------------------------------------
  // VÒNG 1: GROUNDED RECOMMENDATION GENERATOR
  // Kỹ thuật: Role-Prompting + Grounded System Instruction + CoT Reasoner
  // ---------------------------------------------------------------------------
  const round1SystemInstruction = `Bạn là Chuyên gia Cố vấn Di sản Cổ phục Việt Y.
NGUỒN SỰ THẬT DUY NHẤT (GROUND TRUTH):
${groundTruthContext}

QUY TẮC BẮT BUỘC:
1. Bạn CHỈ ĐƯỢC PHÉP trả lời dựa trên Ground Truth được cung cấp ở trên.
2. TUYỆT ĐỐI KHÔNG tự suy diễn, bịa đặt niên đại, ý nghĩa hay quy tắc ngoài tài liệu này.
3. Trong phần citations, bạn PHẢI trích xuất chính xác tiêu đề, tác giả/tổ chức và đường link URL có trong Ground Truth.
4. Áp dụng quy trình tư duy Chain-of-Thought (CoT):
   - Bước 1: Tra cứu đúng mã loại áo trong Ground Truth.
   - Bước 2: So sánh phụ kiện người dùng chọn với danh sách 'Quy chuẩn kiêng kỵ / Xung đột di sản' của áo đó.
   - Bước 3: Nếu phát hiện xung đột (ví dụ Áo Ngũ Thân + Khăn Rằn, Áo Bà Ba + Nón Quai Thao), đặt has_cultural_risk = true và nêu rõ lý do lịch sử.
   - Bước 4: Trích dẫn các tài liệu nguồn gốc có URL tương ứng.`;

  const round1Prompt = `Người dùng yêu cầu tư vấn phối đồ:
- Loại trang phục yêu cầu: ${input.garment_type}
- Sự kiện / Bối cảnh: ${input.event}
- Màu sắc chủ đạo: ${input.primary_color}
- Phụ kiện đang chọn: ${input.accessory}
- Phong cách mong muốn: ${input.style_mode || 'THANH_TAO'}
- Vùng miền: ${input.region || 'TOAN_QUOC'}

Hãy phân tích và sinh bộ gợi ý phối đồ chuẩn mực có căn cứ di sản theo đúng định dạng JSON được yêu cầu.`;

  const round1Response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: round1Prompt,
    config: {
      systemInstruction: round1SystemInstruction,
      responseMimeType: 'application/json',
      responseSchema: round1ResponseSchema,
      temperature: 0.2 // Giữ nhiệt độ thấp để giảm thiểu tối đa ảo giác
    }
  });

  const recommendation: GroundedRecommendationResult = JSON.parse(round1Response.text || '{}');

  // ---------------------------------------------------------------------------
  // VÒNG 2: MULTI-ROUND CULTURAL AUDITOR AGENT
  // Kỹ thuật: Independent Heritage Auditor Critic + Cross-regional Verification
  // ---------------------------------------------------------------------------
  const round2SystemInstruction = `Bạn là Trưởng Ban Thẩm định Di sản Độc lập thuộc Hội đồng Cổ phục Việt Nam.
NGUỒN SỰ THẬT DUY NHẤT ĐỐI CHIẾU:
${groundTruthContext}

NHIỆM VỤ CỦA BẠN:
1. Bạn nhận bản kết quả tư vấn từ Vòng 1 và đối chiếu nghiêm ngặt từng câu chữ với Ground Truth.
2. Kiểm tra xung đột vùng miền (Cross-regional check): Có bị lẫn lộn giữa nón quai thao/khăn mỏ quạ (Bắc Bộ), khăn vành/áo tấc/nhật bình (Huế/Trung Bộ), và áo bà ba/khăn rằn (Nam Bộ) không?
3. Kiểm tra tính chính xác lịch sử (Historical accuracy check): Cấu trúc thân áo, số lượng cúc cài, và triết lý có đúng như trong sách nghiên cứu không?
4. Kiểm tra trích dẫn (Citations verification): Đảm bảo các URL trích dẫn dẫn về nguồn uy tín đã được cấp phép trong Ground Truth.
5. Đưa ra phán quyết:
   - 'APPROVED': Hoàn toàn chuẩn mực di sản.
   - 'FLAGGED': Có rủi ro hiểu lầm văn hóa (ví dụ gắn phụ kiện thôn dã vào đại lễ phục cung đình).`;

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
    audit_passed: isSafe
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
