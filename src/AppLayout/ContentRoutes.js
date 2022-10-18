import { useContext, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

import Login from "../Login/Login";

import Top from '../Mode/Top';
import ArtistList from "../Mode/Artist/ArtistList";
import SongList from "../Mode/Song/SongList";

import BombayModeContext from '../Context/BombayModeContext';
import ConfigurationContext from '../Context/ConfiguratonContext';

function Content(props) {
    const { routerBase } = useContext(ConfigurationContext);
    const mode = useContext(BombayModeContext);

    const navigate = useNavigate();
    const location = useLocation();

    // A diangnostic to turn on for deploy problems.
    // console.log(`Current location: ${location.pathname}`);

    useEffect(() => {
        navigate(mode);
    }, [mode, navigate]);

    return (
        <>
            <Routes>
                <Route path="/" element={<Top />} />
                <Route path="/artistList" element={<ArtistList />} />
                <Route path="/songList" element={<SongList />} />
            </Routes>
            <Login />
        </>
    );
}

export default Content;