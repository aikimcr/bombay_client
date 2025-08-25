import ArtistModel from "./ArtistModel";
import ModelBase from "./ModelBase";

// At this point, there isn't anything to add.
class SongModel extends ModelBase {
  createRefmodels(data) {
    const def = { ...data };
    const artistDef = def.artist;
    const artist = ArtistModel.from(artistDef);
    delete def.artist;
    ModelBase.prototype.createRefmodels.call(this, def);
    this.artistUrl = this.addRef("artist", artist);
  }
}

export default SongModel;
