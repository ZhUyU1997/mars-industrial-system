/**
 * STI 专用 TEOS/O₃ ALD 反应器 —— 补 `make/sti-fill-ald` 缺的那台炉子。
 *
 * 现有 `plant/ald-reactor` 只到 10–100 Pa；STI 深槽（AR 0.5–3.75）要
 * 1–10 kPa 的 TEOS/O₃ 循环，靠前驱体饱和 + N₂ 吹扫把槽填满。
 *
 * 边界：
 *   · 腔体/喷淋头/加热台/阀/泵/臭氧管走 sheet-shop、lathe、milling；
 *   · MFC 用现有 `plant/mfc`（machine，放 needs，不塞进 composedOf）；
 *   · 泵用现有 `plant/evaporator/pump`；热电偶用现有标准件。
 *
 * 降级：
 *   · O₃ 由 O₂ 在喷淋头前的无声放电管里生成，没有臭氧浓度计；
 *   · 1–10 kPa 是设计窗口，没有漏率/压力标定；
 *   · 喷淋头孔板 0.5 mm、300 孔，用铣/钻；均匀性没有实测。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const STI_ALD_ITEMS: readonly Item[] = [
  /**
   * STI 专用 ALD 反应器。**150–400 °C / 1–10 kPa。**
   *
   *   gasPanel: TEOS/O3/N2
   *   喷淋头、加热台、真空泵、阀、MFC、热电偶
   */
  {
    id: 'plant/sti-ald-reactor',
    name: 'STI 专用 ALD 反应器',
    unit: '台',
    category: 'machine',
    holds: [
      { param: 'temperature', min: 150, max: 400 },
      { param: 'pressure', min: 1, max: 10 },
    ],
    props: [
      { param: 'gasPanel', kind: 'enum', values: ['TEOS/O3/N2'] },
      { param: 'showerheadHoles', kind: 'range', min: 300, max: 300, unit: '个' },
      { param: 'leakRate', kind: 'range', min: 0, max: 1e-3, unit: 'Pa·L/s', dir: 'atMost' },
    ],
  },

  { id: 'plant/sti-ald-reactor/chamber', name: 'STI 真空腔', unit: '件', category: 'part' },
  { id: 'plant/sti-ald-reactor/showerhead', name: 'STI 喷淋头', unit: '件', category: 'part' },
  { id: 'plant/sti-ald-reactor/heater', name: 'STI 加热器', unit: '件', category: 'part' },
  { id: 'plant/sti-ald-reactor/pump', name: 'STI 泵', unit: '件', category: 'part' },
  { id: 'plant/sti-ald-reactor/valve', name: 'STI 阀', unit: '件', category: 'part' },
  { id: 'plant/sti-ald-reactor/ozone-cell', name: 'STI 臭氧发生器', unit: '件', category: 'part' },
  { id: 'plant/sti-ald-reactor/thermocouple', name: 'STI 热电偶', unit: '件', category: 'part' },
];

export const STI_ALD_ROUTES: readonly Route[] = [
  {
    id: 'make/sti-ald-chamber',
    name: 'STI 真空腔制造',
    produces: [{ item: 'plant/sti-ald-reactor/chamber', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(200) }] }],
    needs: ['plant/clean-room'],
    performedBy: 'plant/sheet-shop',
    rate: { hours: q(8) },
    unbalanced_zh: '316L 200 kg → 腔体 1 件；余是边角/焊材。没有 RT/PT',
  },
  {
    id: 'make/sti-ald-showerhead',
    name: 'STI 喷淋头制造',
    produces: [{ item: 'plant/sti-ald-reactor/showerhead', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(20) }] }],
    needs: ['lathe', 'plant/clean-room'],
    performedBy: 'plant/milling-machine',
    rate: { hours: q(6) },
    unbalanced_zh: '316L 20 kg → 喷淋头 1 件；300 个 φ0.5 mm 孔，余是切屑',
  },
  {
    id: 'make/sti-ald-heater',
    name: 'STI 加热器制造',
    produces: [{ item: 'plant/sti-ald-reactor/heater', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(2) }] },
    ],
    needs: ['lathe', 'plant/clean-room'],
    performedBy: 'plant/robot',
    rate: { hours: q(4) },
    unbalanced_zh: '电阻丝 0.5 kg + 氧化铝 2 kg → 加热台 1 件；余是瓷管/引线',
  },
  {
    id: 'make/sti-ald-pump',
    name: 'STI 泵制造',
    produces: [{ item: 'plant/sti-ald-reactor/pump', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'plant/evaporator/pump', qty: q(1) }] }],
    needs: ['plant/clean-room'],
    performedBy: 'plant/robot',
    rate: { hours: q(2) },
    unbalanced_zh: '现有 plant/evaporator/pump 1 套 → 泵组 1 件；加冷阱挡 TEOS',
  },
  {
    id: 'make/sti-ald-valve',
    name: 'STI 阀制造',
    produces: [{ item: 'plant/sti-ald-reactor/valve', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] }],
    needs: ['lathe', 'plant/clean-room'],
    performedBy: 'plant/milling-machine',
    rate: { hours: q(2) },
    unbalanced_zh: '不锈钢 1 kg → 阀 1 件；余是切屑',
  },
  {
    id: 'make/sti-ald-ozone-cell',
    name: 'STI 臭氧发生器制造',
    produces: [{ item: 'plant/sti-ald-reactor/ozone-cell', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 2) }] },
    ],
    needs: ['lathe', 'plant/clean-room'],
    performedBy: 'plant/sheet-shop',
    rate: { hours: q(3) },
    unbalanced_zh: '石英 2 kg + 铜 0.5 kg → 臭氧管 1 件；O₂ 无声放电生成 O₃，没有浓度计',
  },
  {
    id: 'make/sti-ald-thermocouple',
    name: 'STI 热电偶制造',
    produces: [{ item: 'plant/sti-ald-reactor/thermocouple', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'std/thermocouple-t-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1, 10) }] },
    ],
    needs: ['lathe', 'plant/clean-room'],
    performedBy: 'plant/robot',
    rate: { hours: q(1) },
    unbalanced_zh: 'K 型热电偶 1 支 + 不锈钢 0.1 kg → 热电偶 1 件；余是套管',
  },
  {
    id: 'make/sti-ald-reactor',
    name: 'STI 专用 ALD 反应器制造',
    produces: [
      {
        item: 'plant/sti-ald-reactor',
        qty: q(1),
        gives: [
          { param: 'gasPanel', kind: 'enum', oneOf: ['TEOS/O3/N2'] },
          { param: 'showerheadHoles', kind: 'range', min: 300, max: 300 },
          { param: 'leakRate', kind: 'range', min: 0, max: 1e-3 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/sti-ald-reactor/chamber', qty: q(1) }] },
      { anyOf: [{ item: 'plant/sti-ald-reactor/showerhead', qty: q(1) }] },
      { anyOf: [{ item: 'plant/sti-ald-reactor/heater', qty: q(1) }] },
      { anyOf: [{ item: 'plant/sti-ald-reactor/pump', qty: q(1) }] },
      { anyOf: [{ item: 'plant/sti-ald-reactor/valve', qty: q(2) }] },
      { anyOf: [{ item: 'plant/sti-ald-reactor/ozone-cell', qty: q(1) }] },
      { anyOf: [{ item: 'plant/sti-ald-reactor/thermocouple', qty: q(2) }] },
    ],
    needs: ['plant/mfc', 'plant/clean-room', 'plant/metrology-room'],
    performedBy: 'plant/robot',
    rate: { hours: q(12) },
    unbalanced_zh:
      '腔体 1 + 喷淋头 1 + 加热台 1 + 泵 1 + 阀 2 + 臭氧管 1 + 热电偶 2 → 反应器 1 台。part 按件。MFC 是 machine，放 needs（plant/mfc），不塞 composedOf',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...STI_ALD_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...STI_ALD_ROUTES];
