import "./HeaderBar.scss";

import LoginStatus from "../Widgets/LoginStatus";

function HeaderBar(props) {
  const title = props.title || "Bombay Band Management System";

  return (
    <div className="header-bar">
      <div className="title">{title}</div>
      <LoginStatus />
    </div>
  );
}

export default HeaderBar;
