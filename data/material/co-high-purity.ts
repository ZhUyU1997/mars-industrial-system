/**
 * 高纯 CO —— 把 `mat/co` 的 30–99 % 半定量气变成 99.9–99.99 % 的配气标气。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么不是深冷精馏
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * CO/N₂ 的沸点只差 **4.3 K**（−191.5 / −195.8 °C），要 40–80 级、20 K 冷箱；
 * 本层 `plant/gm-cryocooler` 只有 1.5–4 W @20 K，做一台 40–80 级的低温塔
 * 是另一条大设备链。甲酸脱水只要 80–100 °C + 浓硫酸，且能把 N₂/CO₂/H₂
 * 在甲基甲酸酯/甲酸两步里甩掉：
 *
 *   CO（30–99 %）+ CH₃OH → HCOOCH₃（甲酸甲酯）      60–80 °C、1–3 MPa、NaOCH₃
 *   HCOOCH₃ + H₂O → HCOOH + CH₃OH                  80–110 °C、酸催化
 *   HCOOH → CO + H₂O                               80–100 °C、浓 H₂SO₄
 *
 * 第一、二步把 N₂/CO₂/H₂ 留在尾气/轻端；第三步出来的 CO 再经浓硫酸/分子筛
 * 干燥，得 99.9–99.99 %、N₂/CO₂/H₂ 各 ≤10–50 ppm、O₂/H₂O 各 ≤1–10 ppm。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 配气不确定度
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 1–100 ppm 的动态配气，主项是质量流量计的 1–5 %，不是 CO 的纯度：
 * 99.9 % 的 CO 稀释到 1 ppm 时，CO 里的 1 000 ppm 杂质只剩 0.001 ppm
 * （0.1 %），N₂/CO₂/H₂ 的 ≤50 ppm 更低。所以**配气不确定度 ≤5 %**；
 * 全方法（转化炉 + FID）的窗口写 ±5–10 %，见
 * `measure/nh3-sulfur-and-hydrocarbon`。
 *
 * 质量账：
 *   CO 1000 + 甲醇 1100 + NaOH 5 → 甲酸甲酯 1900 + 尾料 205
 *   甲酸甲酯 1000 + 水 300 + 硫酸 10 → 甲酸 766 + 甲醇 534 + 尾料 10
 *   甲酸 1000 + 硫酸 50 → CO 600 + 水 391 + 废酸 59
 * 三笔都精确平衡；CO 600/1000 是 98.6 % 收率（理论 608.6）。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const CO_HIGH_PURITY_ITEMS: readonly Item[] = [
  /**
   * 甲酸甲酯（HCOOCH₃）。CO 与甲醇羰基化的中间体，bp 31.5 °C。
   *
   *   purity 98–99.5 %、water 0.1–0.5 %
   */
  {
    id: 'mat/methyl-formate',
    name: '甲酸甲酯',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 95, max: 99.5, unit: '%', dir: 'atLeast' },
      { param: 'water', kind: 'range', min: 0.1, max: 1, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 甲酸（HCOOH）。甲酸甲酯水解的产物，bp 100.8 °C。
   *
   *   purity 95–99 %、water 0.5–2 %
   */
  {
    id: 'mat/formic-acid',
    name: '甲酸',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 85, max: 99, unit: '%', dir: 'atLeast' },
      { param: 'water', kind: 'range', min: 0.5, max: 5, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 高纯 CO。**99.9–99.99 %、N₂/CO₂/H₂ 各 ≤10–50 ppm、O₂/H₂O 各 ≤1–10 ppm。**
   *
   * 它是 `measure/nh3-sulfur-and-hydrocarbon` 的 CO 标气源：旧 `mat/co`
   * 30–99 % 只能把 1–100 ppm 配气做到 ±30–50 %；这一档把配气不确定度
   * 压到 ≤5 %，全方法 ±5–10 %。
   */
  {
    id: 'mat/co-high-purity',
    name: '高纯 CO',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'purity', kind: 'range', min: 99.9, max: 99.99, unit: '%', dir: 'atLeast' },
      { param: 'n2', kind: 'range', min: 10, max: 50, unit: 'ppm', dir: 'atMost' },
      { param: 'co2', kind: 'range', min: 10, max: 50, unit: 'ppm', dir: 'atMost' },
      { param: 'h2', kind: 'range', min: 10, max: 50, unit: 'ppm', dir: 'atMost' },
      { param: 'o2', kind: 'range', min: 1, max: 10, unit: 'ppm', dir: 'atMost' },
      { param: 'h2o', kind: 'range', min: 1, max: 10, unit: 'ppm', dir: 'atMost' },
    ],
  },
];

export const CO_HIGH_PURITY_ROUTES: readonly Route[] = [
  /**
   * 甲酸甲酯：CO + 甲醇 → HCOOCH₃，60–80 °C、1–3 MPa、NaOH 催化。
   *
   *   CO 1000 + 甲醇 1100 + NaOH 5 → 甲酸甲酯 1900 + 尾料 205
   */
  {
    id: 'make/methyl-formate',
    name: '甲酸甲酯制备',
    produces: [
      {
        item: 'mat/methyl-formate',
        qty: q(1900),
        gives: [
          { param: 'purity', kind: 'range', min: 98, max: 99.5 },
          { param: 'water', kind: 'range', min: 0.1, max: 0.5 },
        ],
      },
      { item: 'mat/tailings', qty: q(205) },
    ],
    uses: [
      { anyOf: [{ item: 'mat/co', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/methanol', qty: q(1100) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(5) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/mid-pressure-autoclave',
    under: [
      { param: 'temperature', min: 60, max: 80 },
      { param: 'pressure', min: 1000, max: 3000 },
    ],
    rate: { hours: q(12) },
    unbalanced_zh:
      'CO 1000 + 甲醇 1100 + NaOH 5 → 甲酸甲酯 1900 + 尾料 205（N₂/CO₂/H₂、过量甲醇与焦油）。理论甲酸甲酯 2144；1900 是 88.6 % 收率。尾料未单列条目',
  },

  /**
   * 甲酸：HCOOCH₃ + H₂O → HCOOH + CH₃OH，80–110 °C、酸催化。
   *
   *   甲酸甲酯 1000 + 水 300 + 硫酸 10 → 甲酸 766 + 甲醇 534 + 尾料 10
   */
  {
    id: 'make/formic-acid',
    name: '甲酸制备',
    produces: [
      {
        item: 'mat/formic-acid',
        qty: q(766),
        gives: [
          { param: 'purity', kind: 'range', min: 95, max: 99 },
          { param: 'water', kind: 'range', min: 0.5, max: 2 },
        ],
      },
      { item: 'mat/methanol', qty: q(534) },
      { item: 'mat/tailings', qty: q(10) },
    ],
    uses: [
      { anyOf: [{ item: 'mat/methyl-formate', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(300) }] },
      { anyOf: [{ item: 'mat/sulfuric-acid', qty: q(10) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/wet-bench',
    under: [
      { param: 'temperature', min: 80, max: 110 },
      { param: 'pressure', min: 100, max: 300 },
    ],
    rate: { hours: q(12) },
    unbalanced_zh:
      '甲酸甲酯 1000 + 水 300 + 硫酸 10 → 甲酸 766 + 甲醇 534 + 尾料 10。理论甲酸 766.5、甲醇 533.5；水是过量 300，未反应的 282 在水相里',
  },

  /**
   * 高纯 CO：HCOOH → CO + H₂O，80–100 °C、浓硫酸脱水；再干燥/过滤。
   *
   *   甲酸 1000 + 硫酸 50 → CO 600 + 水 391 + 废酸 59
   *
   * N₂/CO₂/H₂ 在甲酸甲酯/甲酸两步已被甩掉；本步只控制 CO 的 O₂/H₂O。
   */
  {
    id: 'make/co-high-purity',
    name: '高纯 CO 制备',
    produces: [
      {
        item: 'mat/co-high-purity',
        qty: q(600),
        gives: [
          { param: 'purity', kind: 'range', min: 99.9, max: 99.99 },
          { param: 'n2', kind: 'range', min: 10, max: 50 },
          { param: 'co2', kind: 'range', min: 10, max: 50 },
          { param: 'h2', kind: 'range', min: 10, max: 50 },
          { param: 'o2', kind: 'range', min: 1, max: 10 },
          { param: 'h2o', kind: 'range', min: 1, max: 10 },
        ],
      },
      {
        item: 'mat/water',
        qty: q(391),
        gives: [{ param: 'conductivity', kind: 'range', min: 500, max: 1000 }],
      },
      { item: 'mat/tailings', qty: q(59) },
    ],
    uses: [
      { anyOf: [{ item: 'mat/formic-acid', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/sulfuric-acid', qty: q(50) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/wet-bench',
    under: [
      { param: 'temperature', min: 80, max: 100 },
      { param: 'pressure', min: 100, max: 300 },
    ],
    rate: { hours: q(8) },
    unbalanced_zh:
      '甲酸 1000 + 硫酸 50 → CO 600 + 水 391 + 废酸 59；600/608.6 = 98.6 % 收率。N₂/CO₂/H₂ 各 ≤10–50 ppm、O₂/H₂O 各 ≤1–10 ppm 是设计值；没有在线质谱，纯度靠配气与露点间接判',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...CO_HIGH_PURITY_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...CO_HIGH_PURITY_ROUTES];
