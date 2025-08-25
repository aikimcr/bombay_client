import { getFromURLString, prepareURLFromArgs } from "./Network";

export async function fetchBootstrap() {
  try {
    const requestURL = prepareURLFromArgs("bootstrap");
    const result = await getFromURLString(requestURL.toString());
    return result;
  } catch (err) {
    return Promise.reject(err);
  }
}
