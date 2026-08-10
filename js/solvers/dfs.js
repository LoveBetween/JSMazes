async function dfs(grid, width, height, start, end, degrees) {

    const hmax =
        ((start[0] - end[0]) ** 2) +
        ((start[1] - end[1]) ** 2);

    let start_node = new Node(null, start);
    let end_node = new Node(null, end);

    let open_list = [];
    let closed_list = [];

    open_list.push(start_node);

    // Mark start as discovered
    grid[start[0]][start[1]] = 2;

    while (open_list.length > 0) {

        // Pop the next node to explore

        let current_node = open_list.pop();

        closed_list.push(current_node);

        let x = current_node.position[0];
        let y = current_node.position[1];

        // visualize

        let h =
            ((x - end[0]) ** 2) +
            ((y - end[1]) ** 2);

        if (
            !(x == start[0] && y == start[1]) &&
            !(x == end[0] && y == end[1])
        ) {
            fill_cell(
                x,
                y,
                gradientColour(
                    h,
                    0,
                    hmax,
                    pathColour1,
                    pathColour2
                )
            );
        }

        // Play sound for the node actually being explored
        playNote2(h, algo_delay);

        // Wait AFTER exploring one node
        if (algo_delay)
            await delay(algo_delay);

        if (current_node.equals(end_node)) {

            let path = [];
            let current = current_node;

            while (current != null) {
                path.push(current);
                current = current.parent;
            }

            await draw_path_animation(path, pathColour);

            return path;
        }

        let children = [];

        for (let i = 0; i < degrees.length; i++) {

            let node_position = [
                x + degrees[i][0],
                y + degrees[i][1]
            ];

            // Out of bounds
            if (
                node_position[0] < 0 ||
                node_position[0] >= width ||
                node_position[1] < 0 ||
                node_position[1] >= height
            ) {
                continue;
            }

            // Already discovered
            if (grid[node_position[0]][node_position[1]] != 0)
                continue;

            // Mark as discovered
            grid[node_position[0]][node_position[1]] = 2;

            // Create child
            let new_node =
                new Node(current_node, node_position);

            new_node.h =
                ((node_position[0] - end[0]) ** 2) +
                ((node_position[1] - end[1]) ** 2);

            children.push(new_node);
        }

        for (let i = 0; i < children.length; i++) {
            open_list.push(children[i]);
        }
    }

    console.log("didn't find path");
    return null;
}
