import PropTypes from 'prop-types'
import { useRef } from 'react';
import CloseOrClear from './CloseOrClear';

import './LabeledInput.scss';

function LabeledRange(props) {
    const topRef = useRef(null);

    const modelId = props.model ? props.model.get('id') : 'isNew';
    const inputId = `${props.modelName}-${props.fieldName}-${modelId}`;
    const defaultValue = props.model ? props.model.get(props.fieldName) : '';

    function changeHandler(evt) {
        evt.preventDefault();

        const newValue = evt.target.value;

        const fields = topRef.current.querySelectorAll('input');
        fields.forEach(field => { field.value = newValue });
    }

    function clearValue(evt) {
        evt.preventDefault();

        const fields = topRef.current.querySelectorAll('input');
        fields.forEach(field => { field.value = null });
    }

    return (
        <div ref={topRef} className='labeled-range' data-modelname={props.modelName} data-targetfield={props.fieldName}>
            <label htmlFor={inputId}>{props.labelText}</label>
            <div className='range-input'>
                <input id={inputId} type='range' min={props.min} max={props.max} defaultValue={defaultValue} onChange={changeHandler}></input>
                <input name={props.fieldName} type='number' defaultValue={defaultValue} min={props.min} max={props.max} onChange={changeHandler}></input>
                <CloseOrClear onClick={clearValue} />
            </div>
        </div>
    )
}

LabeledRange.propTypes = {
    modelName: PropTypes.string.isRequired,
    fieldName: PropTypes.string.isRequired,
    labelText: PropTypes.string.isRequired,
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    model: PropTypes.object,
    onChange: PropTypes.func,
}

export default LabeledRange