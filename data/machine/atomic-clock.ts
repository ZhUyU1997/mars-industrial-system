/**
 * 氢脉泽（H maser）—— 把 10⁻⁵ 的石英时基换成 10⁻¹² 的原子时基（⑫）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、为什么是氢脉泽：先把本层的 Rb / H / Cs 查一遍
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   `mat/rubidium`   **0 条目**（全表无 Rb，也没有 Rb 矿/提 Rb 路线）
 *   `mat/cesium`     **当时 0 条目**；现在是一次性输入（`data/material/cs-sb.ts`，
 *                    无本地路线、不可复制），仍没有 Cs⁺ 源；风化层 Cs 0.1–0.5 ppm
 *   `mat/hydrogen`   **有**，电解水路线（`make/hydrogen`），纯度 99–99.999 %
 *
 * 所以按用户给的三分支，走**氢脉泽**：
 *   有 Rb → Rb 钟（87Rb 基态超精细 6.834 GHz，腔 + 灯 + 滤光 + 伺服）；
 *   有 H  → 氢脉泽（1.420 GHz）；
 *   都没有 → 氢脉泽（H 本层有）。
 * 本层 Rb 是 0；Cs 只有一次性输入；H 有 —— 只有一条路。
 *
 * ── 1.1 为什么不用铯（Cs 是一次性输入，且不只是"没条目"）──────────────────
 *
 *   ① **没有本地铯。** 铯在火星风化层 0.1–0.5 ppm，要 4–20 t 土提 1 kg Cs；
 *      提 Cs 要焙烧-浸出-离子交换（铯榴石/吸附剂），本层没有这条链；
 *      `mat/cesium` 现在是一次性输入（`cs-sb.ts`），不能做钟的长期料。
 *   ② **铯束管/喷泉钟要的另外三件也没有**：852 nm 可调谐激光（本层只有
 *      488 nm Ar⁺，`plant/stabilized-laser`）、1 µK 量级的激光冷却、
 *      以及 10⁻⁹ 的微波腔。没有这三件，Cs 钟的 10⁻¹³ 也拿不到。
 *   ③ **铯束钟的短稳并不比氢脉泽好。** 商用 Cs 束 σ_y(1 s) ≈ 1–3×10⁻¹¹，
 *      氢脉泽 ≈ 1×10⁻¹²–1×10⁻¹³；喷泉钟的 10⁻¹³ 要激光冷却。
 *      在"只要 10⁻¹¹–10⁻¹²（1 s）"这个目标上，氢脉泽是更短的路。
 *
 * ── 1.2 为什么不用 GPS（火星无卫星）──────────────────────────────────────
 *
 *   GPS/北斗是**地球**的导航星座：31 颗卫星、MEO 轨道、地面运控。火星
 *   没有卫星星座，也没有地面测控站 —— 模型里连一颗通信卫星都没有。
 *   即使有，GPS 授时的 10–30 ns（1–3×10⁻⁸）也不够：它自己的星载钟是
 *   Rb/Cs，地面接收机只做单向测距；要 10⁻¹² 还是得本地原子钟。
 *   **GPS 不是"更好的时基"，是"别人的时基"**，而火星没有别人。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、氢脉泽是什么：一束选态氢原子在腔里受激辐射
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① **氢源**：H₂ 经镍催化脱氧 + 80 K 冷阱（水/碳氢）→ 99.999 %；
 *      RF 放电（`plant/rf-13m56`，13.56 MHz）解离成 H 原子。
 *   ② **选态**：六极磁铁（软铁极头 + 铜线圈，尖端 1.2 T）把 F=1, m_F=+1
 *      的原子聚焦进泡，F=0 的散开。
 *   ③ **储存泡**：熔石英球 φ150 mm（2 L），内壁 PTFE 涂层；
 *      原子在泡里与壁碰撞 ~10⁴ 次才失去态，线宽压到 ~1 Hz。
 *   ④ **腔**：TE011 圆柱腔，石英筒镀银 1 µm，Q = 10⁴–5×10⁴；
 *      腔频调到 1.420405751 GHz 与原子线重合（腔牵引 <1×10⁻¹²）。
 *   ⑤ **磁屏蔽**：4 层退火软铁（本层没有坡莫合金/µ 金属 —— 见 §五①），
 *      屏蔽因子 10³–10⁴；C 场线圈给 0.1 µT（1 mG），二级塞曼
 *      频移 2.7×10¹⁰ Hz/T² × (0.1 µT)² ≈ 0.27 Hz —— 折 2×10⁻¹³。
 *   ⑥ **接收**：1.42 GHz 信号经 `std/uhf-lna-general`（200–2000 MHz）
 *      放大，`std/schottky-diode-general` 做谐波混频：100 MHz OCXO 的
 *      12 次谐波 1 200 MHz 与 1 420.4 MHz 差出 220.4 MHz IF
 *      （UHF LNA 的 200–2000 MHz 覆盖它；20.4 MHz 落在带外，所以取 12 次）；
 *      鉴相 → 积分 → 控 OCXO（PLL 带宽 1 Hz）。
 *   ⑦ **输出**：100 MHz → 10 MHz → 1 PPS（计数链），
 *      10 MHz 就是 `measure/local-g` 的时基。
 *
 *   频率：ν(H, F=1→0) = **1 420 405 751.768 Hz**（定义值，不用测）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、稳定度：为什么 1 s 能到 10⁻¹²
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   主动型氢脉泽的短稳由**热噪声**与**腔牵引**定：
 *
 *     σ_y(τ) ≈ (1/(2π Q_l)) · √(kT/(P τ)) · (ν_c/ν_atom)
 *
 *   Q_l（有载 Q）≈ 2×10⁴、P ≈ 10⁻¹³ W、T = 300 K、τ = 1 s：
 *     σ_y(1 s) ≈ 1×10⁻¹²（设计值；Earth 工程值是 1×10⁻¹²–1×10⁻¹³）。
 *   长期由腔牵引与壁移定：漂移 1×10⁻¹⁴/天（设计值）。
 *
 *   交付窗口：**1×10⁻¹¹–1×10⁻¹²（1 s）**，漂移 **1×10⁻¹⁵–1×10⁻¹⁴/天**。
 *   这就是把 g 从 25 ppm 拉到 1–3 ppm 的那一级（g 的账见
 *   `data/measure/g-absolute.ts`）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、绝对重力仪：为什么要另一台机器，不拿脉泽直接测 g
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   脉泽只给时间。测 g 要**长度 + 时间**：
 *
 *     自由落体：z(t) = z₀ + v₀t + ½gt²
 *     激光干涉仪数条纹：Δz = (λ/2)·N，λ = 488 nm（`plant/stabilized-laser`）
 *     时基打点：1.42 GHz 脉泽 → 10 MHz，条纹过零时刻记到 1.4 ns
 *
 *   0.2 m 落体 0.328 s，条纹 8.2×10⁵ 条，撞击速度 1.22 m/s、
 *   条纹率 5 MHz。拟合 8×10⁵ 个 (t, z) 点，随机项 <0.01 ppm；
 *   系统项（激光波长 1 ppm、地震 0.5 ppm、梯度/高度 0.2 ppm、
 *   垂直度 0.1 ppm、释放 0.2 ppm）方和根 **1–3 ppm**。
 *
 *   为什么不用可逆摆：`plant/gravity-pendulum` 的 25 ppm 里，
 *   时基 20 ppm + 摆长/浮力/摩擦/振幅 6–8 ppm；换了脉泽只去掉 20 ppm
 *   那一项，剩下的 6–8 ppm 仍进不了 1–3 ppm，且摆的周期要 3 262 s
 *   才有 1 000 个周期 —— 自由落体 0.3 s 一次、200–500 次平均，
 *   同样的时间拿到更多独立点。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、剩余缺口（带数字）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① **没有坡莫合金/µ 金属。** `mat/permalloy` 0 条目；4 层退火软铁
 *      （`mat/iron`，1 mm）屏蔽因子 10³–10⁴，比 µ 金属的 10⁵ 差 10–100 倍。
 *      外部 50 µT 漏进来 5–50 nT；C 场 0.1 µT 上就是 5–50 % 的场误差，
 *      但**场的变化**（门开、电梯、磁暴）才是频移的来源，用 C 场电流伺服
 *      压到 1×10⁻⁹ 相对（二级塞曼 0.27 Hz × 1e-9 = 2.7×10⁻¹³）。
 *      要做 1×10⁻¹⁵/天，得自己炼 Ni-Fe-Mo（真空熔炼 + 氢气退火，本层没有）。
 *   ② **1.42 GHz 没有专件。** 本层最高 RF 专件是 13.56 MHz
 *      （`plant/rf-13m56`）；1.42 GHz 靠 `std/sige-hbt-general`
 *      （f_T 35–50 GHz）、`std/uhf-lna-general`（200–2000 MHz）、
 *      `std/schottky-diode-general` 搭。**网络分析仪已有 `std/vna-3ghz`**
 *      （10 MHz–3 GHz、S11 0.05–0.2 dB/0.3–1°），S11 可测；仍没有
 *      隔离器/环行器，腔 Q 仍靠振铃衰减（1–3 %）。这够调腔，不够做
 *      10⁻¹⁴ 的腔牵引标定。
 *   ③ **腔 Q 与壁移没有独立标定。** Q = 10⁴–5×10⁴ 是设计值；壁移
 *      （PTFE 涂层，~1×10⁻¹⁰）靠"两个不同长度的泡"外推，本层只做一只泡，
 *      壁移直接进 1×10⁻¹² 的准确度。要做 10⁻¹³ 得两只泡 + 变温外推。
 *   ④ **氢纯度没有在线分析。** `mat/hydrogen` 的 99–99.999 % 是电解槽的
 *      铭牌；镍脱氧 + 80 K 冷阱后按 99.999 % 记，没有露点/氧分析仪
 *      （同一个病）。水/氧进泡会把 PTFE 涂层打坏，
 *      壁移漂移从 1×10⁻¹³/天涨到 1×10⁻¹¹/天 —— 这是本文件最大的
 *      未量化项，记录里必须写"氢源露点 ≤−70 °C，否则重换"。
 *   ⑤ **稳定度没有相位噪声分析仪。** 1×10⁻¹²（1 s）靠拍频 + 计数器
 *      （`plant/uhf-digitizer` 的时基 2–4 GHz、抖动 0.3–0.8 ps）测；
 *      0.3 ps 对 1.42 GHz 是 4×10⁻⁴ 周，1 s 平均后 4×10⁻⁴/√(1.42e9)
 *      ≈ 1×10⁻⁸ 周 —— 比 1×10⁻¹² 差 4 个量级，所以**测不出** 1×10⁻¹²，
 *      只能测到 1×10⁻⁸–10⁻⁹。1×10⁻¹² 是设计值 + 热噪声公式，
 *      实测要一台相位噪声分析仪（0 条目）。
 *   ⑥ **温度系数没有实测。** 腔的线膨胀 0.5 ppm/K（熔石英）→ 腔频
 *      0.5 ppm/K；靠 19–21 °C 的计量间（±1 K）不够，脉泽自带 0.01 K
 *      的恒温套（设计值）。0.01 K × 0.5 ppm/K = 5×10⁻⁹，仍比 1×10⁻¹²
 *      大 5 000 倍 —— 实际靠腔的温补（钛/石英复合）与伺服，本层没有
 *      温补数据，记缺口。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 六、注册（本文件不改 tools/report/data.ts，由用户注册）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   import { ATOMIC_CLOCK_ITEMS, ATOMIC_CLOCK_ROUTES } from '../../data/machine/atomic-clock.ts';
 *   items 数组加  ...ATOMIC_CLOCK_ITEMS,
 *   routes 数组加 ...ATOMIC_CLOCK_ROUTES,
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const ATOMIC_CLOCK_ITEMS: readonly Item[] = [
  /**
   * **氢脉泽：1.420 GHz，σ_y(1 s) = 1×10⁻¹¹–10⁻¹²，漂移 10⁻¹⁵–10⁻¹⁴/天。**
   *
   * 它是本层的**第一台原子钟**，也是唯一一台：石英 10⁻⁵ 的短期稳定度
   * 把 g 钉在 25 ppm（`plant/gravity-pendulum` 的 20 ppm 时基项），
   * 脉泽把它换成 10⁻¹²，g 的时基项从 20 ppm 降到 0.002 ppm。
   *
   * `props` 只写四个数：频率、短稳、漂移、腔 Q。它们都是设计值
   * （Earth 工程值），实测缺口见文件头 §五⑤（没有相位噪声分析仪，
   * 1×10⁻¹² 测不出来）。
   *
   * `holds` 留空：脉泽维持的是"磁场 + 温度"，但它的恒温套与 C 场
   * 是**机器内部**的事，写进 `holds` 会让"造它的时候也要 0.01 K"
   * 触发条件自举（`condition_cycle`，与 `plant/cnc-polisher-5axis`
   * 同一条理由）。外部只要求计量间 19–21 °C，写在路线的 steps 里。
   */
  {
    id: 'plant/hydrogen-maser',
    name: '氢脉泽',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'measure/frequency', kind: 'range', min: 1.4204e9, max: 1.4205e9, unit: 'Hz' },
      { param: 'measure/stability', kind: 'range', min: 1e-13, max: 1e-11, unit: '1', dir: 'atMost' },
      { param: 'measure/drift', kind: 'range', min: 1e-15, max: 1e-14, unit: '1/day', dir: 'atMost' },
      { param: 'qFactor', kind: 'range', min: 1e4, max: 1e5, unit: '1' },
    ],
  },

  /**
   * **绝对重力仪：自由落体 + 激光干涉 + 脉泽时基，1–3 ppm。**
   *
   * 它不是"摆的升级版"，是另一种测量：0.2 m 真空落管、角锥棱镜随落体
   * 下落、488 nm 干涉仪数 8.2×10⁵ 条条纹、1.42 GHz 脉泽打点。
   * 拟合 z(t) = z₀ + v₀t + ½gt² 得 g。
   *
   * `props` 的四个数：g 的量程（3.6–3.8 覆盖火星 3.71）、不确定度
   * （1–3 ppm，设计值）、落高（0.1–0.3 m）、落次（100–1 000 次平均）。
   * 量程与落高是能力，不是实测；实测在 `mat/local-g-record`。
   */
  {
    id: 'plant/absolute-gravimeter',
    name: '绝对重力仪',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'measure/gravity', kind: 'range', min: 3.6, max: 3.8, unit: 'm/s²' },
      { param: 'uncertainty', kind: 'range', min: 1, max: 3, unit: 'ppm', dir: 'atMost' },
      { param: 'dropHeight', kind: 'range', min: 0.1, max: 0.3, unit: 'm' },
      { param: 'drops', kind: 'range', min: 100, max: 1000, unit: '次' },
    ],
  },

  /**
   * **密度台：阿基米德法 + 干涉测径，2–8 g/cm³，1–3 ppm（仪器本身）。**
   *
   * 它是一台"恒温水浴 + 吊挂称量 + 测径工位"的台子：10 g 球在空气里
   * 称一次、在 20.000 °C 超纯水里称一次，浮力差给体积；再用
   * `plant/laser-stage` 独立测直径做第二条腿（阿基米德 + 干涉测径）。
   *
   * 仪器本身 1–3 ppm（水密度 1–2、水温 0.01 K → 2、天平 0.1、
   * 吊丝浮力 0.1）；交付到记录是 3–10 ppm，因为还要加球的形状
   * （2–3 ppm）与²⁸Si 同位素组成的残余（<1 ppm）。两个数分开写，
   * 不把仪器能力当交付不确定度。
   */
  {
    id: 'plant/density-bench',
    name: '密度台',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'measure/density', kind: 'range', min: 2, max: 8, unit: 'g/cm³' },
      { param: 'uncertainty', kind: 'range', min: 1, max: 3, unit: 'ppm', dir: 'atMost' },
    ],
  },
];

export const ATOMIC_CLOCK_ROUTES: readonly Route[] = [
  {
    /**
     * **氢脉泽总装：腔 → 泡 → 选态 → 真空 → 氢源 → 接收 → 调谐。**
     *
     *   石英 5 + 银 0.2 + 铜 5 + 铜线 2 + 铁 30 + 不锈钢 20
     *   + 铝 5 + PTFE 1 + 氢 0.01 + 镍 0.5
     *   + GHz 前放 2 + 肖特基 2 + SiGe HBT 4 + 运放 12 + 计数片 2
     *   + 温控器 1 + 石英振子 1
     *   → 脉泽 1 台
     *
     * 八步：
     *   ① 石英腔与储存泡：玻璃车床吹 φ150 泡、车 φ180×250 腔筒，
     *      氢氧焰 1 900–2 200 °C 成型，退火 1 050–1 100 °C。
     *   ② 镀银：化学镀银 0.5–1 µm（银镜反应，湿法槽 20–40 °C），
     *      200–250 °C 烘 2 h 去氢；表面电阻 ≤0.05 Ω/□，Q 1×10⁴–5×10⁴。
     *   ③ 选态磁铁：软铁极头（车/铣）+ 铜线圈，尖端 1.2 T、孔径 20 mm、
     *      长 150 mm；线圈 2×500 匝，5 A。
     *   ④ 磁屏蔽：4 层 1 mm 退火软铁，层间 10 mm 木/铝隔开；
     *      屏蔽因子 10³–10⁴（没有 µ 金属，见 §五①）。
     *   ⑤ 真空装配与烘烤：`plant/euv-vacuum` 抽到 1×10⁻⁶ Pa，
     *      250–300 °C 烘 48 h；冷阱 80 K（`plant/cryo-trap-80k`）挡水。
     *   ⑥ 氢源：镍催化脱氧 + 80 K 冷阱 + RF 放电（13.56 MHz，
     *      `plant/rf-13m56`）；H₂ 流量 1×10⁻⁷ kg/h 量级。
     *   ⑦ 接收机与伺服：1.42 GHz 前放 + 肖特基谐波混频（100 MHz 的
     *      12 次谐波 1 200 MHz）+ 220.4 MHz IF + 鉴相 + 1 Hz PLL 控 OCXO。
     *   ⑧ 调谐与验收：腔频扫到原子线，拍频与石英比对，测 Allan 偏差
     *      （只能测到 10⁻⁸–10⁻⁹，见 §五⑤），写铭牌。
     *
     * ⚠️ 腔 Q 1×10⁴–5×10⁴、短稳 1×10⁻¹²、漂移 1×10⁻¹⁴/天 是设计值；
     * 实测缺口在 §五②③⑤⑥，不假装测到了。
     */
    id: 'make/hydrogen-maser',
    name: '氢脉泽总装',
    rate: { hours: q(1200) },
    produces: [
      {
        item: 'plant/hydrogen-maser',
        qty: q(1),
        gives: [
          { param: 'measure/frequency', kind: 'range', min: 1.4204e9, max: 1.4205e9 },
          { param: 'measure/stability', kind: 'range', min: 1e-12, max: 1e-11 },
          { param: 'measure/drift', kind: 'range', min: 1e-15, max: 1e-14 },
          { param: 'qFactor', kind: 'range', min: 1e4, max: 1e5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(5) }] },
      { anyOf: [{ item: 'mat/silver', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(5) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(2) }] },
      { anyOf: [{ item: 'mat/iron', qty: q(30) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(20) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(5) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/nickel', qty: q(1, 2) }] },
      { anyOf: [{ item: 'std/uhf-lna-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/schottky-diode-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/sige-hbt-general', qty: q(4) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(12) }] },
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/temp-controller-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/quartz-resonator-general', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room', 'plant/cryo-trap-80k'],
    steps: [
      {
        note_zh: '① 石英腔与泡：玻璃车床吹 φ150 泡、车 φ180×250 腔筒，氢氧焰 1 900–2 200 °C 成型，1 050–1 100 °C 退火',
        performedBy: 'plant/glass-lathe',
        under: [{ param: 'temperature', min: 1900, max: 2200 }],
      },
      {
        note_zh: '② 镀银：化学镀银 0.5–1 µm（湿法槽 20–40 °C），200–250 °C 烘 2 h 去氢；表面电阻 ≤0.05 Ω/□',
        performedBy: 'plant/wet-bench',
        under: [{ param: 'temperature', min: 20, max: 40 }, { param: 'pressure', min: 100, max: 300 }],
      },
      {
        note_zh: '③ 选态磁铁：软铁极头 + 2×500 匝铜线圈，尖端 1.2 T、孔径 20 mm、长 150 mm',
        performedBy: 'lathe',
      },
      {
        note_zh: '④ 磁屏蔽：4 层 1 mm 退火软铁，层间 10 mm 铝隔开；屏蔽因子 10³–10⁴（没有 µ 金属）',
        performedBy: 'plant/milling-machine',
      },
      {
        note_zh: '⑤ 真空装配与烘烤：1×10⁻⁶ Pa、250–300 °C 烘 48 h；80 K 冷阱挡水',
        performedBy: 'plant/euv-vacuum',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-4 }],
      },
      {
        note_zh: '⑤b 烘烤热源：电阻炉 250–300 °C 套在真空腔外，48 h 保温',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 250, max: 300 }],
      },
      {
        note_zh: '⑥ 氢源：镍催化脱氧 + 80 K 冷阱 + RF 放电（13.56 MHz）；H₂ 流量 1×10⁻⁷ kg/h 量级',
        performedBy: 'plant/rf-13m56',
      },
      {
        note_zh: '⑦ 接收机与伺服：1.42 GHz 前放 + 肖特基谐波混频（100 MHz 的 12 次谐波 1 200 MHz）+ 220.4 MHz IF + 鉴相 + 1 Hz PLL 控 OCXO',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '⑧ 调谐与验收：腔频扫到原子线，拍频与石英比对，测 Allan 偏差（只能到 10⁻⁸–10⁻⁹），写铭牌',
        performedBy: 'plant/uhf-digitizer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '石英 5 + 银 0.2 + 铜 5 + 铜线 2 + 铁 30 + 不锈钢 20 + 铝 5 + PTFE 1 + 氢 0.01 + 镍 0.5 = 68.7 kg → 脉泽 1 台；产物按台计，不进 kg 守恒。镀银废液、石英边角与铁屑回炉/回收。1.4204–1.4205 GHz、1×10⁻¹²（1 s）、1×10⁻¹⁴/天、Q 1×10⁴–1×10⁵ 是设计值（Earth 工程值）',
  },

  {
    /**
     * **绝对重力仪总装：真空落管 + 落体/角锥 + 干涉光路 + 时基接口。**
     *
     *   不锈钢 200 + 铝 20 + 石英 2 + 铜 5 + 铁 10 + 玻璃 1 + PTFE 0.5
     *   + 光电二极管 2 + GHz 前放 1 + 运放 10 + 计数片 2 + 氧化铝绝缘子 2
     *   → 绝对重力仪 1 台
     *
     * 七步：
     *   ① 真空落管：φ150 × 2 500 不锈钢管，两端 CF 法兰，侧开 3 个
     *      干涉窗口；水压 0.2 MPa + 酒精查漏（没有氦检漏）。
     *   ② 落体：铝 0.8 kg 落体 + 熔石英角锥棱镜（φ30，面形 λ/4），
     *      三条导向杆 + 气浮/磁浮释放（释放重复性 1 µm）。
     *   ③ 干涉光路：488 nm 激光从 `plant/stabilized-laser` 进，
     *      分束器 + 参考角锥 + 光电二极管；3 个窗口做对准。
     *   ④ 真空与烘烤：1×10⁻⁴ Pa、200–250 °C 烘 24 h。
     *   ⑤ 时基接口：脉泽 10 MHz → 1.42 GHz 计数/打点；条纹过零
     *      时刻记到 1.4 ns（1.42 GHz 一个周期）。
     *   ⑥ 对准与试落：铅垂线 + 水准 20 µm/m；试落 20 次，看拟合残差。
     *   ⑦ 验收：与可逆摆比（25 ppm 内应一致），写量程/落高/落次。
     *
     * ⚠️ 激光波长 488 nm 的复现性 1×10⁻⁶（`plant/stabilized-laser`
     * 的 reproducibility 600 MHz）是 1 ppm 的主项；要 0.1 ppm 得碘稳频
     * 或兰姆凹陷，本层没有（见 `data/measure/g-absolute.ts` §四）。
     */
    id: 'make/absolute-gravimeter',
    name: '绝对重力仪总装',
    rate: { hours: q(800) },
    produces: [
      {
        item: 'plant/absolute-gravimeter',
        qty: q(1),
        gives: [
          { param: 'measure/gravity', kind: 'range', min: 3.6, max: 3.8, record: 'mat/local-g-record' },
          { param: 'uncertainty', kind: 'range', min: 1, max: 3, record: 'mat/local-g-record' },
          { param: 'dropHeight', kind: 'range', min: 0.1, max: 0.3 },
          { param: 'drops', kind: 'range', min: 100, max: 1000 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(200) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(20) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(5) }] },
      { anyOf: [{ item: 'mat/iron', qty: q(10) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 2) }] },
      { anyOf: [{ item: 'std/photodiode-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/uhf-lna-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(10) }] },
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/alumina-insulator-general', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room', 'plant/hydrogen-maser', 'plant/stabilized-laser'],
    steps: [
      {
        note_zh: '① 真空落管：φ150 × 2 500 不锈钢管、两端 CF 法兰、3 个干涉窗口；水压 0.2 MPa + 酒精查漏',
        performedBy: 'plant/sheet-shop',
      },
      {
        note_zh: '② 落体与角锥：铝 0.8 kg 落体 + φ30 熔石英角锥（面形 λ/4），三导向杆 + 磁浮释放，重复性 1 µm',
        performedBy: 'lathe',
      },
      {
        note_zh: '③ 干涉光路：488 nm 激光 + 分束器 + 参考角锥 + φ1 mm 小面积光电二极管（反偏 10 V；整片大结只到 100 kHz，不能用）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '④ 真空与烘烤：1×10⁻⁴ Pa、200–250 °C 烘 24 h',
        performedBy: 'plant/euv-vacuum',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-4 }],
      },
      {
        note_zh: '⑤ 时基接口：脉泽 10 MHz → 1.42 GHz 计数/打点，条纹过零时刻记到 1.4 ns',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '⑥ 对准与试落：铅垂线 + 水准 20 µm/m；试落 20 次看拟合残差',
        performedBy: 'plant/laser-stage',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '⑦ 验收：与可逆摆比（25 ppm 内应一致），写量程/落高/落次与不确定度分项',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '不锈钢 200 + 铝 20 + 石英 2 + 铜 5 + 铁 10 + 玻璃 1 + PTFE 0.5 = 238.5 kg → 重力仪 1 台；产物按台计，不进 kg 守恒。边角料与车屑回炉。g 3.6–3.8 m/s²、1–3 ppm、落高 0.1–0.3 m、100–1 000 次是设计值（Earth 工程值）',
  },

  {
    /**
     * **密度台：恒温水浴 + 吊挂称量 + 测径工位。**
     *
     *   不锈钢 50 + 铜 5 + 玻璃 2 + PTFE 1 + 铝 5 + 超纯水 10
     *   + 温控器 1 + 运放 4 + 轴承 2 套
     *   → 密度台 1 台
     *
     * 五步：
     *   ① 恒温水浴：φ400 × 500 不锈钢槽 + 铜盘管 + 玻璃观察窗，
     *      夹套 20.000 ± 0.01 °C（温控器 + 铂电阻，设计值）。
     *   ② 吊挂与升降：铝架 + 三根吊丝（φ0.1 铂丝/不锈钢），
     *      升降台把球从空气放进水里，不碰壁、不带气泡。
     *   ③ 控温与搅拌：温控器 + 搅拌桨（轴承 2 套），0.01 K 稳定。
     *   ④ 校准：`plant/micro-balance` 称 10 g 天然硅球（2.3290 g/cm³，
     *      20 ppm）在空气/水中的表观质量，检查浮力比与重复性；
     *      `plant/laser-stage` 测球径，与阿基米德体积互校。
     *   ⑤ 验收：10 次空气-水循环，读重复性 0.05 µg（天平分辨）与
     *      0.1 µg（重复性），写仪器 1–3 ppm 的能力。
     *
     * ⚠️ 校准用的是 20 ppm 的天然硅球，它只能检查**线性/重复性**，
     * 校不了 1–3 ppm 的绝对准确度；绝对准确度靠水密度（0.998207 g/cm³，
     * 1–2 ppm）与天平。见 `data/measure/g-absolute.ts` §五②。
     */
    id: 'make/density-bench',
    name: '密度台制造',
    rate: { hours: q(300) },
    produces: [
      {
        item: 'plant/density-bench',
        qty: q(1),
        gives: [
          { param: 'measure/density', kind: 'range', min: 2, max: 8 },
          { param: 'uncertainty', kind: 'range', min: 1, max: 3 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(50) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(5) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(2) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(5) }] },
      { anyOf: [{ item: 'mat/ultrapure-water', qty: q(10) }] },
      { anyOf: [{ item: 'std/temp-controller-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(4) }] },
      { anyOf: [{ item: 'std/bearing-general-p0', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '① 恒温水浴：φ200 × 300 不锈钢槽 + 铜盘管 + 玻璃观察窗，夹套 20.000 ± 0.01 °C（10 g 球用不着 φ400 的大槽）',
        performedBy: 'plant/sheet-shop',
      },
      {
        note_zh: '② 吊挂与升降：铝架 + 3 根 φ0.1 吊丝 + 升降台，球从空气放进水里不碰壁、不带气泡',
        performedBy: 'lathe',
      },
      {
        note_zh: '③ 控温与搅拌：温控器 + 铂电阻 + 搅拌桨，0.01 K 稳定',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '④ 校准：微天平称 10 g 天然硅球在空气/水中的表观质量，检查浮力比与重复性；激光台测球径，与阿基米德体积互校',
        performedBy: 'plant/micro-balance',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '⑤ 验收：10 次空气-水循环，重复性 0.05 µg（分辨）/0.1 µg（重复性），写仪器 1–3 ppm 能力',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '不锈钢 50 + 铜 5 + 玻璃 2 + PTFE 1 + 铝 5 + 超纯水 10 = 73 kg → 密度台 1 台；产物按台计，不进 kg 守恒。水循环使用，按 10 kg 初始装填记。2–8 g/cm³、1–3 ppm 是仪器能力（设计值，Earth 工程值），交付不确定度见 `mat/si-28-density-record`',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...ATOMIC_CLOCK_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...ATOMIC_CLOCK_ROUTES];
