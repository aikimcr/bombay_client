import React from 'react';
import { ComponentMock } from '../../testHelpers/mocks/ComponentMock';
import { Outlet } from 'react-router';

export const TopMode = (props) => {
  return (
    <ComponentMock {...props} name="Top" className="mock-top" testId="mock-top">
      <Outlet />
    </ComponentMock>
  );
};
