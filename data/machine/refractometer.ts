/**
 * 折射计 —— 绝对测长里最容易被忘掉的那一环。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 为什么需要它
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 干涉测长的公式是 `L = (m + ε) × λ/2`，而那个 λ 是**光在所在介质里的波长**。
 * 在空气中，光比真空里慢、波长比真空里短：
 *
 *   n − 1 ≈ 2.9 × 10⁻⁴（590 nm、20 °C、101 kPa）
 *
 * 如果拿真空波长去算空气里的干涉，100 mm 会差：
 *
 *   100 mm × 2.9e-4 = **29 µm**
 *
 * 那是量块公差（1 µm）的 29 倍。**不修正折射率，"绝对测长"就是白测。**
 *
 * 这个问题在**相对**测量里不存在：Fizeau 比较是待测块与基准块并排研在
 * 同一块平晶上，两路光走同一种空气，n 一起变、一起消掉。
 * 所以工作量块那条线不受影响 —— **只有造基准块那一步需要折射率。**
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 怎么测：临界角，纯光学
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 光从棱镜射向待测气体，超过临界角就发生全反射。而临界角只由两边的
 * 折射率之比决定：
 *
 *   sin θc = n_气 / n_棱
 *
 * 棱镜的 n 已知（同一块玻璃，同一批，用已知液体标定过），于是量出 θc 就有 n_气。
 *
 * 精度：分度盘读到 1″（4.8e-6 rad），配上 1e-6 级的温控 —— n 测到 1e-6，
 * 折算到 100 mm 是 0.1 µm。**1 级（±1 µm）绰绰有余。**
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 它还能测什么
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 折射率是浓度的直接读数：盐水浓度、硫酸浓度、酒精浓度，都能用它现场测。
 * **所以这台仪器不是只为量块造的** —— 它是湿法车间的通用量具，
 * 而本层前面几十条路线都在调浓度（酸浸、碱浸、沉钒、沉镁）。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const REFRACTOMETER_PARTS: readonly Item[] = [
  /**
   * 测量棱镜。直角棱镜，一个面贴待测气体，另两面透光。
   *
   * 玻璃的折射率要**已知**：同一批熔制的玻璃，用已知液体（水，1.333）
   * 标定过。所以这台仪器的精度一半靠棱镜，一半靠标定。
   */
  { id: 'plant/refractometer/prism', name: '折射仪测量棱镜', unit: '件', category: 'part' },

  /** 分度盘。玻璃圆盘上刻 0–90°，读到 1″（弧秒），与比较仪的刻度尺同一工艺。 */
  { id: 'plant/refractometer/circle', name: '折射仪分度盘', unit: '件', category: 'part' },

  /** 准直管与望远镜。一个把光变平行，一个把边界像放大到能对准刻度。 */
  { id: 'plant/refractometer/telescope', name: '折射仪准直管与望远镜', unit: '件', category: 'part' },

  /**
   * 可调狭缝。5–100 µm，两片不锈钢刀口 + 千分尺推一边。
   *
   * 它是折射计变成光谱仪的那一件：没有狭缝，1″ 圆盘的角分辨被 2 mm 的
   * 视场光阑吃掉。
   *
   * **OES 的 1 nm 档不再靠“棱镜 + 这条缝”。** `plant/refractometer` 的
   * `composedOf` 已经挂上 `plant/refractometer/oes-grating-spectrograph`：
   * 1200 线/mm 刻划光栅，10 µm 入射缝 + 25 µm 出射缝（第二只同规格狭缝），
   * 870 nm 设计分辨率 0.2–0.5 nm。棱镜仍留作临界角测 n，不拆。
   * 算式与 BOM 在 `data/machine/oes-grating.ts`。
   *
   * R8（870 nm，光栅模块）：
   *   ① **没有绝对波长基准**：本层没有汞灯/氩灯/空心阴极灯，只能用
   *      钠 D 589.0/589.6 与铜弧 510.5/515.3/521.8 自校，绝对波长 ±0.2 nm
   *      （估算；缺口 R8-1）。
   *   ② **杂散光 1–10%**：单色仪没有双级联，弱线会被强邻线淹没；端点用的
   *      强线能测，痕量杂质线不能测（缺口 R8-2）。
   *   ③ **48 nm 槽深是浅相位光栅**，不是闪耀光栅：一级效率 1.5–3%（估算），
   *      鬼线未实测（缺口 R8-3）。
   * 升级路线：贯通掩模/硬掩模 + 槽深/闪耀角/效率量具；双级联或全息光栅；
   * 详见 `oes-grating.ts` 第九节。
   */
  {
    id: 'plant/refractometer/slit',
    name: '折射仪可调狭缝',
    unit: '件',
    category: 'part',
    props: [
      { param: 'slitWidth', kind: 'range', min: 0, max: 200, unit: 'µm', dir: 'atMost' },
      { param: 'slitHeight', kind: 'range', min: 1, max: 50, unit: 'mm' },
    ],
  },

  /**
   * 光电探测头。硅光电二极管 + 前放 + 屏蔽盒；配斩波器做锁相。
   *
   *   noise       ≤1 %
   *   bandwidth   ≥100 kHz
   *   channels    1–4 路
   */
  {
    id: 'plant/refractometer/detector',
    name: '折射仪光电探测头',
    unit: '件',
    category: 'part',
    props: [
      { param: 'noise', kind: 'range', min: 0, max: 1, unit: '%', dir: 'atMost' },
      { param: 'bandwidth', kind: 'range', min: 0, max: 1000, unit: 'kHz', dir: 'atLeast' },
      { param: 'channels', kind: 'range', min: 1, max: 4, unit: '路', dir: 'atLeast' },
    ],
  },

  /**
   * 斩波器。铝盘开 6 槽 + 小伺服电机，10–1000 Hz；把 1/f 漂移推到
   * 斩波频率之外，锁相放大才压得住等离子体本底。
   */
  {
    id: 'plant/refractometer/chopper',
    name: '折射仪斩波器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'frequency', kind: 'range', min: 1, max: 2000, unit: 'Hz' },
      { param: 'dutyCycle', kind: 'range', min: 0, max: 1, unit: '占空比' },
    ],
  },
];

export const REFRACTOMETER_ROUTES: readonly Route[] = [
  {
    /** 棱镜。玻璃切块 → 粗磨 → 三面抛光到 λ/2 → 直角误差 < 10″。 */
    id: 'make/refractometer-prism',
    name: '折射仪测量棱镜制造',
    produces: [{ item: 'plant/refractometer/prism', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
      { anyOf: [{ item: 'mat/fused-alumina', qty: q(1) }] },
    ],
    needs: ['plant/comparator/lapping-plate'],
    performedBy: 'plant/grinder',
  },
  {
    /** 分度盘。玻璃涂蜡 → 刻线（车床丝杠带分度头）→ 氢氟酸轻蚀 → 去蜡。 */
    id: 'make/refractometer-circle',
    name: '折射仪分度盘制造',
    produces: [{ item: 'plant/refractometer/circle', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'lathe',
  },
  {
    /** 镜筒。两片透镜 + 黄铜/钢筒，与望远镜同一工艺。 */
    id: 'make/refractometer-telescope',
    name: '折射仪准直管与望远镜制造',
    produces: [{ item: 'plant/refractometer/telescope', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
    ],
    needs: ['lathe'],
    performedBy: 'plant/sheet-shop',
  },
  {
    /**
     * **可调狭缝：两片刀口 + 千分尺。**
     *
     *   不锈钢 0.1 + 玻璃 0.05 + 千分尺 1 → 狭缝 1
     *
     * 5 µm 那一档没有直接量具，只能靠千分尺 10 µm 分度 + 衍射条纹估。
     */
    id: 'make/refractometer-slit',
    name: '折射仪可调狭缝制造',
    produces: [
      {
        item: 'plant/refractometer/slit',
        qty: q(1),
        gives: [
          { param: 'slitWidth', kind: 'range', min: 5, max: 100 },
          { param: 'slitHeight', kind: 'range', min: 10, max: 10 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 20) }] },
      { anyOf: [{ item: 'std/micrometer-0-25', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/comparator',
    rate: { hours: q(4) },
    unbalanced_zh:
      '不锈钢 0.1 + 玻璃 0.05 + 千分尺 1 → 狭缝 1；余是磨削与刀口废料。5 µm 档只能靠衍射估，没有 5 µm 量具',
  },
  {
    /**
     * **光电探测头：硅二极管 + 前放 + 屏蔽盒。**
     *
     *   二极管 1 + 运放 1 + 铜线 0.05 + 铝 0.1 → 探测头 1
     */
    id: 'make/refractometer-detector',
    name: '折射仪光电探测头制造',
    produces: [
      {
        item: 'plant/refractometer/detector',
        qty: q(1),
        gives: [
          { param: 'noise', kind: 'range', min: 0.1, max: 1 },
          { param: 'bandwidth', kind: 'range', min: 100, max: 1000 },
          { param: 'channels', kind: 'range', min: 1, max: 1 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/photodiode-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 20) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 10) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
    rate: { hours: q(2) },
  },
  {
    /**
     * **斩波器：铝盘 6 槽 + 小伺服。**
     *
     *   伺服 1 + 铝 0.1 + 45 钢 0.02 → 斩波器 1
     */
    id: 'make/refractometer-chopper',
    name: '折射仪斩波器制造',
    produces: [
      {
        item: 'plant/refractometer/chopper',
        qty: q(1),
        gives: [
          { param: 'frequency', kind: 'range', min: 10, max: 1000 },
          { param: 'dutyCycle', kind: 'range', min: 0.4, max: 0.6 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/robot/servo', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1, 50) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
    rate: { hours: q(2) },
  },
];

/**
 * 折射计。测气体与液体的折射率到 1e-6，全程纯光学。
 *
 * 它是**绝对测长的前置条件**：没有它，干涉仪给出的长度差 29 µm；
 * 有了它，修正后的绝对长度不确定度是 0.1 µm/100 mm。
 *
 * 组成改成四件：棱镜、分度盘、望远镜、**光栅光谱仪模块**。原来的狭缝、
 * 探测头、斩波器没有消失 —— 它们进了模块的 `uses`，因为 OES 的 1 nm 档
 * 是“光栅 + 两只缝 + 探测头 + 斩波器”一起装出来的。棱镜仍在，因为临界角
 * 测 n 是折射计的本职，光栅只替掉它的分光那一路。
 */
export const REFRACTOMETER: Item = {
  id: 'plant/refractometer',
  name: '折射仪',
  unit: '台',
  category: 'machine',
  composedOf: [
    { item: 'plant/refractometer/prism', qty: q(1) },
    { item: 'plant/refractometer/circle', qty: q(1) },
    { item: 'plant/refractometer/telescope', qty: q(1) },
    { item: 'plant/refractometer/oes-grating-spectrograph', qty: q(1) },
  ],
};

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...REFRACTOMETER_PARTS, REFRACTOMETER];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/refractometer',
    name: '折射仪装配',
    produces: [{
      item: 'plant/refractometer',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...REFRACTOMETER_ROUTES, ...ASSEMBLY_ROUTES];
