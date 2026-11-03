/**
 * Pellistor 氢气传感器校准路线。
 *
 * 0/10/50/100 ppm + 0.4/1/2/4 vol% + CH₄/CO 交叉，产 `mat/h2-sensor-record`。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const DATA_ITEMS: readonly Item[] = [];

export const DATA_ROUTES: readonly Route[] = [
  /**
   * Pellistor 校准：0/10/50/100 ppm + 0.4/1/2/4 vol% + CH₄/CO 交叉。
   *
   *   空气 1 + 氢 0.01 + 甲烷 0.01 + 高纯 CO 0.001 + 氮 0.5 → 记录 1
   */
  {
    id: 'measure/pellistor-h2-sensor-calibration',
    name: 'Pellistor 校准',
    produces: [
      {
        item: 'mat/h2-sensor-record',
        qty: q(1),
        gives: [
          { param: 'range', kind: 'range', min: 0, max: 4 },
          { param: 'lelRange', kind: 'range', min: 0, max: 5 },
          { param: 'lelAlarm', kind: 'range', min: 4, max: 4 },
          { param: 'response', kind: 'range', min: 3, max: 8 },
          { param: 'accuracy', kind: 'range', min: 2, max: 5 },
          { param: 'crossCH4', kind: 'range', min: 5, max: 15 },
          { param: 'crossCO', kind: 'range', min: 2, max: 5 },
          { param: 'zeroDrift', kind: 'range', min: 0.5, max: 1.5 },
          { param: 'temperature', kind: 'range', min: 5, max: 40 },
          { param: 'protection', kind: 'enum', oneOf: ['Ex d IIC T1'] },
          { param: 'resolution', kind: 'range', min: 0.001, max: 0.01 },
          { param: 'detectionLimit', kind: 'range', min: 10, max: 100 },
          { param: 'bridgeOutput', kind: 'range', min: 0.15, max: 0.23 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/air', qty: q(1) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/methane', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/co-high-purity', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 2) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '配气：MFC 0–200 sccm，空气稀释 H₂/CH₄/CO；0/10/50/100 ppm 与 0.4/1/2/4 vol% 各五点', performedBy: 'plant/mfc', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '零点/量程/响应：每点等 3 min；4 % 阶跃 T90 <10 s，10 ppm 点重复 5 次', performedBy: 'plant/h2-sensor', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '交叉：1 vol% CH₄、1000 ppm CO 各一次；再通 4 % H₂ 看报警与复位', performedBy: 'plant/h2-sensor', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '写记录：resolution/detectionLimit/bridgeOutput/交叉/漂移；注明催化剂寿命 1000–2000 h、H₂S 1–5 ppm/硅氧烷 0.1–1 ppm 中毒', performedBy: 'plant/h2-sensor', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(5) },
    unbalanced_zh:
      '空气 1 + 氢 0.01 + 甲烷 0.01 + 高纯 CO 0.001 + 氮 0.5 → 记录 1；气体被消耗，记录是数据。10–100 ppm 是设计窗口；10 ppm 的 ΔT 0.02–0.03 K、桥路 38–58 µV，SNR 38–580（噪声 0.1–1 µV）',
  },
];
