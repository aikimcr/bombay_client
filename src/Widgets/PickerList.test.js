import { act, render } from '@testing-library/react';

import * as Network from '../Network/Network';
jest.mock('../Network/Network');

import useIntersectionObserver, * as mockObserver from '../Hooks/useIntersectionObserver';
jest.mock('../Hooks/useIntersectionObserver');

import ModelBase from '../model/ModelBase';
import CollectionBase from '../model/CollectionBase';

class TestModel extends ModelBase{};

class TestCollection extends CollectionBase {
    constructor(options={}) {
        super('/table1', {...options, modelClass: TestModel});
    }
}

import PickerList from './PickerList';

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

it('should show the list', async () => {
    const pickModel = jest.fn();
    
    const { resolve } = Network._setupMocks();

    const  { asFragment } = render(
        <PickerList
            pickModel={pickModel}
            isOpen={true}
            collectionClass={TestCollection}
        />
    );

    const [fetchBody] = makeModels(10, {});

    await act(async () => {
        resolve(fetchBody);
    });

    expect(asFragment).toMatchSnapshot();

    expect(mockObserver.mockObserver.observers.length).toBe(1);
    expect(Network.getFromURLString).toBeCalledTimes(1);
    expect(Network.getFromURLString).toBeCalledWith('http://localhost:2001/xyzzy/table1');
    expect(Network.getFromURLString.mock.results[0].value).resolves.toEqual(fetchBody);

    const listElements = asFragment().querySelectorAll('li.picker-item');
    expect(listElements).toHaveLength(10);
});

it('should be an empty component', async () => {
    const pickModel = jest.fn();

    const { container } = render(
        <PickerList
            pickModel={pickModel}
            isOpen={false}
            collectionClass={TestCollection}
        />
    );

    expect(container).toBeEmptyDOMElement()
});

it('should show the next page', async () => {
    const pickModel = jest.fn();

    const { resolve } = Network._setupMocks();

    const { asFragment } = render(
        <PickerList
            pickModel={pickModel}
            isOpen={true}
            collectionClass={TestCollection}
        />
    );

    const [fetchBody] = makeModels(10, {});

    await act(async () => {
        resolve(fetchBody);
    });

    expect(mockObserver.mockObserver.observers.length).toBe(1);
    expect(Network.getFromURLString).toBeCalledTimes(1);
    expect(Network.getFromURLString).toBeCalledWith('http://localhost:2001/xyzzy/table1');
    expect(Network.getFromURLString.mock.results[0].value).resolves.toEqual(fetchBody);

    const { resolve: resolve2, reject, promise } = Network._setupMockPromise();

    const [fetchBody2] = makeModels(10, {offset: 10, limit: 10});
    const lastItem = asFragment().querySelector('li.picker-item:last-child');
    const observer = mockObserver.mockObserver.observers[0];

    await act(async () => {
        observer._fireIntersect(lastItem);
        resolve2(fetchBody2);
    });

    expect(mockObserver.mockObserver.observers.length).toBe(1);
    expect(Network.getFromURLString).toBeCalledTimes(2);
    expect(Network.getFromURLString).toHaveBeenLastCalledWith('http://localhost:2001/xyzzy/table1?offset=10&limit=10');
    expect(Network.getFromURLString.mock.results[1].value).resolves.toEqual(fetchBody2);

    const listElements = asFragment().querySelectorAll('li.picker-item');
    expect(listElements).toHaveLength(20);
}, 300000);

it('should call the callback when an item is clicked', async () => {
    const pickModel = jest.fn();

    const { resolve } = Network._setupMocks();

    const { container, queryByText } = render(
        <PickerList
            pickModel={pickModel}
            isOpen={true}
            collectionClass={TestCollection}
        />
    );

    const [fetchBody, models] = makeModels(10, {});

    await act(async () => {
        resolve(fetchBody);
    });

    expect(pickModel).not.toBeCalled();

    const el = queryByText(models[1].get('name'));
    el.click();

    expect(pickModel).toBeCalled();
    expect(pickModel).toBeCalledWith(models[1]);
});
