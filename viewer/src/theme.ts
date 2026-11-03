export type ItemCategory = 'material' | 'part' | 'consumable' | 'carrier' | 'machine';
export type LinkKind = 'uses' | 'produces' | 'needs' | 'performs' | 'compose';

export interface CategoryMeta {
  label: string;
  color: string;
  hint: string;
}

export const CATEGORIES: Record<string, CategoryMeta> = {
  material: { label: '物料', color: '#38bdf8', hint: '被加工、被消耗的原料' },
  part: { label: '零件', color: '#a78bfa', hint: '装在机器上、可拆换' },
  machine: { label: '设备', color: '#fb7185', hint: '执行路线的机器；条件是可选能力' },
  consumable: { label: '消耗件', color: '#fbbf24', hint: '运行时被吃掉，换不下来' },
  carrier: { label: '载体', color: '#34d399', hint: '能量载体' },
  interface: { label: '接口', color: '#94a3b8', hint: '只能声明属性的抽象条目' },
  route: { label: '制造路线', color: '#8fa1bd', hint: '不可逆加工：投料 → 产物' },
  measure: { label: '测量路线', color: '#2dd4bf', hint: '产出测量记录，收窄设计窗口' },
};

export const EDGES: Record<LinkKind, { label: string; color: string; dash?: number[]; width: number }> = {
  uses: { label: '投料', color: '#fb923c', width: 0.7 },
  produces: { label: '产出', color: '#2dd4bf', width: 0.9 },
  needs: { label: '前提', color: '#94a3b8', dash: [2, 4], width: 0.55 },
  performs: { label: '执行', color: '#c084fc', width: 0.65 },
  compose: { label: '组成', color: '#38bdf8', dash: [1.5, 3], width: 0.6 },
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
