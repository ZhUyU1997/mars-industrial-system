/**
 * AFM 的两条测量路线 —— 针尖半径 5–8 %、台阶高度 0.5–50 nm（与 X 射线差 <2 %）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 〇、这份文件回答哪两件事
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① `measure/tip-radius`（`metrology-cal.ts`）只有 SEM 顶视反卷积，
 *      不确定度 **15–25 %**。本文件给 `measure/tip-radius-afm`：
 *      AFM 反向成像 + 减去 AFM 针尖自身半径 ⇒ **5–8 %**。
 *      **SEM 那条不删**：它是 15–25 % 的历史路线，也是 AFM 的粗交叉检查
 *      （两条差 >3 倍说明装反了/扫错了）。
 *   ② `measure/profiler-vertical-cal` 的 1/10 nm 两档没有独立标准件。
 *      本文件给 `measure/step-height-afm`：用 `std/step-standard-1nm-10nm`
 *      （`data/machine/afm.ts`）的 A = 1.0 nm / B = 10.0 nm / C = 0 三块平台，
 *      AFM 双平台差分 + X 射线干涉互证，差 <2 %。
 *
 * 仪器（`plant/afm`、`std/afm-cantilever`、`std/step-standard-1nm-10nm`）
 * 全在 `data/machine/afm.ts`；R13：measure/* 与 *-record 只放这里。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、针尖半径 5–8 %：反向成像把未知量从「锥角」换成「AFM 针尖」
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * SEM 顶视的 15–25 % 不是随机误差，是**模型系统项**：顶视只有投影，
 * 尖端球化半径与锥角只能假设（`measure/tip-radius` 的注释自己这么写）。
 * AFM 把它换成一次**直接测量**：
 *
 *   被测量的压头针尖（`plant/nanoindenter/head`，20–100 nm）当**样品**
 *   朝上装在 AFM 台上；AFM 用 5–10 nm 的 `std/afm-cantilever` 去扫它。
 *   图像是两根针尖的**卷积**：球-球近似下
 *
 *       r_app = r_indenter + r_afm
 *       ⇒ r_indenter = r_app − r_afm
 *
 *   r_afm 是已知量：`std/afm-cantilever` 的 5–10 nm（本机自己的针，
 *   出厂用同一台 AFM 反向成像标定；±1 nm）。
 *   r_app 由图像轮廓拟合：20–50 个边缘点，球-锥模型，±0.5 nm。
 *
 * 误差合成：
 *
 *   r_indenter   r_afm 项   r_app 项   RSS     相对
 *   20 nm        ±1.0 nm    ±0.5 nm    ±1.12    **5.6 %**
 *   50 nm        ±1.0 nm    ±0.5 nm    ±1.12    2.2 %
 *   100 nm       ±1.0 nm    ±0.5 nm    ±1.12    1.1 %
 *
 * **所以 5–8 % 是 20–50 nm 档的保守窗口，100 nm 端实际 1–2 %。**
 * 记录里写 5–8 %（`uncertainty`），不是把 100 nm 端也写成 5 %。
 *
 * 与 SEM 的关系：SEM 顶视仍是**粗交叉检查**——两条差 >3 倍（即 >45 %）
 * 说明针装反了、扫到崩边、或压头不是 `plant/nanoindenter/head`。
 * SEM 的 15–25 % 保留，作为历史路线与这个粗判据，不删。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、台阶高度 0.5–50 nm：0.05 nm 的 Z 噪声怎么变成 2 % 的 1 nm 读数
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 单点：0.05 nm / 1 nm = **5 %**。一条 10 µm 线 256 点、100 条线 = 25 600 点，
 * 白噪声 0.05/√25600 = **0.3 pm**。真正的底是漂移与非线性（`machine/afm.ts`
 * §三已经算过，这里只列结果）：
 *
 *   漂移：50 mm 铁基座 0.6 µm/K；19–21 °C 的 ±1 K 是窗口，短期按 0.01 K/min
 *     ⇒ 6 nm/min；10 Hz 线频、10 µm 线 0.1 s ⇒ 0.01 nm/线；A–C、B–C 同线差分
 *     ⇒ 残余 **0.01 nm**（设计值）。
 *   非线性：扫描器全行程 0.5 %；1 nm 段按 16 点标定表残差 0.1 % ⇒ **1 pm**。
 *   热噪声：1 kHz 内 1.2 pm（`machine/afm.ts` §二）。
 *   X 射线：0.1 nm = 0.319 个 (111) 条纹，八帧相位 11° ⇒ **0.01 nm**。
 *
 *   1 nm：√(0.01² + 0.01²) = **0.014 nm = 1.4 %**
 *   10 nm：√(0.05² + 0.01²) = **0.051 nm = 0.51 %**
 *
 * 记录里 `agreement` 的判据是 **<2 %**：1 nm 端 0.014 nm = 1.4 %（判据 2 %，
 * 余量 1.4×）；10 nm 端 0.51 %（余量 3.9×）。
 *
 * ⚠️ **横向 1–5 nm 是采样/边缘定位，不是形貌分辨。** 5–10 nm 的针尖
 * 把 1 nm 台阶的边抹成 2√(2Rh) = 6.3 nm、10 nm 台阶抹成 20 nm
 * （`machine/afm.ts` D1）。台阶高度不受这个卷积影响（两块平台是平的），
 * 所以垂直 0.05 nm 成立；但「1–5 nm 横向」只能读成「台子能走到 1 nm、
 * 边缘位置能拟合到 1 nm」，不能读成「能看 1 nm 的形貌」。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、一个命名冲突（必须写在这里）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `mat/step-height-record` 这个 id **已经存在**：`data/measure/optical-metrology.ts`
 * 里光学轮廓仪的记录（stepHeight 0–1000 nm、uncertainty ≤0.2 nm、
 * lateralResolution 0.5–1 µm），由 `measure/optical-profiler-step` 产出。
 *
 * 本文件要的是另一件东西：0.5–50 nm、垂直 0.05 nm、与 X 射线差 <2 %。
 * 一个 id 一种规格（R11），不能把两个窗口塞进同一条
 * props；若强行复用，`measure/optical-profiler-step` 会因为
 * `verticalResolution`/`agreement` 没交付而报 `prop_missing_gives`。
 *
 * **所以本文件用 `mat/step-height-afm-record`**，与 `mat/tip-radius-afm-record`
 * 同一命名法。旧的 `mat/step-height-record` 一字不动，两条记录各管各的量程。
 * 这是本文件唯一偏离任务原文的地方，已在回报里单独列出。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、缺口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① **反向成像要求压头能装到 AFM 台上**：`plant/nanoindenter/head` 是
 *      钎焊在针柄上的（φ3 × 20 mm），AFM 的样品台夹持 3–10 mm 的柄；
 *      本层没有专用夹具条目 —— 用 `plant/afm/base` 的三点调平 + 蜡粘，
 *      装夹刚度没有实测。这是 5–8 % 之外的一条装夹不确定度（未计入）。
 *   ② **AFM 针尖自身的 5–10 nm 是出厂值**：本机用同一台 AFM 反向成像标定
 *      （±1 nm），但「谁标定标定者」的循环没有断 —— 最终的锚是
 *      `std/step-standard-1nm-10nm` 的 X 射线绝对标尺（0.01 nm）。
 *   ③ **台阶标准的 0.5–1 nm 与 10–50 nm 段没有标准件**：本文件只覆盖
 *      1/10 nm 两点；AFM 的 0.5–50 nm 量程里其余段是外推（D8）。
 *   ④ **没有 CNAS / 原厂证书**：两个记录的不确定度都是设计值（Earth 工程值），
 *      没有实测重复性数据。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、记录条目
// ═══════════════════════════════════════════════════════════════════════════

export const AFM_MEASURE_ITEMS: readonly Item[] = [
  /**
   * 压头针尖半径的 AFM 记录。**一份记录对应一支针。**
   *
   *   tipRadius   0.02–0.1 µm   20–100 nm；目标档 50 nm
   *   uncertainty 5–8 %         AFM 反向成像；20 nm 端 5.6 %、100 nm 端 1.1 %
   *   method      afm-reverse-image
   *
   * 与 `mat/tip-radius-record`（SEM 顶视、15–25 %）是**两个件**：
   * 那一条是历史路线，这一条是新主路径。
   */
  {
    id: 'mat/tip-radius-afm-record',
    name: 'AFM Indenter Tip Radius Record', name_zh: '压头针尖半径的 AFM 记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'tipRadius', kind: 'range', min: 0.02, max: 0.1, unit: 'µm' },
      { param: 'uncertainty', kind: 'range', min: 5, max: 8, unit: '%' },
      { param: 'method', kind: 'enum', values: ['afm-reverse-image'] },
    ],
  },

  /**
   * 台阶高度的 AFM 记录。**一份记录对应一片标准件/一片工件。**
   *
   *   stepHeight         0.5–50 nm   AFM 的量程；本记录主要用 1/10 nm 两点
   *   verticalResolution 0.05 nm    Z 噪声（电容传感器闭环）
   *   agreement          0–2 %      与 X 射线干涉仪之差；1 nm 端 0.014 nm、10 nm 端 0.051 nm
   *   method             afm+xray
   *
   * ⚠️ 不是 `mat/step-height-record`（光学轮廓仪，0–1000 nm、横向 0.5–1 µm）：
   * 详见文件头 §三。两条记录的量程与横向分辨差 20–100 倍，不能合并。
   */
  {
    id: 'mat/step-height-afm-record',
    name: 'AFM Step Height Record', name_zh: '台阶高度的 AFM 记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'stepHeight', kind: 'range', min: 0.5, max: 50, unit: 'nm' },
      {
        param: 'verticalResolution',
        kind: 'range',
        min: 0.05,
        max: 0.1,
        unit: 'nm',
        dir: 'atMost',
      },
      { param: 'agreement', kind: 'range', min: 0, max: 2, unit: '%', dir: 'atMost' },
      { param: 'method', kind: 'enum', values: ['afm+xray'] },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// 二、测量路线
// ═══════════════════════════════════════════════════════════════════════════

export const AFM_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **针尖半径：AFM 反向成像 → 减去 AFM 针尖半径 → 5–8 %。**
     *
     *   压头 1 支（needs，不消耗）→ 半径记录 1 份
     *
     * 把 `plant/nanoindenter/head` 针尖朝上装到 AFM 样品台，用
     * `std/afm-cantilever`（5–10 nm）扫 2 × 2 µm、256 × 256、10 Hz 线频。
     * 图像是两根针尖的卷积：r_app = r_indenter + r_afm（球-球近似）。
     * r_afm = 5–10 nm ±1 nm（本机自己的针，出厂反向成像标定）；
     * r_app 由 20–50 个边缘点球-锥拟合，±0.5 nm。
     *
     *   20 nm：√(1² + 0.5²) = 1.12 nm = **5.6 %**
     *   50 nm：2.2 %      100 nm：1.1 %
     *
     * 记录写 5–8 %（20–50 nm 档的保守窗口）。SEM 顶视（15–25 %）不删，
     * 作粗交叉检查：两条差 >3 倍 ⇒ 重装/重扫。
     */
    id: 'measure/tip-radius-afm',
    name: 'AFM Indenter Tip Radius Measurement', name_zh: '压头针尖半径的 AFM 测量',
    produces: [
      {
        item: 'mat/tip-radius-afm-record',
        qty: q(1),
        gives: [
          { param: 'tipRadius', kind: 'range', min: 0.02, max: 0.1 },
          { param: 'uncertainty', kind: 'range', min: 5, max: 8 },
          { param: 'method', kind: 'enum', oneOf: ['afm-reverse-image'] },
        ],
      },
    ],
    uses: [{ anyOf: [{ item: 'plant/nanoindenter/head', qty: q(1) }] }],
    needs: ['plant/metrology-room'],
    rate: { hours: q(2) },
    steps: [
      {
        note_zh: '装针：压头针尖朝上固定在 AFM 样品台（蜡粘 + 三点调平）；扫描器 Z 粗调 0–25 mm 找针尖',
        performedBy: 'plant/afm',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '反向成像：2×2 µm、256×256、10 Hz 线频；AFM 针尖 5–10 nm，图像是 r_app = r_indenter + r_afm',
        performedBy: 'plant/afm',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '去卷积：r_indenter = r_app − r_afm；r_afm 5–10 nm ±1 nm（出厂反向成像标定），r_app 拟合 ±0.5 nm；20–50 个边缘点',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '不确定度：20 nm 端 √(1²+0.5²)=1.12 nm=5.6 %；50 nm 2.2 %；100 nm 1.1 %；记录取 5–8 %（20–50 nm 档）',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '粗交叉检查：SEM 顶视（measure/tip-radius，15–25 %）差 >3 倍 ⇒ 重装/重扫；SEM 路线保留',
        performedBy: 'plant/cd-sem',
        under: [
          { param: 'pressure', min: 1e-6, max: 1e-3 },
          { param: 'temperature', min: 19, max: 21 },
        ],
      },
    ],
    unbalanced_zh:
      '压头 1 支（进、出，不消耗）+ AFM 1 台/计量间 1 间（进、出，不占用）→ 半径记录 1 份；记录是数据不是物料。',
  },
  {
    /**
     * **台阶高度：AFM 双平台差分 + X 射线干涉互证 → 差 <2 %。**
     *
     *   标准片 1（needs，不消耗）→ 台阶高度记录 1 份
     *
     * 标准片的 A = 1.0 nm / B = 10.0 nm / C = 0 三块平台在同一片上。
     * AFM 扫 A–C、B–C 两条 10 µm 线：256 点/线、10 Hz 线频、100 条线；
     * 同一条线跨两块平台，线性漂移共模扣掉；Z 噪声 0.05 nm 平均到 0.3 pm。
     * X 射线读同一条台阶：0.1 nm = 0.319 个 (111) 条纹、八帧相位 11° ⇒ 0.01 nm。
     *
     *   1 nm：√(0.01² + 0.01²) = 0.014 nm = **1.4 %**
     *   10 nm：√(0.05² + 0.01²) = 0.051 nm = **0.51 %**
     *
     * `gives` 的 stepHeight 0.5–50 nm 是 AFM 的量程，不是这两点的实测值；
     * 本路线只对 1/10 nm 两点负责，其余段没有标准件（D8）。
     */
    id: 'measure/step-height-afm',
    name: 'AFM Step Height Measurement', name_zh: '台阶高度的 AFM 测量',
    produces: [
      {
        item: 'mat/step-height-afm-record',
        qty: q(1),
        gives: [
          { param: 'stepHeight', kind: 'range', min: 0.5, max: 50 },
          { param: 'verticalResolution', kind: 'range', min: 0.05, max: 0.1 },
          { param: 'agreement', kind: 'range', min: 0, max: 2 },
          { param: 'method', kind: 'enum', oneOf: ['afm+xray'] },
        ],
      },
    ],
    uses: [],
    needs: [
      {
        item: 'plant/afm',
        qty: q(1),
        need: [
          { param: 'stepHeight', kind: 'range', min: 0.5, max: 50 },
          { param: 'verticalResolution', kind: 'range', min: 0.05, max: 0.1 },
        ],
        onRelax: 'functional-kept',
      },
      'plant/metrology-room',
      'std/step-standard-1nm-10nm',
      'std/step-standard-100nm',
    ],
    rate: { hours: q(3) },
    steps: [
      {
        note_zh: '装标准片：A/B/C 三块平台找正；AFM 扫 A–C、B–C 各一条 10 µm 线，256 点、10 Hz、100 条平均',
        performedBy: 'plant/afm',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '双平台差分：同一线跨 A–C、B–C，线性漂移共模扣掉；10 Hz 线频 100 µm/s ⇒ 0.01 nm/线的漂移',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: 'X 射线读同一台阶：0.1 nm = 0.319 个 (111) 条纹、八帧相位 11° ⇒ 0.01 nm；A/B 各 10 点/片',
        performedBy: 'plant/xray-interferometer',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
      {
        note_zh: '比对：|AFM−X|/X ≤2 % 才收；1 nm 端 0.014 nm（1.4 %）、10 nm 端 0.051 nm（0.51 %）；写 agreement',
        performedBy: 'plant/robot',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      'AFM 1 台（进、出，不消耗）+ 标准片 2 件（进、出，不消耗）→ 台阶高度记录 1 份；记录是数据不是物料。',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...AFM_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...AFM_MEASURE_ROUTES];
