/**
 * PD 试验舱 —— 把“台架”变成“能签字的环境”。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么不是再加一件仪器
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 真实 PD 试验要六件事：屏蔽厅、PD-free 源、耦合/检测、接地/滤波、
 * 气候、安全。本文件补其中三件**基础设施**（气候/安全四件见 `pd-cell-climate.ts`）：
 *
 *   shielded-hall   6×5×4 m 焊接钢/铜屏蔽，60–80 dB，门/波导通风
 *   ground-grid     铜接地网，≤0.1 Ω，单点接地
 *   line-filter     三相进线滤波，10 kHz–1 GHz
 *
 * 它们不是“零件”，是**房间**；所以 `plant/pd-test-cell` 是一台
 * 房间级设备，composedOf 这三件基础设施 + 气候/安全四件。
 *
 * 气候与安全已由 `pd-cell-climate.ts` 补：恒温恒湿机组、门联锁、放电棒、接地开关，
 *    四件挂进本舱的 composedOf。⚠️ 仍缺：PD-free 源、IEC 60270 检测器；
 *    舱的 holds 已落：temperature 18–22、humidity 0–60（G1 关闭）。
 *    试验舱只把“背景/地环流/进线干扰”压下去，不解决源自身放电。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const PD_CELL_ITEMS: readonly Item[] = [
  /**
   * 屏蔽厅。6×5×4 m，1.5 mm 焊接钢板 + 铜网，门/波导通风。
   *
   *   attenuation  60–80 dB @10 kHz–1 GHz
   *   size         6×5×4 m
   */
  {
    id: 'plant/pd-test-cell/shielded-hall',
    name: 'PD 屏蔽厅',
    unit: '件',
    category: 'part',
    props: [
      { param: 'attenuation', kind: 'range', min: 40, max: 100, unit: 'dB' },
      { param: 'width', kind: 'range', min: 2, max: 10, unit: 'm' },
      { param: 'height', kind: 'range', min: 2, max: 8, unit: 'm' },
    ],
  },

  /**
   * 接地网。2×2 m 铜网格，≤0.1 Ω，单点接地。
   */
  {
    id: 'plant/pd-test-cell/ground-grid',
    name: 'PD 接地网',
    unit: '件',
    category: 'part',
    props: [
      { param: 'resistance', kind: 'range', min: 0, max: 1, unit: 'Ω', dir: 'atMost' },
      { param: 'mesh', kind: 'range', min: 1, max: 5, unit: 'm' },
    ],
  },

  /**
   * 三相进线滤波器。10 kHz–1 GHz，60–80 dB。
   */
  {
    id: 'plant/pd-test-cell/line-filter',
    name: 'PD 三相进线滤波器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'attenuation', kind: 'range', min: 20, max: 100, unit: 'dB' },
      { param: 'current', kind: 'range', min: 0, max: 200, unit: 'A' },
    ],
  },

  /**
   * PD 试验舱。房间级设备：屏蔽厅 + 接地网 + 进线滤波。
   *
   *   attenuation      60–80 dB
   *   groundResistance ≤0.1 Ω
   *   size             6×5×4 m
   */
  {
    id: 'plant/pd-test-cell',
    name: 'PD 试验舱',
    unit: '座',
    category: 'machine',
    props: [
      { param: 'attenuation', kind: 'range', min: 40, max: 100, unit: 'dB' },
      { param: 'groundResistance', kind: 'range', min: 0, max: 1, unit: 'Ω', dir: 'atMost' },
      { param: 'width', kind: 'range', min: 2, max: 10, unit: 'm' },
      { param: 'height', kind: 'range', min: 2, max: 8, unit: 'm' },
    ],
    // 舱维持的条件：恒温恒湿机组（hvac）在 20±2 °C / RH<60% 上运行。
    // 20±2 写成 18–22：±2 是控制死区，不是两端各 2 K 的独立公差。
    holds: [
      { param: 'temperature', min: 18, max: 22 },
      { param: 'humidity', min: 0, max: 60 },
    ],
    composedOf: [
      { item: 'plant/pd-test-cell/shielded-hall', qty: q(1) },
      { item: 'plant/pd-test-cell/ground-grid', qty: q(1) },
      { item: 'plant/pd-test-cell/line-filter', qty: q(1) },
      // 气候与安全（pd-cell-climate.ts）：恒温恒湿、门联锁、放电棒、接地开关
      { item: 'plant/pd-test-cell/hvac', qty: q(1) },
      { item: 'plant/pd-test-cell/interlock', qty: q(1) },
      { item: 'plant/pd-test-cell/discharge-rod', qty: q(1) },
      { item: 'plant/pd-test-cell/ground-switch', qty: q(1) },
    ],
  },
];

export const PD_CELL_ROUTES: readonly Route[] = [
  {
    /**
     * **屏蔽厅：钢框 + 1.5 mm 钢板 + 铜网 + 门/波导。**
     *
     *   钢 1200 + 铜 20 + 铝 10 → 屏蔽厅 1
     */
    id: 'make/pd-shielded-hall',
    name: 'PD 屏蔽厅制造',
    produces: [
      {
        item: 'plant/pd-test-cell/shielded-hall',
        qty: q(1),
        gives: [
          { param: 'attenuation', kind: 'range', min: 60, max: 80 },
          { param: 'width', kind: 'range', min: 6, max: 6 },
          { param: 'height', kind: 'range', min: 4, max: 4 },
        ],
      },
    ],
    uses: [
      // 六面 148 m² × 1.5 mm 钢板 ≈ 1.7 m³ × 7.85 = 13 t；取 1.2 t 薄板/骨架
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1200) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(20) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(10) }] },
    ],
    needs: [],
    steps: [
      {
        note_zh:
          '焊 6×5×4 m 钢框；六面铺 1.5 mm 钢板，焊缝连续；门框加铜簧片，观察窗用铜网夹层；通风口接波导截止管',
        performedBy: 'plant/sheet-shop',
      },
      {
        note_zh: '内衬铜网/铜箔，所有接缝搭接 50 mm；单点接地铜排引出',
        performedBy: 'plant/robot',
      },
    ],
    rate: { hours: q(200) },
    unbalanced_zh:
      '钢 1200 + 铜 20 + 铝 10 = 1230 kg → 屏蔽厅 1；余是钢板边角/焊条/门框废料。60–80 dB 是设计值，未做屏蔽室法实测',
  },
  {
    /**
     * **接地网：2×2 m 铜网格 + 接地极。**
     *
     *   铜 100 + 钢 20 → 接地网 1
     */
    id: 'make/pd-ground-grid',
    name: 'PD 接地网制造',
    produces: [
      {
        item: 'plant/pd-test-cell/ground-grid',
        qty: q(1),
        gives: [
          { param: 'resistance', kind: 'range', min: 0.05, max: 0.1 },
          { param: 'mesh', kind: 'range', min: 2, max: 2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(100) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(20) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
    rate: { hours: q(40) },
    unbalanced_zh:
      '铜 100 + 钢 20 = 120 kg → 接地网 1；余是铜排/接地极/焊接废料。≤0.1 Ω 是设计值，未做接地电阻实测',
  },
  {
    /**
     * **三相进线滤波：电容 + 铜排 + 钢壳。**
     *
     *   薄膜电容 6 + 铜 10 + 钢 20 → 滤波器 1
     */
    id: 'make/pd-line-filter',
    name: 'PD 三相进线滤波器制造',
    produces: [
      {
        item: 'plant/pd-test-cell/line-filter',
        qty: q(1),
        gives: [
          { param: 'attenuation', kind: 'range', min: 60, max: 80 },
          { param: 'current', kind: 'range', min: 63, max: 63 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/capacitor-film-general', qty: q(6) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(10) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(20) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
    rate: { hours: q(40) },
    unbalanced_zh:
      '电容 6 + 铜 10 + 钢 20 → 滤波器 1；余是铜排/外壳/接线废料。60–80 dB 是 10 kHz–1 GHz 设计值，未做插入损耗实测',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...PD_CELL_ITEMS];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/pd-test-cell',
    name: 'PD 试验舱装配',
    produces: [{
      item: 'plant/pd-test-cell',
      qty: q(1),
      gives: [
      { param: 'attenuation', kind: 'range', min: 40, max: 100 },
      { param: 'groundResistance', kind: 'range', min: 0, max: 1, dir: 'atMost' },
      { param: 'width', kind: 'range', min: 2, max: 10 },
      { param: 'height', kind: 'range', min: 2, max: 8 },
      ],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...PD_CELL_ROUTES, ...ASSEMBLY_ROUTES];
