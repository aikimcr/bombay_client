import { act, render, screen } from '@testing-library/react';

import CloseOrClear from './CloseOrClear.jsx';

jest.useFakeTimers();

it('should show a simple labeled input', async () => {
  const clickHandler = jest.fn();

  const { asFragment } = render(<CloseOrClear onClick={clickHandler} />);

  expect(asFragment).toMatchSnapshot();
});

it('should call the click handler', async () => {
  const clickHandler = jest.fn();

  render(<CloseOrClear onClick={clickHandler} />);

  expect(clickHandler).not.toBeCalled();

  const button = screen.getByText('\u2715');
  button.click();

  expect(clickHandler).toBeCalledTimes(1);
});
