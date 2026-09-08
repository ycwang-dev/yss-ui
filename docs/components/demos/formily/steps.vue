<script setup lang="ts">
import { YButton, YFormily } from '@yss-ui/components';
import { Steps, message } from 'ant-design-vue';
import { computed, reactive, ref } from 'vue';
import {
  BASIC_SCHEMA,
  CONFIRM_SCHEMA,
  CONTACT_SCHEMA,
  STEP_ITEMS,
  type StepFormValues,
  type StepValues,
} from './steps.constant';

/** YFormily 对外实例能力。 */
interface FormilyExpose {
  submit: () => Promise<StepValues>;
}

/** 当前步骤。 */
const currentStep = ref(0);

/** 各步骤表单实例。 */
const basicFormRef = ref<FormilyExpose>();
const contactFormRef = ref<FormilyExpose>();

/** 跨步骤统一数据源。 */
const formData = reactive<StepFormValues>({
  basic: { name: '', gender: 'male' },
  contact: { phone: '', email: '' },
});

/** 确认页聚合数据。 */
const confirmValues = computed(() => ({ ...formData.basic, ...formData.contact }));

/** 当前可校验表单实例。 */
const activeFormRef = computed(() => [basicFormRef.value, contactFormRef.value][currentStep.value]);

/** 校验当前步骤并前进。 */
const handleNext = async () => {
  try {
    await activeFormRef.value?.submit();
    currentStep.value += 1;
  } catch {
    return;
  }
};

/** 返回上一步。 */
const handleBack = () => {
  currentStep.value = Math.max(0, currentStep.value - 1);
};

/** 提交全部步骤数据。 */
const handleSubmit = () => {
  message.success(`提交成功：${JSON.stringify(confirmValues.value)}`);
};
</script>

<template>
  <div class="step-form-demo">
    <Steps :current="currentStep" :items="STEP_ITEMS" />

    <div class="step-form-demo__content">
      <YFormily v-show="currentStep === 0" ref="basicFormRef" v-model="formData.basic" :schema="BASIC_SCHEMA" />
      <YFormily v-show="currentStep === 1" ref="contactFormRef" v-model="formData.contact" :schema="CONTACT_SCHEMA" />
      <YFormily
        v-if="currentStep === 2"
        :schema="CONFIRM_SCHEMA"
        :initial-values="confirmValues"
        :detail-options="{ bordered: true, maxColumns: 2 }"
        :mode="2"
      />
    </div>

    <div class="step-form-demo__actions">
      <YButton v-if="currentStep > 0" @click="handleBack">上一步</YButton>
      <YButton v-if="currentStep < 2" type="primary" @click="handleNext">下一步</YButton>
      <YButton v-else type="primary" @click="handleSubmit">提交</YButton>
    </div>
  </div>
</template>

<style scoped lang="less">
@import url('./steps.less');
</style>
