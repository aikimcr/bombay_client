import * as Network from '../Network/Network';
jest.mock('../Network/Network');

import ModelBase from './ModelBase';
import ArtistModel from './ArtistModel';

it('should instantiate a model', async () => {
    const model = new ArtistModel(null, {
        id: 119,
        name: 'xyzzy',
    });

    expect(ArtistModel.isModel(model)).toBeTruthy();
    expect(model.get('id')).toBe(119)
    expect(model.get('name')).toBe('xyzzy');

    // Method under test must be wrapped in a function or the throw is not caught.
    expect(() => model.get('shoesize')).toThrowError('No field "shoesize" is set');
    model.set('shoesize', 36);
    expect(model.get('shoesize')).toBe(36);
})

it('should create a model from a definition', async () => {
    const model = ArtistModel.from({
        id: 63,
        name: 'Plover',
    });


    expect(ArtistModel.isModel(model)).toBeTruthy();
    expect(model.get('id')).toBe(63)
    expect(model.get('name')).toBe('Plover');
});

it('should not recognize a base model as an artist model', async () => {
    // If the class extension is done correctly, Javascript should just handle this.
    const baseModel = new ModelBase({});
    const artistModel = new ArtistModel({});

    expect(ModelBase.isModel(baseModel)).toBeTruthy();
    expect(ModelBase.isModel(artistModel)).toBeTruthy();

    expect(ArtistModel.isModel(baseModel)).toBeFalsy();
    expect(ArtistModel.isModel(artistModel)).toBeTruthy();
});