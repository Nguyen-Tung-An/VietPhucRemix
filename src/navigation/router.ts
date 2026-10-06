import { DiscoveryOutfit } from '../types/index.ts';
import { Sound } from '../audio/sound.ts';
import { preferenceEngine } from '../discover/preferenceLearning.ts';
import { swipeEngine, DISCOVERY_OUTFITS_POOL } from '../discover/swipeEngine.ts';
import { wardrobeManager } from '../discover/wardrobeManager.ts';
import { garmentEngine } from '../workshop/garmentEngine.ts';
import { lookbookEngine } from '../lookbook/lookbookEngine.ts';
import { feedbackState } from '../services/feedbackState.ts';

export class AppRouter {
  private hasInitialWorkshopLoaded = false;

  public init(): void {
    this.setupSceneNavigation();
    this.setupTabs();
    this.setupFeedbackDemos();
  }

  private setupFeedbackDemos(): void {
    const btnDemoLoading = document.getElementById('btn-demo-loading');
    const btnDemoError = document.getElementById('btn-demo-error');

    btnDemoLoading?.addEventListener('click', () => {
      Sound.playClick();
      feedbackState.showLoading({
        message: 'Đang dệt sắc lụa đương đại...',
        submessage: 'Không gian Lụa Thanh đang nắn nót từng nếp tơ...',
        allowCancel: true
      });

      // Tự động kết thúc sau 3 giây hoặc người dùng có thể bấm "Dừng xử lý"
      setTimeout(() => {
        feedbackState.hideLoading();
      }, 3000);
    });

    btnDemoError?.addEventListener('click', () => {
      Sound.playError();
      feedbackState.showError({
        title: 'Tơ Lụa Tạm Lắng',
        message: 'Không gian tơ lụa tạm lắng trong giây lát. Tà lụa và sắc phục của bạn vẫn được lưu giữ an toàn, hãy thử kết nối lại nhé.',
        retryLabel: 'Thử Lại',
        onRetry: () => {
          feedbackState.showLoading({
            message: 'Đang kết nối lại xưởng dệt...',
            submessage: 'Hồi phục tà lụa và đồng bộ dữ liệu di sản...'
          });

          setTimeout(() => {
            feedbackState.hideLoading();
            Sound.playChime();
            this.showToast('✨ Đã kết nối lại thành công không gian Lụa Thanh!');
          }, 1100);
        }
      });
    });
  }

  public switchTab(tabName: 'create' | 'discover' | 'lookbook'): void {
    const createScene = document.getElementById('create-scene');
    const discoverScene = document.getElementById('discover-scene');
    const lookbookScene = document.getElementById('lookbook-scene');
    const resultScene = document.getElementById('result-scene');

    const tabCreateBtn = document.getElementById('tab-create');
    const tabDiscoverBtn = document.getElementById('tab-discover');
    const tabLookbookBtn = document.getElementById('tab-lookbook');

    resultScene?.classList.remove('scene-active');

    if (tabName === 'create') {
      tabCreateBtn?.classList.add('active');
      tabDiscoverBtn?.classList.remove('active');
      tabLookbookBtn?.classList.remove('active');

      discoverScene?.classList.remove('scene-active');
      lookbookScene?.classList.remove('scene-active');
      createScene?.classList.add('scene-active');

      // Khởi tạo phối đồ lần đầu tiên theo gu đã tích lũy (không ghi đè nếu người dùng đang phối dở)
      if (!this.hasInitialWorkshopLoaded) {
        this.hasInitialWorkshopLoaded = true;
        const { topColor, topGarment, topEvent } = preferenceEngine.getTopPreferences();
        garmentEngine.setFabricColor(topColor);
        garmentEngine.setGarment(topGarment);
        garmentEngine.setAccessory('QUAT_GIAY', true);
        garmentEngine.callCulturalAI(topEvent, topColor, topGarment, 'QUAT_GIAY');
      }
    } else if (tabName === 'discover') {
      tabDiscoverBtn?.classList.add('active');
      tabCreateBtn?.classList.remove('active');
      tabLookbookBtn?.classList.remove('active');

      createScene?.classList.remove('scene-active');
      lookbookScene?.classList.remove('scene-active');
      discoverScene?.classList.add('scene-active');

      swipeEngine.currentDeck = preferenceEngine.sortDeckByPreference(
        swipeEngine.currentDeck.length > 0 ? swipeEngine.currentDeck : DISCOVERY_OUTFITS_POOL
      );
      swipeEngine.renderDeckStack();
    } else if (tabName === 'lookbook') {
      tabLookbookBtn?.classList.add('active');
      tabCreateBtn?.classList.remove('active');
      tabDiscoverBtn?.classList.remove('active');

      createScene?.classList.remove('scene-active');
      discoverScene?.classList.remove('scene-active');
      lookbookScene?.classList.add('scene-active');

      lookbookEngine.renderLookbook();
    }
  }

  public remixToWorkshop(outfit: DiscoveryOutfit): void {
    Sound.playClick();
    feedbackState.showLoading({
      message: 'Đang đưa tà lụa vào Xưởng Phối...',
      submessage: `Chuẩn bị bộ "${outfit.title}" và gọi thẩm định di sản AI...`
    });

    setTimeout(() => {
      feedbackState.hideLoading();
      this.switchTab('create');

      garmentEngine.setFabricColor(outfit.color, outfit.colorName);
      garmentEngine.setGarment(outfit.garment);
      garmentEngine.setAccessory(outfit.accessory, true);
      garmentEngine.callCulturalAI(outfit.event, outfit.color, outfit.garment, outfit.accessory);

      this.showToast(`✨ Đã nạp bộ "${outfit.title}" vào Xưởng Phối để bạn remix!`);
    }, 450);
  }

  public showToast(message: string): void {
    const toast = document.getElementById('pref-sync-toast');
    const msgEl = document.getElementById('pref-sync-toast-msg');
    if (!toast) return;
    if (msgEl && message) msgEl.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  private setupSceneNavigation(): void {
    const landingScene = document.getElementById('landing-scene');
    const mainNavBar = document.getElementById('main-nav-bar');
    const btnNavHome = document.getElementById('btn-nav-home');
    const btnBackLanding = document.getElementById('btn-back-landing');
    const enterButtons = document.querySelectorAll('.btn-landing-cta');
    const enterWorkshopButtons = document.querySelectorAll('.btn-landing-cta-workshop');

    // Nút "Khám Phá Di Sản" ở màn mở đầu dẫn sang màn Khám phá
    const handleEnterDiscover = () => {
      Sound.playChime();
      landingScene?.classList.add('scene-hidden');
      setTimeout(() => {
        mainNavBar?.classList.add('nav-active');
        this.switchTab('discover');
      }, 180);
    };

    // Nút "Vào Xưởng Phối" ở màn mở đầu dẫn thẳng sang màn Xưởng Phối
    const handleEnterWorkshop = () => {
      Sound.playChime();
      landingScene?.classList.add('scene-hidden');
      setTimeout(() => {
        mainNavBar?.classList.add('nav-active');
        this.switchTab('create');
      }, 180);
    };

    enterButtons.forEach((btn) => {
      btn.addEventListener('click', handleEnterDiscover);
    });

    enterWorkshopButtons.forEach((btn) => {
      btn.addEventListener('click', handleEnterWorkshop);
    });

    // Bấm nút "Về Tiền Sảnh" từ topbar canvas
    btnBackLanding?.addEventListener('click', () => {
      Sound.playClick();
      mainNavBar?.classList.remove('nav-active');
      document.getElementById('create-scene')?.classList.remove('scene-active');
      document.getElementById('discover-scene')?.classList.remove('scene-active');
      document.getElementById('lookbook-scene')?.classList.remove('scene-active');
      document.getElementById('result-scene')?.classList.remove('scene-active');
      setTimeout(() => {
        landingScene?.classList.remove('scene-hidden');
      }, 150);
    });

    // Bấm logo để về lại Tiền sảnh 3D
    btnNavHome?.addEventListener('click', () => {
      Sound.playClick();
      mainNavBar?.classList.remove('nav-active');
      document.getElementById('create-scene')?.classList.remove('scene-active');
      document.getElementById('discover-scene')?.classList.remove('scene-active');
      document.getElementById('lookbook-scene')?.classList.remove('scene-active');
      document.getElementById('result-scene')?.classList.remove('scene-active');
      setTimeout(() => {
        landingScene?.classList.remove('scene-hidden');
      }, 150);
    });
  }

  private setupTabs(): void {
    const tabCreateBtn = document.getElementById('tab-create');
    const tabDiscoverBtn = document.getElementById('tab-discover');
    const tabLookbookBtn = document.getElementById('tab-lookbook');
    const btnOpenWardrobe = document.getElementById('btn-open-wardrobe');
    const btnEmptyDiscover = document.getElementById('btn-empty-discover');

    tabCreateBtn?.addEventListener('click', () => {
      Sound.playClick();
      this.switchTab('create');
    });

    tabDiscoverBtn?.addEventListener('click', () => {
      Sound.playClick();
      this.switchTab('discover');
    });

    tabLookbookBtn?.addEventListener('click', () => {
      Sound.playClick();
      this.switchTab('lookbook');
    });

    btnOpenWardrobe?.addEventListener('click', () => {
      Sound.playClick();
      this.switchTab('lookbook');
    });

    btnEmptyDiscover?.addEventListener('click', () => {
      wardrobeManager.closeWardrobe();
      this.switchTab('discover');
    });
  }
}

export const appRouter = new AppRouter();
