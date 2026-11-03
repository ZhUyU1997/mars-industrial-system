/**
 * 纳米压痕 —— 进口整机补 E/H 的直接读数；**R9 尚未闭合，不把它算“绿”**。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么是整机
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * R8 ⑮ 的缺口不是“没有金刚石”：压头只是几十毫克，真正的难点是
 * **0.1 µN 载荷分辨 + <1 nm 位移 + 热漂移 <0.1 nm/min + Oliver–Pharr 拟合**。
 * 这是整台仪器，不是一件零件。
 *
 * 本层没有压电陶瓷、没有电容位移传感器、没有 24 位 ADC、没有隔振台；
 * 从零造一台要重新开四条链。所以它只能是**进口仪器**：
 *
 *   `plant/nanoindenter/head`  **压头本体**（金刚石三棱锥 + 针柄；本轮起有
 *                              本地路线 `make/nanoindenter-head`，见 diamond.ts）
 *   `plant/nanoindenter`        整机（composedOf 只有 head；驱动/传感/ADC 未写）
 *
 * 它只解锁“低 k 膜的 E/H 直接读数”；压头这一件已本地化，整机仍不是。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 可复制性 —— R9 未闭合
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   R9：种子**设备**必须存在一条从火星表面物质出发、造出第二台的路径。
 *
 *   本机没有。压电陶瓷/电容位移/24 位 ADC/隔振台四条链都没有；
 *   本轮只把**压头本体**写通了（金刚石链，见 `data/machine/diamond.ts`），
 *   驱动/传感/ADC 仍进口。
 *
 *   所以：
 *     · 它不是合法的 R9 种子设备；
 *     · R8 ⑮ 只能记“**黄**：有进口仪器可测，但不可复制”；
 *     · 若坚持 R9，必须补一条**降级复制路线**（例如 1 µN/10 nm 的微压痕，
 *       要 load cell + LVDT + 步进 + 隔振；本层 0 件），或者接受这一格永远红。
 *
 *   ⚠️ 报告口径：`plant/nanoindenter` 的 `composedOf` 只有 head，而 head 本轮
 *      起可本地造，所以工具会把这台整机列进“长出来的设备”。**那不是 R9 闭合**：
 *      head 只是压头本体，驱动/电容位移传感/24 位 ADC 根本没有条目。要读这一
 *      格，得看 `plant/nanoindenter/head` 的路线与本节，不要看“长出来的设备”
 *      那一行。
 *
 *   库存耗尽会怎样：E/H 退回按密度推（±30 %），低 k 配方签字又变回盲签。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 压针：金刚石有了，碳化钨备用针仍在
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ① **金刚石链已建**（`data/machine/diamond.ts`）：
 *      · `plant/hpht-press`：六面顶，5–6 GPa / 1300–1500 °C，顶锤 WC-Ni
 *        φ100 × 90 mm、寿命 1000–3000 次（设计值）；
 *      · `mat/diamond`：碳 + Fe-Ni 触媒 HPHT 合成，5 g/批；
 *      · `mat/diamond-powder`：球磨 + 水选，0.05–0.1 µm；
 *      · `mat/diamond-tip-blank`：PCD 坯片，φ3 × 3 mm；
 *      · `plant/nanoindenter/head`：三面 65.27° 研磨 + 锡盘抛光，
 *        交付 tipRadius 0.02–0.1 µm（**设计值**）。
 *
 *    所以“50 nm 的金刚石三棱锥做不出来”这句话在本轮之后不成立；剩下的
 *    缺口是**量具**（见下）与**单晶 vs PCD**（PCD 尖的晶界会崩，成品率低）。
 *
 * ② **碳化钨备用针仍在**（`make/nanoindenter-tip`）：0.5–2 µm，三棱锥几何
 *    与 Berkovich 对得上，但尖端比低 k 膜厚还大，20–100 nm 压深落在赫兹区，
 *    换不回 R8 ⑮ 的 E/H。它是“金刚石压头断货时还能粗压”的备件，不是等价件。
 *    为什么不做成 WC-Ni：镍链已通（`make/nickel`），但 6–10 % Ni 的 WC-Ni
 *    要在 1400–1500 °C 烧结；这支针走无粘结剂 1900–2000 °C，为的是不在
 *    备用件上再挂一条镍链。代价是脆。
 *
 * ③ **量具仍是缺口**：`plant/e-beam-column` 的 STEM 9.3 nm，在 φ0.3 µm
 *    钨尖上验证到 ±20 nm（`cd-sem.ts` §九①）；对 20–100 nm 的尖只能分
 *    3–5 档，不能给 50 ± 5 nm 的读数。CD-SEM 4 nm 更好，但它是第 98 台，
 *    `performedBy` 永远不合法（`cd-sem.ts` 接线注），只能 `needs` + 机器人。
 *    没有 AFM、没有认证尖半径标准件 —— 所以 `tipRadius` 是设计值，不是实测。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 测什么
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `mat/lowk-barrier-wafer` 的低 k 膜（2.5–3.5 GPa 按密度推的）：
 *
 *   载荷 0.1–10 mN、压深 20–100 nm（膜厚 200–500 nm 的 10–30 %）
 *   10 点、Oliver–Pharr 拟合
 *   E 5–20 GPa、H 0.5–3 GPa
 *
 * ⚠️ 基底效应：压深 > 膜厚 10 % 时 E 会被硅基底抬高；本文件把压深限在
 * 20–100 nm，并记 R8 ③。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const NANOINDENT_ITEMS: readonly Item[] = [
  /**
   * 纳米压痕压头（**压头本体：金刚石三棱锥 + 针柄**）。
   *
   * 从本轮起有本地路线 `make/nanoindenter-head`（见 `data/machine/diamond.ts`）：
   * PCD 坯片 → 三面 65.27° 研磨 → 0.05–0.1 µm 微粉 + 锡盘抛光 → 钎焊针柄。
   *
   *   tipRadius  0.02–0.1 µm（20–100 nm，**设计/工艺窗口，不是实测**）
   *   angle      65.27°（面与轴；三面互成 120°）
   *
   * ⚠️ load / displacement / E / H 是**整机**指标，不在这一件上：它们留在
   *    `plant/nanoindenter`。把压头做出来不等于整机能造 —— 驱动、电容位移
   *    传感、24 位 ADC 三条链仍未写，R9 仍未闭合。
   *
   * ⚠️ 本层的 `plant/nanoindenter/tip` 仍是 0.5–2 µm 的 WC 备用针；金刚石
   *    压头与它不是同一档，别把两支针混成一个 `gives`。
   */
  {
    id: 'plant/nanoindenter/head',
    name: '纳米压痕机纳米压痕压头',
    unit: '件',
    category: 'part',
    props: [
      { param: 'tipRadius', kind: 'range', min: 0.02, max: 0.5, unit: 'µm', dir: 'atMost' },
      { param: 'angle', kind: 'range', min: 60, max: 70, unit: '°' },
    ],
  },

  /**
   * 纳米压痕备用针。**不是 50 nm 金刚石针的等价件。**
   *
   *   tipRadius  0.5–2 µm（设计/工艺窗口，不是实测；见 `make/nanoindenter-tip`）
   *
   * 它只做“粗压深”的备用：三棱锥几何能与 Berkovich 对上，但尖端半径
   * 比低 k 膜厚还大，20–100 nm 的压深落在赫兹区，不能走 Oliver–Pharr。
   */
  {
    id: 'plant/nanoindenter/tip',
    name: '纳米压痕机纳米压痕备用针',
    unit: '件',
    category: 'part',
    props: [
      { param: 'tipRadius', kind: 'range', min: 0.05, max: 5, unit: 'µm', dir: 'atMost' },
    ],
  },

  /**
   * 纳米压痕机。**R9 未闭合**：composedOf 只有 head（本轮已可本地造），
   * 但驱动、电容位移传感、24 位 ADC 三条链没有写；head 能造不等于整机能造。
   *
   * ⚠️ 模型会把这台整机按 `composedOf` 读成“可装配”（head 已可造），
   * 所以报告会把它列进“长出来的设备”。这是既有简化的延续，不是 R9 闭合：
   * 整机的驱动/传感/ADC 还没有条目，`composedOf` 里也没有它们。
   */
  {
    id: 'plant/nanoindenter',
    name: '纳米压痕机',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'load', kind: 'range', min: 0.0001, max: 500, unit: 'mN' },
      { param: 'displacement', kind: 'range', min: 0.0001, max: 20, unit: 'µm' },
      { param: 'measure/youngsModulus', kind: 'range', min: 1, max: 500, unit: 'GPa' },
      { param: 'measure/hardness', kind: 'range', min: 0.01, max: 50, unit: 'GPa' },
    ],
    holds: [
      { param: 'load', min: 0.0001, max: 500 },
      { param: 'temperature', min: 20, max: 25 },
    ],
    composedOf: [
      { item: 'plant/nanoindenter/head', qty: q(1) },
      // 针尖是压头的一部分（可换，但属于整机组成；单件不再单独消耗）
      { item: 'plant/nanoindenter/tip', qty: q(1) },
    ],
  },
];

export const NANOINDENT_ROUTES: readonly Route[] = [
  {
    /**
     * **碳化钨备用针：WC 压制 → 无粘结剂烧结 → 三面粗磨 → 分级碳化硅手研 →
     * 热镶针柄 → e-beam-column 量尖。**
     *
     * 为什么写这一条：它是这台进口头上**最早能本地做的一件**（金刚石压头
     * 的路线见 `data/machine/diamond.ts`），也是“50 nm 做不出”那句话的
     * 实物边界 —— 做到哪、差多少，都在这条路线的 `gives` 里。
     *
     *   进 1.012 kg，出 1 支（约 1.5 g）：水 1 kg + 碳化硅 10 g + 磨掉的 WC/钢 ~0.5 g
     *   三面角：面与轴 65.27°、三面互成 120°（Berkovich 的几何），靠角规夹具保证
     *   尖端：**0.5–2 µm** —— 最后一级磨料 0.5 µm、团聚 0.5–2 µm，尖不会比磨料细
     *
     * ⚠️ `gives` 是设计/工艺窗口，**不是实测**：本层没有在 50–500 nm 尺度上
     * 标定过的尖半径量具；e-beam-column 的 ±20 nm 只够把 0.5/1/2 µm 分档
     * （`cd-sem.ts` §九①）。每支做完要量，量到多少记多少，不许把 0.5 写成 0.05。
     *
     * ⚠️ 它**不恢复** R8 ⑮ 的 E/H：0.5–2 µm 的尖比膜厚（200–500 nm）还大，
     * 20–100 nm 的压深是赫兹接触，不是自相似的 Berkovich 压入；面积函数也
     * 没有标定过的熔石英/蓝宝石压痕标样可标（`mat/glass` 的 fused-silica 是玻璃，
     * 不是面积函数标样），AFM 也没有。
     *
     * ⚠️ 无粘结剂 WC 的代价是脆：它在 1900–2000 °C 烧结，没有钴/镍把 WC 颗粒
     * 粘住，尖一崩就是整支报废。镍链通了以后可以改回 6–10 % Ni、1400–1500 °C
     * （`make/carbide-insert` 那条），韧性会好一档 —— 那是升级，不是这一条。
     */
    id: 'make/nanoindenter-tip',
    name: '纳米压痕机纳米压痕备用针制造',
    produces: [
      {
        item: 'plant/nanoindenter/tip',
        qty: q(1),
        gives: [{ param: 'tipRadius', kind: 'range', min: 0.5, max: 2 }],
      },
    ],
    uses: [
      // 1 g WC 粉 + 1 g 45 钢针柄；WC 粉在烧结与研磨里掉一半以上。
      { anyOf: [{ item: 'mat/tungsten-carbide', qty: q(1, 1000) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1, 1000) }] },
      // 10 g 碳化硅：5 / 2 / 1 / 0.5 µm 四级，0.5 µm 那一级要静置三天取上部清液。
      { anyOf: [{ item: 'mat/silicon-carbide', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    // 恒温间是研磨与量尖的前提；研磨平板是工具（不是执行设备）。
    needs: ['plant/metrology-room', 'plant/comparator/lapping-plate'],
    steps: [
      {
        note_zh:
          '压坯：1 g WC 粉装 φ8 模，100–200 MPa 单轴压成 3 mm 见方的三角柱坯（与刀片同一条压制线；压不透会有分层，烧结后一磨就崩）',
        performedBy: 'plant/press',
      },
      {
        note_zh:
          '无粘结剂烧结：1900–2000 °C、H₂ 或 Ar、氧 ≤50 ppm，保温 1–2 h —— 不加镍，靠 WC 自扩散致密；温度低了密度不够，高了晶粒长粗（晶粒粗 ⇒ 磨出来的尖更脆）',
        performedBy: 'plant/atmosphere-furnace',
        under: [
          { param: 'temperature', min: 1900, max: 2000 },
          { param: 'oxygen_ppm', min: 0, max: 50 },
        ],
      },
      {
        note_zh:
          '粗磨三面：角规夹具把坯体按 65.27°（面与轴）装到磨床上，三面互成 120°；每面留 0.2–0.3 mm 给手研。**角度错 1° 就废**：三面不交于一点，压出来的接触面积函数对不上 Berkovich',
        performedBy: 'plant/grinder',
      },
      {
        note_zh:
          '配磨料：碳化硅水选分级 5 / 2 / 1 / 0.5 µm 四级（搅匀—静置—虹吸；0.5 µm 取静置三天的上部清液）；每级单独一盆一勺，换级洗三遍 —— 一颗 5 µm 粗粒混进 0.5 µm，就是尖上 2 µm 的崩口',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '手研三面：研磨平板上按 8 字轨迹逐级研（5 → 2 → 1 → 0.5 µm），每级每面 20–30 min；三面轮换，靠显示剂看接触点。**最后一级决定尖端半径**：0.5 µm 的磨料 + 团聚 0.5–2 µm ⇒ 尖只能到 0.5–2 µm',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '热镶针柄：φ3 × 20 的 45 钢柄加热到 480–520，把 WC 针坯压入承孔，冷却收紧（硬质合金脆，要钢柄箍住；与拉丝模的热镶同一个办法）',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 480, max: 520 }],
      },
      {
        note_zh:
          '量尖：e-beam-column 的 STEM（9.3 nm）侧看针尖，按 0.3 µm 钨尖那套判据读半径（±20 nm，`cd-sem.ts` §九①）；把实测值写进批次卡。**0.5–2 µm 是分档，不是 50 nm 的证明** —— 要判 50 nm 得有 0.05 µm 级的量具',
        performedBy: 'plant/e-beam-column',
      },
    ],
    unbalanced_zh:
      '进 1.012 kg（WC 1 g + 45 钢 1 g + 碳化硅 10 g + 水 1 kg），出 1 支（约 1.5 g，按件计）：差 1.0105 kg = 水 1 kg（磨浆与清洗，蒸发/倒掉）+ 碳化硅 10 g（随水走）+ 磨掉的 WC/钢约 0.5 g（磨屑回收，不逐批计）',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...NANOINDENT_ITEMS];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/nanoindenter',
    name: '纳米压痕机装配',
    produces: [{
      item: 'plant/nanoindenter',
      qty: q(1),
      gives: [
      { param: 'load', kind: 'range', min: 0.0001, max: 500 },
      { param: 'displacement', kind: 'range', min: 0.0001, max: 20 },
      { param: 'measure/youngsModulus', kind: 'range', min: 1, max: 500 },
      { param: 'measure/hardness', kind: 'range', min: 0.01, max: 50 },
      ],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...NANOINDENT_ROUTES, ...ASSEMBLY_ROUTES];
