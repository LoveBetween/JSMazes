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
                path.push(current);
                current = current.parent; 
            }
            draw_path_animation(path, pathColour);
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
            current_node.h = h
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