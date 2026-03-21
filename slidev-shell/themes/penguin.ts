/**
 * Theme entry: slidev-theme-penguin
 *
 * Exports layout overrides + imports theme CSS.
 * Loaded dynamically by the shell based on frontmatter `theme` field.
 */
import type { Component } from 'vue'

// Theme styles as inline string
import css from './css/penguin.css?inline'

// Theme layout overrides
import Default from 'slidev-theme-penguin/layouts/default.vue'
import Intro from 'slidev-theme-penguin/layouts/intro.vue'
import NewSection from 'slidev-theme-penguin/layouts/new-section.vue'
import Presenter from 'slidev-theme-penguin/layouts/presenter.vue'
import TextImage from 'slidev-theme-penguin/layouts/text-image.vue'
import TextWindow from 'slidev-theme-penguin/layouts/text-window.vue'
import TwoCols from 'slidev-theme-penguin/layouts/two-cols.vue'
import TwoThirds from 'slidev-theme-penguin/layouts/two-thirds.vue'

export const layouts: Record<string, Component> = {
  default: Default,
  intro: Intro,
  'new-section': NewSection,
  presenter: Presenter,
  'text-image': TextImage,
  'text-window': TextWindow,
  'two-cols': TwoCols,
  'two-thirds': TwoThirds,
}

export { css }

export const fonts = {
  sans: 'Inter',
  mono: 'Fira Code',
}
