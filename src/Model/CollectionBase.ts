import {
  getFromURLString,
  postToURLString,
  prepareURLFromArgs,
} from '../Network/Network';
import { loginStatus } from '../Network/Login';

import ModelBase, { ModelData } from './ModelBase';
import { forceLoginState } from '../Hooks/useLoginTracking';

export interface CollectionOptions {
  modelClass?: typeof ModelBase;
  models?: ModelBase[];
  prevPage?: string | null;
  nextPage?: string | null;
}

export interface CollectionData {
  data: ModelData[];
  prevPage: string | null;
  nextPage: string | null;
}

export interface MergeOptions {
  reset?: boolean;
  append?: boolean;
}

export type QueryOptions = Record<string, string | number | symbol>;

// Use a TypeScript class rather than just a module. This allows simpler derivation.
export class CollectionBase {
  static isCollection(collection: unknown): collection is CollectionBase {
    return collection instanceof this;
  }

  static buildUrl(
    urlOrPath: string,
    query: Record<string, QueryOptions> = {},
  ): string {
    try {
      const url = new URL(urlOrPath);
      for (const key in query) {
        url.searchParams.set(key, query[key]);
      }
      return url.toString();
    } catch (err) {
      return prepareURLFromArgs(urlOrPath, query).toString();
    }
  }

  #idUrl: string;
  #modelClass: typeof ModelBase;
  #models: ModelBase[] = [];
  #prevPage?: string | null;
  #nextPage?: string | null;
  #readyPromise: Promise<ModelBase[]>;
  #maxModels = 1000; // Trim the model list if it gets longer than this.
  // #pages = [];

  constructor(url: string, options: CollectionOptions = {}) {
    this.#idUrl = this.constructor.buildUrl(url);

    this.#modelClass = options.modelClass ?? ModelBase;

    if (options.models != null) {
      this.#models = [...options.models];
      this.#prevPage = options.prevPage;
      this.#nextPage = options.nextPage;
      this.#readyPromise = Promise.resolve(this.#models);
    } else {
      this.#readyPromise = this.#fetch(this.#idUrl);
    }
  }

  idUrl(): string {
    return this.#idUrl;
  }

  modelClass(): typeof ModelBase {
    return this.#modelClass;
  }

  models(): ModelBase[] {
    return [...this.#models];
  }

  length(): number {
    return this.#models.length;
  }

  ready(): Promise<ModelBase[]> {
    return this.#readyPromise;
  }

  add(model: ModelBase): ModelBase {
    // const newModel = this.#modelClass.from(model);
    // this.#models.push(newModel);
    this.#models.push(model);
    return model;
    // return newModel;
  }

  forEach(
    callback: (model: ModelBase, index: number, list: ModelBase[]) => void,
  ): void {
    return this.#models.forEach((model, index, list) => {
      return callback(model, index, list);
    });
  }

  map<T>(
    callback: (model: ModelBase, index: number, list: ModelBase[]) => T,
  ): T[] {
    return this.#models.map((model, index, list) => {
      return callback(model, index, list);
    });
  }

  reduce<T>(
    callback: (
      memo: T,
      model: ModelBase,
      index: number,
      list: ModelBase[],
    ) => T,
    start: T,
  ): T {
    return this.#models.reduce((memo, model, index, list) => {
      return callback(memo, model, index, list);
    }, start);
  }

  #mergeModels(
    data: ModelData[],
    { reset, append }: MergeOptions = {
      reset: true,
      append: true,
    },
  ): void {
    if (reset) {
      this.#models = [];
    }

    if (data && data.length > 0) {
      const currentIds = this.#models.map((model) => model.get('id'));
      const newModels = data
        .filter((def) => !currentIds.includes(def.id))
        .map((def) => this.#modelClass.from(def));

      if (append) {
        this.#models = [...this.#models, ...newModels].slice(-this.#maxModels);
      } else {
        this.#models = [...newModels, ...this.#models].slice(
          0,
          this.#maxModels,
        );
      }
    }
  }

  async #fetch(url: string, options?: MergeOptions): Promise<ModelBase[]> {
    const loggedIn = await loginStatus();

    if (!loggedIn) {
      this.#models = [];
      this.#prevPage = null;
      this.#nextPage = null;
      forceLoginState(false);
      return this.#models;
    }

    try {
      const body = await getFromURLString(url);

      this.#mergeModels(body.data, options);
      this.#prevPage = body.prevPage;
      this.#nextPage = body.nextPage;
      return this.#models;
    } catch (err: Error) {
      // Logged out
      if (err.status === 401) {
        this.#models = [];
        this.#prevPage = null;
        this.#nextPage = null;
        forceLoginState(false);
        return this.#models;
      }

      // You just don't have permission to look at this.
      if (err.status === 403) {
        this.#models = [];
      } else if (err.status !== 404) {
        console.error(err.status, err.message);
      }

      this.#prevPage = undefined;
      this.#nextPage = undefined;

      return Promise.resolve({
        data: [],
        prevPage: null,
        nextPage: null,
      });
    }
  }

  async save(modelDef: ModelData): Promise<ModelBase> {
    const newDef = await postToURLString(this.#idUrl, modelDef);
    const newModel = this.#modelClass.from(newDef);
    return this.add(newModel);
  }

  hasNextPage(): boolean {
    return !!this.#nextPage;
  }

  async fetchNextPage(): Promise<ModelBase[]> {
    if (this.#nextPage) {
      await this.#fetch(this.#nextPage, {
        reset: false,
        append: true,
      });
    }

    return this.#models;
  }

  hasPrevPage(): boolean {
    return !!this.#prevPage;
  }

  async fetchPrevPage(): Promise<ModelBase[]> {
    if (this.#prevPage) {
      await this.#fetch(this.#prevPage, {
        reset: false,
        append: false,
      });
    }

    return this.#models;
  }

  // Handy to have and also helps with testing
  toJSON(): CollectionData {
    return {
      data: this.#models.map((model) => model.toJSON()),
      prevPage: this.#prevPage,
      nextPage: this.#nextPage,
    };
  }

  toString(): string {
    return JSON.stringify(this.toJSON());
  }
}

export default CollectionBase;
