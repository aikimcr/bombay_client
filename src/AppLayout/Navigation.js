import { Link } from "react-router-dom";

import "./Navigation.scss";

function Navigation(props) {
  return (
    <nav className="app-navigation">
      <Link to="/">Top</Link>
      <Link to="artistList">Artist List</Link>
      <Link to="songList">Song List</Link>
    </nav>
  );
}

export default Navigation;
