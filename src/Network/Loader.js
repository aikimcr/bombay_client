// Load the data from the server.  Handle all the boilerplate for xhr
// correctly.

export const listUrl = 'https://api.coingecko.com/api/v3/exchanges';
export const perPage = 10;

export function load(url, query = {}) {
  if (process.env.NODE_ENV === 'test') {
    debugger;
    return Promise.resolve([]);
  }

  const requestUrl = new URL(url);

  for (const param in query) {
    requestUrl.searchParams.set(param, query[param]);
  }

  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.open('GET', requestUrl);
    xhr.onload = function() {
      if (xhr.status === 200) {
        resolve(xhr.response);
      }
      else {
        reject({status: xhr.status, message: xhr.responseText});
      }
    };
    xhr.send();
  });
}

export async function loadList(page) {
  const result = await load(listUrl, {per_page: 10, page: page});
  // This is going to need caching at some point.
  return result;
}

export async function loadDetail(exchangeId) {
  const detailUrl = `${listUrl}/${exchangeId}`;
  const result = await load(detailUrl, {});
  // Again, caching is really needed here.
  return result;
}

export default load;
