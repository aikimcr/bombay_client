// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import casual from 'casual';

import { useState } from 'react';

import * as Network from './Network/Network';
jest.mock('./Network/Network');

import useIntersectionObserver, * as mockObserver from './Hooks/useIntersectionObserver';
jest.mock('./Hooks/useIntersectionObserver');

import BombayLoginContext from './Context/BombayLoginContext';

import ModelBase from './Model/ModelBase';
import ArtistModel from './Model/ArtistModel';
import SongModel from './Model/SongModel';

globalThis.makeResolvablePromise = function () {
    let resolver;
    let rejecter;
    let promise = new Promise((resolve, reject) => {
        resolver = resolve;
        rejecter = reject;
    });

    return [promise, resolver, rejecter];
}

// Use this to turn the crank on context changes.
globalThis.ContextChanger = function (props) {
    const [loginState, setLoginState] = useState(props.loggedIn);
    const [showLoginForm, setShowLoginForm] = useState(props.showLoginForm);

    const loginContext = {
        loggedIn: loginState,
        showLoginForm: showLoginForm,
        setLoggedIn: newLoggedIn => {
            if (newLoggedIn) {
                setShowLoginForm(false);
            }

            setLoginState(newLoggedIn);
        },

        setShowLogin: newShow => {
            if (loginState) return;
            setShowLoginForm(newShow);
        },
    }

    function toggleLogin() {
        loginContext.setLoggedIn(!loginState);
    }

    return (
        <BombayLoginContext.Provider value={loginContext}>
            {props.children}
            {showLoginForm ? <div>Showing Log In Form</div> : null}
            <button className="change-test-login" onClick={toggleLogin}>Change Login</button>
        </BombayLoginContext.Provider>
    );
}

globalThis.toggleLogin = function () {
    const changeButton = document.querySelector('.change-test-login');
    userEvent.click(changeButton);
}

globalThis.changeInput = async function (root, selector, newValue, timerAdvance = -1) {
    const inputField = selector ? root.querySelector(selector) : root;
    fireEvent.change(inputField, { target: { value: newValue } });

    if (timerAdvance >= 0) {
        await act(async function () {
            jest.advanceTimersByTime(timerAdvance);
        });
    }

    return inputField;
}

const allNames = {};
casual.define('uniqueName', function (nameType, clear) {
    if (!allNames[nameType]) allNames[nameType] = new Set();

    const oldSize = allNames[nameType].size;
    let newName;

    while (allNames[nameType].size === oldSize) {
        newName = casual.full_name;
        allNames[nameType].add(newName);
    }

    return newName;
});

const idSequences = {};
casual.define('nextId', function (sequenceName) {
    const nextOne = (idSequences[sequenceName] ?? 0) + 1;
    idSequences[sequenceName] = nextOne;
    return nextOne;
});

globalThis.makeAModel = function (tableName = 'table1', fieldsCallback) {
    const def = {};
    def.id = casual.nextId(tableName);
    def.name = casual.uniqueName(tableName);

    if (fieldsCallback) {
        fieldsCallback(def);
    }

    let modelClass = ModelBase;

    switch (tableName) {
        case 'artist':
            modelClass = ArtistModel;
            break;

        case 'song':
            modelClass = SongModel;
            def.key_signature = 'C';
            def.tempo = 120;
            def.lyrics = 'O Solo Mio! The troubles I have seen';
            const [artist] = makeAModel('artist');
            def.artist_id = artist.id;
            def.artist = artist;
            break;

        default:
    }

    def.url = Network.buildURL({ path: `/${tableName}/${def.id}` });
    return [def, modelClass.from(def)];
}

globalThis.makeModels = function (length = 10, query = {}, tableName = 'table1', fieldsCallback) {
    const result = {
        data: [],
    };

    const models = [];

    while (result.data.length < length) {
        const [def, model] = makeAModel(tableName, fieldsCallback);
        result.data.push(def);
        models.push(model);
    }

    let offset = (query.offset || 0) - length;
    let limit = query.limit || length;

    if (offset >= 0) {
        result.prevPage = Network.prepareURLFromArgs(tableName, { offset, limit }).toString();
    }

    if (limit <= length) {
        offset = (query.offset || 0) + length;
        result.nextPage = Network.prepareURLFromArgs(tableName, { offset, limit }).toString();
    }

    return [result, models];
}
