import React, { useState } from 'react';
import { act, render } from '@testing-library/react';

import Modal from './Modal.jsx';

function ModalWrapper(props) {
  const [show, setShow] = useState(false);

  function handleClose(evt) {
    expect(evt).toBeDefined();
    props.onClose(evt);

    act(() => {
      setShow(false);
    });
  }

  return (
    <>
      <div id="modal-root"></div>
      <button onClick={() => setShow(true)}>open</button>
      <Modal open={show} onClose={handleClose} title="Test Modal">
        <div>Hello Modal</div>
      </Modal>
    </>
  );
}

it.skip('should show the modal', async () => {
  let closes = 0;

  function handleClose(evt) {
    closes++;
  }

  const modalRoot = document.getElementById('modal-root');
  const result = render(<ModalWrapper onClose={handleClose} />);

  const wrapper = result.container;
  expect(wrapper.childElementCount).toEqual(2);
  expect(modalRoot.childElementCount).toEqual(0);
  expect(closes).toEqual(0);

  const button = wrapper.firstChild;

  act(() => {
    button.click();
  });

  expect(wrapper.childElementCount).toEqual(2);
  expect(modalRoot.childElementCount).toEqual(1);
  expect(closes).toEqual(0);

  const modal = modalRoot.firstChild;
  modal.querySelector('.close').click();
  expect(wrapper.childElementCount).toEqual(2);
  expect(modalRoot.childElementCount).toEqual(0);
  expect(closes).toEqual(1);
});
