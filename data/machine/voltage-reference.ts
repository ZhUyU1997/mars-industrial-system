/**
 * 1–10 V 标准电压基准 —— 三条「造不出」各补一条产出路线。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、这份文件补的是哪三件事（现状引自 measurement-seed.ts 两条旧注释）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   plant/hv-test-bench/standard-voltage-reference  /  -b   1–10 V、0.01–0.1 %
 *
 * 旧结论是「本层造不出」，三条理由：① 本地只有 6.2 V 通用齐纳
 * （`std/zener-reference-general`，±0.1 % 使用口径、温漂约 +2 mV/K ≈ 320 ppm/K）；
 * ② 恒温只有 `plant/metrology-room` 的 ±1 K，没有 mK 级；③ 绝对比对链只有
 * 4 位 DVM（±0.2 %），没有 0.01 % 级传递。
 *
 * 按 R6/R7 与「地球存在的仪器必须有产出路线」，三条逐条补，缺的中间件一并建条目：
 *
 *   ① 低温度系数齐纳   → `std/zener-reference-precision`（≤5 ppm/K；20 只筛 2 只 = 10 %）
 *   ② mK 恒温          → `plant/mk-oven` + 六件零件（25.00 ±0.01 °C，45.00 ±0.01 °C）
 *   ③ 0.01 % 传递链    → `std/divider-10to1-precision` / `-100to1-precision` + 指零法
 *   ④ 标准电池替代     → 走齐纳（本层无镉、无汞，见 §四），代价与数字写在 §五
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、路线总图
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   std/zener-reference-general ×20          （6.2 V 平面管发射结，±0.1 %）
 *     │  make/zener-reference-precision      （125 °C 168 h 老练 → 25/45 °C 温漂筛选）
 *     │  · 齐纳反偏 + 平面管发射结正偏**串联**：+2 mV/K 与 −2 mV/K 对消
 *     │  · 判据 |ΔV/ΔT| ≤ 34 µV/K（5 ppm/K @ 6.85 V），20 K 跨度 = 0.69 mV
 *     ▼
 *   std/zener-reference-precision ×2          （6.6–7.1 V、1–5 ppm/K、3–15 ppm/a）
 *     │
 *   plant/mk-oven                            （外层水浴 ±0.1 K → 内层 ±10 mK）
 *     │  · 热敏电阻 100 kΩ、B = 3900 K、α = −4.39 %/K、1 V 激励 → 11 mV/K
 *     │  · 电阻热噪声 40 nV（100 kΩ、1 Hz）→ 0.004 mK；地板是放大器与热电势
 *     │  · 控制带 ±5–20 mK：由梯度和 PID 定，不由电桥定
 *     ▼
 *   std/divider-10to1-precision ×2            （10 只等值电阻串，抽头 1/2/5/10）
 *   std/divider-100to1-precision              （同设计 + 串并联换接，Hamon 自校）
 *     │  make/divider-precision-pair         （丝印 → 850 °C 烧成 → 激光调阻到比值）
 *     │  · 比值 0.003–0.01 %、TCR 跟踪 0.5–1.5 ppm/K；25.00 °C 下调，调完就在恒温里用
 *     ▼
 *   make/standard-voltage-reference-pair
 *     · 增益级 6.85 V → 10.000 V（×1.4599，同一片排阻定比）
 *     · 分压串抽头 1 / 2 / 5 / 10 V，四只缓冲（4×运放）
 *     · 指零法逐档比对：只要零位分辨（0.1–10 µV），不要刻度准确度
 *     · 冰点（0–0.02 °C，`plant/subnm-thermostat`）标定热敏电阻 R0 → 定 25.00 °C
 *     ▼
 *   plant/hv-test-bench/standard-voltage-reference  +  -b
 *     同批两只、各写一份证书；传递不确定度 0.005–0.02 %（设计值）
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、为什么一条路线产两只（同批），而不是 A/B 各一条
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 与 `make/standard-capacitor-100pf-pair`、`make/pd-calibrator-reference` 同一个理由：
 * A/B 要互比，就必须**同批、同工艺、同一次传递**；分成两条路线就是两批，批间差会被
 * 互比读成漂移。两只各自走一遍传递、各自写一份证书，证书值不互相引用。
 *
 * ⚠️ 同批 ≠ 独立第二套。两只的共同偏差（同一只齐纳筛选台的判据、同一套分压串的
 * 比值）查不出来 —— 这与 `pd-intercompare.ts` 要的「独立种子」不是一回事。
 * 独立第二套仍要另一条工艺路线或进口，本文件不假装有。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、标准电池（Weston）为什么不走：本层没有镉、没有汞
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 韦斯顿电池 = 汞阴极 + 镉汞齐阳极 + CdSO₄ 电解液 + Hg₂SO₄ 去极化剂。
 * 全表 `mat/` 里 **没有镉、没有汞**（`robot.ts:458` 明写「NiCd 要镉（0 条）」；
 * `unblock-dvm.ts:96` 明写「标准电池要镉汞合金 —— 两样都没有」）。所以第 ④ 问的
 * 结论不是「造不出」，而是**走齐纳替代**，并把替代方案的代价用数字写在下面：
 *
 *   韦斯顿电池   1.0183 V、绝对 20 ppm、年漂 1–2 ppm、温漂 −40 ppm/K
 *   本层齐纳     6.85 V、绝对 0.2 %（2000 ppm）、年漂 5–15 ppm、温漂 ≤5 ppm/K
 *   ⇒ 绝对项差 **100 倍**；温漂项靠 mK 恒温补（5 ppm/K × 0.01 K = 0.05 ppm）
 *
 * 想把绝对项补上，地球上有三条路，本层一条都还没写（R7：是没写，不是不能）：
 *
 *   ① 韦斯顿电池      要 Hg + Cd + CdSO₄/Hg₂SO₄ 提纯（`mat/` 0 条）
 *   ② 约瑟夫森结      要 Nb/NbN 结 + 70–100 GHz + 4 K（`mat/helium` 只有 R10 一次性装填）
 *   ③ 量子霍尔 / 电流天平  要 2DEG + 10 T + 0.3 K，或 10⁻⁷ 级机械与可计算互感
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、剩下的绝对准确度缺口（这一份只补到 0.2 %，不补到 0.01 %）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 传递（本文件的成果）：0.005–0.02 %。分项见 `make/standard-voltage-reference-pair`。
 *
 * 绝对（本文件补不了）：**0.2 % = 2000 ppm**。来源是 `unblock-dvm.ts:106` 的口径 ——
 * 本层唯一被绝对标定过的是温度（冰点 0.01 °C），从温度借电压只有塞贝克系数，
 * 而铜-铁偶的塞贝克系数只有书本值 ±0.2 %。于是：
 *
 *   0.01 % 目标 = 100 ppm  → 差 **20 倍**
 *   韦斯顿 20 ppm          → 差 **100 倍**
 *
 * 缺口不在「传递」这一环，在「绝对伏特」这一环。要么进口**一只**绝对标准
 * （R9 现在豁免的是 A/B 两只，实际只需要一只用来标定本地链），要么把上面 ①②③
 * 中任意一条写出来。在写出来之前，本地 A/B 的证书只能写「传递值 + 0.2 % 绝对项」。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 六、注册（本文件不改 tools/report/data.ts）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   import { VOLTAGE_REFERENCE_ITEMS, VOLTAGE_REFERENCE_ROUTES }
 *     from '../../data/machine/voltage-reference.ts';
 *   items 数组加  ...VOLTAGE_REFERENCE_ITEMS,
 *   routes 数组加 ...VOLTAGE_REFERENCE_ROUTES,
 *
 * ⚠️ 注册后 `tools/report/r9.ts` 会把这两条报成
 * 「本地有产出路线，不能豁免」—— 那两行（第 30–31 行）应当随注册一起删掉。
 * 本文件按任务要求没有改 r9.ts。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const VOLTAGE_REFERENCE_ITEMS: readonly Item[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // 一、低温度系数齐纳
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * **低温度系数齐纳（补偿对）：6.6–7.1 V、1–5 ppm/K。**
   *
   * 它不是埋层齐纳（subsurface zener，6.9–7.5 V、1–2 ppm/K）—— 本层做不出埋层：
   * 埋层要在 n⁺ 埋层上外延，而全表没有外延炉（`plant/lpcvd-furnace` 是 700–780 °C
   * 的多晶硅/氮化硅炉，不是硅外延）。所以走的是**补偿对 + 筛选**：
   *
   *   齐纳（反偏发射结）  +2 mV/K   ← 6.2 V 的平面管发射结，`clock.ts:28`
   *   平面管发射结（正偏） −2 mV/K   ← 同一批平面管，0.62–0.68 V @1 mA
   *   ────────────────────────────
   *   串联和 ≈ 6.85 V，温漂 = 两者之差，残余由配对误差定
   *
   * 两个结的电流由同一只限流电阻定，两颗芯片装在同一只金属壳里（热阻 <5 K/W），
   * 壳再压在 5 kg 铜块上 —— 结间温差 <5 mK，温差本身的漂移 <1 mK。
   *
   * **判据 5 ppm/K = 34 µV/K @6.85 V。** 筛选在 25 → 45 °C 两个恒温点上做，
   * 20 K 跨度 ⇒ 门槛 0.69 mV；指零电位差计分辨 1–10 µV ⇒ 判据能被读到 1/70。
   *
   * 为什么不是「纯筛选」：通用齐纳的温漂是 +320 ppm/K 量级，20 只里挑不出
   * 5 ppm/K 的 —— 这不是良率问题，是分布根本不在那儿。补偿把中心拉到 0，
   * 筛选才只是在残余里挑。这一条写在文件头，免得后来者以为「筛一筛就行」。
   */
  {
    id: 'std/zener-reference-precision',
    name: '低温度系数齐纳',
    unit: '件',
    category: 'part',
    props: [
      { param: 'voltage', kind: 'range', min: 6.5, max: 7.5, unit: 'V' },
      { param: 'tempco', kind: 'range', min: 1, max: 5, unit: 'ppm/K', dir: 'atMost' },
      { param: 'drift', kind: 'range', min: 2, max: 20, unit: 'ppm/a', dir: 'atMost' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 二、精密分压：10:1 与 100:1
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * **精密分压器 10:1：10 只等值电阻串联，抽头在 1 / 2 / 5 / 10 只处。**
   *
   * 它同时是三档分压：1/10（10:1）、2/10（5:1）、5/10（2:1）。比值只由**只数**定，
   * 不由阻值定 —— 10 只等值电阻串起来，抽头在第 1 只下面就是 1/10，在第 2 只下面
   * 就是 2/10。激光调阻把这 10 只调到彼此相等（0.005 %），绝对值仍是 1–5 %
   * （`std/resistor-network-general` 的绝对值就这个水平），但绝对值不进公式。
   *
   * 三条让比值站得住的理由：
   *
   *   ① **同一片基板、同一批浆、同一炉**：10 只的 TCR 与老化同步，跟踪 0.5–1.5 ppm/K；
   *      进 mk-oven 后温度只变 0.01 K ⇒ 0.015 ppm，等于没有
   *   ② **同一把激光、同一次调阻**：逐只「测—切—再测」，切到与第 1 只相等为止；
   *      指零法读 1 kΩ 上的 0.005 % 差 = 50 µV，µV 计读得到
   *   ③ **四端引出**：每段两端各一对电流/电位端子，引线电阻与焊点热电势都在电位端之外
   *
   * 与 `std/resistor-network-general` 的分工：那只排阻是 4 只、比值 0.2 %、给运放
   * 差分对与 R-2R 用；这只是 10 只、比值 0.01 %、给**电压传递**用。同一工艺，验收不同。
   */
  {
    id: 'std/divider-10to1-precision',
    name: '精密分压器 10:1',
    unit: '件',
    category: 'part',
    props: [
      { param: 'ratioError', kind: 'range', min: 0.002, max: 0.02, unit: '%', dir: 'atMost' },
      { param: 'tempco', kind: 'range', min: 0.5, max: 2, unit: 'ppm/K', dir: 'atMost' },
      { param: 'resistance', kind: 'range', min: 5000, max: 20000, unit: 'Ω' },
    ],
  },

  /**
   * **精密分压器 100:1：同一设计的 10 只等值电阻，带串并联换接（Hamon）。**
   *
   * 10 只 100 Ω 串起来 = 1 kΩ，并起来 = 10 Ω，串/并比 = **100:1**。这个比值是
   * 二阶量：10 只的偏差 eᵢ 在串里是 Σ(1+eᵢ)、在并里是 1/Σ(1/(1+eᵢ))，
   * 比值误差 ≈ Σeᵢ²/2 —— 0.005 % 的单只偏差进二阶只剩 1.25×10⁻⁷。
   *
   * 它的用处**不是**当 100:1 用，是当**自校标准**：用 10:1 那只串两次
   * （10:1 × 10:1 = 100:1）与它比，两条独立连接方式的比值一致到 0.01 %，
   * 才说明 10:1 那只的抽头位置没有被调阻切歪。这是本层唯一能不靠外部标准
   * 验证分压比的办法。
   *
   * ⚠️ 串并联换接要用 10 只双刀继电器或 20 个接线柱 —— 本层用**接线柱**（手动换接，
   * 换一次 2 min，只在自校时换）。用继电器会引入接触热电势（1–10 µV 级），
   * 而热电势在 100:1 上是 0.1–1 ppm 的误差，接线柱手拧反而更干净。
   */
  {
    id: 'std/divider-100to1-precision',
    name: '精密分压器 100:1',
    unit: '件',
    category: 'part',
    props: [
      { param: 'ratioError', kind: 'range', min: 0.002, max: 0.02, unit: '%', dir: 'atMost' },
      { param: 'tempco', kind: 'range', min: 0.5, max: 2, unit: 'ppm/K', dir: 'atMost' },
      { param: 'resistance', kind: 'range', min: 5000, max: 20000, unit: 'Ω' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 三、mK 恒温箱的六件零件
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * **外层水浴：40 L 水、300 W 镍铬加热、热虹吸循环、50 mm 矿棉保温。±0.1 K。**
   *
   * 它是「粗调」那一级：把 25 K 的环境温差先压到 ±0.1 K，内层才只需要 ±0.1 K 的
   * 调节范围。没有它，内层 20 W 的微调加热要对付 ±1 K（计量间）甚至 ±10 K（车间）。
   *
   * 三个数：
   *
   *   热容   40 kg × 4180 J/(kg·K) = **167 kJ/K**；±0.1 K = 16.7 kJ
   *   漏热   50 mm 矿棉、外表 1.5 m²、U ≈ 0.7 W/(m²·K) ⇒ **1 W/K**；25 K 温差 = 25 W
   *   余量   300 W / 25 W = **12 倍**；补回 0.1 K 只要 56 s
   *
   * **不用搅拌电机。** 全表只有 `std/motor-7.5kw-4p` 一种标准电机，7.5 kW 搅 40 L 水
   * 是拿卡车发动机当风扇。改用**热虹吸**：加热丝在槽底，热水沿 φ12 铜管上升、
   * 冷水沿另一根下降，密度差自己推循环 —— 没有运动件，也没有磨损。
   * 代价是循环慢（流量 0.2–0.5 L/min），所以比例带取 0.5 K、积分时间 1 800 s，
   * 靠 167 kJ/K 的热容把 10 s 级的扰动磨平。
   */
  {
    id: 'plant/mk-oven/bath',
    name: 'mK 外层水浴',
    unit: '件',
    category: 'part',
    props: [
      { param: 'stability', kind: 'range', min: 0.05, max: 0.2, unit: 'K', dir: 'atMost' },
      { param: 'volume', kind: 'range', min: 30, max: 50, unit: 'L' },
    ],
  },

  /**
   * **内层恒温腔：5 kg 紫铜块，腔 φ60 × 120，酚醛盖 + PTFE 引线套管 + 三根 PTFE 柱。**
   *
   * 它是「精调」那一级的热容，也是**等温面**：齐纳、平面管、分压串、比较电阻全拧在
   * 同一块铜上，彼此的温差 <5 mK。
   *
   *   热容   5 kg × 385 J/(kg·K) = **1 925 J/K**；±0.01 K = 19 J
   *   升温   20 W 全功率、无漏热时 10 mK/s，1 K 要 96 s
   *   耦合   10 mm 气隙（空气 0.5 W/K）+ 三根 φ10 PTFE 柱（0.001 W/K）+ 辐射 0.1 W/K
   *          ⇒ **≈0.5 W/K**；举高 0.5 K 只要 0.25 W，20 W 余量 **80 倍**
   *          时间常数 1 925 / 0.5 = **3 850 s ≈ 1 h**
   *
   * 为什么是铜不是铝：铜的 λ = 401 W/(m·K) 是铝的 1.6 倍，5 kg 铜块内的温差
   * <0.5 mK；铝的氧化层还会在螺纹处长出 1–2 K/W 的接触热阻。
   * 为什么用 PTFE 柱不用钢柱：钢的 λ = 45 W/(m·K)，三根 φ10 × 50 mm 就是 0.21 W/K，
   * 与 0.5 W/K 的气隙同一量级 —— 用钢柱也能用，但 PTFE 把柱的贡献压到 0.001 W/K，
   * 耦合几乎全由气隙定，控温参数不随柱的材质与装配压力漂。
   */
  {
    id: 'plant/mk-oven/inner',
    name: 'mK 内层恒温腔',
    unit: '件',
    category: 'part',
    props: [
      { param: 'thermalMass', kind: 'range', min: 3, max: 8, unit: 'kg' },
      { param: 'cavity', kind: 'range', min: 50, max: 80, unit: 'mm' },
    ],
  },

  /**
   * **内层微调加热器：20 W 镍铬丝绕在氧化铝骨架上，贴在铜块侧面。**
   *
   * 它只负责「最后 0.1 K」。加热丝用 `mat/resistance-wire`（镍铬 80/20，
   * 1.1 Ω·mm²/m），φ0.2 的丝 12 m 绕 20 Ω，通 1 A 就是 20 W。
   * 骨架用氧化铝（`mat/alumina`）：既要绝缘（1 kV），又要导热（30 W/(m·K)）。
   *
   * 为什么不用 Peltier：Bi₂Te₃ 要铋和碲，全表 `mat/bismuth` / `mat/tellurium` 都是 0 条。
   * 没有制冷件不影响 ±10 mK：水浴永远比设定点低 0.5 K，内层只需要**加热**。
   * 这一条是本设计能用电阻加热代替 Peltier 的全部理由 —— 不是省事，是冷源在上面一级。
   */
  {
    id: 'plant/mk-oven/heater',
    name: 'mK 内层微调加热器',
    unit: '件',
    category: 'part',
    props: [{ param: 'power', kind: 'range', min: 10, max: 30, unit: 'W' }],
  },

  /**
   * **NTC 热敏电阻：Mn–Ni 氧化物珠，100 kΩ @25 °C，B = 3900 K，玻璃封装。**
   *
   * 它是 mK 恒温的**传感器**，也是本层第一只「自己做的温度传感器」——
   * 以前只有热电偶（`std/thermocouple-t-general`，41 µV/K = 0.0041 %/K、±1 K）
   * 与镍 RTD（`plant/mfc/rtd-pair`，0.62 %/K）。热敏电阻的灵敏度是镍 RTD 的
   * **7 倍**、是热电偶的 **1 000 倍**：
   *
   *   α = −B/T² = −3900 / 298.15² = **−4.39 %/K**（镍 RTD 是 +0.62 %/K）
   *   100 kΩ × 4.39 %/K = **4.39 kΩ/K**；1 V 激励、串 100 kΩ 桥 ⇒ 11 mV/K
   *
   * 自热：桥臂功率 (0.5 V)² / 100 kΩ = 2.5 µW，耗散系数 1 mW/K ⇒ **2.5 mK**。
   * 它是恒定偏移，被设定点吸收；变的是「R 变了、功率跟着变」的二阶项，<0.1 mK。
   *
   * 配方：MnO₂（`mat/pyrolusite-concentrate` 的锰矿精矿）+ Ni(OH)₂
   * （`mat/nickel-hydroxide`）按 3:2 摩尔比球磨，750 °C 预烧成 Mn₂O₃–NiO，
   * 1280 °C 烧结成尖晶石。矿里的 SiO₂ 与 Fe 进玻璃相，B 的批次分散 ±5 %，
   * 靠老化分选压到 ±0.2 %（见路线）。
   *
   * ⚠️ 为什么不用铂 RTD：Pt RTD 已建（`make/pt-rtd-pair`，`mat/platinum-wire`）；
   * 本文件仍用热敏电阻，因为铂的 α 只有 0.39 %/K，
   * 比热敏电阻低 11 倍，桥路增益要再高 11 倍才等价。
   */
  {
    id: 'plant/mk-oven/thermistor',
    name: 'NTC 热敏电阻',
    unit: '件',
    category: 'part',
    props: [
      { param: 'resistance', kind: 'range', min: 50000, max: 200000, unit: 'Ω' },
      { param: 'beta', kind: 'range', min: 3500, max: 4200, unit: 'K' },
      { param: 'tolerance', kind: 'range', min: 0.02, max: 0.5, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * **热敏电阻电桥（双通道）：每通道 4 臂（1 只热敏 + 3 只排阻）+ 1 V 直流激励
   * + 正反向换向 + 斩波放大。**
   *
   *   灵敏度   4.39 %/K × 0.25 × 1 V = **11 mV/K**（10 mK = 110 µV）
   *   噪声     √(4kTRB) = √(4×1.38e-23 × 293 × 100 kΩ × 1 Hz) = **40 nV** ⇒ 0.004 mK
   *   分辨     放大器 1000 倍、µV 计读 10 µV 输出端 ⇒ **0.1–1 mK**
   *            （地板不是电阻热噪声，是放大器的 1/f 与接点热电势 1–4 µV）
   *   热电势   铜-铜接点 0.2 µV/K × 0.05 K = 0.01 µV，可忽略；正反向两次读数再扣一遍
   *
   * 每通道三只固定臂取自**同一片排阻**（同批同炉，比值 0.2 %）：
   * 桥的**绝对**平衡点不重要（设定点会被冰点标定拧过来），**漂移**才重要，
   * 而同片排阻的比值漂移是 0.2 %/a 量级 ⇒ 对应 0.5 mK/a，够。
   *
   * **不用交流激励**：热敏电阻是纯阻性，没有极化；交流只会引入相敏检波与
   * 容性耦合。直流 + 正反向换向更简单，噪声也只看电阻热噪声。
   */
  {
    id: 'plant/mk-oven/bridge',
    name: 'mK 热敏电阻电桥',
    unit: '件',
    category: 'part',
    props: [
      { param: 'resolution', kind: 'range', min: 0.1, max: 1, unit: 'mK', dir: 'atMost' },
      { param: 'excitation', kind: 'range', min: 0.2, max: 2, unit: 'V' },
    ],
  },

  /**
   * **双通道模拟 PID：比例 + 积分（运放）+ 晶闸管过零触发功率级。**
   *
   * 两通道各管一级：
   *
   *   通道 1  外层水浴  比例带 0.5 K、积分 1 800 s、输出 0–300 W（晶闸管调功）
   *   通道 2  内层铜块  比例带 0.05 K、积分 600 s、输出 0–20 W（晶闸管调功）
   *
   * 为什么是模拟不是数字：本层有 `std/process-controller-general`（计算机 + ADC），
   * 但它的采样与程序周期在 100 ms 级，而内层的时间常数 3 850 s、要求 0.01 K ——
   * 数字环的量化噪声（12 位 ADC 在 0–20 mV 上是 5 µV = 0.45 mK）刚好卡在判据上。
   * 模拟环没有量化，比例带与积分时间用电位器定，稳定性靠 1 925 J/K 的热容。
   *
   * 晶闸管过零触发（不是相控）：过零触发不产生 100 Hz 的谐波干扰，而相控会在
   * 20 W 的加热丝上产生 0.1 V 级的共模尖峰，那正好落在 µV 计的带宽里。
   */
  {
    id: 'plant/mk-oven/controller',
    name: '双通道模拟 PID',
    unit: '件',
    category: 'part',
    props: [
      { param: 'band', kind: 'range', min: 0.005, max: 0.02, unit: 'K', dir: 'atMost' },
      { param: 'power', kind: 'range', min: 20, max: 300, unit: 'W' },
    ],
  },

  /**
   * **mK 恒温箱：外层水浴 ±0.1 K + 内层铜块 ±10 mK，两个工作点（25.00 / 45.00 °C）。**
   *
   * 装配体（`composedOf`），没有产出路线 —— 与 `plant/metrology-room` 同一写法：
   * 它只维持条件，不执行工序，所以出现在别的路线的 `needs` 里。
   *
   * `holds` 写两段，不是一段 24.99–45.01：`covers()` 判的是区间包含，写成一大段
   * 等于声称「整个 20 K 里都能稳到 0.01 K」—— 那是假的。两个工作点是两个真实工况：
   *
   *   25.00 ±0.01 °C   标准运行点（齐纳、分压串都在这儿）
   *   45.00 ±0.01 °C   温漂筛选点（25 与 45 两点定 ΔV/ΔT）
   *
   * 为什么 25 °C 而不是 30–40 °C：25 °C 离计量间 19–21 °C 只有 4–6 K，水浴的
   * 漏热小、控温余量大；而齐纳的温漂已经在 5 ppm/K 以内，工作点选哪儿不影响指标。
   *
   * 两个工作点之间切换要 3–4 h（40 L 水从 24.5 升到 44.5 要 167 kJ/K × 20 K / 300 W
   * = 3.1 h），所以筛选路线一批只切一次：先 25 °C 测完，再升到 45 °C 测完，再降回来。
   */
  {
    id: 'plant/mk-oven',
    name: 'mK 恒温箱',
    unit: '台',
    category: 'machine',
    holds: [
      { param: 'temperature', min: 24.99, max: 25.01 },
      { param: 'temperature', min: 44.99, max: 45.01 },
    ],
    props: [
      { param: 'stability', kind: 'range', min: 0.005, max: 0.02, unit: 'K', dir: 'atMost' },
      { param: 'volume', kind: 'range', min: 0.2, max: 1, unit: 'L' },
    ],
    composedOf: [
      { item: 'plant/mk-oven/bath', qty: q(1) },
      { item: 'plant/mk-oven/inner', qty: q(1) },
      { item: 'plant/mk-oven/heater', qty: q(1) },
      // 三只：水浴通道 1 只（粗）、铜块通道 1 只（控）+ 1 只（监视）—— 三只都在，
      // 铜块上那两只互查，水浴那只只求 ±0.1 K 的粗调
      { item: 'plant/mk-oven/thermistor', qty: q(3) },
      { item: 'plant/mk-oven/bridge', qty: q(1) },
      { item: 'plant/mk-oven/controller', qty: q(1) },
    ],
  },
];

export const VOLTAGE_REFERENCE_ROUTES: readonly Route[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // 一、精密齐纳：老练 → 配对 → 温漂筛选 → 封装 → 老化
  // ═══════════════════════════════════════════════════════════════════════════

  {
    /**
     * **低温度系数齐纳：20 只通用齐纳筛出 2 只（筛选率 10 %，设计值）。**
     *
     *   通用齐纳 20 + 平面管 4 + 金属壳 2 + 氮 10 g + 铜 0.1 + 玻璃 10 g + 电阻丝 10 g
     *   → 精密齐纳 2 只（6.6–7.1 V、1–5 ppm/K）
     *
     * 四道工序，每道都在回答「凭什么」：
     *
     *   ① **老练** 125 °C、1 mA、168 h。初期漂移（0.1–1 %）在头 100 h 里跑掉大半，
     *      不先跑掉，后面的温漂筛选会被「时间漂移」污染
     *   ② **配对** 25 °C 下逐只测 Vz 与 Vbe，按 Vz + Vbe 落在 6.6–7.1 V 配成一对；
     *      同一只壳里两颗芯片的热阻 <5 K/W，结间温差 <5 mK
     *   ③ **筛选** 25 → 45 °C，20 K 跨度，判据 |ΔV| ≤ 0.69 mV（= 34 µV/K = 5 ppm/K）；
     *      指零电位差计分辨 1–10 µV，判据的 1/70 —— 这一档能读到，不是「大概齐」
     *   ④ **老化** 25 °C、500 h、1 mA，再测一遍，漂移 ≤15 ppm 的收
     *
     * 筛选率为什么是 10 %：补偿后的残余温漂是两颗结的「失配」，失配来自
     * 掺杂浓度与结面积的批次分散（±5 %），落到 34 µV/K 以内的概率约 10–20 %。
     * 取 10 % 是**设计值**，不是实测 —— 第一批 20 只出 2 只是目标，出 0 只就
     * 说明配对工序要改（这一条写在这里，免得把良率当成事实）。
     *
     * ⚠️ 与埋层齐纳的差距：埋层 1–2 ppm/K，本路线 5 ppm/K，差 2.5–5 倍。
     * 补偿靠的是「+2 mV/K 与 −2 mV/K 对消」，对消的残差就是 5 ppm/K；
     * 埋层靠的是**结构**（击穿发生在埋层而不是表面），温漂从根上就小。
     * 要走到埋层，缺的是外延炉（本层没有），不是筛选台。
     */
    id: 'make/zener-reference-precision',
    name: '低温度系数齐纳制造',
    rate: { hours: q(720) },
    produces: [
      {
        item: 'std/zener-reference-precision',
        qty: q(2),
        gives: [
          { param: 'voltage', kind: 'range', min: 6.6, max: 7.1 },
          { param: 'tempco', kind: 'range', min: 1, max: 5 },
          { param: 'drift', kind: 'range', min: 3, max: 15 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/zener-reference-general', qty: q(20) }] },
      { anyOf: [{ item: 'std/planar-transistor-general', qty: q(4) }] },
      { anyOf: [{ item: 'std/metal-can-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1, 100) }] },
    ],
    needs: [
      'plant/mk-oven',
      'plant/metrology-room',
      'plant/probe-station/null-detector',
      'std/dvm-general',
    ],
    steps: [
      {
        note_zh:
          '老练：20 只反偏 1 mA、125 °C 通电 168 h；初期漂移在头 100 h 里跑掉大半（不先跑掉，后面的温漂筛选会被时间漂移污染）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 120, max: 130 }],
      },
      {
        note_zh:
          '25 °C 初测：逐只测 Vz 与 Vbe（1 mA），按 Vz + Vbe 落在 6.6–7.1 V 配成对；两颗芯片装同一只壳，热阻 <5 K/W',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 24.99, max: 25.01 }],
      },
      {
        note_zh:
          '温漂筛选：25 → 45 °C，20 K 跨度，指零法读 ΔV；判据 |ΔV| ≤ 0.69 mV（= 34 µV/K = 5 ppm/K @6.85 V），µV 计分辨 1–10 µV 是判据的 1/70',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 44.99, max: 45.01 }],
      },
      {
        note_zh:
          '复测与封装：合格的 2 对装进 4 引线金属壳（齐纳 +、公共、正向结 +、壳），充氮、玻封引线，壳底留 M3 螺孔压铜块',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 24.99, max: 25.01 }],
      },
      {
        note_zh:
          '老化：25 °C、1 mA、500 h，再测一遍；漂移 ≤15 ppm 的收，>15 ppm 的退回（这一批只出 2 只，退化就是良率下降）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 24.99, max: 25.01 }],
      },
    ],
    unbalanced_zh:
      '齐纳 20 + 平面管 4 + 金属壳 2 → 精密齐纳 2 只（筛选率 10 %，设计值）；退回的是 18 只齐纳与 2 只管（温漂 >5 ppm/K），壳/氮/玻璃按 2 只计。产物按件计，不进 kg 守恒；kg 项 铜 0.1 + 氮 0.01 + 玻璃 0.01 + 电阻丝 0.01 = 0.13 kg，余是引线与壳内焊料',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 二、精密分压：丝印 → 烧成 → 激光调阻 → 烧银 → 镀镍锡 → 自校
  // ═══════════════════════════════════════════════════════════════════════════

  {
    /**
     * **精密分压对：10:1 与 100:1 各一只，同一片基板工艺、同一炉、同一把激光。**
     *
     *   基板 2 片 + 电阻浆 2 g + 银浆 4 g + 镍/锡各 0.4 g
     *   + 铜线 20 g + 接线柱 2 组 + 钢板 0.5 kg → 分压器 2 只
     *
     * 与 `make/resistor-network` 的四处差别，四处都是「为什么它单列」：
     *
     *   ① **调的是比值，不是阻值**：调阻时把第 1 只当基准，逐只切到与它相等；
     *      判据 0.005 %（1 kΩ 上 50 µV），µV 计读得到。绝对值仍是 1–5 % —— 不进公式
     *   ② **10 只，不是 4 只**：10 只才能同时给出 1/10、2/10、5/10 三个抽头；
     *      而 10 只的串/并比正好是 100:1，自校标准是白送的
     *   ③ **四端引出**：每段两端各一对电流/电位端子，引线电阻与焊点热电势在电位端之外
     *   ④ **装壳屏蔽**：0.5 mm 钢板折的盒，盖与盒体三点压接 —— 它防的不是电场，
     *      是**气流**：0.05 K 的不对称气流在 1 ppm/K 的跟踪上是 0.05 ppm，
     *      不加壳时车间气流能到 0.5 K（0.5 ppm，正好吃掉判据的一半）
     *
     * 工序温度都取现有设备的窗口：烧成 850（`plant/resistance-furnace` 100–1100）、
     * 烧银 600、镀镍 50–55、镀锡 20–30（`plant/plating-bath` 20–60）。
     * 调阻在 25.00 °C 下做：10 只的 TCR 跟踪 0.5–1.5 ppm/K，调阻时的温度就是
     * 使用时的温度 —— 这一条把「调完再搬去别处」引入的 0.01 % 漂移直接消掉。
     */
    id: 'make/divider-precision-pair',
    name: '精密分压器 10:1 制造',
    rate: { hours: q(96) },
    produces: [
      {
        item: 'std/divider-10to1-precision',
        qty: q(1),
        gives: [
          { param: 'ratioError', kind: 'range', min: 0.003, max: 0.01 },
          { param: 'tempco', kind: 'range', min: 0.5, max: 1.5 },
          { param: 'resistance', kind: 'range', min: 10000, max: 10000 },
        ],
      },
      {
        item: 'std/divider-100to1-precision',
        qty: q(1),
        gives: [
          { param: 'ratioError', kind: 'range', min: 0.003, max: 0.01 },
          { param: 'tempco', kind: 'range', min: 0.5, max: 1.5 },
          { param: 'resistance', kind: 'range', min: 10000, max: 10000 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/alumina-substrate-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/resistor-paste', qty: q(2, 1000) }] },
      { anyOf: [{ item: 'mat/silver-paste', qty: q(4, 1000) }] },
      { anyOf: [{ item: 'mat/nickel', qty: q(2, 5000) }] },
      { anyOf: [{ item: 'mat/tin', qty: q(2, 5000) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 50) }] },
      { anyOf: [{ item: 'std/terminal-block-8p-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1, 2) }] },
    ],
    needs: [
      'plant/metrology-room',
      'plant/mk-oven',
      'plant/laser-stage',
      'plant/probe-station/null-detector',
      'std/galvanometer-general',
      'std/zener-reference-general',
      'std/photomask-general',
      'std/dvm-general',
    ],
    steps: [
      {
        note_zh:
          '丝印 10 只等值电阻体（1 kΩ/只，100 Ω/□、10 方，宽 0.5 mm）+ 每段两端四端引出（母图 std/photomask-general，紫外曝光显影，湿膜 20 µm）',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '烧成 850 °C 保温 10 min、总周期 60 min；300–500 段 ≤2 K/min（快了酚醛爆燃起泡）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 840, max: 870 }],
      },
      {
        note_zh:
          '激光调阻：193 nm、10.4 mJ/脉冲、400 Hz，切口 10 µm；以第 1 只为基准逐只「测—切—再测」，切到 0.005 %（1 kΩ 上 50 µV）为止；调阻台上温度 25.00 °C —— 调完不再搬',
        performedBy: 'plant/arf-laser',
        under: [{ param: 'temperature', min: 24.99, max: 25.01 }],
      },
      {
        note_zh: '端头浸涂银浆（5 个抽头 × 2 组电流/电位 = 10 个端头，湿膜 30 µm）',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '烧银 600 °C 保温 10 min：玻璃熔接相把银焊在基板上（银本身不润湿氧化铝）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 560, max: 620 }],
      },
      {
        note_zh: '镀镍 3 µm（50–55 °C，瓦特镀液）—— 镍挡银向焊料里扩散，没有镍锡焊时银会被吃掉',
        performedBy: 'plant/plating-bath',
        under: [{ param: 'temperature', min: 50, max: 55 }],
      },
      {
        note_zh: '镀锡 5 µm（20–30 °C，纯锡）',
        performedBy: 'plant/plating-bath',
        under: [{ param: 'temperature', min: 20, max: 30 }],
      },
      {
        note_zh:
          '划片分离（崩边 20–50 µm）+ 装壳：0.5 mm 钢板折盒、三点压接盖、四端接线柱；100:1 那只加 10 对串并联换接柱（手拧，换一次 2 min）',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '比值自校：10:1 串两次（10:1 × 10:1）与 100:1 的串/并比对照，两路独立连接到 ≤0.01 % 才算过',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 24.99, max: 25.01 }],
      },
      {
        note_zh:
          '温度跟踪：45 °C 保温 4 h、回 25 °C，读比值变化（判据 1.5 ppm/K × 20 K = 30 ppm）；超差的说明 10 只的 TCR 不同片，退回',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 44.99, max: 45.01 }],
      },
    ],
    unbalanced_zh:
      '基板 2 + 电阻浆 2 g + 银浆 4 g + 镍 0.4 g + 锡 0.4 g + 铜线 20 g + 接线柱 2 + 钢板 0.5 kg → 分压器 2 只；余是划片崩边、调阻切屑与浸涂挂料。比值 0.003–0.01 %、TCR 跟踪 0.5–1.5 ppm/K 是设计值（调阻判据与同片同炉的物理保证），不是实测 —— 实测走比值自校那一步的记录',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 三、mK 恒温箱的六条零件路线
  // ═══════════════════════════════════════════════════════════════════════════

  {
    /**
     * **外层水浴：1.5 mm 钢板槽 + 300 W 镍铬加热 + 热虹吸 + 50 mm 矿棉。**
     *
     *   钢板 2 + 矿棉 1 + 电阻丝 0.2 + 铜 1 + 水 40 → 水浴 1 件
     *
     * 卷板、焊角、打压：槽体要能装 40 L 水不漏，焊缝 3 mm 双面。
     * 热虹吸两根 φ12 铜管从槽底引到槽顶，管口错开 90°（不然进出水短路）。
     * 加热丝 300 W 绕在槽底的氧化铝管上，用矿棉压住 —— 不让它直接碰水。
     *
     * 24 h 保温试验：装满水、加热到 24.5 °C、关掉加热，测 24 h 的降温曲线；
     * 从曲线反推漏热系数（判据 ≤1.5 W/K），超了就加矿棉。
     */
    id: 'make/mk-oven-bath',
    name: 'mK 外层水浴制造',
    rate: { hours: q(24) },
    produces: [
      {
        item: 'plant/mk-oven/bath',
        qty: q(1),
        gives: [
          { param: 'stability', kind: 'range', min: 0.05, max: 0.2 },
          { param: 'volume', kind: 'range', min: 40, max: 40 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(2) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(1) }] },
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(40) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '卷板、焊槽（1.5 mm 钢板，3 mm 双面角焊）、装盖与铰链',
        performedBy: 'plant/sheet-shop',
      },
      {
        note_zh: '热虹吸：两根 φ12 铜管从槽底引到槽顶，管口错开 90°（不短路）；钎焊',
        performedBy: 'lathe',
      },
      {
        note_zh: '300 W 加热丝绕氧化铝管、压矿棉、装接线柱',
        performedBy: 'plant/winder',
      },
      {
        note_zh: '装 50 mm 矿棉保温层与外壳；满水打压 0.05 MPa 24 h 不漏',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '24 h 保温试验：加热到 24.5 °C 关热，记降温曲线反推漏热（判据 ≤1.5 W/K，对应 25 K 温差 ≤38 W）；超了加矿棉',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '钢板 2 + 矿棉 1 + 电阻丝 0.2 + 铜 1 + 水 40 → 水浴 1 件（约 44 kg，水占 40 kg）；水是装填量，不是被消耗。产物按件计，不进 kg 守恒',
  },

  {
    /**
     * **内层恒温腔：5 kg 紫铜块，腔 φ60 × 120，酚醛盖 + PTFE 引线套管 + 三根 PTFE 柱。**
     *
     *   铜 5 + 酚醛 0.3 + PTFE 0.2 + 铜线 0.05 → 内腔 1 件
     *
     * 铣腔、钻孔、攻丝：腔壁 15 mm。稳态微调功率只有 0.25 W，穿过 0.02 m² 的
     * 铜壁的温差 = 0.25 × 0.015 / (401 × 0.02) = **0.5 mK**；20 W 全功率升温时
     * 才 0.04 K，恒温后没有。三根 PTFE 柱 φ10 × 50 只做支撑（3 × 0.0004 = 0.001 W/K），
     * 热耦合主要走 10 mm 气隙（≈0.5 W/K，见条目注释）—— 柱子不是热阻，气隙才是。
     *
     * 72 h 尺寸稳定化：铜件粗加工后有 0.02–0.05 mm 的残余应力释放，
     * 放在计量间 72 h 再精铣一遍，免得装好后腔体变形把引线扯断。
     */
    id: 'make/mk-oven-inner',
    name: 'mK 内层恒温腔制造',
    rate: { hours: q(16) },
    produces: [
      {
        item: 'plant/mk-oven/inner',
        qty: q(1),
        gives: [
          { param: 'thermalMass', kind: 'range', min: 5, max: 5 },
          { param: 'cavity', kind: 'range', min: 60, max: 60 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(5) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(3, 10) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 20) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '粗铣 120 × 100 × 80 铜块、铣 φ60 × 120 腔（留 0.5 mm 余量）',
        performedBy: 'plant/milling-machine',
      },
      {
        note_zh: '72 h 尺寸稳定化（残余应力释放），再精铣到腔壁 15 mm、底面 Ra 1.6',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '车酚醛盖与 PTFE 引线套管（5 孔：齐纳 2 + 热敏 3）、攻 M3 螺孔',
        performedBy: 'lathe',
      },
      {
        note_zh: '三根 PTFE 柱 φ10 × 50 装到水浴底板，铜块坐上；引线穿孔、封胶',
        performedBy: 'plant/robot',
      },
    ],
    unbalanced_zh:
      '铜 5 + 酚醛 0.3 + PTFE 0.2 + 铜线 0.05 = 5.55 kg → 内腔 1 件（约 5.5 kg，切屑与 PTFE 边角回炉/报废）；产物按件计，不进 kg 守恒',
  },

  {
    /**
     * **内层微调加热器：20 W 镍铬丝绕氧化铝骨架。**
     *
     *   电阻丝 20 g + 氧化铝 0.1 + 铜线 20 g → 加热器 1 件
     *
     * φ0.2 镍铬丝 12 m 绕 20 Ω，1 A 通 20 W；骨架 40 × 30 × 5 mm 氧化铝，
     * 用铜压板贴在铜块侧面（接触热阻 <0.5 K/W，20 W 时骨架比铜块高 10 K —— 可接受，
     * 因为加热丝的温度只影响寿命，不影响控温点）。
     *
     * 24 h 通电老化：20 W 连续跑 24 h，看电阻变化（判据 ≤0.5 %）；
     * 镍铬丝在 300 °C 以下几乎不氧化，这一条主要是查绕制时的机械损伤。
     */
    id: 'make/mk-oven-heater',
    name: 'mK 内层微调加热器制造',
    rate: { hours: q(8) },
    produces: [
      {
        item: 'plant/mk-oven/heater',
        qty: q(1),
        gives: [{ param: 'power', kind: 'range', min: 20, max: 20 }],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 50) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: 'φ0.2 镍铬丝 12 m 绕氧化铝骨架 20 Ω（绕距 0.5 mm，不叠线）', performedBy: 'plant/winder' },
      { note_zh: '装铜压板与两只接线柱、焊引线；绝缘电阻 ≥100 MΩ @500 V', performedBy: 'plant/robot' },
      {
        note_zh: '20 W 通电老化 24 h：电阻变化 ≤0.5 % 收（查绕制机械损伤）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '电阻丝 0.02 + 氧化铝 0.1 + 铜线 0.02 = 0.14 kg → 加热器 1 件；余是绕线边角与引线头。产物按件计，不进 kg 守恒',
  },

  {
    /**
     * **NTC 热敏电阻：Mn–Ni 氧化物珠，100 kΩ @25 °C，B = 3900 K，一批 20 只。**
     *
     *   锰矿精矿 50 g + Ni(OH)₂ 20 g + 玻璃 50 g + 铜线 10 g + 氧化铝 20 g + 水 1 kg
     *   → 热敏电阻 20 只
     *
     * 五道工序：
     *
     *   ① 球磨与混合：MnO₂ + Ni(OH)₂ 按 3:2 摩尔比，水磨 24 h 到 D50 1 µm
     *   ② 预烧 750 °C 2 h：Ni(OH)₂ → NiO，MnO₂ → Mn₂O₃，放出 H₂O 与 O₂
     *   ③ 压珠 φ0.3：造粒（加 5 % PVA）后干压，压力 200 MPa
     *   ④ 烧结 1280 °C 2 h：尖晶石相生成，珠体收缩 18–22 %；这一步决定 B
     *   ⑤ 玻封 + 焊引线 + 老化 100 h @125 °C + 分选
     *
     * 分选：R25 落在 90–110 kΩ、B 落在 3700–4100 K；两只配对（控制 + 监视）
     * 要求 R25 差 ≤0.2 %、B 差 ≤0.5 % —— 配对是在 19–21 °C 的计量间做的，
     * **不要求 25.00 °C**：绝对温度点由冰点标定给（见总路线），热敏电阻只要
     * 重复性，不要绝对准确度。
     *
     * ⚠️ 矿里的 SiO₂ 与 Fe 进玻璃相，B 的批次分散 ±5 %（设计值）；
     * 这是「用矿不用试剂」的代价，靠老化分选压到 ±0.2 %。分选率按 60 % 记。
     */
    id: 'make/mk-oven-thermistor',
    name: 'NTC 热敏电阻制造',
    rate: { hours: q(48) },
    produces: [
      {
        item: 'plant/mk-oven/thermistor',
        qty: q(20),
        gives: [
          { param: 'resistance', kind: 'range', min: 90000, max: 110000 },
          { param: 'beta', kind: 'range', min: 3700, max: 4100 },
          { param: 'tolerance', kind: 'range', min: 0.05, max: 0.2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/pyrolusite-concentrate', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/nickel-hydroxide', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room', 'std/dvm-general'],
    steps: [
      {
        note_zh: '球磨与混合：MnO₂ + Ni(OH)₂ 按 3:2 摩尔比，水磨 24 h 到 D50 1 µm，烘干造粒（5 % PVA）',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '预烧 750 °C 2 h（Ni(OH)₂ → NiO、MnO₂ → Mn₂O₃，放出 H₂O 与 O₂）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 700, max: 800 }],
      },
      { note_zh: '干压 φ0.3 珠，200 MPa（每只 3 mg 粉）', performedBy: 'plant/press' },
      {
        note_zh: '烧结 1280 °C 2 h：尖晶石相生成，珠体收缩 18–22 %；这一步决定 B',
        performedBy: 'plant/kiln',
        under: [{ param: 'temperature', min: 1250, max: 1300 }],
      },
      {
        note_zh: '玻封（650 °C 玻璃粉包覆）、焊 φ0.2 铜引线、绝缘 ≥100 MΩ',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 600, max: 700 }],
      },
      {
        note_zh: '老化 100 h @125 °C（把 B 的初期漂移跑掉）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 120, max: 130 }],
      },
      {
        note_zh:
          '分选与配对：R25 90–110 kΩ、B 3700–4100 K；控制/监视两只配对 R25 差 ≤0.2 %、B 差 ≤0.5 %（19–21 °C 下量，绝对点由冰点标定给）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '锰矿精矿 0.05 + Ni(OH)₂ 0.02 + 玻璃 0.05 + 铜线 0.01 + 氧化铝 0.02 + 水 1 → 热敏电阻 20 只；水走掉，余是球磨损失与玻封挂料。分选率 60 %（设计值），不足 20 只按 60 % 折。产物按件计，不进 kg 守恒',
  },

  {
    /**
     * **热敏电阻电桥（双通道）：每通道 4 臂 + 1 V 激励 + 正反向换向 + 斩波放大。**
     *
     *   排阻 2 + 运放 4 + 薄膜电容 4 + 铜线 0.1 + 钢板 0.5 + 接线柱 4 + 酚醛 0.1
     *   → 电桥 1 件
     *
     * 两通道各三只固定臂，取自**同一片排阻**（比值 0.2 %）：桥的绝对平衡点不重要，
     * 漂移才重要。第四臂接热敏电阻（引线从内腔穿出，三线制：一根激励、两根电位，
     * 引线电阻在电位端之外）。通道 1 接水浴那只（粗），通道 2 接铜块那两只
     * （一只控制、一只监视，两只互查）。
     *
     * 斩波放大：每通道两只运放做成 1000 倍、带宽 10 Hz 的直流放大器；斩波频率 50 Hz
     * （机械斩波器），把 1/f 噪声与失调漂移搬到 50 Hz 再滤掉 —— 这是本层
     * 唯一不用「零漂运放」就能做到 1 µV 级直流放大的办法（没有 chopper 芯片）。
     */
    id: 'make/mk-oven-bridge',
    name: 'mK 热敏电阻电桥制造',
    rate: { hours: q(24) },
    produces: [
      {
        item: 'plant/mk-oven/bridge',
        qty: q(1),
        gives: [
          { param: 'resolution', kind: 'range', min: 0.1, max: 1 },
          { param: 'excitation', kind: 'range', min: 1, max: 1 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'std/resistor-network-general',
            qty: q(2),
            need: [{ param: 'tolerance', kind: 'range', max: 5, dir: 'atMost' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(4) }] },
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(4) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1, 2) }] },
      { anyOf: [{ item: 'std/terminal-block-8p-general', qty: q(4) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1, 10) }] },
    ],
    needs: ['plant/metrology-room', 'std/dvm-general'],
    steps: [
      {
        note_zh: '两通道各装 4 臂：3 只排阻 + 1 只热敏三线接法；1 V 激励、正反向换向开关',
        performedBy: 'plant/robot',
      },
      {
        note_zh: '斩波放大：50 Hz 机械斩波 + 两级 1000 倍、带宽 10 Hz；零位与增益调试（输入短路看漂移 ≤1 µV/10 min）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '48 h 连续通电老化：零位漂移 ≤5 µV、噪声 ≤2 µV（判据对应 0.2 mK）',
        performedBy: 'plant/robot',
      },
    ],
    unbalanced_zh:
      '排阻 2 + 运放 4 + 薄膜电容 4 + 铜线 0.1 + 钢板 0.5 + 接线柱 4 + 酚醛 0.1 → 电桥 1 件；余是屏蔽盒边角与引线头。产物按件计，不进 kg 守恒',
  },

  {
    /**
     * **双通道模拟 PID：比例 + 积分 + 晶闸管过零触发，两路输出（300 W / 20 W）。**
     *
     *   运放 4 + 薄膜电容 4 + 晶闸管 2 + 电阻丝 0.05 + 铜线 0.2 + 钢板 1
     *   + 接线柱 2 + 酚醛 0.1 → 控制器 1 件
     *
     * 通道 1（水浴）：比例带 0.5 K、积分 1 800 s；通道 2（铜块）：比例带 0.05 K、
     * 积分 600 s。比例带用电位器定，积分时间用电容换挡（1 µF/10 µF/100 µF 三档）。
     *
     * 整定用**阶跃法**（Ziegler–Nichols 的简化版）：把加热从 0 跳到 50 %，
     * 记到达 63 % 的时间（水浴 40 L 的热惯性 167 kJ/K 下是小时级，铜块是
     * 3 850 s 级），积分时间取它的 0.3–1 倍、比例带按超调 <10 % 定 ——
     * 这是工程惯例，不是最优，但 1 925 J/K 的热容让系统本来就很钝，
     * 钝系统不需要聪明控制器。
     *
     * 晶闸管过零触发：不在正弦上切口，只在过零点开关，不产生 100 Hz 谐波
     * 与共模尖峰（µV 计的带宽里不能有 0.1 V 的尖峰）。
     */
    id: 'make/mk-oven-controller',
    name: '双通道模拟 PID 制造',
    rate: { hours: q(24) },
    produces: [
      {
        item: 'plant/mk-oven/controller',
        qty: q(1),
        gives: [
          { param: 'band', kind: 'range', min: 0.005, max: 0.02 },
          { param: 'power', kind: 'range', min: 300, max: 300 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(4) }] },
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(4) }] },
      { anyOf: [{ item: 'std/thyristor-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'std/terminal-block-8p-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1, 10) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '装两路比例 + 积分（运放 4、积分电容三档）、晶闸管过零触发与散热片', performedBy: 'plant/robot' },
      {
        note_zh:
          '阶跃整定：加热 0 → 50 %，记到达 63 % 的时间（铜块 ≈3 850 s）；积分取该时间的 0.3–1 倍（600 s）、比例带按超调 <10 % 定（0.05 K）；水浴通道积分取 1 800 s',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      { note_zh: '48 h 连续运行：两路输出纹波 ≤1 %、晶闸管温升 ≤40 K', performedBy: 'plant/robot' },
    ],
    unbalanced_zh:
      '运放 4 + 薄膜电容 4 + 晶闸管 2 + 电阻丝 0.05 + 铜线 0.2 + 钢板 1 + 接线柱 2 + 酚醛 0.1 → 控制器 1 件；余是面板与散热片边角。产物按件计，不进 kg 守恒',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 四、总路线：A/B 两只同批，传递 0.005–0.02 %
  // ═══════════════════════════════════════════════════════════════════════════

  {
    /**
     * **1–10 V 标准电压基准 A/B：同批两只，各写一份证书。**
     *
     *   精密齐纳 2 + 10:1 分压 2 + 运放 12 + 排阻 4 + 薄膜电容 6
     *   + 铜线 0.2 + 钢板 3 + 酚醛 0.3 + 接线柱 4 + 氮 50 g → 基准 2 只
     *
     * ── 每只基准里有什么 ─────────────────────────────────────────────────
     *
     *   ① 6.85 V 补偿齐纳，压在 5 kg 铜块上（`plant/mk-oven/inner`），壳温 = 块温
     *   ② 增益级：×1.4599（= 10.000 / 6.85），Rf/Rg 用同一片排阻的两只（比值 0.2 %）；
     *      **不追 10.0000 V** —— 增益的绝对值由齐纳的绝对项限着（0.2 %），追也没用。
     *      10 V 档实际值由传递测出、写进证书；要的是「值已知且稳」，不是「值等于标称」
     *   ③ 分压串：`std/divider-10to1-precision`（10 kΩ），抽头 1 / 2 / 5 / 10 V，
     *      档间比值 0.003–0.01 % —— 这一项才是本路线真正交付的精度
     *   ④ 四只缓冲：每档一只跟随器，输出阻抗 <1 Ω —— 没有它，10 kΩ 的串被
     *      10 MΩ 的 DVM 一挂就是 0.1 % 的负载误差（10 kΩ/10 MΩ），正好吃掉判据
     *   ⑤ 壳：钢板折盒 + 三点压接盖 + 接线柱；壳与电路之间只一点接地
     *
     * ── 传递不确定度预算（设计值，方和根） ──────────────────────────────
     *
     *   分压比（10:1，四端，激光调到 0.003 %）           0.005 %
     *   比值温度跟踪 1 ppm/K × 0.01 K                    0.00001 %
     *   指零分辨 10 µV / 10 V                            0.0001 %
     *   接点热电势 1 µV / 10 V（正反向两次扣）            0.00001 %
     *   缓冲失调漂移 5 µV/K × 0.01 K + 10 µV/a            0.0002 %
     *   泄漏与负载（缓冲 <1 Ω 对 10 MΩ）                  <0.0001 %
     *   ────────────────────────────────────────────────
     *   方和根                                           **0.005 %**
     *   取 0.005–0.02 % 作交付窗口（含 100:1 自校那一步的余量）
     *
     * ── 绝对项为什么不在 gives 里 ───────────────────────────────────────
     *
     * 本层没有绝对伏特（§五）：0.2 % = 2000 ppm。gives 里的 `tolerance`
     * 0.01–0.05 % 是**传递与复现**的口径，不是绝对准确度；绝对项写在证书上
     * 单独一栏（0.2 %），不混进 gives —— 混进去就是把「传递」偷换成「绝对」。
     *
     * ── 冰点那一步为什么必须有 ─────────────────────────────────────────
     *
     * mk-oven 的 25.00 °C 是**设定点**，不是**绝对温度**：热敏电阻的 R25 有
     * ±0.2 % 的分散（`make/mk-oven-thermistor` 的分选判据），对应 0.05 K 的
     * 设定点误差，再乘齐纳的 5 ppm/K = 0.25 ppm —— 不影响电压，但影响「这台
     * 箱子到底是不是 25.00」。冰点（0–0.02 °C，`plant/subnm-thermostat`）
     * 给出一个**不需要温度计**的绝对点：把热敏电阻的 R0 量出来，按 B 值推 R25，
     * 反算设定点电位器该拧到哪。这一步只做一次，之后箱子自己保持。
     */
    id: 'make/standard-voltage-reference-pair',
    name: '标准电压基准对装配',
    rate: { hours: q(168) },
    produces: [
      {
        item: 'plant/hv-test-bench/standard-voltage-reference',
        qty: q(1),
        gives: [
          { param: 'voltage', kind: 'range', min: 1, max: 10 },
          { param: 'tolerance', kind: 'range', min: 0.01, max: 0.05 },
          { param: 'tempco', kind: 'range', min: 1, max: 5 },
        ],
      },
      {
        item: 'plant/hv-test-bench/standard-voltage-reference-b',
        qty: q(1),
        gives: [
          { param: 'voltage', kind: 'range', min: 1, max: 10 },
          { param: 'tolerance', kind: 'range', min: 0.01, max: 0.05 },
          { param: 'tempco', kind: 'range', min: 1, max: 5 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'std/zener-reference-precision',
            qty: q(2),
            need: [{ param: 'tempco', kind: 'range', max: 5, dir: 'atMost' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      {
        anyOf: [
          {
            item: 'std/divider-10to1-precision',
            qty: q(2),
            need: [{ param: 'ratioError', kind: 'range', max: 0.01, dir: 'atMost' }],
            onRelax: 'functional-kept',
          },
        ],
      },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(12) }] },
      { anyOf: [{ item: 'std/resistor-network-general', qty: q(4) }] },
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(6) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(3) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(3, 10) }] },
      { anyOf: [{ item: 'std/terminal-block-8p-general', qty: q(4) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 20) }] },
    ],
    needs: [
      'plant/mk-oven',
      'plant/subnm-thermostat',
      'plant/metrology-room',
      'plant/probe-station/null-detector',
      'std/divider-100to1-precision',
      'std/dvm-general',
    ],
    steps: [
      {
        note_zh:
          '装齐纳：A/B 各一只精密齐纳拧在内腔铜块上（M3、涂硅脂？没有硅油 —— 干压 + 0.05 mm 铜箔），四线引出（激励 2 + 电位 2）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 24.99, max: 25.01 }],
      },
      {
        note_zh:
          '装增益级与四只缓冲：6.85 V × 1.4599 = 10.000 V 标称（Rf/Rg 同一片排阻两臂，比值 0.2 %）；四档跟随器各一只。增益绝对值不调 —— 由齐纳的 0.2 % 绝对项限着',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 24.99, max: 25.01 }],
      },
      {
        note_zh:
          '冰点标定热敏电阻：把控制热敏电阻贴着冰点瓶（0 °C 相变腔，`plant/subnm-thermostat`）量 R0（判据 ±0.02 % = ±5 mK），按 B 推 R25，反算 25.00 °C 设定点电位器',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 0, max: 0.02 }],
      },
      {
        note_zh:
          '比值自校：10:1 串两次 vs 100:1 的串/并比（Hamon），两路独立连接差 ≤0.01 % 才算过；过不了的退回 make/divider-precision-pair',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 24.99, max: 25.01 }],
      },
      {
        note_zh:
          '传递：10 V 主档加 10 kΩ 串（1 mA），指零法逐档比对 1 / 2 / 5 / 10 V —— 只用 µV 计的零位（1–10 µV），不用它的刻度准确度；每档正反向各读 3 次',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 24.99, max: 25.01 }],
      },
      {
        note_zh:
          '比值定标与记值：用 10:1 串两次（Hamon）确认档间比值（判据 0.005 %）；10 V 档的绝对值按齐纳传递，只记不调 —— 证书写「10 V 档实测值 + 档间比值 + 绝对项 0.2 %」三行',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 24.99, max: 25.01 }],
      },
      {
        note_zh:
          '温度循环：45 °C 保温 4 h → 回 25 °C 保温 12 h，读回差（判据 ≤2 ppm = 20 µV @10 V）；超差的查焊点与热电势',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 44.99, max: 45.01 }],
      },
      {
        note_zh:
          '24 h 稳定性与噪声：每 10 min 读一次 10 V 档，1 h 漂移 ≤1 ppm、24 h ≤3 ppm、噪声 ≤0.5 ppm（指零法读差值）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 24.99, max: 25.01 }],
      },
      {
        note_zh:
          '写证书：A/B 各一份，四档值 + 传递不确定度 0.005–0.02 % + 绝对项 0.2 %（单列一栏，标注「无本地绝对伏特」）+ 温度系数 1–5 ppm/K；两只不互相引用读数',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 24.99, max: 25.01 }],
      },
    ],
    unbalanced_zh:
      '传递与复现 0.005–0.02 % 是本路线交付的东西；绝对项 0.2 % = 2000 ppm 不在本路线里（本层没有绝对伏特：冰点只给温度，塞贝克系数只有书本值 ±0.2 %）。相对 0.01 % 目标差 20 倍，相对韦斯顿电池 20 ppm 差 100 倍。kg 项 铜线 0.2 + 钢板 3 + 酚醛 0.3 + 氮 0.05 = 3.55 kg，另加 件 项 齐纳 2 + 分压 2 + 运放 12 + 排阻 4 + 电容 6 + 接线柱 4 → 基准 2 只；两只同批、各写一份证书，同批的共同偏差查不出（独立第二套仍要进口或另一条工艺路线）',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...VOLTAGE_REFERENCE_ITEMS];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/mk-oven',
    name: 'mK 恒温箱装配',
    produces: [{
      item: 'plant/mk-oven',
      qty: q(1),
      gives: [
      { param: 'stability', kind: 'range', min: 0.005, max: 0.02, dir: 'atMost' },
      { param: 'volume', kind: 'range', min: 0.2, max: 1 },
      ],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...VOLTAGE_REFERENCE_ROUTES, ...ASSEMBLY_ROUTES];
