var rows_columns = 3;

var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");

// Handle keyboard controls
var key = 0;

ctx.fillStyle = "#660066";
ctx.font = "24px Arial";
ctx.textAlign = "left";
ctx.textBaseline = "top";
ctx.fillText("Press Enter to play", c.width - c.width/1.75, c.height - c.height/1.75);

var gameState = "start";
var game = setup(rows_columns);

addEventListener("keyup", function (e) {       //event listener for arrow keys
                 key = e.keyCode;
                 gameState = update(game,key); //updates the game and renders every time a key is pressed.
                 render(game);
                 if (gameState == "win") {     //win state handler
                    if (rows_columns == 8) {
                        alert("YOU WON THE WHOLE GAME!!! NEW GAME+!");
                        rows_columns = 2;
                    }
                    alert("Next Level!!");
                    reveal(game);
                    render(game);
                    rows_columns++;
                    game = setup(rows_columns);
                    ctx.fillStyle = "#000000";
                    ctx.font = "24px Arial";
                    ctx.textAlign = "left";
                    ctx.textBaseline = "top";
                    ctx.fillText("Press Enter to go to the next level", c.width - c.width/1.75, c.height - c.height/1.75);
                 }
                 if (gameState == "lose") {     //lose state handler
                    alert("You Made it through " + (rows_columns-3) + " levels");
                    reveal(game);
                    render(game);
                    rows_columns = 3;
                    game = setup(rows_columns);
                 }
                 }, false);

//setup function creates the game object along with all of its characteristics.
function setup(rows_columns) {
    
    //initilize lives
    var lives = Math.ceil(rows_columns/2 + 1);
    
    //create empty board
    var board = new Array(rows_columns);
    for (var i = 0; i < rows_columns; i++) {
        board[i] = new Array(rows_columns);
        for (var j = 0; j < rows_columns; j++) {
            board[i][j] = {visibility: false, value: "empty"};
        }
    }
    
    //create empty path and code
    var code = new Array(rows_columns*2);
    var path = new Array(rows_columns*2);
    
    //create random start location
    var x = Math.round(Math.random()*(rows_columns-1));
    var y = Math.round(Math.random()*(rows_columns-1));
    
    //update board and path
    board[x][y].value = "start";
    path[0] = {x: x,y: y};
    
    //create a random path
    for (i = 1; i < code.length; i++) {
        
        //utilize the smartDirections function to create a smart path.
        var AI = smartDirections(x,y,path,rows_columns);
        
        //choose at random one of the valid directions
        var next = Math.floor(Math.random()*AI.validDirections.length);
        
        //update game objects
        code[i] = AI.validDirections[next];
        x = AI.validX[next];
        y = AI.validY[next];
        board[x][y].value = "path";
        path[i] = {x: x,y: y};
    }
    //place end tile.
    board[x][y].value = "end";
    
    //initilize player at the start of the path.
    var player = {x: path[0].x, y: path[0].y};
    
    //create and shuffle emojis array
    var emojis = [0x1F422,0x1F420,0x1F40C,0x1F32F,0x1F980,0x1F34A,0x1F43C,0x1F413,0x1F427,0x1F419,0x1F41E,0x1F346,0x1F423];
    var encoding = shuffle(emojis);
    
    //create game object and return it.
    var game = {code: code,board: board,player: player,encoding: encoding, rows_columns: rows_columns, lives: lives, emojis:emojis};
    return game;
}

function shuffle(array) { //standard fisher yates shuffle technique for the emojis.
    var currentIndex = array.length, temporaryValue, randomIndex;
    
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    
    return array;
}

//used to create a smart path
function smartDirections(x,y,path,rows_columns) {
    
    //initilize possible directions
    var Directions = ["west","north","east","south"];
    var smartDirections = ["west","north","east","south"];
    
    //initilize possible coords.
    var possibleX = [x-1,x,x+1,x];
    var possibleY = [y,y-1,y,y+1];
    
    //check all possible directions
    for (var i = 0; i < 4; i++) {
        
        //out of bounds check.
        if (possibleX[i] < 0 || possibleX[i] >= rows_columns || possibleY[i] < 0 || possibleY[i] >= rows_columns) {
            delete Directions[i];
            delete smartDirections[i];
        }
        //already on path check
        for (var j = 0; j < path.length; j++) {
            if (path[j] !== null) {
                if (possibleX[i] == path[j].x && possibleY[i] == path[j].y) {
                    delete smartDirections[i];
                }
            }
        }
    }
    var validDirections = [];
    var validX = [];
    var validY = [];
    
    //create valid arrays
    for (i = 0; i < 4; i++) {
        if (smartDirections[i] !== null) {
            validDirections.push(smartDirections[i]);
            validX.push(possibleX[i]);
            validY.push(possibleY[i]);
        }
    }
    
    if (validDirections.length === 0) {
        validDirections = [];
        for (i = 0; i < 4; i++) {
            if (Directions[i] !== null) {
                validDirections.push(Directions[i]);
                validX.push(possibleX[i]);
                validY.push(possibleY[i]);
            }
        }
    }
    
    //return the valid directions.
    return {validDirections: validDirections, validX: validX, validY: validY};
}

function render(game) {         //rendering function updates graphics
    ctx.clearRect(0, 0, c.width, c.height);
    game.board[game.player.x][game.player.y].visibility = true;
    ctx.fillStyle = "#ffff66";
    ctx.strokeStyle = "#663300";
    
    for (var w = 0; w < c.height; w += c.height/game.rows_columns) {               //draw the empty tiles
        for (var l = 0; l < c.height; l += c.height/game.rows_columns) {
            ctx.strokeRect(w, l, Math.round(c.height/game.rows_columns),  Math.round(c.height/game.rows_columns));
            ctx.fillRect(w+1, l+1,  Math.round(c.height/game.rows_columns-1),  Math.round(c.height/game.rows_columns-1));
        }
    }
    
    //draw the compass
    ctx.fillStyle = "#00FF00";
    ctx.font = "36px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("N", c.width - 250, 0);
    ctx.fillText("W", c.width - 290, 30);
    ctx.fillText("E", c.width - 220, 30);
    ctx.fillText("S", c.width - 250, 60);
    
    //draw start symbol
    ctx.fillStyle = "#00ff00";
    ctx.fillRect(c.width - 430, 0, 20, 20);
    
    //draw end symbol
    ctx.fillStyle = "#990099";
    ctx.fillRect(c.width - 430, game.code.length*30, 20, 20);
    
    //draw the coded path.
    for (var i = 1; i < game.code.length; i++) {
        ctx.fillStyle = "#ff0f00";
        ctx.font = "24px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        if (game.code[i] == "west") {
            ctx.fillText(String.fromCodePoint(game.encoding[0]), c.width - 430, i*30);
        } else if (game.code[i] == "north") {
            ctx.fillText(String.fromCodePoint(game.encoding[1]), c.width - 430, i*30);
        } else if (game.code[i] == "east") {
            ctx.fillText(String.fromCodePoint(game.encoding[2]), c.width - 430, i*30);
        } else if (game.code[i] == "south") {
            ctx.fillText(String.fromCodePoint(game.encoding[3]), c.width - 430, i*30);
        }
    }
    
    //draw the
    ctx.fillText(String.fromCodePoint(game.emojis[0]), c.width - 435, 610);
    ctx.fillText(String.fromCodePoint(game.emojis[1]), c.width - 400, 610);
    ctx.fillText(String.fromCodePoint(game.emojis[2]), c.width - 365, 610);
    ctx.fillText(String.fromCodePoint(game.emojis[3]), c.width - 330, 610);
    
    for (var x = 0; x < game.rows_columns; x++) {
        for (var y = 0; y < game.rows_columns; y++) {
            if (game.board[x][y].visibility) {
                if (game.board[x][y].value == "path") {
                    ctx.fillStyle = "#996633";
                    ctx.fillRect((x*c.height/game.rows_columns + c.height/(game.rows_columns*4)), (y*c.height/game.rows_columns + c.height/(game.rows_columns*4)), c.height/(game.rows_columns*2), c.height/(game.rows_columns*2));
                }
                if (game.board[x][y].value == "end") {
                    ctx.fillStyle = "#990099";
                    ctx.fillRect((x*c.height/game.rows_columns + c.height/(game.rows_columns*4)), (y*c.height/game.rows_columns + c.height/(game.rows_columns*4)), c.height/(game.rows_columns*2), c.height/(game.rows_columns*2));
                }
                if (game.board[x][y].value == "start") {
                    ctx.fillStyle = "#00ff00";
                    ctx.fillRect((x*c.height/game.rows_columns + c.height/(game.rows_columns*4)), (y*c.height/game.rows_columns + c.height/(game.rows_columns*4)), c.height/(game.rows_columns*2), c.height/(game.rows_columns*2));
                }
                if (game.board[x][y].value == "empty") {
                    ctx.fillStyle = "#ff0000";
                    ctx.fillRect((x*c.height/game.rows_columns + c.height/(game.rows_columns*4)), (y*c.height/game.rows_columns + c.height/(game.rows_columns*4)), c.height/(game.rows_columns*2), c.height/(game.rows_columns*2));
                }
            }
        }
    }
    ctx.fillStyle = "#00fff0";
    ctx.fillRect((game.player.x*c.height/game.rows_columns + c.height/((game.rows_columns-1)*3)), (game.player.y*c.height/game.rows_columns + c.height/((game.rows_columns-1)*3)), c.height/(game.rows_columns*4), c.height/(game.rows_columns*4));
    
    ctx.fillStyle = "#0000ff";
    ctx.font = "24px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("lives: " + game.lives, c.width - 100, 0);
}

function update(game,key) {         //updates player lives and position.
    var nextMove = {x: game.player.x, y: game.player.y};
    if (game.board[game.player.x][game.player.y].value == "end") {
        return "win";
    } else if(game.lives === 0) {
        return "lose";
    } else {
        if (key == 37) {
            nextMove.x = game.player.x-1;
            if (validMove(game, nextMove)) {
                game.player.x--;
            }
            key = 0;
        }
        else if (key == 38) {
            nextMove.y = game.player.y-1;
            if (validMove(game, nextMove)) {
                game.player.y--;
            }
            key = 0;
        }
        else if (key == 39) {
            nextMove.x = game.player.x+1;
            if (validMove(game, nextMove)) {
                game.player.x++;
                game.points++;
            }
            key = 0;
        }
        else if (key == 40) {
            nextMove.y = game.player.y+1;
            if (validMove(game, nextMove)) {
                game.player.y++;
            }
            key = 0;
        } else {
            return "playing";
        }
    }
}

function validMove(game, nextMove) {    //valid move function used in update function.
    if (nextMove.x > (game.rows_columns-1) || nextMove.x < 0 || nextMove.y > (game.rows_columns-1) || nextMove.y < 0) {
        return false;
    }
    
    if (!game.board[nextMove.x][nextMove.y].visibility) {
        game.board[nextMove.x][nextMove.y].visibility = true;
    } else if (game.board[nextMove.x][nextMove.y].value == "empty") {
        return false;
    }
    
    if (game.board[nextMove.x][nextMove.y].value != "empty") {
        return true;
    } else {
        game.lives--;
        return false;
    }
}

function reveal(game) {
    for (var i = 0; i < game.rows_columns; i++) {
        for (var j = 0; j < game.rows_columns; j++) {
            game.board[i][j].visibility = true;
        }
    }
}
