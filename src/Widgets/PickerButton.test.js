import { act, render } from '@testing-library/react';

import * as Network from '../Network/Network';
import * as mockObserver from '../Hooks/useIntersectionObserver';

import ModelBase from '../model/ModelBase';
import CollectionBase from '../model/CollectionBase';

class TestModel extends ModelBase { };

class TestCollection extends CollectionBase {
    constructor(options = {}) {
        super('/table1', { ...options, modelClass: TestModel });
    }
}

import PickerButton from './PickerButton';

jest.useFakeTimers();

const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJGREM4MTEzOCIsInVzZXIiOnsiaWQiOjEsIm5hbWUiOiJhZG1pbiIsImFkbWluIjpmYWxzZX0sImlhdCI6MTY2NTk2NTA5OX0.2vz14X7Tm-oFlyOa7dcAF-5y5ympi_UlWyJNxO4xyS4';

beforeEach(() => {
    localStorage.setItem('jwttoken', testToken);
})

afterEach(() => {
    while (mockObserver.mockObserver.observers.length > 0) {
        mockObserver.mockObserver.observers.pop();
    }

    localStorage.removeItem('jwttoken');
})

it('should show the button', async () => {
    const onModelPicked = jest.fn();

    const { asFragment } = render(
        <PickerButton
            modelName='table1'
            labelText='Pick A Model'
            collectionClass={TestCollection}
            onModelPicked={onModelPicked}
        />
    );

    expect(asFragment).toMatchSnapshot();

    expect(mockObserver.mockObserver.observers.length).toBe(0);
})

it('should show the list on click', async () => {
    const onModelPicked = jest.fn();

    const { resolve } = Network._setupMocks();

    const { container, queryByText } = render(
        <PickerButton
            modelName='table1'
            labelText='Pick A Model'
            collectionClass={TestCollection}
            onModelPicked={onModelPicked}
        />
    );

    let listComponent = container.querySelector('.picker-component');
    expect(listComponent).toBeNull;
    expect(mockObserver.mockObserver.observers.length).toBe(0);

    const showButton = queryByText(/Please Choose/);
    const [fetchBody] = makeModels(10, {});

    await act(async () => {
        showButton.click();
        resolve(fetchBody);
    })

    expect(mockObserver.mockObserver.observers.length).toBe(1);
    listComponent = container.querySelector('.picker-component');
    expect(listComponent).toBeInTheDocument();
})

it('should call the callback and close the list when an item is clicked', async () => {
    const onModelPicked = jest.fn();

    const { resolve } = Network._setupMocks();

    const { container, queryByText } = render(
        <PickerButton
            modelName='table1'
            labelText='Pick A Model'
            collectionClass={TestCollection}
            onModelPicked={onModelPicked}
        />
    );

    const showButton = queryByText(/Please Choose/);
    const [fetchBody, models] = makeModels(10, {});

    await act(async () => {
        showButton.click();
        resolve(fetchBody);
    })

    expect(onModelPicked).not.toBeCalled();

    expect(mockObserver.mockObserver.observers.length).toBe(1);
    const el = queryByText(models[2].get('name'));

    await act(async () => {
        el.click();
    });

    expect(onModelPicked).toBeCalled();
    expect(onModelPicked).toBeCalledWith(models[2]);
    const listComponent = container.querySelector('.picker-component');
    expect(listComponent).toBeNull;
})

it('should close the list without calling if the button is pushed again', async () => {
    const onModelPicked = jest.fn();

    const { resolve } = Network._setupMocks();

    const { container, queryByText } = render(
        <PickerButton
            modelName='table1'
            labelText='Pick A Model'
            collectionClass={TestCollection}
            onModelPicked={onModelPicked}
        />
    );

    const showButton = queryByText(/Please Choose/);
    const [fetchBody, models] = makeModels(10, {});

    await act(async () => {
        showButton.click();
        resolve(fetchBody);
    })

    expect(onModelPicked).not.toBeCalled();

    expect(mockObserver.mockObserver.observers.length).toBe(1);
    let listComponent = container.querySelector('.picker-component');
    expect(listComponent).toBeInTheDocument();

    expect(onModelPicked).not.toBeCalled();

    await act(async () => {
        showButton.click();
    })
    
    listComponent = container.querySelector('.picker-component');
    expect(listComponent).not.toBeInTheDocument();
});