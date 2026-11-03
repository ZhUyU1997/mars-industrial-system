/**
 * W CVD 反应器 —— W plug 的最后一道设备缺口。
 *
 * WF₆ + 3H₂ → W + 6HF，400–450 °C / 1–5 kPa；冷壁/热壁 + 气体面板 + 负载锁。
 * 腔体/法兰/阀/面板走现有 sheet-shop、lathe、milling；不拿 ALD 冒充 CVD W
 * （`plant/ald-reactor` 只到 400 °C、10–100 kPa，是单层循环）。
 *
 * 降级：
 *   · 气体面板的 MFC 用现有 `plant/mfc` 改装，没有 WF₆ 专用校准；
 *   · 负载锁是手动，不是全自动；腔体没有原位质谱/漏率标定；
 *   · 冷壁腔体用 316L + 氧化铝/镍挡板；没有 RT/PT。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const WCVD_ITEMS: readonly Item[] = [
  /**
   * W CVD 反应器。**350–500 °C / 0.5–10 kPa，不是 ALD。**
   *
   * gasPanel: WF6/H2/N2/Ar
   * loadLock: 手动
   * leakRate: ≤1e-6 Pa·L/s（设计，没有氦检漏）
   */
  {
    id: 'plant/w-cvd-reactor',
    name: 'W CVD Reactor', name_zh: 'W CVD 反应器',
    unit: '台',
    category: 'machine',
    holds: [
      { param: 'temperature', min: 350, max: 500 },
      { param: 'pressure', min: 0.5, max: 10 },
    ],
    props: [
      { param: 'gasPanel', kind: 'enum', values: ['WF6/H2/N2/Ar'] },
      { param: 'loadLock', kind: 'enum', values: ['manual'] },
      { param: 'leakRate', kind: 'range', min: 0, max: 1e-6, unit: 'Pa·L/s', dir: 'atMost' },
      { param: 'wallType', kind: 'enum', values: ['cold-wall', 'hot-wall'] },
    ],
  },

  { id: 'plant/w-cvd-reactor/chamber', name: 'W CVD Vacuum Chamber', name_zh: 'W CVD 真空腔', unit: '件', category: 'part' },
  { id: 'plant/w-cvd-reactor/flange', name: 'W CVD Flange', name_zh: 'W CVD 法兰', unit: '件', category: 'part' },
  { id: 'plant/w-cvd-reactor/gas-panel', name: 'W CVD Gas Panel', name_zh: 'W CVD 气路板', unit: '件', category: 'part' },
  { id: 'plant/w-cvd-reactor/valve', name: 'W CVD Valve', name_zh: 'W CVD 阀', unit: '件', category: 'part' },
  { id: 'plant/w-cvd-reactor/heater', name: 'W CVD Heater', name_zh: 'W CVD 加热器', unit: '件', category: 'part' },
  { id: 'plant/w-cvd-reactor/thermocouple', name: 'W CVD Thermocouple', name_zh: 'W CVD 热电偶', unit: '件', category: 'part' },
  { id: 'plant/w-cvd-reactor/pump', name: 'W CVD Pump', name_zh: 'W CVD 泵', unit: '件', category: 'part' },
];

export const WCVD_ROUTES: readonly Route[] = [
  {
    id: 'make/w-cvd-chamber',
    name: 'W CVD Vacuum Chamber Manufacturing', name_zh: 'W CVD 真空腔制造',
    produces: [{ item: 'plant/w-cvd-reactor/chamber', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(10) }] }],
    needs: ['plant/clean-room'],
    performedBy: 'plant/sheet-shop',
    rate: { hours: q(6) },
    unbalanced_zh: '316L 不锈钢 10 kg → 腔体 1 件；余是边角/焊材。没有 RT/PT',
  },
  {
    id: 'make/w-cvd-flange',
    name: 'W CVD Flange Manufacturing', name_zh: 'W CVD 法兰制造',
    produces: [{ item: 'plant/w-cvd-reactor/flange', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(2) }] }],
    needs: ['plant/clean-room'],
    performedBy: 'lathe',
    rate: { hours: q(3) },
    unbalanced_zh: '316L 2 kg → 法兰 1 件；余是车屑。金属垫密封',
  },
  {
    id: 'make/w-cvd-gas-panel',
    name: 'W CVD Gas Panel Manufacturing', name_zh: 'W CVD 气路板制造',
    produces: [{ item: 'plant/w-cvd-reactor/gas-panel', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(3) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 2) }] },
    ],
    needs: ['lathe', 'plant/clean-room'],
    performedBy: 'plant/sheet-shop',
    rate: { hours: q(4) },
    unbalanced_zh: '不锈钢 3 kg + 铜 0.5 kg → 气体面板 1 件；MFC 用现有 plant/mfc 改装，没有 WF₆ 专用校准',
  },
  {
    id: 'make/w-cvd-valve',
    name: 'W CVD Valve Manufacturing', name_zh: 'W CVD 阀制造',
    produces: [{ item: 'plant/w-cvd-reactor/valve', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/stainless-steel', qty: q(1, 2) }] }],
    needs: ['lathe', 'plant/clean-room'],
    performedBy: 'plant/milling-machine',
    rate: { hours: q(3) },
    unbalanced_zh: '不锈钢 0.5 kg → 阀 1 件；余是切屑。金属垫/石墨填料',
  },
  {
    id: 'make/w-cvd-heater',
    name: 'W CVD Heater Manufacturing', name_zh: 'W CVD 加热器制造',
    produces: [{ item: 'plant/w-cvd-reactor/heater', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(2) }] },
    ],
    needs: ['lathe', 'plant/clean-room'],
    performedBy: 'plant/robot',
    rate: { hours: q(2) },
    unbalanced_zh: '电阻丝 0.5 kg + 氧化铝 2 kg → 加热器 1 件；余是瓷管/引线',
  },
  {
    id: 'make/w-cvd-thermocouple',
    name: 'W CVD Thermocouple Manufacturing', name_zh: 'W CVD 热电偶制造',
    produces: [{ item: 'plant/w-cvd-reactor/thermocouple', qty: q(1) }],
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
    id: 'make/w-cvd-pump',
    name: 'W CVD Pump Manufacturing', name_zh: 'W CVD 泵制造',
    produces: [{ item: 'plant/w-cvd-reactor/pump', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'plant/evaporator/pump', qty: q(1) }] }],
    needs: ['plant/clean-room'],
    performedBy: 'plant/robot',
    rate: { hours: q(2) },
    unbalanced_zh: '现有 plant/evaporator/pump 1 件 → 泵组 1 件；加挡板/冷阱，防止 WF₆/HF 进泵',
  },
  {
    id: 'make/w-cvd-reactor',
    name: 'W CVD Reactor Manufacturing', name_zh: 'W CVD 反应器制造',
    produces: [
      {
        item: 'plant/w-cvd-reactor',
        qty: q(1),
        gives: [
          { param: 'gasPanel', kind: 'enum', oneOf: ['WF6/H2/N2/Ar'] },
          { param: 'loadLock', kind: 'enum', oneOf: ['manual'] },
          { param: 'leakRate', kind: 'range', min: 0, max: 1e-6 },
          { param: 'wallType', kind: 'enum', oneOf: ['cold-wall'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/w-cvd-reactor/chamber', qty: q(1) }] },
      { anyOf: [{ item: 'plant/w-cvd-reactor/flange', qty: q(2) }] },
      { anyOf: [{ item: 'plant/w-cvd-reactor/gas-panel', qty: q(1) }] },
      { anyOf: [{ item: 'plant/w-cvd-reactor/valve', qty: q(4) }] },
      { anyOf: [{ item: 'plant/w-cvd-reactor/heater', qty: q(1) }] },
      { anyOf: [{ item: 'plant/w-cvd-reactor/thermocouple', qty: q(2) }] },
      { anyOf: [{ item: 'plant/w-cvd-reactor/pump', qty: q(1) }] },
    ],
    needs: ['plant/sheet-shop', 'lathe', 'plant/milling-machine', 'plant/clean-room'],
    performedBy: 'plant/robot',
    rate: { hours: q(10) },
    unbalanced_zh:
      '腔体 1 + 法兰 2 + 面板 1 + 阀 4 + 加热器 1 + 热电偶 2 + 泵 1 → 反应器 1 台。没有质量账（part 按件）。手动负载锁、冷壁；没有原位质谱/氦检漏，leakRate 是设计值',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...WCVD_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...WCVD_ROUTES];
