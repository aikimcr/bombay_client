import { useContext, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

import Login from "../Login/Login";

import Top from '../Mode/Top';
import ArtistList from "../Mode/Artist/ArtistList";
import SongList from "../Mode/Song/SongList";

import BombayModeContext from '../Context/BombayModeContext';

function Content(props) {
    const mode = useContext(BombayModeContext);

    const navigate = useNavigate();

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