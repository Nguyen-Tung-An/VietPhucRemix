import { CurrentOutfitState } from '../types/index.ts';

/**
 * Hàm phân tích mã màu Hex bất kỳ thành mô tả lụa di sản giàu hình tượng
 */
function analyzeHexColor(hexCode: string, fallbackName?: string): { nameVi: string; nameEn: string; visualDesc: string } {
  const cleanHex = (hexCode || '#F4C9D6').replace('#', '').trim();
  if (cleanHex.length !== 6) {
    return {
      nameVi: fallbackName || 'Sắc Lụa Di Sản',
      nameEn: 'authentic Vietnamese silk hue',
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
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  const deg = Math.round(h * 360);
  const satPct = Math.round(s * 100);
  const lumPct = Math.round(l * 100);

  // Mộc mạc / Đơn sắc (Trắng, Đen, Xám)
  if (satPct < 14) {
    if (lumPct > 80) {
      return {
        nameVi: 'Bạch Lụa Sương Mai / Trắng Bưởi',
        nameEn: 'Mist White Mulberry Silk',
        visualDesc: `pristine ivory raw silk (#${cleanHex}) with natural translucent weave and soft pearl sheen`
      };
    }
    if (lumPct < 22) {
      return {
        nameVi: 'Hắc Xà / Đen Mun Sơn Mài',
        nameEn: 'Obsidian Lacquer Black Silk',
        visualDesc: `deep lustrous lacquer-black mulberry silk (#${cleanHex}) with subtle charcoal undertones`
      };
    }
    return {
      nameVi: 'Ngọc Sương Tro Cổ',
      nameEn: 'Ash Celadon Silk',
      visualDesc: `subdued vintage mist-grey silk (#${cleanHex}) with muted poetic texture`
    };
  }

  // Phân vùng theo vòng cung màu
  if (deg >= 335 || deg < 18) {
    if (lumPct > 65) {
      return {
        nameVi: 'Hồng Phấn Sen Cung Đình',
        nameEn: 'Lotus Blossom Pink Silk',
        visualDesc: `delicate pastel lotus petal pink silk (#${cleanHex}) with tender romantic radiance`
      };
    }
    return {
      nameVi: 'Đỏ Son Đại Triều / Huyết Dụ',
      nameEn: 'Imperial Vermilion Crimson Silk',
      visualDesc: `luxurious imperial cinnabar red silk (#${cleanHex}) with rich ruby warmth and majestic sheen`
    };
  }

  if (deg >= 18 && deg < 48) {
    if (lumPct < 40) {
      return {
        nameVi: 'Nâu Cánh Gián Sơn Mài',
        nameEn: 'Amber Lacquer Brown Silk',
        visualDesc: `traditional Vietnamese lacquer brown silk (#${cleanHex}) with deep warm caramel undertones`
      };
    }
    return {
      nameVi: 'Cam Đào Phù Sa',
      nameEn: 'Warm Terracotta Peach Silk',
      visualDesc: `warm peach terracotta silk (#${cleanHex}) reminiscent of alluvial river dusk`
    };
  }

  if (deg >= 48 && deg < 75) {
    return {
      nameVi: 'Hoàng Cúc / Vàng Đất Cố Đô',
      nameEn: 'Imperial Golden Chrysanthemum Silk',
      visualDesc: `warm earthen gold silk (#${cleanHex}) inspired by royal chrysanthemum and ancient temple glaze`
    };
  }

  if (deg >= 75 && deg < 170) {
    if (lumPct < 32) {
      return {
        nameVi: 'Xanh Rêu Đêm Cổ Tự',
        nameEn: 'Ancient Night Moss Green Silk',
        visualDesc: `deep antique forest moss green silk (#${cleanHex}) with solemn heritage depth`
      };
    }
    return {
      nameVi: 'Xanh Ngọc Bích / Lục Thủy',
      nameEn: 'Emerald Jade Silk',
      visualDesc: `vibrant jade green mulberry silk (#${cleanHex}) with luminous river-water reflection`
    };
  }

  if (deg >= 170 && deg < 260) {
    if (lumPct < 35) {
      return {
        nameVi: 'Xanh Chàm Đêm Sông Hương',
        nameEn: 'Deep Indigo Navy Silk',
        visualDesc: `deep Vietnamese indigo navy silk (#${cleanHex}) with midnight blue velvet highlights`
      };
    }
    return {
      nameVi: 'Xanh Thanh Lam Khang Trang',
      nameEn: 'Cerulean Sky Blue Silk',
      visualDesc: `airy sky-blue silk (#${cleanHex}) reflecting morning river mist and peaceful skies`
    };
  }

  // Tím Huế / Tử Sa (deg >= 260 && deg < 335)
  return {
    nameVi: 'Tím Xứ Huế Mộng Mơ',
    nameEn: 'Imperial Hue Violet Silk',
    visualDesc: `poetic royal Hue violet silk (#${cleanHex}) imbued with nostalgic twilight elegance`
  };
}

/**
 * CƠ CHẾ LẮP RÁP PROMPT CHUYÊN SÂU TỔ HỢP ĐẦY ĐỦ CHO TẤT CẢ TRANG PHỤC & TÙY CHỌN
 * Hỗ trợ sao chép thủ công để tạo sinh hình ảnh trong Gemini AI
 */
export function assembleFashionPrompt(
  currentOutfitState: CurrentOutfitState,
  userProfile?: { name?: string; height?: string; weight?: string; shape?: string; skin?: string; hair?: string } | null
): string {
  const state = currentOutfitState || {};

  // 1. Phom dáng trang phục chuẩn xác (Chỉ 6 loại áo giữ lại theo yêu cầu downscale)
  let garmentDesc = '';
  switch (state.garment) {
    case 'AO_TAC':
      garmentDesc =
        'authentic Vietnamese ceremonial Áo Tấc (Nguyen dynasty aristocratic grand ceremony silk robe with expansive flowing wide sleeves "tay thụng", formal high Lap Linh standing collar, five right-flap royal closure buttons, worn over long ivory silk trousers)';
      break;
    case 'AO_NHAT_BINH':
      garmentDesc =
        'authentic royal Vietnamese Áo Nhật Bình court robe (magnificent Nguyen dynasty noblewoman court attire with iconic rectangular Doi Kham front collar bands richly embroidered with gold celestial clouds and phoenix motifs, decorative concentric five-color "ngũ sắc" silk ribbons on sleeves, over an inner silk robe)';
      break;
    case 'AO_TU_THAN':
      garmentDesc =
        'authentic Vietnamese folk Áo Tứ Thân (iconic Northern Kinh Bắc four-panel silk dress with 4 gracefully draped panels, front two panels casually tied into an elegant knot at the waist, worn over a vibrant scarlet silk Yếm halter top and flowing silk sash)';
      break;
    case 'AO_BA_BA':
      garmentDesc =
        'authentic southern Vietnamese Áo Bà Ba (iconic Mekong Delta flowing mulberry silk tunic featuring a graceful open round neckline, classic center button placket with hand-sewn buttons, tailored split hem over loose-fitting ivory silk trousers)';
      break;
    case 'AO_DAI_LEMUR':
      garmentDesc =
        'authentic vintage 1930s Vietnamese Áo Dài Lemur (classic Cát Tường modernism silhouette with slender tailored waistline, graceful high collar, puffed shoulders, dual floor-length flowing silk panels draping seamlessly over white silk trousers)';
      break;
    case 'AO_NGU_THAN':
    default:
      garmentDesc =
        'authentic Vietnamese Áo Ngũ Thân Lập Lĩnh (traditional aristocratic five-panel robe with tailored Lap Linh standing mandarin collar, five symbolic royal buttons along right curved flap representing the Five Virtues Nhân-Lễ-Nghĩa-Trí-Tín, straight dignified drape)';
      break;
  }

  // 2. Màu sắc lụa di sản (Hỗ trợ Color Picker bất kỳ + Bảng màu gợi ý)
  const colorAnalysis = analyzeHexColor(state.color || '#F4C9D6', state.colorName);

  // 3. Phong cách phối & Độ phá cách của ý tưởng (Snap: 0, 25, 50, 75, 100)
  const styleList = Array.isArray(state.styles) && state.styles.length > 0
    ? state.styles
    : (state.style ? [state.style] : ['Thanh tao cung đình']);
  
  const stylesFormatted = styleList.join(', ');

  const creativityVal = typeof state.creativityLevel === 'number' ? state.creativityLevel : 50;
  let creativityDirective = '';
  if (creativityVal <= 10) {
    creativityDirective = '100% historically strict museum restoration authenticity, strictly traditional heritage tailoring, archival museum exhibition lighting';
  } else if (creativityVal <= 35) {
    creativityDirective = 'predominantly traditional classical heritage with subtle modern Vietnamese editorial sensitivity';
  } else if (creativityVal <= 65) {
    creativityDirective = 'harmonious contemporary remix: honoring historical Vietnamese silhouette balance with vibrant Gen Z youth confidence';
  } else if (creativityVal <= 85) {
    creativityDirective = 'bold contemporary fashion-forward reinterpretation, high-fashion editorial runway look with striking traditional roots';
  } else {
    creativityDirective = 'avant-garde Gen Z haute couture fashion remix, dramatic lighting, futuristic cultural revival aesthetic';
  }

  // 4. Phụ kiện đi kèm (Bao gồm nhiều phụ kiện + Phụ kiện tự nhập)
  const allAccessories: string[] = [];
  if (Array.isArray(state.accessories) && state.accessories.length > 0) {
    state.accessories.forEach((acc) => {
      if (acc === 'QUAT_GIAY') allAccessories.push('handcrafted folding calligraphy paper fan (Quạt Giấy)');
      else if (acc === 'KHAN_RAN') allAccessories.push('authentic Mekong Delta black-and-white checkered scarf (Khăn Rằn)');
      else if (acc === 'NON_QUAI_THAO') allAccessories.push('flat Northern Vietnamese palm-leaf hat with silk ribbons (Nón Quai Thao)');
      else if (acc === 'NON_LA') allAccessories.push('conical palm leaf hat (Nón Lá)');
      else if (acc === 'TRAM_GOM' || acc === 'TRAM_BAC') allAccessories.push('handcrafted ceramic or silver lotus hairpin (Trâm Cài)');
      else if (acc === 'TUI_GAM') allAccessories.push('silk brocade embroidered purse (Túi Gấm)');
      else if (acc === 'CHUOI_NGOC') allAccessories.push('vintage layered pearl necklace');
      else allAccessories.push(acc);
    });
  } else if (state.accessory) {
    if (state.accessory === 'KHAN_RAN') allAccessories.push('authentic checkered Mekong Delta scarf (Khăn Rằn)');
    else if (state.accessory === 'NON_QUAI_THAO') allAccessories.push('flat Northern Vietnamese palm-leaf hat (Nón Quai Thao)');
    else allAccessories.push('handcrafted calligraphy folding paper fan (Quạt Giấy)');
  }

  if (Array.isArray(state.custom_accessories) && state.custom_accessories.length > 0) {
    state.custom_accessories.forEach((c) => {
      if (c.trim()) allAccessories.push(`custom accent item: ${c.trim()}`);
    });
  }

  const accessoriesString = allAccessories.length > 0
    ? allAccessories.join(', ')
    : 'minimalist styling with delicate handcrafted folding paper fan';

  // 5. Kiểu tóc đề xuất & tự nhập
  let hairDirective = 'traditional neat hair bun adorned with a refined lotus hairpin';
  if (state.custom_hairstyle) {
    hairDirective = `personalized hairstyle: ${state.custom_hairstyle}`;
  } else if (state.hairstyle) {
    if (state.hairstyle === 'VAN_KHAN' || state.hairstyle === 'VAN_KHAN_VANH') {
      hairDirective = 'regal wrapped silk turban (Khăn Đóng / Khăn Vành) framing an elegant face';
    } else if (state.hairstyle === 'XOA_DAI') {
      hairDirective = 'silky straight natural dark hair flowing gently down the shoulders';
    } else if (state.hairstyle === 'TET_BIEM') {
      hairDirective = 'delicate side-swept braided hair with silk ribbon ties';
    } else if (state.hairstyle === 'UON_SONG') {
      hairDirective = 'vintage 1930s finger wave hairstyle framing the temple';
    }
  }

  // 6. Đặc điểm người mẫu cá nhân hóa (Personal Profile)
  let modelPersona = 'an elegant Vietnamese fashion model with expressive eyes and graceful poised posture';
  if (userProfile) {
    const traits: string[] = [];
    if (userProfile.skin) traits.push(`${userProfile.skin} skin tone`);
    if (userProfile.shape) traits.push(`${userProfile.shape} silhouette`);
    if (userProfile.hair) traits.push(`${userProfile.hair} hair`);
    if (traits.length > 0) {
      modelPersona = `an elegant Vietnamese model with ${traits.join(', ')}, radiating natural charm`;
    }
  }

  // 7. Bối cảnh & Không gian nghệ thuật
  const occasion = state.bestOccasion || state.eventLabel || 'Vietnamese Heritage Editorial';
  let backdrop = 'ambient traditional Vietnamese architectural courtyard with soft cinematic morning light, antique lacquer and weathered wooden textures';
  if (occasion.includes('Tết') || occasion.includes('Xuân')) {
    backdrop = 'delicate Hanoi Old Quarter spring atmosphere, soft peach blossom tones, sunlit ancient textured colonial brick wall';
  } else if (occasion.includes('Chùa') || occasion.includes('Lễ')) {
    backdrop = 'serene Buddhist heritage pavilion, soft incense haze, warm lantern glow and carved stone balustrades';
  } else if (occasion.includes('Sông Nước') || occasion.includes('Bà Ba')) {
    backdrop = 'picturesque Mekong Delta water canal with floating lotus blossoms, warm tropical golden hour lighting';
  } else if (occasion.includes('Cung Đình') || occasion.includes('Đại Lễ')) {
    backdrop = 'monumental Hue Imperial Citadel palace hall with gilded vermilion wooden columns and polished stone flooring';
  }

  // 8. Hoa văn chi tiết (nếu có)
  let patternText = 'intricate tone-on-tone jacquard brocade weave with subtle golden silk threads';
  if (state.pattern?.pattern_name) {
    patternText = `${state.pattern.pattern_name}: ${state.pattern.pattern_story || 'woven imperial motifs'}`;
  }

  // GHÉP NỐI PROMPT CHUẨN MỰC CAO CẤP DÀNH CHO GEMINI / IMAGEN
  const masterPrompt = [
    `Masterpiece high-fashion editorial portrait of ${modelPersona}.`,
    `Wearing ${garmentDesc}.`,
    `Fabric & Color: Crafted from ${colorAnalysis.visualDesc} (${colorAnalysis.nameVi} - ${colorAnalysis.nameEn}), enhanced with ${patternText}.`,
    `Styling & Accessories: Styled with ${accessoriesString}.`,
    `Hair & Makeup: ${hairDirective}, luminous natural dewy makeup with soft petal-tinted lips.`,
    `Creative Mood: Aesthetic blend of ${stylesFormatted} (${creativityDirective}).`,
    `Atmosphere & Setting: Shot in ${backdrop}.`,
    `Photography Quality: Shot on Hasselblad medium format camera, 85mm f/1.4 portrait lens, soft rim lighting accentuating the silky drape of Vietnamese heritage garments, exquisite textile texture and embroidery detail.`,
    `Negative constraints: Strictly NO Hanfu, NO Japanese kimono obi, NO Chinese Qipao, NO distorted fingers, NO extra limbs, NO blurry face, photorealistic.`
  ].join(' ');

  return masterPrompt;
}
