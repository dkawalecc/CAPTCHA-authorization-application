import React from "react";

function Button({ onClick, type, value, disable, classname }) {
  return (
    <button
      type={type}
      className={classname}
      style={{ display: "inline" }}
      onClick={onClick}
      disabled={disable}
    >
      {value}
    </button>
  );
}

export default Button;
