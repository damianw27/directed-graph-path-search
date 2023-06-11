import "./styles.css";
import React, { useState, useEffect, useRef } from "react";
import { v4 as uuid } from "uuid";
import { Dijkstra } from "./dijkstra";
import { Node, Edge, Position, Path } from "./types";
import { useCallback } from "react";

const Graph: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [dijkstra, setDijkstra] = useState<Dijkstra>();
  const [path, setPath] = useState<Path>();
  const [sourceNodeId, setSourceNodeId] = useState<string>();
  const [targetNodeId, setTargetNodeId] = useState<string>();

  function addNodes(...nodesData: [string, Position][]): Node[] {
    const newNodes = nodesData.map(
      ([label, position]): Node => ({
        id: uuid(),
        label,
        position
      })
    );

    setNodes([...newNodes]);
    return newNodes;
  }

  function addEdges(...nodes: [Node, Node][]): Edge[] {
    const newEdges = nodes.map(
      ([source, target]): Edge => {
        const weigth = Math.sqrt(
          (source.position[0] + target.position[0]) ** 2 +
            (source.position[1] + target.position[1]) ** 2
        );

        return {
          id: uuid(),
          source: source.id,
          target: target.id,
          weight: parseFloat(weigth.toPrecision(2))
        };
      }
    );

    setEdges([...newEdges]);
    return newEdges;
  }

  const findNodeAtPosition = useCallback(
    (position: Position): Node | undefined => {
      return nodes.find((node) => {
        const nodeX = node.position[0];
        const nodeY = node.position[1];
        const distancePartX = (position[0] - nodeX) ** 2;
        const distancePartY = (position[1] - nodeY) ** 2;
        const distance = Math.sqrt(distancePartX + distancePartY);
        return distance <= 20;
      });
    },
    [nodes]
  );

  const handleCanvaClick = useCallback(
    (event: MouseEvent): void => {
      event.preventDefault();

      const canvas = canvasRef.current;

      if (!canvas) {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;
      const clickedNode = findNodeAtPosition([clickX, clickY]);

      if (clickedNode === undefined) {
        return;
      }

      if (event.ctrlKey) {
        setTargetNodeId(clickedNode.id);
      } else {
        setSourceNodeId(clickedNode.id);
      }
    },
    [findNodeAtPosition]
  );

  useEffect(() => {
    const addedNodes = addNodes(
      ["A", [100, 100]],
      ["B", [500, 100]],
      ["C", [200, 600]],
      ["D", [700, 600]],
      ["E", [350, 450]],
      ["F", [350, 200]],
      ["G", [590, 450]],
      ["H", [50, 280]]
    );

    const addedEdges = addEdges(
      [addedNodes[0], addedNodes[1]],
      [addedNodes[0], addedNodes[2]],
      [addedNodes[0], addedNodes[5]],
      [addedNodes[0], addedNodes[7]],
      [addedNodes[1], addedNodes[3]],
      [addedNodes[2], addedNodes[3]],
      [addedNodes[2], addedNodes[4]],
      [addedNodes[3], addedNodes[4]],
      [addedNodes[4], addedNodes[5]],
      [addedNodes[5], addedNodes[6]],
      [addedNodes[5], addedNodes[1]],
      [addedNodes[5], addedNodes[0]],
      [addedNodes[6], addedNodes[3]],
      [addedNodes[6], addedNodes[1]],
      [addedNodes[7], addedNodes[0]],
      [addedNodes[7], addedNodes[2]]
    );

    setDijkstra(new Dijkstra(addedNodes, addedEdges));
  }, []);

  useEffect(() => {
    if (dijkstra === undefined || sourceNodeId === undefined) {
      return;
    }

    dijkstra.setSourceNode(sourceNodeId);
    dijkstra.analyzePathsFromSource();
  }, [dijkstra, sourceNodeId]);

  useEffect(() => {
    if (
      dijkstra === undefined ||
      sourceNodeId === undefined ||
      targetNodeId === undefined
    ) {
      return;
    }

    const shortestPath = dijkstra.getShortestPathTo(targetNodeId);
    setPath(shortestPath);
  }, [dijkstra, sourceNodeId, targetNodeId]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;
    canvas.onclick = handleCanvaClick;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    edges.forEach((edge) => {
      const sourceNode = nodes.find((node) => node.id === edge.source);
      const targetNode = nodes.find((node) => node.id === edge.target);

      if (!sourceNode || !targetNode) {
        return;
      }

      const sourceX = sourceNode.position[0];
      const sourceY = sourceNode.position[1];
      const targetX = targetNode.position[0];
      const targetY = targetNode.position[1];

      if (sourceNode && targetNode) {
        ctx.beginPath();

        ctx.strokeStyle =
          path && path.edges.includes(edge.id) ? "blue" : "black";

        ctx.moveTo(sourceX, sourceY);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        const textX = (sourceX + targetX) / 2;
        const textY = (sourceY + targetY) / 2;
        ctx.fillStyle = "red";
        ctx.font = `16px 'Arial'`;
        ctx.fillText(edge.weight.toString(), textX, textY);
      }
    });

    nodes.forEach((node) => {
      const nodeX = node.position[0];
      const nodeY = node.position[1];

      ctx.beginPath();
      ctx.arc(nodeX, nodeY, 20, 0, 2 * Math.PI);
      ctx.fillStyle = path && path.nodes.includes(node.id) ? "blue" : "gray";
      ctx.fillStyle = sourceNodeId === node.id ? "green" : ctx.fillStyle;
      ctx.fillStyle = targetNodeId === node.id ? "red" : ctx.fillStyle;
      ctx.fill();

      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `12px 'Arial'`;
      ctx.fillText(node.label, nodeX, nodeY);
    });
  }, [nodes, edges, handleCanvaClick, path, sourceNodeId, targetNodeId]);

  return (
    <div>
      <h1>Ważony graf</h1>
      <canvas
        ref={canvasRef}
        width={800}
        height={800}
        style={{ border: "1px solid black" }}
      />
    </div>
  );
};

export default function App() {
  return (
    <div className="App">
      <Graph />
    </div>
  );
}
