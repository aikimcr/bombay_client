import { newServer } from 'mock-xmlhttprequest';

import * as Network from './Network';


it('Should normallize the paths correctly', () => {
    let normalPath = Network.normalizeAndJoinPath();
    expect(normalPath).toBe('/');

    normalPath = Network.normalizeAndJoinPath('foo', 'fum');
    expect(normalPath).toBe('/foo/fum');

    normalPath = Network.normalizeAndJoinPath('/professor', 'rabbit');
    expect(normalPath).toBe('/professor/rabbit');

    normalPath = Network.normalizeAndJoinPath('/', 'rabbi');
    expect(normalPath).toBe('/rabbi');

    normalPath = Network.normalizeAndJoinPath('golem', '/');
    expect(normalPath).toBe('/golem/');

    normalPath = Network.normalizeAndJoinPath('/giraffe/', '/armadillo', 'gorilla/', 'skunk')
    expect(normalPath).toBe('/giraffe/armadillo/gorilla/skunk');

});

it('Should generate a valid url', () => {
    let newUrl = Network.buildURL();
    expect(newUrl).toBe(`https://${Network.serverHost}/`);

    newUrl = Network.buildURL({protocol: 'http'});
    expect(newUrl).toBe(`http://${Network.serverHost}/`);

    newUrl = Network.buildURL({path: '/foobar'});
    expect(newUrl).toBe(`https://${Network.serverHost}/foobar`);

    newUrl =Network.buildURL({path: [Network.basePath, 'login']});
    expect(newUrl).toBe(`https://${Network.serverHost}/${Network.basePath}/login`);
});

it('Should retrieve the login status', async () => {
    const requestUrl = Network.buildURL({ path: [Network.basePath, 'login'] });

    const server = newServer({
        get: [requestUrl, {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: '{ "loggedIn": false }',
        }]
    });

    try {
        server.install();

        const response = await Network.getFromPath('login');
        expect(response).toEqual({
            loggedIn: false,
        });
    } finally {
        server.remove();
    }
});

it('Should post the body to the login', async () => {
    const credentials = {
        username: 'herkimer',
        password: 'mitty',
    };

    const requestUrl = Network.buildURL({ path: [Network.basePath, 'login'] });

    const server = newServer({
        post: [requestUrl, {
            status: 200,
        }]
    });

    try {
        server.install();

        const response = await Network.postToPath('login', credentials);
        const requestLog = server.getRequestLog();
        expect(requestLog.length).toBe(1);
        expect(requestLog[0].body).toBe(credentials);
        expect(response).toBe('');
    } finally {
        server.remove();
    }
});