import PropTypes from 'prop-types'
import { useRef } from 'react';

import './LabeledInput.scss';

// This is generally not considered a Good Idea, but this
// particular component is small and has no utility outside this module.
function LabeledSelectOption(props) {
    return <option value={props.value}>{props.label}</option>
}

LabeledSelectOption.propTypes = {
    value: PropTypes.any.isRequired,
    label: PropTypes.string,
}

function LabeledSelect(props) {
    const topRef = useRef(null);

    const modelId = props.model ? props.model.get('id') : 'isNew';
    const inputId = `${props.modelName}-${props.fieldName}-${modelId}`;
    const unsetLabel = props.unsetLabel || `Please Select ${props.labelText}`;
    const modelValue = props.model ? props.model.get(props.fieldName) : '';
    const defaultValue = modelValue == null ? '' : modelValue;

    return (
        <div ref={topRef} className='labeled-select' data-modelname={props.modelName} data-targetfield={props.fieldName}>
            <label htmlFor={inputId}>{props.labelText}</label>
            <select id={inputId} name={props.fieldName} defaultValue={defaultValue} onChange={props.onChange}>
                <LabeledSelectOption
                    value=''
                    label={unsetLabel}
                />
                {props.options.map(option => {
                    const key = `${inputId}-${option.value}`;
                    const label = option.label || option.value;

                    return <LabeledSelectOption
                                key={key}
                                value={option.value}
                                label={label}
                            />;
                })}
            </select>
        </div>
    )
}

LabeledSelect.propTypes = {
    modelName: PropTypes.string.isRequired,
    fieldName: PropTypes.string.isRequired,
    labelText: PropTypes.string.isRequired,
    options: PropTypes.array.isRequired,
    unsetLabel: PropTypes.string,
    model: PropTypes.object,
    onChange: PropTypes.func,
}

export default LabeledSelect