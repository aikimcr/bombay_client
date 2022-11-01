
// Do I need speciall css?

import PropTypes from 'prop-types';

import Modal from "./Modal";

export function FormModal(props) {
    function closeForm(evt) {
        props.onClose(evt);
    }

    function submitData(evt) {
        evt.preventDefault();

        const fieldElements = evt.currentTarget.querySelectorAll('[name]');
        const fields = Array.from(fieldElements);

        const data = {};

        for (const field of fields) {
            if (field.tagName === 'SELECT') {
                data[field.name] = field.value;
            } else {
                switch (field.type) {
                    case 'number':
                    case 'range':
                        data[field.name] = isNaN(field.valueAsNumber) ? null : field.valueAsNumber;
                        break;

                    case 'date': data[field.name] = field.valueAsDate.toISOString(); break;
                    case 'checkbox': data[field.name] = field.checked; break;

                    case 'radio':
                        if (!data.hasOwnProperty(field.name)) {
                            data[field.name] = '';
                        } else if (field.checked) {
                            data[field.name] = field.value;
                        }
                        break;

                    default: data[field.name] = field.value;
                }
            }
        }

        props.onSubmit(data);
        closeForm(evt);
    }

    return (
        <Modal title={props.title} onClose={closeForm} open={props.open}>
            <form action="" className='modal-form' onSubmit={submitData}>
                <div className="form-content">{props.children}</div>
                <div className="controls">
                    <input type='submit' />
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