/**
 * 硼 30–100×：树脂富集 + 无硼台 + 高分辨磁扇 —— 仪器与材料那一半
 * （R13：仪器、零件、材料放 data/machine/）。
 *
 * ⚠️ **分工（R13）**：本文件放**仪器 / 零件 / 材料**与它们的 `make/*` 路线；测量路线
 * 与记录在 `data/measure/boron.ts`（导出名 `BORON_MEASURE_ITEMS` /
 * `BORON_MEASURE_ROUTES`），按 id 跨文件解析 —— 同一次 data 装配，没有跨文件 import。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 〇、这一份补的是 `data/machine/trace-analysis.ts` §八 缺口 ①
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 那里：单四极杆 ICP-MS 的 B 只能到 **3–10 ppb**，TCS 的判据是 **≤0.1 ppb** ⇒
 * 差 **30–100 倍**。三个瓶颈、三件东西：
 *
 *   ① 基体里的硼抓不出来  → 硼专用螯合树脂（`mat/boron-selective-resin`）
 *   ② 器皿与空气把硼带进来 → 无硼超净台（`plant/boron-free-bench`）
 *   ③ 0.7–1.0 u 的峰宽分不开 ¹¹B 与 ¹²C 拖尾 → 高分辨双聚焦磁扇（`plant/hr-icp-ms`）
 *
 * 三件叠加的账（§四）：样品 DL **0.02 ppb**（比 0.1 ppb 的判据好 5 倍）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、硼专用树脂：为什么不是 IRA-743
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * IRA-743 的官能团是 **N-甲基葡萄糖胺**（葡萄糖 + 甲胺还原胺化）。本层
 * **没有葡萄糖**（`mat/glucose`/蔗糖/淀粉/纤维素 全 0 条目，本轮 grep）⇒ 那条
 * 路线写不出来。改用同一条思路里不依赖糖的版本：
 *
 *   苯乙烯 + 二乙烯苯（悬浮聚合，PVA 稳定剂）→ 珠
 *   → 曼尼希胺化（甲醛 + 二甲胺）：—CH₂N(CH₃)₂
 *   → 环氧氯丙烷 + NaOH → 缩水甘油（2,3-环氧丙醇）
 *   → 二醇季铵化：—CH₂N⁺(CH₃)₂—CH₂CH(OH)CH₂OH
 *
 * 官能团是**二醇 + 季铵**：硼酸（B(OH)₃）与 cis-二醇成五元环酯，季铵把局部
 * pH 抬到 8–9（硼酸 pKa 9.2，pH 越高越容易被抓）。与 IRA-743 的差别是
 * **选择性低 1.5–2 倍**（Cl⁻/SO₄²⁻ 竞争季铵位），所以富集倍数记 20× 而不是 50×。
 *
 *   交换容量 0.6–1.0 meq/mL（IRA-743 是 0.6–0.7 eq/L，同级）
 *   硼吸附 >95 %（pH 6–8、10 mL 样 / 0.5 g 树脂、30 min）
 *   可再生 20–50 次（0.5 M 亚沸 HCl；容量每次掉 0.2–0.5 %）
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、无硼台：硼硅玻璃是 ppm 级污染源
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 硼硅玻璃（Pyrex）含 **B₂O₃ 10–13 %**，也就是 **3–4 % 的硼**：一块 100 g 的
 * 烧杯内壁被酸蚀 1 µm，就放出 0.3 mg 硼 —— 落进 10 mL 样里是 **30 ppm**。
 * 石英好一些，但天然石英也含 **0.1–1 ppm B**（熔炼时还会从坩埚带进来）。
 * ⇒ 痕量硼的器皿只能是 **PTFE/PFA**；本层没有 PFA（缺口③），用 PTFE。
 *
 *   台面与内衬：PTFE 4–6 mm（车削 + 热熔焊，不许用胶）
 *   过滤：`plant/clean-room/ffu` 两台（PTFE 滤膜 HEPA，99.99–99.999 % @0.3 µm）
 *   面风速 0.4–0.5 m/s（0.3 以下挡不住扩散，0.6 以上扰动大）
 *   **空白硼 ≤0.05 ppb**：开盖 ≤10 min、瓶口 φ10 mm 时，气相硼（0.1–1 ng/m³）
 *   扩散进 10 mL 样 <0.5 ng ⇒ 0.05 ppb；开盖 1 h 会到 0.3–3 ppb（这就是为什么
 *   富集要在**闭口瓶**里摇，台面只用于开盖的那几步）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、高分辨磁扇：常导 90° + 静电 70°，R = 4000–8000
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 四极杆 0.7–1.0 u 的峰宽在 m/z 11 上是 **~0.7 u**，而 ¹¹B（11.0093）与
 * ¹²C（12.0000）只差 0.99 u、¹⁰B（10.0129）与 ⁹Be¹H（10.0200）差 0.0071 u ——
 * 后者要 R = 10/0.0071 ≈ **1400**，前者真正的麻烦是 ¹²C 的**峰尾**（丰度 98.9 %，
 * 尾一长就把 11 的位置垫高）。R = 4000 时 ¹¹B 处的 ¹²C 尾降到 1e-6 量级。
 *
 *   磁扇：90°、r = 0.3 m、间隙 40 mm、B = **0.14 T（m/z 11）–0.69 T（m/z 260）**
 *         @8 kV；设计上限 1.0 T ⇒ **常导**（不用超导，不用液氦）
 *   铁：极头 φ0.5 × 0.25 m ×2 + 轭 = **2.5–4 t**（1.5 T 档才要 8–10 t；本机 0.7 T
 *       只要 2.5–4 t，见缺口⑤）
 *   稳定度：电流 0.1 ppm ⇒ 场 1–2 ppm（R=4000 只要 250 ppm，余量 100 倍）
 *   静电分析器：70°、r = 0.25 m、极板电压 1000–1500 V（8 keV 的 E = 2V/r = 64 kV/m）
 *   双聚焦：Nier-Johnson（磁扇 90° + ESA 70°，方向聚焦与能量聚焦同时满足）
 *   缝：入射/出射 10–40 µm ⇒ **R = 4000–8000**（R = r/(2s)：0.3/(2×15 µm) = 10 000）
 *   探测器：复用 `plant/sims/electron-multiplier` + `plant/sims/faraday-cup`
 *   前端：**整套复用 `plant/icp-ms` 的零件**（炬/射频/雾化/锥/透镜/气路/箱体）
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、B 的账：0.02 ppb 是怎么来的
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   溶液检出限（R=4000、¹¹B、无 ¹²C 尾）：**5–25 ppt**（0.005–0.025 ppb）
 *   富集：10 mL 样 → 0.5 mL 洗脱 = **20×** ⇒ 样品当量 0.000 25–0.001 25 ppb
 *   空白：无硼台 + 亚沸酸 + PTFE ⇒ **0.02–0.05 ppb**（这一项才是地板）
 *   ⇒ 样品检出限 = 3σ(空白) ≈ **0.02 ppb**；定量下限 0.05–0.1 ppb
 *   ⇒ 对 TCS 的 ≤0.1 ppb：**判合格有余量（5 倍）**；对 0.01 ppb 的超高纯档还差 2–5 倍
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、缺口（带数；R7：按量级记录，不作为终止条件）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ① 没有葡萄糖 ⇒ IRA-743 同款的 N-甲基葡萄糖胺做不出来；本层用二醇季铵，
 *     选择性低 1.5–2 倍 ⇒ 富集 20× 而不是 50×（要 IRA-743：formose 反应
 *     6 HCHO → C₆H₁₂O₆（Ca(OH)₂ 催化）或纤维素链，缺两条）。
 *  ② 硼空白 0.05 ppb 是**开盖 10 min** 的值；开盖 1 h 到 0.3–3 ppb（气相硼
 *     0.1–1 ng/m³、面风速 0.45 m/s）⇒ 富集必须闭口摇。
 *  ③ 没有 PFA：PTFE 的硼记忆比 PFA 差 2–5 倍（与 trace-analysis 缺口⑪ 同源）。
 *  ④ ¹²C 尾靠 R=4000 压到 1e-6；R=10000 要 10 µm 缝 + 场稳定 0.5 ppm，而常导
 *     电源的稳定度是 1 ppm/h ⇒ 本机只交 R 4000–8000。
 *     （2026-10-20 补：精密缝 / 精密电源 / NMR 三件已建，R=10000–12000 的
 *     第二条产出路线 `make/hr-icp-ms-hr` 在 `data/machine/hr-icp-ms-stage.ts`；
 *     上面这一段保留为旧推导。）
 *  ⑤ 磁扇铁 2.5–4 t：`plant/melting-furnace` 一炉 2–3 t（要 2 炉），极面磨削
 *     平面度 5 µm、平行度 10 µm —— 这是这一件最贵的两步。
 *  ⑥ 树脂再生 20–50 次后容量掉 10–20 %（按 30 次换，每批 0.5 g ⇒ 0.017 g/批）。
 *  ⑦ 只测 B 的浓度；¹⁰B/¹¹B 同位素比要丰度灵敏度 1e-7（本机 2×10⁻⁷–5×10⁻⁷），
 *     差 2–5 倍。
 *  ⑧ 本链不解决 B 的**形态**（B(OH)₃ / BCl₃ / 硼酸酯）：测的是总硼。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 六、接线（主 agent 注册；本文件不动 tools/report/data.ts）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   import { BORON_HW_ITEMS, BORON_HW_ROUTES } from '../../data/machine/boron.ts';
 *   import { BORON_MEASURE_ITEMS, BORON_MEASURE_ROUTES } from '../../data/measure/boron.ts';
 *   items:  [...BORON_HW_ITEMS, ...BORON_MEASURE_ITEMS]
 *   routes: [...BORON_HW_ROUTES, ...BORON_MEASURE_ROUTES]
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const BORON_HW_ITEMS: readonly Item[] = [
  /**
   * **硼专用螯合树脂（二醇季铵型）。**
   *
   *   exchangeCapacity 0.7–0.9 meq/mL（与 IRA-743 的 0.6–0.7 eq/L 同级）
   *   boronUptake      96–99 %（pH 6–8、10 mL 样 / 0.5 g 树脂 / 30 min）
   *   cycles           30–50（0.5 M 亚沸 HCl 再生）
   *   beadSize         0.4–1.0 mm（悬浮聚合筛分）
   *   boronBlank       0.01–0.05 ppb（树脂自身的硼本底，酸洗 3 次后）
   *
   * ⚠️ 不是 IRA-743 的葡萄糖胺（本层没有葡萄糖）；官能团是二醇 + 季铵，见 §一。
   */
  {
    id: 'mat/boron-selective-resin',
    name: '硼专用螯合树脂',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'exchangeCapacity', kind: 'range', min: 0.6, max: 1.0, unit: 'meq/mL' },
      { param: 'boronUptake', kind: 'range', min: 95, max: 99, unit: '%', dir: 'atLeast' },
      { param: 'cycles', kind: 'range', min: 20, max: 50, unit: '次', dir: 'atLeast' },
      { param: 'beadSize', kind: 'range', min: 0.3, max: 1.2, unit: 'mm' },
      { param: 'boronBlank', kind: 'range', min: 0, max: 0.05, unit: 'ppb', dir: 'atMost' },
    ],
  },

  /**
   * **无硼台面（PTFE 内衬 + 台板）。**
   *
   *   area        0.8–1.2 m²（能放一台电子天平 + 两个 PTFE 瓶）
   *   thickness   4–6 mm（PTFE 板；薄了焊不住、厚了自重下垂）
   *   blankBoron  0.01–0.03 ppb（PTFE 面 + 亚沸酸擦拭后的擦拭液）
   */
  {
    id: 'plant/boron-free-bench/plenum',
    name: '无硼超净台无硼台面',
    unit: '件',
    category: 'part',
    props: [
      { param: 'area', kind: 'range', min: 0.5, max: 1.5, unit: 'm²' },
      { param: 'thickness', kind: 'range', min: 3, max: 8, unit: 'mm' },
      { param: 'blankBoron', kind: 'range', min: 0, max: 0.05, unit: 'ppb', dir: 'atMost' },
    ],
  },

  /**
   * **无硼台架：316L 方管 + 可调地脚。**
   *
   *   load    80–120 kg（台面 + 天平 + 瓶）
   *   height  1.6–1.8 m
   *   level   0.8–1.5 mm/m（水平，不然瓶子倒）
   */
  {
    id: 'plant/boron-free-bench/frame',
    name: '无硼超净台无硼台架',
    unit: '件',
    category: 'part',
    props: [
      { param: 'load', kind: 'range', min: 50, max: 150, unit: 'kg' },
      { param: 'height', kind: 'range', min: 1.4, max: 2, unit: 'm' },
      { param: 'level', kind: 'range', min: 0.5, max: 2, unit: 'mm/m', dir: 'atMost' },
    ],
  },

  /**
   * **无硼超净台。PTFE 台面 + 两台 FFU（PTFE 滤膜）+ 316L 架。**
   *
   *   blankBoron    0.02–0.05 ppb（**关键指标**：开盖 10 min 的 10 mL 样）
   *   hepaEfficiency 99.99–99.999 % @0.3 µm
   *   faceVelocity  0.4–0.5 m/s
   *   isoClass      3–4（台面局部；房间本身是 5–7，见 `plant/clean-room`）
   *
   * 它不 hold 任何条件（温度是房间的）；它是一台**把硼挡在外面**的设备。
   */
  {
    id: 'plant/boron-free-bench',
    name: '无硼超净台',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'measure/blankBoron', kind: 'range', min: 0.01, max: 0.05, unit: 'ppb', dir: 'atMost' },
      { param: 'hepaEfficiency', kind: 'range', min: 99.99, max: 99.999, unit: '%', dir: 'atLeast' },
      { param: 'faceVelocity', kind: 'range', min: 0.3, max: 0.6, unit: 'm/s' },
      { param: 'isoClass', kind: 'range', min: 3, max: 5, unit: '级' },
    ],
  },

  /**
   * **常导 90° 磁扇：r = 0.3 m、间隙 40 mm、上限 1.0 T。**
   *
   *   field      0.8–1.0 T（m/z 11 只要 0.14 T，m/z 260 要 0.69 T，余 45 %）
   *   radius     0.28–0.32 m（色散 D ≈ 0.3 m，R = r/(2s)）
   *   gap        35–45 mm（束包络 20 mm + 余量）
   *   stability  1–2 ppm（电流 0.1 ppm；R=4000 只要 250 ppm）
   *   ironMass   2 800–3 600 kg（极头 + 轭；1.5 T 档才要 8–10 t）
   */
  {
    id: 'plant/hr-icp-ms/magnet',
    name: '常导 90° 磁扇',
    unit: '件',
    category: 'part',
    props: [
      { param: 'field', kind: 'range', min: 0.5, max: 1, unit: 'T' },
      { param: 'radius', kind: 'range', min: 0.25, max: 0.35, unit: 'm' },
      { param: 'gap', kind: 'range', min: 30, max: 50, unit: 'mm' },
      { param: 'stability', kind: 'range', min: 0.5, max: 2, unit: 'ppm', dir: 'atMost' },
      { param: 'ironMass', kind: 'range', min: 2500, max: 4000, unit: 'kg' },
    ],
  },

  /**
   * **静电分析器（ESA）：70°、r = 0.25 m、极板 1000–1500 V。**
   *
   *   sectorAngle 70°
   *   radius      0.24–0.26 m
   *   voltage     1 000–1 500 V（8 keV 的 E = 2V/r = 64 kV/m、20 mm 间隙 ⇒ 1.28 kV）
   *   stability   1–2 ppm（ESA 的电压稳定度决定能量聚焦）
   */
  {
    id: 'plant/hr-icp-ms/esa',
    name: 'HR-ICP-MS 静电分析器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'sectorAngle', kind: 'range', min: 60, max: 90, unit: '°' },
      { param: 'radius', kind: 'range', min: 0.2, max: 0.4, unit: 'm' },
      { param: 'voltage', kind: 'range', min: 200, max: 2000, unit: 'V' },
      { param: 'stability', kind: 'range', min: 0.5, max: 2, unit: 'ppm', dir: 'atMost' },
    ],
  },

  /**
   * **入射/出射缝：10–40 µm 可调，两对（x/y 各一对）。**
   *
   *   slitWidth   10–40 µm（R = r/(2s)：0.3 m / (2×15 µm) = 10 000）
   *   adjustment  3–5 µm（微调读数）
   *   pairs       2
   */
  {
    id: 'plant/hr-icp-ms/slits',
    name: 'HR-ICP-MS 入射/出射缝',
    unit: '件',
    category: 'part',
    props: [
      { param: 'slitWidth', kind: 'range', min: 10, max: 50, unit: 'µm' },
      { param: 'adjustment', kind: 'range', min: 2, max: 10, unit: 'µm' },
      { param: 'pairs', kind: 'range', min: 2, max: 3, unit: '对' },
    ],
  },

  /**
   * **飞行管：316L 管 + 磁屏蔽 + 泵口。**
   *
   *   length  0.8–1.0 m（磁扇到探测器的路程）
   *   leakRate 1e-4–5e-4 Pa·L/s
   *   shield   2–5 µT（坡莫合金没有，用退火纯铁 3 mm + 距离；地磁场 50 µT 下
   *            剩 2–5 µT 对 8 keV 的离子束偏转 <0.05 mm）
   */
  {
    id: 'plant/hr-icp-ms/flight-tube',
    name: 'HR-ICP-MS 飞行管',
    unit: '件',
    category: 'part',
    props: [
      { param: 'length', kind: 'range', min: 0.6, max: 1.2, unit: 'm' },
      { param: 'leakRate', kind: 'range', min: 0, max: 1e-3, unit: 'Pa·L/s', dir: 'atMost' },
      { param: 'shield', kind: 'range', min: 1, max: 10, unit: 'µT', dir: 'atMost' },
    ],
  },

  /**
   * **HR-ICP-MS 整机：ICP 前端（复用）+ 磁扇 + ESA + 缝 + 飞行管。**
   *
   *   boron               0.02–0.1 ppb（R=4000、¹¹B；空白限）
   *   resolution          4 000–12 000（两条路线：8 000 用 10–40 µm 缝，
   *                       12 000 用 `plant/precision-slit`，见 `hr-icp-ms-stage.ts`）
   *   massRange           2–260 u（8 kV 下 m/z 260 要 0.69 T）
   *   abundanceSensitivity 2×10⁻⁷–5×10⁻⁷（¹²C 尾；R=10000 可到 1e-7）
   *   stability           0.1–2 ppm/h（旧电源 1–2；`plant/magnet-power-supply`
   *                       0.1–0.5，NMR 闭环）
   *   collisionGas        H2（默认）/ NH3 / CH4 / He
   *   kED                 none / KED（He 碰撞或 NH3 反应档）
   *   traceMetalDL        0.2–2 ppb（H2 池）；KED 路线 0.05–0.5 ppb
   *
   * `holds` 与 `plant/icp-ms` 同构：炬箱 1 atm、分析腔 1e-5–1e-3 Pa。
   */
  {
    id: 'plant/hr-icp-ms',
    name: 'HR-ICP-MS 整机',
    unit: '台',
    category: 'machine',
    holds: [
      { param: 'pressure', min: 9e4, max: 1.1e5 },
      { param: 'pressure', min: 1e-5, max: 1e-3 },
    ],
    props: [
      { param: 'boron', kind: 'range', min: 0.005, max: 10, unit: 'ppb' },
      { param: 'phosphorus', kind: 'range', min: 0.005, max: 10, unit: 'ppb' },
      { param: 'titanium', kind: 'range', min: 0, max: 0.1, unit: 'ppb', dir: 'atMost' },
      { param: 'resolution', kind: 'range', min: 4000, max: 12000, unit: 'M/ΔM', dir: 'atLeast' },
      { param: 'massRange', kind: 'range', min: 2, max: 260, unit: 'u' },
      { param: 'abundanceSensitivity', kind: 'range', min: 1e-7, max: 1e-6, unit: '1', dir: 'atMost' },
      { param: 'stability', kind: 'range', min: 0.1, max: 2, unit: 'ppm', dir: 'atMost' },
      { param: 'recovery', kind: 'range', min: 0.9, max: 1.1, unit: '1' },
      { param: 'collisionGas', kind: 'enum', values: ['H2', 'NH3', 'CH4', 'He'] },
      { param: 'kED', kind: 'enum', values: ['none', 'KED'] },
      { param: 'bias', kind: 'range', min: -30, max: 0, unit: 'V' },
      { param: 'traceMetalDL', kind: 'range', min: 0.05, max: 2, unit: 'ppb', dir: 'atMost' },
      // 油中铜：measure/oil-copper-compatibility 用它（油基体稀释后直接进 ICP-MS）
      { param: 'copperInOil', kind: 'range', min: 0.1, max: 10, unit: 'ppm' },
    ],
  },
];

export const BORON_HW_ROUTES: readonly Route[] = [
  {
    /**
     * **硼专用树脂：悬浮聚合珠 → 曼尼希胺化 → 缩水甘油 → 二醇季铵化。**
     *
     *   苯乙烯 0.3 + 二乙烯苯 0.03 + PVA 0.01 + 甲醛 0.2 + 二甲胺 0.2
     *   + 环氧氯丙烷 0.4 + 氢氧化钠 0.2 + 水 3 → 树脂 0.5 kg
     *
     * 五步：
     *   ① 悬浮聚合：苯乙烯 + 8 % DVB，PVA 稳定剂，80–90 °C 6 h ⇒ 0.3–1 mm 珠
     *   ② 曼尼希胺化：甲醛 + 二甲胺，60–80 °C 4 h ⇒ —CH₂N(CH₃)₂（每珠 1 个位）
     *   ③ 缩水甘油：环氧氯丙烷 + NaOH（40–60 °C，脱 HCl）⇒ 2,3-环氧丙醇
     *   ④ 二醇季铵化：缩水甘油 + 胺化珠，70–80 °C 8 h
     *   ⑤ 酸洗（0.5 M 亚沸 HCl ×3）、水洗到中性、筛分、测容量与硼本底
     */
    id: 'make/boron-selective-resin',
    name: '硼专用树脂制备',
    produces: [
      {
        item: 'mat/boron-selective-resin',
        qty: q(1, 2),
        gives: [
          { param: 'exchangeCapacity', kind: 'range', min: 0.7, max: 0.9 },
          { param: 'boronUptake', kind: 'range', min: 96, max: 99 },
          { param: 'cycles', kind: 'range', min: 30, max: 50 },
          { param: 'beadSize', kind: 'range', min: 0.4, max: 1.0 },
          { param: 'boronBlank', kind: 'range', min: 0.01, max: 0.05 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/styrene', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/divinylbenzene', qty: q(3, 100) }] },
      { anyOf: [{ item: 'mat/polyvinyl-alcohol', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/formaldehyde', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/dimethylamine', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/epichlorohydrin', qty: q(2, 5) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/water', qty: q(3) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '① 悬浮聚合：苯乙烯 + 8 % DVB + PVA 稳定剂，80–90 °C / 6 h，筛 0.3–1.2 mm', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 80, max: 90 }] },
      { note_zh: '② 曼尼希胺化：甲醛 + 二甲胺（1:1），60–80 °C / 4 h', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 60, max: 80 }] },
      { note_zh: '③ 缩水甘油：环氧氯丙烷 + 40 % NaOH，40–60 °C 滴加，蒸出缩水甘油（bp 162 °C）', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 40, max: 60 }] },
      { note_zh: '④ 二醇季铵化：缩水甘油 / 胺化珠 = 1.2:1，70–80 °C / 8 h', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 70, max: 80 }] },
      { note_zh: '⑤ 0.5 M 亚沸 HCl 洗 3 次、水洗到中性、筛分；测交换容量与硼本底（0.01–0.05 ppb）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(48) },
    unbalanced_zh: '苯乙烯 0.3 + DVB 0.03 + PVA 0.01 + 甲醛 0.2 + 二甲胺 0.2 + 环氧氯丙烷 0.4 + NaOH 0.2 + 水 3 → 树脂 0.5 kg；余 3.84 = 聚合母液、缩水甘油蒸馏残液与洗水（水不折进产品）',
  },

  {
    /**
     * **无硼台面：PTFE 板车削 → 热熔焊 → 酸洗 → 测擦拭液硼。**
     *
     *   PTFE 0.5 → 台面 1 件（0.8–1.2 m²、4–6 mm）。
     */
    id: 'make/boron-free-bench-plenum',
    name: '无硼超净台无硼台面制造',
    produces: [
      {
        item: 'plant/boron-free-bench/plenum',
        qty: q(1),
        gives: [
          { param: 'area', kind: 'range', min: 0.8, max: 1.2 },
          { param: 'thickness', kind: 'range', min: 4, max: 6 },
          { param: 'blankBoron', kind: 'range', min: 0.01, max: 0.03 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/ptfe', qty: q(1, 2) }] }],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    steps: [
      { note_zh: 'PTFE 板车削到 4–6 mm、铣集液槽（不许用胶，热熔焊 340–380 °C）', performedBy: 'lathe' },
      { note_zh: '亚沸 HNO₃ 擦洗 3 次、超纯水冲、晾干；擦拭液的硼 ≤0.03 ppb', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(16) },
    unbalanced_zh: 'PTFE 0.5 → 台面 1 件；余是车屑与焊缝（按件计）',
  },

  {
    /**
     * **无硼台架：316L 方管切割 → 焊 → 装地脚。**
     */
    id: 'make/boron-free-bench-frame',
    name: '无硼超净台无硼台架制造',
    produces: [
      {
        item: 'plant/boron-free-bench/frame',
        qty: q(1),
        gives: [
          { param: 'load', kind: 'range', min: 80, max: 120 },
          { param: 'height', kind: 'range', min: 1.6, max: 1.8 },
          { param: 'level', kind: 'range', min: 0.8, max: 1.5 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(2, 5) }] }],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/sheet-shop',
    rate: { hours: q(10) },
    unbalanced_zh: '316L 0.4 → 台架 1 件；余是切头与焊材（按件计）',
  },

  {
    /**
     * **无硼超净台装配：台面 + 台架 + 两台 FFU（复用 clean-room 的 PTFE 滤膜单元）。**
     *
     *   台面 1 + 台架 1 + `plant/clean-room/ffu` 2 + 接触器 1 + PTFE 风管 0.3 → 1 台
     */
    id: 'make/boron-free-bench',
    name: '无硼超净台装配',
    produces: [
      {
        item: 'plant/boron-free-bench',
        qty: q(1),
        gives: [
          { param: 'measure/blankBoron', kind: 'range', min: 0.02, max: 0.05 },
          { param: 'hepaEfficiency', kind: 'range', min: 99.99, max: 99.999 },
          { param: 'faceVelocity', kind: 'range', min: 0.4, max: 0.5 },
          { param: 'isoClass', kind: 'range', min: 3, max: 4 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/boron-free-bench/plenum', qty: q(1) }] },
      { anyOf: [{ item: 'plant/boron-free-bench/frame', qty: q(1) }] },
      { anyOf: [{ item: 'plant/clean-room/ffu', qty: q(2) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(3, 10) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    steps: [
      { note_zh: '① 装台面与台架（水平 ≤1.5 mm/m）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '② 装两台 FFU 与 PTFE 风管，面风速标到 0.4–0.5 m/s', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '③ 空白试验：台面上开盖放 10 mL 超纯水 10 min，测硼 ≤0.05 ppb', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(24) },
    unbalanced_zh: '台面 1 + 台架 1 + FFU 2 + 接触器 1 + PTFE 0.3 → 无硼台 1 台；按件计',
  },

  {
    /**
     * **磁扇：铸铁轭与极头 → 精磨极面 → 绕铜线圈 → 场标定。**
     *
     *   铁 3 000 + 铜 800 + 45 钢 100 + 水 50 → 磁扇 1 件
     *
     * B = sqrt(2mV/q)/r：m/z 11、8 kV、r=0.3 ⇒ 0.14 T；m/z 260 ⇒ 0.69 T；上限 1.0 T。
     */
    id: 'make/hr-icp-ms-magnet',
    name: '常导 90° 磁扇制造',
    produces: [
      {
        item: 'plant/hr-icp-ms/magnet',
        qty: q(1),
        gives: [
          { param: 'field', kind: 'range', min: 0.8, max: 1 },
          { param: 'radius', kind: 'range', min: 0.28, max: 0.32 },
          { param: 'gap', kind: 'range', min: 35, max: 45 },
          { param: 'stability', kind: 'range', min: 1, max: 2 },
          { param: 'ironMass', kind: 'range', min: 2800, max: 3600 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron', qty: q(3000) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(800) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(50) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '① 铸轭铁与极头毛坯（2–3 t/炉，分两炉）', performedBy: 'plant/melting-furnace', under: [{ param: 'temperature', min: 1400, max: 1500 }] },
      { note_zh: '② 精磨极面：平面度 5 µm、平行度 10 µm、间隙 40 mm', performedBy: 'plant/grinder' },
      { note_zh: '③ 绕铜线圈（水冷 20 L/min）与装磁轭，比较仪对中', performedBy: 'plant/comparator' },
      { note_zh: '④ 场标定：霍尔片 + `std/dvm-general` 扫 r=0.3 m 的弧，均匀度 1e-5；电流稳定度 0.1 ppm ⇒ 场 1–2 ppm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(200) },
    unbalanced_zh: '铁 3000 + 铜 800 + 45 钢 100 + 水 50 → 磁扇 1 件；余是浇冒口、磨削量与线圈切头（铁 3000 是铸件毛重，净重 2800–3600）',
  },

  {
    /**
     * **ESA：两块弧形不锈钢电极 → 磨弧面 → 绝缘座 → 高压馈通。**
     *
     *   316L 0.2 + 氧化铝 2 + 铜 0.05 → ESA 1 件
     *   70°、r = 0.25 m、极板 1 000–1 500 V。
     */
    id: 'make/hr-icp-ms-esa',
    name: 'HR-ICP-MS 静电分析器制造',
    produces: [
      {
        item: 'plant/hr-icp-ms/esa',
        qty: q(1),
        gives: [
          { param: 'sectorAngle', kind: 'range', min: 70, max: 70 },
          { param: 'radius', kind: 'range', min: 0.24, max: 0.26 },
          { param: 'voltage', kind: 'range', min: 1000, max: 1500 },
          { param: 'stability', kind: 'range', min: 1, max: 2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1, 5) }] },
      { anyOf: [{ item: 'std/alumina-insulator-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 20) }] },
    ],
    needs: ['lathe', 'plant/metrology-room'],
    performedBy: 'plant/grinder',
    under: [{ param: 'temperature', min: 19, max: 21 }],
    rate: { hours: q(40) },
    unbalanced_zh: '316L 0.2 + 氧化铝 2 + 铜 0.05 → ESA 1 件；按件计',
  },

  {
    /**
     * **缝片：钼片研磨到 10–40 µm 缝宽 + 微调座。**
     *
     *   钼粉 0.05 + 316L 0.1 + 氧化铝 2 → 缝组件 1 套。
     */
    id: 'make/hr-icp-ms-slits',
    name: 'HR-ICP-MS 入射/出射缝制造',
    produces: [
      {
        item: 'plant/hr-icp-ms/slits',
        qty: q(1),
        gives: [
          { param: 'slitWidth', kind: 'range', min: 10, max: 40 },
          { param: 'adjustment', kind: 'range', min: 3, max: 5 },
          { param: 'pairs', kind: 'range', min: 2, max: 2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/molybdenum-powder', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1, 10) }] },
      { anyOf: [{ item: 'std/alumina-insulator-general', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '钼片磨到 0.05 mm 厚、线切割开缝、磨到 10–40 µm（显微镜测）', performedBy: 'plant/grinder' },
      { note_zh: '装 x/y 微调座（3–5 µm/格）与氧化铝绝缘', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(30) },
    unbalanced_zh: '钼粉 0.05 + 316L 0.1 + 氧化铝 2 → 缝组件 1 套；按件计',
  },

  {
    /**
     * **飞行管：316L 管 + CF 法兰 + 退火纯铁磁屏蔽。**
     *
     *   316L 0.6 + 铁 0.3 + 铜 0.05 → 飞行管 1 件。
     */
    id: 'make/hr-icp-ms-flight-tube',
    name: 'HR-ICP-MS 飞行管制造',
    produces: [
      {
        item: 'plant/hr-icp-ms/flight-tube',
        qty: q(1),
        gives: [
          { param: 'length', kind: 'range', min: 0.8, max: 1 },
          { param: 'leakRate', kind: 'range', min: 1e-4, max: 5e-4 },
          { param: 'shield', kind: 'range', min: 2, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(3, 5) }] },
      { anyOf: [{ item: 'mat/iron', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 20) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '焊 φ100 × 900 mm 飞行管与 CF 法兰（两端）', performedBy: 'plant/sheet-shop' },
      { note_zh: '包 3 mm 退火纯铁磁屏蔽 + 铜垫片；检漏 5e-4 Pa·L/s', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(24) },
    unbalanced_zh: '316L 0.6 + 铁 0.3 + 铜 0.05 → 飞行管 1 件；按件计',
  },

  {
    /**
     * **HR-ICP-MS 装配：ICP 前端（复用 `plant/icp-ms` 的零件）+ 磁扇 + ESA + 缝 + 飞行管。**
     *
     *   复用：炬 1 + 射频 1 + 线圈 1 + 雾化器 1 + 雾化室 1 + 蠕动泵 1 + 采样锥 1
     *        + 截取锥 1 + 透镜 1 + 气路板 1 + 箱体 1 + 接口腔 1
     *        + 粗抽 1 + 涡轮 2 + 冷阱 1 + 真空计 1 + 倍增器 1 + 法拉第杯 1
     *   新做：磁扇 1 + ESA 1 + 缝 1 + 飞行管 1 + 接触器 2
     *
     * 五道工序：前端 → 磁扇与 ESA 对中 → 缝与探测器 → 检漏 → 调谐与分辨力。
     * ⚠️ 检漏只写 1e-2–1e-1 Pa（借 euv-vacuum），不写 1e-4 —— 后者会撞
     * `condition_cycle`（与 `make/icp-ms` 同一条边界）。
     */
    id: 'make/hr-icp-ms',
    name: 'HR-ICP-MS 装配',
    produces: [
      {
        item: 'plant/hr-icp-ms',
        qty: q(1),
        gives: [
          { param: 'boron', kind: 'range', min: 0.02, max: 0.1 },
          { param: 'phosphorus', kind: 'range', min: 0.02, max: 0.08 },
          { param: 'titanium', kind: 'range', min: 0.01, max: 0.05 },
          { param: 'resolution', kind: 'range', min: 10000, max: 12000 },
          { param: 'massRange', kind: 'range', min: 2, max: 260 },
          { param: 'abundanceSensitivity', kind: 'range', min: 1e-7, max: 2e-7 },
          { param: 'stability', kind: 'range', min: 0.5, max: 1.5 },
          { param: 'recovery', kind: 'range', min: 0.95, max: 1.05 },
          { param: 'collisionGas', kind: 'enum', oneOf: ['H2'] },
          { param: 'kED', kind: 'enum', oneOf: ['none'] },
          { param: 'bias', kind: 'range', min: 0, max: 0 },
          { param: 'traceMetalDL', kind: 'range', min: 0.2, max: 2 },
          { param: 'copperInOil', kind: 'range', min: 0.5, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/hr-icp-ms/magnet', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hr-icp-ms/esa', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hr-icp-ms/slits', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hr-icp-ms/flight-tube', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/torch', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/rf-generator', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/load-coil', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/nebulizer', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/spray-chamber', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/peristaltic-pump', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/sampler-cone', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/skimmer-cone', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/ion-lens', qty: q(1) }] },
      { anyOf: [{ item: 'plant/icp-ms/collision-cell', qty: q(1) }] },
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
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'plant/euv-vacuum'],
    steps: [
      { note_zh: '① 装 ICP 前端（炬、射频、雾化、锥、透镜、气路、箱体）—— 与 `make/icp-ms` 同一套工序', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '② 装磁扇与 ESA：Nier-Johnson 几何（90° + 70°），离子光学轴对中 ≤0.05 mm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '③ 装缝（10–40 µm）与探测器：法拉第杯 + 电子倍增器，倍增器暗计数 ≤0.5 cps', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '④ 抽真空检漏：接 euv-vacuum 抽 1e-2–1e-1 Pa，关阀 1 h 压升 ≤1e-3 Pa·L/s', performedBy: 'plant/robot', under: [{ param: 'pressure', min: 1e-2, max: 1e-1 }] },
      { note_zh: '⑤ 调谐与分辨力：¹¹B 峰、R = r/(2s) 实测 4 000–8 000；¹²C 尾丰度灵敏度 2×10⁻⁷–5×10⁻⁷；质量轴 2–260 u', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(240) },
    unbalanced_zh: '磁扇 1 + ESA 1 + 缝 1 + 飞行管 1 + 复用件 19 + 接触器 2 → HR-ICP-MS 1 台；按件计',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...BORON_HW_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...BORON_HW_ROUTES];
