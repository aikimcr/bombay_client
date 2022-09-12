import { useContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from "../Login/Login";

import BombayContext from '../BombayContext';

function Content(props) {
    const bombayContext = useContext(BombayContext);

    if (bombayContext.loggedIn) {
        return (
            <div className="content">
                <BrowserRouter baseName="/">
                    <Routes>
                        <Route path="/" element={<Login />} />
                        <Route path="/login" element={<Login />} />
                    </Routes>
                </BrowserRouter>
            </div>
        );
    } else {
        return (
            <div className="content">
                return (<Login />);
            </div>
    
        );
    }
}

export default Content;