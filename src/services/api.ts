import { CulturalGuardrailResult, PatternItem } from '../types/index.ts';
import { getMockCulturalAI, getMockPattern, getMockFashionLookbook } from './mockData.ts';

/**
 * API SERVICE LAYER - MOCK MODE
 * Tự động cung cấp mock data tức thì cho toàn bộ ứng dụng nhằm tránh vượt hạn mức quota (429) của Google.
 */

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
  // Trả về mock data với độ trễ tự nhiên (150ms) mô phỏng AI xử lý
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      resolve(getMockCulturalAI(contextPayload));
    }, 150);

    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      });
    }
  });
}

export async function fetchPatternAI(keyword: string, mode: string): Promise<PatternItem | null> {
  // Trả về mock hoa văn di sản tức thì theo từ khóa và chế độ phủ
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getMockPattern(keyword, mode));
    }, 200);
  });
}

export async function fetchFashionImageAPI(prompt: string, signal?: AbortSignal): Promise<string | null> {
  // Trả về ảnh Lookbook AI thời trang mỹ thuật cao (Data URI) tức thì
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      resolve(getMockFashionLookbook(prompt));
    }, 300);

    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      });
    }
  });
}
