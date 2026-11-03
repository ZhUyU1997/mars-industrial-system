/**
 * 带边缘对准器的步进配置 —— 43 nm 那一档靠的是这套配置，以前只有注释没有条目。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么不另立一台机器
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 模型有一条硬规矩：一个条目的零件必须挂在它自己的 id 下（`<machine>/<name>`）。
 * 另立 `plant/euv-stepper-edge` 就意味着把 光学模块、载台、镜片 整套零件
 * 复制一份新 id —— 那是同一个东西写两遍。
 *
 * 所以这一套配置写成**同一条机器条目的第二条产出路线**：`plant/euv-stepper`
 * 的基座台交 overlay 0–560，边缘对准配置交 0–43。哪条路线在用哪一档，
 * 由路线自己在 `needs` 里声明规格窗口。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 43 nm 从哪来
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 基座台的对准是"刻度盘 1 µm + 人眼 250 nm"，RSS 559 → 取 560。
 * 边缘对准器换掉的是**对位那一步**：在片子边缘刻一圈光栅（`plant/edge-aligner`
 * 做），曝光时用这圈光栅做莫尔条纹对位，读数分辨率 43 nm。
 *
 * 所以这不是"镜头更好"，是**换了一种对位方式**：从"看标记"变成"读条纹"。
 * 代价是本层做不了干涉台版（251 nm）与 43 nm 之间的中间档，只有这两档。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 已知缺口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ① **43 nm 没有独立量具**：本层套刻只能靠 CD-SEM 读 vernier（±0.6 µm），
 *     43 nm 这个数是**设计值**（莫尔条纹周期 / 4），不是测出来的。
 *  ② **边缘光栅的均匀性判不了**：一圈光栅的周期误差直接变成对位误差，
 *     而本层没有测角/测周期的量具。
 *  ③ **43 nm 以下没有路**：再往下要 EUV 多程或 8 重成像，本文件不涉及。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const EDGE_CONFIG_ITEMS: readonly Item[] = [
  {
    id: 'plant/euv-stepper/edge-head',
    name: 'EUV Stepper Edge Alignment Head', name_zh: 'EUV 光刻机边缘对准头',
    unit: '件',
    category: 'part',
    // 边缘对准头：照明 + 刀口狭缝 + 光栅读头。装到基座台的载台上。
    props: [{ param: 'overlayResolution', kind: 'range', min: 20, max: 100, unit: 'nm', dir: 'atMost' }],
  },
];

export const EDGE_CONFIG_ROUTES: readonly Route[] = [
  {
    /** 边缘对准头：不锈钢壳体 + 石英刀口 + 光栅 + 照明 LED。 */
    id: 'make/euv-stepper-edge-head',
    name: 'EUV Stepper Edge Alignment Head Manufacturing', name_zh: 'EUV 光刻机边缘对准头制造',
    produces: [
      {
        item: 'plant/euv-stepper/edge-head',
        qty: q(1),
        gives: [{ param: 'overlayResolution', kind: 'range', min: 40, max: 60 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(2) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 10) }] },
    ],
    needs: ['lathe', 'plant/grinder', 'plant/metrology-room'],
  },
  {
    /**
     * 步进整机（边缘对准配置）。在基座台的零件上多装一只边缘对准头。
     *
     * 交出去：`overlay 0–43 nm`、`throughput 9.7 片/h`、`mirrors 10`、`field 2 mm`。
     * 除了 overlay，其余与基座台一致。
     */
    id: 'make/euv-stepper-edge',
    name: 'EUV Scanner System Manufacturing', name_zh: 'EUV 扫描机整机制造',
    produces: [
      {
        item: 'plant/euv-stepper',
        qty: q(1),
        gives: [
          { param: 'throughput', kind: 'range', min: 9.7, max: 9.7 },
          { param: 'overlay', kind: 'range', min: 0, max: 43 },
          { param: 'mirrors', kind: 'range', min: 10, max: 10 },
          { param: 'field', kind: 'range', min: 2, max: 2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/euv-stepper/optics-module', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-stepper/stage', qty: q(1) }] },
      { anyOf: [{ item: 'std/euv-mirror-300', qty: q(6) }] },
      { anyOf: [{ item: 'plant/euv-stepper/edge-head', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    performedBy: 'plant/robot',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...EDGE_CONFIG_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...EDGE_CONFIG_ROUTES];
