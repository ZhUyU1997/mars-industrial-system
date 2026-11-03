/**
 * 标气：10 L 钢瓶 + 称量法配 NH₃ 标气（10/100 ppm）。
 *
 * ⚠️ **补的是审计 B2 的“缺标气”**（NH₃ 的 5 项气体与 CH₄/总烃的 ±20 %）：
 *
 *   `std/gas-cylinder-10l-general`  10 L、15 MPa、漏率 ≤1e-9 Pa·m³/s
 *   `mat/nh3-standard-gas`          10/100 ppm ±1–2 %、N₂ 平衡、水 ≤10 ppm
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、称量法配气的账
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   10 L 钢瓶充 N₂ 到 10 MPa：n = PV/RT = 1e7 × 0.01 / (8.314 × 300) = **40 mol**
 *   ⇒ N₂ 1.12 kg。
 *   100 ppm（摩尔分数）NH₃ = 40 mol × 100e-6 = 4.0 mmol = **68 mg**
 *    10 ppm 档 = **6.8 mg**
 *
 *   微天平 0.1 mg：68 mg 称量的相对不确定度 0.15 %；6.8 mg 是 1.5 %。
 *   加上充气过程的吸附/解吸（NH₃ 在钢瓶内壁 1–3 %）与静置分层，
 *   合成 **±1–1.5 %**（100 ppm 档）、**±1.5–2 %**（10 ppm 档）。
 *
 *   做法：先充 100 ppm 主瓶（68 mg NH₃ + 10 MPa N₂），再 1:9 稀释到 10 ppm 副瓶；
 *   或直接两步称量。滚混 24 h、静置 48 h 后交叉标定。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、缺口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ① 钢瓶内壁没有内涂层（本层没有 PTFE 内衬钢瓶工艺）：NH₃ 吸附 1–3 % 已计入；
 *     长期稳定性 6–12 个月（标气常规是 12–24 个月），差 2×。
 *  ② 没有 CH₄/C2–C6 的组分（`mat/ethane`/`propane`/`butane`/`pentane`/`hexane` 全 0 条目）：
 *     总烃按 CH₄ 折算的 ±20 % **这一条压不下去**，只能先做 NH₃ 的 5 项标气；
 *     缺的是 C2–C6 五条料 + 一条混合配气线。
 *  ③ 阀门与减压器没有独立条目：瓶阀用铜 + PTFE 现场车制，漏率只保 1e-9。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、接线（主 agent 注册；本文件不动 tools/report/data.ts）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   import { GAS_STD_ITEMS, GAS_STD_ROUTES } from '../../data/material/gas-standards.ts';
 *   items: [...GAS_STD_ITEMS] · routes: [...GAS_STD_ROUTES]
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const GAS_STD_ITEMS: readonly Item[] = [
  /**
   * **10 L 气体钢瓶（45 钢，15 MPa，漏率 ≤1e-9 Pa·m³/s）。**
   *
   *   volume   10 L
   *   pressure 15 MPa（水压试验 22.5 MPa）
   *   leakRate ≤1e-9 Pa·m³/s
   *   material steel-45
   */
  {
    id: 'std/gas-cylinder-10l-general',
    name: '10 L 气体钢瓶',
    unit: '件',
    category: 'part',
    props: [
      { param: 'volume', kind: 'range', min: 8, max: 12, unit: 'L' },
      { param: 'pressure', kind: 'range', min: 15, max: 20, unit: 'MPa' },
      { param: 'leakRate', kind: 'range', min: 0, max: 1e-9, unit: 'Pa·m³/s', dir: 'atMost' },
      { param: 'material', kind: 'enum', values: ['steel-45', 'stainless-steel'] },
    ],
  },

  /**
   * **NH₃ 标气：10/100 ppm、±1–2 %、N₂ 平衡、水 ≤10 ppm。**
   *
   *   concentration 10–100 ppm（摩尔分数）
   *   uncertainty   1–2 %
   *   balanceGas    N₂
   *   water         3–8 ppm
   *   pressure      10–12 MPa
   */
  {
    id: 'mat/nh3-standard-gas',
    name: 'NH₃ 标气',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'concentration', kind: 'range', min: 10, max: 100, unit: 'ppm' },
      { param: 'uncertainty', kind: 'range', min: 1, max: 2, unit: '%', dir: 'atMost' },
      { param: 'balanceGas', kind: 'enum', values: ['N2', 'Ar'] },
      { param: 'water', kind: 'range', min: 0, max: 10, unit: 'ppm', dir: 'atMost' },
      { param: 'pressure', kind: 'range', min: 5, max: 15, unit: 'MPa' },
    ],
  },
];

export const GAS_STD_ROUTES: readonly Route[] = [
  {
    /**
     * **钢瓶：旋压筒体 → 焊封头 → 水压试验 → 内壁处理 → 检漏。**
     *
     *   45 钢 12 kg + 铜 0.2 kg + PTFE 0.05 kg → 钢瓶 1 只
     */
    id: 'make/gas-cylinder-10l',
    name: '10 L 气体钢瓶制造',
    produces: [
      {
        item: 'std/gas-cylinder-10l-general',
        qty: q(1),
        gives: [
          { param: 'volume', kind: 'range', min: 10, max: 10 },
          { param: 'pressure', kind: 'range', min: 15, max: 15 },
          { param: 'leakRate', kind: 'range', min: 1e-10, max: 1e-9 },
          { param: 'material', kind: 'enum', oneOf: ['steel-45'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(12) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 20) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '① 旋压筒体与焊封头（45 钢，壁厚 3–4 mm）', performedBy: 'plant/sheet-shop' },
      { note_zh: '② 水压试验：22.5 MPa 保压 5 min、无渗漏、残余变形 <2 %', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '③ 内壁喷砂/抛光与清洗（去氧化皮与油），60–80 °C 烘干', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '④ 装自制针阀（铜 + PTFE 密封）与检漏：1e-10–1e-9 Pa·m³/s', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(40) },
    unbalanced_zh: '45 钢 12 + 铜 0.2 + PTFE 0.05 → 钢瓶 1 只；余是切边、焊材与内壁磨削量（按件计）',
  },

  {
    /**
     * **NH₃ 标气：抽空/称皮重 → 称量法加 NH₃ → 充 N₂ → 滚混 → 交叉标定。**
     *
     *   钢瓶 1 + 电子级 NH₃ 0.1 g + N₂ 2 kg → 标气 1 瓶（100 ppm 主瓶 / 10 ppm 副瓶）
     */
    id: 'make/nh3-standard-gas',
    name: 'NH₃ 标气制备',
    produces: [
      {
        item: 'mat/nh3-standard-gas',
        qty: q(6, 5),
        gives: [
          { param: 'concentration', kind: 'range', min: 10, max: 100 },
          { param: 'uncertainty', kind: 'range', min: 1, max: 1.5 },
          { param: 'balanceGas', kind: 'enum', oneOf: ['N2'] },
          { param: 'water', kind: 'range', min: 3, max: 8, record: 'mat/nh3-h2o-record' },
          { param: 'pressure', kind: 'range', min: 10, max: 12 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/ammonia-electronic', qty: q(1, 10000) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(2) }] },
    ],
    needs: ['plant/metrology-room', 'std/gas-cylinder-10l-general'],
    steps: [
      { note_zh: '① 抽空到 <10 Pa、称皮重（`plant/micro-balance` 0.1 mg）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '② 称量法加 NH₃：100 ppm 档 68 mg、10 ppm 档 6.8 mg（0.1 mg 天平 ⇒ 0.15 % / 1.5 %）', performedBy: 'plant/micro-balance', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '③ 充 N₂ 到 10 MPa（40 mol、1.12 kg），关阀', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '④ 滚混 24 h、静置 48 h（消分层与壁吸附）；10 ppm 档由 100 ppm 主瓶 1:9 稀释', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '⑤ 交叉标定：同一瓶走 `measure/nh3-gas-impurities` 的 GC-TCD 与 FPD 两路，两法差 <2 % 才签；不确定度 1–1.5 %', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(72) },
    unbalanced_zh: '钢瓶 1（复用容器，进 needs 不进 uses）+ NH₃ 0.068 g + N₂ 1.12 kg → 标气 1.2 kg；余是充气损耗与取样（按瓶计）',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...GAS_STD_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...GAS_STD_ROUTES];
