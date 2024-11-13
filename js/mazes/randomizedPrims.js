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
                    // play note
                    let h = ((x - width) ** 2) + ((y - height) ** 2);
                    playNote2(h, algo_delay);
                    list_wall.push([x-1,y],[x,y+1],[x,y-1]);
                }
                else{
                    grid[x+1][y]=0;
                    fill_cell(x,y,bgColour);
                    x++;
                    fill_cell(x,y,bgColour);
                    // play note
                    let h = ((x - width) ** 2) + ((y - height) ** 2);
                    playNote2(h, algo_delay);
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
                // play note
                let h = ((x - width) ** 2) + ((y - height) ** 2);
                playNote2(h, algo_delay);
                list_wall.push([x+1,y],[x-1,y],[x,y-1]);
            }
            else{
                grid[x][y+1]=0;
                fill_cell(x,y,bgColour);
                y++;
                fill_cell(x,y,bgColour);
                // play note
                let h = ((x - width) ** 2) + ((y - height) ** 2);
                playNote2(h, algo_delay);
                list_wall.push([x+1,y],[x-1,y],[x,y+1]);
            }
        }
        if (maze_delay)
            await delay(maze_delay);
    }
    endTimer("RandomizedPrims");
}