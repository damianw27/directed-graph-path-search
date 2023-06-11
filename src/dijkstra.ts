import { Edge, Node, ExtendedNode, Path } from "./types";

export class Dijkstra {
  private readonly nodes: Record<string, ExtendedNode>;
  private readonly edges: Record<string, Edge>;

  private sourceNodeId?: string;
  private isPathsAnalyzed: boolean = false;

  public constructor(nodes: Node[], edges: Edge[]) {
    this.nodes = {};
    this.edges = {};

    for (const node of nodes) {
      const relatedEdges = edges
        .filter((edge) => edge.source === node.id || edge.target === node.id)
        .map((edge) => edge.id);

      this.nodes[node.id] = {
        ...node,
        edges: relatedEdges,
        dist: Infinity,
        prev: undefined
      };
    }

    for (const edge of edges) {
      this.edges[edge.id] = edge;
    }
  }

  public analyzePathsFromSource() {
    if (this.sourceNodeId === undefined) {
      throw new Error("Select source node first.");
    }

    if (this.isPathsAnalyzed) {
      for (const nodeId in this.nodes) {
        this.nodes[nodeId].dist = Infinity;
        this.nodes[nodeId].prev = undefined;
      }

      this.isPathsAnalyzed = false;
    }

    this.nodes[this.sourceNodeId].dist = 0;
    const visited: string[] = [];

    while (visited.length < Object.keys(this.nodes).length) {
      const currentNode = this.findMinDistance(visited);

      if (currentNode === undefined) break;

      visited.push(currentNode.id);

      for (const currentEdgeId of currentNode.edges) {
        const currentEdge = this.edges[currentEdgeId];
        const distance = currentEdge.weight;
        const totalDistance = currentNode.dist + distance;
        const neighbor = this.nodes[currentEdge.target];

        if (totalDistance < neighbor.dist) {
          neighbor.dist = totalDistance;
          neighbor.prev = currentNode;
        }
      }
    }

    this.isPathsAnalyzed = true;
  }

  public getShortestPathTo(targetNodeId: string): Path {
    if (this.sourceNodeId === undefined || !this.isPathsAnalyzed) {
      throw new Error("Missing source node or graph not analyzed.");
    }

    let current: ExtendedNode | undefined = this.nodes[targetNodeId];

    const nodes: string[] = [];
    const edges: string[] = [];

    do {
      nodes.push(current.id);

      const currentEdge = current.edges
        .map((edgeId) => this.edges[edgeId])
        .find((edge) => edge.source === current?.prev?.id);

      if (currentEdge === undefined) {
        break;
      }

      edges.push(currentEdge.id);
      current = current.prev;
    } while (current !== undefined);

    return { from: this.sourceNodeId, to: targetNodeId, nodes, edges };
  }

  private findMinDistance(visited: string[]): ExtendedNode | undefined {
    let minDistance = Infinity;
    let minNodeId: string | undefined = undefined;

    for (const nodeId in this.nodes) {
      const node = this.nodes[nodeId];

      if (!visited.includes(nodeId) && node.dist <= minDistance) {
        minDistance = node.dist;
        minNodeId = nodeId;
      }
    }

    return minNodeId !== undefined ? this.nodes[minNodeId] : undefined;
  }

  public setSourceNode(sourceNodeId: string) {
    this.sourceNodeId = sourceNodeId;
  }
}
