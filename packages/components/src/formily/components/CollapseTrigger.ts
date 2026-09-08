import { DownOutlined, UpOutlined } from '@ant-design/icons-vue';
import { Fragment, defineComponent, h, inject } from 'vue';
import { useLocale } from '../../locale/useLocale';
import YButton from '../../button/index.vue';
import { FORMILY_COLLAPSE_CONTEXT, type FormilyCollapseContext } from '../hooks/useFormilyCollapse';
import { SLOTS_KEY } from '../hooks/useFormilySlots';

/**
 * YFormily 默认展开/收起触发器，并透传根组件自定义插槽。
 */
export default defineComponent({
  name: 'YssFormilyCollapseTrigger',
  setup() {
    const { t } = useLocale('formily');
    const collapse = inject<FormilyCollapseContext | null>(FORMILY_COLLAPSE_CONTEXT, null);
    const rootSlots = inject<Record<string, (...args: any[]) => any> | null>(SLOTS_KEY, null);

    return () => {
      if (!collapse?.showTrigger.value) return null;
      const scope = collapse.slotScope.value;
      const customTrigger = rootSlots?.['collapse-trigger'];
      if (customTrigger) {
        return h(Fragment, customTrigger(scope));
      }

      const expanded = collapse.expanded.value;
      const Icon = expanded ? UpOutlined : DownOutlined;
      return h(
        YButton,
        {
          type: 'link',
          class: 'yss-formily__collapse-trigger',
          'aria-expanded': expanded,
          'aria-controls': collapse.controlsId.value,
          onClick: collapse.toggle,
        },
        {
          default: () => [
            expanded ? t('collapse') : t('expand'),
            h(Icon, { class: 'yss-formily__collapse-icon', 'aria-hidden': 'true' }),
          ],
        }
      );
    };
  },
});
