import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Khởi tạo Gemini AI Client phía Server
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Bộ quy tắc thẩm định di sản nội bộ (Local Fallback khi API chạm hạn mức 429 Quota)
function getLocalCulturalAnalysis(contextPayload: {
  event: string;
  primary_color: string;
  garment_type: string;
  accessory: string;
  region?: string;
}) {
  const { event, garment_type, accessory } = contextPayload;

  // Lệch quy chuẩn 1: Áo Bà Ba Nam Bộ + Nón Quai Thao Bắc Bộ
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
    };
  }

  // Lệch quy chuẩn 2: Áo Ngũ Thân Bắc/Trung Bộ + Khăn Rằn Nam Bộ
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
    };
  }

  // Các trường hợp chuẩn mực văn hóa (SAFE) theo từng sự kiện
  const eventDetails: Record<string, { makeup: string; pose: string; story: string }> = {
    tet: {
      makeup:
        'Tóc búi cao điểm xuyết trâm hoa mai đồng hoặc vấn khăn lụa gấm; trang điểm sắc cam đào ấm áp, điểm xuyết son đỏ tươi cánh sen rực rỡ đón xuân tài lộc.',
      pose:
        'Nghiêng người 45 độ, một tay khẽ xòe quạt giấy xếp ngang ngực, tay kia buông tà tự nhiên, ánh mắt nhìn nghiêng thanh thoát đón ánh sáng tự nhiên trên tà áo.',
      story:
        'Sắc Đỏ Son trên tà áo truyền thống tượng trưng cho vận hội hanh thông và tài lộc đầu năm. Năm cúc cài chéo nhắc nhở đạo hiếu gia phong của người Việt.',
    },
    grad: {
      makeup:
        'Tóc xõa tự nhiên kẹp gọn sau vành tai hoặc buộc thấp thanh lịch; trang điểm sương mai tông hồng đất tinh khôi, tôn phong thái tri thức Gen Z.',
      pose:
        'Đứng thẳng người đoan chính, hai tay nâng nhẹ cuốn kỷ yếu hoặc hoa tươi ngang eo, tà áo buông thẳng tắp tạo phom dáng cao ráo và vững chãi.',
      story:
        'Màu Xanh Chàm thâm trầm như ngọc bích biểu trưng cho tri thức uyên bác và chí hướng thanh vân trong ngày lễ cử nghiệp trưởng thành.',
    },
    temple: {
      makeup:
        'Tóc vấn khăn gọn gàng hoặc buộc thấp mộc mạc; trang điểm thuần khiết mộc mạc, thoa son dưỡng nhẹ nhàng giữ trọn nét đoan trang tịch tĩnh.',
      pose:
        'Hai tay chắp nhẹ trước ngực hoặc bước chậm khoan thai bên thềm đá rêu phong, nếp tà buông mềm mại giữ vẻ trang nghiêm, tĩnh tại và an nhiên.',
      story:
        'Sắc Cánh Gián trầm mặc của đất mẹ và cửa thiền gợi nhắc tâm hồn hướng thiện, đức khiêm nhường và nếp sống tĩnh tại an yên.',
    },
  };

  const selectedEventInfo = eventDetails[event] || eventDetails.tet;

  return {
    is_culturally_accurate: true,
    warning_level: 'SAFE',
    cultural_warning_msg: '',
    suggested_fix: '',
    kieu_toc_va_trang_diem: selectedEventInfo.makeup,
    dang_chup_anh: selectedEventInfo.pose,
    cau_chuyen_di_san: selectedEventInfo.story,
  };
}

// Bộ tạo hoa văn di sản nội bộ (Local Fallback khi chạm 429 Quota)
function getLocalPattern(keyword: string, overlay_mode: string) {
  const isEmblem = overlay_mode === 'CENTRAL_EMBLEM';
  const cleanKw = (keyword || 'hoa sen').toLowerCase();

  let name = 'Gấm Mây Thủy Ba Cổ Truyền';
  let pathData = 'M 10,30 Q 25,12 40,28 T 60,30 M 5,45 Q 25,25 45,45';
  let color = '#E5A93C';
  let story = `Họa tiết sóng cuộn và mây vờn Nguyễn khởi sắc từ cảm hứng "${keyword}", tượng trưng cho khát vọng trường tồn và uyển chuyển.`;

  if (cleanKw.includes('sen') || cleanKw.includes('hoa') || cleanKw.includes('hồ')) {
    name = isEmblem ? 'Kim Liên Ngự Đạo' : 'Gấm Dệt Liên Hoa';
    pathData = isEmblem
      ? 'M 0,-22 C 12,-16 16,0 0,22 C -16,0 -12,-16 0,-22 Z M -14,2 C -6,-8 0,8 0,18 C 0,8 6,-8 14,2'
      : 'M 15,10 Q 30,25 45,10 Q 30,45 15,10 Z M 30,25 Q 30,50 30,50';
    color = '#E5A93C';
    story = `Cảm hứng đóa sen thuần khiết từ "${keyword}", biểu trưng cho cốt cách thanh cao giữa đời thường.`;
  } else if (cleanKw.includes('mưa') || cleanKw.includes('huế') || cleanKw.includes('sông') || cleanKw.includes('nước')) {
    name = isEmblem ? 'Thủy Ba Long Vân' : 'Gấm Mây Mưa Xứ Huế';
    pathData = isEmblem
      ? 'M -20,10 Q -10,-15 0,10 Q 10,-15 20,10 Q 0,25 -20,10 Z'
      : 'M 5,20 Q 20,5 35,20 T 65,20 M 5,40 Q 20,25 35,40 T 65,40';
    color = '#E5A93C';
    story = `Nét lượn sóng nước Thủy Ba êm đềm khởi nguồn từ "${keyword}", mang nỗi niềm hoài cổ cố đô.`;
  } else if (cleanKw.includes('gốm') || cleanKw.includes('chu đậu') || cleanKw.includes('vàng') || cleanKw.includes('cúc')) {
    name = isEmblem ? 'Bạch Cúc Chu Đậu' : 'Gấm Hoàng Cúc Dát Vàng';
    pathData = isEmblem
      ? 'M 0,-24 C 16,-24 24,-16 24,0 C 24,16 16,24 0,24 C -16,24 -24,16 -24,0 C -24,-16 -16,-24 0,-24 Z M -16,0 L 16,0 M 0,-16 L 0,16'
      : 'M 10,10 L 50,50 M 50,10 L 10,50 M 30,5 L 30,55 M 5,30 L 55,30';
    color = '#E5A93C';
    story = `Men lam và nét vẽ cúc đại đóa gốm Chu Đậu từ "${keyword}", tôn vinh tài hoa mỹ nghệ ngàn năm.`;
  }

  return {
    pattern_name: name,
    pattern_type: overlay_mode || 'SEAMLESS_JACQUARD',
    svg_path_data: pathData,
    pattern_color: color,
    pattern_story: story,
  };
}

// Bộ tạo ảnh Lookbook thời trang AI chất lượng cao (Data URI)
function generateEditorialLookbookDataUri(promptText: string): string {
  const prompt = promptText || '';
  const isAoBaBa = prompt.includes('Ao Ba Ba');

  // Trích xuất mã màu từ prompt
  let color = '#B22222';
  let colorName = 'Đỏ Son';
  if (prompt.includes('Xanh Chàm') || prompt.includes('Indigo')) {
    color = '#1D3557';
    colorName = 'Xanh Chàm';
  } else if (prompt.includes('Hoàng Cúc') || prompt.includes('Chrysanthemum') || prompt.includes('#E5A93C')) {
    color = '#E5A93C';
    colorName = 'Hoàng Cúc';
  } else if (prompt.includes('Cánh Gián') || prompt.includes('Lacquer Brown') || prompt.includes('#2B1A12')) {
    color = '#2B1A12';
    colorName = 'Cánh Gián';
  } else if (prompt.includes('Trắng Bưởi') || prompt.includes('Pomelo') || prompt.includes('#F5F2EB')) {
    color = '#F5F2EB';
    colorName = 'Trắng Bưởi';
  }

  const isScarf = prompt.includes('Khăn Rằn') || prompt.includes('scarf');
  const isConicalHat = prompt.includes('Nón Quai Thao') || prompt.includes('conical hat');

  const svg = `<svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#24140D"/>
        <stop offset="60%" stop-color="#140B07"/>
        <stop offset="100%" stop-color="#0A0503"/>
      </linearGradient>
      <radialGradient id="rimGlow" cx="50%" cy="38%" r="45%">
        <stop offset="0%" stop-color="#E5A93C" stop-opacity="0.32"/>
        <stop offset="55%" stop-color="#B22222" stop-opacity="0.14"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="silkSheen" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.95"/>
        <stop offset="45%" stop-color="#FFFFFF" stop-opacity="0.25"/>
        <stop offset="55%" stop-color="${color}" stop-opacity="1"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0.4"/>
      </linearGradient>
    </defs>

    <!-- Nền Sơn Mài Cao Cấp -->
    <rect width="600" height="800" fill="url(#bgGrad)"/>
    <circle cx="300" cy="330" r="260" fill="url(#rimGlow)"/>
    <rect width="600" height="800" fill="none" stroke="rgba(229,169,60,0.35)" stroke-width="1.5" rx="8"/>
    <rect x="18" y="18" width="564" height="764" fill="none" stroke="rgba(229,169,60,0.5)" stroke-width="1.2" stroke-dasharray="10,6" rx="6"/>

    <!-- Họa tiết mây vàng son nền editorial -->
    <g opacity="0.25" stroke="#E5A93C" stroke-width="1.5" fill="none">
      <path d="M 60,120 Q 90,90 120,110 T 170,115"/>
      <path d="M 430,120 Q 480,95 520,115 T 560,110"/>
      <path d="M 50,680 Q 90,650 140,670 T 200,675"/>
      <path d="M 400,690 Q 450,660 500,680 T 550,680"/>
    </g>

    <!-- Người mẫu Gen Z (Dáng chụp ảnh nghệ thuật) -->
    <g transform="translate(300, 390)">
      <!-- Bóng đổ mềm -->
      <ellipse cx="0" cy="310" rx="140" ry="25" fill="rgba(0,0,0,0.6)" filter="blur(8px)"/>

      <!-- Quần lụa trắng ngà buông rủ -->
      <path d="M -50,110 L -65,300 L -10,305 L -5,120 Z" fill="#E8E4DA" stroke="#4A3B32" stroke-width="1.5"/>
      <path d="M 50,110 L 65,300 L 10,305 L 5,120 Z" fill="#EDE9DF" stroke="#4A3B32" stroke-width="1.5"/>
      <ellipse cx="-38" cy="308" rx="16" ry="6" fill="#2B1A12"/>
      <ellipse cx="38" cy="308" rx="16" ry="6" fill="#2B1A12"/>

      <!-- Thân áo lụa chính -->
      ${isAoBaBa ? `
        <!-- Áo Bà Ba cách điệu -->
        <path d="M -60,-130 Q 0,-105 60,-130 L 85,-40 L 95,145 L -95,145 L -85,-40 Z" fill="${color}" stroke="#140F0D" stroke-width="2"/>
        <path d="M -60,-130 Q 0,-105 60,-130 L 85,-40 L 95,145 L -95,145 L -85,-40 Z" fill="url(#silkSheen)" style="mix-blend-mode: overlay;"/>
        <path d="M -60,-125 L -120,-70 L -115,70 L -80,65 L -80,-40 Z" fill="${color}" stroke="#140F0D" stroke-width="1.6"/>
        <path d="M 60,-125 L 120,-70 L 115,70 L 80,65 L 80,-40 Z" fill="${color}" stroke="#140F0D" stroke-width="1.6"/>
        <line x1="0" y1="-110" x2="0" y2="140" stroke="#121110" stroke-width="2"/>
        <circle cx="0" cy="-80" r="3.5" fill="#E5A93C" stroke="#7A5338" stroke-width="1"/>
        <circle cx="0" cy="-45" r="3.5" fill="#E5A93C" stroke="#7A5338" stroke-width="1"/>
        <circle cx="0" cy="-10" r="3.5" fill="#E5A93C" stroke="#7A5338" stroke-width="1"/>
        <circle cx="0" cy="25" r="3.5" fill="#E5A93C" stroke="#7A5338" stroke-width="1"/>
        <circle cx="0" cy="60" r="3.5" fill="#E5A93C" stroke="#7A5338" stroke-width="1"/>
        <rect x="-65" y="65" width="30" height="34" rx="4" fill="${color}" stroke="#140F0D" stroke-width="1.4" filter="brightness(0.92)"/>
        <rect x="35" y="65" width="30" height="34" rx="4" fill="${color}" stroke="#140F0D" stroke-width="1.4" filter="brightness(0.92)"/>
      ` : `
        <!-- Áo Ngũ Thân Lập Lĩnh sang trọng -->
        <path d="M -55,-135 Q 0,-125 55,-135 L 75,-30 L 92,175 L -92,175 L -75,-30 Z" fill="${color}" stroke="#140F0D" stroke-width="2"/>
        <path d="M -55,-135 Q 0,-125 55,-135 L 75,-30 L 92,175 L -92,175 L -75,-30 Z" fill="url(#silkSheen)" style="mix-blend-mode: overlay;"/>
        <path d="M -55,-130 L -115,-70 L -110,65 L -75,60 L -75,-30 Z" fill="${color}" stroke="#140F0D" stroke-width="1.6"/>
        <path d="M 55,-130 L 115,-70 L 110,65 L 75,60 L 75,-30 Z" fill="${color}" stroke="#140F0D" stroke-width="1.6"/>
        <rect x="-22" y="-162" width="44" height="28" rx="4" fill="${color}" stroke="#140F0D" stroke-width="2"/>
        <rect x="-18" y="-160" width="36" height="6" fill="#F5F2EB"/>
        <path d="M 0,-134 Q 28,-105 34,-65 L 34,95" fill="none" stroke="#121110" stroke-width="2.2"/>
        <circle cx="0" cy="-136" r="4" fill="#E5A93C" stroke="#7A5338" stroke-width="1.2"/>
        <circle cx="18" cy="-115" r="4" fill="#E5A93C" stroke="#7A5338" stroke-width="1.2"/>
        <circle cx="30" cy="-85" r="4" fill="#E5A93C" stroke="#7A5338" stroke-width="1.2"/>
        <circle cx="34" cy="-35" r="4" fill="#E5A93C" stroke="#7A5338" stroke-width="1.2"/>
        <circle cx="34" cy="20" r="4" fill="#E5A93C" stroke="#7A5338" stroke-width="1.2"/>
      `}

      <!-- Cổ và Gương mặt thanh tú -->
      <path d="M -18,-150 L -18,-200 Q 0,-190 18,-200 L 18,-150 Z" fill="#F7DCBF" stroke="#4A2E1B" stroke-width="1.5"/>
      <ellipse cx="0" cy="-210" rx="34" ry="42" fill="#F7DCBF" stroke="#4A2E1B" stroke-width="1.8"/>
      <path d="M -34,-210 C -34,-255 34,-255 34,-210 C 34,-235 -34,-235 -34,-210 Z" fill="#1A1513"/>
      <circle cx="0" cy="-255" r="18" fill="#1A1513" stroke="#4A2E1B" stroke-width="1"/>
      <path d="M -14,-252 Q 0,-264 14,-252" stroke="#E5A93C" stroke-width="2.5" fill="none"/>
      <line x1="-16" y1="-214" x2="-6" y2="-214" stroke="#4A2E1B" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="6" y1="-214" x2="16" y2="-214" stroke="#4A2E1B" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M 0,-208 L -2,-198 L 3,-198" stroke="#7A5338" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M -6,-188 Q 0,-184 6,-188" stroke="#B22222" stroke-width="2.4" fill="none" stroke-linecap="round"/>

      <!-- Phụ kiện: Khăn rằn / Nón quai thao / Quạt giấy xếp -->
      ${isScarf ? `
        <path d="M -22,-140 Q 0,-120 22,-140" stroke="#F5F2EB" stroke-width="14" fill="none" stroke-linecap="round"/>
        <path d="M -22,-138 L -30,65 L -12,65 L -5,-130 Z" fill="#F5F2EB" stroke="#2B1A12" stroke-width="1.5"/>
        <path d="M 22,-138 L 30,75 L 12,75 L 5,-130 Z" fill="#F5F2EB" stroke="#2B1A12" stroke-width="1.5"/>
        <line x1="-28" y1="-90" x2="-14" y2="-90" stroke="#2B1A12" stroke-width="2.5"/>
        <line x1="-28" y1="-50" x2="-14" y2="-50" stroke="#2B1A12" stroke-width="2.5"/>
        <line x1="-28" y1="-10" x2="-14" y2="-10" stroke="#2B1A12" stroke-width="2.5"/>
        <line x1="-28" y1="30" x2="-14" y2="30" stroke="#2B1A12" stroke-width="2.5"/>
        <line x1="14" y1="-90" x2="28" y2="-90" stroke="#2B1A12" stroke-width="2.5"/>
        <line x1="14" y1="-50" x2="28" y2="-50" stroke="#2B1A12" stroke-width="2.5"/>
        <line x1="14" y1="-10" x2="28" y2="-10" stroke="#2B1A12" stroke-width="2.5"/>
        <line x1="14" y1="30" x2="28" y2="30" stroke="#2B1A12" stroke-width="2.5"/>
      ` : (isConicalHat ? `
        <g transform="translate(-85, -20) rotate(-15) scale(0.95)">
          <ellipse cx="0" cy="0" rx="65" ry="58" fill="#E8DEC8" stroke="#9E876A" stroke-width="2.5"/>
          <ellipse cx="0" cy="0" rx="54" ry="48" fill="#EFE8D8" stroke="#C2B295" stroke-width="1.2"/>
          <circle cx="0" cy="0" r="16" fill="#D5C5A5" stroke="#9E876A" stroke-width="1.8"/>
          <path d="M -30,30 Q -45,120 -18,180" stroke="#D9383A" stroke-width="3" fill="none" stroke-linecap="round"/>
          <path d="M 30,30 Q 45,120 18,180" stroke="#D9383A" stroke-width="3" fill="none" stroke-linecap="round"/>
        </g>
      ` : `
        <g transform="translate(100, 50) rotate(-25) scale(0.95)">
          <ellipse cx="0" cy="20" rx="8" ry="6" fill="#F7DCBF"/>
          <line x1="0" y1="20" x2="-45" y2="-55" stroke="#4A2E1B" stroke-width="3"/>
          <line x1="0" y1="20" x2="-18" y2="-65" stroke="#4A2E1B" stroke-width="2"/>
          <line x1="0" y1="20" x2="18" y2="-65" stroke="#4A2E1B" stroke-width="2"/>
          <line x1="0" y1="20" x2="45" y2="-55" stroke="#4A2E1B" stroke-width="3"/>
          <path d="M -50,-45 Q 0,-80 50,-45 L 30,-20 Q 0,-40 -30,-20 Z" fill="#F5F2EB" stroke="#CFC8B8" stroke-width="1.8"/>
          <path d="M -20,-50 Q 0,-62 20,-48" stroke="#B22222" stroke-width="2.5" fill="none"/>
          <circle cx="0" cy="20" r="4.5" fill="#E5A93C" stroke="#7A5338" stroke-width="1.2"/>
          <path d="M 0,24 Q -5,48 2,70" stroke="#B22222" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        </g>
      `)}
    </g>

    <!-- Header & Khung Chữ Editorial Mỹ Thuật -->
    <g transform="translate(40, 56)">
      <text x="0" y="0" font-family="'Cinzel Decorative', 'Cinzel', serif, Georgia" font-size="12" font-weight="700" fill="#E5A93C" letter-spacing="4">VIỆT Y DI SẢN • EDITORIAL LOOKBOOK</text>
      <text x="0" y="24" font-family="'Cinzel Decorative', 'Cinzel', serif, Georgia" font-size="22" font-weight="900" fill="#FFFFFF" letter-spacing="3">${isAoBaBa ? 'ÁO BÀ BA NAM BỘ' : 'ÁO NGŨ THÂN LẬP LĨNH'}</text>
      <text x="0" y="44" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" fill="rgba(245,242,235,0.7)" letter-spacing="1.5">SẮC LỤA ${colorName.toUpperCase()} • TỎA SÁNG GEN Z</text>
    </g>

    <!-- Con Dấu Đỏ Son Hoàng Gia góc dưới -->
    <g transform="translate(520, 720)">
      <rect x="-24" y="-24" width="48" height="48" rx="10" fill="#B22222" stroke="#E5A93C" stroke-width="2"/>
      <circle cx="0" cy="0" r="19" fill="none" stroke="#E5A93C" stroke-width="1" stroke-dasharray="3,2"/>
      <text x="0" y="8" font-family="'Cinzel', serif" font-size="20" font-weight="900" fill="#FFFFFF" text-anchor="middle">吉</text>
    </g>

    <!-- Footer thông tin tạp chí -->
    <g transform="translate(40, 755)">
      <text x="0" y="0" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" fill="rgba(229,169,60,0.85)" letter-spacing="2">AUTHENTIC VIETNAMESE HERITAGE FASHION • MASTERPIECE EDITION</text>
    </g>
  </svg>`;

  const base64Svg = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64Svg}`;
}

// Endpoint API Gemini Flash cho Xưởng Phối Đồ (#create-scene)
app.post('/api/gemini/cultural-ai', async (req, res) => {
  const { event, primary_color, garment_type, accessory, region } = req.body;

  const contextPayload = {
    event: event || 'tet',
    primary_color: primary_color || '#B22222',
    garment_type: garment_type || 'AO_NGU_THAN',
    accessory: accessory || 'QUAT_GIAY',
    region: region || 'TOAN_QUOC',
  };

  // Nếu không có AI client, sử dụng bộ thẩm định di sản nội bộ
  if (!ai) {
    return res.json(getLocalCulturalAnalysis(contextPayload));
  }

  try {
    const systemInstruction =
      "Bạn là Chuyên gia Di sản & Thời trang Việt Y dành cho Gen Z. Hãy phân tích bộ trang phục và sự kiện người dùng chọn. Đề xuất kiểu tóc, tông trang điểm và dáng chụp ảnh tôn vóc dáng. Viết 1 đoạn thuyết minh ngắn (tối đa 3 câu) về ý nghĩa văn hóa, từ ngữ trẻ trung, truyền cảm hứng. Nếu tổ hợp trang phục và phụ kiện/sự kiện bị sai lệch văn hóa vùng miền hoặc thời kỳ, hãy đặt is_culturally_accurate = false, warning_level = 'WARNING' và viết lời khuyên nhã nhặn, tôn trọng sáng tạo của người trẻ nhưng định hướng chuẩn mực. Ngược lại đặt warning_level = 'SAFE'. BẮT BUỘC TRẢ VỀ DUY NHẤT ĐỊNH DẠNG JSON KHÔNG KÈM VĂN BẢN NGOÀI.";

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: JSON.stringify(contextPayload),
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            is_culturally_accurate: { type: Type.BOOLEAN },
            warning_level: { type: Type.STRING },
            cultural_warning_msg: { type: Type.STRING },
            suggested_fix: { type: Type.STRING },
            kieu_toc_va_trang_diem: { type: Type.STRING },
            dang_chup_anh: { type: Type.STRING },
            cau_chuyen_di_san: { type: Type.STRING },
          },
          required: [
            'is_culturally_accurate',
            'warning_level',
            'cultural_warning_msg',
            'suggested_fix',
            'kieu_toc_va_trang_diem',
            'dang_chup_anh',
            'cau_chuyen_di_san',
          ],
        },
      },
    });

    const outputText = response.text?.trim() || '{}';
    const parsedData = JSON.parse(outputText);
    return res.json(parsedData);
  } catch (err: any) {
    // Khi chạm giới hạn 429 Quota hoặc mạng lỗi, tự động chuyển đổi sang bộ thẩm định chuẩn mực
    return res.json(getLocalCulturalAnalysis(contextPayload));
  }
});

// Endpoint API Gemini Flash: Module Sáng Tạo Hoa Văn AI
app.post('/api/gemini/generate-pattern', async (req, res) => {
  const { keyword, overlay_mode } = req.body;
  const userKeyword = keyword || 'chiều mưa xứ Huế';
  const userMode = overlay_mode || 'SEAMLESS_JACQUARD';

  if (!ai) {
    return res.json(getLocalPattern(userKeyword, userMode));
  }

  try {
    const contextPayload = {
      keyword: userKeyword,
      overlay_mode: userMode,
    };

    const systemInstruction =
      'Bạn là Nghệ nhân Thiết kế Họa tiết Di sản. Hãy chuyển đổi từ khóa cảm xúc của người dùng thành một họa tiết thời trang mang hơi hướng mỹ thuật cổ truyền Việt Nam (như nét mây vờn Nguyễn, sóng nước Thủy ba, hoa gốm Chu Đậu, hoặc nét khắc Đông Hồ). Trả về cấu trúc JSON chứa đường nét SVG Path hoặc mã thuộc tính họa tiết để vẽ.';

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: JSON.stringify(contextPayload),
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pattern_name: { type: Type.STRING },
            pattern_type: { type: Type.STRING },
            svg_path_data: { type: Type.STRING },
            pattern_color: { type: Type.STRING },
            pattern_story: { type: Type.STRING },
          },
          required: [
            'pattern_name',
            'pattern_type',
            'svg_path_data',
            'pattern_color',
            'pattern_story',
          ],
        },
      },
    });

    const outputText = response.text?.trim() || '{}';
    const parsedData = JSON.parse(outputText);
    return res.json(parsedData);
  } catch (err: any) {
    // Khi 429 hoặc lỗi mạng, trả về hoa văn di sản tinh tế tương ứng với từ khóa
    return res.json(getLocalPattern(userKeyword, userMode));
  }
});

// Endpoint API Gemini/Imagen: Sinh Ảnh Lookbook Thời Trang AI
app.post('/api/gemini/fashion-image', async (req, res) => {
  const { prompt } = req.body;
  const fashionPrompt = prompt || '';

  // Thử sinh ảnh bằng Imagen 3 nếu tài khoản có hạn mức
  if (ai) {
    try {
      const imageRes = await (ai.models as any).generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: fashionPrompt,
        config: {
          numberOfImages: 1,
          aspectRatio: '3:4',
          outputMimeType: 'image/jpeg',
        },
      });
      const imgBytes = imageRes?.generatedImages?.[0]?.image?.imageBytes;
      if (imgBytes) {
        return res.json({ imageUrl: `data:image/jpeg;base64,${imgBytes}` });
      }
    } catch {
      // Bỏ qua lỗi quota để chuyển sang bộ tạo ảnh Lookbook nghệ thuật
    }
  }

  // Tự động cung cấp bức ảnh Lookbook thời trang di sản cao cấp
  const editorialImage = generateEditorialLookbookDataUri(fashionPrompt);
  return res.json({ imageUrl: editorialImage });
});

// Tích hợp Vite Dev Server Middlewares
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
  });
}

startServer();
