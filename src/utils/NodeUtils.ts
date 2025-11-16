import type { Edge, Node } from "@xyflow/react";

export const getNodeLabel = (n: Node): string => {
    const data = n.data as Record<string, unknown> | null | undefined;
    const label = data?.label;

    if (typeof label === "string") {
        return label;
    }

    return n.id;
};

export const getEdgeWeight = (edge: Edge): number => {
    const data = edge.data as { weight?: number } | null | undefined;
    const w = data?.weight;
    return typeof w === "number" && !Number.isNaN(w) ? w : 1;
};
