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