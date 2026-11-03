/**
 * 接触曝光机 —— 把掩模上的图形印到片子上的那台东西。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 三件事：光源、掩模架、对准
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   光源     碳弧灯 —— 两根碳棒起弧，紫外强。汞灯要汞，本层没有
 *   掩模架   把版压紧在片子上（接触式），间隙要小于 1 µm 才能保证不衍射
 *   对准     显微镜 + x-y-θ 微调台：把版上的标记与片子上的标记对上
 *
 * 接触式是光刻里最老、最笨、也最省事的一种：掩模直接压在胶面上。
 * 代价是掩模磨损快（每压一次掉一层），好处是不需要投影镜头。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 分辨率：5 µm 级，卡在胶厚与间隙
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 接触曝光的实际极限：
 *
 *   胶厚 0.5–1 µm   可分辨 2–5 µm
 *   胶厚 2–3 µm     可分辨 8–10 µm
 *
 * 厚度由旋涂转速定 —— 而旋涂在本层是"机器人转着甩"，转速靠听声音，
 * 膜厚靠看颜色（薄膜干涉的彩虹色，与量块研磨时的判断同一招）。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 一处硬伤：碳弧灯不稳
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 电弧的亮度随棒距、气压、烧蚀面变化 —— 曝光量因此在 ±30% 里漂。
 * 后果是**显影后的线宽也跟着漂**：负胶过曝会让线条变胖、细缝糊死。
 *
 * 工业上用光电积分控制曝光量（那要光电二极管 —— 本层有 `std/photodiode-general`！）。
 * 这一台的选择是：光电二极管 + 检流计做积分，**手放开快门** —— 于是它接回了
 * 那个光电二极管，链条又一次自己喂自己。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const ALIGNER_PARTS: readonly Item[] = [
  /** 碳弧灯与聚光镜。两根碳棒 + 手动进给 + 抛物面反光碗 + 石英聚光镜。 */
  { id: 'plant/mask-aligner/lamp', name: 'Mask Aligner Carbon Arc Lamp and Condenser Lens', name_zh: '掩模对准曝光机碳弧灯与聚光镜', unit: '件', category: 'part' },

  /** 掩模架与对准台。压紧机构（气囊或弹簧）+ x-y-θ 微调 + 显微镜座。 */
  { id: 'plant/mask-aligner/stage', name: 'Mask Aligner Mask Holder and Alignment Stage', name_zh: '掩模对准曝光机掩模架与对准台', unit: '件', category: 'part' },

  /** 机架与遮光罩。暗箱、快门、防尘罩 —— 胶见光就废，整台机器在暗室里用。 */
  { id: 'plant/mask-aligner/frame', name: 'Mask Aligner Frame and Light Shield', name_zh: '掩模对准曝光机机架与遮光罩', unit: '件', category: 'part' },
];

export const ALIGNER_ROUTES: readonly Route[] = [
  {
    /** 碳弧灯。碳棒夹持与进给机构 + 反光碗 + 石英聚光镜（石英本层有）。 */
    id: 'make/aligner-lamp',
    name: 'Mask Aligner Carbon Arc Lamp and Condenser Lens Manufacturing', name_zh: '掩模对准曝光机碳弧灯与聚光镜制造',
    produces: [{ item: 'plant/mask-aligner/lamp', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'std/carbon-electrode-300', qty: q(2) }] },
      { anyOf: [{ item: 'mat/quartz-pure', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/sheet-shop',
  },
  {
    /** 掩模架与对准台。微调台照比较仪的进给台做（丝杠 + 导轨 + 千分旋钮）。 */
    id: 'make/aligner-stage',
    name: 'Mask Aligner Mask Holder and Alignment Stage Manufacturing', name_zh: '掩模对准曝光机掩模架与对准台制造',
    produces: [{ item: 'plant/mask-aligner/stage', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1) }] },
      { anyOf: [{ item: 'std/micrometer-0-25', qty: q(2) }] },
    ],
    needs: ['plant/grinder'],
    performedBy: 'lathe',
  },
  {
    /** 机架与遮光罩。暗箱薄板折焊 + 快门 + 防尘罩 —— 装配归机器人。 */
    id: 'make/aligner-frame',
    name: 'Mask Aligner Frame and Light Shield Manufacturing', name_zh: '掩模对准曝光机机架与遮光罩制造',
    produces: [{ item: 'plant/mask-aligner/frame', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
  },
];

/**
 * 接触曝光机。没有温度与压力条件 —— 它在暗室里常温工作。
 *
 * 它不 `holds` 任何条件，所以它只能作为 `performedBy` 出现在工序里；
 * 而"暗室"这个前提写不进模型（没有 param），记在注释里。
 */
export const MASK_ALIGNER: Item = {
  id: 'plant/mask-aligner',
  name: 'Mask Aligner', name_zh: '掩模对准曝光机',
  unit: '台',
  category: 'machine',
  composedOf: [
    ...ALIGNER_PARTS.map((p) => ({ item: p.id, qty: q(1) })),
    { item: 'std/photodiode-general', qty: q(1) },
    { item: 'std/galvanometer-general', qty: q(1) },
  ],
};

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...ALIGNER_PARTS, MASK_ALIGNER];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/mask-aligner',
    name: 'Mask Aligner Assembly', name_zh: '掩模对准曝光机装配',
    produces: [{
      item: 'plant/mask-aligner',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...ALIGNER_ROUTES, ...ASSEMBLY_ROUTES];
