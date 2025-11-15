import { TopBarControls } from "./components/TopBarControls";
import { Sidebar } from "./components/Sidebar";
import { GraphCanvas } from "./components/GraphCanvas";
import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "./store";

type PathHighlight = {
  nodeIds: string[];
  edgeIds: string[];
} | null;

export default function App() {
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
  const [highlightedPath, setHighlightedPath] = useState<PathHighlight>(null);


  const theme = useSelector((state: RootState) => state.theme.theme);
  const isLight = theme === "light";

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: isLight ? "#f5f5f5" : "#1f1f1f",
        color: isLight ? "#111" : "#111",
      }}
    >
      <TopBarControls />
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <Sidebar
          onHighlightNode={setHighlightedNodeId}
          onHighlightPath={setHighlightedPath}  
        />
        <GraphCanvas
          highlightedNodeId={highlightedNodeId}
          pathHighlight={highlightedPath}       
        />
      </div>
    </div>
  );
}
