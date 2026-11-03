/**
 * 光刻升级 —— M1：5 µm → 1 µm。
 *
 * 这一份做的是**造设备**，不是造芯片：把"缩微拼版机"这台机器造出来，
 * 于是掩模从"手刻 10 µm"变成"0.5–1 µm 整片大版"，芯片上限从 L2 抬到 L3。
 *
 * 母机原理在这里第一次用到半导体上：
 *   车床造车床 → 光刻机也可以造光刻机（它只是精密机床 + 照相镜头 + 光源）
 *
 * 三件零件都是本层最熟的手艺：
 *   缩微镜头组  手抛石英三片、100× 缩小、球差靠缩小光圈换景深
 *   精密步进台  丝杠 + 光栅尺 + 步进电机，1 µm 定位（比较仪那一族）
 *   铸铁机身    刮研 + 大质量减振（计量室那一族）
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const LITHO_ITEMS: readonly Item[] = [
  {
    id: 'plant/photorepeater/lens',
    name: 'Photorepeater Reduction Lens Assembly', name_zh: '缩微重复曝光机缩微镜头组',
    unit: '件',
    category: 'part',
  },
  {
    id: 'plant/photorepeater/stage',
    name: 'Photorepeater Precision Stepping Stage', name_zh: '缩微重复曝光机精密步进台',
    unit: '件',
    category: 'part',
  },
  {
    id: 'plant/photorepeater/frame',
    name: 'Photorepeater Cast Iron Frame', name_zh: '缩微重复曝光机铸铁机身',
    unit: '件',
    category: 'part',
  },
  {
    id: 'plant/photorepeater',
    name: 'Photorepeater', name_zh: '缩微重复曝光机',
    unit: '台',
    category: 'machine',
    composedOf: [
      { item: 'plant/photorepeater/lens', qty: q(1) },
      { item: 'plant/photorepeater/stage', qty: q(1) },
      { item: 'plant/photorepeater/frame', qty: q(1) },
      { item: 'std/carbon-electrode-300', qty: q(2) },
      { item: 'std/motor-7.5kw-4p', qty: q(1) },
    ],
  },
  {
    /**
     * 1 000 门 8 位 CPU 芯片（1 µm 工艺节点）。
     *
     * 与 `std/alu-chip-general`（40 门、5 µm 节点）的区别只有一个：**掩模精度**。
     * 同一套扩散/蒸铝/划片工艺，掩模从 5 µm 进到 1 µm，单片门数从 40 进到 1 000。
     */
    id: 'std/cpu-8bit-general',
    name: '1 000 Gate 8-Bit CPU Chip', name_zh: '1 000 门 8 位 CPU 芯片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'node', kind: 'range', min: 1000, max: 1000, unit: 'nm', dir: 'atMost' },
      { param: 'gates', kind: 'range', min: 800, max: 1200, unit: '门' },
    ],
  },
];

export const LITHO_ROUTES: readonly Route[] = [
  {
    /**
     * 缩微镜头组：三片石英，100× 缩小。
     *
     * 照相缩微的镜头不需要大孔径 —— 它需要**平场**与低畸变。
     * 所以是三片一组（前组正、中间负、后组正），光圈收到 f/11 换景深，
     * 视场只有 10 mm（掩模一块的尺寸），畸变靠装配时用星点调。
     *
     * 6 kg 的石英组，手抛 200 h —— 这是整台机器最贵的一件。
     */
    id: 'make/photorepeater-lens',
    name: 'Photorepeater Reduction Lens Assembly Manufacturing', name_zh: '缩微重复曝光机缩微镜头组制造',
    produces: [{ item: 'plant/photorepeater/lens', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(3) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(40) }] },
      { anyOf: [{ item: 'mat/water', qty: q(20) }] },
    ],
    needs: ['plant/comparator', 'plant/interferometer', 'plant/metrology-room'],
    steps: [
      { note_zh: '粗磨成形（三片曲率半径按焦距算）', performedBy: 'plant/grinder' },
      { note_zh: '手抛到 λ/2（沥青盘没有，用铸铁盘 + 石英粉）', performedBy: 'plant/robot' },
      { note_zh: '装配与星点检验（看像散与畸变）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '石英 3 + 尾矿 40（磨料与抛光粉）+ 水 20 → 镜头组 6；余是磨削量与抛光粉',
  },
  {
    /**
     * 精密步进台：1 µm 定位，行程 100 mm。
     *
     * 拼版要在一块 100×100 mm 的干版上排 10 000 个 1 mm 的场，
     * 每个场定位误差必须 <0.5 µm —— 而 50 mm 行程上 1 µm 的丝杠要研磨级。
     *
     * 光栅尺是自制的（刻线那一族：车床挂轮 + 分度），闭环读数靠游标。
     */
    id: 'make/photorepeater-stage',
    name: 'Photorepeater Precision Stepping Stage Manufacturing', name_zh: '缩微重复曝光机精密步进台制造',
    produces: [{ item: 'plant/photorepeater/stage', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht250', qty: q(160) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(20) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1), need: [{ param: 'type', kind: 'enum', oneOf: ['soda-lime'] }], onRelax: 'functional-kept' }] },
    ],
    needs: ['plant/gauge-block', 'plant/metrology-room'],
    steps: [
      { note_zh: '浇床身并时效（残余应力会让 1 µm 走掉）', performedBy: 'plant/melting-furnace', under: [{ param: 'temperature', min: 1350, max: 1450 }] },
      { note_zh: '刮研导轨（三块互研，与平板同一手）', performedBy: 'plant/robot' },
      { note_zh: '磨丝杠到 5 µm/300 mm，配消隙螺母', performedBy: 'plant/grinder' },
      { note_zh: '刻光栅尺（车床挂轮，1200 线）', performedBy: 'lathe' },
      { note_zh: '装配与定位精度检验（量块 + 比较仪）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '铸铁 160 + 45 钢 20 + 铜线 1 + 玻璃 1 → 台 180；余 2 是切屑与磨削',
  },
  {
    /** 铸铁机身：大质量、减振、能坐住 1 µm。 */
    id: 'make/photorepeater-frame',
    name: 'Photorepeater Cast Iron Frame Manufacturing', name_zh: '缩微重复曝光机铸铁机身制造',
    produces: [{ item: 'plant/photorepeater/frame', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/iron-ht200', qty: q(950) }] },
      { anyOf: [{ item: 'mat/tailings', qty: q(600) }] },
      { anyOf: [{ item: 'mat/water', qty: q(80) }] },
    ],
    needs: ['plant/comparator'],
    steps: [
      { note_zh: '砂型铸造（一次浇成，避免焊缝）', performedBy: 'plant/melting-furnace', under: [{ param: 'temperature', min: 1350, max: 1420 }] },
      { note_zh: '去应力退火 6 个月自然时效 + 人工时效', performedBy: 'plant/earth-kiln', under: [{ param: 'temperature', min: 550, max: 650 }] },
      { note_zh: '刨铣加工三个安装面', performedBy: 'plant/milling-machine' },
      { note_zh: '刮研安装面（每 25 mm² 20 点）', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '生铁 950 + 型砂 600 + 水 80 → 机身 900；余 730 是浇冒口、砂与切屑',
  },
  {
    /**
     * 1 µm 掩模：用缩微拼版机把"手刻 10 µm 的母图"缩到 1 µm 并拼成整片大版。
     *
     * 这是整个 M1 的产出物 —— 它本身不是芯片，但**它是把 5 µm 变成 1 µm 的那件东西**。
     * 与原来的 `make/photomask`（手刻 + 一次缩微，3–5 µm）并存。
     */
    id: 'make/photomask-1um',
    name: 'Contact Mask Manufacturing', name_zh: '接触式掩模制造',
    produces: [
      {
        item: 'std/photomask-general',
        qty: q(1),
        gives: [
          { param: 'minFeature', kind: 'range', min: 0.5, max: 1 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/photomask-general', qty: q(1), need: [{ param: 'minFeature', kind: 'range', min: 3, max: 5 }], onRelax: 'functional-kept' }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/sodium-dichromate', qty: q(1, 20) }] },
    ],
    needs: ['plant/photorepeater', 'plant/metrology-room'],
    steps: [
      { note_zh: '装母图、对光、调焦（星点）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '逐场步进曝光（10 000 场 × 8 s = 22 h）', performedBy: 'plant/robot' },
      { note_zh: '显影、坚膜、检验线宽（显微镜读数）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(24) },
    unbalanced_zh: '母图 1 + 玻璃 1 + 胶 0.1 + 重铬酸盐 0.05 → 1 µm 掩模 1；掩模是"版"，不计质量',
  },
  {
    /**
     * 1 000 门 CPU：L3 的第一颗。
     *
     * 与 `make/alu-chip` 用的是同一套工艺（氧化 → 光刻 → 扩散 → 蒸铝 → 划片 → 封装），
     * 唯一的差别是掩模精度：**1 µm 掩模 + 0.5 µm 胶层**，于是单片能装 1 000 门。
     *
     * 良率：管芯 0.25 cm²，D 若压到 10 → Y = e^(−2.5) = **8 %**；
     * 一片 4 寸片出 320 只，挑出 25 只 —— **一台机器人的 CPU 一片硅片就够**。
     */
    id: 'make/cpu-8bit',
    name: '1 000 Gate 8-Bit CPU Chip Manufacturing', name_zh: '1 000 门 8 位 CPU 芯片制造',
    produces: [
      {
        item: 'std/cpu-8bit-general',
        qty: q(25),
        gives: [
          { param: 'node', kind: 'range', min: 1000, max: 1000 },
          { param: 'gates', kind: 'range', min: 800, max: 1200 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      {
        anyOf: [
          {
            item: 'std/photomask-general',
            qty: q(1),
            need: [
              { param: 'minFeature', kind: 'range', min: 0.5, max: 1 },
            ],
            onRelax: 'functional-lost',
          },
        ],
      },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 5) }] },
      // 现有 HF 路线交 60–70%；30–70 是写宽了。
      { anyOf: [{ item: 'mat/hf', qty: q(1, 10), need: [{ param: 'concentration', kind: 'range', min: 60, max: 70 }], onRelax: 'functional-kept' }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1, 5) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '干氧氧化 1 000 °C', performedBy: 'plant/diffusion-furnace', under: [{ param: 'temperature', min: 950, max: 1100 }] },
      { note_zh: '八道掩模的光刻（涂胶、曝光、显影、腐蚀）', performedBy: 'plant/mask-aligner' },
      { note_zh: '磷扩散与再分布', performedBy: 'plant/diffusion-furnace', under: [{ param: 'temperature', min: 950, max: 1100 }] },
      { note_zh: '蒸铝与合金化', performedBy: 'plant/evaporator' },
      { note_zh: '划片、装壳、焊引线', performedBy: 'plant/robot' },
      { note_zh: '逐只探针测试（曲线图示波器判好坏）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '挑出好片（8 % 良率）', performedBy: 'plant/robot' },
    ],
    rate: { hours: q(10) },
    unbalanced_zh: '硅片 1（约 0.05 kg）+ 胶 0.2 + 氢氟酸 0.1 + 铝 0.1 + 氧 0.2 → 芯片 25；余是划片屑与废片',
  },
  {
    /**
     * 8 位控制器：机器人第一次"会算，而且算得够快"。
     *
     * 与 `make/robot-controller-computer`（4 位机）的区别：8 位能算乘法与浮点近似，
     * 插补点数从"每秒 200 点"升到"每秒 2 000 点" → 0.1 mm 台阶变成 0.02 mm。
     *
     * 于是这台机器人第一次能做**圆弧插补** —— 沿着曲线走，而不是走折线。
     */
    id: 'make/robot-controller-8bit',
    name: 'Robot Control Cabinet Manufacturing', name_zh: '机器人控制柜制造',
    produces: [{ item: 'plant/robot/controller', qty: q(1), gives: [{ param: 'dof', kind: 'range', min: 6, max: 6 }] }],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'std/cpu-8bit-general', qty: q(2), need: [{ param: 'node', kind: 'range', max: 1000, dir: 'atMost' }], onRelax: 'functional-lost' }] },
      { anyOf: [{ item: 'std/ram-chip-general', qty: q(8) }] },
      { anyOf: [{ item: 'std/prom-chip-general', qty: q(4) }] },
      { anyOf: [{ item: 'std/selsyn-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(4) }] },
      { anyOf: [{ item: 'std/thyristor-general', qty: q(6) }] },
    ],
    needs: [],
    performedBy: 'plant/sheet-shop',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...LITHO_ITEMS];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/photorepeater',
    name: 'Photorepeater Assembly', name_zh: '缩微重复曝光机装配',
    produces: [{
      item: 'plant/photorepeater',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...LITHO_ROUTES, ...ASSEMBLY_ROUTES];
