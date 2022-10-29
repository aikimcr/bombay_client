import jwt_decode from 'jwt-decode';
import { prepareURLFromArgs, postToURLString } from './Network';

function setToken(token) {
  localStorage.setItem('jwttoken', token);
}

function getToken() {
  const token = localStorage.getItem('jwttoken');
  if (token) return jwt_decode(token);
  return null;
}

function deleteToken() {
  localStorage.removeItem('jwttoken');
}

export async function loginStatus()  {
  const token = getToken();

  if (token) {
    return true;
    // To Do: This code should only execute if the token has expired.  I think.
    // const requestURL = prepareURLFromArgs('login');
    // const result = await getFromURLString(requestURL.toString());
    // return result.loggedIn;
  }

  return false;
};

export async function login(username, password) {
  try {
    const requestURL = prepareURLFromArgs('login');
    const result = await postToURLString(requestURL.toString(), {username, password});
    setToken(result);
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
    console.warn(err);
  }

  deleteToken();
}
