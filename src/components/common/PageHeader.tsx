import { useTranslation } from 'react-i18next';

interface PageHeaderProps {
  pageKey: string;
  className?: string;
}

const PageHeader = ({ pageKey, className = "" }: PageHeaderProps) => {
  const { t } = useTranslation(['pages']);

  return (
    <div className={`mb-6 ${className}`}>
      <h1 className="text-3xl font-bold text-foreground mb-2">
        {t(`pages:${pageKey}.title`)}
      </h1>
      <p className="text-muted-foreground">
        {t(`pages:${pageKey}.subtitle`)}
      </p>
    </div>
  );
};

export default PageHeader;