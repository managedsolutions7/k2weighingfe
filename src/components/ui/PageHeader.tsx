import type { PropsWithChildren, ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export const PageHeader = ({ title, subtitle, actions }: PropsWithChildren<PageHeaderProps>) => (
  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
    <div>
      <h1 className="text-xl font-semibold">{title}</h1>
      {subtitle && <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>}
    </div>
    {actions}
  </div>
);

export default PageHeader;
