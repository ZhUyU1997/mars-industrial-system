/**
 * high-NA EUV 的量测链 —— 三条记录：可见光干涉的底、at-wavelength 的差、2.7 nm 套刻的口径。
 *
 * 这份文件只放 `measure/*` 路线与 `*-record` 条目（R13）。造镜、造机在
 * `data/machine/euv-hina.ts`，这里只回答「量到哪一档、差多少」。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、三把尺，三个数
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① `plant/ref-flat-interferometer`（可见光 515.3 nm，多光束 ℱ = 25）
 *      resolution **0.52 nm**、figure **0.52 nm**、aperture **300 mm**。
 *      这是本层可见光干涉的闭环底；它的 `props` 以前没有任何交付路线，
 *      本文件把 `make/ref-flat-interferometer`（装配）与这条校准路线接上。
 *
 *   ② `plant/interferometer`（钠 589.0 nm，Fizeau）
 *      只读 1/20 条 = **15 nm**。所以「钠光/干涉法」这一档的天花板是 15 nm，
 *      不是 0.52 nm；0.52 是多光束锐化 + 配对后的特例。
 *
 *   ③ `plant/euv-stepper-hina/atw-interferometer`（13.5 nm）
 *      resolution/figure/roughness **0.1 nm**、aperture **660 mm**（设计值）。
 *      与 ① 的差距：0.52 / 0.1 = **5.2 倍**；与钠光的 15 nm 差 **150 倍**。
 *      更本质的差别不是倍数：可见光测的是**裸基板**，at-wavelength 测的是
 *      **镀完 50 对膜的工作面**（13.5 nm 的相位穿透深度在膜里，不在表面）。
 *      它的**验收记录**（figure 0.10–0.25 nm、roughness 0.08–0.20 nm、
 *      φ300–660、U 0.11–0.15）在 `data/measure/euv-atw.ts` —— 0.1 是设计值，
 *      0.25 才是这批镜子的判据；本文件只留量具与判据，不重复记读数。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、为什么 0.52 nm 不能靠「多测几次」到 0.1 nm
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   随机项可以 √N 平均；**系统项不行**。`ref-flat.ts` 已经算过：0.52 nm 是
 *   「参考面自己的面形精度」，测工件时系统误差被基准锁在 0.52 nm，随机项
 *   0.47 nm（八帧移相）。把 100 次读数平均，随机项掉到 0.047 nm，系统项还是
 *   0.52 nm —— 差 5.2 倍的那一格不会动。
 *
 *   要动它只有两条：更短的波长（13.5 nm，本文件的 at-wavelength 路线），
 *   或更大的 ℱ（介质多层膜，`ref-flat.ts` 降级②：本层 `plant/euv-coater`
 *   只镀金属，没有氧化物靶 + 氧分压控制）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、套刻：2.7 nm 是「机内」，不是「可溯源」
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   本文件 `measure/euv-hina-overlay` 用高-NA 整机自己的对准传感器读两层
 *   之间的偏移，交 `overlay ≤2.7 nm`。这是**机内重复性**：
 *
 *   · 它证明「这台机器的台 + 对准 + 标记能重复到 2.7 nm」；
 *   · 它不证明「图形相对前一层真的只有 2.7 nm」—— 标记零点与图形零点之间
 *     1 nm 的基准传递、掩模写的误差、刻蚀/沉积的图形漂移，都不在这条路线里。
 *
 *   可溯源套刻要一台独立的 DBO（衍射式套刻量测）或亚纳米插值 CD-SEM；
 *   本层两样都没有。缺的是**一台量具**，不是整条 8 nm 链的终止条件。
 *   这条量具的缺口按 R7 记在这里：点距 ≤30 nm、不确定度 ≤0.5 nm、
 *   可溯源到 `plant/gauge-block`；本层 CD-SEM 的 vernier 只到 0.1 µm（差 200 倍）。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、记录条目
// ═══════════════════════════════════════════════════════════════════════════

export const EUV_HINA_MEASURE_ITEMS: readonly Item[] = [
  /**
   * **λ/1000 绝对检验干涉仪的校准记录。**
   *
   *   resolution 0.52 nm    多光束 ℱ = 25 的读出（`ref-flat.ts` 第二节）
   *   figure     0.52 nm    参考面自己的面形（闭环）
   *   aperture   300 mm     φ300 不拼接
   *
   * 这三个数以前只写在 `plant/ref-flat-interferometer` 的注释里，没有任何
   * 路线交付；本条目把「这台仪器实际到哪一档」变成一份可查的记录。
   *
   * ⚠️ 它**不是** at-wavelength 的读数：0.1 nm 那一档在本层的可见光路线上
   * 不存在（0.52 / 0.1 = 5.2 倍），见文件头第一节。
   */
  {
    id: 'mat/ref-flat-cal-record',
    name: 'λ/1000 绝对检验干涉仪的校准记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'resolution', kind: 'range', min: 0, max: 10, unit: 'nm', dir: 'atMost' },
      { param: 'figure', kind: 'range', min: 0, max: 10, unit: 'nm rms', dir: 'atMost' },
      { param: 'aperture', kind: 'range', min: 0, max: 1000, unit: 'mm', dir: 'atLeast' },
    ],
  },

  /**
   * **high-NA 套刻记录（2.7 nm 档）。**
   *
   *   overlay   0–2.7 nm   机内重复性；不是可溯源套刻（见文件头第三节）
   *   points    10         每片 10 点，X/Y 各一组
   *   waferId   号
   *   method    euv-dbo    机内干涉式对准读相位；不是独立 DBO 量测机
   *
   * 它与 `mat/overlay-record`（`cmos.ts`，±0.6 µm、cd-sem）是两个件：
   * 那一条量的是 560 nm 档，这一条量的是 2.7 nm 档，**不共用一个 id**。
   */
  {
    id: 'mat/overlay-record-hina',
    name: 'high-NA 套刻记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'overlay', kind: 'range', min: 0, max: 10, unit: 'nm', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 100, unit: '个' },
      { param: 'waferId', kind: 'range', min: 0, max: 1000, unit: '号' },
      { param: 'method', kind: 'enum', values: ['euv-dbo'] },
    ],
  },

  /**
   * **可溯源套刻的资格记录条目（能力域，不是读数）。**
   *
   *   overlayX/Y   0–10 nm   这是 DBO 的量程，不是某台机器测出来的 2.7
   *   uncertainty  0–2 nm    产线 DBO 的 U 域（实际 0.3–0.5）
   *   points       1–100     每片点数
   *   method       dbo        独立 DBO
   *
   * 它只记录“这条资格程序能读到哪一档”。要把 8 nm 后道的 2.7 写实，必须在
   * 具体机器上跑出 10 点读数，再把本条的 props 收窄到那一组；在此之前，
   * `make/euv-hina` 的 overlay 仍是 design。
   */
  {
    id: 'mat/overlay-qual-record',
    name: '可溯源套刻的资格记录条目记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'overlayX', kind: 'range', min: 0, max: 10, unit: 'nm', dir: 'atMost' },
      { param: 'overlayY', kind: 'range', min: 0, max: 10, unit: 'nm', dir: 'atMost' },
      { param: 'uncertainty', kind: 'range', min: 0, max: 2, unit: 'nm', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 100, unit: '个' },
      { param: 'method', kind: 'enum', values: ['dbo'] },
    ],
  },

  /**
   * 8 nm 首片的产品套刻资格记录。**从能力域 0–10 收窄到 8 nm 后道门 2.7 nm。**
   *
   *   overlayX/Y   0–2.7 nm   10 点 X/Y 的合格判定窗口（不是单次读数）
   *   uncertainty  0–0.5 nm   U(k=2)，来自 `mat/overlay-traceable-record` 的链预算
   *   points       10         每片 10 点，X/Y 各一组
   *   method       dbo        独立 DBO（`plant/overlay-metrology`），不是整机自己的对准传感器
   *
   * 收窄依据：`measure/euv-hina-product-overlay` 用独立 DBO + `std/overlay-standard-005`
   * 校零，读首片 10 点；读数落在 ≤2.7 才写这一档。窗口是**合格判定**，
   * 不是某一次读数；单次读数要在真跑后另行收窄（R12：记录窗口 ⊆ 设计窗口）。
   */
  {
    id: 'mat/overlay-product-record',
    name: '8 nm 首片的产品套刻资格记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'overlayX', kind: 'range', min: 0, max: 2.7, unit: 'nm', dir: 'atMost' },
      { param: 'overlayY', kind: 'range', min: 0, max: 2.7, unit: 'nm', dir: 'atMost' },
      // 与交付方 give 的 `overlay` 同名：X/Y 合成后的合格判定窗口。
      { param: 'overlay', kind: 'range', min: 0, max: 2.7, unit: 'nm', dir: 'atMost' },
      { param: 'uncertainty', kind: 'range', min: 0, max: 0.5, unit: 'nm', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 1, max: 100, unit: '个' },
      { param: 'method', kind: 'enum', values: ['dbo'] },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、测量路线
// ═══════════════════════════════════════════════════════════════════════════

export const EUV_HINA_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **可见光绝对检验干涉仪的校准：0.52 nm 的底，量给 `plant/ref-flat-interferometer`。**
     *
     *   水 1 kg → 校准记录 1 份（resolution 0.52、figure 0.52、aperture 300）
     *
     * 四步（`ref-flat.ts` 的现成手艺）：
     *
     *   ① 钠光 Fizeau（`plant/interferometer`，589.0 nm）：数 1/20 条 = 15 nm，
     *      只够判「有没有大错」；
     *   ② 多光束 F-P（515.3 nm，ℱ = 25）：参考面 + 对面板都镀铝，读 0.52 nm；
     *   ③ 八帧移相（`plant/phase-shifter`）：随机项 0.47 nm，与 0.52 独立旁证；
     *   ④ 液面基准（`plant/ref-flat-interferometer/trough`）：φ300 的球面项 3 nm。
     *
     * 交付的是 0.52 nm —— **不是 0.1 nm**。差的 5.2 倍见文件头第一节。
     */
    id: 'measure/ref-flat-interferometer-cal',
    name: '可见光绝对检验干涉仪的校准',
    produces: [
      {
        item: 'mat/ref-flat-cal-record',
        qty: q(1),
        gives: [
          { param: 'resolution', kind: 'range', min: 0.52, max: 0.52 },
          { param: 'figure', kind: 'range', min: 0.52, max: 0.52 },
          { param: 'aperture', kind: 'range', min: 300, max: 300 },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/water', qty: q(1) }] }],
    needs: [
      {
        item: 'plant/ref-flat-interferometer',
        qty: q(1),
        need: [
          { param: 'measure/resolution', kind: 'range', min: 0.52, max: 0.52 },
          { param: 'measure/figure', kind: 'range', min: 0.52, max: 0.52 },
          { param: 'measure/aperture', kind: 'range', min: 300, max: 300 },
        ],
        onRelax: 'functional-kept',
      },
      'plant/metrology-room',
      'plant/stabilized-laser',
      'plant/laser-stage',
    ],
    rate: { hours: q(12) },
    steps: [
      {
        note_zh:
          '① 钠光 Fizeau：589.0 nm 平晶，读 1/20 条 = 15 nm；只判大错，不进 0.52 的账',
        performedBy: 'plant/interferometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 多光束 F-P：515.3 nm、参考面与对面板同料同厚，ℱ = 25 → 0.52 nm；两镜都要镀铝 100 nm',
        performedBy: 'plant/ref-flat-interferometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 八帧移相：石英压电堆 λ/8 步进，随机项 0.47 nm；与 0.52 独立旁证',
        performedBy: 'plant/phase-shifter',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '④ 液面基准：φ400 槽静置 3 h，φ300 上的球面项 3 nm；写记录：0.52 nm 是闭环底，0.1 nm 不在可见光这一档',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
  },

  {
    /**
     * **at-wavelength 验收：把 0.15 nm 的镜子读到 0.1 nm（六格里只判三格）。**
     *
     *   投影镜 1（figure ≤0.15）→ 投影镜 1（figure ≤0.1，验收）
     *
     * ⚠️ **`gives` 比 `uses` 紧，不是「测量改变了镜子」，是验收**：真值没变，
     * 变的是「我们知道的精度」。真值若在 0.1 nm 之外，它在这里被**判掉**。
     * 与 `measure/collector-stitch-subnm` 同一个性质。
     *
     * ⚠️ **六格里只有三格是这台仪器量的**：aperture、figure、roughness。
     * `plant/euv-stepper-hina/atw-interferometer` 读的是 13.5 nm 的**相位**：
     * 它没有功率通道（读不了绝对反射率），也没有膜层周期的读数。以前
     * `period` / `reflectivity` 两格照抄镀膜窗口写在这里 —— 那是**表格填满**，
     * 不是读数，measure 能力检查因此在这条路线上多报两条缺口（机器的 props
     * 里没有这两个量）。现在把它们**改成空窗口**（不限 = 这条路线不判这两格），
     * 量具另指：
     *
     *   · 反射率 68–70 %：`plant/euv-reflectometer` 的双镜互测
     *     （`measure/euv-mirror-mutual` 的同一手艺，±0.3 %），以及镀膜工位自己的
     *     初检步（`make/euv-hina-mirror` 的最后一步）。这台干涉仪不读它。
     *   · 周期 6.85–6.95 nm：镀膜工位的参数。原位靠 QCM（`plant/film-monitor`
     *     5 MHz 基频，σ ≈ 0.024 nm，`make/euv-mirror-300-monitored` 的数），
     *     镀后靠 XRR 的布拉格峰（地球的独立量具，0.01 nm 档）或反射计的 2θ 峰位
     *     （11.9°，0.02° 角分辨 → 0.0005 nm）。这台干涉仪也不读它。
     *
     * 空窗口仍满足 `prop_missing_gives`（声明了就必须回答，「不限」也是回答），
     * 也仍满足 measure 的记录覆盖（空窗口跳过）。`uses` 里原来那两条要求
     * （reflectivity ≥68、period 6.85–6.95）一并删了：**量不了就不该提要求** ——
     * 那两条判据在 `make/euv-hina-mirror` 的 gives 与 `make/euv-hina-optics-module`
     * 的 need 上，本路线只判 figure / roughness（外加结构性计数 pairs=50）。
     *
     * 量具是它自己（`steps[].performedBy`），它不产出自己，不构成自指；
     * 它在 `needs` 里没有（旧注释说「在 needs 里」，那一句写错了）。
     *
     * 验收的**记录**在 `data/measure/euv-atw.ts`：`mat/atw-figure-record`
     * 写清 figure 实际落在 0.10–0.25 nm、roughness 0.08–0.20 nm、口径 φ300–660。
     */
    id: 'measure/euv-hina-atw-figure',
    name: '镀完 50 对 Mo/Si 的投影镜测量',
    produces: [
      {
        item: 'plant/euv-stepper-hina/mirror',
        qty: q(1),
        gives: [
          { param: 'aperture', kind: 'range', min: 660, max: 660 },
          { param: 'figure', kind: 'range', min: 0, max: 0.1 },
          { param: 'roughness', kind: 'range', min: 0, max: 0.1 },
          // 本路线只测 figure/roughness；period/reflectivity 不在这里测，
          // 按“声明了就必须交付”留空窗口，不挂 record、不声称读数。
          // 真实测量见 measure/euv-hina-mirror-measure。
          { param: 'period', kind: 'range' },
          { param: 'pairs', kind: 'range', min: 50, max: 50 },
          { param: 'reflectivity', kind: 'range' },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'plant/euv-stepper-hina/mirror',
            qty: q(1),
            // `need` 只留这台仪器**真能判**的两条（figure / roughness）+ 结构性
            // 计数 pairs。period / reflectivity 的要求删了：它量不了就不该提要求 ——
            // 那两条判据在 `make/euv-hina-mirror` 的 gives 与
            // `make/euv-hina-optics-module` 的 need 上，本路线不重复判。
            need: [
              { param: 'figure', kind: 'range', max: 0.15, dir: 'atMost' },
              { param: 'roughness', kind: 'range', max: 0.1, dir: 'atMost' },
              { param: 'pairs', kind: 'range', min: 50, max: 50 },
            ],
            onRelax: 'functional-kept',
          },
        ],
      },
    ],
    needs: [
      'plant/euv-source',
      'plant/euv-vacuum',
      'plant/metrology-room',
      'plant/clean-room',
      'plant/phase-shifter',
      'plant/laser-stage',
    ],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh:
          '① 装镜：φ660 三点支撑，与检测时的支撑点一致；13.5 nm 腔抽到 1e-5 Pa',
        performedBy: 'plant/robot',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-5 }],
      },
      {
        note_zh:
          '② 8 帧移相读 13.5 nm 条纹：2001×2001 网格，figure/roughness 两格各取 5 点',
        performedBy: 'plant/euv-stepper-hina/atw-interferometer',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-5 }],
      },
      {
        note_zh:
          '③ 判：figure ≤0.1、roughness ≤0.1；超差退回 IBF 再修（不是重做整块）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '投影镜 1 进、1 出；非破坏验收，质量不变。0.1 nm 是 at-wavelength 的设计值，不是可见光 0.52 nm 的读数（两者差 5.2 倍，见文件头）；实际验收读数落在 0.10–0.25 nm，记录在 `data/measure/euv-atw.ts`。',
  },

  {
    /**
     * **high-NA 套刻：两层之间读 2.7 nm（机内口径）。**
     *
     *   硅片 1 + 胶 1 + 氢氟酸 0.1 + 水 1 → 套刻记录 1 份（overlay ≤2.7 nm）
     *
     * 做法与 `measure/euv-overlay`（560 nm 档）同形，换三样：
     *   ① 整机换成 `plant/euv-stepper-hina`（26×16.5 单场，一颗 10×10 die）；
     *   ② 对准用整机自己的 0.5 nm 传感器，不用 CD-SEM 的 0.1 µm vernier；
     *   ③ 记录的窗口是 2.7 nm，不是 0.6 µm。
     *
     * ⚠️ 这是**机内重复性**：它证明台 + 对准 + 标记能重复到 2.7 nm；
     * 它不证明图形相对前一层真的只有 2.7 nm。可溯源套刻缺一台独立 DBO/
     * 亚纳米 CD-SEM，见文件头第三节。
     */
    id: 'measure/euv-hina-overlay',
    name: 'high-NA 套刻测量',
    produces: [
      {
        item: 'mat/overlay-record-hina',
        qty: q(1),
        gives: [
          { param: 'overlay', kind: 'range', min: 0, max: 2.7 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
          { param: 'waferId', kind: 'range', min: 1, max: 1 },
          { param: 'method', kind: 'enum', oneOf: ['euv-dbo'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: [
      'plant/euv-source',
      'plant/euv-vacuum',
      'plant/euv-pulser',
      'plant/clean-room',
      'plant/metrology-room',
    ],
    rate: { hours: q(4) },
    steps: [
      {
        note_zh:
          '① 涂胶：2 500 rpm、0.2 µm；第一层曝光（26×16.5 单场，一次一颗 10×10 die）',
        performedBy: 'plant/euv-stepper-hina',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-5 }],
      },
      {
        note_zh:
          '② 显影 + HF 蚀 122 nm 固定第一层标记；第二层再曝同一场，靠 0.5 nm 对准传感器对位',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 读 10 点 X/Y 偏移：判 2.7 nm（机内重复性）；写记录并注明「不是可溯源套刻」',
        performedBy: 'plant/euv-stepper-hina',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-5 }],
      },
    ],
    unbalanced_zh:
      '硅片 1 + 胶 1 + 氢氟酸 0.1 + 水 1 → 套刻记录 1 份；测试片是一次性的，记录是数据不是物料。2.7 nm 是机内窗口，可溯源量具仍缺。',
  },

  {
    /**
     * **high-NA 套刻的可溯源资格程序：把机内 2.7 nm 接到标准片与独立 DBO 上。**
     *
     * 这是程序，不是读数。输出是 DBO 的能力域：
     *   overlayX/Y   0–10 nm     量程，不是这台机器测出来的 2.7
     *   uncertainty  0.3–0.5 nm  产线 DBO（`plant/overlay-metrology`）的 U
     *   points       10           每片 10 点，X/Y 各一组
     *   method       dbo          独立 DBO，不是整机自己的对准传感器
     *
     * 历史路径：193 nm 的 vernier/CD-SEM 只到 560/43 nm 档；要把 8 nm 后道
     * 的 2.7 nm 每层门写出来，必须先有一台能读到亚纳米的独立 DBO，再用
     * 标准片把零点、掩模写入、刻蚀后的图形漂移拆开。这条路线就是那一拆。
     *
     * 跑完这条路线，记录窗口仍是 0–10；要收窄到 2.7，必须在具体机器上真跑
     * 一组 10 点，把记录条目的 props 改成那一组读数。程序写完不等于测完。
     */
    id: 'measure/euv-hina-overlay-qual',
    name: '可溯源套刻的资格记录条目测量',
    produces: [
      {
        item: 'mat/overlay-qual-record',
        qty: q(1),
        gives: [
          { param: 'overlayX', kind: 'range', min: 0, max: 10 },
          { param: 'overlayY', kind: 'range', min: 0, max: 10 },
          { param: 'uncertainty', kind: 'range', min: 0.3, max: 0.5 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
          { param: 'method', kind: 'enum', oneOf: ['dbo'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: [
      'std/overlay-standard',
      'std/overlay-standard-005',
      'std/overlay-vernier-general',
      'plant/euv-source',
      'plant/euv-vacuum',
      'plant/euv-pulser',
      'plant/clean-room',
      'plant/metrology-room',
    ],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh:
          '① 涂胶 0.2 µm；用 std/overlay-vernier-general 掩模曝第一层 vernier（26×16.5 单场，10×10 die）',
        performedBy: 'plant/euv-stepper-hina',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-5 }],
      },
      {
        note_zh: '② 显影 + HF 蚀 122 nm，固定第一层标记；刻蚀后的图形漂移从此进账',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 同一场再曝第二层，偏移 0/2/5/10 nm；两次曝光之间不换掩模，掩模写入是共模',
        performedBy: 'plant/euv-stepper-hina',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-5 }],
      },
      {
        note_zh:
          '④ 独立 DBO 读 10 点 X/Y：先用 std/overlay-standard-005 校零，再读掩模标记，把掩模写入从整机误差里拆出',
        performedBy: 'plant/overlay-metrology',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '⑤ 写能力域：overlayX/Y 0–10、U 0.3–0.5；这不是 2.7 的读数，收窄记录必须在具体机器上真跑',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '硅片 1 + 胶 1 + 氢氟酸 0.1 + 水 1 → 资格记录 1 份；测试片一次性，记录是数据不是物料。0–10 是能力域，不是读数。',
  },
  {
    /**
     * **产品掩模的测试片套刻：不是 vernier 掩模，是真正的 32 nm 掩模。**
     *
     * 与上一条的区别只有掩模：上一条用 `std/overlay-vernier-general` 的
     * 专用标记，这一条用 `std/euv-mask-32nm` 自己的对位标记。测试片仍是
     * 硅片，不是 8 nm 产品片；所以它证明“掩模 + 整机 + DBO”这条链能读，
     * 不证明产品片真的 2.7 nm。
     *
     * 步骤：曝第一层（产品掩模）→ 显影/HF 固定标记 → 同一场再曝第二层
     * （偏移 0/2/5/10 nm）→ 独立 DBO 读 10 点、标准片校零 → 写能力域
     * `overlayX/Y 0–10`、`U 0.3–0.5`。
     *
     * ⚠️ 32 nm 掩模已经贴 pellicle；曝光时 pellicle 在光路里，透射损失
     * 0.6–0.85 会拉长曝光时间，不改变套刻读数。产品片的 2.7 记录仍要在
     * 8 nm 产品片上真跑，不能拿测试片顶。
     */
    id: 'measure/euv-hina-product-overlay-qual',
    name: '可溯源套刻的资格记录条目测量',
    produces: [
      {
        item: 'mat/overlay-qual-record',
        qty: q(1),
        gives: [
          { param: 'overlayX', kind: 'range', min: 0, max: 10 },
          { param: 'overlayY', kind: 'range', min: 0, max: 10 },
          { param: 'uncertainty', kind: 'range', min: 0.3, max: 0.5 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
          { param: 'method', kind: 'enum', oneOf: ['dbo'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: [
      'std/euv-mask-32nm',
      'std/overlay-standard-005',
      'plant/euv-source',
      'plant/euv-vacuum',
      'plant/euv-pulser',
      'plant/clean-room',
      'plant/metrology-room',
    ],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh:
          '① 装 std/euv-mask-32nm（带 pellicle），涂胶 0.2 µm；曝第一层，用掩模自己的对位标记',
        performedBy: 'plant/euv-stepper-hina',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-5 }],
      },
      {
        note_zh: '② 显影 + HF 蚀 122 nm 固定第一层标记',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 同一场再曝第二层，偏移 0/2/5/10 nm；不换掩模，掩模写入是共模',
        performedBy: 'plant/euv-stepper-hina',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-5 }],
      },
      {
        note_zh:
          '④ 独立 DBO 读 10 点 X/Y：先用 std/overlay-standard-005 校零；记录 0–10 能力域，不是 2.7',
        performedBy: 'plant/overlay-metrology',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '硅片 1 + 胶 1 + 氢氟酸 0.1 + 水 1 → 产品掩模资格记录 1 份；测试片一次性。0–10 是能力域，不是读数。',
  },
  {
    /**
     * **8 nm 首片的产品套刻：独立 DBO + 0.005 nm 标准片，读出 8 nm 后道的 2.7 nm 门。**
     *
     * 首片由 `make/device-wafer-oct-first` 用设计套刻跑出；本路线用独立
     * DBO（`plant/overlay-metrology`）+ `std/overlay-standard-005` 校零，
     * 读 10 点 X/Y，写 `mat/overlay-product-record`。
     *
     * 输出是**合格判定窗口** `overlayX/Y 0–2.7 nm`、`U 0.3–0.5`、`points 10`：
     * 读数落在 ≤2.7 才写这一档；落不下就修机/换机，不是改记录。
     * 窗口不是单次读数：单次要等真跑后的 10 点结果再收窄（见记录条目注释）。
     *
     * 溯源：零点与链预算来自 `mat/overlay-traceable-record`（`measure/overlay-traceable`，
     * 用 `plant/overlay-traceable` 对 `std/overlay-standard-005` 定值）。本条
     * 用产线 DBO 测产品片，不重复定值；两条记录一条量链、一条量片。
     */
    id: 'measure/euv-hina-product-overlay',
    name: '8 nm 首片的产品套刻资格测量',
    produces: [
      {
        item: 'mat/overlay-product-record',
        qty: q(1),
        gives: [
          { param: 'overlayX', kind: 'range', min: 0, max: 2.7 },
          { param: 'overlayY', kind: 'range', min: 0, max: 2.7 },
          { param: 'overlay', kind: 'range', min: 0, max: 2.7 },
          { param: 'uncertainty', kind: 'range', min: 0.3, max: 0.5 },
          { param: 'points', kind: 'range', min: 10, max: 10 },
          { param: 'method', kind: 'enum', oneOf: ['dbo'] },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'mat/water', qty: q(1) }] }],
    needs: [
      'mat/device-wafer-first',
      'std/overlay-standard-005',
      // 链预算记录：没有它，2.7 只是产线 DBO 的数，不是可溯源判定。
      'mat/overlay-traceable-record',
      'plant/metrology-room',
    ],
    rate: { hours: q(4) },
    steps: [
      {
        note_zh: '装首片到 0.5 nm 台，找掩模对位标记；19–21 °C，罩内 0.02–0.05 K',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '独立 DBO 读 10 点 X/Y：先用 std/overlay-standard-005 校零，再读首片；U 按 mat/overlay-traceable-record 的链预算合成',
        performedBy: 'plant/overlay-metrology',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '写合格判定 0–2.7 nm / U 0.3–0.5；读数落不下 2.7 就修机/换机，不改记录',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh: '水 1 kg → 首片套刻记录 1 份；首片与标准片是量具/样品，记录是数据不是物料。2.7 是合格判定窗口，不是单次读数。',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...EUV_HINA_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...EUV_HINA_MEASURE_ROUTES];
