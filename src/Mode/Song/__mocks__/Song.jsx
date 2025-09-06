import React from "react";
import { ComponentMock } from "../../../testHelpers/mocks/ComponentMock";

export const Song = (props) => {
  return (
    <ComponentMock
      {...props}
      name="Song"
      classname="mock-song"
      testId="mock-song"
    />
  );
};

export default Song;
