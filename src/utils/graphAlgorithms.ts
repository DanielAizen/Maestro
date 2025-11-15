import type { Edge, Node } from "@xyflow/react";

export interface PathResult {
    nodeIds: string[];
    edgeIds: string[];
}

export type AdjacencyList = Map<
    string,
    { neighborId: string; weight: number; edgeId: string }[]
>;

// Build adjacency list from nodes + edges
export function buildAdjacencyList(
    nodes: Node[],
    edges: Edge[]
): AdjacencyList {
    const adj: AdjacencyList = new Map();

    // ensure all nodes keys exist
    for (const n of nodes) {
        adj.set(n.id, []);
    }

    for (const e of edges) {
        const data = e.data as Record<string, unknown> | null | undefined;
        let weight = 1;
        if (data && typeof data.weight === "number" && isFinite(data.weight)) {
            weight = data.weight;
        }

        if (!adj.has(e.source)) {
            adj.set(e.source, []);
        }

        adj.get(e.source)!.push({
            neighborId: e.target,
            weight,
            edgeId: e.id,
        });
    }

    return adj;
}

// BFS shortest path by #edges (unweighted)
export function bfsShortestPath(
    adj: AdjacencyList,
    startId: string,
    endId: string
): PathResult | null {
    if (startId === endId) {
        return { nodeIds: [startId], edgeIds: [] };
    }

    const visited = new Set<string>();
    const queue: string[] = [];
    const parentNode = new Map<string, string>(); // child -> parent
    const parentEdge = new Map<string, string>(); // child -> edgeId

    visited.add(startId);
    queue.push(startId);

    while (queue.length > 0) {
        const current = queue.shift()!;
        const neighbors = adj.get(current) ?? [];

        for (const { neighborId, edgeId } of neighbors) {
            if (visited.has(neighborId)) continue;

            visited.add(neighborId);
            parentNode.set(neighborId, current);
            parentEdge.set(neighborId, edgeId);

            if (neighborId === endId) {
                // reconstruct
                const nodePath: string[] = [];
                const edgePath: string[] = [];
                let cur: string | undefined = endId;

                while (cur && cur !== startId) {
                    nodePath.push(cur);
                    const p = parentNode.get(cur);
                    const eId = parentEdge.get(cur);
                    if (!p || !eId) break;
                    edgePath.push(eId);
                    cur = p;
                }

                nodePath.push(startId);
                nodePath.reverse();
                edgePath.reverse();

                return { nodeIds: nodePath, edgeIds: edgePath };
            }

            queue.push(neighborId);
        }
    }

    return null;
}

// Dijkstra shortest path by weight
export function dijkstraShortestPath(
    adj: AdjacencyList,
    startId: string,
    endId: string
): PathResult | null {
    const dist = new Map<string, number>();
    const visited = new Set<string>();
    const parentNode = new Map<string, string>();
    const parentEdge = new Map<string, string>();

    for (const key of adj.keys()) {
        dist.set(key, Infinity);
    }
    dist.set(startId, 0);

    // naive priority queue: O(V^2) but fine for small graphs
    const getMinUnvisited = (): string | null => {
        let minNode: string | null = null;
        let minDist = Infinity;
        for (const [nodeId, d] of dist.entries()) {
            if (!visited.has(nodeId) && d < minDist) {
                minDist = d;
                minNode = nodeId;
            }
        }
        return minNode;
    };

    while (true) {
        const current = getMinUnvisited();
        if (current === null) break;
        if (current === endId) break;

        visited.add(current);
        const neighbors = adj.get(current) ?? [];

        for (const { neighborId, weight, edgeId } of neighbors) {
            if (visited.has(neighborId)) continue;

            const alt = (dist.get(current) ?? Infinity) + weight;
            if (alt < (dist.get(neighborId) ?? Infinity)) {
                dist.set(neighborId, alt);
                parentNode.set(neighborId, current);
                parentEdge.set(neighborId, edgeId);
            }
        }
    }

    if (!parentNode.has(endId) && startId !== endId) {
        return null;
    }

    // reconstruct
    if (startId === endId) {
        return { nodeIds: [startId], edgeIds: [] };
    }

    const nodePath: string[] = [];
    const edgePath: string[] = [];
    let cur: string | undefined = endId;

    while (cur && cur !== startId) {
        nodePath.push(cur);
        const p = parentNode.get(cur);
        const eId = parentEdge.get(cur);
        if (!p || !eId) break;
        edgePath.push(eId);
        cur = p;
    }

    nodePath.push(startId);
    nodePath.reverse();
    edgePath.reverse();

    return { nodeIds: nodePath, edgeIds: edgePath };
}
