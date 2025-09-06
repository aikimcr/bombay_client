import CollectionBase, { CollectionOptions } from './CollectionBase';
import SongModel from './SongModel';

class SongCollection extends CollectionBase {
  constructor(options: CollectionOptions = {}) {
    super('/song', {
      ...options,
      modelClass: SongModel,
    });
  }
}

export default SongCollection;
