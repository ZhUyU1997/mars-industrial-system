/**
 * TEM 的两条测量路线 —— 成像与 EDX（R13：measure/* 与记录只放 data/measure）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、TEM 成像：点分辨 0.2–0.5 nm、晶格 0.14–0.3 nm
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   200 kV 的 λ = 2.51 pm；球差 d_s = 0.66·C_s^(1/4)·λ^(3/4)：
 *   C_s = 1–2 mm 给 0.234–0.278 nm；色差 d_c = C_c·(ΔE/E)·α 在
 *   ΔE = 1–2 eV、α = 10–15 mrad 给 0.11–0.23 nm；合成 0.30–0.36 nm。
 *   所以点分辨窗口 0.2–0.5 nm；晶格 0.14–0.3 nm 是相位衬度的
 *   好端（样品 ≤50 nm、C_s ≤1 mm）。
 *
 *   样品是 `plant/fib-tem/lamella`（30–60 nm 薄片，`make/fib-tem-lamella`
 *   的交付窗口）。TEM 可用的
 *   厚度窗口写 20–100 nm：<30 nm 的薄片本层还没做出来，>100 nm
 *   在 200 kV 下电子散射太强、点分辨会掉到 0.5 nm 外。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、EDX：元素空间分辨 5–40 nm、检出 0.1–1 wt%
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   探针斑只有 0.2–0.5 nm，但 200 kV 电子在 30–60 nm 薄片里
 *   横向扩展 5–40 nm —— 所以 EDX 的元素空间分辨是 **5–40 nm**，
 *   不是探针斑。检出限 0.1–1 wt% 由 SDD 立体角 0.1–0.5 sr 与
 *   采集时间（100–300 s）定；轻元素（C/N/O）的薄窗吸收让检出限
 *   靠近 1 wt% 端。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const TEM_MEASURE_ITEMS: readonly Item[] = [
  /**
   * TEM 成像记录。**一份记录对应一片薄片。**
   *
   *   pointResolution   0.2–0.5 nm    球差 + 色差 + 衍射合成
   *   latticeResolution 0.14–0.3 nm   相位衬度，样品 ≤50 nm 才好端
   *   sampleThickness   20–100 nm     薄片 30–60 nm 的 TEM 可用段（记录容器 20–100）
   *   magnification     50k–1M
   *   voltage           100–200 kV
   *   drift             0.1–0.5 nm/min
   *   method            bright-field / dark-field / hrem
   */
  {
    id: 'mat/tem-image-record',
    name: 'TEM Imaging Record', name_zh: 'TEM 成像记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'pointResolution', kind: 'range', min: 0.2, max: 0.5, unit: 'nm', dir: 'atMost' },
      { param: 'latticeResolution', kind: 'range', min: 0.14, max: 0.3, unit: 'nm', dir: 'atMost' },
      { param: 'sampleThickness', kind: 'range', min: 20, max: 100, unit: 'nm' },
      { param: 'magnification', kind: 'range', min: 50_000, max: 1_000_000, unit: '倍' },
      { param: 'voltage', kind: 'range', min: 100, max: 200, unit: 'kV' },
      { param: 'drift', kind: 'range', min: 0.1, max: 0.5, unit: 'nm/min', dir: 'atMost' },
      { param: 'method', kind: 'enum', values: ['bright-field', 'dark-field', 'hrem'] },
    ],
  },

  /**
   * TEM-EDX 记录。**一份记录对应一片薄片。**
   *
   *   spatialResolution 5–40 nm     电子在 30–60 nm 薄片里的横向扩展
   *   detectionLimit    0.1–1 wt%   SDD 立体角 0.1–0.5 sr、采集 100–300 s
   *   sampleThickness   20–100 nm
   *   energyResolution  120–150 eV  Mn Kα
   *   voltage           100–200 kV
   *   method            edx
   */
  {
    id: 'mat/tem-edx-record',
    name: 'TEM EDX Record', name_zh: 'TEM EDX 记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'spatialResolution', kind: 'range', min: 5, max: 40, unit: 'nm', dir: 'atMost' },
      { param: 'detectionLimit', kind: 'range', min: 0.1, max: 1, unit: 'wt%', dir: 'atMost' },
      { param: 'sampleThickness', kind: 'range', min: 20, max: 100, unit: 'nm' },
      { param: 'energyResolution', kind: 'range', min: 120, max: 150, unit: 'eV', dir: 'atMost' },
      { param: 'voltage', kind: 'range', min: 100, max: 200, unit: 'kV' },
      { param: 'method', kind: 'enum', values: ['edx'] },
    ],
  },
];

export const TEM_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **TEM 成像：装薄片 → 双倾对中 → 点/晶格分辨 → 记录。**
     *
     *   薄片 1 件 → 成像记录 1 份
     *
     * 200 kV、LaB₆、C_s 1–2 mm、ΔE 1–2 eV；点分辨 0.25–0.5 nm、
     * 晶格 0.14–0.25 nm、样品 20–100 nm、放大 100k–1M、漂移 0.2–0.5 nm/min。
     * 薄片实际 30–60 nm（`make/fib-tem-lamella` 的交付窗口），`uses` 里
     * need 30–60 nm；记录容器的 20–100 nm 是留给他日更薄/更厚样品的。
     */
    id: 'measure/tem-imaging',
    name: 'TEM Imaging Measurement', name_zh: 'TEM 成像测量',
    produces: [
      {
        item: 'mat/tem-image-record',
        qty: q(1),
        gives: [
          { param: 'pointResolution', kind: 'range', min: 0.25, max: 0.5 },
          { param: 'latticeResolution', kind: 'range', min: 0.14, max: 0.25 },
          { param: 'sampleThickness', kind: 'range', min: 30, max: 60 },
          { param: 'magnification', kind: 'range', min: 100_000, max: 1_000_000 },
          { param: 'voltage', kind: 'range', min: 100, max: 200 },
          { param: 'drift', kind: 'range', min: 0.2, max: 0.5 },
          { param: 'method', kind: 'enum', oneOf: ['bright-field'] },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'plant/fib-tem/lamella',
            qty: q(1),
            need: [{ param: 'thickness', kind: 'range', min: 30, max: 60 }],
            onRelax: 'functional-kept',
          },
        ],
      },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(2) },
    steps: [
      {
        note_zh:
          '① 装薄片、双倾对中：30–60 nm、双倾 ±35–40°；200 kV、LaB₆、C_s 1–2 mm、ΔE 1–2 eV；真空 1e-7–1e-6 Pa',
        performedBy: 'plant/tem',
        under: [
          { param: 'pressure', min: 1e-7, max: 1e-5 },
          { param: 'temperature', min: 19, max: 21 },
        ],
      },
      {
        note_zh:
          '② 成像：点分辨 0.25–0.5 nm（d_s 0.234–0.278 nm + d_c 0.113–0.225 nm 合成）、晶格 0.14–0.25 nm、放大 100k–1M、漂移 0.2–0.5 nm/min',
        performedBy: 'plant/tem',
        under: [
          { param: 'pressure', min: 1e-7, max: 1e-5 },
          { param: 'temperature', min: 19, max: 21 },
        ],
      },
      {
        note_zh:
          '③ 读图：点/晶格分辨按已知周期标准片（Si 0.313 nm、Au 0.235 nm）校；记录样品厚度与漂移；>0.5 nm 的段不收',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **TEM-EDX：薄片 → 元素面扫 → 定量 → 记录。**
     *
     *   薄片 1 件 → EDX 记录 1 份
     *
     * 探针 0.2–0.5 nm，但 200 kV 电子在 30–60 nm 薄片里扩展 5–40 nm；
     * 检出 0.1–1 wt%（SDD 0.1–0.5 sr、100–300 s）。轻元素靠近 1 wt%。
     */
    id: 'measure/tem-edx',
    name: 'TEM EDX Measurement', name_zh: 'TEM EDX 测量',
    produces: [
      {
        item: 'mat/tem-edx-record',
        qty: q(1),
        gives: [
          { param: 'spatialResolution', kind: 'range', min: 10, max: 40 },
          { param: 'detectionLimit', kind: 'range', min: 0.2, max: 1 },
          { param: 'sampleThickness', kind: 'range', min: 30, max: 60 },
          { param: 'energyResolution', kind: 'range', min: 130, max: 150 },
          { param: 'voltage', kind: 'range', min: 100, max: 200 },
          { param: 'method', kind: 'enum', oneOf: ['edx'] },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'plant/fib-tem/lamella',
            qty: q(1),
            need: [{ param: 'thickness', kind: 'range', min: 30, max: 60 }],
            onRelax: 'functional-kept',
          },
        ],
      },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(3) },
    steps: [
      {
        note_zh:
          '① 装薄片、双倾对中；200 kV、真空 1e-7–1e-6 Pa；SDD 立体角 0.2–0.5 sr、能量分辨 130–150 eV（Mn Kα）',
        performedBy: 'plant/tem',
        under: [
          { param: 'pressure', min: 1e-7, max: 1e-5 },
          { param: 'temperature', min: 19, max: 21 },
        ],
      },
      {
        note_zh:
          '② 元素面扫：30–60 nm 薄片里电子扩展 10–40 nm，空间分辨按 10–40 nm 记；采集 100–300 s，检出 0.2–1 wt%',
        performedBy: 'plant/tem',
        under: [
          { param: 'pressure', min: 1e-7, max: 1e-5 },
          { param: 'temperature', min: 19, max: 21 },
        ],
      },
      {
        note_zh:
          '③ 定量：Cliff–Lorimer k 因子用已知标准（Fe/Cu/Au）；轻元素 C/N/O 靠近 1 wt% 端；记录空间分辨、检出限、样品厚度',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...TEM_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...TEM_MEASURE_ROUTES];
