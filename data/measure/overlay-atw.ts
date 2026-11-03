/**
 * 两条「有设计值、没有读数」的缺口，做成可查记录 —— 可溯源套刻 + at-wavelength
 * 13.5 nm 的 0.1 nm 档。外加一条参考面互检记录（可见光，与前者交叉旁证）。
 *
 * 本文件只放 `measure/*` 路线与 `*-record` 条目（R13）。造量具、造零件在
 * `data/machine/overlay.ts`；13.5 nm 的仪器与镜子在 `data/machine/euv-hina.ts`。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、先划清与既有三条记录的分工（不重复造）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   `data/measure/optical-metrology.ts`（2026-10-20）已经有一条可溯源套刻：
 *
 *     plant/overlay-metrology          生产量具（NA 0.9 + 计量相机 + 步进台 0.5 nm）
 *     std/overlay-standard             标准片（e-beam 写 0/2/5/10 nm + CD-SEM 交叉）
 *     measure/overlay-dbo              产线测片 → mat/overlay-record-traceable
 *
 *   `data/measure/euv-atw.ts` 已经有一条 at-wavelength 验收：
 *
 *     mat/atw-figure-record            放行记录：figure 0.10–0.25、roughness 0.08–0.20
 *     measure/euv-hina-atw-figure-record  双焦 + 剪切 + 3×3 拼接，U 0.11/0.15
 *
 *   所以本文件补的不是「那两件事没有」，而是它们**各自缺的那一格**：
 *
 *     `measure/overlay-traceable`   → `mat/overlay-traceable-record`
 *         生产量具有读数，但**标准片的定值与整条链的分项**没有记录：那一条
 *         记录量的是「片的 overlay」，不是「链的 U 落在哪、每一项分多少」。
 *         本条补后者，量具是只做定值、不测片的 `plant/overlay-traceable`。
 *
 *     `measure/atw-figure-acceptance` → `mat/atw-figure-record-hina`
 *         放行记录的上界 0.25 是「0.10 + U」的判拒收线，**承载不了 0.1 nm
 *         那一档**（它写的是 0.25 不是 0.15）。本条按设计档记：figure
 *         0.05–0.15、roughness 0.05–0.10，U(k=2) 0.10–0.15，子孔径换成
 *         4×4 / 重叠 40 %（拼接残差 0.03–0.045 对放行档的 0.05）。
 *
 *     `measure/ref-flat-three-flat` → `mat/ref-flat-mutual-record`
 *         13.5 nm 的 B1 是**自校准双焦**，不消费可见光参考面；可见光那一环
 *         原来只写在 `make/ref-flat-figure` 的工序注释里（108 次换位 + 液面
 *         交叉），本文件把它变成一份可查记录，作为 B1 的**粗旁证**（差 17 倍，
 *         见第四节），不是校准链。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、可溯源套刻的链：标准片 → e-beam 写入位置 → SEM 边缘判定 → DBO 读数
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   链上的每一项都写进记录字段（k=1，单位 nm）：
 *
 *   段                                       字段        窗口
 *   ─────────────────────────────────────────────────────────────
 *   ① e-beam 写入位置（100 µm 场内差分）      uEbeam      0.03–0.05
 *   ② SEM 边缘判定（同幅内两边之差）          uSem        0.13–0.18
 *   ③ 0 nm 点的零点（SEM 边缘定，无证书）     uZero       0.05–0.10
 *   ①–③ 合成 = 标准片定值                     uStandard   0.14–0.21
 *   ④ DBO 边缘模型 + 计量相机                 uTool       0.05–0.08
 *   ⑤ 激光尺台（只进点间定位）                uStage      0.03–0.06
 *   ⑥ 10 点重复性（1σ）                       uRepeat     0.03–0.05
 *   ④–⑥ + uStandard 合成                       uCombined   0.16–0.24
 *   U = 2·uCombined（k=2，约 95 %）            uncertainty 0.32–0.48
 *
 *   核账（两端，与 `data/machine/overlay.ts` 第三节同一份）：
 *
 *     uStandard,min = √(0.03²+0.13²+0.05²) = √0.0203 = 0.142
 *     uStandard,max = √(0.05²+0.18²+0.10²) = √0.0449 = 0.212
 *     uCombined,min = √(0.142²+0.05²+0.03²+0.03²) = 0.157
 *     uCombined,max = √(0.212²+0.08²+0.06²+0.05²) = 0.238
 *     U ∈ [0.314, 0.476] → 记录窗口 0.3–0.5（两端各留 0.02 取整）
 *
 *   **1.5 nm 的 CD-SEM 绝对准确度不进这条链。** 两组 box 写在同一 100 µm 场、
 *   读在同一幅像里，束流/倍率/工作距的漂移共模，相减就掉；进差分的只有边缘
 *   判定 0.13–0.18 nm。这是 0.5 nm 档成立的支点，也是它与计量院证书的真实
 *   差距（第六节②③）。
 *
 *   记录的 `method` 写 `dbo`，与 `measure/overlay-dbo` 同一口径；但这里的
 *   「点距」是**取样步距 20–30 nm**，不是靶周期（靶周期 2–10 µm，由
 *   `std/overlay-standard` 定）。两个 30 nm 不能读成同一个：一个由台步进定，
 *   一个由标准片版图定。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、at-wavelength 0.1 nm 档：预算与两个记录的分工
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   项                                  φ300 单幅    φ660 拼接    来源
 *   ────────────────────────────────────────────────────────────────
 *   A  重复性（10 组 × 8 帧，组间 1σ）   0.03–0.04   0.03–0.04    每组重装夹/重对焦
 *   B1 双焦自校准残差                    0.03        0.03         参考面球面项解方程扣掉
 *   B2 相位刻度 + 相机非线性              0.02        0.02         λ/8 步进 × 8 帧
 *   B3 支撑/重力翻转（0°/180°）          0.02        0.02         两次装夹
 *   B4 子孔径拼接（4×4、重叠 40 %）       —          0.03–0.045    步距 180 mm、16 幅
 *   ────────────────────────────────────────────────────────────────
 *   RSS = √ΣB²                          0.051–0.057 0.059–0.073
 *   U = 2 × RSS（k=2）                  0.10–0.11   0.12–0.15
 *
 *   → 记录窗口写 **U(k=2) 0.10–0.15**（两端是 φ300 单幅的下端与 φ660 拼接的
 *   上端；不是同一个孔位的两个数）。
 *
 *   拼接为什么换 4×4：放行记录（`data/measure/euv-atw.ts`）用 3×3、重叠 30 %、
 *   步距 210 mm，覆盖 300+2×210 = 720 mm，残差 0.05 nm。设计档要 0.15 的门，
 *   把重叠抬到 40 %（步距 180 mm、4×4 覆盖 300+3×180 = 840 mm、16 幅）：
 *   重叠区的拟合约束从 30 % 升到 40 %，残差 **0.03–0.045**。代价是 16 幅比
 *   9 幅多 2 h（16 h 对 14 h），不是新量具。
 *
 *   ⚠️ **U 与门同量级，这份记录不是放行证书。** U 上端 0.15 = 设计门 0.15，
 *   U/门 = 1.0：按 ISO 14253-1 的 guard band，读数必须 ≤ 门 − U 才能判合格，
 *   即 ≤0 —— 判不了。所以：
 *     · 放行用 `mat/atw-figure-record` 的 0.25 = 0.10 + U 这条判拒收线；
 *     · 本条记录只承载「这台镜子落进 0.1 nm 档」这一格，**不写「合格」**。
 *   把 0.25 写成判据、把 0.10 写成结论，是这两份记录全部的区别。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、参考面标定这一环：三面互检为什么绕开、记录写在哪
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   13.5 nm 上的「参考面」没有可换的第三块：所有材料 n ≈ 1、k 大，三面互检
 *   要三块镀完 50 对膜的 φ660 镜（3 次镀膜 + 3 套支撑 + φ660 球面基准），
 *   本层没有这套工装。所以 B1 走**自校准双焦**（同一面镜两个焦位，参考面
 *   球面项在两组方程里符号相反，解方程扣掉），残差 0.03 nm 是设计值。
 *
 *   可见光那一环**已经有**：`make/ref-flat-figure` 的第 108 次换位与液面交叉
 *   （`data/machine/ref-flat.ts`）——
 *
 *     108 次换位 = 3 对 × 36 个 10° 档（N = 36）→ 只留 m ≥ 36：
 *       A₃₆ + A₇₂ = 0.015 + 0.004 = **0.019 nm**（m ≠ 0 的绝对形状）
 *     液面交叉：φ300 上球面 3.3 nm **可算可减**（s = D²/(8R)，火星 R = 3.396×10⁶ m），
 *       残差 **3.0 nm**（振动 1 + 蒸发对流 0.8 + 表面张力梯度 0.7 + 毛细 0.5）
 *     → 这是 m = 0 项，三面互检测不到，只能靠液面
 *
 *   本条把这一环从「制造工序的注释」变成一份记录：`measure/ref-flat-three-flat`
 *   → `mat/ref-flat-mutual-record`（figure 0.52 / uMutual 0.019–0.03 / uM0 3.0–3.3）。
 *
 *   ⚠️ 它与 B1 的关系是**旁证，不是校准**：0.52 / 0.03 = **17 倍**粗，
 *   而且可见光测的是裸基板、13.5 nm 测的是镀完膜的工作面（相位穿透深度在膜里）。
 *   把它当 0.03 的溯源链是错的；它的用途是「0.03 这个量级有没有可能」的反证 ——
 *   17 倍之内没有矛盾。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、口径与状态
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   · 本文件所有窗口都是**设计值（Earth 工程值）**；记录条目的 `props` 是
 *     读数能落在哪，路线的 `gives` 是这条方法能覆盖的窗口。**没有一份真实的
 *     实测报告之前，只有 L0–L2，不写「闭合」。**
 *   · 记录里的 `u*` 字段是 k=1 的标准不确定度；`uncertainty`/`uExpanded`
 *     是 U(k=2)。这一条写死，免得把 0.21 与 0.48 读成同一个量的两个说法。
 *   · `mat/overlay-traceable-record` 的 overlayX/Y 类型窗口写 0–10（标准片
 *     四点），实际读数可正可负；负偏置靠 `overlayX/Y` 的窗口容纳，不另开
 *     「bias」字段 —— 一个量一个字段。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 六、缺口（按 R7 记量级，不写「造不出」）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① **e-beam 差分写入 0.03–0.05 nm 没有更高一级标准可验**：本层没有
 *      「已知 2 nm」的计量院级标准片，这一项只能记设计值。
 *   ② **SEM 边缘判定 0.13–0.18 nm 是主项**：占 uCombined² 的 56–66%；
 *      0 nm 零点 0.05–0.10 只占 10–17%。要把 U 从 0.31–0.48 压到 0.20
 *      这一档（uCombined 0.10），uSem 得压到 ≤0.05 nm —— 差 2.6–3.6 倍，
 *      要一张 0 nm 的绝对证书 + 更好的边缘模型，不是「多测几次」。
 *   ③ **无 CNAS / 原厂校准**：自校链，不是认可实验室证书。
 *   ④ **U 与 0.15 门同量级**：0.1 nm 档判不了「合格」（guard band 见第三节），
 *      只能记档。要把 U 压到 0.075（门/2）才判得了，差 2 倍 —— 那一档要
 *      A 0.04→0.02、B1 0.03→0.02、B2/B3 0.02→0.01、B4 0.05→0.02 五项同时压
 *      （RSS ≈ 0.037），每一项都要换量具，不是调参数。
 *   ⑤ **13.5 nm 三面互检缺一台工装**：三块镀膜 φ660 + φ660 球面基准 +
 *      换位台；可见光旁证比 B1 粗 17 倍（0.52/0.03）。
 *   ⑥ **粗糙度是 TIS 反推的等效 σ**：TIS ±30 % → σ ±14 %；分辨不了 0.1 nm
 *      的周期结构（要 AFM 或近场光学，本层没有）。
 *   ⑦ **拼接残差 0.03–0.045 仍是设计值**：放行档的 0.05 是同一台仪器的
 *      现有工序（3×3/30 %）；4×4/40 % 的 16 幅实测没有做过，记录里写的是
 *      设计窗口。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、记录条目
// ═══════════════════════════════════════════════════════════════════════════

export const OVERLAY_ATW_ITEMS: readonly Item[] = [
  /**
   * **可溯源套刻的定值链记录。** 与 `mat/overlay-record-traceable`（产线测片）
   * 分开：那一条量「片的 overlay 是多少」，这一条量「这条链的 U 落在哪、每一项
   * 分多少」。
   *
   *   overlayX/Y   0–10 nm        标准片四点 0/2/5/10 的实际读数；负偏置靠
   *                               窗口容纳，不另开字段
   *   uncertainty  0–0.5 nm       U(k=2)，本记录交付 0.32–0.48
   *   pointPitch   0–30 nm        取样步距（不是靶周期）
   *   points       10–100         每片点数，X/Y 各一组
   *   method       dbo            与 `measure/overlay-dbo` 同一口径
   *   uEbeam       0–0.06 nm      e-beam 写入位置（差分）
   *   uSem         0–0.2 nm       SEM 边缘判定（共模抵消后）
   *   uZero        0–0.15 nm      0 nm 点零点
   *   uStandard    0–0.25 nm      = RSS(uEbeam, uSem, uZero)
   *   uTool        0–0.1 nm       DBO 边缘模型 + 相机
   *   uStage       0–0.08 nm      激光尺台（只进点间定位）
   *   uRepeat      0–0.06 nm      10 点 1σ
   *   uCombined    0–0.3 nm       = RSS(uStandard, uTool, uStage, uRepeat)
   *
   * ⚠️ `u*` 全是 **k=1**；`uncertainty` 是 **U(k=2)**。两套刻度写在同一张
   * 记录里，靠字段名分开（u 前缀 = k=1），不靠注释。
   */
  {
    id: 'mat/overlay-traceable-record',
    name: 'Traceable Overlay Value-Assignment Chain Record', name_zh: '可溯源套刻的定值链记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'overlayX', kind: 'range', min: 0, max: 10, unit: 'nm' },
      { param: 'overlayY', kind: 'range', min: 0, max: 10, unit: 'nm' },
      { param: 'uncertainty', kind: 'range', min: 0, max: 0.2, unit: 'nm', dir: 'atMost' }, // 主项：标准片 0.14–0.21 → 0.05–0.08（std/overlay-standard-005，U k=2）
      { param: 'pointPitch', kind: 'range', min: 0, max: 30, unit: 'nm', dir: 'atMost' },
      { param: 'points', kind: 'range', min: 10, max: 100, unit: '点' },
      { param: 'method', kind: 'enum', values: ['dbo'] },
      { param: 'uEbeam', kind: 'range', min: 0, max: 0.06, unit: 'nm', dir: 'atMost' },
      { param: 'uSem', kind: 'range', min: 0, max: 0.2, unit: 'nm', dir: 'atMost' },
      { param: 'uZero', kind: 'range', min: 0, max: 0.15, unit: 'nm', dir: 'atMost' },
      { param: 'uStandard', kind: 'range', min: 0, max: 0.1, unit: 'nm', dir: 'atMost' }, // 标准片升级：0.14–0.21 → 0.05–0.08 nm
      { param: 'uTool', kind: 'range', min: 0, max: 0.1, unit: 'nm', dir: 'atMost' },
      { param: 'uStage', kind: 'range', min: 0, max: 0.08, unit: 'nm', dir: 'atMost' },
      { param: 'uRepeat', kind: 'range', min: 0, max: 0.06, unit: 'nm', dir: 'atMost' },
      { param: 'uCombined', kind: 'range', min: 0, max: 0.15, unit: 'nm', dir: 'atMost' },
    ],
  },

  /**
   * **13.5 nm at-wavelength 面形的 0.1 nm 档记录。** 与 `mat/atw-figure-record`
   * （放行档，figure 0.10–0.25）分开：这一条承载「0.1 nm 那一档」。
   *
   *   figure      0.05–0.15 nm rms   下界 IBF 修后最好档，上界镜子的设计门
   *   roughness   0.05–0.10 nm rms   基底 0.05 + 镀后膜面
   *   aperture    300–660 mm         单幅 φ300 / 4×4 拼接 φ660
   *   wavelength  13.5 nm            工况，不是读数
   *   uA          0.02–0.04 nm       A 类：10 组 × 8 帧，组间 1σ
   *   uB1         0.02–0.04 nm       B1 双焦自校准残差
   *   uB2         0.015–0.025 nm     B2 相位刻度 + 相机非线性
   *   uB3         0.015–0.025 nm     B3 支撑/重力翻转
   *   uStitch     0.03–0.05 nm       B4 子孔径拼接（4×4、重叠 40 %）
   *   uExpanded   0.10–0.15 nm       U(k=2) = 2·RSS(上五项)
   *
   * ⚠️ 它与放行记录**共用同一台仪器与同一次装夹**，但判据和拼接工序都不同：
   * 放行记录 3×3/30 %、门 0.25 = 0.10 + U（判拒收）；本条 4×4/40 %、门 0.15
   * （设计档）。两条路线 16 h 对 14 h 的差，就是那多出来的 7 幅拼接。U 上端
   * 0.15 与门同量级，所以本条**不写「合格」**，只写「落在 0.1 nm 档」——
   * guard band 的算术见文件头第三节。
   */
  {
    id: 'mat/atw-figure-record-hina',
    name: 'EUV Stepper At-Wavelength Surface Figure Record', name_zh: 'EUV 光刻机 at-wavelength 面形记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'figure', kind: 'range', min: 0.05, max: 0.15, unit: 'nm rms', dir: 'atMost' },
      { param: 'roughness', kind: 'range', min: 0.05, max: 0.1, unit: 'nm rms', dir: 'atMost' },
      { param: 'aperture', kind: 'range', min: 300, max: 660, unit: 'mm' },
      { param: 'wavelength', kind: 'range', min: 13.5, max: 13.5, unit: 'nm' },
      { param: 'uA', kind: 'range', min: 0.02, max: 0.04, unit: 'nm', dir: 'atMost' },
      { param: 'uB1', kind: 'range', min: 0.02, max: 0.04, unit: 'nm', dir: 'atMost' },
      { param: 'uB2', kind: 'range', min: 0.015, max: 0.025, unit: 'nm', dir: 'atMost' },
      { param: 'uB3', kind: 'range', min: 0.015, max: 0.025, unit: 'nm', dir: 'atMost' },
      { param: 'uStitch', kind: 'range', min: 0.03, max: 0.05, unit: 'nm', dir: 'atMost' },
      { param: 'uExpanded', kind: 'range', min: 0.1, max: 0.15, unit: 'nm', dir: 'atMost' },
    ],
  },

  /**
   * **可见光参考面的三面互检记录。** 一份记录 = 一轮 108 次换位 + 4 轮液面交叉。
   *
   *   figure      0.52 nm        多光束 F-P 的 m ≠ 0 读数（`make/ref-flat-figure`）
   *   aperture    300 mm         不拼接（拼接缝 1 nm 会输给 0.52 nm）
   *   uMutual     0.019–0.03 nm  m ≠ 0 的角向平均残差（108 次换位，只留 m ≥ 36）
   *   uM0         3.0–3.3 nm     m = 0 的球面项：液面给 3.3 nm 的**可算**球面，
   *                              残差 3.0 nm（振动 1 + 蒸发对流 0.8 + 表面张力
   *                              梯度 0.7 + 毛细 0.5）
   *
   * 它与 `mat/ref-flat-cal-record`（`measure/ref-flat-interferometer-cal`）分开：
   * 那一条记的是**仪器的 resolution/figure/aperture**（0.52 / 0.52 / 300），
   * 这一条记的是**互检本身的残差**（0.019 / 3.0）—— 一个是「仪器读到多少」，
   * 一个是「这个读数能独立证到多少」。
   */
  {
    id: 'mat/ref-flat-mutual-record',
    name: 'Visible-Light Reference Surface Three-Flat Intercomparison Record', name_zh: '可见光参考面的三面互检记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'figure', kind: 'range', min: 0, max: 1, unit: 'nm rms', dir: 'atMost' },
      { param: 'aperture', kind: 'range', min: 0, max: 400, unit: 'mm', dir: 'atLeast' },
      { param: 'uMutual', kind: 'range', min: 0, max: 0.03, unit: 'nm', dir: 'atMost' },
      { param: 'uM0', kind: 'range', min: 0, max: 3.3, unit: 'nm', dir: 'atMost' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、测量路线
// ═══════════════════════════════════════════════════════════════════════════

export const OVERLAY_ATW_ROUTES: readonly Route[] = [
  {
    /**
     * **可溯源套刻的定值链：标准片四点 → 1 份记录（U 0.32–0.48、点距 20–30 nm）。**
     *
     *   标准片（needs，不消耗）→ 定值链记录 1 份
     *
     * 四步（链的四段）：
     *   ① 装标准片：φ100 片放 0.5 nm 台，找 0/2/5/10 nm 四组靶；19–21 °C
     *   ② SEM 复读边：4 nm 束斑、0.05 nm 内插、10 点/组 → uSem 0.13–0.18、
     *      uZero 0.05–0.10（0 nm 点的零点）
     *   ③ DBO 读偏移：NA 0.9、450–650 nm、点距 20–30 nm、10 点 X/Y →
     *      uTool 0.05–0.08、uStage 0.03–0.06、uRepeat 0.03–0.05
     *   ④ 合账：uStandard = RSS(①②③)，uCombined = RSS(全四项)，
     *      U = 2·uCombined → 0.32–0.48；写记录，注明 e-beam 写入位置为
     *      **100 µm 场内差分**（1.5 nm 绝对准确度共模抵消）
     *
     * 不测产品片：台的量程与夹具只服务 φ100 标准片；产线片仍走
     * `measure/overlay-dbo`（`plant/overlay-metrology`）。
     */
    id: 'measure/overlay-traceable',
    name: 'Traceable Overlay Value-Assignment Chain Measurement', name_zh: '可溯源套刻的定值链测量',
    produces: [
      {
        item: 'mat/overlay-traceable-record',
        qty: q(1),
        gives: [
          { param: 'overlayX', kind: 'range', min: 0, max: 10 },
          { param: 'overlayY', kind: 'range', min: 0, max: 10 },
          { param: 'uncertainty', kind: 'range', min: 0.1, max: 0.2 },
          { param: 'pointPitch', kind: 'range', min: 20, max: 30 },
          { param: 'points', kind: 'range', min: 10, max: 100 },
          { param: 'method', kind: 'enum', oneOf: ['dbo'] },
          { param: 'uEbeam', kind: 'range', min: 0.03, max: 0.05 },
          { param: 'uSem', kind: 'range', min: 0.13, max: 0.18 },
          { param: 'uZero', kind: 'range', min: 0.05, max: 0.1 },
          { param: 'uStandard', kind: 'range', min: 0.05, max: 0.08 },
          { param: 'uTool', kind: 'range', min: 0.05, max: 0.08 },
          { param: 'uStage', kind: 'range', min: 0.03, max: 0.06 },
          { param: 'uRepeat', kind: 'range', min: 0.03, max: 0.05 },
          { param: 'uCombined', kind: 'range', min: 0.05, max: 0.1 },
        ],
      },
    ],
    uses: [],
    needs: [
      {
        item: 'plant/overlay-traceable',
        qty: q(1),
        need: [
          { param: 'overlayUncertainty', kind: 'range', min: 0.3, max: 0.5 },
          { param: 'measure/pointPitch', kind: 'range', min: 20, max: 30 },
          { param: 'stageReadout', kind: 'range', min: 0.5, max: 0.5 },
        ],
        onRelax: 'functional-kept',
      },
      'plant/metrology-room',
      'std/overlay-standard',
      'std/overlay-standard-005',
    ],
    rate: { hours: q(8) },
    steps: [
      {
        note_zh:
          '① 装标准片：φ100 片放到 0.5 nm 台，找 0/2/5/10 nm 四组 box-in-box（标准片换 std/overlay-standard-005：U 0.05–0.08 nm，原 0.14–0.21）；19–21 °C、罩内 0.02–0.05 K',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② SEM 复读边：4 nm 束斑、0.05 nm 内插、10 点/组；两组 box 在同一 100 µm 场内 → 1.5 nm 绝对准确度共模，只留边缘判定 0.13–0.18',
        performedBy: 'plant/cd-sem',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-5 }],
      },
      {
        note_zh:
          '③ DBO 读偏移：NA 0.9、450–650 nm、点距 20–30 nm；10 点 X/Y，台 0.5 nm 读数（X 射线校到 Si (111) 0.3135 nm）',
        performedBy: 'plant/overlay-traceable',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '④ 合账：uStandard = RSS(0.03–0.05, 0.13–0.18, 0.05–0.10) = 0.14–0.21；uCombined = RSS(上项, 0.05–0.08, 0.03–0.06, 0.03–0.05) = 0.16–0.24；U = 2·uCombined = 0.32–0.48；写记录',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '可溯源套刻仪 1 台（进、出，不消耗）+ 标准片进、标准片出（不消耗）；记录是数据不是物料。水/电/台时不计入本模型（刻度只有运行小时）。',
  },

  {
    /**
     * **13.5 nm 面形的 0.1 nm 档验收：双焦 + 横向剪切 + 4×4 拼接 → 1 份记录。**
     *
     *   投影镜 1 件（figure ≤0.15）→ 设计档记录 1 份
     *                  （figure 0.05–0.15、roughness 0.05–0.10、aperture 300–660、
     *                    wavelength 13.5、U 0.10–0.15）
     *
     * 七步（与放行档 `measure/euv-hina-atw-figure-record` 的前五步同形，
     * 只在两处加严）：
     *   ① 装镜：φ660 三点支撑，与整机支撑点/朝向一致
     *   ② 抽真空 + 等温：1e-5 Pa、2 h
     *   ③ 双焦：两个焦位各一幅，解方程扣参考面球面项（B1 0.03）
     *   ④ 横向剪切：四个方向各一幅，与双焦互证低级像差
     *   ⑤ 10 组 × 8 帧相位重建：组间 1σ 0.03–0.04（A）
     *   ⑥ 4×4 子孔径拼接（φ>300 才做）：重叠 40 %、步距 180 mm、16 幅，
     *      残差 0.03–0.045（B4）—— **放行档是 3×3/30 %/0.05，这一步是两档的差别**
     *   ⑦ 合账 + 写记录：U = 2·RSS(A, B1, B2, B3, B4) = 0.10–0.15
     *
     * `rate` 16 h = 装/抽/等温 3 h + 双焦与剪切 2 h + 10 组重建 6 h
     * + 16 幅拼接 4 h + 合账 1 h。比放行档的 14 h 多 2 h（多 7 幅）。
     */
    id: 'measure/atw-figure-acceptance',
    name: 'EUV Stepper At-Wavelength Surface Figure Measurement', name_zh: 'EUV 光刻机 at-wavelength 面形测量',
    produces: [
      {
        item: 'mat/atw-figure-record-hina',
        qty: q(1),
        gives: [
          { param: 'figure', kind: 'range', min: 0.05, max: 0.15 },
          { param: 'roughness', kind: 'range', min: 0.05, max: 0.1 },
          { param: 'aperture', kind: 'range', min: 300, max: 660 },
          { param: 'wavelength', kind: 'range', min: 13.5, max: 13.5 },
          { param: 'uA', kind: 'range', min: 0.03, max: 0.04 },
          { param: 'uB1', kind: 'range', min: 0.03, max: 0.03 },
          { param: 'uB2', kind: 'range', min: 0.02, max: 0.02 },
          { param: 'uB3', kind: 'range', min: 0.02, max: 0.02 },
          { param: 'uStitch', kind: 'range', min: 0.03, max: 0.045 },
          { param: 'uExpanded', kind: 'range', min: 0.1, max: 0.15 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'plant/euv-stepper-hina/mirror',
            qty: q(1),
            need: [
              { param: 'figure', kind: 'range', max: 0.15, dir: 'atMost' },
              { param: 'roughness', kind: 'range', max: 0.1, dir: 'atMost' },
            ],
            // 超窗口的镜子照样出记录（记录写「不在 0.1 nm 档」）—— 不是丢测量，
            // 所以是 functional-kept，不是 functional-lost。
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
    ],
    rate: { hours: q(16) },
    steps: [
      {
        note_zh:
          '① 装镜：φ660 三点支撑，与整机里的支撑点/朝向一致；φ660 的自重弓形按 µm 级算，换支撑就换了一个面形',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 抽真空 + 等温：腔体到 1e-5 Pa，静置 2 h；13.5 nm 在大气里走不了 1 cm',
        performedBy: 'plant/robot',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-5 }],
      },
      {
        note_zh:
          '③ 双焦：两个焦位各读一幅 13.5 nm 干涉图，解方程扣参考面球面项（B1 0.03）',
        performedBy: 'plant/euv-stepper-hina/atw-interferometer',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-5 }],
      },
      {
        note_zh:
          '④ 横向剪切：剪切量 1/4 孔径、四方向各一幅；判 astig/coma 与双焦一致，不一致就不写记录',
        performedBy: 'plant/euv-stepper-hina/atw-interferometer',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-5 }],
      },
      {
        note_zh:
          '⑤ 多组相位重建：石英压电堆 λ/8 步进、8 帧移相 × 10 组（每组重装夹/重对焦），组间 1σ 0.03–0.04（A）',
        performedBy: 'plant/phase-shifter',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '⑥ 4×4 子孔径拼接（φ>300 才做）：重叠 40 %、步距 180 mm、16 幅覆盖 840 mm；残差 0.03–0.045（放行档是 3×3/30 %/0.05）',
        performedBy: 'plant/robot',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-5 }],
      },
      {
        note_zh:
          '⑦ 合账：U = 2·RSS(0.03–0.04, 0.03, 0.02, 0.02, 0.03–0.045) = 0.10–0.15；写记录，**不写「合格」**（U 与 0.15 门同量级，guard band 判不了）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '投影镜 1 件进、1 件出（非破坏验收，质量不变）；镜子由 `measure/euv-hina-atw-figure` 交付，本路线只多一份记录 —— 记录是数据，不是物料。',
  },

  {
    /**
     * **可见光参考面的三面互检：108 次换位 + 液面交叉 → 1 份记录。**
     *
     *   参考面 1 + 对研基板 2 + 液面槽 1 + 水 5 → 互检记录 1 份
     *                  （figure 0.52、aperture 300、uMutual 0.019–0.03、uM0 3.0–3.3）
     *
     * 五步：
     *   ① 装三块：A/B/C 的对研面（`make/ref-flat-figure` 的三块同料同厚）
     *   ② 钠光 Fizeau 粗判：18 转角（3 对 × 6 个 60° 档），只判「条纹直不直」
     *   ③ 多光束 F-P 108 次换位：3 对 × 36 个 10° 档，角向平均只留 m ≥ 36，
     *      残差 A₃₆+A₇₂ = 0.015+0.004 = **0.019 nm**
     *   ④ 液面交叉（4 轮 × 3 块）：φ300 上球面 3.3 nm 可算可减，残差 **3.0 nm**
     *      （m = 0 项，三面互检测不到）
     *   ⑤ 合账写记录：figure 0.52（F-P 的 m ≠ 0 读数）、uMutual 0.019–0.03、
     *      uM0 3.0–3.3、aperture 300
     *
     * `rate` 412 h = 108 × 3.3 h（每次含 20 min 热平衡）= 356 h + 液面 4 轮
     * × 3 块 × 4 h = 48 h + 装配与合账 8 h。它是本文件最贵的一条，因为互检的
     * 分辨力是**用时间换的**（36 个转角，不是 36 次读数）。
     *
     * ⚠️ 它不是 13.5 nm 参考面的校准：可见光测裸基板，13.5 nm 测镀完膜的工作面；
     * 它只是 B1（0.03 nm）的粗旁证，差 17 倍。见文件头第四节。
     */
    id: 'measure/ref-flat-three-flat',
    name: 'Visible-Light Reference Surface Three-Flat Intercomparison Measurement', name_zh: '可见光参考面的三面互检测量',
    produces: [
      {
        item: 'mat/ref-flat-mutual-record',
        qty: q(1),
        gives: [
          { param: 'figure', kind: 'range', min: 0.52, max: 0.52 },
          { param: 'aperture', kind: 'range', min: 300, max: 300 },
          { param: 'uMutual', kind: 'range', min: 0.019, max: 0.03 },
          { param: 'uM0', kind: 'range', min: 3, max: 3.3 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/ref-flat-interferometer/reference-flat', qty: q(1) }] },
      { anyOf: [{ item: 'plant/ref-flat-interferometer/substrate-300', qty: q(2) }] },
      { anyOf: [{ item: 'plant/ref-flat-interferometer/trough', qty: q(1) }] },
      { anyOf: [{ item: 'mat/water', qty: q(5) }] },
    ],
    needs: ['plant/metrology-room'],
    rate: { hours: q(412) },
    steps: [
      {
        note_zh:
          '① 装三块：A/B/C 同料同厚（熔石英 0.55 ppm/K、58.5 mm），三点支撑同高；19–21 °C，每次换位等 20 min 热平衡',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '② 钠光 Fizeau 粗判：589.0 nm、18 转角（3 对 × 6 个 60° 档），条纹弯 <1/2 条；弯的形状跟着哪一块转就判哪一块',
        performedBy: 'plant/interferometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '③ 多光束 F-P 108 次换位：515.3 nm、ℱ = 25、36 个 10° 档 × 3 对；角向平均只留 m ≥ 36，A₃₆+A₇₂ = 0.015+0.004 = 0.019 nm',
        performedBy: 'plant/ref-flat-interferometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '④ 液面交叉（4 轮 × 3 块）：φ400 槽静置 3 h，φ300 上球面 3.3 nm 可算（s = D²/(8R)，火星 R = 3.396×10⁶ m）；残差 3.0 nm = m = 0 项',
        performedBy: 'plant/ref-flat-interferometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh:
          '⑤ 合账写记录：figure 0.52（F-P 的 m ≠ 0 读数）、uMutual 0.019–0.03、uM0 3.0–3.3、aperture 300；**不把 0.019 写进 figure**（一个是读数，一个是残差）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '三块参考面进、三块出（非破坏，换位不是加工）；水 5 kg 里约 1 kg 在 4 轮液面里蒸发，其余回收。记录是数据，不是物料。',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...OVERLAY_ATW_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...OVERLAY_ATW_ROUTES];
