import {
  CollectionBase,
  CollectionBaseConstructorArgs,
} from './CollectionBase';
import { ArtistData, ArtistModel } from './ArtistModel';

export class ArtistCollection extends CollectionBase<ArtistData, ArtistModel> {
  constructor(args: CollectionBaseConstructorArgs<ArtistData, ArtistModel>) {
    super({
      ...args,
      tableName: ArtistModel.TableName,
    });
  }

  protected createAModelFromDef(def: ArtistData): ArtistModel {
    return ArtistModel.from<ArtistData, ArtistModel>(def, { keepId: true });
  }
}
