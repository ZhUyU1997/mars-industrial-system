/**
 * 计算 —— 加法器、存储、以及一台最小计算机。
 *
 * ⚠️ **本条是旁支，不是必经之路。**
 *
 * 前提给的是不限量的机器人，而机器人自带控制器与算力 —— **它的算力可以直接用**。
 * 所以从零造计算机、造存储、造控制器，是"如果有天机器人坏了没人修"时的备用推演，
 * 不是这个体系的必经路径。保留它的理由只有一个：**它说明这条链在物理上成立**，
 * 而不是说明它必须被走一遍。
 *
 * 旁路掉的是"信息"，旁路不掉的是"料"与"工艺"：机器人不会替你长单晶、不会替你
 * 做光刻、也不会把热电偶插进炉子。前提给的只是"手"与"算"。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 到那时为止，这一层能"判断"、能"数"、能"存程序"，但不能"算"
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   与非门   回答"是/不是"
 *   计数器   会数数
 *   PROM     存程序（烧死的那种）
 *   运放     会做加减乘除的**模拟**版本（比例、积分）
 *
 * 缺的是**数字的算**：把两个数加起来。而这件事一旦有，就有插补 ——
 * 也就是那句话："插补要算，算要半导体。"
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 三件东西
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   加法器   4 位全加，约 40 个门，两级进位（行波进位，慢但够）
 *   存储     8 位动态移位寄存器 —— 用 MOS 的栅电容存电荷，靠时钟推着走
 *   计算机   累加器结构：ALU + 存储 + PROM + 时钟 + 输入输出
 *
 * 存储为什么选"移位寄存器"而不是"随机存取"：
 *
 *   静态 RAM（6 管/位）   要求六个管子阈值匹配 —— 说过了，**做不匀**
 *   动态移位（4 管/位）   电荷在 MOS 栅下存着，时钟一推就往后传一格
 *                         **它不要求匹配，只要求时钟准** —— 而时钟有石英
 *
 * 所以这一层的存储是**动态**的：要不断刷新（或者说，不断"推"），
 * 一停电数据就没了 —— 与 1970 年代的动态存储器一样，只是更慢更小。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 这台计算机能干什么
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   4 位字长、8 位地址（256 条指令）、每秒 1 万次加法
 *
 * 用今天的眼光看它慢得可笑。但它能做一件前面所有器件都做不到的事：
 *
 *   **在两个点之间算出一串中间点。**
 *
 * 这就是直线插补。而它意味着——机器人第一次不必"走到位置停住"，可以**边走边算**：
 * 从 A 到 B 的直线上，每 0.1 mm 给一个点，铣刀沿着走。
 *
 * ⚠️ 一处必须说清：这不是"连续轨迹控制"。真正的连续轨迹要每毫秒算一次、
 * 还要闭环跟随；这一台一秒算一万次加法，只够"每 50 ms 给一个点"，
 * 走出来的直线是**折线**（每 0.1 mm 一个台阶）。够铣粗糙轮廓，不够铣模具。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const COMPUTER_ITEMS: readonly Item[] = [
  /**
   * 4 位算术逻辑单元（ALU）。加法、减法、与、或、非，40 个门。
   *
   * 进位是行波式（一位一位传），所以 4 位加法要 4 级门延迟 —— 慢，但结构简单，
   * 而且**不需要匹配**：数字电路的容错比模拟大得多，门只要"能翻转"就行。
   */
  { id: 'std/alu-chip-general', name: '4 位算术逻辑单元', unit: '片', category: 'part',
    // 工艺节点取 5 µm 世代（与 std/photomask-general 的 3–5 µm 同一条线），门数 20–60。
    props: [{ param: 'node', kind: 'range', min: 5000, max: 5000, unit: 'nm', dir: 'atMost' }, { param: 'gates', kind: 'range', min: 20, max: 60, unit: '门' }], },

  /**
   * 8 位动态存储芯片。MOS 栅电容存电荷，时钟推着走，4 管一位。
   *
   * 与静态 RAM 的关键区别：**不要求管子匹配**，只要求时钟稳定。
   * 代价是要不停刷新，一停电就全丢。
   */
  { id: 'std/ram-chip-general', name: '8 位动态存储芯片', unit: '片', category: 'part',
    // 与 ALU 同一条 5 µm 线；4 管/位，门数按 8 位一片计 20–60。
    props: [{ param: 'node', kind: 'range', min: 5000, max: 5000, unit: 'nm', dir: 'atMost' }, { param: 'gates', kind: 'range', min: 20, max: 60, unit: '门' }], },

  /**
   * 最小计算机。4 位累加器 + 256 字程序存储器 + 8 位数据存储 + 时钟 + 输入输出。
   *
   * 它是本层第一个**会算**的东西 —— 而在它之前，"算"要么靠人，
   * 要么靠模拟电路（运放做加减乘除，但那是连续的、不精确的）。
   */
  { id: 'std/computer-general', name: '最小计算机', unit: '台', category: 'part',
    composedOf: [
      { item: 'std/alu-chip-general', qty: q(2) },
      { item: 'std/ram-chip-general', qty: q(4) },
      { item: 'std/prom-chip-general', qty: q(2) },
      { item: 'std/counter-chip-general', qty: q(2) },
      { item: 'std/quartz-resonator-general', qty: q(1) },
      { item: 'std/analog-mux-chip-general', qty: q(1) },
      { item: 'std/contactor-general', qty: q(4) },
    ] },
];

export const COMPUTER_ROUTES: readonly Route[] = [
  {
    /**
     * 加法器：40 个门做在一片硅上。
     *
     *   硅片 1 片 → 芯片 40 片（门数多，管芯大）
     */
    id: 'make/alu-chip',
    name: '4 位算术逻辑单元制造',
    produces: [{ item: 'std/alu-chip-general', qty: q(40), gives: [{ param: 'node', kind: 'range', min: 5000, max: 5000 }, { param: 'gates', kind: 'range', min: 20, max: 60 }] }],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/photoresist-sodium-free', qty: q(1) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(1) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1) }] },
      { anyOf: [{ item: 'mat/nitric-acid', qty: q(1) }] },
      { anyOf: [{ item: 'mat/pocl3', qty: q(1) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1) }] },
      { anyOf: [{ item: 'mat/hcl', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ultrapure-water', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/bonding-wire', qty: q(1) }] },
      { anyOf: [{ item: 'std/metal-can-general', qty: q(40) }] },
    ],
    needs: ['std/photomask-general', 'plant/clean-room', 'plant/evaporator'],
    steps: [
      { note_zh: '① 双极型门阵列（隔离 / 基区 / 发射区）', performedBy: 'plant/diffusion-furnace', under: [{ param: 'temperature', min: 1000, max: 1100 }] },
      { note_zh: '② 引线孔 + 铝 1', performedBy: 'plant/mask-aligner' },
      { note_zh: '③ PSG 钝化（300–400）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 300, max: 400 }] },
      { note_zh: '④ 划片封装 + 逐片测真值表（16 种输入全测）', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '硅片 1 片（约 60 个管芯）→ 芯片 40 片；余 20 是门失效与封装废品',
  },
  {
    /**
     * 动态存储：4 管一位、8 位一片。
     *
     *   硅片 1 片 → 芯片 60 片
     *
     * 每一级是"MOS 开关 + 栅电容"，时钟两相（φ1 传、φ2 存）。
     * 在位片上，电容器就是**加厚的栅氧**（0.2 µm）—— 不需要单独的电容工艺。
     */
    id: 'make/ram-chip',
    name: '8 位动态存储芯片制造',
    produces: [{ item: 'std/ram-chip-general', qty: q(60), gives: [{ param: 'node', kind: 'range', min: 5000, max: 5000 }, { param: 'gates', kind: 'range', min: 20, max: 60 }] }],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/photoresist-sodium-free', qty: q(1) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(1) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1) }] },
      { anyOf: [{ item: 'mat/nitric-acid', qty: q(1) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1) }] },
      { anyOf: [{ item: 'mat/hcl', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ultrapure-water', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/bonding-wire', qty: q(1) }] },
      { anyOf: [{ item: 'std/metal-can-general', qty: q(60) }] },
    ],
    needs: ['std/photomask-general', 'plant/clean-room', 'plant/evaporator'],
    steps: [
      { note_zh: '① 场氧 + 有源区', performedBy: 'plant/diffusion-furnace', under: [{ param: 'temperature', min: 1000, max: 1100 }] },
      { note_zh: '② 厚栅氧 0.2 µm（当电容用）', performedBy: 'plant/diffusion-furnace', under: [{ param: 'temperature', min: 950, max: 1000 }] },
      { note_zh: '③ 铝栅与互连', performedBy: 'plant/mask-aligner' },
      { note_zh: '④ PSG 钝化 + 划片封装 + 测保持时间（不断电、断时钟，看数据活多久）', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '硅片 1 片（约 80 个管芯）→ 芯片 60 片；余 20 是保持时间过短（漏电）',
  },
  {
    /**
     * 最小计算机：四块板拼起来。
     *
     *   ALU 2 片 + 存储 4 片（32 位数据）+ PROM 2 片（512 条程序）
     *   + 计数器 2 片（程序计数器）+ 时钟 1 只 + 模拟开关 + 铜 + 板
     *
     * 它是一台**累加器机**：所有运算都在一个累加器里做，与 1950 年代的机器同构。
     * 而它的装配难点不在电路，在**时序**：四个芯片的时钟要同相，
     * 所以时钟从一处出、用等长线分到各处 —— **等长线是本层第一次遇到"布线也是设计"**。
     */
    id: 'make/computer',
    name: '最小计算机制造',
    produces: [{ item: 'std/computer-general', qty: q(1) }],
    // 装配件在条目的 composedOf 上；这里只留不可逆加工消耗的铜与薄钢板。
    uses: [
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
    ],
    needs: ['std/curve-tracer-general'],
    steps: [
      { note_zh: '板与插座（插座让芯片能换）', performedBy: 'plant/robot' },
      { note_zh: '等长时钟分配（四条线一样长）', performedBy: 'plant/robot' },
      { note_zh: '接线与上电（先测时钟，再测总线）', performedBy: 'plant/robot' },
      { note_zh: '烧 PROM：装入引导程序（读入、加法、输出、跳转）', performedBy: 'plant/robot' },
      { note_zh: '跑测试程序（从 1 加到 100，看结果对不对）', performedBy: 'plant/robot' },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...COMPUTER_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...COMPUTER_ROUTES];
