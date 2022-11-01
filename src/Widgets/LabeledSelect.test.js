import { render } from '@testing-library/react';

import LabeledSelect from './LabeledSelect';

jest.useFakeTimers();

const options = [{
    value: 'bird',
}, {
    value: 'plane',
}, {
    value: 'jet',
}, {
    value: 'rocket',
}, {
    value: 'bat'
}];


it('should show a simple labeled select', async () => {
    const { asFragment } = render(
        <LabeledSelect
            modelName='xyzzy'
            fieldName='plover'
            labelText='plugh'
            options={options}
        />
    )

    expect(asFragment).toMatchSnapshot();
});

it('should set the default value to the field value', async () => {
    const model = {
        get: jest.fn((fieldName) => { return 'bird'; }),
    }

    const result = render(
        <LabeledSelect
            modelName='xyzzy'
            fieldName='plover'
            labelText='plugh'
            options={options}
            model={model}
        />
    );

    const component = result.container.firstChild;
    const select = component.lastChild;
    expect(select.value).toEqual('bird');
});

it('should call onChange', async () => {
    const changeHandler = jest.fn();

    const result = render(
        <LabeledSelect
            modelName='xyzzy'
            fieldName='plover'
            labelText='plugh'
            options={options}
            onChange={changeHandler}
        />
    );

    const component = result.container.firstChild;

    await changeInput(component, 'select', 'bird', 250);

    expect(changeHandler.mock.calls.length).toBe(1);
    expect(changeHandler.mock.calls[0].length).toBe(1);
});
