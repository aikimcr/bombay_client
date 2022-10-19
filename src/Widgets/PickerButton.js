import PropTypes from 'prop-types';
import { useRef, useState } from 'react';
import PickerList from './PickerList';
import Button from './Button';

import './LabeledInput.scss';

function PickerButton(props) {
    const topRef = useRef(null);

    const modelId = props.model ? props.model.get('id') : 'isNew';
    const buttonId = `${props.modelName}-name-${modelId}`;

    const [showPickerList, setShowPickerList] = useState(false);
    const [currentModel, setCurrentModel] = useState(props.model ? props.model : null);
    
    const buttonLabel = currentModel ?
                        currentModel.get('name') :
                        '<Please Choose>';

    function modelPicked(newModel) {
        setCurrentModel(newModel);
        props.onModelPicked(newModel);
        setShowPickerList(false);
    }

    function pickAModel(evt) {
        evt.preventDefault();
        setShowPickerList(true);
    }

    return (
        <div 
            ref={topRef}
            className='picker-button'
            data-modelname={props.modelName}
        >
            <label htmlFor={buttonId}>{props.labelText}</label>
            <Button
                id={buttonId}
                label={buttonLabel}
                disabled={false}
                onClick={pickAModel}
            />
            <PickerList
                pickModel={modelPicked}
                isOpen={showPickerList}
                collectionClass={props.collectionClass}
            />
        </div>
    );
}

PickerButton.propTypes = {
    modelName: PropTypes.string.isRequired,
    labelText: PropTypes.string.isRequired,
    collectionClass: PropTypes.func.isRequired,
    onModelPicked: PropTypes.func.isRequired,
    model: PropTypes.object,
}

export default PickerButton;