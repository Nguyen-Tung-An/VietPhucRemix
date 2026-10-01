export interface CulturalGuardrailResult {
  is_culturally_accurate: boolean;
  warning_level: 'SAFE' | 'WARNING';
  cultural_warning_msg: string;
  suggested_fix: string;
  kieu_toc_va_trang_diem?: string;
  dang_chup_anh?: string;
  cau_chuyen_di_san?: string;
}

export interface PatternItem {
  id?: string;
  pattern_name: string;
  pattern_type: 'SEAMLESS_JACQUARD' | 'CENTRAL_EMBLEM';
  svg_path_data: string;
  pattern_color: string;
  pattern_story: string;
}

export interface CurrentOutfitState {
  event: string;
  color: string;
  colorName: string;
  garment: string;
  accessory: string;
  pattern?: PatternItem | null;
  genzActive?: boolean;
}

export interface DiscoveryOutfit {
  id: string;
  title: string;
  garment: 'AO_NGU_THAN' | 'AO_BA_BA';
  color: string;
  colorName: string;
  event: string;
  eventLabel: string;
  accessory: 'QUAT_GIAY' | 'KHAN_RAN' | 'NON_QUAI_THAO';
  seal: string;
  desc: string;
}

export interface WardrobeItem extends DiscoveryOutfit {
  savedAt: string;
}

export interface UserPreferenceVector {
  colors: Record<string, number>;
  garments: Record<string, number>;
  events: Record<string, number>;
}
