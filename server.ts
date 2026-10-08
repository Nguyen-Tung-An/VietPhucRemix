import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import {
  runOfflineCulturalPipeline,
  runOnlineGeminiCulturalPipeline,
  runOnlineMiniStylingSuggestions,
  getOfflineMiniStylingSuggestions,
} from './server/culturalPipeline.ts';
import { getColorCulturalAnalysis } from './src/data/culturalTruths.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Chế độ Offline / Mock Mode toàn phần (bật khi AI_OFFLINE_MODE=true hoặc khi không có API key)
const AI_OFFLINE_MODE = process.env.AI_OFFLINE_MODE === 'true';

// Khởi tạo Gemini AI Client phía Server (chỉ nạp khi không kích hoạt OFFLINE_MODE)
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey && !AI_OFFLINE_MODE) {
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
    color_evaluation: getColorCulturalAnalysis(contextPayload.primary_color, garment_type, event),
  };
}

// Bộ tạo hoa văn di sản nội bộ (Chế độ Mock Bảo Vệ Quota — không dùng vector SVG)
function getLocalPattern(keyword: string, overlay_mode: string) {
  const isEmblem = overlay_mode === 'CENTRAL_EMBLEM';
  const cleanKw = (keyword || 'hoa sen').toLowerCase();

  let name = 'Gấm Mây Thủy Ba Cổ Truyền';
  let color = '#E5A93C';
  let story = `Họa tiết sóng cuộn và mây vờn Nguyễn khởi sắc từ cảm hứng "${keyword}", tượng trưng cho khát vọng trường tồn và uyển chuyển.`;
  let imageUrl = '/images/patterns/pat-may-ngu-sac.png';

  if (cleanKw.includes('sen') || cleanKw.includes('hoa') || cleanKw.includes('hồ')) {
    name = isEmblem ? 'Kim Liên Ngự Đạo' : 'Gấm Dệt Liên Hoa';
    color = '#E5A93C';
    story = `Cảm hứng đóa sen thuần khiết từ "${keyword}", biểu trưng cho cốt cách thanh cao giữa đời thường.`;
    imageUrl = '/images/patterns/pat-tu-quy.png';
  } else if (cleanKw.includes('mưa') || cleanKw.includes('huế') || cleanKw.includes('sông') || cleanKw.includes('nước')) {
    name = isEmblem ? 'Thủy Ba Long Vân' : 'Gấm Mây Mưa Xứ Huế';
    color = '#E5A93C';
    story = `Nét lượn sóng nước Thủy Ba êm đềm khởi nguồn từ "${keyword}", mang nỗi niềm hoài cổ cố đô.`;
    imageUrl = '/images/patterns/pat-thuy-ba-hoang-gia.png';
  } else if (cleanKw.includes('gốm') || cleanKw.includes('chu đậu') || cleanKw.includes('vàng') || cleanKw.includes('cúc')) {
    name = isEmblem ? 'Bạch Cúc Chu Đậu' : 'Gấm Hoàng Cúc Dát Vàng';
    color = '#E5A93C';
    story = `Men lam và nét vẽ cúc đại đóa gốm Chu Đậu từ "${keyword}", tôn vinh tài hoa mỹ nghệ ngàn năm.`;
    imageUrl = '/images/patterns/pat-cuc-day-nguyen.png';
  }

  return {
    pattern_name: name,
    pattern_type: overlay_mode || 'SEAMLESS_JACQUARD',
    pattern_color: color,
    pattern_story: story,
    imageUrl,
  };
}

// Endpoint API Mini Gemini: Sáng Tạo 3 Gợi Ý Phụ Kiện & Kiểu Tóc Theo Bối Cảnh
app.post('/api/gemini/suggest-styling', async (req, res) => {
  const { garment_type, primary_color, style_mode, personality, user_profile } = req.body;

  const context = {
    garment_type: garment_type || 'AO_NGU_THAN',
    primary_color: primary_color || '#F4C9D6',
    style_mode: style_mode || 'THANH_TAO',
    personality: personality || 'Đương đại, tự tin, yêu di sản',
    user_profile: user_profile || null,
  };

  if (!AI_OFFLINE_MODE && ai) {
    try {
      const suggestions = await runOnlineMiniStylingSuggestions(ai, context);
      return res.json(suggestions);
    } catch (err) {
      console.warn('Lỗi gọi Gemini Mini Styling Suggestions, dùng Offline Generator:', err);
    }
  }

  const offlineSuggestions = getOfflineMiniStylingSuggestions(context);
  return res.json(offlineSuggestions);
});

// Endpoint API Gemini Flash cho Xưởng Phối Đồ (#create-scene) - Hệ thống 2 vòng kiểm định di sản
app.post('/api/gemini/cultural-ai', async (req, res) => {
  const {
    event,
    primary_color,
    garment_type,
    accessory,
    accessories,
    custom_accessories,
    hairstyle,
    custom_hairstyle,
    region,
    style_mode,
    personality,
  } = req.body;

  const contextPayload = {
    event: event || 'tet',
    primary_color: primary_color || '#F4C9D6',
    garment_type: garment_type || 'AO_NGU_THAN',
    accessory: accessory || 'QUAT_GIAY',
    accessories: Array.isArray(accessories) ? accessories : (accessory ? [accessory] : ['QUAT_GIAY']),
    custom_accessories: Array.isArray(custom_accessories) ? custom_accessories : [],
    hairstyle: hairstyle || 'BUI_TRAM',
    custom_hairstyle: custom_hairstyle || '',
    region: region || 'TOAN_QUOC',
    style_mode: style_mode || 'THANH_TAO',
    personality: personality || '',
  };

  // 1. Chế độ Online: Gọi Gemini 2-Round Pipeline nếu AI_OFFLINE_MODE = false và có API Key
  if (!AI_OFFLINE_MODE && ai) {
    try {
      const onlineResult = await runOnlineGeminiCulturalPipeline(ai, contextPayload);
      return res.json({
        ...onlineResult.final_guardrail,
        recommendation: onlineResult.recommendation,
        audit: onlineResult.audit,
        pipeline_metadata: onlineResult.pipeline_metadata,
      });
    } catch (err) {
      console.error('Lỗi gọi Gemini Cultural Pipeline trực tiếp, chuyển sang Offline Engine:', err);
    }
  }

  // 2. Chế độ Offline / Ground Truth Deterministic Engine (Bảo vệ quota 100%, có trích dẫn URL)
  const offlineResult = runOfflineCulturalPipeline(contextPayload);
  return res.json({
    ...offlineResult.final_guardrail,
    recommendation: offlineResult.recommendation,
    audit: offlineResult.audit,
    pipeline_metadata: offlineResult.pipeline_metadata,
  });
});

// Endpoint API Gemini Flash: Module Sáng Tạo Hoa Văn AI - Chế độ Mock Bảo Vệ Quota
app.post('/api/gemini/generate-pattern', async (req, res) => {
  const { keyword, overlay_mode } = req.body;
  const userKeyword = keyword || 'chiều mưa xứ Huế';
  const userMode = overlay_mode || 'SEAMLESS_JACQUARD';

  // Trả về hoa văn di sản nội bộ theo từ khóa (Zero quota consumption)
  return res.json(getLocalPattern(userKeyword, userMode));
});

// Endpoint API Gemini/Imagen: Sinh Ảnh Lookbook Thời Trang AI
app.post('/api/gemini/fashion-image', async (req, res) => {
  return res.json({ imageUrl: '' });
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server đang chạy tại http://0.0.0.0:${PORT}`);
  });
}

startServer();
