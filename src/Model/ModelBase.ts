import {
  buildURL,
  getFromURLString,
  putToURLString,
  postToURLString,
} from '../Network/Network';
import { omit } from 'lodash';

type ModelScalar = string | number | symbol;
type ModelArray = ModelScalar[];
type ModelRecord = Record<string, ModelScalar | ModelArray>;
type ModelEntry = ModelScalar | ModelArray | ModelRecord;

export interface ModelDataBase {
  id: number;
  name: string;
}

export type ModelOptions = Record<string, string | number | symbol>;

export interface RefModel {
  url?: string;
  get(fieldName: string): ModelEntry;
}

export interface ModelBaseConstructorArgs<
  ModelData extends ModelDataBase = ModelDataBase,
> {
  id?: number;
  data?: ModelData;
  tableName?: string;
  keepId?: boolean;
}

function isModelDataBase(data: object): data is ModelDataBase {
  return data && Object.hasOwn(data, 'id');
}

// Use a TypeScript class rather than just a module. This allows simpler derivation.
export class ModelBase<ModelData extends ModelDataBase = ModelDataBase> {
  static isModel<ModelType>(model: unknown): model is ModelType {
    return model instanceof this;
  }

  static from<
    ModelData extends ModelDataBase = ModelDataBase,
    ModelType extends ModelBase = ModelBase<ModelData>,
  >(
    model: ModelData | ModelType,
    options: Partial<ModelBaseConstructorArgs<ModelData>> = {},
  ): ModelType {
    if (this.isModel<ModelType>(model)) {
      // @ts-expect-error There is some weird class magic happening here.
      return new this({
        ...options,
        data: model.toJSON(),
      });
    } else {
      // @ts-expect-error There is some weird class magic happening here.
      return new this({
        ...options,
        data: model,
      });
    }
  }

  readonly tableName: string = 'generic';
  private _url: string;
  private _readyPromise: Promise<ModelData | {}>;

  protected _data: ModelData;
  protected _refModels: Record<string, ModelBase> = {};

  constructor({
    id,
    data,
    tableName = 'generic',
    keepId = false,
  }: ModelBaseConstructorArgs<ModelData>) {
    this.tableName = tableName;

    if (data) {
      const omitKeys = ['id', 'url'];

      if (keepId) {
        omitKeys.shift();

        if (data.id) {
          this._url = buildURL({
            applicationPaths: [this.tableName, data.id.toString()],
          }).toString();
        }
      }

      this.createRefmodels(omit(data, omitKeys));
      this._readyPromise = Promise.resolve(this._data);
    } else if (id) {
      this._url = buildURL({
        applicationPaths: [this.tableName, id.toString()],
      }).toString();
      this._readyPromise = this.fetch();
    } else {
      // @ts-expect-error Typescript doesn't handle this sort of thing well.
      this._data = {
        id: undefined,
        name: undefined,
      };
      this._readyPromise = Promise.resolve(this._data);
    }
  }

  get url(): string | undefined {
    return this._url;
  }

  get ready(): Promise<ModelData | {}> {
    return this._readyPromise;
  }

  // Data Accessors
  get id(): number | undefined {
    return this._data.id;
  }

  get name(): string | undefined {
    return this._data.name;
  }

  set name(newName: string) {
    this._data.name = newName;
  }

  private async fetch(): Promise<ModelData | {}> {
    try {
      const fetchedData = await getFromURLString(this._url);
      // @ts-expect-error This is annoying
      this.createRefmodels(omit(fetchedData, ['url']));
      return fetchedData;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.status === 401) {
        // @ts-expect-error There has to be a better way.
        this._data = {};
        this._url = undefined;
      } else if (err.status !== 404) {
        console.error(err.status, err.message);
      }

      return Promise.reject(err);
    }
  }

  protected createRefmodels(data: Partial<ModelData>): void {
    // @ts-expect-error Typescript just doesn't handle this sort of derivation.
    this._data = {
      id: undefined,
      name: undefined,
      ...data,
    };
  }

  async save(): Promise<ModelData> {
    this._data.id = this._data.id || undefined;
    this._data.name = this._data.name || undefined;

    if (!this.isModelData(this._data)) {
      throw new Error('Invalid data in model on save');
    }

    if (this._data.id) {
      this._url = buildURL({
        applicationPaths: [this.tableName, this._data.id.toString()],
      }).toString();

      const newDef = await putToURLString(this._url, this._data);
      // @ts-expect-error Derivations need to be smarter.
      this.createRefmodels(omit(newDef, ['url']));
      return this._data;
    }

    const saveUrl = buildURL({ applicationPaths: [this.tableName] }).toString();
    const newDef = await postToURLString(saveUrl, this._data);

    // @ts-expect-error Derivations need to be smarter.
    this.createRefmodels(omit(newDef, ['url']));
    this._url = buildURL({
      applicationPaths: [this.tableName, this._data.id.toString()],
    }).toString();

    return this._data;
  }

  // Handy to have and also helps with testing
  toJSON(): ModelData {
    return { ...this._data };
  }

  toString(): string {
    return JSON.stringify(this.toJSON());
  }

  protected isModelData(data: object): data is ModelData {
    return isModelDataBase(data);
  }
}
