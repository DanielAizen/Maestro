export interface ExampleNode {
    id: string;
    label: string;
    x: number;
    y: number;
}

export interface ExampleEdge {
    id: string;
    source: string;
    target: string;
    weight: number;
}

export interface ExampleGraph {
    id: string;
    name: string;
    description: string;
    nodes: ExampleNode[];
    edges: ExampleEdge[];
}
