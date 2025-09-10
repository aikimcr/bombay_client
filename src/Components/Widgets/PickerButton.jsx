import PropTypes from 'prop-types';
import { useRef, useState } from 'react';
import { PickerList } from '.';
import { Button } from './Buttons';

import './OldLabeledInput.scss';
function PickerButton(props) {
  const topRef = useRef(null);
  const inputRef = useRef(null);

  const modelId = props.model ? props.model.id : 'isNew';
  const buttonId = `${props.modelName}-name-${modelId}`;

  const [showPickerList, setShowPickerList] = useState(false);
  const [currentModel, setCurrentModel] = useState(
    props.model ? props.model : null,
  );

  const buttonLabel = currentModel ? currentModel.name : '<Please Choose>';

  const initialValue = currentModel ? currentModel.id : 0;

  function modelPicked(newModel) {
    setCurrentModel(newModel);
    inputRef.current.value = newModel[props.fieldName];
    props.onModelPicked(newModel);
    setShowPickerList(false);
  }

  function pickAModel(evt) {
    evt.preventDefault();
    setShowPickerList((oldShow) => !oldShow);
  }

  return (
    <div
      ref={topRef}
      className="picker-button"
      data-modelname={props.modelName}
      data-targetfield={props.targetField}
    >
      <label htmlFor={buttonId}>{props.labelText}</label>
      <input
        type="number"
        ref={inputRef}
        name={props.targetField}
        defaultValue={initialValue}
      ></input>

      <Button
        id={buttonId}
        text={buttonLabel}
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
  collectionClass: PropTypes.func.isRequired, // To get the list of models
  model: PropTypes.object, // A currently set model (optional)
  modelName: PropTypes.string.isRequired, // Should match collectionClass, mostly a convenience
  fieldName: PropTypes.string.isRequired, // The field from the model used to set the target value
  targetField: PropTypes.string.isRequired, // The key in the data from the form
  labelText: PropTypes.string.isRequired,
  onModelPicked: PropTypes.func.isRequired, // Called with the selected model from the collection
};

export default PickerButton;
