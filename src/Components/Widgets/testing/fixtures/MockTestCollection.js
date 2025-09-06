import { ModelBase } from "../../../../Model/ModelBase";
import { CollectionBase } from "../../../../Model/CollectionBase";

export class MockTestModel extends ModelBase {}

export class MockTestCollection extends CollectionBase {
  constructor(options = {}) {
    super("/table1", { ...options, modelClass: MockTestModel });
  }
}

import { makeModels } from "../../../../testHelpers/modelTools";

export const mockFetchBody = {
  data: [
    {
      id: 1,
      name: "Kaylin Kihn",
      url: "http://localhost:2001/table1/1",
    },
    {
      id: 2,
      name: "Lance Morar",
      url: "http://localhost:2001/table1/2",
    },
    {
      id: 3,
      name: "Felix Senger",
      url: "http://localhost:2001/table1/3",
    },
    {
      id: 4,
      name: "Alyson Harvey",
      url: "http://localhost:2001/table1/4",
    },
    {
      id: 5,
      name: "Lenore Kuvalis",
      url: "http://localhost:2001/table1/5",
    },
    {
      id: 6,
      name: "Gertrude Kilback",
      url: "http://localhost:2001/table1/6",
    },
    {
      id: 7,
      name: "Kobe Brown",
      url: "http://localhost:2001/table1/7",
    },
    {
      id: 8,
      name: "Arnulfo Bartoletti",
      url: "http://localhost:2001/table1/8",
    },
    {
      id: 9,
      name: "Ariane Beer",
      url: "http://localhost:2001/table1/9",
    },
    {
      id: 10,
      name: "Norwood Pollich",
      url: "http://localhost:2001/table1/10",
    },
  ],
  nextPage: "http://localhost:2001/xyzzy/table1?offset=10&limit=10",
};

export const mockModels = mockFetchBody.data.map((def) => {
  return MockTestModel.from(def);
});
