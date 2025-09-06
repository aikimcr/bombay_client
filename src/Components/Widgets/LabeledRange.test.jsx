import { render } from '@testing-library/react';

import LabeledRange from './LabeledRange.jsx';

jest.useFakeTimers();

it('should show the labeled range', async () => {
  const { asFragment } = render(
    <LabeledRange
      modelName="xyzzy"
      fieldName="plover"
      labelText="plugh"
      min={10}
      max={20}
    />,
  );

  expect(asFragment).toMatchSnapshot();
});

it('should update the number when the slider moves', async () => {
  const result = render(
    <LabeledRange
      modelName="xyzzy"
      fieldName="plover"
      labelText="plugh"
      min={10}
      max={20}
    />,
  );

  const component = result.container.firstChild;
  const sliderField = component.querySelector('input[type="range"]');
  const numberField = component.querySelector('input[type="number"]');

  expect(sliderField).toHaveValue('15');
  expect(numberField).toHaveValue(null);

  await changeInput(component, 'input[type="range"]', 16, 250);
  expect(sliderField).toHaveValue('16');
  expect(numberField).toHaveValue(16);
});

it('should update the slider when the number is changed', async () => {
  const result = render(
    <LabeledRange
      modelName="xyzzy"
      fieldName="plover"
      labelText="plugh"
      min={10}
      max={20}
    />,
  );

  const component = result.container.firstChild;
  const sliderField = component.querySelector('input[type="range"]');
  const numberField = component.querySelector('input[type="number"]');

  expect(sliderField).toHaveValue('15');
  expect(numberField).toHaveValue(null);

  await changeInput(component, 'input[type="number"]', 16, 250);
  expect(sliderField).toHaveValue('16');
  expect(numberField).toHaveValue(16);
});

it('should clear the values', async () => {
  const result = render(
    <LabeledRange
      modelName="xyzzy"
      fieldName="plover"
      labelText="plugh"
      min={10}
      max={20}
    />,
  );

  const component = result.container.firstChild;
  const sliderField = component.querySelector('input[type="range"]');
  const numberField = component.querySelector('input[type="number"]');

  expect(sliderField).toHaveValue('15');
  expect(numberField).toHaveValue(null);

  await changeInput(component, 'input[type="number"]', 11, 250);
  expect(sliderField).toHaveValue('11');
  expect(numberField).toHaveValue(11);

  const clearButton = component.querySelector('button');
  clearButton.click();

  expect(sliderField).toHaveValue('15');
  expect(numberField).toHaveValue(null);
});
