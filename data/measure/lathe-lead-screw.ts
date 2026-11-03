/**
 * 车床丝杠导程误差的测量 —— 本层唯一能做到的“长距离测长”。
 *
 * 怎么测：丝杠转一圈，刀架走一个导程（6 mm）。要判“走得准不准”，就把一段
 * 已知长度（量块组）与刀架的实际位移比：
 *
 *   ① 刀架上架一只比较仪，测头对着**量块组研合出的一段**（比如 100 mm）；
 *   ② 摇丝杠让刀架从量块一端走到另一端，比较仪读数从零回到零 —— 差多少，
 *      就是这 100 mm 的导程误差；
 *   ③ 每 100 mm 一段，共三段，累积到 300 mm。
 *
 * 交出去：`pitchError 3–8 µm`（每 300 mm 累积，实测）。
 *
 * 缺口：
 *   · **量块组最长只能研到 100 mm**（87 块的套，研太多块会倒），所以 300 mm
 *     是分三段测再相加，每一段的搭接误差会累积；
 *   · **温度**：1 m 的钢 11 ppm/K = 11 µm/K，比判据还大 —— 必须在 20 °C 屋里
 *     放 24 h，且量块与丝杠同温；
 *   · **只测累积误差，不测周期误差**：丝杠每转一圈内的波动要圆光栅或激光干涉，
 *     本层都没有。
 */

import type { Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const LATHE_LEAD_SCREW_ROUTES: readonly Route[] = [
  {
    /** 导程误差：量块段 + 比较仪，每 100 mm 一段、三段累积。 */
    id: 'measure/lathe-lead-screw-pitch',
    name: '丝杠测量',
    produces: [
      {
        item: 'lathe/lead-screw',
        qty: q(1),
        gives: [{ param: 'pitchError', kind: 'range', min: 3, max: 8 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'lathe/lead-screw', qty: q(1) }] },
      { anyOf: [{ item: 'std/gauge-block-working', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '丝杠、量块、量具在 20 °C 屋放 24 h 同温', performedBy: 'plant/metrology-room', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '量块组研合 100 mm，架在刀架行程上，比较仪对零', performedBy: 'plant/comparator' },
      { note_zh: '摇丝杠走完 100 mm，读比较仪回零差；三段累积到 300 mm', performedBy: 'plant/robot' },
    ],
  },
];

import type { Item } from '../../src/index.ts';

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [];
export const DATA_ROUTES: readonly Route[] = [...LATHE_LEAD_SCREW_ROUTES];
