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