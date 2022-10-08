import { useContext } from 'react';
import BombayUtilityContext from '../Context/BombayUtilityContext';

function Navigation(props) {
    const { setMode } = useContext(BombayUtilityContext);

    return (<div className="navigation">
        <button className="btn" onClick={() => setMode('artistList')}>Artist List</button>
        <button className="btn" onClick={() => setMode('songList')}>Song List</button>
    </div>);
}

export default Navigation;