import React, { useState } from 'react';
import { act, render } from '@testing-library/react';

import FormModal from './FormModal.jsx';

jest.useFakeTimers();

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
    props.onSubmit.skip(formData);
  }

  return (
    <>
      <div id="modal-root"></div>
      <button onClick={() => setShow(true)}>open</button>
      <FormModal
        open={show}
        onClose={handleClose}
        title="Test Modal"
        onSubmit={handleSubmit}
      >
        <div className="testDiv">
          <input name="TEXT" type="text" defaultValue="val1" />
          <input name="NUMBER" type="number" defaultValue="1" />
          <input name="DATE" type="date" defaultValue="2022-10-20" />
          <input
            name="RANGE"
            type="range"
            defaultValue="20"
            min="10"
            max="30"
          />
          <input name="CHECKBOX" type="checkbox" />
          <input name="RADIO" type="radio" value="huey" />
          <input name="RADIO" type="radio" value="duey" defaultChecked />
          <input name="RADIO" type="radio" value="louey" />
          <select name="SELECT">
            <option value="Bacteria">Bacteria</option>
            <option value="Virus">Virus</option>
          </select>
        </div>
      </FormModal>
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

it.skip('should close on cancel', async () => {
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

it.skip('should call onSumbit when submit is clicked', async () => {
  let closes = 0;

  function handleClose(evt) {
    closes++;
  }

  let lastFormData = null;
  let submits = 0;

  function handleSubmit(formData) {
    lastFormData = formData;
    submits++;
  }

  const modalRoot = document.getElementById('modal-root');
  const result = render(
    <ModalWrapper onClose={handleClose} onSubmit={handleSubmit} />,
  );

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

  const testInput = await changeInput(
    modalRoot.querySelector('.testDiv'),
    'input',
    'Hello?',
    250,
  );
  act(() => {
    submitButton.click();
  });

  expect(modalRoot.childElementCount).toEqual(0);
  expect(closes).toEqual(1);
  expect(submits).toEqual(1);

  expect(lastFormData).toEqual({
    CHECKBOX: false,
    DATE: '2022-10-20T00:00:00.000Z',
    NUMBER: 1,
    RADIO: 'duey',
    RANGE: 20,
    SELECT: 'Bacteria',
    TEXT: 'Hello?',
  });
});
