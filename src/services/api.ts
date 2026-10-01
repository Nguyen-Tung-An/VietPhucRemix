import { CulturalGuardrailResult, PatternItem } from '../types/index.ts';

export async function fetchCulturalAI(
  contextPayload: {
    event: string;
    primary_color: string;
    garment_type: string;
    accessory: string;
    region?: string;
  },
  signal?: AbortSignal
): Promise<CulturalGuardrailResult | null> {
  // 1. Thử gọi qua backend proxy
  try {
    const response = await fetch('/api/gemini/cultural-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contextPayload),
      signal
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.kieu_toc_va_trang_diem) {
        return data as CulturalGuardrailResult;
      }
    }
  } catch (err: unknown) {
    if ((err as Error)?.name === 'AbortError') throw err;
  }

  // 2. Thử gọi trực tiếp Google Generative Language API nếu có API key trong window
  const win = window as unknown as { GEMINI_API_KEY?: string; __GEMINI_API_KEY__?: string };
  const clientApiKey = win.GEMINI_API_KEY || win.__GEMINI_API_KEY__ || '';
  if (clientApiKey) {
    try {
      const directEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${clientApiKey}`;
      const systemInstruction =
        "Bạn là Chuyên gia Di sản & Thời trang Việt Y dành cho Gen Z. Hãy phân tích bộ trang phục và sự kiện người dùng chọn. Đề xuất kiểu tóc, tông trang điểm và dáng chụp ảnh tôn vóc dáng. Viết 1 đoạn thuyết minh ngắn (tối đa 3 câu) về ý nghĩa văn hóa, từ ngữ trẻ trung, truyền cảm hứng. Nếu tổ hợp trang phục và phụ kiện/sự kiện bị sai lệch văn hóa vùng miền hoặc thời kỳ, hãy đặt is_culturally_accurate = false, warning_level = 'WARNING' và viết lời khuyên nhã nhặn, tôn trọng sáng tạo của người trẻ nhưng định hướng chuẩn mực. Ngược lại đặt warning_level = 'SAFE'. BẮT BUỘC TRẢ VỀ DUY NHẤT ĐỊNH DẠNG JSON KHÔNG KÈM VĂN BẢN NGOÀI.";

      const directBody = {
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: [{ parts: [{ text: JSON.stringify(contextPayload) }] }],
        generationConfig: {
          response_mime_type: "application/json",
          response_schema: {
            type: "OBJECT",
            properties: {
              is_culturally_accurate: { type: "BOOLEAN" },
              warning_level: { type: "STRING" },
              cultural_warning_msg: { type: "STRING" },
              suggested_fix: { type: "STRING" },
              kieu_toc_va_trang_diem: { type: "STRING" },
              dang_chup_anh: { type: "STRING" },
              cau_chuyen_di_san: { type: "STRING" }
            },
            required: [
              "is_culturally_accurate",
              "warning_level",
              "cultural_warning_msg",
              "suggested_fix",
              "kieu_toc_va_trang_diem",
              "dang_chup_anh",
              "cau_chuyen_di_san"
            ]
          }
        }
      };

      const directRes = await fetch(directEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(directBody),
        signal
      });

      if (directRes.ok) {
        const rawJson = await directRes.json();
        const textPart = rawJson.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textPart) {
          return JSON.parse(textPart) as CulturalGuardrailResult;
        }
      }
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') throw err;
    }
  }

  return null;
}

export async function fetchPatternAI(keyword: string, mode: string): Promise<PatternItem | null> {
  try {
    const res = await fetch('/api/gemini/generate-pattern', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword, overlay_mode: mode })
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.svg_path_data) {
        return data as PatternItem;
      }
    }
  } catch (err) {
    console.warn('Lỗi gọi AI sinh hoa văn:', (err as Error).message);
  }
  return null;
}

export async function fetchFashionImageAPI(prompt: string, signal?: AbortSignal): Promise<string | null> {
  try {
    const response = await fetch('/api/gemini/fashion-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
      signal
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.imageUrl) {
        return data.imageUrl;
      }
    }
  } catch (err) {
    console.warn('Lỗi gọi API Lookbook AI:', (err as Error).message);
  }
  return null;
}
