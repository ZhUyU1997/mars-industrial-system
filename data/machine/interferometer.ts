/**
 * 干涉仪 —— 把"长度"钉在光的波长上。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 前面那条结论错了：量块不是"只能从地球带"
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 前面说过两句话，都要改：
 *
 *   "本地磨出来的块只能'磨得很细'，说不出'这一块是 1.005 毫米'。"
 *   "这是逻辑上的不可自举。"
 *
 * **第二句早就改过了**（长度能从原子跃迁推出来）。但第一句一直
 * 留着，而它也是错的 —— 因为**干涉仪不需要原子跃迁，也不需要任何电子元件**。
 *
 * 1892 年，迈克耳逊用镉红线的波长把"米"量了出来：**眼睛数条纹，手转测微鼓。**
 * 没有人见过光电探测器 —— 它要再过七十年才发明。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 本层怎么实现：钠焰 + 平晶 + 目镜
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 单色光源：**钠焰。** 盐撒进火焰就是一条亮黄线（589.0 / 589.6 nm 双线）。
 * 盐本层有（氯碱的原料），火焰本层有（烧嘴）。不需要灯，不需要电。
 *
 * 平晶：三块对研出来的平板（见 `plant/comparator/lapping-plate`）。
 * 干涉要靠两块面之间的空气楔，而"平"是这件事的全部前提 ——
 * **所以三块对研不只是为了研磨量块，它是干涉仪的地基。**
 *
 * 读条纹：测微目镜。人眼判断条纹的移动，精度能到 1/20 条纹 ——
 * 折算成长度差是 **0.015 µm**（钠光半波长 0.295 µm ÷ 20）。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 关键区别：比较与标定
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 干涉仪有两种用法，而本层只需要第一种：
 *
 *   **比较（Fizeau）**  把待测块研在平晶上，与旁边的基准块一起看干涉条纹。
 *                      两者高度差多少，条纹就错开多少 —— 直接读出**差值**。
 *                      精度 0.015 µm，比光学比较仪的 0.1 µm 高一个档。
 *
 *   **标定（绝对）**    要数清两万多个整数条纹，还要用三到四条谱线做符合法消歧。
 *                      本层只有钠的两条线（589.0 / 589.6），不够消歧。
 *                      **所以绝对长度做不到 —— 但也不需要。**
 *
 * 因为基准那 87 块已经在。**复制要的是"与基准差多少"，不是"绝对多长"。**
 * 这句话说过一次，这里有了量化支持：0.015 µm 的差值读出，
 * 足够把工作量块做到 **0 级（±0.2 µm）**，而不是原来写的 ±0.5。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const INTERFEROMETER_PARTS: readonly Item[] = [
  /**
   * 平晶。干涉仪的地基：一块研到 λ/4 以内的平板（约 0.1 µm 起伏）。
   *
   * 它就是三块对研出来的那块 —— **平面度在这里第二次派上用场**：
   * 第一次是研磨量块，第二次是造干涉仪。
   */
  { id: 'plant/interferometer/flat', name: '干涉仪平晶', unit: '件', category: 'part' },

  /**
   * 分光板。一片薄玻璃，把光分成两路（一路去平晶、一路去参考面）。
   *
   * 不镀半透膜 —— 裸玻璃每面反射 4%，够用。**没有银，也没有镀膜工艺，
   * 所以只能靠这 4%。** 代价是条纹对比度低，要在暗室里看。
   */
  { id: 'plant/interferometer/splitter', name: '干涉仪分光板', unit: '件', category: 'part' },

  /**
   * 钠光源。一根蘸盐的灯芯，在火焰里烧。
   *
   * 火焰要稳（黄焰，不能有碳粒的黑体辐射混进来）—— 用本生式的预混焰：
   * 空气先与燃气混合再烧，火焰几乎无色，撒盐才见黄。
   */
  { id: 'plant/interferometer/sodium-source', name: '干涉仪钠光源', unit: '件', category: 'part' },

  /** 测微目镜。放大 20 倍，带一根可移动的十字线与测微鼓（读条纹的分数级）。 */
  { id: 'plant/interferometer/eyepiece', name: '干涉仪测微目镜', unit: '件', category: 'part' },

  /** 工作台。三只调节螺钉调平，承平晶与量块；它要求刚性，不要求精度。 */
  { id: 'plant/interferometer/stage', name: '干涉仪工作台', unit: '件', category: 'part' },
];

export const INTERFEROMETER_ROUTES: readonly Route[] = [
  {
    /** 平晶。三块对研到 λ/4，再抛光一面（另一面可以不抛）。 */
    id: 'make/interferometer-flat',
    name: '干涉仪平晶制造',
    produces: [{ item: 'plant/interferometer/flat', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
      { anyOf: [{ item: 'mat/fused-alumina', qty: q(1) }] },
    ],
    needs: ['plant/comparator/lapping-plate'],
    performedBy: 'plant/grinder',
  },
  {
    /** 分光板。薄玻璃两面抛光到平行（不镀膜，靠 4% 反射）。 */
    id: 'make/interferometer-splitter',
    name: '干涉仪分光板制造',
    produces: [{ item: 'plant/interferometer/splitter', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
      { anyOf: [{ item: 'mat/fused-alumina', qty: q(1) }] },
    ],
    needs: ['plant/comparator/lapping-plate'],
    performedBy: 'lathe',
  },
  {
    /** 钠光源。不锈钢灯芯座 + 石棉绳 + 盐；配一个预混烧嘴。 */
    id: 'make/interferometer-source',
    name: '干涉仪钠光源制造',
    produces: [{ item: 'plant/interferometer/sodium-source', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/salt', qty: q(1) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 测微目镜。两片透镜 + 十字线 + 测微鼓（与比较仪的刻度尺同一工艺）。 */
    id: 'make/interferometer-eyepiece',
    name: '干涉仪测微目镜制造',
    produces: [{ item: 'plant/interferometer/eyepiece', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/glass', qty: q(1) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'lathe',
  },
  {
    /** 工作台。铸铁台面 + 三只调节螺钉，铣平即可。 */
    id: 'make/interferometer-stage',
    name: '干涉仪工作台制造',
    produces: [{ item: 'plant/interferometer/stage', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht250', qty: q(1) }] }],
    needs: ['plant/milling-machine'],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1300, max: 1500 }],
  },
  {
    /**
     * **干涉仪装配**：零件在条目的 `composedOf` 上（定义），不进 `uses` ——
     * `uses` 只写不可逆加工的消耗，装配是可逆的组合。
     *
     * 工艺：平晶落台面、分光板 45°、钠焰对光、暗室对条纹，由机器人完成。
     * **没有可写的条件** —— 19–21 °C 是量块的判定窗口；装配只是把零件装到一起，
     * 装完的读数才是判据。
     */
    id: 'make/interferometer',
    name: '干涉仪装配',
    produces: [{
      item: 'plant/interferometer',
      qty: q(1),
      gives: [{ param: 'measure/figure', kind: 'range', min: 0, max: 500 }],
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

/**
 * 干涉仪。比较精度 0.015 µm，全程不用电。
 *
 * 它是**量块复制链上的最后一环**：没有它，工作量块只能做到 ±0.5 µm；
 * 有了它，能对到 ±0.2 µm（0 级）。
 *
 * 它不管温度 —— 那由恒温间管。**干涉对振动与温度极其敏感**：
 * 一条条纹对应 0.295 µm，而人走过去带的地面振动就足够让条纹跳。
 * 所以它必须摆在隔振基础上，和比较仪同屋。
 */
export const INTERFEROMETER: Item = {
  id: 'plant/interferometer',
  name: '干涉仪',
  unit: '台',
  category: 'machine',
  props: [
    { param: 'measure/figure', kind: 'range', min: 0, max: 500, unit: 'nm rms', dir: 'atMost' },
  ],
  composedOf: INTERFEROMETER_PARTS.map((p) => ({ item: p.id, qty: q(1) })),
};

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...INTERFEROMETER_PARTS, INTERFEROMETER];
export const DATA_ROUTES: readonly Route[] = [...INTERFEROMETER_ROUTES];
