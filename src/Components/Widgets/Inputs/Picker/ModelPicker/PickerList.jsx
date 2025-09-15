import React, { createRef, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import BombayLoginContext from '../../../../../Context/BombayLoginContext';
import { useModelCollection } from '../../../../../Hooks/useModelCollection';

export function PickerList({ pickModel, isOpen, initialCollection }) {
  const topRef = createRef();

  const loginState = useContext(BombayLoginContext);

  const [isMounted, setIsMounted] = useState(false);
  const [listCollection] = useState(initialCollection);
  const { refreshCollection } = useModelCollection({
    initialCollection: listCollection,
    topRef,
    isMounted,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  function clickHandler(evt, model) {
    evt.preventDefault();
    pickModel(model);
  }

  if (!isOpen) return null;

  return (
    <div className="picker-component" data-testid="picker-component">
      <div className="list-container" ref={topRef}>
        <ul className="picker-list">
          {!listCollection
            ? ''
            : listCollection.map((model) => {
                const key = `mode-list-${model.id}`;
                return (
                  <li
                    className="picker-item"
                    data-testid="picker-item"
                    key={key}
                    data-model-id={model.id}
                    onClick={(evt) => {
                      clickHandler(evt, model);
                    }}
                  >
                    {model.name}
                  </li>
                );
              })}
        </ul>
      </div>
    </div>
  );
}

PickerList.propTypes = {
  pickModel: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  collectionClass: PropTypes.func.isRequired,
};

export default PickerList;
