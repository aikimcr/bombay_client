import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';

import {
  ContextChanger,
  TestCollectionHandlers,
  TestCollectionOne,
} from '../../../../../testHelpers';

import { ModelPickerList } from './ModelPickerList';

const meta = {
  component: ModelPickerList,

  tags: ['autodocs'],
} satisfies Meta<typeof ModelPickerList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    msw: {
      handlers: TestCollectionHandlers,
    },
  },
  args: {
    initialCollection: new TestCollectionOne({}),
  },
  render: (args) => (
    <ContextChanger initialLoggedIn={true}>
      <ModelPickerList {...args} isOpen={true} />
    </ContextChanger>
  ),
};
