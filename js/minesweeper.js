///GAME INITIALIZATION
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
if (canvas.addEventListener) { // IE >= 9; other browsers
    canvas.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    }, false);
}
var grid = []; var flagGrid = []; 
var bombsCount = 0;
///GAME VALUES (INPUT)
var width = 40;
var height = 30;
var cell_sizepx = 40;
var bombRatio = 0.20;
///MAIN
var canvas_width = width * cell_sizepx;var canvas_height = height * cell_sizepx;
canvas.height = canvas_height;canvas.width = canvas_width;
initialize_grid(bombRatio);
var tilesCount = width * height - bombsCount;
display_grid();
setup_grid();
////OUTPUT 
//draw game grid
function display_grid() {
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000000";
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.strokeStyle = "#FFFFFF";
    for (i = 0; i <= width; i++) {
        ctx.moveTo(i * cell_sizepx, 0);
        ctx.lineTo(i * cell_sizepx, height * cell_sizepx);
        ctx.stroke();
    }
    for (i = 0; i <= height; i++) {
        ctx.moveTo(0, i * cell_sizepx);
        ctx.lineTo(width * cell_sizepx, i * cell_sizepx);
        ctx.stroke();
    }
}
//display cell # value
function write_number(i, j, n) {
    if (n > -1) {
        ctx.font = "bold 20px Arial";
        switch(n){
        case 0 : ctx.fillStyle = "#AAAAAA";break;
        case 1 : ctx.fillStyle = "#161f9c";break;
        case 2 : ctx.fillStyle = "#16a630";break;
        case 3 : ctx.fillStyle = "#b81c11";break;
        case 4 : ctx.fillStyle = "#0d094f";break;
        case 5 : ctx.fillStyle = "#8c5f11";break;
        case 6 : ctx.fillStyle = "#31e8eb";break;
        case 7 : ctx.fillStyle = "#ffffff";break;
        case 8 : ctx.fillStyle = "#000000";break;
        default : ctx.fillStyle = "#DC965A";break;
        }
        ctx.fillText(n, (i + 0.3) * cell_sizepx, (j + 0.7) * cell_sizepx);
    }
}
//display bombs and flags
function write_symbol(i, j, n, color) {
    ctx.font = "bold 25px Arial";
    ctx.fillStyle = color;
    ctx.fillText(n, (i + 0.3) * cell_sizepx, (j + 0.7) * cell_sizepx);
}
////INPUT 
//mouse event handler
function mouseDown(e) {
    e = e || window.event;
    var x = ~~((event.clientX - 8) / cell_sizepx);
    var y = ~~((event.clientY - 8) / cell_sizepx);
    switch (e.which) {
        case 1: onLeftClick(x, y); break;
        case 3: onRightClick(x, y); break;
    }
}
//called when player clears a cell
function onLeftClick(x, y) {
    if (grid[x][y] == -1) {
        if (flagGrid[x][y] != 1) {
            write_symbol(x, y, "¤", "#2E0F15");
            flagGrid[x][y] = 2;
        }
    }
    else if (grid[x][y] == -2) {/*do nothing*/ }
    else if (grid[x][y] == 0) {
        autoclear(x, y);
    }
    else {
        tilesCount--;
        console.log(tilesCount);
        write_number(x, y, grid[x][y]);
        grid[x][y] = -2;
        flagGrid[x][y] = 2;
    }
}
//called when player places/removes flag
function onRightClick(i, j) {
    if (flagGrid[i][j] != 2){
        if (flagGrid[i][j] == 0) {
            write_symbol(i, j, "F", "#4CB944");
            if (grid[i][j] == -1) bombsCount--;
            document.getElementById("demo").innerHTML = bombsCount + tilesCount;
            flagGrid[i][j] = 1;
        } else {
            write_symbol(i, j, "F", "#FFFFFF");
            if (grid[i][j] == -1) bombsCount++;
            document.getElementById("demo").innerHTML = bombsCount + tilesCount;
            flagGrid[i][j] = 0;
        }
    }
    
}
////GAME LOGIC 
//to be implemented /!\ /!\ /!\
function has_won() {
    console.log("gg");

}
//autoclearing script (QOL)
function autoclear(x, y) {
    var iArray = []; var jArray = [];
    iArray.push(x); jArray.push(y);
    for (n = 0; n < iArray.length; n++) {
        var i = iArray[n]; var j = jArray[n];
        for (l = -1; l < 2; l++) {
            for (k = -1; k < 2; k++) { 
                if ((i + l < width) && (i + l > -1) && (j + k > -1) && (j + k < height)) {
                    if (flagGrid[i + l][j + k] != 2) tilesCount--;
                    flagGrid[i + l][j + k] = 2;
                    write_number(i + l, j + k, grid[i + l][j + k]);
                    if (grid[i + l][j + k] == 0) {
                        grid[i + l][j + k] = -2;
                        iArray.push(i + l);
                        jArray.push(j + k);
                    }
                }
                
            }
        }
    }
}
////GRID INITIALIZATION
//2d array for bombs & flags
function initialize_grid(bomb_ratio) {
    for (var i = 0; i < width; i++) {
        grid[i] = [];
        flagGrid[i] = [];
        for (var j = 0; j < height; j++) {
            flagGrid[i][j] = 0;
            if (Math.random() < bomb_ratio) {
                bombsCount++;
                grid[i][j] = -1;
                write_symbol(i, j, "B", "#FF3C38");
            }
            else grid[i][j] = 0;
        }
    }
}
//adds # bombs for each cell
function setup_grid() {
    for (var i = 0; i < width; i++) {
        for (var j = 0; j < width; j++) {
            if (grid[i][j] != -1) {
                for (l = -1; l < 2; l++) {
                    for (k = -1; k < 2; k++) {
                        if ((i + l < width) && (i + l > -1) && (j + k > -1) && (j + k < height)) {
                            if (grid[i + l][j + k] == -1) {
                                grid[i][j]++;
                            }
                        }
                    }
                }
            }
        }
    }
}