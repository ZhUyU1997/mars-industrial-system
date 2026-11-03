/**
 * PD 测量路线与记录 —— 按 R13 从 material/pd-*.ts 迁出。
 *
 * 只放 Item + Route；不放注册表或额外结构。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const PD_MEASURE_ITEMS: readonly Item[] = [
  /**
   * 空载 PD 背景记录。数据件：电压、q、率、温度。
   */
  {
    id: 'mat/pd-background-record',
    name: 'No-Load PD Background Record', name_zh: '空载 PD 背景记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'voltage', kind: 'range', min: 0, max: 100000, unit: 'V' },
      { param: 'backgroundCharge', kind: 'range', min: 0, max: 100, unit: 'pC' },
      { param: 'backgroundRate', kind: 'range', min: 0, max: 10000, unit: 'Hz' },
      { param: 'temperature', kind: 'range', min: 15, max: 30, unit: '°C' },
    ],
  },

  /**
   * PD 校准记录。刻度、线性、不确定度。
   */
  {
    id: 'mat/pd-calibration-record',
    name: 'PD Calibration Record', name_zh: 'PD 校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'scaleFactor', kind: 'range', min: 0.1, max: 100, unit: 'pC/V' },
      { param: 'linearity', kind: 'range', min: 0, max: 20, unit: '%', dir: 'atMost' },
      { param: 'uncertainty', kind: 'range', min: 1, max: 10, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * A/B 互比记录。刻度差、线性差、一致性。
   */
  {
    id: 'mat/pd-intercomparison-record',
    name: 'A/B Intercomparison Record', name_zh: 'A/B 互比记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'deltaScale', kind: 'range', min: 0, max: 20, unit: '%', dir: 'atMost' },
      { param: 'deltaLinearity', kind: 'range', min: 0, max: 20, unit: '%', dir: 'atMost' },
      { param: 'agreement', kind: 'range', min: 80, max: 100, unit: '%' },
    ],
  },

  /**
   * PD 绝对 pC 不确定度预算。逐项、分布、合成与判据见文件头。
   *
   * 这份记录回答的是“一个 pC 读数能信到哪”，不是“仪器好不好”：
   *
   *   1 pC：u_c = 0.658 pC，U = 1.317 pC = 132 % → 1 pC 门槛判不了
   *   10 pC：u_c = 0.743 pC，U = 1.486 pC = 14.9 % → ±20 % 可判
   *
   * 主导项是读数分辨（0.289 pC）与重复性（0.591 pC）；相对项合计
   * 3.465 %。**没有为了好看去缩这两项** —— 它们正是本层读出链的短板。
   */
  {
    id: 'mat/pd-uncertainty-budget',
    name: 'PD Absolute pC Uncertainty Budget', name_zh: 'PD 绝对 pC 不确定度预算',
    unit: '份',
    category: 'part',
    props: [
      { param: 'k', kind: 'range', min: 1.5, max: 2.5, unit: '1' },

      // 逐项标准不确定度。相对项以“读数百分比”记，绝对项以 pC 记；
      // 各自的分布用 dist* 声明，合成方法见文件头。
      { param: 'uStandardCapacitor', kind: 'range', min: 0.4, max: 0.8, unit: '%' },
      { param: 'uCalibrator', kind: 'range', min: 1.5, max: 2, unit: '%' },
      { param: 'uDetectorLinearity', kind: 'range', min: 2.5, max: 3.2, unit: '%' },
      { param: 'uAttenuator', kind: 'range', min: 0.4, max: 0.8, unit: '%' },
      { param: 'uTemperature', kind: 'range', min: 0.04, max: 0.08, unit: '%' },
      { param: 'uResolution', kind: 'range', min: 0.25, max: 0.35, unit: 'pC' },
      { param: 'uRepeatability', kind: 'range', min: 0.5, max: 0.7, unit: 'pC' },
      { param: 'repeatabilityRange', kind: 'range', min: 0.5, max: 2, unit: 'pC' },

      { param: 'distStandardCapacitor', kind: 'enum', values: ['rectangular', 'normal'] },
      { param: 'distCalibrator', kind: 'enum', values: ['rectangular', 'normal'] },
      { param: 'distDetectorLinearity', kind: 'enum', values: ['rectangular', 'normal'] },
      { param: 'distAttenuator', kind: 'enum', values: ['rectangular', 'normal'] },
      { param: 'distTemperature', kind: 'enum', values: ['rectangular', 'normal'] },
      { param: 'distResolution', kind: 'enum', values: ['rectangular', 'normal'] },
      { param: 'distRepeatability', kind: 'enum', values: ['rectangular', 'normal'] },

      // 合成与扩展结果：1 pC 与 10 pC 两个点（100 pC 在文件头，复校计划引用）。
      { param: 'uc1pC', kind: 'range', min: 0.5, max: 0.8, unit: 'pC' },
      { param: 'U1pC', kind: 'range', min: 1, max: 1.6, unit: 'pC' },
      { param: 'relU1pC', kind: 'range', min: 100, max: 160, unit: '%' },
      { param: 'uc10pC', kind: 'range', min: 0.6, max: 0.9, unit: 'pC' },
      { param: 'U10pC', kind: 'range', min: 1.2, max: 1.8, unit: 'pC' },
      { param: 'relU10pC', kind: 'range', min: 10, max: 20, unit: '%' },
    ],
  },

  /**
   * PD 检测器自校证书。
   *
   * 证书只证明“在本层这套量具与连接下，检测器刻度可复现到证书给的 U”，
   * 不证明外部溯源。溯源链写到：
   *
   *   标准电容 100 pF → 电压基准 1–10 V → 校准器 1–100 pC → 检测器
   *   （Q = C·V：前两环共同定校准器电荷）
   *
   * 再往上（国家基准/外部校准机构）没有，是缺口。
   *
   * 有效期 12 个月；签发 = 高压测试台计量员（机器人），
   * 复核 = 计量间负责人。证书类型只能是 `self-calibration`。
   *
   * 限制：20±2 °C、RH<60 %、1–100 pC、同轴/BNC 同缆同耦合；换线/换量程
   * 要重校。1 pC 处 U = 1.32 pC > 1 pC，不能用于 1 pC 绝对门槛。
   */
  {
    id: 'mat/pd-self-calibration-certificate',
    name: 'PD Detector Self-Calibration Certificate', name_zh: 'PD 检测器自校证书',
    unit: '份',
    category: 'part',
    props: [
      // 证书类型是**封闭枚举**：只允许自校，不给出“外部证书”这个选项。
      { param: 'certificateType', kind: 'enum', values: ['self-calibration'] },
      { param: 'validityMonths', kind: 'range', min: 11, max: 13, unit: '月' },
      { param: 'k', kind: 'range', min: 1.5, max: 2.5, unit: '1' },
      { param: 'U1pC', kind: 'range', min: 1, max: 1.6, unit: 'pC' },
      { param: 'U10pC', kind: 'range', min: 1.2, max: 1.8, unit: 'pC' },

      // 限制条件。温度 18–22 °C = 20±2；湿度上限 60 % RH。
      { param: 'tempMin', kind: 'range', min: 17, max: 19, unit: '°C' },
      { param: 'tempMax', kind: 'range', min: 21, max: 23, unit: '°C' },
      { param: 'rhMax', kind: 'range', min: 50, max: 70, unit: '%' },
      { param: 'chargeMin', kind: 'range', min: 0.5, max: 2, unit: 'pC' },
      { param: 'chargeMax', kind: 'range', min: 90, max: 110, unit: 'pC' },

      // 签发/复核角色。它们不是“外部机构”，只是本层两台设备的计量职能。
      { param: 'issuedBy', kind: 'enum', values: ['plant/hv-test-bench'] },
      { param: 'reviewedBy', kind: 'enum', values: ['plant/metrology-room'] },

      // 溯源链的四个节点。集合里只有本地这四件，没有外部机构。
      {
        param: 'traceChain',
        kind: 'set',
        values: [
          'plant/hv-test-bench/standard-capacitor-100pf',
          'plant/hv-test-bench/standard-voltage-reference',
          'plant/hv-test-bench/pd-calibrator-reference',
          'plant/hv-test-bench/pd-detector-iec60270',
        ],
      },
    ],
  },

  /**
   * PD 复校计划。周期 12 个月，或漂移超过证书的 U（先到者为准）。
   *
   * 核查点 1 / 10 / 100 pC：
   *   · 1 pC 只做响应/零点定性 —— U = 1.32 pC，判不了绝对量；
   *   · 10 pC |Δ| ≤ 1.49 pC；
   *   · 100 pC |Δ| ≤ 7.05 pC。
   *
   * 超差处置：停用贴标 → 查线/接头/接地/量程 → A/B 复核 → 重校；
   * 仍超差则降量程或换检测器；偏差 > 2U 或 > 5 % 隔离并追查数据。
   */
  {
    id: 'mat/pd-recalibration-plan',
    name: 'PD Recalibration Plan', name_zh: 'PD 复校计划',
    unit: '份',
    category: 'part',
    props: [
      { param: 'intervalMonths', kind: 'range', min: 11, max: 13, unit: '月' },
      { param: 'checkPoints', kind: 'set', values: ['1 pC', '10 pC', '100 pC'] },
      { param: 'onePcMode', kind: 'enum', values: ['response-only'] },
      { param: 'onePcU', kind: 'range', min: 1.2, max: 1.4, unit: 'pC' },
      { param: 'acceptance10pC', kind: 'range', min: 1.4, max: 1.6, unit: 'pC' },
      { param: 'acceptance100pC', kind: 'range', min: 6, max: 8, unit: 'pC' },
    ],
  },

];

export const PD_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **空载背景：0→100 kV 分 5 级，每级 5 min。**
     *
     *   校准记录 + A/B 互比记录；产出一份背景记录。
     */
    id: 'measure/pd-source-background',
    name: 'No-Load PD Background Measurement', name_zh: '空载 PD 背景测量',
    produces: [
      {
        item: 'mat/pd-background-record',
        qty: q(1),
        gives: [
          { param: 'voltage', kind: 'range', min: 100000, max: 100000 },
          { param: 'backgroundCharge', kind: 'range', min: 0, max: 100 },
          { param: 'backgroundRate', kind: 'range', min: 0, max: 10000 },
          { param: 'temperature', kind: 'range', min: 19, max: 21 },
        ],
      },
    ],
    uses: [
      // 必须先用 measure/calibrate-pd-detector 产出记录；没有校准记录不做背景
      { anyOf: [{ item: 'mat/pd-calibration-record', qty: q(1) }] },
      // A/B 互比先过；没有一致性，q_bg 只是某一台的读数
      { anyOf: [{ item: 'mat/pd-intercomparison-record', qty: q(1) }] },
    ],
    needs: ['plant/pd-test-cell', 'plant/temperature-standard'],
    steps: [
      {
        note_zh:
          '空载：不接试品，只接均压环 + 耦合电容 + 峰值/率表；0→20→40→60→80→100 kV，每级 5 min；每级记 q/Hz/温度/湿度；100 kV 下 q ≤5 pC、率 ≤10 Hz 才继续',
        performedBy: 'plant/hv-test-bench',
      },
    ],
    rate: { hours: q(2) },
    unbalanced_zh:
      '校准记录 1 份 + A/B 互比记录 1 份（数据，不折质量）→ 背景记录 1 份；q/率是峰值保持与率表的读数，±10–20 %；没有逐脉冲记录',
  },

  {
    /**
     * **种子规格背景：不跑 100 kV，按 PD-free 源规格记 q_bg ≤1 pC。**
     *
     *   数据层闭合用；实测仍走 measure/pd-source-background。
     */
    id: 'measure/pd-source-background-spec',
    name: 'No-Load PD Background Measurement', name_zh: '空载 PD 背景测量',
    produces: [
      {
        item: 'mat/pd-background-record',
        qty: q(1),
        gives: [
          { param: 'voltage', kind: 'range', min: 100000, max: 100000 },
          // PD-free 源种子规格：空载 ≤1 pC；加耦合/屏蔽余量记 0.5–1.5 pC
          { param: 'backgroundCharge', kind: 'range', min: 0.5, max: 1.5 },
          { param: 'backgroundRate', kind: 'range', min: 0, max: 1 },
          { param: 'temperature', kind: 'range', min: 19, max: 21 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/pd-calibration-record', qty: q(1) }] },
      { anyOf: [{ item: 'mat/pd-intercomparison-record', qty: q(1) }] },
    ],
    needs: ['plant/hv-test-bench/pd-free-source-100k', 'plant/hv-test-bench/pd-detector-iec60270', 'plant/temperature-standard'],
    steps: [
      {
        note_zh:
          '按 `std/pd-free-source-100k` 的规格（空载 ≤1 pC）记背景；加耦合/屏蔽余量取 0.5–1.5 pC。**这不是实测**，是种子规格闭合；实测仍走 measure/pd-source-background',
        performedBy: 'plant/hv-test-bench',
      },
    ],
    rate: { hours: q(1, 2) },
    unbalanced_zh:
      'PD-free 源 1 + 校准记录 1 + A/B 互比记录 1 → 背景记录 1；无材料消耗。q_bg 0.5–1.5 pC 是种子规格，不是实测；实测值可能不同',
  },

  {
    /**
     * **校准：10/50/100 pC 三点，读检测仪，算刻度/线性/不确定度。**
     *
     *   量块 3 + 检测仪 1 → 记录 1
     */
    id: 'measure/calibrate-pd-detector',
    name: 'PD Detector Calibration', name_zh: 'PD 检测器校准',
    produces: [
      {
        item: 'mat/pd-calibration-record',
        qty: q(1),
        gives: [
          { param: 'scaleFactor', kind: 'range', min: 0.1, max: 100 },
          { param: 'linearity', kind: 'range', min: 1, max: 5 },
          { param: 'uncertainty', kind: 'range', min: 2, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/hv-test-bench/standard-capacitor-100pf', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-test-bench/standard-voltage-reference', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-test-bench/pd-calibrator-reference', qty: q(1) }] },
      // 本地可造量块：先与 A/B 比对，再用
      { anyOf: [{ item: 'plant/hv-test-bench/standard-capacitor-local', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-test-bench/standard-resistor-local', qty: q(1) }] },
    ],
    needs: ['plant/pd-test-cell', 'plant/hv-test-bench/pd-detector-iec60270'],
    steps: [
      {
        note_zh:
          '校准器接试品端（或耦合电容高压端），依次注入 10/50/100 pC；每点读 3 次，记检测仪读数；算 pC/V、线性、重复性',
        performedBy: 'plant/hv-test-bench',
      },
      {
        note_zh:
          '检查：零点/噪声 ≤1–2 pC；线性 ±5%；换量程重校；记录温度/湿度；出 `mat/pd-calibration-record`',
        performedBy: 'plant/hv-test-bench',
      },
    ],
    rate: { hours: q(2) },
    unbalanced_zh:
      '量块 3 + 检测仪 1 → 记录 1；无材料消耗。记录里 scaleFactor/线性/不确定度是实测值，不是设计值；量块单套，R9 未闭合',
  },

  {
    /**
     * **A/B 互比：同一校准器注入，两台检测仪各读 10/50/100 pC。**
     *
     *   量块 A/B + 检测仪 A/B → 互比记录 1
     */
    id: 'measure/pd-intercompare',
    name: 'A/B Intercomparison Measurement', name_zh: 'A/B 互比测量',
    produces: [
      {
        item: 'mat/pd-intercomparison-record',
        qty: q(1),
        gives: [
          { param: 'deltaScale', kind: 'range', min: 1, max: 5 },
          { param: 'deltaLinearity', kind: 'range', min: 1, max: 5 },
          { param: 'agreement', kind: 'range', min: 95, max: 100 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/hv-test-bench/standard-capacitor-100pf', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-test-bench/standard-voltage-reference', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-test-bench/pd-calibrator-reference', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-test-bench/standard-capacitor-100pf-b', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-test-bench/standard-voltage-reference-b', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-test-bench/pd-calibrator-reference-b', qty: q(1) }] },
    ],
    needs: [
      'plant/pd-test-cell',
      'plant/hv-test-bench/pd-detector-iec60270',
      'plant/hv-test-bench/pd-detector-iec60270-b',
    ],
    steps: [
      {
        note_zh:
          'A 校准器注入 10/50/100 pC，A、B 两台检测仪各读 3 次；再换 B 校准器重复；算 deltaScale、deltaLinearity、agreement',
        performedBy: 'plant/hv-test-bench',
      },
      {
        note_zh:
          '判据：deltaScale ≤5%、deltaLinearity ≤5%、agreement ≥95% 才能进 q_bg；若 A/B 差 >5%，先查线/量程/接地，不要测源',
        performedBy: 'plant/hv-test-bench',
      },
    ],
    rate: { hours: q(2) },
    unbalanced_zh:
      '量块 A/B + 检测仪 A/B → 互比记录 1；无材料消耗。两台独立种子只能查“谁漂了”，查不出“两台同时同向漂”的共同偏差',
  },

  {
    /**
     * **不确定度预算：把校准/互比记录与量具指标逐项列成表，合成 u_c、乘 k=2。**
     *
     *   校准记录 1 + 互比记录 1 + 量具 4 + 峰值保持 1 + 标准电阻 1 → 预算记录 1
     *
     * 这一条不改仪器、不消耗材料；它把“有量块/校准/互比”变成一张能签字的表。
     * 逐项、公式与判据见文件头。
     *
     * ⚠️ 执行者是 `plant/hv-test-bench`，所以它不在 `needs` 里重复；
     *    `needs` 只写在场的试验舱与计量间（redundant_need 的反面）。
     */
    id: 'measure/pd-uncertainty-budget',
    name: 'PD Absolute pC Uncertainty Budget Measurement', name_zh: 'PD 绝对 pC 不确定度预算测量',
    produces: [
      {
        item: 'mat/pd-uncertainty-budget',
        qty: q(1),
        gives: [
          { param: 'k', kind: 'range', min: 2, max: 2 },

          { param: 'uStandardCapacitor', kind: 'range', min: 0.58, max: 0.58 },
          { param: 'uCalibrator', kind: 'range', min: 1.73, max: 1.73 },
          { param: 'uDetectorLinearity', kind: 'range', min: 2.89, max: 2.89 },
          { param: 'uAttenuator', kind: 'range', min: 0.58, max: 0.58 },
          { param: 'uTemperature', kind: 'range', min: 0.06, max: 0.06 },
          { param: 'uResolution', kind: 'range', min: 0.29, max: 0.29 },
          { param: 'uRepeatability', kind: 'range', min: 0.59, max: 0.59 },
          { param: 'repeatabilityRange', kind: 'range', min: 1, max: 1 },

          { param: 'distStandardCapacitor', kind: 'enum', oneOf: ['rectangular'] },
          { param: 'distCalibrator', kind: 'enum', oneOf: ['rectangular'] },
          { param: 'distDetectorLinearity', kind: 'enum', oneOf: ['rectangular'] },
          { param: 'distAttenuator', kind: 'enum', oneOf: ['rectangular'] },
          { param: 'distTemperature', kind: 'enum', oneOf: ['rectangular'] },
          { param: 'distResolution', kind: 'enum', oneOf: ['rectangular'] },
          { param: 'distRepeatability', kind: 'enum', oneOf: ['normal'] },

          { param: 'uc1pC', kind: 'range', min: 0.66, max: 0.66 },
          { param: 'U1pC', kind: 'range', min: 1.32, max: 1.32 },
          { param: 'relU1pC', kind: 'range', min: 132, max: 132 },
          { param: 'uc10pC', kind: 'range', min: 0.74, max: 0.74 },
          { param: 'U10pC', kind: 'range', min: 1.49, max: 1.49 },
          { param: 'relU10pC', kind: 'range', min: 14.9, max: 14.9 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/pd-calibration-record', qty: q(1) }] },
      { anyOf: [{ item: 'mat/pd-intercomparison-record', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-test-bench/standard-capacitor-100pf', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-test-bench/standard-voltage-reference', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-test-bench/pd-calibrator-reference', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-test-bench/pd-peak-detector', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-test-bench/standard-resistor-local', qty: q(1) }] },
    ],
    needs: ['plant/pd-test-cell', 'plant/metrology-room', 'plant/hv-test-bench/pd-detector-iec60270'],
    steps: [
      {
        note_zh:
          '核对校准记录的 scaleFactor/线性/不确定度、互比记录的 deltaScale/agreement；确认标准电容 1 %、校准器 3 %、检测器线性 5 %、衰减比 1 %、温度 0.05 %/K、分辨 1 pC 的取值都落在量具 props 窗口内',
        performedBy: 'plant/hv-test-bench',
      },
      {
        note_zh:
          '逐项算标准不确定度：相对项按矩形 a/√3；分辨按 0.5/√3 = 0.289 pC；重复性按 3 次极差 R/1.693 = 0.591 pC（R = 1 pC 是估算，不是实测）；列成表',
        performedBy: 'plant/hv-test-bench',
      },
      {
        note_zh:
          '合成 u_c(q) = sqrt((3.465 % × q)² + 0.289² + 0.591²)，U = 2u_c；得 1 pC 1.317 pC（132 %）、10 pC 1.486 pC（14.9 %）；按判据表写结论：1 pC 判不了，5 pC 仅 ±30 % 可判，10 pC 以上 ±20 % 可判',
        performedBy: 'plant/hv-test-bench',
      },
      {
        note_zh:
          '出 `mat/pd-uncertainty-budget`；把“1 pC 门槛判不了”写进记录，不许把 U 改小去凑 0.2 pC，也不许把 5 pC 写成可判',
        performedBy: 'plant/hv-test-bench',
      },
    ],
    rate: { hours: q(4) },
    unbalanced_zh:
      '校准记录 1 + 互比记录 1 + 量具 4 + 峰值保持 1 + 标准电阻 1 → 预算记录 1；无材料消耗。u_c/U 是估算（重复性无实测，按 3 次极差 R=1 pC；衰减比 1 %、温度 0.05 %/K 为设计/估算值）；1 pC 处 U=1.317 pC > 0.2 pC，1 pC 门槛判不了，5 pC 仅 ±30 % 可判',
  },

  {
    /**
     * **自校证书：核对溯源链、预算、限制条件，签发并复核。**
     *
     *   预算记录 1 + 校准记录 1 + 互比记录 1 + 量具 4 → 自校证书 1
     *
     * 证书类型只写 `self-calibration`；溯源只到标准电容与电压基准，
     * 再往上没有，记缺口。签发 = 高压测试台计量员，复核 = 计量间。
     *
     * ⚠️ 执行者是 `plant/hv-test-bench`，所以它不在 `needs` 里重复；
     *    `needs` 写试验舱与计量间（都只在场，不被消耗）。
     */
    id: 'measure/pd-self-calibration-certificate',
    name: 'PD Detector Self-Calibration Certificate Measurement', name_zh: 'PD 检测器自校证书测量',
    produces: [
      {
        item: 'mat/pd-self-calibration-certificate',
        qty: q(1),
        gives: [
          { param: 'certificateType', kind: 'enum', oneOf: ['self-calibration'] },
          { param: 'validityMonths', kind: 'range', min: 12, max: 12 },
          { param: 'k', kind: 'range', min: 2, max: 2 },
          { param: 'U1pC', kind: 'range', min: 1.32, max: 1.32 },
          { param: 'U10pC', kind: 'range', min: 1.49, max: 1.49 },
          { param: 'tempMin', kind: 'range', min: 18, max: 18 },
          { param: 'tempMax', kind: 'range', min: 22, max: 22 },
          { param: 'rhMax', kind: 'range', min: 60, max: 60 },
          { param: 'chargeMin', kind: 'range', min: 1, max: 1 },
          { param: 'chargeMax', kind: 'range', min: 100, max: 100 },
          { param: 'issuedBy', kind: 'enum', oneOf: ['plant/hv-test-bench'] },
          { param: 'reviewedBy', kind: 'enum', oneOf: ['plant/metrology-room'] },
          {
            param: 'traceChain',
            kind: 'set',
            atLeast: [
              'plant/hv-test-bench/standard-capacitor-100pf',
              'plant/hv-test-bench/standard-voltage-reference',
              'plant/hv-test-bench/pd-calibrator-reference',
              'plant/hv-test-bench/pd-detector-iec60270',
            ],
          },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/pd-uncertainty-budget', qty: q(1) }] },
      { anyOf: [{ item: 'mat/pd-calibration-record', qty: q(1) }] },
      { anyOf: [{ item: 'mat/pd-intercomparison-record', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-test-bench/standard-capacitor-100pf', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-test-bench/standard-voltage-reference', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-test-bench/pd-calibrator-reference', qty: q(1) }] },
    ],
    needs: ['plant/pd-test-cell', 'plant/metrology-room', 'plant/hv-test-bench/pd-detector-iec60270'],
    steps: [
      {
        note_zh:
          '核对溯源链：标准电容 100 pF → 电压基准 1–10 V → 校准器 1–100 pC → IEC 60270 检测器（Q=C·V，前两环共同定校准器电荷）；逐环记型号/编号/指标/证书或记录编号；再往上（国家基准/外部校准机构）没有，写缺口',
        performedBy: 'plant/hv-test-bench',
      },
      {
        note_zh:
          '核对预算记录：u_c/U、k=2、1 pC 与 10 pC 的结论；确认证书只覆盖“检测器 + 耦合 + 电缆 + 峰值保持”这一套，不覆盖 UHF 分析仪/PD-free 源/100 kV 分压器',
        performedBy: 'plant/hv-test-bench',
      },
      {
        note_zh:
          '写限制条件：20±2 °C、RH<60 %、1–100 pC、同轴/BNC 同缆同耦合；换线/换接头/换量程/衰减器要重校；有效期 12 个月，到期未复校自动失效',
        performedBy: 'plant/hv-test-bench',
      },
      {
        note_zh:
          '签发：高压测试台计量员（机器人）签字；复核：计量间负责人复核；证书类型只写“自校证书”，不得标成外部实验室或外部校准机构的证书；1 pC 处 U=1.32 pC，写明不能判 1 pC 绝对门槛',
        performedBy: 'plant/hv-test-bench',
      },
    ],
    rate: { hours: q(2) },
    unbalanced_zh:
      '预算记录 1 + 校准记录 1 + 互比记录 1 + 量具 4 → 自校证书 1；无材料消耗。溯源只到标准电容与电压基准，再往上（国家基准/外部校准机构）没有；证书有效期 12 个月，签发/复核见 issuedBy/reviewedBy，限制 20±2 °C、RH<60 %、1–100 pC、同轴/BNC 同缆',
  },

  {
    /**
     * **复校计划：定周期、核查点、接受判据与超差处置。**
     *
     *   证书 1 + 预算记录 1 + 校准记录 1 + 互比记录 1 + 量具 3 → 复校计划 1
     *
     * 12 个月或漂移 > 证书 U，先到者为准；1 pC 只做定性，10/100 pC 有
     * 绝对接受判据。超差处置见文件头。
     *
     * ⚠️ 执行者是 `plant/hv-test-bench`，所以它不在 `needs` 里重复；
     *    `needs` 写试验舱与计量间（都只在场，不被消耗）。
     */
    id: 'measure/pd-recalibration-plan',
    name: 'PD Recalibration Plan Measurement', name_zh: 'PD 复校计划测量',
    produces: [
      {
        item: 'mat/pd-recalibration-plan',
        qty: q(1),
        gives: [
          { param: 'intervalMonths', kind: 'range', min: 12, max: 12 },
          {
            param: 'checkPoints',
            kind: 'set',
            atLeast: ['1 pC', '10 pC', '100 pC'],
          },
          { param: 'onePcMode', kind: 'enum', oneOf: ['response-only'] },
          { param: 'onePcU', kind: 'range', min: 1.32, max: 1.32 },
          { param: 'acceptance10pC', kind: 'range', min: 1.49, max: 1.49 },
          { param: 'acceptance100pC', kind: 'range', min: 7.05, max: 7.05 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/pd-self-calibration-certificate', qty: q(1) }] },
      { anyOf: [{ item: 'mat/pd-uncertainty-budget', qty: q(1) }] },
      { anyOf: [{ item: 'mat/pd-calibration-record', qty: q(1) }] },
      { anyOf: [{ item: 'mat/pd-intercomparison-record', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-test-bench/standard-capacitor-100pf', qty: q(1) }] },
      { anyOf: [{ item: 'plant/hv-test-bench/pd-calibrator-reference', qty: q(1) }] },
    ],
    needs: ['plant/pd-test-cell', 'plant/metrology-room', 'plant/hv-test-bench/pd-detector-iec60270'],
    steps: [
      {
        note_zh:
          '定周期：12 个月或漂移 > 证书 U，先到者为准；列 1/10/100 pC 三个核查点；1 pC 只做响应/零点定性（U = 1.32 pC > 1 pC，判不了绝对量）',
        performedBy: 'plant/hv-test-bench',
      },
      {
        note_zh:
          '定判据：10 pC |Δ| ≤ 1.49 pC、100 pC |Δ| ≤ 7.05 pC；线性 ≤ 5 %、零点/噪声 ≤ 1 pC；1 pC 不判绝对，只记响应有无与零点',
        performedBy: 'plant/hv-test-bench',
      },
      {
        note_zh:
          '定超差处置：停用贴标 → 查线/接头/接地/量程/衰减器 → A/B 复核 → 重校；仍超差则降量程或换检测器；偏差 > 2U 或 > 5 % 隔离，并追查上次有效核查之后的全部数据',
        performedBy: 'plant/hv-test-bench',
      },
      {
        note_zh:
          '出 `mat/pd-recalibration-plan`，挂在证书背面；到期未复校的证书自动失效；预算或读数链变了要重发证书与计划',
        performedBy: 'plant/hv-test-bench',
      },
    ],
    rate: { hours: q(2) },
    unbalanced_zh:
      '证书 1 + 预算记录 1 + 校准记录 1 + 互比记录 1 + 量具 3 → 复校计划 1；无材料消耗。周期 12 个月或漂移 > U（先到者）；1 pC 只做定性，10 pC 接受 |Δ|≤1.49 pC，100 pC 接受 |Δ|≤7.05 pC；超差先停用再查线/接地/量程',
  },

];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...PD_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...PD_MEASURE_ROUTES];
