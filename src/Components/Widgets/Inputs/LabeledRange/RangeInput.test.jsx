import React, { useEffect, useRef } from 'react';
import { act, render, fireEvent, screen } from '@testing-library/react';

import { RangeInput } from '.';

jest.useFakeTimers();

const onChange = jest.fn();

describe('Test RangeInput', () => {
  describe('Simple setup and edit', () => {
    it('component should match snapshot', () => {
      const { asFragment } = render(
        <RangeInput
          modelName="xyzzy"
          fieldName="plover"
          min={10}
          max={20}
          defaultValue={15}
          onChange={onChange}
        />,
      );

      expect(asFragment).toMatchSnapshot();
    });

    it('should update the number when the slider moves', () => {
      render(
        <RangeInput
          fieldName="plover"
          min={10}
          max={20}
          defaultValue={15}
          onChange={onChange}
        />,
      );

      const component = screen.getByTestId('range-input');
      const sliderField = component.querySelector('input[type="range"]');
      const numberField = component.querySelector('input[type="number"]');

      expect(sliderField).toHaveValue('15');
      expect(numberField).toHaveValue(15);
      expect(onChange).not.toHaveBeenCalled();

      act(() => {
        fireEvent.change(sliderField, { target: { value: 16 } });
      });

      expect(sliderField).toHaveValue('16');
      expect(numberField).toHaveValue(16);
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(16);
    });

    it('should update the slider when the number is changed', async () => {
      render(
        <RangeInput
          modelName="xyzzy"
          fieldName="plover"
          min={10}
          max={20}
          defaultValue={15}
          onChange={onChange}
        />,
      );

      const component = screen.getByTestId('range-input');
      const sliderField = component.querySelector('input[type="range"]');
      const numberField = component.querySelector('input[type="number"]');

      expect(sliderField).toHaveValue('15');
      expect(numberField).toHaveValue(15);
      expect(onChange).not.toHaveBeenCalled();

      // The input field is debounced
      act(() => {
        fireEvent.change(numberField, { target: { value: 16 } });
      });

      expect(sliderField).toHaveValue('15');
      expect(numberField).toHaveValue(16);
      expect(onChange).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(sliderField).toHaveValue('16');
      expect(numberField).toHaveValue(16);
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(16);
    });

    it('should clear the values', async () => {
      render(
        <RangeInput
          modelName="xyzzy"
          fieldName="plover"
          min={10}
          max={20}
          defaultValue={15}
          onChange={onChange}
        />,
      );

      const component = screen.getByTestId('range-input');
      const sliderField = component.querySelector('input[type="range"]');
      const numberField = component.querySelector('input[type="number"]');

      expect(sliderField).toHaveValue('15');
      expect(numberField).toHaveValue(15);
      expect(onChange).not.toHaveBeenCalled();

      act(() => {
        fireEvent.change(sliderField, { target: { value: 11 } });
      });

      expect(sliderField).toHaveValue('11');
      expect(numberField).toHaveValue(11);
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(11);

      const clearButton = component.querySelector('button');
      clearButton.click();

      expect(sliderField).toHaveValue('15');
      expect(numberField).toHaveValue(15);
      expect(onChange).toHaveBeenCalledTimes(2);
      expect(onChange).toHaveBeenCalledWith(15);
    });
  });

  describe('ref handling', () => {
    it('handles the ref', () => {
      const TestWrapper = () => {
        const inputRef = useRef(null);

        useEffect(() => {
          expect(inputRef.current).toBeDefined();
          expect(parseInt(inputRef.current.value)).toEqual(15);
        }, []);

        onChange.mockImplementation((value) => {
          expect(inputRef.current).toBeDefined();
          expect(parseInt(inputRef.current.value)).toEqual(value);
        });

        return (
          <RangeInput
            ref={inputRef}
            modelName="xyzzy"
            fieldName="plover"
            min={10}
            max={20}
            defaultValue={15}
            onChange={onChange}
          />
        );
      };

      render(<TestWrapper />);

      const component = screen.getByTestId('range-input');
      const sliderField = component.querySelector('input[type="range"]');
      const numberField = component.querySelector('input[type="number"]');

      expect(sliderField).toHaveValue('15');
      expect(numberField).toHaveValue(15);
      expect(onChange).not.toHaveBeenCalled();

      act(() => {
        fireEvent.change(sliderField, { target: { value: 11 } });
      });

      expect(sliderField).toHaveValue('11');
      expect(numberField).toHaveValue(11);
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(11);
    });
  });
});
