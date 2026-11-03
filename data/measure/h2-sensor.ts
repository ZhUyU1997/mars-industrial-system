/**
 * 氢气传感器校准记录与测量路线。
 *
 * 一份记录 = 一台传感器、一次 0/0.4/1/2/4 vol% 标定 + ppm 点 + CH₄/CO 交叉 +
 * 报警动作。配气用 `plant/mfc`（0–200 sccm）动态稀释；4 vol% 是 LEL 点。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const DATA_ITEMS: readonly Item[] = [
  /**
   * 氢气传感器校准记录。一份记录 = 一台传感器、一次 0/0.4/1/2/4 vol% 标定 +
   * ppm 点 + CH₄/CO 交叉 + 报警动作。
   *
   *   range 0–100 vol%、lelRange 0–5 vol%、lelAlarm 4 vol%
   *   response 3–8 s、accuracy 2–5 %
   *   resolution TCD 0.01–0.04 vol% / pellistor 0.001–0.01 vol%
   *   detectionLimit TCD 1000–4000 ppm / pellistor 10–100 ppm
   *   bridgeOutput TCD 0.5–2 V / pellistor 0.15–0.25 V
   *   crossCH4 TCD 3–8 % / pellistor 5–15 %；crossCO TCD −2…+2 % / pellistor 2–5 %
   */
  {
    id: 'mat/h2-sensor-record',
    name: '氢气传感器校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'range', kind: 'range', min: 0, max: 100, unit: 'vol%' },
      { param: 'lelRange', kind: 'range', min: 0, max: 5, unit: 'vol%' },
      { param: 'lelAlarm', kind: 'range', min: 4, max: 4, unit: 'vol%' },
      { param: 'response', kind: 'range', min: 1, max: 10, unit: 's', dir: 'atMost' },
      { param: 'accuracy', kind: 'range', min: 2, max: 10, unit: '%', dir: 'atMost' },
      { param: 'crossCH4', kind: 'range', min: 0, max: 20, unit: '%', dir: 'atMost' },
      { param: 'crossCO', kind: 'range', min: -10, max: 10, unit: '%' },
      { param: 'zeroDrift', kind: 'range', min: 0, max: 2, unit: '%/月', dir: 'atMost' },
      { param: 'temperature', kind: 'range', min: 5, max: 40, unit: '°C' },
      { param: 'protection', kind: 'enum', values: ['Ex d IIC T1'] },
      { param: 'resolution', kind: 'range', min: 0.001, max: 0.04, unit: 'vol%', dir: 'atMost' },
      { param: 'detectionLimit', kind: 'range', min: 10, max: 4000, unit: 'ppm', dir: 'atMost' },
      { param: 'bridgeOutput', kind: 'range', min: 0.1, max: 2, unit: 'V' },
    ],
  },
];

export const DATA_ROUTES: readonly Route[] = [
  /**
   * 氢气传感器校准：0/0.4/1/2/4 vol% 五点 + CH₄/CO 交叉 + 报警动作。
   *
   *   传感器 1 + 空气 1 + 氢 0.01 + 甲烷 0.01 + CO 0.001 + 氮 0.5 → 记录 1
   *
   * 配气用 `plant/mfc`（0–200 sccm）动态稀释；4 vol% 是 LEL 点。
   * 记录里 3–8 % CH₄、−2…+2 % CO 是 TCD 的选择性；pellistor 路线是 5–15 % / 2–5 %。
   */
  {
    id: 'measure/h2-sensor-calibration',
    name: '氢气传感器校准',
    produces: [
      {
        item: 'mat/h2-sensor-record',
        qty: q(1),
        gives: [
          { param: 'range', kind: 'range', min: 0, max: 100 },
          { param: 'lelRange', kind: 'range', min: 0, max: 5 },
          { param: 'lelAlarm', kind: 'range', min: 4, max: 4 },
          { param: 'response', kind: 'range', min: 3, max: 8 },
          { param: 'accuracy', kind: 'range', min: 2, max: 5 },
          { param: 'crossCH4', kind: 'range', min: 3, max: 8 },
          { param: 'crossCO', kind: 'range', min: -2, max: 2 },
          { param: 'zeroDrift', kind: 'range', min: 0.5, max: 1.5 },
          { param: 'temperature', kind: 'range', min: 5, max: 40 },
          { param: 'protection', kind: 'enum', oneOf: ['Ex d IIC T1'] },
          { param: 'resolution', kind: 'range', min: 0.01, max: 0.04 },
          { param: 'detectionLimit', kind: 'range', min: 1000, max: 4000 },
          { param: 'bridgeOutput', kind: 'range', min: 0.5, max: 2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/air', qty: q(1) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/methane', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/co', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 2) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      {
        note_zh: '配气：MFC 0–200 sccm，空气稀释 H₂/CH₄/CO，0/0.4/1/2/4 vol% 五点；19–21 °C',
        performedBy: 'plant/mfc',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '零点/量程/响应：每点等 3 min，4 vol% 阶跃记 T90 <10 s；LEL 档与高浓度档各一遍',
        performedBy: 'plant/h2-sensor',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '交叉：1 vol% CH₄、1000 ppm CO 各测一次；再通 4 vol% H₂ 看报警动作与复位',
        performedBy: 'plant/h2-sensor',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '写记录：量程/报警/响应/交叉/漂移；注明 Ex d 是设计，不是 IECEx 证书',
        performedBy: 'plant/h2-sensor',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    rate: { hours: q(4) },
    unbalanced_zh:
      '传感器 1 + 空气 1 + 氢 0.01 + 甲烷 0.01 + CO 0.001 + 氮 0.5 → 记录 1；气体被消耗，记录是数据。3–8 % CH₄、−2…+2 % CO 是 TCD 设计选择性；0.4 vol% 已接近桥路噪声，ppm 档仍缺',
  },
];
