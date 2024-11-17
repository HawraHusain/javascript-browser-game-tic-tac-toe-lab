/*-------------------------------- Constants --------------------------------*/

const boardTiles = document.querySelectorAll('.tile');
const restartGameButton = document.querySelector('main button');
const nameEntryDialog = document.querySelector('.name-entry-dialog');
const submitNamesButton = nameEntryDialog.querySelector('button');

/*---------------------------- Variables (state) ----------------------------*/

let currentTurn = null;
let gameOver = false; 
let gameLogic = null; 
let gameDisplay = null; 
let gameController = null; 

/*------------------------ Cached Element References ------------------------*/

const scoreTracker = document.querySelector('.score');
const turnIndicator = document.querySelector('main p');
const resultDialog = document.querySelector('.game-result-dialog');
const resultMessage = resultDialog.querySelector('h1');

/*-------------------------------- Functions --------------------------------*/

const Player = (username, marker) => {
    const getMarker = () => marker;
    const getUsername = () => username;
    return { getMarker, getUsername };
};

const initializeGameLogic = () => {
    let boardState = Array(9).fill(null);

    const updateBoard = (marker, index) => {
        boardState[index] = marker;
    };

    const resetBoard = () => {
        boardState = Array(9).fill(null);
    };

    const getRows = () => {
        const rows = [];
        for (let i = 0; i < boardState.length; i += 3) {
            rows.push(boardState.slice(i, i + 3));
        }
        return rows;
    };

    const getColumns = () => [0, 1, 2].map(col => [boardState[col], boardState[col + 3], boardState[col + 6]]);

    const getDiagonals = () => [[boardState[0], boardState[4], boardState[8]], [boardState[2], boardState[4], boardState[6]]];

    const isWinningCombination = (array) => {
        if (array.every((val) => val === array[0] && val !== null)) {
            return { winner: true, marker: array[0] };
        }
        return { winner: false };
    };

    const checkOutcome = () => {
        const allLines = [...getRows(), ...getColumns(), ...getDiagonals()];
        for (const line of allLines) {
            const result = isWinningCombination(line);
            if (result.winner) return { winner: result.marker };
        }
        if (boardState.every(cell => cell !== null)) return { tie: true };
        return { winner: null };
    };

    return { updateBoard, resetBoard, checkOutcome };
};

const initializeGameDisplay = () => {
    resultDialog.addEventListener('click', (event) => {
        if (event.target === resultDialog) resultDialog.close();
    });

    const markTile = (tile, marker) => {
        tile.textContent = marker;
        if (marker === 'X') {
            tile.style.color = 'red'; 
        } else if (marker === 'O') {
            tile.style.color = 'indigo'; 
        }
    };
    

    const updateTurnMessage = (message) => {
        turnIndicator.textContent = message;
    };

    const displayResultDialog = (message) => {
        resultMessage.textContent = message;
        resultDialog.showModal();
    };

    const clearBoard = () => {
        boardTiles.forEach(tile => tile.textContent = '');
    };

    return { markTile, updateTurnMessage, displayResultDialog, clearBoard };
};

const initializeGameController = (playerOne, playerTwo) => {
    currentTurn = playerOne;
    gameOver = false;

    gameDisplay.updateTurnMessage(`${currentTurn.getUsername()}'s Turn`);

    const handleTurn = (tile, player) => {
        if (tile.textContent) return true;
        gameDisplay.markTile(tile, player.getMarker());
        gameLogic.updateBoard(player.getMarker(), tile.dataset.index);
        return false;
    };

    const switchTurn = () => {
        currentTurn = currentTurn === playerOne ? playerTwo : playerOne;
        const message = gameOver ? 'Game Over' : `${currentTurn.getUsername()}'s Turn`;
        gameDisplay.updateTurnMessage(message);
    };

    const evaluateGame = () => {
        const result = gameLogic.checkOutcome();
        if (result.winner) {
            gameDisplay.displayResultDialog(`${currentTurn.getUsername()} Wins!`);
            gameOver = true;
        } else if (result.tie) {
            gameDisplay.displayResultDialog(`It's a Tie!`);
            gameOver = true;
        }
    };

    const playTurn = (e) => {
        if (gameOver) return;
        const isTileOccupied = handleTurn(e.target, currentTurn);
        if (!isTileOccupied) {
            evaluateGame();
            switchTurn();
        }
    };

    const resetGame = () => {
        gameDisplay.clearBoard();
        gameLogic.resetBoard();
        gameOver = false;
        gameDisplay.updateTurnMessage(`${currentTurn.getUsername()}'s Turn`);
    };

    return { playTurn, resetGame };
};

const setupGame = (playerOne, playerTwo) => {
    gameLogic = initializeGameLogic();
    gameDisplay = initializeGameDisplay();
    gameController = initializeGameController(playerOne, playerTwo);

    restartGameButton.addEventListener('click', gameController.resetGame);
    boardTiles.forEach(tile => tile.addEventListener('click', gameController.playTurn));
};

const markTile = (tile, marker) => {
    tile.textContent = marker;
    if (marker === 'X') {
        tile.style.color = 'red'; // Set X to red
    } else if (marker === 'O') {
        tile.style.color = 'white'; // Set O to white
    }
};
/*----------------------------- Event Listeners -----------------------------*/

nameEntryDialog.showModal();
submitNamesButton.addEventListener('click', (event) => {
    const nameForm = nameEntryDialog.querySelector('form');
    const firstPlayerNameInput = nameForm.querySelector('#player1');
    const secondPlayerNameInput = nameForm.querySelector('#player2');
    if (nameForm.checkValidity()) {
        event.preventDefault(); // Prevent form submission
        const playerOne = Player(firstPlayerNameInput.value, 'X');
        const playerTwo = Player(secondPlayerNameInput.value, 'O');
        nameEntryDialog.close();
        setupGame(playerOne, playerTwo);
    }
});
