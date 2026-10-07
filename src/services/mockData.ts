import { CulturalGuardrailResult, PatternItem } from '../types/index.ts';
import { HERITAGE_GROUND_TRUTH } from '../data/heritageGroundTruth.ts';

/**
 * MOCK DATA PROVIDER - BẢO VỆ QUOTA GOOGLE API
 * Cung cấp dữ liệu thẩm định di sản, hoa văn và lookbook nghệ thuật tức thì.
 */

export function getMockCulturalAI(context: {
  event: string;
  primary_color: string;
  garment_type: string;
  accessory: string;
  region?: string;
}): CulturalGuardrailResult {
  const { event, garment_type, accessory, primary_color } = context;
  const garmentKey = (garment_type || 'AO_NGU_THAN').toUpperCase();
  const record = HERITAGE_GROUND_TRUTH[garmentKey] || HERITAGE_GROUND_TRUTH.AO_NGU_THAN;

  // 1. Kiểm tra lệch quy chuẩn văn hóa
  if (garment_type === 'AO_BA_BA' && accessory === 'NON_QUAI_THAO') {
    return {
      is_culturally_accurate: false,
      warning_level: 'WARNING',
      cultural_warning_msg:
        'Nón quai thao là nét văn hóa đặc trưng Bắc Bộ (quan họ Kinh Bắc), không nên đi cùng áo bà ba mộc mạc Nam Bộ.',
      suggested_fix: 'KHAN_RAN',
      kieu_toc_va_trang_diem:
        'Tóc xõa dài tự nhiên hoặc thắt bím đuôi sam buông lơi một bên vai; trang điểm tự nhiên như phù sa sông nước, môi son cánh sen phớt hồng.',
      dang_chup_anh:
        'Đứng nghiêng bên mạn xuồng hoặc tựa nhẹ vào hàng rào tre, hai tay khẽ giữ chéo vạt khăn rằn buông trước ngực, nụ cười tươi tắn hiền hòa.',
      cau_chuyen_di_san:
        'Áo bà ba gắn liền với văn hóa sông nước Cửu Long hào sảng và đôn hậu. Kết hợp cùng chiếc khăn rằn mộc mạc sẽ tôn vinh trọn vẹn vẻ đẹp thuần Việt của người phương Nam.',
      citations: record.citations,
      set_name: record.name,
      audit_passed: false
    };
  }

  if (garment_type === 'AO_NGU_THAN' && accessory === 'KHAN_RAN') {
    return {
      is_culturally_accurate: false,
      warning_level: 'WARNING',
      cultural_warning_msg:
        'Khăn rằn gắn liền với nếp sống lao động Nam Bộ, trong khi Áo ngũ thân lập lĩnh là lễ phục cung đình và quý tộc đĩnh đạc.',
      suggested_fix: 'QUAT_GIAY',
      kieu_toc_va_trang_diem:
        'Tóc búi cao thanh nhã cài trâm đồng mai điểu hoặc vấn khăn đóng trang trọng; trang điểm tông đỏ trầm quý phái, chân mày lá liễu mềm mại.',
      dang_chup_anh:
        'Đứng thẳng đoan trang, một tay khẽ che quạt giấy thư pháp ngang ngực, tay kia buông tà năm thân ngay ngắn, mắt nhìn thẳng tự tin.',
      cau_chuyen_di_san:
        'Áo ngũ thân lập lĩnh là đỉnh cao của nếp mặc Việt Y triều Nguyễn, với 5 cúc vàng tượng trưng cho ngũ thường: Nhân - Lễ - Nghĩa - Trí - Tín.',
      citations: record.citations,
      set_name: record.name,
      audit_passed: false
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
    citations: record.citations,
    set_name: record.name,
    audit_passed: true
  };
}

export function getMockPattern(keyword: string, overlay_mode: string): PatternItem {
  const isEmblem = overlay_mode === 'CENTRAL_EMBLEM';
  const cleanKw = (keyword || 'hoa sen').toLowerCase();

  let name = 'Gấm Mây Thủy Ba Cổ Truyền';
  let pathData = 'M 10,30 Q 25,12 40,28 T 60,30 M 5,45 Q 25,25 45,45';
  let color = '#C9A66B';
  let story = `Họa tiết sóng cuộn và mây vờn Nguyễn khởi sắc từ cảm hứng "${keyword}", tượng trưng cho khát vọng trường tồn và uyển chuyển.`;

  if (cleanKw.includes('sen') || cleanKw.includes('hoa') || cleanKw.includes('hồ')) {
    name = isEmblem ? 'Kim Liên Ngự Đạo' : 'Gấm Dệt Liên Hoa';
    pathData = isEmblem
      ? 'M 0,-22 C 12,-16 16,0 0,22 C -16,0 -12,-16 0,-22 Z M -14,2 C -6,-8 0,8 0,18 C 0,8 6,-8 14,2'
      : 'M 15,10 Q 30,25 45,10 Q 30,45 15,10 Z M 30,25 Q 30,50 30,50';
    color = '#F4C9D6';
    story = `Cảm hứng đóa sen thuần khiết từ "${keyword}", biểu trưng cho cốt cách thanh cao giữa đời thường.`;
  } else if (cleanKw.includes('mưa') || cleanKw.includes('huế') || cleanKw.includes('sông') || cleanKw.includes('nước')) {
    name = isEmblem ? 'Thủy Ba Long Vân' : 'Gấm Mây Mưa Xứ Huế';
    pathData = isEmblem
      ? 'M -20,10 Q -10,-15 0,10 Q 10,-15 20,10 Q 0,25 -20,10 Z'
      : 'M 5,20 Q 20,5 35,20 T 65,20 M 5,40 Q 20,25 35,40 T 65,40';
    color = '#4A8577';
    story = `Nét lượn sóng nước Thủy Ba êm đềm khởi nguồn từ "${keyword}", mang nỗi niềm hoài cổ cố đô.`;
  } else if (cleanKw.includes('gốm') || cleanKw.includes('chu đậu') || cleanKw.includes('vàng') || cleanKw.includes('cúc')) {
    name = isEmblem ? 'Bạch Cúc Chu Đậu' : 'Gấm Hoàng Cúc Dát Vàng';
    pathData = isEmblem
      ? 'M 0,-24 C 16,-24 24,-16 24,0 C 24,16 16,24 0,24 C -16,24 -24,16 -24,0 C -24,-16 -16,-24 0,-24 Z M -16,0 L 16,0 M 0,-16 L 0,16'
      : 'M 10,10 L 50,50 M 50,10 L 10,50 M 30,5 L 30,55 M 5,30 L 55,30';
    color = '#C9A66B';
    story = `Men lam và nét vẽ cúc đại đóa gốm Chu Đậu từ "${keyword}", tôn vinh tài hoa mỹ nghệ ngàn năm.`;
  }

  return {
    pattern_name: name,
    pattern_type: (overlay_mode as 'SEAMLESS_JACQUARD' | 'CENTRAL_EMBLEM') || 'SEAMLESS_JACQUARD',
    svg_path_data: pathData,
    pattern_color: color,
    pattern_story: story
  };
}

export function getMockFashionLookbook(promptText: string): string {
  const prompt = promptText || '';
  const isAoBaBa = prompt.includes('Ao Ba Ba');

  let color = '#F4C9D6';
  let colorName = 'Hồng Phấn Sen';
  if (prompt.includes('Xanh Ngọc Đậm') || prompt.includes('#4A8577')) {
    color = '#4A8577';
    colorName = 'Xanh Ngọc Đậm';
  } else if (prompt.includes('Vàng Đất') || prompt.includes('#C9A66B')) {
    color = '#C9A66B';
    colorName = 'Vàng Đất';
  } else if (prompt.includes('Rêu Đêm') || prompt.includes('#1C2B26')) {
    color = '#1C2B26';
    colorName = 'Rêu Đêm';
  } else if (prompt.includes('Ngọc Sương') || prompt.includes('#E8F3EE')) {
    color = '#E8F3EE';
    colorName = 'Ngọc Sương';
  }

  const isScarf = prompt.includes('Khăn Rằn') || prompt.includes('scarf');
  const isConicalHat = prompt.includes('Nón Quai Thao') || prompt.includes('conical hat');

  const svg = `<svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1C2B26"/>
        <stop offset="60%" stop-color="#16221E"/>
        <stop offset="100%" stop-color="#0D1714"/>
      </linearGradient>
      <radialGradient id="rimGlow" cx="50%" cy="38%" r="45%">
        <stop offset="0%" stop-color="#C9A66B" stop-opacity="0.32"/>
        <stop offset="55%" stop-color="#4A8577" stop-opacity="0.14"/>
        <stop offset="100%" stop-color="#0D1714" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="silkSheen" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.95"/>
        <stop offset="45%" stop-color="#FFFFFF" stop-opacity="0.25"/>
        <stop offset="55%" stop-color="${color}" stop-opacity="1"/>
        <stop offset="100%" stop-color="#1C2B26" stop-opacity="0.4"/>
      </linearGradient>
    </defs>

    <rect width="600" height="800" fill="url(#bgGrad)"/>
    <circle cx="300" cy="330" r="260" fill="url(#rimGlow)"/>
    <rect width="600" height="800" fill="none" stroke="rgba(201,166,107,0.35)" stroke-width="1.5" rx="8"/>
    <rect x="18" y="18" width="564" height="764" fill="none" stroke="rgba(201,166,107,0.5)" stroke-width="1.2" stroke-dasharray="10,6" rx="6"/>

    <g opacity="0.25" stroke="#C9A66B" stroke-width="1.5" fill="none">
      <path d="M 60,120 Q 90,90 120,110 T 170,115"/>
      <path d="M 430,120 Q 480,95 520,115 T 560,110"/>
      <path d="M 50,680 Q 90,650 140,670 T 200,675"/>
      <path d="M 400,690 Q 450,660 500,680 T 550,680"/>
    </g>

    <g transform="translate(300, 390)">
      <ellipse cx="0" cy="310" rx="140" ry="25" fill="rgba(13,23,20,0.6)" filter="blur(8px)"/>
      <path d="M -50,110 L -65,300 L -10,305 L -5,120 Z" fill="#E8F3EE" stroke="#4A8577" stroke-width="1.5"/>
      <path d="M 50,110 L 65,300 L 10,305 L 5,120 Z" fill="#FAF7F0" stroke="#4A8577" stroke-width="1.5"/>
      <ellipse cx="-38" cy="308" rx="16" ry="6" fill="#1C2B26"/>
      <ellipse cx="38" cy="308" rx="16" ry="6" fill="#1C2B26"/>

      ${
        isAoBaBa
          ? `
        <path d="M -60,-130 Q 0,-105 60,-130 L 85,-40 L 95,145 L -95,145 L -85,-40 Z" fill="${color}" stroke="#1C2B26" stroke-width="2"/>
        <path d="M -60,-130 Q 0,-105 60,-130 L 85,-40 L 95,145 L -95,145 L -85,-40 Z" fill="url(#silkSheen)" style="mix-blend-mode: overlay;"/>
        <path d="M -60,-125 L -120,-70 L -115,70 L -80,65 L -80,-40 Z" fill="${color}" stroke="#1C2B26" stroke-width="1.6"/>
        <path d="M 60,-125 L 120,-70 L 115,70 L 80,65 L 80,-40 Z" fill="${color}" stroke="#1C2B26" stroke-width="1.6"/>
        <line x1="0" y1="-110" x2="0" y2="140" stroke="#1C2B26" stroke-width="2"/>
        <circle cx="0" cy="-80" r="3.5" fill="#C9A66B" stroke="#7A5338" stroke-width="1"/>
        <circle cx="0" cy="-45" r="3.5" fill="#C9A66B" stroke="#7A5338" stroke-width="1"/>
        <circle cx="0" cy="-10" r="3.5" fill="#C9A66B" stroke="#7A5338" stroke-width="1"/>
        <circle cx="0" cy="25" r="3.5" fill="#C9A66B" stroke="#7A5338" stroke-width="1"/>
        <circle cx="0" cy="60" r="3.5" fill="#C9A66B" stroke="#7A5338" stroke-width="1"/>
        <rect x="-65" y="65" width="30" height="34" rx="4" fill="${color}" stroke="#1C2B26" stroke-width="1.4" filter="brightness(0.92)"/>
        <rect x="35" y="65" width="30" height="34" rx="4" fill="${color}" stroke="#1C2B26" stroke-width="1.4" filter="brightness(0.92)"/>
      `
          : `
        <path d="M -55,-135 Q 0,-125 55,-135 L 75,-30 L 92,175 L -92,175 L -75,-30 Z" fill="${color}" stroke="#1C2B26" stroke-width="2"/>
        <path d="M -55,-135 Q 0,-125 55,-135 L 75,-30 L 92,175 L -92,175 L -75,-30 Z" fill="url(#silkSheen)" style="mix-blend-mode: overlay;"/>
        <path d="M -55,-130 L -115,-70 L -110,65 L -75,60 L -75,-30 Z" fill="${color}" stroke="#1C2B26" stroke-width="1.6"/>
        <path d="M 55,-130 L 115,-70 L 110,65 L 75,60 L 75,-30 Z" fill="${color}" stroke="#1C2B26" stroke-width="1.6"/>
        <rect x="-22" y="-162" width="44" height="28" rx="4" fill="${color}" stroke="#1C2B26" stroke-width="2"/>
        <rect x="-18" y="-160" width="36" height="6" fill="#FAF7F0"/>
        <path d="M 0,-134 Q 28,-105 34,-65 L 34,95" fill="none" stroke="#1C2B26" stroke-width="2.2"/>
        <circle cx="0" cy="-136" r="4" fill="#C9A66B" stroke="#7A5338" stroke-width="1.2"/>
        <circle cx="18" cy="-115" r="4" fill="#C9A66B" stroke="#7A5338" stroke-width="1.2"/>
        <circle cx="30" cy="-85" r="4" fill="#C9A66B" stroke="#7A5338" stroke-width="1.2"/>
        <circle cx="34" cy="-35" r="4" fill="#C9A66B" stroke="#7A5338" stroke-width="1.2"/>
        <circle cx="34" cy="20" r="4" fill="#C9A66B" stroke="#7A5338" stroke-width="1.2"/>
      `
      }

      <path d="M -18,-150 L -18,-200 Q 0,-190 18,-200 L 18,-150 Z" fill="#F7DCBF" stroke="#4A8577" stroke-width="1.5"/>
      <ellipse cx="0" cy="-210" rx="34" ry="42" fill="#F7DCBF" stroke="#4A8577" stroke-width="1.8"/>
      <path d="M -34,-210 C -34,-255 34,-255 34,-210 C 34,-235 -34,-235 -34,-210 Z" fill="#1C2B26"/>
      <circle cx="0" cy="-255" r="18" fill="#1C2B26" stroke="#4A8577" stroke-width="1"/>
      <path d="M -14,-252 Q 0,-264 14,-252" stroke="#C9A66B" stroke-width="2.5" fill="none"/>
      <line x1="-16" y1="-214" x2="-6" y2="-214" stroke="#2B2B28" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="6" y1="-214" x2="16" y2="-214" stroke="#2B2B28" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M 0,-208 L -2,-198 L 3,-198" stroke="#7A5338" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M -6,-188 Q 0,-184 6,-188" stroke="#F4C9D6" stroke-width="2.4" fill="none" stroke-linecap="round"/>

      ${
        isScarf
          ? `
        <path d="M -22,-140 Q 0,-120 22,-140" stroke="#FAF7F0" stroke-width="14" fill="none" stroke-linecap="round"/>
        <path d="M -22,-138 L -30,65 L -12,65 L -5,-130 Z" fill="#FAF7F0" stroke="#1C2B26" stroke-width="1.5"/>
        <path d="M 22,-138 L 30,75 L 12,75 L 5,-130 Z" fill="#FAF7F0" stroke="#1C2B26" stroke-width="1.5"/>
        <line x1="-28" y1="-90" x2="-14" y2="-90" stroke="#1C2B26" stroke-width="2.5"/>
        <line x1="-28" y1="-50" x2="-14" y2="-50" stroke="#1C2B26" stroke-width="2.5"/>
        <line x1="-28" y1="-10" x2="-14" y2="-10" stroke="#1C2B26" stroke-width="2.5"/>
        <line x1="-28" y1="30" x2="-14" y2="30" stroke="#1C2B26" stroke-width="2.5"/>
        <line x1="14" y1="-90" x2="28" y2="-90" stroke="#1C2B26" stroke-width="2.5"/>
        <line x1="14" y1="-50" x2="28" y2="-50" stroke="#1C2B26" stroke-width="2.5"/>
        <line x1="14" y1="-10" x2="28" y2="-10" stroke="#1C2B26" stroke-width="2.5"/>
        <line x1="14" y1="30" x2="28" y2="30" stroke="#1C2B26" stroke-width="2.5"/>
      `
          : isConicalHat
          ? `
        <g transform="translate(-85, -20) rotate(-15) scale(0.95)">
          <ellipse cx="0" cy="0" rx="65" ry="58" fill="#E8DEC8" stroke="#9E876A" stroke-width="2.5"/>
          <ellipse cx="0" cy="0" rx="54" ry="48" fill="#EFE8D8" stroke="#C2B295" stroke-width="1.2"/>
          <circle cx="0" cy="0" r="16" fill="#D5C5A5" stroke="#9E876A" stroke-width="1.8"/>
          <path d="M -30,30 Q -45,120 -18,180" stroke="#4A8577" stroke-width="3" fill="none" stroke-linecap="round"/>
          <path d="M 30,30 Q 45,120 18,180" stroke="#4A8577" stroke-width="3" fill="none" stroke-linecap="round"/>
        </g>
      `
          : `
        <g transform="translate(100, 50) rotate(-25) scale(0.95)">
          <ellipse cx="0" cy="20" rx="8" ry="6" fill="#F7DCBF"/>
          <line x1="0" y1="20" x2="-45" y2="-55" stroke="#4A8577" stroke-width="3"/>
          <line x1="0" y1="20" x2="-18" y2="-65" stroke="#4A8577" stroke-width="2"/>
          <line x1="0" y1="20" x2="18" y2="-65" stroke="#4A8577" stroke-width="2"/>
          <line x1="0" y1="20" x2="45" y2="-55" stroke="#4A8577" stroke-width="3"/>
          <path d="M -50,-45 Q 0,-80 50,-45 L 30,-20 Q 0,-40 -30,-20 Z" fill="#FAF7F0" stroke="#CFC8B8" stroke-width="1.8"/>
          <path d="M -20,-50 Q 0,-62 20,-48" stroke="#F4C9D6" stroke-width="2.5" fill="none"/>
          <circle cx="0" cy="20" r="4.5" fill="#C9A66B" stroke="#7A5338" stroke-width="1.2"/>
          <path d="M 0,24 Q -5,48 2,70" stroke="#F4C9D6" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        </g>
      `
      }
    </g>

    <g transform="translate(40, 56)">
      <text x="0" y="0" font-family="'Playfair Display', Georgia, serif" font-size="12" font-weight="600" fill="#C9A66B" letter-spacing="4">VIỆT Y DI SẢN • EDITORIAL LOOKBOOK</text>
      <text x="0" y="24" font-family="'Playfair Display', Georgia, serif" font-size="22" font-weight="600" fill="#FAF7F0" letter-spacing="2">${
        isAoBaBa ? 'Áo Bà Ba Nam Bộ' : 'Áo Ngũ Thân Lập Lĩnh'
      }</text>
      <text x="0" y="44" font-family="'Be Vietnam Pro', sans-serif" font-size="11" font-weight="500" fill="rgba(244,201,214,0.85)" letter-spacing="1.5">SẮC LỤA ${colorName.toUpperCase()} • TỎA SÁNG GEN Z</text>
    </g>

    <g transform="translate(520, 720)">
      <rect x="-24" y="-24" width="48" height="48" rx="10" fill="#4A8577" stroke="#C9A66B" stroke-width="2"/>
      <circle cx="0" cy="0" r="19" fill="none" stroke="#C9A66B" stroke-width="1" stroke-dasharray="3,2"/>
      <text x="0" y="8" font-family="'Playfair Display', serif" font-size="20" font-weight="600" fill="#FAF7F0" text-anchor="middle">印</text>
    </g>

    <g transform="translate(40, 755)">
      <text x="0" y="0" font-family="'Be Vietnam Pro', sans-serif" font-size="10" fill="rgba(201,166,107,0.85)" letter-spacing="2">AUTHENTIC VIETNAMESE HERITAGE FASHION • LỤA THANH EDITION</text>
    </g>
  </svg>`;

  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}
