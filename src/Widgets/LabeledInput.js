import PropTypes from 'prop-types'
import { useRef } from 'react';

import './LabeledInput.scss';

function LabeledInput(props) {
    const topRef = useRef(null);

    const modelId = props.model ? props.model.get('id') : 'isNew';
    const inputId = `${props.modelName}-${props.fieldName}-${modelId}`;
    const defaultValue = props.model ? props.model.get(props.fieldName) : '';
    const type = props.type ? props.type : 'text';
    const isPassword = type === 'password';

    function toggleHide(evt) {
        const el = evt.currentTarget;
        const pwd = topRef.current.querySelector('input');

        if (el.dataset.hidden === 'true') {
            el.dataset.hidden = false;
            el.value = 'Hide';
            pwd.setAttribute('type', 'text');
        } else {
            el.dataset.hidden = true;
            el.value = 'Show';
            pwd.setAttribute('type', 'password');
        }
    }

    return (
        <div ref={topRef} className='labeled-input' data-modelname={props.modelName} data-targetfield={props.fieldName}>
            <label htmlFor={inputId}>{props.labelText}</label>
            <input id={inputId} name={props.fieldName} type={type} defaultValue={defaultValue} onChange={props.onChange}></input>
            { isPassword ? <input type="button" className="toggle" data-hidden="true" onClick={toggleHide} value="Show"/> : '' }
        </div>
    )
}

LabeledInput.propTypes = {
    modelName: PropTypes.string.isRequired,
    fieldName: PropTypes.string.isRequired,
    labelText: PropTypes.string.isRequired,
    model: PropTypes.object,
    type: PropTypes.string,
    onChange: PropTypes.func,
}

export default LabeledInput