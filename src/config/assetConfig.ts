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

class AssetConfigManager {
  private cdnBase: string = '';

  constructor() {
    this.initCdnBase();
  }

  private initCdnBase(): void {
    try {
      // 1. Kiểm tra localStorage cấu hình người dùng
      const savedBase = localStorage.getItem('viet_y_cdn_base');
      if (savedBase && savedBase.trim()) {
        this.cdnBase = savedBase.trim().replace(/\/+$/, '');
        return;
      }

      // 2. Kiểm tra biến toàn cục window (nếu có nhúng từ script)
      const windowBase = (window as any).__VIET_Y_CDN_BASE__;
      if (windowBase && typeof windowBase === 'string') {
        this.cdnBase = windowBase.trim().replace(/\/+$/, '');
        return;
      }

      // 3. Kiểm tra env Vite (nếu được khai báo)
      const envBase = (import.meta as any).env?.VITE_CDN_BASE_URL;
      if (envBase && typeof envBase === 'string') {
        this.cdnBase = envBase.trim().replace(/\/+$/, '');
        return;
      }
    } catch {
      // Fallback an toàn nếu ở môi trường sandbox khắt khe
    }
  }

  /**
   * Cấu hình kho lưu trữ GitHub và nhánh để tạo link jsDelivr CDN
   * Ví dụ: setCdnRepo('nguyenvana', 'viet-y-assets', 'main')
   * Kết quả: https://cdn.jsdelivr.net/gh/nguyenvana/viet-y-assets@main/public
   */
  public setCdnRepo(user: string, repo: string, branch: string = 'main', publicSubfolder: string = 'public'): void {
    const cleanUser = user.trim();
    const cleanRepo = repo.trim();
    const cleanBranch = branch.trim() || 'main';
    const sub = publicSubfolder ? `/${publicSubfolder.replace(/^\/+|\/+$/g, '')}` : '';

    this.cdnBase = `https://cdn.jsdelivr.net/gh/${cleanUser}/${cleanRepo}@${cleanBranch}${sub}`;
    try {
      localStorage.setItem('viet_y_cdn_base', this.cdnBase);
    } catch {}
  }

  /**
   * Xóa cấu hình CDN để quay về dùng đường dẫn cục bộ (/images/...)
   */
  public resetToLocal(): void {
    this.cdnBase = '';
    try {
      localStorage.removeItem('viet_y_cdn_base');
    } catch {}
  }

  /**
   * Trả về đường dẫn CDN hiện tại nếu có
   */
  public getCdnBase(): string {
    return this.cdnBase;
  }

  /**
   * Tạo URL hoàn chỉnh từ đường dẫn tương đối (ví dụ: '/images/garments/ao-ngu-than.png')
   */
  public resolveAssetUrl(relativePath: string): string {
    const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
    if (this.cdnBase) {
      return `${this.cdnBase}${cleanPath}`;
    }
    return cleanPath;
  }

  /**
   * Đường dẫn ảnh theo từng dáng áo
   */
  public getGarmentImageUrl(garmentKey: string): string {
    const GARMENT_FILE_MAP: Record<string, string> = {
      AO_NGU_THAN: '/images/garments/ao-ngu-than.png',
      AO_TAC: '/images/garments/ao-tac.png',
      AO_NHAT_BINH: '/images/garments/ao-nhat-binh.png',
      AO_TU_THAN: '/images/garments/ao-tu-than.png',
      AO_BA_BA: '/images/garments/ao-ba-ba.png',
      AO_DAI_LEMUR: '/images/garments/ao-dai-lemur.png',
      // Dáng áo sắp ra mắt
      AO_GIAO_LINH: '/images/garments/ao-giao-linh.png',
      AO_VIEN_LINH: '/images/garments/ao-vien-linh.png',
      AO_DOI_KHAM: '/images/garments/ao-doi-kham.png',
    };

    const localPath = GARMENT_FILE_MAP[garmentKey] || '/images/garments/ao-ngu-than.png';
    return this.resolveAssetUrl(localPath);
  }

  /**
   * Đường dẫn ảnh hoa văn di sản
   */
  public getPatternImageUrl(filename: string): string {
    const cleanFilename = filename.replace(/^\/?(images\/patterns\/)?/, '');
    return this.resolveAssetUrl(`/images/patterns/${cleanFilename}`);
  }

  /**
   * Gắn xử lý fallback thông minh: nếu URL CDN lỗi 404, tự động chuyển về local hoặc ẩn đi
   */
  public attachSafeImageLoad(
    img: HTMLImageElement,
    primaryUrl: string,
    fallbackLocalUrl?: string,
    onAllFailed?: () => void
  ): void {
    img.src = primaryUrl;
    img.onerror = () => {
      // Nếu đang dùng CDN và bị lỗi, thử fallback về local
      if (this.cdnBase && fallbackLocalUrl && img.src !== fallbackLocalUrl) {
        img.src = fallbackLocalUrl;
        return;
      }
      if (onAllFailed) {
        onAllFailed();
      }
    };
  }
}

export const assetConfig = new AssetConfigManager();
