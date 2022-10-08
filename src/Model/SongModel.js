import ArtistModel from './ArtistModel';
import ModelBase from './ModelBase';

// At this point, there isn't anything to add.
class SongModel extends ModelBase{
    createRefmodels(data) {
        const artistDef = data.artist;
        const artist = ArtistModel.from(artistDef);
        delete data.artist;
        ModelBase.prototype.createRefmodels.call(this, data);
        this.artistUrl = this.addRef('artist', artist);
    }
}

export default SongModel;