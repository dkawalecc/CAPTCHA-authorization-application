import React, { useRef, useEffect } from "react";

function Image(props) {
    const canvasRef = useRef(null);

    const draw = (ctx, w, h) => {
        ctx.clearRect(0, 0, w, h);
        ctx.font = "italic 2em Georgia";
        for (let [idx, word] of props.target.split(" ").entries()) {
            ctx.strokeText(word, 60, 30 * (idx + 1.1));
        }
        ctx.textAlign = "center";
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.height = 40 * props.wordCount - 5;
        const context = canvas.getContext("2d");

        draw(context, canvas.width, canvas.height);
    });

    return <canvas ref={canvasRef} />;
}

export default Image;
