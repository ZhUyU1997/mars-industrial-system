import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

import type { ViewerLink, ViewerNode } from './model.ts';
import { endpointId } from './model.ts';
import { EDGES } from './theme.ts';
import { nodeTooltip } from './render.ts';
import { nodeLabel } from './i18n.ts';
import type { RenderCtx } from './render.ts';

export interface Scene3DOptions {
  container: HTMLElement;
  renderState: RenderCtx;
  nodeVisible: (node: ViewerNode) => boolean;
  linkVisible: (link: ViewerLink) => boolean;
  onNodeClick: (id: string) => void;
  onBackgroundClick: () => void;
}

interface CameraTween {
  fromPosition: THREE.Vector3;
  toPosition: THREE.Vector3;
  fromTarget: THREE.Vector3;
  toTarget: THREE.Vector3;
  start: number;
  duration: number;
}

const PIXEL_RATIO_CAP = 1.25;
const INTERACTIVE_PIXEL_RATIO = 0.6;

const NODE_VERTEX = `  attribute vec3 aColor;
  attribute float aSize;
  attribute float aShape;
  attribute float aAlpha;
  attribute float aMatch;
  attribute float aIndex;
  uniform float uPixelRatio;
  uniform float uViewScale;
  uniform float uSelected;
  uniform float uHover;
  varying vec3 vColor;
  varying float vShape;
  varying float vAlpha;
  varying float vMatch;
  varying float vIndex;
  void main() {
    vColor = aColor;
    vShape = aShape;
    vAlpha = aAlpha;
    vMatch = aMatch;
    vIndex = aIndex;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float emphasis = 1.0;
    if (abs(aIndex - uSelected) < 0.5) emphasis = 2.6;
    else if (abs(aIndex - uHover) < 0.5) emphasis = 1.7;
    gl_PointSize = clamp(aSize * emphasis * uPixelRatio * (uViewScale / max(1.0, -mvPosition.z)), 1.0, 64.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const NODE_FRAGMENT = `
  uniform float uSelected;
  uniform float uHover;
  varying vec3 vColor;
  varying float vShape;
  varying float vAlpha;
  varying float vMatch;
  varying float vIndex;
  void main() {
    vec2 p = gl_PointCoord * 2.0 - 1.0;
    float d = vShape > 0.5 ? abs(p.x) + abs(p.y) : length(p);
    if (d > 1.0) discard;
    float edge = smoothstep(1.0, 0.68, d);
    float glow = pow(max(0.0, 1.0 - d), 2.0);
    vec3 col = vColor + vColor * glow * 0.45;
    float alpha = vAlpha * edge;
    if (vMatch > 0.5) {
      col = mix(col, vec3(1.0), 0.3);
      alpha = max(alpha, edge * 0.92);
    }
    if (abs(vIndex - uHover) < 0.5) {
      col += vec3(0.22);
      alpha = max(alpha, edge * 0.96);
    }
    if (abs(vIndex - uSelected) < 0.5) {
      float ring = smoothstep(0.98, 0.84, d) * smoothstep(0.5, 0.68, d);
      col = mix(col, vec3(0.7, 1.0, 1.0), ring);
      alpha = max(alpha, ring);
    }
    gl_FragColor = vec4(col, alpha);
  }
`;

export class Scene3D {
  private readonly container: HTMLElement;
  private readonly renderState: RenderCtx;
  private readonly nodeFilter: (node: ViewerNode) => boolean;
  private readonly linkFilter: (link: ViewerLink) => boolean;
  private readonly onNodeClick: (id: string) => void;
  private readonly onBackgroundClick: () => void;

  private readonly renderer: THREE.WebGLRenderer;
  private readonly labelRenderer: CSS2DRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly controls: OrbitControls;
  private readonly tooltip: HTMLDivElement;

  private nodes: ViewerNode[] = [];
  private links: ViewerLink[] = [];
  private visibleNodes: ViewerNode[] = [];
  private visibleLinks: ViewerLink[] = [];
  private nodeIndex = new Map<string, number>();

  private points: THREE.Points | null = null;
  private pointGeometry: THREE.BufferGeometry | null = null;
  private pointMaterial: THREE.ShaderMaterial | null = null;
  private lineSegments: THREE.LineSegments | null = null;
  private lineGeometry: THREE.BufferGeometry | null = null;
  private lineMaterial: THREE.LineBasicMaterial | null = null;
  private baseLinkColors: Float32Array | null = null;
  private labels: CSS2DObject[] = [];
  private screenCache: { node: ViewerNode; x: number; y: number }[] = [];
  private screenDirty = true;

  private hoverId: string | null = null;
  private hoverFrame = 0;
  private pointerDown = { x: 0, y: 0, button: 0 };
  private interacting = false;
  private fitDistance = 1000;
  private hasInteracted = false;
  private tween: CameraTween | null = null;
  private animation = 0;
  private dirty = true;
  private dprTimer: number | null = null;
  private lineLodTimer: number | null = null;
  private labelTimer: number | null = null;
  private resizeObserver: ResizeObserver;

  constructor(options: Scene3DOptions) {
    this.container = options.container;
    this.renderState = options.renderState;
    this.nodeFilter = options.nodeVisible;
    this.linkFilter = options.linkVisible;
    this.onNodeClick = options.onNodeClick;
    this.onBackgroundClick = options.onBackgroundClick;

    const width = Math.max(1, this.container.clientWidth);
    const height = Math.max(1, this.container.clientHeight);

    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, PIXEL_RATIO_CAP));
    this.renderer.setSize(width, height, false);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.className = 'scene-canvas';
    this.container.appendChild(this.renderer.domElement);

    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(width, height);
    this.labelRenderer.domElement.className = 'label-layer';
    this.container.appendChild(this.labelRenderer.domElement);

    this.tooltip = document.createElement('div');
    this.tooltip.className = 'scene-tooltip';
    this.tooltip.hidden = true;
    this.container.appendChild(this.tooltip);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100000);
    this.camera.position.set(900, 620, 1100);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = false;
    this.controls.rotateSpeed = 0.55;
    this.controls.zoomSpeed = 0.9;
    this.controls.panSpeed = 0.7;
    this.controls.screenSpacePanning = true;
    this.controls.minDistance = 20;
    this.controls.maxDistance = 30000;
    this.controls.target.set(0, 0, 0);
    this.controls.addEventListener('change', () => {
      this.dirty = true;
      this.screenDirty = true;
      this.scheduleLabelUpdate();
    });
    this.controls.addEventListener('start', () => {
      this.tween = null;
      this.controls.enabled = true;
      this.hasInteracted = true;
      this.hoverId = null;
      this.hideTooltip();
      if (this.pointMaterial !== null) this.pointMaterial.uniforms.uHover!.value = -1;
      this.dirty = true;
    });

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.container);

    this.bindPointer();
    this.animation = requestAnimationFrame(this.animate);
  }

  setData(nodes: ViewerNode[], links: ViewerLink[]): void {
    this.nodes = nodes;
    this.links = links;
    this.dirty = true;
    this.rebuild();
  }

  refresh(): void {
    this.dirty = true;
    this.rebuild();
  }

  applyRenderState(): void {
    this.dirty = true;
    this.updateStyle();
  }

  setSize(width: number, height: number): void {
    const w = Math.max(1, width);
    const h = Math.max(1, height);
    this.renderer.setSize(w, h, false);
    this.labelRenderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (this.pointMaterial !== null) {
      this.pointMaterial.uniforms.uPixelRatio!.value = this.renderer.getPixelRatio();
    }
    this.screenDirty = true;
    this.dirty = true;
    this.scheduleLabelUpdate();
  }

  private setInteractivePixelRatio(cap: number): void {
    const ratio = Math.min(window.devicePixelRatio || 1, cap);
    if (Math.abs(this.renderer.getPixelRatio() - ratio) < 0.01) return;
    this.renderer.setPixelRatio(ratio);
    if (this.pointMaterial !== null) {
      this.pointMaterial.uniforms.uPixelRatio!.value = ratio;
    }
    this.dirty = true;
  }

  private restorePixelRatioSoon(): void {
    if (this.dprTimer !== null) window.clearTimeout(this.dprTimer);
    this.dprTimer = window.setTimeout(() => {
      this.dprTimer = null;
      this.setInteractivePixelRatio(PIXEL_RATIO_CAP);
    }, 180);
  }

  private setLineLod(active: boolean): void {
    if (this.lineGeometry === null) return;
    const total = this.visibleLinks.length * 2;
    const count = active ? Math.max(2, Math.floor((total * 0.25) / 2) * 2) : total;
    this.lineGeometry.setDrawRange(0, count);
    this.dirty = true;
  }

  private restoreLineLodSoon(): void {
    if (this.lineLodTimer !== null) window.clearTimeout(this.lineLodTimer);
    this.lineLodTimer = window.setTimeout(() => {
      this.lineLodTimer = null;
      this.setLineLod(false);
    }, 140);
  }

  fit(duration = 0, offsetX = 0): void {
    if (this.visibleNodes.length === 0) return;
    const xs: number[] = [];
    const ys: number[] = [];
    const zs: number[] = [];
    for (const node of this.visibleNodes) {
      xs.push(node.x ?? 0);
      ys.push(node.y ?? 0);
      zs.push(node.z ?? 0);
    }
    const median = (values: number[]): number => {
      values.sort((a, b) => a - b);
      return values[Math.floor(values.length / 2)] ?? 0;
    };
    const center = new THREE.Vector3(median(xs), median(ys), median(zs));
    const distances = this.visibleNodes.map((node) =>
      Math.hypot(
        (node.x ?? 0) - center.x,
        (node.y ?? 0) - center.y,
        (node.z ?? 0) - center.z,
      ),
    );
    distances.sort((a, b) => a - b);
    const percentile = distances[Math.floor((distances.length - 1) * 0.82)] ?? 24;
    const radius = Math.max(24, percentile);
    const distance = (radius / Math.sin(THREE.MathUtils.degToRad(this.camera.fov * 0.5))) * 1.6;
    const direction = this.hasInteracted
      ? this.camera.position.clone().sub(this.controls.target).normalize()
      : new THREE.Vector3(0.82, 0.55, 1).normalize();
    if (direction.lengthSq() < 0.001) direction.set(0.82, 0.55, 1).normalize();

    if (offsetX !== 0) {
      const height = Math.max(1, this.container.clientHeight);
      const worldPerPixel = (2 * distance * Math.tan(THREE.MathUtils.degToRad(this.camera.fov * 0.5))) / height;
      const right = new THREE.Vector3(0, 1, 0).cross(direction).normalize();
      center.addScaledVector(right, -offsetX * worldPerPixel);
    }

    const position = center.clone().add(direction.multiplyScalar(distance));
    this.fitDistance = distance;
    this.controls.minDistance = Math.max(8, radius * 0.06);
    this.controls.maxDistance = Math.max(2400, radius * 9);
    this.camera.near = 0.1;
    this.camera.far = Math.max(10000, distance + radius * 12);
    this.camera.updateProjectionMatrix();
    if (this.pointMaterial !== null) {
      this.pointMaterial.uniforms.uViewScale!.value = distance;
    }
    this.animateCamera(center, position, duration);
  }

  focusNode(id: string, duration = 500): void {
    const node = this.nodes.find((entry) => entry.id === id);
    if (node === undefined) return;
    const target = new THREE.Vector3(node.x ?? 0, node.y ?? 0, node.z ?? 0);
    const direction = this.camera.position.clone().sub(this.controls.target);
    if (direction.lengthSq() < 0.001) direction.set(0.82, 0.55, 1);
    direction.normalize();
    const current = this.camera.position.distanceTo(this.controls.target);
    const distance = Math.max(24, Math.min(current, this.fitDistance * 0.45));
    const position = target.clone().add(direction.multiplyScalar(distance));
    this.animateCamera(target, position, duration);
  }

  zoomBy(factor: number): void {
    const current = this.camera.position.distanceTo(this.controls.target);
    const next = THREE.MathUtils.clamp(
      current / factor,
      this.controls.minDistance,
      this.controls.maxDistance,
    );
    const direction = this.camera.position.clone().sub(this.controls.target).normalize();
    const target = this.controls.target.clone();
    const position = target.clone().add(direction.multiplyScalar(next));
    this.animateCamera(target, position, 260);
  }

  getZoom(): number {
    const current = this.camera.position.distanceTo(this.controls.target);
    return current > 0 ? this.fitDistance / current : 1;
  }

  getStats(): { nodes: number; links: number; calls: number; triangles: number; frame: number } {
    return {
      nodes: this.visibleNodes.length,
      links: this.visibleLinks.length,
      calls: this.renderer.info.render.calls,
      triangles: this.renderer.info.render.triangles,
      frame: this.renderer.info.render.frame,
    };
  }

  private resize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width <= 0 || height <= 0) return;
    this.setSize(width, height);
  }

  private animate = (): void => {
    this.animation = requestAnimationFrame(this.animate);
    const now = performance.now();
    const hadTween = this.tween !== null;
    this.stepTween(now);
    const changed = this.controls.update() || hadTween || this.dirty;
    if (!changed) return;
    this.dirty = false;
    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);
  };

  private stepTween(now: number): void {
    const tween = this.tween;
    if (tween === null) return;
    const progress = Math.min(1, (now - tween.start) / Math.max(1, tween.duration));
    const eased = 1 - (1 - progress) ** 3;
    this.camera.position.lerpVectors(tween.fromPosition, tween.toPosition, eased);
    this.controls.target.lerpVectors(tween.fromTarget, tween.toTarget, eased);
    this.controls.update();
    this.screenDirty = true;
    this.dirty = true;
    if (progress >= 1) {
      this.tween = null;
      this.controls.enabled = true;
    }
  }

  private animateCamera(
    target: THREE.Vector3,
    position: THREE.Vector3,
    duration: number,
  ): void {
    if (duration <= 0) {
      this.tween = null;
      this.controls.target.copy(target);
      this.camera.position.copy(position);
      this.controls.enabled = true;
      this.controls.update();
      this.screenDirty = true;
      this.dirty = true;
      return;
    }
    this.tween = {
      fromPosition: this.camera.position.clone(),
      toPosition: position,
      fromTarget: this.controls.target.clone(),
      toTarget: target,
      start: performance.now(),
      duration,
    };
    this.controls.enabled = false;
    this.screenDirty = true;
    this.dirty = true;
  }

  private rebuild(): void {
    this.screenDirty = true;
    this.visibleNodes = this.nodes.filter((node) => this.nodeFilter(node));
    this.nodeIndex = new Map(this.visibleNodes.map((node, index) => [node.id, index]));
    const visibleIds = new Set(this.visibleNodes.map((node) => node.id));
    this.visibleLinks = this.links.filter(
      (link) =>
        visibleIds.has(endpointId(link.source)) &&
        visibleIds.has(endpointId(link.target)) &&
        this.linkFilter(link),
    );

    this.disposeSceneObjects();

    const count = this.visibleNodes.length;
    if (count > 0) {
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const sizes = new Float32Array(count);
      const shapes = new Float32Array(count);
      const alphas = new Float32Array(count);
      const matches = new Float32Array(count);
      const indices = new Float32Array(count);
      const color = new THREE.Color();

      this.visibleNodes.forEach((node, index) => {
        positions[index * 3] = node.x ?? 0;
        positions[index * 3 + 1] = node.y ?? 0;
        positions[index * 3 + 2] = node.z ?? 0;
        color.set(node.color);
        colors[index * 3] = color.r;
        colors[index * 3 + 1] = color.g;
        colors[index * 3 + 2] = color.b;
        sizes[index] =
          1.8 + Math.min(6, node.r) * 1.1 + (node.item?.seed === 1 ? 1.8 : 0);
        shapes[index] = node.kind === 'route' ? 1 : 0;
        alphas[index] = 1;
        matches[index] = 0;
        indices[index] = index;
      });

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
      geometry.setAttribute('aShape', new THREE.BufferAttribute(shapes, 1));
      geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
      geometry.setAttribute('aMatch', new THREE.BufferAttribute(matches, 1));
      geometry.setAttribute('aIndex', new THREE.BufferAttribute(indices, 1));
      geometry.computeBoundingSphere();

      const material = new THREE.ShaderMaterial({
        uniforms: {
          uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, PIXEL_RATIO_CAP) },
          uViewScale: { value: this.fitDistance },
          uSelected: { value: -1 },
          uHover: { value: -1 },
        },
        vertexShader: NODE_VERTEX,
        fragmentShader: NODE_FRAGMENT,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        blending: THREE.NormalBlending,
      });
      const points = new THREE.Points(geometry, material);
      points.frustumCulled = false;
      points.renderOrder = 2;
      this.scene.add(points);
      this.points = points;
      this.pointGeometry = geometry;
      this.pointMaterial = material;
    }

    const linkCount = this.visibleLinks.length;
    if (linkCount > 0) {
      const positions = new Float32Array(linkCount * 6);
      const colors = new Float32Array(linkCount * 6);
      const color = new THREE.Color();
      const allById = new Map(this.nodes.map((node) => [node.id, node]));
      this.visibleLinks.forEach((link, index) => {
        const source = allById.get(endpointId(link.source));
        const target = allById.get(endpointId(link.target));
        if (source === undefined || target === undefined) return;
        positions[index * 6] = source.x ?? 0;
        positions[index * 6 + 1] = source.y ?? 0;
        positions[index * 6 + 2] = source.z ?? 0;
        positions[index * 6 + 3] = target.x ?? 0;
        positions[index * 6 + 4] = target.y ?? 0;
        positions[index * 6 + 5] = target.z ?? 0;
        color.set(EDGES[link.kind]?.color ?? '#94a3b8');
        const weight = link.kind === 'needs' ? 0.07 : link.kind === 'produces' ? 0.16 : 0.11;
        colors[index * 6] = color.r * weight;
        colors[index * 6 + 1] = color.g * weight;
        colors[index * 6 + 2] = color.b * weight;
        colors[index * 6 + 3] = color.r * weight;
        colors[index * 6 + 4] = color.g * weight;
        colors[index * 6 + 5] = color.b * weight;
      });
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const colorAttribute = new THREE.BufferAttribute(colors.slice(), 3);
      geometry.setAttribute('color', colorAttribute);
      const material = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: false,
        blending: THREE.NoBlending,
        depthWrite: true,
      });
      const lines = new THREE.LineSegments(geometry, material);
      lines.frustumCulled = false;
      lines.renderOrder = 1;
      this.scene.add(lines);
      this.lineSegments = lines;
      this.lineGeometry = geometry;
      this.lineMaterial = material;
      this.baseLinkColors = colors;
    }

    this.updateStyle();
  }

  private updateStyle(): void {
    this.dirty = true;
    const selectedId = this.renderState.selectedId;
    const selectedSet = this.renderState.selectedSet;
    const matches = this.renderState.matches;

    if (this.pointGeometry !== null && this.pointMaterial !== null) {
      const alpha = this.pointGeometry.getAttribute('aAlpha') as THREE.BufferAttribute;
      const match = this.pointGeometry.getAttribute('aMatch') as THREE.BufferAttribute;
      const alphaArray = alpha.array as Float32Array;
      const matchArray = match.array as Float32Array;
      this.visibleNodes.forEach((node, index) => {
        const dimmed =
          selectedSet !== null && !selectedSet.has(node.id) && node.id !== selectedId;
        const isMatch = matches.has(node.id);
        alphaArray[index] = isMatch ? 0.95 : dimmed ? 0.13 : 1;
        matchArray[index] = isMatch ? 1 : 0;
      });
      alpha.needsUpdate = true;
      match.needsUpdate = true;

      const selectedIndex = selectedId === null ? -1 : this.nodeIndex.get(selectedId) ?? -1;
      const hoverIndex = this.hoverId === null ? -1 : this.nodeIndex.get(this.hoverId) ?? -1;
      this.pointMaterial.uniforms.uSelected!.value = selectedIndex;
      this.pointMaterial.uniforms.uHover!.value = hoverIndex;
    }

    if (this.lineGeometry !== null && this.baseLinkColors !== null) {
      const color = this.lineGeometry.getAttribute('color') as THREE.BufferAttribute;
      const target = color.array as Float32Array;
      const selected = selectedSet;
      for (let index = 0; index < this.visibleLinks.length; index++) {
        const link = this.visibleLinks[index]!;
        const active =
          selected === null ||
          (selected.has(endpointId(link.source)) && selected.has(endpointId(link.target)));
        const factor = active ? 1 : 0.1;
        target[index * 6] = this.baseLinkColors[index * 6]! * factor;
        target[index * 6 + 1] = this.baseLinkColors[index * 6 + 1]! * factor;
        target[index * 6 + 2] = this.baseLinkColors[index * 6 + 2]! * factor;
        target[index * 6 + 3] = this.baseLinkColors[index * 6 + 3]! * factor;
        target[index * 6 + 4] = this.baseLinkColors[index * 6 + 4]! * factor;
        target[index * 6 + 5] = this.baseLinkColors[index * 6 + 5]! * factor;
      }
      color.needsUpdate = true;
    }

    this.updateLabels();
  }

  private updateLabels(): void {
    this.dirty = true;
    for (const label of this.labels) {
      this.scene.remove(label);
      label.element.remove();
    }
    this.labels = [];

    if (this.visibleNodes.length === 0) return;

    const selectedId = this.renderState.selectedId;
    const selected =
      selectedId === null
        ? undefined
        : this.visibleNodes.find((node) => node.id === selectedId);
    const hovered =
      this.hoverId === null
        ? undefined
        : this.visibleNodes.find((node) => node.id === this.hoverId);
    const focus = this.renderState.selectedSet;
    const matches = this.renderState.matches;

    const inScope = (node: ViewerNode): boolean =>
      focus === null || focus.has(node.id);

    const priority = (node: ViewerNode): number =>
      (matches.has(node.id) ? 1_000_000 : 0) +
      (node.item?.seed === 1 ? 100_000 : 0) +
      node.degree;

    const width = Math.max(1, this.container.clientWidth);
    const height = Math.max(1, this.container.clientHeight);
    const containerRect = this.container.getBoundingClientRect();
    const filterPanel = document.querySelector<HTMLElement>('.filters');
    const filterRect = filterPanel?.getBoundingClientRect();
    const leftSafe =
      filterRect !== undefined && filterRect.width > 0 && filterRect.right > containerRect.left
        ? Math.min(width * 0.45, filterRect.right - containerRect.left + 8)
        : 4;
    const boxes: { x1: number; y1: number; x2: number; y2: number }[] = [];
    const hits = (x: number, y: number, w: number, h: number): boolean =>
      boxes.some((b) => x + w >= b.x1 && x <= b.x2 && y + h >= b.y1 && y <= b.y2);

    const project = (node: ViewerNode): { x: number; y: number } | null => {
      const point = new THREE.Vector3(node.x ?? 0, node.y ?? 0, node.z ?? 0).project(
        this.camera,
      );
      if (point.z < -1 || point.z > 1) return null;
      return {
        x: (point.x * 0.5 + 0.5) * width,
        y: (-point.y * 0.5 + 0.5) * height,
      };
    };

    const addLabelAt = (
      node: ViewerNode,
      at: { x: number; y: number },
      avoidOverlap: boolean,
    ): boolean => {
      const text = nodeLabel(node);
      const estimated = [...text].reduce((sum, ch) => sum + (ch.codePointAt(0)! > 255 ? 9 : 5.5), 0);
      const w = Math.min(210, Math.max(34, estimated + 16));
      const h = 17;
      const half = w / 2;
      let align = 0.5;
      let left = at.x - half;
      if (left < leftSafe) {
        align = 0;
        left = at.x;
      }
      if (left + w > width - 4) {
        align = 1;
        left = at.x - w;
      }
      let centerY = 1.5;
      let top = at.y - h * 1.5;
      if (top < 4) {
        centerY = -0.5;
        top = at.y + h * 0.5;
      }
      if (left < leftSafe || left + w > width - 4 || top < 4 || top + h > height - 4) {
        return false;
      }
      if (avoidOverlap && hits(left, top, w, h)) return false;
      boxes.push({ x1: left, y1: top, x2: left + w, y2: top + h });

      const element = document.createElement('div');
      element.className = `label3d${node.id === selectedId ? ' is-selected' : ''}${
        node.item?.seed === 1 ? ' is-seed' : ''
      }`;
      element.textContent = text;
      element.title = `${text}\n${node.id}`;
      element.dataset.nodeId = node.id;
      element.setAttribute('role', 'button');
      element.setAttribute('aria-label', text);
      element.addEventListener('pointerdown', (event) => {
        event.stopPropagation();
      });
      element.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.onNodeClick(node.id);
      });
      const label = new CSS2DObject(element);
      label.position.set(node.x ?? 0, node.y ?? 0, node.z ?? 0);
      label.center.set(align, centerY);
      this.scene.add(label);
      this.labels.push(label);
      return true;
    };

    const budget = this.labelBudget(width, height);
    const labeled = new Set<string>();
    const add = (node: ViewerNode, avoidOverlap: boolean): boolean => {
      if (labeled.has(node.id) || this.labels.length >= budget) return false;
      const at = project(node);
      if (at === null || !addLabelAt(node, at, avoidOverlap)) return false;
      labeled.add(node.id);
      return true;
    };

    // 选中与悬停永远保留；种子与搜索结果随后补上。
    if (selected !== undefined) add(selected, false);
    if (hovered !== undefined) add(hovered, false);
    const seeds = this.visibleNodes
      .filter(
        (node) =>
          node.item?.seed === 1 &&
          node.id !== selectedId &&
          node.id !== this.hoverId,
      )
      .sort((a, b) => b.degree - a.degree);
    for (const node of seeds) add(node, true);
    const matchNodes = this.visibleNodes
      .filter((node) => matches.has(node.id) && !labeled.has(node.id))
      .sort((a, b) => b.degree - a.degree)
      .slice(0, 12);
    for (const node of matchNodes) add(node, true);

    // 屏幕分格：每格只留一个最高优先节点，再按 3×3 区域分配配额。
    // 这样标签不会全挤在中心：边缘区域也有固定名额。
    type Candidate = { node: ViewerNode; at: { x: number; y: number }; priority: number; zone: number };
    const CELL_W = 96;
    const CELL_H = 32;
    const ZONES_X = 5;
    const ZONES_Y = 5;
    const byCell = new Map<string, Candidate>();
    for (const node of this.visibleNodes) {
      if (labeled.has(node.id) || !inScope(node)) continue;
      const at = project(node);
      if (at === null || at.x < leftSafe || at.x > width || at.y < 0 || at.y > height) continue;
      const zone =
        Math.min(ZONES_Y - 1, Math.max(0, Math.floor((at.y / height) * ZONES_Y))) * ZONES_X +
        Math.min(ZONES_X - 1, Math.max(0, Math.floor((at.x / width) * ZONES_X)));
      const cell = `${Math.floor(at.x / CELL_W)},${Math.floor(at.y / CELL_H)}`;
      const candidate: Candidate = { node, at, priority: priority(node), zone };
      const previous = byCell.get(cell);
      if (previous === undefined || candidate.priority > previous.priority) {
        byCell.set(cell, candidate);
      }
    }

    const zones = new Map<number, Candidate[]>();
    for (const candidate of byCell.values()) {
      const list = zones.get(candidate.zone);
      if (list === undefined) zones.set(candidate.zone, [candidate]);
      else list.push(candidate);
    }
    const zoneList = [...zones.values()].map((cands) => ({
      cands: cands.sort((a, b) => b.priority - a.priority),
      quota: 0,
    }));
    zoneList.sort((a, b) => b.cands[0]!.priority - a.cands[0]!.priority);

    let remaining = Math.max(0, budget - this.labels.length);
    for (const zone of zoneList) {
      if (remaining <= 0) break;
      zone.quota = 1;
      remaining--;
    }
    let index = 0;
    while (remaining > 0 && zoneList.length > 0) {
      zoneList[index % zoneList.length]!.quota++;
      remaining--;
      index++;
    }

    for (const zone of zoneList) {
      let added = 0;
      for (const candidate of zone.cands) {
        if (added >= zone.quota || this.labels.length >= budget) break;
        if (addLabelAt(candidate.node, candidate.at, true)) {
          labeled.add(candidate.node.id);
          added++;
        }
      }
    }

    // 配额没用完（碰撞被跳过）时，用剩余格子的优先级补满。
    if (this.labels.length < budget) {
      const rest = [...byCell.values()].sort((a, b) => b.priority - a.priority);
      for (const candidate of rest) {
        if (this.labels.length >= budget) break;
        if (labeled.has(candidate.node.id)) continue;
        if (addLabelAt(candidate.node, candidate.at, true)) labeled.add(candidate.node.id);
      }
    }
  }

  /** 屏幕越大，能容纳且不互相遮挡的标签越多；缩放只改变同一屏幕上的采样密度。 */
  private labelBudget(width: number, height: number): number {
    const base = (width * height) / 11000;
    const zoom = this.getZoom();
    const zoomFactor = zoom > 2.2 ? 2 : zoom > 1.2 ? 1.5 : 1;
    return Math.max(16, Math.min(160, Math.round(base * zoomFactor)));
  }

  private scheduleLabelUpdate(): void {
    if (this.labelTimer !== null) return;
    this.labelTimer = window.setTimeout(() => {
      this.labelTimer = null;
      this.updateLabels();
    }, 140);
  }

  private disposeSceneObjects(): void {
    if (this.points !== null) {
      this.scene.remove(this.points);
      this.pointGeometry?.dispose();
      this.pointMaterial?.dispose();
    }
    if (this.lineSegments !== null) {
      this.scene.remove(this.lineSegments);
      this.lineGeometry?.dispose();
      this.lineMaterial?.dispose();
    }
    this.points = null;
    this.pointGeometry = null;
    this.pointMaterial = null;
    this.lineSegments = null;
    this.lineGeometry = null;
    this.lineMaterial = null;
    this.baseLinkColors = null;
    for (const label of this.labels) {
      this.scene.remove(label);
      label.element.remove();
    }
    this.labels = [];
  }

  private bindPointer(): void {
    const canvas = this.renderer.domElement;
    canvas.addEventListener('contextmenu', (event) => event.preventDefault());
    canvas.addEventListener(
      'wheel',
      () => {
        this.setLineLod(true);
        this.restoreLineLodSoon();
      },
      { passive: true },
    );
    canvas.addEventListener('pointermove', (event) => {
      if (event.buttons !== 0) {
        if (!this.interacting) {
          this.interacting = true;
          if (this.dprTimer !== null) {
            window.clearTimeout(this.dprTimer);
            this.dprTimer = null;
          }
          if (this.lineLodTimer !== null) {
            window.clearTimeout(this.lineLodTimer);
            this.lineLodTimer = null;
          }
          this.setInteractivePixelRatio(INTERACTIVE_PIXEL_RATIO);
          this.setLineLod(true);
        }
        this.hideTooltip();
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      this.scheduleHover(x, y, event.clientX, event.clientY);
    });
    canvas.addEventListener('pointerleave', () => {
      this.hoverId = null;
      this.dirty = true;
      if (this.pointMaterial !== null) this.pointMaterial.uniforms.uHover!.value = -1;
      this.hideTooltip();
      canvas.style.cursor = 'grab';
      if (this.interacting) {
        this.interacting = false;
        this.restorePixelRatioSoon();
        this.restoreLineLodSoon();
      }
    });
    canvas.addEventListener('pointerdown', (event) => {
      this.pointerDown = { x: event.clientX, y: event.clientY, button: event.button };
    });
    canvas.addEventListener('pointerup', (event) => {
      if (this.interacting) {
        this.interacting = false;
        this.restorePixelRatioSoon();
        this.restoreLineLodSoon();
      }
      const distance = Math.hypot(
        event.clientX - this.pointerDown.x,
        event.clientY - this.pointerDown.y,
      );
      if (event.button !== 0 || distance > 6) return;
      const rect = canvas.getBoundingClientRect();
      const node = this.pickNode(event.clientX - rect.left, event.clientY - rect.top);
      if (node !== null) this.onNodeClick(node.id);
      else this.onBackgroundClick();
    });
  }

  private scheduleHover(x: number, y: number, clientX: number, clientY: number): void {
    if (this.hoverFrame !== 0) cancelAnimationFrame(this.hoverFrame);
    this.hoverFrame = requestAnimationFrame(() => {
      this.hoverFrame = 0;
      const node = this.pickNode(x, y);
      const next = node?.id ?? null;
      const changed = next !== this.hoverId;
      if (changed) {
        this.hoverId = next;
        this.dirty = true;
        if (this.pointMaterial !== null) {
          this.pointMaterial.uniforms.uHover!.value =
            next === null ? -1 : this.nodeIndex.get(next) ?? -1;
        }
        this.renderer.domElement.style.cursor = next === null ? 'grab' : 'pointer';
        if (node !== null) this.tooltip.innerHTML = nodeTooltip(node);
      }
      if (node === null) {
        this.tooltip.hidden = true;
        return;
      }
      this.tooltip.hidden = false;
      const rect = this.container.getBoundingClientRect();
      const left = Math.min(rect.width - 270, Math.max(10, clientX - rect.left + 14));
      const top = Math.min(rect.height - 90, Math.max(10, clientY - rect.top + 14));
      this.tooltip.style.left = `${left}px`;
      this.tooltip.style.top = `${top}px`;
    });
  }

  private hideTooltip(): void {
    this.tooltip.hidden = true;
  }

  private pickNode(x: number, y: number): ViewerNode | null {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width <= 0 || height <= 0) return null;

    if (this.screenDirty) {
      this.camera.updateMatrixWorld();
      const point = new THREE.Vector3();
      this.screenCache = [];
      for (const node of this.visibleNodes) {
        point.set(node.x ?? 0, node.y ?? 0, node.z ?? 0).project(this.camera);
        if (point.z < -1 || point.z > 1) continue;
        this.screenCache.push({
          node,
          x: (point.x * 0.5 + 0.5) * width,
          y: (-point.y * 0.5 + 0.5) * height,
        });
      }
      this.screenDirty = false;
    }

    let best: ViewerNode | null = null;
    let bestDistance = 11;
    for (const entry of this.screenCache) {
      const distance = Math.hypot(entry.x - x, entry.y - y);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = entry.node;
      }
    }
    return best;
  }
}
