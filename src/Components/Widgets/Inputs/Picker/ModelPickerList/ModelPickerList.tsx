import React, { useEffect, useRef, useState } from 'react';
import { useModelCollection } from '../../../../../Hooks';
import { CollectionBase } from '../../../../../Model/CollectionBase';
import { ModelBase } from '../../../../../Model/ModelBase';

import './ModelPickerList.scss';

interface ModelPickerListProps {
  id?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialCollection: CollectionBase<any, any>;
  isOpen?: boolean; // for testing.
}

export const ModelPickerList: React.FC<ModelPickerListProps> = ({
  id = 'model-picker-list',
  initialCollection,
  isOpen = false,
}): React.ReactElement => {
  const listRef = useRef<HTMLUListElement>(null);

  const [isMounted, setIsMounted] = useState(false);
  useModelCollection({
    initialCollection,
    topRef: listRef,
    isMounted,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <dialog
      id={id}
      className="model-picker-list"
      data-testid="model-picker-list"
      popover="auto"
      open={isOpen}
    >
      <ul
        ref={listRef}
        className="model-picker-list__list"
        data-testid="model-picker-list-list"
      >
        {initialCollection.map((model: ModelBase) => {
          const key = model.id;
          return (
            <li key={key} data-modelid={model.id}>
              {model.name}
            </li>
          );
        })}
      </ul>
    </dialog>
  );
};
