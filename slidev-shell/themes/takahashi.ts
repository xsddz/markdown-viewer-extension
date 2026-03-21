/**
 * Theme entry: slidev-theme-takahashi
 *
 * Exports layout overrides + imports theme CSS.
 * Loaded dynamically by the shell based on frontmatter `theme` field.
 */
import type { Component } from 'vue'

// Theme styles as inline string
import css from './css/takahashi.css?inline'

// Theme layout overrides
import Cover from 'slidev-theme-takahashi/layouts/cover.vue'
import Default from 'slidev-theme-takahashi/layouts/default.vue'
import End from 'slidev-theme-takahashi/layouts/end.vue'
import Reverse from 'slidev-theme-takahashi/layouts/reverse.vue'

export const layouts: Record<string, Component> = {
  cover: Cover,
  default: Default,
  end: End,
  reverse: Reverse,
}

export { css }

export const fonts = {
  sans: 'Nunito Sans',
  mono: 'Fira Code',
}
