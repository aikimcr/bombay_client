import { useEffect, useRef, useState } from 'react';
import { act, render } from '@testing-library/react';

// The order of these mocks matters.  Login *must* come before network.
import * as NetworkLogin from '../Network/Login';
jest.mock('../Network/Login');

import * as Network from '../Network/Network';
jest.mock('../Network/Network');

import useIntersectionObserver, * as mockObserver from './useIntersectionObserver';
jest.mock('./useIntersectionObserver');

import jwt_decode from 'jwt-decode';
jest.mock('jwt-decode');

import ModelBase from '../Model/ModelBase';
import CollectionBase from '../Model/CollectionBase';

class TestModel extends ModelBase {};
class TestCollection extends CollectionBase {
    constructor(options = {}) {
        super('/testTable', { ...options, modelClass: TestModel });
    }
};

import useModelCollection from './useModelCollection';

let testRef;
let testCollection;
let testSetLoggedIn;

function TestApp({ loggedIn, showLoginForm }) {
    const [loginState, setLoginState] = useState({ loggedIn, showLoginForm });

    testSetLoggedIn = (isLoggedIn) => {
        setLoginState(oldState => { return {...oldState, loggedIn: isLoggedIn}; });
    }

    const topRef = useRef();
    const [collection] = useModelCollection({
        CollectionClass: TestCollection,
        topRef,
        loginState,
    });

    useEffect(() => {
        testRef = topRef;
    }, [topRef]);

    useEffect(() => {
        testCollection = collection;
    }, [collection]);

    return (
        <div ref={topRef}>
            {collection?.current == null ? '' : collection.current.map(model => {
                const key = `collection-${model.get('id')}`;
                return <div key={key} model={model}>model.get('name')</div>
            })}
        </div>
    )
}

jest.useFakeTimers();

function setupLogin(loggedIn = true, token = 'xyzzy') {
    const loginPromise = NetworkLogin._setupMocks();
    loginPromise.resolve({ loggedIn, token });
}

afterEach(() => {
    while (mockObserver.mockObserver.observers.length > 0) {
        mockObserver.mockObserver.observers.pop();
    }
});

it('should get the collection and start loading', async () => {
    setupLogin();
    const { resolve } = Network._setupMocks();
    render(<TestApp loggedIn={true} showLoginForm={false} />);

    const [fetchBody, models] = makeModels(10, {}, 'testTable');

    await act(async () => {
        resolve(fetchBody);
    });

    expect(mockObserver.mockObserver.observers.length).toBe(1);
    expect(testCollection.current.models()).toEqual(models);
})

it('should get the next page', async () => {
    setupLogin();
    let networkPromise = Network._setupMocks();
    render(<TestApp loggedIn={true} showLoginForm={false} />);

    const fetchBody = [];
    const models = [];

    [fetchBody[0], models[0]] = makeModels(10, {}, 'testTable');

    await act(async () => {
        networkPromise.resolve(fetchBody[0]);
    });

    expect(mockObserver.mockObserver.observers.length).toBe(1);
    expect(testCollection.current.models()).toEqual(models[0]);

    networkPromise = Network._setupMockPromise();
    [fetchBody[1], models[1]] = makeModels(10, {offset: 10, limit: 10}, 'testTable');

    const observer = mockObserver.mockObserver.observers[0];

    await act(async () => {
        observer._fireIntersect(testRef.current.lastChild);
        networkPromise.resolve(fetchBody[1]);
    });

    expect(testCollection.current.models()).toEqual([...models[0], ...models[1]]);
})

it('should stop when it runs out of data', async () => {
    setupLogin();
    let networkPromise = Network._setupMocks();
    render(<TestApp loggedIn={true} showLoginForm={false} />);

    const fetchBody = [];
    const models = [];

    [fetchBody[0], models[0]] = makeModels(10, {}, 'testTable');

    await act(async () => {
        networkPromise.resolve(fetchBody[0]);
    });

    expect(mockObserver.mockObserver.observers.length).toBe(1);
    expect(testCollection.current.models()).toEqual(models[0]);

    networkPromise = Network._setupMockPromise();

    const observer = mockObserver.mockObserver.observers[0];

    await act(async () => {
        observer._fireIntersect(testRef.current.lastChild);
        networkPromise.reject({ status: 404, message: 'Not Found' });
    });

    expect(testCollection.current.models()).toEqual(models[0]);
});

it('should return a null collection when not logged in', async () => {
    render(<TestApp loggedIn={false} showLoginForm={false} />);

    expect(mockObserver.mockObserver.observers.length).toBe(1);
    expect(testCollection.current).toBeNull();
});

it('should load the collection on login', async () => {
    setupLogin();
    render(<TestApp loggedIn={false} showLoginForm={false} />);

    expect(mockObserver.mockObserver.observers.length).toBe(1);
    expect(testCollection.current).toBeNull();

    const { resolve } = Network._setupMocks();

    await act(async () => {
        testSetLoggedIn(true);
    });

    const [fetchBody, models] = makeModels(10, {}, 'testTable');

    await act(async () => {
        resolve(fetchBody);
    });

    expect(mockObserver.mockObserver.observers.length).toBe(1);
    expect(testCollection.current.models()).toEqual(models);
});
