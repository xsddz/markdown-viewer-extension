/**
 * SDK Default Configuration
 *
 * Contains CDN configuration and library loading utilities for standalone SDK usage.
 */

/**
 * Mermaid CDN URL
 */
export const MERMAID_CDN_URL = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';

/**
 * Load a script from URL
 */
export function loadScript(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (document.querySelector(`script[src="${url}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
    document.head.appendChild(script);
  });
}

/**
 * Initialize Mermaid library from CDN
 */
export async function initMermaid(): Promise<void> {
  await loadScript(MERMAID_CDN_URL);

  // Wait for mermaid to be available
  const mermaid = (window as unknown as { mermaid?: { initialize: (config: object) => void } }).mermaid;
  if (!mermaid) {
    throw new Error('Mermaid library loaded but not available on window');
  }

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    theme: 'default',
    flowchart: {
      htmlLabels: true,
      curve: 'basis',
    },
  });
}

/**
 * Check if Mermaid is available
 */
export function isMermaidAvailable(): boolean {
  return typeof (window as unknown as { mermaid?: unknown }).mermaid !== 'undefined';
}
