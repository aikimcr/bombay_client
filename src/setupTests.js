// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import { expect, jest, test } from '@jest/globals';
import '@testing-library/jest-dom';
import { act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextDecoder, TextEncoder } from 'text-encoding';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

import { useState } from 'react';

globalThis.PromiseWithResolvers = () => {
  // @ts-expect-error Jest/Typescript stupidity with Promise.
  return Promise.withResolvers();
};

globalThis.toggleLogin = function () {
  const changeButton = document.querySelector('.change-test-login');
  userEvent.click(changeButton);
};
