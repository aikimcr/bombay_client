import React from 'react';
import { useState } from 'react'

import './ArtistList.scss';

import Artist from './Artist';
import { useFormModal } from '../Modal/FormModal';

function ArtistListItem(props) {
    const [openModal, closeModal, FormModal] = useFormModal();

    async function showArtist() {
        const modelDef = await openModal();
        console.log(modelDef);
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