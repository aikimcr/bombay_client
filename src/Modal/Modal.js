import { createPortal } from "react-dom";

import PropTypes from 'prop-types';

import './Modal.scss';
import CloseOrClear from "../Widgets/CloseOrClear";

function Modal(props) {
    if (!props.open) return null;

    const modalRoot = document.getElementById('modal-root');

    return createPortal(
        <div className="modal">
            <div className="header">
                <div className="title">{props.title}</div>
                <CloseOrClear className='close' onClick={props.onClose} />
            </div>
            <div className="modal-content">
                {props.children}
            </div>
        </div>,
        modalRoot,
    );
}

Modal.propTypes = {
    title: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
}

export default Modal;
