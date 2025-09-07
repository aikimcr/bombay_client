import {
  mockGetFromURLString,
  mockPrepareURLFromArgs,
} from '../../../Network/testing';
import {
  getGenericTestIterator,
  getIdIterator,
  makeFetchBodyFromFetchDef,
  makeModelsFromFetchDef,
} from '../../../testHelpers';
import { SongData, SongModel } from '../../SongModel';
import { artistNameIterator } from './ArtistCollectionFixtures';

export const TestSongCollectionURL = 'http://localhost:2001/song';

const songNamesMaster = [
  'Whats Up',
  'Back In Black',
  'Chain of Fools',
  'Walk This Way',
  'Lets Stay Together',
  'Hand In Pocket',
  'The Thrill Is Gone',
  'Help!',
  'How Deep Is Your Love',
  'Knock On Wood',
  'Call Me',
  'Johnny B. Goode',
  'Little Pink Houses',
  'Ladies Night',
  'Whole Lotta Love',
  'Billie Jean',
  'Uptown Funk',
  'Crazy Train',
  'Misery Business',
  'Love Is A BattleField',
  'Wild Horses',
  'Gimme Some Lovin',
  'Soul Man',
  'Maria, Maria',
  'Renegade',
];

const testKeysMaster = [
  'A',
  'A#',
  'Ab',
  'Am',
  'A#m',
  'Abm',
  'B',
  'Bb',
  'Bm',
  'Bbm',
  'C',
  'C#',
  'Cm',
  'C#m',
  'D',
  'D#',
  'Db',
  'D#m',
  'Dbm',
  'E',
  'Eb',
  'Em',
  'Ebm',
  'F',
  'F#',
  'Fm',
  'F#m',
  'G',
  'G#',
  'Gb',
  'Gm',
  'G#m',
  'Gbm',
];

const testTempoMaster = [60, 80, 100, 120, 140, 160];

const testLyricsMaster = [
  'Enim et qui esse aliquip aliqua minim cillum in enim consequat.',
  'Incididunt nulla enim dolore voluptate veniam est enim in ullamco magna et est ad.',
  'Sunt eu voluptate laboris exercitation sit non in dolore amet laborum Lorem mollit.',
  'Deserunt in tempor in cupidatat commodo quis aliquip ex id elit occaecat irure adipisicing est.',
  'Velit eiusmod sunt reprehenderit dolor esse non Lorem fugiat enim adipisicing minim laboris.',
  'Nostrud elit sunt et aliquip duis.',
  'Dolore et consectetur excepteur et culpa ad excepteur.',
  'In culpa dolore adipisicing magna aliqua.',
  'Labore irure esse fugiat et veniam ex minim velit.',
  'Et duis nulla cillum id labore nostrud mollit enim qui ut elit.',
  'Ipsum reprehenderit nisi consequat deserunt ex amet id voluptate adipisicing aliqua culpa deserunt.',
  'Enim sint id nostrud sint do occaecat fugiat deserunt ad excepteur.',
  'Non quis laboris qui et occaecat esse fugiat eu Lorem.',
  'Quis ullamco fugiat mollit sunt adipisicing.',
  'Dolore eu velit reprehenderit irure magna incididunt eu in magna magna qui nulla proident cillum.',
  'Eiusmod dolor ex consectetur ad cillum sit ex culpa ullamco eiusmod.',
  'Adipisicing amet incididunt sunt minim ea sint.',
  'Lorem proident quis incididunt tempor anim reprehenderit.',
  'Lorem culpa occaecat ea tempor sint reprehenderit fugiat.',
  'Occaecat reprehenderit velit in ipsum eiusmod excepteur ipsum irure exercitation nostrud adipisicing ex cupidatat.',
  'Quis est deserunt magna eu tempor culpa pariatur ipsum.',
  'Elit sint consequat occaecat ipsum laboris ipsum amet.',
  'Irure aliquip commodo ut magna proident ex occaecat officia voluptate eu cillum.',
  'Et duis mollit sint aliquip eiusmod culpa veniam adipisicing nisi mollit sit.',
  'Eu cillum dolor tempor sint aliqua anim non magna.',
  'Exercitation Lorem ipsum aliquip cupidatat.',
];

export const makeASongModelDef = (): SongData => {
  const nextId = getIdIterator('song_id');
  const nextSongName = getGenericTestIterator('song_name', songNamesMaster);
  const nextTestKey = getGenericTestIterator('song_key', testKeysMaster);
  const nextTestTempo = getGenericTestIterator('song_tempo', testTempoMaster);
  const nextTestLyrics = getGenericTestIterator(
    'song_lyrics',
    testLyricsMaster,
  );
  const nextArtistId = getIdIterator('artist_id');
  const nextArtistName = artistNameIterator();

  const artist_id = nextArtistId();
  const artist_name = nextArtistName();

  const songDef: SongData = {
    id: nextId(),
    name: nextSongName(),
    key_signature: nextTestKey(),
    tempo: nextTestTempo(),
    lyrics: nextTestLyrics(),
    artist_id: artist_id,
    artist: {
      id: artist_id,
      name: artist_name,
    },
  };

  return songDef;
};

export const setupSongModelFetch = () => {
  const getPromise = PromiseWithResolvers();
  mockGetFromURLString.mockReturnValueOnce(getPromise.promise);

  return [getPromise, makeASongModelDef()];
};

export const setupSongCollectionModels = (length = 10) => {
  const fetchDef = {
    data: [] as SongData[],
  };

  while (fetchDef.data.length < length) {
    const def: SongData = makeASongModelDef();
    fetchDef.data.push(def);
  }

  const models = makeModelsFromFetchDef(
    fetchDef,
    (def: SongData): SongModel => {
      return SongModel.from<SongData, SongModel>(def, { keepId: true });
    },
  );

  return [models, fetchDef];
};

export const setupSongCollectionFetch = (query = {}, length = 10) => {
  const getPromise = PromiseWithResolvers();
  mockGetFromURLString.mockReturnValueOnce(getPromise.promise);
  mockPrepareURLFromArgs.mockReturnValue(new URL(TestSongCollectionURL));

  const [models, fetchDef] = setupSongCollectionModels(length);
  const fetchBody = makeFetchBodyFromFetchDef(
    fetchDef,
    SongModel.TableName,
    query,
  );

  return [getPromise, fetchBody, models, fetchDef];
};
