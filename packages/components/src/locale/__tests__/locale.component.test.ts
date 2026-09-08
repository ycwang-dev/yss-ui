import { defineComponent, h } from 'vue';
import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { useLocale, formatTemplate } from '../useLocale';
import { setGlobalLocale, getGlobalLocale } from '../context';
import YConfigProvider from '../config-provider/index.vue';
import YCron from '../../cron/index.vue';
import YTree from '../../tree/index.vue';
import zhCN from '../lang/zh-CN';
import enUS from '../lang/en-US';
import zhTW from '../lang/zh-TW';

describe('YSS UI 国际化 (i18n) 基础核心', () => {
  it('拒绝原型属性作为语言代码', () => {
    setGlobalLocale('toString');
    expect(getGlobalLocale().name).toBe('zh-CN');
  });

  it('无显式语言的 Provider 继承上下文，支持完整路径并拒绝原型属性', () => {
    setGlobalLocale(enUS);
    const Consumer = defineComponent({
      setup() {
        const { t } = useLocale();
        return () => h('div', `${t('table.actionTitle')}:${t('toString')}`);
      },
    });
    const wrapper = mount(YConfigProvider, { slots: { default: () => h(Consumer) } });
    expect(wrapper.text()).toBe('Actions:toString');
    wrapper.unmount();
    setGlobalLocale(zhCN);
  });

  it('formatTemplate 能够正确插值替换', () => {
    const text = formatTemplate('是否确认{action}此条数据？', { action: '删除' });
    expect(text).toBe('是否确认删除此条数据？');

    const multi = formatTemplate('总计 {total} 行，可导入 {success} 行', { total: 100, success: 98 });
    expect(multi).toBe('总计 100 行，可导入 98 行');

    const noParam = formatTemplate('无参数文本');
    expect(noParam).toBe('无参数文本');
  });

  it('默认状态下返回简体中文 (zh-CN)', () => {
    const TestComp = defineComponent({
      setup() {
        const { t, localeName } = useLocale('table');
        return () => h('div', { id: 'test' }, `${localeName.value}:${t('actionTitle')}`);
      },
    });

    const wrapper = mount(TestComp);
    expect(wrapper.find('#test').text()).toBe('zh-CN:操作');
  });

  it('通过 YConfigProvider 能够正确切换到英文 (en-US)', () => {
    const ConsumerComp = defineComponent({
      setup() {
        const { t, localeName } = useLocale('table');
        return () => h('div', { id: 'test' }, `${localeName.value}:${t('actionTitle')}:${t('more')}`);
      },
    });

    const AppComp = defineComponent({
      setup() {
        return () =>
          h(
            YConfigProvider,
            { locale: enUS, syncVxe: false },
            {
              default: () => h(ConsumerComp),
            }
          );
      },
    });

    const wrapper = mount(AppComp);
    expect(wrapper.find('#test').text()).toBe('en-US:Actions:More');
  });

  it('通过 YConfigProvider 能够正确切换到繁体中文 (zh-TW)', () => {
    const ConsumerComp = defineComponent({
      setup() {
        const { t, localeName } = useLocale('common');
        return () => h('div', { id: 'test' }, `${localeName.value}:${t('empty')}:${t('reset')}`);
      },
    });

    const AppComp = defineComponent({
      setup() {
        return () =>
          h(
            YConfigProvider,
            { locale: zhTW, syncVxe: false },
            {
              default: () => h(ConsumerComp),
            }
          );
      },
    });

    const wrapper = mount(AppComp);
    expect(wrapper.find('#test').text()).toBe('zh-TW:暫無資料:重設');
  });

  it('支持插值参数翻译', () => {
    const ConsumerComp = defineComponent({
      setup() {
        const { t } = useLocale('table');
        return () => h('div', { id: 'test' }, t('confirmTitle', { action: 'delete' }));
      },
    });

    const AppComp = defineComponent({
      setup() {
        return () =>
          h(
            YConfigProvider,
            { locale: enUS, syncVxe: false },
            {
              default: () => h(ConsumerComp),
            }
          );
      },
    });

    const wrapper = mount(AppComp);
    expect(wrapper.find('#test').text()).toBe('Are you sure to delete this item?');
  });

  it('支持 setGlobalLocale 全局修改', () => {
    const TestComp = defineComponent({
      setup() {
        const { t } = useLocale('common');
        return () => h('div', { id: 'test' }, t('confirm'));
      },
    });

    setGlobalLocale(enUS);
    const wrapperEn = mount(TestComp);
    expect(wrapperEn.find('#test').text()).toBe('OK');

    // 还原为中文
    setGlobalLocale(zhCN);
    const wrapperZh = mount(TestComp);
    expect(wrapperZh.find('#test').text()).toBe('确定');
  });

  it('三语语言包 (zh-CN, en-US, zh-TW) 结构 100% 镜像对齐', () => {
    const getKeys = (obj: any, prefix = ''): string[] => {
      let keys: string[] = [];
      for (const k of Object.keys(obj)) {
        if (k === 'name') continue;
        const p = prefix ? `${prefix}.${k}` : k;
        if (obj[k] && typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
          keys = keys.concat(getKeys(obj[k], p));
        } else {
          keys.push(p);
        }
      }
      return keys.sort();
    };

    const zhKeys = getKeys(zhCN);
    const enKeys = getKeys(enUS);
    const twKeys = getKeys(zhTW);

    expect(enKeys).toEqual(zhKeys);
    expect(twKeys).toEqual(zhKeys);
  });

  it('YCron 组件支持语言切换', async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              YConfigProvider,
              { locale: enUS, syncVxe: false },
              {
                default: () => h(YCron, { modelValue: '* * * * * ? *' }),
              }
            );
        },
      })
    );

    expect(wrapper.text()).toContain('Second');
    expect(wrapper.text()).toContain('Minute');
    expect(wrapper.text()).toContain('Reset');
  });

  it('YTree 组件支持语言切换', async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              YConfigProvider,
              { locale: enUS, syncVxe: false },
              {
                default: () => h(YTree, { filterable: true }),
              }
            );
        },
      })
    );

    const input = wrapper.find('input');
    expect(input.attributes('placeholder')).toBe('Please enter keywords');
  });
});
