import PropTypes from "prop-types";

import "./OldLabeledInput.scss";

function CloseOrClear(props) {
  const buttonClass = props.className || "close-or-clear";

  return (
    <button className={buttonClass} onClick={props.onClick}>
      &#x2715;
    </button>
  );
}

CloseOrClear.propTypes = {
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default CloseOrClear;
