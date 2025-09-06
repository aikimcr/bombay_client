import React from "react";
import { act, render, screen } from "@testing-library/react";
import * as ReactRouter from "react-router";
import { AppRoutes } from "./AppRoutes";

const { MemoryRouter } = ReactRouter;

// The jsx suffix is not needed here.  Ever.
jest.mock("../../Mode/Artist/ArtistList");
jest.mock("../../Mode/Song/SongList");
jest.mock("../../Mode/Top");
jest.mock("../../Mode/PageNotFound");

describe("Test AppRoutes", () => {
  it("Should match snapshot", () => {
    const { asFragment, baseElement } = render(
      <MemoryRouter>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(asFragment()).toMatchSnapshot();
  });

  describe("Route rendering", () => {
    it("Should render Top component for root path", () => {
      render(
        <MemoryRouter initialEntries={["/"]}>
          <AppRoutes />
        </MemoryRouter>,
      );

      expect(screen.getByTestId("mock-top")).toBeInTheDocument();
      expect(screen.getByText("Name Top")).toBeInTheDocument();
    });

    it("Should render Top component for root path with nested routes", () => {
      render(
        <MemoryRouter initialEntries={["/"]}>
          <AppRoutes />
        </MemoryRouter>,
      );

      expect(screen.getByTestId("mock-top")).toBeInTheDocument();
      expect(screen.getByText("Name Top")).toBeInTheDocument();
    });

    it("Should render ArtistList component for /artistList path", () => {
      render(
        <MemoryRouter initialEntries={["/artistList"]}>
          <AppRoutes />
        </MemoryRouter>,
      );

      expect(screen.getByTestId("mock-artist-list")).toBeInTheDocument();
      expect(screen.getByText("Name ArtistList")).toBeInTheDocument();
    });

    it("Should render SongList component for /songList path", () => {
      render(
        <MemoryRouter initialEntries={["/songList"]}>
          <AppRoutes />
        </MemoryRouter>,
      );

      expect(screen.getByTestId("mock-song-list")).toBeInTheDocument();
      expect(screen.getByText("Name SongList")).toBeInTheDocument();
    });
  });

  describe("Nested routing", () => {
    it("Should render Top component as parent route for nested routes", () => {
      render(
        <MemoryRouter initialEntries={["/artistList"]}>
          <AppRoutes />
        </MemoryRouter>,
      );

      // Both Top (parent) and ArtistList (child) should be rendered
      expect(screen.getByTestId("mock-top")).toBeInTheDocument();
      expect(screen.getByTestId("mock-artist-list")).toBeInTheDocument();
    });

    it("Should render Top component as parent route for song list", () => {
      render(
        <MemoryRouter initialEntries={["/songList"]}>
          <AppRoutes />
        </MemoryRouter>,
      );

      // Both Top (parent) and SongList (child) should be rendered
      expect(screen.getByTestId("mock-top")).toBeInTheDocument();
      expect(screen.getByTestId("mock-song-list")).toBeInTheDocument();
    });
  });

  describe("Component props", () => {
    it("Should pass correct props to Top component", () => {
      render(
        <MemoryRouter initialEntries={["/"]}>
          <AppRoutes />
        </MemoryRouter>,
      );

      const topComponent = screen.getByTestId("mock-top");
      expect(topComponent).toHaveClass("mock-top");
    });

    it("Should pass correct props to ArtistList component", () => {
      render(
        <MemoryRouter initialEntries={["/artistList"]}>
          <AppRoutes />
        </MemoryRouter>,
      );

      const artistListComponent = screen.getByTestId("mock-artist-list");
      expect(artistListComponent).toHaveClass("mock-artist-list");
    });

    it("Should pass correct props to SongList component", () => {
      render(
        <MemoryRouter initialEntries={["/songList"]}>
          <AppRoutes />
        </MemoryRouter>,
      );

      const songListComponent = screen.getByTestId("mock-song-list");
      expect(songListComponent).toHaveClass("mock-song-list");
    });
  });

  describe("Route structure", () => {
    it("Should have correct route structure", () => {
      const { container } = render(
        <MemoryRouter>
          <AppRoutes />
        </MemoryRouter>,
      );

      // Verify that Routes and Route components are rendered
      expect(container.querySelector("div")).toBeInTheDocument();
    });

    it("Should render Routes component", () => {
      const { container } = render(
        <MemoryRouter>
          <AppRoutes />
        </MemoryRouter>,
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  // It looks like MemoryRouter doesn't handles seme things the same as BrowserRouter
  describe.skip("Error handling and edge cases", () => {
    it("Should handle empty initial entries", () => {
      render(
        <MemoryRouter initialEntries={[]}>
          <AppRoutes />
        </MemoryRouter>,
      );

      // Should default to root path and render Top
      expect(screen.getByTestId("mock-page-not-found")).toBeInTheDocument();
    });

    it("Should handle invalid paths gracefully", () => {
      render(
        <MemoryRouter initialEntries={["/invalid-path"]}>
          <AppRoutes />
        </MemoryRouter>,
      );

      // Should render Top component for unmatched routes
      expect(screen.getByTestId("mock-page-not-found")).toBeInTheDocument();
    });

    it("Should handle case-sensitive paths correctly", () => {
      render(
        <MemoryRouter initialEntries={["/ARTISTLIST"]}>
          <AppRoutes />
        </MemoryRouter>,
      );

      // Should render Top component for case-mismatched routes
      expect(screen.getByTestId("mock-top")).toBeInTheDocument();
      expect(screen.queryByTestId("mock-artist-list")).not.toBeInTheDocument();
    });
  });

  describe("Component integration", () => {
    // Needs a better way to navigate the paths in the test
    it.skip("Should render all expected components when navigating through routes", () => {
      const { rerender } = render(
        <MemoryRouter
          initialEntries={["/", "/artistList", "/songList"]}
          initialIndex={0}
        >
          <AppRoutes />
        </MemoryRouter>,
      );

      // Root path
      expect(screen.getByTestId("mock-top")).toBeInTheDocument();

      // Artist list path
      rerender(
        <MemoryRouter initialIndex={2}>
          <AppRoutes />
        </MemoryRouter>,
      );
      expect(screen.getByTestId("mock-top")).toBeInTheDocument();
      expect(screen.getByTestId("mock-artist-list")).toBeInTheDocument();

      // // Song list path
      // rerender(
      //   <MemoryRouter initialEntries={["/songList"]}>
      //     <AppRoutes />
      //   </MemoryRouter>,
      // );
      // expect(screen.getByTestId("mock-top")).toBeInTheDocument();
      // expect(screen.getByTestId("mock-song-list")).toBeInTheDocument();
    });

    it("Should maintain component hierarchy", () => {
      render(
        <MemoryRouter initialEntries={["/artistList"]}>
          <AppRoutes />
        </MemoryRouter>,
      );

      // Verify that both parent and child components are rendered
      const topComponent = screen.getByTestId("mock-top");
      const artistListComponent = screen.getByTestId("mock-artist-list");

      expect(topComponent).toBeInTheDocument();
      expect(artistListComponent).toBeInTheDocument();
      expect(topComponent).not.toEqual(artistListComponent);
    });
  });

  describe("Performance and rendering", () => {
    it("Should render without errors", () => {
      expect(() => {
        render(
          <MemoryRouter>
            <AppRoutes />
          </MemoryRouter>,
        );
      }).not.toThrow();
    });

    it("Should render consistently", () => {
      const { asFragment } = render(
        <MemoryRouter>
          <AppRoutes />
        </MemoryRouter>,
      );

      const firstRender = asFragment();

      const { asFragment: asFragment2 } = render(
        <MemoryRouter>
          <AppRoutes />
        </MemoryRouter>,
      );

      const secondRender = asFragment2();
      expect(firstRender).toEqual(secondRender);
    });
  });
});
