import type { PropsWithChildren, ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  actions?: ReactNode;
}

export const PageHeader = ({ title, actions }: PropsWithChildren<PageHeaderProps>) => (
  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
    <h1 className="text-xl font-semibold">{title}</h1>
    {actions}
  </div>
);

export default PageHeader;
