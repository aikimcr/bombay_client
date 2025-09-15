import type { Preview } from '@storybook/react-webpack5';

import { initialize, mswLoader } from 'msw-storybook-addon';

import '../src/global.scss';

/*
 * Initializes MSW
 * See https://github.com/mswjs/msw-storybook-addon#configuring-msw
 * to learn how to customize it
 */
initialize();

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  loaders: [mswLoader], // 👈 Add the MSW loader to all stories
};

export default preview;
