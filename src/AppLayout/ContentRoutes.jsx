import { useContext } from "react";
import { Routes, Route } from "react-router-dom";

import BombayLoginContext from "../Context/BombayLoginContext";

import Login from "../Login/Login.jsx";

import Top from "../Mode/Top.jsx";
import ArtistList from "../Mode/Artist/ArtistList.jsx";
import SongList from "../Mode/Song/SongList.jsx";
import PageNotFound from "../Mode/PageNotFound.jsx";

function ContentRoutes(props) {
  const { loggedIn } = useContext(BombayLoginContext);

  function loggedOutRoutes() {
    return (
      <>
        <Route path="/" element={<Top />} />
        <Route path="/artistList" element={<Top />} />
        <Route path="/songList" element={<Top />} />
      </>
    );
  }

  function loggedInRoutes() {
    return (
      <>
        <Route path="/" element={<Top />} />
        <Route path="/artistList" element={<ArtistList />} />
        <Route path="/songList" element={<SongList />} />
      </>
    );
  }

  return (
    <>
      <Routes>
        {loggedIn ? loggedInRoutes() : loggedOutRoutes()}

        {/* Handle page not found gracefully */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      {loggedIn ? null : <Login />}
    </>
  );
}

export default ContentRoutes;
