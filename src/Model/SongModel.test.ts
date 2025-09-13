import { omit } from 'lodash';
import {
  mockGetFromURLString,
  mockPutToURLString,
  mockPrepareURLFromArgs,
  mockPostToURLString,
  mockBuildURL,
  mockDefaultAPIBasePath,
  mockDefaultAPIServer,
} from '../Network/testing';

jest.mock('../Network/Network', () => {
  const originalModule = jest.requireActual('../Network/Network');

  return {
    __esModule: true,
    ...originalModule,
    defaultAPIServer: mockDefaultAPIServer,
    defaultAPIBasePath: mockDefaultAPIBasePath,
    buildURL: mockBuildURL,
    prepareURLFromArgs: mockPrepareURLFromArgs,
    getFromURLString: mockGetFromURLString,
    postToURLString: mockPostToURLString,
    putToURLString: mockPutToURLString,
  };
});

import { makeADef } from '../testHelpers/modelTools';
import { ArtistModel } from './ArtistModel';

import { ModelBase } from './ModelBase';
import { SongData, SongModel } from './SongModel';
import {
  makeASongModelDef,
  setupSongModelFetch,
  TestSongCollectionURL,
  TestUrlWithId,
} from './testing';

describe('SongModel', () => {
  it('should instantiate a model', async () => {
    const def = makeASongModelDef();
    mockBuildURL.mockReturnValue(TestUrlWithId(TestSongCollectionURL, def.id));
    const model = SongModel.from<SongData, SongModel>(def, {
      keepId: true,
    });

    expect(SongModel.isModel(model)).toBeTruthy();
    expect(model.id).toEqual(def.id);
    expect(model.name).toEqual(def.name);
    expect(model.key_signature).toEqual(def.key_signature);
    expect(model.tempo).toEqual(def.tempo);
    expect(model.lyrics).toEqual(def.lyrics);
    expect(model.artist_id).toEqual(def.artist_id);
    expect(model.url).toEqual(TestUrlWithId(TestSongCollectionURL, def.id));
  });

  it('should fetch a song model', async () => {
    const [getPromise, fetchBody] = setupSongModelFetch();
    mockBuildURL.mockReturnValue(
      TestUrlWithId(TestSongCollectionURL, fetchBody.id),
    );
    const model = new SongModel({ id: fetchBody.id });

    const fetchPromise = model.ready;
    getPromise.resolve(fetchBody);

    await fetchPromise;

    expect(model.id).toEqual(fetchBody.id);
    expect(model.name).toEqual(fetchBody.name);
    expect(model.key_signature).toEqual(fetchBody.key_signature);
    expect(model.tempo).toEqual(fetchBody.tempo);
    expect(model.lyrics).toEqual(fetchBody.lyrics);
    expect(model.artist_id).toEqual(fetchBody.artist_id);
    expect(model.artist.id).toEqual(model.artist_id);
    expect(model.artist.name).toEqual(fetchBody.artist.name);
    expect(model.url).toEqual(
      TestUrlWithId(TestSongCollectionURL, fetchBody.id),
    );

    expect(mockGetFromURLString).toHaveBeenCalledTimes(1);
    expect(mockGetFromURLString).toHaveBeenCalledWith(
      TestUrlWithId(TestSongCollectionURL, fetchBody.id),
    );
  });

  it('Create and save a song', async () => {
    mockBuildURL.mockReturnValue(TestUrlWithId(TestSongCollectionURL, 25));
    const song = new SongModel({});

    const postPromise = PromiseWithResolvers();
    mockPostToURLString.mockReturnValue(postPromise.promise);

    song.name = 'Piano Man';
    song.key_signature = 'C';
    song.tempo = 100;
    song.lyrics = 'They sit at the bar and put bread in my jar';
    song.artist_id = 15;

    expect(mockPostToURLString).not.toHaveBeenCalled();
    expect(song.id).toBeUndefined();
    expect(song.url).toBeUndefined();
    expect(song.name).toEqual('Piano Man');
    expect(song.key_signature).toEqual('C');
    expect(song.tempo).toEqual(100);
    expect(song.lyrics).toEqual('They sit at the bar and put bread in my jar');
    expect(song.artist_id).toEqual(15);

    const newBodyPromise = song.save();

    postPromise.resolve({
      id: 25,
      name: 'Piano Man',
      key_signature: 'C',
      tempo: 100,
      lyrics: 'They sit at the bar and put bread in my jar',
      artist_id: 15,
    });

    await newBodyPromise;

    expect(mockPostToURLString).toHaveBeenCalledTimes(1);
    expect(song.id).toBe(25);
    expect(song.url).toBe(TestUrlWithId(TestSongCollectionURL, 25));
    expect(song.name).toEqual('Piano Man');
    expect(song.key_signature).toEqual('C');
    expect(song.tempo).toEqual(100);
    expect(song.lyrics).toEqual('They sit at the bar and put bread in my jar');
    expect(song.artist_id).toEqual(15);
  });

  it('should save changes to the song model', async () => {
    const putPromise = PromiseWithResolvers();
    mockPutToURLString.mockReturnValue(putPromise.promise);

    const oldBody = omit(makeASongModelDef(), 'artist');
    mockBuildURL.mockReturnValue(
      TestUrlWithId(TestSongCollectionURL, oldBody.id),
    );
    const model = SongModel.from<SongData, SongModel>(oldBody, {
      keepId: true,
    });

    const newName = 'Allison';
    model.name = newName;

    expect(model.id).toEqual(oldBody.id);
    expect(model.name).toEqual(newName);
    expect(model.key_signature).toEqual(oldBody.key_signature);
    expect(model.tempo).toEqual(oldBody.tempo);
    expect(model.lyrics).toEqual(oldBody.lyrics);
    expect(model.artist_id).toEqual(oldBody.artist_id);
    expect(model.url).toEqual(TestUrlWithId(TestSongCollectionURL, oldBody.id));

    const savePromise = model.save();
    putPromise.resolve({
      ...oldBody,
      name: newName,
    });
    const newBody = await savePromise;
    expect(newBody).not.toEqual(oldBody);
    expect(newBody.name).toEqual(newName);

    expect(mockPutToURLString).toHaveBeenCalledTimes(1);
    expect(mockPutToURLString).toHaveBeenCalledWith(
      TestUrlWithId(TestSongCollectionURL, oldBody.id),
      {
        ...oldBody,
        name: newName,
      },
    );
  });

  it('should not recognize a base model as a song model', async () => {
    // If the class extension is done correctly, TypeScript should just handle this.
    const baseDef = makeADef('table1');
    const songDef = makeASongModelDef();
    mockBuildURL.mockReturnValue(
      TestUrlWithId(TestSongCollectionURL, songDef.id),
    );

    const baseModel = new ModelBase({ data: baseDef });
    const songModel = new SongModel({ data: songDef });

    expect(ModelBase.isModel(baseModel)).toBeTruthy();
    expect(ModelBase.isModel(songModel)).toBeTruthy();

    expect(SongModel.isModel(baseModel)).toBeFalsy();
    expect(SongModel.isModel(songModel)).toBeTruthy();
  });

  it('should accept the artist as a constructor argument', () => {
    const artistModel = new ArtistModel({
      data: {
        id: 30,
        name: 'Savoy Brown',
      },
    });

    const def = makeASongModelDef();
    mockBuildURL.mockReturnValue(TestUrlWithId(TestSongCollectionURL, def.id));
    const model = new SongModel({
      data: def,
      artist: artistModel,
    });

    expect(model.artist).toEqual(artistModel);
    expect(model.artist_id).toEqual(artistModel.id);
  });

  it('should assign the artist', () => {
    const artistModel = new ArtistModel({
      data: {
        id: 30,
        name: 'Savoy Brown',
      },
    });

    const def = makeASongModelDef();
    mockBuildURL.mockReturnValue(TestUrlWithId(TestSongCollectionURL, def.id));
    const model = new SongModel({
      data: def,
    });

    model.artist = artistModel;

    expect(model.artist).toEqual(artistModel);
    expect(model.artist_id).toEqual(artistModel.id);
  });

  /*
  it.skip('should update the artist model', async () => {
    const mockPromise = PromiseWithResolvers();
    // The mock is not recognized unless it is done this way.
    mockPutToURLString.mockReturnValue(mockPromise.promise);

    const [modelDef, songModel] = makeAModel('song');
    const [newArtistDef, newArtistModel] = makeAModel('artist');
    const songModelDef = { ...modelDef };
    delete songModelDef.artist;

    songModelDef.artist_id = newArtistDef.id;
    songModel.set(songModelDef);

    const savePromise = songModel.save();
    mockPromise.resolve({
      ...songModelDef,
      artist: newArtistDef,
    });
    const newBody = await savePromise;

    expect(newBody).toEqual({
      ...songModelDef,
      artist: newArtistDef,
    });
    expect(songModel.artist_id).toEqual(newArtistModel.id);
    expect(songModel.artist()).toEqual(newArtistModel);
  });

  it.skip('should handle artist reference correctly', async () => {
    const [songDef] = makeAModel('song');
    const model = SongModel.from(songDef);

    // Test that the artist reference is properly set up
    expect(model.artistUrl).toBeDefined();
    expect(model.artistUrl).toEqual(songDef.artist.url);

    // Test that we can retrieve the artist
    const artist = model.artist();
    expect(artist).toBeDefined();
    expect(artist.id).toEqual(songDef.artist.id);
    expect(artist.name).toEqual(songDef.artist.name);
  });
  */
});
