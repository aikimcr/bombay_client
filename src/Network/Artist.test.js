import * as Network from './Network';

jest.mock('./Network', () => {
    const originalModule = jest.requireActual('./Network');

    return {
        __esModule: true,
        ...originalModule,
        getFromPath: (path, query) => { expect('').toBe('Did Your forget to mock something?'); },
        getFromURLString: (path, query) => { expect('').toBe('Did Your forget to mock something?'); },
        postToPath: (path, body, query) => { expect('').toBe('Did Your forget to mock something?'); },
    };
});

import { fetchArtistList, fetchArtist } from './Artist.js';

let mockPromise;
let mockResolver;

async function verifyArtistList(listCount, query = {}, urlString = undefined) {
    Network.getFromPath.mockClear();
    Network.getFromURLString.mockClear();

    [mockPromise, mockResolver] = makeResolvablePromise();
    const artistPage = makeArtistList(listCount, query);

    const artistListPromise = fetchArtistList(urlString, query);
    mockResolver(artistPage);
    const artistList = await artistListPromise;
    expect(artistList).toBe(artistPage);

    return artistList;
}

it('should get the artist list', async () => {
    Network.getFromPath = jest.fn((path, query) => mockPromise);
    Network.getFromURLString = jest.fn((urlString, query) => mockPromise);

    const artistList = await verifyArtistList(10);

    // Some quick sanity checks    
    expect(artistList).toHaveProperty('data');
    expect(artistList).toHaveProperty('nextPage');
    expect(artistList).not.toHaveProperty('prevPage');
    expect(Network.getFromPath.mock.calls).toEqual([['artist', {}]]);
});

it('should page through until it runs out', async () => {
    Network.getFromPath = jest.fn((path, query) => mockPromise);
    Network.getFromURLString = jest.fn((urlString, query) => mockPromise);

    let artistList = await verifyArtistList(10);

    // Some quick sanity checks    
    expect(artistList).toHaveProperty('data');
    expect(artistList).toHaveProperty('nextPage');
    expect(artistList).not.toHaveProperty('prevPage');
    expect(Network.getFromPath.mock.calls).toEqual([['artist', {}]]);
    expect(Network.getFromURLString.mock.calls).toEqual([]);

    const requestUrl = Network.prepareURLFromArgs('artist', {offset: 10, limit: 10});
    artistList = await verifyArtistList(10, {offset: 10, limit: 10}, artistList.nextPage);

    // Some quick sanity checks    
    expect(artistList).toHaveProperty('data');
    expect(artistList).toHaveProperty('nextPage');
    expect(artistList).toHaveProperty('prevPage');
    expect(Network.getFromPath.mock.calls).toEqual([]);
    expect(Network.getFromURLString.mock.calls).toEqual([[requestUrl.toString()]]);

    requestUrl.searchParams.set('offset', 20);
    artistList = await verifyArtistList(5, { offset: 10, limit: 10 }, artistList.nextPage);

    // Some quick sanity checks    
    expect(artistList).toHaveProperty('data');
    expect(artistList).not.toHaveProperty('nextPage');
    expect(artistList).toHaveProperty('prevPage');
    expect(Network.getFromPath.mock.calls).toEqual([]);
    expect(Network.getFromURLString.mock.calls).toEqual([[requestUrl.toString()]]);
});

it('should handle it on 404', async () => {
    mockPromise = Promise.reject({status: 404, statusText: 'Not Found'});

    Network.getFromPath = jest.fn((path, query) => mockPromise);
    Network.getFromURLString = jest.fn((urlString, query) => mockPromise);

    fetchArtistList()
        .then(() => {
            fail('This should not get here');
        })
        .catch((err) => {
            expect(err.status).toBe(404);
            expect(err.statusText).toBe('Not Found');
        })
});

if('should fetch an artist', async() => {
    Network.getFromURLString = jest.fn((urlString, query) => mockPromise);
    [mockPromise, mockResolver] = makeResolvablePromise();

    const artist = makeAnArtist();
    const fetchPromise = fetchArtist(artist.url);
    mockResolver(artist);
    const fetched = await fetchPromise;

    expect(fetched).toEqual(artist);
});

it('should also handle a 404 here', async() => {
    mockPromise = Promise.reject({ status: 404, statusText: 'Not Found' });

    Network.getFromPath = jest.fn((path, query) => mockPromise);
    Network.getFromURLString = jest.fn((urlString, query) => mockPromise);

    const artist = makeAnArtist();
    fetchArtist(artist.url)
        .then(() => {
            fail('This should not get here');
        })
        .catch((err) => {
            expect(err.status).toBe(404);
            expect(err.statusText).toBe('Not Found');
        })
});