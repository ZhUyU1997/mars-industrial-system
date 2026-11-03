/**
 * 车床床身导轨面平面度的测量 —— 用钠光干涉仪读条纹，本层唯一的“亚微米直尺”。
 *
 * 怎么测：把 `plant/interferometer` 的参考平晶（φ300，λ/4）扣在导轨面上，
 * 钠 D 线（589 nm）照上去，平晶与导轨面之间是一层空气楔 —— 一条条纹
 * 对应 λ/2 = **0.295 µm** 的高度差。读条纹数 × 0.295 就是这 300 mm 里的平面度。
 *
 * 为什么只能测 300 mm 口径：平晶只有 φ300。更长的床身要逐段挪平晶、每次
 * 记条纹，段与段之间的搭接靠“重叠 50 mm”保证 —— 这与量块逐块研合是同一招。
 *
 * 交出去：`flatness 1–4 µm`（每 300 mm 口径）。
 *
 * 缺口：
 *   · 钠灯是低压钠灯，相干长度只有几 mm，平晶要贴得很近（空气楔 <10 µm），
 *     而贴太近会划伤导轨面 —— 所以要垫三片 5 µm 的箔；
 *   · 温漂：λ/2 是 0.3 µm，铸铁 11 ppm/K × 300 mm × 1 K = 3.3 µm，**比判据还大**；
 *     所以必须在 20 °C 恒温室里放 24 h 再测；
 *   · 只测平面度，不测直线度与平行度（那要自准直仪，本层没有）。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

/**
 * 床身导轨面平面度记录：flatness 1–4 µm（每 300 mm 口径）、
 * uncertainty 0.05–0.1 µm、5–10 点。资格带，不是单次读数。
 */
export const LATHE_BED_FLATNESS_ITEMS: readonly Item[] = [
  {
    id: 'mat/lathe-bed-flatness-record',
    name: 'Bed Guideway Surface Flatness Record', name_zh: '床身导轨面平面度记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'flatness', kind: 'range', min: 1, max: 4, unit: 'µm', dir: 'atMost' },
      { param: 'uncertainty', kind: 'range', min: 0.05, max: 0.1, unit: 'µm', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 5, max: 10, unit: '点' },
    ],
  },
];

export const LATHE_BED_FLATNESS_ROUTES: readonly Route[] = [
  {
    /** 床身导轨面平面度：钠光干涉 + φ300 平晶，逐段 300 mm 读条纹。 */
    id: 'measure/lathe-bed-flatness',
    name: 'Bed Guideway Surface Flatness Measurement', name_zh: '床身导轨面平面度测量',
    produces: [
      {
        item: 'mat/lathe-bed-flatness-record',
        qty: q(1),
        gives: [
          { param: 'flatness', kind: 'range', min: 1, max: 4 },
          { param: 'uncertainty', kind: 'range', min: 0.05, max: 0.1 },
          { param: 'points', kind: 'range', min: 5, max: 10 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'lathe/base', qty: q(1) }] }],
    needs: [],
    steps: [
      { note_zh: '床身在 20 °C 恒温室放 24 h（温漂 3.3 µm/K，比判据大）', performedBy: 'plant/metrology-room', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '垫三片 5 µm 铝箔，φ300 平晶扣在导轨面上，钠光入射', performedBy: 'plant/interferometer' },
      { note_zh: '数条纹：一条 = λ/2 = 0.295 µm；逐段 300 mm、搭接 50 mm', performedBy: 'plant/robot' },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...LATHE_BED_FLATNESS_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...LATHE_BED_FLATNESS_ROUTES];
