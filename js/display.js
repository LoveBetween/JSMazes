var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
////////////////////////////////////////////////
var soundPlayer = new Audio();
soundPlayer.src = "sounds/coin.mp3";
soundPlayer.mozPreservesPitch = false;
////////////////////////////////////////////////
var width = 11; var height = 10;
var cell_sizepx = 30;
canvas.width  = width * cell_sizepx;
canvas.height  = height * cell_sizepx;
////////////////////////////////////////////////

var grid = [[0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
            [1, 1, 1, 0, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
            [0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
            [1, 1, 1, 0, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 1, 0, 1, 1, 1, 1],
            [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
/*
var grid = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 0, 1, 0],
            [0, 1, 0, 0, 0, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 1, 1, 1, 0, 1, 0],
            [0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];*/
/*for( var i = 0; i < width; i++){
    grid[i] = Array(height).fill(0);
}*/
async function playNote(f){
    if(!f)return;
    var max_pitch = 1.0;
    var min_pitch = 0.1;
    fmax=Math.sqrt(81);
    var pitch = (fmax-Math.sqrt(f))/fmax*max_pitch+min_pitch;
    console.log(pitch);
    soundPlayer.playbackRate = pitch;
    soundPlayer.currentTime = 0;
    soundPlayer.play();
}

function display_grid(width, height) {
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

function fill_cell(x,y, colour){
    ctx.beginPath();
    ctx.rect(x * cell_sizepx+1 , y * cell_sizepx+1, cell_sizepx-2, cell_sizepx-2);
    ctx.fillStyle = colour;
    ctx.fill();
    ctx.closePath();
}
function draw_fgh(x,y,f,g,h){
    ctx.fillStyle = "#ffffff";
    ctx.fillText( f, x * cell_sizepx+2, (y+1) * cell_sizepx-2);
}

function create_maze(grid, border = false){
    if (border){
        for(var i=0; i <width; i++){
            grid[i][0] = 1;
            grid[i][height-1] = 1;
        }
        for(var i=0;i <height;i++){
            grid[0][i] = 1;
            grid[width-1][i] = 1;
        }
    }
}
function fill_grid(grid){
    for(var i=0; i<width;i++){
        for(var j=0; j<height; j++){
            if(grid[i][j]==1) fill_cell(i, j, "#888888");
        }
    }
}
function draw_path(path, colour) {
    for( var i = 1; i<path.length-1; i++){
        fill_cell(path[i][0], path[i][1], colour);
    }
}

class Node {
    constructor(parent, position){
        this.parent = parent;
        this.position = position;

        this.g = 0;
        this.h = 0;
        this.f = 0;
    }
    equals(other){
        return this.position[0] == other.position[0] &&
            this.position[1] == other.position[1];
    }
}
function delay(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

async function astar(grid, width, height, start, end){

    //create start and end nodes
    var start_node = new Node(null, start);
    var end_node = new Node(null, end);

    // Initialize open and closed lists
    var open_list = [];
    var closed_list = [];

    open_list.push(start_node);

    //Loop untill the end is found

    while (open_list.length > 0){
        await delay(110);
        // Get current Node
        
        var current_node = open_list[0];
        
        var current_index = 0;

        for(var i=1; i<open_list.length; i++){
            if(open_list[i].f < current_node.f){
                current_node = open_list[i];
                current_index = i;
            }
        }
        // Pop current off open list, add to closed list
        open_list.splice(current_index,1);
        closed_list.push(current_node);
        draw_fgh(current_node.position[0], current_node.position[1], current_node.f, current_node.g, current_node.h);
        playNote(current_node.f);
        // Found the goal
        if (current_node.equals(end_node)){
            var path = [];
            var current = current_node;
            while (current != null){
                path.push(current.position);
                current = current.parent;
            }
            draw_path(path, "#37eb34");
            return path;
        }

        //generate children
        var children = []
        //var pos = [[1,2],[-1,2],[-1,-2],[1,-2],  [2,1],[2,-1],[-2,-1],[-2,1]];
        var pos = [ [0, -1], [0, 1], [-1, 0], [1, 0],[1, -1], [1, 1], [-1, 1], [-1, -1]];
        //var pos = [ [0, -1], [0, 1], [-1, 0], [1, 0] ];//4 degrees
        
        for(var i =0; i<pos.length; i++){
            var node_position = [current_node.position[0] + pos[i][0], current_node.position[1] + pos[i][1]];
            //Make sure within range
            //console.log([node_position[0], node_position[1]]); 
            if (node_position[0] > width -1 || node_position[0] < 0 || node_position[1] > height -1 || node_position[1] < 0)
                continue;
            //Make sure walkable terrain
            if (grid[node_position[0]][node_position[1]] != 0)
                continue;
            
            // draw gfoivujnpdsezokfip
            //if(!(node_position[0]==start[0] && node_position[1]==start[1]) && !(node_position[0]==end[0] && node_position[1]==end[1]))fill_cell(node_position[0], node_position[1], "#ffffff"); //white
            //Create new node
            var new_node = new Node(current_node, node_position);

            //Append
            children.push(new_node);
        }
        //Loop through children
        outer : for(var i =0; i<children.length; i++){
            var child = children[i];

            //Child is on the closed list
            for(var j =0; j<closed_list.length; j++){
                if (child.equals(closed_list[j]))
                    continue outer;
            }
                
            //Create the f, g, and h values
            child.g = current_node.g + 1;
            child.h = ((child.position[0] - end_node.position[0]) ** 2) + ((child.position[1] - end_node.position[1]) ** 2);
            //child.h = Math.abs((child.position[0] - end_node.position[0])) + Math.abs((child.position[1] - end_node.position[1]));
            child.f = child.g + child.h;

            //Child is already in the open list
            for(var j =0; j<open_list.length; j++){
                if (child.equals(open_list[j]) && child.g > open_list[j].g)
                    continue outer;
            }

            //Add the child to the open list
            open_list.push(child);
        }
    }
    console.log("didn't find path");
}
//create_maze(grid)
display_grid(width, height);
fill_grid(grid)


var start = [0, 0];
var end = [6,7];
var fmax  = width*height + Math.max(start[0], width-start[0]) **2 
                        + Math.max(start[1], height-start[1]) **2;
fill_cell(start[0], start[1], "#039dfc"); //blue
fill_cell(end[0], end[1], "#eb3434"); //blue

var path = astar(grid,width, height, start, end);
//draw_path(path, "#37eb34");