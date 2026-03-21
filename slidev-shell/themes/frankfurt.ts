/**
 * Theme entry: slidev-theme-frankfurt
 *
 * Exports layout overrides + imports theme CSS.
 * Loaded dynamically by the shell based on frontmatter `theme` field.
 */
import type { Component } from 'vue'

// Theme styles as inline string
import css from './css/frankfurt.css?inline'

// Theme layout overrides
import Cover from 'slidev-theme-frankfurt/layouts/cover.vue'
import Intro from 'slidev-theme-frankfurt/layouts/intro.vue'

export const layouts: Record<string, Component> = {
  cover: Cover,
  intro: Intro,
}

export { css }

export const fonts = {
  sans: 'Nunito Sans',
  mono: 'Fira Code',
}
