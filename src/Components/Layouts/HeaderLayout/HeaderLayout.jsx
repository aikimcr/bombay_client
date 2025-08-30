import React from "react";

import "./HeaderLayout.scss";

export const HeaderLayout = ({ title, footer, children }) => {
  return (
    <div className="header-layout">
      <header className="header-layout__title">{title}</header>
      <div className="header-layout__content">{children}</div>
      <footer className="header-layout__footer">{footer}</footer>
    </div>
  );
};
