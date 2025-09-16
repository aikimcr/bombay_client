import React, { useContext } from 'react';
import { Link, Outlet } from 'react-router';

import BombayLoginContext from '../Context/BombayLoginContext';
import Button from '../Components/Widgets/Button';

import './TopMode.scss';

export const TopMode = () => {
  return (
    <div className="top-mode">
      <h3 className="top-mode__title">
        Welcome to the PDQ Band Manager System
      </h3>
      <div className="top-mode__content">
        <Outlet />
      </div>
    </div>
  );
};
