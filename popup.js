var origBoard;
var playRound = 0;
const oPlayer = 'O';
const aiPlayer = 'X';
var currentTabId;

function setCurrentTabId(tabs) {
    currentTabId = tabs[0].id;
}

chrome.tabs.query({
    active: true,
    currentWindow: true
}, setCurrentTabId);


const cells = document.querySelectorAll('.cell');
startGame();

function startGame() {
    document.querySelector(".endgame").style.display = "none";
    //origBoard = Array.from({length: 9}, (_, i) => i + 1);
    origBoard = Array.from(Array(9).keys());
    for (var i = 0; i < cells.length; i++) {
        cells[i].innerText = ''; //clear
        cells[i].style.removeProperty('background-color');
        cells[i].addEventListener('click', turnClick, false);
    }
}


function turnClick(square) {
    if (typeof origBoard[square.target.id] == 'number') { //If the clicked ID is "number", it means that both human and AI have not played in that position. So.....

        turn(square.target.id, oPlayer)

        //After the player takes a turn, check to see if there is a tie
        //if (!checkTie()) turn(bestSpot(), aiPlayer);
    }
}


function turn(squareId, objectPlayer) {
    origBoard[squareId] = objectPlayer; //shows the player who has clicked the cell
    document.getElementById(squareId).innerText = objectPlayer; //put more string in the cell with the ID just called
    //todo: create waiting
    document.getElementsByTagName("body")[0].style.pointerEvents = 'none';
    document.getElementsByTagName("img")[0].style.display = 'block';
    var playerChoices = createOPlayerChoicesString() + createAiPlayerChoicesString();

    chrome.scripting.executeScript({
            target: {
                tabId: currentTabId,
                allFrames: true
            },
            async function (playerChoices) {
                document.getElementById('prompt-textarea').focus();

                let LastAnswerIndex = [...document.getElementsByClassName('w-full text-token-text-primary')].filter((element, index) => index % 2 != 0 && element.localName != "button").length - 1;
                console.log(LastAnswerIndex);
                document.execCommand('insertText', false,
                    `we are playing tic-tac-toe and our playboard starts from 0 to 8, I am starter and ${playerChoices} what is your next position? don't draw the board just say to me what is your next position(say position number)`
                );
                document.querySelector('[data-testid="send-button"]').click();

                //check Result (win / lose / tie)
                var defer = new Promise(resolve => {
                    let interval = setInterval(function () {
                        var element = [...document.getElementsByClassName('w-full text-token-text-primary')].filter((element, index) => index % 2 != 0)[LastAnswerIndex + 1].getElementsByTagName('p')[0];
                        if (element.innerHTML.slice(-1) == '.') {
                            
                            let tmp = element.innerHTML;
                            for (let i = tmp.length - 1; i >= 0; i--) {
                                if (!isNaN(tmp[i]) && !isNaN(parseInt(tmp[i]))) {
                                    console.log(tmp[i]);
                                    clearInterval(interval);
                                    resolve(tmp[i]);
                                    break;
                                }
                            }
                        }
                    }, 1000);
                })
                return defer;
            },
            args: [playerChoices]
        })
        .then(injectionResults => {
            for (const frameResult of injectionResults) {
                const {
                    frameId,
                    result
                } = frameResult;
                origBoard[result] = aiPlayer;
                document.getElementById(result).innerText = aiPlayer;
                document.getElementsByTagName("body")[0].style.pointerEvents = 'auto';
                document.getElementsByTagName("img")[0].style.display = 'none';
            }
        });

    //let gameWon = checkWin(origBoard, objectPlayer) //check win
    //if (gameWon) gameOver(gameWon)
}

function createOPlayerChoicesString() {
    var numberOfChoices = origBoard.filter(x => x == oPlayer).length;

    if (numberOfChoices == 1) {
        return `I Choose position number ${origBoard.indexOf(oPlayer)}`;
    }

    let IndexOfChoices = ``;

    for (let i = 0; i < origBoard.length; i++) {
        if (origBoard[i] == oPlayer) {
            IndexOfChoices += (i + `, `);
        }
    }

    // I Choose position numbers 0 , 3, 5, and 8
    return `I Choose position numbers ${IndexOfChoices.slice(0, IndexOfChoices.length - 3) + `and ` + IndexOfChoices.slice(IndexOfChoices.length - 3)}`.slice(0, -2);
}

function createAiPlayerChoicesString() {
    var numberOfChoices = origBoard.filter(x => x == aiPlayer).length;

    if (numberOfChoices == 0) {
        return ``;
    }

    if (numberOfChoices == 1) {
        return ` while you choose position number ${origBoard.indexOf(aiPlayer)}`;
    }

    let IndexOfChoices = ` `;

    for (let i = 0; i < origBoard.length; i++) {
        if (origBoard[i] == aiPlayer) {
            IndexOfChoices += (i + `, `);
        }
    }

    // `while you choose position numbers 1 , 2, and 4`
    return ` while you choose position numbers ${IndexOfChoices.slice(0, IndexOfChoices.length - 3) + `and ` + IndexOfChoices.slice(IndexOfChoices.length - 3)}`.slice(0, -2);
}

function CheckGameStatus() {
    var numberOfChoices = origBoard.filter(x => x == aiPlayer || x == oPlayer).length;

    if (origBoard[0] == origBoard[1] && origBoard[1] == origBoard[2]) {
        if (origBoard[0] == oPlayer) {
            return 1;
        } else {
            return 0;
        }
    } else if (origBoard[3] == origBoard[4] && origBoard[4] == origBoard[5]) {
        if (origBoard[3] == oPlayer) {
            return 1;
        } else {
            return 0;
        }
    } else if (origBoard[6] == origBoard[7] && origBoard[7] == origBoard[8]) {
        if (origBoard[6] == oPlayer) {
            return 1;
        } else {
            return 0;
        }
    } else if (origBoard[0] == origBoard[3] && origBoard[3] == origBoard[6]) {
        if (origBoard[0] == oPlayer) {
            return 1;
        } else {
            return 0;
        }
    } else if (origBoard[1] == origBoard[4] && origBoard[4] == origBoard[7]) {
        if (origBoard[1] == oPlayer) {
            return 1;
        } else {
            return 0;
        }
    } else if (origBoard[2] == origBoard[5] && origBoard[5] == origBoard[8]) {
        if (origBoard[2] == oPlayer) {
            return 1;
        } else {
            return 0;
        }
    } else if (origBoard[0] == origBoard[4] && origBoard[4] == origBoard[8]) {
        if (origBoard[0] == oPlayer) {
            return 1;
        } else {
            return 0;
        }
    } else if (origBoard[2] == origBoard[4] && origBoard[4] == origBoard[6]) {
        if (origBoard[2] == oPlayer) {
            return 1;
        } else {
            return 0;
        }
    } else if (numberOfChoices == 9) {
        return 0;
    }
}

// function checkWin(board, player) {
//     let plays = board.reduce((a, e, i) =>
//         (e === player) ? a.concat(i) : a, []); /* Use the minify method which will go through every element in the board array. And the concat function will not change the current array, but it will return a new array that will contain the values of the arrays passed in.
//     // a is the final value to be returned
//     // e is the element in the board array we are running through and indexing*/
//     let gameWon = null;
//     for (let [index, win] of winCombos.entries())
//     /* entries: Returns the enumerable property array of [key, value] pairs with the given object, similar to using the for ... in iteration. */ {
//         if (win.every(elem => plays.indexOf(elem) > -1))
//         //In essence the every function has the same effect as using a loop to loop through all elements of the array. 
//         //The indexOf function will look for an element in the array based on the value of the element, it returns the position (key) of the element if found, and -1 if it is not found.
//         {
//             //if the player satisfies any array of values in winCombos
//             gameWon = { index: index, player: player };
//             break;
//         }
//     }
//     return gameWon;
// }

// //create highlights all cells that make up a victory and prevents the user from entering any more boxes
// function gameOver(gameWon) {
//     for (let index of winCombos[gameWon.index]) {
//         document.getElementById(index).style.backgroundColor =
//             gameWon.player == oPlayer ? "blue" : "red";
//     }
//     for (var i = 0; i < cells.length; i++) {
//         cells[i].removeEventListener('click', turnClick, false);
//     }

//     declareWinner(gameWon.player == oPlayer ? "You win!" : "You lose.");
// }

// function declareWinner(whoWin) {
//     document.querySelector(".endgame").style.display = "block";
//     document.querySelector(".endgame .text").innerText = whoWin;
// }

// function emptySquares() {
//     //filter every element from the board array
//     return origBoard.filter(s => typeof s == 'number');
// }

// function bestSpot() {
//     // //Find all blank cells and get first element from blank cell. So the AI will always play the first slot
//     // return emptySquares()[0];

//     return minimax(origBoard, aiPlayer).index;
// }

// function checkTie() {
//     if (emptySquares().length == 0) {
//         for (var i = 0; i < cells.length; i++) {
//             cells[i].style.backgroundColor = "pink";
//             cells[i].removeEventListener('click', turnClick, false);
//         }
//         declareWinner("Tie Game!")
//         return true;
//     }
//     return false;
// }

// function minimax(newBoard, player) {
//     //  find the indexes of the available spots in the board and set them to a variable called availSpots
//     var availSpots = emptySquares();

//     // check terminal states
//     if (checkWin(newBoard, oPlayer)) {
//         return { score: -10 }; // O win
//     } else if (checkWin(newBoard, aiPlayer)) {
//         return { score: 10 }; // X win
//     } else if (availSpots.length === 0) {
//         return { score: 0 }; // tie
//     }
//     // Next, you need to collect the scores from each of the empty spots to evaluate later.
//     var moves = [];
//     //  Therefore, make an array called moves and loop through empty spots while collecting each move’s index and score in an object called move.
//     for (var i = 0; i < availSpots.length; i++) {
//         var move = {};
//         // Then, set the index number of the empty spot that was stored as a number in the origBoard to the index property of the move object
//         move.index = newBoard[availSpots[i]];
//         // set the empty spot on the newboard to the current player
//         newBoard[availSpots[i]] = player;

//         // store the object resulted from the minimax function call that includes a score property to the score property of the move object.
//         if (player == aiPlayer) {
//             var result = minimax(newBoard, oPlayer);
//             move.score = result.score;
//         } else {
//             var result = minimax(newBoard, aiPlayer);
//             move.score = result.score;
//         }

//         newBoard[availSpots[i]] = move.index;

//         // minimax reset new board to what it was before and pushes the move object to the moves aray
//         moves.push(move);
//     }

//     // Then, the minimax algorithm needs to evaluate the best move in the moves array
//     var bestMove;
//     // It should choose the move with the highest score when AI is playing and the move with the lowest score when the human is playing. So...
//     if (player === aiPlayer) {
//         // If the player is aiPlayer, it sets a variable called bestScore to a very low number and loops through the moves array, 
//         var bestScore = -10000;
//         for (var i = 0; i < moves.length; i++) {
//             // if a move has a higher score than bestScore, the algorithm stores that move
//             if (moves[i].score > bestScore) {
//                 bestScore = moves[i].score;
//                 bestMove = i; // In case there are moves with similar score, only the first one will be stored.
//             }
//         }
//     } else {
//         var bestScore = 10000;
//         for (var i = 0; i < moves.length; i++) {
//             if (moves[i].score < bestScore) {
//                 bestScore = moves[i].score;
//                 bestMove = i;
//             }
//         }
//     }

//     return moves[bestMove];
// }

// // Replay Tic Tac Toe button
// const docStyle = document.documentElement.style
// const aElem = document.querySelector('a')
// const boundingClientRect = aElem.getBoundingClientRect()

// aElem.onmousemove = function (e) {

//     const x = e.clientX - boundingClientRect.left
//     const y = e.clientY - boundingClientRect.top

//     const xc = boundingClientRect.width / 2
//     const yc = boundingClientRect.height / 2

//     const dx = x - xc
//     const dy = y - yc

//     docStyle.setProperty('--rx', `${dy / -1}deg`)
//     docStyle.setProperty('--ry', `${dx / 10}deg`)
// }

// aElem.onmouseleave = function (e) {
//     docStyle.setProperty('--ty', '0')
//     docStyle.setProperty('--rx', '0')
//     docStyle.setProperty('--ry', '0')
// }

// aElem.onmousedown = function (e) {
//     docStyle.setProperty('--tz', '-25px')
// }

// document.body.onmouseup = function (e) {
//     docStyle.setProperty('--tz', '-12px')
// }