import { DiscoveryOutfit } from '../types/index.ts';
import { Sound } from '../audio/sound.ts';
import { preferenceEngine } from '../discover/preferenceLearning.ts';
import { swipeEngine, DISCOVERY_OUTFITS_POOL } from '../discover/swipeEngine.ts';
import { wardrobeManager } from '../discover/wardrobeManager.ts';
import { garmentEngine } from '../workshop/garmentEngine.ts';

export class AppRouter {
  public init(): void {
    this.setupSceneNavigation();
    this.setupTabs();
  }

  public switchTab(tabName: 'create' | 'discover'): void {
    const createScene = document.getElementById('create-scene');
    const discoverScene = document.getElementById('discover-scene');
    const tabCreateBtn = document.getElementById('tab-create');
    const tabDiscoverBtn = document.getElementById('tab-discover');

    if (tabName === 'create') {
      tabCreateBtn?.classList.add('active');
      tabDiscoverBtn?.classList.remove('active');

      discoverScene?.classList.remove('scene-active');
      createScene?.classList.add('scene-active');

      // Vòng lặp Khép kín: Áp dụng Gu Thẩm Mỹ cá nhân cao nhất vào Xưởng Phối
      const { topColor, topGarment, topEvent } = preferenceEngine.getTopPreferences();

      garmentEngine.setFabricColor(topColor);
      garmentEngine.setGarment(topGarment);
      garmentEngine.setAccessory('QUAT_GIAY', true);
      garmentEngine.callCulturalAI(topEvent, topColor, topGarment, 'QUAT_GIAY');

      this.showToast('🎯 Đã đồng bộ gu thẩm mỹ cá nhân của bạn vào Xưởng Phối!');
    } else if (tabName === 'discover') {
      tabDiscoverBtn?.classList.add('active');
      tabCreateBtn?.classList.remove('active');

      createScene?.classList.remove('scene-active');
      discoverScene?.classList.add('scene-active');

      swipeEngine.currentDeck = preferenceEngine.sortDeckByPreference(
        swipeEngine.currentDeck.length > 0 ? swipeEngine.currentDeck : DISCOVERY_OUTFITS_POOL
      );
      swipeEngine.renderDeckStack();
    }
  }

  public remixToWorkshop(outfit: DiscoveryOutfit): void {
    this.switchTab('create');

    setTimeout(() => {
      garmentEngine.setFabricColor(outfit.color, outfit.colorName);
      garmentEngine.setGarment(outfit.garment);
      garmentEngine.setAccessory(outfit.accessory, true);
      garmentEngine.callCulturalAI(outfit.event, outfit.color, outfit.garment, outfit.accessory);

      this.showToast(`Đã chuyển bộ "${outfit.title}" về Xưởng Phối để bạn remix!`);
    }, 200);
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
    const createScene = document.getElementById('create-scene');
    const discoverScene = document.getElementById('discover-scene');
    const mainNavBar = document.getElementById('main-nav-bar');
    const btnEnter = document.getElementById('btn-enter');
    const btnBackLanding = document.getElementById('btn-back-landing');
    const btnNavHome = document.getElementById('btn-nav-home');

    // Bấm nút "KHAI ẤN PHỐI ĐỒ"
    btnEnter?.addEventListener('click', () => {
      Sound.playChime();
      landingScene?.classList.add('scene-hidden');
      setTimeout(() => {
        mainNavBar?.classList.add('nav-active');
        createScene?.classList.add('scene-active');
      }, 150);
    });

    // Bấm nút "Về Tiền Sảnh" từ topbar canvas
    btnBackLanding?.addEventListener('click', () => {
      Sound.playClick();
      mainNavBar?.classList.remove('nav-active');
      createScene?.classList.remove('scene-active');
      setTimeout(() => {
        landingScene?.classList.remove('scene-hidden');
      }, 150);
    });

    // Bấm logo để về lại Tiền sảnh 3D
    btnNavHome?.addEventListener('click', () => {
      Sound.playClick();
      mainNavBar?.classList.remove('nav-active');
      createScene?.classList.remove('scene-active');
      discoverScene?.classList.remove('scene-active');
      setTimeout(() => {
        landingScene?.classList.remove('scene-hidden');
      }, 150);
    });
  }

  private setupTabs(): void {
    const tabCreateBtn = document.getElementById('tab-create');
    const tabDiscoverBtn = document.getElementById('tab-discover');
    const btnEmptyDiscover = document.getElementById('btn-empty-discover');

    tabCreateBtn?.addEventListener('click', () => {
      Sound.playClick();
      this.switchTab('create');
    });

    tabDiscoverBtn?.addEventListener('click', () => {
      Sound.playClick();
      this.switchTab('discover');
    });

    btnEmptyDiscover?.addEventListener('click', () => {
      wardrobeManager.closeWardrobe();
      this.switchTab('discover');
    });
  }
}

export const appRouter = new AppRouter();
