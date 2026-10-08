export interface CitationSource {
  title: string;
  author_or_institution: string;
  publication_year?: number;
  url: string;
  reference_chapter_or_note: string;
}

export type GarmentType = 
  | 'AO_NGU_THAN' 
  | 'AO_TAC' 
  | 'AO_NHAT_BINH' 
  | 'AO_GIAO_LINH' 
  | 'AO_VIEN_LINH'
  | 'AO_DOI_KHAM'
  | 'AO_TU_THAN' 
  | 'AO_BA_BA'
  | 'AO_DAI_LEMUR';

export interface ColorCulturalAnalysis {
  rating: 'CHUAN_SAC' | 'HAI_HOA' | 'CAN_NHAC';
  harmony_title: string;
  cultural_symbolism: string;
  five_elements_element: 'KIM' | 'MOC' | 'THUY' | 'HOA' | 'THO';
  element_meaning: string;
  event_suitability: string;
}

export interface CulturalGuardrailResult {
  is_culturally_accurate: boolean;
  warning_level: 'SAFE' | 'WARNING' | 'REJECTED';
  cultural_warning_msg: string;
  suggested_fix: string;
  kieu_toc_va_trang_diem?: string;
  dang_chup_anh?: string;
  cau_chuyen_di_san?: string;
  citations?: CitationSource[];
  set_name?: string;
  audit_passed?: boolean;
  sanity_check_passed?: boolean;
  inappropriate_terms_detected?: string[];
  chosen_accessories?: string[];
  chosen_hairstyle?: string;
  color_evaluation?: ColorCulturalAnalysis;
}

export interface StylingSuggestionItem {
  id: string;
  name: string;
  cultural_reason: string;
  vibe_tag?: string;
}

export interface MiniStylingResponse {
  accessories: StylingSuggestionItem[];
  hairstyles: StylingSuggestionItem[];
  stylist_note: string;
}

export interface CulturalRecommendationInput {
  garment_type: string;
  event: string;
  primary_color: string;
  accessory?: string;
  accessories?: string[];
  custom_accessories?: string[];
  hairstyle?: string;
  custom_hairstyle?: string;
  style_mode?: string;
  personality?: string;
  region?: string;
}

/**
 * BƯỚC 1: Output của Grounded Recommendation Engine
 */
export interface GroundedRecommendationResult {
  set_name: string;
  garment_type: string;
  primary_color: string;
  color_harmony_explanation: string;
  recommended_accessories: Array<{ id: string; name: string; purpose: string }>;
  incompatible_accessories_detected: Array<{ id: string; name: string; reason: string }>;
  kieu_toc_va_makeup: {
    hair: string;
    makeup: string;
  };
  dang_chup_anh: string;
  cau_chuyen_di_san: string;
  has_cultural_risk: boolean;
  cultural_risk_summary: string;
  citations: CitationSource[];
}

/**
 * BƯỚC 2: Output của Multi-round Cultural Check (Auditor Agent)
 */
export interface CulturalAuditResult {
  audit_status: 'APPROVED' | 'NEEDS_REVISION' | 'FLAGGED';
  confidence_score: number; // 0.0 - 1.0
  cross_regional_check: {
    is_valid: boolean;
    details: string;
  };
  historical_accuracy_check: {
    is_valid: boolean;
    details: string;
  };
  citations_verified: boolean;
  audit_verdict_message: string;
  suggested_correction: string | null;
}

/**
 * Kết quả hợp nhất trả về cho UI
 */
export interface TwoRoundCulturalResponse {
  recommendation: GroundedRecommendationResult;
  audit: CulturalAuditResult;
  final_guardrail: CulturalGuardrailResult;
  pipeline_metadata: {
    mode: 'ONLINE_GEMINI_PIPELINE' | 'OFFLINE_GROUND_TRUTH_ENGINE';
    model_round1: string;
    model_round2: string;
    latency_ms: number;
  };
}

export interface PatternItem {
  id?: string;
  pattern_name: string;
  pattern_type?: 'SEAMLESS_JACQUARD' | 'CENTRAL_EMBLEM';
  pattern_color?: string;
  pattern_story?: string;
  imageUrl?: string;
}

export interface CurrentOutfitState {
  event: string;
  color: string;
  colorName: string;
  garment: string;
  accessory: string;
  accessories?: string[];
  custom_accessories?: string[];
  hairstyle?: string;
  custom_hairstyle?: string;
  style?: string;
  style_mode?: string;
  personality?: string;
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
  imageUrl?: string;
}

export interface WardrobeItem extends DiscoveryOutfit {
  savedAt: string;
}

export interface UserPreferenceVector {
  colors: Record<string, number>;
  garments: Record<string, number>;
  events: Record<string, number>;
}
