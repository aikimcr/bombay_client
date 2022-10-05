import { act, render } from '@testing-library/react';

import LabeledInput from './LabeledInput';

jest.useFakeTimers();

it('should show a simple labeled input', async () => {
    const result = render(<LabeledInput modelName='xyzzy' fieldName='plover' labelText='plugh' />)

    const component = result.container.firstChild;

    expect(component.className).toBe('labeled-input');
    expect(component.dataset.modelname).toBe('xyzzy');
    expect(component.dataset.fieldname).toBe('plover');
    expect(component.childElementCount).toBe(2);
    
    const label = component.firstChild;
    expect(label.tagName).toBe('LABEL');
    expect(label.attributes.getNamedItem('for').value).toBe(`xyzzy-isNew-${Date.now()}`);
    expect(label.textContent).toBe('plugh');

    const input = component.lastChild;
    expect(input.tagName).toBe('INPUT');
    expect(input.id).toBe(`xyzzy-isNew-${Date.now()}`);
    expect(input.type).toBe('text');
    expect(input.defaultValue).toBe('');
});

it('should set the default value to the field value', async () => {
    const model = {
        get: jest.fn((fieldName) => { return 'bird'; }),
    }

    const result = render(
        <LabeledInput
            modelName='xyzzy'
            fieldName='plover'
            labelText='plugh'
            model={model}
        />
    );

    const component = result.container.firstChild;
    const input = component.lastChild;
    expect(input.defaultValue).toBe('bird');
});

it('should hide and show passwords', async () => {
    const result = render(
        <LabeledInput
            modelName='login'
            fieldName='password'
            labelText='Secret!'
            type='password'
        />
    );

    const component = result.container.firstChild;
    expect(component.childElementCount).toBe(3);

    const input = component.children[1];
    expect(input.type).toBe('password');

    const toggle = component.lastChild;
    expect(toggle.tagName).toBe('INPUT');
    expect(toggle.type).toBe('button');
    expect(toggle.className).toBe('toggle');
    expect(toggle.dataset.hidden).toBe('true');

    toggle.click();
    expect(input.type).toBe('text');
    expect(toggle.dataset.hidden).toBe('false');

    toggle.click();
    expect(input.type).toBe('password');
    expect(toggle.dataset.hidden).toBe('true');
});

it('should call onChange', async () => {
    const changeHandler = jest.fn();

    const result = render(
        <LabeledInput
            modelName='xyzzy'
            fieldName='plover'
            labelText='plugh'
            onChange={changeHandler}
        />
    );

    const component = result.container.firstChild;

    const input = component.lastChild;
    await changeInput(component, '', 'bird', 250);

    expect(changeHandler.mock.calls.length).toBe(1);
    expect(changeHandler.mock.calls[0].length).toBe(1);
});
