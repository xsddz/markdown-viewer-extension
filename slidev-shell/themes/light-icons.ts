/**
 * Theme entry: slidev-theme-light-icons
 *
 * Exports layout overrides + imports theme CSS.
 * Loaded dynamically by the shell based on frontmatter `theme` field.
 */
import type { Component } from 'vue'

// Theme styles as inline string
import css from './css/light-icons.css?inline'

// Theme layout overrides
import CenterImage from 'slidev-theme-light-icons/layouts/center-image.vue'
import DynamicImage from 'slidev-theme-light-icons/layouts/dynamic-image.vue'
import ImageHeaderIntro from 'slidev-theme-light-icons/layouts/image-header-intro.vue'
import ImageLeft from 'slidev-theme-light-icons/layouts/image-left.vue'
import ImageRight from 'slidev-theme-light-icons/layouts/image-right.vue'
import Intro from 'slidev-theme-light-icons/layouts/intro.vue'

export const layouts: Record<string, Component> = {
  'center-image': CenterImage,
  'dynamic-image': DynamicImage,
  'image-header-intro': ImageHeaderIntro,
  'image-left': ImageLeft,
  'image-right': ImageRight,
  intro: Intro,
}

export { css }
