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

export function astar(grid,height, width, start, end){

    //create start and end nodes

    var start_node = new Node(null, start);
    var end_node = new Node(null, end);

    // Initialize open and closed lists
    var open_list = [];
    var closed_list = [];

    open_list.push(start_node);

    //Loop untill the end is found

    while (open_list.length > 0){
        // Get current Node
        var current_node = open_list[0];
        console.log(open_list);
        
        var current_index = 0;

        for(var i=1; i<open_list.length; i++){
            if(open_list[i].f < current_node.f){
                current_node = open_list[i];
                current_index = i;
            }
        }
        // Pop current off open list, add to closed list
        open_list.splice(current_index);
        closed_list.push(current_node);

        // Found the goal
        if (current_node.equals(end_node)){
            var path = [];
            var current = current_node;
            while (current != null){
                path.push(current.position);
                current = current.parent;
            }
            return path;
        }

        //generate children
        var children = []
        var pos = [ [0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [-1, 1], [1, -1], [1, 1] ];
        
        for(var i =0; i<8; i++){
            var node_position = [current_node.position[0] + pos[i][0], current_node.position[1] + pos[i][1]];
            //Make sure within range
            //console.log([node_position[0], node_position[1]]);
            console.log([node_position[0], node_position[1]]);  
            if (node_position[0] > width -1 ||
                node_position[0] < 0 ||
                node_position[1] > height -1 || 
                node_position[1] < 0){
                    continue;
                }
                

            //Make sure walkable terrain
            if (grid[node_position[0]][node_position[1]] != 0)
                continue;
            
            //Create new node
            var new_node = new Node(current_node, node_position);

            //Append
            children.push(new_node);
        }
        //Loop through children
        outer : for(var i =0; i<children.length; i++){
            var child = children[i];

            //Child is on the closed list
            for(var j =0; j<closed_list.length; j++){
                if (child.equals(closed_list[j]))
                    continue outer;
            }
                
            //Create the f, g, and h values
            child.g = current_node.g + 1;
            child.h = ((child.position[0] - end_node.position[0]) ** 2) + ((child.position[1] - end_node.position[1]) ** 2);
            child.f = child.g + child.h;

            //Child is already in the open list
            for(var j =0; j<open_list.length; j++){
                if (child.equals(open_list[j]) && child.g > open_list[j].g)
                    continue outer;
            }

            //Add the child to the open list
            open_list.push(child);
        }
    }
}

var grid = [[0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];

var start = [0, 0];
var end = [8, 6];

var path = astar(grid,10, 10, start, end);
console.log("path " + path);