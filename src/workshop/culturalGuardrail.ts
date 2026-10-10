import { CulturalGuardrailResult } from '../types/index.ts';
import { Sound } from '../audio/sound.ts';
import { getCulturalTruth, checkStrictTaboo } from '../data/culturalTruths.ts';
import { renderIcon } from '../icons/iconSystem.ts';

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
  const truth = getCulturalTruth(garment);
  const tabooCheck = checkStrictTaboo(truth.id, accessory);

  if (tabooCheck.isTaboo && tabooCheck.taboo) {
    return {
      is_culturally_accurate: false,
      warning_level: 'WARNING',
      cultural_warning_msg: tabooCheck.taboo.historicalConflictReason,
      suggested_fix: tabooCheck.taboo.suggestedAlternative,
      citations: [
        {
          title: truth.sourceTitle,
          author_or_institution: truth.authorOrInstitution,
          url: truth.sourceUrl,
          reference_chapter_or_note: truth.sourceReferenceNote || 'Tài liệu di sản'
        }
      ]
    };
  }

  return {
    is_culturally_accurate: true,
    warning_level: 'SAFE',
    cultural_warning_msg: '',
    suggested_fix: '',
    citations: [
      {
        title: truth.sourceTitle,
        author_or_institution: truth.authorOrInstitution,
        url: truth.sourceUrl,
        reference_chapter_or_note: truth.sourceReferenceNote || 'Tài liệu di sản'
      }
    ]
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
  }

  public renderGuardrailUI(result: CulturalGuardrailResult): void {
    this.currentState = result;
    const card = document.getElementById('heritage-info-card');
    const badgeEl = document.getElementById('cultural-status-badge');

    const isWarning = result.warning_level === 'WARNING' || !result.is_culturally_accurate;

    if (isWarning) {
      if (card) card.classList.add('cultural-warning-border');
      if (badgeEl) {
        badgeEl.className = 'cultural-status-badge cultural-seal-warn';
        badgeEl.innerHTML = `${renderIcon('alertTriangle', { size: 14 })} <span>Lệch sợi so với truyền thống</span>`;
      }
    } else {
      if (card) card.classList.remove('cultural-warning-border');
      if (badgeEl) {
        badgeEl.className = 'cultural-status-badge cultural-seal-safe';
        badgeEl.innerHTML = `${renderIcon('circleCheck', { size: 14 })} <span>Đúng khung dệt cổ truyền</span>`;
      }
    }
  }
}

export const culturalGuardrail = new CulturalGuardrailManager();
