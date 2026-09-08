<script setup lang="ts">
import { computed, defineComponent, h, ref, shallowRef } from 'vue';
import { ConfigProvider, RadioButton, RadioGroup } from 'ant-design-vue';
import { YTable, YCard, YFormily, type YTableActionConfig } from '@yss-ui/components';
import { YConfigProvider, useLocale, zhCN, type YssLocale, type YssLocaleName } from '@yss-ui/components/locale';
import antdZhCN from 'ant-design-vue/es/locale/zh_CN';

/** 内部组件使用真实渲染函数，兼容 Vue runtime-only 构建。 */
const LocaleViewer = defineComponent({
  setup() {
    const { t, localeName } = useLocale('common');
    return () => h('p', `${localeName.value}: ${t('confirm')} / ${t('cancel')}`);
  },
});
const language = ref<YssLocaleName>('zh-CN');
const locale = shallowRef<YssLocale>(zhCN);
const antdLocale = shallowRef(antdZhCN);
const busy = ref(false);
const failed = ref(false);
const labels = {
  'zh-CN': {
    title: '语言切换与编辑状态',
    name: '姓名',
    edit: '编辑',
    remove: '删除',
    hint: '输入后切换语言，内容会保留',
    error: '语言加载失败，请重试',
  },
  'zh-TW': {
    title: '語言切換與編輯狀態',
    name: '姓名',
    edit: '編輯',
    remove: '刪除',
    hint: '輸入後切換語言，內容會保留',
    error: '語言載入失敗，請重試',
  },
  'en-US': {
    title: 'Language and editing state',
    name: 'Name',
    edit: 'Edit',
    remove: 'Delete',
    hint: 'Switch language after typing; your input is preserved',
    error: 'Language loading failed. Please retry.',
  },
};
const content = computed(() => labels[language.value]);
const values = ref({ name: '' });
const data = ref([
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
]);
const pagination = ref({ current: 1, pageSize: 10, total: 2 });
const columns = computed(() => [{ field: 'name', title: content.value.name }]);
const schema = computed(() => ({
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: content.value.name,
      required: true,
      'x-decorator': 'FormItem',
      'x-component': 'Input',
    },
  },
}));
/** 正式操作列 API：text/clickFn/isConfirm；删除保持气泡确认。 */
const actions = computed<YTableActionConfig>(() => ({
  width: 180,
  buttons: [
    {
      key: 'delete',
      text: content.value.remove,
      type: 'link',
      isConfirm: true,
      clickFn: ({ row }) => {
        data.value = data.value.filter(item => item.id !== row.id);
      },
    },
  ],
}));
/** 资源全部到达后才提交，示例选择器在请求期间禁用。 */
const switchLanguage = async (next: YssLocaleName): Promise<void> => {
  busy.value = true;
  failed.value = false;
  try {
    const [yss, antd] = await Promise.all([
      next === 'en-US'
        ? import('@yss-ui/components/locale/en-US').then(module => module.default)
        : next === 'zh-TW'
          ? import('@yss-ui/components/locale/zh-TW').then(module => module.default)
          : Promise.resolve(zhCN),
      next === 'en-US'
        ? import('ant-design-vue/es/locale/en_US').then(module => module.default)
        : next === 'zh-TW'
          ? import('ant-design-vue/es/locale/zh_TW').then(module => module.default)
          : Promise.resolve(antdZhCN),
    ]);
    locale.value = yss;
    antdLocale.value = antd;
    language.value = next;
  } catch {
    failed.value = true;
  } finally {
    busy.value = false;
  }
};
</script>

<template>
  <ConfigProvider :locale="antdLocale">
    <YConfigProvider :locale="locale">
      <YCard :title="content.title">
        <RadioGroup :value="language" :disabled="busy" @change="switchLanguage($event.target.value)">
          <RadioButton value="zh-CN">简体中文</RadioButton>
          <RadioButton value="zh-TW">繁體中文</RadioButton>
          <RadioButton value="en-US">English</RadioButton>
        </RadioGroup>
        <LocaleViewer />
        <p>{{ content.hint }}</p>
        <p v-if="failed" role="alert">{{ content.error }}</p>
        <YFormily v-model="values" :schema="schema" />
        <YTable
          v-model:pagination="pagination"
          :columns="columns"
          :data="data"
          :action-config="actions"
          :show-action-column="true"
          :pageable="true"
        />
      </YCard>
    </YConfigProvider>
  </ConfigProvider>
</template>
