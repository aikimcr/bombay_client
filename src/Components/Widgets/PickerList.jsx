import { createRef, useContext } from 'react';
import PropTypes from 'prop-types';

import BombayLoginContext from '../../Context/BombayLoginContext';
import { useModelCollection } from '../../Hooks/useModelCollection';

export function PickerList({ pickModel, isOpen, collectionClass }) {
  const topRef = createRef();

  const loginState = useContext(BombayLoginContext);

  const [listCollection] = useModelCollection({
    CollectionClass: collectionClass,
    topRef,
    loginState,
  });

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
                const key = `mode-list-${model.get('id')}`;
                return (
                  <li
                    className="picker-item"
                    data-testid="picker-item"
                    key={key}
                    data-model-id={model.get('id')}
                    onClick={(evt) => {
                      clickHandler(evt, model);
                    }}
                  >
                    {model.get('name')}
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
