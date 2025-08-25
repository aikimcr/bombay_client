import { act, render } from "@testing-library/react";
import { useState } from "react";

import Modal from "./Modal";

beforeEach(() => {
  const modalRoot = document.createElement("div");
  modalRoot.id = "modal-root";
  document.body.append(modalRoot);
});

afterEach(() => {
  const modalRoot = document.getElementById("modal-root");
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

  return (
    <>
      <button onClick={() => setShow(true)}>open</button>
      <Modal open={show} onClose={handleClose} title="Test Modal">
        <div>Hello Modal</div>
      </Modal>
    </>
  );
}

it("should show the modal", async () => {
  let closes = 0;

  function handleClose(evt) {
    closes++;
  }

  const modalRoot = document.getElementById("modal-root");
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
  modal.querySelector(".close").click();
  expect(wrapper.childElementCount).toEqual(1);
  expect(modalRoot.childElementCount).toEqual(0);
  expect(closes).toEqual(1);
});
