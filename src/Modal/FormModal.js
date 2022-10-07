
// Do I need speciall css?

import PropTypes from 'prop-types';

import { useModal } from "./Modal";
import Modal2 from "./Modal2";

export function FormModal(props) {
    function closeForm(evt) {
        props.onClose(evt);
    }

    function submitData(evt) {
        evt.preventDefault();
        const formData = new FormData(evt.currentTarget);

        const data = {};
        const entries = formData.entries();
        let entry = entries.next();

        while (!entry.done) {
            data[entry.value[0]] = entry.value[1];
            entry = entries.next();
        }

        props.onSubmit(data);
        closeForm(evt);
    }

    return (
        <Modal2 title={props.title} onClose={closeForm} open={props.open}>
            <form action="" className='modal-form' onSubmit={submitData}>
                <div className="form-content">{props.children}</div>
                <div className="controls">
                    <input type='submit'/>
                    <input type='button' onClick={closeForm} value='Cancel' />
                </div>
            </form>
        </Modal2>
    );
}

FormModal.propTypes = {
    title: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
}

export function useFormModal(args = {}) {
    const [openModal, closeModal, Modal] = useModal();

    function submitData(evt) {
        evt.preventDefault();
        const formData = new FormData(evt.currentTarget);

        const data = {};
        const entries = formData.entries();
        let entry = entries.next();

        while (!entry.done) {
            data[entry.value[0]] = entry.value[1];
            entry = entries.next();
        }

        closeModal(data);
    }

    function closeForm(evt) {
        evt.preventDefault();
        closeModal(false);
    }

    function FormModal(props) {
        return <Modal title={props.title}>
            <form action="" className='modal-form' onSubmit={submitData}>
                <div className="form-content">{props.children}</div>
                <div className="controls">
                    <input type='submit' />
                    <input type='button' onClick={closeForm} value='Cancel' />
                </div>
            </form>
        </Modal>
    }

    return [openModal, closeModal, FormModal];
}

export default useFormModal;