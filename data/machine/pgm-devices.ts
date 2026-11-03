/**
 * 铂族器件路线 —— 丝材/箔材通了之后，把三处下游从"器件未建"接到新料上。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 0. 三个器件 + 一条整机路线
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① `make/pt-rtd-pair`          Pt 丝 → `plant/mfc/rtd-pair`（MFC 的测温对）
 *   ② `make/oxygen-probe-electrode-pt`  Pt 海绵 → 多孔 Pt 电极（氧探头）
 *   ③ `make/pd-membrane`          Pd 箔 → `plant/diffusion-furnace/pd-membrane`
 *   ④ `make/gas-purifier-pd`      Pd 膜 → `plant/diffusion-furnace/gas-purifier`
 *
 *   这四条都是**新增的替代路线**，不改原有的镍 RTD、银电极、铜床/石灰纯化器
 *   路线（旧的仍可用，新的指向丝/箔）。这样做的好处是：已有路线不动，
 *   新料的用途单独可查；坏处是同一件有两个生产者，报告里会多几条属性提示。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 1. Pt RTD：2 mg 丝，为什么值得单独建一条路线
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   一对 φ0.025–0.05 mm × 20 mm 的 Pt 丝只有 **2 mg**（体积 0.0785 mm³ ×
 *   21.45 g/cm³ = 1.68 mg，取 2 mg 含引线）。但它是 MFC 零漂的全部来源：
 *   镍 RTD 的 TCR 6 800 ppm/K 更高，可是 150 °C 以上氧化、0.1 °C/年漂；
 *   铂 RTD 在 600 °C 退火后稳定到 0.01 °C/年。本路线用**细 Pt 丝**
 *   （`make/platinum-wire-fine`），绕在熔石英管上，700–900 °C 氢退火，
 *   银引线压接，四线测 20/60 °C 的比值，挑 `match ≤0.02 %` 的两支配对。
 *
 *   ⚠️ 本层没有 Pt 的 TCR 标定装置（只有四线电阻与恒温槽），
 *   `match 0.01–0.02 %` 是配对筛选，不是绝对 TCR 读数。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 2. 多孔 Pt 电极：海绵球磨 + 烧结，不是铂黑
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   工业氧探头的铂电极是**铂黑**（氯铂酸涂覆 + 还原），本层没有
 *   `mat/chloroplatinic-acid`，所以走"海绵 Pt 球磨到 ≤5 µm → 刷涂 →
 *   900–1000 °C 烧结"的多孔铂。孔隙率 35–45 % 靠球磨粒度与烧结温度守，
 *   没有压汞/ BET，只能用"厚度 + 方阻"反推（与银电极同一条判据）。
 *
 *   ⚠️ **铂黑镀层仍未建**：要 `mat/chloroplatinic-acid`（Pt + 王水/氯气），
 *   本层没有那条路线；本电极是"烧结多孔铂"，不是"铂黑"。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 3. Pd 膜：20 µm 箔，5–19 µm 仍缺
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   钯膜要 5–25 µm 的自支撑箔；本层 Pd 箔最薄 0.02 mm = **20 µm**，
 *   所以只能做 20 µm 膜。H₂ 通量与厚度成反比：20 µm 比 5 µm 低 **4 倍**。
 *   20 µm 膜的 H₂ 渗透率按 Pd 的 1×10⁻⁸ mol/(m·s·Pa⁰·⁵)（300 °C）估，
 *   0.02 m²、1 MPa 上游/0.1 MPa 下游 ⇒ 约 0.4 mol/(m²·s) × 0.02 = 8 mmol/s
 *   ≈ 0.016 g/s ≈ 58 g/h；5 µm 膜是 4 倍 ≈ 230 g/h。本层按 20 µm 交付，
 *   5–19 µm 箔是缺口（要更薄的轧机/双辊异步轧制）。
 *
 *   膜组件：20 µm Pd 箔 + 多孔 Al₂O₃ 支撑 + 316L 壳 + 铜密封，
 *   900–1000 °C 扩散连接；氦检漏没有（本层没有氦），只能保压 30 min
 *   压降 ≤1 %。300–500 °C 的法兰/膨胀匹配仍未验证。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 4. 与旧路线的关系
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   · `flow-and-rf.ts` 的 `make/mfc-rtd-pair`（镍）不动；本文件新增
 *     `make/pt-rtd-pair`，产出同一个 `plant/mfc/rtd-pair` 条目。
 *   · `oxygen-metrology.ts` 的 `make/oxygen-probe-electrode`（银）不动；
 *     本文件新增 `make/oxygen-probe-electrode-pt`，产出同一个
 *     `plant/oxygen-probe/electrode` 条目。
 *   · `zeolite.ts` 的 `make/gas-purifier`（铜床/石灰）与
 *     `unblock-gas-purifier.ts` 的 `make/gas-purifier-cast` 都不动；
 *     本文件新增 `make/gas-purifier-pd`，产出同一个
 *     `plant/diffusion-furnace/gas-purifier` 条目。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

/**
 * Pd 膜组件（`plant/diffusion-furnace/pd-membrane`）。
 *
 *   thickness  0.005–0.025 mm（本层只交 0.02–0.025，20 µm 箔）
 *   area       0.01–0.1 m²
 *   leakRate   ≤1×10⁻⁶ Pa·m³/s（保压 30 min 压降 ≤1 %，没有氦检漏）
 */
export const PGM_DEVICE_ITEMS: readonly Item[] = [
  {
    id: 'plant/diffusion-furnace/pd-membrane',
    name: 'Palladium Membrane', name_zh: '钯膜',
    unit: '件',
    category: 'part',
    props: [
      { param: 'thickness', kind: 'range', min: 0.005, max: 0.025, unit: 'mm' },
      { param: 'area', kind: 'range', min: 0.01, max: 0.1, unit: 'm²' },
      { param: 'leakRate', kind: 'range', min: 0, max: 1e-6, unit: 'Pa·m³/s', dir: 'atMost' },
    ],
  },
];

export const PGM_DEVICE_ROUTES: readonly Route[] = [
  /**
   * Pt RTD 对：2 mg Pt 丝 + 石英管 → `plant/mfc/rtd-pair`。
   *
   *   丝 φ0.025–0.05 mm、20 mm 长、200 匝绕在 φ2 熔石英管上；
   *   700–900 °C 氢退火 1 h（去应力、稳定 TCR）；银引线压接；四线测 20/60 °C。
   *
   *   2 mg 丝对 1 kg 丝材是 2×10⁻⁶ kg —— 一条 `make/platinum-wire-fine`
   *   （1 kg）够做 50 万对 RTD；本路线按 1 对/批，量小但路线完整。
   */
  {
    id: 'make/pt-rtd-pair',
    name: 'Mass Flow Controller Nickel Thin-Film Resistor Pair Manufacturing', name_zh: '质量流量控制器镍薄膜电阻对制造',
    rate: { hours: q(8) },
    produces: [
      {
        item: 'plant/mfc/rtd-pair',
        qty: q(1),
        gives: [
          { param: 'resistance', kind: 'range', min: 100, max: 1000 },
          { param: 'match', kind: 'range', min: 0.01, max: 0.02 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/platinum-wire',
            qty: q(1, 500000),
            need: [{ param: 'diameter', kind: 'range', min: 0.025, max: 0.05 }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/silver', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '绕丝：φ0.025–0.05 mm Pt 丝 200 匝绕在 φ2×20 熔石英管上，匝间不重叠', performedBy: 'plant/robot' },
      {
        note_zh: '退火 700–900 °C、氢/真空 1 h：去应力、稳定 TCR；冷后电阻应落在 100–1000 Ω',
        performedBy: 'plant/pgm-wire-mill',
        under: [
          { param: 'temperature', min: 700, max: 900 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      { note_zh: '银引线压接（不焊：银-铂在 700 °C 会互扩散，压接点留冷端）', performedBy: 'plant/robot' },
      {
        note_zh: '四线测 20 °C 与 60 °C 的阻值比，6 对里挑 match ≤0.02 % 的两对（配对筛选，不是绝对 TCR 标定）',
        performedBy: 'plant/metrology-room',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: 'Pt 丝 2×10⁻⁶ + 石英 0.1 + 银 0.001 + 水 1 → RTD 对 1 件；按件计，水与边角走掉',
  },

  /**
   * 多孔 Pt 电极：海绵 Pt 0.001 kg → 2 件（每件 0.4 g 烧结体）。
   *
   *   球磨到 ≤5 µm → 刷涂内外两面（湿膜 60 µm，烧后 15–25 µm）→
   *   900–1000 °C 烧结 0.5 h（Pt 熔点 1768，烧结颈在 0.5–0.6 Tm 长起来）→
   *   压接金引线。孔隙率 35–45 % 靠球磨粒度与烧结温度守，没有压汞/BET。
   */
  {
    id: 'make/oxygen-probe-electrode-pt',
    name: 'Zirconia Oxygen Cell Porous Silver Electrode Manufacturing', name_zh: '氧化锆氧电池多孔银电极制造',
    rate: { hours: q(16) },
    produces: [
      {
        item: 'plant/oxygen-probe/electrode',
        qty: q(2),
        gives: [
          { param: 'porosity', kind: 'range', min: 35, max: 45 },
          { param: 'area', kind: 'range', min: 2, max: 2 },
          { param: 'thickness', kind: 'range', min: 15, max: 25 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/platinum', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(1, 1000) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '海绵 Pt 球磨 8 h 到 ≤5 µm（与银电极同一台选矿球磨机，避免交叉污染要先用尾矿砂洗磨）', performedBy: 'plant/ore-beneficiary' },
      { note_zh: '刷涂内外两面：湿膜 60 µm，烧后 15–25 µm；水里加一滴磷酸做分散剂，烧完不留灰', performedBy: 'plant/robot' },
      {
        note_zh: '烧结 900–1000 °C / 0.5 h：Pt 熔点 1768 °C，0.5–0.6 Tm 长烧结颈；孔留得住，温度高了会闭孔',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 900, max: 1000 }],
      },
      { note_zh: '压接金引线（φ0.1 金丝）：Pt-金在 900 °C 会互扩散，引线只压接不焊', performedBy: 'plant/robot' },
      { note_zh: '测厚度与方阻反推孔隙率（35–45 %）；面积 2 cm²；没有压汞/BET', performedBy: 'plant/metrology-room' },
    ],
    unbalanced_zh: 'Pt 0.001 + 水 0.05 + 尾矿 0.001 → 电极 2 件（共 0.8 g）；差是球磨/刷涂损失与水',
  },

  /**
   * Pd 膜组件：20 µm Pd 箔 0.001 kg + 多孔 Al₂O₃ 0.1 + 316L 0.5 + 铜 0.01 → 1 件。
   *
   *   0.02 m² 的 20 µm 箔体积 4×10⁻⁷ m³ × 12.0 g/cm³ = 4.8 g？等一下：
   *   0.02 m² × 20×10⁻⁶ m = 4×10⁻⁷ m³ = 0.4 cm³ × 12 g/cm³ = **4.8 g**。
   *   所以 1 件膜要 0.0048 kg Pd 箔，不是 0.001 kg。本路线按 0.005 kg 投料。
   *   20 µm 膜的通量：约 58 g H₂/h（0.02 m²、300 °C、1 MPa/0.1 MPa）；
   *   5 µm 膜是 4 倍 ≈230 g/h，但 5–19 µm 箔本层没有。
   */
  {
    id: 'make/pd-membrane',
    name: 'Palladium Membrane Manufacturing', name_zh: '钯膜制造',
    rate: { hours: q(12) },
    produces: [
      {
        item: 'plant/diffusion-furnace/pd-membrane',
        qty: q(1),
        gives: [
          { param: 'thickness', kind: 'range', min: 0.02, max: 0.025 },
          { param: 'area', kind: 'range', min: 0.02, max: 0.05 },
          { param: 'leakRate', kind: 'range', min: 1e-9, max: 1e-6 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/palladium-foil',
            qty: q(5, 1000),
            need: [{ param: 'thickness', kind: 'range', min: 0.02, max: 0.025 }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 100) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '裁 0.02 m² 的 20 µm Pd 箔；与多孔 Al₂O₃ 支撑贴合，边缘留 3 mm 铜密封带', performedBy: 'plant/robot' },
      {
        note_zh: '扩散连接 900–1000 °C、氢/真空 1 h：Pd 与 Al₂O₃ 不反应，靠铜密封带润湿；温度低了不密封，高了 Pd 晶粒长粗',
        performedBy: 'plant/atmosphere-furnace',
        under: [
          { param: 'temperature', min: 900, max: 1000 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      { note_zh: '装 316L 壳与法兰；保压 30 min 压降 ≤1 %（没有氦检漏，缺口）', performedBy: 'plant/metrology-room' },
      { note_zh: '成品：20–25 µm 膜、0.02–0.05 m²；20 µm 的 H₂ 通量约 58 g/h，5 µm 的 230 g/h 仍缺', performedBy: 'plant/metrology-room' },
    ],
    unbalanced_zh: 'Pd 箔 0.005 + 316L 0.5 + Al₂O₃ 0.1 + 铜 0.01 → 膜组件 1 件；按件计，余是边角与密封带',
  },

  /**
   * Pd 膜气体纯化器：Pd 膜 1 件 + 316L 5 kg + 铜 0.2 + 石英 1 → 1 件。
   *
   *   这是 `make/gas-purifier`（铜床/石灰）与 `make/gas-purifier-cast`
   *   之外的**第三条**来路：钯膜只让 H₂ 过，出口 H₂ 纯度由膜的致密性定，
   *   不需要铜床/分子筛。代价是 20 µm 膜的通量只有 5 µm 的 1/4，
   *   而且 300–500 °C 的法兰/膨胀匹配没有实测。
   */
  {
    id: 'make/gas-purifier-pd',
    name: 'Diffusion Furnace Gas Purification Unit Manufacturing', name_zh: '扩散炉气体纯化单元制造',
    rate: { hours: q(16) },
    produces: [{ item: 'plant/diffusion-furnace/gas-purifier', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'plant/diffusion-furnace/pd-membrane', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '装膜组件到 316L 壳：石墨/铜垫密封，进出口法兰对中；膜两侧压差 ≤1 MPa', performedBy: 'plant/robot' },
      { note_zh: '装加热套（300–500 °C）与氢气路；升温 2 K/min，避免膜与壳的膨胀差撕开密封', performedBy: 'plant/robot' },
      { note_zh: '保压 30 min 压降 ≤1 %；出口 H₂ 纯度按膜致密性声明（没有 <100 ppm 的气体分析仪）', performedBy: 'plant/metrology-room' },
    ],
    unbalanced_zh: 'Pd 膜 1 + 316L 5 + 铜 0.2 + 石英 1 → 纯化器 1 件；按件计，余是边角',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 接线（主 agent 注册；本文件不动 tools/report/data.ts）
//
//   import { PGM_DEVICE_ITEMS, PGM_DEVICE_ROUTES } from '../../data/machine/pgm-devices.ts';
//   items:  [...PGM_DEVICE_ITEMS]
//   routes: [...PGM_DEVICE_ROUTES]
//
// ⚠️ 本文件依赖 `data/material/pgm-products.ts` 的 `mat/platinum-wire`、
// `mat/palladium-foil`，以及 `flow-and-rf.ts` 的 `plant/mfc/rtd-pair`、
// `oxygen-metrology.ts` 的 `plant/oxygen-probe/electrode`、`zeolite.ts` 的
// `plant/diffusion-furnace/gas-purifier`。注册时两个文件都要在。
// ═══════════════════════════════════════════════════════════════════════════

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...PGM_DEVICE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...PGM_DEVICE_ROUTES];
