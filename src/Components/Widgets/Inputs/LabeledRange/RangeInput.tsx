import React, { useRef } from 'react';
import { debounce } from 'lodash';

import './RangeInput.scss';
import { isHTMLInputElement } from '../../../../Utilities';
import { ClearButton } from '../../Buttons';

export interface RangeInputProps {
  defaultValue: number;
  id: string;
  max: number;
  min: number;
  name: string;
  onChange: (newValue: number) => void;
  ref: ReturnType<typeof useRef<HTMLInputElement>>;
}

export const RangeInput: React.FC<RangeInputProps> = ({
  defaultValue,
  id,
  max,
  min,
  name,
  onChange,
  ref,
}): React.ReactElement => {
  const sliderRef = useRef<HTMLInputElement>(null);
  const inputRef = ref || useRef<HTMLInputElement>(null);

  const setValues = (newValue: string | number) => {
    const newValueString = newValue ? newValue.toString() : null;

    if (sliderRef.current) {
      sliderRef.current.value = newValueString;
    }

    if (inputRef.current) {
      inputRef.current.value = newValueString;
    }

    onChange?.call(null, parseInt(newValueString));
  };

  const changeHandler: React.ChangeEventHandler<HTMLInputElement> = (evt) => {
    evt.preventDefault();

    if (isHTMLInputElement(evt.target)) {
      setValues(evt.target.value);
    }

    return evt.target;
  };

  const debouncedChangeHandler: React.ChangeEventHandler<HTMLInputElement> =
    debounce(changeHandler, 500);

  const clearValue = () => {
    setValues(defaultValue);
  };

  return (
    <div className="range-input" data-testid="range-input">
      <div className="range-input__inputs">
        <input
          id={id}
          className="range-input__slider"
          ref={sliderRef}
          type="range"
          min={min}
          max={max}
          defaultValue={defaultValue}
          onChange={changeHandler}
        ></input>
        <input
          name={name}
          className="range-input__input"
          ref={inputRef}
          type="number"
          defaultValue={defaultValue}
          min={min}
          max={max}
          onChange={debouncedChangeHandler}
        ></input>
      </div>
      <ClearButton onClick={clearValue} />
    </div>
  );
};
