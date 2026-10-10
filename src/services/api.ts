import {
  CulturalGuardrailResult,
  PatternItem,
  MiniStylingResponse,
  CulturalRecommendationInput,
  PatternPromptResponse,
  PromptEnrichmentComponents
} from '../types/index.ts';
import {
  getMockCulturalAI,
  getMockPattern,
  getMockFashionLookbook,
  getMockStylingSuggestions
} from './mockData.ts';

/**
 * API SERVICE LAYER
 * Kết nối các endpoint backend Express + Gemini Flash với cơ chế Offline Fallback an toàn.
 */

export async function fetchStylingSuggestionsAPI(
  context: {
    garment_type: string;
    primary_color: string;
    style_mode?: string;
    styles?: string[];
    creativity_level?: number;
    personality?: string;
    user_profile?: any;
  },
  signal?: AbortSignal
): Promise<MiniStylingResponse> {
  try {
    const res = await fetch('/api/gemini/suggest-styling', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(context),
      signal
    });
    if (res.ok) {
      return await res.json();
    } else {
      const errJson = await res.json().catch(() => null);
      if (errJson?.error) {
        throw new Error(errJson.error);
      }
    }
  } catch (err: any) {
    if (err?.message?.includes('quá tải') || err?.message?.includes('hết lượt')) {
      throw err;
    }
    console.warn('Lỗi fetch suggest-styling, sử dụng offline generator:', err);
  }
  return getMockStylingSuggestions(context);
}

export async function fetchCulturalAI(
  contextPayload: CulturalRecommendationInput,
  signal?: AbortSignal
): Promise<CulturalGuardrailResult | null> {
  try {
    const res = await fetch('/api/gemini/cultural-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contextPayload),
      signal
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Lỗi fetch cultural-ai, sử dụng offline engine:', err);
  }

  // Fallback offline deterministic engine
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        getMockCulturalAI({
          event: contextPayload.event || 'tet',
          primary_color: contextPayload.primary_color || '#F4C9D6',
          garment_type: contextPayload.garment_type || 'AO_NGU_THAN',
          accessory: contextPayload.accessory || (contextPayload.accessories?.[0] || 'QUAT_GIAY'),
          region: contextPayload.region
        })
      );
    }, 120);
  });
}

export async function fetchPatternAI(keyword: string, mode: string): Promise<PatternItem | null> {
  try {
    const res = await fetch('/api/gemini/generate-pattern', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword, overlay_mode: mode })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Lỗi fetch pattern-ai, sử dụng local pattern:', err);
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getMockPattern(keyword, mode));
    }, 150);
  });
}

export async function fetchPatternPromptAI(params: {
  keyword: string;
  technique?: string;
  garment?: string;
  colorHex?: string;
}): Promise<PatternPromptResponse> {
  try {
    const res = await fetch('/api/gemini/generate-pattern-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Lỗi fetch generate-pattern-prompt, fallback client generator:', err);
  }

  // Fallback phong phú nếu offline
  const kw = (params.keyword || 'hoa sen liên hoa').toLowerCase();
  const tech = params.technique || 'Gấm chìm Jacquard';
  const garment = params.garment || 'Áo Ngũ Thân';

  return {
    pattern_prompt: `Master editorial macro photograph of traditional Vietnamese luxury fabric sample. Intricate motif inspired by "${params.keyword}". Tailored for authentic Vietnamese ${garment}. Technique: ${tech} on natural Mulberry silk (lụa tơ tằm thượng hạng). High relief gold thread embroidery highlights, subtle indigo and jade undertones. Soft cinematic studio side lighting revealing silk sheen texture, Hasselblad 85mm lens f/2.8, 8k hyper-detailed textile weave. Strictly NO Hanfu imperial dragons, NO Kimono sash motifs, NO Chinese Qipao buttons, NO flat cartoon illustration, photorealistic authentic Vietnamese heritage textile.`,
    pattern_title: `Bản Dệt Cổ Phong: ${params.keyword}`,
    cultural_story: `Cảm hứng mỹ thuật cổ truyền từ "${params.keyword}", kết tinh nét tài hoa của nghệ nhân dệt lụa tơ tằm Việt Nam.`,
    technique_used: tech
  };
}

export async function fetchFashionImageAPI(prompt: string, signal?: AbortSignal): Promise<string | null> {
  try {
    const res = await fetch('/api/gemini/fashion-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
      signal
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.imageUrl) return data.imageUrl;
    }
  } catch (err) {
    console.warn('Lỗi fetch fashion-image, sử dụng editorial generator:', err);
  }

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      resolve(getMockFashionLookbook(prompt));
    }, 200);

    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      });
    }
  });
}

export async function fetchSynthesizePromptPartsAPI(
  payload: {
    garment_type: string;
    garment_label?: string;
    primary_color: string;
    color_name?: string;
    styles?: string[];
    creativity_level?: number;
    accessories?: string[];
    accessory_labels?: string[];
    custom_accessories?: string[];
    hairstyle?: string;
    custom_hairstyle?: string;
    pattern_name?: string;
    pattern_story?: string;
    event?: string;
    best_occasion?: string;
    user_profile?: any;
  },
  signal?: AbortSignal
): Promise<PromptEnrichmentComponents | null> {
  try {
    const res = await fetch('/api/gemini/synthesize-prompt-parts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Lỗi fetch synthesize-prompt-parts, dùng bộ lắp ráp nội bộ:', err);
  }
  return null;
}
