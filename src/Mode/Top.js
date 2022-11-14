import { useContext } from "react";
import { Link } from "react-router-dom";

import BombayLoginContext from "../Context/BombayLoginContext";
import Button from "../Widgets/Button";

import "./Top.scss";

function Top(props) {
    const { loggedIn, setShowLogin } = useContext(BombayLoginContext);

    function showLogin() {
        setShowLogin(true);
    }

    return (
        <div className="app-home">
            <h1>Welcome to the Bombay Band Manager System</h1>

            {loggedIn ?
                <ul>
                    <li><Link to="artistList">Artist List</Link></li>
                    <li><Link to="songList">Song List</Link></li>
                </ul> :
                <div>
                    <h2>Please Login to continue</h2>
                    <Button className="login btn" onClick={showLogin} disabled={false} label="Login" />
                </div>
            }
        </div>
    );
}

export default Top;