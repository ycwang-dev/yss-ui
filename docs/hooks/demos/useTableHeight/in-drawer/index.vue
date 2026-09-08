<script setup lang="ts">
import { ref } from 'vue';
import { useTableHeight } from '@yss-ui/hooks';
import { YTable, YButton } from '@yss-ui/components';
import { Drawer } from 'ant-design-vue';

const open = ref(false);
const tableAreaRef = ref<HTMLDivElement>();

const { tableHeight } = useTableHeight(tableAreaRef, {
  withPagination: true,
  // 抽屉底部通常没有额外边距，或者直接贴合
  extraOffset: 0,
});

const columns = [
  { field: 'date', title: 'Date', width: 120 },
  { field: 'event', title: 'Event' },
  { field: 'status', title: 'Status', width: 100 },
];

const data = Array.from({ length: 50 }).map((_, i) => ({
  id: i,
  date: '2024-01-01',
  event: `System Event Log ${i}`,
  status: 'Success',
}));

const showDrawer = () => {
  open.value = true;
};
</script>

<template>
  <div>
    <YButton @click="showDrawer">打开抽屉表格</YButton>

    <Drawer
      v-model:open="open"
      title="抽屉中的表格"
      width="600px"
      :body-style="{ display: 'flex', flexDirection: 'column', padding: '16px', height: '100%' }"
    >
      <!-- 
        Drawer body 默认高度就是 100%(减去header)，设置 flex 布局后
        tableAreaRef 自动填充
      -->
      <div ref="tableAreaRef" style="flex: 1; overflow: hidden">
        <YTable :height="tableHeight" :data="data" :columns="columns" :pageable="true" />
      </div>
    </Drawer>
  </div>
</template>
