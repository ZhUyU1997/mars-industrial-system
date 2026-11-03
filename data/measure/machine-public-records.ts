/**
 * 机器性能的公开实测规格记录（public class record）。
 *
 * 这些不是本机实测，是同型号/同类公开 datasheet 的测量值；
 * 记录注释写明来源与“不是本机实测”。本机仍需验收/校准。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const MACHINE_PUBLIC_ITEMS: readonly Item[] = [
  { id: 'mat/ccp-polisher-public-record', name: 'CCP 抛光机公开规格记录', unit: '份', category: 'part', props: [
    { param: 'position', kind: 'range', min: 0.5, max: 1, unit: 'µm', dir: 'atMost' },
    { param: 'points', kind: 'range', min: 1, max: 10, unit: '点' },
  ] },
  { id: 'mat/euv-hina-overlay-public-record', name: 'EUV 光刻机套刻公开规格记录', unit: '份', category: 'part', props: [
    { param: 'overlay', kind: 'range', min: 0, max: 1.1, unit: 'nm', dir: 'atMost' },
    { param: 'points', kind: 'range', min: 1, max: 10, unit: '点' },
  ] },
  { id: 'mat/euv-interferometer-public-record', name: 'EUV 干涉仪公开规格记录', unit: '份', category: 'part', props: [
    { param: 'resolution', kind: 'range', min: 0.1, max: 0.2, unit: 'nm', dir: 'atMost' },
    { param: 'repeatability', kind: 'range', min: 0.05, max: 0.1, unit: 'nm', dir: 'atMost' },
    { param: 'points', kind: 'range', min: 1, max: 10, unit: '点' },
  ] },
  { id: 'mat/float-zone-puller-public-record', name: 'FZ 炉公开规格记录', unit: '份', category: 'part', props: [
    { param: 'rfPower', kind: 'range', min: 18000, max: 22000, unit: 'W' },
    { param: 'points', kind: 'range', min: 1, max: 10, unit: '点' },
  ] },
  { id: 'mat/robot-npu-public-record', name: '机器人 NPU 公开规格记录', unit: '份', category: 'part', props: [
    { param: 'tops', kind: 'range', min: 100, max: 275, unit: 'TOPS' },
    { param: 'sram', kind: 'range', min: 10, max: 100, unit: 'MB' },
    { param: 'power', kind: 'range', min: 10, max: 30, unit: 'W' },
    { param: 'points', kind: 'range', min: 1, max: 10, unit: '点' },
  ] },
  { id: 'mat/rta-public-record', name: 'RTA 公开规格记录', unit: '份', category: 'part', props: [
    { param: 'waferUniformity', kind: 'range', min: 1, max: 5, unit: 'K', dir: 'atMost' },
    { param: 'points', kind: 'range', min: 1, max: 10, unit: '点' },
  ] },
  { id: 'mat/rta-zone-control-public-record', name: 'RTA 分区控制公开规格记录', unit: '份', category: 'part', props: [
    { param: 'uniformity', kind: 'range', min: 0, max: 8, unit: 'K', dir: 'atMost' },
    { param: 'points', kind: 'range', min: 1, max: 10, unit: '点' },
  ] },
  { id: 'mat/rta-zone-lamp-public-record', name: 'RTA 灯区公开规格记录', unit: '份', category: 'part', props: [
    { param: 'relativeAccuracy', kind: 'range', min: 1, max: 1.5, unit: '%', dir: 'atMost' },
    { param: 'points', kind: 'range', min: 1, max: 10, unit: '点' },
  ] },
  { id: 'mat/rta-zoned-public-record', name: '分区 RTA 公开规格记录', unit: '份', category: 'part', props: [
    { param: 'waferUniformity', kind: 'range', min: 2, max: 3, unit: 'K', dir: 'atMost' },
    { param: 'points', kind: 'range', min: 1, max: 10, unit: '点' },
  ] },
  { id: 'mat/slab-laser-public-record', name: '20 kW slab CO₂ 激光公开规格记录', unit: '份', category: 'part', props: [
    { param: 'power', kind: 'range', min: 18000, max: 22000, unit: 'W' },
    { param: 'points', kind: 'range', min: 1, max: 10, unit: '点' },
  ] },
];

const PUBLIC_RECORD_NAMES: Record<string, string> = {
  'mat/ccp-polisher-public-record': 'CCP 抛光机公开规格',
  'mat/euv-hina-overlay-public-record': 'EUV 光刻机套刻公开规格',
  'mat/euv-interferometer-public-record': 'EUV 干涉仪公开规格',
  'mat/float-zone-puller-public-record': 'FZ 炉公开规格',
  'mat/robot-npu-public-record': '机器人 NPU 公开规格',
  'mat/rta-public-record': 'RTA 公开规格',
  'mat/rta-zone-control-public-record': 'RTA 分区控制公开规格',
  'mat/rta-zone-lamp-public-record': 'RTA 灯区公开规格',
  'mat/rta-zoned-public-record': '分区 RTA 公开规格',
  'mat/slab-laser-public-record': '20 kW slab CO₂ 激光公开规格',
};

const specRoute = (id: string, item: string, gives: { param: string; min: number; max: number }[], source: string): Route => ({
  id,
  name: `${PUBLIC_RECORD_NAMES[item] ?? source}采集`,
  produces: [{
    item,
    qty: q(1),
    gives: [
      ...gives.map((g) => ({ param: g.param, kind: 'range' as const, min: g.min, max: g.max })),
      { param: 'points', kind: 'range' as const, min: 3, max: 3 },
    ],
  }],
  uses: [],
  needs: [],
  rate: { hours: q(1) },
  steps: [
    { note_zh: `查公开规格：${source}`, performedBy: 'plant/robot' },
    { note_zh: '写 public class record；注明不是本机实测，本机仍做验收/校准', performedBy: 'plant/robot' },
  ],
  unbalanced_zh: '记录 1 份；公开 datasheet 不是物料。',
});

export const MACHINE_PUBLIC_ROUTES: readonly Route[] = [
  specRoute('spec/ccp-polisher-public-spec', 'mat/ccp-polisher-public-record', [{ param: 'position', min: 0.5, max: 1 }], '660 mm 抛光机定位 0.5–1 µm'),
  specRoute('spec/euv-hina-overlay-public-spec', 'mat/euv-hina-overlay-public-record', [{ param: 'overlay', min: 0, max: 1.1 }], 'NXE 级 EUV 光刻 overlay ≤1.1 nm'),
  specRoute('spec/euv-interferometer-public-spec', 'mat/euv-interferometer-public-record', [{ param: 'resolution', min: 0.1, max: 0.2 }, { param: 'repeatability', min: 0.05, max: 0.1 }], '660 mm EUV 干涉仪 0.1 nm 分辨率/0.05–0.1 nm 重复性'),
  specRoute('spec/float-zone-puller-public-spec', 'mat/float-zone-puller-public-record', [{ param: 'rfPower', min: 18000, max: 22000 }], 'FZ 炉 20 kW RF'),
  specRoute('spec/robot-npu-public-spec', 'mat/robot-npu-public-record', [{ param: 'tops', min: 100, max: 275 }, { param: 'sram', min: 10, max: 100 }, { param: 'power', min: 10, max: 30 }], 'Jetson Orin 级 NPU 100–275 TOPS、10–30 W'),
  specRoute('spec/rta-public-spec', 'mat/rta-public-record', [{ param: 'waferUniformity', min: 1, max: 5 }], 'RTA 片内均匀性 1–5 K'),
  specRoute('spec/rta-zone-control-public-spec', 'mat/rta-zone-control-public-record', [{ param: 'uniformity', min: 0, max: 8 }], 'RTA 16/8 区控制均匀性 0–8 K'),
  specRoute('spec/rta-zone-lamp-public-spec', 'mat/rta-zone-lamp-public-record', [{ param: 'relativeAccuracy', min: 1, max: 1.5 }], 'RTA 灯区相对精度 1–1.5 %'),
  specRoute('spec/rta-zoned-public-spec', 'mat/rta-zoned-public-record', [{ param: 'waferUniformity', min: 2, max: 3 }], '分区 RTA 片内均匀性 2–3 K'),
  specRoute('spec/slab-laser-public-spec', 'mat/slab-laser-public-record', [{ param: 'power', min: 18000, max: 22000 }], '20 kW slab CO₂ 激光'),
];

export const DATA_ITEMS: readonly Item[] = [...MACHINE_PUBLIC_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...MACHINE_PUBLIC_ROUTES];
