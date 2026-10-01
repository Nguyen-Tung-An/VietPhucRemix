import { Sound } from '../audio/sound.ts';
import { fetchFashionImageAPI } from '../services/api.ts';

export class LookbookPipeline {
  private isProcessing = false;

  public async generateLookbook(assembledPrompt: string): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const overlay = document.getElementById('polishing-overlay');
    const stepText = document.getElementById('polishing-step-text');
    const btnGen = document.getElementById('btn-generate-ai-image') as HTMLButtonElement | null;
    const lookbookContainer = document.getElementById('ai-lookbook-container');
    const lookbookImg = document.getElementById('ai-lookbook-img') as HTMLImageElement | null;
    const svgEl = document.getElementById('nguthan-svg');
    const modePills = document.getElementById('artwork-mode-pills');
    const artworkFrame = document.getElementById('artwork-display-frame');
    const vintageBadge = document.getElementById('vintage-sketch-badge');

    // 1. Kích hoạt hiệu ứng Mài Vóc (Polishing Motion)
    if (overlay) {
      overlay.classList.remove('fade-out');
      overlay.classList.add('active');
    }
    if (btnGen) {
      btnGen.disabled = true;
      btnGen.innerHTML = `
        <span class="seal-badge seal-do" style="width:28px; height:28px; font-size:0.85rem; border-color:#E5A93C;">⏳</span>
        <span class="btn-ai-text">ĐANG MÀI VÓC LOOKBOOK...</span>
      `;
    }
    Sound.playChime();

    // Dòng chữ truyền cảm hứng mài vóc
    const polishingSteps = [
      'Nghệ nhân đang mài vóc lớp sơn, làm nét thần thái thời trang...',
      'Dát vàng thếp mờ trên từng nếp lụa tơ tằm...',
      'Hòa quyện ánh sáng tự nhiên trên phông giấy dó truyền thống...'
    ];
    let stepIdx = 0;
    const stepInterval = setInterval(() => {
      stepIdx = (stepIdx + 1) % polishingSteps.length;
      if (stepText) stepText.textContent = polishingSteps[stepIdx];
    }, 1800);

    // Cơ chế kiểm soát thời gian tối đa 6 giây (6-second Timeout Fallback)
    const controller = new AbortController();
    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 6000);

    let successImageUrl: string | null = null;

    try {
      successImageUrl = await fetchFashionImageAPI(assembledPrompt, controller.signal);
    } catch (err: unknown) {
      console.warn('Kết quả gọi API Lookbook AI:', timedOut ? 'Quá 6s -> Kích hoạt Fallback' : (err as Error).message);
    } finally {
      clearTimeout(timeoutId);
      clearInterval(stepInterval);
      this.isProcessing = false;
    }

    // 1. XỬ LÝ THÀNH CÔNG (PASS)
    if (successImageUrl) {
      await new Promise<void>((resolve) => {
        const testImg = new Image();
        testImg.onload = () => resolve();
        testImg.onerror = () => resolve();
        testImg.src = successImageUrl!;
      });

      if (lookbookImg) lookbookImg.src = successImageUrl;

      // Hiệu ứng Mài Vóc mờ dần (opacity -> 0) trong 0.8 giây
      if (overlay) {
        overlay.classList.add('fade-out');
        overlay.classList.remove('active');
      }

      setTimeout(() => {
        if (svgEl) svgEl.style.display = 'none';
        if (lookbookContainer) lookbookContainer.style.display = 'flex';
        if (modePills) modePills.style.display = 'inline-flex';
        if (vintageBadge) vintageBadge.style.display = 'none';
        if (artworkFrame) artworkFrame.classList.remove('do-paper-vintage');

        document.getElementById('btn-mode-sketch')?.classList.remove('active');
        document.getElementById('btn-mode-lookbook')?.classList.add('active');

        Sound.playChime();
        this.showToast('✨ Ảnh Lookbook Thời Trang AI mài vóc hoàn mỹ!');
      }, 800);
    } else {
      // 2. CƠ CHẾ DỰ PHÒNG (FALLBACK): 2D SVG Phác Thảo hiệu ứng giấy dó hoài cổ
      if (overlay) {
        overlay.classList.add('fade-out');
        overlay.classList.remove('active');
      }

      setTimeout(() => {
        if (lookbookContainer) lookbookContainer.style.display = 'none';
        if (svgEl) svgEl.style.display = 'block';
        if (artworkFrame) artworkFrame.classList.add('do-paper-vintage');
        if (vintageBadge) vintageBadge.style.display = 'inline-flex';
        if (modePills) modePills.style.display = 'none';

        Sound.playClick();
        this.showToast('Bản phác thảo nghệ thuật đã sẵn sàng dành cho bạn');
      }, 400);
    }

    if (btnGen) {
      btnGen.disabled = false;
      btnGen.innerHTML = `
        <span class="seal-badge seal-do" style="width:28px; height:28px; font-size:0.85rem; border-color:#E5A93C;">📸</span>
        <span class="btn-ai-text">TẠO ẢNH LOOKBOOK AI</span>
        <span class="btn-ai-sparkle">✨</span>
      `;
    }
  }

  public setupControls(): void {
    const btnToggleSketch = document.getElementById('btn-toggle-sketch-view');
    const btnDownloadLookbook = document.getElementById('btn-download-lookbook');
    const btnModeSketch = document.getElementById('btn-mode-sketch');
    const btnModeLookbook = document.getElementById('btn-mode-lookbook');
    const svgArtwork = document.getElementById('nguthan-svg');
    const lookbookContainer = document.getElementById('ai-lookbook-container');
    const lookbookImg = document.getElementById('ai-lookbook-img') as HTMLImageElement | null;

    if (btnToggleSketch) {
      btnToggleSketch.addEventListener('click', () => {
        Sound.playClick();
        if (svgArtwork) svgArtwork.style.display = 'block';
        if (lookbookContainer) lookbookContainer.style.display = 'none';
        if (btnModeSketch) btnModeSketch.classList.add('active');
        if (btnModeLookbook) btnModeLookbook.classList.remove('active');
      });
    }

    if (btnModeSketch) {
      btnModeSketch.addEventListener('click', () => {
        Sound.playClick();
        if (svgArtwork) svgArtwork.style.display = 'block';
        if (lookbookContainer) lookbookContainer.style.display = 'none';
        btnModeSketch.classList.add('active');
        if (btnModeLookbook) btnModeLookbook.classList.remove('active');
      });
    }

    if (btnModeLookbook) {
      btnModeLookbook.addEventListener('click', () => {
        Sound.playClick();
        if (lookbookImg && lookbookImg.src) {
          if (svgArtwork) svgArtwork.style.display = 'none';
          if (lookbookContainer) lookbookContainer.style.display = 'flex';
          btnModeLookbook.classList.add('active');
          if (btnModeSketch) btnModeSketch.classList.remove('active');
        }
      });
    }

    if (btnDownloadLookbook) {
      btnDownloadLookbook.addEventListener('click', () => {
        Sound.playChime();
        if (lookbookImg && lookbookImg.src) {
          const a = document.createElement('a');
          a.href = lookbookImg.src;
          a.download = `viet-y-lookbook-${Date.now()}.jpg`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          this.showToast('💾 Đã bắt đầu tải ảnh Lookbook AI!');
        }
      });
    }
  }

  private showToast(msg: string): void {
    const toast = document.getElementById('pref-sync-toast');
    const msgEl = document.getElementById('pref-sync-toast-msg');
    if (!toast) return;
    if (msgEl && msg) msgEl.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }
}

export const lookbookPipeline = new LookbookPipeline();
