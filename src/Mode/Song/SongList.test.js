import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { act, render } from '@testing-library/react';

import * as Login from '../../Network/Login';
jest.mock('../../Network/Login');

import * as Network from '../../Network/Network';
import useIntersectionObserver, * as mockObserver from '../../Hooks/useIntersectionObserver';

import BombayLoginContext from '../../Context/BombayLoginContext';
import BombayUtilityContext from '../../Context/BombayUtilityContext';

import SongList from './SongList';

jest.useFakeTimers();

function FakeContent(props) {
    const [loginState, setLoginState] = useState({ loggedIn: true, showLoginForm: false });
    const [modeState, setModeState] = useState('song');

    const checkLoginState = async () => {
        setLoginState(true);
    }

    const setMode = async newMode => {
        setModeState('song');
    }

    const getBootstrap = () => {
        return {
            keySignatures: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        };
    }

    const utilities = {
        checkLoginState,
        setMode,
        getBootstrap,
    }

    return (
        <BrowserRouter basename="/">
            <BombayLoginContext.Provider value={loginState}>
                <BombayUtilityContext.Provider value={utilities}>
                    {props.children}
                </BombayUtilityContext.Provider>
            </BombayLoginContext.Provider>
        </BrowserRouter>
    );
}

jest.useFakeTimers();

const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGREM4MTEzOCIsInVzZXIiOnsiaWQiOjEsIm5hbWUiOiJhZG1pbiIsImFkbWluIjpmYWxzZX0sImlhdCI6MTY2NTk2NTA5OX0.2vz14X7Tm-oFlyOa7dcAF-5y5ympi_UlWyJNxO4xyS4';

beforeEach(() => {
    const modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.append(modalRoot);

    localStorage.setItem('jwttoken', testToken);
})

afterEach(() => {
    const modalRoot = document.getElementById('modal-root');
    modalRoot.remove();

    while (mockObserver.mockObserver.observers.length > 0) {
        mockObserver.mockObserver.observers.pop();
    }

    localStorage.removeItem('jwttoken');
});

const mockUtility = {
    getBootstrap: () => {
        return {
            keySignatures: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        };
    }
}

const renderWrapper = ({ children }) => {
    return (
        <BombayUtilityContext.Provider value={mockUtility}>
            {children}
        </BombayUtilityContext.Provider>
    );
}

function getAreas(result) {
    expect(mockObserver.mockObserver.observers.length).toBe(1);
    const observer = mockObserver.mockObserver.observers[0];

    const index = result.container;
    expect(index.childElementCount).toEqual(1);

    const listComponent = index.firstChild;
    expect(listComponent.childElementCount).toEqual(2);

    const controls = listComponent.firstChild;
    expect(controls.className).toEqual('list-controls');
    expect(controls.childElementCount).toEqual(3);

    const listContainer = listComponent.lastChild;
    expect(listContainer).toHaveClass('song-list-container');
    expect(listContainer).toHaveClass('list-container');
    expect(listContainer.childElementCount).toEqual(1);
    expect(observer.options.root.lastChild).toHaveClass('song-list-container');

    const listElement = listContainer.firstChild;

    return [listElement, controls, observer, listContainer, index];
}

it('should render the list', async () => {
    const loginPromise = Login._setupMocks();
    loginPromise.resolve({
        loggedIn: true,
        token: testToken,
    });

    const { resolve } = Network._setupMocks();
    const result = render(<FakeContent>
        <SongList />
    </FakeContent>);

    const [fetchBody, models] = makeModels(10, {}, 'song');

    await act(async () => {
        resolve(fetchBody);
    });

    expect(mockObserver.mockObserver.observers.length).toBe(1);

    const [listElement] = getAreas(result);

    expect(listElement.nextSibling).toBe(null);
    expect(listElement.className).toBe('song-list card-list');
    expect(listElement.childElementCount).toBe(models.length);
});

it('should render the next page', async () => {
    const loginPromise = Login._setupMocks();
    loginPromise.resolve({
        loggedIn: true,
        token: testToken,
    });

    const { resolve: resolve1 } = Network._setupMocks();
    const result = render(<FakeContent>
        <SongList />
    </FakeContent>);

    const [fetchBody1, models1] = makeModels(10, {}, 'song');

    await act(async () => {
        resolve1(fetchBody1);
    });

    expect(mockObserver.mockObserver.observers.length).toBe(1);
    const [listElement, , observer] = getAreas(result);

    expect(listElement.childElementCount).toBe(models1.length);

    const { resolve: resolve2 } = Network._setupMockPromise();
    const [fetchBody2, models2] = makeModels(10, { offset: 10, limit: 10 }, 'song');

    await act(async () => {
        observer._fireIntersect(listElement.lastChild);
        resolve2(fetchBody2);
    });

    expect(listElement.childElementCount).toBe(models1.length + models2.length);
});

it('should stop when it runs out of data', async () => {
    const loginPromise = Login._setupMocks();
    loginPromise.resolve({
        loggedIn: true,
        token: testToken,
    });

    const { resolve } = Network._setupMocks();
    const result = render(<FakeContent>
        <SongList />
    </FakeContent>);

    const [fetchBody, models] = makeModels(10, {}, 'song');

    await act(async () => {
        resolve(fetchBody);
    });

    const [listElement, , observer] = getAreas(result);
    expect(listElement.childElementCount).toBe(models.length);

    const { reject } = Network._setupMockPromise();

    await act(async () => {
        observer._fireIntersect(listElement.lastChild);
        reject({ status: 404, message: 'Not Found' });
    });

    expect(listElement.childElementCount).toBe(models.length);
});

it('should add a song', async () => {
    const loginPromise = Login._setupMocks();
    loginPromise.resolve({
        loggedIn: true,
        token: testToken,
    });

    const modalRoot = document.getElementById('modal-root');

    const { resolve } = Network._setupMocks();
    const result = render(<FakeContent>
        <SongList />
    </FakeContent>);

    const [fetchBody] = makeModels(10, {}, 'song');
    const collectionUrl = Network.prepareURLFromArgs('song').toString();

    await act(async () => {
        resolve(fetchBody);
    });

    expect(mockObserver.mockObserver.observers.length).toBe(1);

    const [, controls] = getAreas(result);

    expect(modalRoot.childElementCount).toEqual(0);

    const addButton = controls.firstChild;

    act(() => {
        addButton.click();
    });

    expect(modalRoot.childElementCount).toEqual(1);

    const submitButton = modalRoot.querySelector('[type="submit"]');

    const [saveDef] = makeAModel('song');
    const artistId = saveDef.artist.id;
    await changeInput(modalRoot.querySelector('[data-targetfield="name"'), 'input', 'Herkimer', 250);
    await changeInput(modalRoot.querySelector('[data-targetfield="artist_id"'), 'input', artistId, 250);

    await act(async () => {
        submitButton.click();
    });

    resolve(saveDef);

    expect(Network.postToURLString).toBeCalledTimes(1);
    expect(Network.postToURLString).toBeCalledWith(collectionUrl, {
        name: 'Herkimer',
        artist_id: artistId,
        key_signature: '',
        tempo: null,
        lyrics: '',
    });
});