import React from "react";

// Use this to turn the crank on context changes.
export const ContextChanger = (props) => {
  const [loginState, setLoginState] = useState(props.loggedIn);
  const [showLoginForm, setShowLoginForm] = useState(props.showLoginForm);

  const loginContext = {
    loggedIn: loginState,
    showLoginForm: showLoginForm,
    setLoggedIn: (newLoggedIn) => {
      if (newLoggedIn) {
        setShowLoginForm(false);
      }

      setLoginState(newLoggedIn);
    },

    setShowLogin: (newShow) => {
      if (loginState) return;
      setShowLoginForm(newShow);
    },
  };

  function toggleLogin() {
    loginContext.setLoggedIn(!loginState);
  }

  return (
    <BombayLoginContext.Provider value={loginContext}>
      {props.children}
      {showLoginForm ? <div>Showing Log In Form</div> : null}
      <button className="change-test-login" onClick={toggleLogin}>
        Change Login
      </button>
    </BombayLoginContext.Provider>
  );
};
