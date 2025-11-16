import {
    ReactFlow,
    Background,
    Controls,
    type Connection,
    type NodeChange,
    type EdgeChange,
    type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import {
    applyEdgesChange,
    applyNodesChange,
    addEdge as addGraphEdge,
} from "../store/graphSlice";
import { useCallback, useMemo, useState } from "react";

interface GraphCanvasProps {
    highlightedNodeIds: string[];
    pathHighlight: { nodeIds: string[]; edgeIds: string[] } | null;
}

export function GraphCanvas({ highlightedNodeIds, pathHighlight }: GraphCanvasProps) {
    const dispatch = useDispatch();
    const nodes = useSelector((state: RootState) => state.graph.nodes);
    const edges = useSelector((state: RootState) => state.graph.edges);

    const theme = useSelector((state: RootState) => state.theme.theme)
    const isDark = theme === "dark";


    const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);


    const onNodesChange = useCallback(
        (changes: NodeChange[]) => {
            dispatch(applyNodesChange(changes));
        },
        [dispatch]
    )

    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) =>
            dispatch(applyEdgesChange(changes))
        ,
        [dispatch]
    );

    const onConnect = useCallback(
        (connection: Connection) => {
            if (connection.source && connection.target) {
                dispatch(
                    addGraphEdge({
                        sourceId: connection.source,
                        targetId: connection.target,
                    })
                );
            }
        },
        [dispatch]
    );

    const highlightedSet = useMemo(
        () => new Set(highlightedNodeIds),
        [highlightedNodeIds]
    );

    const flowNodes = useMemo(
        () =>
            nodes.map((n) => {
                const inPath = pathHighlight?.nodeIds.includes(n.id) ?? false;
                const inSearchHighlight = highlightedSet.has(n.id);

                const baseStyle = {
                    ...(n.style || {}),
                    backgroundColor: isDark ? "#ffffff" : "#2b2b2b",
                    color: isDark ? "#111111" : "#ffffff",
                    border: `2px solid ${isDark ? "#ffffff" : "#000000"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: 500,
                };

                if (inSearchHighlight) {
                    return {
                        ...n,
                        style: {
                            ...baseStyle,
                            borderColor: "#ffcc00",
                            boxShadow: "0 0 0 4px rgba(255, 204, 0, 0.4)",
                        },
                    };
                }

                if (inPath) {
                    return {
                        ...n,
                        style: {
                            ...baseStyle,
                            borderColor: "#00bcd4",
                            boxShadow: "0 0 0 3px rgba(0, 188, 212, 0.35)",
                        },
                    };
                }

                return {
                    ...n,
                    style: baseStyle,
                };
            }),
        [nodes, isDark, pathHighlight, highlightedSet]
    );

    const flowEdges: Edge[] = useMemo(
        () =>
            edges.map((e) => {
                const inPath = pathHighlight?.edgeIds.includes(e.id) ?? false;

                const data = e.data as { label?: string; weight?: number } | null | undefined;

                const weight =
                    typeof data?.weight === "number" && !Number.isNaN(data.weight)
                        ? data.weight
                        : 1;

                let storedLabel = "";
                if (data && typeof data.label === "string") {
                    storedLabel = data.label;
                } else if (typeof e.label === "string") {
                    storedLabel = e.label;
                }

                // Final label when hovering
                const hoverLabel =
                    storedLabel && weight != null
                        ? `${storedLabel} (w = ${weight})`
                        : storedLabel || `w = ${weight}`;

                const baseStyle = {
                    ...(e.style || {}),
                    strokeWidth: inPath ? 3 : 1.5,
                    stroke: inPath ? "#d40000" : undefined,
                };

                if (e.id !== hoveredEdgeId) {
                    return {
                        ...e,
                        label: undefined,
                        style: baseStyle,
                    };
                }

                return {
                    ...e,
                    label: hoverLabel,
                    style: baseStyle,
                };
            }),
        [edges, hoveredEdgeId, pathHighlight]
    );


    const onEdgeMouseEnter = useCallback(
        (_evt: React.MouseEvent, edge: Edge) => {
            setHoveredEdgeId(edge.id);
        },
        []
    );

    const onEdgeMouseLeave = useCallback(() => {
        setHoveredEdgeId(null);
    }, []);

    return (
        <div style={{ flex: 1, minHeight: 0 }}>
            <div style={{ width: "100%", height: "100%" }}>
                <ReactFlow
                    nodes={flowNodes}
                    edges={flowEdges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onEdgeMouseEnter={onEdgeMouseEnter}
                    onEdgeMouseLeave={onEdgeMouseLeave}
                    fitView
                >
                    <Background />
                    <Controls />
                </ReactFlow>
            </div>
        </div>
    );
}
