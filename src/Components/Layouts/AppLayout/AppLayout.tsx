import React, { ReactNode } from 'react';

import './AppLayout.scss';

interface AppLayoutProps {
  header: JSX.Element;
  children: ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  header,
  children,
}): React.ReactElement => {
  return (
    <div className="app-layout">
      <header className="app-layout__header">{header}</header>
      <div className="app-layout__content">{children}</div>
    </div>
  );
};
