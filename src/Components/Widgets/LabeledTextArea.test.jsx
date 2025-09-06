import { render } from '@testing-library/react';

import LabeledTextArea from './LabeledTextArea.jsx';

jest.useFakeTimers();

it('should show a simple labeled input', async () => {
  const { asFragment } = render(
    <LabeledTextArea modelName="xyzzy" fieldName="plover" labelText="plugh" />,
  );

  expect(asFragment).toMatchSnapshot();
});

it('should set the default value to the field value', async () => {
  const model = {
    get: jest.fn((fieldName) => {
      return 'bird';
    }),
  };

  const result = render(
    <LabeledTextArea
      modelName="xyzzy"
      fieldName="plover"
      labelText="plugh"
      model={model}
    />,
  );

  const component = result.container.firstChild;
  const input = component.lastChild;
  expect(input.defaultValue).toBe('bird');
});

it('should call onChange', async () => {
  const changeHandler = jest.fn();

  const result = render(
    <LabeledTextArea
      modelName="xyzzy"
      fieldName="plover"
      labelText="plugh"
      onChange={changeHandler}
    />,
  );

  const component = result.container.firstChild;

  const input = component.lastChild;
  await changeInput(component, 'textarea', 'bird', 250);

  expect(changeHandler.mock.calls.length).toBe(1);
  expect(changeHandler.mock.calls[0].length).toBe(1);
});
