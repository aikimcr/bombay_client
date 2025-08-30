import React from "react";

export const ComponentMock = (props) => {
  const renderProps = () => {
    let keySeq = 1;

    return Object.keys(props).map((key) => {
      if (key === "children") {
        return null;
      }

      return (
        <div key={keySeq++}>
          <span>{key}</span>: <span>{props[key]}</span>
        </div>
      );
    });
  };

  return (
    <div className={props.className} data-testid={props.testId}>
      <p data-testid="mock-component-name">Name {props.name}</p>
      <div data-testid="mock-component-props">{renderProps()}</div>
      <div data-testid="mock-component-children">{props.children}</div>
    </div>
  );
};
