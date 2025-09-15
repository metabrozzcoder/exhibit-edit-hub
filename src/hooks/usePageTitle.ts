import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const usePageTitle = (pageKey: string) => {
  const { t } = useTranslation(['pages']);

  useEffect(() => {
    const title = t(`pages:${pageKey}.title`);
    document.title = `ARIMUS — ${title}`;
  }, [pageKey, t]);
};