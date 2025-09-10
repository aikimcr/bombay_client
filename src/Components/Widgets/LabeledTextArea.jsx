import React, { useRef } from 'react';
import PropTypes from 'prop-types';

import './OldLabeledInput.scss';

function LabeledTextArea(props) {
  const topRef = useRef(null);

  const modelId = props.model ? props.model.get('id') : 'isNew';
  const inputId = `${props.modelName}-${props.fieldName}-${modelId}`;
  const defaultValue = props.model ? props.model.get(props.fieldName) : '';

  const rows = props.rows || 300;
  const cols = props.cols || 100;

  return (
    <div
      ref={topRef}
      className="labeled-textarea"
      data-modelname={props.modelName}
      data-targetfield={props.fieldName}
    >
      <label htmlFor={inputId}>{props.labelText}</label>
      <textarea
        id={inputId}
        name={props.fieldName}
        rows={rows}
        cols={cols}
        defaultValue={defaultValue}
        onChange={props.onChange}
      ></textarea>
    </div>
  );
}

LabeledTextArea.propTypes = {
  modelName: PropTypes.string.isRequired,
  fieldName: PropTypes.string.isRequired,
  labelText: PropTypes.string.isRequired,
  rows: PropTypes.number,
  cols: PropTypes.number,
  model: PropTypes.object,
  onChange: PropTypes.func,
};

export default LabeledTextArea;
