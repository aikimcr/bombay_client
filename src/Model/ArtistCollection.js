import CollectionBase from './CollectionBase';

import ArtistModel from './ArtistModel';

class ArtistCollection extends CollectionBase{
    constructor(options={}) {
        super('/artist', {...options, modelClass: ArtistModel});
    }
};

export default ArtistCollection;