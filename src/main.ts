import './styles/main.css';
import { initThreeScene } from './three/landingScene.ts';
import { preferenceEngine } from './discover/preferenceLearning.ts';
import { wardrobeManager } from './discover/wardrobeManager.ts';
import { swipeEngine } from './discover/swipeEngine.ts';
import { garmentEngine } from './workshop/garmentEngine.ts';
import { appRouter } from './navigation/router.ts';

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

  // 6. Khởi tạo Bộ điều hướng chuyển cảnh (Router)
  appRouter.init();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
