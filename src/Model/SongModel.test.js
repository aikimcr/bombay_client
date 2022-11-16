import * as Network from "../Network/Network";

import ModelBase from './ModelBase';
import SongModel from './SongModel';

it('should instantiate a model', async () => {
    const [def] = makeAModel('song');
    const model = SongModel.from(def);

    expect(SongModel.isModel(model)).toBeTruthy();
    expect(model.get('id')).toEqual(def.id)
    expect(model.get('name')).toEqual(def.name);
    expect(model.get('artist_id')).toEqual(def.artist_id);
    expect(model.idUrl()).toEqual(def.url);

    expect(model.artist).toBeDefined();
    const artist = model.artist();
    expect(artist).toBeDefined();
    expect(artist.get('id')).toEqual(model.get('artist_id'));
    expect(artist.get('name')).toEqual(def.artist.name);
    expect(artist.idUrl()).toEqual(def.artist.url);
})

it('should not recognize a base model as a song model', async () => {
    // If the class extension is done correctly, Javascript should just handle this.
    const [baseDef] = makeAModel('table1');
    const [songDef] = makeAModel('song');

    const baseModel = new ModelBase(baseDef.url, baseDef);
    const songModel = new SongModel(songDef.url, songDef);

    expect(ModelBase.isModel(baseModel)).toBeTruthy();
    expect(ModelBase.isModel(songModel)).toBeTruthy();

    expect(SongModel.isModel(baseModel)).toBeFalsy();
    expect(SongModel.isModel(songModel)).toBeTruthy();
});

it('should update the artist model', async () => {
    const [mockPromise, mockResolve] = makeResolvablePromise();
    // The mock is not recognized unless it is done this way.
    Network.putToURLString = jest.fn((url, body) => {
        return mockPromise;
    });

    const [modelDef, songModel] = makeAModel('song');
    const [newArtistDef, newArtistModel] = makeAModel('artist');
    const songModelDef = { ...modelDef };
    delete songModelDef.artist;

    songModelDef.artist_id = newArtistDef.id;
    songModel.set(songModelDef);

    const savePromise = songModel.save();
    mockResolve({ ...songModelDef, artist: newArtistDef });
    const newBody = await savePromise;

    expect(newBody).toEqual(songModelDef);
    expect(songModel.get('artist_id')).toEqual(newArtistModel.get('id'));
    expect(songModel.artist()).toEqual(newArtistModel);
});