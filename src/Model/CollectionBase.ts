import { buildURL, getFromURLString } from '../Network/Network';

import { ModelBase, ModelDataBase } from './ModelBase';

export interface CollectionOptions {
  ModelBase?: typeof ModelBase;
  models?: ModelBase[];
  prevPage?: string | null;
  nextPage?: string | null;
}

interface CollectionData<ModelData> {
  data: ModelData[];
  prevPage: string | null;
  nextPage: string | null;
}

export interface MergeOptions {
  reset?: boolean;
  append?: boolean;
}

export type QueryOptions = Record<string, string | number | symbol>;

export interface CollectionBaseConstructorArgs<ModelData, ModelType> {
  models?: ModelType[];
  defs?: ModelData[];
  tableName?: string;
  fetch?: boolean;
}
export class CollectionBase<
  ModelData extends ModelDataBase = ModelDataBase,
  ModelType extends ModelBase = ModelBase,
> {
  static isCollection(collection: unknown): collection is CollectionBase {
    return collection instanceof this;
  }

  readonly tableName: string = 'generic';
  readonly maxModels = 1000; // Trim the model list if it gets longer than this.

  private _url: string;
  private _readyPromise: Promise<ModelType[]>;

  protected _models: ModelType[] = [];
  protected _prevPage: string;
  protected _nextPage: string;

  constructor({
    models = [],
    defs = [],
    tableName = 'generic',
    fetch = false,
  }: CollectionBaseConstructorArgs<ModelData, ModelType>) {
    this.tableName = tableName;

    this._url = buildURL({ applicationPaths: [this.tableName] }).toString();

    if (fetch) {
      this._readyPromise = this.fetch(this._url);
    } else if (models && models.length > 0) {
      this._models = [...models];
    } else if (defs && defs.length > 0) {
      this._models = defs.map((def) => this.createAModelFromDef(def));
    } else {
      this._models = [];
    }
  }

  get url(): string {
    return this._url;
  }

  get models(): ModelType[] {
    return [...this._models];
  }

  get length(): number {
    return this._models.length;
  }

  get ready(): Promise<ModelType[]> {
    return this._readyPromise;
  }

  get prevPage(): string {
    return this._prevPage;
  }

  get nextPage(): string {
    return this._nextPage;
  }

  add(model: ModelType): ModelType {
    const newModel = ModelBase.from<ModelData, ModelType>(model, {
      keepId: true,
    });
    this._models.push(newModel);
    this._models.push(model);
    return newModel;
  }

  clear() {
    this._models = [];
    this._nextPage = undefined;
    this._prevPage = undefined;
  }

  forEach(
    callback: (model: ModelType, index: number, list: ModelType[]) => void,
  ): void {
    return this._models.forEach((model, index, list) => {
      return callback(model, index, list);
    });
  }

  map<T>(
    callback: (model: ModelType, index: number, list: ModelType[]) => T,
  ): T[] {
    return this._models.map((model, index, list) => {
      return callback(model, index, list);
    });
  }

  reduce<T>(
    callback: (
      memo: T,
      model: ModelType,
      index: number,
      list: ModelType[],
    ) => T,
    start: T,
  ): T {
    return this._models.reduce((memo, model, index, list) => {
      return callback(memo, model, index, list);
    }, start);
  }

  protected createAModelFromDef(def: ModelData): ModelType {
    return ModelBase.from<ModelData, ModelType>(def, { keepId: true });
  }

  protected async fetch(url: string): Promise<ModelType[]> {
    const workUrl = new URL(url);
    const offsetString = workUrl.searchParams.get('offset');
    const limitString = workUrl.searchParams.get('limit');

    try {
      const body = await getFromURLString(url);

      const newModels = body.data.map((def: ModelData) => {
        return this.createAModelFromDef(def);
      });

      const offset = offsetString ? parseInt(offsetString) : 0;
      const limit = limitString ? parseInt(limitString) : newModels.length;
      const minimumLength = offset + limit;

      if (this._models.length < minimumLength) {
        this._models.length = minimumLength;
      }

      this._models.splice(offset, limit, ...newModels);
      this._prevPage = body.prevPage;
      this._nextPage = body.nextPage;
      return this._models;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      // Logged out
      if (err.status === 401) {
        this._models = [];
        this._prevPage = null;
        this._nextPage = null;
        return this._models;
      }

      // You just don't have permission to look at this.
      if (err.status === 403) {
        this._models = [];
      } else if (err.status !== 404) {
        console.error(err.status, err.message);
      }

      this._prevPage = undefined;
      this._nextPage = undefined;

      return Promise.reject(err);
    }
  }

  get hasNextPage(): boolean {
    return !!this._nextPage;
  }

  async fetchNextPage(): Promise<ModelBase[]> {
    const fetchUrl = this._nextPage || this._url;
    this._readyPromise = this.fetch(fetchUrl);
    await this._readyPromise;
    return this._models;
  }

  get hasPrevPage(): boolean {
    return !!this._prevPage;
  }

  async fetchPrevPage(): Promise<ModelBase[]> {
    const fetchUrl = this._prevPage || this._url;
    this._readyPromise = this.fetch(fetchUrl);
    await this._readyPromise;
    return this._models;
  }

  // // Handy to have and also helps with testing
  toJSON(): CollectionData<ModelData> {
    return {
      // @ts-expect-error Classes and types have issues
      data: this._models.map((model) => model.toJSON()),
      prevPage: this._prevPage,
      nextPage: this._nextPage,
    };
  }

  toString(): string {
    return JSON.stringify(this.toJSON());
  }
}
