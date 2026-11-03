/**
 * 100 kV 耦合电容 —— IEC 60270 PD 测量里“把试品的局放引到测量阻抗”的那一件。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么它比 UHF <1 ns 更优先
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 100 kV 下要测 pC，先得有：
 *
 *   试品 ──┬── Ck（100 pF、100 kV）── Zm（50 Ω/测量阻抗）── PD 检测器
 *          │
 *          └── 100 kV 源
 *
 * 本层只有 1–2 kV 的 `cal-capacitor`；100 kV 耦合电容是 0。
 * 没有它，1 µs 校准器只能在校准台上打 pC，上不了 100 kV 试品。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 结构：平行板 + SF₆ + guard ring
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   C = ε₀ A / d
 *   A = π × 0.175² = 0.0962 m²（φ350）
 *   d = 8.5 mm ⇒ C = 8.85e−12 × 0.0962 / 0.0085 = **100 pF**
 *
 *   100 kV / 8.5 mm = 11.8 kV/mm
 *   SF₆ 0.2 MPa 的击穿场强约 20–25 kV/mm ⇒ 1.7–2.1 倍余量
 *
 * 无局放的关键不是“耐压”，是**没有尖锐边缘**：
 *
 *   · 板边 R10 圆角（Rogowski）；
 *   · guard ring 把边缘场引开；
 *   · 板面 Ra <0.4 µm；
 *   · 装配在 clean-room，SF₆ 先过滤；
 *   · 老练 30 min 逐级升到 100 kV，PD ≤3 pC 才放行。
 *
 * ⚠️ 它只解决“耦合”。读出（峰值/计数/记录）、PD-free 源、屏蔽间仍未建；
 *    所以 100 kV 标准 PD 链只从“0”走到“有耦合电容”，不是签字闭环。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const HV_COUPLING_ITEMS: readonly Item[] = [
  /**
   * 100 kV、100 pF 耦合电容。SF₆ 平行板 + guard ring。
   *
   *   capacitance  50–200 pF
   *   voltage      100 kV（直流/工频峰值）
   *   pdLevel      ≤3 pC @100 kV（老练后）
   *   gap          8–12 mm
   */
  {
    id: 'plant/hv-test-bench/coupling-cap-100k',
    name: '100 kV Coupling Capacitor', name_zh: '100 kV 耦合电容',
    unit: '件',
    category: 'part',
    props: [
      { param: 'capacitance', kind: 'range', min: 20, max: 500, unit: 'pF' },
      { param: 'voltage', kind: 'range', min: 0, max: 200000, unit: 'V', dir: 'atLeast' },
      { param: 'pdLevel', kind: 'range', min: 0, max: 10, unit: 'pC', dir: 'atMost' },
      { param: 'gap', kind: 'range', min: 2, max: 30, unit: 'mm' },
    ],
  },
];

export const HV_COUPLING_ROUTES: readonly Route[] = [
  {
    /**
     * **100 kV 耦合电容：两块 φ350 铝板 + guard ring + SF₆ 罐。**
     *
     *   铝 10 + PTFE 0.5 + 氧化铝 1 + 铜 0.5 + 不锈钢 1 + SF₆ 2 → 电容 1
     */
    id: 'make/coupling-cap-100k',
    name: '100 kV Coupling Capacitor Manufacturing', name_zh: '100 kV 耦合电容制造',
    produces: [
      {
        item: 'plant/hv-test-bench/coupling-cap-100k',
        qty: q(1),
        gives: [
          { param: 'capacitance', kind: 'range', min: 90, max: 110 },
          { param: 'voltage', kind: 'range', min: 100000, max: 100000 },
          { param: 'pdLevel', kind: 'range', min: 1, max: 3 },
          { param: 'gap', kind: 'range', min: 8.5, max: 8.5 },
        ],
      },
    ],
    uses: [
      // 两块 φ350 × 10 铝板：2 × 2.6 kg，加 guard ring/罐体/均压环取 10 kg
      { anyOf: [{ item: 'mat/aluminium', qty: q(10) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sf6', qty: q(2) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    steps: [
      {
        note_zh:
          '车/旋两块 φ350 × 10 铝板，板边 R10 圆角；guard ring 与均压环同车，所有边缘倒圆 —— **尖角就是局放源**',
        performedBy: 'plant/sheet-shop',
      },
      {
        note_zh: '抛光板面到 Ra <0.4 µm（局放起始场强对表面粗糙度敏感）；超声清洗、烘干',
        performedBy: 'plant/grinder',
      },
      {
        note_zh:
          'clean-room 装配：PTFE/氧化铝绝缘子定 8.5 mm 间隙，guard ring 接地，SF₆ 罐体密封；充 SF₆ 到 0.2 MPa（先抽真空、再充，避免空气混入）',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '老练与 PD 测试：0 → 100 kV 分 5 级，每级 5 min；100 kV 下 PD ≤3 pC 才放行。**本层没有 PD 读出，只能先用 UHF/音频听“有/无”**；定量 pC 仍缺读出链',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '测电容：极板面积/间隙算 100 pF；再用 `plant/metrology-room` 的桥/DMM 复核（本层没有 LCR 表，按几何值 ±5 % 记）',
        performedBy: 'plant/robot',
      },
    ],
    rate: { hours: q(24) },
    unbalanced_zh:
      '铝 10 + PTFE 0.5 + 氧化铝 1 + 铜 0.5 + 不锈钢 1 + SF₆ 2 = 15 kg → 耦合电容 1 件；余是车削/抛光铝屑、SF₆ 排空与绝缘子边角。电容按几何 100 pF ±5 %，不是 LCR 实测',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...HV_COUPLING_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...HV_COUPLING_ROUTES];
