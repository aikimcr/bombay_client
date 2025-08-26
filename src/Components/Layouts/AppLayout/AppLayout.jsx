import React from "react";

import "./AppLayout.scss";

export const AppLayout = ({ header, children }) => {
  return (
    <div className="app-layout">
      <header className="app-layout__header">{header}</header>
      <div className="app-layout__content">{children}</div>
    </div>
  );
};
