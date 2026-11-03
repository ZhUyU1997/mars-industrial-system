/**
 * 集成电路 —— 第一块把"器件"变成"电路"的片子。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 集成不是"把分立件做小"，是"不再有连线"
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 分立板的问题不在体积，在**每一个焊点/绕接点都是一个不确定的东西**：
 *
 *   分立板   20 只管子、60 个电阻、几百个绕接点   每块板几十个可调点，换一块要重调
 *   集成块   4 只管子、2 个电阻、6 个引线          一次扩散同时做出全部器件
 *
 * 关键在最后那半句：**所有器件是同一批工序同时做出来的**。基区宽度、发射区宽度、
 * 电阻条宽 —— 全由同一次光刻决定，所以它们彼此"匹配"，而分立件再好也匹配不了。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 隔离：pn 结反向偏置
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   1958 基尔比   用键合线连，本质还是分立
 *   1959 诺伊斯   平面工艺 + **pn 结隔离**：每个器件埋在一个反偏的 pn 结"井"里
 *
 * 本层做第二种。代价是每个器件占的面积大一圈（井要包住器件），井的电容让速度上不去。
 * **没有外延炉，所以没有埋层** —— 集电极串联电阻大，这是这条链速度慢的根。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 晶圆工艺与封装已经拆开
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 那时候这两段挤在一条路线里（最后一步"划片、装架、键合、封帽"），于是
 "换个封装"就得改整条路线。后来把它们拆成：
 *
 *   晶圆工艺   make/ic-die        硅片 → 裸片（data/material/package.ts）
 *   封装       make/logic-chip   / make/logic-chip-hermetic   裸片 → 芯片
 *
 * 本文件只剩条目与"用它做什么"。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const IC_ITEMS: readonly Item[] = [
  /**
   * 集成逻辑芯片（4 个 RTL 与非门，5 µm，pn 结隔离）。
   *
   * 它是本层第一块"电路"，而不是"器件" —— 十只晶体管加两个电阻做在同一片硅上，
   * 彼此的关系由版决定，不由连线决定。
   *
   * 封装有两种：酚醛压铸（`make/logic-chip`）与金属帽气密（`make/logic-chip-hermetic`），
   * 同一个产出、两条来路 —— 选哪种取决于用在哪。
   */
  { id: 'std/logic-chip-general', name: 'Integrated Logic Chip', name_zh: '集成逻辑芯片', unit: '片', category: 'part',
    // 规格按行业口径分两条轴：工艺节点 node（5 µm 世代）、集成度 gates（10–50 门/片）。
    props: [{ param: 'node', kind: 'range', min: 5000, max: 5000, unit: 'nm', dir: 'atMost' }, { param: 'gates', kind: 'range', min: 10, max: 50, unit: '门' }], },
];

export const IC_ROUTES: readonly Route[] = [
  {
    /**
     * 机器人控制柜（计算机版）。**第六条来路：会算，所以能插补。**
     *
     *   计算机 1 台 + 接触器 4 只 + 自整角机 2 只 + 伺服驱动
     *
     * 前面五条来路都只能点位（走到位置、停住、干一下），因为它们**不会算**。
     * 这一条会：计算机把起点到终点的直线，按每 0.1 mm 算成几百个中间点，
     * 一个点一个点地给自整角机 —— 于是刀具能**沿着直线走**，而不是"从 A 跳到 B"。
     *
     * ⚠️ 它是折线，不是连续轨迹：每 50 ms 给一个点，走出来的直线有 0.1 mm 的台阶。
     * 够铣粗糙轮廓，不够铣模具。那句"插补要算，算要半导体"到这里才算有了下半句：
     * **算有了，但算得太慢。**
     */
    id: 'make/robot-controller-computer',
    name: 'Robot Control Cabinet Manufacturing', name_zh: '机器人控制柜制造',
    produces: [{ item: 'plant/robot/controller', qty: q(1), gives: [{ param: 'dof', kind: 'range', min: 6, max: 6 }] }],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'std/computer-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(4) }] },
      { anyOf: [{ item: 'std/selsyn-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
  },
  {
    /**
     * 绕线机控制（集成版）。**第三条来路：把机械计数器换成一块芯片。**
     *
     *   机械计数器版   凸轮 + 字轮，不能预置，要人盯着
     *   分立元件版     二十只管子搭计数与译码，一块板几十个可调点
     *   集成版         四个与非门做四位计数 + 译码，一片芯片 + 两只接触器
     *
     * 换向仍然靠接触器（电机的正反转是大电流，芯片管不了），
     * 变的只是"数圈数"这一件事 —— 而它恰好是集成电路最擅长的：**计数。**
     */
    id: 'make/winder-control-ic',
    name: 'Winder Counting and Traverse Control Manufacturing', name_zh: '绕线机计数与排线控制制造',
    produces: [{ item: 'plant/winder/control', qty: q(1) }],
    uses: [
      // 两片 4 门芯片搭计数与译码，或一片 40 门的计数器芯片（两层铝）。
      // 后者省板子、省键合点，也省掉两片之间的连线 —— 那是分立板最后一处不确定。
      { anyOf: [{ item: 'std/logic-chip-general', qty: q(2) }, { item: 'std/counter-chip-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...IC_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...IC_ROUTES];
