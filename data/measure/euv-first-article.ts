/**
 * 8 nm 首片的 CD / Vt / 方阻读数 —— 首片跑出来后，除了套刻还要读器件。
 *
 * 这一条只写**程序与能力域**，不写 8–10 nm 的读数：
 *
 *   lineWidth       `plant/cd-sem`（束斑 4 nm、CD 3σ 3.5 nm）；10 点
 *   Vt              `plant/probe-station` 的转移特性（1e-13–1e-8 F、±10 V）
 *   sheetResistance `plant/probe-station` 的四探针（0.001–10⁶ Ω/□）
 *
 * ⚠️ **LER 不在记录里。** `saqp.ts` 的缺口①写明本层没有 LER 量具：
 * CD-SEM 的 3 nm 边缘分辨率与 2–3 nm 的 LER 同量级，读出来的“毛边”
 * 不能当校准过的 LER。这一条不拿 SEM 像的毛边冒充 LER。
 *
 * 首片是 `mat/device-wafer-first`（设计套刻跑的），不是量产片；它的
 * CD/Vt/方阻只用于首件放行，不能当 `make/device-wafer-oct` 的量产记录。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const EUV_FIRST_ARTICLE_ITEMS: readonly Item[] = [
  /**
   * 8 nm 首片的 CD/Vt/方阻记录。能力域：lineWidth 0–100 nm、Vt 0–2 V、
   * sheetResistance 0–10000 Ω/□；不是 8–10 nm / 0.3 V 的读数。
   * LER 不在内：本层没有 LER 量具。
   */
  {
    id: 'mat/first-article-record',
    name: '8 nm First Article CD/Vt/Sheet Resistance Record', name_zh: '8 nm 首片的 CD/Vt/方阻记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'lineWidth', kind: 'range', min: 0, max: 100, unit: 'nm', dir: 'atMost' },
      { param: 'vt', kind: 'range', min: 0, max: 2, unit: 'V' },
      { param: 'sheetResistance', kind: 'range', min: 0, max: 10000, unit: 'Ω/□' },
      { param: 'points', kind: 'range', min: 1, max: 10, unit: '点' },
    ],
  },

  /**
   * 线条边缘粗糙度（LER）记录。能力域 `ler 0–20 nm`、`points 1–1000`、
   * `method sem-edge`；不是 2–3 nm 的校准读数。本层没有独立的 LER 量具，
   * 只有 CD-SEM 边缘像；3 nm 的边缘分辨率与 2–3 nm LER 同量级。
   */
  {
    id: 'mat/ler-record',
    name: 'Line Edge Roughness Record', name_zh: '线条边缘粗糙度记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'ler', kind: 'range', min: 0, max: 20, unit: 'nm', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 1000, unit: '个' },
      { param: 'method', kind: 'enum', values: ['sem-edge', 'tem-plan-view'] },
    ],
  },

  /**
   * 首片栅极叠层的截面记录：gateOxide / highK / metalGate / interface 厚度。
   *
   * 能力域：oxide 0–20 nm、highK 0–20 nm、metalGate 0–50 nm、interface 0–10 nm、
   * points 1–10；不是 1.2 nm 栅氧的校准读数。TEM 的 0.5 nm 点分辨率能看
   * 界面，但样品制备的 FIB 损伤层 2–5 nm 与界面粗糙度同量级，读出的厚度
   * 要带损伤层修正的说明。
   */
  {
    id: 'mat/gate-stack-record',
    name: 'First Article Gate Stack Cross-Section Record', name_zh: '首片栅极叠层的截面记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'gateOxide', kind: 'range', min: 0, max: 20, unit: 'nm', dir: 'atMost' },
      { param: 'highK', kind: 'range', min: 0, max: 20, unit: 'nm', dir: 'atMost' },
      { param: 'metalGate', kind: 'range', min: 0, max: 50, unit: 'nm', dir: 'atMost' },
      { param: 'interface', kind: 'range', min: 0, max: 10, unit: 'nm', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 10, unit: '点' },
    ],
  },

  /**
   * 首片电学记录：contact/via 电阻与栅极漏电。能力域
   * `contactResistance 0–1000 Ω`、`viaResistance 0–1000 Ω`、
   * `gateLeakage 0–1e-6 A`、`points 1–10`；不是 8 nm 的良率/漏电读数。
   */
  {
    id: 'mat/first-article-electrical-record',
    name: 'First Article Electrical Record', name_zh: '首片电学记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'contactResistance', kind: 'range', min: 0, max: 1000, unit: 'Ω', dir: 'atMost' },
      { param: 'viaResistance', kind: 'range', min: 0, max: 1000, unit: 'Ω', dir: 'atMost' },
      { param: 'gateLeakage', kind: 'range', min: 0, max: 1e-6, unit: 'A', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 10, unit: '点' },
    ],
  },

  /**
   * 首片缺陷图记录：光学巡检的颗粒/大缺陷密度 + CD-SEM 复查的图形缺陷。
   *
   * 能力域：defectDensity 0–1e6 /cm²、defects 0–10000、field 2–5 mm、
   * points 1–100；不是 8 nm 的良率。光学 1–2 µm 只能看颗粒/大缺陷，
   * 8 nm 图形缺陷仍要 CD-SEM 复查。
   */
  {
    id: 'mat/first-article-defect-record',
    name: 'First Article Defect Map Record', name_zh: '首片缺陷图记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'defectDensity', kind: 'range', min: 0, max: 1000000, unit: '/cm²', dir: 'atMost' },
      { param: 'defects', kind: 'range', min: 0, max: 10000, unit: '个', dir: 'atMost' },
      { param: 'field', kind: 'range', min: 1, max: 10, unit: 'mm' },
      { param: 'points', kind: 'range', min: 1, max: 100, unit: '点' },
    ],
  },

  /**
   * 首片电子束缺陷图记录：8 nm 图形缺陷的全片图。
   *
   * 能力域：defectDensity 0–1e6 /cm²、defects 0–10000、pixel 1–20 nm、
   * points 1–100；不是 8 nm 良率。电子束 2–5 nm 分辨率能看图形缺陷，
   * 但 0.2–0.5 片/h 的吞吐决定它只能抽 100 场，不是全片逐像素。
   */
  {
    id: 'mat/first-article-ebeam-record',
    name: 'First Article Electron Beam Defect Map Record', name_zh: '首片电子束缺陷图记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'defectDensity', kind: 'range', min: 0, max: 1000000, unit: '/cm²', dir: 'atMost' },
      { param: 'defects', kind: 'range', min: 0, max: 10000, unit: '个', dir: 'atMost' },
      { param: 'pixel', kind: 'range', min: 1, max: 20, unit: 'nm' },
      { param: 'points', kind: 'range', min: 1, max: 100, unit: '点' },
    ],
  },
];

export const EUV_FIRST_ARTICLE_ROUTES: readonly Route[] = [
  {
    /**
     * 首件三读：CD-SEM 线宽 → 探针台 Vt → 四探针方阻。
     *
     * 输出能力域 `lineWidth 0–100 nm`、`vt 0–2 V`、`sheetResistance 0–10000 Ω/□`、
     * `points 10`；不是 8–10 nm 的读数。LER 明确不测：没有 LER 量具。
     */
    id: 'measure/euv-hina-first-article',
    name: '8 nm First Article CD/Vt/Sheet Resistance Measurement', name_zh: '8 nm 首片的 CD/Vt/方阻测量',
    produces: [
      {
        item: 'mat/first-article-record',
        qty: q(1),
        gives: [
          { param: 'lineWidth', kind: 'range', min: 0, max: 100 },
          { param: 'vt', kind: 'range', min: 0, max: 2 },
          { param: 'sheetResistance', kind: 'range', min: 0, max: 10000 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/water', qty: q(1) }] }],
    needs: ['mat/device-wafer-first', 'plant/metrology-room'],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh: 'CD-SEM 读首片线宽：10 点、CD 3σ 3.5 nm；LER 不测（没有 LER 量具）',
        performedBy: 'plant/cd-sem',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-3 }],
      },
      {
        note_zh: '探针台读转移特性：Vt 从 Id-Vg 线性区提取；同一片 MOS 电容/晶体管',
        performedBy: 'plant/probe-station',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '四探针读方阻：0.001–10⁶ Ω/□，10 点；写能力域，不写 8–10 nm 读数',
        performedBy: 'plant/probe-station',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '水 1 kg → 首件记录 1 份；首片是样品，记录是数据不是物料。',
  },
  {
    /**
     * **LER 的降级测量：CD-SEM 边缘像 + 统计，不是校准过的 LER 量具。**
     *
     * 10 条线 × 50 帧、100k×，逐帧提边缘位置；沿线的 3σ 就是 LER 的
     * 统计估计。噪声底是 CD-SEM 的 3 nm 边缘分辨率；2–3 nm 的 LER 与
     * 噪声同量级，读出来的数只能当**上限/趋势**，不能当 2–3 nm 的校准值。
     *
     * 升级是独立的高分辨边缘量具（或经校准的 SEM 边缘算法）；本条只交
     * 能力域 `ler 0–10 nm`、`points 500`、`method sem-edge`。
     */
    id: 'measure/ler-sem-edge',
    name: 'LER Degradation Measurement', name_zh: 'LER 的降级测量',
    produces: [
      {
        item: 'mat/ler-record',
        qty: q(1),
        gives: [
          { param: 'ler', kind: 'range', min: 0, max: 10 },
          { param: 'points', kind: 'range', min: 500, max: 500 },
          { param: 'method', kind: 'enum', oneOf: ['sem-edge'] },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/water', qty: q(1) }] }],
    needs: ['mat/device-wafer-first', 'plant/metrology-room'],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh: 'CD-SEM 100k× 拍 10 条线、每条 50 帧；束斑 4 nm、边缘分辨率 3 nm',
        performedBy: 'plant/cd-sem',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-3 }],
      },
      {
        note_zh: '逐帧提边缘位置，沿线算 3σ；噪声底 3 nm，2–3 nm LER 只能当上限',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '写能力域 ler 0–10 nm、points 500；不写 2–3 nm 的校准读数',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '水 1 kg → LER 记录 1 份；首片是样品，记录是数据不是物料。',
  },
  {
    /**
     * **LER 的升级：TEM 平面视图，0.5 nm 点分辨率。**
     *
     * CD-SEM 的边缘噪声底 3 nm，压不到 2–3 nm；TEM 的 0.5 nm 点分辨率
     * 足够看 8 nm 线的边缘。做法是**平面视图**：首片表面蒸 Pt 保护层，
     * FIB 切 30–60 nm 薄片，TEM 200 kV 从顶面成像，沿线提边缘。
     *
     * 样品是 `mat/device-wafer-first`，切完不可再用；这是破坏性测量。
     * 输出能力域 `ler 0–5 nm`、`points 100`、`method tem-plan-view`；
     * 2–3 nm 的设计值仍要真读后再收窄。FIB 的 30 kV 损伤层 2–5 nm 会
     * 加宽边缘，低能终抛 0.5–2 kV 把损伤压到 2–5 nm。
     */
    id: 'measure/ler-tem-plan-view',
    name: 'Line Edge Roughness Measurement', name_zh: '线条边缘粗糙度测量',
    produces: [
      {
        item: 'mat/ler-record',
        qty: q(1),
        gives: [
          { param: 'ler', kind: 'range', min: 0, max: 5 },
          { param: 'points', kind: 'range', min: 100, max: 100 },
          { param: 'method', kind: 'enum', oneOf: ['tem-plan-view'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/platinum', qty: q(1, 1000000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['mat/device-wafer-first', 'plant/metrology-room'],
    rate: { hours: q(12) },
    steps: [
      {
        note_zh: '首片表面蒸 Pt 保护层 0.1–0.5 µm；0.001–0.1 Pa',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 0.1 }],
      },
      {
        note_zh: 'FIB 平面视图 lift-out：30 kV 粗切 → 2–5 kV 精修 → 低能终抛；薄片 30–60 nm',
        performedBy: 'plant/fib-tem',
        under: [{ param: 'pressure', min: 1e-5, max: 1e-3 }],
      },
      {
        note_zh: 'TEM 200 kV 平面视图：0.5 nm 点分辨率，沿线拍边缘；样品不可再用',
        performedBy: 'plant/tem',
        under: [{ param: 'pressure', min: 1e-7, max: 1e-5 }],
      },
      {
        note_zh: '提边缘算 3σ；写能力域 ler 0–5 nm、points 100；不写 2–3 nm 读数',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '首片 1（切样）+ 铂 0.001 + 水 1 → LER 记录 1 份；首片被切开，记录是数据不是物料。',
  },
  {
    /**
     * **首片栅极截面：TEM 看栅氧/高 k/金属栅/界面。**
     *
     * 与 LER 平面视图同一套 FIB/TEM，只换切样方向：截面（cross-section）
     * 看叠层，平面视图看线边。Pt 保护层 → FIB 30 kV/2–5 kV → TEM 200 kV。
     *
     * 能力域 `gateOxide 0–20 nm`、`highK 0–20 nm`、`metalGate 0–50 nm`、
     * `interface 0–10 nm`、`points 5`；1.2 nm 栅氧与 2 nm 高 k 的读数仍要
     * 带 FIB 损伤层修正后再收窄。首片切完不可再用。
     */
    id: 'measure/gate-stack-tem',
    name: 'First Article Gate Stack Cross-Section Measurement', name_zh: '首片栅极叠层的截面测量',
    produces: [
      {
        item: 'mat/gate-stack-record',
        qty: q(1),
        gives: [
          { param: 'gateOxide', kind: 'range', min: 0, max: 20 },
          { param: 'highK', kind: 'range', min: 0, max: 20 },
          { param: 'metalGate', kind: 'range', min: 0, max: 50 },
          { param: 'interface', kind: 'range', min: 0, max: 10 },
          { param: 'points', kind: 'range', min: 5, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/platinum', qty: q(1, 1000000) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['mat/device-wafer-first', 'plant/metrology-room'],
    rate: { hours: q(12) },
    steps: [
      {
        note_zh: '首片表面蒸 Pt 保护层 0.1–0.5 µm；0.001–0.1 Pa',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 0.1 }],
      },
      {
        note_zh: 'FIB 截面 lift-out：30 kV 粗切 → 2–5 kV 精修 → 低能终抛；薄片 30–60 nm',
        performedBy: 'plant/fib-tem',
        under: [{ param: 'pressure', min: 1e-5, max: 1e-3 }],
      },
      {
        note_zh: 'TEM 200 kV 截面：0.5 nm 点分辨率，读栅氧/高 k/金属栅/界面；5 点',
        performedBy: 'plant/tem',
        under: [{ param: 'pressure', min: 1e-7, max: 1e-5 }],
      },
      {
        note_zh: '写能力域 0–20/0–20/0–50/0–10 nm；不写 1.2 nm 栅氧读数，损伤层另记',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '首片 1（切样）+ 铂 0.001 + 水 1 → 栅极截面记录 1 份；首片被切开，记录是数据不是物料。',
  },
  {
    /**
     * **首片电学：接触孔/通孔电阻 + 栅极漏电，同一片、非破坏。**
     *
     * 探针台四端对读 contact/via；同一台加偏压读栅极漏电（1 V）。
     * 输出能力域 `contact 0–1000 Ω`、`via 0–1000 Ω`、`gateLeakage 0–1e-6 A`、
     * `points 10`；不是 8 nm 的良率、漏电分布或“全片通过”。
     *
     * 这一条不切样，所以它可以在 LER/栅极截面的 TEM 之前做；TEM 之后片
     * 就没了。
     */
    id: 'measure/first-article-electrical',
    name: 'First Article Electrical Measurement', name_zh: '首片电学测量',
    produces: [
      {
        item: 'mat/first-article-electrical-record',
        qty: q(1),
        gives: [
          { param: 'contactResistance', kind: 'range', min: 0, max: 1000 },
          { param: 'viaResistance', kind: 'range', min: 0, max: 1000 },
          { param: 'gateLeakage', kind: 'range', min: 0, max: 1e-6 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/water', qty: q(1) }] }],
    needs: ['mat/device-wafer-first', 'plant/metrology-room'],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh: '探针台四端对读 contact/via 电阻：10 点，1–1000 Ω 档；接触电阻 <1 mΩ',
        performedBy: 'plant/probe-station',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '同一台加 1 V 偏压读栅极漏电：0.001–1e-6 A 档；10 点',
        performedBy: 'plant/probe-station',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '写能力域 contact 0–1000 Ω、via 0–1000 Ω、gateLeakage 0–1e-6 A；不写良率',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '水 1 kg → 首片电学记录 1 份；首片是样品，记录是数据不是物料。',
  },
  {
    /**
     * **首片缺陷图：光学巡检扫 100 场 + CD-SEM 复查 20 个疑点。**
     *
     * `plant/wafer-inspection`（明场/暗场、1–2 µm）扫 100 场，标疑点；
     * CD-SEM 复查 20 个，分类颗粒/图形缺陷；算密度写记录。
     *
     * 输出能力域 `defectDensity 0–1e6 /cm²`、`defects 0–10000`、
     * `field 2–5 mm`、`points 100`；不是 8 nm 的良率。8 nm 图形缺陷的
     * 全片图仍要更高分辨率的电子束巡检，本层没有。
     */
    id: 'measure/first-article-defect-map',
    name: 'First Article Defect Map Measurement', name_zh: '首片缺陷图测量',
    produces: [
      {
        item: 'mat/first-article-defect-record',
        qty: q(1),
        gives: [
          { param: 'defectDensity', kind: 'range', min: 0, max: 1000000 },
          { param: 'defects', kind: 'range', min: 0, max: 10000 },
          { param: 'field', kind: 'range', min: 2, max: 5 },
          { param: 'points', kind: 'range', min: 100, max: 100 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/water', qty: q(1) }] }],
    needs: ['mat/device-wafer-first', 'plant/metrology-room'],
    rate: { hours: q(4) },
    steps: [
      {
        note_zh: '装首片到巡检机 300 mm 台；明场/暗场各扫 50 场，标疑点',
        performedBy: 'plant/wafer-inspection',
      },
      {
        note_zh: 'CD-SEM 复查 20 个疑点：颗粒/图形缺陷分类；8 nm 图形缺陷只抽查，不做全片图',
        performedBy: 'plant/cd-sem',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-3 }],
      },
      {
        note_zh: '算缺陷密度与总数；写能力域，不写 8 nm 良率',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '水 1 kg → 首片缺陷图记录 1 份；首片是样品，记录是数据不是物料。',
  },
  {
    /**
     * **首片电子束缺陷图：8 nm 图形缺陷的 100 场抽检。**
     *
     * 与光学缺陷图共用首片和流程，只换巡检机：`plant/e-beam-inspection`
     * 的 2–5 nm 像素能看 8 nm 图形缺陷；0.2–0.5 片/h 的吞吐决定它只能
     * 扫 100 场，不是全片逐像素。
     *
     * 输出能力域 `defectDensity 0–1e6 /cm²`、`defects 0–10000`、
     * `pixel 2–10 nm`、`points 100`；不是 8 nm 良率，也不是全片图。
     */
    id: 'measure/first-article-ebeam-map',
    name: 'First Article Electron Beam Defect Map Measurement', name_zh: '首片电子束缺陷图测量',
    produces: [
      {
        item: 'mat/first-article-ebeam-record',
        qty: q(1),
        gives: [
          { param: 'defectDensity', kind: 'range', min: 0, max: 1000000 },
          { param: 'defects', kind: 'range', min: 0, max: 10000 },
          { param: 'pixel', kind: 'range', min: 2, max: 10 },
          { param: 'points', kind: 'range', min: 100, max: 100 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/water', qty: q(1) }] }],
    needs: ['mat/device-wafer-first', 'plant/metrology-room'],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh: '装首片到电子束巡检机 300 mm 台；抽真空 1e-6–1e-3 Pa',
        performedBy: 'plant/e-beam-inspection',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-3 }],
      },
      {
        note_zh: '2–10 nm 像素扫 100 场；与参考 die 比对，标图形缺陷',
        performedBy: 'plant/e-beam-inspection',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-3 }],
      },
      {
        note_zh: '分类/算密度；写能力域，不写 8 nm 良率、不写全片图',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '水 1 kg → 首片电子束缺陷图记录 1 份；首片是样品，记录是数据不是物料。',
  },
];

export const DATA_ITEMS: readonly Item[] = [...EUV_FIRST_ARTICLE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...EUV_FIRST_ARTICLE_ROUTES];
