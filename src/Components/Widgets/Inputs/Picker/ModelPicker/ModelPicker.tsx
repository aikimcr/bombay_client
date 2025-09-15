import React, { useState } from 'react';
import { CollectionBase } from '../../../../../Model/CollectionBase';
import { ModelPickerList } from '../ModelPickerList';
import { PickerButton } from '../PickerButton';

interface ModelPickerProps {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialCollection: CollectionBase<any, any>;
}

export const ModelPicker: React.FC<ModelPickerProps> = ({
  id,
  initialCollection,
}): React.ReactElement => {
  const [openState, setOpenState] = useState(false);

  const openStateToggle = () => {
    setOpenState((oldState) => !oldState);
  };

  return (
    <div data-testid="model-picker" id={id}>
      <PickerButton
        id={`${id}-button`}
        buttonText={'dummy'}
        openState={openState}
        openStateToggle={openStateToggle}
        popoverTarget={`${id}-popover`}
      />
      <ModelPickerList
        id={`${id}-popover`}
        initialCollection={initialCollection}
      />
    </div>
  );
};
