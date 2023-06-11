export type Position = [number, number];

export interface Node {
  id: string;
  label: string;
  position: Position;
}

export type ExtendedNode = Node & {
  edges: string[];
  dist: number;
  prev?: ExtendedNode;
};

export interface Edge {
  id: string;
  source: string;
  target: string;
  weight: number;
}

export interface Path {
  from: string;
  to: string;
  nodes: string[];
  edges: string[];
}
