<script setup lang="ts">
import { ref } from 'vue';
import { useTableHeight } from '@yss-ui/hooks';
import { YTable, YButton } from '@yss-ui/components';
import { Modal } from 'ant-design-vue';

const open = ref(false);
const tableAreaRef = ref<HTMLDivElement>();

const { tableHeight } = useTableHeight(tableAreaRef, {
  withPagination: true,
});

const columns = [
  { field: 'name', title: 'Name' },
  { field: 'role', title: 'Role' },
];

const data = Array.from({ length: 50 }).map((_, i) => ({
  id: i,
  name: `User ${i}`,
  role: ['Admin', 'User', 'Guest'][i % 3],
}));

const showModal = () => {
  open.value = true;
};
</script>

<template>
  <div>
    <YButton type="primary" @click="showModal">打开弹窗表格</YButton>

    <Modal
      v-model:open="open"
      title="弹窗中的表格"
      width="800px"
      :body-style="{ height: '500px', display: 'flex', flexDirection: 'column' }"
      :footer="null"
    >
      <!-- 
        Modal body 设置了固定高度和 flex 布局
        tableAreaRef 只需要 flex: 1 即可撑满剩余空间
      -->
      <div ref="tableAreaRef" style="flex: 1; overflow: hidden">
        <YTable :height="tableHeight" :data="data" :columns="columns" :pageable="true" />
      </div>
    </Modal>
  </div>
</template>
