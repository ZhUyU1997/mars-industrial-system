/**
 * 主轴误差分析仪电容探头的零件与零件路线。
 *
 * 本文件只回答一件事：`plant/spindle-error-analyzer/probe` 由哪些零件组成，
 * 每个零件怎么造。
 *
 * 组成件：
 *
 *   探头体 1 只（45 钢，极板 φ10、与夹持面同轴 ≤5 µm）
 *   电容传感器 1 只（`plant/pzt-stage/capacitive-sensor` 的封装版）
 *   运放 2 只（前放与屏蔽驱动）
 *
 * 原路线只写“传感器 1 + 45 钢 0.5 + PTFE 0.02 + 铜线 0.01 + 运放 2”。
 * 探头体是单件，传感器是别的模块，运放是标准件；PTFE 与铜线是屏蔽/接线材料，
 * 留在整机路线。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const SPINDLE_PROBE_PARTS: readonly Item[] = [
  { id: 'plant/spindle-error-analyzer/probe/body', name: 'Spindle Periodic Error Analyzer Probe Body', name_zh: '主轴周期误差分析仪探头体', unit: '件', category: 'part' },
  { id: 'plant/spindle-error-analyzer/probe/sensor', name: 'Spindle Periodic Error Analyzer Sensor Module', name_zh: '主轴周期误差分析仪传感器模块', unit: '件', category: 'part' },
];

const SPINDLE_PROBE_PART_ROUTES_RAW: readonly (Omit<Route, 'needs'> & {
  readonly needs?: Route['needs'];
})[] = [
  {
    /** 探头体：45 钢 0.5 kg，车极板 φ10，与夹持面同轴 ≤5 µm。 */
    id: 'make/spindle-probe-body',
    name: 'Spindle Periodic Error Analyzer Probe Body Manufacturing', name_zh: '主轴周期误差分析仪探头体制造',
    produces: [{ item: 'plant/spindle-error-analyzer/probe/body', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(1, 2) }] }],
    performedBy: 'lathe',
  },
  {
    /**
     * 传感器模块：把 `plant/pzt-stage/capacitive-sensor` 装进探头体，
     * 加接地屏蔽与温漂补偿。传感器是别处生产的模块，用 uses 记录输入。
     */
    id: 'make/spindle-probe-sensor',
    name: 'Spindle Periodic Error Analyzer Sensor Module Manufacturing', name_zh: '主轴周期误差分析仪传感器模块制造',
    produces: [{ item: 'plant/spindle-error-analyzer/probe/sensor', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'plant/pzt-stage/capacitive-sensor', qty: q(1) }] }],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '装传感器与接地屏蔽环', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '台阶标准件标定 0.08–0.1 nm 十点', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },
];

export const SPINDLE_PROBE_PART_ROUTES: readonly Route[] = SPINDLE_PROBE_PART_ROUTES_RAW.map(
  (route) => ({ needs: [], ...route }),
);

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...SPINDLE_PROBE_PARTS];
export const DATA_ROUTES: readonly Route[] = [...SPINDLE_PROBE_PART_ROUTES];
