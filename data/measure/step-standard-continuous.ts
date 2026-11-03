/**
 * 1–10 nm 连续台阶组：同一片 100 mm 硅片上做 10 个 5×5 mm 区，
 * 分别 ALD 10/20/…/100 周期 HfO₂（GPC 0.09–0.1 nm），lift-off 成形，
 * X 射线干涉仪逐区定值、AFM 复测。
 *
 * 这是已有 `make/step-standard-1nm-10nm` 工艺的 10 点扩展，不新建整机；
 * U ≤0.06 nm，面积 5000–7850 mm²，来源是同一 ALD/lift-off/X 射线定值链。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const STEP_STANDARD_CONTINUOUS_ITEMS: readonly Item[] = [
  {
    id: 'std/step-standard-1-10nm-continuous',
    name: '1–10 nm Continuous Step Height Standard', name_zh: '1–10 nm 连续台阶标准件',
    unit: '片',
    category: 'part',
    props: [
      { param: 'stepCount', kind: 'range', min: 10, max: 10, unit: '点' },
      { param: 'stepHeight', kind: 'range', min: 1, max: 10, unit: 'nm' },
      { param: 'uncertainty', kind: 'range', min: 0, max: 0.06, unit: 'nm', dir: 'atMost' },
      { param: 'area', kind: 'range', min: 5000, max: 7850, unit: 'mm²', dir: 'atLeast' },
    ],
  },
];

export const STEP_STANDARD_CONTINUOUS_ROUTES: readonly Route[] = [
  {
    /**
     * **10 区连续台阶：每区 10n 周期 ALD，n=1..10；X 射线逐区定值。**
     */
    id: 'make/step-standard-1-10nm-continuous',
    name: '1–10 nm Continuous Step Height Standard Manufacturing', name_zh: '1–10 nm 连续台阶标准件制造',
    produces: [{
      item: 'std/step-standard-1-10nm-continuous',
      qty: q(1),
      gives: [
        { param: 'stepCount', kind: 'range', min: 10, max: 10 },
        { param: 'stepHeight', kind: 'range', min: 1, max: 10 },
        { param: 'uncertainty', kind: 'range', min: 0, max: 0.06 },
        { param: 'area', kind: 'range', min: 5000, max: 7850 },
      ],
    }],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/hafnium-chloride', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 5000) }] },
      { anyOf: [{ item: 'mat/hcl', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/acetone', qty: q(1, 5) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(160) },
    steps: [
      { note_zh: '清洗 1 片 φ100 硅片：碱洗/酸洗/去离子水冲/甩干；HF 30 s 剥 native oxide', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 20, max: 40 }, { param: 'pressure', min: 100, max: 500 }] },
      { note_zh: '10 区套刻：第 n 区开窗后 ALD 10n 周期 HfO₂（n=1..10，10–100 周期，GPC 0.09–0.1 nm），HCl lift-off 成形', performedBy: 'plant/ald-reactor', under: [{ param: 'temperature', min: 200, max: 250 }, { param: 'pressure', min: 20, max: 60 }] },
      { note_zh: 'X 射线干涉仪逐区定值 10 点：0.1 nm = 0.319 个 (111) 条纹、八帧 11°；AFM 复测差 <2% 才收', performedBy: 'plant/xray-interferometer', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '编号/装盒；10 区全合格才出 1 片连续台阶标准', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '硅片 1 + HfCl₄ 1 g + 水 2 kg + 氮 0.1 kg + 胶 0.05 kg + 铝 0.2 g → 连续台阶标准 1 片；余是工艺损耗。',
  },
];

export const DATA_ITEMS: readonly Item[] = [...STEP_STANDARD_CONTINUOUS_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...STEP_STANDARD_CONTINUOUS_ROUTES];
