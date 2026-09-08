import AuthorityDropdown from '../../authority/AuthorityDropdown.vue';
import YButton from '../../button/index.vue';
import YFileImport from '../../file-import/index.vue';
import AutoButtonGroup from '../components/AutoButtonGroup.vue';
import { NullRenderer, PassThroughRenderer } from '../components/DetailTreeRenderers';
import GroupHeader from '../components/GroupHeader.vue';
import Reset from '../components/Reset.vue';
import { SlotRenderer } from './useFormilySlots';
import { useAntdvRegistry } from './useAntdvRegistry';
import { useSchemaField } from './useSchemaField';

type AnyObject = Record<string, any>;

/** 详情隐式 Schema 树中不需要真实渲染的组件。 */
const HIDDEN_TREE_NULL_COMPONENTS = [
  'Input',
  'Password',
  'NumberPicker',
  'Select',
  'TreeSelect',
  'Cascader',
  'Checkbox',
  'Checkbox.Group',
  'Radio',
  'Radio.Group',
  'DatePicker',
  'TimePicker',
  'Transfer',
  'Upload',
  'Switch',
  'Input.TextArea',
  'TextArea',
  'Rate',
  'Slider',
  'Slot',
  'YButton',
  'YFileImport',
  'AuthorityDropdown',
  'Reset',
] as const;

/** 详情隐式 Schema 树中仅透传子节点的容器组件。 */
const HIDDEN_TREE_PASS_THROUGH_COMPONENTS = ['FormItem', 'InputGroup'] as const;

/** useFormilySchema 选项。 */
export interface FormilySchemaOptions {
  components?: AnyObject;
  scope?: AnyObject;
  mode?: number;
  formGrid: any;
}

/**
 * 用替代组件覆盖注册表中的普通或点路径组件。
 * @param target 组件注册表
 * @param path 组件路径
 * @param replacement 替代组件
 */
const overrideComponent = (target: AnyObject, path: string, replacement: any) => {
  if (!path.includes('.')) {
    if (path in target) target[path] = replacement;
    return;
  }

  const segments = path.split('.');
  const rootKey = segments.shift() as string;
  const rootValue = target[rootKey];
  if (!rootValue || (typeof rootValue !== 'object' && typeof rootValue !== 'function')) return;

  const clonedRoot = Array.isArray(rootValue) ? [...rootValue] : { ...rootValue };
  let cursor: any = clonedRoot;
  while (segments.length > 1) {
    const segment = segments.shift() as string;
    const current = cursor?.[segment];
    if (!current || (typeof current !== 'object' && typeof current !== 'function')) return;
    cursor[segment] = Array.isArray(current) ? [...current] : { ...current };
    cursor = cursor[segment];
  }
  cursor[segments[0]] = replacement;
  target[rootKey] = clonedRoot;
};

/**
 * 构造只用于执行详情态联动的轻量组件树。
 * @param components 完整组件注册表
 * @returns 隐式 Schema 树组件注册表
 */
const buildDetailTreeComponents = (components: AnyObject): AnyObject => {
  const next = { ...components };
  HIDDEN_TREE_PASS_THROUGH_COMPONENTS.forEach(name => overrideComponent(next, name, PassThroughRenderer));
  HIDDEN_TREE_NULL_COMPONENTS.forEach(name => overrideComponent(next, name, NullRenderer));
  return next;
};

/**
 * 聚合 YFormily 内置组件、外部组件与表达式作用域。
 * @param options Schema 组件选项
 * @returns 编辑态与详情隐式 SchemaField
 */
export const useFormilySchema = (options: FormilySchemaOptions) => {
  const { AntdvComponents, Rate, Slider, InputGroup } = useAntdvRegistry();
  /** YFormily 完整内置组件注册表。 */
  const schemaComponents = {
    ...AntdvComponents,
    FormGrid: options.formGrid,
    GroupHeader,
    AutoButtonGroup,
    Reset,
    YButton,
    YFileImport,
    AuthorityDropdown,
    Slot: SlotRenderer,
    Rate,
    Slider,
    InputGroup,
    ...(options.components || {}),
  } as AnyObject;
  /** Schema 表达式作用域。 */
  const schemaScope = {
    mode: options.mode,
    FormStep: (AntdvComponents as AnyObject).FormStep,
    ...(options.scope || {}),
  };
  const { SchemaField } = useSchemaField({ components: schemaComponents, scope: schemaScope });
  const { SchemaField: HiddenSchemaField } = useSchemaField({
    components: buildDetailTreeComponents(schemaComponents),
    scope: schemaScope,
  });
  return { SchemaField, HiddenSchemaField };
};
