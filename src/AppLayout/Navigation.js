import './Navigation.scss';

function Navigation(props) {
    return (<nav className="app-navigation">
        <a href='artistList'>Artist List</a>
        <a href='songList'>Song List</a>
    </nav>);
}

export default Navigation;