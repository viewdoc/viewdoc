// JSX types definition, copied from https://medium.com/@hayavuk/using-jsx-with-vue-js-and-typescript-d6963e44de48

import Vue, { VNode } from 'vue'

declare global {
  namespace JSX {
    interface Element extends VNode {}
    interface ElementClass extends Vue {}
    interface IntrinsicElements {
      [elem: string]: any
    }
  }
}
