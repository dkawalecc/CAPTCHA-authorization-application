import AlertContainer from "./AlertContainer";
import { Spinner } from "react-bootstrap";
import { useEffect, useState } from "react";
import Button from "./Button";
// import sound from "./assets/result.mp3";
import Image from "./Image";
import Tiles from "./Tiles";
import { Recorder } from "./Recorder";

function Main() {
    const serverUrl = "http://localhost:3333";
    // const navigate = useNavigate();

    const [state, setState] = useState({
        sound: "",
        ctx: new AudioContext(),
        playDisable: false,
        displayImage: false,
        loadingState: false,
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

    const getWord = async (rand = 2) => {
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
                `${serverUrl}/api/get_words?words=${rand}`
            ).catch((e) => {
                return;
            });
            if (!res) {
                return;
            }
            await res.text().then((data) => {
                setCaptcha({
                    ...captcha,
                    target: data,
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
            setState({ ...state, ctx: new AudioContext() });

            let status = await getWord(3).catch((e) => {
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

            const res = await fetch(`${serverUrl}/api/get_sound`, {
                headers: headers,
            })
                .then((data) => data.arrayBuffer())
                .then((arrayBuffer) => state.ctx.decodeAudioData(arrayBuffer))
                .then((decodedAudio) => {
                    // new (window.AudioContext || window.webkitAudioContext)()
                    audio = decodedAudio;
                });
            // .catch((e) => {
            //     console.log(e);
            // });

            setState({ ...state, sound: audio });
            // console.log(new Blob([response.arrayBuffer()]));
            // let a = URL.createObjectURL(new Blob([response.arrayBuffer()]));
        } catch (e) {
            console.error(e);
        }
    }

    useEffect(() => {
        getFile();
    }, []);
    useEffect(() => {
        const guessGrid = document.querySelector(".grid");
        const alertContainer = document.querySelector("[data-alert-container]");
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
            if (activeTiles.length < state.wordLength) {
                showAlert("Not enough letters");
                shakeTiles(activeTiles);
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

        function showAlert(message, duration = 900) {
            const alert = document.createElement("div");
            alert.textContent = message;
            alert.classList.add("alert");
            alertContainer.prepend(alert);
            if (duration == null) return;
            setTimeout(() => {
                alert.classList.add("hide");
                alert.addEventListener("transitionend", () => {
                    alert.remove();
                });
            }, duration);
        }

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
                showAlert("Correct!", 4000);
                setTimeout(() => {
                    // problem with useNavigate
                    // navigate("/resource", { replace: true });
                    window.location = "/resource";
                }, 2000);

                return () => {
                    document.removeEventListener("keydown", handleKeyPress);
                    verifyBtn.removeEventListener("click", submitGuess);
                };
            } else {
                showAlert("Incorrect, generate new code or try again.", 4000);
                shakeTiles(tiles);

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
    }, [captcha.target]);

    return (
        <div>
            <AlertContainer />
            <main>
                <div className="grid">
                    <Tiles
                        words={captcha.target}
                        wordLength={captcha.wordLength}
                    />
                </div>

                <div className="btns">
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
                        onClick={getFile}
                        type="button"
                        value="&#x21bb; Generate"
                        classname="generate-btn"
                    />
                    <Button
                        onClick={toggle}
                        type="button"
                        value="&#128266; Play"
                        classname="play-btn"
                        disable={state.playDisable}
                    />
                    <Button
                        type="button"
                        value="Verify"
                        classname="verify-btn"
                    />
                    <Button value="Record" classname="record-btn" />
                </div>
                <Recorder fileName="validate" />
                {state.loadingState ? (
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                ) : state.displayImage ? (
                    <Image target={captcha.target} />
                ) : (
                    ""
                )}
            </main>
        </div>
    );
}

export default Main;
