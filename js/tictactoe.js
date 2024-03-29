let board = [];
let n;
let m;
let winner = false;

function generateBoard(){
    n = document.getElementById('boardSize').value;
    m = document.getElementById('target').value;
    let agentStart = document.getElementById('agentStart').checked;
    console.log(agentStart)

    document.getElementById('boardSize').disabled = true;
    document.getElementById('target').disabled = true;
    document.getElementById('agentStart').disabled = true;

    n = parseInt(n)
    if (n == "" || m == ""){
        alert("Please insert board size and target!")
        restartGame();
        return
    }
    if (n < 3){
        alert("Minimum size 3 to play this game!")
        restartGame();
        return;
    }
    if (n > 20){
        alert("Maximum size 20 to play this game! It will take a long time for agent to make a move")
        restartGame();
        return;
    }
    if (m > n){
        alert("Target have to be smaller or equals to n")
        restartGame();
        return;
    }
    boardHtml = ""
    for (let i = 0; i < n; i++){
        boardHtml += '<div class="ttt-row">';
        for (let j = 0; j < n; j++){
            boardHtml += '<span class="ttt-cell" id="grid' + ((i*n)+j) + '" onclick="clickGrid(this)"></span>'
            board.push("-");
        }
        boardHtml += '</div>'
    }
    document.getElementById("tictactoe-board").innerHTML = boardHtml;
    document.getElementById('submitButton').disabled = true;

    // if agent start first, call agent
    if (agentStart){
        deactivatedList = deactivateAllCell();
        waitForAgent();
        moveNum = runAgent("-");
        reactivateCell(deactivatedList, moveNum);
    }
    takeYourMove();
}

function deactivateAllCell(){
    let list = document.getElementsByClassName("ttt-cell");
    let deactivatedList = []
    for (const item of list){
        if (item.style.pointerEvents != 'none'){
            item.style.pointerEvents = 'none';
            deactivatedList.push(item);
        }
    }
    return deactivatedList
}

function reactivateCell(itemList, moveNum){
    if (!winner){
        for (const item of itemList){
            console.log("grid" + moveNum, item.id)
            if (!(item.id == "grid" + moveNum)){
                item.style.pointerEvents = 'auto';
                console.log(item)
            }
        }
    }
}

function restartGame(){
    document.getElementById('boardSize').disabled = false;
    document.getElementById('target').disabled = false;
    document.getElementById('agentStart').disabled = false;
    document.getElementById('submitButton').disabled = false;
    
    document.getElementById("tictactoe-board").innerHTML = "";
    board = [];
    n = null;
    m = null;
    winner = false;
    document.getElementById("ttt-results").innerHTML = "Let's go!!!";
}

async function updateBoard(sign, moveNum){
    object = document.getElementById("grid" + moveNum);
    object.innerHTML = sign;
    object.style.pointerEvents = 'none';
    board[moveNum] = sign;
}

async function clickGrid(object){
    let i = object.id.substring(4);
    i = parseInt(i);
    await updateBoard("O", i);

    // check if user win
    await checkWin("O", i);

    if (!winner){
        // call agent
        deactivatedList = deactivateAllCell();
        waitForAgent();
        moveNum = await runAgent(i);
        reactivateCell(deactivatedList, moveNum);
        takeYourMove();
    }
}

function waitForAgent(){
    document.getElementById("ttt-results").innerHTML = "Please wait for agent... Big board might take longer :( p/s: will improve this";
}

function takeYourMove(){
    if (!winner){
        document.getElementById("ttt-results").innerHTML = "Make your move!";
    }
}

function compressBoard(){
    return board.join("");
}

async function runAgent(prevMove){
    dataPOST = {
        n: n,
        target: m,
        boardString: compressBoard(),
        prevMove: prevMove
    };
    response = await fetch('https://tictactoe-be.herokuapp.com/getMove', {
        method: "POST",
        body: JSON.stringify(dataPOST),
        headers: { 'Content-Type': 'application/json' },
    });
    data = await response.json();
    
    let i = parseInt(data['agent']);
    await updateBoard("X", i);
    await checkWin("X", i);
    return i;
}

async function checkWin(sign, prevMove){
    dataPOST = {
        n: n,
        target: m,
        boardString: compressBoard(),
        prevSign: sign,
        prevMove: prevMove
    };
    response = await fetch('https://tictactoe-be.herokuapp.com/getWinner', {
        method: "POST",
        body: JSON.stringify(dataPOST),
        headers: { 'Content-Type': 'application/json' },
    });
    data = await response.json();
    console.log(data['winner'])
    if (data['winner'] == sign){
        document.getElementById("ttt-results").innerHTML = "Yay! Winner is " + sign;
        winner = true;
        deactivateAllCell();
    }
    else if (data['winner'] == 'Tie'){
        document.getElementById("ttt-results").innerHTML = "It's a tie!!!";
        winner = true;
    }
}

// onload activate GET api - to wake Heroku API server
window.onload = () => {
    fetch('https://tictactoe-be.herokuapp.com')
        .then(res => res.text())
        .then(data => {
        })
        .catch(error => {
            console.log(error);
        })
};