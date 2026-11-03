/**
 * 旋转变流机 —— 不用半导体把交流变成直流。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 它要替换的是电解槽的整流器
 * ═══════════════════════════════════════════════════════════════════════
 *
 * `make/electrolyzer-rectifier` 现在要两件外购件：功率器件与触发板。而电解槽
 * 是全厂氢与氧的唯一来源 —— 也就是说，**只要半导体断供，制氢就停**。
 *
 * 但整流不一定靠半导体。在晶闸管之前，工业电解（氯碱、电解水、电解精炼）
 * 用的就是**旋转变流机**：一台交流电动机拖着一台直流发电机，同轴。
 *
 *   交流电机（`std/motor-7.5kw-4p`）→ 同轴 → 直流发电机（换向器 + 电枢 + 磁极）
 *
 * 它的存在证明了这里要说的那句话：**"调压与整流"也不是半导体的专利。**
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 直流发电机比交流电机多两件东西
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   换向器   一圈铜片，片间绝缘，随电枢转 —— 它把电枢里的交流"掰"成直流
 *   电刷     压在换向器上的碳块，把电流引出来
 *
 * 其余与交流电机同构：机座、磁极、电枢叠片、绕组。所以这一条路线真正的
 * 新东西只有换向器与电刷 —— 而它们都是本层做得到的：
 *
 *   换向片   铜排铣成楔形，片间垫酚醛（工业用云母，本层没有云母）
 *   电刷     碳粉加粘结剂压制烧结 —— 与碳电极同一条路
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 代价：效率与维护
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   半导体整流   效率 95% 以上，无机械磨损，几万小时
 *   旋转变流机   效率 70% 级，电刷与换向器要定期修，几千小时
 *
 * 30% 的电变成热，而热要辐射板面积 —— **又一次"降级使用"落到散热上**
 * （与双滚轮减速器、45% 硅铁同一类账）。但在"没有半导体"这个前提下，
 * 70% 的效率远好过 0。
 *
 * ⚠️ 一处表示不出来：换向器的火花等级与电刷寿命靠试，模型没有 `wear`。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const ROTARY_CONVERTER_ITEMS: readonly Item[] = [
  /**
   * 旋转变流机。一台交流电机 + 一台直流发电机，同轴联轴。
   *
   * 计量按台：它是一整台机器，重量与功率都依赖型号（与电机同理，不写质量）。
   */
  { id: 'std/rectifier-rotary-general', name: '旋转变流机', unit: '台', category: 'part' },

  /**
   * 中频发电机组。同一族机器，换一种发电机：转子冲片槽数多、极对数多，
   * 出来的是 1 kHz 上下的交流而不是直流。
   *
   * 它替换的是熔炼炉的中频电源 —— 感应炉要的不是直流，是**频率**。半导体靠
   * 逆变给频率，旋转机组靠"转多快、槽多少"给频率。
   *
   * 与旋转变流机的差别：高频发电机做成**感应子式**（转子只是一圈凸极，无绕组、
   * 无换向器、无电刷），所以它比直流发电机省掉了电刷那处磨损 —— 只剩轴承。
   */
  { id: 'std/frequency-converter-general', name: '中频发电机组', unit: '台', category: 'part',
    composedOf: [
      { item: 'std/frequency-converter-general/frame', qty: q(1) },
      { item: 'std/frequency-converter-general/stator', qty: q(1) },
      { item: 'std/frequency-converter-general/rotor', qty: q(1) },
      { item: 'std/bearing-general-p0', qty: q(2) },
    ] },
];

export const ROTARY_CONVERTER_ROUTES: readonly Route[] = [
  {
    /**
     * 旋转变流机：机座与磁极 → 电枢 → 换向器与电刷 → 总装试转。
     *
     *   机座与磁极   铸铁机座 + 硅钢磁极，极面磨平    plant/melting-furnace
     *   电枢         硅钢叠片铣槽 → 嵌绕组 → 压轴    plant/winder
     *   换向器与电刷 铜片铣楔、垫酚醛、车外圆；碳刷压制烧结  lathe
     *   总装试转     与驱动电机对接，测空载电压与换向火花  plant/robot
     *
     * 换向片之间的绝缘工业上用**云母**（耐热、耐磨、不碳化），本层没有云母 ——
     * 用酚醛垫片代：耐温差、电弧一烧就碳化，换向器寿命因此更短。
     */
    id: 'make/rectifier-rotary',
    name: '旋转变流机制造',
    produces: [{ item: 'std/rectifier-rotary-general', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'mat/silicon-steel-3si', qty: q(1) }] },
      { anyOf: [{ item: 'mat/enamel-wire', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/iron-ht200', qty: q(1) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(1) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1) }] },
      { anyOf: [{ item: 'std/bearing-general-p0', qty: q(2) }] },
    ],
    needs: ['plant/grinder'],
    steps: [
      { note_zh: '机座与磁极（铸铁、极面磨平）', performedBy: 'plant/melting-furnace' },
      { note_zh: '电枢叠片、嵌绕组、压轴', performedBy: 'plant/winder' },
      { note_zh: '换向器与电刷', performedBy: 'lathe' },
      { note_zh: '总装试转（测空载电压与换向火花）', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 中频发电机组：机座与磁极 → 凸极转子 → 定子绕组 → 总装试转。
     *
     * 与旋转变流机同构，但发电机是**感应子式**：转子没有绕组、没有换向器、
     * 没有电刷，只有一圈凸极。频率由转速 × 极数给：
     *
     *   3000 r/min × 20 极 = 1 kHz
     *
     * 所以它比直流发电机少两处磨损（电刷、换向器），只剩轴承。
     * 代价是效率与噪声：机组 80% 级，而半导体中频电源 92% 级。
     */
    id: 'make/frequency-converter',
    name: '中频发电机组制造',
    produces: [{ item: 'std/frequency-converter-general', qty: q(1) }],
    // 机座、定子、转子、轴承在条目 composedOf 上；铜 1 kg 是端子与引线。
    uses: [{ anyOf: [{ item: 'mat/copper', qty: q(1) }] }],
    needs: ['plant/grinder'],
    steps: [
      { note_zh: '装机座、定子、凸极转子与两只 P0 轴承', performedBy: 'plant/robot' },
      { note_zh: '接端子与引线', performedBy: 'plant/robot' },
      { note_zh: '总装试转（测空载频率）', performedBy: 'plant/robot' },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...ROTARY_CONVERTER_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...ROTARY_CONVERTER_ROUTES];
