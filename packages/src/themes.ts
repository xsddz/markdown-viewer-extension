/**
 * SDK Theme API
 * 
 * Provides built-in theme support for the SDK.
 * All theme data is bundled inline - no external file loading required.
 * 
 * Architecture:
 * - themes-data.ts: All data (CSS + JSON) auto-generated from source files
 * - themes.ts: API wrapper (this file)
 * 
 * Zero maintenance cost - uses same source as Chrome plugin.
 * 
 * @example
 * ```ts
 * import { themes } from 'markdown-viewer-sdk';
 * 
 * // List all themes
 * const themeList = themes.list();
 * 
 * // Apply a theme (injects base styles + theme colors)
 * themes.apply('palatino');
 * 
 * // Get theme CSS without applying
 * const css = themes.toCSS('palatino');
 * ```
 */

import {
  THEME_REGISTRY,
  THEME_PRESETS,
  COLOR_SCHEMES,
  LAYOUT_SCHEMES,
  TABLE_STYLES,
  CODE_THEMES,
  FONT_CONFIG,
  injectBaseStyles,
  type ThemePreset,
  type ColorScheme,
  type LayoutScheme,
  type TableStyle,
  type CodeTheme,
} from './themes-data';

// ============================================================================
// Types
// ============================================================================

/**
 * Theme info for listing
 */
export interface ThemeInfo {
  id: string;
  name: string;
  name_en?: string;
  description?: string;
  description_en?: string;
  category: string;
  featured: boolean;
}

/**
 * Category info
 */
export interface CategoryInfo {
  id: string;
  name: string;
  name_en?: string;
  themes: ThemeInfo[];
}

/**
 * Theme configuration for diagram rendering
 */
export interface ThemeConfig {
  fontFamily: string;
  fontSize: number;
  diagramStyle: 'normal' | 'handDrawn';
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert point size to pixels
 */
function ptToPx(ptSize: string): string {
  const pt = parseFloat(ptSize);
  const px = pt * 4 / 3; // 1pt = 4/3 px (at 96 DPI)
  return `${px}px`;
}

/**
 * Get font fallback chain from font-config
 */
function getFontFallback(fontName: string): string {
  const fontEntry = FONT_CONFIG.fonts[fontName];
  return fontEntry?.webFallback || fontName;
}

// ============================================================================
// CSS Generation - Only colors and fonts (layout comes from base-styles.ts)
// ============================================================================

/**
 * Generate font and color CSS (layout is in base-styles.ts)
 */
function generateFontAndColorCSS(
  preset: ThemePreset,
  layout: LayoutScheme,
  colors: ColorScheme
): string {
  const css: string[] = [];
  const fontScheme = preset.fontScheme;

  // Body font and colors
  const bodyFontFamily = getFontFallback(fontScheme.body.fontFamily);
  const bodyFontSize = ptToPx(layout.body.fontSize);
  const bodyLineHeight = layout.body.lineHeight;

  css.push(`#markdown-content {
  font-family: ${bodyFontFamily};
  font-size: ${bodyFontSize};
  line-height: ${bodyLineHeight};
  color: ${colors.text.primary};
  background: ${colors.background.page};
}`);

  // Links - colors only
  css.push(`#markdown-content a { color: ${colors.accent.link}; }
#markdown-content a:hover { color: ${colors.accent.linkHover}; }`);

  // KaTeX font size
  css.push(`.katex { font-size: ${bodyFontSize}; }`);

  // Headings - fonts and colors
  const headingLevels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;
  headingLevels.forEach((level) => {
    const fontHeading = fontScheme.headings[level] as { fontFamily?: string; fontWeight?: string } | undefined;
    const layoutHeading = layout.headings[level];
    if (!layoutHeading) return;

    const fontFamily = getFontFallback(
      fontHeading?.fontFamily || 
      fontScheme.headings.fontFamily as string || 
      fontScheme.body.fontFamily
    );
    const fontSize = ptToPx(layoutHeading.fontSize);
    const fontWeight = fontHeading?.fontWeight || fontScheme.headings.fontWeight as string || 'bold';

    const styles = [
      `  font-family: ${fontFamily};`,
      `  font-size: ${fontSize};`,
      `  font-weight: ${fontWeight};`,
      `  color: ${colors.text.primary};`
    ];

    if (layoutHeading.spacingBefore) {
      styles.push(`  margin-top: ${ptToPx(layoutHeading.spacingBefore)};`);
    }
    if (layoutHeading.spacingAfter) {
      styles.push(`  margin-bottom: ${ptToPx(layoutHeading.spacingAfter)};`);
    }

    css.push(`#markdown-content ${level} {\n${styles.join('\n')}\n}`);
  });

  return css.join('\n\n');
}

/**
 * Generate table colors (layout is in base-styles.ts)
 */
function generateTableColorCSS(table: TableStyle, colors: ColorScheme): string {
  const css: string[] = [];
  const borderColor = colors.table.border;

  // Border color
  css.push(`#markdown-content td, #markdown-content th {
  border-color: ${borderColor};
}`);

  // Header colors
  css.push(`#markdown-content th {
  background: ${colors.table.headerBackground};
  color: ${colors.table.headerText};
}`);

  // Zebra striping colors
  if (table.zebra?.enabled !== false) {
    css.push(`#markdown-content tr:nth-child(even) { background: ${colors.table.zebraEven}; }
#markdown-content tr:nth-child(odd) { background: ${colors.table.zebraOdd}; }`);
  }

  return css.join('\n\n');
}

/**
 * Generate code colors (layout is in base-styles)
 */
function generateCodeColorCSS(
  preset: ThemePreset,
  codeTheme: CodeTheme,
  colors: ColorScheme
): string {
  const css: string[] = [];
  const fontFamily = getFontFallback(preset.fontScheme.code.fontFamily);
  const bgColor = colors.background.code;

  // Code font and background
  css.push(`#markdown-content code {
  font-family: ${fontFamily};
  background: ${bgColor};
}`);

  // Code block background
  css.push(`#markdown-content pre {
  background: ${bgColor};
}`);

  // Ensure highlight.js styles work properly
  css.push(`#markdown-content .hljs {
  background: ${bgColor} !important;
  color: ${codeTheme.foreground || colors.text.primary};
}`);

  // Generate color mappings for syntax highlighting
  // Use codeTheme.colors object (matches Chrome plugin format)
  if (codeTheme.colors) {
    Object.entries(codeTheme.colors).forEach(([token, color]) => {
      // Ensure color has # prefix
      const colorValue = color.startsWith('#') ? color : `#${color}`;
      css.push(`#markdown-content .hljs-${token} { color: ${colorValue}; }`);
    });
  }

  return css.join('\n\n');
}

/**
 * Generate blockquote colors (layout is in base-styles.ts)
 */
function generateBlockquoteColorCSS(colors: ColorScheme): string {
  return `#markdown-content blockquote {
  border-left-color: ${colors.blockquote.border};
  color: ${colors.text.secondary};
}`;
}

/**
 * Generate horizontal rule colors (layout is in base-styles.ts)
 */
function generateHrColorCSS(colors: ColorScheme): string {
  return `#markdown-content hr {
  background-color: ${colors.table.border};
}`;
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Current theme configuration (for renderers)
 */
let currentThemeConfig: ThemeConfig | null = null;

/**
 * Whether base styles have been injected
 */
let baseStylesInjected = false;

/**
 * Theme API
 */
export const themes = {
  /**
   * List all available themes
   */
  list(): ThemeInfo[] {
    return THEME_REGISTRY.themes.map((entry) => {
      const preset = THEME_PRESETS[entry.id];
      return {
        id: entry.id,
        name: preset?.name || entry.id,
        name_en: preset?.name_en,
        description: preset?.description,
        description_en: preset?.description_en,
        category: entry.category,
        featured: entry.featured || false,
      };
    });
  },

  /**
   * List themes grouped by category
   */
  listByCategory(): CategoryInfo[] {
    const categories: Record<string, CategoryInfo> = {};

    for (const entry of THEME_REGISTRY.themes) {
      const preset = THEME_PRESETS[entry.id];
      const catInfo = THEME_REGISTRY.categories[entry.category];
      
      if (!categories[entry.category]) {
        categories[entry.category] = {
          id: entry.category,
          name: catInfo?.name || entry.category,
          name_en: catInfo?.name_en,
          themes: [],
        };
      }

      categories[entry.category].themes.push({
        id: entry.id,
        name: preset?.name || entry.id,
        name_en: preset?.name_en,
        description: preset?.description,
        description_en: preset?.description_en,
        category: entry.category,
        featured: entry.featured || false,
      });
    }

    return Object.values(categories);
  },

  /**
   * Get theme preset by ID
   */
  get(themeId: string): ThemePreset | undefined {
    return THEME_PRESETS[themeId];
  },

  /**
   * Generate CSS for a theme (without applying)
   * Returns only color/font overrides - use with injectBaseStyles() for full styling
   */
  toCSS(themeId: string): string {
    const preset = THEME_PRESETS[themeId];
    if (!preset) {
      throw new Error(`Theme not found: ${themeId}`);
    }

    const colors = COLOR_SCHEMES[preset.colorScheme];
    const layout = LAYOUT_SCHEMES[preset.layoutScheme];
    const table = TABLE_STYLES[preset.tableStyle];
    const code = CODE_THEMES[preset.codeTheme];

    if (!colors || !layout || !table || !code) {
      throw new Error(`Missing theme dependencies for: ${themeId}`);
    }

    const css: string[] = [
      generateFontAndColorCSS(preset, layout, colors),
      generateTableColorCSS(table, colors),
      generateCodeColorCSS(preset, code, colors),
      generateBlockquoteColorCSS(colors),
      generateHrColorCSS(colors),
    ];

    return css.join('\n\n');
  },

  /**
   * Apply theme to the current document
   * This injects both base styles (layout) and theme styles (colors/fonts)
   */
  apply(themeId: string): void {
    // Inject base styles first (only once)
    if (!baseStylesInjected) {
      injectBaseStyles();
      baseStylesInjected = true;
    }

    // Generate and inject theme CSS
    const css = this.toCSS(themeId);
    
    // Remove existing theme style
    const existing = document.getElementById('sdk-theme-style');
    if (existing) {
      existing.remove();
    }

    // Create and append new style element
    const style = document.createElement('style');
    style.id = 'sdk-theme-style';
    style.textContent = css;
    document.head.appendChild(style);

    // Update current theme config for renderers
    const preset = THEME_PRESETS[themeId];
    const layout = LAYOUT_SCHEMES[preset.layoutScheme];
    currentThemeConfig = {
      fontFamily: getFontFallback(preset.fontScheme.body.fontFamily),
      fontSize: parseFloat(layout.body.fontSize),
      diagramStyle: preset.diagramStyle || 'normal',
    };
  },

  /**
   * Get current theme configuration (for renderers)
   */
  getConfig(): ThemeConfig | null {
    return currentThemeConfig;
  },

  /**
   * Get color scheme by ID
   */
  getColorScheme(id: string): ColorScheme | undefined {
    return COLOR_SCHEMES[id];
  },

  /**
   * Get all color schemes
   */
  getColorSchemes(): Record<string, ColorScheme> {
    return COLOR_SCHEMES;
  },
};

// Re-export types
export type {
  ThemePreset,
  ColorScheme,
  LayoutScheme,
  TableStyle,
  CodeTheme,
};

// Re-export base styles injection for manual usage
export { injectBaseStyles } from './themes-data';
