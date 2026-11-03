/**
 * WF₆ 反应器 —— 低压镍内衬炉，补 `data/material/wf6.ts` 缺的那台设备。
 *
 * 窗口：300–450 °C / 0.05–0.5 MPa，**不是 autoclave 的 10–35 MPa 档**。
 * F₂ 接液面全是镍；密封用镍金属垫，不用 PTFE/弹性体。
 *
 * 制造边界：
 *   · 壳体卷焊、镍内衬卷焊 → `plant/sheet-shop`；
 *   · 法兰/垫片车削 → `lathe`；
 *   · 阀体铣削 → `plant/milling-machine`；
 *   · 加热夹套、热电偶套管装配 → sheet-shop + lathe。
 *
 * ⚠️ 降级：
 *   · 镍内衬**只做卷焊，不做胀接**：现有设备没有液压胀管器；卷焊后与镍法兰
 *     焊死，靠法兰金属垫密封。焊缝没有 RT/PT，只有煤油渗透/目视；
 *   · 没有氦检漏，`leakRate` 是设计值；
 *   · 镍焊需要 Ar 保护，sheet-shop 的手工焊没有 TIG 资质；按“能焊但无工艺
 *     评定”记降级；
 *   · 阀是镍截止阀 + 金属垫，不是波纹管阀；阀杆填料仍是石墨/镍丝，长期
 *     F₂ 下的寿命没有数据。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const WF6_REACTOR_ITEMS: readonly Item[] = [
  /**
   * 低压镍内衬 WF₆ 反应器。**machine，不是 autoclave。**
   *
   *   holds: 300–450 °C / 0.05–0.5 MPa
   *   materialCompatibility: Ni/F₂
   *   linerThickness: 2–3 mm
   *   leakRate: ≤1e-6 Pa·L/s（设计值，没有氦检漏）
   */
  {
    id: 'plant/wf6-reactor',
    name: '低压镍内衬 WF₆ 反应器',
    unit: '台',
    category: 'machine',
    holds: [
      { param: 'temperature', min: 300, max: 450 },
      { param: 'pressure', min: 0.05, max: 0.5 },
    ],
    props: [
      { param: 'materialCompatibility', kind: 'enum', values: ['Ni/F2'] },
      { param: 'linerThickness', kind: 'range', min: 2, max: 3, unit: 'mm' },
      { param: 'leakRate', kind: 'range', min: 0, max: 1e-6, unit: 'Pa·L/s', dir: 'atMost' },
    ],
  },

  /** 不锈钢壳体（只承压，不接 F₂；内衬隔开）。 */
  {
    id: 'plant/wf6-reactor/shell',
    name: '不锈钢壳体',
    unit: '件',
    category: 'part',
  },

  /** 镍内衬（2–3 mm 镍板卷焊；不胀接，与镍法兰焊死）。 */
  {
    id: 'plant/wf6-reactor/liner',
    name: '镍内衬',
    unit: '件',
    category: 'part',
  },

  /** 镍法兰（车削；金属垫密封面）。 */
  {
    id: 'plant/wf6-reactor/flange',
    name: '镍法兰',
    unit: '件',
    category: 'part',
  },

  /** 镍截止阀（铣阀体 + 车阀座；石墨/镍丝填料）。 */
  {
    id: 'plant/wf6-reactor/valve',
    name: '镍截止阀',
    unit: '件',
    category: 'part',
  },

  /** 加热夹套（不锈钢；外面包矿棉，不接 F₂）。 */
  {
    id: 'plant/wf6-reactor/heating-jacket',
    name: '加热夹套',
    unit: '件',
    category: 'part',
  },

  /** 镍套管热电偶（K 型芯 + 镍套管；F₂ 接液面是镍）。 */
  {
    id: 'plant/wf6-reactor/thermocouple',
    name: '镍套管热电偶',
    unit: '件',
    category: 'part',
  },

  /** 镍金属垫（车削/冲切；不用 PTFE/弹性体）。 */
  {
    id: 'plant/wf6-reactor/gasket',
    name: '镍金属垫',
    unit: '件',
    category: 'part',
  },
];

export const WF6_REACTOR_ROUTES: readonly Route[] = [
  {
    /** 壳体：304 不锈钢板卷圆 + 纵缝焊 + 封头。 */
    id: 'make/wf6-reactor-shell',
    name: '不锈钢壳体制造',
    produces: [{ item: 'plant/wf6-reactor/shell', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(8) }] }],
    needs: ['plant/clean-room'],
    performedBy: 'plant/sheet-shop',
    rate: { hours: q(6) },
    unbalanced_zh: '304 不锈钢 8 kg → 壳体 1 件（8 kg）；余是边角/焊材，未计。只承压，不接 F₂',
  },

  {
    /** 镍内衬：2–3 mm 镍板卷圆 + 纵缝焊；与镍法兰焊死，不胀接。 */
    id: 'make/wf6-reactor-liner',
    name: '镍内衬制造',
    produces: [{ item: 'plant/wf6-reactor/liner', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/nickel', qty: q(3) }] }],
    needs: ['plant/clean-room'],
    performedBy: 'plant/sheet-shop',
    rate: { hours: q(8) },
    unbalanced_zh: '镍板 3 kg → 内衬 1 件（3 kg）；卷焊纵缝，余是边角/焊材。**不胀接**：没有液压胀管器；靠镍法兰 + 金属垫密封',
  },

  {
    /** 法兰：镍棒车削，密封面 Ra ≤1.6 µm。 */
    id: 'make/wf6-reactor-flange',
    name: '镍法兰制造',
    produces: [{ item: 'plant/wf6-reactor/flange', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/nickel', qty: q(1) }] }],
    needs: ['plant/clean-room'],
    performedBy: 'lathe',
    rate: { hours: q(3) },
    unbalanced_zh: '镍棒 1 kg → 法兰 1 件（1 kg）；车屑/端面余量未计。密封面靠车削，不用 PTFE 垫',
  },

  {
    /** 阀：镍阀体铣削 + 阀座车削；石墨/镍丝填料。 */
    id: 'make/wf6-reactor-valve',
    name: '镍截止阀制造',
    produces: [{ item: 'plant/wf6-reactor/valve', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/nickel', qty: q(1) }] }],
    needs: ['lathe', 'plant/clean-room'],
    performedBy: 'plant/milling-machine',
    rate: { hours: q(4) },
    unbalanced_zh: '镍 1 kg → 阀 1 件（1 kg）；阀体铣、阀座车，余是切屑。金属填料，不用弹性体',
  },

  {
    /** 加热夹套：不锈钢板卷焊 + 矿棉保温。 */
    id: 'make/wf6-reactor-jacket',
    name: '加热夹套制造',
    produces: [{ item: 'plant/wf6-reactor/heating-jacket', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(2) }] },
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(1, 2) }] },
    ],
    needs: ['plant/clean-room'],
    performedBy: 'plant/sheet-shop',
    rate: { hours: q(4) },
    unbalanced_zh: '不锈钢 2 kg + 矿棉 0.5 kg → 夹套 1 件；余是边角。夹套不接 F₂',
  },

  {
    /** 热电偶：K 型芯 + 镍套管，车削/装配。 */
    id: 'make/wf6-reactor-thermocouple',
    name: '镍套管热电偶制造',
    produces: [{ item: 'plant/wf6-reactor/thermocouple', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'std/thermocouple-t-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/nickel', qty: q(1, 10) }] },
    ],
    needs: ['lathe', 'plant/clean-room'],
    performedBy: 'plant/robot',
    rate: { hours: q(1) },
    unbalanced_zh: 'K 型热电偶 1 支 + 镍 0.1 kg → 镍套管热电偶 1 件；余是套管切屑。F₂ 接液面是镍',
  },

  {
    /** 金属垫：镍板冲切/车削，不用 PTFE/弹性体。 */
    id: 'make/wf6-reactor-gasket',
    name: '镍金属垫制造',
    produces: [{ item: 'plant/wf6-reactor/gasket', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/nickel', qty: q(1, 5) }] }],
    needs: ['lathe', 'plant/clean-room'],
    performedBy: 'plant/sheet-shop',
    rate: { hours: q(1) },
    unbalanced_zh: '镍 0.2 kg → 垫 1 件；余是冲切边角。全金属，不用 PTFE/弹性体',
  },

  {
    /** 总装：内衬装入壳体、法兰/阀/热电偶/夹套装配、煤油渗透。 */
    id: 'make/wf6-reactor',
    name: '低压镍内衬 WF₆ 反应器装配',
    produces: [
      {
        item: 'plant/wf6-reactor',
        qty: q(1),
        gives: [
          { param: 'materialCompatibility', kind: 'enum', oneOf: ['Ni/F2'] },
          { param: 'linerThickness', kind: 'range', min: 2, max: 3 },
          { param: 'leakRate', kind: 'range', min: 0, max: 1e-6 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/wf6-reactor/shell', qty: q(1) }] },
      { anyOf: [{ item: 'plant/wf6-reactor/liner', qty: q(1) }] },
      { anyOf: [{ item: 'plant/wf6-reactor/flange', qty: q(2) }] },
      { anyOf: [{ item: 'plant/wf6-reactor/valve', qty: q(2) }] },
      { anyOf: [{ item: 'plant/wf6-reactor/heating-jacket', qty: q(1) }] },
      { anyOf: [{ item: 'plant/wf6-reactor/thermocouple', qty: q(2) }] },
      { anyOf: [{ item: 'plant/wf6-reactor/gasket', qty: q(4) }] },
    ],
    needs: ['plant/sheet-shop', 'lathe', 'plant/milling-machine', 'plant/clean-room'],
    performedBy: 'plant/robot',
    rate: { hours: q(8) },
    unbalanced_zh:
      '壳体 1 + 内衬 1 + 法兰 2 + 阀 2 + 夹套 1 + 热电偶 2 + 垫 4 → 反应器 1 台。没有质量账（part 按件）。焊缝只做煤油渗透/目视，没有 RT/PT；没有氦检漏，leakRate 是设计值',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...WF6_REACTOR_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...WF6_REACTOR_ROUTES];
