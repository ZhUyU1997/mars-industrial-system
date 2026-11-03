/**
 * 无钠感光胶与 MOS —— 那道墙的入口，原来是重铬酸钠里的钠。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 钠是从哪来的
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 钠是 MOS 做不出来的墙。当时只把钠归到"器皿、人、空气"，
 * 漏了最直接的一处：**感光胶自己就含钠** —— 交联剂是重铬酸**钠**。
 *
 *   Na₂Cr₂O₇ + 酚醛 → 胶   每公斤胶带几克钠，而 MOS 的栅氧对钠的容忍是 10¹⁰ /cm² 级
 *
 * 而把钠换成铵就行：
 *
 *   Na₂Cr₂O₇ + H₂SO₄ → 2CrO₃ + Na₂SO₄ + H₂O     （铬酸，结晶析出，钠留在母液里）
 *   2CrO₃ + 2NH₃ + H₂O → (NH₄)₂Cr₂O₇             （重铬酸铵）
 *
 * **同一支胶，换一个阳离子，钠没有了。** 这件事在数据里就是两条路线。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 剩下的墙：阈值电压
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 有了无钠胶、18 MΩ 水、洁净间，MOS 就"能做了" —— 但只是**最老的那一种**：
 *
 *   铝栅 PMOS/NMOS（1963）   源漏扩散 → 栅氧 → 蒸铝栅 → 400–500 °C 合金
 *
 * 没有离子注入，阈值电压靠**衬底掺杂浓度与栅氧厚度**给：
 *
 *   栅氧 100 nm、衬底 10¹⁵ cm⁻³ → Vth ≈ 1–2 V，**片间离散 ±0.5 V**
 *
 * 所以它做得出、做不匀。而"做不匀"对数字电路是致命的（同一块芯片上的管子
 * 阈值要一致），所以这一层做出来的 MOS 只能当**分立管**用，不能做 MOS 集成电路。
 *
 * ⚠️ 一处必须写的：栅氧 100 nm 是**干氧 1000 °C 约 1 小时**。而本层没有时间维度，
 * 所以这一小时只能在注释里 —— 它是这条路线里最要紧的一个数。
 *
 * ⚠️ 另一处：铝栅不能承受源漏扩散的 1000 °C，所以顺序必须是"先扩散、后栅氧、再铝栅"。
 * **工艺顺序本身就是一个器件设计**，这是晶闸管之后的第二次。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const MOS_ITEMS: readonly Item[] = [
  /**
   * 重铬酸铵。橙红色晶体，感光性与重铬酸钠相同，**但不带钠**。
   *
   * 它在数据里的意义只有一条：让感光胶不再往硅片上撒钠。
   */
  { id: 'mat/ammonium-dichromate', name: '重铬酸铵', unit: 'kg', category: 'material' },

  /**
   *   无钠感光胶。重铬酸铵 + 酚醛，其余与那支一样。
   *
   * 见光交联（负胶）、碱水显影，5 µm 级分辨率 —— 与钠盐版没有区别，除了钠。
   */
  { id: 'mat/photoresist-sodium-free', name: '无钠感光胶', unit: 'kg', category: 'material' },

  /**
   * n 沟道增强型 MOS 管（铝栅，5 µm，栅氧 100 nm）。
   *
   * 它是本层第一只**场效应**器件 —— 前面所有的管子都是双极型（电流控制电流），
   * 这一只是电压控制电流。而它的意义不在参数，在"输入不取电流"：
   * **高输入阻抗，是模拟电路与存储器的基础。**
   */
  { id: 'std/mos-transistor-general', name: 'n 沟道增强型 MOS 管', unit: '件', category: 'part' },

  /**
   * 8 路模拟开关芯片。8 对 MOS + 3-8 译码，一只片子把 8 个输入接到一个输出。
   *
   * 它是 MOS 在本层最合适的一件活：**模拟开关不要求管子彼此一样** ——
   *   只要每一路的导通电阻够低、关断够干净就行。而 Vth 的离散
   * 在这里不致命，因为每一路都是单独接通的。
   *
   * 于是它做成了双极型做不了的事：**一只仪表轮流看八个点。**
   */
  { id: 'std/analog-mux-chip-general', name: '8 路模拟开关芯片', unit: '片', category: 'part' },
];

export const MOS_ROUTES: readonly Route[] = [
  {
    /**
     * 8 路模拟开关：MOS 阵列 + 译码 + 电平移位。
     *
     *   硅片 1 片 → 芯片 80 片（开关阵列的管芯小）
     *
     * 译码用双极型（二极管或门），开关用 MOS —— **同一片上有两种器件**，
     * 这是本层第一次。而它恰好说明 MOS 的用处：**双极型做开关会有失调电压，
     * MOS 没有**（因为它不靠 pn 结导通，靠沟道）。
     */
    id: 'make/analog-mux',
    name: '8 路模拟开关芯片制造',
    produces: [{ item: 'std/analog-mux-chip-general', qty: q(80) }],
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
      { anyOf: [{ item: 'std/metal-can-general', qty: q(80) }] },
    ],
    needs: ['std/photomask-general', 'plant/clean-room', 'plant/evaporator'],
    steps: [
      { note_zh: '① 场氧 + 源漏扩散（MOS 与双极型共用同一批工序）', performedBy: 'plant/diffusion-furnace', under: [{ param: 'temperature', min: 1000, max: 1100 }] },
      { note_zh: '② 栅氧（掺 HCl）+ 有源区光刻', performedBy: 'plant/diffusion-furnace', under: [{ param: 'temperature', min: 950, max: 1000 }] },
      { note_zh: '③ 铝栅与互连（一层铝）', performedBy: 'plant/mask-aligner' },
      { note_zh: '④ PSG 钝化 + 划片封装 + 逐路测导通电阻', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 300, max: 400 }] },
    ],
    unbalanced_zh: '硅片 1 片（约 100 个管芯）→ 芯片 80 片；余 20 是导通电阻超差与栅氧击穿',
  },
  {
    /**
     * 重铬酸铵：重铬酸钠 + 硫酸 → 铬酸（结晶）→ 通氨 → 重铬酸铵（结晶）。
     *
     *   重铬酸钠 500 + 硫酸 260 + 氨 90 → 重铬酸铵 400
     *
     * 关键在第一步的**结晶**：铬酸析出、硫酸钠留在母液里，钠就这样被分掉。
     * 一次结晶不够，要两次 —— **这是"用结晶做纯化"在本层的第一个例子**，
     * 与量块的"用比较做精度"是同一种思路：不引入新东西，只反复分。
     */
    id: 'make/ammonium-dichromate',
    name: '重铬酸铵制备',
    produces: [
      { item: 'mat/ammonium-dichromate', qty: q(400) },
      {
        item: 'mat/sodium-sulfate-mother-liquor',
        qty: q(450),
        gives: [
          { param: 'sodiumSulfate', kind: 'range', min: 10, max: 20 },
          { param: 'form', kind: 'enum', oneOf: ['solution'] },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/sodium-dichromate', qty: q(500) }] },
      { anyOf: [{ item: 'mat/sulfuric-acid', qty: q(260) }] },
      { anyOf: [{ item: 'mat/ammonia', qty: q(90) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '铬酸：酸化 + 结晶（两次，钠留在母液里）', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 20, max: 80 }] },
      { note_zh: '通氨中和（放热，要冷却）', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 20, max: 60 }] },
      { note_zh: '结晶、离心、烘干', performedBy: 'plant/wet-bench', under: [{ param: 'temperature', min: 20, max: 120 }, { param: 'pressure', min: 100, max: 500 }] },
    ],
    unbalanced_zh: '重铬酸钠 500 + 硫酸 260 + 氨 90 → 重铬酸铵 400 + 硫酸钠母液 450（已单列 mat/sodium-sulfate-mother-liquor，可回硫酸钠结晶）',
  },
  {
    /**
     * 无钠感光胶：重铬酸铵 + 酚醛 + 超纯水。
     *
     *   重铬酸铵 50 + 酚醛 150 + 超纯水 800 → 胶 1000
     *
     * 水也用超纯水 —— 普通水里的钠比胶里还多。
     */
    id: 'make/photoresist-sodium-free',
    name: '无钠感光胶制备',
    produces: [{ item: 'mat/photoresist-sodium-free', qty: q(1000) }],
    uses: [
      { anyOf: [{ item: 'mat/ammonium-dichromate', qty: q(50) }] },
      { anyOf: [{ item: 'mat/phenolic-resin', qty: q(150) }] },
      { anyOf: [{ item: 'mat/ultrapure-water', qty: q(800) }] },
    ],
    needs: [],
    performedBy: 'plant/wet-bench',
  },
  {
    /**
     * MOS 管：先扩散源漏，再做栅氧，最后铝栅。
     *
     *   硅片 1 片（p 型，约 80 个管芯）→ MOS 60 只
     *
     * 为什么是这个顺序：**铝栅承受不了 1000 °C 的扩散**，所以栅必须最后放。
     * 而栅氧要在源漏扩散之后长，否则扩散的高温会破坏它 —— 顺序就是设计。
     *
     * 全流程用无钠胶、超纯水、洁净间；栅氧 100 nm，干氧 1000 °C 约一小时。
     */
    id: 'make/mos-transistor',
    name: 'n 沟道增强型 MOS 管制造',
    produces: [{ item: 'std/mos-transistor-general', qty: q(60) }],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/photoresist-sodium-free', qty: q(1) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(1) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1) }] },
      { anyOf: [{ item: 'mat/nitric-acid', qty: q(1) }] },
      { anyOf: [{ item: 'mat/pocl3', qty: q(1) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ultrapure-water', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/bonding-wire', qty: q(1) }] },
      { anyOf: [{ item: 'std/metal-can-general', qty: q(60) }] },
    ],
    needs: ['std/photomask-general', 'plant/clean-room', 'plant/evaporator'],
    steps: [
      { note_zh: '① 场氧（1 µm，干氧 1100）', performedBy: 'plant/diffusion-furnace', under: [{ param: 'temperature', min: 1050, max: 1100 }] },
      { note_zh: '② 有源区光刻（5 µm）', performedBy: 'plant/mask-aligner' },
      { note_zh: '③ 源漏扩散（POCl₃，1000–1050）', performedBy: 'plant/diffusion-furnace', under: [{ param: 'temperature', min: 1000, max: 1050 }] },
      { note_zh: '④ 栅氧（100 nm，干氧 1000）—— **这一步决定阈值，也决定成败**', performedBy: 'plant/diffusion-furnace', under: [{ param: 'temperature', min: 950, max: 1000 }] },
      { note_zh: '⑤ 引线孔光刻 + 蒸铝（栅与互连同一层）', performedBy: 'plant/mask-aligner' },
      { note_zh: '⑥ 铝栅反刻 + 合金（400–500）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 400, max: 500 }] },
      { note_zh: '⑦ 划片、封装、测试（测 Vth 与跨导）', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '硅片 1 片（约 80 个管芯）→ MOS 60 只；余 20 是栅氧击穿与阈值超差',
  },
  {
    /**
     * MOS（治钠版）：**氯化氢氧化 + 磷硅玻璃钝化**。
     *
     "胶里的钠"换掉了，但钠还有别的来路：气路、炉管、人。这一条是
     * 工业上对付它的两招，两招都用本层已有的东西：
     *
     *   ① 氯化氢氧化   干氧里掺 3–5% 的氯化氢。HCl 在高温下把钠变成挥发性的
     *                  氯化钠带走，同时钝化栅氧里的缺陷 —— **栅氧击穿率降一个量级**
     *   ② 磷硅玻璃钝化  300–400 °C 下 POCl₃ + O₂ 淀积一层掺磷的氧化硅。
     *                  磷硅玻璃是**钠的捕集器**：钠离子进来就被磷位"钉住"，
     *                  到不了栅氧下面。这是 1960 年代最有效的一招，到 1980 年代才被
     *                  氮化硅取代
     *
     * 代价：两道工序、两种料（HCl 与 POCl₃）、以及 PSG 层的厚度要均匀 ——
     * 而厚度均匀靠淀积温度与气流，模型里只有一个温度区间。
     *
     * 效果是具体的：**Vth 漂移从 ±0.5 V/月降到 ±0.1 V/月**，栅氧击穿率降一个量级。
     * 也就是说——它治的是"随时间变坏"，不是"一开始就不匀"。
     */
    id: 'make/mos-transistor-passivated',
    name: 'n 沟道增强型 MOS 管制造',
    produces: [{ item: 'std/mos-transistor-general', qty: q(70) }],
    uses: [
      { anyOf: [{ item: 'mat/silicon-wafer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/photoresist-sodium-free', qty: q(1) }] },
      { anyOf: [{ item: 'mat/naoh', qty: q(1) }] },
      { anyOf: [{ item: 'mat/hf', qty: q(1) }] },
      { anyOf: [{ item: 'mat/nitric-acid', qty: q(1) }] },
      { anyOf: [{ item: 'mat/pocl3', qty: q(1) }] },
      { anyOf: [{ item: 'mat/oxygen', qty: q(1) }] },
      // 两样治钠的料：氯化氢氧化掺的 HCl，与 PSG 用的 POCl₃（上面那一条已经算进 POCl₃）
      { anyOf: [{ item: 'mat/hcl', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ultrapure-water', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'mat/bonding-wire', qty: q(1) }] },
      { anyOf: [{ item: 'std/metal-can-general', qty: q(70) }] },
    ],
    needs: ['std/photomask-general', 'plant/clean-room', 'plant/evaporator'],
    steps: [
      { note_zh: '① 场氧（掺 HCl 3–5%，干氧 1100）', performedBy: 'plant/diffusion-furnace', under: [{ param: 'temperature', min: 1050, max: 1100 }] },
      { note_zh: '② 有源区光刻', performedBy: 'plant/mask-aligner' },
      { note_zh: '③ 源漏扩散（POCl₃，1000–1050）', performedBy: 'plant/diffusion-furnace', under: [{ param: 'temperature', min: 1000, max: 1050 }] },
      { note_zh: '④ 栅氧（100 nm，**掺 HCl 干氧**）', performedBy: 'plant/diffusion-furnace', under: [{ param: 'temperature', min: 950, max: 1000 }] },
      { note_zh: '⑤ 引线孔光刻 + 蒸铝', performedBy: 'plant/mask-aligner' },
      { note_zh: '⑥ 铝栅反刻 + 合金（400–500）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 400, max: 500 }] },
      // PSG 淀积只要 300–400 °C，不是扩散炉的温区 —— 用电阻炉（100–1100）。
      // 工业上是低压 CVD；本层没有真空炉管，所以只能在常压下做，膜厚均匀性差一档。
      { note_zh: '⑦ **磷硅玻璃钝化**（POCl₃ + O₂，300–400，掺磷氧化硅）', performedBy: 'plant/resistance-furnace', under: [{ param: 'temperature', min: 300, max: 400 }] },
      { note_zh: '⑧ 划片、封装、测试（测 Vth 与击穿）', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '硅片 1 片（约 80 个管芯）→ MOS 70 只；余 10 是 PSG 厚度不均与对位偏差',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...MOS_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...MOS_ROUTES];
