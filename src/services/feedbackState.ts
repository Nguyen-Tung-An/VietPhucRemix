/**
 * VIỆT PHỤC REMIX — QUẢN LÝ TRẠNG THÁI TẢI & LỖI DÙNG CHUNG
 * Concept: "LỤA THANH"
 * 
 * Cung cấp 2 thành phần dùng chung cho toàn bộ app:
 * 1. TRẠNG THÁI ĐANG TẢI (Loading State):
 *    - Khối mềm hữu cơ Lụa Thanh co giãn nhẹ theo nhịp thở (@keyframes chu kỳ thật)
 *    - Dòng chữ nhỏ bên dưới thông báo đang xử lý với giọng điệu nhẹ nhàng
 *    - Tuyệt đối không dùng spinner xoay tròn thông thường
 * 
 * 2. TRẠNG THÁI LỖI (Error State):
 *    - Minh họa con thoi / cuộn tơ nghỉ ngơi nhẹ nhàng (không dùng màu đỏ gắt)
 *    - Dòng chữ ngắn gọn, thân thiện, không đổ lỗi cho người dùng (< 60 từ)
 *    - Nút "Thử lại" dạng pill màu Xanh Ngọc Đậm (#4A8577) trong thumb zone
 * 
 * Hỗ trợ 2 phiên bản giao diện tối ưu riêng biệt cho Mobile và Desktop.
 */

import { Sound } from '../audio/sound.ts';

export interface LoadingOptions {
  /** Thông điệp chính đang xử lý */
  message?: string;
  /** Dòng chú thích phụ (tùy chọn) */
  submessage?: string;
  /** ID hoặc phần tử container nếu muốn nhúng inline (mặc định hiển thị overlay toàn màn hình) */
  container?: HTMLElement | string | null;
  /** Cho phép hủy nếu xử lý quá lâu */
  allowCancel?: boolean;
  onCancel?: () => void;
}

export interface ErrorOptions {
  /** Tiêu đề lỗi nhẹ nhàng (mặc định: "Tơ Lụa Tạm Lắng") */
  title?: string;
  /** Nội dung giải thích thân thiện, không đổ lỗi */
  message?: string;
  /** Callback khi người dùng chạm nút "Thử lại" */
  onRetry?: () => void | Promise<void>;
  /** Nhãn nút thử lại (mặc định: "Thử Lại") */
  retryLabel?: string;
  /** Callback khi người dùng bấm nút Đóng / Để sau */
  onClose?: () => void;
  /** ID hoặc phần tử container nếu muốn nhúng inline */
  container?: HTMLElement | string | null;
  /** Cho phép đóng modal */
  allowDismiss?: boolean;
}

class FeedbackStateManager {
  private currentRetryHandler: (() => void | Promise<void>) | null = null;
  private currentCloseHandler: (() => void) | null = null;
  private currentCancelHandler: (() => void) | null = null;
  private keydownListenerAttached = false;

  public init(): void {
    this.bindGlobalEvents();
  }

  /**
   * Đăng ký sự kiện phím tắt (Desktop: Enter/R để thử lại, Esc để đóng)
   */
  private bindGlobalEvents(): void {
    if (this.keydownListenerAttached) return;

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      const errorOverlay = document.getElementById('global-error-overlay');
      const isErrorVisible = errorOverlay && errorOverlay.classList.contains('active');

      if (isErrorVisible) {
        if (e.key === 'Escape') {
          e.preventDefault();
          this.hideError();
          if (this.currentCloseHandler) this.currentCloseHandler();
        } else if (e.key === 'Enter' || e.key === 'r' || e.key === 'R') {
          // Kích hoạt thử lại nếu không gõ trong input
          const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
          if (targetTag !== 'input' && targetTag !== 'textarea') {
            e.preventDefault();
            this.handleRetry();
          }
        }
      }

      const loadingOverlay = document.getElementById('global-loading-overlay');
      const isLoadingVisible = loadingOverlay && loadingOverlay.classList.contains('active');
      if (isLoadingVisible && e.key === 'Escape' && this.currentCancelHandler) {
        e.preventDefault();
        this.hideLoading();
        this.currentCancelHandler();
      }
    });

    this.keydownListenerAttached = true;
  }

  /**
   * 1. HIỂN THỊ TRẠNG THÁI ĐANG TẢI (LOADING STATE)
   */
  public showLoading(options: LoadingOptions = {}): void {
    const {
      message = 'Đang dệt sắc lụa đương đại...',
      submessage = 'Không gian Lụa Thanh đang nắn nót từng nếp tơ...',
      container = null,
      allowCancel = false,
      onCancel
    } = options;

    this.currentCancelHandler = onCancel || null;

    if (container) {
      // Nhúng inline vào container chỉ định
      const targetEl = typeof container === 'string' ? document.getElementById(container) : container;
      if (targetEl) {
        targetEl.innerHTML = this.renderLoadingMarkup(message, submessage, allowCancel, true);
        this.bindInlineCancel(targetEl);
        return;
      }
    }

    // Hiển thị Overlay toàn cục
    const overlay = document.getElementById('global-loading-overlay');
    if (!overlay) return;

    const msgEl = overlay.querySelector('.lua-loading-msg');
    const subEl = overlay.querySelector('.lua-loading-sub');
    const cancelBtn = overlay.querySelector('.lua-loading-cancel-btn') as HTMLElement | null;

    if (msgEl) msgEl.textContent = message;
    if (subEl) {
      subEl.textContent = submessage;
      (subEl as HTMLElement).style.display = submessage ? 'block' : 'none';
    }

    if (cancelBtn) {
      cancelBtn.style.display = allowCancel ? 'inline-flex' : 'none';
      cancelBtn.onclick = () => {
        Sound.playClick();
        this.hideLoading();
        if (this.currentCancelHandler) this.currentCancelHandler();
      };
    }

    overlay.classList.remove('fade-out');
    overlay.classList.add('active');
    overlay.setAttribute('aria-busy', 'true');
  }

  /**
   * ẨN TRẠNG THÁI ĐANG TẢI
   */
  public hideLoading(container: HTMLElement | string | null = null): void {
    if (container) {
      const targetEl = typeof container === 'string' ? document.getElementById(container) : container;
      if (targetEl) {
        const inlineBox = targetEl.querySelector('.lua-feedback-inline-loading');
        if (inlineBox) inlineBox.remove();
        return;
      }
    }

    const overlay = document.getElementById('global-loading-overlay');
    if (!overlay) return;

    overlay.classList.add('fade-out');
    overlay.setAttribute('aria-busy', 'false');
    setTimeout(() => {
      overlay.classList.remove('active', 'fade-out');
    }, 280);
  }

  /**
   * 2. HIỂN THỊ TRẠNG THÁI LỖI (ERROR STATE)
   */
  public showError(options: ErrorOptions = {}): void {
    const {
      title = 'Tơ Lụa Tạm Lắng',
      message = 'Không gian tơ lụa tạm lắng trong giây lát. Tà lụa và sắc phục của bạn vẫn được lưu giữ an toàn, hãy thử kết nối lại nhé.',
      onRetry,
      retryLabel = 'Thử Lại',
      onClose,
      container = null,
      allowDismiss = true
    } = options;

    Sound.playError();
    this.currentRetryHandler = onRetry || null;
    this.currentCloseHandler = onClose || null;

    if (container) {
      // Nhúng inline vào container chỉ định
      const targetEl = typeof container === 'string' ? document.getElementById(container) : container;
      if (targetEl) {
        targetEl.innerHTML = this.renderErrorMarkup(title, message, retryLabel, allowDismiss, true);
        this.bindInlineErrorEvents(targetEl);
        return;
      }
    }

    // Hiển thị Overlay toàn cục
    const overlay = document.getElementById('global-error-overlay');
    if (!overlay) return;

    const titleEl = overlay.querySelector('.lua-error-title');
    const msgEl = overlay.querySelector('.lua-error-msg');
    const retryBtn = overlay.querySelector('.lua-error-retry-btn') as HTMLElement | null;
    const retryText = overlay.querySelector('.lua-retry-btn-text');
    const closeBtn = overlay.querySelector('.lua-error-close-btn') as HTMLElement | null;

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;
    if (retryText) retryText.textContent = retryLabel;

    if (retryBtn) {
      retryBtn.onclick = () => this.handleRetry();
    }

    if (closeBtn) {
      closeBtn.style.display = allowDismiss ? 'inline-flex' : 'none';
      closeBtn.onclick = () => {
        Sound.playClick();
        this.hideError();
        if (this.currentCloseHandler) this.currentCloseHandler();
      };
    }

    overlay.classList.remove('fade-out');
    overlay.classList.add('active');
  }

  /**
   * ẨN TRẠNG THÁI LỖI
   */
  public hideError(container: HTMLElement | string | null = null): void {
    if (container) {
      const targetEl = typeof container === 'string' ? document.getElementById(container) : container;
      if (targetEl) {
        const inlineBox = targetEl.querySelector('.lua-feedback-inline-error');
        if (inlineBox) inlineBox.remove();
        return;
      }
    }

    const overlay = document.getElementById('global-error-overlay');
    if (!overlay) return;

    overlay.classList.add('fade-out');
    setTimeout(() => {
      overlay.classList.remove('active', 'fade-out');
    }, 280);
  }

  /**
   * Xử lý hành động bấm "Thử Lại"
   */
  private async handleRetry(): Promise<void> {
    Sound.playClick();
    if (this.currentRetryHandler) {
      const handler = this.currentRetryHandler;
      this.hideError();
      try {
        await handler();
      } catch (err) {
        console.error('Lỗi khi thử lại tác vụ:', err);
      }
    } else {
      this.hideError();
    }
  }

  /**
   * Gắn sự kiện cho các nút trong inline Loading
   */
  private bindInlineCancel(container: HTMLElement): void {
    const cancelBtn = container.querySelector('.lua-loading-cancel-btn') as HTMLElement | null;
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        Sound.playClick();
        this.hideLoading(container);
        if (this.currentCancelHandler) this.currentCancelHandler();
      });
    }
  }

  /**
   * Gắn sự kiện cho các nút trong inline Error
   */
  private bindInlineErrorEvents(container: HTMLElement): void {
    const retryBtn = container.querySelector('.lua-error-retry-btn') as HTMLElement | null;
    const closeBtn = container.querySelector('.lua-error-close-btn') as HTMLElement | null;

    if (retryBtn) {
      retryBtn.addEventListener('click', () => this.handleRetry());
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        Sound.playClick();
        this.hideError(container);
        if (this.currentCloseHandler) this.currentCloseHandler();
      });
    }
  }

  /**
   * Tạo chuỗi HTML cho Trạng thái Đang Tải (dùng cho inline render hoặc component)
   */
  public renderLoadingMarkup(
    message: string = 'Đang dệt sắc lụa đương đại...',
    submessage: string = 'Không gian Lụa Thanh đang nắn nót từng nếp tơ...',
    allowCancel: boolean = false,
    isInline: boolean = false
  ): string {
    return `
      <div class="lua-feedback-box lua-loading-box ${isInline ? 'lua-feedback-inline-loading' : ''}" role="status" aria-live="polite">
        <!-- Khối mềm Lụa Thanh co giãn nhẹ theo nhịp thở (@keyframes chu kỳ thật) -->
        <div class="lua-blob-loading-stage" aria-hidden="true">
          <div class="lua-silk-loading-blob">
            <div class="lua-blob-silk-sheen"></div>
            <img src="https://cdn.jsdelivr.net/gh/Nguyen-Tung-An/llgv-assets-demo@main/public/element/logo.webp" alt="Lụa Là Gấm Vóc Logo" class="lua-blob-loading-img seal-badge-img" />
          </div>
        </div>

        <!-- Dòng chữ nhỏ bên dưới thông báo đang xử lý, giọng điệu nhẹ nhàng -->
        <div class="lua-loading-text-wrap">
          <p class="lua-loading-msg">${message}</p>
          ${submessage ? `<p class="lua-loading-sub">${submessage}</p>` : ''}
        </div>

        ${allowCancel ? `
          <button type="button" class="lua-loading-cancel-btn" aria-label="Hủy tác vụ">
            <span>Dừng xử lý</span>
          </button>
        ` : ''}
      </div>
    `;
  }

  /**
   * Tạo chuỗi HTML cho Trạng thái Lỗi (dùng cho inline render hoặc component)
   */
  public renderErrorMarkup(
    title: string = 'Tơ Lụa Tạm Lắng',
    message: string = 'Không gian tơ lụa tạm lắng trong giây lát. Tà lụa và sắc phục của bạn vẫn được lưu giữ an toàn, hãy thử kết nối lại nhé.',
    retryLabel: string = 'Thử Lại',
    allowDismiss: boolean = true,
    isInline: boolean = false
  ): string {
    return `
      <div class="lua-feedback-box lua-error-box ${isInline ? 'lua-feedback-inline-error' : ''}" role="alertdialog" aria-modal="true">
        
        <!-- Hình minh họa con thoi / cuộn tơ lụa nghỉ ngơi nhẹ nhàng (KHÔNG DÙNG ĐỎ GẮT) -->
        <div class="lua-error-illustration-box" aria-hidden="true">
          <svg class="lua-error-peaceful-svg" viewBox="0 0 140 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lua-thread-peaceful" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#F4C9D6" />
                <stop offset="100%" stop-color="#4A8577" />
              </linearGradient>
            </defs>
            <!-- Vầng ánh ngọc sương êm dịu làm nền -->
            <ellipse cx="70" cy="60" rx="55" ry="45" fill="rgba(74, 133, 119, 0.08)" />
            
            <!-- Con thoi dệt lụa gỗ mộc viền vàng đất thanh mảnh -->
            <path d="M 30,60 Q 70,44 110,60 Q 70,76 30,60 Z" fill="#E8F3EE" stroke="#C9A66B" stroke-width="1.8" />
            <circle cx="70" cy="60" r="5" fill="#4A8577" />
            <circle cx="70" cy="60" r="2.2" fill="#E8F3EE" />

            <!-- Sợi chỉ tơ tằm uốn lượn thanh tao chờ kết nối lại -->
            <path d="M 45,60 C 35,40 25,65 15,50" stroke="url(#lua-thread-peaceful)" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="3 3"/>
            <path d="M 95,60 C 105,75 115,50 125,68" stroke="url(#lua-thread-peaceful)" stroke-width="2" stroke-linecap="round" fill="none" stroke-dasharray="3 3"/>

            <!-- Đốm hoa sen cách điệu nhỏ -->
            <circle cx="28" cy="38" r="3" fill="#F4C9D6" opacity="0.8" />
            <circle cx="112" cy="82" r="3" fill="#F4C9D6" opacity="0.8" />
          </svg>
        </div>

        <!-- Dòng chữ giải thích ngắn gọn, thân thiện, không đổ lỗi cho người dùng (< 60 từ) -->
        <div class="lua-error-text-wrap">
          <h3 class="lua-error-title">${title}</h3>
          <p class="lua-error-msg">${message}</p>
        </div>

        <!-- Nút "Thử lại" dạng pill, màu Xanh Ngọc Đậm (#4A8577), đặt trong vùng an toàn ngón tay cái -->
        <div class="lua-error-actions-group">
          <button type="button" class="btn-pill-jade lua-error-retry-btn" aria-label="${retryLabel}">
            <svg class="lua-retry-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
            <span class="lua-retry-btn-text">${retryLabel}</span>
            <span class="lua-desktop-shortcut-hint" aria-hidden="true">(R / Enter)</span>
          </button>

          ${allowDismiss ? `
            <button type="button" class="lua-error-close-btn" aria-label="Để sau">
              <span>Để sau</span>
            </button>
          ` : ''}
        </div>

      </div>
    `;
  }
}

export const feedbackState = new FeedbackStateManager();
