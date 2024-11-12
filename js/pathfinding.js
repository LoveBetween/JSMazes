var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
//////////////////////////////////////////////// sound setup
var soundPlayer = new Audio();
soundPlayer.src = "sounds/coin.mp3";
soundPlayer.mozPreservesPitch = false;
//////////////////////////////////////////////// grid setup
var grid, grid_copy;
var width = 21, height = 21;
var cell_sizepx;
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
var algo_delay = 10, maze_delay = 1, path_delay = 10;
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
function fill_cell(x,y, colour){
    ctx.beginPath();
    ctx.rect(x * cell_sizepx+1 , y * cell_sizepx+1, cell_sizepx-2, cell_sizepx-2);
    ctx.fillStyle = colour;
    ctx.fill();
    ctx.closePath();
}
function draw_fgh(x,y,f,g,h){
    ctx.fillStyle = textColour;
    ctx.fillText( f, x * cell_sizepx+2, (y+1) * cell_sizepx-2);
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
//////////////////////////////////////////////// maze generation functions

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

class Set {
    constructor(index, pos){
        this.index = index;
        this.ar = [pos];
    }
    fuse(set){
        this.ar = this.ar.concat(set.ar);
    }
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
function delay(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
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