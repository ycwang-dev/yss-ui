<script setup lang="ts">
import { ref } from 'vue';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn.js';
import { YMonthCalendar } from '@yss-ui/components';

dayjs.locale('zh-cn');
import type { YMonthCalendarCellContext } from '@yss-ui/components';

/** 演示日期状态接口定义。 */
interface DemoDayMeta {
  /** 状态类型 */
  status: 'open' | 'closed' | 'single';
  /** 状态展示文案 */
  statusText: string;
  /** 星期展示文案 */
  weekLabel: string;
  /** 关联市场标签列表 */
  tags: string[];
  /** 特殊事件标记，如月末、结息 */
  special?: string;
}

/** 选中日期。 */
const value = ref(dayjs('2026-07-01'));
/** 展示月份。 */
const month = ref(dayjs('2026-07-01'));

/**
 * 获取演示日期的市场状态元数据。
 * @param date - 待计算的日期对象
 * @returns 日期元数据
 */
const getDayMeta = (date: dayjs.Dayjs): DemoDayMeta => {
  const isWeekend = [0, 6].includes(date.day());
  const isSingleMarket = [8, 22].includes(date.date());
  const special = date.date() === date.daysInMonth() ? '月末' : date.date() === 15 ? '结息' : undefined;

  if (isWeekend) {
    return {
      status: 'closed',
      statusText: '休市',
      weekLabel: `周${'日一二三四五六'[date.day()]}`,
      tags: ['所', '银'],
      special,
    };
  }

  return {
    status: isSingleMarket ? 'single' : 'open',
    statusText: isSingleMarket ? '单市场' : '双市场',
    weekLabel: `周${'日一二三四五六'[date.day()]}`,
    tags: isSingleMarket ? ['所'] : ['所', '银'],
    special,
  };
};

/**
 * 根据日期上下文动态返回单元格的额外类名。
 * @param context - 单元格上下文对象
 * @returns 类名字符串
 */
const getCellClassName = (context: YMonthCalendarCellContext): string => {
  if (!context.isCurrentMonth) return '';
  return `demo-calendar-cell--${getDayMeta(context.date).status}`;
};
</script>

<template>
  <div class="month-calendar-demo-custom">
    <div class="month-calendar-demo-custom__guide">
      <span><i class="is-open"></i>交易日</span>
      <span><i class="is-closed"></i>休市</span>
      <span><i class="is-special"></i>特殊日期</span>
    </div>

    <YMonthCalendar v-model="value" v-model:month="month" :cell-class-name="getCellClassName">
      <template #date-cell-extra="{ date, isCurrentMonth }">
        <template v-if="isCurrentMonth">
          <div class="demo-calendar-cell__summary">
            <strong :class="`is-${getDayMeta(date).status}`" :title="getDayMeta(date).statusText">
              {{ getDayMeta(date).statusText }}
            </strong>
            <span :title="getDayMeta(date).weekLabel">{{ getDayMeta(date).weekLabel }}</span>
          </div>
          <div class="demo-calendar-cell__tags">
            <span
              v-for="(tag, index) in getDayMeta(date).tags"
              :key="tag"
              :title="tag"
              :class="[{ 'is-bank': index === 1 }, { 'is-muted': getDayMeta(date).status === 'closed' }]"
            >
              {{ tag }}
            </span>
            <b v-if="getDayMeta(date).special" :title="getDayMeta(date).special">
              {{ getDayMeta(date).special }}
            </b>
          </div>
        </template>
      </template>
    </YMonthCalendar>
  </div>
</template>

<style scoped lang="less">
/* stylelint-disable selector-pseudo-class-no-unknown */
.month-calendar-demo-custom {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.month-calendar-demo-custom__guide {
  display: flex;
  align-items: center;
  gap: 18px;
  height: 34px;
  margin-bottom: 10px;
  padding: 0 12px;
  color: #68758a;
  font-size: 12px;
  border: 1px solid #e4e9f2;
  border-radius: 11px;
  background: #f8fafd;
}

.month-calendar-demo-custom__guide span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.month-calendar-demo-custom__guide i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.month-calendar-demo-custom__guide .is-open {
  background: #27ae7b;
}

.month-calendar-demo-custom__guide .is-closed {
  background: #e65750;
}

.month-calendar-demo-custom__guide .is-special {
  background: #e48a2b;
}

.month-calendar-demo-custom :deep(.demo-calendar-cell--closed) {
  border-color: rgb(229 87 80 / 19%);
  background:
    radial-gradient(circle at 88% 8%, rgb(255 255 255 / 72%), transparent 25%),
    linear-gradient(145deg, rgb(255 244 243 / 96%), rgb(255 233 231 / 74%));
}

.month-calendar-demo-custom :deep(.demo-calendar-cell--single) {
  border-color: rgb(229 148 54 / 20%);
  background: linear-gradient(145deg, rgb(255 252 243 / 96%), rgb(255 246 222 / 74%));
}

.demo-calendar-cell__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
  min-width: 0;
  font-size: 11px;
}

.demo-calendar-cell__summary strong {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.demo-calendar-cell__summary strong.is-open {
  color: #24a774;
}

.demo-calendar-cell__summary strong.is-closed {
  color: #dd4f49;
}

.demo-calendar-cell__summary strong.is-single {
  color: #d98126;
}

.demo-calendar-cell__summary span {
  flex-shrink: 0;
  color: #929caf;
}

.demo-calendar-cell__tags {
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: 17px;
}

.demo-calendar-cell__tags span,
.demo-calendar-cell__tags b {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 17px;
  box-sizing: border-box;
  padding: 0 5px;
  color: #279b70;
  font-size: 10px;
  line-height: 17px;
  font-weight: 500;
  border: 1px solid rgb(45 174 126 / 18%);
  border-radius: 7px;
  background: rgb(224 248 239 / 82%);
}

.demo-calendar-cell__tags span.is-bank {
  color: #4475e8;
  border-color: rgb(68 117 232 / 18%);
  background: rgb(229 236 255 / 86%);
}

.demo-calendar-cell__tags span.is-muted {
  color: #98989d;
  border-color: rgb(135 135 141 / 15%);
  background: rgb(235 233 233 / 72%);
}

.demo-calendar-cell__tags b {
  margin-left: auto;
  color: #dc7827;
  border-color: rgb(220 120 39 / 18%);
  background: rgb(255 238 220 / 88%);
}

/* --- 暗色模式适配 --- */
[data-prefers-color='dark'] {
  .month-calendar-demo-custom__guide {
    color: rgb(255 255 255 / 65%);
    border-color: rgb(255 255 255 / 12%);
    background: #1f1f1f;
  }

  .month-calendar-demo-custom {
    :deep(.demo-calendar-cell--closed) {
      border-color: rgb(229 87 80 / 30%);
      background: linear-gradient(145deg, rgb(229 87 80 / 12%), rgb(229 87 80 / 4%));
    }

    :deep(.demo-calendar-cell--single) {
      border-color: rgb(229 148 54 / 30%);
      background: linear-gradient(145deg, rgb(229 148 54 / 12%), rgb(229 148 54 / 4%));
    }
  }

  .demo-calendar-cell__tags {
    span,
    b {
      color: #38c18f;
      border-color: rgb(45 174 126 / 30%);
      background: rgb(45 174 126 / 15%);
    }

    span.is-bank {
      color: #5c8cf4;
      border-color: rgb(68 117 232 / 30%);
      background: rgb(68 117 232 / 15%);
    }

    span.is-muted {
      color: rgb(255 255 255 / 45%);
      border-color: rgb(255 255 255 / 15%);
      background: rgb(255 255 255 / 8%);
    }

    b {
      color: #e58c3d;
      border-color: rgb(220 120 39 / 30%);
      background: rgb(220 120 39 / 15%);
    }
  }
}
</style>
