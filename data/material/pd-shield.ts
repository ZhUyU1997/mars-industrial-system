/**
 * PD 屏蔽笼 + 100 kV 滤波器 —— 把“源自己的局放”和“试品的局放”分开。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么需要这两件
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `source-100k` 是 34 级倍压，纹波 3%、22 µA；它自己可能就在放电。
 * 没有屏蔽和滤波，耦合电容/峰值保持听到的是**源的电晕**，不是试品。
 *
 *   屏蔽笼：2 × 2 × 2 m 铝/铜网，门、馈通、绝缘支撑
 *   滤波器：100 kΩ 串联电阻 + 100 pF 并联电容（SF₆），fc ≈ 16 kHz
 *
 * 滤波器只压**高频 PD 脉冲**从源到试品的传导；它不消除源内部放电，
 * 也不替代 PD-free 变压器。真正签字仍要“源背景 < 试品 PD”。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const PD_SHIELD_ITEMS: readonly Item[] = [
  /**
   * PD 屏蔽笼。2×2×2 m，铝/铜网 + 钢框 + 门 + 馈通。
   *
   *   attenuation  40–60 dB @100 MHz–1 GHz
   *   size         2×2×2 m
   */
  {
    id: 'plant/hv-test-bench/pd-shield-cage',
    name: 'PD Shield Cage', name_zh: 'PD 屏蔽笼',
    unit: '件',
    category: 'part',
    props: [
      { param: 'attenuation', kind: 'range', min: 20, max: 80, unit: 'dB' },
      { param: 'width', kind: 'range', min: 1, max: 5, unit: 'm' },
      { param: 'height', kind: 'range', min: 1, max: 5, unit: 'm' },
    ],
  },

  /**
   * 100 kV 滤波器。100 kΩ 串联 + 100 pF 并联，fc ≈ 16 kHz。
   *
   *   voltage      100 kV
   *   cutoff       10–20 kHz
   *   attenuation  35–60 dB @1–10 MHz
   */
  {
    id: 'plant/hv-test-bench/hv-filter-100k',
    name: '100 kV Filter', name_zh: '100 kV 滤波器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'voltage', kind: 'range', min: 0, max: 200000, unit: 'V', dir: 'atLeast' },
      { param: 'cutoff', kind: 'range', min: 1, max: 100, unit: 'kHz' },
      { param: 'attenuation', kind: 'range', min: 20, max: 80, unit: 'dB' },
    ],
  },
];

export const PD_SHIELD_ROUTES: readonly Route[] = [
  {
    /**
     * **屏蔽笼：钢框 + 铝网 + 铜网 + 门/馈通。**
     *
     *   铝 20 + 铜 10 + 钢 50 → 屏蔽笼 1
     */
    id: 'make/pd-shield-cage',
    name: 'PD Shield Cage Manufacturing', name_zh: 'PD 屏蔽笼制造',
    produces: [
      {
        item: 'plant/hv-test-bench/pd-shield-cage',
        qty: q(1),
        gives: [
          { param: 'attenuation', kind: 'range', min: 40, max: 60 },
          { param: 'width', kind: 'range', min: 2, max: 2 },
          { param: 'height', kind: 'range', min: 2, max: 2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(20) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(10) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(50) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh:
          '焊钢框 2×2×2 m；六面铺铝网/铜网，网间接缝搭接 50 mm、用导电胶/铜箔压紧；门框加铜簧片 —— **缝比网重要**，一条 100 mm 的缝就能把 40 dB 漏成 10 dB',
        performedBy: 'plant/sheet-shop',
      },
      {
        note_zh:
          '装门、观察窗（铜网夹层）、高压馈通、接地铜排；地面铺铜箔，笼体单点接地',
        performedBy: 'plant/robot',
      },
    ],
    rate: { hours: q(40) },
    unbalanced_zh:
      '铝 20 + 铜 10 + 钢 50 = 80 kg → 屏蔽笼 1；余是网边角/焊条/门框废料。40–60 dB 是 100 MHz–1 GHz 的设计值，未做屏蔽室法实测',
  },
  {
    /**
     * **100 kV 滤波器：100 kΩ 电阻丝 + 100 pF 耦合电容当并联臂。**
     *
     *   电阻丝 0.1 + 耦合电容 1 + 氧化铝 2 + SF₆ 1 + 铝 2 → 滤波器 1
     */
    id: 'make/hv-filter-100k',
    name: '100 kV Filter Manufacturing', name_zh: '100 kV 滤波器制造',
    produces: [
      {
        item: 'plant/hv-test-bench/hv-filter-100k',
        qty: q(1),
        gives: [
          { param: 'voltage', kind: 'range', min: 100000, max: 100000 },
          { param: 'cutoff', kind: 'range', min: 10, max: 20 },
          { param: 'attenuation', kind: 'range', min: 35, max: 60 },
        ],
      },
    ],
    uses: [
      // 100 kΩ：100 kV/22 µA 下 2.2 V 压降、48 mW；电阻丝绕氧化铝骨架，SF₆ 绝缘
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1, 10) }] },
      { anyOf: [{ item: 'plant/hv-test-bench/coupling-cap-100k', qty: q(1) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(2) }] },
      { anyOf: [{ item: 'mat/sf6', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(2) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
    rate: { hours: q(16) },
    unbalanced_zh:
      '电阻丝 0.1 + 耦合电容 1 + 氧化铝 2 + SF₆ 1 + 铝 2 → 滤波器 1；余是骨架/屏蔽盒/接线废料。100 kΩ × 100 pF ⇒ fc ≈ 16 kHz；1–10 MHz 衰减 35–60 dB',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...PD_SHIELD_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...PD_SHIELD_ROUTES];
