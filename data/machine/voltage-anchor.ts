/**
 * 绝对电压基准 —— 把 0.2 %（2000 ppm）的绝对项压到 50–100 ppm。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、现状：缺口不在「传递」，在「绝对伏特」
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `data/machine/voltage-reference.ts` 已经把 1–10 V 的**传递**做到
 * 0.005–0.02 %（50–200 ppm）：补偿齐纳 ≤5 ppm/K、mK 恒温箱、10:1 / 100:1
 * 精密分压 + 指零。但它的证书上还有单独一栏「绝对项 0.2 %」——
 *
 *   0.2 % = **2000 ppm**
 *   目标 0.01 % = **100 ppm**  → 差 **20 倍**
 *
 * 这 2000 ppm 的来源是：本层唯一的绝对锚是温度（水的三相点 / 冰点 0.01 °C），
 * 从温度借电压只有塞贝克系数，而铜-铁偶的塞贝克系数只有书本值 ±0.2 %。
 * 所以整条链的绝对准确度卡在「一本手册的 ±0.2 %」上，不在 µV 计、不在分压、
 * 也不在恒温。
 *
 * 本文件补的就是这一格：**不经过温度、不经过塞贝克系数**，用质量、长度、
 * 真空介电常数 ε₀ 直接把「伏特」称出来，再传给已有的 1–10 V 基准。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、两条地球路径，选哪条
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 地球上有两条经典路径。两条都真实存在过，区别在「它最后给出的是什么」。
 *
 * ── 路径 2：可计算电容（Thompson–Lampard 交叉电容） ─────────────────────
 *
 *   4 根平行圆柱，对角两对之间的电容只由长度定：
 *
 *     C = ε₀ · (ln2/π) · L          （任务书写成 ε₀·ln2·L，漏了 1/π）
 *
 *   ε₀ = 1/(μ₀c²) 由光速定义，ln2/π 是数，L 用激光干涉测 →
 *   **法拉从长度直接算出来**。再在频率 ω 下定义电阻：
 *
 *     R = 1/(ωC)
 *
 *   这条路给出的是 **Ω**，不是 V。V = I·R 里的 I 仍然要另一套绝对电流
 *   （电流天平）或一次力测量。所以它不是一条独立的「绝对伏特」路线，
 *   而是「绝对欧姆」路线；要闭合到伏特，得再建一台电流天平。
 *   本文件把它写在 §五，作为**备选**，并把差距算成数字。
 *
 * ── 路径 1：电流天平 / 电压天平 ────────────────────────────────────────
 *
 *   电流天平（Kelvin ampere balance）：F = (μ₀/4π)·I²·G 定 I，
 *   再 V = I·R。问题与路径 2 对称：**R 的绝对值从哪来**？本层没有绝对
 *   标准电阻，标准电阻的值最终还要靠可计算电容或进口。所以「电流天平 +
 *   已知电阻」不是自洽的一条路，它仍然要路径 2 来给 R。
 *
 *   电压天平（Kelvin absolute electrometer）：两块平行圆盘，一块接被测电压，
 *   一块挂在精密天平上。静电力：
 *
 *     F = ε₀ · A · V² / (2d²)      ⇒      V = d · √( 2mg / (ε₀A) )
 *
 *   力由**质量 × 本地重力加速度**给，A 与 d 由**长度**给，ε₀ 由**光速**给。
 *   它不经过电流、不经过电阻、不经过温度 —— **一条路直接给出伏特**。
 *
 * ── 本文件的选择：路径 1 的「电压天平」分支 ─────────────────────────────
 *
 *   理由只有一条，但它是硬的：**自洽性**。
 *
 *     · 电流天平分支：I 有了，V = I·R 还缺绝对 R → 退回路径 2；
 *     · 可计算电容分支：C/Ω 有了，V = I·R 还缺绝对 I → 退回电流天平；
 *     · 电压天平分支：V 直接由 F、d、A、ε₀ 给出 → **不再缺任何一件绝对标准**。
 *
 *   这不是取巧。开尔文 1860 年代就是用绝对静电计「称」电压的；20 世纪
 *   NBS / NPL 的电压天平做到 10 ppm 级，直到约瑟夫森结把它替掉。
 *   本层没有约瑟夫森（要 Nb/NbN 结 + 70–100 GHz + 4 K，`mat/helium` 只有 R10 一次性装填），
 *   所以回到约瑟夫森之前那一代最干净的做法。
 *
 *   代价写在 §七：量程只有 1–20 V（10 V 档直接测），要测 0.5 V 得靠
 *   已有的 10:1 分压；保护环边缘修正 −500 ppm（其不确定度 10 ppm）；没有独立第二套。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、链图
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ┌─ 质量锚 ─────────────────────────────────────────────────────────────┐
 *   │ 单晶硅球 φ20.1653 mm                                             │
 *   │   V = πD³/6 = 4.2935 cm³；ρ(Si,25 °C) = 2.3290 g/cm³            │
 *   │   m = ρV = 10.0000 g，不确定度 **20 ppm**（密度 10 + 球度 15）    │
 *   │   → std/mass-standard-10g-si                                    │
 *   └──────────────────────────────┬───────────────────────────────────────┘
 *                                  │ 10 g → 1 g → 100 mg → 10 mg → 1 mg
 *                                  │ 10 只等值砝码求和，逐代二分（不靠杠杆比）
 *                                  ▼
 *   std/mass-weight-set-mg（40 只，1 mg–1 g，**20–25 ppm**，相对 10 g 标准）
 *                                  │
 *   ┌─ 重力锚 ─────────────────────┴───────────────────────────────────────┐
 *   │ 可逆摆（Kater）：L = 1.000000 m，T = 3.262 s                      │
 *   │   g = 4π²L/T² = 3.7100 m/s²                                      │
 *   │   1000 个周期用石英时基计时（10 ppm）→ g 的 **25 ppm**            │
 *   │   → plant/gravity-pendulum                                       │
 *   └──────────────────────────────┬───────────────────────────────────────┘
 *                                  │
 *   ┌─ 长度锚 ─────────────────────┴───────────────────────────────────────┐
 *   │ 量块基准（钠 D 线，1 级 ±1 µm）+ 激光干涉测长（20 nm 读数）        │
 *   │ 折射率用 plant/refractometer 修正：1 mm 上 (n−1)d = 2.5 nm = 2.5 ppm │
 *   │ → 极板直径 D = 200.000 mm、间隙 d = 1.000000 mm                     │
 *   │   几何面积 0.031416 m²、有效面积 A_eff = 0.031400 m²（修正 −0.05 %）│
 *   └──────────────────────────────┬───────────────────────────────────────┘
 *                                  │
 *                                  ▼
 *   plant/voltage-balance（保护环绝对静电计）
 *     F = ε₀A_effV²/(2d²)；10.000 V、1 mm、φ200 盘 → F = 13.9 µN = 3.75 mg（火星 g）
 *     力用 plant/micro-balance 读（12 g 容量、0.05 µg 分辨、0.1 µg 重复性）
 *     10 V 档绝对不确定度 **31 ppm**（设计值，方和根，见 §四）
 *                                  │
 *                                  │ 1/2/5 V 抽头：基准内部分压比 30 ppm
 *                                  │ 0.5 V：再串一只 10:1，30 ppm
 *                                  ▼
 *   measure/voltage-absolute → mat/voltage-absolute-record
 *     绝对电压 0.5–10 V，不确定度 **50–90 ppm**（窗口 50–100 ppm）
 *     10 V 31 ppm / 1–5 V 43 ppm / 0.5 V 68 ppm（设计值）
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、算式与误差预算（设计值，1σ，方和根）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   V = d · √( 2 m g / (ε₀ A_eff) )
 *
 *   代入 10 V 档：d = 1.000 mm、A_eff = 0.031400 m²（几何 0.031416，环隙修正 −0.05 %）、
 *   ε₀ = 8.8541878128e-12、g = 3.71 m/s² → m = ε₀A_effV²/(2d²g) = **3.75 mg**。
 *
 *   项                                设计值        对 V 的贡献
 *   ─────────────────────────────────────────────────────────────
 *   极板间隙 d（20 nm / 1 mm）         20 ppm        20 ppm
 *   内盘直径 D（0.3 µm / 200 mm）      1.5 ppm(D)    1.5 ppm
 *   保护环修正的不确定度（修正值 −0.05 % 已扣） 10 ppm(A) 5 ppm
 *   质量标准 m（硅球）                 20 ppm        10 ppm
 *   本地 g（可逆摆）                   25 ppm        12.5 ppm
 *   力读数（0.05 µg / 3.75 mg）        13 ppm        6.5 ppm
 *   力重复性 + 线性（0.1 µg + 5 ppm）  27 ppm        13.5 ppm
 *   砝码传递（10 g → 1 mg）            5 ppm         2.5 ppm
 *   对中 / 余弦误差                    5 ppm         5 ppm
 *   温度 / 空气折射率                  3 ppm         3 ppm
 *   源稳定（10 V 齐纳，24 h）          2 ppm         2 ppm
 *   ─────────────────────────────────────────────────────────────
 *   方和根                                          **31 ppm**
 *
 *   1–5 V：加基准内部分压比 30 ppm → √(31² + 30²) = **43 ppm**
 *   0.5 V：加两只 10:1（30 ppm × √2 = 42 ppm）→ √(31² + 42²) = **52 ppm**；
 *          按最坏 60 ppm 记，则 **68 ppm**。
 *
 *   交付窗口取 **50–90 ppm**（含 1 倍余量、装调与首批实测的未知项）。
 *   这就是任务要的 50–100 ppm —— 10 V 与 1–5 V 在窗口内，0.5 V 在窗口上沿。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、备选：可计算电容（Thompson–Lampard）的差距，带数字
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   公式：C = ε₀·(ln2/π)·L = 1.953 pF/m × L
 *         L = 0.5 m → C = **0.977 pF**
 *         f = 10 kHz → R = 1/(ωC) = **16.3 MΩ**
 *
 *   它确实能把 Ω 钉在长度上（这是真绝对）。但：
 *
 *   ① **它给的是 Ω，不是 V。** V = I·R 还要一台绝对电流天平；
 *      电流天平的几何因子 G 要 20 ppm，力要 10 ppm，合起来 I 约 25–40 ppm。
 *   ② **机械公差差 2–10 倍。** 交叉电容的圆柱圆度 / 直线度要 ≤0.1 µm；
 *      本层磨床的圆度 1–3 µm（`plant/grinder` 的 spindleRunout 1–3 µm），
 *      研磨可到 0.2 µm —— 0.5 m 长的四圆柱要 0.1 µm，仍差 2 倍。
 *      端部与保护段边缘场是 ppm 级修正，0.1 µm 的公差才压得住。
 *   ③ **比率桥缺一代。** 0.977 pF 对 10 kΩ 要 10³–10⁴ 的比率臂；
 *      本层的变压器是电力变压器，不是精密比率变压器，比率误差 50–100 ppm。
 *      频率用石英 10 ppm（没有原子钟，短期稳定度就是 10⁻⁵）。
 *
 *   合起来：R 的 80–150 ppm + 电流天平 25–40 ppm → **V 90–160 ppm**，
 *   比电压天平的 31–68 ppm 更差，而且多一台大设备。
 *
 *   所以本文件不建它，只把它写成备选。它的正确位置是「绝对欧姆」，
 *   等哪一天要做「绝对电阻」或「绝对电流」时再建。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 六、溯源从「温度锚」转到「长度 / 时间 / 质量锚」
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   旧链：冰点（0 °C）→ 铜-铁热电偶的塞贝克系数（书本值 ±0.2 %）
 *         → 电压。温度是唯一的绝对锚，塞贝克系数的不确定度直接变成 2000 ppm。
 *
 *   新链：V = d√(2mg/(ε₀A))
 *         · d、A ← 长度（量块基准 / 激光干涉 / 折射率修正）
 *         · m    ← 单晶硅球的密度 × 体积（体积又由长度定）
 *         · g    ← 摆长（长度）+ 周期（石英时基，时间）
 *         · ε₀   ← 光速（定义值）
 *
 *   温度仍然要测，但它只用来修正热膨胀（1 °C 对钢是 16 ppm、对硅是 2.6 ppm），
 *   不再是**绝对锚**；塞贝克系数彻底退出这条链。记录条目里的
 *   `anchor = length-mass-time` 就是把这件事写进数据。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 七、剩余缺口（带数字，不拿「本层没有」当结论）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① **0.5 V 档 68 ppm，卡在分压比上。** 若 10:1 分压的比值误差取
 *      0.01 %（100 ppm），0.5 V 档会到 105 ppm，**超出 100 ppm**。
 *      必须用 `make/divider-precision-pair` 自校到 0.003 %（30 ppm）那一档，
 *      并在记录里写明「0.5 V 档依赖分压比自校；未自校则降级到 105 ppm」。
 *   ② **没有独立第二套绝对方法。** A/B 两只基准是同批同链，共同偏差查不出。
 *      要独立验证，必须把 §五的可计算电容 + 电流天平均建起来（V 90–160 ppm），
 *      或进口一只 20 ppm 的绝对标准。本文件不假装有。
 *   ③ **量子标准仍远。** 约瑟夫森结要 Nb/NbN + 70–100 GHz + 4 K
 *      （`mat/helium` 只有 R10 一次性装填），量子霍尔要 2DEG + 10 T + 0.3 K。
 *      本文件到 31 ppm（3×10⁻⁵）；量子电压的 10⁻⁸ 差 **3000 倍**。
 *   ④ **硅球密度的同位素项 10 ppm。** 天然硅的密度随同位素组成有
 *      ~1×10⁻⁵ 的分散；若没有同位素证书，密度项按 20–30 ppm 记，
 *      V 的质量项从 10 ppm 涨到 10–15 ppm。要压下去得用 ²⁸Si（本层没有）。
 *   ⑤ **g 的 25 ppm 卡在石英时基。** 石英 10⁻⁵（10 ppm）→ g 的 20 ppm；
 *      没有原子钟，这一项下不去。要 1 ppm 得铯束管或氢脉泽；Cs 现在是一次性
 *      输入（`cs-sb.ts`），铯束管仍未建，氢脉泽见 `atomic-clock.ts`。
 *   ⑥ **保护环边缘修正 −500 ppm（不确定度 10 ppm）是算的，不是量的。** 0.1 mm 环隙、φ200 盘，
 *      边缘场用实测几何（直径、间隙、平面度）做二维场解；没有第二台
 *      可计算电容去交叉验证。若场解有 2 倍误差，这一项到 20 ppm。
 *   ⑦ **湿度 / 表面泄漏未建模。** 10 V 下 1 pA 的泄漏是 10 TΩ；保护环
 *      与内盘同电位，正常时没有场，但凝露会让这一条失效。计量间的
 *      HVAC 不控露点，记录里要写「相对湿度 <40 %，否则重测」。
 *   ⑧ **量程只到 20 V。** 10 V 档直接测；要测 100 V 以上得另建高压分压，
 *      不在本文件里（`std/divider-100to1-precision` 的 1 kV 耐压也未验）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 八、注册（本文件不改 tools/report/data.ts，由用户注册）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   import { VOLTAGE_ANCHOR_ITEMS, VOLTAGE_ANCHOR_ROUTES }
 *     from '../../data/machine/voltage-anchor.ts';
 *   items 数组加  ...VOLTAGE_ANCHOR_ITEMS,
 *   routes 数组加 ...VOLTAGE_ANCHOR_ROUTES,
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const VOLTAGE_ANCHOR_ITEMS: readonly Item[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // 一、质量锚：10 g 单晶硅球
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * **10 g 单晶硅球：φ20.1653 mm，质量 10.0000 g，绝对不确定度 20 ppm。**
   *
   * 为什么是「密度 × 体积」而不是「拿 1 kg 原器比」：本层没有 1 kg 质量原器，
   * 也没有 1 kg 级的天平。地球上的千克在 2019 年前是铂铱原器，2019 年后是
   * 普朗克常数 —— 两条都要么运一件原器，要么有约瑟夫森 + 量子霍尔。两者本层
   * 都没有。但**千克在 1795 年的原始定义是「1 dm³ 的 4 °C 水」**，而
   * 「密度 × 体积」这条路只需要密度是知识、体积由长度量出来 —— 知识不占运载质量。
   *
   * 硅比水更适合当本层的实物：水的密度虽然准到 1 ppm，但要一个已知体积的
   * 容器、还要把弯月面读到 µm；单晶硅的密度 2.3290 g/cm³ 是手册值，
   * 同位素分散约 10 ppm，而球只要量**一个**直径：
   *
   *   V = πD³/6
   *   m = ρV = 2.3290 g/cm³ × 4.2935 cm³ = **10.0000 g**
   *
   * 为什么是球不是圆柱：圆柱要量直径与高两个尺寸，且圆度 1–3 µm 会把
   * 直径的不确定度放大；球只量一个直径，球度可以抛到 0.1 µm（`plant/cnc-polisher-5axis`
   * 的 5 轴抛光 + 抛光模，见路线）。地球上的阿伏伽德罗项目用 ²⁸Si 球，
   * 也是同一个几何理由。
   *
   * 为什么是 10 g 不是 1 kg：**它必须和 3.75 mg 的静电力上同一台天平。**
   * 一台 12 g 容量、0.05 µg 分辨的微量天平可以同时称 10 g 标准与 3.75 mg 力；
   * 1 kg 标准要另一台 1 kg 级比较仪（0.1 mg 分辨），多一台设备、多一级传递。
   * 10 g 足够：10 g → 1 g → 100 mg → 10 mg → 1 mg 四代二分，每代 0.5–1 ppm，
   * 到 1 mg 仍剩 20–25 ppm，而 3.75 mg 的力用 1 mg + 10 mg 砝码加电磁补偿内插。
   *
   * 数字：
   *   D = 20.1653 mm；V = 4.2935 cm³；ρ(25 °C) = 2.3290 g/cm³；
   *   ρ(20 °C) = 2.329091 g/cm³（α_Si = 2.6×10⁻⁶/K，25→20 °C 修正 3.9×10⁻⁵）；
   *   m = 10.0000 g；不确定度 √(10² + 15² + 0.5²) = **18 ppm**，窗口取 20 ppm。
   *
   * ⚠️ 天然硅的同位素组成有 ~10 ppm 的密度分散。若没有同位素证书，
   * 密度项按 20–30 ppm 记（见文件头 §七④）。
   */
  {
    id: 'std/mass-standard-10g-si',
    name: '10 g Single-Crystal Silicon Sphere', name_zh: '10 g 单晶硅球',
    unit: '件',
    category: 'part',
    props: [
      { param: 'mass', kind: 'range', min: 0.0099998, max: 0.0100002, unit: 'kg' },
      { param: 'diameter', kind: 'range', min: 20.1651, max: 20.1655, unit: 'mm' },
      { param: 'sphericity', kind: 'range', min: 0, max: 0.2, unit: 'µm', dir: 'atMost' },
      { param: 'tolerance', kind: 'range', min: 0, max: 20, unit: 'ppm', dir: 'atMost' },
    ],
  },

  /**
   * **毫克级砝码组：10×1 g + 10×100 mg + 10×10 mg + 10×1 mg，共 40 只。**
   *
   * 它不是「一堆小砝码」，而是一台**质量分度器**：每一代 10 只等值砝码的
   * 和等于上一代那 1 只，于是 10 g 的已知质量被「数个数」分到 1 mg ——
   * **不需要杠杆比，也不需要第二台天平**。10 只的和与上一代比，差值除以 10
   * 就是每只的平均偏差；再用两两比对把个体差读出来（替换称量，同一台天平）。
   *
   * 误差怎么走：
   *   10 g 标准 20 ppm → 10 只 1 g 的平均值 20 ppm + 1 ppm（和差 1 µg/10 g）
   *   → 1 g 单只 20 ppm → 100 mg 单只 20.5 ppm → 10 mg 单只 21 ppm
   *   → 1 mg 单只 22 ppm。四代二分后仍 ≤22–24 ppm，取 **25 ppm** 窗口。
   *
   * 为什么不用砝码的标称值：不锈钢密度 7.9 g/cm³，车出来的 1 g 砝码
   * 直径公差 0.01 mm 就是 2 %；所以每一只都要磨/研到名义值附近，
   * 再用 10 g 标准定值。标称值只是「先车到哪儿」的粗目标。
   */
  {
    id: 'std/mass-weight-set-mg',
    name: 'Milligram-Level Weight Set', name_zh: '毫克级砝码组',
    unit: '套',
    category: 'part',
    props: [
      { param: 'mass', kind: 'range', min: 0.000001, max: 0.001, unit: 'kg' },
      { param: 'tolerance', kind: 'range', min: 0, max: 25, unit: 'ppm', dir: 'atMost' },
      { param: 'pieces', kind: 'range', min: 10, max: 40, unit: '件' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 二、微量天平的五件零件
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * **天平梁：250 mm 铝合金梁，刀口槽在两端，直线度 0.02 mm。**
   *
   * 梁不要求「比例准」—— 静电力与配重砝码都挂在**同一端**，梁只当零位指示器，
   * 臂长比不进公式（这是 §四 V 的算式里没有「臂长」的原因）。梁要的是：
   *
   *   ① 轻而刚：铝 0.3 kg，一阶弯曲频率 >100 Hz，伺服带宽 5 Hz 不激励它；
   *   ② 刀口槽平行：两端槽的中心线在 0.02 mm 内，否则梁会侧摆；
   *   ③ 时效：粗加工后放 72 h 再精铣，残余应力释放，零点不漂。
   *
   * 为什么不用钢：铝的比刚度（E/ρ）是钢的 1.3 倍，同刚度下更轻；
   * 而梁的负载只有 ~120 g（可动电极 + 配重），铝足够。
   */
  {
    id: 'plant/micro-balance/beam',
    name: 'Microbalance Beam', name_zh: '微量天平横梁',
    unit: '件',
    category: 'part',
    props: [
      { param: 'length', kind: 'range', min: 200, max: 300, unit: 'mm' },
      { param: 'straightness', kind: 'range', min: 0, max: 0.05, unit: 'mm', dir: 'atMost' },
      { param: 'mass', kind: 'range', min: 0.2, max: 0.5, unit: 'kg' },
    ],
  },

  /**
   * **刀口：GCr15 淬火，刃半径 1–3 µm，一套两对。**
   *
   * 刀口是天平里唯一「靠线接触实现无间隙转动」的零件。轴承有间隙，
   * 而间隙在 0.05 µg 的分辨率下就是噪声；刀口的接触是一条线，转动时
   * 没有可测量的游隙。代价是它怕磕、怕锈、怕过载 —— 所以梁的静态负载
   * 压在 120 g 以内，刃口比压 ~200 MPa，远低于 GCr15 的屈服。
   *
   * 刃半径 1–3 µm 是磨出来的：粗磨用氧化铝，精磨用 W1 金刚石膏，
   * 最后在铸铁盘上轻研。半径太大，零位迟钝；太小，比压高、易崩。
   */
  {
    id: 'plant/micro-balance/knife-edge',
    name: 'Microbalance Knife Edge', name_zh: '微量天平刀口',
    unit: '件',
    category: 'part',
    props: [
      { param: 'edgeRadius', kind: 'range', min: 0.5, max: 3, unit: 'µm' },
      { param: 'hardness', kind: 'range', min: 58, max: 65, unit: 'HRC', dir: 'atLeast' },
      { param: 'length', kind: 'range', min: 30, max: 50, unit: 'mm' },
    ],
  },

  /**
   * **立柱、底座与防风罩：HT250 底座 + 350 mm 立柱 + 8 L 玻璃罩。**
   *
   * 底座要重（HT250，约 8 kg）：0.05 µg 的力对应 1.3×10⁻¹⁰ m/s² 的加速度，
   * 地板的一点振动就能把它淹掉；8 kg 的底座把外界振动旁路到地。
   * 防风罩不是防尘，是防**气流**：0.1 m/s 的气流在 φ240 的极板上产生的
   * 压力 ~0.006 Pa × 0.045 m² = 0.27 mN，是 3.75 mg 静电力（0.037 mN）的 7 倍。
   */
  {
    id: 'plant/micro-balance/column',
    name: 'Microbalance Column', name_zh: '微量天平立柱',
    unit: '件',
    category: 'part',
    props: [
      { param: 'height', kind: 'range', min: 300, max: 400, unit: 'mm' },
      { param: 'volume', kind: 'range', min: 5, max: 10, unit: 'L' },
    ],
  },

  /**
   * **电磁补偿头：AlNiCo 磁铁 + 1000 匝铜线圈 + 铝骨架，力常数 ~25 N/A。**
   *
   * 它是天平的「测力计」：线圈在磁隙里，通电流产生力，把梁拉回零位。
   * 力常数：
   *
   *   F = B·I·L_eff，B = 0.3 T，L_eff = 1000 × π × 30 mm = 94.2 m
   *   → 0.3 × 94.2 = **28.3 N/A**；3.75 mg（火星 13.9 µN）只要 0.49 mA。
   *
   * 线圈用 `mat/copper-wire`（φ0.05，约 40 Ω），骨架用铝（非磁性、导热）。
   * 磁铁用 `std/permanent-magnet-general` 两只（AlNiCo 或铁氧体，0.3 T 量级）。
   * 力常数不靠算，靠 `make/micro-balance` 那一步用砝码标定（见路线）。
   */
  {
    id: 'plant/micro-balance/drive',
    name: 'Microbalance Electromagnetic Compensation Head', name_zh: '微量天平电磁补偿头',
    unit: '件',
    category: 'part',
    props: [
      { param: 'force', kind: 'range', min: 0, max: 50, unit: 'mN' },
      { param: 'current', kind: 'range', min: 0, max: 5, unit: 'mA' },
      { param: 'sensitivity', kind: 'range', min: 20, max: 30, unit: 'N/A' },
    ],
  },

  /**
   * **位置检测与伺服：光电位置传感器 + 两级运放 + 功率级，分辨 0.05 µm。**
   *
   * 梁的零位由一只挡光片 + 一对光电二极管读：挡光片在两只二极管之间，
   * 偏 0.05 µm 就有可分辨的电流差。信号进两级运放（增益 10⁴），
   * 再驱动补偿线圈 —— 这是一个 5 Hz 带宽的闭环。
   *
   * 为什么不用差动变压器：本层有线圈与磁芯，但 5 Hz 的带宽用光电更简单，
   * 而且光电对磁场不敏感（补偿线圈就在旁边）。
   */
  {
    id: 'plant/micro-balance/readout',
    name: 'Microbalance Position Detection and Servo', name_zh: '微量天平位置检测与伺服',
    unit: '件',
    category: 'part',
    props: [
      { param: 'resolution', kind: 'range', min: 0.01, max: 0.1, unit: 'µm', dir: 'atMost' },
      { param: 'bandwidth', kind: 'range', min: 1, max: 10, unit: 'Hz', dir: 'atLeast' },
    ],
  },

  /**
   * **微量天平：12 g 容量、0.05 µg 分辨、0.1 µg 重复性。**
   *
   * 它是电压天平的**力读数器**，也是质量分度的比较器。两个用途对量程的
   * 要求不同，取大的那个：
   *
   *   质量分度  10 g 标准 + 10 只 1 g（替换称量，单边最大 10 g）→ 容量 ≥10 g
   *   力读数    3.75 mg 静电力 + 配重 → 只要 0.1 g 量程，但分辨要 0.05 µg
   *
   * 所以做成 12 g 容量、0.05 µg 分辨。12 g / 0.05 µg = 2.4×10⁸ 分之一，
   * 这是本层最精密的一台机械仪表；它的两条腿是刀口（无间隙）与电磁补偿
   * （把位移变成电流，电流再用标准电阻与 µV 计读）。
   *
   * ⚠️ 0.05 µg 是**分辨**，不是准确度；准确度由砝码组给（20 ppm）。
   * 记录里分开写「分辨 0.05 µg / 重复性 0.1 µg / 线性 1–2 µg」。
   */
  {
    id: 'plant/micro-balance',
    name: 'Microbalance', name_zh: '微量天平',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'capacity', kind: 'range', min: 0, max: 12, unit: 'g' },
      { param: 'readability', kind: 'range', min: 0.05, max: 0.1, unit: 'µg', dir: 'atMost' },
      { param: 'repeatability', kind: 'range', min: 0.1, max: 0.2, unit: 'µg', dir: 'atMost' },
      { param: 'linearity', kind: 'range', min: 1, max: 2, unit: 'µg', dir: 'atMost' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 三、绝对静电计的四件零件
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * **保护环固定电极：内盘 φ200.000 + 保护环 φ200.200/φ240，环隙 0.100 mm。**
   *
   * 它是整个绝对电压的「面积定义件」。保护环与内盘同电位，把内盘边缘的
   * 电场强行拉平 —— 没有保护环，φ200 盘的边缘场会让有效面积差 1 % 量级；
   * 有保护环，有效面积 = 几何面积 + 一个只由环隙/半径定的小修正：
   *
   *   A_g = πr² = 0.0314159 m²
   *   ΔA/A ≈ −g/(2r) = −0.1/200 = **−0.05 %**（−500 ppm）
   *   A_eff = A_g × (1 − 0.0005) = **0.031400 m²**
   *
   * 这个修正值用实测的 g、r 与平面度做二维场解。**修正值本身 −500 ppm
   * 已扣在 A_eff 里**；它的不确定度是 10 ppm。内盘与保护环
   * 分开车、一起研：两块同一次装夹研磨，平面度 0.2 µm、共面 0.2 µm。
   * 环隙用三片 0.100 mm 熔石英垫片定，垫片比环隙本身更好控制。
   *
   * 材料用不锈钢（α = 16 ppm/K，20 °C 下 1 K 走 16 ppm；实际控温到 0.1 K，
   * 修正后 <2 ppm）。不用铝：铝的氧化层与软表面在研磨时会卷边。
   */
  {
    id: 'plant/voltage-balance/guard-plate',
    name: 'Absolute Voltage Balance Guard Ring Fixed Electrode', name_zh: '绝对电压天平保护环固定电极',
    unit: '件',
    category: 'part',
    props: [
      { param: 'diameter', kind: 'range', min: 199.9, max: 200.1, unit: 'mm' },
      { param: 'gap', kind: 'range', min: 0.08, max: 0.12, unit: 'mm' },
      { param: 'flatness', kind: 'range', min: 0, max: 0.3, unit: 'µm', dir: 'atMost' },
      { param: 'area', kind: 'range', min: 0.0312, max: 0.0316, unit: 'm²' },
    ],
  },

  /**
   * **可动电极：φ240 × 0.5 mm 铝盘，平面度 0.2 µm，质量 61 g。**
   *
   * 它比保护环外径（φ240）等大，是为了让固定电极看到的「对面」永远是
   * 一块完整导体 —— 可动盘边缘的场不会漏到内盘上。盘薄（0.5 mm）是为了轻：
   * 61 g 挂在 12 g 容量的天平上要配重，越轻配重越稳。
   *
   * 铝的天然氧化层 4 nm 是介电层，但它在 1 mm 气隙里只占 4 nm/9 ≈ 0.4 nm
   * 等效空气 —— 对 278 pF 的电容是 0.4 ppm，忽略。真正要防的是铝盘在
   * 研磨时的卷边：用 0.5 mm 厚盘 + 背面加强筋，研完再校平。
   */
  {
    id: 'plant/voltage-balance/movable-plate',
    name: 'Absolute Voltage Balance Movable Electrode', name_zh: '绝对电压天平可动电极',
    unit: '件',
    category: 'part',
    props: [
      { param: 'diameter', kind: 'range', min: 230, max: 250, unit: 'mm' },
      { param: 'flatness', kind: 'range', min: 0, max: 0.3, unit: 'µm', dir: 'atMost' },
      { param: 'mass', kind: 'range', min: 0.04, max: 0.08, unit: 'kg' },
    ],
  },

  /**
   * **间隙微调：差动丝杠 + 研磨导轨，行程 0–3 mm，分辨 0.1 µm。**
   *
   * 间隙 d 是 V 的**一阶项**（V ∝ d），所以 1 mm 的间隙要读到 20 nm 才有
   * 20 ppm。差动丝杠：粗调 0.5 mm/转、微调 0.45 mm/转，差 0.05 mm/转；
   * 手柄 100 mm、刻度 500 格 → 每格 0.1 µm。导轨面研到 1 µm/100 mm，
   * 走 3 mm 的直线度 0.03 µm。
   *
   * 间隙的**绝对**值不靠丝杠刻度，靠激光干涉仪在三个点上直接量
   * （`plant/laser-stage` 的 20 nm 读数 + `plant/refractometer` 的折射率修正）。
   * 丝杠只负责「走到差不多」，读数负责「到底多少」。
   */
  {
    id: 'plant/voltage-balance/gap-drive',
    name: 'Absolute Voltage Balance Gap Fine Adjustment', name_zh: '绝对电压天平间隙微调',
    unit: '件',
    category: 'part',
    props: [
      { param: 'range', kind: 'range', min: 0, max: 3, unit: 'mm' },
      { param: 'resolution', kind: 'range', min: 0.05, max: 0.2, unit: 'µm', dir: 'atMost' },
      { param: 'straightness', kind: 'range', min: 0, max: 1, unit: 'µm/100mm', dir: 'atMost' },
    ],
  },

  /**
   * **基座与屏蔽罩：60 kg 铸铁基座 + 铝屏蔽 + 氧化铝高压套管 + 玻璃窗。**
   *
   * 三件事装在一件里：
   *
   *   ① 基座：60 kg 铸铁，把 13.9 µN 的静电力与地面振动隔开；
   *   ② 屏蔽：铝罩接地，罩内电场只由两块电极定，外界 50 Hz 干扰进不来；
   *   ③ 高压引入：氧化铝套管 10 kV、泄漏 <1 pA —— 10 V 下 1 pA 是 10 TΩ，
   *      比电极间 278 pF 在 10 Hz 下的阻抗（57 MΩ）大 1.75×10⁵ 倍，不加载。
   *
   * 玻璃窗是给激光干涉仪留的：三个测隙点要从罩外打进去。
   */
  {
    id: 'plant/voltage-balance/base-shield',
    name: 'Absolute Voltage Balance Base and Shield Cover', name_zh: '绝对电压天平基座与屏蔽罩',
    unit: '件',
    category: 'part',
    props: [
      { param: 'mass', kind: 'range', min: 40, max: 80, unit: 'kg' },
      { param: 'voltage', kind: 'range', min: 0, max: 10000, unit: 'V', dir: 'atLeast' },
      { param: 'leakage', kind: 'range', min: 0, max: 1, unit: 'pA', dir: 'atMost' },
    ],
  },

  /**
   * **绝对电压天平（保护环静电计）：1–20 V、间隙 0.2–2 mm、31 ppm。**
   *
   * 它是本文件的主角。10 V 档的力是 13.9 µN（火星上 3.75 mg），
   * 用 `plant/micro-balance` 读；极板 φ200、间隙 1 mm、电容 278 pF。
   *
   * 为什么量程上限只到 20 V：力 ∝ V²，20 V 时 15 mg，天平仍在线性段；
   * 再高（100 V 时 375 mg）极板会吸合，且 1 mm 间隙的场到 100 kV/m，
   * 火星 0.6 kPa 下的帕邢击穿余量不够。要测高压得另建大间隙/大质量版本，
   * 不在本文件里。
   *
   * 为什么下限 1 V：1 V 时力 37.5 µg，0.05 µg 分辨是 1300 ppm，
   * 已经不能直接测；1 V 以下走 10:1 分压从 10 V 档传（见测量路线）。
   */
  {
    id: 'plant/voltage-balance',
    name: 'Absolute Voltage Balance', name_zh: '绝对电压天平',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'measure/voltage', kind: 'range', min: 0.5, max: 20, unit: 'V' },
      { param: 'gap', kind: 'range', min: 0.2, max: 2, unit: 'mm' },
      { param: 'force', kind: 'range', min: 0.5, max: 50, unit: 'mg' },
      { param: 'uncertainty', kind: 'range', min: 20, max: 40, unit: 'ppm', dir: 'atMost' },
      { param: 'measure/capacitance', kind: 'range', min: 100, max: 400, unit: 'pF' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 四、可逆摆的三件零件
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * **摆杆：熔石英管 φ12 × 1000 mm，热膨胀 0.5 ppm/K。**
   *
   * 摆长 L 是 g 的一阶项（g ∝ L），1 m 的杆要 1 ppm 就是 1 µm。
   * 钢的 α = 11 ppm/K，0.1 K 就是 1.1 ppm；熔石英 0.5 ppm/K，0.1 K 只有
   * 0.05 ppm —— 这一项不是「更好」，是「让温度退出 g 的误差预算」。
   *
   * 熔石英管从 `mat/quartz-pure` 在玻璃车床上拉出来（1900–2200 °C），
   * 退火后磨外圆；两端装刀口座，座与管的连接用锥面 + 环氧，不靠螺纹
   * （螺纹的 10 µm 间隙会让 L 变）。
   */
  {
    id: 'plant/gravity-pendulum/rod',
    name: 'Reversible Pendulum Rod', name_zh: '可逆摆摆杆',
    unit: '件',
    category: 'part',
    props: [
      { param: 'length', kind: 'range', min: 0.95, max: 1.05, unit: 'm' },
      { param: 'tempco', kind: 'range', min: 0, max: 1, unit: 'ppm/K', dir: 'atMost' },
      { param: 'straightness', kind: 'range', min: 0, max: 0.2, unit: 'mm', dir: 'atMost' },
    ],
  },

  /**
   * **摆的刀口：GCr15，两对，刃半径 1–3 µm，间距 1.000 m。**
   *
   * 可逆摆（Kater）要两对刀口：正挂、倒挂各一次，两次周期相等时
   * 等效摆长就是两刀口的间距 —— **不需要知道摆锤的转动惯量**。
   * 这是 1817 年 Kater 的办法，也是本层能不用「测惯量」就测 g 的原因。
   *
   * 两对刃口的间距 1.000 m 由 `plant/comparator` + 量块量到 1 µm（1 ppm）。
   */
  {
    id: 'plant/gravity-pendulum/knife-edge',
    name: 'Reversible Pendulum Knife Edge', name_zh: '可逆摆摆的刀口',
    unit: '件',
    category: 'part',
    props: [
      { param: 'edgeRadius', kind: 'range', min: 0.5, max: 3, unit: 'µm' },
      { param: 'hardness', kind: 'range', min: 58, max: 65, unit: 'HRC', dir: 'atLeast' },
      { param: 'length', kind: 'range', min: 30, max: 50, unit: 'mm' },
    ],
  },

  /**
   * **摆锤与支架：3 kg 铜摆锤 + 15 kg HT250 支架。**
   *
   * 摆锤要重、要轴对称：3 kg 铜（密度 8.96）车成 φ80 × 68 mm 的圆柱，
   * 质心在几何中心。摆锤越重，空气阻尼与支座摩擦的相对影响越小；
   * 但太重会把刀口压出印子（比压 >300 MPa），3 kg 是折中。
   *
   * 支架 15 kg 铸铁，三脚调平；刀口座与支架的接触面研过，保证两次
   * 正倒挂的刀口落点一致。
   */
  {
    id: 'plant/gravity-pendulum/body',
    name: 'Reversible Pendulum Bob and Support', name_zh: '可逆摆摆锤与支架',
    unit: '件',
    category: 'part',
    props: [
      { param: 'mass', kind: 'range', min: 2, max: 20, unit: 'kg' },
      { param: 'height', kind: 'range', min: 1.2, max: 1.5, unit: 'm' },
    ],
  },

  /**
   * **可逆摆：L = 1.000000 m，T = 3.262 s（火星 g = 3.71），g 的 25 ppm。**
   *
   * 火星 g = 3.71 时，1 m 摆的周期 T = 2π√(L/g) = **3.262 s**；
   * 1000 个周期 3262 s。石英时基 10 ppm → 周期的 10 ppm →
   * g 的 20 ppm；摆长 1 ppm；振幅残差 0.06 ppm；浮力 2 ppm；刀口摩擦 5 ppm
   * → 方和根 **20.7 ppm**，取 **25 ppm**（1.2 倍余量）。
   *
   * 为什么不用自由落体：自由落体要 1 m 的真空管 + 20 nm 的干涉测高，
   * 而且下落时间 0.73 s 的计时误差与释放机构同步误差都在 10 ppm 量级；
   * 摆可以反复测 1000 个周期，把随机误差平均掉，系统误差只剩时基。
   */
  {
    id: 'plant/gravity-pendulum',
    name: 'Reversible Pendulum', name_zh: '可逆摆',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'length', kind: 'range', min: 0.95, max: 1.05, unit: 'm' },
      { param: 'period', kind: 'range', min: 3.2, max: 3.4, unit: 's' },
      { param: 'measure/gravity', kind: 'range', min: 3.6, max: 3.8, unit: 'm/s²' },
      { param: 'uncertainty', kind: 'range', min: 20, max: 30, unit: 'ppm', dir: 'atMost' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 五、记录条目
  // ═══════════════════════════════════════════════════════════════════════════

];

export const VOLTAGE_ANCHOR_ROUTES: readonly Route[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // 一、质量锚：硅球 + 砝码组
  // ═══════════════════════════════════════════════════════════════════════════

  {
    /**
     * **10 g 单晶硅球：切块 → 粗磨球 → 精研/抛光 → 测径 → 算质量。**
     *
     *   单晶硅 0.05 kg → 硅球 1 只（10.0000 g）
     *
     * 五道工序，每道回答一个「凭什么」：
     *
     *   ① **切块**：从 φ100 单晶棒上切 20×20×22 mm 的块。用线锯，不用砂轮 ——
     *      砂轮的冲击在硅里留微裂纹，后面抛光时裂纹会扩展成凹坑。
     *   ② **粗磨球**：杯形金刚石砂轮 + 双转子研磨，先把方块磨成球坯
     *      （球度 5–10 µm）。这一步只去形状，不追尺寸。
     *   ③ **精研/抛光**：5 轴抛光机带软质抛光模，W1 金刚石 + CeO₂ 抛光液，
     *      球度到 0.1 µm。抛光模要定期修整 —— 模子的形状会复制到球上。
     *   ④ **稳定化**：抛光后在 19–21 °C 放 72 h，让表面应力与吸附层稳定。
     *   ⑤ **测径**：激光干涉仪在 5 个方向上量直径，每个方向转 3 个角度，
     *      取平均；20 nm 读数，5 个方向平均到 10 nm。折射率用
     *      `plant/refractometer` 修正：20 mm 上 (n−1)d = 50.8 nm = 2.5 ppm，
     *      修正到 0.1 ppm。
     *
     * 质量：ρ(25 °C) = 2.3290 g/cm³；ρ(20 °C) = 2.329091 g/cm³；
     * V = πD³/6 = 4.2935 cm³；m = **10.0000 g**；不确定度 20 ppm
     * （密度 10 + 球度 15 + 直径 0.5）。
     *
     * ⚠️ 球度 0.1 µm 是**设计值**：5 轴抛光机的定位是 1 µm，但球度由
     * 抛光模与对研决定，不由机床定位决定。第一批要实测 5 个方向的直径，
     * 若极差 >0.2 µm 就退回重抛。
     */
    id: 'make/mass-standard-10g-si',
    name: '10 g Single-Crystal Silicon Sphere Manufacturing', name_zh: '10 g 单晶硅球制造',
    rate: { hours: q(72) },
    produces: [
      {
        item: 'std/mass-standard-10g-si',
        qty: q(1),
        gives: [
          { param: 'mass', kind: 'range', min: 0.0099998, max: 0.0100002 },
          { param: 'diameter', kind: 'range', min: 20.1652, max: 20.1654 },
          { param: 'sphericity', kind: 'range', min: 0.05, max: 0.15 },
          { param: 'tolerance', kind: 'range', min: 15, max: 20 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/silicon-single', qty: q(1, 20) }] }],
    needs: ['plant/metrology-room', 'plant/stabilized-laser', 'plant/refractometer'],
    steps: [
      {
        note_zh: '切块：φ100 单晶棒上切 20×20×22 mm 块（线锯，留 2 mm 余量；砂轮冲击会留微裂纹）',
        performedBy: 'plant/wire-saw',
      },
      {
        note_zh: '粗磨球：杯形金刚石砂轮 + 双转子研磨，方块磨成球坯，球度 5–10 µm',
        performedBy: 'plant/grinder',
      },
      {
        note_zh: '精研/抛光：5 轴抛光机 + 软质抛光模，W1 金刚石 + CeO₂ 抛光液，球度 0.1 µm；抛光模定期修整',
        performedBy: 'plant/cnc-polisher-5axis',
      },
      {
        note_zh: '稳定化：19–21 °C 放 72 h，表面应力与吸附层稳定后再测',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '测径：激光干涉仪 5 个方向 × 3 个角度，取平均到 10 nm；折射率用 refractometer 修正（20 mm 上 2.5 ppm）',
        performedBy: 'plant/laser-stage',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '算质量与写证书：V = πD³/6、ρ(20 °C) = 2.329091 g/cm³、m = 10.0000 g；证书写直径、球度、密度来源与 20 ppm 不确定度',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '单晶硅 0.05 kg → 硅球 1 只（0.010 kg）；0.040 kg 是套料、磨球与抛光的损失（硅屑可回炉，抛光液里的硅不收）。产物按件计，不进 kg 守恒。密度 2.3290 g/cm³（25 °C，天然硅同位素分散 10 ppm）；球度 0.1 µm、直径 20.1653 mm、质量 10.0000 g 是设计值，实测走测径那一步的记录',
  },

  {
    /**
     * **40 只砝码组：10 g → 1 g → 100 mg → 10 mg → 1 mg，四代二分。**
     *
     *   不锈钢 0.02 kg → 砝码 40 只（合计 11.11 g）
     *
     * 分度不靠杠杆，靠**数个数**：
     *
     *   10 只 1 g 的和  vs  10 g 标准   → 每只平均偏差 = 差/10
     *   10 只 100 mg 的和 vs 1 只 1 g  → 每只平均偏差 = 差/10
     *   10 只 10 mg 的和  vs 1 只 100 mg → …
     *   10 只 1 mg 的和   vs 1 只 10 mg  → …
     *
     * 每代用替换称量（先放标准、去皮；再放 10 只、读差），天平只当比较器，
     * 不需要 10:1 的臂比。每代的**绝对**误差 = 上一代绝对误差/10 + 和差/10
     * + 单只配对差；10 g 标准的 20 ppm 是**相对**值，分度不会把它变小 ——
     * 四代后 1 mg 单只仍是 20 ppm + 每代 0.5–1 ppm ≈ 22–24 ppm。
     *
     * 为什么是 40 只：10 的幂分度每代要 10 只，四代就是 40 只，一只都不能少
     * （少了就有一代凑不出「10 只的和」）。
     *
     * ⚠️ 砝码要磨/研到名义值 ±5 % 以内再定值：车出来的 1 g 砝码直径公差
     * 0.01 mm 就是 2 %，不定值不能用。定值后每只刻编号，证书逐只写。
     */
    id: 'make/mass-weight-set-mg',
    name: 'Milligram-Level Weight Set Manufacturing', name_zh: '毫克级砝码组制造',
    rate: { hours: q(120) },
    produces: [
      {
        item: 'std/mass-weight-set-mg',
        qty: q(1),
        gives: [
          { param: 'mass', kind: 'range', min: 0.000001, max: 0.001 },
          { param: 'tolerance', kind: 'range', min: 20, max: 25 },
          { param: 'pieces', kind: 'range', min: 40, max: 40 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(1, 50) }] }],
    needs: ['plant/metrology-room', 'std/mass-standard-10g-si'],
    steps: [
      {
        note_zh: '车 40 只砝码坯：10×1 g、10×100 mg、10×10 mg、10×1 mg；每只留 5 % 研磨余量',
        performedBy: 'lathe',
      },
      {
        note_zh: '磨/研到名义值 ±5 %：外圆与端面用研磨套，逐只称重粗分',
        performedBy: 'plant/grinder',
      },
      {
        note_zh:
          '10 g → 1 g：10 只 1 g 的和 vs 10 g 标准，替换称量；读和差后逐只两两配对，定每只 1 g 的值（判据 20 ppm）',
        performedBy: 'plant/micro-balance',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '1 g → 100 mg → 10 mg → 1 mg：同法逐代二分；每代用上一代的 1 只作标准，10 只求和，配对差进证书',
        performedBy: 'plant/micro-balance',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '写证书：40 只逐只编号、质量、相对 10 g 标准的偏差与 20 ppm 不确定度；1 mg 那 10 只单列',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '不锈钢 0.02 kg → 砝码 40 只（合计 11.11 g）；0.0089 kg 是车屑、磨屑与研磨余量（不锈钢可回炉）。产物按套计，不进 kg 守恒。10 g 标准 20 ppm；四代二分后 1 mg 单只 ≤22–24 ppm，取 25 ppm 窗口',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 二、微量天平：五件零件 + 总装
  // ═══════════════════════════════════════════════════════════════════════════

  {
    /**
     * **天平梁：下料 → 铣刀口槽 → 72 h 时效 → 磨/研 → 测直线度。**
     *
     *   铝 0.5 kg → 梁 1 件（0.3 kg）
     *
     * 梁的几何只要求「两端刀口槽平行、槽底在同一平面」，不要求臂长比 ——
     * 静电力与配重砝码挂同一端，臂长不进公式。所以工序的重点是时效与
     * 刀口槽的平行度，不是称重。
     *
     * 72 h 时效：粗铣后铝梁里有 0.02–0.05 mm 的残余应力，放 72 h 再精铣，
     * 否则装好后梁会慢慢弯，零点每天漂几个 µg。
     */
    id: 'make/micro-balance-beam',
    name: 'Microbalance Beam Manufacturing', name_zh: '微量天平横梁制造',
    rate: { hours: q(24) },
    produces: [
      {
        item: 'plant/micro-balance/beam',
        qty: q(1),
        gives: [
          { param: 'length', kind: 'range', min: 250, max: 250 },
          { param: 'straightness', kind: 'range', min: 0.02, max: 0.03 },
          { param: 'mass', kind: 'range', min: 0.29, max: 0.31 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/aluminium', qty: q(1, 2) }] }],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '下料 260×30×8 mm 铝板，铣两端刀口槽（槽宽 3 mm、深 4 mm）', performedBy: 'plant/milling-machine' },
      {
        note_zh: '72 h 时效：粗铣后放 19–21 °C，残余应力释放，再精铣槽底',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      { note_zh: '磨/研槽底与梁面：槽底共面 0.02 mm，梁面 Ra 1.6', performedBy: 'plant/grinder' },
      {
        note_zh: '测直线度与槽距：比较仪 + 量块，两端槽中心线在 0.02 mm 内；称重 0.30 kg',
        performedBy: 'plant/comparator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '铝 0.5 kg → 梁 1 件（0.30 kg）；0.20 kg 是铣屑、磨屑与下料余量（铝可回炉）。产物按件计，不进 kg 守恒',
  },

  {
    /**
     * **天平刀口：车坯 → 淬火/回火 → 磨刃 → 研刃/检。**
     *
     *   轴承钢 0.01 kg → 刀口 1 套（两对，4 条刃）
     *
     * GCr15 淬火 830–860 °C、回火 160–180 °C，硬度 60–64 HRC；
     * 刃口用 W1 金刚石膏在铸铁盘上轻研到半径 1–3 µm。
     *
     * 刃口半径的判据不是「越小越好」：太小比压高、易崩；太钝零位迟钝。
     * 1–3 µm 对应 120 g 负载下 200 MPa 的比压，GCr15 的屈服 1700 MPa，
     * 有 8 倍余量。
     */
    id: 'make/micro-balance-knife-edge',
    name: 'Microbalance Knife Edge Manufacturing', name_zh: '微量天平刀口制造',
    rate: { hours: q(16) },
    produces: [
      {
        item: 'plant/micro-balance/knife-edge',
        qty: q(1),
        gives: [
          { param: 'edgeRadius', kind: 'range', min: 1, max: 3 },
          { param: 'hardness', kind: 'range', min: 60, max: 64 },
          { param: 'length', kind: 'range', min: 40, max: 40 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/bearing-steel', qty: q(1, 100) }] }],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '车 4 条刀口坯（40×8×6 mm），留 0.3 mm 磨量', performedBy: 'lathe' },
      {
        note_zh: '淬火 830–860 °C、回火 160–180 °C，硬度 60–64 HRC',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 830, max: 860 }],
      },
      { note_zh: '磨刃：氧化铝粗磨、W1 金刚石精磨，刃半径 1–3 µm', performedBy: 'plant/grinder' },
      {
        note_zh: '研刃与检：铸铁盘上轻研去毛刺；比较仪看刃口直线度 ≤0.01 mm，显微镜看刃半径',
        performedBy: 'plant/comparator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '轴承钢 0.01 kg → 刀口 1 套（4 条，约 0.008 kg）；0.002 kg 是车屑、磨屑与研磨余量。产物按套计，不进 kg 守恒',
  },

  {
    /**
     * **立柱、底座与防风罩：浇铸 → 铣/车 → 装玻璃罩 → 检。**
     *
     *   铸铁 8 + 玻璃 2 + 酚醛 0.2 = 10.2 kg → 立柱 1 件（9.5 kg）
     *
     * 底座 8 kg 是**振动旁路**：0.05 µg 的力对应 1.3×10⁻¹⁰ m/s²，
     * 地板振动（1–10 Hz、µm 级）会把梁晃掉；8 kg 的底座把振动导到地，
     * 梁只看到底座与刀口之间的相对运动。
     *
     * 玻璃罩 8 L 防的是气流：0.1 m/s 的气流在 φ240 极板上产生 0.27 mN，
     * 是 3.75 mg 静电力的 7 倍 —— 不罩，测的不是静电力。
     */
    id: 'make/micro-balance-column',
    name: 'Microbalance Column Manufacturing', name_zh: '微量天平立柱制造',
    rate: { hours: q(24) },
    produces: [
      {
        item: 'plant/micro-balance/column',
        qty: q(1),
        gives: [
          { param: 'height', kind: 'range', min: 350, max: 350 },
          { param: 'volume', kind: 'range', min: 8, max: 8 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(8) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(2) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1, 5) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '浇铸底座 300×300×80 mm（HT250），时效 24 h',
        performedBy: 'plant/melting-furnace',
        under: [{ param: 'temperature', min: 1300, max: 1500 }],
      },
      { note_zh: '铣底座平面（300×300）与立柱安装面', performedBy: 'plant/milling-machine' },
      { note_zh: '车立柱 φ40×350，立柱与底座配刮', performedBy: 'lathe' },
      { note_zh: '装玻璃防风罩（8 L、三面玻璃 + 酚醛框），接缝涂酚醛胶', performedBy: 'plant/robot' },
      {
        note_zh: '检：底座平面度 0.05 mm、立柱垂直度 0.1 mm/m；罩内无气流（香烟烟雾看 1 min 不散）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '铸铁 8 + 玻璃 2 + 酚醛 0.2 = 10.2 kg → 立柱 1 件（9.5 kg）；0.7 kg 是浇冒口、铣屑与玻璃边角（铸铁/玻璃可回炉）。产物按件计，不进 kg 守恒',
  },

  {
    /**
     * **电磁补偿头：绕线圈 → 装磁铁/极靴 → 测力常数初值 → 老化。**
     *
     *   磁铁 2 + 铜线 0.01 + 铝 0.1 + 薄钢板 1 = 1.11 kg → 补偿头 1 件（0.8 kg）
     *
     * 线圈 1000 匝 φ0.05 铜线绕在铝骨架上，直流电阻约 40 Ω；
     * 磁隙 0.3 T 时力常数 28.3 N/A（F = B·I·L_eff，L_eff = 1000×π×30 mm）。
     *
     * 力常数的**绝对值**不在这一条路线里定 —— 这里只测「通 1 mA 有多少力」
     * 的初值（用 1 g 试重 + 梁），最终由 `make/micro-balance` 用砝码组标定。
     */
    id: 'make/micro-balance-drive',
    name: 'Microbalance Electromagnetic Compensation Head Manufacturing', name_zh: '微量天平电磁补偿头制造',
    rate: { hours: q(16) },
    produces: [
      {
        item: 'plant/micro-balance/drive',
        qty: q(1),
        gives: [
          { param: 'force', kind: 'range', min: 0, max: 50 },
          { param: 'current', kind: 'range', min: 0, max: 5 },
          { param: 'sensitivity', kind: 'range', min: 25, max: 28 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/permanent-magnet-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room', 'std/dvm-general'],
    steps: [
      { note_zh: '绕线圈：1000 匝 φ0.05 铜线绕铝骨架（φ30×20），层间涂酚醛固定', performedBy: 'plant/winder' },
      { note_zh: '装两只磁铁与软铁极靴，磁隙 3 mm；线圈居中，径向间隙 0.5 mm', performedBy: 'plant/robot' },
      {
        note_zh: '测电阻与力常数初值：电阻 40±2 Ω；1 mA 下用 1 g 试重看梁偏，估 25–28 N/A',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '老化：通 1 mA 连续 24 h，电阻变化 ≤0.5 %、线圈不松动',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '磁铁 2 只 + 铜线 0.01 + 铝 0.1 + 薄钢板 1 = 1.11 kg（按件与 kg 混计）→ 补偿头 1 件（0.8 kg）；0.31 kg 是铝屑、钢板边角与绕线头。产物按件计，不进 kg 守恒',
  },

  {
    /**
     * **位置检测与伺服：装光电传感器 → 装伺服放大 → 调零/带宽。**
     *
     *   光电二极管 2 + 运放 4 + 功率管 2 + 排阻 2 + 薄钢板 1 + 铜线 0.01
     *   → 读出 1 件（0.9 kg）
     *
     * 挡光片在两只光电二极管之间，偏 0.05 µm 就有可分辨的电流差；
     * 两级运放增益 10⁴，驱动补偿线圈，闭环带宽 5 Hz。
     *
     * 为什么不用斩波：斩波器有运动件，会把 0.05 µm 的机械噪声引进来；
     * 光电对磁场不敏感（线圈就在旁边），直流耦合 + 低漂移运放更安静。
     */
    id: 'make/micro-balance-readout',
    name: 'Microbalance Position Detection and Servo Manufacturing', name_zh: '微量天平位置检测与伺服制造',
    rate: { hours: q(24) },
    produces: [
      {
        item: 'plant/micro-balance/readout',
        qty: q(1),
        gives: [
          { param: 'resolution', kind: 'range', min: 0.05, max: 0.08 },
          { param: 'bandwidth', kind: 'range', min: 5, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/photodiode-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(4) }] },
      { anyOf: [{ item: 'std/power-device-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/resistor-network-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 100) }] },
    ],
    needs: ['plant/metrology-room', 'std/dvm-general'],
    steps: [
      { note_zh: '装挡光片与两只光电二极管（间距 0.2 mm），屏蔽盒接地', performedBy: 'plant/robot' },
      { note_zh: '装两级运放（10⁴）与功率级，驱动补偿线圈；零位用电位器调', performedBy: 'plant/robot' },
      {
        note_zh: '调零/带宽：输入短路看 10 min 漂移 ≤0.02 µg；阶跃看 5 Hz 带宽、无自激',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '光电二极管 2 + 运放 4 + 功率管 2 + 排阻 2 + 薄钢板 1 + 铜线 0.01 → 读出 1 件（0.9 kg）；余是屏蔽盒边角与引线头。产物按件计，不进 kg 守恒',
  },

  {
    /**
     * **微量天平总装：梁/刀口 → 立柱/罩 → 补偿头/读出 → 调零/重复性 → 线性。**
     *
     *   梁 0.3 + 刀口 0.008 + 立柱 9.5 + 补偿头 0.8 + 读出 0.9 = 11.5 kg
     *   → 微量天平 1 台
     *
     * 五道工序：
     *
     *   ① **装梁/刀口**：梁两端刀口槽坐在两对刀口上，调水平；刀口座与立柱
     *      之间加 0.05 mm 铜垫，压紧后不许有间隙。
     *   ② **装立柱/罩**：立柱垂直度 0.1 mm/m；玻璃罩与底座之间垫 3 mm 毛毡，
     *      隔振动也隔气流。
     *   ③ **装补偿头/读出**：线圈在磁隙中心，挡光片在两只二极管中间；
     *      线圈引线用 0.1 mm 铜线，软引线不留力矩。
     *   ④ **调零/重复性**：空载调零，放 1 g 试重 10 次，读数的极差 ≤0.2 µg；
     *      这是「重复性」的验收，不是准确度。
     *   ⑤ **线性**：1 g / 2 g / 5 g / 10 g 四点，最小二乘残差 ≤2 µg。
     *
     * ⚠️ 这一条路线**不标定力常数的绝对值** —— 那要用砝码组，而砝码组
     * 又用这台天平分度。所以力常数标定放在 `measure/voltage-absolute` 的
     * 「标定微天平」一步：先用 10 g 标准 + 砝码组把天平读数变成 mg，
     * 再用同一读数称静电力。顺序不能反。
     */
    id: 'make/micro-balance',
    name: 'Microbalance Final Assembly', name_zh: '微量天平总装',
    rate: { hours: q(48) },
    produces: [
      {
        item: 'plant/micro-balance',
        qty: q(1),
        gives: [
          { param: 'capacity', kind: 'range', min: 0, max: 12 },
          { param: 'readability', kind: 'range', min: 0.05, max: 0.08 },
          { param: 'repeatability', kind: 'range', min: 0.1, max: 0.2 },
          { param: 'linearity', kind: 'range', min: 1, max: 2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/micro-balance/beam', qty: q(1) }] },
      { anyOf: [{ item: 'plant/micro-balance/knife-edge', qty: q(1) }] },
      { anyOf: [{ item: 'plant/micro-balance/column', qty: q(1) }] },
      { anyOf: [{ item: 'plant/micro-balance/drive', qty: q(1) }] },
      { anyOf: [{ item: 'plant/micro-balance/readout', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room', 'plant/comparator', 'std/dvm-general'],
    steps: [
      {
        note_zh: '装梁与刀口：梁两端槽坐在两对刀口上，调水平；刀口座下垫 0.05 mm 铜垫，压紧无间隙',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装立柱与玻璃罩：立柱垂直度 0.1 mm/m，罩底垫 3 mm 毛毡隔振隔气流',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装补偿头与读出：线圈在磁隙中心、挡光片在两只二极管中间；0.1 mm 软引线不留力矩',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '调零与重复性：空载调零；1 g 试重放 10 次，极差 ≤0.2 µg；零点 10 min 漂移 ≤0.02 µg',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '线性：1/2/5/10 g 四点，最小二乘残差 ≤2 µg；超差查刀口与磁隙',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '梁 0.3 + 刀口 0.008 + 立柱 9.5 + 补偿头 0.8 + 读出 0.9 = 11.5 kg → 微量天平 1 台；产物按台计，不进 kg 守恒。容量 12 g、分辨 0.05 µg、重复性 0.1–0.2 µg、线性 1–2 µg 是装配验收值（设计值），力常数的绝对值在 measure/voltage-absolute 里用砝码组标定',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 三、绝对静电计：四件零件 + 总装
  // ═══════════════════════════════════════════════════════════════════════════

  {
    /**
     * **保护环固定电极：车内外盘 → 研磨共面 → 装绝缘子/垫片 → 测几何。**
     *
     *   不锈钢 3 + 氧化铝绝缘子 3 只 → 固定电极 1 件（2.7 kg）
     *
     * 内盘 φ200.000、保护环内径 φ200.200、外径 φ240 —— 环隙 0.100 mm
     * 由三片熔石英垫片定，不靠车床切槽（0.1 mm 的槽车不出来，但 0.1 mm
     * 的垫片磨得出来）。内盘与保护环分开车，再一起装在研具上对研：
     * 两块同一次研磨，共面 0.2 µm。
     *
     * 面积：A = π(0.1)² = 0.0314159 m²。保护环修正 −g/(2r) = −0.05 %，
     * 由实测 g、r 与平面度做场解，算到 10 ppm。
     *
     * 为什么用不锈钢不用铝：铝软，研磨时边缘卷边 1–2 µm，正好是 10 ppm
     * 级的面积误差；不锈钢（1.4301）硬度高、研磨边缘干净。
     */
    id: 'make/voltage-balance-guard-plate',
    name: 'Absolute Voltage Balance Guard Ring Fixed Electrode Manufacturing', name_zh: '绝对电压天平保护环固定电极制造',
    rate: { hours: q(40) },
    produces: [
      {
        item: 'plant/voltage-balance/guard-plate',
        qty: q(1),
        gives: [
          { param: 'diameter', kind: 'range', min: 200.0, max: 200.0 },
          { param: 'gap', kind: 'range', min: 0.1, max: 0.1 },
          { param: 'flatness', kind: 'range', min: 0.15, max: 0.25 },
          { param: 'area', kind: 'range', min: 0.03141, max: 0.03142 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(3) }] },
      { anyOf: [{ item: 'std/alumina-insulator-general', qty: q(3) }] },
    ],
    needs: ['plant/metrology-room', 'plant/comparator/lapping-plate'],
    steps: [
      {
        note_zh: '车内盘 φ200.000×12 mm 与保护环（内 φ200.200、外 φ240），留 0.05 mm 研磨量',
        performedBy: 'lathe',
      },
      {
        note_zh: '对研：内盘与保护环同装研具，三块对研法研到平面度 0.2 µm、共面 0.2 µm',
        performedBy: 'plant/grinder',
      },
      {
        note_zh: '装绝缘子与三片 0.100 mm 熔石英垫片定环隙；内盘、保护环分别引线，绝缘 ≥10 GΩ',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '测几何：比较仪 + 量块量内盘直径（5 点）、环隙（3 点）、平面度；A = πr²、修正 −g/(2r) = −0.05 % 进场解',
        performedBy: 'plant/comparator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '不锈钢 3 + 氧化铝绝缘子 3 只 → 固定电极 1 件（2.7 kg）；0.3 kg 是车屑、研磨余量与绝缘子边角。产物按件计，不进 kg 守恒。几何面积 0.031416 m²、有效面积 0.031400 m²（环隙 0.100 mm，修正 −0.05 %，其不确定度 10 ppm）是设计值',
  },

  {
    /**
     * **可动电极：车盘/加强筋 → 研磨 → 装吊挂 → 测平面度/质量。**
     *
     *   铝 1 kg → 可动电极 1 件（0.061 kg）
     *
     * φ240×0.5 mm 铝盘，背面三条加强筋（厚 2 mm），质量 61 g。
     * 盘比保护环外径大 0 mm（等大），保证固定电极看到的「对面」完整。
     *
     * 0.5 mm 铝盘在研磨时会卷边，所以先车到 0.6 mm、装加强筋、再研到 0.5 mm；
     * 研完用比较仪在 5 点看平面度，边缘不许翘 >0.1 µm。
     */
    id: 'make/voltage-balance-movable-plate',
    name: 'Absolute Voltage Balance Movable Electrode Manufacturing', name_zh: '绝对电压天平可动电极制造',
    rate: { hours: q(16) },
    produces: [
      {
        item: 'plant/voltage-balance/movable-plate',
        qty: q(1),
        gives: [
          { param: 'diameter', kind: 'range', min: 240.0, max: 240.0 },
          { param: 'flatness', kind: 'range', min: 0.15, max: 0.25 },
          { param: 'mass', kind: 'range', min: 0.06, max: 0.062 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/aluminium', qty: q(1) }] }],
    needs: ['plant/metrology-room', 'plant/comparator/lapping-plate'],
    steps: [
      { note_zh: '车 φ240×0.6 mm 铝盘与背面三条加强筋，留 0.1 mm 研磨量', performedBy: 'lathe' },
      { note_zh: '研磨工作面到 0.5 mm、平面度 0.2 µm；边缘翘曲 ≤0.1 µm', performedBy: 'plant/grinder' },
      {
        note_zh: '装三点吊挂（φ0.3 铜丝，长 300 mm）与中心配重螺孔；吊挂点与质心对齐',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '测平面度（5 点）与质量（61 g）；超差重研或换盘',
        performedBy: 'plant/comparator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '铝 1 kg → 可动电极 1 件（0.061 kg）；0.939 kg 是车屑、铣加强筋与研磨余量（铝可回炉）。产物按件计，不进 kg 守恒',
  },

  {
    /**
     * **间隙微调：车差动丝杠/导轨 → 淬火/回火 → 磨/研 → 装配/测分辨。**
     *
     *   轴承钢 1 + 45 钢 2 = 3 kg → 间隙驱动 1 件（2.5 kg）
     *
     * 差动丝杠：粗调 0.5 mm/转、微调 0.45 mm/转，差 0.05 mm/转；
     * 手柄 100 mm、刻度 500 格 → 每格 0.1 µm。导轨面研到 1 µm/100 mm，
     * 走 3 mm 的直线度 0.03 µm。
     *
     * 丝杠只负责「走到差不多」；间隙的绝对值由激光干涉仪在三个点上直接量。
     */
    id: 'make/voltage-balance-gap-drive',
    name: 'Absolute Voltage Balance Gap Fine Adjustment Manufacturing', name_zh: '绝对电压天平间隙微调制造',
    rate: { hours: q(40) },
    produces: [
      {
        item: 'plant/voltage-balance/gap-drive',
        qty: q(1),
        gives: [
          { param: 'range', kind: 'range', min: 0, max: 3 },
          { param: 'resolution', kind: 'range', min: 0.1, max: 0.15 },
          { param: 'straightness', kind: 'range', min: 0.8, max: 1.0 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/bearing-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room', 'plant/comparator/lapping-plate'],
    steps: [
      { note_zh: '车差动丝杠（0.5/0.45 mm 螺距）、导轨与手柄；留 0.2 mm 磨量', performedBy: 'lathe' },
      {
        note_zh: '淬火 830–860 °C、回火 160–180 °C；丝杠与导轨硬度 58–62 HRC',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 830, max: 860 }],
      },
      { note_zh: '磨丝杠螺纹与导轨面，研到 1 µm/100 mm 直线度', performedBy: 'plant/grinder' },
      {
        note_zh: '装配与测分辨：手柄 500 格，每格 0.1 µm；走 3 mm 看直线度 0.03 µm、回差 ≤0.2 µm',
        performedBy: 'plant/comparator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '轴承钢 1 + 45 钢 2 = 3 kg → 间隙驱动 1 件（2.5 kg）；0.5 kg 是车屑、磨屑与热处理氧化皮。产物按件计，不进 kg 守恒',
  },

  {
    /**
     * **基座与屏蔽罩：浇铸铁基座 → 铣/车 → 装屏蔽/高压套管/窗 → 绝缘测。**
     *
     *   铸铁 60 + 铝 5 + 氧化铝 1 + 玻璃 1 + 氧化铝套管 1 只
     *   → 基座屏蔽 1 件（66 kg）
     *
     * 60 kg 铸铁基座把 13.9 µN 的静电力与地面振动隔开；铝罩接地，
     * 罩内电场只由两块电极定；氧化铝套管 10 kV、泄漏 <1 pA。
     * 玻璃窗是给激光干涉仪留的三个测隙孔。
     *
     * 10 V 下 1 pA 是 10 TΩ，比电极间 278 pF 在 10 Hz 下的阻抗（57 MΩ）
     * 大 1.75×10⁵ 倍，不加载。
     */
    id: 'make/voltage-balance-base-shield',
    name: 'Absolute Voltage Balance Base and Shield Cover Manufacturing', name_zh: '绝对电压天平基座与屏蔽罩制造',
    rate: { hours: q(32) },
    produces: [
      {
        item: 'plant/voltage-balance/base-shield',
        qty: q(1),
        gives: [
          { param: 'mass', kind: 'range', min: 65, max: 67 },
          { param: 'voltage', kind: 'range', min: 10000, max: 10000 },
          { param: 'leakage', kind: 'range', min: 0.5, max: 1 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(60) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(5) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
      { anyOf: [{ item: 'std/alumina-insulator-general', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '浇铸铁基座 450×450×120 mm（HT250），时效 24 h',
        performedBy: 'plant/melting-furnace',
        under: [{ param: 'temperature', min: 1300, max: 1500 }],
      },
      { note_zh: '铣基座平面与三个 φ20 测隙孔；罩与基座三点压接', performedBy: 'plant/milling-machine' },
      { note_zh: '车铝屏蔽罩 φ420×450，罩内壁抛光、接地', performedBy: 'lathe' },
      { note_zh: '装氧化铝高压套管（10 kV）与玻璃窗', performedBy: 'plant/robot' },
      {
        note_zh: '绝缘与泄漏测：500 V 下 ≥10 GΩ；10 kV 耐压 1 min 不击穿',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '铸铁 60 + 铝 5 + 氧化铝 1 + 玻璃 1 + 套管 1 只 = 67 kg（按件与 kg 混计）→ 基座屏蔽 1 件（66 kg）；1 kg 是浇冒口、铣屑与玻璃边角。产物按件计，不进 kg 守恒',
  },

  {
    /**
     * **绝对静电计总装：基座/固定电极 → 吊可动电极 → 装间隙驱动/对中 → 测几何 → 试加力。**
     *
     *   固定电极 2.7 + 可动电极 0.061 + 间隙驱动 2.5 + 基座屏蔽 66 = 71.3 kg
     *   → 电压天平 1 台
     *
     * 五道工序：
     *
     *   ① **基座/固定电极**：固定电极装在基座绝缘子上，保护环与内盘分别引线；
     *      保护环接被测电压的「护」端（与内盘同电位），不是接地。
     *   ② **吊可动电极**：三条 300 mm 铜丝从微天平梁的一端吊下，配重 61 g
     *      使梁空载平衡；可动电极在下、固定电极在上，静电力向上吸。
     *   ③ **间隙驱动/对中**：调三根支撑，使两盘平行度 0.2 µm；间隙驱动
     *      从 2 mm 走到 0.2 mm 不碰。
     *   ④ **测几何**：比较仪量内盘直径、环隙；激光干涉仪在三个点上量间隙
     *      （1 mm 处），折射率修正。
     *   ⑤ **试加力**：10 V 加在电极上，微天平读 3.75 mg；正反向各 3 次，
     *      看回零与重复性。
     *
     * 力常数（mg/µA）不在这里标定 —— 在 `measure/voltage-absolute` 里
     * 用 10 g 标准 + 砝码组先标天平，再称静电力。
     */
    id: 'make/voltage-balance',
    name: 'Absolute Electrometer Final Assembly', name_zh: '绝对静电计总装',
    rate: { hours: q(80) },
    produces: [
      {
        item: 'plant/voltage-balance',
        qty: q(1),
        gives: [
          { param: 'measure/voltage', kind: 'range', min: 1, max: 20 },
          { param: 'gap', kind: 'range', min: 0.2, max: 2 },
          { param: 'force', kind: 'range', min: 0.5, max: 50 },
          { param: 'uncertainty', kind: 'range', min: 25, max: 35 },
          { param: 'measure/capacitance', kind: 'range', min: 278, max: 278 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/voltage-balance/guard-plate', qty: q(1) }] },
      { anyOf: [{ item: 'plant/voltage-balance/movable-plate', qty: q(1) }] },
      { anyOf: [{ item: 'plant/voltage-balance/gap-drive', qty: q(1) }] },
      { anyOf: [{ item: 'plant/voltage-balance/base-shield', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room', 'plant/micro-balance', 'plant/stabilized-laser', 'plant/refractometer', 'std/dvm-general'],
    steps: [
      {
        note_zh: '装基座与固定电极：内盘、保护环分别引线；保护环接被测电压的护端（与内盘同电位），不接地',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '吊可动电极：三条 300 mm 铜丝从微天平梁一端吊下，配重 61 g 使梁空载平衡；可动电极在下',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装间隙驱动、对中：三根支撑调两盘平行度 0.2 µm；间隙从 2 mm 走到 0.2 mm 不碰',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '测几何：比较仪量内盘 φ200 与环隙 0.100 mm；A_g = 0.031416 m²、A_eff = 0.031400 m²（修正 −0.05 %）',
        performedBy: 'plant/comparator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '测间隙：激光干涉仪在 3 个孔位量 1 mm 间隙，20 nm 读数；refractometer 修正 (n−1)d = 2.5 nm',
        performedBy: 'plant/laser-stage',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '试加力：10 V 加在电极上，微天平读 3.75 mg；正反向各 3 次，回零偏差 ≤0.3 µg',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '固定电极 2.7 + 可动电极 0.061 + 间隙驱动 2.5 + 基座屏蔽 66 = 71.3 kg → 电压天平 1 台；产物按台计，不进 kg 守恒。10 V、1 mm、φ200 盘时 F = 13.9 µN = 3.75 mg（火星 g = 3.71），电容 278 pF；31 ppm 的误差预算在文件头 §四',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 四、可逆摆：三件零件 + 总装
  // ═══════════════════════════════════════════════════════════════════════════

  {
    /**
     * **摆杆：拉石英管 → 退火 → 磨外圆 → 测长。**
     *
     *   高纯石英 2 kg → 摆杆 1 件（0.3 kg）
     *
     * 熔石英管 φ12×1000 mm，α = 0.5 ppm/K；两端锥面装刀口座，
     * 不靠螺纹（螺纹 10 µm 间隙会让 L 变）。
     *
     * 为什么不用钢：钢 α = 11 ppm/K，0.1 K 就是 1.1 ppm；熔石英
     * 0.05 ppm。这一项不是「更好」，是让温度退出 g 的误差预算。
     */
    id: 'make/gravity-pendulum-rod',
    name: 'Reversible Pendulum Rod Manufacturing', name_zh: '可逆摆摆杆制造',
    rate: { hours: q(24) },
    produces: [
      {
        item: 'plant/gravity-pendulum/rod',
        qty: q(1),
        gives: [
          { param: 'length', kind: 'range', min: 1.0, max: 1.002 },
          { param: 'tempco', kind: 'range', min: 0.5, max: 0.7 },
          { param: 'straightness', kind: 'range', min: 0.1, max: 0.2 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/quartz-pure', qty: q(2) }] }],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '拉石英管：φ12×1100 mm，1900–2200 °C 玻璃车床拉制；壁厚 1.5 mm',
        performedBy: 'plant/glass-lathe',
        under: [{ param: 'temperature', min: 1900, max: 2200 }],
      },
      {
        note_zh: '退火：900–1000 °C 保温 2 h、随炉冷，去拉制应力',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 900, max: 1000 }],
      },
      { note_zh: '磨外圆到 φ12.00、端面垂直度 0.05 mm；两端车 1:10 锥孔装刀口座', performedBy: 'plant/grinder' },
      {
        note_zh: '测长：比较仪 + 量块量两端刀口座间距，1.000000 m ±1 µm；直线度 0.1 mm',
        performedBy: 'plant/comparator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '高纯石英 2 kg → 摆杆 1 件（0.3 kg）；1.7 kg 是拉制头尾、磨外圆与端面余量（石英玻璃可回炉）。产物按件计，不进 kg 守恒',
  },

  {
    /**
     * **摆的刀口：与微量天平的刀口同工艺，两对。**
     *
     *   轴承钢 0.01 kg → 刀口 1 套（两对，4 条刃）
     *
     * 刃半径 1–3 µm、硬度 60–64 HRC；两对刃口的间距 1.000 m 在总装时
     * 由比较仪 + 量块定，不在零件上定。
     */
    id: 'make/gravity-pendulum-knife-edge',
    name: 'Reversible Pendulum Knife Edge Manufacturing', name_zh: '可逆摆摆的刀口制造',
    rate: { hours: q(16) },
    produces: [
      {
        item: 'plant/gravity-pendulum/knife-edge',
        qty: q(1),
        gives: [
          { param: 'edgeRadius', kind: 'range', min: 1, max: 3 },
          { param: 'hardness', kind: 'range', min: 60, max: 64 },
          { param: 'length', kind: 'range', min: 40, max: 40 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/bearing-steel', qty: q(1, 100) }] }],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '车 4 条刀口坯（40×8×6 mm），留 0.3 mm 磨量', performedBy: 'lathe' },
      {
        note_zh: '淬火 830–860 °C、回火 160–180 °C，硬度 60–64 HRC',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 830, max: 860 }],
      },
      { note_zh: '磨刃：氧化铝粗磨、W1 金刚石精磨，刃半径 1–3 µm', performedBy: 'plant/grinder' },
      {
        note_zh: '研刃与检：铸铁盘轻研去毛刺；比较仪看直线度 ≤0.01 mm',
        performedBy: 'plant/comparator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '轴承钢 0.01 kg → 刀口 1 套（4 条，约 0.008 kg）；0.002 kg 是车屑、磨屑与研磨余量。产物按套计，不进 kg 守恒',
  },

  {
    /**
     * **摆锤与支架：熔铜浇摆锤 → 车/磨 → 浇/铣支架 → 装配调平。**
     *
     *   铜 3 + 铸铁 15 = 18 kg → 摆体 1 件（18 kg）
     *
     * 摆锤 3 kg 铜圆柱 φ80×68 mm，质心在几何中心；支架 15 kg HT250，
     * 三脚调平。摆锤越重，空气阻尼与支座摩擦的相对影响越小；但太重会把
     * 刀口压出印子（比压 >300 MPa），3 kg 是折中。
     */
    id: 'make/gravity-pendulum-body',
    name: 'Reversible Pendulum Bob and Support Manufacturing', name_zh: '可逆摆摆锤与支架制造',
    rate: { hours: q(40) },
    produces: [
      {
        item: 'plant/gravity-pendulum/body',
        qty: q(1),
        gives: [
          { param: 'mass', kind: 'range', min: 17.9, max: 18.1 },
          { param: 'height', kind: 'range', min: 1.3, max: 1.3 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(3) }] },
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(15) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '熔铜浇 φ80×68 mm 摆锤（3 kg），去浇冒口',
        performedBy: 'plant/melting-furnace',
        under: [{ param: 'temperature', min: 1200, max: 1300 }],
      },
      { note_zh: '车摆锤外圆与两端面，留 0.2 mm 磨量', performedBy: 'lathe' },
      { note_zh: '磨摆锤两端面，质心对几何中心偏差 ≤0.05 mm', performedBy: 'plant/grinder' },
      {
        note_zh: '浇铸铁支架（15 kg，HT250），去浇冒口',
        performedBy: 'plant/melting-furnace',
        under: [{ param: 'temperature', min: 1300, max: 1500 }],
      },
      { note_zh: '铣三脚与刀口座面，座面共面 0.05 mm', performedBy: 'plant/milling-machine' },
      {
        note_zh: '装配与调平：摆锤装杆、支架三脚调平；刀口座面研到共面 0.05 mm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '铜 3 + 铸铁 15 = 18 kg → 摆体 1 件（18 kg）；浇冒口与车屑 <0.1 kg 回炉。产物按件计，不进 kg 守恒',
  },

  {
    /**
     * **可逆摆总装：装支架/摆锤 → 装摆杆/刀口 → 测刀口间距 → 测周期。**
     *
     *   摆杆 0.3 + 刀口 0.008 + 摆体 18 = 18.3 kg → 可逆摆 1 台
     *
     * 测周期：正挂 1000 个周期、倒挂 1000 个周期，调摆锤位置使两次周期
     * 相等；相等时等效摆长 = 两刀口间距 L。T = 3.262 s（火星 g = 3.71），
     * 1000 个周期 3262 s，石英时基 10 ppm。
     *
     * g = 4π²L/T² = 3.7100 m/s²；分项方和根 **20.7 ppm**，取 **25 ppm**
     * （时基 20 + 长度 1 + 振幅残差 0.1 + 浮力 2 + 摩擦 5，1.2 倍余量）。
     */
    id: 'make/gravity-pendulum',
    name: 'Reversible Pendulum Final Assembly', name_zh: '可逆摆总装',
    rate: { hours: q(48) },
    produces: [
      {
        item: 'plant/gravity-pendulum',
        qty: q(1),
        gives: [
          { param: 'length', kind: 'range', min: 1.0, max: 1.002 },
          { param: 'period', kind: 'range', min: 3.26, max: 3.27 },
          { param: 'measure/gravity', kind: 'range', min: 3.70, max: 3.72 },
          { param: 'uncertainty', kind: 'range', min: 20, max: 25 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/gravity-pendulum/rod', qty: q(1) }] },
      { anyOf: [{ item: 'plant/gravity-pendulum/knife-edge', qty: q(1) }] },
      { anyOf: [{ item: 'plant/gravity-pendulum/body', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room', 'std/quartz-resonator-general', 'std/counter-chip-general'],
    steps: [
      {
        note_zh: '装支架与摆锤：三脚调平，摆锤装杆、质心朝下；刀口座与支架接触面研合',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '装摆杆与两对刀口：正挂/倒挂各一对，刀口落在支架刀口座上，无间隙',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '测刀口间距：比较仪 + 量块，L = 1.000000 m ±1 µm（1 ppm）',
        performedBy: 'plant/comparator',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '测周期：正挂 1000 周期、倒挂 1000 周期，调摆锤位置使两次相等；石英时基 100 kHz、计数器读 3262 s，10 ppm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '摆杆 0.3 + 刀口 0.008 + 摆体 18 = 18.3 kg → 可逆摆 1 台；产物按台计，不进 kg 守恒。L = 1.000000 m、T = 3.262 s、g = 3.7100 m/s²、不确定度 25 ppm（时基 20 + 长度 1 + 振幅 0.1 + 浮力 2 + 摩擦 5，方和根 20.7，取 25 留 1.2 倍余量）是设计值',
  },

];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...VOLTAGE_ANCHOR_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...VOLTAGE_ANCHOR_ROUTES];
