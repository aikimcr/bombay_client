import { useContext, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

import Login from "../Login/Login";

import Top from '../Mode/Top';
import ArtistList from "../Mode/Artist/ArtistList";
import SongList from "../Mode/Song/SongList";

import BombayLoginContext from '../Context/BombayLoginContext';
import BombayModeContext from '../Context/BombayModeContext';

function Content(props) {
    const loggedIn = useContext(BombayLoginContext);
    const mode = useContext(BombayModeContext);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.pathname !== `/${mode}`) navigate(`${mode}`);
    }, [mode, navigate, location.pathname]);

    console.count(loggedIn);
    if (loggedIn) {
        return (
            <Routes>
                <Route path="/" element={<Top />} />
                <Route path="/artistList" element={<ArtistList />} />
                <Route path="/songList" element={<SongList />} />
            </Routes>
        );
    } else {
        return (
        <Login />
        );
    }
}

export default Content;