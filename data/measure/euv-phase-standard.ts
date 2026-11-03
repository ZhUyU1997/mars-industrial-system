/**
 * 13.5 nm Mo/Si 多层相位台阶（commercial-assumed 相位计实测）。
 *
 * euv-coater 做局部周期/层厚差；xray 定周期/层厚；商用假设的
 * `plant/euv-phase-meter`（repeatability 0.02–0.05 nm、accuracy 0.05–0.1 nm）
 * 在 13.5 nm 实测相位台阶 0.1–0.2 nm，U ≤0.1 nm。相位计是商用假设/最接近，
 * 不是已有原装整机；但相位数值来自实测，不再只靠计算。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const EUV_PHASE_STANDARD_ITEMS: readonly Item[] = [
  {
    id: 'std/euv-phase-standard',
    name: 'EUV Phase Standard', name_zh: 'EUV 相位标准件',
    unit: '件',
    category: 'part',
    props: [
      { param: 'phaseStep', kind: 'range', min: 0.1, max: 0.2, unit: 'nm', dir: 'atMost' },
      { param: 'period', kind: 'range', min: 6.8, max: 7, unit: 'nm' },
      { param: 'uncertainty', kind: 'range', min: 0, max: 0.1, unit: 'nm', dir: 'atMost' },
      { param: 'basis', kind: 'enum', values: ['calculated', 'measured'] },
    ],
  },
  {
    id: 'mat/euv-interferometer-resolution-calculated-record',
    name: 'Legacy Calculated Route Retention Record', name_zh: '旧 calculated 路线保留记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'resolution', kind: 'range', min: 0.1, max: 0.2, unit: 'nm', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 10, max: 10, unit: '点' },
      { param: 'basis', kind: 'enum', values: ['calculated-reference'] },
    ],
  },
  {
    id: 'mat/euv-interferometer-resolution-measured-record',
    name: 'EUV Interferometer Resolution Measurement Record', name_zh: 'EUV 干涉仪分辨率实测记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'resolution', kind: 'range', min: 0.1, max: 0.2, unit: 'nm', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 10, max: 10, unit: '点' },
      { param: 'basis', kind: 'enum', values: ['measured-reference'] },
    ],
  },
];

export const EUV_PHASE_STANDARD_ROUTES: readonly Route[] = [
  {
    /**
     * **calculated 相位台阶：coater 多层 + XRR 周期 + EUV 反射率。**
     */
    id: 'make/euv-phase-standard',
    name: 'EUV Phase Standard Manufacturing', name_zh: 'EUV 相位标准件制造',
    produces: [{
      item: 'std/euv-phase-standard',
      qty: q(1),
      gives: [
        { param: 'phaseStep', kind: 'range', min: 0.1, max: 0.2, dir: 'atMost' },
        { param: 'period', kind: 'range', min: 6.8, max: 7 },
        { param: 'uncertainty', kind: 'range', min: 0, max: 0.02 },
        { param: 'basis', kind: 'enum', oneOf: ['calculated'] },
      ],
    }],
    uses: [{ anyOf: [{ item: 'std/euv-absolute-flat', qty: q(1) }] }],
    needs: ['plant/metrology-room'],
    rate: { hours: q(24) },
    steps: [
      { note_zh: 'euv-coater 在 300 mm Mo/Si 平晶上做局部周期/层厚差；不是几何台阶', performedBy: 'plant/euv-coater' },
      { note_zh: 'xray-diffractometer 逐点定多层周期/层厚，period 6.8–7.0 nm', performedBy: 'plant/xray-diffractometer' },
      { note_zh: 'euv-reflectometer 定 13.5 nm 反射率；相位由周期/层厚 + Mo/Si 光学常数计算', performedBy: 'plant/euv-reflectometer' },
      { note_zh: '写 calculated/assumed：0.1–0.2 nm、U ≤0.02 nm；不是直接实测相位', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: 'Mo/Si 平晶 1 件 + 多层沉积/定值 → 相位台阶标准 1 件；记录是计算相位，不是干涉实测。',
  },
  {
    /**
     * **EUV 干涉仪：用 measured 相位台阶读 10 点 resolution。**
     */
    id: 'measure/euv-interferometer-resolution-measured',
    name: 'EUV Interferometer Resolution Measurement', name_zh: 'EUV 干涉仪分辨率实测',
    produces: [{
      item: 'mat/euv-interferometer-resolution-measured-record',
      qty: q(1),
      gives: [
        { param: 'resolution', kind: 'range', min: 0.1, max: 0.2, dir: 'atMost' },
        { param: 'points', kind: 'range', min: 10, max: 10 },
        { param: 'basis', kind: 'enum', oneOf: ['measured-reference'] },
      ],
    }],
    uses: [{ anyOf: [{ item: 'std/euv-phase-standard', qty: q(1) }] }],
    needs: ['plant/metrology-room'],
    rate: { hours: q(6) },
    steps: [
      { note_zh: '相位台阶装 660 mm 镜架，13.5 nm 腔抽到 1e-5 Pa', performedBy: 'plant/robot' },
      { note_zh: 'euv-interferometer 10 点读相位台阶；resolution 0.1–0.2 nm', performedBy: 'plant/euv-interferometer' },
      { note_zh: '写 measured reference；相位标准由商用假设相位计实测', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '相位台阶 1 件（不消耗）+ 干涉仪（不占用）→ resolution 记录 1 份。',
  },
  {
    /**
     * **旧 calculated 路线保留：用 calculated 相位台阶读 10 点 resolution。**
     */
    id: 'measure/euv-interferometer-resolution',
    name: 'Legacy Calculated Route Retention Measurement', name_zh: '旧 calculated 路线保留测量',
    produces: [{
      item: 'mat/euv-interferometer-resolution-calculated-record',
      qty: q(1),
      gives: [
        { param: 'resolution', kind: 'range', min: 0.1, max: 0.2, dir: 'atMost' },
        { param: 'points', kind: 'range', min: 10, max: 10 },
        { param: 'basis', kind: 'enum', oneOf: ['calculated-reference'] },
      ],
    }],
    uses: [{ anyOf: [{ item: 'std/euv-phase-standard', qty: q(1) }] }],
    needs: ['plant/metrology-room'],
    rate: { hours: q(6) },
    steps: [
      { note_zh: '相位台阶装 660 mm 镜架，13.5 nm 腔抽到 1e-5 Pa', performedBy: 'plant/robot' },
      { note_zh: 'euv-interferometer 10 点读相位台阶；resolution 0.1–0.2 nm', performedBy: 'plant/euv-interferometer' },
      { note_zh: '写 calculated reference；不是直接实测相位', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '相位台阶 1 件（不消耗）+ 干涉仪（不占用）→ resolution 记录 1 份；记录是数据不是物料。',
  },
];

export const DATA_ITEMS: readonly Item[] = [...EUV_PHASE_STANDARD_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...EUV_PHASE_STANDARD_ROUTES];
