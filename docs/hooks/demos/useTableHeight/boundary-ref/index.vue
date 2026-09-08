<script setup lang="ts">
import { ref } from 'vue';
import { useTableHeight } from '@yss-ui/hooks';
import { YTable, YButton, YCard } from '@yss-ui/components';

const tableWrapRef = ref<HTMLDivElement>();
const boundaryPanelRef = ref<HTMLDivElement>();

const dataLength = ref(2);

// 使用 boundaryRef 指定外层固定高度的安全边界
// extraOffset 包含了上方头部卡片和下方底部卡片的预留高度总和
const { tableHeight } = useTableHeight(tableWrapRef, {
  boundaryRef: boundaryPanelRef,
  extraOffset: 340, // 头部区域+底部区域+内外边距的近似固定总高度
  minHeight: 150,
});

const columns = [
  { field: 'name', title: 'Name' },
  { field: 'age', title: 'Age' },
];

const data = ref(
  Array.from({ length: dataLength.value }).map((_, i) => ({
    id: i,
    name: `Data ${i + 1}`,
    age: 20 + i,
  }))
);

const addData = () => {
  dataLength.value += 1;
  data.value.push({
    id: dataLength.value,
    name: `Data ${dataLength.value}`,
    age: 20 + dataLength.value,
  });
};
</script>

<template>
  <div ref="boundaryPanelRef" class="demo-wrapper">
    <YCard class="top-card" title="外层参照物边界 (Boundary)">
      <p>你可以点击增加数据，当数据很少时，下方卡片会被顶上来（Shrink Wrap）。</p>
      <YButton type="primary" @click="addData">添加一行数据</YButton>
    </YCard>

    <div ref="tableWrapRef" class="table-content-wrap">
      <YTable :height="tableHeight" :data="data" :columns="columns" />
    </div>

    <!-- 当上方表格数据不足时，这个卡片自然向上提；填满可用高度时则会固定在底部不变 -->
    <YCard class="bottom-card" title="底部调试卡片"> 底部内容区域 </YCard>
  </div>
</template>

<style scoped>
.demo-wrapper {
  /* 外层容器必须要有固定高度，或者 flex: 1 能够撑满视口高度 */
  height: 600px;
  border: 2px dashed #1890ff;
  padding: 16px;
  background-color: #f0f2f5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-card {
  margin-bottom: 16px;
  flex-shrink: 0;
}

.table-content-wrap {
  /* 
    注意这里没有设置 flex: 1 也没有 overflow: hidden
    它的高度是由内部表格内容撑开的 (shrink-wrap)
    所以它自身不能作为 ResizeObserver 的监听对象，否则会导致无限重绘闪烁
  */
  margin-bottom: 16px;
}

.bottom-card {
  flex-shrink: 0;
}
</style>
