import { act, render } from '@testing-library/react';
import BombayUtilityContext from '../../Context/BombayUtilityContext';

import * as Network from '../../Network/Network';

import SongListItem from './SongListItem';

jest.useFakeTimers();

beforeEach(() => {
    const modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.append(modalRoot);
})

afterEach(() => {
    const modalRoot = document.getElementById('modal-root');
    modalRoot.remove();
});

const mockUtility = {
    getBootstrap: () => {
        return {
            keySignatures: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        };
    }
}

const renderWrapper = ({children}) => {
    return (
        <BombayUtilityContext.Provider value={mockUtility}>
            {children}
        </BombayUtilityContext.Provider>
    );
}

function getAreas(result) {
    const index = result.container;
    expect(index.childElementCount).toEqual(1);

    const listElement = index.firstChild;
    expect(listElement.tagName).toEqual('LI');
    expect(listElement).toHaveClass('card');
    expect(listElement.childElementCount).toEqual(3);

    const headerElement = listElement.firstChild;
    expect(headerElement).toHaveClass('header');
    expect(headerElement).toHaveTextContent('Song');
    expect(headerElement.childElementCount).toEqual(0);

    const nameElement = listElement.children[1];
    expect(nameElement).toHaveClass('name');

    const detailsElement = listElement.lastChild;
    expect(detailsElement).toHaveClass('details');
    expect(detailsElement.childElementCount).toBe(8);

    return [detailsElement, nameElement, headerElement, listElement, index];
}

it ('should render a list item', async () => {
    const [ modelDef, model ] = makeAModel('song');
    const result = render(<SongListItem song={model} />, {wrapper: renderWrapper});
    const [detailsElement, nameElement] = getAreas(result);

    expect(nameElement).toHaveTextContent(modelDef.name);

    expect(detailsElement.children[1]).toHaveTextContent(modelDef.artist.name);
    expect(detailsElement.children[3]).toHaveTextContent(modelDef.key_signature);
    expect(detailsElement.children[5]).toHaveTextContent(modelDef.tempo);
    expect(detailsElement.children[7]).toHaveTextContent(modelDef.lyrics);
});

it('should open the editor modal', async () => {
    const [modelDef, model] = makeAModel('song');

    const result = render(<SongListItem song={model} />, {wrapper: renderWrapper});

    const index = result.container;

    await act(async () => {
        index.firstChild.click();
    });

    const modalRoot = document.getElementById('modal-root');
    expect(modalRoot.childElementCount).toEqual(1);
});

it('should save changes to the model', async () => {
    const [mockPromise, mockResolve] = makeResolvablePromise();
    // The mock is not recognized unless it is done this way.
    Network.putToURLString = jest.fn((url, body) => {
        return mockPromise;
    });

    const [modelDef, model] = makeAModel('song');
    const songModelDef = {...modelDef};
    delete songModelDef.artist;

    const result = render(<SongListItem song={model} />, { wrapper: renderWrapper });

    const index = result.container;

    await act(async () => {
        index.firstChild.click();
    });

    const modalRoot = document.getElementById('modal-root');
    expect(modalRoot.childElementCount).toEqual(1);

    const submitButton = modalRoot.querySelector('[type="submit"]');

    await changeInput(modalRoot.querySelector('[data-targetfield="name"'), 'input', 'Herkimer', 250);

    act(() => {
        submitButton.click();
    });

    await act(async () => {
        mockResolve({...modelDef, name: 'Herkimer'});
    });

    expect(Network.putToURLString).toBeCalledTimes(1);
    expect(Network.putToURLString).toBeCalledWith(modelDef.url, { ...songModelDef, name: 'Herkimer' });
});