import { CulturalGuardrailResult, PatternItem, CitationSource } from '../types/index.ts';
import {
  CULTURAL_DATABASE,
  getCulturalTruth,
  checkStrictTaboo
} from '../data/culturalTruths.ts';

/**
 * MOCK DATA PROVIDER - BẢO VỆ QUOTA GOOGLE API
 * Cung cấp dữ liệu thẩm định di sản, hoa văn và lookbook nghệ thuật tức thì dựa trên Cultural Truths.
 */

export function getMockCulturalAI(context: {
  event: string;
  primary_color: string;
  garment_type: string;
  accessory: string;
  region?: string;
}): CulturalGuardrailResult {
  const { event, garment_type, accessory, primary_color } = context;
  const truth = getCulturalTruth(garment_type);
  const tabooCheck = checkStrictTaboo(truth.id, accessory);

  const citations: CitationSource[] = [
    {
      title: truth.sourceTitle,
      author_or_institution: truth.authorOrInstitution,
      url: truth.sourceUrl,
      reference_chapter_or_note: truth.sourceReferenceNote || 'Tài liệu nghiên cứu di sản',
      publication_year: truth.publicationYear
    }
  ];

  // 1. Kiểm tra lệch quy chuẩn văn hóa dựa trên Strict Taboos
  if (tabooCheck.isTaboo && tabooCheck.taboo) {
    const taboo = tabooCheck.taboo;
    return {
      is_culturally_accurate: false,
      warning_level: 'WARNING',
      cultural_warning_msg: taboo.historicalConflictReason,
      suggested_fix: taboo.suggestedAlternative,
      kieu_toc_va_trang_diem:
        'Tóc búi cao thanh thoát cài trâm hoặc thả tự nhiên; trang điểm nhẹ nhàng tôn phong thái đoan trang.',
      dang_chup_anh:
        'Đứng thẳng người đoan trang, một tay buông tà áo năm thân ngay ngắn, ánh mắt hướng về ống kính.',
      cau_chuyen_di_san: truth.culturalSignificance,
      citations,
      set_name: truth.name,
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
    citations,
    set_name: truth.name,
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

export function getMockStylingSuggestions(context: {
  garment_type: string;
  primary_color: string;
  style_mode?: string;
  personality?: string;
}) {
  const truth = getCulturalTruth(context.garment_type);
  const garmentId = truth.id;

  const suggestionsByGarment: Record<string, { accessories: any[]; hairstyles: any[] }> = {
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

  return {
    accessories: garmentSet.accessories,
    hairstyles: garmentSet.hairstyles,
    stylist_note: `Gợi ý sáng tạo cho ${truth.name} sắc ${context.primary_color}: kết hợp hài hòa nét trang nhã di sản cùng phong thái tự tin đương đại.`
  };
}
