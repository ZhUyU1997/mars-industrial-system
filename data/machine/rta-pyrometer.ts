/**
 * RTA 1.55 µm 高温计 —— 给 `plant/rta` 补上“非接触测温”那一件。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么是 1.55 µm
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * RTA 的 500–1000 °C 档，1.55 µm 的普朗克信号比 0.9 µm 高 3–5 个数量级；
 * 硅二极管在 1.55 µm 没有响应，只能用 InGaAs。
 *
 *   InGaAs 二极管（战略种子 std/photodiode-ingaas）
 *   + 1.55 µm 窄带滤光片（本层镀膜）
 *   + φ20 透镜（本层磨）
 *   + 前放/锁相（本层电路）
 *
 * 精度：±5–10 K（单色，发射率按 0.85–0.95 标定）；响应 1–10 ms。
 *
 * ⚠️ 它只解决“测温”。RTA 的片内均匀性 ≤60 K 是**灯区/边缘补偿/自转**
 * 的问题；这一件不解决均匀性（R8 #8 仍差 6–12 倍）。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const RTA_PYROMETER_ITEMS: readonly Item[] = [
  /**
   * 1.55 µm 单色高温计。**装在 `plant/rta` 上，不是独立整机。**
   *
   * 四个规格：
   *   wavelength  1500–1600 nm
   *   tempRange   400–1200 °C
   *   accuracy    ±5–10 K
   *   response    1–10 ms
   */
  {
    id: 'plant/rta/pyrometer',
    name: '1.55 µm 单色高温计',
    unit: '件',
    category: 'part',
    props: [
      { param: 'wavelength', kind: 'range', min: 1400, max: 1700, unit: 'nm' },
      { param: 'tempRange', kind: 'range', min: 300, max: 1400, unit: '°C' },
      { param: 'accuracy', kind: 'range', min: 1, max: 20, unit: 'K', dir: 'atMost' },
      { param: 'response', kind: 'range', min: 0.1, max: 20, unit: 'ms', dir: 'atMost' },
    ],
  },
];

export const RTA_PYROMETER_ROUTES: readonly Route[] = [
  {
    /**
     * **高温计：InGaAs 二极管 + 滤光片 + 透镜 + 前放 + 屏蔽壳。**
     *
     *   二极管 1 + 玻璃 0.05 + 铝 0.2 + 运放 1 + 电容 1 + 铜线 0.01 → 高温计 1
     */
    id: 'make/rta-pyrometer',
    name: '1.55 µm 单色高温计制造',
    produces: [
      {
        item: 'plant/rta/pyrometer',
        qty: q(1),
        gives: [
          { param: 'wavelength', kind: 'range', min: 1500, max: 1600 },
          { param: 'tempRange', kind: 'range', min: 400, max: 1200 },
          { param: 'accuracy', kind: 'range', min: 5, max: 10 },
          { param: 'response', kind: 'range', min: 1, max: 10 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/photodiode-ingaas', qty: q(1) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 5) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 100) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
    rate: { hours: q(4) },
    unbalanced_zh:
      'InGaAs 二极管 0.001 + 玻璃 0.05 + 铝 0.2 + 运放 1 + 电容 1 + 铜线 0.01 → 高温计 1；余是封装/切削/屏蔽壳废料。二极管是进口种子，本层不造',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...RTA_PYROMETER_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...RTA_PYROMETER_ROUTES];
