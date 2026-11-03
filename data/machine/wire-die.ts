/**
 * 拉丝模 —— 本层那处"从地球带"的缺口里最常被提起的一个。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 它为什么重要
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 拉丝模是"把粗丝拉成细丝"的那只孔。没有它，这些全停：
 *
 *   漆包线     电机的绕组
 *   电阻丝     电阻、电炉、加热丝
 *   键合丝     φ25 µm，芯片的引线
 *   钢丝       钢丝绳、弹簧、锯条
 *
 * 而数据里前后四处写着同一句话："拉丝模是硬质合金，从地球带。"
 * **四处都写着，说明这不是某一处的缺口，是一整条的入口。**
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 而硬质合金本层有
 * ═══════════════════════════════════════════════════════════════════════
 *
 * `mat/tungsten-carbide` 早就有了（刀片那条线）：碳化钨 + 镍粘结剂，压制烧结。
 * 所以缺的从来不是"硬质合金"，是**把一只孔磨到 1 µm 的那道手艺**：
 *
 *   模芯     碳化钨圆环，压制烧结（与刀片同一条线）
 *   磨孔     用**分级过的碳化硅**（水选：细的悬浮在上面，按沉降时间取）
 *            穿一根细铜丝往复拉磨，孔径由磨料粒径定
 *   钢套     45 钢套热镶（加热套、塞入模芯、冷却收紧）—— 硬质合金脆，要箍住
 *   检验     **拉一段丝量直径** —— 模子的精度最终由它拉出的丝证明
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 两处降级
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ① **没有金刚石研磨膏**。工业上模具孔最后用金刚石抛光（1 µm 以下），
 *    本层只有碳化硅（最细到 ~5 µm）。所以**模孔的最终光洁度差一档**，
 *    拉出来的细丝表面有轻微划痕 —— 对漆包线无碍，对 φ25 µm 键合丝是致命的。
 *
 * ② **分级靠沉降，不靠离心**。水选分级的粒径分布宽（±50%），所以同一批模具
 *    的孔径不一致 —— **要一只一只拉丝校验、分级使用**。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const DIE_ITEMS: readonly Item[] = [
  /**
   * 硬质合金拉丝模。模芯（碳化钨）+ 钢套（45 钢热镶），孔径按用途分档。
   *
   * 它是**工具**：一只模子能拉几吨丝，磨损了就换（磨孔重磨一次还能用一轮）。
   * 所以它在数据里进 `needs`，不进 `uses`。
   */
  { id: 'std/wire-die-general', name: 'Cemented Carbide Wire Drawing Die', name_zh: '硬质合金拉丝模', unit: '件', category: 'part' },
];

export const DIE_ROUTES: readonly Route[] = [
  {
    /**
     * 拉丝模：模芯烧结 → 磨孔 → 热镶 → 检验。
     *
     *   碳化钨 1 + 45 钢 1 + 碳化硅 1 + 铜丝 1 → 模子 20 只
     *
     * 磨孔是全程最慢的一步：一只孔要磨几小时，而磨料越细越慢。
     * **这是本层第一件"以工时换精度"的零件** —— 它的成本不在材料，在时间。
     */
    id: 'make/wire-die',
    name: 'Cemented Carbide Wire Drawing Die Manufacturing', name_zh: '硬质合金拉丝模制造',
    produces: [{ item: 'std/wire-die-general', qty: q(20) }],
    uses: [
      { anyOf: [{ item: 'mat/tungsten-carbide', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-45', qty: q(1) }] },
      { anyOf: [{ item: 'mat/silicon-carbide', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
    ],
    // 检验在恒温间里做：孔径要测量，而 1 µm 级的测量离不开 20 ± 1 °C。
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '模芯压制与烧结（与刀片同一条线）', performedBy: 'plant/robot' },
      { note_zh: '磨孔：水选分级碳化硅 + 铜丝往复（几小时一只）', performedBy: 'plant/robot' },
      { note_zh: '钢套热镶（加热到 500，套入模芯，冷却收紧）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 480, max: 520 }] },
      { note_zh: '检验：每只拉一段丝、量直径、按孔径分档', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    unbalanced_zh: '碳化钨 1 + 钢 1 + 碳化硅 1 + 铜丝 1 → 模子 20 只；余是磨料损耗与孔径超差报废（约 1/3）',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...DIE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...DIE_ROUTES];
