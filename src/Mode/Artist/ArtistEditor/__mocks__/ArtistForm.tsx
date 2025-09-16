import React from 'react';
import { ComponentMock } from '../../../../testHelpers/mocks/ComponentMock';
import { ArtistModel } from '../../../../Model/ArtistModel';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ArtistForm = ({
  artist,
}: {
  artist: ArtistModel;
  children: JSX.Element | JSX.Element[];
}) => {
  return (
    <ComponentMock
      name="Artist"
      classname="mock-artist-form"
      testId="mock-artist-form"
    >
      <p>{artist.id}</p>
      <p>{artist.name}</p>
    </ComponentMock>
  );
};
