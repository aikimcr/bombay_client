import React, { MouseEventHandler } from 'react';
import { CloseButton } from '../../Widgets';

import './DialogLayout.scss';

interface DialogLayoutProps {
  headerText: string;
  closeDialog: MouseEventHandler;
  children: JSX.Element | JSX.Element[];
}

export const DialogLayout: React.FC<DialogLayoutProps> = ({
  headerText,
  closeDialog,
  children,
}): React.ReactElement => {
  return (
    <div className="dialog-layout">
      <header className="dialog-layout__header">
        <h3>{headerText}</h3>
        <CloseButton onClick={closeDialog} formnovalidate />
      </header>
      <div className="dialog-layout__content">{children}</div>
    </div>
  );
};
