/// <reference types="vite/client" />

declare module 'd3-force-3d' {
  export interface SimulationNodeDatum {
    index?: number;
    x?: number;
    y?: number;
    z?: number;
    vx?: number;
    vy?: number;
    vz?: number;
    fx?: number | null;
    fy?: number | null;
    fz?: number | null;
  }

  export interface SimulationLinkDatum<N> {
    source: string | N;
    target: string | N;
    index?: number;
  }

  export interface Force<N> {
    (alpha: number): void;
    initialize?: (nodes: N[], ...args: number[]) => void;
  }

  export interface Simulation<N> {
    force(name: string, force: Force<N> | null): this;
    alphaDecay(alpha: number): this;
    stop(): this;
    tick(iterations?: number): this;
  }

  export function forceSimulation<N extends SimulationNodeDatum>(
    nodes?: N[],
    numDimensions?: number,
  ): Simulation<N>;

  export function forceLink<N extends SimulationNodeDatum, L extends SimulationLinkDatum<N>>(
    links?: L[],
  ): any;

  export function forceManyBody<N extends SimulationNodeDatum>(): any;

  export function forceCenter(x?: number, y?: number, z?: number): any;

  export function forceCollide<N extends SimulationNodeDatum>(
    radius?: number | ((node: N) => number),
  ): any;
}
