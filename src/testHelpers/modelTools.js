// Import this after all mocks.  Especially Network and login mocks.

import casual from "casual";

import * as Network from "../Network/Network";

import ModelBase from "../Model/ModelBase";
import ArtistModel from "../Model/ArtistModel";
import SongModel from "../Model/SongModel";

const allNames = {};
casual.define("uniqueName", function (nameType, clear) {
  if (!allNames[nameType]) allNames[nameType] = new Set();

  const oldSize = allNames[nameType].size;
  let newName;

  while (allNames[nameType].size === oldSize) {
    newName = casual.full_name;
    allNames[nameType].add(newName);
  }

  return newName;
});

const idSequences = {};
casual.define("nextId", function (sequenceName) {
  const nextOne = (idSequences[sequenceName] ?? 0) + 1;
  idSequences[sequenceName] = nextOne;
  return nextOne;
});

export function makeAModel(tableName = "table1", fieldsCallback) {
  const def = {};
  def.id = casual.nextId(tableName);
  def.name = casual.uniqueName(tableName);

  if (fieldsCallback) {
    fieldsCallback(def);
  }

  let modelClass = ModelBase;

  switch (tableName) {
    case "artist":
      modelClass = ArtistModel;
      break;

    case "song":
      modelClass = SongModel;
      def.key_signature = "C";
      def.tempo = 120;
      def.lyrics = "O Solo Mio! The troubles I have seen";

      if (def.artist) {
        def.artist_id = def.artist.id;
      } else {
        const [artist] = makeAModel("artist");
        def.artist_id = artist.id;
        def.artist = artist;
      }
      break;

    default:
  }

  def.url = Network.buildURL({ path: `/${tableName}/${def.id}` });

  return [def, modelClass.from(def)];
}

export function makeModels(
  length = 10,
  query = {},
  tableName = "table1",
  fieldsCallback,
) {
  const result = {
    data: [],
  };

  const models = [];

  while (result.data.length < length) {
    const [def, model] = makeAModel(tableName, fieldsCallback);
    result.data.push(def);
    models.push(model);
  }

  let offset = (query.offset || 0) - length;
  let limit = query.limit || length;

  if (offset >= 0) {
    result.prevPage = Network.prepareURLFromArgs(tableName, {
      offset,
      limit,
    }).toString();
  }

  if (limit <= length) {
    offset = (query.offset || 0) + length;
    result.nextPage = Network.prepareURLFromArgs(tableName, {
      offset,
      limit,
    }).toString();
  }

  return [result, models];
}
