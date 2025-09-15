import type { Meta, StoryObj } from '@storybook/react-webpack5';
import React, { useState } from 'react';
import { fn } from 'storybook/test';

import { PickerButton } from './PickerButton';

const meta = {
  component: PickerButton,

  tags: ['autodocs'],

  args: {
    openStateToggle: fn(),
  },
} satisfies Meta<typeof PickerButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'pick-button',
    buttonText: 'Pick One',
    openState: false,
    popoverTarget: 'pop-target',
  },
  render: (args) => {
    const [openState, setOpenState] = useState(false);

    const openStateToggle = () => {
      setOpenState((oldState) => !oldState);
    };

    return (
      <PickerButton
        {...args}
        openState={openState}
        openStateToggle={openStateToggle}
      />
    );
  },
};

export const Disabled: Story = {
  args: {
    id: 'pick-button',
    buttonText: 'Pick One',
    openState: false,
    popoverTarget: 'pop-target',
  },
  render: (args) => {
    return <PickerButton {...args} disabled={true} />;
  },
};
