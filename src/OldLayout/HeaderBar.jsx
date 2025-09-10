import React from 'react';
import './HeaderBar.scss';

import LoginStatus from '../Components/Widgets/LoginStatus.jsx';

function HeaderBar(props) {
  const title = props.title || 'Bombay Band Management System';

  return (
    <div className="header-bar">
      <div className="title">{title}</div>
      <LoginStatus />
    </div>
  );
}

export default HeaderBar;
