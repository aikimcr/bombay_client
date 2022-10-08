import CollectionBase from './CollectionBase';

import SongModel from './SongModel';

class SongCollection extends CollectionBase{
    constructor(options={}) {
        super('/song', {...options, modelClass: SongModel});
    }
};

export default SongCollection;