import * as Network from './Network';
jest.mock('./Network');

import jwt_decode from 'jwt-decode';
import { loginStatus, login, logout } from './Login.js';

const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGREM4MTEzOCIsInVzZXIiOnsiaWQiOjEsIm5hbWUiOiJhZG1pbiIsImFkbWluIjpmYWxzZX0sImlhdCI6MTY2NTk2NTA5OX0.2vz14X7Tm-oFlyOa7dcAF-5y5ympi_UlWyJNxO4xyS4';

it('should get login status as true', async () => {
    localStorage.setItem('jwttoken', testToken);

    const { resolve } = Network._setupMocks();
    const loginPromise = loginStatus();
    
    // To Do: This code should only execute if the token has expired.  I think.
    // expect(Network.getFromURLString).toBeCalledTimes(1);
    // expect(Network.getFromURLString).toBeCalledWith('http://localhost:2001/xyzzy/login');

    // resolve({ loggedIn: true });
    const result = await loginPromise;
    expect(result).toBeTruthy();

    localStorage.removeItem('jwttoken');
});

it('should get login status as false', async () => {
    localStorage.removeItem('jwttoken');

    const {} = Network._setupMocks();
    const loginPromise = loginStatus();

    expect(Network.getFromURLString).not.toBeCalled();

    const result = await loginPromise;
    expect(result).toBeFalsy();
});

it('should post credentials to login and save token', async () => {
    localStorage.removeItem('jwttoken');

    const { resolve } = Network._setupMocks();
    const loginPromise = login('fred', 'friendly');

    expect(Network.postToURLString).toBeCalledTimes(1);
    expect(Network.postToURLString).toBeCalledWith(
        'http://localhost:2001/xyzzy/login',
        { username: 'fred', password: 'friendly' }
    );

    resolve(testToken);
    const result = await loginPromise;
    expect(result).toStrictEqual(jwt_decode(testToken));

    const token = localStorage.getItem('jwttoken');
    expect(token).toEqual(testToken);

    localStorage.removeItem('jwttoken');
});

it('should post to logout', async () => {
    localStorage.setItem('jwttoken', testToken);

    const { resolve } = Network._setupMocks();
    const logoutPromise = logout();

    expect(Network.postToURLString).toBeCalledTimes(1);
    expect(Network.postToURLString).toBeCalledWith(
        'http://localhost:2001/xyzzy/logout'
    );

    resolve('');
    const result = await logoutPromise;
    expect(result).toBe('');

    const token = localStorage.getItem('jwttoken');
    expect(token).toBeNull();
});