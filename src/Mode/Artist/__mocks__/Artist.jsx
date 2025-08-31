import React from "react";
import { ComponentMock } from "../../../testHelpers/mocks/ComponentMock";

export const Artist = (props) => {
  return (
    <ComponentMock
      {...props}
      name="Artist"
      classname="mock-artist"
      testId="mock-artist"
    />
  );
};

export default Artist;
