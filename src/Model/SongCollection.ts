import {
  CollectionBase,
  CollectionBaseConstructorArgs,
} from './CollectionBase';
import { SongData, SongModel } from './SongModel';

export class SongCollection extends CollectionBase<SongData> {
  constructor(args: CollectionBaseConstructorArgs<SongData, SongModel>) {
    super({
      ...args,
      tableName: SongModel.TableName,
    });
  }

  protected createAModelFromDef(def: SongData): SongModel {
    return  SongModel.from<SongData, SongModel>(def, { keepId: true });
  }
}
