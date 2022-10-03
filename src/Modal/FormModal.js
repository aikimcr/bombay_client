
// Do I need speciall css?

import { useModal } from "./Modal";

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

    return[ openModal, closeModal, FormModal ];
}

export default useFormModal;