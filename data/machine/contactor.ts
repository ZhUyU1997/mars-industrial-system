/**
 * 接触器 —— 用电磁铁代替半导体的那个开关。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 它替换的是功率器件在一半场合里的活
 * ═══════════════════════════════════════════════════════════════════════
 *
 * `std/power-device-general`（晶闸管、IGBT）管两件事：**通断**与**调压**。
 * 而这层的大部分负载只要通断：
 *
 *   电阻炉的通电与断电     只要通断
 *   窑的鼓风机启停         只要通断
 *   水泵、风机、压缩机的启停 只要通断
 *
 * 通断不需要半导体 —— 一对触点 + 一个电磁铁就够了。这就是接触器，
 * 而它是**做得出来的**：线圈是漆包线，铁芯是硅钢片，触点是钨铜。
 * 三样本层都有（见 data/material/passive.ts 的邻居与 data/material/tungsten.ts）。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 结构：一个电磁铁拉一组触点
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   线圈     AC 24 或 220 V，绕在塑料骨架上 —— 通电产生磁场
 *   铁芯     E 形硅钢叠片 + 衔铁 —— 磁场把衔铁吸下来
 *   触点     三对主触点（钨铜，抗电弧）+ 一对常闭辅助触点
 *   灭弧罩   陶瓷或酚醛壳，把电弧拉长、冷却、切断
 *   弹簧与导轨  断电时把衔铁弹回，触点复位
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 三处降级
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ① **触点用钨铜，不用银**。银是所有触点金属里最好的（电阻低、不氧化），
 *    而火星没有银（铅锌链没建）。钨铜抗电弧、耐烧蚀，但接触电阻高一个量级 ——
 *    通断能力够，长期通电时的温升偏高。
 * ② **弹簧用 40Cr，不用 60Si2Mn**。弹簧钢要硅锰，本层没有配；40Cr 淬火回火
 *    能当弹簧用，但弹性衰减快 —— 触点的压力会一年比一年小。
 * ③ **没有灭弧计算**。灭弧罩的尺寸靠试：拉弧长短、栅片间距，都是"做大了不心疼"。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 它为什么比热电偶值得先做
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 热电偶做得出来、读不出来。接触器不需要"读"，只需要"动作" ——
 * 线圈通电，衔铁吸合，触点闭合。**它的输出是机器的启停，不是数字。**
 * 所以它能真的接进产线，而热电偶要先等仪表链。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const CONTACTOR_ITEMS: readonly Item[] = [
  /**
   * 交流接触器，三极，额定电流一档（与 7.5 kW 电机配套）。
   *
   * 规格写"一档"而不是具体安数：与电机只造 7.5 kW 一种同理 —— 本层真正要的
   * 是**备件统一**，而不是每一台负载都精确匹配。
   */
  { id: 'std/contactor-general', name: 'AC Contactor', name_zh: '交流接触器', unit: '件', category: 'part',
    props: [{ param: 'ratedCurrent', kind: 'range', min: 6, max: 400, unit: 'A' }] },
];

export const CONTACTOR_ROUTES: readonly Route[] = [
  {
    /**
     * 接触器：铁芯与衔铁 → 线圈 → 触点 → 装配调试。
     *
     * 四道工序，四台设备，各管一件：
     *
     *   铁芯与衔铁  E 形硅钢片铣槽叠压，极面磨平 —— 极面不平会嗡嗡响、发热
     *   线圈        漆包线绕在骨架上，匝数决定吸合电流
     *   触点        钨铜压制烧结件车成弧形，一对两片
     *   装配与调试  机器人手工：调极面间隙（0.1–0.3 mm）、测吸合电压、试通断
     */
    id: 'make/contactor',
    name: 'AC Contactor Manufacturing', name_zh: '交流接触器制造',
    produces: [{ item: 'std/contactor-general', qty: q(1), gives: [{ param: 'ratedCurrent', kind: 'range', min: 10, max: 60, dir: 'atLeast' }] }],
    uses: [
      { anyOf: [{ item: 'mat/silicon-steel-3si', qty: q(1) }] },
      { anyOf: [{ item: 'mat/enamel-wire', qty: q(1) }] },
      { anyOf: [{ item: 'mat/tungsten-powder', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1) }] },
      { anyOf: [{ item: 'mat/steel-40cr', qty: q(1) }] },
      // 灭弧罩与触点座用氧化铝瓷，不用酚醛：灭弧室的温度几百到上千度，
      // 酚醛会碳化，一碳化就导电 —— 电弧直接沿着罩子爬出来。
      { anyOf: [{ item: 'std/alumina-insulator-general', qty: q(2) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '铁芯与衔铁（铣槽叠压、磨极面）', performedBy: 'plant/milling-machine' },
      { note_zh: '线圈绕制', performedBy: 'plant/winder' },
      { note_zh: '触点（钨铜烧结件车磨）', performedBy: 'lathe' },
      { note_zh: '装配与调试', performedBy: 'plant/robot' },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...CONTACTOR_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...CONTACTOR_ROUTES];
