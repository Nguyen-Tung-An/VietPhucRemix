import { UserPreferenceVector, DiscoveryOutfit } from '../types/index.ts';

export class PreferenceEngine {
  public userPreferenceVector: UserPreferenceVector = {
    colors: { '#F4C9D6': 4, '#4A8577': 3, '#E8F3EE': 2, '#1C2B26': 1, '#C9A66B': 1 },
    garments: { 'AO_NGU_THAN': 5, 'AO_BA_BA': 2 },
    events: { 'tet': 3, 'grad': 1, 'temple': 2 }
  };

  public init(): void {
    this.loadUserPreferences();
  }

  public loadUserPreferences(): void {
    try {
      const stored = localStorage.getItem('viet_y_user_preference');
      if (stored) {
        this.userPreferenceVector = JSON.parse(stored);
      }
    } catch {}
    this.updatePreferenceDisplay();
  }

  public saveUserPreferences(): void {
    try {
      localStorage.setItem('viet_y_user_preference', JSON.stringify(this.userPreferenceVector));
    } catch {}
    this.updatePreferenceDisplay();
  }

  public updatePreferenceDisplay(): void {
    const pillText = document.getElementById('nav-pref-text');
    if (!pillText) return;

    let topColor = '#F4C9D6';
    let maxCScore = -Infinity;
    for (const [col, score] of Object.entries(this.userPreferenceVector.colors || {})) {
      if (score > maxCScore) {
        maxCScore = score;
        topColor = col;
      }
    }

    let topGarment = 'AO_NGU_THAN';
    let maxGScore = -Infinity;
    for (const [gar, score] of Object.entries(this.userPreferenceVector.garments || {})) {
      if (score > maxGScore) {
        maxGScore = score;
        topGarment = gar;
      }
    }

    const colorNames: Record<string, string> = {
      '#F4C9D6': 'Hồng Sen',
      '#4A8577': 'Xanh Ngọc',
      '#E8F3EE': 'Ngọc Sương',
      '#1C2B26': 'Rêu Đêm',
      '#C9A66B': 'Vàng Đất'
    };
    const garmentNames: Record<string, string> = {
      'AO_NGU_THAN': 'Ngũ Thân',
      'AO_BA_BA': 'Bà Ba'
    };

    pillText.textContent = `${colorNames[topColor] || 'Hồng Sen'} • ${garmentNames[topGarment] || 'Ngũ Thân'}`;
  }

  /**
   * TẠM THỜI TẮT / SKIP TÍNH ĐIỂM SỞ THÍCH ĐỢI REFACTOR
   * Giữ nguyên thứ tự hiển thị tự nhiên của bộ sưu tập, không tự động đảo lộn vị trí các thẻ.
   */
  public calculateOutfitScore(_outfit: DiscoveryOutfit): number {
    return 0;
  }

  public sortDeckByPreference(deck: DiscoveryOutfit[]): DiscoveryOutfit[] {
    // Trả về deck nguyên bản, không tự động đảo lộn sở thích
    return [...deck];
  }

  public recordPreference(_outfit: DiscoveryOutfit, _action: 'LIKE' | 'DISLIKE'): void {
    // Tạm thời bỏ qua ghi nhận vector sở thích chờ refactor
  }

  public getTopPreferences(): { topColor: string; topGarment: string; topEvent: string } {
    // Trả về giá trị mặc định chuẩn mực cho Xưởng Phối
    return {
      topColor: '#F4C9D6',
      topGarment: 'AO_NGU_THAN',
      topEvent: 'tet'
    };
  }
}

export const preferenceEngine = new PreferenceEngine();
