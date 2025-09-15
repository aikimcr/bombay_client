import type { StorybookConfig } from '@storybook/react-webpack5';
import path from 'path';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-webpack5-compiler-swc',
    '@storybook/addon-docs',
    '@storybook/addon-onboarding',
    '@storybook/addon-styling-webpack',
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {
      fsCache: true,
      lazyCompilation: true,
    },
  },
  staticDirs: ['../public', '../static'],
  webpackFinal: async (config) => {
    // Add SCSS support
    config.module.rules.push({
      test: /\.scss$/,
      use: ['style-loader', 'css-loader', 'sass-loader'],
      include: /src/,
    });
    config.resolve.alias = {
      ...config.resolve.alias,
      '@styles': path.resolve(__dirname, '../src/styles'),
      '@utilities': path.resolve(__dirname, '../src/utilities'),
      '@network': path.resolve(__dirname, '../src/Network'),
    };
    return config;
  },
};
export default config;
