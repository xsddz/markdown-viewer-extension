/**
 * Theme entry: slidev-theme-mokkapps
 *
 * Exports layout overrides + imports theme CSS.
 * Loaded dynamically by the shell based on frontmatter `theme` field.
 */
import type { Component } from 'vue'

// Theme styles as inline string
import css from './css/mokkapps.css?inline'

// Theme layout overrides
import AboutMe from 'slidev-theme-mokkapps/layouts/about-me.vue'
import Cover from 'slidev-theme-mokkapps/layouts/cover.vue'
import Intro from 'slidev-theme-mokkapps/layouts/intro.vue'
import Outro from 'slidev-theme-mokkapps/layouts/outro.vue'
import Quote from 'slidev-theme-mokkapps/layouts/quote.vue'
import Section from 'slidev-theme-mokkapps/layouts/section.vue'
import Sfc from 'slidev-theme-mokkapps/layouts/sfc.vue'
import Video from 'slidev-theme-mokkapps/layouts/video.vue'

export const layouts: Record<string, Component> = {
  'about-me': AboutMe,
  cover: Cover,
  intro: Intro,
  outro: Outro,
  quote: Quote,
  section: Section,
  sfc: Sfc,
  video: Video,
}

export { css }

export const fonts = {
  sans: 'Open Sans',
  mono: 'Cascadia Code',
}
