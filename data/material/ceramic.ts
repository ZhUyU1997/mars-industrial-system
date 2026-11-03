/**
 * 陶瓷件 —— 高温炉的发热体与绝缘，都是本层烧得出来的。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 两件东西，两条门槛
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   硅碳棒     碳化硅 + 粘结剂，挤压成棒，**反应烧结 2000 °C 级**
 *              它是"能自己造的最高发热体"：空气中 1500 长期、1600 短时
 *   氧化铝瓷   刚玉粉 + 结合剂，干压成型，**烧结 1600**
 *              绝缘子、灭弧罩、炉管、坩埚内衬 —— 凡是"高温 + 绝缘"都要它
 *
 * 一个管发热，一个管绝缘。两台炉子（电阻炉 1100 / 高温炉 1600）里，
 * 这两件是唯一不能从别处替代的零件。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 硅碳棒为什么能自举
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 它自己要 2000 °C 烧结，而那台炉子（自衬电弧炉 1900–2200）已经在了 ——
 * 电弧炉的电极是本层造的碳电极，炉衬是刚玉，不需要硅碳棒。
 *
 * 所以第一根硅碳棒从电弧炉里出来，之后的炉子就有 1600 可用了。
 * **这是母机逻辑的第二次出现**（车床造车床、磨床磨磨床），只是这次母机是台炉子。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 氧化铝瓷：1600 那一档正好
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 刚玉瓷的烧结温度 1500–1700，而高温炉的上限正好 1600 —— **卡在线上，但有富余**。
 * 更高档的（透明氧化铝、氮化硅）不做：那要 1800–2000 与热压，是另一条链。
 *
 * 一处降级：工业刚玉瓷要加微量氧化镁抑制晶粒长大，本层没有镁的氧化物
 * （镁砂是 MgO，有 —— data/material/magnesia.ts）。所以这里能加，但纯度不够，
 * 晶粒粗一些、强度低一档。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const CERAMIC_ITEMS: readonly Item[] = [
  /**
   * 硅碳棒，φ14 一档。发热体，也可做高温热电偶的保护管（不导电、耐热震）。
   *
   * 与电机一样只造一档：备件统一比逐台匹配要紧 —— 炉子的功率靠串并联与抽头调，
   * 不靠换型号。
   */
  { id: 'std/sic-heating-element-general', name: '硅碳棒', unit: '件', category: 'part',
    props: [{ param: 'maxTemp', kind: 'range', min: 1200, max: 1600, unit: '°C' }] },

  /**
   * 氧化铝瓷件（绝缘子、灭弧罩、炉管）。按件计，形状随用途。
   *
   * 它是"电"与"热"同时在场的地方唯一能用的材料：接触器的灭弧罩、炉子的棒座、
   * 电热元件的支撑 —— 凡是要绝缘又要耐几百度以上的，只有陶瓷。
   */
  { id: 'std/alumina-insulator-general', name: '氧化铝瓷件', unit: '件', category: 'part' },
];

export const CERAMIC_ROUTES: readonly Route[] = [
  {
    /**
     * 硅碳棒：碳化硅磨细 → 加粘结剂挤棒 → 反应烧结 → 端头金属化。
     *
     *   混料挤棒   碳化硅粉 + 酚醛，挤成 φ14 的棒      plant/robot
     *   反应烧结   1900–2200 °C，粉粒之间靠新生成的 SiC 搭桥  plant/arc-furnace
     *   端头处理   两端喷铝、装铜卡子，接触电阻要小      plant/robot
     *
     * **第一次烧结用电弧炉**：那时还没有硅碳棒，电弧炉也不靠它 —— 母机环从这儿过。
     */
    id: 'make/sic-heating-element',
    name: '硅碳棒制造',
    produces: [{ item: 'std/sic-heating-element-general', qty: q(1), gives: [{ param: 'maxTemp', kind: 'range', min: 1300, max: 1450, dir: 'atLeast' }] }],
    uses: [
      { anyOf: [{ item: 'mat/silicon-carbide', qty: q(1) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '混料与挤棒', performedBy: 'plant/robot' },
      { note_zh: '反应烧结（第一次靠电弧炉）', performedBy: 'plant/arc-furnace', under: [{ param: 'temperature', min: 1900, max: 2200 }] },
      { note_zh: '端头金属化与卡子', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 氧化铝瓷：刚玉粉 + 结合剂 → 干压 → 1600 烧结 → 修磨。
     *
     *   配料干压   刚玉粉 + 少量镁砂（抑制晶粒长大）+ 粘结剂  plant/robot
     *   烧结       1500–1600 °C，保温几小时                plant/high-temp-furnace
     *   修磨       平面与孔口磨到尺寸                       plant/grinder
     *
     * 它同时是这台高温炉的"用户"与"零件供应商"：炉子装硅碳棒，瓷件在炉子里烧，
     * 而电热元件的支撑座又是瓷件。**这条环是通的**，因为第一台炉子的瓷件
     * 可以用电阻炉（1100）先烧一炉凑合的 —— 试验件，寿命短但能开始。
     */
    id: 'make/alumina-insulator',
    name: '氧化铝瓷件制造',
    produces: [{ item: 'std/alumina-insulator-general', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/fused-alumina', qty: q(1) }] },
      { anyOf: [{ item: 'mat/magnesia', qty: q(1) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '配料与干压', performedBy: 'plant/robot' },
      { note_zh: '烧结', performedBy: 'plant/high-temp-furnace', under: [{ param: 'temperature', min: 1500, max: 1600 }] },
      { note_zh: '修磨', performedBy: 'plant/grinder' },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...CERAMIC_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...CERAMIC_ROUTES];
