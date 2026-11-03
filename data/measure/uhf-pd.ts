/**
 * UHF 局放两条测量：灵敏度/PRPD 与 PD-free 源验收。
 *
 * 记录与路线从 data/machine/uhf-pd.ts 迁入（R13）。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const DATA_ITEMS: readonly Item[] = [
  /**
   * UHF 分析仪灵敏度/PRPD 记录。一条记录对应一次 300–1500 MHz 扫频。
   *
   *   bandwidth 300–1500 MHz、sensitivity -75…-65 dBm、noiseFigure 1.0–1.5 dB、
   *   phaseBins 256
   *
   * `bandwidth` 就是扫频窗口（300–1500 MHz），不再单列 `frequency`；
   * 它是 `measure/uhf-pd-sensitivity` 的产物，不是分析仪条目本身。
   */
  {
    id: 'mat/uhf-pd-sensitivity-record',
    name: 'UHF 分析仪灵敏度/PRPD 记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'sensitivity', kind: 'range', min: -100, max: -50, unit: 'dBm', dir: 'atMost' },
      { param: 'bandwidth', kind: 'range', min: 300, max: 1500, unit: 'MHz' },
      { param: 'phaseBins', kind: 'range', min: 256, max: 256, unit: '格' },
      { param: 'noiseFigure', kind: 'range', min: 0.5, max: 2, unit: 'dB', dir: 'atMost' },
      { param: 'uncertainty', kind: 'range', min: 0, max: 1.5, unit: 'dB', dir: 'atMost' }, // 主项：std/attenuator-standard 替代法（0.05–0.15 dB）+ 源 0.1–0.2 dB ⇒ 0.3–0.6 dB（原 1–1.5）
    ],
  },

  /**
   * 无局放源验收记录。0→100 kV 分级，记背景局放。
   *
   *   voltage 100 kV、pdLevel 0.2–0.8 pC；湿度与背景细节写在 unbalanced_zh/注释里，
   *   不单列成属性（避免把“环境条件”误当成源的规格）。
   *
   * ⚠️ 检测器 U@1 pC 仍是 132 %（`pd-uncertainty.ts`）；这条记录证明
   * “源 + 检测器 + 屏蔽舱这一套读到 0.2–0.8 pC”，不是绝对溯源到 1 pC。
   */
  {
    id: 'mat/pd-free-source-pd-record',
    name: '无局放源验收记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'voltage', kind: 'range', min: 0, max: 100000, unit: 'V', dir: 'atLeast' },
      { param: 'pdLevel', kind: 'range', min: 0, max: 5, unit: 'pC', dir: 'atMost' },
      { param: 'uncertainty', kind: 'range', min: 0, max: 0.05, unit: 'pC', dir: 'atMost' }, // 主项：std/charge-standard-1pc 的 Q=CV（0.2–0.5 %）替换 132 % 的旧链；对 0.2–0.8 pC 是 0.5–2.5 %
    ],
  },
];

export const DATA_ROUTES: readonly Route[] = [
  /**
   * UHF 灵敏度/PRPD 测量：五点扫频 + 火花源相位参考。
   *
   *   校准记录 1 + 互比记录 1 + 分析仪 + 火花源 + 屏蔽舱 → 灵敏度记录 1
   *
   * 频率点 300/500/800/1000/1500 MHz；每点用校准过的衰减器从 -20 dBm
   * 往下找 3 dB 信噪比，记灵敏度；用火花源（0.5–2 ns）做相位零点。
   * 记录值是**设计窗口内的实测读数**，但绝对溯源仍到 pC 校准器，不到国家基准。
   */
  {
    id: 'measure/uhf-pd-sensitivity',
    name: 'UHF 灵敏度/PRPD 测量',
    produces: [
      {
        item: 'mat/uhf-pd-sensitivity-record',
        qty: q(1),
        gives: [
          { param: 'sensitivity', kind: 'range', min: -75, max: -65 },
          { param: 'bandwidth', kind: 'range', min: 300, max: 1500 },
          { param: 'phaseBins', kind: 'range', min: 256, max: 256 },
          { param: 'noiseFigure', kind: 'range', min: 1, max: 1.5 },
          { param: 'uncertainty', kind: 'range', min: 0.3, max: 0.6 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/pd-calibration-record', qty: q(1) }] },
      { anyOf: [{ item: 'mat/pd-intercomparison-record', qty: q(1) }] },
    ],
    needs: [
      'plant/hv-test-bench/uhf-spark-source',
      'plant/pd-test-cell',
      'plant/metrology-room',
      'std/attenuator-standard',
    ],
    steps: [
      {
        note_zh:
          '接快沿源/衰减器/分析仪；300/500/800/1000/1500 MHz 五点，每点从 -20 dBm 往下找 SNR = 3 dB 的灵敏度',
        performedBy: 'plant/hv-test-bench/uhf-pd-analyzer',
        under: [
          { param: 'temperature', min: 18, max: 22 },
          { param: 'humidity', min: 0, max: 60 },
        ],
      },
      {
        note_zh: '用 uhf-spark-source 的 0.5–2 ns 脉冲做相位零点，记 PRPD 256 格谱图',
        performedBy: 'plant/hv-test-bench/uhf-pd-analyzer',
        under: [
          { param: 'temperature', min: 18, max: 22 },
          { param: 'humidity', min: 0, max: 60 },
        ],
      },
    ],
    rate: { hours: q(6) },
    unbalanced_zh:
      '校准记录 1 + 互比记录 1（数据）+ 分析仪/火花源/屏蔽舱（工具）→ 灵敏度记录 1；无材料消耗。灵敏度 -75…-65 dBm 是设计窗口，五点是逐点读数；相位格 256 是时基与工频参考的分辨率',
  },

  /**
   * 无局放源验收：0→100 kV 分 5 级，每级 5 min，记背景 q/率/PRPD。
   *
   *   校准记录 1 + 互比记录 1 + PD-free 源 + IEC 60270 检测器 + 屏蔽舱 → 记录 1
   *
   * 检测器 U@1 pC = 1.317 pC（132 %）；所以记录里 0.2–0.8 pC 的窗口
   * 是**同一套链上的读数**，不能当成绝对 1 pC 判决。要绝对 1 pC 判决，
   * 仍得把 U 从 1.32 pC 压到 ≤0.2 pC（`pd-uncertainty.ts` 的升级项）。
   */
  {
    id: 'measure/pd-free-source-pd',
    name: '无局放源验收测量',
    produces: [
      {
        item: 'mat/pd-free-source-pd-record',
        qty: q(1),
        gives: [
          { param: 'voltage', kind: 'range', min: 100000, max: 100000 },
          { param: 'pdLevel', kind: 'range', min: 0.2, max: 0.8 },
          { param: 'uncertainty', kind: 'range', min: 0.002, max: 0.01 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/pd-calibration-record', qty: q(1) }] },
      { anyOf: [{ item: 'mat/pd-intercomparison-record', qty: q(1) }] },
    ],
    needs: [
      'plant/hv-test-bench/pd-detector-iec60270',
      'plant/pd-test-cell',
      'plant/metrology-room',
      'std/charge-standard-1pc',
    ],
    steps: [
      {
        note_zh:
          '0→20→40→60→80→100 kV 分 5 级，每级 5 min；18–22 °C / RH<60 %，记背景 q、率、PRPD',
        performedBy: 'plant/hv-test-bench/pd-free-source-100k',
        under: [
          { param: 'temperature', min: 18, max: 22 },
          { param: 'humidity', min: 0, max: 60 },
        ],
      },
      {
        note_zh:
          '先注入 std/charge-standard-1pc 的 1.00 pC 校刻度因子（U 0.2–0.5 %），再核对校准记录/互比记录的有效期；把 0.2–0.8 pC 写成同一套链的读数，不写成绝对 1 pC 判决',
        performedBy: 'plant/hv-test-bench/pd-free-source-100k',
        under: [
          { param: 'temperature', min: 18, max: 22 },
          { param: 'humidity', min: 0, max: 60 },
        ],
      },
    ],
    rate: { hours: q(8) },
    unbalanced_zh:
      '校准记录 1 + 互比记录 1（数据）+ PD-free 源/检测器/屏蔽舱（工具）→ 验收记录 1；无材料消耗。0.2–0.8 pC 是读数窗口，检测器 U@1 pC = 1.317 pC（132 %），不是绝对溯源',
  },
];
