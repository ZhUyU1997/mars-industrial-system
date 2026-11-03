/**
 * SIMS 一次离子柱的零件与零件路线。
 *
 * 本文件只回答一件事：`plant/sims/primary-column` 由哪些零件组成，
 * 每个零件怎么造。
 *
 * 组成件：
 *
 *   透镜筒 2 节（45 钢，孔径 φ2 / φ1，同心 0.02）
 *   光阑 1 片（钼，φ0.5 研穿）
 *   Wien 极板 2 片（铜 0.15）
 *   Wien 磁轭 1 件（45 钢 1）
 *   Wien 线圈 1 只（铜 0.10）
 *   八极扫描电极 8 片（铜 0.35，±0.8 V / 200 µm）
 *   石英绝缘子 1 组（熔融石英 0.8）
 *
 * 原路线把 45 钢、钼、铜、石英、铜线、钨针都写在 `uses` 里。钨针是研孔工具，
 * 已移到 `needs`；铜线 0.3 与 8 kg 水留在整机路线作接线与研磨/清洗。
 * 45 钢 5 kg 按透镜筒 4、Wien 磁轭 1 分配；铜 0.6 kg 按 Wien 极板 0.15、
 * 线圈 0.10、扫描电极 0.35 分配。分配值是设计值，不是逐件称重。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const SIMS_COLUMN_PARTS: readonly Item[] = [
  { id: 'plant/sims/primary-column/lens-tube', name: '二次离子质谱仪透镜筒', unit: '件', category: 'part' },
  { id: 'plant/sims/primary-column/aperture', name: '二次离子质谱仪光阑', unit: '件', category: 'part' },
  { id: 'plant/sims/primary-column/wien-electrode', name: 'Wien 极板', unit: '件', category: 'part' },
  { id: 'plant/sims/primary-column/wien-yoke', name: 'Wien 磁轭', unit: '件', category: 'part' },
  { id: 'plant/sims/primary-column/wien-coil', name: 'Wien 线圈', unit: '件', category: 'part' },
  { id: 'plant/sims/primary-column/scan-electrode', name: '二次离子质谱仪八极扫描电极', unit: '件', category: 'part' },
  { id: 'plant/sims/primary-column/quartz-insulator', name: '二次离子质谱仪石英绝缘子', unit: '组', category: 'part' },
];

const SIMS_COLUMN_PART_ROUTES_RAW: readonly (Omit<Route, 'needs'> & {
  readonly needs?: Route['needs'];
})[] = [
  {
    /** 透镜筒 2 节：45 钢 4 kg，车孔径 φ2 / φ1，同心 0.02。 */
    id: 'make/sims-column-lens-tube',
    name: '二次离子质谱仪透镜筒制造',
    produces: [{ item: 'plant/sims/primary-column/lens-tube', qty: q(2) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(4) }] }],
    performedBy: 'lathe',
  },
  {
    /** 光阑：钼 0.1 kg，轧 0.05 mm 片，冲 φ2/φ1，研穿 φ0.5。 */
    id: 'make/sims-column-aperture',
    name: '二次离子质谱仪光阑制造',
    produces: [{ item: 'plant/sims/primary-column/aperture', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/molybdenum-powder', qty: q(1, 10) }] }],
    needs: ['std/wire-die-general'],
    steps: [
      { note_zh: '轧 0.05 mm 钼片，冲 φ2 与 φ1', performedBy: 'plant/grinder' },
      { note_zh: '用 0.01 钨针研穿 φ0.5，三次抛光刃口 <2 µm', performedBy: 'plant/grinder' },
    ],
  },
  {
    /** Wien 极板 2 片：铜 0.15 kg，正交电场的一对极板。 */
    id: 'make/sims-wien-electrode',
    name: 'Wien 极板制造',
    produces: [{ item: 'plant/sims/primary-column/wien-electrode', qty: q(2) }],
    uses: [{ anyOf: [{ item: 'mat/copper', qty: q(3, 20) }] }],
    performedBy: 'lathe',
  },
  {
    /** Wien 磁轭 1 件：45 钢 1 kg，0.2 T 电磁铁的磁路。 */
    id: 'make/sims-wien-yoke',
    name: 'Wien 磁轭制造',
    produces: [{ item: 'plant/sims/primary-column/wien-yoke', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(1) }] }],
    steps: [
      { note_zh: '车磁轭', performedBy: 'lathe' },
      { note_zh: '与极板配作，保证气隙对称', performedBy: 'plant/grinder' },
    ],
  },
  {
    /** Wien 线圈 1 只：铜 0.10 kg，绕在磁轭上。 */
    id: 'make/sims-wien-coil',
    name: 'Wien 线圈制造',
    produces: [{ item: 'plant/sims/primary-column/wien-coil', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/copper', qty: q(1, 10) }] }],
    performedBy: 'plant/winder',
  },
  {
    /** 八极扫描电极 8 片：铜 0.35 kg，±0.8 V / 200 µm。 */
    id: 'make/sims-column-scan-electrode',
    name: '二次离子质谱仪八极扫描电极制造',
    produces: [{ item: 'plant/sims/primary-column/scan-electrode', qty: q(8) }],
    uses: [{ anyOf: [{ item: 'mat/copper', qty: q(7, 20) }] }],
    performedBy: 'plant/milling-machine',
  },
  {
    /** 石英绝缘子：熔融石英 0.8 kg，非磁区绝缘。 */
    id: 'make/sims-column-quartz-insulator',
    name: '二次离子质谱仪石英绝缘子制造',
    produces: [{ item: 'plant/sims/primary-column/quartz-insulator', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/quartz-pure', qty: q(4, 5) }] }],
    performedBy: 'plant/grinder',
  },
];

export const SIMS_COLUMN_PART_ROUTES: readonly Route[] = SIMS_COLUMN_PART_ROUTES_RAW.map(
  (route) => ({ needs: [], ...route }),
);

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...SIMS_COLUMN_PARTS];
export const DATA_ROUTES: readonly Route[] = [...SIMS_COLUMN_PART_ROUTES];
