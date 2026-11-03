/**
 * STI 槽刻蚀：Cl₂/O₂ 高温、HBr 线已装并接料；30 sccm 流量参数未进机器规格。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 〇、为什么不是 `plant/rie-etcher` 的第二条路线
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `plant/rie-etcher` 的 holds 是 **15–80 °C / 1e-6–100 Pa**，它的 Cl₂ 段
 * 在 20–60 °C 交 70–85° 侧壁（`car-strip.ts`）。STI 要 85–89°，靠的是
 * **180–250 °C 的片温 + 低 pressure + O₂ 侧壁钝化**；80 °C 的上限塞不进去。
 * 所以另立 `plant/st-i-etcher`：复用 RIE 的 11 件（腔、上下电极、RF 槽、
 * 匹配网络、气盘、Cl₂ 线、节流阀、卡盘、终点头、高压充电器），只新增
 * **热卡盘** 与 **HBr 线** 两件。
 *
 * **HBr 料已建**：`mat/hbr` 由 `make/hbr` 产出，`make/car-sti-trench-hbr-gas`
 * 已按 30 sccm HBr + 20 sccm Cl₂ 写出。本文件只把 HBr 线装进机器
 * （耐腐蚀、150 °C 保温），不重复写料路线；基线路线仍用 **Cl₂ + O₂**。
 * 流量由 `plant/mfc` 的 0–200 sccm 通道供；机器 `holds` 记 0–200 sccm。
 * 剩余缺口是 MFC 的 HBr 兼容性：干 HBr 按 316L 用，湿气会腐蚀。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、几何与数
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   槽宽 100–200 nm、深 250–300 nm ⇒ AR 1.25–3；本机只收 **AR 1–2** 的段
 *   （深度 250–300、宽度 125–250；100 nm 端 AR 2.5–3，留给下一档）。
 *   侧壁角：槽底宽 = w − 2d/tanθ；100 nm/300 nm/86° 的底宽
 *   100 − 2×300/tan86° = 100 − 42 = **58 nm**，可填；89° 是 100 − 10.5 = 89.5 nm。
 *
 *   刻蚀速率：Cl₂/O₂ 在 180–250 °C、0.5–5 Pa、300 W 下 200–400 nm/min；
 *   250–300 nm 要 **45–90 s**，加过刻 20 % ⇒ 60–110 s。本路线取 60–120 s。
 *
 *   选择比：Cl₂ 对 SiO₂ 的化学刻蚀几乎为零（SiO₂ 是停止面），
 *   Si:SiO₂ >20；对 CAR 胶的选择比只有 3–5:1，250–300 nm 硅要 50–100 nm 胶，
 *   CAR 的 60–200 nm 够，但胶侧壁会退 —— 这是 86–89° 而不是 90° 的原因。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、残渣 ≤1 nm 怎么来
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   旧 `make/car-stripped-wafer` 的 O₂ 灰化在 60–80 °C，残渣 1–10 nm；
 *   本机在 **180–250 °C** 做原位 O₂ 灰化（200 W、1–5 Pa、120 s），
 *   再补 49 % HF 1–2 s（HF 对 Si 停止，只去 1–2 nm 氧化层/残渣）。
 *   两道加起来残渣 **0–1 nm**；HF 后必须立即甩干，水痕就是缺陷。
 *
 *   ⚠️ 残渣没有在线量具；`measure/st-i-profile` 用 X-SEM 截面读 0–1 nm，
 *   但 1 nm 与 0 nm 在 5 nm 的 TEM 样品上分不开 —— 记录只判“≤1 nm”。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、交付窗口与缺口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   侧壁角      86–89°
 *   深度        250–300 nm（机器窗口 200–400）
 *   AR          1.2–2（机器窗口 1–2）
 *   选择比      Si:SiO₂ 25–50
 *   深度均匀性  ±3 %（200 mm、旋转卡盘、3 区热卡盘）
 *   残渣        0–1 nm
 *
 *   ⚠️ 缺口：MFC 的 HBr 兼容性未单独建模；CAR 胶侧壁退角没有在线量具；残渣 1 nm 是 X-SEM
 *   判读下限；深度均匀性 ±3 % 是设计值，没有 49 点全片图。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const ST_I_ETCHER_ITEMS: readonly Item[] = [
  /**
   * **STI 槽高温刻蚀机：复用 RIE 的 11 件 + 热卡盘 + HBr 线。**
   *
   * 它不是 `plant/rie-etcher` 的第二条路线（holds 15–80 °C 不够），
   * 是一台 180–250 °C 的变体整机；RF/气盘/电极沿用 RIE，热卡盘与 HBr 线新增。
   */
  {
    id: 'plant/st-i-etcher',
    name: 'STI Trench High-Temperature Etcher', name_zh: 'STI 槽高温刻蚀机',
    unit: '台',
    category: 'machine',
    holds: [
      { param: 'temperature', min: 150, max: 300 },
      { param: 'pressure', min: 0.1, max: 10 },
      { param: 'hbrFlow', min: 0, max: 200 },
    ],
    props: [
      { param: 'sidewallAngle', kind: 'range', min: 85, max: 89, unit: '°', dir: 'atLeast' },
      { param: 'etchDepth', kind: 'range', min: 200, max: 400, unit: 'nm' },
      { param: 'aspectRatio', kind: 'range', min: 1, max: 2, unit: '比值' },
      { param: 'selectivitySiSiO2', kind: 'range', min: 20, max: 50, unit: '比值', dir: 'atLeast' },
      { param: 'uniformity', kind: 'range', min: 0, max: 3, unit: '%', dir: 'atMost' },
      { param: 'residue', kind: 'range', min: 0, max: 1, unit: 'nm', dir: 'atMost' },
      { param: 'waferSize', kind: 'range', min: 100, max: 200, unit: 'mm', dir: 'atLeast' },
    ],
  },

  /** 热卡盘：150–300 °C、3 区、±3 % 深度均匀性的热源；不是 RIE 的 80 °C 水冷卡盘。 */
  {
    id: 'plant/st-i-etcher/hot-chuck',
    name: 'STI Hot Chuck', name_zh: 'STI 热卡盘',
    unit: '件',
    category: 'part',
    props: [
      { param: 'maxTemperature', kind: 'range', min: 300, max: 300, unit: '°C', dir: 'atLeast' },
      { param: 'uniformity', kind: 'range', min: 0, max: 3, unit: '%', dir: 'atMost' },
    ],
  },

  /** HBr 线：316L/PTFE、150 °C 保温；`mat/hbr` 已有路线，`hbrFlow` 由 `plant/mfc` 供。 */
  {
    id: 'plant/st-i-etcher/hbr-line',
    name: 'HBr Line', name_zh: 'HBr 线',
    unit: '件',
    category: 'part',
    props: [
      { param: 'maxTemperature', kind: 'range', min: 150, max: 150, unit: '°C', dir: 'atLeast' },
      { param: 'leakRate', kind: 'range', min: 0, max: 1e-3, unit: 'Pa·L/s', dir: 'atMost' },
    ],
  },
];

export const ST_I_ETCHER_ROUTES: readonly Route[] = [
  {
    /** **整机装配：RIE 的 11 件 + 热卡盘 + HBr 线 → `plant/st-i-etcher` 1 台。**
     *
     * 这不是“把 RIE 改一改”：热卡盘换了水冷卡盘、HBr 线换了 Cl₂ 线，
     * 腔体/电极/RF/气盘沿用；所以 BOM 里 11 件是 RIE 的、2 件是本机的。
     */
    id: 'make/st-i-etcher',
    name: '*Full System Assembly', name_zh: '*整机装配',
    produces: [
      {
        item: 'plant/st-i-etcher',
        qty: q(1),
        gives: [
          { param: 'sidewallAngle', kind: 'range', min: 86, max: 89 },
          { param: 'etchDepth', kind: 'range', min: 250, max: 300 },
          { param: 'aspectRatio', kind: 'range', min: 1.2, max: 2 },
          { param: 'selectivitySiSiO2', kind: 'range', min: 25, max: 50 },
          { param: 'uniformity', kind: 'range', min: 1.5, max: 3 },
          { param: 'residue', kind: 'range', min: 0, max: 1 },
          { param: 'waferSize', kind: 'range', min: 200, max: 200 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/rie-etcher/chamber', qty: q(1) }] },
      { anyOf: [{ item: 'plant/rie-etcher/electrode-lower', qty: q(1) }] },
      { anyOf: [{ item: 'plant/rie-etcher/electrode-upper', qty: q(1) }] },
      { anyOf: [{ item: 'plant/rie-etcher/rf-tank', qty: q(1) }] },
      { anyOf: [{ item: 'plant/rie-etcher/hv-charger', qty: q(1) }] },
      { anyOf: [{ item: 'plant/rie-etcher/match-network', qty: q(1) }] },
      { anyOf: [{ item: 'plant/rie-etcher/gas-panel', qty: q(1) }] },
      { anyOf: [{ item: 'plant/rie-etcher/cl2-line', qty: q(1) }] },
      { anyOf: [{ item: 'plant/rie-etcher/throttle', qty: q(1) }] },
      { anyOf: [{ item: 'plant/rie-etcher/chuck-clamp', qty: q(1) }] },
      { anyOf: [{ item: 'plant/rie-etcher/endpoint-head', qty: q(1) }] },
      { anyOf: [{ item: 'plant/st-i-etcher/hot-chuck', qty: q(1) }] },
      { anyOf: [{ item: 'plant/st-i-etcher/hbr-line', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    rate: { hours: q(80) },
    steps: [
      {
        note_zh: '装腔/电极/热卡盘：RIE 的腔与上下电极，换 150–300 °C 热卡盘（3 区、水冷背板）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '接 RF/匹配/气盘：RIE 的 134 kHz 槽与匹配网络；Cl₂ 线 + HBr 线双路，HBr 线 150 °C 保温',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '漏率：抽到 1e-3 Pa 以下，酒精/保压 30 min；只判到 1e-3 Pa·L/s（没有氦检漏）',
        performedBy: 'plant/euv-vacuum',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-3 }],
      },
      {
        note_zh: '联锁/控温：热卡盘 180–250 °C 空烧 2 h、三点热偶互校；Cl₂/HBr 气体联锁与排风',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'RIE 腔 1 + 下电极 1 + 上电极 1 + RF 槽 1 + 高压充电器 1 + 匹配网络 1 + 气盘 1 + Cl₂ 线 1 + 节流阀 1 + 卡盘 1 + 终点头 1 + 热卡盘 1 + HBr 线 1 → STI 刻蚀机 1 台；零件按件计，没有 kg 账；余是装配废品与接线',
  },

  {
    /** 热卡盘：3 区、300 °C、±3 %；镍丝绕氧化铝骨架 + 水冷背板。 */
    id: 'make/st-i-etcher-hot-chuck',
    name: 'STI Hot Chuck Manufacturing', name_zh: 'STI 热卡盘制造',
    produces: [
      {
        item: 'plant/st-i-etcher/hot-chuck',
        qty: q(1),
        gives: [
          { param: 'maxTemperature', kind: 'range', min: 300, max: 300 },
          { param: 'uniformity', kind: 'range', min: 1.5, max: 3 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(3) }] },
      { anyOf: [{ item: 'mat/nickel', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/refractory', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '车 φ220 铝卡盘与 3 区螺旋槽（槽距 2 mm）、水冷背板', performedBy: 'lathe' },
      { note_zh: '绕 3 × 1.5 kW 镍丝、装 3 支热偶；引线压接 + 玻璃布箍', performedBy: 'plant/winder' },
      {
        note_zh: '通电老炼 180 °C × 1 h → 300 °C × 1 h，三点热偶互校；热点区重绕',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 180, max: 300 }],
      },
    ],
    rate: { hours: q(30) },
    unbalanced_zh: '铝 3 + 镍 1.5 + 耐火瓷 1 + 铜 1.5 + 水 5 → 热卡盘 1 件；余是车屑、废丝与试压水',
  },

  {
    /** HBr 线：316L/PTFE、150 °C 保温；`mat/hbr` 已由 `make/hbr` 产出，`hbrFlow` 由 `plant/mfc` 供。 */
    id: 'make/st-i-etcher-hbr-line',
    name: 'HBr Line Manufacturing', name_zh: 'HBr 线制造',
    produces: [
      {
        item: 'plant/st-i-etcher/hbr-line',
        qty: q(1),
        gives: [
          { param: 'maxTemperature', kind: 'range', min: 150, max: 150 },
          { param: 'leakRate', kind: 'range', min: 0, max: 1e-3 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room'],
    steps: [
      { note_zh: '弯 1/4 管、焊阀座（HBr 线 316L/PTFE，不碰铜）', performedBy: 'plant/sheet-shop' },
      { note_zh: '装 150 °C 保温带与热偶；酒精查漏，只判到 1e-3 Pa·L/s', performedBy: 'plant/robot' },
    ],
    rate: { hours: q(15) },
    unbalanced_zh: '不锈钢 1 + PTFE 0.1 + 铜 0.1 + 水 2 → HBr 线 1 件；余是管头与试压水',
  },

  {
    /**
     * **CAR 图形片 → Cl₂/O₂ 高温刻蚀 → 原位 O₂ 灰化 → HF 1–2 s → STI 槽片。**
     *
     *   图形片 1 + Cl₂ 50 g + O₂ 20 g + HF 0.1 g + 水 1 kg → 刻蚀片 1
     *
     * 本路线交的是 `mat/car-stripped-wafer` 的**高侧壁/低残渣**档：
     * sidewall 86–89°、residue 0–1 nm、depth 250–300 nm、lineWidth 100–200 nm。
     * `make/car-sti-trench` 的两条 kept（≥85°、≤2 nm）由这一条覆盖。
     *
     * ⚠️ HBr 线已装、`mat/hbr` 已建；本批仍用 Cl₂/O₂；`hbrFlow` 由 `plant/mfc` 供。
     * CAR 胶对 Cl₂ 的选择比 3–5:1，250–300 nm 硅要 50–100 nm 胶（CAR 60–200 够），
     * 胶侧壁退角就是 86–89° 而不是 90° 的原因。
     */
    id: 'make/car-sti-trench-hbr',
    name: 'Silicon Wafer after CAR Etch and Resist Strip Manufacturing', name_zh: 'CAR 刻蚀并去胶后的硅片制造',
    produces: [
      {
        item: 'mat/car-stripped-wafer',
        qty: q(1),
        gives: [
          { param: 'lineWidth', kind: 'range', min: 100, max: 200 },
          { param: 'etchDepth', kind: 'range', min: 250, max: 300, record: 'mat/st-i-profile-record' },
          { param: 'sidewallAngle', kind: 'range', min: 86, max: 89, record: 'mat/st-i-profile-record' },
          { param: 'residue', kind: 'range', min: 0, max: 1 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/car-patterned-wafer',
            qty: q(1),
            need: [{ param: 'lineWidth', kind: 'range', min: 80, max: 200 }],
            onRelax: 'functional-kept',
          },
        ],
      },
      // Cl2 50 g：250–300 nm Si 只需 ~0.001 mol Cl2（~0.07 g）；50 g 是 700 倍过量
      { anyOf: [{ item: 'mat/chlorine', qty: q(50) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(20) }] },
      // 49 % HF 0.1 g：只去 1–2 nm 氧化层/残渣
      { anyOf: [{ item: 'mat/hf', qty: q(1, 10000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room', 'plant/metrology-room', 'plant/water-polisher'],
    rate: { hours: q(3) },
    steps: [
      {
        note_zh:
          '① Cl₂/O₂ 高温刻蚀：`plant/st-i-etcher` 180–250 °C、0.5–5 Pa、300 W、60–120 s；Cl₂ 50 sccm + O₂ 2 sccm；侧壁 86–89°、depth 250–300 nm；CAR 胶 60–200 nm，选择比 3–5:1',
        performedBy: 'plant/st-i-etcher',
        under: [
          { param: 'temperature', min: 180, max: 250 },
          { param: 'pressure', min: 0.5, max: 5 },
        ],
      },
      {
        note_zh:
          '② 原位 O₂ 灰化：同一台 180–250 °C、1–5 Pa、200 W、120 s；把 Cl₂ 刻蚀后的碳质残渣从 1–10 nm 降到 0–1 nm',
        performedBy: 'plant/st-i-etcher',
        under: [
          { param: 'temperature', min: 180, max: 250 },
          { param: 'pressure', min: 1, max: 5 },
        ],
      },
      {
        note_zh:
          '③ HF 1–2 s + 水冲 + 甩干：49 % HF 只去 1–2 nm 原生氧化层/残渣，HF 对 Si 是停止层；水痕就是缺陷',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '④ CD-SEM 筛：读 100–200 nm 槽宽、槽底是否闭合；CD-SEM 的 0.3 nm 重复性够看“闭没闭”，分不开 86° 与 89°（角度由 X-SEM 记录）',
        performedBy: 'plant/cd-sem',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-3 }],
      },
    ],
    unbalanced_zh:
      '图形片 1 + Cl₂ 50 g + O₂ 20 g + HF 0.1 g + 水 1 kg → 刻蚀片 1。硅刻掉 250–300 nm × 78.5 cm² × 2.33 g/cm³ = **4.6–5.5 mg**，进尾气/槽液；Cl₂/O₂ 大部分进尾气处理，HF 随冲洗水走；产物按片计（12.8 g 硅 − 5 mg + 残渣），不是账不平，是刻蚀的固有损耗',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...ST_I_ETCHER_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...ST_I_ETCHER_ROUTES];
