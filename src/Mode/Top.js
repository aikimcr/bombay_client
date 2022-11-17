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
                    <h2>You have been logged out</h2>
                    <div>
                        <h3>Please login to continue</h3>
                        <Button className="login btn" onClick={showLogin} disabled={false} label="Login" />
                    </div>
                </div>
            }
        </div>
    );
}

export default Top;