import { useContext, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

import Login from "../Login/Login";

import Artist from "../Mode/Artist";

import BombayLoginContext from '../Context/BombayLoginContext';
import BombayModeContext from '../Context/BombayModeContext';

function Content(props) {
    const loggedIn = useContext(BombayLoginContext);
    const mode = useContext(BombayModeContext);

    const navigate = useNavigate();

    useEffect(() => {
        navigate(`/${mode}`);
    }, [mode, navigate]);

    if (loggedIn) {
        return (
            <Routes>
                <Route path="/" element={<Artist />} />
                <Route path="/artist" element={<Artist />} />
            </Routes>
        );
    } else {
        return (
        <Login />
        );
    }
}

export default Content;