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