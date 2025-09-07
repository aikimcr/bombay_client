import { omit } from 'lodash';
import { ArtistData, ArtistModel } from './ArtistModel';
import {
  ModelBase,
  ModelBaseConstructorArgs,
  ModelDataBase,
} from './ModelBase';

export interface SongData extends ModelDataBase {
  key_signature: string;
  tempo: number;
  lyrics: string;
  artist_id: number;
  artist?: ArtistData;
}

export interface SongModelConstructorArgs
  extends ModelBaseConstructorArgs<SongData> {
  artist?: ArtistModel;
}
export class SongModel extends ModelBase<SongData> {
  static readonly TableName = 'song';

  protected _artist: ArtistModel;

  constructor(args: SongModelConstructorArgs) {
    super({
      ...omit(args, 'artist'),
      tableName: SongModel.TableName,
    });

    if (args.artist) {
      this.artist = args.artist;
    }
  }

  get key_signature() {
    return this._data.key_signature;
  }

  set key_signature(newSignature) {
    this._data.key_signature = newSignature;
  }

  get tempo() {
    return this._data.tempo;
  }

  set tempo(newTempo) {
    this._data.tempo = newTempo;
  }

  get lyrics() {
    return this._data.lyrics;
  }

  set lyrics(newLyrics) {
    this._data.lyrics = newLyrics;
  }

  get artist_id() {
    return this._data.artist_id;
  }

  set artist_id(newArtistId) {
    this._data.artist_id = newArtistId;
  }

  get artist() {
    if (this._refModels.artist) {
      return this._refModels.artist;
    }
  }

  set artist(newArtist) {
    this._refModels.artist = newArtist;
    this._data.artist_id = newArtist.id;
  }

  // It's possible none of this will be useful.
  createRefmodels(data: SongData): void {
    this._data = { ...omit(data, 'artist') };

    if (data.artist) {
      this._refModels.artist = new ArtistModel({
        data: data.artist,
        keepId: true,
      });
    }
  }

  // toJSON(): ModelData {
  //   const json = super.toJSON();
  //   if ((this as any).artistUrl) {
  //     const artist = this.getRef((this as any).artistUrl);
  //     json.artist = artist.toJSON();
  //   }
  //   return json;
  // }

  // async save(): Promise<ModelData> {
  //   const dataToSave = this.toJSON();
  //   const newDef = await putToURLString(this.idUrl()!, dataToSave);
  //   this.createRefmodels(newDef);
  //   return this.toJSON();
  // }
}
