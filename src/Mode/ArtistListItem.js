import React, { useState } from 'react';

import './ArtistList.scss';

import Artist from './Artist';
import { useFormModal } from '../Modal/FormModal';

function ArtistListItem(props) {
    const [displayName, setDisplayName] = useState(props.artist.get('name'));
    const [openModal, , FormModal] = useFormModal();

    async function showArtist() {
        const modelDef = await openModal();
        await props.artist.set(modelDef).save();
        setDisplayName(props.artist.get('name'));
    }

    return (
        <React.Fragment>
            <li className="card" onClick={showArtist}>{props.artist.get('name')}</li>
            <FormModal title="Edit Artist">
                <Artist artist={props.artist} />
            </FormModal>
        </React.Fragment>
    )
}

export default ArtistListItem;