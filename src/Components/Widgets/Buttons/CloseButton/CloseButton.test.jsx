import React from 'react';
import { render, screen } from '@testing-library/react';

import CloseButton from './CloseButton.jsx';

jest.useFakeTimers();

it('should show a simple labeled input', async () => {
  const clickHandler = jest.fn();

  const { asFragment } = render(<CloseButton onClick={clickHandler} />);

  expect(asFragment).toMatchSnapshot();
});

it('should call the click handler', async () => {
  const clickHandler = jest.fn();

  render(<CloseButton onClick={clickHandler} />);

  expect(clickHandler).not.toHaveBeenCalled();

  const button = screen.getByTestId('close-button');
  button.click();

  expect(clickHandler).toHaveBeenCalledTimes(1);
});
