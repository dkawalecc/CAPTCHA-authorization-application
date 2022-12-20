import React from "react";
import ScaleLoader from "react-spinners/ScaleLoader";
import GridLoader from "react-spinners/GridLoader";
import ClipLoader from "react-spinners/ClipLoader";

function Button({
    onClick,
    type,
    value,
    disable,
    classname,
    loadingAnimation,
}) {
    let animation;
    const color = "#777B8B";
    switch (loadingAnimation) {
        case "scale":
            animation = <ScaleLoader color={color} height={12} />;
            break;
        case "clip":
            animation = <ClipLoader color={color} size={16} />;
            break;
        case "grid":
            animation = <GridLoader color={color} size={4} width={2} />;
            break;
        default:
            animation = <ScaleLoader color={color} height={12} />;
    }

    return (
        <button
            type={type}
            className={classname}
            style={{ display: "inline" }}
            onClick={onClick}
            disabled={disable}
        >
            {disable ? animation : value}
        </button>
    );
}

export default Button;
