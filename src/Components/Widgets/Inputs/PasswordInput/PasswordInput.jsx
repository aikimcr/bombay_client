import React, { useState } from "react";

import "./PasswordInput.scss";
import classnames from "classnames";

export const PasswordInput = ({ id, className, ...rest }) => {
  const [showPassword, setShowPassword] = useState(false);

  const classNames = classnames([className, "password-input"], {
    "password-input--show-password": showPassword,
  });

  const toggleShowPassword = () => {
    setShowPassword((old) => !old);
  };

  return (
    <>
      <input
        {...rest}
        id={id}
        className={classNames}
        type={showPassword ? "text" : "password"}
      />
      {showPassword ? (
        <button
          className="password-input__eye password-input__open-eye"
          onClick={toggleShowPassword}
        >
          <i class="fa-solid fa-eye"></i>
        </button>
      ) : (
        <button
          className="password-input__eye password-input__closed-eye"
          onClick={toggleShowPassword}
        >
          <i class="fa-solid fa-eye-slash"></i>
        </button>
      )}
    </>
  );
};
