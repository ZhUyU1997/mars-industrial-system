/**
 * 熔丝 PROM —— 程序第一次能被"烧"进一块芯片。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 之前几种"程序"都长什么样
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   凸轮程序器   程序是凸轮的形状 —— 换程序要换凸轮，车工活
 *   继电器逻辑   程序是接线的走法 —— 换程序要改线，电工活
 *   分立/集成门  程序还是接线 —— 芯片只是把门做小了
 *
 * 这三种的共同点：**程序是"结构"**。而 PROM 让程序变成**数据** ——
 * 同一个芯片，熔丝烧断的组合不同，就是不同的程序。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 熔丝怎么做：镍铬薄膜
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 双极 PROM 的存储单元是一个**熔丝**：通电流烧断 = 0，留着 = 1。
 *
 *   材料   镍铬合金薄膜（本层有：`mat/resistance-wire` 就是镍铬丝）
 *   做法   真空蒸镀一层 0.1 µm 的镍铬，光刻成细条（宽 5 µm，长 20 µm）
 *   烧断   通 100 mA、10 ms 的脉冲 —— 细条中间熔断，断口处氧化，不再通
 *
 * 镍铬做熔丝是个好选择：电阻率高（同样的电流发热多）、熔点 1400 °C、
 * 烧断后形成的氧化铬是绝缘的 —— **断了就不会自己接回去。**
 *
 * ⚠️ 这是一次性存储器：烧断不可逆。改程序只能换一片，或者把没烧的丝留着
 * （所以 PROM 出厂时全 1，烧掉的是 0）。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 它在这层体系里的位置
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 一片 32×8 = 256 位的 PROM，够存什么？
 *
 *   一个 16 步的点位程序（每步 8 位：动作 + 目标工位 + 延时档）
 *
 * 也就是说：**机器人的动作顺序第一次可以"写"进去，而不是"刻"进去。**
 * 凸轮那一版的程序是钢的形状，这一版的程序是烧断的丝 —— 后者可以复制、
 * 可以核对（烧之前先读一遍）、可以归档（留一张烧断图）。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const PROM_ITEMS: readonly Item[] = [
  /**
   * 熔丝 PROM，32×8 = 256 位。双极型，镍铬熔丝，金属帽封装。
   *
   * 出厂全 1（所有丝完好）；编程就是按图把该是 0 的丝烧断。
   * 一次性的 —— 所以每一片都要先算清楚，再烧。
   */
  { id: 'std/prom-chip-general', name: 'Fuse PROM', name_zh: '熔丝 PROM', unit: '片', category: 'part',
    // 5 µm 世代（与 std/photomask-general 的 3–5 µm 同一档），门数 8–40。
    props: [{ param: 'node', kind: 'range', min: 5000, max: 5000, unit: 'nm', dir: 'atMost' }, { param: 'gates', kind: 'range', min: 8, max: 40, unit: '门' }], },
];

export const PROM_ROUTES: readonly Route[] = [
  {
    /**
     * PROM：在普通双极工艺上加两层 —— 镍铬熔丝层与编程。
     *
     *   硅片 1 片 → 芯片 30 片（256 位的那一版，管芯比 40 门计数器大）
     *
     * 比计数器芯片多两道：**蒸镍铬 + 光刻成丝**（第五张版），以及**编程**。
     * 编程不在晶圆上做 —— 是封装之后一片一片烧的，所以它写在最后一步。
     */
    id: 'make/prom-chip',
    name: 'Fuse PROM Manufacturing', name_zh: '熔丝 PROM 制造',
    produces: [{ item: 'std/prom-chip-general', qty: q(30), gives: [{ param: 'node', kind: 'range', min: 5000, max: 5000 }, { param: 'gates', kind: 'range', min: 8, max: 40 }] }],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/photoresist', qty: q(1) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(1) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1) }] },
      { anyOf: [{ item: 'mat/nitric-acid', qty: q(1) }] },
      { anyOf: [{ item: 'mat/pocl3', qty: q(1) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1) }] },
      { anyOf: [{ item: 'mat/spin-on-glass', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      // 熔丝层：镍铬丝既是蒸发源，也是熔丝材料本身。
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1) }] },
      { anyOf: [{ item: 'mat/bonding-wire', qty: q(1) }] },
      { anyOf: [{ item: 'std/metal-can-general', qty: q(30) }] },
    ],
    // 五张版：隔离、基区、发射区、引线孔、熔丝。
    needs: ['std/photomask-general', 'plant/evaporator'],
    steps: [
      { note_zh: '① 晶体管阵列（隔离 / 基区 / 发射区三道扩散）', performedBy: 'plant/diffusion-furnace', under: [{ param: 'temperature', min: 1000, max: 1100 }] },
      { note_zh: '② 引线孔 + 铝 1 + 反刻', performedBy: 'plant/mask-aligner' },
      { note_zh: '③ 旋涂玻璃 + 通孔', performedBy: 'plant/mask-aligner' },
      { note_zh: '④ 蒸镍铬 0.1 µm + 光刻成丝（5 × 20 µm）', performedBy: 'plant/mask-aligner' },
      { note_zh: '⑤ 钝化、划片、装架、键合、封帽', performedBy: 'plant/robot' },
      { note_zh: '⑥ **编程**：按图逐位通 100 mA 烧断熔丝，烧完读回核对', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '硅片 1 片（约 40 个管芯）→ 芯片 30 片；余 10 是熔丝宽度超差与编程烧错',
  },
  {
    /**
     * 机器人控制柜（PROM 版）。**第五条来路：程序成了数据。**
     *
     *   凸轮版     程序是凸轮形状，换程序 = 车工活
     *   继电器版   程序是接线，换程序 = 电工活
     *   分立版     二十只管子，几十个可调点
     *   集成版     4 门芯片搭顺序，程序仍是接线
     *   PROM 版    **程序在芯片里**：16 步、每步 8 位，烧进去
     *
     * 它仍然是点位控制（插补要算，算要更多门），但它第一次让"换一个活"
     * 不需要动机械、也不需要动线 —— 只要烧一片新芯片。
     */
    id: 'make/robot-controller-prom',
    name: 'Robot Control Cabinet Manufacturing', name_zh: '机器人控制柜制造',
    produces: [{ item: 'plant/robot/controller', qty: q(1), gives: [{ param: 'dof', kind: 'range', min: 6, max: 6 }] }],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'std/prom-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(4) }] },
      { anyOf: [{ item: 'std/selsyn-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/robot',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...PROM_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...PROM_ROUTES];
