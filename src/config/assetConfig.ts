/**
 * VIỆT Y REMIX — HỆ THỐNG QUẢN LÝ TÀI NGUYÊN HÌNH ẢNH (ASSET & CDN CONFIG)
 * 
 * Hỗ trợ chuyển đổi linh hoạt giữa:
 * 1. Chế độ CDN (GitHub + jsDelivr): Tối ưu tải nhanh, không nặng file build, an toàn khi demo.
 * 2. Chế độ Local (/public/images/...): Chạy offline / dev nội bộ.
 * 
 * Người dùng có thể cấu hình CDN bằng 1 trong các cách:
 * - Gọi: assetConfig.setCdnRepo('username', 'repo-name', 'main')
 * - Lưu vào localStorage: 'viet_y_cdn_base'
 * - Biến môi trường Vite: VITE_CDN_BASE_URL
 */

export interface CdnSettings {
  enabled: boolean;
  user: string;
  repo: string;
  branch: string;
  customBaseUrl?: string;
}

export const DEFAULT_GITHUB_CDN_BASE = 'https://cdn.jsdelivr.net/gh/Nguyen-Tung-An/llgv-assets-demo@main/public';
export const DEFAULT_GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/Nguyen-Tung-An/llgv-assets-demo/main/public';

class AssetConfigManager {
  private cdnBase: string = DEFAULT_GITHUB_CDN_BASE;
  private rawBase: string = DEFAULT_GITHUB_RAW_BASE;

  constructor() {
    this.initCdnBase();
  }

  /**
   * Chuẩn hóa mọi dạng đường dẫn GitHub (link web github.com/tree/..., link jsDelivr thiếu /public, v.v.)
   * về đúng gốc CDN chứa thư mục /images/...
   */
  private normalizeCdnUrl(inputUrl: string): string {
    const trimmed = inputUrl.trim().replace(/\/+$/, '');
    if (!trimmed) return DEFAULT_GITHUB_CDN_BASE;

    // Nếu người dùng dán link giao diện web GitHub:
    // Ví dụ: https://github.com/Nguyen-Tung-An/llgv-assets-demo/tree/main/public/images/garments/curated
    const ghWebMatch = trimmed.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)(?:\/tree\/([^/]+))?/i);
    if (ghWebMatch) {
      const user = ghWebMatch[1];
      const repo = ghWebMatch[2];
      const branch = ghWebMatch[3] || 'main';
      this.rawBase = `https://raw.githubusercontent.com/${user}/${repo}/${branch}/public`;
      return `https://cdn.jsdelivr.net/gh/${user}/${repo}@${branch}/public`;
    }

    // Nếu là link jsDelivr tới repo nhưng cắt ở /images/... hoặc thiếu /public
    const jsDelivrMatch = trimmed.match(/^(https?:\/\/cdn\.jsdelivr\.net\/gh\/[^/]+\/[^/@]+@[^/]+)(?:\/public)?(?:\/images.*)?$/i);
    if (jsDelivrMatch) {
      return `${jsDelivrMatch[1]}/public`;
    }

    return trimmed;
  }

  private initCdnBase(): void {
    try {
      // 0. Nếu người dùng chủ động tắt CDN để test local
      const localModeForced = localStorage.getItem('viet_y_cdn_disabled') === 'true';
      if (localModeForced) {
        this.cdnBase = '';
        return;
      }

      // 1. Kiểm tra localStorage cấu hình người dùng
      const savedBase = localStorage.getItem('viet_y_cdn_base');
      if (savedBase && savedBase.trim()) {
        this.cdnBase = this.normalizeCdnUrl(savedBase);
        return;
      }

      // 2. Kiểm tra biến toàn cục window (nếu có nhúng từ script)
      const windowBase = (window as any).__VIET_Y_CDN_BASE__;
      if (windowBase && typeof windowBase === 'string' && windowBase.trim()) {
        this.cdnBase = this.normalizeCdnUrl(windowBase);
        return;
      }

      // 3. Kiểm tra env Vite (nếu được khai báo)
      const envBase = (import.meta as any).env?.VITE_CDN_BASE_URL;
      if (envBase && typeof envBase === 'string' && envBase.trim()) {
        this.cdnBase = this.normalizeCdnUrl(envBase);
        return;
      }

      // 4. Mặc định kết nối thẳng tới kho tài nguyên CDN GitHub chính thức của dự án
      this.cdnBase = DEFAULT_GITHUB_CDN_BASE;
    } catch {
      this.cdnBase = DEFAULT_GITHUB_CDN_BASE;
    }
  }

  /**
   * Cấu hình kho lưu trữ GitHub và nhánh để tạo link jsDelivr CDN
   * Ví dụ: setCdnRepo('Nguyen-Tung-An', 'llgv-assets-demo', 'main')
   * Kết quả: https://cdn.jsdelivr.net/gh/Nguyen-Tung-An/llgv-assets-demo@main/public
   */
  public setCdnRepo(user: string, repo: string, branch: string = 'main', publicSubfolder: string = 'public'): void {
    const cleanUser = user.trim();
    const cleanRepo = repo.trim();
    const cleanBranch = branch.trim() || 'main';
    const sub = publicSubfolder ? `/${publicSubfolder.replace(/^\/+|\/+$/g, '')}` : '';

    this.cdnBase = `https://cdn.jsdelivr.net/gh/${cleanUser}/${cleanRepo}@${cleanBranch}${sub}`;
    this.rawBase = `https://raw.githubusercontent.com/${cleanUser}/${cleanRepo}/${cleanBranch}${sub}`;
    try {
      localStorage.removeItem('viet_y_cdn_disabled');
      localStorage.setItem('viet_y_cdn_base', this.cdnBase);
    } catch {}
  }

  /**
   * Xóa cấu hình CDN để quay về dùng đường dẫn cục bộ (/images/...)
   */
  public resetToLocal(): void {
    this.cdnBase = '';
    try {
      localStorage.setItem('viet_y_cdn_disabled', 'true');
      localStorage.removeItem('viet_y_cdn_base');
    } catch {}
  }

  /**
   * Khôi phục về CDN mặc định trên GitHub
   */
  public restoreDefaultCdn(): void {
    this.cdnBase = DEFAULT_GITHUB_CDN_BASE;
    this.rawBase = DEFAULT_GITHUB_RAW_BASE;
    try {
      localStorage.removeItem('viet_y_cdn_disabled');
      localStorage.setItem('viet_y_cdn_base', this.cdnBase);
    } catch {}
  }

  /**
   * Trả về đường dẫn CDN hiện tại nếu có
   */
  public getCdnBase(): string {
    return this.cdnBase;
  }

  /**
   * Tạo URL hoàn chỉnh từ đường dẫn tương đối (ví dụ: '/images/garments/curated/garment_ngu_than_01.webp')
   * Tự động nhận diện nếu đầu vào đã là full URL (http/https/data:) để không bị nối lặp.
   */
  public resolveAssetUrl(relativePath: string): string {
    if (!relativePath) return '';
    const trimmed = relativePath.trim();
    if (/^(https?:\/\/|data:|blob:)/i.test(trimmed)) {
      return trimmed;
    }
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    if (this.cdnBase) {
      return `${this.cdnBase}${cleanPath}`;
    }
    return cleanPath;
  }

  /**
   * Tạo URL dự phòng trực tiếp từ GitHub Raw (không bị trễ cache 24h của jsDelivr khi vừa push ảnh mới)
   */
  public resolveRawGithubUrl(relativePath: string): string {
    if (!relativePath) return '';
    const trimmed = relativePath.trim();
    if (/^(data:|blob:)/i.test(trimmed)) {
      return trimmed;
    }
    // Nếu đầu vào đã là URL jsDelivr, chuyển sang đường dẫn tương đối để ghép vào rawBase
    const stripped = trimmed.replace(/^https?:\/\/cdn\.jsdelivr\.net\/gh\/[^/]+\/[^/@]+@[^/]+\/public/i, '');
    if (/^https?:\/\//i.test(stripped)) {
      return stripped;
    }
    const cleanPath = stripped.startsWith('/') ? stripped : `/${stripped}`;
    return `${this.rawBase}${cleanPath}`;
  }

  /**
   * Tạo đường dẫn chuẩn tới ảnh bộ phối trong thư mục /images/garments/curated/ theo mã CDN ID
   * Ví dụ: 'garment_ngu_than_01' -> '.../public/images/garments/curated/garment_ngu_than_01.webp'
   */
  public getCuratedOutfitImageUrl(cdnIdOrPath: string): string {
    if (!cdnIdOrPath) return '';
    const clean = cdnIdOrPath.trim();
    if (clean.includes('/')) {
      return this.resolveAssetUrl(clean);
    }
    const filename = clean.endsWith('.webp') ? clean : `${clean}.webp`;
    return this.resolveAssetUrl(`/images/garments/curated/${filename}`);
  }

  /**
   * Ảnh đại diện mặc định cho từng dáng áo (trỏ thẳng vào bộ 01 trong /images/garments/curated/
   * dùng cho thumbnail bảng So Sánh khi bộ đồ tự phối ở Xưởng chưa có ảnh riêng)
   */
  public getGarmentImageUrl(garmentKey: string): string {
    const CURATED_REPRESENTATIVE_MAP: Record<string, string> = {
      AO_NGU_THAN: '/images/garments/curated/garment_ngu_than_01.webp',
      AO_TAC: '/images/garments/curated/garment_tac_01.webp',
      AO_NHAT_BINH: '/images/garments/curated/garment_nhat_binh_01.webp',
      AO_TU_THAN: '/images/garments/curated/garment_tu_than_01.webp',
      AO_BA_BA: '/images/garments/curated/garment_ba_ba_01.webp',
      AO_DAI_LEMUR: '/images/garments/curated/garment_dai_lemur_01.webp',
    };

    const curatedPath = CURATED_REPRESENTATIVE_MAP[garmentKey] || '/images/garments/curated/garment_ngu_than_01.webp';
    return this.resolveAssetUrl(curatedPath);
  }

  /**
   * Đường dẫn ảnh hoa văn di sản
   */
  public getPatternImageUrl(filename: string): string {
    const cleanFilename = filename.replace(/^\/?(images\/patterns\/)?/, '');
    return this.resolveAssetUrl(`/images/patterns/${cleanFilename}`);
  }

  /**
   * Gắn xử lý tải ảnh an toàn:
   * 1. Thử tải từ jsDelivr CDN (primaryUrl)
   * 2. Nếu jsDelivr chưa kịp cập nhật cache sau khi push GitHub, tự động thử tải từ GitHub Raw (fallbackUrl)
   * 3. Nếu tổ hợp chưa được đẩy ảnh lên repo, gọi onAllFailed() để hiện khung Placeholder "Sao chép Prompt AI"
   */
  public attachSafeImageLoad(
    img: HTMLImageElement,
    primaryUrl: string,
    fallbackUrl?: string,
    onAllFailed?: () => void
  ): void {
    if (!primaryUrl) {
      if (onAllFailed) onAllFailed();
      return;
    }
    let triedFallback = false;
    img.onerror = () => {
      if (!triedFallback && fallbackUrl && img.src !== fallbackUrl) {
        triedFallback = true;
        img.src = fallbackUrl;
        return;
      }
      if (onAllFailed) {
        onAllFailed();
      }
    };
    img.src = primaryUrl;
  }

  /**
   * Đường dẫn video dải lụa bay Landing Page (CDN jsDelivr)
   */
  public getLandingSilkVideoUrl(): string {
    return 'https://cdn.jsdelivr.net/gh/Nguyen-Tung-An/llgv-assets-demo@main/public/element/landing-page/silk-loop.webm';
  }

  /**
   * Đường dẫn ảnh tĩnh dải lụa bay Landing Page (CDN jsDelivr)
   */
  public getLandingSilkStaticUrl(): string {
    return 'https://cdn.jsdelivr.net/gh/Nguyen-Tung-An/llgv-assets-demo@main/public/element/landing-page/silk-static.webp';
  }

  /**
   * Đường dẫn logo thương hiệu (CDN jsDelivr)
   */
  public getLogoUrl(): string {
    return 'https://cdn.jsdelivr.net/gh/Nguyen-Tung-An/llgv-assets-demo@main/public/element/logo.webp';
  }

  /**
   * Đường dẫn khung chạm khắc Cửa Võng (CDN jsDelivr)
   */
  public getCuaVongFrameUrl(): string {
    return 'https://cdn.jsdelivr.net/gh/Nguyen-Tung-An/llgv-assets-demo@main/public/element/cua-vong-frame.webp';
  }

  /**
   * Đường dẫn minh họa khung dệt rỗng (CDN jsDelivr)
   */
  public getEmptyLoomUrl(): string {
    return 'https://cdn.jsdelivr.net/gh/Nguyen-Tung-An/llgv-assets-demo@main/public/element/empty-loom.webp';
  }
}

export const assetConfig = new AssetConfigManager();
