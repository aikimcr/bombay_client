// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import { act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TextDecoder, TextEncoder } from "text-encoding";
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

import { useState } from "react";

import * as Network from "./Network/Network";
jest.mock("./Network/Network");

import useIntersectionObserver, * as mockObserver from "./Hooks/useIntersectionObserver";
jest.mock("./Hooks/useIntersectionObserver");

globalThis.makeResolvablePromise = function () {
  let resolver;
  let rejecter;
  let promise = new Promise((resolve, reject) => {
    resolver = resolve;
    rejecter = reject;
  });

  return [promise, resolver, rejecter];
};

globalThis.toggleLogin = function () {
  const changeButton = document.querySelector(".change-test-login");
  userEvent.click(changeButton);
};

globalThis.changeInput = async function (
  root,
  selector,
  newValue,
  timerAdvance = -1,
) {
  const inputField = selector ? root.querySelector(selector) : root;
  fireEvent.change(inputField, { target: { value: newValue } });

  if (timerAdvance >= 0) {
    await act(async function () {
      jest.advanceTimersByTime(timerAdvance);
    });
  }

  return inputField;
};
