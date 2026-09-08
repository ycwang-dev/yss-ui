<script setup lang="ts">
import { computed, provide, watch } from 'vue';
import { LOCALE_INJECTION_KEY } from '../context';
import { useLocale } from '../useLocale';
import type { YssLocale } from '../types';

defineOptions({ name: 'YConfigProvider' });

const props = withDefaults(
  defineProps<{
    locale?: YssLocale;
    syncVxe?: boolean;
  }>(),
  {
    locale: undefined,
    syncVxe: false,
  }
);

const { currentLocale: parentLocale } = useLocale();
const localeRef = computed(() => props.locale ?? parentLocale.value);

provide(LOCALE_INJECTION_KEY, localeRef);

watch(
  () => [props.syncVxe, localeRef.value.name] as const,
  async ([enabled, locale], _, onCleanup) => {
    let active = true;
    onCleanup(() => {
      active = false;
    });
    if (!enabled) return;
    const { syncVxeLanguage } = await import('../vxeBridge');
    if (active) await syncVxeLanguage(locale);
  },
  { immediate: true }
);
</script>

<template>
  <slot />
</template>
