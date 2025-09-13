import { getFromURLString, prepareURLFromArgs } from './Network';

export const fetchBootstrap = async () => {
  try {
    const requestURL = prepareURLFromArgs(['bootstrap']);
    const result = await getFromURLString(requestURL.toString());
    return result;
  } catch (err) {
    return Promise.reject(err);
  }
};
