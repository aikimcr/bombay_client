export const TestUrlWithOffsets = (
  url: string,
  offset: number,
  limit: number,
): string => {
  const workUrl = new URL(url);
  workUrl.searchParams.set('offset', offset.toString());
  workUrl.searchParams.set('limit', limit.toString());
  return workUrl.toString();
};

export const TestUrlWithId = (url: string, id: number): string => {
  return `${url}/${id}`;
};

export function makeTestIterator<ResultType>(
  sourceArray: ResultType[],
): () => ResultType {
  const workSource: ResultType[] = [...sourceArray];

  return (): ResultType => {
    const result = workSource.shift();
    workSource.push(result);
    return result;
  };
}
