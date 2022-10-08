import { createPortal } from "react-dom";

import PropTypes from 'prop-types';

import './Modal.scss';

function Modal2(props) {
    if (!props.open) return null;

    const modalRoot = document.getElementById('modal-root');

    return createPortal(
        <div className="modal">
            <div className="header">
                <div className="title">{props.title}</div>
                <button className='close' onClick={props.onClose}>X</button>
            </div>
            <div className="modal-content">
                {props.children}
            </div>
        </div>,
        modalRoot,
    );
}

Modal2.propTypes = {
    title: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
}

export default Modal2;
