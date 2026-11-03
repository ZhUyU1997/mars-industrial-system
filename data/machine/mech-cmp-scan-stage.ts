/**
 * CMP 均匀性 9/49 点扫描台的零件与零件路线。
 *
 * 本文件只回答一件事：`plant/cmp-uniformity-kit/scan-stage` 由哪些零件组成，
 * 每个零件怎么造。
 *
 * 组成件：
 *
 *   底座 1（HT250，300×250，两条导轨槽）
 *   滑板 1（45 钢，刮研配导轨）
 *   φ16 丝杠 1（45 钢，Tr16×2，行程 120 mm）
 *   9 位分度盘 1（酚醛，40° 一格）
 *   涡流探头夹持座 1（铜，带 0.1 mm 垫片组）
 *   100 mm 校准尺 1（std/calibrated-scale-100）
 *
 * 原路线只写“45 钢 6 + 铸铁 4 + 铜 0.35 + 酚醛 0.25 + 尾矿砂 0.5 + 水 3
 * + 标准刻度尺 1”。45 钢按滑板 3、丝杠 3 分配；尾矿砂与水留在整机路线
 * 作研磨与清洗。分配值是设计值，不是逐件称重。
 *
 * ⚠️ 源注释写 3 档半径（0/30/45 mm），但 BOM 没有单列半径块：按“由探头
 * 夹持座的径向定位孔实现”处理。这一层没有把定位孔画成独立零件，属未建模部分。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const CMP_SCAN_STAGE_PARTS: readonly Item[] = [
  { id: 'plant/cmp-uniformity-kit/scan-stage/base', name: 'CMP Base', name_zh: 'CMP 底座', unit: '件', category: 'part' },
  { id: 'plant/cmp-uniformity-kit/scan-stage/slide', name: 'CMP Slide', name_zh: 'CMP 滑板', unit: '件', category: 'part' },
  { id: 'plant/cmp-uniformity-kit/scan-stage/lead-screw', name: 'φ16 Lead Screw', name_zh: 'φ16 丝杠', unit: '件', category: 'part' },
  { id: 'plant/cmp-uniformity-kit/scan-stage/index-plate', name: '9-Position Index Plate', name_zh: '9 位分度盘', unit: '件', category: 'part' },
  { id: 'plant/cmp-uniformity-kit/scan-stage/probe-clamp', name: 'CMP Probe Clamp', name_zh: 'CMP 探头夹持座', unit: '件', category: 'part' },
];

const CMP_SCAN_STAGE_PART_ROUTES_RAW: readonly (Omit<Route, 'needs'> & {
  readonly needs?: Route['needs'];
})[] = [
  {
    /** 底座：HT250 4 kg，铣 300×250 底座、导轨槽与轴承座孔。 */
    id: 'make/cmp-scan-base',
    name: 'CMP Base Manufacturing', name_zh: 'CMP 底座制造',
    produces: [{ item: 'plant/cmp-uniformity-kit/scan-stage/base', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht250', qty: q(4) }] }],
    steps: [
      { note_zh: '浇底座并时效', performedBy: 'plant/melting-furnace', under: [{ param: 'temperature', min: 1350, max: 1450 }] },
      { note_zh: '铣导轨槽与丝杠轴承座孔（同轴 0.02）', performedBy: 'plant/milling-machine' },
    ],
  },
  {
    /** 滑板：45 钢 3 kg，磨导轨面并刮研配作。 */
    id: 'make/cmp-scan-slide',
    name: 'CMP Slide Manufacturing', name_zh: 'CMP 滑板制造',
    produces: [{ item: 'plant/cmp-uniformity-kit/scan-stage/slide', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(3) }] }],
    steps: [
      { note_zh: '铣滑板', performedBy: 'plant/milling-machine' },
      { note_zh: '磨导轨面 5 µm/100 mm，刮研 12–16 点/25 mm²', performedBy: 'plant/grinder' },
    ],
  },
  {
    /** φ16 丝杠：45 钢 3 kg，Tr16×2，行程 120 mm。 */
    id: 'make/cmp-scan-lead-screw',
    name: 'φ16 Lead Screw Manufacturing', name_zh: 'φ16 丝杠制造',
    produces: [{ item: 'plant/cmp-uniformity-kit/scan-stage/lead-screw', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(3) }] }],
    performedBy: 'lathe',
  },
  {
    /** 9 位分度盘：酚醛 0.25 kg，40° 一格 × 9 格。 */
    id: 'make/cmp-scan-index-plate',
    name: '9-Position Index Plate Manufacturing', name_zh: '9 位分度盘制造',
    produces: [{ item: 'plant/cmp-uniformity-kit/scan-stage/index-plate', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/phenolic-resin', qty: q(1, 4) }] }],
    performedBy: 'plant/milling-machine',
  },
  {
    /** 探头夹持座：铜 0.35 kg，带 0.1 mm 垫片组调 0.3 mm 抬升。 */
    id: 'make/cmp-scan-probe-clamp',
    name: 'CMP Probe Clamp Manufacturing', name_zh: 'CMP 探头夹持座制造',
    produces: [{ item: 'plant/cmp-uniformity-kit/scan-stage/probe-clamp', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/copper', qty: q(7, 20) }] }],
    performedBy: 'plant/milling-machine',
  },
];

export const CMP_SCAN_STAGE_PART_ROUTES: readonly Route[] = CMP_SCAN_STAGE_PART_ROUTES_RAW.map(
  (route) => ({ needs: [], ...route }),
);

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...CMP_SCAN_STAGE_PARTS];
export const DATA_ROUTES: readonly Route[] = [...CMP_SCAN_STAGE_PART_ROUTES];
