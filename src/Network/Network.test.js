import { newServer } from 'mock-xmlhttprequest';

import * as Network from './Network';

let mockOk = true;
let mockStatus = 200;
let mockStatusText = 'OK'; 
let mockJSON = {};



beforeEach(() => {
    // fetch.mockClear();
    mockOk = true;
    mockStatus = 200;
    mockStatusText = 'OK';
    mockJSON = {};
});

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
    expect(newUrl).toBe(`${Network.serverProtocol}://${Network.serverHost}:${Network.serverPort}/`);

    newUrl = Network.buildURL({protocol: 'http'});
    expect(newUrl).toBe(`http://${Network.serverHost}:${Network.serverPort}/`);

    newUrl = Network.buildURL({ protocol: 'https' });
    expect(newUrl).toBe(`https://${Network.serverHost}:${Network.serverPort}/`);

    newUrl = Network.buildURL({path: '/foobar'});
    expect(newUrl).toBe(`${Network.serverProtocol}://${Network.serverHost}:${Network.serverPort}/foobar`);

    newUrl =Network.buildURL({path: [Network.basePath, 'login']});
    expect(newUrl).toBe(`${Network.serverProtocol}://${Network.serverHost}:${Network.serverPort}${Network.basePath}/login`);
});

it('Should retrieve the login status', async () => {
    mockJSON ={ loggedIn: true };

    // https://stackoverflow.com/questions/73683195/jest-fn-not-registering-mock-implementation
    //
    // For reasons that are not clear to me, this mock must be done in each test that
    // uses it.  I tried doing it outside the test scope and it ignores the 
    // mockImplementation.
    global.fetch = jest.fn(() => {
        return Promise.resolve({
            ok: mockOk,
            status: mockStatus,
            statusText: mockStatusText,
            json: () => Promise.resolve(mockJSON),
        });
    });

    const requestUrl = Network.buildURL({ path: [Network.basePath, 'login'] });

    const data = await Network.getFromPath('login');
    expect(data).toEqual(mockJSON);
});

it('should reetrieve the url', async () => {
    mockJSON = { id: 109, name: 'xyzzy', description: 'Plover' };

    // https://stackoverflow.com/questions/73683195/jest-fn-not-registering-mock-implementation
    //
    // For reasons that are not clear to me, this mock must be done in each test that
    // uses it.  I tried doing it outside the test scope and it ignores the
    // mockImplementation.
    global.fetch = jest.fn(() => {
        return Promise.resolve({
            ok: mockOk,
            status: mockStatus,
            statusText: mockStatusText,
            json: () => Promise.resolve(mockJSON),
        });
    });

    const requestUrl = Network.buildURL({ path: [Network.basePath, 'table', '1'] });

    const data = await Network.getFromURLString(requestUrl.toString());
    expect(data).toEqual(mockJSON);
});

it('should get the 404', async () => {
    mockOk = false;
    mockStatus = 404;
    mockStatusText = 'Not Found';

    // https://stackoverflow.com/questions/73683195/jest-fn-not-registering-mock-implementation
    //
    // For reasons that are not clear to me, this mock must be done in each test that
    // uses it.  I tried doing it outside the test scope and it ignores the
    // mockImplementation.
    global.fetch = jest.fn(() => {
        return Promise.resolve({
            ok: mockOk,
            status: mockStatus,
            statusText: mockStatusText,
            json: () => Promise.resolve(mockJSON),
        });
    });

    Network.getFromURLString('http://fake/fake.html')
        .catch((err) => {
            expect(err.status).toBe(404);
            expect(err.message).toBe('Not Found');
        });
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
        expect(requestLog[0].body).toBe(JSON.stringify(credentials));
        expect(response).toBe('');
    } finally {
        server.remove();
    }
});