const ORIGINAL_ENV = process.env;

const testToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGREM4MTEzOCIsInVzZXIiOnsiaWQiOjEsIm5hbWUiOiJhZG1pbiIsImFkbWluIjpmYWxzZX0sImlhdCI6MTY2NTk2NTA5OX0.2vz14X7Tm-oFlyOa7dcAF-5y5ympi_UlWyJNxO4xyS4';

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
    mockText = JSON.stringify(mockJSON);
  }

  // @ts-expect-error Fetch is complicated to mock out completely.  Probably should look into using msw.
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

const testEnvValues = [
  {
    CLIENT_ROUTER_BASE: '/bombay_client',
    SERVER: 'https://www.mriehle.com',
    SERVER_BASE_PATH: '/bombay_server',
    NODE_ENV: 'production',
  },
  {
    CLIENT_ROUTER_BASE: '/',
    SERVER: 'http://localhost:2001',
    SERVER_BASE_PATH: 'default',
    NODE_ENV: 'development',
  },
];

describe.each(testEnvValues)(
  'utilities [$SERVER/$SERVER_BASE_PATH, $CLIENT_ROUTER_BASE, $NODE_ENV]',
  (testEnv: Record<string, string>) => {
    let Network: typeof import('./Network');

    beforeAll(async () => {
      jest.resetModules();
      process.env = {
        ...ORIGINAL_ENV,
        ...testEnv,
      };

      Network = await import('./Network');
    });

    afterAll(() => {
      process.env = ORIGINAL_ENV;
    });

    it('Should normalize the paths correctly', () => {
      let normalPath = Network.normalizeAndJoinPath();
      expect(normalPath).toEqual('/');

      normalPath = Network.normalizeAndJoinPath('foo', 'fum');
      expect(normalPath).toEqual('/foo/fum');

      normalPath = Network.normalizeAndJoinPath('/professor', 'rabbit');
      expect(normalPath).toEqual('/professor/rabbit');

      normalPath = Network.normalizeAndJoinPath('/', 'rabbi');
      expect(normalPath).toEqual('/rabbi');

      normalPath = Network.normalizeAndJoinPath('golem', '/');
      expect(normalPath).toEqual('/golem/');

      normalPath = Network.normalizeAndJoinPath(
        '/giraffe/',
        '/armadillo',
        'gorilla/',
        'skunk',
      );
      expect(normalPath).toEqual('/giraffe/armadillo/gorilla/skunk');
    });

    it('default values should be set', async () => {
      const { defaultAPIServer, defaultAPIBasePath } = Network;
      expect(defaultAPIServer).toEqual(testEnv.SERVER);
      expect(defaultAPIBasePath).toEqual(testEnv.SERVER_BASE_PATH);
    });

    const getTestBasePath = (withSlash = true) => {
      if (Network.defaultAPIBasePath === 'default') {
        return withSlash ? '/' : '';
      }

      return Network.defaultAPIBasePath;
    };

    it('Should generate a valid url', () => {
      expect(Network.buildURL().toString()).toEqual(
        `${Network.defaultAPIServer}${getTestBasePath()}`,
      );

      expect(
        Network.buildURL({ applicationPaths: ['/foobar'] }).toString(),
      ).toEqual(`${Network.defaultAPIServer}${getTestBasePath(false)}/foobar`);

      expect(
        Network.buildURL({ applicationPaths: ['/foobar', 'glorp'] }).toString(),
      ).toEqual(
        `${Network.defaultAPIServer}${getTestBasePath(false)}/foobar/glorp`,
      );

      expect(
        Network.buildURL({ applicationPaths: ['login'] }).toString(),
      ).toEqual(`${Network.defaultAPIServer}${getTestBasePath(false)}/login`);
    });

    it('should generate a valid url with a query', () => {
      expect(Network.prepareURLFromArgs().toString()).toEqual(
        `${Network.defaultAPIServer}${getTestBasePath()}`,
      );

      expect(Network.prepareURLFromArgs([], { offset: 10 }).toString()).toEqual(
        `${Network.defaultAPIServer}${getTestBasePath()}?offset=10`,
      );

      expect(Network.prepareURLFromArgs(['foobar']).toString()).toEqual(
        `${Network.defaultAPIServer}${getTestBasePath(false)}/foobar`,
      );

      expect(
        Network.prepareURLFromArgs(['foobar'], { offset: 10 }).toString(),
      ).toEqual(
        `${Network.defaultAPIServer}${getTestBasePath(false)}/foobar?offset=10`,
      );
    });
  },
);

describe('include the auth header', function () {
  let Network: typeof import('./Network');

  beforeAll(async () => {
    jest.resetModules();
    process.env = {
      ...ORIGINAL_ENV,
      ...testEnvValues[1],
    };

    Network = await import('./Network');
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  beforeEach(() => {
    localStorage.setItem('jwttoken', testToken);
  });

  afterEach(() => {
    localStorage.removeItem('jwttoken');
  });

  it('should retrieve the url', async () => {
    mockJSON = {
      id: 109,
      name: 'xyzzy',
      description: 'Plover',
    };
    mockFetch();

    const requestUrl = Network.buildURL({
      applicationPaths: [Network.defaultAPIBasePath, 'table', '1'],
    });
    const data = await Network.getFromURLString(requestUrl.toString());
    expect(data).toEqual(mockJSON);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(requestUrl.toString(), {
      mode: 'cors',
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${testToken}`,
      },
    });
  });

  it('should get the 404', async () => {
    mockOk = false;
    mockStatus = 404;
    mockStatusText = 'Not Found';

    mockFetch();

    Network.getFromURLString('http://fake/fake.html').catch((err) => {
      expect(err.status).toBe(404);
      expect(err.message).toBe('Not Found');
    });
  });

  it('Should post the body to the URL', async () => {
    const requestUrl = Network.buildURL({
      applicationPaths: [Network.defaultAPIBasePath, 'table'],
    }).toString();
    mockJSON = {
      id: 1,
      name: 'xyzzy',
      url: `${requestUrl}/1`,
    };

    mockFetch();

    const data = await Network.postToURLString(requestUrl, {
      name: 'xyzzy',
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(requestUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${testToken}`,
      },
      body: '{"name":"xyzzy"}',
      mode: 'cors',
      credentials: 'include',
    });

    expect(data).toEqual(mockJSON);
  });

  it('Should put the body to the URL', async () => {
    const requestUrl = Network.buildURL({
      applicationPaths: [Network.defaultAPIBasePath, 'table', '1'],
    }).toString();
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

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(requestUrl, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${testToken}`,
      },
      body: '{"name":"xyzzy"}',
      mode: 'cors',
      credentials: 'include',
    });

    expect(data).toEqual(mockJSON);
  });
});

describe('do not include the auth header', function () {
  let Network: typeof import('./Network');

  beforeAll(async () => {
    jest.resetModules();
    process.env = {
      ...ORIGINAL_ENV,
      ...testEnvValues[1],
    };

    Network = await import('./Network');
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('should retrieve the url', async () => {
    mockJSON = {
      id: 109,
      name: 'xyzzy',
      description: 'Plover',
    };

    mockFetch();

    const requestUrl = Network.buildURL({
      applicationPaths: [Network.defaultAPIBasePath, 'table', '1'],
    });
    const data = await Network.getFromURLString(requestUrl.toString());
    expect(data).toEqual(mockJSON);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(requestUrl.toString(), {
      mode: 'cors',
      credentials: 'include',
      headers: {},
    });
  });

  it('should get the 404', async () => {
    mockOk = false;
    mockStatus = 404;
    mockStatusText = 'Not Found';

    mockFetch();

    Network.getFromURLString('http://fake/fake.html').catch((err) => {
      expect(err.status).toBe(404);
      expect(err.message).toBe('Not Found');
    });
  });

  it('Should post the body to the URL', async () => {
    const requestUrl = Network.buildURL({
      applicationPaths: [Network.defaultAPIBasePath, 'table'],
    }).toString();
    mockJSON = {
      id: 1,
      name: 'xyzzy',
      url: `${requestUrl}/1`,
    };

    mockFetch();

    const data = await Network.postToURLString(requestUrl, {
      name: 'xyzzy',
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(requestUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: '{"name":"xyzzy"}',
      mode: 'cors',
      credentials: 'include',
    });

    expect(data).toEqual(mockJSON);
  });

  it('Should put the body to the URL', async () => {
    const requestUrl = Network.buildURL({
      applicationPaths: [Network.defaultAPIBasePath, 'table', '1'],
    }).toString();
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

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(requestUrl, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
      },
      body: '{"name":"xyzzy"}',
      mode: 'cors',
      credentials: 'include',
    });

    expect(data).toEqual(mockJSON);
  });
});
