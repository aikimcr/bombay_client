import React from 'react';
import { render, screen } from '@testing-library/react';

import { ClearButton } from '.';

it('should show a simple labeled input', () => {
  const clickHandler = jest.fn();

  const { asFragment } = render(<ClearButton onClick={clickHandler} />);

  expect(asFragment).toMatchSnapshot();
});

it('should call the click handler', () => {
  const clickHandler = jest.fn();

  render(<ClearButton onClick={clickHandler} />);

  expect(clickHandler).not.toHaveBeenCalled();

  const button = screen.getByTestId('clear-button');
  button.click();

  expect(clickHandler).toHaveBeenCalledTimes(1);
});
