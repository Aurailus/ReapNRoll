import { vec2 } from 'gl-matrix';
import Map from './DungeonRoom';

interface Node {
	pos: vec2;
	parent: Node | null;
	g: number;
	f: number;
}

const NEIGHBORS: vec2[] = [
	vec2.fromValues(-1, -1),
	vec2.fromValues(0, -1),
	vec2.fromValues(1, -1),
	vec2.fromValues(-1, 0),
	vec2.fromValues(1, 0),
	vec2.fromValues(-1, 1),
	vec2.fromValues(0, 1),
	vec2.fromValues(1, 1)
];

function f(node: Node, end: vec2) {
	return node.g + vec2.distance(node.pos, end);
}

export default function getPath(start: vec2, end: vec2, map: Map): vec2[] {
	let nodes: Node[][] = [];

	for (let i = 0; i < map.size[0]; i++) {
		nodes[i] = [];
		for (let j = 0; j < map.size[1]; j++) {
			nodes[i][j] = { parent: null, pos: [ i, j ], g: Infinity, f: Infinity };
		}
	}

	let startNode = nodes[start[0]][start[1]];
	startNode.g = 0;
	startNode.f = f(startNode, end);

	let open = new Set<Node>([ startNode ]);

	while (open.size) {
		let node = open.values().next().value;
		for (let n of open) if (n.f < node.f) node = n;

		if (vec2.equals(node.pos, end)) {
			let path: vec2[] = [ node.pos ];
			let current = node;
			while (current.parent) {
				path.push(current.parent.pos);
				current = current.parent;
			}
			path.reverse();
			return path;
		}

		open.delete(node);

		for (let n of NEIGHBORS) {
			let neighbor = nodes[node.pos[0] + n[0]]?.[node.pos[1] + n[1]];
			if (!neighbor || map.solid[(neighbor.pos[1] + 1) * map.size[0] + (neighbor.pos[0] + 1)]) continue;

			let g = node.g + vec2.distance(node.pos, neighbor.pos);
			if (g < neighbor.g) {
				neighbor.parent = node;
				neighbor.g = g;
				neighbor.f = f(neighbor, end);
				open.add(neighbor);
			}
		}
	}

	return [];
}
