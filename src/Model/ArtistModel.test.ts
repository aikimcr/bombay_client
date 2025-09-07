import {
  mockGetFromURLString,
  mockPutToURLString,
  mockServerProtocol,
  mockServerHost,
  mockServerBasePath,
  mockServerPort,
  mockPostToURLString,
} from '../Network/testing';

jest.mock('../Network/Network', () => {
  const originalModule = jest.requireActual('../Network/Network');

  return {
    __esModule: true,
    ...originalModule,
    serverProtocol: mockServerProtocol,
    serverHost: mockServerHost,
    serverBasePath: mockServerBasePath,
    serverPort: mockServerPort,
    getFromURLString: mockGetFromURLString,
    putToURLString: mockPutToURLString,
    postToURLString: mockPostToURLString,
  };
});

import { ModelBase } from './ModelBase';
import { ArtistData, ArtistModel } from './ArtistModel';
import {
  setupArtistModelFetch,
  TestArtistCollectionURL,
  TestUrlWithId,
} from './testing';

describe('ArtistModel', () => {
  it('should instantiate a model', async () => {
    const model = new ArtistModel({
      data: {
        id: 119,
        name: 'Savoy Brown',
      },
    });

    expect(ArtistModel.isModel(model)).toBeTruthy();
    expect(model.id).toBeUndefined;
    expect(model.name).toBe('Savoy Brown');
  });

  it('should create a model from a definition', async () => {
    const model = ArtistModel.from<ArtistData, ArtistModel>({
      id: 63,
      name: 'Traffic',
    });

    expect(ArtistModel.isModel(model)).toBeTruthy();
    expect(model.id).toBeUndefined();
    expect(model.name).toBe('Traffic');
  });

  it('should create a model from a definition with keepId', async () => {
    const model = ArtistModel.from<ArtistData, ArtistModel>(
      {
        id: 63,
        name: 'Traffic',
      },
      { keepId: true },
    );

    expect(ArtistModel.isModel(model)).toBeTruthy();
    expect(model.id).toBe(63);
    expect(model.name).toBe('Traffic');
  });

  it('should fetch an artist model', async () => {
    const [getPromise, fetchBody] = setupArtistModelFetch();
    const model = new ArtistModel({ id: fetchBody.id });

    const fetchPromise = model.ready;
    getPromise.resolve(fetchBody);
    const fetchDef = await fetchPromise;

    expect(model.id).toEqual(fetchBody.id);
    expect(model.url).toBe(TestUrlWithId(TestArtistCollectionURL, 1));
    expect(model.name).toEqual(fetchBody.name);
    expect(model.toJSON()).toEqual(fetchBody);
    expect(fetchDef).toEqual(fetchBody);

    expect(mockGetFromURLString).toHaveBeenCalledTimes(1);
    expect(mockGetFromURLString).toHaveBeenCalledWith(model.url);
  });

  it('Create and save an artist', async () => {
    const artist = new ArtistModel({});

    const postPromise = PromiseWithResolvers();
    mockPostToURLString.mockReturnValue(postPromise.promise);

    artist.name = 'Billy Joel';

    expect(mockPostToURLString).not.toHaveBeenCalled();
    expect(artist.id).toBeUndefined();
    expect(artist.url).toBeUndefined();
    expect(artist.name).toBe('Billy Joel');

    const newBodyPromise = artist.save();

    postPromise.resolve({
      id: 25,
      name: 'Billy Joel',
    });

    await newBodyPromise;

    expect(mockPostToURLString).toHaveBeenCalledTimes(1);
    expect(artist.id).toBe(25);
    expect(artist.url).toBe(TestUrlWithId(TestArtistCollectionURL, 25));
    expect(artist.name).toBe('Billy Joel');
  });

  it('should save changes to the artist model', async () => {
    const putPromise = PromiseWithResolvers();
    mockPutToURLString.mockReturnValue(putPromise.promise);

    const artistDef: ArtistData = {
      id: 43,
      name: 'Ringo Starr',
    };
    const model = ArtistModel.from(artistDef, { keepId: true });

    expect(model.id).toEqual(43);
    expect(model.name).toEqual('Ringo Starr');

    model.name = 'Deep Purple';
    expect(model.name).toEqual('Deep Purple');

    model.save();

    putPromise.resolve({
      id: 43,
      name: 'Deep Purple',
    });

    expect(model.name).toEqual('Deep Purple');

    expect(mockPutToURLString).toHaveBeenCalledTimes(1);
    expect(mockPutToURLString).toHaveBeenCalledWith(model.url, {
      id: 43,
      name: 'Deep Purple',
    });
  });

  it('should not recognize a base model as an artist model', async () => {
    // If the class extension is done correctly, TypeScript should just handle this.
    const def = {
      data: {
        id: 10,
        name: 'DNCE',
      },
      keepId: true,
    };
    const baseModel = new ModelBase(def);
    const artistModel = new ArtistModel(def);

    expect(ModelBase.isModel(baseModel)).toBeTruthy();
    expect(ModelBase.isModel(artistModel)).toBeTruthy();

    expect(ArtistModel.isModel(baseModel)).toBeFalsy();
    expect(ArtistModel.isModel(artistModel)).toBeTruthy();
  });
});
