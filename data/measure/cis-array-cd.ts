/**
 * CIS 阵列的 CD 记录 —— 把 `make/cis-array-arf` 的 0.35 µm node 从
 * “光刻机能力窗”接到一条可查的 CD 测量程序上。
 *
 * 背景：相机 node 350 由 ArF 步进机（193 nm、NA 0.6）交付；但
 * `make/cis-array-arf` 的 node 350 仍是过程能力，不是 CD 读数。
 * 本文件补 CD-SEM 的 10 点程序：
 *
 *   `measure/cis-array-cd` → `mat/cis-array-cd-record`
 *       关键层 0.35 µm 线条，CD-SEM 10 点，cd 0.30–0.35 µm、U 2–4 nm。
 *
 * 口径（R12）：记录窗口是**验收带**，不是某一次读数；真跑后要收窄到
 * 实测区间。CD-SEM 的 cdRange 10–1000 nm 覆盖 350 nm，cdAccuracy ≤1.5 nm
 * 对 350 nm 的判据 TUR ≈ 100:1，量具能力不是瓶颈；瓶颈是“还没真跑”。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const CIS_ARRAY_CD_ITEMS: readonly Item[] = [
  /**
   * CIS 阵列关键层 CD 记录。**一份记录对应一片阵列片。**
   *
   *   cd          0.25–0.40 µm   CD-SEM 10 点的验收带（判据 ≤0.35）
   *   uncertainty 0–0.02 µm      U(k=2)：CD-SEM cdAccuracy 1.5 nm + 重复 0.3 nm
   *   points      1–100          每片至少 10 点（5 个视场 × 2 条线）
   *   method      cd-sem         俯视 CD-SEM，不是 TEM 截面
   */
  {
    id: 'mat/cis-array-cd-record',
    name: 'CIS 阵列关键层 CD 记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'cd', kind: 'range', min: 0.25, max: 0.4, unit: 'µm' },
      // 与交付方 give 的 `node` 同名：0.30–0.35 µm CD 的 0.35 µm 端点对应 350 nm 节点。
      { param: 'node', kind: 'range', min: 350, max: 350, unit: 'nm' },
      { param: 'uncertainty', kind: 'range', min: 0, max: 0.02, unit: 'µm', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 100, unit: '点' },
      { param: 'method', kind: 'enum', values: ['cd-sem'] },
    ],
  },
];

export const CIS_ARRAY_CD_ROUTES: readonly Route[] = [
  {
    /**
     * **阵列关键层 CD：CD-SEM 俯视 10 点。**
     *
     * 步骤：
     *   ① 取 `mat/cis-array` 一片，19–21 °C 等温 4 h；
     *   ② CD-SEM 30–50 kV、10 万倍，5 个视场 × 2 条 0.35 µm 线 = 10 点；
     *   ③ 每条线在 1/2 高度量宽，读 0.30–0.35 µm；
     *   ④ U(k=2) 0.002–0.004 µm（cdAccuracy 1.5 nm + 重复 0.3 nm 合成）。
     *
     * 记录是验收带，不是单次读数；真跑后收窄。
     */
    id: 'measure/cis-array-cd',
    name: 'CIS 阵列关键层 CD 测量',
    produces: [{
      item: 'mat/cis-array-cd-record',
      qty: q(1),
      gives: [
        { param: 'cd', kind: 'range', min: 0.3, max: 0.35 },
        { param: 'node', kind: 'range', min: 350, max: 350 },
        { param: 'uncertainty', kind: 'range', min: 0.002, max: 0.004 },
        { param: 'points', kind: 'range', min: 10, max: 10 },
        { param: 'method', kind: 'enum', oneOf: ['cd-sem'] },
      ],
    }],
    uses: [{ anyOf: [{ item: 'mat/cis-array', qty: q(1) }] }],
    needs: ['plant/metrology-room'],
    rate: { hours: q(4) },
    steps: [
      { note_zh: '取阵列片 1 片，19–21 °C 等温 4 h', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: 'CD-SEM 30–50 kV、10 万倍，5 视场 × 2 条 0.35 µm 线 = 10 点', performedBy: 'plant/cd-sem', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '每条线在 1/2 高度量宽，读 0.30–0.35 µm；U(k=2) 0.002–0.004 µm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '阵列片 1 片（非破坏）→ CD 记录 1 份；CD-SEM 是量具不是物料。',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...CIS_ARRAY_CD_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...CIS_ARRAY_CD_ROUTES];
