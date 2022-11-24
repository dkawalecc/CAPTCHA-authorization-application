import "./App.css";
import AlertContainer from "./Components/AlertContainer";
import { Spinner } from "react-bootstrap";
import { useEffect, useState } from "react";
import Button from "./Components/Button";
import sound from "./assets/result.mp3";
// import Captcha from "captcha-image";
import Image from "./Components/Image";
// import useNavigate from "react-router-dom";

function useAudio(url) {
  const [audio] = useState(new Audio(url));
  const [playing, setPlaying] = useState(false);

  const toggle = () => setPlaying(!playing);

  useEffect(() => {
    playing ? audio.play() : audio.pause();
  }, [playing]);

  useEffect(() => {
    audio.addEventListener("ended", () => setPlaying(false));
    return () => {
      audio.removeEventListener("ended", () => setPlaying(false));
    };
  });

  return toggle;
}

function App() {
  const toggle = useAudio(sound);
  // const navigate = useNavigate();

  const [state, setState] = useState({
    displayImage: false,
    loadingState: false,
  });

  const WORD_LENGTH = 5;
  const target = "BSW97"; // TODO temporarly hardcoded target
  const tiles = [];
  for (let i = 0; i < WORD_LENGTH; i++) {
    tiles.push(
      <div key={i} className="tile">
        _
      </div>
    );
  }

  useEffect(() => {
    const guessGrid = document.querySelector(".grid");
    const alertContainer = document.querySelector("[data-alert-container]");
    const verifyBtn = document.querySelector(".verify-btn");
    const generateBtn = document.querySelector(".generate-btn");

    function startInteraction() {
      document.removeEventListener("keydown", handleKeyPress);
      verifyBtn.removeEventListener("click", submitGuess);
      document.addEventListener("keydown", handleKeyPress);
      verifyBtn.addEventListener("click", submitGuess);
      // generateBtn.addEventListener("click", generateHandler);
    }

    // function generateHandler() {
    //   // playBtn.removeEventListener("click", saveFile);
    //   // playBtn.addEventListener("click", saveFile)

    //   let db;
    //   const request = indexedDB.open("MyTestDatabase", 3);
    //   request.onerror = (event) => {
    //     console.error("Why didn't you allow my web app to use IndexedDB?!");
    //   };
    //   request.onsuccess = (event) => {
    //     db = event.target.result;
    //     console.log(db);
    //   };
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

    function stopInteraction() {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("click", submitGuess);
    }

    function pressKey(key) {
      const activeTiles = getActiveTiles();
      if (activeTiles.length >= WORD_LENGTH) return;

      const nextTile = guessGrid.querySelector(":not([data-letter])");
      nextTile.dataset.letter = key.toLowerCase();
      nextTile.textContent = key;
      nextTile.dataset.state = "active";
    }

    function getActiveTiles() {
      return guessGrid.querySelectorAll('[data-state="active"]');
    }

    function submitGuess() {
      const activeTiles = [...getActiveTiles()];
      if (activeTiles.length < WORD_LENGTH) {
        showAlert("Not enough letters");
        shakeTiles(activeTiles);
        return;
      }

      const guess = activeTiles.reduce((word, tile) => {
        return word + tile.dataset.letter;
      }, "");

      console.log(guess);
      checkTarget(guess, activeTiles, target);
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

    function checkTarget(guess, tiles, target) {
      if (guess === target.toLowerCase()) {
        showAlert("Correct!", 4000);
        setTimeout(() => {
          // problem with useNavigate
          // navigate("/resource", { replace: true });
          window.location = "/resource";
        }, 2000);

        stopInteraction();
        return;
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
    stopInteraction();
    startInteraction();
  }, []);

  return (
    <div className="App">
      <AlertContainer />
      <main>
        <div className="grid">
          {state.loadingState ? (
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          ) : (
            tiles
          )}
        </div>
        {state.displayImage ? <Image target={target} /> : ""}
        <div className="btns">
          <Button
            onClick={() => {
              setState({ ...state, displayImage: !state.displayImage });
            }}
            type="button"
            value="Image"
            classname="img-btn"
          />
          <Button
            type="button"
            value="&#x21bb; Generate"
            classname="generate-btn"
          />
          <Button
            onClick={toggle}
            type="button"
            value="&#128266; Play"
            classname="play-btn"
          />
          <Button type="button" value="Verify" classname="verify-btn" />
        </div>
      </main>
    </div>
  );
}

export default App;
