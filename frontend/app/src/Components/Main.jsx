/* eslint-disable react-hooks/exhaustive-deps */
import AlertContainer from "./AlertContainer";
import { useEffect, useState } from "react";
import Button from "./Button";
import Image from "./Image";
import Tiles from "./Tiles";
import { Recorder } from "./Recorder";
import Dropdown from "./Dropdown";
import ScaleLoader from "react-spinners/ScaleLoader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Main() {
    const serverUrl = "http://localhost:3333";

    const [state, setState] = useState({
        sound: "",
        ctx: new AudioContext(),
        wordCount: 4,
        language: window.navigator.language.split("-")[0],
        generating: false,
        playDisable: false,
        displayImage: false,
        checked: false,
    });

    // eslint-disable-next-line no-unused-vars
    const [trials, setTrials] = useState(4);

    // eslint-disable-next-line no-unused-vars
    const [loading, setLoading] = useState({
        image: false,
    });

    const [captcha, setCaptcha] = useState({
        target: "",
        wordLength: "0",
    });

    const toggle = () => {
        if (typeof state.sound == "string") {
            window.alert(
                "No Captcha sound to play! Try to generate a new one."
            );
            return;
        }

        // state.ctx.resume();
        const playSound = state.ctx.createBufferSource();
        playSound.buffer = state.sound;
        playSound.connect(state.ctx.destination);
        playSound.start();
        setState({ ...state, playDisable: true });
        setTimeout(() => {
            playSound.stop();
            setState({ ...state, playDisable: false });
            playSound.disconnect(state.ctx.destination);
        }, Math.ceil(playSound.buffer.duration * 1000));
    };

    const getWords = async () => {
        try {
            let headers = new Headers();
            headers.append(
                "Access-Control-Allow-Origin",
                "http://localhost:3000"
            );
            headers.append(
                "Access-Control-Allow-Headers",
                "Origin, X-Requested-With, Content-Type, Accept"
            );

            const res = await fetch(
                `${serverUrl}/api/get_words?words=${state.wordCount}&lang=${state.language}`
            ).catch((e) => {
                return;
            });
            if (!res) {
                return;
            }
            await res.text().then((data) => {
                setCaptcha({
                    ...captcha,
                    target: data
                        .replace(/\u0142/g, "l")
                        .normalize("NFKD")
                        .replace(/[\u0300-\u036f]/g, ""),
                    // .replace(/[^\w]/g, '')
                    wordLength: data.replace(/\s+/g, "").length,
                });
                console.log(data);
            });
            return true;
        } catch (e) {
            console.error(e);
        }
    };

    async function getFile() {
        try {
            // debugger;

            setState({ ...state, generating: true, ctx: new AudioContext() });

            let status = await getWords().catch((e) => {
                console.log(e);
                // return;
            });

            if (!status) {
                return;
            }
            let headers = new Headers();
            headers.append(
                "Access-Control-Allow-Origin",
                "http://localhost:3000"
            );
            headers.append(
                "Access-Control-Allow-Headers",
                "Origin, X-Requested-With, Content-Type, Accept"
            );

            let audio = "";

            await fetch(`${serverUrl}/api/get_sound`, {
                headers: headers,
            })
                .then((data) => data.arrayBuffer())
                .then((arrayBuffer) => state.ctx.decodeAudioData(arrayBuffer))
                .then((decodedAudio) => {
                    // new (window.AudioContext || window.webkitAudioContext)()
                    audio = decodedAudio;
                    setState({ ...state, generating: false, sound: audio });
                    setTrials(4);
                });
        } catch (e) {
            console.error(e);
        }
    }

    useEffect(() => {
        getFile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.language]);

    useEffect(() => {
        window.addEventListener("languagechange", () => {
            setState({
                ...state,
                language: window.navigator.language.split("-")[0],
            });
        });
    }, []);

    useEffect(() => {
        const guessGrid = document.querySelector(".grid");
        // const alertContainer = document.querySelector("[data-alert-container]");
        const verifyBtn = document.querySelector(".verify-btn");

        // function startInteraction() {

        document.addEventListener("keydown", handleKeyPress);
        verifyBtn.addEventListener("click", submitGuess);
        // }

        function handleKeyPress(e) {
            if (e.key === "Enter") {
                submitGuess();
                return;
            }

            if (e.key === "Backspace" || e.key === "Delete") {
                deleteKey();
                return;
            }

            if (e.key.match(/^[a-zA-Z0-9]$/)) {
                pressKey(e.key);
                return;
            }
        }

        function pressKey(key) {
            const activeTiles = getActiveTiles();
            if (activeTiles.length >= state.wordLength) return;

            const nextTile = guessGrid.querySelector(
                ".tiles > :not([data-letter])"
            );
            if (!nextTile) return;

            nextTile.dataset.letter = key.toLowerCase();
            nextTile.textContent = key;
            nextTile.dataset.state = "active";
        }

        function getActiveTiles() {
            return guessGrid.querySelectorAll('.tiles > [data-state="active"]');
        }

        function submitGuess() {
            const activeTiles = [...getActiveTiles()];
            if (activeTiles.length < captcha.wordLength) {
                // showAlert("Not enough letters");
                toast.warn("Not enough letters", {
                    position: "top-center",
                    autoClose: 2500,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
                shakeTiles(activeTiles);
                setTrials((prev) => {
                    if (prev === 1) {
                        toast.error("Too many attempts, try again.", {
                            position: "top-center",
                            autoClose: 2500,
                            hideProgressBar: true,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "dark",
                        });
                        getFile();
                    }
                    return prev - 1;
                });
                return;
            }

            const guess = activeTiles.reduce((word, tile) => {
                return word + tile.dataset.letter;
            }, "");

            // console.log(guess);
            checkTarget(guess, activeTiles);
        }

        function deleteKey() {
            const activeTiles = getActiveTiles();
            const lastTile = activeTiles[activeTiles.length - 1];
            if (lastTile == null) return;
            lastTile.textContent = "_";
            delete lastTile.dataset.state;
            delete lastTile.dataset.letter;
        }

        // function showAlert(message, duration = 900) {
        //     const alert = document.createElement("div");
        //     alert.textContent = message;
        //     alert.classList.add("alert");
        //     alertContainer.prepend(alert);
        //     if (duration == null) return;
        //     setTimeout(() => {
        //         alert.classList.add("hide");
        //         alert.addEventListener("transitionend", () => {
        //             alert.remove();
        //         });
        //     }, duration);
        // }

        function shakeTiles(tiles) {
            tiles.forEach((tile) => {
                tile.classList.add("shake");
                tile.addEventListener(
                    "animationend",
                    () => {
                        tile.classList.remove("shake");
                    },
                    { once: true }
                );
            });
        }

        function checkTarget(guess, tiles) {
            if (guess === captcha.target.replace(/\s+/g, "").toLowerCase()) {
                // showAlert("Correct!", 4000);
                toast.success("Correct", {
                    position: "top-center",
                    autoClose: 2500,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                });
                setTimeout(() => {
                    // problem with useNavigate
                    // navigate("/resource", { replace: true });
                    window.location = "/resource";
                }, 2000);
                setTrials(4);

                return () => {
                    document.removeEventListener("keydown", handleKeyPress);
                    verifyBtn.removeEventListener("click", submitGuess);
                };
            } else {
                // showAlert("Incorrect, generate new code or try again.", 4000);
                toast.warn("Incorrect, generate new code or try again.", {
                    position: "top-center",
                    autoClose: 3000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                });
                shakeTiles(tiles);
                setTrials((prev) => {
                    if (prev === 1) {
                        toast.error("Too many attempts, try again.", {
                            position: "top-center",
                            autoClose: 2500,
                            hideProgressBar: true,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "dark",
                        });
                        getFile();
                    }
                    return prev - 1;
                });

                for (let tile of tiles) {
                    tile.textContent = "_";
                    delete tile.dataset.state;
                    delete tile.dataset.letter;
                }
            }
        }

        return () => {
            document.removeEventListener("keydown", handleKeyPress);
            verifyBtn.removeEventListener("click", submitGuess);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [captcha.target]);

    return (
        <>
            <AlertContainer />
            <ToastContainer />
            <main>
                <div className="lang-menu">
                    <Dropdown
                        langHandler={(lang) => {
                            setState({ ...state, language: lang });
                        }}
                        lang={state.language}
                    />
                </div>
                <div className="grid">
                    {captcha.wordLength > 0 ? (
                        <Tiles
                            words={captcha.target}
                            wordLength={captcha.wordLength}
                        />
                    ) : (
                        <ScaleLoader
                            loading={true}
                            height={25}
                            aria-label="Loading Spinner"
                            data-testid="loader"
                        />
                    )}
                    <div className="disclaimer">
                        *While entering text use only letters from the english
                        alphabet
                    </div>
                </div>
                <div className="btns">
                    <Button
                        onClick={getFile}
                        type="button"
                        // value="&#x21bb;"
                        value={
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-labelledby="generate-title"
                                role="img"
                            >
                                <title id="generate-title">
                                    Generate new Captcha
                                </title>
                                <path
                                    d="M13.1459 11.0499L12.9716 9.05752L15.3462 8.84977C14.4471 7.98322 13.2242 7.4503 11.8769 7.4503C9.11547 7.4503 6.87689 9.68888 6.87689 12.4503C6.87689 15.2117 9.11547 17.4503 11.8769 17.4503C13.6977 17.4503 15.2911 16.4771 16.1654 15.0224L18.1682 15.5231C17.0301 17.8487 14.6405 19.4503 11.8769 19.4503C8.0109 19.4503 4.87689 16.3163 4.87689 12.4503C4.87689 8.58431 8.0109 5.4503 11.8769 5.4503C13.8233 5.4503 15.5842 6.24474 16.853 7.52706L16.6078 4.72412L18.6002 4.5498L19.1231 10.527L13.1459 11.0499Z"
                                    fill="currentColor"
                                />
                            </svg>
                        }
                        disable={state.generating}
                        classname="generate-btn"
                        loadingAnimation="clip"
                    />
                    <Button
                        onClick={() => {
                            setState({
                                ...state,
                                displayImage: !state.displayImage,
                            });
                        }}
                        type="button"
                        value="Image"
                        classname="img-btn"
                    />
                    <Button
                        onClick={toggle}
                        type="button"
                        value="&#128266; Play"
                        classname="play-btn"
                        disable={state.playDisable}
                        loadingAnimation="scale"
                    />
                </div>
                <div className="btns">
                    <Button
                        type="button"
                        value="Verify text"
                        classname="verify-btn"
                    />
                    <Recorder lang={state.language} fileName="validate" />
                </div>
                {loading.image ? (
                    <ScaleLoader color="#36d7b7" height={25} />
                ) : state.displayImage ? (
                    <Image
                        target={captcha.target}
                        wordCount={state.wordCount}
                    />
                ) : (
                    ""
                )}
            </main>
        </>
    );
}

export default Main;
