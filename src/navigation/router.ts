import { DiscoveryOutfit } from '../types/index.ts';
import { Sound } from '../audio/sound.ts';
import { preferenceEngine } from '../discover/preferenceLearning.ts';
import { swipeEngine, DISCOVERY_OUTFITS_POOL } from '../discover/swipeEngine.ts';
import { wardrobeManager } from '../discover/wardrobeManager.ts';
import { garmentEngine } from '../workshop/garmentEngine.ts';
import { lookbookEngine } from '../lookbook/lookbookEngine.ts';
import { feedbackState } from '../services/feedbackState.ts';
import { adminEngine } from '../admin/adminEngine.ts';

export class AppRouter {
  private hasInitialWorkshopLoaded = false;

  public init(): void {
    this.setupSceneNavigation();
    this.setupTabs();
    this.setupMobileDropdown();
    this.setupFeedbackDemos();
  }

  private setupMobileDropdown(): void {
    const toggleBtn = document.getElementById('btn-mobile-nav-toggle');
    const backdrop = document.getElementById('nav-dropdown-backdrop');
    const dropdownMenu = document.getElementById('nav-mobile-dropdown-menu');
    const dropdownHome = document.getElementById('btn-dropdown-home');
    const dropdownAdmin = document.getElementById('btn-open-admin-route');
    const dropdownItems = document.querySelectorAll('.nav-dropdown-item');

    toggleBtn?.addEventListener('click', () => {
      Sound.playClick();
      const isOpen = dropdownMenu?.classList.contains('dropdown-open');
      if (isOpen) {
        this.closeMobileDropdown();
      } else {
        this.openMobileDropdown();
      }
    });

    backdrop?.addEventListener('click', () => {
      Sound.playClick();
      this.closeMobileDropdown();
    });

    dropdownItems.forEach((item) => {
      item.addEventListener('click', (e) => {
        Sound.playClick();
        const targetTab = (e.currentTarget as HTMLElement).dataset.tabTarget as
          | 'create'
          | 'pattern'
          | 'discover'
          | 'lookbook';
        if (targetTab) {
          this.switchTab(targetTab);
          this.closeMobileDropdown();
        }
      });
    });

    dropdownHome?.addEventListener('click', () => {
      Sound.playClick();
      this.closeMobileDropdown();
      document.getElementById('btn-nav-home')?.click();
    });

    dropdownAdmin?.addEventListener('click', () => {
      Sound.playClick();
      this.closeMobileDropdown();
      adminEngine.openAdminScene();
    });
  }

  public openMobileDropdown(): void {
    const toggleBtn = document.getElementById('btn-mobile-nav-toggle');
    const dropdownMenu = document.getElementById('nav-mobile-dropdown-menu');
    toggleBtn?.setAttribute('aria-expanded', 'true');
    dropdownMenu?.classList.add('dropdown-open');
    dropdownMenu?.setAttribute('aria-hidden', 'false');
  }

  public closeMobileDropdown(): void {
    const toggleBtn = document.getElementById('btn-mobile-nav-toggle');
    const dropdownMenu = document.getElementById('nav-mobile-dropdown-menu');
    toggleBtn?.setAttribute('aria-expanded', 'false');
    dropdownMenu?.classList.remove('dropdown-open');
    dropdownMenu?.setAttribute('aria-hidden', 'true');
  }

  public switchTab(tabName: 'create' | 'pattern' | 'discover' | 'lookbook'): void {
    const createScene = document.getElementById('create-scene');
    const patternScene = document.getElementById('pattern-scene');
    const discoverScene = document.getElementById('discover-scene');
    const lookbookScene = document.getElementById('lookbook-scene');
    const resultScene = document.getElementById('result-scene');

    const tabCreateBtn = document.getElementById('tab-create');
    const tabPatternBtn = document.getElementById('tab-pattern');
    const tabDiscoverBtn = document.getElementById('tab-discover');
    const tabLookbookBtn = document.getElementById('tab-lookbook');

    const mobileIcon = document.getElementById('mobile-current-tab-icon');
    const mobileName = document.getElementById('mobile-current-tab-name');
    const dropdownItems = document.querySelectorAll('.nav-dropdown-item');

    resultScene?.classList.remove('scene-active');

    // Tắt active toàn bộ scene
    createScene?.classList.remove('scene-active');
    patternScene?.classList.remove('scene-active');
    discoverScene?.classList.remove('scene-active');
    lookbookScene?.classList.remove('scene-active');

    // Tắt active toàn bộ tabs
    tabCreateBtn?.classList.remove('active');
    tabPatternBtn?.classList.remove('active');
    tabDiscoverBtn?.classList.remove('active');
    tabLookbookBtn?.classList.remove('active');

    // Cập nhật trạng thái dropdown items
    dropdownItems.forEach((item) => {
      const el = item as HTMLElement;
      if (el.dataset.tabTarget === tabName) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    if (tabName === 'create') {
      tabCreateBtn?.classList.add('active');
      createScene?.classList.add('scene-active');
      if (mobileIcon) mobileIcon.textContent = '🎨';
      if (mobileName) mobileName.textContent = 'Xưởng Phối';

      // Khởi tạo phối đồ lần đầu tiên theo gu đã tích lũy (không ghi đè nếu người dùng đang phối dở)
      if (!this.hasInitialWorkshopLoaded) {
        this.hasInitialWorkshopLoaded = true;
        const { topColor, topGarment, topEvent } = preferenceEngine.getTopPreferences();
        garmentEngine.setFabricColor(topColor);
        garmentEngine.setGarment(topGarment);
        garmentEngine.setAccessory('QUAT_GIAY', true);
        garmentEngine.callCulturalAI(topEvent, topColor, topGarment, 'QUAT_GIAY');
      }
    } else if (tabName === 'pattern') {
      tabPatternBtn?.classList.add('active');
      patternScene?.classList.add('scene-active');
      if (mobileIcon) mobileIcon.textContent = '❖';
      if (mobileName) mobileName.textContent = 'Hoa Văn';
    } else if (tabName === 'discover') {
      tabDiscoverBtn?.classList.add('active');
      discoverScene?.classList.add('scene-active');
      if (mobileIcon) mobileIcon.textContent = '📜';
      if (mobileName) mobileName.textContent = 'Khám Phá';

      swipeEngine.currentDeck = preferenceEngine.sortDeckByPreference(
        swipeEngine.currentDeck.length > 0 ? swipeEngine.currentDeck : DISCOVERY_OUTFITS_POOL
      );
      swipeEngine.renderDeckStack();
    } else if (tabName === 'lookbook') {
      tabLookbookBtn?.classList.add('active');
      lookbookScene?.classList.add('scene-active');
      if (mobileIcon) mobileIcon.textContent = '📖';
      if (mobileName) mobileName.textContent = 'Lookbook';

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

    // Bấm xem Khám phá thực tế từ màn hình Kết quả (khi không có demo)
    document.getElementById('btn-result-goto-discover')?.addEventListener('click', () => {
      Sound.playClick();
      document.getElementById('result-scene')?.classList.remove('scene-active');
      setTimeout(() => {
        this.switchTab('discover');
      }, 150);
    });

    // Nút Back từ cột Insight (layout mới không có stage tier)
    document.getElementById('btn-back-landing-insight')?.addEventListener('click', () => {
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
      document.getElementById('pattern-scene')?.classList.remove('scene-active');
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
    const tabPatternBtn = document.getElementById('tab-pattern');
    const tabDiscoverBtn = document.getElementById('tab-discover');
    const tabLookbookBtn = document.getElementById('tab-lookbook');
    const btnOpenWardrobe = document.getElementById('btn-open-wardrobe');
    const btnEmptyDiscover = document.getElementById('btn-empty-discover');

    tabCreateBtn?.addEventListener('click', () => {
      Sound.playClick();
      this.switchTab('create');
    });

    tabPatternBtn?.addEventListener('click', () => {
      Sound.playClick();
      this.switchTab('pattern');
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

    // Tab Profile — mở modal hồ sơ cá nhân
    const openProfile = () => {
      const modal = document.getElementById('profile-modal');
      if (!modal) return;
      // Nạp dữ liệu đã lưu
      try {
        const saved = localStorage.getItem('viet_y_user_profile');
        if (saved) {
          const profile = JSON.parse(saved);
          (document.getElementById('profile-name') as HTMLInputElement).value = profile.name || '';
          (document.getElementById('profile-height') as HTMLInputElement).value = profile.height || '';
          (document.getElementById('profile-weight') as HTMLInputElement).value = profile.weight || '';
          (document.getElementById('profile-shape') as HTMLInputElement).value = profile.shape || '';
          (document.getElementById('profile-skin') as HTMLInputElement).value = profile.skin || '';
          (document.getElementById('profile-hair') as HTMLInputElement).value = profile.hair || '';
        }
      } catch (e) {}
      modal.style.display = 'flex';
    };

    document.getElementById('tab-profile')?.addEventListener('click', () => {
      Sound.playClick();
      openProfile();
    });

    document.getElementById('btn-mobile-profile')?.addEventListener('click', () => {
      Sound.playClick();
      openProfile();
      document.getElementById('nav-mobile-dropdown-menu')?.classList.remove('open');
    });

    // Đóng modal
    document.getElementById('btn-close-profile')?.addEventListener('click', () => {
      const modal = document.getElementById('profile-modal');
      if (modal) modal.style.display = 'none';
    });

    // Lưu profile vào localStorage
    document.getElementById('btn-save-profile')?.addEventListener('click', () => {
      const profile = {
        name: (document.getElementById('profile-name') as HTMLInputElement)?.value?.trim() || '',
        height: (document.getElementById('profile-height') as HTMLInputElement)?.value?.trim() || '',
        weight: (document.getElementById('profile-weight') as HTMLInputElement)?.value?.trim() || '',
        shape: (document.getElementById('profile-shape') as HTMLInputElement)?.value?.trim() || '',
        skin: (document.getElementById('profile-skin') as HTMLInputElement)?.value?.trim() || '',
        hair: (document.getElementById('profile-hair') as HTMLInputElement)?.value?.trim() || '',
      };
      localStorage.setItem('viet_y_user_profile', JSON.stringify(profile));
      const modal = document.getElementById('profile-modal');
      if (modal) modal.style.display = 'none';
      this.showToast(`✅ Đã lưu hồ sơ${profile.name ? ' của ' + profile.name : ''}! AI sẽ tư vấn phù hợp hơn.`);
      Sound.playChime();
    });

    // Đóng modal khi bấm ra ngoài backdrop
    document.getElementById('profile-modal')?.addEventListener('click', (e) => {
      if (e.target === document.getElementById('profile-modal')) {
        (document.getElementById('profile-modal') as HTMLElement).style.display = 'none';
      }
    });
  }
}

export const appRouter = new AppRouter();
