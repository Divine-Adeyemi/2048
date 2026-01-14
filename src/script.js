const gridItems = document.querySelectorAll('.grid-item');
const restartButton = document.getElementById('restart-button');
const score = document.getElementById('score-value');
const highScore = document.getElementById('highscore-value');
const resetButton = document.getElementById('reset-button');
const gameOverOverlay = document.getElementById("game-over");
const tryAgainBtn = document.getElementById("try-again");

let gameActive = true;
let currentScore = 0;
let tiles = new Array(16).fill(null);



// find empty slots
function getEmptyTiles() {
    return tiles
        .map((val, idx) => (val === null ? idx : null))
        .filter(idx => idx !== null);
}

//new tile
function spawnTile() {
    let emptyTiles = getEmptyTiles();
    if (emptyTiles.length === 0) return; // board full

    let randomIndex = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
    let newNumber = Math.random() < 0.9 ? 2 : 4;
    tiles[randomIndex] = newNumber;
}

// update board

function updateBoard() {
    tiles.forEach((val, i) => {
        const gameTile = document.querySelector(`#cell-${i}`);
        updateTile(gameTile, val === null ? "" : val); 
    });
}

function updateTile(tileEl, value) {
    // reset base classes
    tileEl.className = "tile flex items-center justify-center font-bold text-xl rounded-lg transition-colors";

    if (value === "" || value === null) {
        tileEl.textContent = "";
        return;
    }

    // set text
    tileEl.textContent = value;

    // add stylesto tile
    tileEl.classList.add(`tile-${value}`);
    tileEl.classList.add("animate-spawn");
    tileEl.classList.add("animate-pop");
   

    
}

  

// start game
function initGame() {
    tiles.fill(null);
    spawnTile();
    spawnTile(); 
    updateBoard();
}
setupTiles(); // only once


// restart button
restartButton.addEventListener('click', () => {
   resetGame();
});
resetButton.addEventListener('click', () => {
    currentScore = 0;
    score.innerText = currentScore;
    initGame();
});


initGame();
//user input keys
function setupTiles(){
document.addEventListener('keydown', moveTiles );}

function moveTiles(e) {
    if (!gameActive) return;
    let moved = false;

    switch (e.key) {
        case 'ArrowUp':
            moveUp();
            moved = true;
            break;
        case 'ArrowDown':
            moveDown();
            moved = true;
            break;
        case 'ArrowLeft':
            moveLeft();
            moved = true;
            break;
        case 'ArrowRight':
            moveRight();
            moved = true;
            break;
        default: return;
    }

    if (moved) {
        processGameTurn(); // Now using the shared helper
    }
}
tryAgainBtn.addEventListener("click", () => {
    resetGame();});

function resetGame() {
    gameActive = true;
    currentScore = 0;
    score.innerText = currentScore;
    gameOverOverlay.classList.add("hidden");
    initGame();
}


function moveUp() {
    for (let c = 0; c < 4; c++) {
        let col = getCol(c);
        let newCol = slideAndMerge(col);
        setCol(c, newCol);
    }
}

function moveDown() {
    for (let c = 0; c < 4; c++) {
        let col = getCol(c).reverse();
        let newCol = slideAndMerge(col);
        setCol(c, newCol.reverse());
    }
}

function moveLeft() {
    for (let r = 0; r < 4; r++) {
        let row = getRow(r);
        let newRow = slideAndMerge(row);
        setRow(r, newRow);
    }
}

function moveRight() {
    for (let r = 0; r < 4; r++) {
        let row = getRow(r).reverse();
        let newRow = slideAndMerge(row);
        setRow(r, newRow.reverse());
    }
}

// Load high score
let savedHighScore = localStorage.getItem("highScore");
if (savedHighScore) {
    highScore.innerText = savedHighScore;
}

// Update high score
function updateHighScore() {
    if (currentScore > parseInt(highScore.innerText)) {
        highScore.innerText = currentScore;
        localStorage.setItem("highScore", currentScore);
    }
}


function slideAndMerge(line){
     let arr = line.filter(val => val !== null);
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] === arr[i + 1]) {
            arr[i] *= 2;
            currentScore += arr[i];
            score.innerText = currentScore;
            arr[i + 1] = null;
            i++; // skip next tile
        }
    }
         updateHighScore();

    arr = arr.filter(val => val !== null);
    while (arr.length < 4) {
        arr.push(null);
    }
    return arr;
}
// helpers for rows and columns
    function getRow(r) {
        return tiles.slice(r * 4, r * 4 + 4);
    }
    function setRow(r, newRow) {
        for (let c = 0; c < 4; c++) {
            tiles[r * 4 + c] = newRow[c];
        }
       
    }
    function getCol(c) {
     let col = [];
        for (let r = 0; r < 4; r++) {
            col.push(tiles[r * 4 + c]);
        }
        return col;
    }
    function setCol(c, newCol) {
        for (let r = 0; r < 4; r++) {
            tiles[r * 4 + c] = newCol[r];
        }
      
    }
    function isGameOver() {
        if (getEmptyTiles().length > 0) return false;
    
        
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 3; c++) {
                if (tiles[r * 4 + c] === tiles[r * 4 + c + 1]) return false;
            }
        }
    
    
        for (let c = 0; c < 4; c++) {
            for (let r = 0; r < 3; r++) {
                if (tiles[r * 4 + c] === tiles[(r + 1) * 4 + c]) return false;
            }
        }
    
        return true; 
    }
    // --- Mobile Touch Logic ---

let touchStartX = 0;
let touchStartY = 0;


document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
    // Prevent default scrolling on the game area if needed
    // e.preventDefault(); 
}, { passive: false });

// Capture the end point and calculate direction
document.addEventListener('touchend', (e) => {
    if (!gameActive) return;

    let touchEndX = e.changedTouches[0].screenX;
    let touchEndY = e.changedTouches[0].screenY;
    
    handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
});

function handleSwipe(startX, startY, endX, endY) {
    let diffX = endX - startX;
    let diffY = endY - startY;
    let moved = false;

    // Threshold: Ignore tiny movements (taps/accidental jitters)
    if (Math.abs(diffX) < 30 && Math.abs(diffY) < 30) return;

    // Determine Axis: Is the swipe more Horizontal or Vertical?
    if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal
        if (diffX > 0) {
            moveRight();
            moved = true;
        } else {
            moveLeft();
            moved = true;
        }
    } else {
        // Vertical
        if (diffY > 0) {
            moveDown();
            moved = true;
        } else {
            moveUp();
            moved = true;
        }
    }

    if (moved) {
        processGameTurn();
    }
}
    
function processGameTurn() {
    spawnTile();
    updateBoard();
    if (isGameOver()) {
        gameActive = false;
        updateHighScore();
        gameOverOverlay.classList.remove("hidden");
    }
}
    