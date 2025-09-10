// Import this after all mocks.  Especially Network and login mocks.

import casual from 'casual';

import * as Network from '../Network/Network';

import { ModelBase } from '../Model/ModelBase';
import { ArtistModel } from '../Model/ArtistModel';
import { SongModel } from '../Model/SongModel';

const allNames = {};
casual.define('uniqueName', function (nameType, clear) {
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
casual.define('nextId', function (sequenceName) {
  const nextOne = (idSequences[sequenceName] ?? 0) + 1;
  idSequences[sequenceName] = nextOne;
  return nextOne;
});

const genericSequences = {};
casual.define('nextGenericSequence', function (sequenceName, sequenceMaster) {
  if (!genericSequences[sequenceName]) {
    genericSequences[sequenceName] = [...sequenceMaster];
  }

  const nextOne = genericSequences[sequenceName].shift();
  genericSequences[sequenceName].push(nextOne);
  return nextOne;
});

export const getIdIterator = (sequenceName) => {
  return () => {
    return casual.nextId(sequenceName);
  };
};

export const getGenericTestIterator = (sequenceName, sequenceMaster) => {
  return () => {
    return casual.nextGenericSequence(sequenceName, sequenceMaster);
  };
};

export const makeADef = (tableName = 'table1', fieldsCallback) => {
  const def = {};
  def.id = casual.nextId(tableName);
  def.name = casual.uniqueName(tableName);

  if (fieldsCallback) {
    fieldsCallback(def);
  }

  return def;
};

export function makeAModel(tableName = 'table1', fieldsCallback) {
  const def = makeADef(tableName, fieldsCallback);

  switch (tableName) {
    case 'artist':
      return [def, ArtistModel.from(def)];

    case 'song':
      return [def, SongModel.from(def)];
  }

  return [def, ModelBase.from(def)];
}

export const makeAModelFromDef = (def, tableName = 'table1') => {
  switch (tableName) {
    case 'artist':
      return ArtistModel.from(def);

    case 'song':
      return SongModel.from(def);
  }

  return ModelBase.from(def);
};

export const makeAFetchDef = (length, tableName, fieldsCallback) => {
  const result = {
    data: [],
  };

  while (result.data.length < length) {
    const def = makeADef(tableName, fieldsCallback);
    result.data.push(def);
  }

  return result;
};

export const makeModelsFromFetchDef = (fetchDef, createCallback) => {
  return fetchDef.data.map((def) => {
    return createCallback(def);
  });
};

export const makeFetchBodyFromFetchDef = (fetchDef, tableName, query = {}) => {
  const result = { ...fetchDef };
  const length = result.data.length;

  let limit = query.limit || length;
  let offset = (query.offset || 0) - limit; // offset for previous page.

  if (offset >= 0) {
    const url = Network.prepareURLFromArgs(tableName);
    url.searchParams.set('offset', offset);
    url.searchParams.set('limit', limit);
    result.prevPage = url.toString();
  }

  if (limit <= length) {
    offset = (query.offset || 0) + limit; // offset for next page.
    const url = Network.prepareURLFromArgs(tableName);
    url.searchParams.set('offset', offset);
    url.searchParams.set('limit', limit);
    result.nextPage = url.toString();
  }

  return result;
};

export const makeModels = (length, tableName, fieldsCallback) => {
  const result = {
    data: [],
  };

  const models = [];

  while (result.data.length < length) {
    const [def, model] = makeAModel(tableName, fieldsCallback);
    result.data.push(def);
    models.push(model);
  }

  return [result, models];
};

export const makeFetchBodyAndModels = (
  length = 10,
  query = {},
  tableName = 'table1',
  fieldsCallback,
) => {
  const fetchDef = makeAFetchDef(length, tableName, fieldsCallback);
  const models = makeModelsFromFetchDef(fetchDef, (def) => {
    makeAModelFromDef(def, tableName);
  });

  const fetchBody = makeFetchBodyFromFetchDef(fetchDef, tableName, query);
  return [fetchBody, models];
};
