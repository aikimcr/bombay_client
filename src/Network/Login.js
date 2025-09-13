import { jwtDecode } from 'jwt-decode';
import {
  prepareURLFromArgs,
  getFromURLString,
  postToURLString,
  putToURLString,
} from './Network';

function setToken(token) {
  localStorage.setItem('jwttoken', token);
}

function getToken() {
  const token = localStorage.getItem('jwttoken');
  if (token) return jwtDecode(token);
  return null;
}

function deleteToken() {
  localStorage.removeItem('jwttoken');
}

export async function loginStatus(expireMinutes = 30) {
  const token = getToken();

  if (token) {
    // Precalculate some stuff to make debugging a little easier.
    const now = parseInt(Date.now() / 1000);
    const tokenAge = now - token?.iat || 0;
    const expireSeconds = expireMinutes * 60;

    if (tokenAge <= expireSeconds) {
      return true;
    } else {
      try {
        const requestURL = prepareURLFromArgs(['login']);
        const resultPromise = getFromURLString(requestURL.toString());
        const result = await resultPromise;

        if (result.loggedIn) {
          setToken(result.token);
        } else {
          deleteToken();
        }

        return result.loggedIn;
      } catch (err) {
        console.error(err);
        return false;
      }
    }
  }

  return false;
}

export async function refreshToken() {
  try {
    const requestUrl = prepareURLFromArgs(['login']);
    const result = await putToURLString(requestUrl.toString(), {});
    setToken(result.body);
    return getToken();
  } catch (err) {
    deleteToken();
    return null;
  }
}

export async function login(username, password) {
  try {
    const requestURL = prepareURLFromArgs(['login']);
    const result = await postToURLString(requestURL.toString(), {
      username,
      password,
    });
    setToken(result.body);
    return getToken();
  } catch (err) {
    deleteToken();
    return null;
  }
}

export async function logout() {
  try {
    const requestURL = prepareURLFromArgs('logout');
    const result = await postToURLString(requestURL.toString());
    deleteToken();
    return result;
  } catch (err) {
    console.error(err);
  }

  deleteToken();
}
