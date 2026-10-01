import { UserPreferenceVector, DiscoveryOutfit } from '../types/index.ts';

export class PreferenceEngine {
  public userPreferenceVector: UserPreferenceVector = {
    colors: { '#B22222': 4, '#1D3557': 2, '#E5A93C': 1, '#2B1A12': 1, '#F5F2EB': 1 },
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

    let topColor = '#B22222';
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
      '#B22222': 'Đỏ Son',
      '#1D3557': 'Xanh Chàm',
      '#E5A93C': 'Hoàng Cúc',
      '#2B1A12': 'Cánh Gián',
      '#F5F2EB': 'Trắng Bưởi'
    };
    const garmentNames: Record<string, string> = {
      'AO_NGU_THAN': 'Ngũ Thân',
      'AO_BA_BA': 'Bà Ba'
    };

    pillText.textContent = `${colorNames[topColor] || 'Đỏ Son'} • ${garmentNames[topGarment] || 'Ngũ Thân'}`;
  }

  public calculateOutfitScore(outfit: DiscoveryOutfit): number {
    if (!outfit) return 0;
    const colorScore = this.userPreferenceVector.colors[outfit.color] || 0;
    const garmentScore = this.userPreferenceVector.garments[outfit.garment] || 0;
    return colorScore * 0.6 + garmentScore * 0.4;
  }

  public sortDeckByPreference(deck: DiscoveryOutfit[]): DiscoveryOutfit[] {
    return [...deck].sort((a, b) => this.calculateOutfitScore(b) - this.calculateOutfitScore(a));
  }

  public recordPreference(outfit: DiscoveryOutfit, action: 'LIKE' | 'DISLIKE'): void {
    if (!outfit) return;
    if (action === 'LIKE') {
      this.userPreferenceVector.colors[outfit.color] = (this.userPreferenceVector.colors[outfit.color] || 0) + 2;
      this.userPreferenceVector.garments[outfit.garment] = (this.userPreferenceVector.garments[outfit.garment] || 0) + 2;
      this.userPreferenceVector.events[outfit.event] = (this.userPreferenceVector.events[outfit.event] || 0) + 1;
    } else if (action === 'DISLIKE') {
      this.userPreferenceVector.colors[outfit.color] = (this.userPreferenceVector.colors[outfit.color] || 0) - 1;
    }
    this.saveUserPreferences();
  }

  public getTopPreferences(): { topColor: string; topGarment: string; topEvent: string } {
    let topColor = '#B22222';
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

    let topEvent = 'tet';
    let maxEScore = -Infinity;
    for (const [ev, score] of Object.entries(this.userPreferenceVector.events || {})) {
      if (score > maxEScore) {
        maxEScore = score;
        topEvent = ev;
      }
    }

    return { topColor, topGarment, topEvent };
  }
}

export const preferenceEngine = new PreferenceEngine();
