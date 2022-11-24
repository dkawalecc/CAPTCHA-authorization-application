import React, { useRef, useEffect } from "react";

function Image(props) {
  const canvasRef = useRef(null);

  const draw = (ctx) => {
    ctx.font = "italic 4em Georgia";
    ctx.strokeText(props.target, 40, 90);
    ctx.textAlign = "center";
    // ctx.fillStyle = "#000000";
    // ctx.beginPath();
    // ctx.arc(50, 100, 20, 0, 2 * Math.PI);
    // ctx.fill();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    //Our draw come here
    draw(context);
  }, [draw]);

  return <canvas ref={canvasRef} {...props} />;

  //   let canv = document.createElement("canvas");
  //   canv.id = "captcha";
  //   canv.width = 100;
  //   canv.height = 50;
  //   let ctx = canv.getContext("2d");
  //   ctx.font = "25px Georgia";
  //   ctx.strokeText(target, 0, 30);
  //   //storing captcha so that can validate you can save it somewhere else according to your specific requirements
  //   // document.querySelector(".image").removeChild();
  //   //   document.querySelector(".image").appendChild(canv);
  //   return canv;
}

export default Image;
