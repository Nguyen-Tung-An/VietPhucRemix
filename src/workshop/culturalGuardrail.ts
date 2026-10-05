import { CulturalGuardrailResult } from '../types/index.ts';
import { Sound } from '../audio/sound.ts';

export const MOCK_HERITAGE_DATA: Record<string, CulturalGuardrailResult> = {
  tet: {
    is_culturally_accurate: true,
    warning_level: 'SAFE',
    cultural_warning_msg: '',
    suggested_fix: 'QUAT_GIAY',
    kieu_toc_va_trang_diem:
      'Tóc búi cao thanh nhã kết hợp trâm hoa mai đồng hoặc vấn khăn lụa gấm; trang điểm sắc cam đào ấm áp, điểm xuyết son đỏ tươi cánh sen rực rỡ đón xuân nghênh tài đón lộc.',
    dang_chup_anh:
      'Nghiêng người 45 độ, một tay khẽ xòe quạt giấy xếp ngang ngực, tay kia buông tà tự nhiên, ánh mắt nhìn nghiêng thanh thoát đón ánh sáng tự nhiên trên tà áo.',
    cau_chuyen_di_san:
      'Sắc Hồng Phấn Sen trên tà áo Ngũ Thân tượng trưng cho sự thanh nhã và cốt cách tươi mới. Năm cúc áo cài chéo nhắc nhở đạo hiếu và nếp nhà bền vững qua từng mùa Tết.'
  },
  grad: {
    is_culturally_accurate: true,
    warning_level: 'SAFE',
    cultural_warning_msg: '',
    suggested_fix: 'QUAT_GIAY',
    kieu_toc_va_trang_diem:
      'Tóc xõa tự nhiên kẹp gọn sau vành tai hoặc buộc thấp thanh lịch; phong cách trang điểm sương mai tông hồng đất tinh khôi, ánh mắt sắc nét tôn phong thái tri thức.',
    dang_chup_anh:
      'Đứng thẳng người đoan chính, hai tay nâng nhẹ cuốn kỷ yếu hoặc hoa tươi ngang eo, tà áo ngũ thân buông thẳng tắp tạo phom dáng cao ráo và vững chãi.',
    cau_chuyen_di_san:
      'Màu Xanh Ngọc Đậm thâm trầm như ngọc bích biểu trưng cho tri thức uyên bác và chí hướng thanh vân. Khoác áo ngũ thân trong ngày cử nghiệp là lời khẳng định bản lĩnh cội nguồn kiêu hãnh của Gen Z.'
  },
  temple: {
    is_culturally_accurate: true,
    warning_level: 'SAFE',
    cultural_warning_msg: '',
    suggested_fix: 'QUAT_GIAY',
    kieu_toc_va_trang_diem:
      'Tóc vấn khăn lươn gọn gàng hoặc buộc thấp mộc mạc; trang điểm thuần khiết mộc mạc, thoa son dưỡng nhẹ nhàng giữ trọn nét đoan trang tịch tĩnh giữa chốn thiền môn.',
    dang_chup_anh:
      'Hai tay chắp nhẹ trước ngực hoặc bước chậm khoan thai bên thềm đá rêu phong, nếp tà buông mềm mại giữ vẻ trang nghiêm, tĩnh tại và an nhiên.',
    cau_chuyen_di_san:
      'Rêu Đêm và Vàng Đất là gam màu trầm mặc của đất mẹ và cửa thiền, gợi nhắc tâm hồn hướng thiện và đức khiêm cung. Cấu trúc năm thân khép kín ôm lấy cơ thể tượng trưng cho sự chở che của tổ tiên và tứ thân phụ mẫu.'
  }
};

export function checkLocalCulturalRules(
  garment: string,
  accessory: string,
  _region: string = 'TOAN_QUOC'
): CulturalGuardrailResult {
  if (garment === 'AO_BA_BA' && accessory === 'NON_QUAI_THAO') {
    return {
      is_culturally_accurate: false,
      warning_level: 'WARNING',
      cultural_warning_msg: 'Nón quai thao là nét đặc trưng Bắc Bộ, thường không đi kèm Áo bà ba Nam Bộ.',
      suggested_fix: 'KHAN_RAN'
    };
  }
  if (garment === 'AO_NGU_THAN' && accessory === 'KHAN_RAN') {
    return {
      is_culturally_accurate: false,
      warning_level: 'WARNING',
      cultural_warning_msg: 'Khăn rằn gắn liền với Áo bà ba lao động, nên cân nhắc khi phối cùng Áo ngũ thân đĩnh đạc.',
      suggested_fix: 'QUAT_GIAY'
    };
  }
  return {
    is_culturally_accurate: true,
    warning_level: 'SAFE',
    cultural_warning_msg: '',
    suggested_fix: ''
  };
}

export class CulturalGuardrailManager {
  public currentState: CulturalGuardrailResult = {
    is_culturally_accurate: true,
    warning_level: 'SAFE',
    cultural_warning_msg: '',
    suggested_fix: 'QUAT_GIAY'
  };

  private onFixCallback: ((suggestedFix: string) => void) | null = null;

  public setup(onFix: (suggestedFix: string) => void): void {
    this.onFixCallback = onFix;
    const toastEl = document.getElementById('cultural-warning-toast');
    const backdropEl = document.getElementById('toast-backdrop');
    const btnCloseToast = document.getElementById('btn-close-toast');
    const btnFixCultural = document.getElementById('btn-fix-cultural');
    const btnKeepGenZ = document.getElementById('btn-keep-genz');
    const scrollBtn = document.getElementById('btn-scroll-warning');
    const card = document.getElementById('heritage-info-card');
    const badgeEl = document.getElementById('cultural-status-badge');

    const openToast = () => {
      Sound.playClick();
      toastEl?.classList.add('toast-open');
      backdropEl?.classList.add('active');
    };

    const closeToast = () => {
      toastEl?.classList.remove('toast-open');
      backdropEl?.classList.remove('active');
    };

    scrollBtn?.addEventListener('click', openToast);
    btnCloseToast?.addEventListener('click', closeToast);
    backdropEl?.addEventListener('click', closeToast);

    // Hành động 1: "Chỉnh về Chuẩn Văn Hóa"
    btnFixCultural?.addEventListener('click', () => {
      Sound.playChime();
      closeToast();
      card?.classList.remove('cultural-warning-border');
      scrollBtn?.classList.remove('visible');
      if (badgeEl) {
        badgeEl.className = 'cultural-status-badge cultural-seal-safe';
        badgeEl.innerHTML = '<span>✓ Việt Y Khớp Quy Chuẩn</span>';
      }
      if (this.onFixCallback) {
        this.onFixCallback(this.currentState.suggested_fix || 'QUAT_GIAY');
      }
    });

    // Hành động 2: "Giữ Góc Phá Cách Gen Z"
    btnKeepGenZ?.addEventListener('click', () => {
      Sound.playClick();
      closeToast();
      card?.classList.remove('cultural-warning-border');
      scrollBtn?.classList.remove('visible');
      if (badgeEl) {
        badgeEl.className = 'cultural-status-badge cultural-seal-genz';
        badgeEl.innerHTML = '<span>⚡ Góc Phá Cách Gen Z</span>';
      }
    });
  }

  public renderGuardrailUI(result: CulturalGuardrailResult): void {
    this.currentState = result;
    const card = document.getElementById('heritage-info-card');
    const badgeEl = document.getElementById('cultural-status-badge');
    const scrollBtn = document.getElementById('btn-scroll-warning');
    const toastMsg = document.getElementById('toast-warning-msg');
    const toastHint = document.getElementById('toast-fix-hint');

    const isWarning = result.warning_level === 'WARNING' || !result.is_culturally_accurate;

    if (isWarning) {
      if (card) card.classList.add('cultural-warning-border');
      if (scrollBtn) scrollBtn.classList.add('visible');
      if (badgeEl) {
        badgeEl.className = 'cultural-status-badge cultural-seal-warn';
        badgeEl.innerHTML = '<span>⚠ Lệch Quy Chuẩn Văn Hóa</span>';
      }
      if (toastMsg) {
        toastMsg.textContent =
          result.cultural_warning_msg || 'Tổ hợp trang phục và phụ kiện này có sự giao thoa chưa đồng nhất theo điển lễ thời kỳ.';
      }
      if (toastHint) {
        const fixName =
          result.suggested_fix === 'QUAT_GIAY'
            ? 'Quạt Giấy Xếp'
            : result.suggested_fix === 'KHAN_RAN'
            ? 'Khăn Rằn Nam Bộ'
            : 'Nón Quai Thao';
        toastHint.innerHTML = `💡 <strong>Gợi ý phục dựng:</strong> Chuyển về <strong>${fixName}</strong> để chuẩn mực nét duyên truyền thống.`;
      }
    } else {
      if (card) card.classList.remove('cultural-warning-border');
      if (scrollBtn) scrollBtn.classList.remove('visible');
      if (badgeEl) {
        badgeEl.className = 'cultural-status-badge cultural-seal-safe';
        badgeEl.innerHTML = '<span>✓ Việt Y Khớp Quy Chuẩn</span>';
      }
    }
  }
}

export const culturalGuardrail = new CulturalGuardrailManager();
