import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import './Modal.scss';

export function useModal(args = {}) {
    const [showModal, setShowModal] = useState(false);
    const modalResolvers = useRef({});

    function openModal() {
        setShowModal(true);

        return new Promise((resolve, reject) => {
            modalResolvers.current = { resolve, reject };
        })
    }

    function closeModal(args) {
        setShowModal(false);

        if (args === false) modalResolvers.current.reject();
        modalResolvers.current.resolve(args);
    }

    function Modal(props) {
        function close() {
            closeModal(false);
        }

        if (!showModal) return null;

        // ToDo It needs to be possible to click on the modalRoot to close the modal.
        //      This would be easy if I could always count on modalRoot being there.
        let modalRoot = document.getElementById('modal-root');

        if (modalRoot == null) {
            // ToDo: Revisit this.  Creating an element on the fly might not be right.
            // console.warn('No modal-root found.  Creating one.');
            modalRoot = document.createElement('div');
            modalRoot.id = 'modal-root';
            document.body.append(modalRoot);
        }

        return createPortal(
            <div className="modal">
                <div className="header">
                    <div className="title">{props.title}</div>
                    <button className='close' onClick={close}>X</button>
                </div>
                <div className="modal-content">
                    {props.children}
                </div>
            </div>,
            modalRoot
        );
    }

    return [ openModal, closeModal, Modal ];
}

export default useModal;