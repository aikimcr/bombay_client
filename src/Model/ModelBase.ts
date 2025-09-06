import { getFromURLString, putToURLString } from '../Network/Network';
import { loginStatus } from '../Network/Login';
import { forceLoginState } from '../Hooks/useLoginTracking';

type ModelScalar = string | number | symbol;
type ModelArray = ModelScalar[];
type ModelRecord = Record<string, ModelScalar | ModelRecord>;
type ModelEntry = ModelScalar | ModelArray | ModelRecord;

export interface ModelData {
  id?: string | number;
  url?: string;
  [key: string]: ModelEntry;
}

export type ModelOptions = Record<string, string | number | symbol>;

export interface RefModel {
  url?: string;
  get(fieldName: string): ModelEntry;
}

// Use a TypeScript class rather than just a module. This allows simpler derivation.
export class ModelBase {
  static isModel(model: unknown): model is ModelBase {
    return model instanceof this;
  }

  static from(model: ModelData | ModelBase): ModelBase {
    if (model instanceof this) {
      return new this(null, model.toJSON());
    } else {
      return new this(null, model);
    }
  }

  #idUrl?: string;
  #readyPromise: Promise<ModelData>;
  #data: ModelData = {};
  #refModels: Record<string, RefModel> = {};

  constructor(url?: string | null, data?: ModelData) {
    if (data) {
      this.createRefmodels(data);
      this.#readyPromise = Promise.resolve(this.#data);
    } else if (url) {
      this.#idUrl = url;
      this.#readyPromise = this.#fetch();
    } else {
      this.#data = {};
      this.#readyPromise = Promise.resolve(this.#data);
    }
  }

  idUrl(): string | undefined {
    return this.#idUrl;
  }

  ready(): Promise<ModelData> {
    return this.#readyPromise;
  }

  async #fetch(): Promise<ModelData> {
    const loggedIn = await loginStatus();

    if (!loggedIn) {
      forceLoginState(false);
      return Promise.reject({
        status: 401,
        message: 'Not Logged In',
      });
    }

    try {
      const fetchedData = await getFromURLString(this.#idUrl);
      this.createRefmodels(fetchedData);
      return fetchedData;
    } catch (err: Error) {
      if (err.status === 401) {
        // Logged out
        forceLoginState(false);
        // } else if (err.status === 403) { // You just don't have permission to look at this.
      } else if (err.status !== 404) {
        console.error(err.status, err.message);
      }

      return Promise.reject(err);
    }
  }

  createRefmodels(data: ModelData): void {
    this.#data = { ...data };
    if (this.#data.url) {
      this.#idUrl = this.#data.url;
    }
  }

  addRef(modelName: string, refModel: RefModel): string {
    const refUrl = refModel.get('url') as string;
    this.#refModels[refUrl] = refModel;

    // Adding the reference retrieval method to the instantiated object.  This needs to be done a better way.
    this[modelName] = function (url: string) {
      return this.#refModels[url];
    }.bind(this, refUrl);

    return refUrl;
  }

  getRef(url: string): RefModel | undefined {
    return this.#refModels[url];
  }

  get(fieldName: string): ModelEntry {
    if (this.#data.hasOwnProperty(fieldName)) {
      return this.#data[fieldName];
    }

    throw new Error(`No field "${fieldName}" is set`);
  }

  async save(): Promise<ModelData> {
    const newDef = await putToURLString(this.#idUrl!, this.#data);
    this.createRefmodels(newDef);
    return this.#data;
  }

  set(fieldName: string | ModelData, value?: ModelEntry): this {
    if (typeof fieldName === 'object' && fieldName !== null) {
      this.#data = {
        ...this.#data,
        ...fieldName,
      };
    } else {
      this.#data[fieldName as string] = value;
    }

    return this;
  }

  // Handy to have and also helps with testing
  toJSON(): ModelData {
    return { ...this.#data };
  }

  toString(): string {
    return JSON.stringify(this.toJSON());
  }
}

export default ModelBase;
