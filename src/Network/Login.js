// Load the data from the server.  Handle all the boilerplate for xhr
// correctly.

import { getFromPath, postToPath } from './Network.js';

export function loginStatus()  {
  return getFromPath('login');
};

export function login(username, password) {
  return postToPath('login', {username, password});
}

export function logout() {
  return postToPath('logout');
}
