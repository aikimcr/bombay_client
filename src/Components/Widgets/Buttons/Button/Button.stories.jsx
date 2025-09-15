import { fn } from 'storybook/internal/test';
import { Button } from './Button';

const meta = {
  component: Button,
  args: {
    className: 'storybook-button',
    text: 'A Button',
    onClick: fn(),
  },
};

export default meta;

export const Default = {};

export const Secondary = {
  args: {
    role: 'secondary',
  },
};
