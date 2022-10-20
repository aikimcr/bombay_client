
// Do I need speciall css?

import PropTypes from 'prop-types';

import Modal from "./Modal";

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

        // This does not account for non-input type fields.
        while (!entry.done) {
            data[entry.value[0]] = entry.value[1];
            entry = entries.next();
        }

        props.onSubmit(data);
        closeForm(evt);
    }

    return (
        <Modal title={props.title} onClose={closeForm} open={props.open}>
            <form action="" className='modal-form' onSubmit={submitData}>
                <div className="form-content">{props.children}</div>
                <div className="controls">
                    <input type='submit'/>
                    <input type='button' onClick={closeForm} value='Cancel' />
                </div>
            </form>
        </Modal>
    );
}

FormModal.propTypes = {
    title: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
}

export default FormModal;