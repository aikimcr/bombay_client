import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { SelectionInputOption } from './SelectInputOption';

import './SelectInput.scss';

export const SelectInput = (props) => {
  const topRef = useRef(null);

  const modelId = props.model ? props.model.get('id') : 'isNew';
  const unsetLabel = props.unsetLabel || `Please Select ${props.labelText}`;
  const modelValue = props.model ? props.model.get(props.fieldName) : '';
  const defaultValue = modelValue == null ? '' : modelValue;

  return (
    <div ref={topRef} className="select-input" data-testid="select-input">
      <select
        id={props.id}
        className="select-input__select"
        data-testid="select-input-select"
        name={props.name}
        defaultValue={defaultValue}
        onChange={props.onChange}
      >
        <SelectionInputOption value="" label={unsetLabel} />
        {props.options.map((option) => {
          const key = `${props.id}-${option.value}`;
          const label = option.label || option.value;

          return (
            <SelectionInputOption
              key={key}
              value={option.value}
              label={label}
            />
          );
        })}
      </select>
    </div>
  );
};

SelectInput.propTypes = {
  name: PropTypes.string,
  options: PropTypes.array.isRequired,
  unsetLabel: PropTypes.string,
  onChange: PropTypes.func,
};
