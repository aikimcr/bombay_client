import ArtistModel from './ArtistModel';
import ModelBase, { ModelData } from './ModelBase';
import { putToURLString } from '../Network/Network';

// At this point, there isn't anything to add.
class SongModel extends ModelBase {
  createRefmodels(data: ModelData): void {
    const def = { ...data };

    const artistDef = def.artist;
    if (!artistDef) {
      return;
    }
    const artist = ArtistModel.from(artistDef);
    delete def.artist;

    super.createRefmodels(def);
    (this as any).artistUrl = this.addRef('artist', artist);
  }

  toJSON(): ModelData {
    const json = super.toJSON();
    if ((this as any).artistUrl) {
      const artist = this.getRef((this as any).artistUrl);
      json.artist = artist.toJSON();
    }
    return json;
  }

  async save(): Promise<ModelData> {
    const dataToSave = this.toJSON();
    const newDef = await putToURLString(this.idUrl()!, dataToSave);
    this.createRefmodels(newDef);
    return this.toJSON();
  }
}

export default SongModel;
