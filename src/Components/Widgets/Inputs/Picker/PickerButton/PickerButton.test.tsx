import React from 'react';
import { render, screen } from '@testing-library/react';

import { PickerButton } from '.';

it('should show a simple labeled input', () => {
  const openStateToggle = jest.fn();

  const { asFragment } = render(
    <PickerButton
      buttonText="Please Pick One"
      openState={false}
      openStateToggle={openStateToggle}
      popoverTarget="picker-dropdown"
    />,
  );

  expect(asFragment).toMatchSnapshot();
});

it('should have all the right attributes', () => {
  const openStateToggle = jest.fn();

  render(
    <PickerButton
      buttonText="Please Pick One"
      openState={false}
      openStateToggle={openStateToggle}
      popoverTarget="picker-dropdown"
    />,
  );

  expect(openStateToggle).not.toHaveBeenCalled();

  const button = screen.getByText('Please Pick One');
  expect(button).toHaveAttribute('id', 'picker-button');
  expect(button).toHaveClass('picker-button');
  expect(button).toHaveAttribute('type', 'button');
  expect(button).toHaveAttribute('aria-haspopup', 'menu');
  expect(button).toHaveAttribute('aria-expanded', 'false');
  expect(button).toHaveAttribute('aria-controls', 'picker-dropdown');
  expect(button).toHaveAttribute('popoverTarget', 'picker-dropdown');
  expect(button).toHaveAttribute('popoverTargetAction', 'toggle');
});

it('aria-expanded matches openState', () => {
  const openStateToggle = jest.fn();

  const { rerender } = render(
    <PickerButton
      buttonText="Please Pick One"
      openState={false}
      openStateToggle={openStateToggle}
      popoverTarget="picker-dropdown"
    />,
  );

  const button = screen.getByText('Please Pick One');
  expect(button).toHaveAttribute('aria-expanded', 'false');

  rerender(
    <PickerButton
      buttonText="Please Pick One"
      openState={true}
      openStateToggle={openStateToggle}
      popoverTarget="picker-dropdown"
    />,
  );

  expect(button).toHaveAttribute('aria-expanded', 'true');
});

it('should call the click handler', () => {
  const openStateToggle = jest.fn();

  render(
    <PickerButton
      buttonText="Please Pick One"
      openState={false}
      openStateToggle={openStateToggle}
      popoverTarget="picker-dropdown"
    />,
  );

  expect(openStateToggle).not.toHaveBeenCalled();

  const button = screen.getByText('Please Pick One');
  button.click();

  expect(openStateToggle).toHaveBeenCalledTimes(1);
});

it('should be disabled', () => {
  const openStateToggle = jest.fn();

  const { rerender } = render(
    <PickerButton
      buttonText="Please Pick One"
      openState={false}
      openStateToggle={openStateToggle}
      popoverTarget="picker-dropdown"
      disabled={true}
    />,
  );

  const button = screen.getByText('Please Pick One');
  expect(button).toBeDisabled();

  rerender(
    <PickerButton
      buttonText="Please Pick One"
      openState={false}
      openStateToggle={openStateToggle}
      popoverTarget="picker-dropdown"
      disabled={false}
    />,
  );

  expect(button).not.toBeDisabled();
});
