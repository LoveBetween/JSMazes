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
