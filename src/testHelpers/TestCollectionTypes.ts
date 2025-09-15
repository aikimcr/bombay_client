import {
  CollectionBase,
  CollectionBaseConstructorArgs,
} from '../Model/CollectionBase';
import {
  ModelBase,
  ModelBaseConstructorArgs,
  ModelDataBase,
} from '../Model/ModelBase';

export const TestCollectionOneURL = 'http://localhost:2001/testone';

export interface TestModelOneData extends ModelDataBase {
  description: string;
}

export class TestModelOne extends ModelBase<TestModelOneData> {
  static TableName = 'testone';

  constructor(args: ModelBaseConstructorArgs<TestModelOneData>) {
    super({
      ...args,
      tableName: TestModelOne.TableName,
    });
  }

  get description() {
    return this._data.description;
  }

  set description(newDescription: string) {
    this._data.description = newDescription;
  }

  protected isModelData(data: object): data is TestModelOneData {
    return super.isModelData(data) && Object.hasOwn(data, 'description');
  }
}

export class TestCollectionOne extends CollectionBase<
  TestModelOneData,
  TestModelOne
> {
  constructor(
    args: CollectionBaseConstructorArgs<TestModelOneData, TestModelOne>,
  ) {
    super({
      ...args,
      tableName: TestModelOne.TableName,
    });
  }

  protected createAModelFromDef(def: TestModelOneData): TestModelOne {
    return TestModelOne.from<TestModelOneData, TestModelOne>(def, {
      keepId: true,
    });
  }
}

export interface TestCollectionOneFetchBody {
  data: TestModelOneData[];
  nextPage?: string;
  prevPage?: string;
}

export interface TestCollectionOneFetchResult {
  body: TestCollectionOneFetchBody;
}
