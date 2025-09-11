export const isHTMLElement = (element: unknown): element is HTMLElement => {
  return element != null && element instanceof HTMLElement;
};

export const isHTMLInputElement = (
  element: unknown,
): element is HTMLInputElement => {
  return isHTMLElement(element) && element instanceof HTMLInputElement;
};
