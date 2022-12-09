import React from "react";

function Tiles({ words, wordLength }) {
    return words.split(" ").map((word, i) => {
        return (
            <div
                key={i}
                className="tiles"
                style={{ "--wordLength": word.length }}
            >
                {word.split("").map((_, j) => {
                    return (
                        <div
                            key={`${word}_${j}`}
                            className="tile"
                            // data-state="active"
                        >
                            _
                        </div>
                    );
                })}
            </div>
        );
    });
}

export default Tiles;
