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
        // play note
        let h = ((wall[0] - width) ** 2) + ((wall[1] - height) ** 2);
        playNote2(h, algo_delay);

        if (maze_delay)
            await delay(maze_delay);
    }
    endTimer("RandomizedKruskal");
}