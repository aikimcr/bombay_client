import React from "react";
import { act, render, screen } from "@testing-library/react";
import { AppLayout } from "./AppLayout";

describe("Test AppLayout", () => {
  it("Should match snapshot", () => {
    const { asFragment } = render(
      <AppLayout header={<h1>Header</h1>}>
        <p>Content</p>
      </AppLayout>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it("Should wrap the header content in a header tag", () => {
    render(
      <AppLayout header={<h1 data-testid="header">Header</h1>}>
        <p>Content</p>
      </AppLayout>,
    );

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("header").parentElement.tagName).toEqual(
      "HEADER",
    );
    expect(screen.getByTestId("header").parentElement).toHaveClass(
      "app-layout__header",
    );
  });

  it("Should wrap the content in a div tag", () => {
    render(
      <AppLayout header={<h1>Header</h1>}>
        <p data-testid="content">Content</p>
      </AppLayout>,
    );

    expect(screen.getByTestId("content")).toBeInTheDocument();
    expect(screen.getByTestId("content").parentElement.tagName).toEqual("DIV");
    expect(screen.getByTestId("content").parentElement).toHaveClass(
      "app-layout__content",
    );
  });
});
