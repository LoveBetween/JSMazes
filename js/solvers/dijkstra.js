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
