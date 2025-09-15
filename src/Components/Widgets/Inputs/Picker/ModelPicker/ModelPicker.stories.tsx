import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import {
  ContextChanger,
  TestCollectionHandlers,
  TestCollectionOne,
} from '../../../../../testHelpers';

import { ModelPicker } from './ModelPicker';

const meta = {
  component: ModelPicker,
  tags: ['autodocs'],
} satisfies Meta<typeof ModelPicker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    msw: {
      handlers: TestCollectionHandlers,
    },
  },
  args: {
    id: 'storybook-picker',
    initialCollection: new TestCollectionOne({}),
  },
  render: (args) => (
    <ContextChanger initialLoggedIn={true}>
      <ModelPicker {...args} />
    </ContextChanger>
  ),
};
