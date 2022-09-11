import * as Network from './Network';

let mockResolver = null;
let mockPromise = null;

jest.mock('./Network', () => {
    const originalModule = jest.requireActual('./Network');

    return {
        __esModule: true,
        ...originalModule,
        getFromPath: (path, query) => {
            return mockPromise;
        },
        postToPath: (path, body, query) => mockPromise,
    };
});

import { loginStatus, login } from  './Login.js';

beforeEach(() => {
    mockPromise = new Promise((resolve, reject) => {
        mockResolver = resolve;
    });
});

it('should get login status as true', async () => {
    const loginPromise = loginStatus();
    mockResolver({ loggedIn: true });
    const result = await loginPromise;
    expect(result).toStrictEqual({ loggedIn: true });
    // It would be great to be able to look at the calls to getFromPath here.
});

it('should get login status as false', async () => {
    const loginPromise = loginStatus();
    mockResolver({ loggedIn: false });
    const result = await loginPromise;
    expect(result).toStrictEqual({ loggedIn: false });
    // It would be great to be able to look at the calls to getFromPath here.
});

it('should post credentials to login', async () => {
    const loginPromise = login('fred', 'friendly');
    mockResolver('');
    const result = await loginPromise;
    expect(result).toBe('');
});