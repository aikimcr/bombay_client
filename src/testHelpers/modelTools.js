// Import this after all mocks.  Especially Network and login mocks.

import * as Network from '../Network/Network';

import { ModelBase } from '../Model/ModelBase';
import { ArtistModel } from '../Model/ArtistModel';
import { SongModel } from '../Model/SongModel';

const testNames = [
  'Aaron Lyons',
  'Abbie Lindsey',
  'Adeline Johnston',
  'Albert Carter',
  'Alejandro Bowman',
  'Alfred Lyons',
  'Alfred Swanson',
  'Alice Townsend',
  'Amy Burgess',
  'Andrew Mack',
  'Austin Johnston',
  'Austin Strickland',
  'Austin Wilkerson',
  'Barbara Willis',
  'Barry Tucker',
  'Benjamin Bennett',
  'Bill Frank',
  'Billy Garcia',
  'Bradley Anderson',
  'Bruce Clayton',
  'Chad Obrien',
  'Charlie Huff',
  'Christopher Wells',
  'Connor Wheeler',
  'Dale Pierce',
  'Daniel Dunn',
  'Danny Lamb',
  'Danny Pena',
  'Della Long',
  'Derek Malone',
  'Derrick Morales',
  'Dorothy Cohen',
  'Eddie Weaver',
  'Edward Casey',
  'Ella Watkins',
  'Ellen Bridges',
  'Erik Rivera',
  'Eula Stewart',
  'Fannie Riley',
  'Franklin Walsh',
  'Fred Mann',
  'Garrett Bates',
  'Garrett Garner',
  'Gary Gibbs',
  'Gary Wilkins',
  'Genevieve Wade',
  'Harold Berry',
  'Harold Robertson',
  'Harriett Marshall',
  'Harriett Wheeler',
  'Harvey Casey',
  'Henry Turner',
  'Herman Lloyd',
  'Hester Woods',
  'Howard Kim',
  'Isabel Reed',
  'Jason Medina',
  'Jeremiah Hansen',
  'Jeremy Nelson',
  'Jessie Swanson',
  'Joseph Ray',
  'Josephine Diaz',
  'Landon Ward',
  'Leah Greene',
  'Leah Spencer',
  'Lee Grant',
  'Lelia McCormick',
  'Lily Castro',
  'Logan Fitzgerald',
  'Loretta Reid',
  'Louis Padilla',
  'Louise Schneider',
  'Lucille Clarke',
  'Lulu Reyes',
  'Mable Hopkins',
  'Mae Gonzalez',
  'Maggie Harrison',
  'Mark Gonzalez',
  'Matilda Simmons',
  'Mattie Norton',
  'Micheal Martinez',
  'Millie Steele',
  'Milton Perry',
  'Mina Richards',
  'Mitchell Maldonado',
  'Mittie Warren',
  'Mollie Norton',
  'Nancy Cruz',
  'Nannie Estrada',
  'Nettie Griffin',
  'Olga Waters',
  'Olivia Jefferson',
  'Ollie Ballard',
  'Ollie Lyons',
  'Oscar Austin',
  'Pauline Sanders',
  'Peter Peterson',
  'Philip Barnes',
  'Rachel Zimmerman',
  'Ralph Flores',
  'Ray Buchanan',
  'Rebecca Stephens',
  'Rhoda Colon',
  'Rosa Turner',
  'Rose Vaughn',
  'Rosetta Dennis',
  'Sara Allen',
  'Sarah Guzman',
  'Seth Buchanan',
  'Shane Abbott',
  'Shawn Blake',
  'Steve Berry',
  'Sylvia Collier',
  'Thomas Rowe',
  'Vera McDaniel',
  'Victor Webster',
  'Wayne Nelson',
  'William Griffith',
  'Willie Thomas',
  'Winifred Johnson',
];

const idSequences = {};
const nextId = (sequenceName) => {
  const nextOne = (idSequences[sequenceName] ?? 0) + 1;
  idSequences[sequenceName] = nextOne;
  return nextOne;
};

const genericSequences = {};
const nextGenericSequence = (sequenceName, sequenceMaster) => {
  if (!genericSequences[sequenceName]) {
    genericSequences[sequenceName] = [...sequenceMaster];
  }

  const nextOne = genericSequences[sequenceName].shift();
  genericSequences[sequenceName].push(nextOne);
  return nextOne;
};

export const getIdIterator = (sequenceName) => {
  return () => {
    return nextId(sequenceName);
  };
};

export const getGenericTestIterator = (sequenceName, sequenceMaster) => {
  return () => {
    return nextGenericSequence(sequenceName, sequenceMaster);
  };
};

const fullName = (nameType, clear) => {
  const full_name = getGenericTestIterator(nameType + 'full_name', [
    ...testNames,
  ]);
  return full_name();
};

export const makeADef = (tableName = 'table1', fieldsCallback) => {
  const def = {};
  def.id = nextId(tableName);
  def.name = fullName(tableName);

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
