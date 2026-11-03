/**
 * 40 nm MCU 的同一片六项 BEOL 读数 —— 一条把六件量具串到同一片上的程序。
 *
 * 六项：lineWidth / aspectRatio / dishing / barrierThickness / kValue / layers。
 * 现在审计按属性逐条并集，六项可由不同路线分别覆盖；缺的是“同一片”的六项。
 * 这条路线不写“已交全”，只把六件量具的同一片读数写成能力域：
 *
 *   lineWidth         `plant/cd-sem`（CD 3σ 3.5 nm）
 *   aspectRatio       CD-SEM 剖面（束斑 4 nm；AR 由线宽与刻深算）
 *   dishing           `plant/afm`（台阶 0.5–50 nm）
 *   barrierThickness  `plant/ellipsometer`（0.05 nm）
 *   kValue            `plant/probe-station` 的 C-V（1e-13–1e-8 F）
 *   layers            `plant/tem` 的截面（样品 20–100 nm，FIB 制备）
 *
 * ⚠️ 这是**程序**，不是读数：记录窗口是六件量具的能力域，不是 40 nm 那六格
 * 设计值。要判“同一片六项达标”，必须真的跑一片、把记录条目的 props 收窄。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const MCU_40NM_ITEMS: readonly Item[] = [
  /**
   * 40 nm MCU 同一片六项 BEOL 记录。能力域：lineWidth 0–500 nm、AR 0–10、
   * dishing 0–100 nm、barrier 0–50 nm、k 0–10、layers 1–30；不是 40 nm 档
   * 的 40–100 nm / AR 2–3 / dishing 3–8 / barrier 2 / k 2.4–2.5 / 8 层读数。
   */
  {
    id: 'mat/mcu-40nm-beol-record',
    name: '40 nm MCU Same-Wafer Six-Item BEOL Record', name_zh: '40 nm MCU 同一片六项 BEOL 记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'lineWidth', kind: 'range', min: 0, max: 500, unit: 'nm', dir: 'atMost' },
      { param: 'aspectRatio', kind: 'range', min: 0, max: 10, unit: '深/宽' },
      { param: 'dishing', kind: 'range', min: 0, max: 100, unit: 'nm', dir: 'atMost' },
      { param: 'barrierThickness', kind: 'range', min: 0, max: 50, unit: 'nm' },
      { param: 'kValue', kind: 'range', min: 0, max: 10, unit: 'εr', dir: 'atMost' },
      { param: 'layers', kind: 'range', min: 1, max: 30, unit: '层' },
    ],
  },
];

export const MCU_40NM_ROUTES: readonly Route[] = [
  {
    /**
     * 同一片六项：CD-SEM → 椭偏 → AFM → C-V → TEM。
     *
     * 顺序是从非破坏到破坏：CD-SEM/椭偏/AFM/C-V 都在同一片上做，最后才切
     * TEM 样（FIB 切 20–100 nm 薄片，样品不可再用）。所以六项读数确实来自
     * 同一片，不是六片各测一项。
     *
     * 输出能力域：`lineWidth 0–500 nm`、`AR 0–10`、`dishing 0–100 nm`、
     * `barrier 0–50 nm`、`k 0–10`、`layers 1–30`；`make/mcu-40nm-damascene`
     * 的六项设计值仍是 design。
     */
    id: 'measure/mcu-40nm-same-wafer',
    name: '40 nm MCU Same-Wafer Six-Item BEOL Measurement', name_zh: '40 nm MCU 同一片六项 BEOL 测量',
    produces: [
      {
        item: 'mat/mcu-40nm-beol-record',
        qty: q(1),
        gives: [
          { param: 'lineWidth', kind: 'range', min: 0, max: 500 },
          { param: 'aspectRatio', kind: 'range', min: 0, max: 10 },
          { param: 'dishing', kind: 'range', min: 0, max: 100 },
          { param: 'barrierThickness', kind: 'range', min: 0, max: 50 },
          { param: 'kValue', kind: 'range', min: 0, max: 10 },
          { param: 'layers', kind: 'range', min: 1, max: 30 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/water', qty: q(1) }] }],
    needs: ['std/mcu-40nm-general', 'plant/metrology-room'],
    rate: { hours: q(24) },
    steps: [
      {
        note_zh: 'CD-SEM 读 lineWidth/aspectRatio：10 点/片、CD 3σ 3.5 nm；剖面束斑 4 nm',
        performedBy: 'plant/cd-sem',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-3 }],
      },
      {
        note_zh: '椭偏读 barrierThickness：1.8–2.2 nm 档，0.05 nm 准确度；10 点',
        performedBy: 'plant/ellipsometer',
      },
      {
        note_zh: 'AFM 读 dishing：台阶 0.5–50 nm、z 噪声 0.05 nm；扫 10 点',
        performedBy: 'plant/afm',
      },
      {
        note_zh: '探针台 C-V 读 kValue：1 MHz、1e-13–1e-8 F；同一片 MOS 电容',
        performedBy: 'plant/probe-station',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: 'FIB 切 20–100 nm 薄片，TEM 读 layers 与界面；样品不可再用',
        performedBy: 'plant/tem',
        under: [{ param: 'pressure', min: 1e-7, max: 1e-5 }],
      },
      {
        note_zh: '写同一片六项能力域；40 nm 档的六格设计值要真跑后再收窄',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '水 1 kg → 同一片六项记录 1 份；MCU 片被 TEM 切开（破坏），记录是数据不是物料。',
  },
];

export const DATA_ITEMS: readonly Item[] = [...MCU_40NM_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...MCU_40NM_ROUTES];
