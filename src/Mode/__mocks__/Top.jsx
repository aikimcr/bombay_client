import React from "react";
import { ComponentMock } from "../../testHelpers/mocks/ComponentMock";
import { Outlet } from "react-router";

export const Top = (props) => {
  return (
    <ComponentMock {...props} name="Top" className="mock-top" testId="mock-top">
      <Outlet />
    </ComponentMock>
  );
};
