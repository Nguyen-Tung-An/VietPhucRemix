import { Sound } from '../audio/sound.ts';
import { garmentEngine } from '../workshop/garmentEngine.ts';
import { wardrobeManager } from '../discover/wardrobeManager.ts';
import { DiscoveryOutfit } from '../types/index.ts';
import { lookbookEngine } from '../lookbook/lookbookEngine.ts';
import { feedbackState } from '../services/feedbackState.ts';
import { appRouter } from '../navigation/router.ts';
import {
  getCulturalTruth,
  checkStrictTaboo,
  checkMultipleStrictTaboos,
  getAllSourcesForGarment,
  getColorCulturalAnalysis
} from '../data/culturalTruths.ts';
import { tailorJourneyEngine } from '../journey/tailorJourneyEngine.ts';
import { assembleFashionPrompt } from '../workshop/promptEngine.ts';
import { assetConfig } from '../config/assetConfig.ts';
import { CURATED_18_OUTFITS } from '../data/curatedOutfits.ts';

export class ResultEngine {
  private isKnowledgeRevealed: boolean = false;

  public init(): void {
    this.setupTriggers();
    this.setupKnowledgeToggle();
    this.setupActionButtons();
    this.setupKeyboardShortcuts();
    this.setupSwipeGestures();
  }

  /**
   * Mở Màn hình Kết quả và nạp dữ liệu từ Xưởng Phối
   */
  public showResult(): void {
    Sound.playChime();
    const resultScene = document.getElementById('result-scene');
    if (!resultScene) return;

    // Nạp dữ liệu phối đồ hiện tại
    const outfitState = garmentEngine.getCurrentOutfitState();
    const displayAccessories =
      outfitState.accessoryLabels && outfitState.accessoryLabels.length > 0
        ? [
            ...outfitState.accessoryLabels,
            ...(outfitState.custom_accessories || [])
          ]
        : [
            ...(outfitState.accessories?.length ? outfitState.accessories : [outfitState.accessory]),
            ...(outfitState.custom_accessories || [])
          ];
    const rawAccessoriesForTaboo = [
      ...(outfitState.accessories?.length ? outfitState.accessories : [outfitState.accessory]),
      ...(outfitState.custom_accessories || [])
    ];
    this.renderArtwork(outfitState.garment, outfitState.color, outfitState.accessory);
    this.renderBadgeAndHeadlines(outfitState.garment, outfitState.colorName, displayAccessories);
    this.renderCulturalWarning(outfitState.garment, rawAccessoriesForTaboo);
    this.renderKnowledgeCard(outfitState.garment);
    this.renderColorEvaluation(outfitState.color, outfitState.colorName, outfitState.garment, outfitState.event);

    // Hiển thị đầy đủ thông tin tìm hiểu về di sản cho người dùng
    this.setKnowledgeRevealed(true);

    // Kích hoạt màn hình kết quả
    resultScene.classList.add('scene-active');
  }

  private renderColorEvaluation(colorHex: string, colorName: string, garment: string, event: string): void {
    const colorAnalysis = getColorCulturalAnalysis(colorHex, garment, event);
    const elementTag = document.getElementById('result-color-element');
    const colorDot = document.getElementById('result-color-dot');
    const colorTitle = document.getElementById('result-color-title');
    const colorSymbolism = document.getElementById('result-color-symbolism');

    const elementNameMap: Record<string, string> = {
      KIM: 'Kim Bạch Lạp',
      MOC: 'Mộc Sinh Khí',
      THUY: 'Thủy Dưỡng Sắc',
      HOA: 'Hỏa Chu Tước',
      THO: 'Thổ Vị Trung Tâm'
    };

    if (elementTag) {
      elementTag.textContent = elementNameMap[colorAnalysis.five_elements_element || 'THO'] || 'Thổ Vị Trung Tâm';
    }
    if (colorDot) {
      colorDot.style.backgroundColor = colorHex;
    }
    if (colorTitle) {
      colorTitle.textContent = `${colorName} • ${colorAnalysis.harmony_title}`;
    }
    if (colorSymbolism) {
      colorSymbolism.textContent = `${colorAnalysis.cultural_symbolism} (${colorAnalysis.event_suitability})`;
    }
  }

  /**
   * Đóng màn hình kết quả và quay về Xưởng Phối
   */
  public hideResult(): void {
    Sound.playClick();
    const resultScene = document.getElementById('result-scene');
    if (resultScene) {
      resultScene.classList.remove('scene-active');
    }
  }

  private renderArtwork(garment: string, colorHex: string, _accessory: string): void {
    const demoImg = document.getElementById('result-demo-image') as HTMLImageElement;
    const placeholder = document.getElementById('result-no-image-placeholder');
    const btnCopyPromptFooter = document.getElementById('btn-result-copy-prompt');
    if (!demoImg || !placeholder) return;

    // Ưu tiên tìm ảnh minh họa khớp tổ hợp Dáng áo + Màu sắc trong 18 bộ Curated trên CDN GitHub
    const matchedCurated = CURATED_18_OUTFITS.find(
      (c) =>
        c.garment === garment &&
        c.color.toLowerCase() === (colorHex || '').toLowerCase()
    );

    const primaryDemoSrc = matchedCurated?.cdn_image_path
      ? assetConfig.resolveAssetUrl(matchedCurated.cdn_image_path)
      : '';
    const rawGithubFallbackSrc = matchedCurated?.cdn_image_path
      ? assetConfig.resolveRawGithubUrl(matchedCurated.cdn_image_path)
      : '';

    demoImg.onload = () => {
      demoImg.style.display = 'block';
      placeholder.style.display = 'none';
      if (btnCopyPromptFooter) {
        btnCopyPromptFooter.style.display = 'inline-flex';
      }
    };

    assetConfig.attachSafeImageLoad(
      demoImg,
      primaryDemoSrc,
      rawGithubFallbackSrc,
      () => {
        demoImg.style.display = 'none';
        placeholder.style.display = 'flex';
        // Khi không có tranh: nút sao chép prompt đưa qua phần bên trái (bên trong placeholder)
        if (btnCopyPromptFooter) {
          btnCopyPromptFooter.style.display = 'none';
        }
      }
    );
  }

  /**
   * LỚP 1 — Badge góc trên và Tiêu đề
   */
  private renderBadgeAndHeadlines(garment: string, colorName: string, accessories: string[]): void {
    const badgeText = document.getElementById('result-badge-text');
    const heading = document.getElementById('result-outfit-heading');
    const subtitle = document.getElementById('result-outfit-subtitle');

    const truth = getCulturalTruth(garment);
    const aiData = garmentEngine.aiStylingData;
    
    if (badgeText) {
      badgeText.textContent = `Chuẩn Quy Thức Di Sản • ${truth.name}`;
    }

    if (heading) {
      heading.textContent = aiData?.set_name || `${truth.name} • ${colorName}`;
    }

    if (subtitle) {
      if (aiData?.cau_chuyen_di_san) {
        subtitle.textContent = aiData.cau_chuyen_di_san;
      } else {
        const accListText = accessories.length > 0 ? ` kết hợp ${accessories.map(a => a.replace(/_/g, ' ')).join(', ')}` : '';
        subtitle.textContent = `Bộ phục trang hoàn chỉnh theo phong vị đương đại concept Lụa Thanh${accListText}.`;
      }
    }
  }

  /**
   * LỚP 2 — Khung cảnh báo văn hóa (Chỉ hiện NẾU có cảnh báo)
   * - Nền màu Vàng Đất nhạt, viền 1px Vàng Đất, icon nhỏ bên trái
   * - Tối đa 1-2 câu nhắc nhở nhẹ nhàng, không gay gắt
   * - Nếu không có cảnh báo: khối này không hiển thị (display: none), không để trống
   */
  private renderCulturalWarning(garment: string, accessories: string[]): void {
    const warningLayer = document.getElementById('result-warning-layer');
    const warningDesc = document.getElementById('result-warning-desc');
    if (!warningLayer) return;

    const truth = getCulturalTruth(garment);
    const tabooCheck = checkMultipleStrictTaboos(truth.id, accessories);

    if (tabooCheck.hasTaboo && tabooCheck.taboos.length > 0) {
      if (warningDesc) {
        warningDesc.textContent = tabooCheck.taboos.map(t => t.historicalConflictReason).join(' ');
      }
      warningLayer.style.display = 'flex';
    } else {
      warningLayer.style.display = 'none';
    }
  }

  /**
   * LỚP 3 — Thẻ tri thức văn hóa chuyên sâu có trích dẫn nguồn xác thực (Progressive Disclosure)
   */
  private renderKnowledgeCard(garment: string): void {
    const knowledgeText = document.getElementById('knowledge-text');
    const knowledgeTitle = document.getElementById('knowledge-title');
    if (!knowledgeText) return;

    const truth = getCulturalTruth(garment);
    const allSources = getAllSourcesForGarment(garment);

    if (knowledgeTitle) {
      knowledgeTitle.textContent = `${truth.name} • Tri Thức Khảo Cứu & Quy Chuẩn Cấu Trúc`;
    }

    const citationItemsHtml = allSources.map((src, index) => {
      const yearStr = src.year ? ` (${src.year})` : '';
      const noteStr = src.note ? ` — <span style="color: #666;">${src.note}</span>` : '';
      return `
        <div style="margin-top: 6px; padding: 4px 0; border-bottom: 1px dotted rgba(201,166,107,0.25);">
          <div style="color: #6B4E2E; font-weight: 500;">
            [${index + 1}] <strong>${src.title}</strong>${yearStr} — <em>${src.authorOrInstitution}</em>${noteStr}
          </div>
          <div style="margin-top: 2px;">
            <a href="${src.url}" target="_blank" rel="noopener noreferrer" style="color: #4A8577; text-decoration: underline; font-weight: 600;">
              Đọc tư liệu di sản gốc ↗
            </a>
          </div>
        </div>
      `;
    }).join('');

    const definingFeaturesHtml = truth.definingFeatures && truth.definingFeatures.length > 0
      ? `
        <div style="margin-top: 10px; padding: 8px 12px; background: rgba(74, 133, 119, 0.06); border-radius: 8px; border-left: 3px solid #4A8577;">
          <div style="font-weight: 700; color: #2A5A4E; font-size: 0.8rem; margin-bottom: 4px;">Quy chuẩn cấu trúc may mặc cốt lõi:</div>
          <ul style="margin: 0; padding-left: 18px; font-size: 0.78rem; color: #333; line-height: 1.5;">
            ${truth.definingFeatures.map(f => `<li>${f}</li>`).join('')}
          </ul>
        </div>
      `
      : '';

    const socialContextHtml = truth.socialContext
      ? `<div style="margin-top: 8px; font-size: 0.78rem; color: #555;"><strong>Bối cảnh & Tầng lớp sử dụng nguyên bản:</strong> ${truth.socialContext}</div>`
      : '';

    const citationHtml = `
      <div style="margin-top: 14px; padding-top: 10px; border-top: 1px dashed rgba(201,166,107,0.4); font-size: 11px;">
        <div style="font-weight: 700; color: #4A8577; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between;">
          <span>Nguồn tư liệu di sản xác thực (${allSources.length} nguồn):</span>
          <span style="font-size: 10px; color: #888; font-weight: normal;">Đã kiểm chứng lịch sử</span>
        </div>
        ${citationItemsHtml}
      </div>
    `;

    knowledgeText.innerHTML = `
      <div style="font-size: 0.86rem; line-height: 1.6; color: #2B2B28;">${truth.culturalSignificance}</div>
      ${definingFeaturesHtml}
      ${socialContextHtml}
      <div style="margin-top: 8px; font-size: 0.78rem; color: #555;">
        <strong>Niên đại lịch sử:</strong> ${truth.historicalEra}
      </div>
      <div style="margin-top: 4px; font-size: 0.78rem; color: #555;">
        <strong>Vùng miền cội nguồn:</strong> ${truth.originRegion === 'BAC_BO' ? 'Bắc Bộ' : truth.originRegion === 'TRUNG_BO' ? 'Trung Bộ / Cố Đô Huế' : truth.originRegion === 'NAM_BO' ? 'Nam Bộ' : 'Toàn Quốc'}
      </div>
      ${citationHtml}
    `;
  }

  /**
   * Thiết lập đóng/mở Lớp 3 (Progressive Disclosure)
   */
  private setupKnowledgeToggle(): void {
    const btnToggle = document.getElementById('btn-toggle-knowledge');
    btnToggle?.addEventListener('click', () => {
      Sound.playClick();
      this.setKnowledgeRevealed(!this.isKnowledgeRevealed);
    });
  }

  private setKnowledgeRevealed(revealed: boolean): void {
    this.isKnowledgeRevealed = revealed;
    const layer = document.getElementById('result-knowledge-layer');
    const btnToggle = document.getElementById('btn-toggle-knowledge');
    const toggleLabel = document.getElementById('knowledge-toggle-label');

    if (layer) {
      if (revealed) {
        layer.classList.add('layer-knowledge-revealed');
      } else {
        layer.classList.remove('layer-knowledge-revealed');
      }
    }

    if (btnToggle) {
      btnToggle.setAttribute('aria-expanded', revealed ? 'true' : 'false');
    }

    if (toggleLabel) {
      toggleLabel.textContent = revealed ? 'Thu gọn tri thức' : 'Tìm hiểu thêm về di sản';
    }
  }

  /**
   * Thiết lập 2 nút hành động ở cuối màn hình
   */
  private setupActionButtons(): void {
    const btnSaveLookbook = document.getElementById('btn-result-save-lookbook');
    const btnRemix = document.getElementById('btn-result-remix');
    const btnBack = document.getElementById('btn-result-back');
    const btnTailorJourney = document.getElementById('btn-result-tailor-journey');
    const btnGotoDiscover = document.getElementById('btn-result-goto-discover');
    const btnCopyPrompt = document.getElementById('btn-result-copy-prompt');
    const btnPlaceholderPrompt = document.getElementById('btn-result-placeholder-copy-prompt') || document.getElementById('btn-result-placeholder-prompt');

    btnGotoDiscover?.addEventListener('click', () => {
      this.hideResult();
      appRouter.switchTab('discover');
    });

    // Nút Sao Chép Prompt Tạo Sinh Ảnh Gemini Thủ Công
    btnCopyPrompt?.addEventListener('click', () => {
      this.openPromptModal();
    });
    btnPlaceholderPrompt?.addEventListener('click', () => {
      this.openPromptModal();
    });

    // Nút Hành trình Sở hữu Cổ phục (Google Maps & Search tiệm may đo thực tế)
    btnTailorJourney?.addEventListener('click', () => {
      const outfitState = garmentEngine.getCurrentOutfitState();
      tailorJourneyEngine.openJourney(outfitState.garment, undefined, outfitState.colorName);
    });

    // Nút phụ: "Phối lại" -> Quay lại xưởng phối
    btnRemix?.addEventListener('click', () => {
      this.hideResult();
      appRouter.switchTab('create');
    });

    btnBack?.addEventListener('click', () => {
      this.hideResult();
      appRouter.switchTab('create');
    });

    // Nút chính: "Lưu vào Lookbook" -> Lưu đầy đủ data di sản & AI và chuyển sang màn Lookbook
    btnSaveLookbook?.addEventListener('click', () => {
      Sound.playChime();
      const outfitState = garmentEngine.getCurrentOutfitState();
      const truth = getCulturalTruth(outfitState.garment);
      const allSources = getAllSourcesForGarment(outfitState.garment);
      const colorAnalysis = getColorCulturalAnalysis(outfitState.color, outfitState.garment, outfitState.event);

      let userProfile = null;
      try {
        const raw = localStorage.getItem('viet_y_user_profile');
        if (raw) userProfile = JSON.parse(raw);
      } catch {}

      const fullPrompt = assembleFashionPrompt(outfitState, userProfile);
      
      const garmentNames: Record<string, string> = {
        AO_NGU_THAN: 'Áo Ngũ Thân',
        AO_TAC: 'Áo Tấc',
        AO_NHAT_BINH: 'Áo Nhật Bình',
        AO_TU_THAN: 'Áo Tứ Thân',
        AO_BA_BA: 'Áo Bà Ba',
        AO_DAI_LEMUR: 'Áo Dài'
      };
      const gName = garmentNames[outfitState.garment] || 'Việt Phục';
      const eventTag = outfitState.bestOccasion || outfitState.eventLabel || 'Dạo phố Tết';
      const allAcc = outfitState.accessories && outfitState.accessories.length > 0 
        ? outfitState.accessories 
        : [outfitState.accessory];
      const allAccLabels =
        outfitState.accessoryLabels && outfitState.accessoryLabels.length > 0
          ? outfitState.accessoryLabels
          : allAcc;
      const matchedCurated = CURATED_18_OUTFITS.find(
        (c) =>
          c.garment === outfitState.garment &&
          c.color.toLowerCase() === (outfitState.color || '').toLowerCase()
      );
      const resolvedOutfitImg = matchedCurated?.cdn_image_path
        ? assetConfig.resolveAssetUrl(matchedCurated.cdn_image_path)
        : '';

      const savedOutfit: any = {
        id: `custom-${Date.now()}`,
        cdn_id: matchedCurated?.cdn_id,
        cdn_image_path: matchedCurated?.cdn_image_path,
        title: garmentEngine.aiStylingData?.set_name || `${gName} ${outfitState.colorName}`,
        garment: outfitState.garment,
        garmentLabel: outfitState.garmentLabel || truth.name,
        color: outfitState.color,
        colorName: outfitState.colorName,
        styles: outfitState.styles || [],
        style_mode: outfitState.style_mode || '',
        creativityLevel: outfitState.creativityLevel,
        userProfile: userProfile,
        patternName: outfitState.pattern?.pattern_name || outfitState.patternName || 'Lụa Tơ Tằm Truyền Thống',
        event: outfitState.event,
        eventLabel: eventTag,
        bestOccasion: eventTag,
        accessory: outfitState.accessory,
        accessories: allAcc,
        accessoryLabels: allAccLabels,
        accessoryLabel: allAccLabels[0] || 'Phụ kiện di sản',
        custom_accessories: outfitState.custom_accessories || [],
        hairstyle: outfitState.hairstyle || 'Tóc búi cao thanh thoát',
        custom_hairstyle: outfitState.custom_hairstyle,
        seal: 'Lụa',
        desc:
          garmentEngine.aiStylingData?.cau_chuyen_di_san ||
          `Bộ phối ${outfitState.colorName} hoàn chỉnh theo phong vị đương đại Lụa Thanh kết hợp ${[...allAccLabels, ...(outfitState.custom_accessories || [])].map(a => a.replace(/_/g, ' ')).join(', ')}.`,
        imageUrl: resolvedOutfitImg,
        assembledPrompt: fullPrompt,
        aiStylingData: garmentEngine.aiStylingData,
        colorCulturalAnalysis: colorAnalysis,
        culturalStory: truth.culturalSignificance,
        historicalEra: truth.historicalEra,
        originRegion: truth.originRegion,
        definingFeatures: truth.definingFeatures,
        socialContext: truth.socialContext,
        citations: allSources,
        isCustomWorkshopOutfit: true,
        savedAt: new Date().toLocaleDateString('vi-VN')
      };

      // Kích hoạt Trạng thái Đang Tải Lụa Thanh dùng chung
      feedbackState.showLoading({
        message: 'Đang lưu tà phục vào Lookbook...',
        submessage: 'Ghi nhận sắc lụa, phụ kiện và cấu trúc AI prompt vào bộ sưu tập cá nhân...'
      });

      setTimeout(() => {
        feedbackState.hideLoading();
        wardrobeManager.saveWardrobeOutfit(savedOutfit);
        lookbookEngine.renderLookbook();

        // Phản hồi thị giác tức thì
        const btnText = document.getElementById('btn-save-lookbook-text');
        if (btnText) {
          const originalText = btnText.textContent;
          btnText.textContent = 'Đã Lưu Vào Rương Gấm';
          btnSaveLookbook.style.transform = 'scale(0.97)';
          setTimeout(() => {
            btnSaveLookbook.style.transform = 'scale(1)';
          }, 150);

          setTimeout(() => {
            if (btnText) btnText.textContent = originalText;
          }, 2200);
        }

        // Tự động điều hướng sang màn Lookbook mượt mà theo đúng luồng
        setTimeout(() => {
          this.hideResult();
          appRouter.switchTab('lookbook');
          appRouter.showToast('Đã lưu tà áo và chuyển sang Rương Gấm của bạn.');
        }, 450);
      }, 650);
    });
  }

  /**
   * Mở modal hiển thị và sao chép cấu trúc Prompt Gemini hoàn chỉnh
   */
  public openPromptModal(): void {
    const modal = document.getElementById('prompt-view-modal');
    const textarea = document.getElementById('prompt-modal-textarea') as HTMLTextAreaElement | null;
    const copyBtn = document.getElementById('btn-copy-prompt-clipboard');
    const closeBtn = document.getElementById('btn-close-prompt-view-modal');
    const copyStatus = document.getElementById('prompt-copy-status');

    if (!modal) return;

    Sound.playChime();

    const outfitState = garmentEngine.getCurrentOutfitState();
    let userProfile = null;
    try {
      const raw = localStorage.getItem('viet_y_user_profile');
      if (raw) userProfile = JSON.parse(raw);
    } catch {}

    const fullPrompt = assembleFashionPrompt(outfitState, userProfile);
    if (textarea) {
      textarea.value = fullPrompt;
    }

    if (copyStatus) copyStatus.style.display = 'none';

    const handleCopy = async () => {
      Sound.playChime();
      try {
        await navigator.clipboard.writeText(fullPrompt);
        if (copyStatus) copyStatus.style.display = 'inline';
        appRouter.showToast('Đã sao chép prompt Gemini vào bộ nhớ tạm.');
      } catch {
        if (textarea) {
          textarea.select();
          document.execCommand('copy');
          if (copyStatus) copyStatus.style.display = 'inline';
          appRouter.showToast('Đã sao chép prompt Gemini.');
        }
      }
    };

    if (copyBtn) {
      copyBtn.onclick = handleCopy;
    }

    const closeModal = () => {
      modal.classList.remove('active');
      modal.classList.remove('show');
      modal.style.display = 'none';
    };

    if (closeBtn) closeBtn.onclick = closeModal;
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
        window.removeEventListener('keydown', handleEsc);
      }
    };
    window.addEventListener('keydown', handleEsc);

    modal.style.display = 'flex';
    modal.classList.add('active');
    modal.classList.add('show');
  }

  /**
   * Nút bấm mở màn hình kết quả từ Xưởng Phối kèm trạng thái Tải thẩm định
   */
  private setupTriggers(): void {
    const triggerButtons = [
      document.getElementById('btn-view-result'),
      document.getElementById('btn-sheet-view-result')
    ].filter(Boolean);

    triggerButtons.forEach((btn) => {
      btn?.addEventListener('click', async () => {
        // Kiểm tra điều kiện luồng bắt buộc: đã chọn 3 options và đã tạo AI gợi ý
        if (!garmentEngine.canProceedToResult()) {
          return;
        }

        // Kiểm tra State-Proof Sanity trên toàn bộ input tự nhập
        const sanity = garmentEngine.validateCurrentInputs();
        if (!sanity.isValid) {
          garmentEngine.showSanityAlert(sanity.reason || 'Vui lòng kiểm tra lại phụ kiện hoặc kiểu tóc tự nhập theo thuần phong mỹ tục.');
          return;
        }

        garmentEngine.hideSanityAlert();
        Sound.playClick();
        feedbackState.showLoading({
          message: 'Đang đối chiếu di sản & dệt nên bản phối...',
          submessage: 'Gemini AI đang tạo sinh mô tả vi mô cho dáng áo, màu lụa, độ phá cách, phụ kiện & kiểu tóc bạn đã duyệt...',
          allowCancel: true
        });

        let userProfile = null;
        try {
          const raw = localStorage.getItem('viet_y_user_profile');
          if (raw) userProfile = JSON.parse(raw);
        } catch {}

        try {
          if (!garmentEngine.aiEnrichedComponents) {
            await garmentEngine.finalizeAndSynthesizePrompt(userProfile);
          }
        } catch (err) {
          console.warn('Tổng hợp vi mô Prompt AI fallback về deterministic engine:', err);
        } finally {
          feedbackState.hideLoading();
          this.showResult();
        }
      });
    });
  }

  /**
   * Phím tắt Desktop: Enter để lưu, Escape để phối lại
   */
  private setupKeyboardShortcuts(): void {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      const resultScene = document.getElementById('result-scene');
      if (!resultScene?.classList.contains('scene-active')) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        this.hideResult();
      } else if (e.key === 'Enter') {
        const btnSave = document.getElementById('btn-result-save-lookbook');
        btnSave?.click();
      }
    });
  }

  /**
   * Cử chỉ vuốt lên trên Mobile để hé lộ Lớp 3
   */
  private setupSwipeGestures(): void {
    const knowledgeLayer = document.getElementById('result-knowledge-layer');
    if (!knowledgeLayer) return;

    let touchStartY = 0;
    knowledgeLayer.addEventListener('touchstart', (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    knowledgeLayer.addEventListener('touchend', (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const diffY = touchStartY - touchEndY;

      // Vuốt lên > 30px: Hé lộ tri thức
      if (diffY > 30 && !this.isKnowledgeRevealed) {
        Sound.playClick();
        this.setKnowledgeRevealed(true);
      }
      // Vuốt xuống > 30px: Thu gọn tri thức
      else if (diffY < -30 && this.isKnowledgeRevealed) {
        Sound.playClick();
        this.setKnowledgeRevealed(false);
      }
    }, { passive: true });
  }
}

export const resultEngine = new ResultEngine();
