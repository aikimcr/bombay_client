import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { TextAreaInput } from './TextAreaInput.jsx';

jest.useFakeTimers();

const testText = `kdjf xfker xje
fkdj3 xkke jdk
xyxxa keke ppp
foo fie fum row`;

it('Component should match snapshot', () => {
  const { asFragment } = render(
    <TextAreaInput
      id="xyzzy"
      name="plover"
      rows={10}
      cols={20}
      defaultValue={testText}
    />,
  );

  expect(asFragment).toMatchSnapshot();
});

it('should set the default value to the field value', () => {
  const result = render(
    <TextAreaInput
      id="xyzzy"
      name="plover"
      rows={10}
      cols={20}
      defaultValue={testText}
    />,
  );

  const textarea = screen.getByTestId('textarea-input');
  expect(textarea.defaultValue).toBe(testText);
});

it('should call onChange', () => {
  const changeHandler = jest.fn();

  const result = render(
    <TextAreaInput
      id="xyzzy"
      name="plover"
      rows={10}
      cols={20}
      defaultValue={testText}
      onChange={changeHandler}
    />,
  );

  const textarea = screen.getByTestId('textarea-input');

  act(() => {
    fireEvent.change(textarea, { target: { value: 'bird' } });
  });

  expect(textarea.value).toEqual('bird');
  expect(changeHandler).not.toHaveBeenCalled();

  act(() => {
    jest.advanceTimersByTime(500);
  });

  expect(changeHandler).toHaveBeenCalledTimes(1);
  expect(changeHandler).toHaveBeenCalledWith('bird');
});
