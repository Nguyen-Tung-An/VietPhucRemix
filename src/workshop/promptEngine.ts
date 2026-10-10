import type { CurrentOutfitState, PromptEnrichmentComponents } from '../types/index.ts';

/**
 * BẢNG ÁNH XẠ TÊN MÀU TIẾNG VIỆT ĐẶC TRƯNG SANG MÔ TẢ LỤA TIẾNG ANH CHÍNH XÁC
 */
const VIETNAMESE_COLOR_NAME_HINTS: Array<{
  keywords: string[];
  nameEn: string;
  fabricToneDesc: (hex: string) => string;
}> = [
  {
    keywords: ['bạch lụa', 'trắng bưởi', 'sương mai', 'tinh khôi', 'trắng ngà', 'bạch ngọc'],
    nameEn: 'Pristine Mist-White & Ivory Mulberry Silk',
    fabricToneDesc: (hex) =>
      `luminous off-white and pristine ivory raw mulberry silk (#${hex}) with a delicate translucent weave and soft morning-dew pearl sheen`
  },
  {
    keywords: ['xanh bạc hà', 'bạc hà', 'mint', 'pastel dịu mát'],
    nameEn: 'Pastel Mint Celadon Silk Chiffon',
    fabricToneDesc: (hex) =>
      `refreshing pastel mint-celadon silk (#${hex}) with an airy, translucent chiffon-silk drape and cool jadeite luminosity`
  },
  {
    keywords: ['xanh cốm', 'cốm mùa thu', 'cốm non'],
    nameEn: 'Young Autumn Green-Rice (Cốm) Mulberry Silk',
    fabricToneDesc: (hex) =>
      `poetic Hanoi autumn young-rice green silk (#${hex}) with soft sage-chartreuse warmth and fluid organic drape`
  },
  {
    keywords: ['xanh thiên thanh', 'thiên thanh', 'thanh lam'],
    nameEn: 'Cerulean Azure Sky Silk',
    fabricToneDesc: (hex) =>
      `striking cerulean azure silk (#${hex}) with contemporary high-fashion sheen and crisp sky-blue clarity`
  },
  {
    keywords: ['xanh ngọc bích', 'ngọc bích', 'lục thủy'],
    nameEn: 'Imperial Emerald & River Jade Silk',
    fabricToneDesc: (hex) =>
      `deep imperial jade-emerald silk (#${hex}) with rich celadon depth and tranquil river-water luster`
  },
  {
    keywords: ['xanh chàm', 'chàm đêm', 'indigo'],
    nameEn: 'Deep Midnight Indigo Brocade Silk',
    fabricToneDesc: (hex) =>
      `solemn midnight indigo-navy silk (#${hex}) with scholarly dignity and subtle dark-sapphire sheen`
  },
  {
    keywords: ['tím huế', 'tím xứ huế', 'tử sa', 'mộng mơ trầm mặc'],
    nameEn: 'Imperial Hue Twilight Violet Silk',
    fabricToneDesc: (hex) =>
      `regal Hue twilight violet-plum silk (#${hex}) imbued with nostalgic Perfume River dusk elegance`
  },
  {
    keywords: ['đỏ nhung', 'rượu vang', 'bordeaux'],
    nameEn: 'Burgundy Wine Silk Velvet (Nhung Tuyết)',
    fabricToneDesc: (hex) =>
      `opulent Bordeaux wine-red crushed silk velvet (#${hex}) with plush evening-gala depth and rich ruby highlights`
  },
  {
    keywords: ['đỏ son', 'huyết dụ', 'đại triều', 'yếm thắm'],
    nameEn: 'Imperial Vermilion & Cinnabar Crimson Silk',
    fabricToneDesc: (hex) =>
      `majestic imperial vermilion-crimson silk (#${hex}) with auspicious cinnabar warmth and celebratory royal sheen`
  },
  {
    keywords: ['hồng phấn', 'cánh sen', 'hồng sen'],
    nameEn: 'Lotus Petal Blush Pink Silk',
    fabricToneDesc: (hex) =>
      `tender dawn lotus-petal blush pink silk (#${hex}) with soft romantic translucency and dewy radiance`
  },
  {
    keywords: ['vàng hoàng cúc', 'vàng đất', 'vàng nắng', 'mật ong', 'hoàng triều'],
    nameEn: 'Imperial Chrysanthemum & Honey Amber Gold Silk',
    fabricToneDesc: (hex) =>
      `radiant imperial chrysanthemum gold and warm honey-amber silk (#${hex}) with regal golden-hour luminosity`
  },
  {
    keywords: ['nâu cánh gián', 'củ nâu', 'nâu sồng', 'đồng nội'],
    nameEn: 'Artisanal Củ Nâu Earth-Dyed & Lacquer Brown Fabric',
    fabricToneDesc: (hex) =>
      `authentic root-dyed earthy terracotta-brown and warm lacquer-chestnut weave (#${hex}) with rustic heritage character`
  },
  {
    keywords: ['hắc xà', 'đen mun', 'lãnh mỹ a', 'mặc nưa'],
    nameEn: 'Lãnh Mỹ A Obsidian Lacquer-Black Silk',
    fabricToneDesc: (hex) =>
      `legendary Tân Châu Lãnh Mỹ A obsidian-black mulberry silk (#${hex}) naturally dyed with ebony mặc-nưa fruit, gleaming with a signature leather-like lacquer sheen`
  }
];

/**
 * Hàm phân tích mã màu Hex bất kỳ + tên màu người dùng chọn thành mô tả lụa di sản giàu hình tượng.
 * Khắc phục triệt để lỗi màu trắng ngà (#F5F2EB - Bạch Lụa Sương Mai) bị nhận nhầm thành Cam Đào Phù Sa.
 */
export function analyzeHexColor(
  hexCode: string,
  colorNameVi?: string
): { nameVi: string; nameEn: string; visualDesc: string } {
  const cleanHex = (hexCode || '#F4C9D6').replace('#', '').trim().toUpperCase();
  const userColorName = (colorNameVi || '').trim();
  const lowerName = userColorName.toLowerCase();

  // 1. Ưu tiên khớp theo tên màu tiếng Việt cụ thể của trang phục / người dùng chọn
  if (lowerName) {
    for (const hint of VIETNAMESE_COLOR_NAME_HINTS) {
      if (hint.keywords.some((kw) => lowerName.includes(kw))) {
        return {
          nameVi: userColorName,
          nameEn: hint.nameEn,
          visualDesc: hint.fabricToneDesc(cleanHex)
        };
      }
    }
  }

  if (cleanHex.length !== 6) {
    return {
      nameVi: userColorName || 'Sắc Lụa Di Sản',
      nameEn: 'Authentic Vietnamese Heritage Silk',
      visualDesc: 'naturally dyed Vietnamese mulberry silk with soft organic sheen'
    };
  }

  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  const deg = Math.round(h * 360);
  const satPct = Math.round(s * 100);
  const lumPct = Math.round(l * 100);

  // 2. Nhóm màu Trắng Ngà / Bạch Lụa / Sương Mai (Xử lý chuẩn xác các mã màu sáng như #F5F2EB, #E8F3EE)
  if (lumPct >= 88 && satPct <= 45) {
    return {
      nameVi: userColorName || 'Bạch Lụa Sương Mai Tinh Khôi',
      nameEn: 'Pristine Mist-White & Raw Ivory Silk',
      visualDesc: `pristine ivory-white raw mulberry silk (#${cleanHex}) with a delicate translucent weave and soft morning-dew pearl sheen`
    };
  }

  // 3. Nhóm Đơn sắc (Trắng, Đen, Xám khói)
  if (satPct < 15) {
    if (lumPct > 78) {
      return {
        nameVi: userColorName || 'Bạch Lụa Sương Mai / Trắng Bưởi',
        nameEn: 'Mist White Mulberry Silk',
        visualDesc: `pristine ivory raw silk (#${cleanHex}) with natural translucent weave and soft pearl sheen`
      };
    }
    if (lumPct < 24) {
      return {
        nameVi: userColorName || 'Hắc Xà / Đen Mun Sơn Mài',
        nameEn: 'Obsidian Lacquer Black Silk',
        visualDesc: `deep lustrous lacquer-black mulberry silk (#${cleanHex}) with subtle charcoal-ebony undertones`
      };
    }
    return {
      nameVi: userColorName || 'Ngọc Sương Tro Cổ',
      nameEn: 'Ash Celadon Mist Silk',
      visualDesc: `subdued vintage mist-grey silk (#${cleanHex}) with muted poetic texture`
    };
  }

  // 4. Phân vùng theo vòng cung màu HSL chuẩn xác
  if (deg >= 335 || deg < 18) {
    if (lumPct > 68) {
      return {
        nameVi: userColorName || 'Hồng Phấn Sen Cung Đình',
        nameEn: 'Lotus Blossom Pink Silk',
        visualDesc: `delicate pastel lotus-petal pink silk (#${cleanHex}) with tender romantic radiance`
      };
    }
    return {
      nameVi: userColorName || 'Đỏ Son Đại Triều / Huyết Dụ',
      nameEn: 'Imperial Vermilion Crimson Silk',
      visualDesc: `luxurious imperial cinnabar-red silk (#${cleanHex}) with rich ruby warmth and majestic sheen`
    };
  }

  if (deg >= 18 && deg < 45) {
    if (lumPct < 45) {
      return {
        nameVi: userColorName || 'Nâu Cánh Gián Sơn Mài',
        nameEn: 'Amber Lacquer Brown Silk',
        visualDesc: `traditional Vietnamese lacquer-brown silk (#${cleanHex}) with deep warm chestnut-caramel undertones`
      };
    }
    return {
      nameVi: userColorName || 'Cam Đào Phù Sa',
      nameEn: 'Warm Terracotta Peach Silk',
      visualDesc: `warm peach-terracotta silk (#${cleanHex}) reminiscent of alluvial river dusk`
    };
  }

  if (deg >= 45 && deg < 72) {
    return {
      nameVi: userColorName || 'Hoàng Cúc / Vàng Đất Cố Đô',
      nameEn: 'Imperial Golden Chrysanthemum Silk',
      visualDesc: `warm imperial chrysanthemum-gold silk (#${cleanHex}) inspired by royal Hue court brocade and sunlit amber glaze`
    };
  }

  if (deg >= 72 && deg < 150) {
    if (lumPct < 35) {
      return {
        nameVi: userColorName || 'Xanh Rêu Đêm Cổ Tự',
        nameEn: 'Ancient Night Moss Green Silk',
        visualDesc: `deep antique forest moss-green silk (#${cleanHex}) with solemn heritage depth`
      };
    }
    return {
      nameVi: userColorName || 'Xanh Cốm Mùa Thu / Lục Diệp',
      nameEn: 'Young Rice-Green (Cốm) Mulberry Silk',
      visualDesc: `fresh young-rice sage green mulberry silk (#${cleanHex}) with soft organic botanical sheen`
    };
  }

  if (deg >= 150 && deg < 192) {
    if (lumPct >= 72) {
      return {
        nameVi: userColorName || 'Xanh Bạc Hà Pastel Dịu Mát',
        nameEn: 'Pastel Mint Celadon Silk',
        visualDesc: `airy pastel mint-celadon silk (#${cleanHex}) with translucent cool-jadeite lightness`
      };
    }
    return {
      nameVi: userColorName || 'Xanh Ngọc Bích / Lục Thủy',
      nameEn: 'Emerald River-Jade Silk',
      visualDesc: `vibrant jade-emerald mulberry silk (#${cleanHex}) with luminous river-water reflection`
    };
  }

  if (deg >= 192 && deg < 260) {
    if (lumPct < 36) {
      return {
        nameVi: userColorName || 'Xanh Chàm Đêm Sông Hương',
        nameEn: 'Deep Indigo Navy Silk',
        visualDesc: `deep Vietnamese indigo-navy silk (#${cleanHex}) with midnight sapphire velvet highlights`
      };
    }
    return {
      nameVi: userColorName || 'Xanh Thiên Thanh Đương Đại',
      nameEn: 'Cerulean Sky-Blue Silk',
      visualDesc: `refined cerulean sky-blue silk (#${cleanHex}) reflecting morning river mist and crisp modern elegance`
    };
  }

  // Tím Huế / Tử Sa (deg >= 260 && deg < 335)
  return {
    nameVi: userColorName || 'Tím Xứ Huế Mộng Mơ',
    nameEn: 'Imperial Hue Violet Silk',
    visualDesc: `poetic royal Hue violet silk (#${cleanHex}) imbued with nostalgic twilight elegance`
  };
}

/**
 * BẢNG TỪ ĐIỂN TRỌNG SỐ THỊ GIÁC CHO CÁC THẺ PHONG CÁCH (STYLE TAGS)
 * Giúp các tag phong cách thực sự điều hướng ánh sáng, thần thái, góc máy và hậu kỳ trong Prompt.
 */
const STYLE_TAG_VISUAL_DIRECTIVES: Record<string, string> = {
  'Thanh tao cung đình':
    'refined Hue aristocratic court poise, symmetrical architectural framing, serene diffused silk lighting, museum-grade noble restraint',
  'Cổ điển hoài niệm':
    'nostalgic Indochine analog film aesthetic, warm golden sepia-kissed highlights, poetic vintage grain, timeless heritage aura',
  'Thơ mộng trữ tình':
    'ethereal romantic dreamscape, soft backlit morning mist, gentle breeze lifting the silk panels, painterly pastel bokeh',
  'Trang trọng nho nhã':
    'dignified scholarly Confucian elegance, upright composed posture, crisp tailored lines, solemn ceremonial gravitas',
  'Đương đại tối giản':
    'minimalist contemporary oriental architecture, clean negative space, gallery-grade neutral tonal harmony, sculptural fabric folds',
  'Vương giả quyền quý':
    'opulent imperial majesty, rich chiaroscuro gold-and-crimson rim lighting, sumptuous metallic thread catchlights, regal commanding presence',
  'Cung đình uy nghi':
    'monumental royal court grandeur, ceremonial palace framing, authoritative aristocratic bearing, museum-piece embroidery clarity',
  'Phóng khoáng phá cách':
    'bold Gen Z high-fashion street-runway attitude, dynamic asymmetric camera angle, fearless contemporary styling contrast, energetic editorial movement',
  'Dân gian mộc mạc':
    'authentic Northern/Southern Vietnamese pastoral charm, warm natural sunlight filtering through bamboo and banyan leaves, organic handwoven textile close-ups',
  'Nữ tính duyên dáng':
    'graceful feminine silhouette, fluid silk movement, tender expressive gaze, soft petal-toned rim light',
  'Cá tính hiện đại':
    'edgy modern fashion-week lookbook vibe, sharp studio-meets-heritage lighting, confident editorial gaze'
};

/**
 * Chuyển đổi danh sách thẻ phong cách tiếng Việt thành chỉ dẫn nghệ thuật tiếng Anh có sức nặng
 */
function buildStyleTagsDirective(styleList: string[], creativityVal: number): {
  stylesVi: string;
  styleVisualImpactEn: string;
} {
  const cleanStyles = styleList.map((s) => s.trim()).filter(Boolean);
  const stylesVi = cleanStyles.length > 0 ? cleanStyles.join(' × ') : 'Thanh tao cung đình';

  const mappedDirectives: string[] = [];
  for (const tag of cleanStyles) {
    if (STYLE_TAG_VISUAL_DIRECTIVES[tag]) {
      mappedDirectives.push(`[${tag}: ${STYLE_TAG_VISUAL_DIRECTIVES[tag]}]`);
    } else {
      // Hỗ trợ bất kỳ style tag tự do hoặc mới nào từ người dùng
      const lower = tag.toLowerCase();
      if (lower.includes('phá cách') || lower.includes('cá tính') || lower.includes('gen z') || lower.includes('runway')) {
        mappedDirectives.push(`[${tag}: bold avant-garde Gen Z runway reinterpretation, dynamic editorial angles, high-contrast fashion lighting]`);
      } else if (lower.includes('tối giản') || lower.includes('minimal')) {
        mappedDirectives.push(`[${tag}: zen minimalist architectural framing, pure form and raw textile texture focus]`);
      } else if (lower.includes('cung đình') || lower.includes('vương giả') || lower.includes('hoàng gia')) {
        mappedDirectives.push(`[${tag}: regal imperial court opulence, gilded highlights and noble bearing]`);
      } else if (lower.includes('mộc') || lower.includes('dân gian')) {
        mappedDirectives.push(`[${tag}: authentic artisanal folk warmth, natural sunlit organic atmosphere]`);
      } else {
        mappedDirectives.push(`[${tag}: distinctive ${tag} editorial mood and visual storytelling]`);
      }
    }
  }

  let creativityWeightEn = '';
  if (creativityVal <= 15) {
    creativityWeightEn =
      `Creativity Index ${creativityVal}% (Strict Archival Heritage): 100% historically faithful museum restoration tailoring, authentic dynasty proportions, zero modern distortion`;
  } else if (creativityVal <= 38) {
    creativityWeightEn =
      `Creativity Index ${creativityVal}% (Classical Editorial): predominantly traditional heritage silhouette with refined contemporary editorial polish`;
  } else if (creativityVal <= 58) {
    creativityWeightEn =
      `Creativity Index ${creativityVal}% (Balanced Contemporary Remix): harmonious fusion of authentic Vietnamese garment structure with modern minimalist tailoring and fresh youth poise`;
  } else if (creativityVal <= 78) {
    creativityWeightEn =
      `Creativity Index ${creativityVal}% (High-Fashion Runway Remix): BOLD contemporary fashion-week reinterpretation — pairing the authentic Vietnamese heritage collar and panels with high-fashion runway styling, contemporary layered textures, statement jewelry, and striking editorial camera work`;
  } else {
    creativityWeightEn =
      `Creativity Index ${creativityVal}% (Avant-Garde Haute Couture Fusion): ULTRA-BOLD avant-garde Gen Z haute couture remix — deconstructed architectural layering, dramatic sculptural silhouette play, futuristic cultural revival aesthetic, high-contrast studio-editorial lighting while honoring the unmistakable Vietnamese collar DNA`;
  }

  return {
    stylesVi,
    styleVisualImpactEn: `${mappedDirectives.join('; ')} — ${creativityWeightEn}`
  };
}

/**
 * Xây dựng mô tả cấu trúc trang phục kết hợp nhãn chi tiết (garmentLabel) và mức độ phá cách (creativityLevel)
 */
function buildGarmentDescription(state: CurrentOutfitState): string {
  const label = (state.garmentLabel || '').trim();
  const lowerLabel = label.toLowerCase();
  const creativity = typeof state.creativityLevel === 'number' ? state.creativityLevel : 35;

  let baseGarment = '';
  switch (state.garment) {
    case 'AO_TAC':
      if (lowerLabel.includes('cưới') || lowerLabel.includes('hỷ')) {
        baseGarment =
          'authentic Vietnamese ceremonial wedding Áo Tấc (Nguyen dynasty aristocratic grand wedding robe with expansive flowing wide sleeves "tay thụng", formal upright Lap Linh standing collar, five right-flap royal buttons, worn over matching silk trousers)';
      } else if (lowerLabel.includes('đũi') || lowerLabel.includes('tối giản')) {
        baseGarment =
          'minimalist contemporary-classic Vietnamese Áo Tấc crafted from raw tussah silk "lụa đũi" (featuring monumental wide sleeves "tay thụng", clean standing Lap Linh collar, five subtle right-flap buttons, and architectural drape over wide-leg ivory silk trousers)';
      } else {
        baseGarment =
          'authentic Vietnamese ceremonial Áo Tấc (Nguyen dynasty aristocratic grand ceremony silk robe with expansive flowing wide sleeves "tay thụng", formal high Lap Linh standing collar, five right-flap royal closure buttons, worn over long ivory silk trousers)';
      }
      break;

    case 'AO_NHAT_BINH':
      if (lowerLabel.includes('remix') || lowerLabel.includes('đương đại') || creativity >= 65) {
        baseGarment =
          'contemporary runway-remixed Vietnamese Áo Nhật Bình (preserving the iconic Nguyen dynasty rectangular Doi Kham front collar band with geometric phoenix-and-cloud embroidery and five-color "ngũ sắc" sleeve bands, reimagined with a sleek modern editorial drape and contemporary high-fashion layering)';
      } else {
        baseGarment =
          'authentic royal Vietnamese Áo Nhật Bình court robe (magnificent Nguyen dynasty noblewoman court attire with iconic rectangular Doi Kham front collar bands richly embroidered with gold celestial clouds and phoenix motifs, decorative concentric five-color "ngũ sắc" silk ribbons on sleeves, worn over an inner silk robe and pleated Bách Điệp skirt)';
      }
      break;

    case 'AO_TU_THAN':
      if (lowerLabel.includes('cốm') || lowerLabel.includes('đương đại') || creativity >= 55) {
        baseGarment =
          'ethereal contemporary-styled Vietnamese Áo Tứ Thân (Northern Kinh Bắc four-panel flowing silk dress with light, translucent layered panels tied gracefully at the waist over a delicate silk Yếm bodice and soft silk sash)';
      } else if (lowerLabel.includes('nâu sồng') || lowerLabel.includes('cổ truyền')) {
        baseGarment =
          'authentic rustic Northern Vietnamese folk Áo Tứ Thân (traditional four-panel handwoven dress in earthy root-dyed tones, front panels knotted gracefully at the waist over a traditional silk Yếm halter bodice and woven silk waistband)';
      } else {
        baseGarment =
          'authentic Vietnamese folk Áo Tứ Thân (iconic Northern Kinh Bắc four-panel silk dress with four gracefully draped panels, front two panels tied into an elegant knot at the waist, worn over a vibrant crimson silk Yếm halter top and flowing silk sash)';
      }
      break;

    case 'AO_BA_BA':
      if (lowerLabel.includes('lãnh mỹ a')) {
        baseGarment =
          'authentic Southern Vietnamese Áo Bà Ba tailored from legendary glossy black Lãnh Mỹ A silk (featuring a graceful round neckline, center placket with polished silver bead buttons, tailored side slits over flowing black Lãnh Mỹ A silk trousers)';
      } else if (lowerLabel.includes('cách điệu') || creativity >= 55) {
        baseGarment =
          'modernized Southern Vietnamese Áo Bà Ba (sleek waist-accentuated mulberry silk tunic with delicate floral weave, classic center button placket, high side slits, paired with fluid ivory silk trousers)';
      } else {
        baseGarment =
          'authentic Southern Vietnamese Áo Bà Ba (iconic Mekong Delta flowing mulberry silk tunic featuring a graceful open round neckline, classic center button placket with hand-sewn buttons, tailored split hem over loose-fitting ivory silk trousers)';
      }
      break;

    case 'AO_DAI_LEMUR':
      if (lowerLabel.includes('nhung')) {
        baseGarment =
          'opulent 1930s Vietnamese Áo Dài Lemur evening gown in plush silk velvet (classic Cát Tường modernist silhouette with subtle teardrop keyhole collar, softly puffed shoulders, sculpted waistline, and floor-length velvet panels over satin trousers)';
      } else if (lowerLabel.includes('pastel') || lowerLabel.includes('nàng thơ') || creativity >= 65) {
        baseGarment =
          'romantic Gen Z remix of the 1930s Vietnamese Áo Dài Lemur (dreamy translucent silk-chiffon Cát Tường silhouette with delicate puffed sleeves, slender tailored waist, and weightless flowing panels)';
      } else {
        baseGarment =
          'authentic vintage 1930s Vietnamese Áo Dài Lemur (classic Cát Tường modernism silhouette with slender tailored waistline, graceful collar, softly puffed shoulders, dual floor-length flowing silk panels draping seamlessly over white silk trousers)';
      }
      break;

    case 'AO_NGU_THAN':
    default:
      if (lowerLabel.includes('nam') || lowerLabel.includes('tay chẽn')) {
        baseGarment =
          'authentic Vietnamese men’s Áo Ngũ Thân Tay Chẽn (traditional five-panel aristocratic gentleman’s robe with fitted sleeves "tay chẽn", upright Lap Linh standing collar, five symbolic right-flap brass/jade buttons representing Nhân-Lễ-Nghĩa-Trí-Tín, worn over crisp white silk trousers)';
      } else {
        baseGarment =
          'authentic Vietnamese Áo Ngũ Thân Lập Lĩnh (traditional aristocratic five-panel silk robe with tailored Lap Linh standing mandarin collar, fitted sleeves, five symbolic royal buttons along the right curved flap representing the Five Virtues Nhân-Lễ-Nghĩa-Trí-Tín, graceful A-line drape over ivory silk trousers)';
      }
      break;
  }

  // Bổ sung hiệu ứng cấu trúc theo độ phá cách (% Creativity)
  let remixTailoringNote = '';
  if (creativity >= 80) {
    remixTailoringNote =
      ' — styled with avant-garde haute couture layering, bold contemporary silhouette proportions, and dramatic runway movement while preserving the authentic Vietnamese collar and panel construction';
  } else if (creativity >= 60) {
    remixTailoringNote =
      ' — elevated with contemporary fashion-forward layering, modern lightweight textile interplay, and editorial Gen Z styling flair';
  } else if (creativity <= 20) {
    remixTailoringNote =
      ' — tailored with strict museum-grade historical accuracy and authentic traditional seamwork';
  }

  return `${baseGarment}${ label ? ` [${label}]` : '' }${remixTailoringNote}`;
}

/**
 * Chuyển đổi mã phụ kiện, nhãn phụ kiện (accessoryLabels) và phụ kiện tự nhập sang mô tả tiếng Anh chuẩn xác
 */
function translateAccessoryItem(codeOrText: string, explicitLabel?: string): string {
  const code = (codeOrText || '').trim();
  const label = (explicitLabel || '').trim();
  const combined = `${code} ${label}`.toLowerCase();

  if (combined.includes('quạt xếp gỗ') || combined.includes('trầm hương')) {
    return `carved agarwood folding fan (${label || 'Quạt Xếp Gỗ Trầm Hương'})`;
  }
  if (combined.includes('quạt xếp ren') || combined.includes('ren trắng')) {
    return `delicate white lace folding fan (${label || 'Quạt Xếp Ren Trắng Tiểu Thư'})`;
  }
  if (combined.includes('quạt nan tre') || combined.includes('thư họa')) {
    return `bamboo-ribbed calligraphy folding paper fan (${label || 'Quạt Giấy Thư Họa'})`;
  }
  if (combined.includes('quạt lụa')) {
    return `royal hand-painted silk folding fan (${label || 'Quạt Lụa Cung Đình'})`;
  }
  if (code === 'QUAT_GIAY' || combined.includes('quạt')) {
    return `handcrafted traditional Vietnamese folding paper fan (${label || 'Quạt Giấy Điệp'})`;
  }

  if (combined.includes('khăn rằn sọc đỏ')) {
    return `authentic Southern Mekong Delta black-and-white checkered Khăn Rằn scarf with traditional red border stripes (${label})`;
  }
  if (code === 'KHAN_RAN' || combined.includes('khăn rằn')) {
    return `authentic Mekong Delta black-and-white checkered woven cotton scarf (${label || 'Khăn Rằn Nam Bộ'})`;
  }

  if (code === 'NON_QUAI_THAO' || combined.includes('quai thao')) {
    return `iconic Northern Kinh Bắc flat palm-leaf hat with braided silk chin ribbons (${label || 'Nón Quai Thao'})`;
  }
  if (code === 'NON_LA' || combined.includes('nón lá')) {
    return `traditional hand-stitched Vietnamese conical palm-leaf hat with silk chin tie (${label || 'Nón Lá'})`;
  }

  if (combined.includes('trâm phượng') || combined.includes('phượng hoàng')) {
    return `intricate handcrafted silver phoenix hairpin (${label || 'Trâm Phượng Hoàng Bạc'})`;
  }
  if (combined.includes('trâm vàng hoa cúc')) {
    return `gilded royal chrysanthemum hairpin (${label || 'Trâm Vàng Hoa Cúc'})`;
  }
  if (combined.includes('ngọc tím') || combined.includes('hoa sen')) {
    return `artisan silver lotus hairpin inlaid with violet jade (${label || 'Trâm Bạc Hoa Sen Đính Ngọc Tím'})`;
  }
  if (combined.includes('gốm') || code === 'TRAM_GOM') {
    return `handcrafted blue-and-white ceramic hairpin (${label || 'Trâm Cài Gốm Men Lam'})`;
  }
  if (code === 'TRAM_BAC' || combined.includes('trâm')) {
    return `handcrafted sterling silver heritage hairpin (${label || 'Trâm Bạc Chạm Khắc'})`;
  }

  if (combined.includes('cỏ bàng')) {
    return `handwoven Mekong sedge-grass basket bag (${label || 'Giỏ Cỏ Bàng Đan Tay'})`;
  }
  if (combined.includes('ví đầm') || combined.includes('satin')) {
    return `vintage 1930s satin evening clutch (${label || 'Ví Đầm Lụa Satin'})`;
  }
  if (code === 'TUI_GAM' || combined.includes('túi gấm') || combined.includes('túi')) {
    return `embroidered silk brocade draw-string pouch (${label || 'Túi Gấm Thêu'})`;
  }

  if (combined.includes('khuyên tai ngọc trai')) {
    return `lustrous freshwater pearl drop earrings (${label || 'Khuyên Tai Ngọc Trai Nước Ngọt'})`;
  }
  if (combined.includes('ba tầng')) {
    return `classic 1930s triple-strand pearl necklace (${label || 'Chuỗi Ngọc Trai Cổ Điển Ba Tầng'})`;
  }
  if (combined.includes('đương đại') && combined.includes('ngọc trai')) {
    return `contemporary runway statement pearl choker necklace (${label || 'Vòng Cổ Ngọc Trai Đương Đại'})`;
  }
  if (code === 'CHUOI_NGOC' || combined.includes('ngọc trai') || combined.includes('chuỗi ngọc')) {
    return `elegant layered pearl necklace (${label || 'Chuỗi Ngọc Trai'})`;
  }

  if (combined.includes('kính') || combined.includes('sunglasses')) {
    return `avant-garde retro-futuristic editorial eyewear (${label || code})`;
  }
  if (combined.includes('guốc mộc')) {
    return `traditional carved wooden clogs (${label || 'Guốc Mộc'})`;
  }

  return label ? `curated heritage-remix accessory: ${label} (${code})` : `curated styling accessory: ${code}`;
}

/**
 * Chuyển đổi toàn diện mọi kiểu tóc (mã code, gợi ý từ AI hoặc câu mô tả tiếng Việt bất kỳ)
 * sang mô tả Hair & Makeup tiếng Anh giàu chi tiết, khắc phục triệt để lỗi rơi về mặc định.
 */
function buildHairAndMakeupDirective(state: CurrentOutfitState): {
  hairEn: string;
  makeupEn: string;
} {
  const rawHair = (state.custom_hairstyle || state.hairstyle || '').trim();
  const lowerHair = rawHair.toLowerCase();
  const labelLower = (state.garmentLabel || '').toLowerCase();
  const isMaleOutfit =
    lowerHair.includes('nam ') ||
    lowerHair.includes('khăn đóng nam') ||
    labelLower.includes('nam ') ||
    labelLower.includes('tay chẽn');

  let hairEn = '';

  if (!rawHair || rawHair === 'BUI_TRAM') {
    hairEn = 'traditional neat low chignon hair bun adorned with a refined lotus hairpin (Tóc búi cài trâm thanh nhã)';
  } else if (rawHair === 'VAN_KHAN' || rawHair === 'VAN_KHAN_VANH') {
    hairEn = 'regal wrapped Vietnamese silk turban "Khăn Đóng / Khăn Vành" framing an elegant face';
  } else if (rawHair === 'XOA_DAI') {
    hairEn = 'silky straight natural dark hair flowing gently over the shoulders (Tóc xõa dài tự nhiên)';
  } else if (rawHair === 'TET_BIEM') {
    hairEn = 'delicate side-swept braided hair tied with a soft silk ribbon (Tóc tết bím duyên dáng)';
  } else if (rawHair === 'UON_SONG') {
    hairEn = 'vintage 1930s Indochine finger-wave curls framing the temples (Tóc uốn sóng cổ điển)';
  } else {
    // Phân tích thông minh chuỗi mô tả tiếng Việt bất kỳ (từ 18 bộ Curated, từ AI Mini Styling hoặc do người dùng tự nhập)
    const parts: string[] = [];

    if (lowerHair.includes('khăn đóng nam')) {
      parts.push('dignified men’s wrapped black silk turban "Khăn Đóng Nam" over neatly groomed short hair');
    } else if (lowerHair.includes('khăn vành dây') && lowerHair.includes('ngũ sắc')) {
      parts.push('imperial Nguyen dynasty noblewoman multi-looped five-color silk halo headdress "Khăn Vành Dây Ngũ Sắc"');
    } else if (lowerHair.includes('khăn vành')) {
      parts.push('aristocratic Hue court wrapped silk halo turban "Khăn Vành Cung Đình"');
    } else if (lowerHair.includes('khăn đóng') && lowerHair.includes('gấm')) {
      parts.push('ceremonial gold-embroidered brocade wrapped turban "Khăn Đóng Gấm Thêu Chỉ Vàng"');
    } else if (lowerHair.includes('khăn mỏ quạ') || lowerHair.includes('đuôi gà')) {
      parts.push('iconic Northern Kinh Bắc black crow-beak headscarf "Khăn Mỏ Quạ" with hair wrapped in a traditional "vấn tóc đuôi gà" chignon');
    } else if (lowerHair.includes('vấn khăn lụa')) {
      parts.push('softly braided hair wrapped with a pastel silk ribbon "vấn khăn lụa buông lơi"');
    } else if (lowerHair.includes('búi bánh lái')) {
      parts.push('classic Hue noblewoman helm-shaped low chignon "tọc búi bánh lái" secured with a silver blossom hairpin');
    } else if (lowerHair.includes('búi trễ') && lowerHair.includes('lược đồi mồi')) {
      parts.push('poetic low-slung chignon bun adorned with an antique tortoiseshell comb "tóc búi trễ cài lược đồi mồi thanh tao"');
    } else if (lowerHair.includes('búi củ tỏi') || lowerHair.includes('trâm mộc')) {
      parts.push('minimalist high top-knot bun pierced with a sleek hand-carved wooden hairpin "tóc búi củ tỏi tối giản cài trâm mộc"');
    } else if (lowerHair.includes('búi kiểu pháp')) {
      parts.push('sophisticated 1930s Parisian-Indochine French twist chignon "tóc búi kiểu Pháp kiêu sa"');
    } else if (lowerHair.includes('tóc bob') || lowerHair.includes('kẹp bạc geometric')) {
      parts.push('chic contemporary chin-length Bob haircut styled with a modern geometric silver hairclip "Tóc Bob cài kẹp bạc geometric hiện đại"');
    } else if (lowerHair.includes('đuôi ngựa') || lowerHair.includes('ruy băng')) {
      parts.push('romantic low ponytail tied with a flowing soft silk ribbon bow "tóc buộc đuôi ngựa thấp thắt nơ ruy băng lụa"');
    } else if (lowerHair.includes('buộc nửa đầu')) {
      parts.push('gentle half-up half-down hairstyle secured with a rustic wooden hairclip "tóc buộc nửa đầu cài kẹp gỗ"');
    } else if (lowerHair.includes('đuôi sam') || lowerHair.includes('thắt bím')) {
      parts.push('thick traditional single side-swept braid resting over one shoulder "tóc thắt bím đuôi sam truyền thống"');
    } else if (lowerHair.includes('uốn sóng') || lowerHair.includes('minh tinh') || lowerHair.includes('1930')) {
      parts.push('glamorous 1930s Indochine cinema starlet finger-wave curls "tóc uốn sóng minh tinh thập niên 1930"');
    } else if (lowerHair.includes('uốn lọn sóng')) {
      parts.push('effortless soft wavy curls flowing naturally in the breeze "tóc uốn lọn sóng buông lơi phóng khoáng"');
    } else if (lowerHair.includes('xõa dài') || lowerHair.includes('buông lơi')) {
      parts.push('long silky natural dark hair flowing freely in the autumn breeze "tóc xõa dài tự nhiên bay bổng"');
    } else if (lowerHair.includes('búi')) {
      parts.push('graceful sculpted Vietnamese heritage hair bun adorned with artisanal hair ornaments');
    }

    if (parts.length > 0) {
      hairEn = `${parts.join(', ')} (${rawHair})`;
    } else {
      hairEn = `distinctive personalized hairstyle: ${rawHair}`;
    }
  }

  // Xây dựng Makeup tương thích với giới tính, độ phá cách và phong cách
  const creativity = typeof state.creativityLevel === 'number' ? state.creativityLevel : 35;
  const stylesJoined = (state.styles || []).join(' ').toLowerCase();

  let makeupEn = 'luminous natural dewy complexion with soft lotus-petal tinted lips and refined brows';
  if (isMaleOutfit) {
    makeupEn =
      'clean natural masculine grooming, defined scholarly eyebrows, warm healthy skin texture with subtle studio finish';
  } else if (creativity >= 70 || stylesJoined.includes('phá cách')) {
    makeupEn =
      'striking high-fashion editorial makeup with glossy glass-skin highlights, bold graphic eyeliner accent, and modern diffused berry-velvet lips';
  } else if (stylesJoined.includes('vương giả') || stylesJoined.includes('cung đình') || lowerHair.includes('khăn vành')) {
    makeupEn =
      'regal Hue royal court beauty look with porcelain-silk complexion, arched willow-leaf brows, and rich cinnabar-vermilion lips';
  } else if (stylesJoined.includes('dân gian') || stylesJoined.includes('mộc mạc')) {
    makeupEn =
      'fresh sun-kissed natural pastoral glow, sheer rosy cheeks, and warm coral-red lips';
  } else if (lowerHair.includes('1930') || lowerHair.includes('kiểu pháp') || state.garment === 'AO_DAI_LEMUR') {
    makeupEn =
      'classic 1930s Indochine salon beauty with velvety matte skin, slender vintage brows, and deep rose-bordeaux lips';
  }

  return { hairEn, makeupEn };
}

/**
 * Xây dựng mô tả người mẫu (Model Persona) từ toàn bộ thông số userProfile (height, weight, shape, skin, hair)
 */
function buildModelPersona(
  state: CurrentOutfitState,
  userProfile?: { name?: string; height?: string; weight?: string; shape?: string; skin?: string; hair?: string } | null
): string {
  const labelLower = (state.garmentLabel || '').toLowerCase();
  const hairLower = (state.custom_hairstyle || state.hairstyle || '').toLowerCase();
  const isMale =
    labelLower.includes('nam ') ||
    labelLower.includes('tay chẽn') ||
    hairLower.includes('khăn đóng nam');

  const baseSubject = isMale
    ? 'a handsome, poised young Vietnamese gentleman model'
    : 'an elegant, expressive young Vietnamese fashion model';

  if (!userProfile) {
    return `${baseSubject} with graceful posture and authentic East Asian heritage features`;
  }

  const details: string[] = [];

  if (userProfile.height || userProfile.weight) {
    const hw = [userProfile.height, userProfile.weight].filter(Boolean).join(', ');
    details.push(`stature (${hw})`);
  }

  if (userProfile.shape) {
    const s = userProfile.shape.toLowerCase();
    let shapeEn = userProfile.shape;
    if (s.includes('liễu') || s.includes('thon thả')) shapeEn = `slender willow-graceful figure (${userProfile.shape})`;
    else if (s.includes('nhỏ nhắn') || s.includes('thanh mảnh')) shapeEn = `petite delicate frame (${userProfile.shape})`;
    else if (s.includes('cao ráo') || s.includes('vững chãi')) shapeEn = `tall, well-proportioned athletic build (${userProfile.shape})`;
    else if (s.includes('cao thanh thoát')) shapeEn = `tall statuesque editorial proportion (${userProfile.shape})`;
    else if (s.includes('đầy đặn') || s.includes('quý phái') || s.includes('tròn trịa')) shapeEn = `graceful full-figured classic silhouette (${userProfile.shape})`;
    else if (s.includes('mảnh khảnh') || s.includes('high-fashion')) shapeEn = `slender high-fashion runway frame (${userProfile.shape})`;
    else if (s.includes('đồng hồ cát') || s.includes('eo con kiến')) shapeEn = `sculpted hourglass waist silhouette (${userProfile.shape})`;
    else if (s.includes('năng động')) shapeEn = `dynamic modern Gen Z physique (${userProfile.shape})`;
    else shapeEn = `${userProfile.shape} body proportion`;
    details.push(shapeEn);
  }

  if (userProfile.skin) {
    const sk = userProfile.skin.toLowerCase();
    let skinEn = userProfile.skin;
    if (sk.includes('trắng sứ') || sk.includes('trắng ngọc') || sk.includes('trắng sáng')) {
      skinEn = `luminous porcelain-ivory East Asian complexion (${userProfile.skin})`;
    } else if (sk.includes('hồng hào') || sk.includes('sáng hồng')) {
      skinEn = `radiant rosy-fair complexion (${userProfile.skin})`;
    } else if (sk.includes('bánh mật') || sk.includes('nắng đồng') || sk.includes('rám nắng') || sk.includes('phù sa')) {
      skinEn = `warm sun-kissed honey-tan complexion (${userProfile.skin})`;
    } else {
      skinEn = `natural ${userProfile.skin} skin tone`;
    }
    details.push(skinEn);
  }

  if (userProfile.hair) {
    details.push(`natural hair trait: ${userProfile.hair}`);
  }

  if (details.length === 0) {
    return `${baseSubject} with poised posture`;
  }

  return `${baseSubject} featuring ${details.join(', ')}`;
}

/**
 * Xây dựng bối cảnh (Atmosphere & Setting) và Dáng chụp (Pose) tương thích 100% với mọi sự kiện, dịp mặc & độ phá cách
 */
function buildDynamicBackdropAndPose(state: CurrentOutfitState): {
  backdropEn: string;
  poseEn: string;
} {
  const occasion = (state.bestOccasion || '').trim();
  const eventLabel = (state.eventLabel || '').trim();
  const eventCode = (state.event || '').trim().toLowerCase();
  const combined = `${occasion} ${eventLabel} ${eventCode}`.toLowerCase();
  const creativity = typeof state.creativityLevel === 'number' ? state.creativityLevel : 35;

  let backdropCore = '';
  let poseCore = '';

  if (combined.includes('tuần lễ thời trang') || combined.includes('fashion week') || combined.includes('runway')) {
    backdropCore =
      'contemporary Vietnam Heritage Fashion Week runway and architectural gallery space, dramatic spotlight beams intersecting with ancient vermilion lacquer columns';
    poseCore =
      'confident high-fashion runway stride with dynamic fabric motion, chin slightly raised in an editorial power gaze';
  } else if (combined.includes('đêm hoàng cung') || combined.includes('nhã nhạc')) {
    backdropCore =
      'enchanting nocturnal Hue Imperial Citadel courtyard illuminated by warm silk lanterns, shimmering reflection on wet stone tiles, gilded palace eaves in the background';
    poseCore =
      'poised nocturnal royal stance beside a glowing palace lantern, one hand gently resting near the embroidered collar';
  } else if (combined.includes('lễ cưới') || combined.includes('đại hỷ') || combined.includes('song hỷ')) {
    backdropCore =
      'opulent traditional Vietnamese aristocratic wedding hall adorned with crimson silk banners, gilded "Song Hỷ" double-happiness carvings, and warm ceremonial candlelight';
    poseCore =
      'auspicious ceremonial bridal posture with wide sleeves gracefully draped, radiating serene joy and noble dignity';
  } else if (combined.includes('hội lim') || combined.includes('quan họ') || combined.includes('bắc ninh')) {
    backdropCore =
      'festive Lim Festival courtyards in Kinh Bắc with ancient banyan trees, dragon-boat river pavilion, and fluttering five-color festival flags in soft spring sunlight';
    poseCore =
      'graceful Quan Họ folk singer gesture holding the flat Nón Quai Thao hat at a tilt with a welcoming, lyrical smile';
  } else if (combined.includes('lễ hội làng') || combined.includes('đồng quê') || combined.includes('làng nghề')) {
    backdropCore =
      'authentic Northern Vietnamese craft village lane with sun-drenched ancient laterite brick walls, bamboo groves, and golden straw courtyards';
    poseCore =
      'natural pastoral poise walking gently along the village path, holding the conical hat with a warm, unpretentious smile';
  } else if (combined.includes('mùa thu hà nội') || combined.includes('hồ gươm') || combined.includes('tràng tiền')) {
    backdropCore =
      'poetic Hanoi autumn street beside Hoan Kiem Lake, golden filtering sunlight through ancient dracontomelon trees, nostalgic French-Indochine ochre architecture';
    poseCore =
      'effortless muse turning back softly as the autumn breeze lifts the four silk panels in mid-air';
  } else if (combined.includes('chợ nổi') || combined.includes('cái răng') || combined.includes('sông nước')) {
    backdropCore =
      'vibrant Mekong Delta riverfront at sunrise with wooden sampan boats, blooming pink lotus pond, and warm golden alluvial mist';
    poseCore =
      'graceful Southern Vietnamese posture by a wooden sampan boat, fingers lightly touching the checkered Khăn Rằn scarf';
  } else if (combined.includes('vườn trái cây') || combined.includes('cầu khỉ') || combined.includes('dã ngoại')) {
    backdropCore =
      'sunlit lush Mekong Delta tropical orchard with overhanging greenery, rustic bamboo bridge over a tranquil canal, and dappled golden afternoon light';
    poseCore =
      'cheerful, breezy candid pose holding a handwoven sedge basket amidst sunlit orchard foliage';
  } else if (combined.includes('lịch sử') || combined.includes('nam kỳ') || combined.includes('tân châu')) {
    backdropCore =
      'historic Southern Vietnamese heritage mansion with dark polished teakwood pillars, vintage mother-of-pearl inlay furniture, and cinematic nostalgic lighting';
    poseCore =
      'composed vintage portrait stance showcasing the lustrous Lãnh Mỹ A black silk drape and traditional silver buttons';
  } else if (combined.includes('dạ tiệc') || combined.includes('hòa nhạc') || combined.includes('thính phòng') || combined.includes('gala')) {
    backdropCore =
      'grand 1930s Indochine Opera House foyer with marble staircases, crystal chandeliers, velvet draperies, and warm champagne evening glow';
    poseCore =
      'sophisticated 1930s salon gala pose with an elongated silhouette, one hand delicately holding an evening clutch';
  } else if (combined.includes('triển lãm') || combined.includes('mỹ thuật') || combined.includes('nhiếp ảnh')) {
    backdropCore =
      'curated contemporary art gallery & heritage exhibition space with raw Dó-paper installations, minimalist concrete-and-wood interplay, and museum track lighting';
    poseCore =
      'contemplative high-fashion editorial stance in gallery light, allowing the sculptural wide sleeves and silk folds to take center stage';
  } else if (combined.includes('tốt nghiệp') || combined.includes('hội thảo') || eventCode === 'grad') {
    backdropCore =
      'monumental Temple of Literature (Văn Miếu Quốc Tử Giám) scholarly courtyard with ancient stone steles, vermilion pillars, and dignified morning sunlight';
    poseCore =
      'upright scholarly posture radiating intellectual confidence, holding a folding calligraphy fan with composed grace';
  } else if (combined.includes('kỷ yếu') || eventCode === 'yearbook') {
    backdropCore =
      'sunlit Indochine heritage academy corridor with arched colonnades, nostalgic warm film light, and poetic timeless atmosphere';
    poseCore =
      'youthful yet timeless editorial portrait pose, three-quarter angle catching soft rim light along the collar and cheekbones';
  } else if (combined.includes('chùa') || combined.includes('lễ phật') || eventCode === 'temple') {
    backdropCore =
      'serene ancient Vietnamese Buddhist pagoda courtyard with moss-covered stone steps, drifting sandalwood incense mist, and tranquil lotus pond';
    poseCore =
      'serene, mindful posture stepping gently beside ancient pagoda eaves, hands composed in quiet grace';
  } else if (combined.includes('đại lễ') || combined.includes('hoàng triều') || combined.includes('cung đình')) {
    backdropCore =
      'majestic Thái Hòa Palace courtyard in the Hue Imperial Citadel, vermilion-and-gold lacquered columns, stone dragon steps, and ceremonial morning light';
    poseCore =
      'regal aristocratic court posture with symmetrical sleeve drape and noble, composed gaze';
  } else if (combined.includes('tết') || combined.includes('du xuân') || combined.includes('xuân') || eventCode === 'tet') {
    backdropCore =
      'festive Vietnamese Lunar New Year heritage courtyard with blooming pink peach blossoms and golden apricot branches, warm spring sunlight, and red calligraphy scrolls';
    poseCore =
      'graceful spring promenade pose at a 45-degree angle, holding a handcrafted folding fan with radiant festive poise';
  } else {
    backdropCore =
      'architectural Vietnamese heritage courtyard blending antique lacquer wood, artisanal Dó-paper screens, and cinematic golden-hour lighting';
    poseCore =
      'poised high-fashion editorial stance highlighting the authentic drape and collar structure of the garment';
  }

  // Nếu độ phá cách cao (>= 70%), nâng cấp không gian ánh sáng theo hướng Editorial / Neo-Heritage
  if (creativity >= 75 && !combined.includes('fashion week')) {
    backdropCore +=
      ',infused with contemporary neo-heritage art installation elements and dramatic high-fashion editorial rim lighting';
  }

  const labelSuffix = occasion || eventLabel ? ` (Occasion: ${occasion || eventLabel})` : '';
  return {
    backdropEn: `${backdropCore}${labelSuffix}`,
    poseEn: poseCore
  };
}

/**
 * CƠ CHẾ LẮP RÁP PROMPT CHUYÊN SÂU TỔ HỢP ĐẦY ĐỦ 100% INPUT TỪ NGƯỜI DÙNG & AI GEMINI
 * Hỗ trợ:
 * - Tương thích tuyệt đối mọi mã màu Hex + tên màu tiếng Việt
 * - Phản ánh rõ rệt độ phá cách (% Creativity) từ 0% đến 100% ngay trên cấu trúc trang phục & ánh sáng
 * - Chuyển hóa các thẻ phong cách (Style Tags) thành chỉ dẫn thị giác có sức nặng thực sự
 * - Nhận diện đầy đủ mọi kiểu tóc, phụ kiện chọn sẵn, nhãn chi tiết và nội dung người dùng tự gõ
 * - Tích hợp mô tả chi tiết từng phần từ AI Gemini (aiEnrichedComponents) nếu đã qua bước Thẩm định
 */
export function assembleFashionPrompt(
  currentOutfitState: CurrentOutfitState,
  userProfile?: { name?: string; height?: string; weight?: string; shape?: string; skin?: string; hair?: string } | null
): string {
  const state = currentOutfitState || ({} as CurrentOutfitState);
  const aiParts: PromptEnrichmentComponents | null | undefined = state.aiEnrichedComponents;
  const creativityVal = typeof state.creativityLevel === 'number' ? state.creativityLevel : 35;

  // 1. Đặc điểm người mẫu cá nhân hóa (Model Persona)
  const deterministicPersona = buildModelPersona(state, userProfile);
  const modelPersona = aiParts?.model_persona_en?.trim()
    ? `${aiParts.model_persona_en.trim()} (${deterministicPersona})`
    : deterministicPersona;

  // 2. Phom dáng trang phục chuẩn xác + Biến thể + Độ phá cách
  const deterministicGarment = buildGarmentDescription(state);
  const garmentDesc = aiParts?.garment_and_silhouette_en?.trim()
    ? `${aiParts.garment_and_silhouette_en.trim()} — Grounded in ${deterministicGarment}`
    : deterministicGarment;

  // 3. Màu sắc lụa di sản & Hoa văn dệt
  const colorAnalysis = analyzeHexColor(state.color || '#F4C9D6', state.colorName);
  let patternText = 'intricate tone-on-tone jacquard brocade weave with subtle silk threads';
  if (state.pattern?.pattern_name) {
    patternText = `${state.pattern.pattern_name} (${state.pattern.pattern_story || 'woven Vietnamese heritage motifs'})`;
  } else if (state.patternName) {
    patternText = `${state.patternName} traditional artisanal textile weave`;
  }

  const fabricAndColorSection = aiParts?.fabric_and_color_en?.trim()
    ? `${aiParts.fabric_and_color_en.trim()} [Color Code: ${state.color || '#F4C9D6'} - ${colorAnalysis.nameVi} / ${colorAnalysis.nameEn}; Textile: ${patternText}]`
    : `Crafted from ${colorAnalysis.visualDesc} (${colorAnalysis.nameVi} - ${colorAnalysis.nameEn}), enhanced with ${patternText}`;

  // 4. Phụ kiện đi kèm (Kết hợp mã phụ kiện, nhãn chi tiết accessoryLabels và phụ kiện tự nhập custom_accessories)
  const allAccessories: string[] = [];
  const codes = Array.isArray(state.accessories) && state.accessories.length > 0
    ? state.accessories
    : (state.accessory ? [state.accessory] : []);
  const labels = Array.isArray(state.accessoryLabels) ? state.accessoryLabels : [];

  if (codes.length > 0) {
    codes.forEach((accCode, idx) => {
      const matchingLabel = labels[idx] || '';
      allAccessories.push(translateAccessoryItem(accCode, matchingLabel));
    });
  } else if (labels.length > 0) {
    labels.forEach((lbl) => {
      allAccessories.push(translateAccessoryItem(lbl, lbl));
    });
  }

  if (Array.isArray(state.custom_accessories) && state.custom_accessories.length > 0) {
    state.custom_accessories.forEach((customItem) => {
      if (customItem && customItem.trim()) {
        allAccessories.push(translateAccessoryItem(customItem.trim(), customItem.trim()));
      }
    });
  }

  const deterministicAccessories =
    allAccessories.length > 0
      ? allAccessories.join('; ')
      : 'minimalist styling with delicate handcrafted folding paper fan (Quạt Giấy)';

  const accessoriesSection = aiParts?.accessories_styling_en?.trim()
    ? `${aiParts.accessories_styling_en.trim()} (Featuring: ${deterministicAccessories})`
    : `Styled with ${deterministicAccessories}`;

  // 5. Kiểu tóc & Trang điểm (Tương thích 100% kiểu tóc trong Curated, AI gợi ý và người dùng tự nhập)
  const { hairEn, makeupEn } = buildHairAndMakeupDirective(state);
  const hairAndMakeupSection = aiParts?.hair_and_makeup_en?.trim()
    ? `${aiParts.hair_and_makeup_en.trim()} [Hairstyle: ${hairEn}]`
    : `${hairEn}; Makeup: ${makeupEn}`;

  // 6. Phong cách phối (Style Tags) & Độ phá cách (Creativity Weight)
  const styleList =
    Array.isArray(state.styles) && state.styles.length > 0
      ? state.styles
      : state.style_mode
        ? state.style_mode.split(',').map((s) => s.trim()).filter(Boolean)
        : state.style
          ? [state.style]
          : ['Thanh tao cung đình'];

  const { stylesVi, styleVisualImpactEn } = buildStyleTagsDirective(styleList, creativityVal);
  const creativeMoodSection = aiParts?.creative_direction_and_style_en?.trim()
    ? `${aiParts.creative_direction_and_style_en.trim()} — Style Tags: ${stylesVi} (${styleVisualImpactEn})`
    : `Style Tags [${stylesVi}] driving the visual tone: ${styleVisualImpactEn}`;

  // 7. Bối cảnh chụp (Atmosphere & Setting) & Dáng chụp (Pose & Expression)
  const { backdropEn, poseEn } = buildDynamicBackdropAndPose(state);
  const atmosphereSection = aiParts?.backdrop_and_location_en?.trim()
    ? `${aiParts.backdrop_and_location_en.trim()} (${backdropEn})`
    : `Shot in ${backdropEn}`;

  const poseSection = aiParts?.pose_and_expression_en?.trim()
    ? aiParts.pose_and_expression_en.trim()
    : poseEn;

  // GHÉP NỐI MASTER PROMPT CHUẨN MỰC CAO CẤP DÀNH CHO GEMINI / IMAGEN
  const masterPrompt = [
    `Masterpiece high-fashion editorial portrait of ${modelPersona}.`,
    `Wearing ${garmentDesc}.`,
    `Fabric & Color: ${fabricAndColorSection}.`,
    `Styling & Accessories: ${accessoriesSection}.`,
    `Hair & Makeup: ${hairAndMakeupSection}.`,
    `Pose & Expression: ${poseSection}.`,
    `Creative Direction & Style Weight: ${creativeMoodSection}.`,
    `Atmosphere & Setting: ${atmosphereSection}.`,
    `Photography Quality: Shot on Hasselblad H6D-100c medium format camera, 85mm f/1.4 portrait lens, cinematic lighting accentuating the authentic drape, collar geometry, and artisanal weave of Vietnamese heritage attire, ultra-detailed 8k editorial realism.`,
    `Negative constraints: Strictly NO Chinese Hanfu wide waist-belt or crossover Hanfu collar, NO Japanese kimono obi, NO Manchu Qipao/Cheongsam slits, NO distorted fingers, NO extra limbs, NO blurry face, photorealistic.`
  ].join(' ');

  return masterPrompt;
}

