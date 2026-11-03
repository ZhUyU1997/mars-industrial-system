/**
 * 反应池（collision/reaction cell）—— 把 HR-ICP-MS 的 8 个元素从 0.2–2 ppb
 * 推到 0.05–0.5 ppb，并给整机补上 `collisionGas` / `kED` / `bias` 三格能力。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、为什么选 NH₃，不选 He
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 旧账（`trace-analysis.ts §八 ④`）：H₂ 碰撞池只降 10–50×，Cu/Zn/Ni/Al/Fe/Mg/As/Se
 * 这 8 个元素到 0.2–2 ppb 就平了；判“≤1 ppb 合格”差 2–20×。
 *
 * He 碰撞 + KED 是最干净的方案，但 **`mat/helium` 只有 R10 一次性装填**：氦只有
 * `plant/gm-cryocooler` 的一次性装填 0.8–1.5 kg，没有本地生产路线。先把
 * 消耗算清：
 *
 *   池流量 1–5 mL/min
 *   50 L 标准气瓶 @15 MPa = 7.5 m³ STP = **1.34 kg He**
 *   连续用：7.5 m³ ÷ (1–5)×10⁻⁶ m³/min = **25 000–125 000 h**
 *           = 2.9–14.3 年
 *   按 2 000 h/年（每天 8 h、250 天）：**12.5–62.5 年**
 *   若只是 50 L 常压袋：**167–833 h**（7–35 天连续）
 *
 * 所以“一瓶 50 L 气”在体积上并不贵；贵的是它**和 20 K 制冷机抢同一次
 * 0.8–1.5 kg 的进口氦**，而且每多一台仪器就多一瓶战略进口。He 的
 * 质量消耗：1–5 mL/min × 2 000 h/年 = 120–600 L/年 = **21–107 g/年**，
 * 一瓶 1.34 kg 够 12–62 年 —— 这不是“用不起”，是“没有本地来源”。
 *
 * NH₃ 是本层能自产的电子级气：`make/ammonia-electronic` 交
 * 99.999–99.9999 %、H₂O 1–10 ppm。池流量 1–5 mL/min 的 NH₃ 质量流量
 * 0.046–0.231 g/h；2 000 h/年 = **92–462 g/年**，1 kg 电子级氨够 2–11 年。
 *
 * ⇒ **选 NH₃ 反应档**。代价写清：NH₃ 会污染 B/P 通道（形成团簇/背景），
 *    B/P 档必须切回 H₂/无气并吹扫 30–60 min；本路线的 B 只交 0.05–0.2 ppb，
 *    比 H₂ 路线的 0.01–0.05 ppb 差 2–10 倍。8 个元素不含 B/P，所以这笔
 *    代价是“换通道”，不是“做不了”。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、池子本身
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   池长       100–200 mm（八极杆；旧 H₂ 池 100–120，加长提高碰撞概率）
 *   池压       0.1–1 Pa（NH₃ 分压；旧 H₂ 池 0.02–0.1）
 *   偏压       −5…−30 V（KED；低质量干扰被偏压挡掉，分析物 3–8 eV 保留）
 *   气体流量   1–5 mL/min（质量流量控制器）
 *   传输       20–50 %（KED 的代价：比无池低 2–4 倍）
 *
 * 8 个元素的改善：H₂ 池 0.2–2 ppb → NH₃/KED **0.05–0.5 ppb**；
 * 判 ≤1 ppb 有 **2–20×** 余量。B/P 不在这个窗口里。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、接线
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 本文件只加：`plant/reaction-cell`（零件）+ 两条路线
 * （`make/reaction-cell`、`make/hr-icp-ms-ked`）。
 * `plant/hr-icp-ms` 的条目 props 与既有两条产出路线的 gives 在
 * `data/machine/boron.ts` / `hr-icp-ms-stage.ts` 里补齐：
 * `collisionGas` / `kED` / `bias` / `traceMetalDL`。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const REACTION_CELL_ITEMS: readonly Item[] = [
  /**
   * NH₃ 反应池。**100–200 mm、0.1–1 Pa、偏压 −5…−30 V、1–5 mL/min。**
   *
   * 在旧 H₂ 碰撞池（`plant/icp-ms/collision-cell`）的基础上加长八极杆、
   * 加 NH₃ 进气口与偏压电极；池体仍是钼杆 + 氧化铝绝缘 + 不锈钢壳。
   *
   *   collisionGas  NH3 / He / CH4（本路线交 NH3）
   *   kED           none / KED（本路线交 KED）
   *   transmission  20–50 %（KED 的代价）
   */
  {
    id: 'plant/reaction-cell',
    name: 'NH₃ 反应池',
    unit: '件',
    category: 'part',
    props: [
      { param: 'length', kind: 'range', min: 100, max: 200, unit: 'mm' },
      { param: 'pressure', kind: 'range', min: 0.1, max: 1, unit: 'Pa' },
      { param: 'bias', kind: 'range', min: -30, max: -5, unit: 'V' },
      { param: 'collisionGas', kind: 'enum', values: ['NH3', 'He', 'CH4'] },
      { param: 'kED', kind: 'enum', values: ['none', 'KED'] },
      { param: 'gasFlow', kind: 'range', min: 1, max: 5, unit: 'mL/min' },
      { param: 'transmission', kind: 'range', min: 10, max: 60, unit: '%' },
    ],
  },
];

export const REACTION_CELL_ROUTES: readonly Route[] = [
  /**
   * 反应池：旧碰撞池 → 加长八极杆 → 加 NH₃ 进气口/偏压电极 → 检漏。
   *
   *   旧池 1 + 不锈钢 0.5 + 氧化铝 1 + 铜 0.1 + PTFE 0.05 + 电子级氨 0.01 → 反应池 1
   */
  {
    id: 'make/reaction-cell',
    name: 'NH₃ 反应池制造',
    produces: [
      {
        item: 'plant/reaction-cell',
        qty: q(1),
        gives: [
          { param: 'length', kind: 'range', min: 150, max: 200 },
          { param: 'pressure', kind: 'range', min: 0.1, max: 1 },
          { param: 'bias', kind: 'range', min: -30, max: -5 },
          { param: 'collisionGas', kind: 'enum', oneOf: ['NH3'] },
          { param: 'kED', kind: 'enum', oneOf: ['KED'] },
          { param: 'gasFlow', kind: 'range', min: 1, max: 5 },
          { param: 'transmission', kind: 'range', min: 20, max: 50 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/icp-ms/collision-cell', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/ammonia-electronic', qty: q(1, 100) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/robot',
    under: [{ param: 'temperature', min: 19, max: 21 }],
    rate: { hours: q(40) },
    unbalanced_zh:
      '旧碰撞池 1 + 不锈钢 0.5 + 氧化铝 1 + 铜 0.1 + PTFE 0.05 + 电子级氨 0.01 → 反应池 1；余是车/铣屑与氨吹扫。NH₃ 档、KED 偏压、0.1–1 Pa 是设计值',
  },

  /**
   * **HR-ICP-MS 的 NH₃/KED 档：同 24 件 BOM，把 H₂ 池换成反应池。**
   *
   *   磁扇 1 + ESA 1 + 缝 1 + 飞行管 1 + 反应池 1 + ICP 前端 19 件
   *   + 泵 4 + 探测器 2 + 接触器 2 + 电子级氨 1 → HR-ICP-MS 1 台
   *
   * 交付：8 元素 0.05–0.5 ppb；B 退到 0.05–0.2 ppb（NH₃ 污染 B/P）。
   * 与 `make/hr-icp-ms` / `make/hr-icp-ms-hr` 是同一 id 的第三条产出路线。
   */
  {
    id: 'make/hr-icp-ms-ked',
    name: 'HR-ICP-MS 整机制造',
    produces: [
      {
        item: 'plant/hr-icp-ms',
        qty: q(1),
        gives: [
          { param: 'boron', kind: 'range', min: 0.05, max: 0.2 },
          { param: 'phosphorus', kind: 'range', min: 0.02, max: 0.08 },
          { param: 'titanium', kind: 'range', min: 0.01, max: 0.05 },
          { param: 'resolution', kind: 'range', min: 10000, max: 12000 },
          { param: 'massRange', kind: 'range', min: 2, max: 260 },
          { param: 'abundanceSensitivity', kind: 'range', min: 1e-7, max: 2e-7 },
          { param: 'stability', kind: 'range', min: 0.5, max: 1.5 },
          { param: 'recovery', kind: 'range', min: 0.95, max: 1.05 },
          { param: 'collisionGas', kind: 'enum', oneOf: ['NH3'] },
          { param: 'kED', kind: 'enum', oneOf: ['KED'] },
          { param: 'bias', kind: 'range', min: -30, max: -5 },
          { param: 'traceMetalDL', kind: 'range', min: 0.05, max: 0.5 },
          { param: 'copperInOil', kind: 'range', min: 0.2, max: 10 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/hr-icp-ms/magnet', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hr-icp-ms/esa', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hr-icp-ms/slits', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hr-icp-ms/flight-tube', qty: q(1) }] },
      { anyOf: [{ item: 'plant/reaction-cell', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/torch', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/rf-generator', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/load-coil', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/nebulizer', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/spray-chamber', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/peristaltic-pump', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/sampler-cone', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/skimmer-cone', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/ion-lens', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/interface-housing', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/gas-panel', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/enclosure', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-vacuum/pump/rough', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-vacuum/pump/turbo', qty: q(2) }] },
      { anyOf: [{ item: 'plant/euv-vacuum/pump/cold-trap', qty: q(1) }] },
      { anyOf: [{ item: 'plant/euv-vacuum/pump/gauge', qty: q(1) }] },
      { anyOf: [{ item: 'plant/sims/electron-multiplier', qty: q(1) }] },
      { anyOf: [{ item: 'plant/sims/faraday-cup', qty: q(1) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/ammonia-electronic', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'plant/euv-vacuum'],
    steps: [
      { note_zh: '① 装 ICP 前端（炬、射频、雾化、锥、透镜、气路、箱体）—— 与 make/icp-ms 同一套工序', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '② 装反应池与 NH₃ 气路：池长 150–200 mm，NH₃ 1–5 mL/min，池压 0.1–1 Pa；池轴与透镜同轴 ≤0.05 mm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '③ 装磁扇/ESA/缝/探测器：Nier-Johnson 几何，离子光学轴对中 ≤0.05 mm；倍增器暗计数 ≤0.5 cps', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '④ 抽真空检漏：euv-vacuum 抽 1e-2–1e-1 Pa，关阀 1 h 压升 ≤1e-3 Pa·L/s', performedBy: 'plant/robot', under: [{ param: 'pressure', min: 1e-2, max: 1e-1 }] },
      { note_zh: '⑤ 调 KED：NH₃ 0.1–1 Pa、偏压 −30…−5 V；用 1 ppb 的 Cu/Zn/Ni/Al/Fe/Mg/As/Se 混标，调偏压使 ⁵⁶Fe/⁷⁵As 的干扰降到 ≤0.1 ppb 当量', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '⑥ 验 8 元素：0.05–0.5 ppb 窗口、加标回收 95–105 %；B/P 档切回 H₂/无气，吹扫 30–60 min 后再测', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(260) },
    unbalanced_zh:
      '磁扇 1 + ESA 1 + 缝 1 + 飞行管 1 + 反应池 1 + 复用件 19 + 泵 4 + 探测器 2 + 接触器 2 + 电子级氨 1 → HR-ICP-MS 1 台；按件计。8 元素 0.05–0.5 ppb、B 0.05–0.2 ppb 是设计值；B/P 污染是 NH₃ 档的代价',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...REACTION_CELL_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...REACTION_CELL_ROUTES];
