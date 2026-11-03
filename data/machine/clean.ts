/**
 * 洁净度 —— 下一道墙，以及它在模型里能表达的部分与不能表达的部分。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 为什么它是墙
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 能做双极型，不等于能做 MOS —— 中间隔的是**洁净度**。
 * 具体到数字，一颗 5 µm 的颗粒落在 5 µm 的发射区上，那个器件就废了：
 *
 *   环境里每立方英尺 10 万颗尘（普通车间）  → 一片上几千个致命颗粒
 *   每立方英尺 100 颗（洁净间）             → 一片上几十个
 *   每立方英尺 1 颗（高等级）               → 几个
 *
 * 而钠更麻烦：它不是颗粒，是**离子**。钠沾在氧化层里，在电场下漂移，
 * 把 MOS 的阈值电压漂到不可控 —— 所以做 MOS 的每一件东西都得无钠：
 * 石英、PTFE、PFA，连玻璃器皿都不能用。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 模型能表达的：良率
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 洁净度在数据里只能落在一处：**一条路线产多少片**。
 *
 *   普通车间   1 片晶圆 → 裸片 100 片（约 2/3 良率）
 *   洁净间     1 片晶圆 → 裸片 140 片（约 90%）
 *
 * 这不是"精度提高"，是**同一道工序在更干净的地方做，废品少一半** ——
 * 而模型恰好能表达它，因为产出数量就是良率的语言。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 模型表达不了的：洁净度本身
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 没有"每立方英尺多少颗"这个条件（`Condition` 只有数值区间，没有洁净级别），
 * 也没有"无钠"这个东西。所以：
 *
 *   洁净间在数据里只是**一台设备**（`needs` 里出现），不是一个条件；
 *   它带来的好处只能写成"良率更高"，写不出"阈值电压可控了"。
 *
 * 这是这一层最诚实的一处局限：**MOS 做不出来的原因，模型只能记在注释里。**
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const CLEAN_ITEMS: readonly Item[] = [
  /**
   * 超纯水。电阻率 1–5 MΩ·cm（工业上是 18 MΩ·cm —— 那要离子交换树脂）。
   *
   * 后来补上了离子交换树脂（苯乙烯链，从乙炔走，不经石油化工）——
   * 所以在有树脂的那条路线上，这里的 18 MΩ·cm 是够得着的。没有树脂时只能
   * 靠**多级蒸馏 + 石英冷凝 + 0.2 µm 过滤**：
   *
   *   一次蒸馏   ~0.1 MΩ·cm
   *   三次石英蒸馏 ~1–5 MΩ·cm
   *
   * 够洗片子，不够做 MOS 的栅氧。
   */
  { id: 'mat/ultrapure-water', name: 'Ultrapure Water', name_zh: '超纯水', unit: 'kg', category: 'material',
    // 1 MΩ·cm = 1 µS/cm；5 MΩ·cm = 0.2；18 MΩ·cm = 0.055。
    props: [{ param: 'conductivity', kind: 'range', min: 0.05, max: 1, unit: 'µS/cm', dir: 'atMost' }] },
];

export const CLEAN_PARTS: readonly Item[] = [
  /** 石英蒸馏器。三级串联，每级石英壶 + 石英冷凝管 —— 玻璃会带钠，只能用石英。 */
  { id: 'plant/water-polisher/still', name: 'Water Polisher Quartz Still', name_zh: '水抛光机石英蒸馏器', unit: '件', category: 'part' },

  /** 微孔过滤器。0.2 µm 的陶瓷或 PTFE 滤芯，装在最后一级之后。 */
  { id: 'plant/water-polisher/filter', name: 'Water Polisher Microporous Filter', name_zh: '水抛光机微孔过滤器', unit: '件', category: 'part' },

  /** 洁净间（层流罩 + 壁板 + 风淋）。玻璃纤维 HEPA + 风机 + 正压控制。 */
  { id: 'plant/clean-room/shell', name: 'Cleanroom Enclosure', name_zh: '洁净室洁净间', unit: '件', category: 'part' },

  /** 风机过滤单元。风机 + HEPA 滤材 + 均流膜，一单元 0.5 m² 出风面。 */
  { id: 'plant/clean-room/ffu', name: 'Cleanroom Fan Filter Unit', name_zh: '洁净室风机过滤单元', unit: '件', category: 'part' },
];

export const CLEAN_ROUTES: readonly Route[] = [
  {
    /** 石英蒸馏器。石英管熔接成壶与冷凝管，三级串联，全 PTFE 接口。 */
    id: 'make/water-still',
    name: 'Water Polisher Quartz Still Manufacturing', name_zh: '水抛光机石英蒸馏器制造',
    produces: [{ item: 'plant/water-polisher/still', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 微孔过滤器。陶瓷滤芯烧结 + 壳体 + 接管。 */
    id: 'make/water-filter',
    name: 'Water Polisher Microporous Filter Manufacturing', name_zh: '水抛光机微孔过滤器制造',
    produces: [{ item: 'plant/water-polisher/filter', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'std/alumina-insulator-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
    ],
    needs: ['plant/high-temp-furnace'],
    performedBy: 'plant/robot',
  },
  {
    /** 洁净间壳体。壁板折弯咬合 + 顶部 FFU 框 + 风淋箱 —— 不用胶，缝里不藏尘。 */
    id: 'make/clean-room-shell',
    name: 'Cleanroom Enclosure Manufacturing', name_zh: '洁净室洁净间制造',
    produces: [{ item: 'plant/clean-room/shell', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
    ],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 风机过滤单元。风机 + 玻璃纤维 HEPA 滤材 + 均流膜（PTFE 多孔膜）。 */
    id: 'make/clean-room-ffu',
    name: 'Cleanroom Fan Filter Unit Manufacturing', name_zh: '洁净室风机过滤单元制造',
    produces: [{ item: 'plant/clean-room/ffu', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/mineral-wool', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
      { anyOf: [{ item: 'std/motor-7.5kw-4p', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /**
     * 超纯水：三级石英蒸馏 → 0.2 µm 过滤。
     *
     *   水 1000 → 超纯水 800（每级留 1/3 的残液）
     */
    id: 'make/ultrapure-water',
    name: 'Ultrapure Water Production', name_zh: '超纯水制备',
    produces: [
      { item: 'mat/ultrapure-water', qty: q(800), gives: [{ param: 'conductivity', kind: 'range', min: 0.2, max: 1, dir: 'atMost' }] },
      { item: 'mat/water', qty: q(200), gives: [{ param: 'conductivity', kind: 'range', min: 500, max: 1000 }] },
    ],
    uses: [{ anyOf: [{ item: 'mat/water', qty: q(1000) }] }],
    needs: [],
    performedBy: 'plant/water-polisher',
    under: [{ param: 'pressure', min: 100, max: 500 }],
    unbalanced_zh: '水 1000 → 超纯水 800 + 各级残液 200（已单列 mat/water，conductivity 500–1000 µS/cm）',
  },
  {
    /**
     * 超纯水（离子交换版）。**这才是 18 MΩ·cm 的那一条。**
     *
     *   水 1000 + 阳离子树脂 1 → 超纯水 950
     *
     * 树脂把水里的 Na⁺、Ca²⁺、Fe³⁺ 换成 H⁺，可溶离子去掉之后导电率就下来了。
     * 树脂会饱和（H⁺ 换完就失效），要用 5% 硫酸再生 —— 再生那一步本层没写。
     *
     * ⚠️ 树脂只解决"溶解的离子"，不解决颗粒与有机物：所以它接在蒸馏与过滤之后，
     * 不是替代它们。**顺序是：蒸馏 → 过滤 → 离子交换。**
     */
    id: 'make/ultrapure-water-resin',
    name: 'Ultrapure Water Production', name_zh: '超纯水制备',
    produces: [{ item: 'mat/ultrapure-water', qty: q(950), gives: [{ param: 'conductivity', kind: 'range', min: 0.05, max: 0.1, dir: 'atMost' }] }],
    uses: [
      { anyOf: [{ item: 'mat/water', qty: q(1000) }] },
      { anyOf: [{ item: 'mat/cation-resin', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/water-polisher',
    under: [{ param: 'pressure', min: 100, max: 500 }],
    unbalanced_zh: '水 1000 + 树脂 1 → 超纯水 950；余 50 是再生废液与冲洗水（树脂饱和后要用 5% 硫酸再生，本层没写）',
  },
  {
    /**
     * **洁净间装配/交付路线。** 壳板 + 6 台 FFU + 接触器 → 1 间。
     *
     * 这条路线交付的不是“能力 1–9”，而是**实际建成并认证的 5–7 级**：
     * 6 台 FFU 的 HEPA 是 99.995 % @0.3 µm，换气次数与压差由
     * `measure/cleanroom-class` 的表面颗粒扫描记录（5–7）验收。
     *
     * 为什么必须有一条产出路线：`spec-frontier` 的 `coversSpec` 只认
     * **路线的 gives**（或 GIVEN 条目的 props），装配件的 props 不自动
     * 变成交付窗口。没有 `make/clean-room`，`needs` 里的两个
     * `isoClass ≥5` 永远判 kept —— 这不是 need 太严，是交付没有落点。
     */
    id: 'make/clean-room',
    name: 'Cleanroom Manufacturing', name_zh: '洁净室制造',
    produces: [
      {
        item: 'plant/clean-room',
        qty: q(1),
        gives: [
          { param: 'isoClassCapability', kind: 'range', min: 1, max: 9 },
          { param: 'isoClass', kind: 'range', min: 5, max: 7, record: 'mat/cleanroom-class-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/clean-room/shell', qty: q(1) }] },
      { anyOf: [{ item: 'plant/clean-room/ffu', qty: q(6) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(40) },
    steps: [
      {
        note_zh: '① 装壳板、6 台 FFU 与风淋；FFU 出风面 0.5 m² × 6、面风速 0.3–0.5 m/s',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '② HEPA 检漏（99.995 % @0.3 µm）、换气次数 240–600/h、压差 10–15 Pa；恢复时间 <15 s',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '③ 用 `measure/cleanroom-class` 的表面颗粒扫描做 5–7 级资格记录；只有记录落在 5–7 才交这条路线',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '壳板 1 + FFU 6 + 接触器 1 → 洁净间 1 间；按件计，没有 kg 产出，不记质量账。',
  },
];

/**
 * 超纯水站。三级石英蒸馏 + 微孔过滤。
 *
 * 它 `holds` 压力 —— 沸腾要在密闭容器里做，否则水在 0.01 °C 就开了。
 */
export const WATER_POLISHER: Item = {
  id: 'plant/water-polisher',
  name: 'Water Polisher', name_zh: '水抛光机',
  unit: '套',
  category: 'machine',
  holds: [{ param: 'pressure', min: 100, max: 500 }],
  composedOf: [
    { item: 'plant/water-polisher/still', qty: q(1) },
    { item: 'plant/water-polisher/filter', qty: q(1) },
    { item: 'std/contactor-general', qty: q(1) },
  ],
};

/**
 * 洁净间。层流罩 + 壁板 + 风淋，正压。
 *
 * **能力与交付分开写**（这是 2026-10-21 的源头修正）：
 *
 *   isoClassCapability  1–9    **能力**：这间房可以按 1–9 级来建/改造；
 *                              它回答“最多能做到多干净”，不是“现在有多干净”。
 *   isoClass            5–7    **交付**：本层实际建成并资格认证的等级
 *                              （`measure/cleanroom-class` 的表面颗粒扫描记录 5–7）。
 *
 * 以前只写一个 `isoClass 1–9`，能力窗口含 1–4，任何“要 ≥5 级”的 need
 * 都覆盖不了，spec-frontier 就把 `measure/trace-metals-icpms` /
 * `measure/volatile-organic-gcms` 判成 kept。拆开之后：能力归能力，
 * 交付 ≥5 由 5–7 覆盖 —— 不需要第二台洁净室，也不需要放宽 need。
 *
 * 交付窗口落在 `make/clean-room` 的 `gives` 上（5–7），不落在 props 上：
 * `spec-frontier` 的 `coversSpec` 只认路线 gives；装配件 props 不自动
 * 变成交付窗口。这是“交付没有落点”的源头修法。
 *
 * 它没有“洁净级别”这个**条件**可 hold（`isoClass` 是 props，不是 holds）
 * —— 它只作为 `needs` 出现，把“在这间屋子里做”变成一句能写下来的话。
 *
 * 颗粒计数器 0.09–0.10 µm，ISO 14644-1 的 ≥0.1 µm 档；0.05 µm 看不见。
 */
export const CLEAN_ROOM: Item = {
  id: 'plant/clean-room',
  name: 'Cleanroom', name_zh: '洁净室',
  unit: '间',
  category: 'machine',
  props: [
    // 能力：可建 1–9 级；不是交付等级
    { param: 'isoClassCapability', kind: 'range', min: 1, max: 9, unit: '级' },
    // 交付：本层实际建成并认证的等级（表面颗粒扫描记录 5–7）
    { param: 'isoClass', kind: 'range', min: 5, max: 7, unit: '级' },
  ],
};

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...CLEAN_PARTS, ...CLEAN_ITEMS, CLEAN_ROOM, WATER_POLISHER];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/water-polisher',
    name: 'Water Polisher Assembly', name_zh: '水抛光机装配',
    produces: [{
      item: 'plant/water-polisher',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...CLEAN_ROUTES, ...ASSEMBLY_ROUTES];
