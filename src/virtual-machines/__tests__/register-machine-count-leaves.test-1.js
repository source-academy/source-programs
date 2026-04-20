set_register_contents(cl, "curr_node", pair(pair(1, 2), pair(3, pair(4, 5))));
start(cl);
get_register_contents(cl, "num_leaves");

// 5
