/**
 * markdown-viewer-sdk
 *
 * Markdown Viewer SDK library
 * Uses export * to automatically inherit new features from the main project
 */

// ============ Core Processing ============
// Use export * to automatically inherit all exports
export * from '../../src/core/markdown-processor';

// ============ Renderers ============
export { renderers } from '../../src/renderers/index';
export { BaseRenderer } from '../../src/renderers/base-renderer';

// ============ Exporters ============
export { default as DocxExporter } from '../../src/exporters/docx-exporter';

// ============ Themes ============
export { default as themeManager } from '../../src/utils/theme-manager';

// ============ SDK Built-in Themes ============
export { themes } from './themes';
export type {
  ThemeInfo,
  CategoryInfo,
  ThemeConfig,
  ThemePreset,
  ColorScheme,
  LayoutScheme,
  TableStyle,
  CodeTheme,
} from './themes';

// ============ SDK Defaults ============
export {
  MERMAID_CDN_URL,
  loadScript,
  initMermaid,
  isMermaidAvailable,
} from './sdk-defaults';

// ============ Types ============
export type * from '../../src/types/index';
export type { RenderResult, RendererThemeConfig } from '../../src/types/render';
export type { PluginRenderer, PluginRenderResult } from '../../src/types/plugin';

// ============ Convenience API ============
import {
  processMarkdownToHtml,
  AsyncTaskManager,
} from '../../src/core/markdown-processor';
import { renderers } from '../../src/renderers/index';
import type { BaseRenderer } from '../../src/renderers/base-renderer';
import type { PluginRenderer, PluginRenderResult } from '../../src/types/plugin';
import DocxExporter from '../../src/exporters/docx-exporter';
import themeManager from '../../src/utils/theme-manager';
import {
  initMermaid,
  isMermaidAvailable,
} from './sdk-defaults';
import { fallbackDownload } from '../../src/exporters/docx-download';
import { themes } from './themes';

// Import DOCX utilities for direct export
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

/**
 * SDK initialization state
 */
let _initialized = false;

/**
 * Initialize the SDK
 * - Loads Mermaid library from CDN (for diagram rendering)
 *
 * @example
 * ```ts
 * import { init, toHtmlWithRendering } from 'markdown-viewer-sdk';
 *
 * await init();
 * const html = await toHtmlWithRendering('```mermaid\nflowchart LR\nA-->B\n```');
 * ```
 */
export async function init(): Promise<void> {
  if (_initialized) return;

  try {
    await initMermaid();
  } catch (error) {
    console.warn('Failed to load Mermaid:', error);
  }

  _initialized = true;
}

/**
 * Check if SDK is initialized
 */
export function isInitialized(): boolean {
  return _initialized;
}

/**
 * Create a PluginRenderer from renderers array
 * This adapts the BaseRenderer[] to the PluginRenderer interface
 */
export function createPluginRenderer(
  rendererList: BaseRenderer[] = renderers
): PluginRenderer {
  const rendererMap = new Map<string, BaseRenderer>();
  for (const r of rendererList) {
    rendererMap.set(r.type, r);
  }

  return {
    async render(
      type: string,
      content: string | object
    ): Promise<PluginRenderResult | null> {
      const renderer = rendererMap.get(type);
      if (!renderer) {
        return null;
      }

      try {
        const result = await renderer.render(
          typeof content === 'string' ? content : JSON.stringify(content),
          {} // empty theme config
        );
        if (!result) return null;

        return {
          base64: result.base64,
          width: result.width,
          height: result.height,
          format: result.format,
          error: result.error,
        };
      } catch (error) {
        return {
          width: 0,
          height: 0,
          format: 'error',
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  };
}

/**
 * Simplified Markdown to HTML function
 * No diagram rendering (mermaid/vega/etc. show placeholders)
 *
 * @example
 * ```ts
 * import { toHtml } from 'markdown-viewer-sdk';
 * const html = await toHtml('# Hello World');
 * ```
 */
export async function toHtml(markdown: string): Promise<string> {
  // Create a noop renderer (no mermaid/vega/etc. rendering)
  const noopRenderer = {
    render: async () => null,
  };

  return processMarkdownToHtml(markdown, {
    renderer: noopRenderer,
    taskManager: new AsyncTaskManager(),
    frontmatterDisplay: 'hide',
  });
}

/**
 * Markdown to HTML with full diagram rendering
 * Renders mermaid, vega, graphviz, etc.
 *
 * NOTE: Call init() first to load required libraries
 *
 * @example
 * ```ts
 * import { init, toHtmlWithRendering } from 'markdown-viewer-sdk';
 *
 * await init();
 * const html = await toHtmlWithRendering('```mermaid\nflowchart LR\nA-->B\n```');
 * ```
 */
export async function toHtmlWithRendering(markdown: string): Promise<string> {
  const pluginRenderer = createPluginRenderer(renderers);

  return processMarkdownToHtml(markdown, {
    renderer: pluginRenderer,
    taskManager: new AsyncTaskManager(),
    frontmatterDisplay: 'hide',
  });
}

/**
 * Simple DOCX export for standalone SDK usage
 * Uses built-in default theme, no platform dependencies
 *
 * @param markdown - Markdown content to export
 * @param filename - Output filename (default: 'document.docx')
 *
 * @example
 * ```ts
 * import { exportToDocx } from 'markdown-viewer-sdk';
 *
 * await exportToDocx('# Hello World\n\nThis is a test.', 'hello.docx');
 * ```
 */
export async function exportToDocx(
  markdown: string,
  filename: string = 'document.docx',
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  // Use the full DocxExporter for complete functionality
  const exporter = new DocxExporter();
  await exporter.exportToDocx(markdown, filename, onProgress);
}

/**
 * Library version (replaced at build time)
 */
export const VERSION = '__VERSION__';

// ============ Browser globals (for IIFE builds) ============
if (typeof window !== 'undefined') {
  (window as any).MarkdownViewer = {
    // Initialization
    init,
    isInitialized,
    isMermaidAvailable,
    // Core
    toHtml,
    toHtmlWithRendering,
    processMarkdownToHtml,
    AsyncTaskManager,
    createPluginRenderer,
    // Renderers
    renderers,
    // Exporters
    DocxExporter,
    exportToDocx,
    // Themes
    themeManager,
    themes,
    // Version
    VERSION,
  };
}
