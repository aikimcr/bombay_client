// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import casual from 'casual';

import { useState } from 'react';
import BombayLoginContext from './Context/BombayLoginContext';
import BombayModeContext from './Context/BombayModeContext';

import { buildURL, prepareURLFromArgs } from './Network/Network';

import ModelBase from './Model/ModelBase';
import ArtistModel from './Model/ArtistModel';

globalThis.makeResolvablePromise = function() {
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
    const [loginState, setLoginState] = useState(props.loginState);
    const [modeState, setModeState] = useState(props.modeState);

    function toggleLogin() {
        setLoginState(!loginState);
    }

    function updateModeState(evt) {
        setModeState(evt.currentTarget.value);
    }

    return (
        <BombayLoginContext.Provider value={loginState}>
            <BombayModeContext.Provider value={modeState}>
                {props.children}
                <button className="change-test-login" onClick={toggleLogin}>Change Login</button>
                <input className="change-test-mode" type='text' onChange={updateModeState} />
            </BombayModeContext.Provider>
        </BombayLoginContext.Provider>
    );
}

globalThis.toggleLogin = function () {
    const changeButton = document.querySelector('.change-test-login');
    userEvent.click(changeButton);
}

globalThis.changeInput = async function(root, selector, newValue, timerAdvance = -1) {
    const inputField = root.querySelector(`input${selector}`);
    // const changeEvent = new Event('change');
    // inputField.value = newValue;
    fireEvent.change(inputField, {target: {value: newValue}});
    // inputField.dispatchEvent(changeEvent);

    if (timerAdvance >= 0) {
        await act(async function () {
            jest.advanceTimersByTime(timerAdvance);
        });
    }

    return inputField;
}

globalThis.verifyClassList = function (element, includeClassList=[], excludeClassList=[]) {
    includeClassList.forEach(classname => {
        expect(element.classList).toContain(classname);
    });

    excludeClassList.forEach(classname => {
        expect(element.classList).not.toContain(classname);
    });
}

globalThis.nextTick = function() {
    return new Promise((resolve, reject) => {
        const timeoutHandle = setTimeout(() => {
            resolve();
            clearTimeout(timeoutHandle);
        }, 0);
    });
}

const allNames = {};
casual.define('uniqueName', function(nameType, clear) {
    if (!allNames[nameType]) allNames[nameType] = new Set();

    const oldSize = allNames[nameType].size;
    let newName;

    while(allNames[nameType].size === oldSize) {
        newName = casual.full_name;
        allNames[nameType].add(newName);
    }

    return newName;
});

const idSequences = {};
casual.define('nextId', function(sequenceName) {
    const nextOne = (idSequences[sequenceName] ?? 0) + 1;
    idSequences[sequenceName] = nextOne;
    return nextOne;
});

globalThis.makeAnArtist = function(id) {
    id = id ?? casual.nextId('artist');
    const name = casual.uniqueName('artist');
    const url = buildURL({path: `/artist/${id}`});

    return { id, name, url };
}

globalThis.makeArtistList = function(length = 10, query={}) {
    const result = {
        data: [],
    };

    while (result.data.length < length) {
        result.data.push(makeAnArtist());
    }

    let offset = (query.offset || 0) - length;
    let limit = query.limit || length;

    if (offset >= 0) {
        result.prevPage = prepareURLFromArgs('/artist', { offset, limit }).toString();
    }

    if (limit <= length) {
        offset = (query.offset || 0) + length;
        result.nextPage = prepareURLFromArgs('/artist', { offset, limit}).toString();
    }

    return result;
}

globalThis.makeAModel = function(tableName = '/table1') {
    const def = {};
    def.id = casual.nextId(tableName);
    let modelClass = ModelBase;

    switch (tableName) {
        case '/artist':
            modelClass = ArtistModel;
        default:
            def.name = casual.uniqueName(tableName);
    }

    def.url = buildURL({ path: `/${tableName}/${def.id}` });
    return [def, modelClass.from(def)];
}

globalThis.makeModels = function(length = 10, query = {}, tableName = '/table1') {
    const result = {
        data: [],
    };

    const models = [];

    while (result.data.length < length) {
        const [def, model] = makeAModel(tableName);
        result.data.push(def);
        models.push(model);
    }

    let offset = (query.offset || 0) - length;
    let limit = query.limit || length;

    if (offset >= 0) {
        result.prevPage = prepareURLFromArgs(tableName, { offset, limit }).toString();
    }

    if (limit <= length) {
        offset = (query.offset || 0) + length;
        result.nextPage = prepareURLFromArgs(tableName, { offset, limit }).toString();
    }

    expect(JSON.stringify(result.data)).toStrictEqual(JSON.stringify(models));

    return [result, models];
}
