import {
  ModelBase,
  ModelBaseConstructorArgs,
  ModelDataBase,
} from './ModelBase';

export type ArtistData = ModelDataBase;

// At this point, there isn't anything to add.
export class ArtistModel extends ModelBase<ArtistData> {
  static readonly TableName = 'artist';

  constructor(args: ModelBaseConstructorArgs<ArtistData>) {
    super({
      ...args,
      tableName: ArtistModel.TableName,
    });
  }
}
