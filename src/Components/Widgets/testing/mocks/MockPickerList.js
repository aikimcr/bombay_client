import React, { useEffect } from 'react';
import { Button } from '../../Buttons';

import { mockModels } from '..';

export const MockPickerList = ({ pickModel, isOpen, collectionClass }) => {
  const clickHandler = (evt, model) => {
    evt.preventDefault();
    pickModel(model);
  };

  if (!isOpen) return null;

  return (
    <div data-testid="mock-picker-list">
      <Button
        id="model-picker"
        text="Pick Model"
        onClick={(evt) => clickHandler(evt, mockModels[2])}
      />
    </div>
  );
};
