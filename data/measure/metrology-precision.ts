/**
 * 量块 Ra、主轴周期误差、导轨直线度：三个记录与四条测量路线。
 *
 * 从 data/machine/metrology-precision.ts 迁入（R13）。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const DATA_ITEMS: readonly Item[] = [
  /**
   * Ra 记录。**一份记录 = 一块量块、3 条 × 5 点。**
   *
   * 属性是**读数窗口**，不是机器能力：`ra` 写 0.001–10（records 比机器宽，
   * 因为它记的是"这一块落在哪"），`verticalResolution`/`stylusRadius`/
   * `measuringForce` 是**测量条件**，必须与 `plant/stylus-profilometer` 的
   * 窗口一致，否则读数不可比。
   *
   * 与 `mat/gauge-block-ra-record`（光切法，只判"分辨到 0.1–0.4 µm"）是两份：
   * 那一份记的是"测不到"，这一份记的是"测到了 5–20 nm"。同一条量块上两份
   * 记录可以同时存在 —— 它们说的不是一件事（一份说量具的天花板，一份说读数）。
   */
  {
    id: 'mat/ra-profile-record',
    name: 'Ra 记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'ra', kind: 'range', min: 0.001, max: 10, unit: 'µm' },
      { param: 'cutoff', kind: 'range', min: 0.08, max: 8, unit: 'mm' },
      { param: 'evaluationLength', kind: 'range', min: 0.4, max: 40, unit: 'mm' },
      { param: 'verticalResolution', kind: 'range', min: 0, max: 0.1, unit: 'nm', dir: 'atMost' },
      { param: 'stylusRadius', kind: 'range', min: 1.8, max: 2.2, unit: 'µm' },
      { param: 'measuringForce', kind: 'range', min: 0.1, max: 1, unit: 'mN' },
      { param: 'uncertainty', kind: 'range', min: 0, max: 40, unit: '%', dir: 'atMost' }, // 主项：触针法本身（与 AFM 两法差 15–25 %）
    ],
  },

  /**
   * 主轴误差记录。**一份记录 = 一根主轴、一个转速、1–100 阶的幅值表。**
   *
   * 属性里的 `angularResolution`/`syncError` 是**测量条件**，必须与机器的
   * 窗口一致；`harmonicOrder` 是记录的阶数范围；`periodicError` 是
   * **单阶幅值**（不是总和）—— 100 阶合起来可能 0.5–2 µm，但每一阶只有
   * 0.02–0.5 µm，判据必须落在阶上，否则"总误差合格"会掩盖某一阶的共振。
   */
  {
    id: 'mat/spindle-error-record',
    name: '主轴误差记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'periodicError', kind: 'range', min: 0.02, max: 0.5, unit: 'µm' },
      { param: 'harmonicOrder', kind: 'range', min: 1, max: 100, unit: '阶' },
      { param: 'spindleSpeed', kind: 'range', min: 10, max: 3000, unit: 'rpm' },
      { param: 'angularResolution', kind: 'range', min: 0, max: 1, unit: '角秒', dir: 'atMost' },
      { param: 'syncError', kind: 'range', min: 0, max: 10, unit: 'µs', dir: 'atMost' },
      { param: 'uncertainty', kind: 'range', min: 0, max: 10, unit: '%', dir: 'atMost' }, // 主项：角度基准自校 + 4 的倍数阶未分离；读数换 std/autocollimator-precision 后 3–5 %
    ],
  },

  /**
   * 导轨直线度记录。**一份记录 = 一根导轨、一个行程、一条残差曲线。**
   *
   * `straightness` 是**去掉端点连线之后的残差**（ISO 1101 的"直线度"，不是
   * "斜率"）—— 所以两端永远为 0，中间的最大偏离才是判据。
   */
  {
    id: 'mat/guideway-straightness-record',
    name: '导轨直线度记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'straightness', kind: 'range', min: 0.5, max: 20, unit: 'µm/m', dir: 'atMost' },
      { param: 'travel', kind: 'range', min: 1000, max: 3000, unit: 'mm', dir: 'atLeast' },
      { param: 'uncertainty', kind: 'range', min: 0, max: 0.2, unit: 'µm/m', dir: 'atMost' }, // 主项：1 m 原器 0.15–0.2 µm/m + 翻转法（原 0.3–1）
      { param: 'detectorResolution', kind: 'range', min: 0, max: 0.2, unit: 'µm', dir: 'atMost' },
    ],
  },
];

export const DATA_ROUTES: readonly Route[] = [
  {
    /**
     * **测量：轮廓仪读量块 Ra → Ra 记录。**
     *
     *    量块（uses，被量但不消耗）→ Ra 记录 1 份
     *
     * 交付窗口：ra 0.005–0.02 µm、λc 0.08–0.25 mm、评长 0.4–1.25 mm、
     * 垂直 0.1 nm、R 1.8–2.2 µm、测力 0.1–1 mN。
     *
     * 为什么给的是 0.005–0.02 而不是 0.005–10：**量块工作面的实际 Ra 就在
     * 这一档**（研合要 Ra ≤0.01 µm 才有那层几十纳米的吸附膜）。10 µm 那端
     * 是仪器的量程，不是量块的读数 —— 两个窗口分开写，`ra` 的窗口才是判据。
     *
     * 一条量块上采 3 条 × 5 点：Ra 的验收按 ISO 4288 取 3 条的平均，
     * 单条散布 10–20 % 是研磨面的常态。
     */
    id: 'measure/gauge-block-ra-profile',
    name: 'Ra 测量',
    produces: [
      {
        item: 'mat/ra-profile-record',
        qty: q(1),
        gives: [
          { param: 'ra', kind: 'range', min: 0.005, max: 0.02 },
          { param: 'cutoff', kind: 'range', min: 0.08, max: 0.25 },
          { param: 'evaluationLength', kind: 'range', min: 0.4, max: 1.25 },
          { param: 'verticalResolution', kind: 'range', min: 0.1, max: 0.1 },
          { param: 'stylusRadius', kind: 'range', min: 1.8, max: 2.2 },
          { param: 'measuringForce', kind: 'range', min: 0.1, max: 1 },
          { param: 'uncertainty', kind: 'range', min: 15, max: 25 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'plant/gauge-block/block', qty: q(1) }] }],
    needs: ['plant/metrology-room', 'std/step-standard-0.1nm'],
    rate: { hours: q(2) },
    steps: [
      { note_zh: '装触针与测力：量块与仪器在 19–21 °C 里同温 24 h 之后（测前 30 min 不开门）；测力 0.1–1 mN（软表面走 0.1，淬硬钢走 0.5），R 1.8–2.2 µm', performedBy: 'plant/stylus-profilometer', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '先扫台阶标准件 0.08–0.1 nm，验 Z 轴 0.1 nm 没漂', performedBy: 'plant/stylus-profilometer', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '扫量块：3 条 × 5 点，λc 0.08/0.25 mm、评长 5λc；避开倒角与研合面边缘 2 mm', performedBy: 'plant/stylus-profilometer', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '算 Ra（3 条平均）与散布；写记录，注明测量力与尖端半径（换针读数不可比）', performedBy: 'plant/robot' },
    ],
  },

  {
    /**
     * **测量：车床主轴每转周期误差 → 记录。**
     *
     *    车床主轴（uses，被量但不消耗）→ 记录 1 份
     *
     * 转速 100–1500 r/min、1024 点/转、30 转平均。判据是**每一阶**的幅值
     * 0.05–0.5 µm：0.05 µm 端是**判据下限**（探头噪声 0.05 nm，30 转平均后
     * 0.002 µm —— 噪声不是瓶颈，小到 0.05 µm 以下就和探头漂移分不开），
     * 0.5 µm 端是 P5 主轴 + 卡盘的常见值。比 `measure/lathe-spindle-runout` 的
     * 2–5 µm 跳动小一个量级 —— **两者不是同一件事**：跳动是包络，这是谱。
     */
    id: 'measure/lathe-spindle-periodic-error',
    name: '主轴误差测量',
    produces: [
      {
        item: 'mat/spindle-error-record',
        qty: q(1),
        gives: [
          { param: 'periodicError', kind: 'range', min: 0.05, max: 0.5 },
          { param: 'harmonicOrder', kind: 'range', min: 1, max: 100 },
          { param: 'spindleSpeed', kind: 'range', min: 100, max: 1500 },
          { param: 'angularResolution', kind: 'range', min: 0.1, max: 0.5 },
          { param: 'syncError', kind: 'range', min: 0.1, max: 1 },
          { param: 'uncertainty', kind: 'range', min: 3, max: 5 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'lathe/spindle', qty: q(1) }] }],
    needs: ['plant/metrology-room', 'std/angle-standard'],
    rate: { hours: q(4) },
    steps: [
      { note_zh: '空转 60 min 到热平衡（19–21 °C 计量间）', performedBy: 'lathe', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '装夹具与光盘：定心 ≤5 µm；0°/180° 两次安装各测一遍', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '装探头：径向 R=50 mm、端面 10 mm；间隙 20–50 µm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '采样：1024 点/转 × 30 转，100–1500 r/min（1.7–25.6 kS/s），同步 ≤1 µs', performedBy: 'plant/spindle-error-analyzer', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: 'FFT 1–100 阶：首阶用双头平均 + 两次安装平均消偏心；4 的倍数阶标"未分离"', performedBy: 'plant/robot' },
      { note_zh: '写记录：注明角度基准是自校（闭合 + 双头 + 多步），不是角度原器', performedBy: 'plant/robot' },
    ],
  },

  {
    /**
     * **测量：磨床主轴每转周期误差 → 记录。**
     *
     *    磨床头架/砂轮主轴（uses）→ 记录 1 份
     *
     * 磨床转速高（1000–3000 r/min），100 阶在 3000 r/min 上是 5 kHz，
     * 正好是探头 1–10 kHz 带宽的中段。判据 0.02–0.3 µm：磨削把主轴误差
     * **复印**到工件上（砂轮与工件是刚性接触），所以它比车床那根更值钱。
     */
    id: 'measure/grinder-spindle-periodic-error',
    name: '主轴误差测量',
    produces: [
      {
        item: 'mat/spindle-error-record',
        qty: q(1),
        gives: [
          { param: 'periodicError', kind: 'range', min: 0.02, max: 0.3 },
          { param: 'harmonicOrder', kind: 'range', min: 1, max: 100 },
          { param: 'spindleSpeed', kind: 'range', min: 1000, max: 3000 },
          { param: 'angularResolution', kind: 'range', min: 0.1, max: 0.5 },
          { param: 'syncError', kind: 'range', min: 0.1, max: 1 },
          { param: 'uncertainty', kind: 'range', min: 3, max: 5 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'plant/grinder/spindle', qty: q(1) }] }],
    needs: ['plant/metrology-room', 'std/angle-standard'],
    rate: { hours: q(4) },
    steps: [
      { note_zh: '空转 60 min 热平衡；砂轮拆下（不平衡量会掩盖 0.02 µm）', performedBy: 'plant/grinder', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '装夹具与光盘：定心 ≤5 µm；0°/180° 两次安装', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '装探头：径向 R=40 mm；间隙 20–50 µm', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '采样：1024 点/转 × 30 转，1000–3000 r/min（17–51 kS/s）；100 阶 5 kHz 在 25.6 kHz 奈奎斯特内', performedBy: 'plant/spindle-error-analyzer', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: 'FFT 1–100 阶，写记录；注明 4 的倍数阶未分离', performedBy: 'plant/robot' },
    ],
  },

  {
    /**
     * **测量：车床床身导轨直线度 → 记录。**
     *
     *    车床床身（uses，被量但不消耗）→ 记录 1 份
     *
     * 床身 2 m、780 kg（`lathe/base`）。行程 1000–2000 mm，步距 100 mm，
     * 20 点；去掉端点连线后的最大偏离就是直线度（0.5–2 µm/m）。
     *
     * 判据为什么有 2 这一端：2 m 的铸铁床身在 19–21 °C 里，上下表面差
     * ΔT = 0.2–0.5 K 就有 κL²/8 = (αΔT/t)L²/8 = **3–9 µm 的弓**
     * （α = 11.5 ppm/K、L = 2 m、t = 0.3 m）—— **测的是温度，不是直线度**。
     * 恒温间能给的只是空气温度；床身要放 24 h 让芯部同温（780 kg 的
     * 时间常数 10–20 h）。这一条写进记录的条件里，不写成"已消除"。
     */
    id: 'measure/lathe-bed-straightness',
    name: '导轨直线度测量',
    produces: [
      {
        item: 'mat/guideway-straightness-record',
        qty: q(1),
        gives: [
          { param: 'straightness', kind: 'range', min: 0.5, max: 2 },
          { param: 'travel', kind: 'range', min: 1000, max: 2000 },
          { param: 'uncertainty', kind: 'range', min: 0.15, max: 0.2 },
          { param: 'detectorResolution', kind: 'range', min: 0.1, max: 0.2 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'lathe/base', qty: q(1) }] }],
    needs: ['plant/metrology-room', 'std/straightness-standard-1m'],
    rate: { hours: q(6) },
    steps: [
      { note_zh: '架激光头：床身已在 19–21 °C 静置 24 h（780 kg，时间常数 10–20 h，芯部与表面同温才测）；光束与导轨平行 ≤1 mm/m，距导轨面 50–100 mm（减小空气梯度的影响）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '走 20 点（步距 100 mm）：靶座每点停 10 s，四象限读质心；同一点往返各一次', performedBy: 'plant/laser-straightness', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '翻转 180° 再走一遍：平均消光束弯曲；两次之差的一半记为仪器不确定度', performedBy: 'plant/laser-straightness', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '去端点连线取残差（ISO 1101 直线度），写记录；附温度梯度实测值（0.1–0.5 K/m）', performedBy: 'plant/robot' },
      { note_zh: '⑤ 每 200 mm 与 std/straightness-standard-1m 比对：逐段残差 ≤0.2 µm/m（原器 U 0.15–0.2，翻转法），超差就重测该段', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },
];
