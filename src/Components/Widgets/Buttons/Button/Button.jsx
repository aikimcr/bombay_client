import React from "react";

import "./Button.scss";
import classnames from "classnames";

export const Button = ({
  className,
  text,
  role = "primary",
  onClick,
  ...rest
}) => {
  const classNames = classnames([className, "button"], {
    button__primary: role === "primary",
    button__secondary: role === "secondary",
  });
  return (
    <button {...rest} className={classNames} onClick={onClick}>
      {text}
    </button>
  );
};
