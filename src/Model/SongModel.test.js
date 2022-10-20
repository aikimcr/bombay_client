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
