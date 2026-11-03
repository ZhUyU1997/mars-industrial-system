/**
 * 测量种子 —— 量块组 + PD 仪器 + UHF 分析仪。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 这批种子解决什么
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 之前 A 链缺的三件，不再用“没实测”挡着，直接按**进口测量种子**接进
 * `plant/hv-test-bench`：
 *
 *   plant/hv-test-bench/standard-capacitor-100pf    量块：100 pF 标准电容
 *   plant/hv-test-bench/standard-voltage-reference  量块：1–10 V 齐纳基准
 *   plant/hv-test-bench/pd-calibrator-reference     量块：1–100 pC 校准器
 *   plant/hv-test-bench/pd-detector-iec60270        IEC 60270 PD 检测仪
 *   plant/hv-test-bench/pd-free-source-100k         PD-free 100 kV 源
 *   plant/hv-test-bench/uhf-pd-analyzer             UHF 快源 + PDI/PRPD 整机
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 六件里哪些已经本地化、哪些没有
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   · 100 pF 标准电容 A/B：**已有路线** `make/standard-capacitor-100pf-pair`
 *     （measurement-local.ts）。几何 C = ε₀A/d，比较仪 + 量块量 A 与 d；
 *     A/B 同批两只、各自写几何证书。
 *   · pC 校准器 A/B：**已有路线** `make/pd-calibrator-reference`
 *     （measurement-local.ts）。Q = C·V，C 用本地 100 pF 标准，
 *     V 用下面这条 1–10 V 标准；绝对溯源仍到进口电压基准。
 *   · 1–10 V 基准 A/B：**已有本地路线** `make/standard-voltage-reference-pair`
 *     （`data/machine/voltage-reference.ts`）：补偿齐纳 ≤5 ppm/K + mK 恒温箱
 *     + 10:1/100:1 精密分压 + 指零传递。传递 0.005–0.02 %；绝对项仍 0.2 %
 *     （无绝对伏特），数字在那份文件头 §五。R9 名单里这两条应随之删除。
 *
 * R9 名单目前仍暂列 1–10 V 基准 A/B 两条（已有本地路线，待删）；PD 检测仪/PD-free 源/UHF 分析仪是整机，
 * 不在本文件的六件里。PD-free 源与 UHF 分析仪现在有本地路线
 * （`data/machine/uhf-pd.ts` 的 `make/pd-free-source-100k` /
 * `make/uhf-pd-analyzer`）；本文件只保留整机条目的规格窗口。
 */

import type { Item } from '../../src/index.ts';

export const MEASUREMENT_SEED_ITEMS: readonly Item[] = [
  /**
   * 量块：100 pF 标准电容。0.1–1%、1 kV、低损耗。
   *
   * **本地有路线**：`make/standard-capacitor-100pf-pair`（measurement-local.ts）
   * 产 A/B 两只同批电容：φ80 平行板 + guard + PTFE 垫，C = ε₀A/d 由几何定，
   * 比较仪 + 量块量 A 与 d，按 0.1–0.5% 交。A/B 同一条路线、同一批 ——
   * 分开两条路线就是两批，批间差会被互比读成漂移。
   *
   * ⚠️ 低损耗靠空气/PTFE 与 guard；铝极板氧化会让 tanδ 变差，
   * 本层没有 tanδ 测量，按设计值记（缺口）。
   */
  {
    id: 'plant/hv-test-bench/standard-capacitor-100pf',
    name: '100 pF Standard Capacitor A', name_zh: '100 pF 标准电容 A',
    unit: '件',
    category: 'part',
    props: [
      { param: 'capacitance', kind: 'range', min: 90, max: 110, unit: 'pF' },
      { param: 'tolerance', kind: 'range', min: 0.1, max: 1, unit: '%', dir: 'atMost' },
      { param: 'voltage', kind: 'range', min: 0, max: 1000, unit: 'V', dir: 'atLeast' },
    ],
  },

  /**
   * 量块：1–10 V 齐纳基准，0.01–0.1%。
   *
   * **本地已有路线**：`make/standard-voltage-reference-pair`
   * （`data/machine/voltage-reference.ts`）。三件中间件都建了：
   *
   *   ① 低温度系数齐纳 `std/zener-reference-precision`：6.2 V 发射结与平面管
   *      发射结**正偏串联**（+2 mV/K 与 −2 mV/K 对消），20 只筛 2 只（10 %），
   *      ≤5 ppm/K；不是埋层齐纳（本层没有外延炉）——差距与理由写在条目上
   *   ② mK 恒温箱 `plant/mk-oven`：外层水浴 ±0.1 K → 内层铜块 ±10 mK，
   *      两个工作点 25.00 / 45.00 °C；分辨 0.1–1 mK，控制带 ±5–20 mK
   *   ③ 0.01 % 传递：10:1 / 100:1 精密分压（激光调阻到比值 0.003–0.01 %）
   *      + `plant/probe-station/null-detector` 指零 + 冰点（0–0.02 °C）标定设定点
   *
   * A/B 同批两只（一条路线产两只），各自写证书，证书值互不引用；
   * 传递不确定度 0.005–0.02 %（设计值）。同批 ≠ 独立第二套 —— 共同偏差查不出。
   *
   * ⚠️ **绝对项仍是缺口**（不在 gives 里，单列在证书上）：本层没有绝对伏特 ——
   * 韦斯顿电池要 Hg/Cd（`mat/` 0 条），约瑟夫森要 He（0 条），量子霍尔要 2DEG + 10 T。
   * 本地绝对口径 0.2 %（2000 ppm，`unblock-dvm.ts:106` 的塞贝克 ±0.2 %），
   * 比 0.01 % 目标差 20 倍、比韦斯顿电池 20 ppm 差 100 倍。数字在
   * voltage-reference.ts 文件头 §五。
   */
  {
    id: 'plant/hv-test-bench/standard-voltage-reference',
    name: 'Standard Voltage Reference A', name_zh: '标准电压基准 A',
    unit: '件',
    category: 'part',
    props: [
      { param: 'voltage', kind: 'range', min: 1, max: 10, unit: 'V' },
      { param: 'tolerance', kind: 'range', min: 0.01, max: 0.1, unit: '%', dir: 'atMost' },
      { param: 'tempco', kind: 'range', min: 1, max: 10, unit: 'ppm/K', dir: 'atMost' },
    ],
  },

  /**
   * 量块：1–100 pC 校准器，≤1 µs、±1–3%。
   *
   * **本地有路线**：`make/pd-calibrator-reference`（measurement-local.ts）
   * 产 A/B 两台：100 pF 电荷电容 + 晶闸管阶跃 + 0–1 V 基准；
   * Q = C·V，C 用本地 100 pF 标准、V 用 1–10 V 标准。
   *
   * ⚠️ 绝对溯源仍到进口 1–10 V 基准（R9 仍豁免）；上升沿靠晶闸管
   * 分选 0.5–1 µs。2–3% 是设计窗口（含杂散电容与分压误差），
   * 不是实测 —— 10/50/100 pC 三点校准记录才是读数。
   */
  {
    id: 'plant/hv-test-bench/pd-calibrator-reference',
    name: 'pC Calibrator Reference A', name_zh: 'pC 校准器基准 A',
    unit: '台',
    category: 'part',
    props: [
      { param: 'charge', kind: 'range', min: 1, max: 100, unit: 'pC' },
      { param: 'riseTime', kind: 'range', min: 0.5, max: 1, unit: 'µs' },
      { param: 'accuracy', kind: 'range', min: 1, max: 3, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * IEC 60270 PD 检测仪。1–1000 pC、100–400 kHz、±3–5%。
   */
  {
    id: 'plant/hv-test-bench/pd-detector-iec60270',
    name: 'IEC 60270 PD Detector', name_zh: 'IEC 60270 PD 检测仪',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'charge', kind: 'range', min: 1, max: 1000, unit: 'pC' },
      { param: 'bandwidth', kind: 'range', min: 100, max: 400, unit: 'kHz' },
      { param: 'accuracy', kind: 'range', min: 3, max: 5, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 第二套独立量块：100 pF 标准电容 B（互比用，不是复制 A）。
   *
   * **本地有路线**：与 A 同一条 `make/standard-capacitor-100pf-pair`，
   * 同批两只、各自量几何、各自写证书。B 的值不引用 A 的读数。
   *
   * ⚠️ 同批意味着共同偏差查不出；要真正独立的第二套，仍得进口
   * （与 `pd-intercompare.ts` 的口径一致）。
   */
  {
    id: 'plant/hv-test-bench/standard-capacitor-100pf-b',
    name: '100 pF Standard Capacitor B', name_zh: '100 pF 标准电容 B',
    unit: '件',
    category: 'part',
    props: [
      { param: 'capacitance', kind: 'range', min: 90, max: 110, unit: 'pF' },
      { param: 'tolerance', kind: 'range', min: 0.1, max: 1, unit: '%', dir: 'atMost' },
      { param: 'voltage', kind: 'range', min: 0, max: 1000, unit: 'V', dir: 'atLeast' },
    ],
  },

  /**
   * 第二套独立量块：1–10 V 齐纳基准 B。
   *
   * **本地已有路线**：与 A 同一条 `make/standard-voltage-reference-pair`，
   * 同批两只、各自标定、各写一份证书。
   *
   * ⚠️ 同批 ≠ 独立第二套：两只的共同偏差（同一只齐纳筛选台、同一套分压串的比值）
   * 查不出。要真正独立的第二套，仍得进口或另走一条工艺路线 ——
   * 与 `pd-intercompare.ts` 的“独立种子”口径一致。
   * 绝对项同 A：0.2 %（缺口，见 voltage-reference.ts §五）。
   */
  {
    id: 'plant/hv-test-bench/standard-voltage-reference-b',
    name: 'Standard Voltage Reference B', name_zh: '标准电压基准 B',
    unit: '件',
    category: 'part',
    props: [
      { param: 'voltage', kind: 'range', min: 1, max: 10, unit: 'V' },
      { param: 'tolerance', kind: 'range', min: 0.01, max: 0.1, unit: '%', dir: 'atMost' },
      { param: 'tempco', kind: 'range', min: 1, max: 10, unit: 'ppm/K', dir: 'atMost' },
    ],
  },

  /**
   * 第二套独立量块：1–100 pC 校准器 B。
   *
   * **本地有路线**：与 A 同一条 `make/pd-calibrator-reference`，
   * 同批两台、各自标定。⚠️ 同批同链，共同偏差查不出；
   * 要独立第二套仍得进口。
   */
  {
    id: 'plant/hv-test-bench/pd-calibrator-reference-b',
    name: 'pC Calibrator Reference B', name_zh: 'pC 校准器基准 B',
    unit: '台',
    category: 'part',
    props: [
      { param: 'charge', kind: 'range', min: 1, max: 100, unit: 'pC' },
      { param: 'riseTime', kind: 'range', min: 0.5, max: 1, unit: 'µs' },
      { param: 'accuracy', kind: 'range', min: 1, max: 3, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 第二台 INDEPENDENT IEC 60270 检测仪 B，做 A/B 互比。
   */
  {
    id: 'plant/hv-test-bench/pd-detector-iec60270-b',
    name: 'IEC 60270 Partial Discharge Detector B', name_zh: 'IEC 60270 局放检测仪 B',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'charge', kind: 'range', min: 1, max: 1000, unit: 'pC' },
      { param: 'bandwidth', kind: 'range', min: 100, max: 400, unit: 'kHz' },
      { param: 'accuracy', kind: 'range', min: 3, max: 5, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * PD-free 100 kV 源。空载 ≤1 pC、0–100 µA。
   *
   * **已有本地路线**：`make/pd-free-source-100k`（`data/machine/uhf-pd.ts`）。
   * 路线把 `source-100k`（102 kV 空载 / 100 kV@22 µA、纹波 3 %）+
   * `source-100k-retrofit` 的 SF₆ 箱/均压环，换成真空浇注环氧绝缘件：
   * 环氧树脂 + 苯酐 + 硅微粉，真空脱气 ≤0.5 vol%，150–180 °C / 3–5 MPa 固化。
   * 设计局放 **0.2–0.8 pC**（Earth 工程值），比 retrofit 的 1–3 pC 低 2–4 倍。
   *
   * ⚠️ 0.2–0.8 pC 是设计值，不是实测。测量侧仍受 `pd-uncertainty.ts`
   * 的 U@1 pC = 1.317 pC（132 %）限制；`measure/pd-free-source-pd`
   * 记录的是“源 + IEC 60270 检测器 + 屏蔽舱”这一套链上的读数，
   * 不是绝对 1 pC 溯源。`measure/pd-source-background-spec` 的
   * 0.5–1.5 pC 是种子规格闭合，实测仍走 `measure/pd-source-background`。
   */
  {
    id: 'plant/hv-test-bench/pd-free-source-100k',
    name: 'PD-Free 100 kV Source', name_zh: 'PD-free 100 kV 源',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'measure/voltage', kind: 'range', min: 0, max: 100000, unit: 'V', dir: 'atLeast' },
      { param: 'measure/pdLevel', kind: 'range', min: 0, max: 1, unit: 'pC', dir: 'atMost' },
      { param: 'current', kind: 'range', min: 0, max: 100, unit: 'µA', dir: 'atLeast' },
    ],
  },

  /**
   * UHF 快源 + PDI/PRPD 整机。300 MHz–1.5 GHz、<1 ns、1–4 通道。
   *
   * **已有本地路线**：`make/uhf-pd-analyzer`（`data/machine/uhf-pd.ts`）。
   * 三件中间件都建了：
   *   ① GHz 低噪前放：SiGe HBT f_T 35–50 GHz，两级各 20 dB @1.5 GHz
   *      ⇒ 每级 15 GHz GBW，2–3 倍余量；不需要单级 100 GHz GBW。
   *   ② 检波：Si 肖特基 W/n-Si，C_j 0.05–0.15 pF、f_T 150–300 GHz。
   *   ③ 采样：等效时间采样，2 GS/s 实时 / 2–4 GS/s 等效，1–5 ps 步进，
   *      300–1500 MHz、8–10 bit；PRPD 256 格 × 1000 周期。
   *
   * 整机设计值：带宽 300–1500 MHz、灵敏度 **-75…-65 dBm**、40 dB 增益、
   * NF 0.8–1.3 dB。天线单独做到 300–1500 MHz（旧 `pd-sensor` UHF 段只到
   * 1000 MHz，差 500 MHz）。
   *
   * ⚠️ 灵敏度与 PRPD 是设计值（Earth 工程值），不是实测；实测走
   * `measure/uhf-pd-sensitivity`（五点扫频 + 火花源相位参考）。
   */
  {
    id: 'plant/hv-test-bench/uhf-pd-analyzer',
    name: 'UHF Fast Source', name_zh: 'UHF 快源',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'measure/bandwidth', kind: 'range', min: 300, max: 1500, unit: 'MHz' },
      { param: 'fastRise', kind: 'range', min: 0, max: 1, unit: 'ns', dir: 'atMost' },
      { param: 'channels', kind: 'range', min: 1, max: 4, unit: '路' },
      { param: 'measure/sensitivity', kind: 'range', min: -100, max: -50, unit: 'dBm', dir: 'atMost' },
      { param: 'measure/noiseFigure', kind: 'range', min: 0.5, max: 3, unit: 'dB', dir: 'atMost' },
      { param: 'phaseBins', kind: 'range', min: 64, max: 512, unit: '格' },
      { param: 'prpdCycles', kind: 'range', min: 100, max: 10000, unit: '周波' },
    ],
  },
];

import type { Route } from '../../src/index.ts';

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...MEASUREMENT_SEED_ITEMS];
export const DATA_ROUTES: readonly Route[] = [];
