import './styles/main.css';
import { initThreeScene } from './three/landingScene.ts';
import { preferenceEngine } from './discover/preferenceLearning.ts';
import { wardrobeManager } from './discover/wardrobeManager.ts';
import { swipeEngine } from './discover/swipeEngine.ts';
import { garmentEngine } from './workshop/garmentEngine.ts';
import { patternEngine } from './workshop/patternEngine.ts';
import { appRouter } from './navigation/router.ts';
import { resultEngine } from './result/resultEngine.ts';
import { lookbookEngine } from './lookbook/lookbookEngine.ts';
import { feedbackState } from './services/feedbackState.ts';
import { tailorJourneyEngine } from './journey/tailorJourneyEngine.ts';
import { initLucideIcons } from './icons/iconSystem.ts';

function initializeApp(): void {
  // 1. Khởi tạo 3D Lotus Seal Scene
  initThreeScene();

  // 2. Nạp thuật toán học sở thích cá nhân
  preferenceEngine.init();

  // 3. Khởi tạo Tủ Đồ Di Sản Mini
  wardrobeManager.init((outfit) => appRouter.remixToWorkshop(outfit));

  // 4. Khởi tạo Swipe Engine cho Màn hình Khám Phá
  swipeEngine.init((outfit) => appRouter.remixToWorkshop(outfit));

  // 5. Khởi tạo Xưởng Phối Đồ, Áo Ngũ Thân Croquis, Hoa Văn AI, Lookbook AI
  garmentEngine.init();

  // 6. Khởi tạo Phân Hệ Sáng Tạo Hoa Văn Di Sản AI
  patternEngine.init();

  // 7. Khởi tạo Hành Trình Sở Hữu Cổ Phục (Google Maps & Search tiệm may)
  tailorJourneyEngine.init();

  // 8. Khởi tạo Màn hình Kết Quả Lụa Thanh
  resultEngine.init();

  // 9. Khởi tạo Màn hình Lookbook Lụa Thanh
  lookbookEngine.init();

  // 10. Khởi tạo Bộ quản lý trạng thái Tải & Lỗi dùng chung (Concept Lụa Thanh)
  feedbackState.init();
  (window as unknown as { feedbackState: typeof feedbackState }).feedbackState = feedbackState;

  // 11. Khởi tạo Bộ điều hướng chuyển cảnh (Router)
  appRouter.init();

  // 12. Khởi tạo hệ thống biểu tượng Lucide thuần nhất
  initLucideIcons();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
