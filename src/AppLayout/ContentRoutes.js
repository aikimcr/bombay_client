import { useContext, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

import Login from "../Login/Login";

import Top from '../Mode/Top';
import ArtistList from "../Mode/Artist/ArtistList";
import SongList from "../Mode/Song/SongList";

import BombayModeContext from '../Context/BombayModeContext';

function Content(props) {
    const mode = useContext(BombayModeContext);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.pathname !== `/${mode}`) navigate(`${mode}`);
    }, [mode, navigate, location.pathname]);

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