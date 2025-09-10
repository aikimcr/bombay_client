import React, { useContext } from 'react';
import { Link, Outlet } from 'react-router';

import BombayLoginContext from '../Context/BombayLoginContext';
import Button from '../Components/Widgets/Button';

import './Top.scss';

export const Top = () => {
  return (
    <div className="top">
      <h1 className="top__title">Welcome to the Bombay Band Manager System</h1>
      <div className="top__content">
        <Outlet />
      </div>
    </div>
  );
};
