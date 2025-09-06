import React from 'react';
import { ComponentMock } from '../../../testHelpers/mocks/ComponentMock';

export const ArtistList = (props) => {
  return (
    <ComponentMock
      {...props}
      name="ArtistList"
      className="mock-artist-list"
      testId="mock-artist-list"
    />
  );
};
