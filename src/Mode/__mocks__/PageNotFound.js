import React from 'react';
import { ComponentMock } from '../../testHelpers/mocks/ComponentMock';

export const PageNotFound = (props) => {
  return (
    <ComponentMock
      {...props}
      name="PageNotFound"
      className="mock-page-not-found"
      testId="mock-page-not-found"
    />
  );
};
