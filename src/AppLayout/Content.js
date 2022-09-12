import { useContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from "../Login/Login";

import Artist from "../Mode/Artist";

import BombayContext from '../BombayContext';

function Content(props) {
    const bombayContext = useContext(BombayContext);

    debugger;

    if (bombayContext.loggedIn) {
        return (
            <div className="content">
                <BrowserRouter baseName="/">
                    <Routes>
                        <Route path="/" element={<Artist />} />
                        <Route path="/artist" element={<Artist />} />
                    </Routes>
                </BrowserRouter>
            </div>
        );
    } else {
        return (
            <div className="content">
                return (<Login checkLoginState={props.checkLoginState}/>);
            </div>
    
        );
    }
}

export default Content;