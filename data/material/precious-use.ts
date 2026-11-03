/**
 * 贵金属的落点。
 *
 * 上一条文件把银、金、硒从阳极泥里拿了出来，但如果没人吃，那只是把
 * "没人要的阳极泥"换成了"没人要的银"。这三条路线是它们的去处。
 *
 * 而且第一条是**撤回一个否决**：做干涉仪分光板时，化学镀银那条
 * 因为"`mat/silver` 这个 id 根本不存在"被划掉，改成了楔形玻璃板。
 * 银现在有了 —— 半透银膜那条路又活了。
 */

import type { Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const PRECIOUS_USE_ROUTES: readonly Route[] = [
  {
    /**
     * 分光板（镀银半透膜）—— 被否决的那条，现在回来了。
     *
     * 银镜反应：葡萄糖把硝酸银还原成金属银，镀在玻璃板上。
     * 控制镀层"薄到半透"是这条路线的手艺：5–10 nm 时反射率约 40–50 %，
     * 而裸玻璃只有 4 % —— 差一个数量级，够做等强度分光。
     *
     * 与楔形板那条（make/interferometer-splitter-wedge）并存，是 OR：
     *   楔形板：不镀膜，靠 40′ 楔角把鬼影推出视场 —— 简单，但两束光强差 20 倍
     *   镀银板：50/50 分光，条纹对比度好得多 —— 但镀层会氧化，半年要重镀
     */
    id: 'make/splitter-silvered',
    name: 'Interferometer Beamsplitter Manufacturing', name_zh: '干涉仪分光板制造',
    produces: [{ item: 'plant/interferometer/splitter', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/glass', qty: q(1), need: [{ param: 'type', kind: 'enum', oneOf: ['soda-lime'] }], onRelax: 'functional-kept' }] },
      { anyOf: [{ item: 'mat/silver', qty: q(1, 200), need: [{ param: 'purity', kind: 'range', min: 95 }], onRelax: 'functional-kept' }] },
      { anyOf: [{ item: 'mat/nitric-acid', qty: q(1, 100) }] },
      { anyOf: [{ item: 'mat/water', qty: q(2) }] },
    ],
    needs: ['plant/interferometer/flat', 'plant/gauge-block'],
    steps: [
      { note_zh: '板面抛光与清洗（λ/2）', performedBy: 'plant/grinder' },
      { note_zh: '银镜反应镀膜，控制到半透（目视比色）', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 20, max: 40 }] },
      { note_zh: '烘干与膜厚判定（透光看灯丝亮度）', performedBy: 'plant/metrology-room' },
    ],
    unbalanced_zh: '玻璃 1 + 银 0.005 + 硝酸 0.01 + 水 2 → 分光板 1；余是镀液（可回收银）',
  },
  {
    /**
     * 金触点：微伏级测量的最后一道。
     *
     * 检流计、热电偶冷端、标准电阻的换向开关 —— 凡是测 µV 的地方，
     * 铜触点长一层氧化膜就是几十 µV 的假电势，而信号本身才 1.5 mV。
     * 金不氧化，所以只有它能做"零电势"触点。
     *
     * 量极小（一只表 20 mg），但它是**唯一**能把 µV 级测量做稳的手段。
     */
    id: 'make/galvanometer-gold-contact',
    name: 'Moving-Coil Galvanometer Manufacturing', name_zh: '动圈检流计制造',
    produces: [
      { item: 'std/galvanometer-general', qty: q(1), gives: [{ param: 'sensitivity', kind: 'range', min: 1, max: 30, dir: 'atMost' }] },
    ],
    uses: [
      { anyOf: [{ item: 'mat/gold', qty: q(1, 50), need: [{ param: 'purity', kind: 'range', min: 98 }], onRelax: 'functional-lost' }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/glass', qty: q(1, 10) }] },
      { anyOf: [{ item: 'std/permanent-magnet-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(1, 100) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '绕动圈（双线悬丝）', performedBy: 'plant/winder' },
      { note_zh: '触点镀金（化学置换或轧制金箔压接）', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 20, max: 60 }] },
      { note_zh: '刻度与灵敏度标定', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },
  {
    /**
     * 硒整流片。
     *
     * 硒 + 铝背板 → 整流堆。它是最早的固体整流器（1930 年代），
     * 效率低（60–70 %）、每片只耐 20–30 V，但**不需要真空管**。
     *
     * 本层已有旋转变流机（`std/rectifier-rotary-general`，靠机械换向），
     * 硒堆是它的第二条来路：没有转动件，寿命长，但要用掉贵金属。
     */
    id: 'make/selenium-rectifier',
    name: 'Rotary Converter Manufacturing', name_zh: '旋转变流机制造',
    produces: [{ item: 'std/rectifier-rotary-general', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/selenium', qty: q(1, 2), need: [{ param: 'purity', kind: 'range', min: 95 }], onRelax: 'functional-kept' }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(2) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(2) }] },
    ],
    needs: [],
    performedBy: 'plant/press',
    unbalanced_zh: '硒 0.5 + 铝 2 + 薄板 2 → 整流堆 1；硒只用在结上，其余是散热与外壳',
  },
];

import type { Item } from '../../src/index.ts';

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [];
export const DATA_ROUTES: readonly Route[] = [...PRECIOUS_USE_ROUTES];
