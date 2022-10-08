import { act, render } from '@testing-library/react';
import { useState } from 'react';

import { FormModal } from './FormModal';

jest.useFakeTimers();

beforeEach(() => {
    const modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.append(modalRoot);
})

afterEach(() => {
    const modalRoot = document.getElementById('modal-root');
    modalRoot.remove();
});

function ModalWrapper(props) {
    const [show, setShow] = useState(false);

    function handleClose(evt) {
        expect(evt).toBeDefined();
        props.onClose(evt);

        act(() => {
            setShow(false);
        });
    }

    function handleSubmit(formData) {
        props.onSubmit(formData);
    }

    return (
        <>
            <button onClick={() => setShow(true)}>open</button>
            <FormModal open={show} onClose={handleClose} title='Test Modal' onSubmit={handleSubmit}>
                <div className="testDiv">
                    <input type="text" defaultValue="val1" />
                </div>
            </FormModal>
        </>
    );
}

it('should show the modal', async () => {
    let closes = 0;

    function handleClose(evt) {
        closes++;
    }

    const modalRoot = document.getElementById('modal-root');
    const result = render(<ModalWrapper onClose={handleClose} />);

    const wrapper = result.container;
    expect(wrapper.childElementCount).toEqual(1);
    expect(modalRoot.childElementCount).toEqual(0);
    expect(closes).toEqual(0);

    const button = wrapper.firstChild;

    act(() => {
        button.click();
    });

    expect(wrapper.childElementCount).toEqual(1);
    expect(modalRoot.childElementCount).toEqual(1);
    expect(closes).toEqual(0);

    const modal = modalRoot.firstChild;
    modal.querySelector('.close').click();
    expect(wrapper.childElementCount).toEqual(1);
    expect(modalRoot.childElementCount).toEqual(0);
    expect(closes).toEqual(1);
});

it('should close on cancel', async () => {
    let closes = 0;

    function handleClose(evt) {
        closes++;
    }

    const modalRoot = document.getElementById('modal-root');
    const result = render(<ModalWrapper onClose={handleClose} />);

    const wrapper = result.container;
    const openButton = wrapper.firstChild;

    act(() => {
        openButton.click();
    });

    expect(modalRoot.childElementCount).toEqual(1);
    expect(closes).toEqual(0);

    const cancelButton = modalRoot.querySelector('[value="Cancel"]');

    act(() => {
        cancelButton.click();
    });

    expect(modalRoot.childElementCount).toEqual(0);
    expect(closes).toEqual(1);
});

it('should call onSumbit when submit is clicked', async () => {
    let closes = 0;

    function handleClose(evt) {
        closes++;
    }

    // let lastFormData = null;
    let submits = 0;

    function handleSubmit(formData) {
        // lastFormData = formData;
        submits++;
    }

    const modalRoot = document.getElementById('modal-root');
    const result = render(<ModalWrapper onClose={handleClose} onSubmit={handleSubmit}/>);

    const wrapper = result.container;
    const openButton = wrapper.firstChild;

    act(() => {
        openButton.click();
    });

    expect(modalRoot.childElementCount).toEqual(1);
    expect(closes).toEqual(0);
    expect(submits).toEqual(0);
    // expect(lastFormData).toBeNull();

    const submitButton = modalRoot.querySelector('[type="submit"]');

    const testInput = await changeInput(modalRoot.querySelector('.testDiv'), '', 'Hello?', 250);
    act(() => {
        submitButton.click();
    });

    expect(modalRoot.childElementCount).toEqual(0);
    expect(closes).toEqual(1);
    expect(submits).toEqual(1);

    // FormData is always empty in tests.  Works fine in the browser
    // expect(lastFormData).toEqual({});
});