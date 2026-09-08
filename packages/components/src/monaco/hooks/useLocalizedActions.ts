import { onBeforeUnmount, watch } from 'vue';
import { useLocale } from '../../locale/useLocale';

/** 动作描述：label 使用 monaco 命名空间键，run 与快捷键保持原样。 */
interface LocalizedAction {
  id: string;
  label: string;
  [key: string]: unknown;
}

/** 在 setup 建立语言订阅，只替换自定义动作，不重建模型、撤销栈或全屏状态。 */
export const useLocalizedActions = (getEditor: () => any): ((action: LocalizedAction) => void) => {
  const { t, localeName } = useLocale('monaco');
  const actions = new Map<string, { action: LocalizedAction; dispose?: () => void }>();
  const register = (action: LocalizedAction): void => {
    actions.get(action.id)?.dispose?.();
    const disposable = getEditor()?.addAction({ ...action, label: t(action.label) });
    actions.set(action.id, { action, dispose: () => disposable?.dispose() });
  };
  watch(localeName, () => {
    [...actions.values()].forEach(({ action }) => register(action));
  });
  onBeforeUnmount(() => {
    actions.forEach(item => item.dispose?.());
    actions.clear();
  });
  return register;
};
