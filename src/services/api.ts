import {
  CulturalGuardrailResult,
  PatternItem,
  MiniStylingResponse,
  CulturalRecommendationInput
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
    }
  } catch (err) {
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
