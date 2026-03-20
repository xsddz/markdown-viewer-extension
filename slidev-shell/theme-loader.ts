/**
 * Theme loader
 *
 * All themes are statically imported so the bundler can inline them
 * without dynamic import(). Theme CSS is imported as ?inline strings
 * and injected into the DOM only when the theme is selected.
 */
import type { Component } from 'vue'

export interface ThemeModule {
  layouts: Record<string, Component>
  css?: string
  fonts?: {
    mono?: string
    sans?: string
    serif?: string
    local?: string
  }
}

// Static imports — all themes bundled together
import * as themeDefault from './themes/default'
import * as themeSeriph from './themes/seriph'
import * as themeAppleBasic from './themes/apple-basic'
import * as themeBricks from './themes/bricks'
import * as themeDracula from './themes/dracula'
import * as themePurplin from './themes/purplin'
import * as themeAcademic from './themes/academic'
import * as themeGeist from './themes/geist'

const themes: Record<string, ThemeModule> = {
  default: themeDefault,
  seriph: themeSeriph,
  'apple-basic': themeAppleBasic,
  bricks: themeBricks,
  dracula: themeDracula,
  purplin: themePurplin,
  academic: themeAcademic,
  geist: themeGeist,
}

/** Available theme names */
export const availableThemes = Object.keys(themes)

let _injectedStyle: HTMLStyleElement | null = null

/**
 * Get a theme by name. Injects the theme's CSS into the DOM.
 * Returns the theme module or undefined if not found.
 */
export function getTheme(name: string): ThemeModule | undefined {
  const theme = themes[name]
  if (!theme) {
    console.warn(`[slidev-shell] Theme "${name}" not available. Available: ${availableThemes.join(', ')}`)
    return undefined
  }

  // Inject theme CSS (replace previous theme's styles)
  if (theme.css) {
    if (_injectedStyle) {
      _injectedStyle.textContent = theme.css
    } else {
      _injectedStyle = document.createElement('style')
      _injectedStyle.setAttribute('data-slidev-theme', name)
      _injectedStyle.textContent = theme.css
      document.head.appendChild(_injectedStyle)
    }
  }

  return theme
}
