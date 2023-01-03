import React, { useState } from "react";
import { useEffect } from "react";

export default function Dropdown({ langHandler, lang }) {
    const [showMenu, setShowMenu] = useState(false);

    const options = [
        {
            value: "en",
            label: <img alt="en" src="https://flagcdn.com/w160/gb.png"></img>,
        },
        {
            value: "pl",
            label: <img alt="en" src="https://flagcdn.com/w160/pl.png" />,
        },
        {
            value: "es",
            label: <img alt="en" src="https://flagcdn.com/w160/es.png" />,
        },
        {
            value: "de",
            label: <img alt="en" src="https://flagcdn.com/w160/de.png" />,
        },
        {
            value: "fr",
            label: <img alt="en" src="https://flagcdn.com/w160/fr.png" />,
        },
    ];

    useEffect(() => {
        const handler = () => {
            setShowMenu(false);
        };

        const toggleIcon = (el) => {
            el.classList.toggle("closed");
        };

        window.addEventListener("click", handler);
        document
            .querySelector(".dropdown-tool")
            .addEventListener(
                "click",
                toggleIcon(document.querySelector(".dropdown-icon"))
            );

        return () => {
            window.removeEventListener("click", handler);
            document
                .querySelector(".dropdown-tool")
                .removeEventListener("click", toggleIcon);
        };
    }, [showMenu]);

    const handleInputClick = (e) => {
        e.stopPropagation();
        setShowMenu(!showMenu);
    };

    return (
        <div className="dropdown-container">
            <div className="dropdown-input" tabIndex={0}>
                <div className="dropdown-selected-value">
                    <img
                        alt="en"
                        src={`https://flagcdn.com/h80/${
                            lang === "en" ? "gb" : lang
                        }.png`}
                    />
                </div>
                <div className="dropdown-tools">
                    <div className="dropdown-tool" onClick={handleInputClick}>
                        <div className="dropdown-icon closed"></div>
                    </div>
                </div>
            </div>
            {showMenu && (
                <div className="dropdown-menu">
                    {options.map((option) => {
                        return (
                            <div
                                key={option.value}
                                className="dropdown-item"
                                onClick={() => langHandler(option.value)}
                            >
                                {option.label}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
