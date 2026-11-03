/**
 * RTA 均匀性套件 —— 16 区控制 + 逐灯微调 + 边缘补偿环 + 片自转。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么这三件一起上
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `plant/rta` 原来是 20 只灯一组、5 个灯区、片不动：
 *
 *   片内 ≤60 K（等温 ±8 K、坡上 ±30 K），判据 ±5 K
 *
 * 三个独立原因，缺一不可：
 *
 *   ① **分区**：24 只灯并成 16 区，每区一个可控硅 + 独立热电偶/高温计反馈；
 *   ② **边缘补偿**：φ200 片边缘的辐射损失比中心大，加一圈镀金/铝的环，
 *      把边缘的视角补回来；
 *   ③ **自转**：60 rpm 把残余的 2 次/4 次对称性抹掉，片内坡变成同心环。
 *
 * 三件都装进 `plant/rta` 的 `composedOf`；控制回路仍用 `plant/rta/pyrometer`
 * 的 1.55 µm 信号（±5–10 K）。
 *
 * ⚠️ 这只把 ≤60 K 压到约 **≤10 K**（6×），不是 ±5 K；±5 K 还要更细的
 * 区控（>16 区）与灯管老化补偿。功率已到 60 kW（R8 #10）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 片内 ±5 K 仍无实测路线（A 类：不可测，不是 B 类降级）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 16 区/逐灯微调/边缘环/自转只是执行器；片内到底几 K，本层**没有**读数。
 * 9 点路线已写在 `data/measure/rta-uniformity.ts`：9 支 K 型偶 + 18 根引线 +
 * 指零电位差计，逐支读三轮，只判 5–10 K 档，判不了 ≤5 K；49 点/98 路仍缺，
 * 所以 ≤5 K 仍按 A 类记。缺口四条：
 *
 *   ① **K 型条目已补，但不是标准 K。** `std/thermocouple-nicr-nial-general` 是
 *      NiCr 80/20 正极（本层电阻丝，碳 ~1.8%）+ NiAl 负极，1300–1372、
 *      氧化铝管；T 型仍只到 400。它的分度逐支不同，必须配
 *      `measure/thermocouple-cal` 三点标定，不能按标准 K 互换。
 *
 *   ② **没有 98 路滑环/旋转馈通。** 49 只 × 2 根 = 98 根引线；φ100 片周长
 *      314 mm，98 个边缘焊盘间距只有 3.2 mm。60 rpm 自转台只有一根转轴，
 *      本层没有 98 路滑环、旋转馈通或无线遥测 —— 49 点的走线过不了转台。
 *
 *   ③ **没有 49 路同时读数。** 本层只有 `std/millivoltmeter-general`（一只
 *      一只读），没有 49 路扫描开关/同步采样。RTA 的 1000–1050 °C 平台只有
 *      10 s 量级，一只表轮扫 49 s 以上，平台内读不完；9 点路线只能逐支读。
 *
 *   ④ **9 点是设计下限，不是 ≤5 K 的方案。** 3×3、35 mm 间距、角落
 *      r=49.5 mm；18 根引线、18 路滑环、9 只表 —— 仍要另做滑环与 9 只表，
 *      仍只能判 5–10 K 档（单支 K 型 ±2–5 K，max-min 误差上限是两支之和
 *      4–10 K）。5 点（中心 + 0/90/180/270）会把 4 次谐波混成共模，不建议再少。
 *
 *   所以 ≤5 K 仍是 A 类：9 点路线只判 5–10 K；要判 ≤5 K 得补 98 路滑环/
 *   馈通、49 路同步读数与 49 点片。`plant/rta` 的 `uniformity ≤5 K` 仍是
 *   设计窗口，不写“已测”。
 *
 * ⚠️ 就算以后补上，也还有三个“代表不了”：100 mm 片配 φ200 边缘环（外圈
 *   50 mm 空着，边缘补偿对 100 mm 片不起作用）；40 kW 长寿命阵 ≠ 60 kW
 *   基线阵（现场换装）；7×7 方阵的四个角 r≈49.5 mm 贴边（边缘排除通常
 *   3–5 mm），边中点只到 70% R，也不是按边缘优化的排布。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const RTA_UNIFORMITY_ITEMS: readonly Item[] = [
  /**
   * 16 区功率控制。16 路可控硅 + 16 路反馈 + 1 片控制板。
   *
   *   zones       16
   *   updateRate  10–100 Hz
   *   channels    16
   *   uniformity  5–8 K（16 区 5 K；8 区本地版 8 K）
   */
  {
    id: 'plant/rta/zone-control',
    name: '16 区功率控制',
    unit: '件',
    category: 'part',
    props: [
      { param: 'zones', kind: 'range', min: 1, max: 20, unit: '区' },
      { param: 'updateRate', kind: 'range', min: 1, max: 1000, unit: 'Hz' },
      { param: 'channels', kind: 'range', min: 1, max: 20, unit: '路' },
      { param: 'uniformity', kind: 'range', min: 0, max: 8, unit: 'K', dir: 'atMost' },
    ],
  },

  /**
   * 逐灯微调。24 路 0.9–1.1 的串联微调 + 24 路电流采样。
   *
   * 区控把 24 只灯并成 16 区；同一区里灯管老化不一样，靠逐灯微调把
   * 每只灯的电流差压到 <0.5 %，否则区控只能压到 ±10 K。
   */
  {
    id: 'plant/rta/lamp-trim',
    name: '逐灯微调机构',
    unit: '件',
    category: 'part',
    props: [
      { param: 'channels', kind: 'range', min: 1, max: 32, unit: '路' },
      { param: 'trimRange', kind: 'range', min: 0.8, max: 1.2, unit: '×' },
      { param: 'currentSense', kind: 'range', min: 0.1, max: 1, unit: '%', dir: 'atMost' },
    ],
  },

  /**
   * 边缘补偿环。φ200 片外一圈 10 mm 宽的镀金铝环，内径 190–210 mm。
   *
   *   reflectivity  0.80–0.95
   *   thickness     2–5 mm
   */
  {
    id: 'plant/rta/edge-ring',
    name: 'RTA 炉边缘补偿环',
    unit: '件',
    category: 'part',
    props: [
      { param: 'innerDiameter', kind: 'range', min: 150, max: 250, unit: 'mm' },
      { param: 'reflectivity', kind: 'range', min: 0.5, max: 1, unit: '1' },
      { param: 'thickness', kind: 'range', min: 1, max: 10, unit: 'mm' },
    ],
  },

  /**
   * 片自转台。60 rpm、φ200 承片盘、跳动 <50 µm；用机器人伺服 + 一对 P0 轴承。
   *
   *   speed   10–120 rpm
   *   wobble  ≤50 µm
   */
  {
    id: 'plant/rta/rotation-stage',
    name: 'RTA 炉片自转台',
    unit: '件',
    category: 'part',
    props: [
      { param: 'speed', kind: 'range', min: 0, max: 300, unit: 'rpm' },
      { param: 'wobble', kind: 'range', min: 0, max: 200, unit: 'µm', dir: 'atMost' },
    ],
  },

  /**
   * 98 路滑环（金刷-铜环）。60 rpm、98 通道，给 49 点热电偶片用。
   *
   *   channels          98
   *   speed             0–120 rpm
   *   contactResistance ≤0.5 Ω
   *   thermalNoise      ≤2 µV（设计估算，不是实测）
   *   insulation        ≥100 MΩ
   *
   * 它不是 49 点静态片的替代：静态片只测一列方位角，4 次谐波可能漏掉；
   * 滑环 + 自转才把方位角抹平。金刷对铜环的热电势是 µV 级，2 µV 是设计
   * 估算；真实噪声要跑起来量。
   */
  {
    id: 'plant/rta/slip-ring-98',
    name: '98 路滑环',
    unit: '件',
    category: 'part',
    props: [
      { param: 'channels', kind: 'range', min: 98, max: 98, unit: '路' },
      { param: 'speed', kind: 'range', min: 0, max: 120, unit: 'rpm' },
      { param: 'contactResistance', kind: 'range', min: 0, max: 2, unit: 'Ω', dir: 'atMost' },
      { param: 'thermalNoise', kind: 'range', min: 0, max: 10, unit: 'µV', dir: 'atMost' },
      { param: 'insulation', kind: 'range', min: 1, max: 1000, unit: 'MΩ', dir: 'atLeast' },
    ],
  },
];

export const RTA_UNIFORMITY_ROUTES: readonly Route[] = [
  {
    /**
     * **16 区控制：1 片控制板 + 16 只可控硅 + 2 片运放 + 铜线/铝盒。**
     *
     *   控制板 1 + 可控硅 16 + 运放 2 + 铜线 0.1 + 铝 0.5 → 16 区控制 1
     */
    id: 'make/rta-zone-control',
    name: '16 区功率控制制造',
    produces: [
      {
        item: 'plant/rta/zone-control',
        qty: q(1),
        gives: [
          { param: 'zones', kind: 'range', min: 16, max: 16 },
          { param: 'updateRate', kind: 'range', min: 10, max: 100 },
          { param: 'channels', kind: 'range', min: 16, max: 16 },
          { param: 'uniformity', kind: 'range', min: 0, max: 5, record: 'mat/rta-zone-control-measure-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/thyristor-general', qty: q(16) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 2) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
    rate: { hours: q(8) },
    unbalanced_zh:
      '控制板 1 + 可控硅 16 + 运放 2 + 铜线 0.1 + 铝 0.5 → 16 区控制 1；余是接线/散热片/外壳废料。控制板是种子件',
  },
  {
    /**
     * **逐灯微调：24 路串联电阻 + 24 路电流采样。**
     *
     *   电阻丝 0.5 + 氧化铝 1 + 铜线 0.2 + 运放 2 → 微调板 1
     */
    id: 'make/rta-lamp-trim',
    name: '逐灯微调机构制造',
    produces: [
      {
        item: 'plant/rta/lamp-trim',
        qty: q(1),
        gives: [
          { param: 'channels', kind: 'range', min: 24, max: 24 },
          { param: 'trimRange', kind: 'range', min: 0.9, max: 1.1 },
          { param: 'currentSense', kind: 'range', min: 0.1, max: 0.5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 5) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(2) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
    rate: { hours: q(8) },
    unbalanced_zh:
      '电阻丝 0.5 + 氧化铝 1 + 铜线 0.2 + 运放 2 → 微调板 1；余是骨架/接线/散热片废料。24 路 0.9–1.1、电流采样 0.1–0.5 %',
  },
  {
    /**
     * **边缘环：石英环 + 镀金铝反射面。**
     *
     *   石英 0.5 + 铝 0.2 + 金 0.005 → 边缘环 1
     */
    id: 'make/rta-edge-ring',
    name: 'RTA 炉边缘补偿环制造',
    produces: [
      {
        item: 'plant/rta/edge-ring',
        qty: q(1),
        gives: [
          { param: 'innerDiameter', kind: 'range', min: 200, max: 200 },
          { param: 'reflectivity', kind: 'range', min: 0.85, max: 0.95 },
          { param: 'thickness', kind: 'range', min: 3, max: 3 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/gold', qty: q(1, 200) }] },
    ],
    needs: [],
    performedBy: 'plant/sheet-shop',
    rate: { hours: q(8) },
    unbalanced_zh:
      '石英 0.5 + 铝 0.2 + 金 0.005 → 边缘环 1；余是切环/抛光/镀金废料。金 5 g 是反射面，不是结构',
  },
  {
    /**
     * **自转台：伺服 + 45 钢 + 铝盘 + 2 只 P0 轴承。**
     *
     *   伺服 1 + 45 钢 2 + 铝 1 + 轴承 2 → 自转台 1
     */
    id: 'make/rta-rotation-stage',
    name: 'RTA 炉片自转台制造',
    produces: [
      {
        item: 'plant/rta/rotation-stage',
        qty: q(1),
        gives: [
          { param: 'speed', kind: 'range', min: 10, max: 120 },
          { param: 'wobble', kind: 'range', min: 10, max: 50 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/robot/servo', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(2) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'std/bearing-general-p0', qty: q(2) }] },
    ],
    needs: [],
    performedBy: 'lathe',
    rate: { hours: q(8) },
    unbalanced_zh:
      '伺服 1 + 45 钢 2 + 铝 1 + 轴承 2 → 自转台 1；余是车削/动平衡去重。跳动 10–50 µm 靠车后动平衡，不靠磨',
  },
  {
    /**
     * **98 路滑环：铜环车削 → PTFE 隔套 → 金刷装配 → 98 路引线 → 动平衡。**
     *
     *   铜 0.5 + 金 0.02 + PTFE 0.2 + 不锈钢 0.3 → 滑环 1
     *
     * 金刷用 φ0.2 金丝（`mat/gold`，纯度 ≥90%），铜环节距 0.5 mm；98 路，
     * 接触电阻 ≤0.5 Ω、热电势噪声 ≤2 µV 是设计估算，不是实测。真实噪声
     * 必须在 60 rpm 下短路环读，读数另记。
     *
     * 历史顺序：49 点静态片（一列方位角）→ 本条滑环 + 自转（全档）。
     * 滑环的噪声如果压不到 µV 级，49 点片测到的 5–10 K 就被接触噪声吃掉，
     * 这一档不成立；所以先做滑环，再谈 2–3 K。
     */
    id: 'make/rta-slip-ring-98',
    name: '98 路滑环制造',
    produces: [
      {
        item: 'plant/rta/slip-ring-98',
        qty: q(1),
        gives: [
          { param: 'channels', kind: 'range', min: 98, max: 98 },
          { param: 'speed', kind: 'range', min: 0, max: 120 },
          { param: 'contactResistance', kind: 'range', min: 0.1, max: 0.5 },
          { param: 'thermalNoise', kind: 'range', min: 0.5, max: 2 },
          { param: 'insulation', kind: 'range', min: 100, max: 1000 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/gold', qty: q(1, 50) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(3, 10) }] },
    ],
    needs: ['std/wire-die-general', 'plant/metrology-room'],
    rate: { hours: q(16) },
    steps: [
      {
        note_zh: '车 98 道铜环（节距 0.5 mm）与 PTFE 隔套，压入不锈钢轴',
        performedBy: 'lathe',
      },
      {
        note_zh: '磨环面（Ra ≤0.4 µm），装金刷（φ0.2 金丝，预压 0.1–0.2 N）',
        performedBy: 'plant/grinder',
      },
      {
        note_zh: '焊 98 路引线，逐路测接触电阻与绝缘；60 rpm 动平衡',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '热电势噪声：短路环在 60 rpm 下读 µV 级噪声；2 µV 是设计估算，实测另记',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '铜 0.5 + 金 0.02 + PTFE 0.2 + 不锈钢 0.3 → 滑环 1；余是车屑/刷丝断头/绝缘切边。',
  },
  {
    /**
     * **区域控制的本地版：不吃运来的控制板。**
     *
     * 原路线用 `std/control-board-general` 做 16 区扫描；那条板是运来的，
     * 所以报告把 `make/rta-zone-control` 记成“只能用外购件”。本条换成
     * `std/process-controller-general`（本地能造）+ 8 只晶闸管，交同一个条目。
     *
     * 降级写在 `gives` 里：8 区（原 16）、8 路（原 16）、1–10 Hz（原 10–100 Hz）。
     * 后果：炉温均匀性只能到 8 区那一档，±5 K 的片内均匀性判据达不到；
     * 程序升温曲线只能按段恒功率走，没有按区闭环。这不是等价替代，是低一档。
     */
    id: 'make/rta-zone-control-local',
    name: '16 区功率控制制造',
    produces: [
      {
        item: 'plant/rta/zone-control',
        qty: q(1),
        gives: [
          { param: 'zones', kind: 'range', min: 8, max: 8, record: 'mat/rta-zone-record-8' },
          { param: 'updateRate', kind: 'range', min: 1, max: 10 },
          { param: 'channels', kind: 'range', min: 8, max: 8 },
          { param: 'uniformity', kind: 'range', min: 0, max: 8, record: 'mat/rta-zone-control-local-measure-record' },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/process-controller-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/thyristor-general', qty: q(8) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 2) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
    rate: { hours: q(8) },
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...RTA_UNIFORMITY_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...RTA_UNIFORMITY_ROUTES];
