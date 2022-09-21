import CollectionBase from './CollectionBase';

import ArtistModel from './ArtistModel';

class ArtistCollection extends CollectionBase{
    constructor(url, options={}) {
        super(url, {...options, modelClass: ArtistModel});
    }
};

export default ArtistCollection;