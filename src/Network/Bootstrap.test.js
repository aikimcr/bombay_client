import * as Network from "./Network";
jest.mock("./Network");

import { fetchBootstrap } from "./Bootstrap";

it("should get the bootstrap", async () => {
  const { resolve } = Network._setupMocks();
  const bootstrapPromise = fetchBootstrap();
  const body = { xyzzy: ["plover", "plugh", "bird"] };
  resolve(body);
  const result = await bootstrapPromise;
  expect(result).toEqual(body);
});
