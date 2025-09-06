import CollectionBase, { CollectionOptions } from './CollectionBase';
import ArtistModel from './ArtistModel';

class ArtistCollection extends CollectionBase {
  constructor(options: CollectionOptions = {}) {
    super('/artist', {
      ...options,
      modelClass: ArtistModel,
    });
  }
}

export default ArtistCollection;
