var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
//////////////////////////////////////////////// sound setup
var soundPlayer = new Audio();
soundPlayer.src = "sounds/coin.mp3";
soundPlayer.mozPreservesPitch = false;
//////////////////////////////////////////////// grid setup
var grid, grid_copy;
var width = 21, height = 21;
var cell_sizepx = 20;
var maze_generation = false;
//////////////////////////////////////////////// colour setup
var bgColour = "#000000";
var gridColour = "#FFFFFF";
var wallColour = "#888888";
var visitedColour = "#FFFFFF";
var textColour = "#FFFFFF";
var pathColour = "#37eb34";
var pathColour2 = [245, 66, 66];
var pathColour1 = [245, 188, 66];
var startColour = "#039dfc";
var endColour = "#eb3434";
var tipColour = "#c0392b";
//////////////////////////////////////////////// miscellaneous variables
var algo_delay = 10, maze_delay = 0, path_delay = 10;
var startTime, endTime;
var max_pitch = 1.0, min_pitch = 0.1;
var frequency_ratio = 100;
var gain_volume = 0;//0.05

//var degrees = [ [0, -1], [0, 1], [-1, 0], [1, 0],[1, -1], [1, 1], [-1, 1], [-1, -1]];
//var degrees = [[1,2],[-1,2],[-1,-2],[1,-2],  [2,1],[2,-1],[-2,-1],[-2,1]]; //knight   
var degrees = [ [0, -1], [0, 1], [-1, 0], [1, 0] ];//4 degrees
//////////////////////////////////////////////// menu

const inputWidth = document.getElementById("width");
const inputHeight = document.getElementById("height");

function dropDownFunction(a) {
    a.parentNode.getElementsByClassName("dropdown-content")[0].classList.toggle("show");
  }
function dropDownFunction2() {
    document.getElementById("myDropdown").classList.toggle("show");
  }
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) 
                openDropdown.classList.remove('show');
        }
    }
} 
function reloadPage() {
    location.reload();
}
function evenNumberAlert(){
    alert("This algorithm is not meant for an even width or height.");
}
//////////////////////////////////////////////// sound
//plays a soundfile at different frequencies
async function playNote(f){
    if(!f)return;
    fmax=Math.sqrt(81);
    var pitch = (fmax-Math.sqrt(f))/fmax*max_pitch+min_pitch;
    console.log(pitch);
    soundPlayer.playbackRate = pitch;
    soundPlayer.currentTime = 0;
    soundPlayer.play();
}
//plays an oscillator at different frequencies
async function playNote2(frequency, duration) {
    // create Oscillator node
    var audioCtx = new(window.AudioContext || window.webkitAudioContext)();
    var volume = audioCtx.createGain();
    volume.connect(audioCtx.destination);
    volume.gain.value = gain_volume;

    var oscillator = audioCtx.createOscillator();
    frequency = Math.log(frequency+1)*frequency_ratio;
    oscillator.type = 'triangle';
    oscillator.frequency.value = frequency; // value in hertz
    oscillator.connect(volume);
    oscillator.start();

    setTimeout(
        function() {
          oscillator.stop();
        }, duration);
}
//////////////////////////////////////////////// display
function display_grid(width, height) {
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = bgColour;
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.strokeStyle = gridColour;
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

function fill_grid(grid){
    for(let i=0; i<width;i++){
        for(let j=0; j<height; j++){
            if(grid[i][j]==1) fill_cell(i, j, wallColour);
        }
    }
}
async function draw_path(path, colour) {
    for(let i = 1; i<path.length-1; i++){
        fill_cell(path[i][0], path[i][1], colour);
    }
}
async function draw_path_animation(path, colour){
    for(let i = 1; i<path.length-1; i++){
        fill_cell(path[i].position[0], path[i].position[1], colour);
        playNote2(Math.log(path[i].h+1)*300, Math.floor(path_delay*0.9));
        await delay(path_delay);
    }
}
function Interpolate(val, min, max, cmin, cmax) {
    if(val<=min)return cmin;
    if(val>=max)return cmax;
    return Math.floor(val/(max - min)*(cmax-cmin)+cmin);
}
function gradientColour(val, min, max, colour1, colour2){
    let r = Interpolate(val, min, max, colour1[0], colour2[0]);
    let g = Interpolate(val, min, max, colour1[1], colour2[1]);
    let b = Interpolate(val, min, max, colour1[2], colour2[2]);
    return "rgb("+r+","+g+","+b+")";
}
//////////////////////////////////////////////// pathfinding algorithms
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
async function astar(grid, width, height, start, end, degrees){
    //create start and end nodes
    let start_node = new Node(null, start);
    let end_node = new Node(null, end);
    // Initialize open and closed lists
    let open_list = [];
    let closed_list = [];
    open_list.push(start_node);
    //Loop untill the end is found
    while (open_list.length > 0){
        if(algo_delay)
            await delay(algo_delay);
        // Get current Node
        
        let current_node = open_list[0];
        let current_index = 0;

        for(let i=1; i<open_list.length; i++){
            if(open_list[i].f < current_node.f){
                current_node = open_list[i];
                current_index = i;
            }
        }
        // Pop current off open list, add to closed list
        open_list.splice(current_index,1);
        closed_list.push(current_node);
        draw_fgh(current_node.position[0], current_node.position[1], current_node.f, current_node.g, current_node.h);
        playNote2(current_node.f, algo_delay);
        // Found the goal
        if (current_node.equals(end_node)){
            let path = [];
            let current = current_node;
            while (current != null){
                path.push(current.position);
                current = current.parent;
            }
            draw_path(path, pathColour);
            return path;
        }
        //generate children
        let children = []

        for(let i =0; i<degrees.length; i++){
            let node_position = [current_node.position[0] + degrees[i][0], current_node.position[1] + degrees[i][1]];
            //Make sure within range
            if (node_position[0] > width -1 || node_position[0] < 0 || node_position[1] > height -1 || node_position[1] < 0)
                continue;
            //Make sure walkable terrain
            if (grid[node_position[0]][node_position[1]] != 0)
                continue;
            //Create new node
            let new_node = new Node(current_node, node_position);
            //Append
            children.push(new_node);
        }
        //Loop through children
        outer : for(let i =0; i<children.length; i++){
            let child = children[i];
            //Child is on the closed list
            for(let j =0; j<closed_list.length; j++){
                if (child.equals(closed_list[j]))
                    continue outer;
            }  
            //Create the f, g, and h values
            child.g = current_node.g + 1;
            child.h = ((child.position[0] - end_node.position[0]) ** 2) + ((child.position[1] - end_node.position[1]) ** 2);
            child.f = child.g + child.h;

            //Child is already in the open list
            for(let j =0; j<open_list.length; j++){
                if (child.equals(open_list[j]) && child.g > open_list[j].g)
                    continue outer;
            }
            //Add the child to the open list
            open_list.push(child);
        }
    }
    console.log("didn't find path");
}

async function dijkstra(grid, width, height, start, end, degrees){

    //create start and end nodes
    let start_node = new Node(null, start);
    let end_node = new Node(null, end);

    // Initialize open and closed lists
    let open_list = [];
    let closed_list = [];

    open_list.push(start_node);

    //Loop untill the end is found

    while (open_list.length > 0){
        if(algo_delay)
            await delay(algo_delay);
        // Get current Node
        
        let current_node = open_list[0];
        
        let current_index = 0;

        for(let i=1; i<open_list.length; i++){
            if(open_list[i].f < current_node.f){
                current_node = open_list[i];
                current_index = i;
            }
        }
        // Pop current off open list, add to closed list
        open_list.splice(current_index,1);
        closed_list.push(current_node);
        draw_fgh(current_node.position[0], current_node.position[1], current_node.f, current_node.g, current_node.h);
        playNote2(current_node.f, algo_delay);
        // Found the goal
        if (current_node.equals(end_node)){
            let path = [];
            let current = current_node;
            while (current != null){
                path.push(current.position);
                current = current.parent;
            }
            draw_path(path, pathColour);
            return path;
        }
        //generate children
        let children = []
        
        for(let i =0; i<degrees.length; i++){
            let node_position = [current_node.position[0] + degrees[i][0], current_node.position[1] + degrees[i][1]];
            //Make sure within range
            //console.log([node_position[0], node_position[1]]); 
            if (node_position[0] > width -1 || node_position[0] < 0 || node_position[1] > height -1 || node_position[1] < 0)
                continue;
            //Make sure walkable terrain
            if (grid[node_position[0]][node_position[1]] != 0)
                continue;

            //Create new node
            grid[node_position[0]][node_position[1]] = 2;
            let new_node = new Node(current_node, node_position);
            
            //Append
            children.push(new_node);
        }
        //Loop through children
        outer : for(let i =0; i<children.length; i++){
            let child = children[i];

            //Child is on the closed list
            for(let j =0; j<closed_list.length; j++){
                if (child.equals(closed_list[j]))
                    continue outer;
            }
            //Create the f value
            child.f = current_node.f + 1;

            //Child is already in the open list
            for(let j =0; j<open_list.length; j++){
                if (child.equals(open_list[j]) && child.g > open_list[j].g)
                    continue outer;
            }

            //Add the child to the open list
            open_list.push(child);
        }
    }
    console.log("didn't find path");
}

//  positions heatmap todo
async function random_walk(grid, width, height, start, end, degrees){
    let path = [];
    let current_pos = start;
    while(current_pos!=end){
        //choose a direction
        let index = Math.floor(Math.random() * degrees.length);
        let new_pos = [current_pos[0] + degrees[index][0], current_pos[1] + degrees[index][1]];
        //Make sure within range
        if (new_pos[0] > width -1 || new_pos[0] < 0 || new_pos[1] > height -1 || new_pos[1] < 0)
            continue;
        //Make sure walkable terrain
        if (grid[new_pos[0]][new_pos[1]] != 0)
            continue;
        // even 0 delay is necessary here or the random walk will use all the ressources
        await delay(algo_delay);//delay only if the random tile is acceptable
        
        //test for ending
        if(new_pos[0]==end[0] && new_pos[1]==end[1]){
            return path;
        }
        if(!(new_pos[0]==start[0] && new_pos[1]==start[1])){
            fill_cell(new_pos[0], new_pos[1], pathColour);
        }
        if(!(current_pos[0]==start[0] && current_pos[1]==start[1])){
            fill_cell(current_pos[0], current_pos[1], bgColour);
        }
        let h = ((new_pos[0] - end[0]) ** 2) + ((new_pos[1] - end[1]) ** 2);
        playNote2(h*10, algo_delay);
        current_pos = new_pos;
    }
}
// Doesn't work yet
async function random_movement_memory(grid, width, height, start, end, degrees){
    let path = [];
    let current_pos = start;
    while(current_pos!=end){
        
        //choose a direction
        let index = Math.floor(Math.random() * degrees.length);
        let new_pos = [current_pos[0] + degrees[index][0], current_pos[1] + degrees[index][1]];
        //Make sure within range
        if (new_pos[0] > width -1 || new_pos[0] < 0 || new_pos[1] > height -1 || new_pos[1] < 0)
            continue;
        //Make sure walkable terrain
        if (grid[new_pos[0]][new_pos[1]] != 0)
            continue;
            
        await delay(algo_delay);
        
        //test for ending
        if(new_pos[0]==end[0] && new_pos[1]==end[1]){
            return path;
        }
        if(!(current_pos[0]==start[0] && current_pos[1]==start[1]))
            grid[new_pos[0]][new_pos[1]]=2;
            fill_cell(new_pos[0], new_pos[1], pathColour);
            fill_cell(current_pos[0], current_pos[1], bgColour);
        current_pos = new_pos;
    }
}

async function bfs(grid, width, height, start, end, degrees){
    const hmax = ((start[0] - end[0]) ** 2) + ((start[1] - end[1]) ** 2);
//create start and end nodes
    let start_node = new Node(null, start);
    let end_node = new Node(null, end);
// Initialize open and closed lists
    let open_list = [];
    let closed_list = [];
    open_list.push(start_node);
//Loop untill the end is found
    while (open_list.length > 0){
        if(algo_delay)
            await delay(algo_delay);
// Get current Node
        let current_node = open_list[0];
        let current_index = 0;
// Pop current off open list, add to closed list
        open_list.splice(current_index,1);
        closed_list.push(current_node);
// Found the goal
        if (current_node.equals(end_node)){
            let path = [];
            let current = current_node;
            while (current != null){
                path.push(current.position);
                current = current.parent;
            }
            draw_path(path, pathColour);
            return path;
        }

// generate children
        let children = []
        
        for(let i =0; i<degrees.length; i++){
            let node_position = [current_node.position[0] + degrees[i][0], current_node.position[1] + degrees[i][1]];
//Make sure within range
            if (node_position[0] > width -1 || node_position[0] < 0 || node_position[1] > height -1 || node_position[1] < 0)
                continue;
//Make sure walkable terrain
            if (grid[node_position[0]][node_position[1]] != 0)
                continue;
            grid[node_position[0]][node_position[1]] = 2;
            
// play sound and draw visited nodes and 
            let h = ((node_position[0] - end[0]) ** 2) + ((node_position[1] - end[1]) ** 2);
            playNote2(h, algo_delay);
            if(!(node_position[0]==start[0] && node_position[1]==start[1]) && !(node_position[0]==end[0] && node_position[1]==end[1]));
                fill_cell(node_position[0], node_position[1], gradientColour(h, 0, hmax, pathColour1, pathColour2));
//Create new node
            let new_node = new Node(current_node, node_position);
//Append
            children.push(new_node);
        }
//Loop through children
        outer : for(let i =0; i<children.length; i++){
            let child = children[i];

//Child is on the closed list
            for(let j =0; j<closed_list.length; j++){
                if (child.equals(closed_list[j]))
                    continue outer;
            }

//Child is already in the open list
            for(let j =0; j<open_list.length; j++){
                if (child.equals(open_list[j]))
                    continue outer;
            }

//Add the child to the open list
            open_list.push(child);
        }
    }
    console.log("didn't find path");
}

async function dfs(grid, width, height, start, end, degrees){
    const hmax = ((start[0] - end[0]) ** 2) + ((start[1] - end[1]) ** 2);
    //create start and end nodes
    let start_node = new Node(null, start);
    let end_node = new Node(null, end);

    // Initialize open and closed lists
    let open_list = [];
    let closed_list = [];

    open_list.push(start_node);

    //Loop untill the end is found

    while (open_list.length > 0){
        if(algo_delay)
            await delay(algo_delay);

        // Pop current off open list, add to closed list
        let current_node = open_list.pop();
        closed_list.push(current_node);
        
        // Found the goal
        if (current_node.equals(end_node)){
            let path = [];
            let current = current_node;
            while (current != null){
                path.push(current);
                current = current.parent;
            }
            draw_path_animation(path, pathColour);
            return path;
        }
        //generate children
        let children = []
        
        for(let i =0; i<degrees.length; i++){
            let node_position = [current_node.position[0] + degrees[i][0], current_node.position[1] + degrees[i][1]];
            //Make sure within range
            if (node_position[0] > width -1 || node_position[0] < 0 || node_position[1] > height -1 || node_position[1] < 0)
                continue;
            //Make sure walkable terrain
            if (grid[node_position[0]][node_position[1]] != 0)
                continue;
            grid[node_position[0]][node_position[1]] = 2;
            // play sound and draw visited nodes and 
            let h = ((node_position[0] - end[0]) ** 2) + ((node_position[1] - end[1]) ** 2);
            current_node.h = h;
            playNote2(h, algo_delay);
            if(!(node_position[0]==start[0] && node_position[1]==start[1]) && !(node_position[0]==end[0] && node_position[1]==end[1]))
                //fill_cell(node_position[0], node_position[1], visitedColour);
                fill_cell(node_position[0], node_position[1], 
                    gradientColour(h, 0, hmax, pathColour1, pathColour2));
            //Create new node
            let new_node = new Node(current_node, node_position);

            //Append
            children.push(new_node);
        }
        //Loop through children
        outer : for(let i =0; i<children.length; i++){
            let child = children[i];

            //Child is on the closed list
            for(let j =0; j<closed_list.length; j++){
                if (child.equals(closed_list[j]))
                    continue outer;
            }

            //Child is already in the open list
            for(let j =0; j<open_list.length; j++){
                if (child.equals(open_list[j]))
                    continue outer;
            }

            //Add the child to the open list
            open_list.push(child);
        }
    }
    console.log("didn't find path");
}
//////////////////////////////////////////////// maze generation algorithms

let deepCopy = (arr) => {
    let copy = [];
    arr.forEach(elem => {
      if(Array.isArray(elem)){
        copy.push(deepCopy(elem))
      }else{
        if (typeof elem === 'object') {
          copy.push(deepCopyObject(elem))
      } else {
          copy.push(elem)
        }
      }
    })
    return copy;
}
function create_maze(grid, border = false){
    if (border){
        for(let i=0; i <width; i++){
            grid[i][0] = 1;
            grid[i][height-1] = 1;
        }
        for(let i=0;i <height;i++){
            grid[0][i] = 1;
            grid[width-1][i] = 1;
        }
    }
}
async function RecursiveDivision(grid, width, height){
    startTimer();
    display_grid(width, height);
    let chambers = [[0,0,width-1,height-1]];
    while(chambers.length>0){
        let ch = chambers.pop();

        let x1 = ch[0], y1=ch[1], x2=ch[2],y2=ch[3];
        //generate walls
        let x = randInt(x1+1, x2-1);
        let y = randInt(y1+1, y2-1);
        for(let j =y1;j<y2+1;j++){
            grid[x][j] = 1;
            fill_cell(x,j,wallColour);
        }
        for(let i =x1;i<x2+1;i++){
            grid[i][y] = 1;
            fill_cell(i,y,wallColour);
        }
        //remove hole blocking
        {
            if(y1>0)if(grid[x][y1-1]==-1){
                grid[x][y1]=0;
                fill_cell(x,y1,bgColour);
            }
            if(y2<height-1)if(grid[x][y2+1]==-1){
                grid[x][y2]=0;
                fill_cell(i,y2,bgColour);
            }
            if(x1>0)if(grid[x1-1][y]==-1){
                grid[x1][y]=0;
                fill_cell(x1,y,bgColour);
            }
            if(x2<width-1)if(grid[x2+1][y]==-1){
                grid[x2][y]=0;
                fill_cell(x2,y,bgColour);
            }
        }
        //make holes
        let notawall = randInt(0,3);
        {
            if(notawall!=0){
                let r = randInt(y1, y-1);
                grid[x][r] = -1;
                fill_cell(x,r,bgColour);
            }
            if(notawall!=1){
                let r = randInt(y+1, y2);
                grid[x][r] = -1;
                fill_cell(x,r,bgColour);
            }
            if(notawall!=2){
                let r = randInt(x1, x-1);
                grid[r][y] = -1;
                fill_cell(r,y,bgColour);
            }
            if(notawall!=3){
                let r = randInt(x+1, x2);
                grid[r][y] = -1;
                fill_cell(r,y,bgColour);
            }
        }
        //add new chambers
        if(x-1-x1>2){
            if(y-1-y1>2)
                chambers.push([x1,y1, x-1, y-1]);
            if(y2-(y+1)>2)
                chambers.push([x1,y+1, x-1, y2]);
        }  
        if(x2-(x+1)>2){
            if(y-1-y1>2)
                chambers.push([x+1,y1, x2, y-1]);
            if(y2-(y+1)>2)
                chambers.push([x+1,y+1, x2, y2]);
        }        
        
        if(maze_delay)
            await delay(maze_delay);
    }
    for(let i=0;i<width;i++){
        for(let j=0;j<width;j++)if(grid[i][j]==-1)grid[i][j]=0;
    }
    endTimer("RecursiveDivision");
}
/*

*/
async function RandomizedKruskal(grid, width, height){
    startTimer();
    display_grid(width, height);
    //array and set setup
    let gridSet = Array(width);
    for( let i = 0; i < width; i++){
        gridSet[i] = Array(height);
    }
    let list_set = [];
    let list_wall = [];
    for(let i=0;i<width;i++){
        for(let j=0;j<height;j++){
            grid[i][j]=1;
            if((i%2==1 ||(i%2==0 && j%2==1))){
                list_wall.push([i,j]);
                fill_cell(i,j,pathColour);
            }
            else{
                list_set.push(new Set(width*i+j, [i,j]));
                gridSet[i][j]=i*width+j;
            }
        }
    }
    
    while(list_set.length>1){
        const r = randInt(0, list_wall.length-1);
        let wall = list_wall[r];
        //get the cell coordinates
        let x1=wall[0], x2=wall[0], y1=wall[1], y2=wall[1];
        if(randInt(0,2)==1){x1--;x2++;}
        else{y1--;y2++;}
        // skip iteration if cells are out of bounds or arent from same set
        if(x1<0 || y1<0 || x2>=width  || y2>=height )
            continue;
        if(gridSet[x1][y1] == gridSet[x2][y2])
            continue;
        list_wall.splice(r,1);
        //update grid 
        grid[x1][y1]=0;grid[x2][y2]=0;grid[wall[0]][wall[1]]=0;
        //propagonate
        const i1 = gridSet[x1][y1];
        const i2 = gridSet[x2][y2];
        let iset1, iset2;
        for(let i=0;i<list_set.length;i++){
            if(i1==list_set[i].index)iset1=i;
            if(i2==list_set[i].index)iset2=i;
        }
        let index = list_set[iset1].index;
        //update gridset
        list_set[iset2].ar.forEach(a => gridSet[a[0]][a[1]] = index);
        //pop and fuse
        list_set[iset1].fuse(list_set[iset2]);
        list_set.splice(iset2,1);
        fill_cell(wall[0],wall[1],bgColour);
        if (maze_delay)
            await delay(maze_delay);
    }
    endTimer("RandomizedKruskal");
}

async function RandomizedPrims(grid, width, height){
    if(width%2==0 || height%2==0){
        evenNumberAlert();
        return;
    }
    
    startTimer();
    for(let i=0;i<width;i++)
        for(let j=0;j<height;j++)
            grid[i][j]=1;
    display_grid(width,height);
    fill_grid(grid);
    //get a random cell
    let x = Math.floor(randInt(0, width)/2)*2;
    let y = Math.floor(randInt(0, height)/2)*2;
    grid[x][y] = 0;
    let list_wall = [[x+1,y],[x-1,y],[x,y+1],[x,y-1]];
    fill_cell(x,y,bgColour);
    while(list_wall.length>0){
        let r = randInt(0, list_wall.length);
        x = list_wall[r][0]; 
        y = list_wall[r][1];
        list_wall.splice(r,1);
        
        if(x<0 || x>=width || y<0 || y>=height)
            continue;
        if(x%2==1){
            if(grid[x+1][y]==0 ^ grid[x-1][y]==0 ){
                grid[x][y]=0;
                if(grid[x+1][y]==0){
                    grid[x-1][y]=0;
                    fill_cell(x,y,bgColour);
                    x--;
                    fill_cell(x,y,bgColour);
                    list_wall.push([x-1,y],[x,y+1],[x,y-1]);
                }
                else{
                    grid[x+1][y]=0;
                    fill_cell(x,y,bgColour);
                    x++;
                    fill_cell(x,y,bgColour);
                    list_wall.push([x+1,y],[x,y+1],[x,y-1]);
                }
            }
        }
        else if(grid[x][y+1]==0^grid[x][y-1]==0){
            grid[x][y]=0;
            if(grid[x][y+1]==0){
                grid[x][y-1]=0;
                fill_cell(x,y,bgColour);
                y--;
                fill_cell(x,y,bgColour);
                list_wall.push([x+1,y],[x-1,y],[x,y-1]);
            }
            else{
                grid[x][y+1]=0;
                fill_cell(x,y,bgColour);
                y++;
                fill_cell(x,y,bgColour);
                list_wall.push([x+1,y],[x-1,y],[x,y+1]);
            }
        }
        if (maze_delay)
            await delay(maze_delay);
    }
    endTimer("RandomizedPrims");
}

async function RecursiveBacktracking(grid, width, height){
    startTimer();
    let dir_permutations = permutations([[0,-1],[0,1],[1,0],[-1,0]]);
    for(let i=0;i<width;i++)
        for(let j=0;j<height;j++)
            grid[i][j]=1;
    grid[0][0]=0;
    display_grid(width, height);
    fill_grid(grid);
    let list_cell = [];
    if(randInt(0,2))
        list_cell.push([2,0,[1,0]]);
    else list_cell.push([0,2,[0,1]]);
    while(list_cell.length>0){

        let cell = list_cell.pop()
        let x = cell[0];let y = cell[1];let b_dir = cell[2];
        if(grid[x][y]==0)continue;

        grid[x][y]=0;
        grid[x-b_dir[0]][y-b_dir[1]]=0;
        grid[x-b_dir[0]*2][y-b_dir[1]*2]=0;
        fill_cell(x,y,bgColour);
        fill_cell(x-b_dir[0],y-b_dir[1],bgColour);
        fill_cell(x-b_dir[0]*2,y-b_dir[1]*2,bgColour);

        let directions = dir_permutations[randInt(0,24)];
        let counter = 0;
        directions.forEach(dir => {
            counter++;
            let nx =  x+2*dir[0]; let ny = y+2*dir[1];
            if(nx>=0 && nx<width && ny>=0 && ny<height && grid[nx][ny]==1){
                list_cell.push([nx, ny, dir]);
            }
        });
        if (counter && maze_delay)
            await delay(maze_delay);
    }
    endTimer("(iterative))RecursiveBacktracking");
}
//Random walk that branches at each intersection
async function BranchingPaths(grid, width, height){
    startTimer();
    for(let i=0;i<width;i++)
        for(let j=0;j<height;j++)
            grid[i][j]=1;
    let x0 = randInt(0,width);
    let y0 = randInt(0, height);
    x0 -= x0%2;y0-=y0%2;
    grid[x0][y0]=0;
    let list_cell = [];
    list_cell.push([x0,y0]);
    while(list_cell.length>0){
        display_grid(width, height);
            fill_grid(grid);
        let cell = list_cell.pop()
        let x = cell[0];let y = cell[1];
        directions = [[0,-1],[0,1],[1,0],[-1,0]].sort(() => Math.random() - 0.5);
        let counter = 0;
        directions.forEach(dir => {
            let nx =  x+2*dir[0]; let ny = y+2*dir[1];
            if(nx>=0 && nx<width && ny>=0 && ny<height && grid[nx][ny]==1){
                counter++;
                grid[x][y]=0;
                grid[nx][ny]=0;
                grid[nx-dir[0]][ny-dir[1]]=0; 
                list_cell.push([nx, ny]);
            }
        });
        if (maze_delay && counter)
            await delay(maze_delay);
    }
    endTimer("Branching Paths");
}

async function Tesselation(grid, width, height){
    if(!checkTesselation(width) ||  !checkTesselation(height)){
        console.log("wrong size");
        return;
    }

}

function genMaze(maze_algo){
    width = parseInt(inputWidth.value);
    height = parseInt(inputHeight.value);
    maze_generation = true;
    cell_sizepx = 20;
    canvas.width  = width * cell_sizepx;
    canvas.height  = height * cell_sizepx;
    grid = Array(width);
    for( let i = 0; i < width; i++){
        grid[i] = Array(height).fill(0);
    }
    maze_algo(grid, width, height);
}

//////////////////////////////////////////////// miscellaneous functions

function startTimer() {
  startTime = new Date();
}
function endTimer(s) {
  endTime = new Date();
  console.log(s +" : " +(endTime - startTime) + " ms");
}
function randInt(min, max) {
    return Math.floor(Math.random() * (max-min)+min);
}
function shuffleArray(array){
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }
const permutations = arr => {
    if (arr.length <= 2) return arr.length === 2 ? [arr, [arr[1], arr[0]]] : arr;
    return arr.reduce(
      (acc, item, i) =>
        acc.concat(
          permutations([...arr.slice(0, i), ...arr.slice(i + 1)]).map(val => [
            item,
            ...val,
          ])
        ),
      []
    );
  };
function checkTesselation(size){
    if(size==5)return true;
    if(size<5)return false;
    return checkTesselation((size+1)/2);
}
//////////////////////////////////////////////// Init
function init(algo){
    if(grid==undefined)return;
    if(grid_copy==undefined)grid_copy = deepCopy(grid);
    grid = deepCopy(grid_copy);
    var start = [0,0];
    var end = [width-1, height-1];
    /*
    if(!maze_generation){
        grid = [[0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
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
            
        width = 11; height = 10;
        start = [0, 0]; end = [6,7];
        cell_sizepx = 20;
        canvas.width  = width * cell_sizepx;
        canvas.height  = height * cell_sizepx;
        display_grid(width, height);
        fill_grid(grid)
    }
    */
    var fmax  = width*height + Math.max(start[0], width-start[0]) **2 
                            + Math.max(start[1], height-start[1]) **2;
    display_grid(width, height);
    fill_grid(grid);
    fill_cell(start[0], start[1], startColour); //blue
    fill_cell(end[0], end[1], endColour); //red
    var path = algo(grid, width, height, start, end, degrees);
    
}




//////////////////////////////////////////////// Infinite maze
var totalWidth = width, totalHeight  = height;
var grid_sum;
var open_list = [];
var displayed_cells = [];
var toggleHeight = true;
var adv_x=0;
maze_delay = 0;
algo_delay = 1;
var last_time;
var remove_counter = 10;
var x_translate = cell_sizepx*width*2;
var offset_x =0;
const hmax = ((width-1) ** 2) + ((height-1) ** 2);
canvas.width  = totalWidth * cell_sizepx*5;
canvas.height  = totalHeight * cell_sizepx;

function fill_cell_adv(x,y, colour){
    ctx.beginPath();
    ctx.rect(x * cell_sizepx+1+x_translate , y * cell_sizepx+1, cell_sizepx-2, cell_sizepx-2);
    ctx.fillStyle = colour;
    ctx.fill();
    ctx.closePath();
}
function draw_fgh(x,y,f,g,h){
    ctx.fillStyle = textColour;
    ctx.fillText( f, x * cell_sizepx+2, (y+1) * cell_sizepx-2);
}
async function display() {
    while(true){
        await delay(10);
        ctx.beginPath();
        ctx.rect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = bgColour;
        ctx.fill();
        ctx.closePath();
        for(let i=0; i<totalWidth;i++){
            for(let j=0; j<totalHeight; j++){
                if(grid_sum[i][j]>2)fill_cell_adv(i, j, gradientColour(grid_sum[i][j], 0, hmax, pathColour1, pathColour2));
            }
        }
    }
}
async function move_display(time){
    let d_time = Math.floor(time/(width-1)/cell_sizepx);
    for(let i=0;i<(width-1)*cell_sizepx;i++){
        await delay(d_time);
            x_translate-=1;
    }
}
function fill_grid2(grid, w, h){
    for(let i=0; i<w;i++){
        for(let j=0; j<h; j++){
            if(grid[i][j]==1)fill_cell_adv(i, j, pathColour);
            else
                fill_cell_adv(i, j, bgColour);
        }
    }
}

let deepAppendWidth = (arr1, arr2) => {
    let copy = [];
    arr1.forEach(elem => {
      if(Array.isArray(elem)){
        copy.push(deepCopy(elem))
      }else{
        if (typeof elem === 'object') {
          copy.push(deepCopyObject(elem))
      } else {
          copy.push(elem)
        }
      }
    })
    arr2.forEach(elem => {
        if(Array.isArray(elem)){
          copy.push(deepCopy(elem))
        }else{
          if (typeof elem === 'object') {
            copy.push(deepCopyObject(elem))
        } else {
            copy.push(elem)
          }
        }
      })
    
    return copy;
}

async function RandomizedPrims2(grid, width, height, first){
    for(let i=1;i<width;i++)
        for(let j=0;j<height;j++)
            grid[i][j]=1;
    //get a random cell
    
    let x = Math.floor(randInt(2, width)/2)*2;
    let y = Math.floor(randInt(2, height)/2)*2;
    grid[x][y] = 0;
    
    let list_wall = [[x+1,y],[x-1,y],[x,y+1],[x,y-1]];
    
    if(first==false){
        for(let j=0;j<height;j+=2){
            list_wall.push([1,j]);
            console.log(j);
        }
    }
    
    while(list_wall.length>0){
        let r = randInt(0, list_wall.length);
        x = list_wall[r][0]; 
        y = list_wall[r][1];
        list_wall.splice(r,1);
        
        if(x<0 || x>=width || y<0 || y>=height)
            continue;
        if(x%2==1){
            if(grid[x+1][y]!=1 ^ grid[x-1][y]!=1 ){
                grid[x][y]=0;
                if(grid[x+1][y]!=1){
                    grid[x-1][y]=0;
                    x--;
                    list_wall.push([x-1,y],[x,y+1],[x,y-1]);
                }
                else{
                    grid[x+1][y]=0;
                    x++;
                    list_wall.push([x+1,y],[x,y+1],[x,y-1]);
                }
            }
        }
        else if(grid[x][y+1]!=1^grid[x][y-1]!=1){
            grid[x][y]=0;
            if(grid[x][y+1]!=1){
                grid[x][y-1]=0;
                y--;
                list_wall.push([x+1,y],[x-1,y],[x,y-1]);
            }
            else{
                grid[x][y+1]=0;
                y++;
                list_wall.push([x+1,y],[x-1,y],[x,y+1]);
            }
        }
        if (maze_delay)
            await delay(maze_delay);
    }
}
class Set {
    constructor(index, pos){
        this.index = index;
        this.ar = [pos];
    }
    fuse(set){
        this.ar = this.ar.concat(set.ar);
    }
}
async function RandomizedKruskal2(grid, width, height, is_first){
    let gridSet = Array(width);
    for( let i = 0; i < width; i++){
        gridSet[i] = Array(height);
    }
    let list_set = [];
    let list_wall = [];
    let i = 0;
    if(!is_first){
        i = 1;
        gridSet[0][0]=1;
        list_set.push(new Set(1,[0,0]));
        for(let j=1;j<height;j+=2){
            if(grid[0][j]==0){//merge with top
                gridSet[0][j+1]=gridSet[0][j-1];
                list_set[list_set.length-1].ar.push([0,j+1]);
            }
            else{
                gridSet[0][j+1]=j+1;
                list_set.push(new Set(j+1, [0,j+1]));
                //list_wall.push([0,j]);   
            }
        }
    } 
    for(;i<width;i++){
        for(let j=0;j<height;j++){
            grid[i][j]=1;
            if((i%2==1 ||(i%2==0 && j%2==1))){
                list_wall.push([i,j]);
            }
            else{
                list_set.push(new Set(width*i+j, [i,j]));
                gridSet[i][j]=i*width+j;
            }
        }
    }
        
    while(list_set.length>1){
        const r = randInt(0, list_wall.length-1);
        let wall = list_wall[r];
        //get the cell coordinates
        let x1=wall[0], x2=wall[0], y1=wall[1], y2=wall[1];
        if(randInt(0,2)==1){x1--;x2++;}
        else{y1--;y2++;}
        // skip iteration if cells are out of bounds or arent from same set
        if(x1<0 || y1<0 || x2>=width  || y2>=height )
            continue;
        if(gridSet[x1][y1] == gridSet[x2][y2])
            continue;
        list_wall.splice(r,1);
        //update grid 
        grid[x1][y1]=0;grid[x2][y2]=0;grid[wall[0]][wall[1]]=0;
        //propagonate
        const i1 = gridSet[x1][y1];
        const i2 = gridSet[x2][y2];
        let iset1, iset2;
        for(let i=0;i<list_set.length;i++){
            if(i1==list_set[i].index)iset1=i;
            if(i2==list_set[i].index)iset2=i;
        }
        let index = list_set[iset1].index;
        //update gridset
        list_set[iset2].ar.forEach(a => gridSet[a[0]][a[1]] = index);
        //pop and fuse
        list_set[iset1].fuse(list_set[iset2]);
        list_set.splice(iset2,1);
        //fill_cell(wall[0],wall[1],bgColour);
    }
}
async function bfs2(grid, width, height, start, end, degrees, open_list){
    
//create start and end nodes
    let start_node = new Node(null, start);
    let end_node = new Node(null, end);
// Initialize open and closed lists
    let closed_list = [];
    open_list.push(start_node);
//Loop untill the end is found
    while (open_list.length > 0){
        if(algo_delay)
            await delay(algo_delay);
// Get current Node
        let current_node = open_list[0];
        let current_index = 0;
// Pop current off open list, add to closed list
        open_list.splice(current_index,1);
        closed_list.push(current_node);
// Found the goal
        if (current_node.equals(end_node))
            return open_list;

// generate children
        let children = []
        
        for(let i =0; i<degrees.length; i++){
            let node_position = [current_node.position[0] + degrees[i][0], current_node.position[1] + degrees[i][1]];
//Make sure within range
            if (node_position[0] > width -1 || node_position[0] < 0 || node_position[1] > height -1 || node_position[1] < 0)
                continue;
//Make sure walkable terrain
            if (grid[node_position[0]][node_position[1]] != 0)
                continue;

            
            let h = ((node_position[0] - end[0]) ** 2) + ((node_position[1] - end[1]) ** 2);
            grid[node_position[0]][node_position[1]] = h;

                //Create new node
            let new_node = new Node(current_node, node_position);
//Append
            children.push(new_node);
        }
//Loop through children
        outer : for(let i =0; i<children.length; i++){
            let child = children[i];

//Child is on the closed list
            for(let j =0; j<closed_list.length; j++){
                if (child.equals(closed_list[j]))
                    continue outer;
            }

//Child is already in the open list
            for(let j =0; j<open_list.length; j++){
                if (child.equals(open_list[j]))
                    continue outer;
            }

//Add the child to the open list
            open_list.push(child);
        }
    }
    console.log("didn't find path");
}
async function infinite_setup(){
    grid_sum = Array(width);
    for( let i = 0; i < width; i++){
        grid_sum[i] = Array(height).fill(0);
    }
    for(let j=0;j<height;j++)
        grid_sum[0][j]=1;
    RandomizedKruskal2(grid_sum, width, height, true);
}
async function add_grid(){
        let grid_1 = Array(width);
        grid_1[0] = grid_sum.pop();
        for( let i = 1; i < width; i++){
            grid_1[i] = Array(height).fill(0);
        }
        await RandomizedKruskal2(grid_1, width, height, false);
        grid_sum = deepAppendWidth(grid_sum, grid_1);
        totalWidth = totalWidth+width-1;
}
function delay(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}
async function infinite_update(){
    while(true){
        
        last_time = new Date();
        if(toggleHeight){
            await bfs2(grid_sum, totalWidth, totalHeight, [totalWidth-width,0], [totalWidth-1, height-1], degrees, open_list); 
            toggleHeight = !toggleHeight;
        }
        else{
            await bfs2(grid_sum, totalWidth, totalHeight, [totalWidth-width,height-1], [totalWidth-1, 0], degrees, open_list);
            toggleHeight = !toggleHeight;
        }
        
        await add_grid();
        remove_counter--;
        if(!remove_counter){
            x_translate+=(width-1)*4*cell_sizepx;
            totalWidth-=(width-1)*4;
            grid_sum = grid_sum.slice((width-1)*4);
            remove_counter = 4;
        }
        let this_time = new Date();
        move_display(this_time-last_time);
    }    
}

infinite_setup();
display();
infinite_update();

