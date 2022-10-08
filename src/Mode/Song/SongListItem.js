import React, { useState } from 'react';

import './SongList.scss';

import Song from './Song';
import { FormModal } from '../../Modal/FormModal';

function SongListItem(props) {
    const [showEdit, setShowEdit] = useState(false);
    const [displayName, setDisplayName] = useState(props.song.get('name'));

    async function updateSong(modelDef) {
        await props.song.set(modelDef).save();
        setDisplayName(props.song.get('name'));
    }

    return (
        <React.Fragment>
            <li className="card" onClick={() => setShowEdit(true)}>
                <div className='header'>Song</div>
                <div className='name'>{displayName}</div>
                <div className='details'>
                    <>
                        <div className='label'>Artist</div>
                        <div className='text'>{props.song.artist().get('name')}</div>
                    </>
                    <>
                        <div className='label'>Key</div>
                        <div className='text'>{props.song.get('key_signature')}</div>
                    </>
                    <>
                        <div className='label'>Tempo</div>
                        <div className='text'>{props.song.get('tempo')}</div>
                    </>
                    <>
                        <div className='label'>Lyrics</div>
                        <div className='longText'>{props.song.get('lyrics')}</div>
                    </>
                </div>
            </li>
            <FormModal 
                title="Edit Song"
                onClose={() => setShowEdit(false)}
                onSubmit={updateSong}
                open={showEdit}
            >
                <Song song={props.song} />
            </FormModal>
        </React.Fragment>
    )
}

export default SongListItem;