/**
 * 电机（玻璃丝包线版）—— 定子与绕组的最后两条路。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 为什么另起一条，而不改原路线
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 原 `make/motor-stator` / `make/motor-windings` 都吃 `mat/enamel-wire`（漆包线），
 * 而漆包线要酚醛（酚醛要氯苯，氯苯要氯碱，氯碱是电解槽）—— 环。
 *
 * 所以补两条**玻璃丝包线**的来路（19 世纪到 20 世纪初的标准做法）：
 *
 *   定子   铁芯 + 玻璃丝包线 + 耐火黏土槽绝缘
 *   绕组   玻璃丝包线绕成线圈，靠玻璃丝本身的耐温（A/B 级），**不浸漆**
 *
 * 原路线一条不删 —— 将来酚醛通了，漆包线那条仍是更好的那条（细、槽满率高）。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 三处降级（都写在这里，不散）
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ① **槽满率**：玻璃丝包线外径 φ1.4 vs 漆包线 φ1.08，每匝占槽面积 ×1.68 ——
 *    同一个槽只能塞 60% 的匝数，于是同样铁芯的电机**功率降一档**（7.5 → 4–5 kW）。
 *    本模型只有一个规格的电机条目，所以这个降级写在注释里，落不到数上。
 *
 * ② **不浸漆**：没有酚醛就没有浸渍，靠玻璃丝的耐温。名义 B 级（130 °C），
 *    实际按 A 级（105 °C）用 —— 潮气会顺着绕包缝走到铜上，绝缘电阻掉一个量级。
 *
 * ③ **槽绝缘用耐火黏土**：没有青壳纸、没有聚酯膜、没有酚醛板。黏土烧结片
 *    （显气孔率 25%）吸潮，只能靠"用前烘干"这一条土办法。
 */

import type { Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const MOTOR_GLASS_ROUTES: readonly Route[] = [
  {
    /**
     * 定子（玻璃丝包线版）：铁芯 + 槽绝缘 + 嵌线 + 烘干。
     *
     *   铁 1 + 玻璃丝包线 1 + 耐火土 1 → 定子 1
     *
     * 与铁芯版（make/motor-stator-ironcore）的区别只在绝缘：那一版要酚醛，这一版不要。
     */
    id: 'make/motor-stator-glass',
    name: '7.5 kW 四极电机定子制造',
    produces: [{ item: 'std/motor-7.5kw-4p/stator', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/iron', qty: q(1) }] },
      { anyOf: [{ item: 'mat/glass-covered-wire', qty: q(1) }] },
      { anyOf: [{ item: 'mat/refractory', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '钢片下料、涂绝缘漆、叠压、内圆与止口', performedBy: 'lathe' },
      { note_zh: '槽绝缘（耐火黏土片，厚 0.5 mm，用前烘干）', performedBy: 'plant/robot' },
      { note_zh: '嵌线与端部绑扎', performedBy: 'plant/winder' },
      { note_zh: '烘干（土窑 400，实际该 105–150 —— 同铁芯那处的降级）', performedBy: 'plant/earth-kiln', under: [{ param: 'temperature', min: 400, max: 450 }] },
    ],
  },
  {
    /**
     * 绕组（玻璃丝包线版）：线圈成形、包扎、烘干。
     *
     *   玻璃丝包线 1 + 耐火土 1 → 绕组 1
     *
     * 手摇绕线机 + 人看圈数。绕完不浸漆，
     * 只做烘干与端部绑扎 —— 这是 1900 年代电机的样子。
     */
    id: 'make/motor-windings-glass',
    name: '7.5 kW 四极电机绕组制造',
    produces: [{ item: 'std/motor-7.5kw-4p/windings', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/glass-covered-wire', qty: q(1) }] },
      { anyOf: [{ item: 'mat/refractory', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '绕线（手摇绕线机，人看圈数停机）', performedBy: 'plant/winder' },
      { note_zh: '端部绑扎与整形（玻璃丝带）', performedBy: 'plant/robot' },
      { note_zh: '烘干（土窑 400，实际该 105–150）', performedBy: 'plant/earth-kiln', under: [{ param: 'temperature', min: 400, max: 450 }] },
    ],
  },
];

import type { Item } from '../../src/index.ts';

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [];
export const DATA_ROUTES: readonly Route[] = [...MOTOR_GLASS_ROUTES];
