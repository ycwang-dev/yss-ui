/* eslint-disable vue/one-component-per-file */
import { defineComponent } from 'vue';

export const NullRenderer = defineComponent({
  name: 'YssFormilyNullRenderer',
  setup() {
    return () => null;
  },
});

export const PassThroughRenderer = defineComponent({
  name: 'YssFormilyPassThroughRenderer',
  setup(_, { slots }) {
    return () => slots.default?.();
  },
});
