import { useLocale } from '../../locale/useLocale';
import { calcActionColumnWidth, resolveAdaptiveDisplayLimit } from '../../table/utils/calcActionWidth';

export function useActionConfig(props: { actionConfig?: any }) {
  const { t, localeName } = useLocale('table');
  const resolveActionConfig = (column?: any) => {
    const colCfg = (column as any)?.actionConfig;
    const isEn = localeName.value === 'en-US';
    const mergedButtons = colCfg?.buttons ?? props.actionConfig?.buttons ?? [];
    const mergedTitle = colCfg?.title ?? props.actionConfig?.title ?? t('actionTitle');
    const mergedMoreRenderType = colCfg?.moreRenderType ?? props.actionConfig?.moreRenderType ?? 'moreButton';
    const mergedMoreText = colCfg?.moreText ?? props.actionConfig?.moreText;
    const userDisplayLimit = colCfg?.displayLimit ?? props.actionConfig?.displayLimit;
    const userWidth = colCfg?.width ?? props.actionConfig?.width;

    const displayLimit = resolveAdaptiveDisplayLimit({
      buttons: mergedButtons,
      userDisplayLimit,
      isEn,
    });

    const width = calcActionColumnWidth({
      buttons: mergedButtons,
      displayLimit,
      userWidth,
      isEn,
      title: mergedTitle,
      moreRenderType: mergedMoreRenderType,
      moreText: mergedMoreText,
    });

    const base = {
      title: mergedTitle,
      width,
      align: 'center',
      fixed: 'right' as const,
      displayLimit,
      moreRenderType: mergedMoreRenderType,
      buttons: mergedButtons,
      moreText: mergedMoreText,
    };
    return { ...base, ...(props.actionConfig || {}), ...(colCfg || {}), width, displayLimit };
  };
  return { resolveActionConfig };
}
