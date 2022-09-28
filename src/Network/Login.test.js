import * as Network from './Network';
jest.mock('./Network');

import { loginStatus, login, logout } from './Login.js';

it('should get login status as true', async () => {
    const { resolve } = Network._setupMocks();
    const loginPromise = loginStatus();
    resolve({ loggedIn: true });
    const result = await loginPromise;
    expect(result).toStrictEqual({ loggedIn: true });
    // It would be great to be able to look at the calls to getFromPath here.
});

it('should get login status as false', async () => {
    const { resolve } = Network._setupMocks();
    const loginPromise = loginStatus();
    resolve({ loggedIn: false });
    const result = await loginPromise;
    expect(result).toStrictEqual({ loggedIn: false });
    // It would be great to be able to look at the calls to getFromPath here.
});

it('should post credentials to login', async () => {
    const { resolve } = Network._setupMocks();
    const loginPromise = login('fred', 'friendly');
    resolve('');
    const result = await loginPromise;
    expect(result).toBe('');
});

it('should post to logout', async () => {
    const { resolve } = Network._setupMocks();
    const logoutPromise = logout();
    resolve('');
    const result = await logoutPromise;
    expect(result).toBe('');
});