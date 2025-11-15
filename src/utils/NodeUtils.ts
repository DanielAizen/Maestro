import type { Node } from "@xyflow/react";

export const getNodeLabel = (n: Node): string => {
    const data = n.data as Record<string, unknown> | null | undefined;
    const label = data?.label;

    if (typeof label === "string") {
        return label;
    }

    return n.id;
};
