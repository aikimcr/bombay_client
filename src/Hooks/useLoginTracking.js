import { useCallback, useEffect, useRef, useState } from "react";

import { loginStatus, refreshToken } from "../Network/Login";
// Allow external forcing of the state
let setLoggedIn;
export function forceLoginState(newState) {
  if (setLoggedIn) return setLoggedIn(newState);
}

function toMilliseconds(minutes) {
  return minutes * 60 * 1000;
}

export function useLoginTracking() {
  const [loginState, setLoginState] = useState(false);
  const [activitySeen, setActivitySeen] = useState(true);

  const activityCheckMinutes = 30;
  const loginCheckMinutes = 10;

  let activityHandle = useRef(false);

  setLoggedIn = setLoginState; // Allow external forcing of the state.

  const checkLoginState = useCallback(async function () {
    const result = await loginStatus(activityCheckMinutes);
    setLoginState(result);
    return result;
  }, []);

  const refreshState = useCallback(
    async function () {
      if (!loginState) return false;

      const result = await refreshToken();
      setLoginState(result != null);
      return result != null;
    },
    [loginState],
  );

  const checkActivity = useCallback(function (evt) {
    // console.debug(`${new Date().toLocaleString()}: Check Activity (${evt}) (Activity: ${activitySeen}, loginState: ${loginState})`);

    clearTimeout(activityHandle.current);

    if (evt != null) setActivitySeen(true);

    activityHandle.current = setTimeout(async () => {
      // console.debug(`${new Date().toLocaleString()}: Clear Activity (Activity: ${activitySeen}, loginState: ${loginState})`);

      setActivitySeen(false);
    }, toMilliseconds(activityCheckMinutes));
  }, []);

  const setListeners = useCallback(() => {
    document.addEventListener("keydown", checkActivity);
    document.addEventListener("mousedown", checkActivity);
    document.addEventListener("mousemove", checkActivity);
  }, [checkActivity]);

  const removeListeners = useCallback(() => {
    document.removeEventListener("mousemove", checkActivity);
    document.removeEventListener("mousedown", checkActivity);
    document.removeEventListener("keydown", checkActivity);
  }, [checkActivity]);

  const checkLogin = useCallback(
    async function () {
      // console.debug(`${new Date().toLocaleString()}: Check login (Activity: ${activitySeen}, loginState: ${loginState})`);

      if (activitySeen) {
        await refreshState();
        return;
      }

      return await checkLoginState();
    },
    [activitySeen, refreshState, checkLoginState],
  );

  useEffect(() => {
    // console.debug(`${new Date().toLocaleString()}: Change (Activity: ${activitySeen}, loginState: ${loginState})`);
    let intervalHandle = false;

    if (loginState) {
      intervalHandle = setInterval(
        checkLogin,
        toMilliseconds(loginCheckMinutes),
      );
      checkActivity();
      setListeners();
    }

    return () => {
      removeListeners();
      clearTimeout(activityHandle.current);
      clearInterval(intervalHandle);
    };
  }, [
    activitySeen,
    loginState,
    activityHandle,
    checkActivity,
    checkLogin,
    removeListeners,
    setListeners,
  ]);

  useEffect(() => {
    checkLoginState();
  }, [checkLoginState]);

  return [loginState, setLoginState];
}

export default useLoginTracking;
