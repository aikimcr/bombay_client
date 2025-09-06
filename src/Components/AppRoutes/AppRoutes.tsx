import React from "react";
import { Routes, Route } from "react-router";

import { Top } from "../../Mode/Top";
import { ArtistList } from "../../Mode/Artist/ArtistList";
import { PageNotFound } from "../../Mode/PageNotFound";
import { SongList } from "../../Mode/Song/SongList";
import { Login } from "../../Mode/Authentication";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Top />}>
        <Route path="/login" element={<Login />} />
        <Route path="/artistList" element={<ArtistList />} />
        <Route path="/songList" element={<SongList />} />
      </Route>

      {/* Handle page not found gracefully */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};
