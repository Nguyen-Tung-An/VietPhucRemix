import { createIcons, icons } from 'lucide';

// Icon definition type from Lucide: array of [elementName, attributesMap]
type IconNode = [string, Record<string, string>][];

export interface IconOptions {
  size?: number;
  className?: string;
  strokeWidth?: number;
  ariaHidden?: boolean;
}

/**
 * Convert any string (kebab-case, camelCase, snake_case) to PascalCase for Lucide icons lookup.
 */
function toPascalCase(str: string): string {
  return str
    .replace(/[-_ ]+(\w)/g, (_, c) => c.toUpperCase())
    .replace(/^(\w)/, (_, c) => c.toUpperCase());
}

/**
 * Render Lucide icon as SVG string for template literals.
 * Follows consistent 24x24 viewBox, stroke="currentColor", round caps and joins.
 */
export function renderIcon(name: string, options: IconOptions = {}): string {
  const {
    size = 18,
    className = '',
    strokeWidth = 2,
    ariaHidden = true
  } = options;

  const pascalName = toPascalCase(name);
  const iconDef = (icons as Record<string, IconNode>)[pascalName];
  if (!iconDef) {
    console.warn(`[IconSystem] Icon "${name}" (PascalCase: "${pascalName}") not found in Lucide.`);
    return '';
  }

  const innerSvg = iconDef
    .map(([tag, attrs]) => {
      const attrStr = Object.entries(attrs)
        .map(([k, v]) => `${k}="${v}"`)
        .join(' ');
      return `<${tag} ${attrStr}></${tag}>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon lucide-${name.toLowerCase()} ${className}" ${ariaHidden ? 'aria-hidden="true"' : ''}>${innerSvg}</svg>`;
}

/**
 * Automatically converts all <i data-lucide="..."></i> or <span data-lucide="..."></span>
 * in the DOM into pure Lucide SVG icons.
 */
export function initLucideIcons(): void {
  try {
    createIcons({
      icons,
      attrs: {
        'stroke-width': 2,
        class: 'lucide-icon'
      }
    });
  } catch (err) {
    console.warn('[IconSystem] Error initializing Lucide icons:', err);
  }
}

// Make available globally for dynamic updates
if (typeof window !== 'undefined') {
  (window as unknown as { initLucideIcons: typeof initLucideIcons; renderIcon: typeof renderIcon }).initLucideIcons = initLucideIcons;
  (window as unknown as { initLucideIcons: typeof initLucideIcons; renderIcon: typeof renderIcon }).renderIcon = renderIcon;
}
