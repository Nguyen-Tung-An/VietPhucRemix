import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Cache in-memory để tránh gọi trùng lặp và tiết kiệm quota
const adviceCache = new Map<string, any>();

// Kho tri thức văn hóa dự phòng khi vượt hạn ngạch (429 Rate Limit) hoặc offline
const CULTURAL_FALLBACKS: Record<string, Record<string, { makeup: string; pose: string; story: string }>> = {
  tet: {
    '#B22222': {
      makeup: 'Tóc búi trễ cài trâm xà cừ hoặc hoàng cúc vàng. Điểm xuyết son môi đỏ chu sa trầm nhã, má phớt hồng đào tự nhiên, lông mày lá liễu thanh thoát tôn nét kiêu sa, quý phái du xuân.',
      pose: 'Tay phải nâng nhẹ quạt giấy xếp trước ngực ngang xương quai xanh, tay trái khẽ vén tà áo trước. Đứng nghiêng 45 độ, ánh mắt cười nhẹ nhìn xa để phô trọn tà áo ngũ thân bay lượn.',
      story: 'Sắc Đỏ Son (Chu Sa) biểu trưng cho vượng khí thái dương, xua tan u ám và rước tài lộc đầu năm. Kết hợp kết cấu 5 thân áo ngũ thân mang ý nghĩa năm mới tròn đầy, ngũ phúc lâm môn.'
    },
    '#1D3557': {
      makeup: 'Lối trang điểm tông cam đất ấm áp tương phản sắc chàm sâu lắng. Tóc búi cao thanh thoát cài trâm bạc tạo điểm nhấn tri thức và tao nhã.',
      pose: 'Hai tay cầm quạt giấy khép nhẹ đặt trước eo, đứng thẳng vai nghiêng 30 độ về hướng ánh sáng tự nhiên để tôn nếp gấp tà áo ngũ thân.',
      story: 'Sắc Xanh Chàm trong tiết xuân mang ngụ ý khởi sắc, trí tuệ hanh thông và sự bình tĩnh, vững vàng cho cả năm mới.'
    },
    '#E5A93C': {
      makeup: 'Tóc tết vương miện hoặc búi cài trâm cúc vàng. Trang điểm tông cam hoàng kim rạng rỡ, chuốt mi cong nhẹ, tôn thần sắc tươi mới như nắng mai ngày Tết.',
      pose: 'Hai tay cầm quạt giấy xòe nhẹ ngang hông, bước nhẹ một chân lên phía trước tạo dáng dạo bước du xuân thảnh thơi giữa phố hoa.',
      story: 'Vàng Hoàng Cúc tượng trưng cho sự quyền quý, trường thọ và sinh sôi nảy nở. Là sắc màu đại diện cho đất trời phương Nam ấm áp trong những ngày đầu xuân sum vầy.'
    },
    '#2B1A12': {
      makeup: 'Trang điểm màu son cam gạch trầm ấm, đường kẻ mắt sắc sảo vừa vặn, tóc búi lọn cổ phong giữ trọn nét đằm thắm mộc mạc.',
      pose: 'Một tay giữ nhẹ mép cổ áo lập lĩnh, một tay nâng quạt che nửa mặt e ấp, tạo nét bí ẩn và duyên dáng hoài niệm.',
      story: 'Nâu Cánh Gián đậm chất sơn mài truyền thống, tôn vinh nét đẹp trầm tĩnh, hoài cổ và chiều sâu văn hóa của người Tràng An xưa.'
    }
  },
  grad: {
    '#1D3557': {
      makeup: 'Tóc buộc nửa đầu uốn lọn sóng tự nhiên hoặc búi cao thanh tú với kẹp ngọc. Phong cách trang điểm tông cam đất / nude nhã nhặn, tôn vẻ thông tuệ, chững chạc của người trí thức trẻ.',
      pose: 'Đứng thẳng lưng đoan trang, hai tay chắp trước bụng theo thế "Chắp Tay Vái Chào" truyền thống để lộ cổ tay chẽn gọn gàng; hoặc một tay ôm bằng tốt nghiệp / cuốn sách cổ.',
      story: 'Màu Xanh Chàm là màu của nho sinh xưa đỗ đạt khoa bảng, tượng trưng cho biển học mênh mông và lòng kiên định. 5 cúc áo đại diện cho Ngũ Thường: Nhân - Lễ - Nghĩa - Trí - Tín.'
    },
    '#B22222': {
      makeup: 'Tóc thả suôn mượt vén sau tai cài trâm nhỏ. Son môi đỏ gạch thanh lịch, nhấn phần đuôi mắt sắc sảo thể hiện ý chí và sự tự tin bước vào ngưỡng cửa sự nghiệp mới.',
      pose: 'Một tay cầm quạt gập gọn chỉ nhẹ về phía trước, ánh nhìn kiên định hướng về tương lai, thể hiện tinh thần khát vọng vươn lên của thế hệ trẻ.',
      story: 'Màu đỏ trong ngày tốt nghiệp gợi nhớ màu bảng vàng đăng khoa, là lời chúc cho công danh rực rỡ và nhiệt huyết tuổi trẻ luôn cháy bỏng.'
    },
    '#E5A93C': {
      makeup: 'Trang điểm tươi sáng, má hồng đào phớt nhẹ, son môi san hô tươi tắn toát lên năng lượng tích cực của thủ khoa tài năng.',
      pose: 'Cười rạng rỡ, hai tay nâng kỷ yếu hoặc bằng tốt nghiệp ngang ngực, góc máy chụp từ dưới chếch nhẹ lên trên tôn phom người cao ráo.',
      story: 'Vàng Hoàng Cúc như ánh hào quang rực rỡ ghi dấu mốc son trưởng thành sau những năm tháng đèn sách kiên trì.'
    },
    '#2B1A12': {
      makeup: 'Trang điểm cổ điển tối giản với son nâu đất, tóc vấn gọn gàng thể hiện sự chín chắn, đĩnh đạc của bậc học giả trẻ.',
      pose: 'Đứng nghiêng bên góc thư viện hoặc hành lang cổ, tay buông xuôi tự nhiên theo tà áo, mắt nhìn vào trang sách.',
      story: 'Sắc màu của mộc bản và giấy dó xưa, thể hiện sự khiêm nhường và nền tảng tri thức vững chãi.'
    }
  },
  temple: {
    '#2B1A12': {
      makeup: 'Tóc búi gọn gàng tối giản, cài trâm gỗ mun mộc mạc. Lớp nền mỏng nhẹ như sương, son môi hồng đất trầm ấm, giữ trọn nét thanh tịnh và trang nghiêm nơi cửa Phật.',
      pose: 'Hai lòng bàn tay đan nhẹ hờ vào nhau cầm chuỗi tràng hạt bồ đề hoặc chắp tay ngang ngực búp sen, cúi đầu tịnh tâm, dáng đứng vững chãi tĩnh tại.',
      story: 'Nâu Cánh Gián là màu của đất mẹ, của áo nâu sồng giác ngộ và sự buông bỏ tạp niệm. Thân áo ngũ thân lập lĩnh kín cổ bảo vệ thân tâm, cầu nguyện bình an cho gia đạo.'
    },
    '#1D3557': {
      makeup: 'Trang điểm mộc mạc, mi chuốt tơi nhẹ, chân mày tự nhiên, giữ vẻ thuần hậu trang nghiêm nơi chốn thiền môn.',
      pose: 'Dáng đứng tĩnh tại bên thềm chùa rêu phong, hai tay buông xuôi tà áo chắp hờ phía trước, ánh mắt hướng về chánh điện.',
      story: 'Sắc chàm mang lại cảm giác bình yên sâu thẳm, tĩnh tại tâm trí và xua tan muộn phiền nơi cửa thiền linh thiêng.'
    },
    '#E5A93C': {
      makeup: 'Lối trang điểm tông vàng nâu nhẹ nhàng, tóc búi sau gáy đơn sơ không phụ kiện cầu kỳ để giữ sự khiêm cung.',
      pose: 'Hai tay nâng nén hương hoặc dâng hoa sen, người hơi cúi nhẹ thể hiện lòng thành kính cầu an cho cha mẹ gia đình.',
      story: 'Màu vàng tượng trưng cho ánh sáng từ bi của đạo pháp, đem lại phúc lộc và sự chở che an lành.'
    },
    '#B22222': {
      makeup: 'Son môi đỏ đất nhạt, trang điểm mỏng nhẹ tự nhiên, tóc cài lược gỗ cổ.',
      pose: 'Đứng dưới tán cây bồ đề hoặc tháp chuông cổ, tay cầm quạt khép kín xuôi theo thân áo.',
      story: 'Màu son đỏ đi chùa cầu mong sự may mắn, ấm no và phúc trạch dồi dào cho dòng tộc trong năm mới.'
    }
  }
};

function getFallbackAdvice(event: string, color: string) {
  const evKey = (event in CULTURAL_FALLBACKS) ? event : 'tet';
  const colorMap = CULTURAL_FALLBACKS[evKey];
  const upperColor = color.toUpperCase();

  for (const [c, adv] of Object.entries(colorMap)) {
    if (c.toUpperCase() === upperColor) {
      return adv;
    }
  }

  // Fallback mặc định theo event
  return Object.values(colorMap)[0];
}

// Endpoint Cố vấn Di sản Văn hóa & Phối Việt Phục
app.post('/api/gemini/cultural-advice', async (req, res) => {
  const { event, primary_color, garment_type } = req.body || {};
  const safeEvent = event || 'tet';
  const safeColor = primary_color || '#B22222';
  const cacheKey = `${safeEvent}_${safeColor}_${garment_type || 'AO_NGU_THAN'}`.toLowerCase();

  // Kiểm tra Cache trước
  if (adviceCache.has(cacheKey)) {
    return res.json(adviceCache.get(cacheKey));
  }

  // Nếu không có API key, trả về dữ liệu giám tuyển ngay lập tức
  if (!apiKey) {
    const fallback = getFallbackAdvice(safeEvent, safeColor);
    adviceCache.set(cacheKey, fallback);
    return res.json(fallback);
  }

  try {
    const eventName = safeEvent === 'tet' ? 'Dạo Phố Tết' : safeEvent === 'grad' ? 'Lễ Tốt Nghiệp' : safeEvent === 'temple' ? 'Đi Chùa Cầu An' : safeEvent;
    
    const prompt = `Bạn là Chuyên gia Cố vấn Di sản Văn hóa và Giám tuyển Thời trang Cổ phục Việt Nam (đặc biệt là Áo Ngũ Thân Lập Lĩnh) dành cho thế hệ trẻ Gen Z.
Thông tin trang phục người dùng đang phối:
- Dịp / Sự kiện: ${eventName}
- Mã màu vải chính: ${safeColor}
- Loại cổ phục: ${garment_type || 'AO_NGU_THAN'} (Áo Ngũ Thân Lập Lĩnh)

Hãy phân tích và trả về đúng định dạng JSON có cấu trúc sau (không kèm markdown ngoài khối JSON):
{
  "makeup": "Gợi ý cụ thể phong cách làm tóc (trâm cài, kiểu búi, phụ kiện) và layout trang điểm (màu son môi, phấn má, mắt) hài hòa giữa nét đẹp truyền thống và phong thái trẻ trung, hiện đại (khoảng 30-45 từ)",
  "pose": "Hướng dẫn 1-2 dáng đứng/chụp ảnh tôn dáng áo ngũ thân, tà áo, cách đặt tay hoặc cầm quạt tạo thần thái thanh lịch, trang nhã (khoảng 30-45 từ)",
  "story": "Ý nghĩa văn hóa, biểu tượng phong thủy hoặc giá trị lịch sử sâu sắc của màu sắc này khi kết hợp với áo ngũ thân trong dịp lễ này (khoảng 40-60 từ)"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);

    if (parsed.makeup && parsed.pose && parsed.story) {
      adviceCache.set(cacheKey, parsed);
      return res.json(parsed);
    }

    // Nếu parse ra thiếu trường, dùng fallback
    const fallback = getFallbackAdvice(safeEvent, safeColor);
    adviceCache.set(cacheKey, fallback);
    return res.json(fallback);
  } catch (error: any) {
    // Xử lý khi chạm Rate Limit 429 hoặc bất kỳ lỗi nào từ API:
    // Trả về dữ liệu chuẩn từ kho tri thức giám tuyển với HTTP 200, KHÔNG ném lỗi 500
    console.warn(`[Gemini Cultural API Notice] Using curated heritage advice (${error?.status || error?.message || 'RateLimit/Quota'})`);
    const fallback = getFallbackAdvice(safeEvent, safeColor);
    adviceCache.set(cacheKey, fallback);
    return res.status(200).json(fallback);
  }
});

async function start() {
  const isDev = process.env.NODE_ENV !== 'production';
  const port = process.env.PORT || 3000;

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

start();
