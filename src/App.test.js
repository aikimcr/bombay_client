import { render } from '@testing-library/react';

// Mock the top classes here, before importing the App.
import HeaderBar from './AppLayout/HeaderBar';
jest.mock('./AppLayout/HeaderBar', () => {
  const originalModule = jest.requireActual('./AppLayout/HeaderBar');

  return {
    __esModule: true,
    ...originalModule, 
    default: () => {
      return (<div className="header-bar"></div>);
    },
  }
});

import Navigation from './AppLayout/Navigation';
jest.mock('./AppLayout/Navigation', () => {
  const originalModule = jest.requireActual('./AppLayout/Navigation');

  return {
    __esModule: true,
    ...originalModule,
    default: () => {
      return (<div className="navigation"></div>);
    },
  }
});

import App from './App';

test('Renders App Framework', () => {
  const result = render(<App />);

  const index = result.container;
  expect(index.childElementCount).toBe(1);

  const app = index.firstChild;
  expect(app.className).toBe('App');
  expect(app.childElementCount).toBe(6);

  expect(app.children[0].className).toBe('header-bar');
  expect(app.children[1].className).toBe('navigation');
  expect(app.children[2].className).toBe('filters');
  expect(app.children[3].className).toBe('content');
  expect(app.children[4].className).toBe('accessories');
  expect(app.children[5].className).toBe('footer');
});
