const guessGrid = document.querySelector(".grid");
const alertContainer = document.querySelector("[data-alert-container]");
const verifyBtn = document.querySelector(".verify-btn");
const playBtn = document.querySelector(".play-btn");

const WORD_LENGTH = 5;

function startInteraction() {
    document.addEventListener("keydown", handleKeyPress);
    verifyBtn.addEventListener("click", submitGuess);
    playBtn.addEventListener("click", () => {
        var audio = new Audio("../temp/result.mp3");
        audio.play();
    });
}

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
    document.removeEventListener("keydown", handleKeyPress);
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
    // TODO temporarly hardcoded target
    const target = "BSW97";
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
    if (guess == target.toLowerCase()) {
        showAlert("Correct!", 4000);

        // stopInteraction();
        return;
    } else {
        showAlert("Incorrect, generate new code or try again.", 4000);
    }
}

startInteraction();
