export type ItemCategory = 'material' | 'part' | 'consumable' | 'carrier' | 'machine';
export type LinkKind = 'uses' | 'produces' | 'needs' | 'performs' | 'compose';

export interface CategoryMeta {
  label: string;
  labelZh: string;
  color: string;
  hint: string;
  hintZh: string;
}

export const CATEGORIES: Record<string, CategoryMeta> = {
  material: {
    label: 'Material',
    labelZh: '物料',
    color: '#38bdf8',
    hint: 'Raw material that is processed or consumed',
    hintZh: '被加工、被消耗的原料',
  },
  part: {
    label: 'Part',
    labelZh: '零件',
    color: '#a78bfa',
    hint: 'Fitted to machines and replaceable',
    hintZh: '装在机器上、可拆换',
  },
  machine: {
    label: 'Machine',
    labelZh: '设备',
    color: '#fb7185',
    hint: 'Executes routes; conditions are optional',
    hintZh: '执行路线的机器；条件是可选能力',
  },
  consumable: {
    label: 'Consumable',
    labelZh: '消耗件',
    color: '#fbbf24',
    hint: 'Consumed during operation, not replaceable',
    hintZh: '运行时被吃掉，换不下来',
  },
  carrier: {
    label: 'Carrier',
    labelZh: '载体',
    color: '#34d399',
    hint: 'Energy carrier',
    hintZh: '能量载体',
  },
  interface: {
    label: 'Interface',
    labelZh: '接口',
    color: '#94a3b8',
    hint: 'Abstract entry that only declares properties',
    hintZh: '只能声明属性的抽象条目',
  },
  route: {
    label: 'Manufacturing route',
    labelZh: '制造路线',
    color: '#8fa1bd',
    hint: 'Irreversible processing: inputs → outputs',
    hintZh: '不可逆加工：投料 → 产物',
  },
  measure: {
    label: 'Measurement route',
    labelZh: '测量路线',
    color: '#2dd4bf',
    hint: 'Produces measurement records and narrows design windows',
    hintZh: '产出测量记录，收窄设计窗口',
  },
};

export const EDGES: Record<LinkKind, { label: string; labelZh: string; color: string; dash?: number[]; width: number }> = {
  uses: { label: 'Input', labelZh: '投料', color: '#fb923c', width: 0.7 },
  produces: { label: 'Output', labelZh: '产出', color: '#2dd4bf', width: 0.9 },
  needs: { label: 'Prerequisite', labelZh: '前提', color: '#94a3b8', dash: [2, 4], width: 0.55 },
  performs: { label: 'Performer', labelZh: '执行', color: '#c084fc', width: 0.65 },
  compose: { label: 'Composition', labelZh: '组成', color: '#38bdf8', dash: [1.5, 3], width: 0.6 },
};

export const BG = '#070b14';
export const BG_SOFT = '#0b111e';
export const INK = '#dbe6f5';
export const MUTED = '#7e90ab';
export const FAINT = '#4c5d78';
export const ACCENT = '#67e8f9';
export const SEED = '#fbbf24';
export const MARS = '#34d399';

export function itemColor(cat: string, iface?: boolean): string {
  if (iface) return CATEGORIES.interface!.color;
  return CATEGORIES[cat]?.color ?? CATEGORIES.material!.color;
}

export function routeColor(kind: 'make' | 'measure'): string {
  return kind === 'measure' ? CATEGORIES.measure!.color : CATEGORIES.route!.color;
}
