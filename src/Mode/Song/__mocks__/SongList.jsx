import React from 'react';
import { ComponentMock } from '../../../testHelpers/mocks/ComponentMock';

export const SongList = (props) => {
  return (
    <ComponentMock
      {...props}
      name="SongList"
      className="mock-song-list"
      testId="mock-song-list"
    />
  );
};
