import { TopBarControls } from "./components/TopBarControls";
import { Sidebar } from "./components/Sidebar";
import { GraphCanvas } from "./components/GraphCanvas";
import { useState } from "react";

export default function App() {
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TopBarControls />
      <div style={{ flex: 1, display: "flex" }}>
        <Sidebar onHighlightNode={setHighlightedNodeId} />
        <GraphCanvas highlightedNodeId={highlightedNodeId} />
      </div>
    </div>
  );
}
