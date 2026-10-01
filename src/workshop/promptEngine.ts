import { CurrentOutfitState } from '../types/index.ts';

/**
 * CƠ CHẾ LẮP RÁP PROMPT CHUYÊN SÂU (PROMPT ASSEMBLY ENGINE)
 */
export function assembleFashionPrompt(currentOutfitState: CurrentOutfitState): string {
  const state = currentOutfitState || {};

  // 1. Phom dáng trang phục [GARMENT_NAME]
  let garmentName =
    'Vietnamese traditional Ao Ngu Than (aristocratic five-panel robe with standing Lap Linh collar and right-flap 5 golden ceramic buttons)';
  if (state.garment === 'AO_BA_BA') {
    garmentName =
      'Vietnamese traditional Ao Ba Ba (southern flowing silk tunic with graceful round neckline, split hem, and authentic center button placket)';
  }

  // 2. Màu sắc vải lụa [COLOR_NAME]
  const colorMap: Record<string, string> = {
    '#B22222': 'Crimson Vermilion (Đỏ Son)',
    '#1D3557': 'Deep Indigo Blue (Xanh Chàm)',
    '#E5A93C': 'Imperial Chrysanthemum Yellow (Hoàng Cúc)',
    '#2B1A12': 'Warm Lacquer Brown (Cánh Gián)',
    '#F5F2EB': 'Pomelo Blossom Ivory White (Trắng Bưởi)'
  };
  const colorName = colorMap[state.color] || `${state.colorName || 'heritage traditional'} silk`;

  // 3. Phụ kiện đi kèm [ACCESSORIES]
  let accessories = 'a handcrafted calligraphy folding paper fan (Quạt Giấy)';
  if (state.accessory === 'KHAN_RAN') {
    accessories = 'an authentic black and ivory checkered Mekong Delta scarf (Khăn Rằn) draped casually';
  } else if (state.accessory === 'NON_QUAI_THAO') {
    accessories = 'a traditional Northern Vietnamese flat palm-leaf conical hat with silk strap ribbons (Nón Quai Thao)';
  }
  if (state.genzActive) {
    accessories += ' paired with minimalist Gen Z thin-rim gold sunglasses';
  }

  // 4. Chi tiết hoa văn [PATTERN_DESC]
  let patternDesc = 'subtle tonal jacquard damask woven into natural Vietnamese mulberry silk';
  if (state.pattern && state.pattern.pattern_name) {
    patternDesc = `${state.pattern.pattern_name} (${state.pattern.pattern_story || 'heritage motifs with subtle gold luster'})`;
  }

  // Cấu trúc Prompt tự động ghép nối theo chuẩn yêu cầu:
  const prompt = `Masterpiece editorial fashion photography of a young Vietnamese Gen Z model wearing authentic ${garmentName}. Layered silk fabric in ${colorName}, styled with ${accessories}. Pattern details: ${patternDesc}. Soft natural rim lighting, elegant atmosphere, Do paper and dark lacquerware texture background. Strictly NO Hanfu elements, NO Kimono obi, NO extra fingers, NO distorted body, NO modern zippers.`;

  return prompt;
}
