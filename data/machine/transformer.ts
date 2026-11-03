/**
 * 变压器 —— 电子元件那一档里第三个"不需要半导体"的件。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 它管的是"变压"这件事
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 前面已经把功率器件的两件事拆开了：通断归接触器、变频归中频发电机组。
 * 剩下的第三件是**变压** —— 而这件事从来不需要半导体：
 *
 *   硅钢叠片做铁芯，漆包线做绕组，绕组比决定电压比。就这么简单。
 *
 * 它一直没被建，是因为以前写在别人的注释里（"变压器本地造"），
 * 而数据里没有这一项 —— 于是焊机、整流器、中频电源都写着"加变压器"，
 * 却没有一条路线真的吃它。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 抽头：焊机要的那个"可调"
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 焊接电流靠抽头切换：初级绕组分几段，换一个抽头就换一个匝比，也就换一个电流档。
 *
 *   半导体焊机   电流连续可调，薄板细调
 *   抽头变压器   三到五档，档与档之间跳
 *
 * **这就是抽头让给半导体的地方**：不是能不能焊，是能不能细调。厚板够用，
 * 薄板会烧穿 —— 而本层要焊的是钢板、型钢与管道，薄板不是主要矛盾。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 一处降级
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 铁芯叠片之间要绝缘（否则涡流把铁芯烧热），工业上靠硅钢片表面的**绝缘涂层**。
 * 本层没有取向硅钢的涂层工艺，靠自然氧化膜顶着 —— 涡流损耗高一档，
 * 温升也高一档。与焊机那条路线里"铁芯本该用硅钢片"的旧注释是同一件事的两面。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const TRANSFORMER_ITEMS: readonly Item[] = [
  /**
   * 工频变压器，带抽头。规格按容量分档，本层只造一档（与电机只造 7.5 kW 同理）。
   *
   * 三个消费者：焊机（抽头换电流）、电解槽整流器（降压）、中频电源（隔离与匹配）。
   */
  { id: 'std/transformer-general', name: 'Power-Frequency Transformer', name_zh: '工频变压器', unit: '台', category: 'part',
    props: [{ param: 'ratedPower', kind: 'range', min: 1, max: 1000, unit: 'kVA' }] },
];

export const TRANSFORMER_ROUTES: readonly Route[] = [
  {
    /**
     * 变压器：铁芯叠片 → 绕组分段 → 浸漆烘干 → 装配。
     *
     *   铁芯   硅钢片剪成 E/I 形，交叠插紧，端面磨平    plant/milling-machine
     *   绕组   初级分三段引出抽头，次级一层次级        plant/winder
     *   浸漆   整机浸酚醛、烘干，固化绕组与铁芯        plant/kiln
     *   装配   插片、压紧、装外壳与接线端子            plant/robot
     */
    id: 'make/transformer',
    name: 'Power-Frequency Transformer Manufacturing', name_zh: '工频变压器制造',
    produces: [{ item: 'std/transformer-general', qty: q(1), gives: [{ param: 'ratedPower', kind: 'range', min: 5, max: 500, dir: 'atLeast' }] }],
    uses: [
      { anyOf: [{ item: 'mat/silicon-steel-3si', qty: q(1) }] },
      { anyOf: [{ item: 'mat/enamel-wire', qty: q(1) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '铁芯叠片（剪片、交叠、磨端面）', performedBy: 'plant/milling-machine' },
      { note_zh: '绕组分段（初级三抽头）', performedBy: 'plant/winder' },
      { note_zh: '浸漆烘干', performedBy: 'plant/kiln' },
      { note_zh: '装配（插片压紧、装壳与端子）', performedBy: 'plant/robot' },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...TRANSFORMER_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...TRANSFORMER_ROUTES];
