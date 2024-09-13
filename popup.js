var origBoard;
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

    }
}


function turn(squareId, objectPlayer) {
    origBoard[squareId] = objectPlayer; //shows the player who has clicked the cell
    document.getElementById(squareId).innerText = objectPlayer; //put more string in the cell with the ID just called
    //todo: create waiting
    document.getElementsByTagName("body")[0].style.pointerEvents = 'none';

    if (IsGameFinished()) {
        return;
    }

    document.getElementsByTagName("img")[0].style.display = 'block'; 

    var playerChoices = createOPlayerChoicesString() + createAiPlayerChoicesString();

    chrome.scripting.executeScript({
            target: {
                tabId: currentTabId,
                allFrames: true
            },
            async function (playerChoices) {
                document.getElementById('prompt-textarea').focus();

                let LastAnswerIndex = [...document.getElementsByClassName('w-full text-token-text-primary focus-visible:outline-2 focus-visible:outline-offset-[-4px]')].filter((element, index) => index % 2 != 0 && element.localName != "button").length;
                console.log(LastAnswerIndex);
                document.execCommand('insertText', false,
                    `we are playing tic-tac-toe and our playboard starts from 0 to 8, I am starter and ${playerChoices} what is your next position? don't draw the board just say to me what is your next position(say position number)`
                );
                
                let inter = setInterval(function(){
                    var qs = document.querySelector('[data-testid="send-button"]');
                    if(qs.disabled == false){
                        qs.click();
                        clearInterval(inter);
                    }

                })

                //check Result (win / lose / tie)
                var defer = new Promise(resolve => {
                    let interval = setInterval(function () {
                        var element = [...document.getElementsByClassName('w-full text-token-text-primary focus-visible:outline-2 focus-visible:outline-offset-[-4px]')].filter((element, index) => index % 2 != 0)[LastAnswerIndex].getElementsByTagName('p')[0];
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
                document.getElementsByTagName("img")[0].style.display = 'none';
                IsGameFinished();
            }
        });
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

function IsGameFinished() {

    let status = checkGameStatus();
    if (status == 1) {
        document.querySelector(".endgame .text").innerText = "congratulations! you won our AI:)";
    } else if (status == -1) {
        document.querySelector(".endgame .text").innerText = "I can't believe it! you lose from our AI :(";
    } else if (status == 0) {
        document.querySelector(".endgame .text").innerText = "try harder! you can win this game!";
    } else if (status == -2) {
        document.getElementsByTagName("body")[0].style.pointerEvents = 'auto';
        return false;
    }
    document.querySelector(".endgame").style.display = "block";
    return true;
}

function checkGameStatus() {
    var numberOfChoices = origBoard.filter(x => x == aiPlayer || x == oPlayer).length;

    if (origBoard[0] == origBoard[1] && origBoard[1] == origBoard[2]) {
        if (origBoard[0] == oPlayer) {
            return 1;
        } else {
            return -1;
        }
    } else if (origBoard[3] == origBoard[4] && origBoard[4] == origBoard[5]) {
        if (origBoard[3] == oPlayer) {
            return 1;
        } else {
            return -1;
        }
    } else if (origBoard[6] == origBoard[7] && origBoard[7] == origBoard[8]) {
        if (origBoard[6] == oPlayer) {
            return 1;
        } else {
            return -1;
        }
    } else if (origBoard[0] == origBoard[3] && origBoard[3] == origBoard[6]) {
        if (origBoard[0] == oPlayer) {
            return 1;
        } else {
            return -1;
        }
    } else if (origBoard[1] == origBoard[4] && origBoard[4] == origBoard[7]) {
        if (origBoard[1] == oPlayer) {
            return 1;
        } else {
            return -1;
        }
    } else if (origBoard[2] == origBoard[5] && origBoard[5] == origBoard[8]) {
        if (origBoard[2] == oPlayer) {
            return 1;
        } else {
            return -1;
        }
    } else if (origBoard[0] == origBoard[4] && origBoard[4] == origBoard[8]) {
        if (origBoard[0] == oPlayer) {
            return 1;
        } else {
            return -1;
        }
    } else if (origBoard[2] == origBoard[4] && origBoard[4] == origBoard[6]) {
        if (origBoard[2] == oPlayer) {
            return 1;
        } else {
            return -1;
        }
    } else if (numberOfChoices == 9) {
        return 0;
    } else {
        return -2;
    }
}