import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { SelectInput } from './SelectInput';

jest.useFakeTimers();

const options = [
  {
    value: 'bird',
  },
  {
    value: 'plane',
  },
  {
    value: 'jet',
  },
  {
    value: 'rocket',
  },
  {
    value: 'bat',
  },
];

it('Component should match snapshot', () => {
  const { asFragment } = render(
    <SelectInput
      modelName="xyzzy"
      fieldName="plover"
      labelText="plugh"
      options={options}
    />,
  );

  expect(asFragment).toMatchSnapshot();
});

it('should set the default value to the field value', () => {
  const model = {
    get: jest.fn((fieldName) => {
      return 'bird';
    }),
  };

  const result = render(
    <SelectInput
      name="plover"
      options={options}
      model={model}
      defaultValue="bird"
    />,
  );

  const selectInput = screen.getByTestId('select-input-select');
  expect(selectInput.value).toEqual('bird');
});

it('should call onChange', () => {
  const changeHandler = jest.fn();

  const result = render(
    <SelectInput
      name="plover"
      options={options}
      onChange={changeHandler}
      defaultValue="jet"
    />,
  );

  const selectInput = screen.getByTestId('select-input-select');

  act(() => {
    fireEvent.change(selectInput, { target: { value: 'bat' } });
  });

  expect(changeHandler.mock.calls.length).toBe(1);
  expect(changeHandler.mock.calls[0].length).toBe(1);
});
