import * as Network from '../Network/Network';
jest.mock('../Network/Network');

import ModelBase from './ModelBase';
import SongModel from './SongModel';

it('should instantiate a model', async () => {
    const model = new SongModel(null, {
        id: 119,
        name: 'xyzzy',
    });

    expect(SongModel.isModel(model)).toBeTruthy();
    expect(model.get('id')).toBe(119)
    expect(model.get('name')).toBe('xyzzy');

    // Method under test must be wrapped in a function or the throw is not caught.
    expect(() => model.get('shoesize')).toThrowError('No field "shoesize" is set');
    model.set('shoesize', 36);
    expect(model.get('shoesize')).toBe(36);
})

it('should create a model from a definition', async () => {
    const model = SongModel.from({
        id: 63,
        name: 'Plover',
    });


    expect(SongModel.isModel(model)).toBeTruthy();
    expect(model.get('id')).toBe(63)
    expect(model.get('name')).toBe('Plover');
});

it('should not recognize a base model as an song model', async () => {
    // If the class extension is done correctly, Javascript should just handle this.
    const baseModel = new ModelBase({});
    const songModel = new SongModel({});

    expect(ModelBase.isModel(baseModel)).toBeTruthy();
    expect(ModelBase.isModel(songModel)).toBeTruthy();

    expect(SongModel.isModel(baseModel)).toBeFalsy();
    expect(SongModel.isModel(songModel)).toBeTruthy();
});