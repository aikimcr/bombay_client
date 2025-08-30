import React from "react";

export const HeaderLayout = ({ title, children }) => {
  return (
    <div className="header-layout">
      <header className="header-layout__title">{title}</header>
      <div className="header-layout__content">{children}</div>
    </div>
  );
};
