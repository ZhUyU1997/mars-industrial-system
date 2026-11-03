/**
 * 2 nm TiN 阻挡的专用 ALD —— 单片刻蚀/热 ALD，TiCl₄ + NH₃，20–40 循环。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 〇、为什么不是现有的 `plant/ald-reactor`
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `plant/ald-reactor` 是 28.3 L 的 25 片批处理机（`ald.ts`），它的 5 s N₂
 * 吹扫只换掉腔体的 **0.06 %**：200 sccm = 3.3 cm³/s，5 s 只有 16.7 cm³，
 * 而腔体 28 300 cm³。5 s 的化学吸附时间常数（2–4 s）够，**气体置换不够**。
 * 所以 2 nm TiN 的 Cl 残留压不到 <1 at% 不是化学问题，是**腔体太大、吹扫
 * 流量太小**。
 *
 * 本文件造一台**单片、2 L** 的专用机：5 slm N₂（83 cm³/s）× 60 s = 5 L
 * = **2.5 个腔体体积**；Cl 残留从 4 at% 指数衰减到 **0.3–0.9 at%**（见下）。
 * 机器复用 ALD 的工艺思路，但零件按 2 L 单片刻蚀/热 ALD 重新做：
 *
 *   `plant/tin-ald/chamber`      φ220 × 300 铝腔 + 水冷，2 L
 *   `plant/tin-ald/heater`       3 区 × 1.5 kW、450 °C
 *   `plant/tin-ald/ticl4-source` 20–60 °C 鼓泡瓶（p_sat 1.33 kPa @20 °C）
 *   `plant/tin-ald/purge-panel`  NH₃/N₂ 热面板，5 slm
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、TiCl₄ 分压与每循环生长量
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   20 °C 的 TiCl₄ p_sat = **1.33 kPa**（`ald.ts` 的同一口径）
 *   载气 200 sccm 把源气稀释到 **1.3 %**（p_sat / 100 kPa 量级）
 *   腔压 100 Pa 时 TiCl₄ 分压 = 1.3 % × 100 = **1.3 Pa**
 *   一次脉冲 0.5 L × 1.3 Pa = **0.65 Pa·L**
 *   ⇒ n = 0.65e-3 / (8.314 × 623) = 1.25e-7 mol = **7.5×10¹⁶ 个分子**
 *   200 mm 片面积 314 cm² ⇒ **2.4×10¹⁸ /m²** ≈ 2.4 个单层（1×10¹⁹ /m²）
 *   ⇒ 每个循环的剂量是单层的 2.4 倍；2 nm 只要 20–40 循环（0.05–0.1 nm/周期）
 *   ⇒ 20–40 × 60–120 s = **20–80 min**（不含升降温）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、Cl 残留与 NH₃ 吹扫时间
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   TiCl₄ 化学吸附后表面留 TiClₓ（Cl/Ti ≈ 1–2）；NH₃ 0.5 s 把它转成 TiN
 *   + NH₄Cl，剩下的 Cl 按一阶脱附/吹扫衰减：
 *
 *     Cl(t) = Cl₀ · exp(−t/τ)，τ = 2–4 s（350–450 °C）
 *     Cl₀ ≈ 4 at%
 *
 *   60 s = 15–30 τ，化学上早已 <0.01 at%；**实际下限由气体置换决定**：
 *   5 slm × 60 s = 5 L = 2.5 个腔体体积 ⇒ 残余前驱体 8–13 % ⇒ **0.3–0.9 at%**。
 *   30 s 只有 1.25 个体积 ⇒ 1–3 at%；10 s ⇒ 3–4 at%（不合格）。
 *   所以本机固定 **NH₃ 0.5 s + N₂ 60 s**，并把 60 s 写进 cycleTime。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、交付窗口与缺口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   厚度      1.8–2.2 nm（20–40 循环 × 0.05–0.1 nm）
 *   均匀性    ±5 %（单片、3 区、5 slm）
 *   Cl 残留   0.3–0.9 at%（60 s 吹扫）
 *   电阻率    200–500 µΩ·cm（2 nm 膜；R□ = ρ/t = 1 000–2 500 Ω/□）
 *   台阶覆盖  88–95 %（单片、低深宽比；2 nm 端的内角圆角仍是缺口）
 *
 * ⚠️ **设计值/缺口**：
 *   ① Cl 残留没有常规 XPS；只有 `plant/sims` 的离线深度剖面，2 nm 膜的
 *      溅射深度分辨 ~1 nm ⇒ 0.3 与 0.9 at% 分不开，只能判“<1 at%”。
 *   ② 2 nm 是否连续没有量产漏电测试；`make/tin-2nm-ald` 已记“内角 1.1–1.5 nm、
 *      可能不连续”，本机只把**平面**的 2 nm 做实，内角覆盖仍按 `lowk-barrier.ts`。
 *   ③ 电阻率 200–500 是 2 nm 尺寸效应的设计窗口（体 TiN 是 15–30 µΩ·cm），
 *      四探针的 0.03–0.05 % 重复性够，但 2 nm 的厚度 ±10 % 直接进 R□。
 *   ④ 本文件不写 `measure/*`（R13）；2 nm 的连续膜/漏电测量在
 *      `data/measure/` 另立，本文件只交“能造出的片”。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、条目
// ═══════════════════════════════════════════════════════════════════════════

export const TIN_ALD_ITEMS: readonly Item[] = [
  /**
   * **单片刻蚀/热 ALD TiN 机。**
   *
   * 2 L 腔体、5 slm N₂ 吹扫、3 区 450 °C；不是 25 片批处理机 —— 批处理机的
   * 28.3 L 腔体在 200 sccm 下 5 s 只换 0.06 %，Cl 残留压不到 <1 at%。
   *
   * 它是 `plant/tin-ald/*` 四件装出来的（composedOf），不另写整机路线。
   */
  {
    id: 'plant/tin-ald',
    name: '单片刻蚀/热 ALD TiN 机',
    unit: '台',
    category: 'machine',
    holds: [
      { param: 'temperature', min: 300, max: 450 },
      { param: 'pressure', min: 10, max: 100 },
    ],
    props: [
      { param: 'chamberVolume', kind: 'range', min: 1.5, max: 2.5, unit: 'L' },
      { param: 'waferSize', kind: 'range', min: 100, max: 200, unit: 'mm', dir: 'atLeast' },
      { param: 'growthPerCycle', kind: 'range', min: 0.05, max: 0.1, unit: 'nm/周期' },
      { param: 'uniformity', kind: 'range', min: 0, max: 5, unit: '%', dir: 'atMost' },
      { param: 'clResidue', kind: 'range', min: 0, max: 1, unit: 'at%', dir: 'atMost' },
      { param: 'cycleTime', kind: 'range', min: 60, max: 120, unit: 's', dir: 'atMost' },
      { param: 'leakRate', kind: 'range', min: 0, max: 0.02, unit: 'Pa·L/s', dir: 'atMost' },
    ],
    composedOf: [
      { item: 'plant/tin-ald/chamber', qty: q(1) },
      { item: 'plant/tin-ald/heater', qty: q(1) },
      { item: 'plant/tin-ald/ticl4-source', qty: q(1) },
      { item: 'plant/tin-ald/purge-panel', qty: q(1) },
    ],
  },

  /**
   * 2 L 单片刻蚀/热 ALD 腔：φ220 × 300 铝腔、水冷夹套、φ50 熔石英窗、
   * 上下刀口法兰。**腔体小是本机的全部理由**（5 slm × 60 s = 2.5 个体积）。
   */
  {
    id: 'plant/tin-ald/chamber',
    name: '2 L 单片刻蚀/热 ALD 腔',
    unit: '件',
    category: 'part',
    props: [
      { param: 'chamberVolume', kind: 'range', min: 1.5, max: 2.5, unit: 'L' },
      { param: 'leakRate', kind: 'range', min: 0, max: 0.01, unit: 'Pa·L/s', dir: 'atMost' },
    ],
  },

  /** 3 区 × 1.5 kW 加热套：300–450 °C，片内 ±5 K（单片的均匀性靠小腔 + 3 区）。 */
  {
    id: 'plant/tin-ald/heater',
    name: '三区加热套',
    unit: '件',
    category: 'part',
    props: [
      { param: 'zones', kind: 'range', min: 3, max: 3, unit: '区', dir: 'atLeast' },
      { param: 'maxTemperature', kind: 'range', min: 450, max: 450, unit: '°C', dir: 'atLeast' },
    ],
  },

  /** TiCl₄ 鼓泡瓶：20–60 °C、p_sat 1.33 kPa @20 °C、0.5 L 液位；PTFE 阀座。 */
  {
    id: 'plant/tin-ald/ticl4-source',
    name: 'TiCl₄ 鼓泡瓶',
    unit: '件',
    category: 'part',
    props: [
      { param: 'bathTemperature', kind: 'range', min: 20, max: 60, unit: '°C' },
      { param: 'volume', kind: 'range', min: 0.5, max: 1, unit: 'L' },
      { param: 'leakRate', kind: 'range', min: 0, max: 1e-3, unit: 'Pa·L/s', dir: 'atMost' },
    ],
  },

  /** NH₃/N₂ 热吹扫面板：0–5 slm、150 °C 保温、PTFE 阀座（NH₃ 不碰铜）。 */
  {
    id: 'plant/tin-ald/purge-panel',
    name: 'NH₃/N₂ 热吹扫面板',
    unit: '件',
    category: 'part',
    props: [
      { param: 'flowRate', kind: 'range', min: 0, max: 5, unit: 'slm', dir: 'atLeast' },
      { param: 'maxTemperature', kind: 'range', min: 150, max: 150, unit: '°C', dir: 'atLeast' },
      { param: 'leakRate', kind: 'range', min: 0, max: 1e-3, unit: 'Pa·L/s', dir: 'atMost' },
    ],
  },

  /**
   * 2 nm TiN 阻挡片。**不是 5 nm 的 `mat/ald-barrier-wafer`，也不是
   * 2–2.5 nm 的 `mat/lowk-barrier-wafer`**：这是 2 L 单片刻蚀/热 ALD
   * 在低 k 片上交的 1.8–2.2 nm 定值片。
   */
  {
    id: 'mat/tin-barrier-2nm',
    name: '2 nm TiN 阻挡片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'thickness', kind: 'range', min: 0, max: 10, unit: 'nm' },
      { param: 'uniformity', kind: 'range', min: 0, max: 20, unit: '%', dir: 'atMost' },
      { param: 'clResidue', kind: 'range', min: 0, max: 5, unit: 'at%', dir: 'atMost' },
      { param: 'resistivity', kind: 'range', min: 0, max: 2000, unit: 'µΩ·cm', dir: 'atMost' },
      { param: 'stepCoverage', kind: 'range', min: 0, max: 100, unit: '%', dir: 'atLeast' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、路线
// ═══════════════════════════════════════════════════════════════════════════

export const TIN_ALD_ROUTES: readonly Route[] = [
  {
    /** 2 L 铝腔 + 水冷夹套 + 熔石英窗；刀口面车到 0.02。 */
    id: 'make/tin-ald-chamber',
    name: '2 L 单片刻蚀/热 ALD 腔制造',
    produces: [
      {
        item: 'plant/tin-ald/chamber',
        qty: q(1),
        gives: [
          { param: 'chamberVolume', kind: 'range', min: 2, max: 2 },
          { param: 'leakRate', kind: 'range', min: 0, max: 0.01 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(8) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(10) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '卷圆 φ220 × 300 × 6 mm、焊纵缝与上下法兰，焊外壁水冷夹套；2 L 内体积',
        performedBy: 'plant/sheet-shop',
      },
      {
        note_zh: '车上下刀口与 φ50 观察窗座：平面度 0.02、Ra 0.8；刀口靠铜垫塑性，不靠 O 圈',
        performedBy: 'lathe',
      },
      {
        note_zh: '装熔石英窗、铜垫、压环；酒精查漏 + 保压 30 min，只判到 1e-2 Pa·L/s（没有氦检漏）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(40) },
    unbalanced_zh:
      '铝 8 + 熔石英 1 + 铜 1 + 水 10 → 2 L 腔 1 件；余是卷圆边角、焊材与试压水，产物按件计',
  },

  {
    /** 3 区 × 1.5 kW 加热套，450 °C；镍丝绕氧化铝骨架，矿棉保温。 */
    id: 'make/tin-ald-heater',
    name: '三区加热套制造',
    produces: [
      {
        item: 'plant/tin-ald/heater',
        qty: q(1),
        gives: [
          { param: 'zones', kind: 'range', min: 3, max: 3 },
          { param: 'maxTemperature', kind: 'range', min: 450, max: 450 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/nickel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/refractory', qty: q(3) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(3) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(2) }] },
      { anyOf: [{ item: 'mat/glass-cloth', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1, 5) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '车三段氧化铝骨架（φ220 × 70、螺旋槽 2 mm 深、槽距 1 mm）', performedBy: 'lathe' },
      {
        note_zh: '绕 3 × 1.5 kW 镍丝（φ0.4、0.557 Ω/m）；引线压接 + 玻璃布箍（镍铜焊接要过渡片，本层没有）',
        performedBy: 'plant/winder',
      },
      { note_zh: '包 100 mm 矿棉 + 玻璃布 + 钢板外皮；矿棉装前 120 °C 烘 4 h', performedBy: 'plant/robot' },
      {
        note_zh: '通电老炼 300 °C × 2 h → 450 °C × 2 h，红外找热点；断丝重绕',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 300, max: 450 }],
      },
    ],
    rate: { hours: q(30) },
    unbalanced_zh:
      '镍 1 + 耐火瓷 3 + 矿棉 3 + 钢板 2 + 玻璃布 0.3 + 酚醛 0.2 → 加热套 1 件；余是废丝与矿棉边角',
  },

  {
    /** TiCl₄ 鼓泡瓶：20–60 °C、0.5 L、PTFE 阀座；饱和蒸气压 1.33 kPa @20 °C。 */
    id: 'make/tin-ald-ticl4-source',
    name: 'TiCl₄ 鼓泡瓶制造',
    produces: [
      {
        item: 'plant/tin-ald/ticl4-source',
        qty: q(1),
        gives: [
          { param: 'bathTemperature', kind: 'range', min: 20, max: 60 },
          { param: 'volume', kind: 'range', min: 0.5, max: 1 },
          { param: 'leakRate', kind: 'range', min: 0, max: 1e-3 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(2) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    steps: [
      { note_zh: '车瓶体与上盖（316L，φ80 × 180、0.5 L 液位）、焊进出口管', performedBy: 'lathe' },
      { note_zh: '装 PTFE 阀座与铜垫；酒精查漏 + 保压 30 min，只判到 1e-3 Pa·L/s', performedBy: 'plant/robot' },
    ],
    rate: { hours: q(20) },
    unbalanced_zh: '不锈钢 2 + PTFE 0.2 + 铜 0.3 + 水 5 → 源瓶 1 件；余是车屑与试压水',
  },

  {
    /** NH₃/N₂ 热吹扫面板：5 slm、150 °C 保温、PTFE 阀座。 */
    id: 'make/tin-ald-purge-panel',
    name: 'NH₃/N₂ 热吹扫面板制造',
    produces: [
      {
        item: 'plant/tin-ald/purge-panel',
        qty: q(1),
        gives: [
          { param: 'flowRate', kind: 'range', min: 5, max: 5 },
          { param: 'maxTemperature', kind: 'range', min: 150, max: 150 },
          { param: 'leakRate', kind: 'range', min: 0, max: 1e-3 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(2) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    steps: [
      { note_zh: '弯管、焊 1/4 管接头与阀座（NH₃ 线不碰铜，阀座 PTFE）', performedBy: 'plant/sheet-shop' },
      { note_zh: '装 150 °C 保温带与热偶；5 slm 针阀 + 压力调节（不是 plant/mfc 的 200 sccm 量程）；酒精查漏，只判到 1e-3 Pa·L/s', performedBy: 'plant/robot' },
    ],
    rate: { hours: q(20) },
    unbalanced_zh: '不锈钢 2 + PTFE 0.2 + 铜 0.3 + 水 5 → 吹扫面板 1 件；余是管头与试压水',
  },

  {
    /**
     * **2 nm TiN：一片低 k 片进，20–40 循环，出 1.8–2.2 nm 阻挡片。**
     *
     *   低 k 片 1 + TiCl₄ 0.4 g + NH₃ 0.2 g + N₂ 2 g + Ar 0.1 g + 水 10
     *   → 2 nm TiN 片 1
     *
     * 先 DDS 硅烷化（100–120 °C / 10 min）把低 k 表面的 Si–OH 封掉，否则
     * TiCl₄ 首脉冲会咬表面；然后 20–40 循环，每循环 0.05–0.1 nm。
     * Cl 残留与吹扫时间的账在文件头第二节。
     */
    id: 'make/tin-barrier-2nm',
    name: '2 nm TiN 阻挡片制造',
    produces: [
      {
        item: 'mat/tin-barrier-2nm',
        qty: q(1),
        gives: [
          { param: 'thickness', kind: 'range', min: 1.8, max: 2.2 },
          { param: 'uniformity', kind: 'range', min: 3, max: 5 },
          { param: 'clResidue', kind: 'range', min: 0.3, max: 0.9 },
          { param: 'resistivity', kind: 'range', min: 200, max: 500 },
          { param: 'stepCoverage', kind: 'range', min: 88, max: 95 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/sico-h-wafer',
            qty: q(1),
            need: [{ param: 'kValue', kind: 'range', max: 2.5, dir: 'atMost' }],
            onRelax: 'functional-lost',
          },
        ],
      },
      // DDS：0.1 µm 膜、78.5 cm²、1 g/cm³ ≈ 8 mg；取 2 g
      { anyOf: [{ item: 'mat/dimethyl-dichlorosilane', qty: q(1, 500) }] },
      // TiCl4 0.4 g：2 nm TiN 含 Ti 1.6 mg，TiCl4 约 6 mg；0.4 g 是 60 倍过量（源瓶/管路）
      { anyOf: [{ item: 'mat/ticl4', qty: q(1, 2500) }] },
      // NH3 0.2 g：化学计量约 0.4 mg，取 0.2 g（吹扫/尾气）
      { anyOf: [{ item: 'mat/ammonia', qty: q(1, 5000) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 500) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(1, 10000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(10) }] },
    ],
    needs: [
      'plant/euv-vacuum',
      'plant/clean-room',
      'plant/metrology-room',
      'plant/water-polisher',
    ],
    rate: { hours: q(4) },
    steps: [
      {
        note_zh:
          'DDS 硅烷化：100–120 °C / 10 min / 100–300 kPa，把低 k 的 Si–OH 封成 Si–(CH₃)₂；不封则 TiCl₄ 首脉冲咬表面',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 100, max: 120 },
          { param: 'pressure', min: 100, max: 300 },
        ],
      },
      {
        note_zh:
          '装片、抽到 1e-3 Pa、升到 350–450 °C（3 K/s，腔小、片热容小，30–60 min）',
        performedBy: 'plant/tin-ald',
        under: [
          { param: 'pressure', min: 1e-6, max: 1 },
          { param: 'temperature', min: 300, max: 450 },
        ],
      },
      {
        note_zh:
          '20–40 循环：TiCl₄ 0.2 s（1.3 Pa）→ N₂ 60 s → NH₃ 0.5 s → N₂ 60 s；每循环 0.05–0.1 nm；Cl 残留 0.3–0.9 at%',
        performedBy: 'plant/tin-ald',
        under: [
          { param: 'pressure', min: 10, max: 100 },
          { param: 'temperature', min: 350, max: 450 },
        ],
      },
      {
        note_zh: 'QCM 每 9 周期读一次增量：0.05–0.1 nm/周期 ⇒ 0.45–0.9 nm；QCM 只判“还在长”',
        performedBy: 'plant/film-monitor',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '椭偏读厚度 1.8–2.2 nm（49 点，均匀性 3–5 %）；2 nm 的 n/k 仍按 TiN 体材料近似',
        performedBy: 'plant/ellipsometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '四探针读 R□：2 nm、200–500 µΩ·cm ⇒ 1 000–2 500 Ω/□；厚度 ±10 % 直接进 R□',
        performedBy: 'plant/probe-station',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: 'SIMS 深度剖面读 Cl：2 nm 膜的深度分辨 ~1 nm ⇒ 只能判“<1 at%”，分不开 0.3 与 0.9',
        performedBy: 'plant/sims',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-5 }],
      },
    ],
    unbalanced_zh:
      '低 k 片 1 + TiCl₄ 0.4 g + NH₃ 0.2 g + N₂ 2 g + Ar 0.1 g + 水 10 kg → 2 nm TiN 片 1。TiN 2 nm × 78.5 cm² × 5.4 g/cm³ = **0.085 mg**（Ti 0.06 mg、N 0.025 mg）；TiCl₄ 化学计量约 0.4 mg、NH₃ 约 0.2 mg，投料是 10³–10² 倍过量（源瓶、管路、吹扫）；副产 NH₄Cl 进尾气/冷阱。产物按片计，芯片质量没有条目，不折 kg',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...TIN_ALD_ITEMS];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/tin-ald',
    name: '单片刻蚀/热 ALD TiN 机装配',
    produces: [{
      item: 'plant/tin-ald',
      qty: q(1),
      gives: [
      { param: 'chamberVolume', kind: 'range', min: 1.5, max: 2.5 },
      { param: 'waferSize', kind: 'range', min: 100, max: 200, dir: 'atLeast' },
      { param: 'growthPerCycle', kind: 'range', min: 0.05, max: 0.1 },
      { param: 'uniformity', kind: 'range', min: 0, max: 5, dir: 'atMost' },
      { param: 'clResidue', kind: 'range', min: 0, max: 1, dir: 'atMost' },
      { param: 'cycleTime', kind: 'range', min: 60, max: 120, dir: 'atMost' },
      { param: 'leakRate', kind: 'range', min: 0, max: 0.02, dir: 'atMost' },
      ],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...TIN_ALD_ROUTES, ...ASSEMBLY_ROUTES];
