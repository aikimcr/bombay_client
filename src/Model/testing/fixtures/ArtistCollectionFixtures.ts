import {
  mockGetFromURLString,
  mockPrepareURLFromArgs,
} from '../../../Network/testing';
import {
  getGenericTestIterator,
  makeADef,
  makeAFetchDef,
  makeFetchBodyFromFetchDef,
  makeModelsFromFetchDef,
} from '../../../testHelpers';
import { ArtistData, ArtistModel } from '../../ArtistModel';

export const TestArtistCollectionURL = 'http://localhost:2001/artist';

export const testArtistNames = [
  '4 Non Blondes',
  'AC/DC',
  'Aretha Franklin',
  'Aerosmith',
  'Al Green',
  'Alanis Morisette',
  'B.B. King',
  'Beatles',
  'Bee Gees',
  'Ben E. King',
  'Blondie',
  'Chuck Berry',
  'John Mellencamp',
  'Kool & The Gang',
  'Led Zeppelin',
  'Michael Jackson',
  'Bruno Mars',
  'Ozzy Osbourne',
  'Paramore',
  'Pat Benatar',
  'Rolling Stones',
  'Spencer Davis Group',
  'Sam & Dave',
  'Santana',
  'Steppenwolf',
];

export const artistNameIterator = () => {
  return getGenericTestIterator('artist_name', testArtistNames);
};

export const setupArtistModelFetch = () => {
  const nextArtistName = artistNameIterator();

  const getPromise = PromiseWithResolvers();
  mockGetFromURLString.mockReturnValueOnce(getPromise.promise);

  return [
    getPromise,
    makeADef(ArtistModel.TableName, (def: ArtistData): void => {
      def.name = nextArtistName();
    }),
  ];
};

export const setupArtistCollectionModels = (length = 10) => {
  const nextArtistName = artistNameIterator();

  const fetchDef = makeAFetchDef(
    length,
    ArtistModel.TableName,
    (def: ArtistData): void => {
      def.name = nextArtistName();
    },
  );

  const models = makeModelsFromFetchDef(
    fetchDef,
    (def: ArtistData): ArtistModel => {
      return ArtistModel.from<ArtistData, ArtistModel>(def, { keepId: true });
    },
  );

  return [models, fetchDef];
};

export const setupArtistCollectionFetch = (query = {}, length = 10) => {
  const getPromise = PromiseWithResolvers();
  mockGetFromURLString.mockReturnValueOnce(getPromise.promise);
  mockPrepareURLFromArgs.mockReturnValue(new URL(TestArtistCollectionURL));

  const [models, fetchDef] = setupArtistCollectionModels(length);
  const fetchBody = makeFetchBodyFromFetchDef(
    fetchDef,
    ArtistModel.TableName,
    query,
  );

  return [getPromise, fetchBody, models, fetchDef];
};
