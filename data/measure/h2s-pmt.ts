/**
 * H₂S PMT-FPD 记录与测量路线。
 *
 * 0.01 ppm = 4.36 pg S/s；PMT 档 1–4 pg S/s 地板 ⇒ S/N 3.3–13。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const DATA_ITEMS: readonly Item[] = [
  /**
   * **H₂S PMT-FPD 记录：0.01–5 ppm、检出限 0.01–0.05 ppm、S/N 3–30。**
   *
   * 一份对应一批。记录里写：
   *
   *   ① H₂S 0.01/0.1/1/5 ppm 四点的峰高与阳极电流（0.2–2.7 µA）；
   *   ② 检出限 0.01–0.05 ppm（按 1–4 pg S/s 的 3σ 地板）；
   *   ③ 暗计数 20–80 cps、S/N 3–13（0.01 ppm 点）；
   *   ④ 394 nm、PMT 800–1500 V、method = fpd-pmt。
   *
   * ⚠️ 记录的是**读数**，不是设计值；0.01 ppm 的 S/N 3.3–13 是设计预算，
   * 首批实测若低于 3，按 R12 记为未收窄，不写“闭合”。
   */
  {
    id: 'mat/h2s-pmt-record',
    name: 'H₂S PMT-FPD 记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'hydrogenSulfide', kind: 'range', min: 0.01, max: 5, unit: 'ppm' },
      { param: 'detectionLimit', kind: 'range', min: 0.01, max: 0.05, unit: 'ppm', dir: 'atMost' },
      { param: 'signalToNoise', kind: 'range', min: 3, max: 100, unit: '1', dir: 'atLeast' },
      { param: 'anodeCurrent', kind: 'range', min: 0.1, max: 10, unit: 'µA' },
      { param: 'darkCount', kind: 'range', min: 10, max: 100, unit: 'cps', dir: 'atMost' },
      { param: 'wavelength', kind: 'range', min: 392, max: 396, unit: 'nm' },
      { param: 'method', kind: 'enum', values: ['fpd-pmt'] },
    ],
  },
];

export const DATA_ROUTES: readonly Route[] = [
  {
    /**
     * **H₂S PMT-FPD 测量：过阱 → GC 分离 → FPD-PMT → 四点标定 → 记录。**
     *
     *   5 g 电子级 NH₃ + H₂/空气/N₂ → 记录 1 份
     *
     * 0.01 ppm = 4.36 pg S/s；PMT 档 1–4 pg S/s 地板 ⇒ S/N 3.3–13。
     * 0.05 ppm = 21.8 pg S/s ⇒ S/N 16–65。
     */
    id: 'measure/h2s-pmt',
    name: 'H₂S PMT-FPD 测量',
    rate: { hours: q(4) },
    produces: [
      {
        item: 'mat/h2s-pmt-record',
        qty: q(1),
        gives: [
          { param: 'hydrogenSulfide', kind: 'range', min: 0.01, max: 5 },
          { param: 'detectionLimit', kind: 'range', min: 0.01, max: 0.05 },
          { param: 'signalToNoise', kind: 'range', min: 3, max: 13 },
          { param: 'anodeCurrent', kind: 'range', min: 0.2, max: 2.7 },
          { param: 'darkCount', kind: 'range', min: 20, max: 80 },
          { param: 'wavelength', kind: 'range', min: 392, max: 396 },
          { param: 'method', kind: 'enum', oneOf: ['fpd-pmt'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/ammonia-electronic', qty: q(1, 200) }] },
      { anyOf: [{ item: 'mat/hydrogen', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(1, 100) }] },
    ],
    needs: ['plant/metrology-room', 'plant/mfc', 'plant/nh3-absorber'],
    steps: [
      { note_zh: '① 进样：5 mL 环；样品先过 `plant/nh3-absorber`（85 % 磷酸脱 NH₃，H₂S 回收 >95 %）', performedBy: 'plant/gc-tcd', under: [{ param: 'pressure', min: 1.2e5, max: 1.6e5 }] },
      { note_zh: '② 分离：PTFE 柱 60–80 °C、N₂ 20 mL/min；H₂S 0.8 min，COS/CH₃SH/CS₂ 在后', performedBy: 'plant/gc-tcd', under: [{ param: 'temperature', min: 60, max: 90 }] },
      { note_zh: '③ FPD-PMT：H₂ 120 + 空气 150、394 nm、PMT 800–1500 V、阳极 0.2–2.7 µA；0.01 ppm 的 S/N 3.3–13', performedBy: 'plant/fpd', under: [{ param: 'temperature', min: 180, max: 240 }] },
      { note_zh: '④ 四点标定 0.01/0.1/1/5 ppm + 空白；算检出限 0.01–0.05 ppm、暗计数 20–80 cps；写 `mat/h2s-pmt-record`', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '无 kg 投入（样品 5 g NH₃ 与标气不登条目）→ 记录 1 份；产物按份计，不进 kg 守恒。0.01 ppm = 4.36 pg S/s；S/N 3.3–13 是设计预算，实测低于 3 则按 R12 记未收窄',
  },
];
