import { Routes, Route } from 'react-router-dom';

import Login from "../Login/Login";

import Top from '../Mode/Top';
import ArtistList from "../Mode/Artist/ArtistList";
import SongList from "../Mode/Song/SongList";
import PageNotFound from '../Mode/PageNotFound';

function Content(props) {
    return (
        <>
            <Routes>
                <Route path="/" element={<Top />} />
                <Route path="/artistList" element={<ArtistList />} />
                <Route path="/songList" element={<SongList />} />

                {/* Handle page not found gracefully */}
                <Route path="*" element={<PageNotFound />} />
            </Routes>
            <Login />
        </>
    );
}

export default Content;