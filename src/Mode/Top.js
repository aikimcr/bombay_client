
import { useContext } from "react";

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
                    <li><a href="artistList">Artist List</a></li>
                    <li><a href="songList">Song List</a></li>
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