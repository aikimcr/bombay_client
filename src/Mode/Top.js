
import "./Top.scss";

function Top(props) {
    return (
        <div className="app-home">
            <h1>Welcome to the Bombay Band Manager System</h1>

            <ul>
                <li><a href="artistList">Artist List</a></li>
                <li><a href="songList">Song List</a></li>
            </ul>
        </div>
    );
}

export default Top;