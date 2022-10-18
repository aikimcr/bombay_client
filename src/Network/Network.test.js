import * as Network from './Network';

const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGREM4MTEzOCIsInVzZXIiOnsiaWQiOjEsIm5hbWUiOiJhZG1pbiIsImFkbWluIjpmYWxzZX0sImlhdCI6MTY2NTk2NTA5OX0.2vz14X7Tm-oFlyOa7dcAF-5y5ympi_UlWyJNxO4xyS4';

let mockOk = true;
let mockStatus = 200;
let mockStatusText = 'OK';
let mockJSON = {};
let mockText = '';

beforeEach(() => {
    mockOk = true;
    mockStatus = 200;
    mockStatusText = 'OK';
    mockJSON = {};
    mockText = '';
});

function mockFetch() {
    // https://stackoverflow.com/questions/73683195/jest-fn-not-registering-mock-implementation
    //
    // For reasons that are not clear to me, this mock must be done in each test that
    // uses it.  I tried doing it outside the test scope and it ignores the
    // mockImplementation.

    if (mockText === '') {
        mockText =JSON.stringify(mockJSON);
    }

    global.fetch = jest.fn(() => {
        return Promise.resolve({
            ok: mockOk,
            status: mockStatus,
            statusText: mockStatusText,
            json: () => Promise.resolve(mockJSON),
            text: () => Promise.resolve(mockText),
        });
    });


}

describe('utilities', function () {
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
        
        newUrl = Network.buildURL({ protocol: 'http' });
        expect(newUrl).toBe(`http://${Network.serverHost}:${Network.serverPort}/`);
        
        newUrl = Network.buildURL({ protocol: 'https' });
        expect(newUrl).toBe(`https://${Network.serverHost}:${Network.serverPort}/`);
        
        newUrl = Network.buildURL({ path: '/foobar' });
        expect(newUrl).toBe(`${Network.serverProtocol}://${Network.serverHost}:${Network.serverPort}/foobar`);
        
        newUrl = Network.buildURL({ path: [Network.serverBasePath, 'login'] });
        expect(newUrl).toBe(`${Network.serverProtocol}://${Network.serverHost}:${Network.serverPort}${Network.serverBasePath}/login`);
    });
});

describe('include the auth header', function () {
    beforeEach(() => {
        localStorage.setItem('jwttoken', testToken);
    });

    afterEach(() => {
        localStorage.removeItem('jwttoken');
    });
    
    it('should retrieve the url', async () => {
        mockJSON = { id: 109, name: 'xyzzy', description: 'Plover' };
        mockFetch();

        const requestUrl = Network.buildURL({ path: [Network.serverBasePath, 'table', '1'] });
        const data = await Network.getFromURLString(requestUrl.toString());
        expect(data).toEqual(mockJSON);
        expect(global.fetch).toBeCalledTimes(1);
        expect(global.fetch).toBeCalledWith(
            requestUrl.toString(),
            {
                mode: 'cors',
                credentials: 'include',
                headers: {
                    Authorization: `Bearer ${testToken}`,
                },
            }
        );
    });

    it('should get the 404', async () => {
        mockOk = false;
        mockStatus = 404;
        mockStatusText = 'Not Found';

        mockFetch();

        Network.getFromURLString('http://fake/fake.html')
            .catch((err) => {
                expect(err.status).toBe(404);
                expect(err.message).toBe('Not Found');
            });
    });

    it('Should post the body to the URL', async () => {
        const requestUrl = Network.buildURL({ path: [Network.serverBasePath, 'table'] });
        mockJSON = {
            id: 1,
            name: 'xyzzy',
            url: `${requestUrl}/1`,
        };

        mockFetch();

        const data = await Network.postToURLString(requestUrl, {
            name: 'xyzzy',
        });

        expect(global.fetch).toBeCalledTimes(1);
        expect(global.fetch).toBeCalledWith(
            requestUrl,
            {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    Authorization: `Bearer ${testToken}`,
                },
                body: '{"name":"xyzzy"}',
                mode: 'cors',
                credentials: 'include',
            }
        );

        expect(data).toEqual(mockJSON);
    });

    it('Should put the body to the URL', async () => {
        const requestUrl = Network.buildURL({ path: [Network.serverBasePath, 'table', '1'] });
        mockJSON = {
            id: 1,
            name: 'xyzzy',
            url: requestUrl,
        };

        mockFetch();

        const data = await Network.putToURLString(requestUrl, {
            id: 1,
            name: 'xyzzy',
            url: requestUrl,
        });

        expect(global.fetch).toBeCalledTimes(1);
        expect(global.fetch).toBeCalledWith(
            requestUrl,
            {
                method: 'PUT',
                headers: {
                    'content-type': 'application/json',
                    Authorization: `Bearer ${testToken}`,
                },
                body: '{"name":"xyzzy"}',
                mode: 'cors',
                credentials: 'include',
            }
        );

        expect(data).toEqual(mockJSON);
    });
});

describe('do not include the auth header', function () {
    it('should retrieve the url', async () => {
        mockJSON = { id: 109, name: 'xyzzy', description: 'Plover' };

        mockFetch();

        const requestUrl = Network.buildURL({ path: [Network.serverBasePath, 'table', '1'] });
        const data = await Network.getFromURLString(requestUrl.toString());
        expect(data).toEqual(mockJSON);
        expect(global.fetch).toBeCalledTimes(1);
        expect(global.fetch).toBeCalledWith(
            requestUrl.toString(),
            {
                mode: 'cors',
                credentials: 'include',
                headers: {
                },
            }
        );
    });

    it('should get the 404', async () => {
        mockOk = false;
        mockStatus = 404;
        mockStatusText = 'Not Found';

        mockFetch();

        Network.getFromURLString('http://fake/fake.html')
            .catch((err) => {
                expect(err.status).toBe(404);
                expect(err.message).toBe('Not Found');
            });
    });

    it('Should post the body to the URL', async () => {
        const requestUrl = Network.buildURL({ path: [Network.serverBasePath, 'table'] });
        mockJSON = {
            id: 1,
            name: 'xyzzy',
            url: `${requestUrl}/1`,
        };

        mockFetch();

        const data = await Network.postToURLString(requestUrl, {
            name: 'xyzzy',
        });

        expect(global.fetch).toBeCalledTimes(1);
        expect(global.fetch).toBeCalledWith(
            requestUrl,
            {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: '{"name":"xyzzy"}',
                mode: 'cors',
                credentials: 'include',
            }
        );

        expect(data).toEqual(mockJSON);
    });

    it('Should put the body to the URL', async () => {
        const requestUrl = Network.buildURL({ path: [Network.serverBasePath, 'table', '1'] });
        mockJSON = {
            id: 1,
            name: 'xyzzy',
            url: requestUrl,
        };

        mockFetch();

        const data = await Network.putToURLString(requestUrl, {
            id: 1,
            name: 'xyzzy',
            url: requestUrl,
        });

        expect(global.fetch).toBeCalledTimes(1);
        expect(global.fetch).toBeCalledWith(
            requestUrl,
            {
                method: 'PUT',
                headers: {
                    'content-type': 'application/json',
                },
                body: '{"name":"xyzzy"}',
                mode: 'cors',
                credentials: 'include',
            }
        );

        expect(data).toEqual(mockJSON);
    });
});