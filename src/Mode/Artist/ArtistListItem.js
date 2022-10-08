import React, { useState } from 'react';

import './ArtistList.scss';

import Artist from './Artist';
import FormModal from '../../Modal/FormModal';

function ArtistListItem(props) {
    const [showEdit, setShowEdit] = useState(false);
    const [displayName, setDisplayName] = useState(props.artist.get('name'));

    async function updateArtist(modelDef) {
        await props.artist.set(modelDef).save();
        setDisplayName(props.artist.get('name'));
    }

    return (
        <React.Fragment>
            <li className="card" onClick={() => setShowEdit(true)}>
                <div className="header">Artist</div>
                <div className="name">{displayName}</div>
                <div className="details"></div>
            </li>
            <FormModal 
                title="Edit Artist"
                onClose={() => setShowEdit(false)}
                onSubmit={updateArtist}
                open={showEdit}
            >
                <Artist artist={props.artist} />
            </FormModal>
        </React.Fragment>
    )
}

export default ArtistListItem;