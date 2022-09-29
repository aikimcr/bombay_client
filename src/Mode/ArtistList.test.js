import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { act, render } from '@testing-library/react';

import * as Network from '../Network/Network';
jest.mock('../Network/Network');

import useIntersectionObserver, * as mockObserver from '../Hooks/useIntersectionObserver';
jest.mock('../Hooks/useIntersectionObserver');

import BombayLoginContext from '../Context/BombayLoginContext';
import BombayModeContext from '../Context/BombayModeContext';
import BombayUtilityContext from '../Context/BombayUtilityContext';

import ArtistList from './ArtistList';

jest.useFakeTimers();

function FakeContent(props) {
    const [loginState, setLoginState] = useState(true);
    const [modeState, setModeState] = useState('artist');

    const checkLoginState = async () => {
        setLoginState(true);
    }

    const setMode = async newMode => {
        setModeState('artist');
    }

    const utilities = {
        checkLoginState,
        setMode,
    }

    return (
        <BrowserRouter basePath="/">
            <BombayLoginContext.Provider value={loginState}>
                <BombayModeContext.Provider value={modeState}>
                    <BombayUtilityContext.Provider value={utilities}>
                        {props.children}
                    </BombayUtilityContext.Provider>
                </BombayModeContext.Provider>
            </BombayLoginContext.Provider>
        </BrowserRouter>
    );
}

afterEach(() => {
    while(mockObserver.mockObserver.observers.length > 0) {
        mockObserver.mockObserver.observers.pop();
    }
});

it('should render the list', async () => {
    const { resolve } = Network._setupMocks();
    const result = render(<FakeContent>
        <ArtistList />
    </FakeContent>);

    expect(mockObserver.mockObserver.observers.length).toBe(1);
    const observer = mockObserver.mockObserver.observers[0];

    const [fetchBody, models] = makeModels(10, {}, '/artist');

    await act(async () => {
        resolve(fetchBody);
    });

    expect(mockObserver.mockObserver.observers.length).toBe(1);

    const index = result.container;
    expect(index.childElementCount).toBe(1);

    expect(index.firstChild.className).toBe('artist-list-container');
    expect(observer.options.root.firstChild.className).toBe('artist-list-container');

    const listElement = index.firstChild.firstChild;
    expect(listElement.nextSibling).toBe(null);
    expect(listElement.className).toBe('artist-list card-list');
    expect(listElement.childElementCount).toBe(models.length);
});

it('should render the next page', async () => {
    const { resolve: resolve1 } = Network._setupMocks();
    const result = render(<FakeContent>
        <ArtistList />
    </FakeContent>);

    expect(mockObserver.mockObserver.observers.length).toBe(1);
    const observer = mockObserver.mockObserver.observers[0];

    const [fetchBody1, models1] = makeModels(10, {}, '/artist');

    await act(async () => {
        resolve1(fetchBody1);
    });

    expect(mockObserver.mockObserver.observers.length).toBe(1);
    const index = result.container;
    const listElement = index.firstChild.firstChild;
    expect(listElement.childElementCount).toBe(models1.length);

    const { resolve: resolve2 } = Network._setupMockPromise();
    const [fetchBody2, models2] = makeModels(10, {offset: 10, limit: 10}, '/artist');

    await act(async () => {
        observer._fireIntersect(listElement.lastChild);
        resolve2(fetchBody2);
    });

    expect(listElement.childElementCount).toBe(models1.length + models2.length);
});

it('should stop when it runs out of data', async () => {
    const { resolve } = Network._setupMocks();
    const result = render(<FakeContent>
        <ArtistList />
    </FakeContent>);

    expect(mockObserver.mockObserver.observers.length).toBe(1);
    const observer = mockObserver.mockObserver.observers[0];

    const [fetchBody, models] = makeModels(10, {}, '/artist');

    await act(async () => {
        resolve(fetchBody);
    });

    expect(mockObserver.mockObserver.observers.length).toBe(1);
    const index = result.container;
    const listElement = index.firstChild.firstChild;
    expect(listElement.childElementCount).toBe(models.length);

    const { reject } = Network._setupMockPromise();

    await act(async () => {
        observer._fireIntersect(listElement.lastChild);
        reject({ status: 404, message: 'Not Found' });
    });

    expect(listElement.childElementCount).toBe(models.length);
});