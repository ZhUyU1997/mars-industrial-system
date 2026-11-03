import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
} from 'd3-force-3d';
import type { SimulationLinkDatum, SimulationNodeDatum } from 'd3-force-3d';

export interface LayoutNode extends SimulationNodeDatum {
  id: string;
  r?: number;
}

export interface LayoutLink extends SimulationLinkDatum<LayoutNode> {
  kind?: string;
}

export interface LayoutOptions {
  /** 额外跑多少轮。位置是预计算好的，这里只用于聚焦 / 重新布局。 */
  ticks?: number;
  /** true = 按球面斐波那契重新铺一遍初始点，false = 从当前位置继续。 */
  reset?: boolean;
  charge?: number;
  distanceMax?: number;
  linkDistance?: number;
  linkStrength?: number;
  collisionPadding?: number;
}

/**
 * 一个确定性的 3D 力导向布局。
 *
 * 全库布局在 generate.ts 里跑一次写进 graph.json，页面打开时直接读坐标，
 * 浏览器不再为 5,183 个节点和两万多条边启动模拟。聚焦 / 重新布局才在本地跑几十轮。
 */
export function layoutPositions(
  nodes: LayoutNode[],
  links: LayoutLink[],
  options: LayoutOptions = {},
): void {
  const {
    ticks = 80,
    reset = true,
    charge = -30,
    distanceMax = 640,
    linkDistance = 30,
    linkStrength = 0.82,
    collisionPadding = 1.6,
  } = options;

  if (nodes.length === 0) return;

  if (reset) {
    const count = nodes.length;
    const radius = 30 * Math.cbrt(count);
    const golden = Math.PI * (3 - Math.sqrt(5));
    nodes.forEach((node, index) => {
      const y = 1 - (index / Math.max(1, count - 1)) * 2;
      const ring = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * index;
      node.x = Math.cos(theta) * ring * radius;
      node.y = y * radius;
      node.z = Math.sin(theta) * ring * radius;
      node.vx = 0;
      node.vy = 0;
      node.vz = 0;
      node.fx = null;
      node.fy = null;
      node.fz = null;
    });
  } else {
    nodes.forEach((node) => {
      if (node.x === undefined) node.x = 0;
      if (node.y === undefined) node.y = 0;
      if (node.z === undefined) node.z = 0;
      node.vx = 0;
      node.vy = 0;
      node.vz = 0;
      node.fx = null;
      node.fy = null;
      node.fz = null;
    });
  }

  const simulation = forceSimulation(nodes, 3)
    .force(
      'link',
      forceLink<LayoutNode, LayoutLink>(links)
        .id((node: LayoutNode) => node.id)
        .distance(linkDistance)
        .strength(linkStrength),
    )
    .force(
      'charge',
      forceManyBody<LayoutNode>().strength(charge).distanceMax(distanceMax),
    )
    .force('center', forceCenter())
    .force(
      'collide',
      forceCollide<LayoutNode>((node) => Math.max(2.2, node.r ?? 2.2) + collisionPadding)
        .strength(0.5)
        .iterations(1),
    )
    .alphaDecay(0.08)
    .stop();

  for (let i = 0; i <= ticks; i++) simulation.tick();
}
