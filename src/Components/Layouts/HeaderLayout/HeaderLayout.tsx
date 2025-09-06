import React, { ReactNode } from 'react';

import './HeaderLayout.scss';

interface HeaderLayoutProps {
  title: string;
  footer: JSX.Element;
  children: ReactNode;
}

export const HeaderLayout: React.FC<HeaderLayoutProps> = ({
  title,
  footer,
  children,
}) => {
  return (
    <div className="header-layout">
      <header className="header-layout__title">{title}</header>
      <div className="header-layout__content">{children}</div>
      <footer className="header-layout__footer">{footer}</footer>
    </div>
  );
};
