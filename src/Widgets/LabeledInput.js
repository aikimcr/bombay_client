import React from 'react'
import PropTypes from 'prop-types'

import './LabeledInput.scss';

function LabeledInput(props) {
    const inputId = `${props.modelName}-${props.model.get('id')}`;

    return (
        <div className='labeled-input' data-modelname={props.modelName} data-fieldname={props.fieldName}>
            <label htmlFor={inputId}>{props.labelText}</label>
            <input id={inputId} name='name' type="text" defaultValue={props.model.get(props.fieldName)}></input>
        </div>
    )
}

LabeledInput.propTypes = {
    modelName: PropTypes.string.isRequired,
    fieldName: PropTypes.string.isRequired,
    labelText: PropTypes.string.isRequired,
    model: PropTypes.object.isRequired,
}

export default LabeledInput