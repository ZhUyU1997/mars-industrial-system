/**
 * 六氟化钨（WF₆）—— W plug 的入口。**反应器成立；物料路线成立但降级。**
 *
 *   mat/tungsten-powder + 3 F₂ --300–400 °C, 0.1–0.3 MPa--> mat/wf6
 *
 * `make/fluorine`（litho-m3.ts:742–801）给 F₂ 27.9 kg/批（purity 97–99 %）；
 * `mat/tungsten-powder`（tungsten.ts:70）有；`plant/wf6-reactor` 是低压镍内衬炉
 * （300–450 °C / 0.05–0.5 MPa），不是 autoclave 的 10–35 MPa 档。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么这次成立：低压 + 全镍接液面
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① **压力窗口**：WF₆ 合成 0.1–0.3 MPa；`plant/wf6-reactor` holds 0.05–0.5 MPa，
 *      落在窗口内。不再借 10–35 MPa 的 autoclave。
 *   ② **F₂ 接液面**：镍内衬 + 镍法兰 + 镍阀 + 镍套管热电偶 + 镍金属垫；
 *      没有 PTFE/弹性体。镍在 F₂ 里长 NiF₂ 钝化膜（−460 kJ/mol）。
 *   ③ **温度**：300–400 °C，镍内衬炉 300–450 °C 覆盖。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 降级项（照实记）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   · 镍内衬**只卷焊，不胀接**：没有液压胀管器；卷焊后与镍法兰焊死，靠金属垫。
 *   · 没有 RT/PT，只有煤油渗透/目视；没有氦检漏，`leakRate` 是设计值。
 *   · 镍焊需要 Ar 保护，sheet-shop 没有 TIG 工艺评定；按“能焊但无评定”记。
 *   · 阀是镍截止阀 + 石墨/镍丝填料，不是波纹管阀；长期 F₂ 寿命无数据。
 *   · **没有 WF₆ 精馏塔**：F₂ 97–99 % + 冷凝收集，WF₆ 只能交 99.0–99.9 %；
 *     设计目标 ≥99.9 % 不保证。e-beam/漏电也测不了这一格。
 *
 * W plug 仍不写：W CVD 反应器没有（ALD 只到 400 °C，不是 CVD W）。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const WF6_ITEMS: readonly Item[] = [
  /**
   * 六氟化钨（WF₆）。**物料路线成立，但纯度降级。**
   *
   *   purity 99.0–100 %（设计目标 ≥99.9；没有精馏塔，实际 99.0–99.9）
   *   bp     17.1–17.1 °C（常压沸点）
   *   water  0–0.01 %（atMost；遇水水解成 WO₃ + HF）
   */
  {
    id: 'mat/wf6',
    name: 'Tungsten Hexafluoride', name_zh: '六氟化钨',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 99, max: 100, unit: '%', dir: 'atLeast' },
      { param: 'bp', kind: 'range', min: 17.1, max: 17.1, unit: '°C' },
      { param: 'water', kind: 'range', min: 0, max: 0.01, unit: '%', dir: 'atMost' },
    ],
  },
];

export const WF6_ROUTES: readonly Route[] = [
  {
    /**
     * **W 粉 + 3 F₂ → WF₆，300–400 °C / 0.1–0.3 MPa。**
     *
     *   W 粉 0.617 + F₂ 0.45 + 石灰 0.2 + 水 1 + 干冰 0.5
     *     → WF₆ 1 kg（+ 未反应 F₂ 0.067 循环 + CaF₂ 渣）
     *
     * 化学计量：W 183.84 + 6F 114 = WF₆ 297.84；1 kg WF₆ 需 W 0.617 kg、
     * F₂ 0.383 kg；取 F₂ 0.45 kg（17 % 过量），未反应 F₂ 循环。
     *
     * 5 步：
     *   ① N₂ 置换/干燥（水 ≤10 ppm）
     *   ② 装 W 粉（镍舟）
     *   ③ 氟化 300–400 °C / 0.1–0.3 MPa；F₂ 过量，尾气去 Ca(OH)₂ 中和
     *   ④ 冷凝：WF₆ bp 17.1 °C，干冰/盐水冷阱收集；HF 在前级冷阱
     *   ⑤ 尾气 Ca(OH)₂ 中和：Ca(OH)₂ + 2HF → CaF₂ + 2H₂O
     *
     * ⚠️ 没有精馏塔：F₂ 97–99 % 带 HF/OF₂/CF₄，冷凝只能到 99.0–99.9 %；
     * 设计目标 ≥99.9 % 不保证。e-beam/漏电测不了这一格。
     */
    id: 'make/wf6',
    name: 'Tungsten Hexafluoride Production', name_zh: '六氟化钨制备',
    produces: [
      {
        item: 'mat/wf6',
        qty: q(1),
        gives: [
          { param: 'purity', kind: 'range', min: 99, max: 99.9 },
          { param: 'bp', kind: 'range', min: 17.1, max: 17.1 },
          { param: 'water', kind: 'range', min: 0, max: 0.01 },
        ],
      },
    ],
    uses: [
      // W 粉 0.617 kg：WF₆ 1 kg 的 W 量；余是镍舟/装料损耗
      { anyOf: [{ item: 'mat/tungsten-powder', qty: q(617, 1000) }] },
      // F₂ 0.45 kg：理论 0.383 + 17 % 过量；未反应循环
      { anyOf: [{ item: 'mat/fluorine', qty: q(45, 100) }] },
      // 尾气中和：石灰 0.2 kg + 水 1 kg（Ca(OH)₂ 现场消化）
      { anyOf: [{ item: 'mat/lime', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
      // 冷阱：干冰 0.5 kg（−78 °C）；WF₆ bp 17.1，够冷凝
      { anyOf: [{ item: 'mat/dry-ice', qty: q(1, 2) }] },
      // N₂ 0.1 kg：置换/干燥
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 10) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(4) },
    steps: [
      {
        note_zh:
          '① N₂ 置换/干燥：反应器抽空后 N₂ 置换 3 次，露点 ≤−40 °C（水 ≤10 ppm）；WF₆ 遇水水解，微量水就生成 WO₃ + HF',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '② 装 W 粉：0.617 kg W 粉装镍舟，布料 5–10 mm 薄层；不要压实（F₂ 要穿过床层）',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '③ 氟化：300–400 °C / 0.1–0.3 MPa，F₂ 0.45 kg（17 % 过量）；W + 3F₂ → WF₆ 放热，床层热点用 N₂ 稀释控制。尾气从顶部去 Ca(OH)₂ 中和',
        performedBy: 'plant/wf6-reactor',
        under: [
          { param: 'temperature', min: 300, max: 400 },
          { param: 'pressure', min: 0.1, max: 0.3 },
        ],
      },
      {
        note_zh:
          '④ 冷凝：WF₆ bp 17.1 °C；出气过 −20 °C 前级冷阱留 HF，再进 −78 °C 干冰冷阱收 WF₆。没有精馏塔，HF/OF₂/CF₄ 只能靠沸点差部分分开',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '⑤ 尾气中和：Ca(OH)₂ + 2HF → CaF₂ + 2H₂O；未反应 F₂ 在碱液里 2F₂ + 2H₂O → 4HF + O₂，再被 Ca(OH)₂ 吃掉。石灰 0.2 kg + 水 1 kg 现场消化',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
    ],
    unbalanced_zh:
      'W 粉 0.617 + F₂ 0.45 + 石灰 0.2 + 水 1 + 干冰 0.5 + N₂ 0.1 → WF₆ 1 kg + 未反应 F₂ 0.067（循环）+ CaF₂ 渣（约 0.3）+ 尾气/冷阱损失。W 0.617 + F₂ 0.383 = 1.000 是主反应；F₂ 过量 0.067 循环，石灰/水/干冰/N₂ 是中和与冷阱。没有精馏塔，WF₆ 纯度只到 99.0–99.9，设计目标 ≥99.9 不保证',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...WF6_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...WF6_ROUTES];
