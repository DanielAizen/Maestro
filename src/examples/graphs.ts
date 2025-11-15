import type { ExampleGraph } from "./types";

export const exampleGraphs: ExampleGraph[] = [
    {
        id: "bfs-vs-dijkstra",
        name: "BFS vs Dijkstra (weighted)",
        description:
            "BFS finds the path with fewer hops, Dijkstra finds the cheaper weighted path.",
        nodes: [
            { id: "A", label: "A (Start)", x: 100, y: 200 },
            { id: "B", label: "B", x: 300, y: 100 },
            { id: "C", label: "C", x: 300, y: 300 },
            { id: "D", label: "D", x: 500, y: 200 },
            { id: "E", label: "E (Goal)", x: 700, y: 200 },
        ],
        edges: [
            // upper path: few edges but expensive
            { id: "A-B", source: "A", target: "B", weight: 10 },
            { id: "B-E", source: "B", target: "E", weight: 10 },

            // lower path: more edges but cheaper
            { id: "A-C", source: "A", target: "C", weight: 1 },
            { id: "C-D", source: "C", target: "D", weight: 1 },
            { id: "D-E", source: "D", target: "E", weight: 1 },
        ],
    },
    {
        id: "branchy-graph",
        name: "Branchy graph with multiple routes",
        description:
            "Several alternative routes from S to T with different costs and lengths.",
        nodes: [
            { id: "S", label: "S (Start)", x: 100, y: 200 },
            { id: "X", label: "X", x: 300, y: 100 },
            { id: "Y", label: "Y", x: 300, y: 300 },
            { id: "M", label: "M", x: 500, y: 100 },
            { id: "N", label: "N", x: 500, y: 300 },
            { id: "T", label: "T (Target)", x: 700, y: 200 },
        ],
        edges: [
            { id: "S-X", source: "S", target: "X", weight: 3 },
            { id: "S-Y", source: "S", target: "Y", weight: 1 },
            { id: "X-M", source: "X", target: "M", weight: 1 },
            { id: "Y-N", source: "Y", target: "N", weight: 5 },
            { id: "M-T", source: "M", target: "T", weight: 1 },
            { id: "N-T", source: "N", target: "T", weight: 1 },
        ],
    },
];
