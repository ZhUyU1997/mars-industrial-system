/**
 * 时钟、基准、数字表 —— 数字系统缺的三块"胶"。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 有了门，还差什么
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 计数器、PROM、运放都有了，但一个数字系统还缺三样东西：
 *
 *   时钟   没有节拍，计数器就只是"每按一次加一"
 *   基准   没有标准，测出来的数只对得起自己
 *   显示   数出来了，得让人看得见（或让机械记录下来）
 *
 * 三样都能做，而且都用本层已有的东西：
 *
 *   石英谐振器  石英片切到 100 kHz，镀电极，装帽 —— 精度 10⁻⁵，比任何 RC 振荡器稳
 *   齐纳基准    **反偏的发射结**就是一支 6–7 V 的稳压管 —— 平面管白送的功能
 *   机械计数器  当显示用：每秒更新几次，慢，但不要发光材料
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 齐纳基准：晶体管的一个"副作用"
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 平面管的发射结是重掺杂的 p-n 结。反偏到 6–7 V 时它击穿 —— 而且是**可逆**的
 * （齐纳击穿，不是雪崩烧毁），击穿后电压几乎不随电流变。
 *
 * 所以做数字表不需要新工艺：**把一只晶体管的发射结反着用，它就是基准。**
 * 代价是它的温度系数（约 +2 mV/°C），要配一只正温度系数的电阻补偿 ——
 * 或者干脆装进恒温间（本层有，19–21 °C）。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 数字电压表：双斜积分
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 双斜积分是"用时间换精度"的经典办法：
 *
 *   ① 先对输入电压积分固定时间 T（计数器记满 N 个数）
 *   ② 再对**反向的基准电压**积分，直到回零 —— 回零用的时间正比于输入电压
 *
 * 所以精度只看两件事：时钟的稳定（石英，10⁻⁵）与基准的稳定（齐纳 + 恒温）。
 * **它不需要一组精密电阻** —— 这正是本层能做的原因：电阻做不精，时间可以。
 *
 * ⚠️ 显示用机械计数器：每秒更新 2–5 次，看得出跳字，读得慢。
 * 但它不要发光二极管（没有 GaAs）、不要辉光管（没有氖）。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const CLOCK_ITEMS: readonly Item[] = [
  /**
   * 石英谐振器（通用件）。一片有取向的单晶石英片，两面镀铝电极，封在金属帽里。
   *
   * 频率由切型与厚度定：X 切 N_X = 2.8 MHz·mm（100 kHz 对应 28 µm），
   * AT 切 N_AT = 1.67 MHz·mm（5 MHz 对应 334 µm）。两条产出路线见下：
   * `make/quartz-resonator`（32–1 000 kHz）与 `make/quartz-resonator-5mhz`
   * （4 900–5 100 kHz）。条目这里只声明 1–100 000 kHz 的总窗口。
   *
   * 精度 10⁻⁵（一天差一秒）—— 比 RC 振荡器的 1% 高三个数量级。
   * 切角决定频率温度系数：X 切在室温附近近似零；AT 切在 25 °C 附近是拐点。
   */
  { id: 'std/quartz-resonator-general', name: '石英谐振器', unit: '件', category: 'part',
    props: [{ param: 'frequency', kind: 'range', min: 1, max: 100000, unit: 'kHz' }] },

  /**
   * 齐纳基准，6.2 V。一只反偏的平面管发射结 + 恒温。
   *
   * 它不是一个"新器件"，是晶体管的一个用法：击穿是可逆的，电压几乎不随电流变。
   */
  { id: 'std/zener-reference-general', name: '齐纳基准', unit: '件', category: 'part' },

  /**
   * 补偿式数字毫伏表（铁皮滑线 + 星形检流计），本层基线设计。
   *
   * 条目名是“数字电压表”，实际量程只到 16 mV，是数字毫伏表，不是通用 DVM。
   * 整机由铸铁底座、面板框、字轮罩、铁皮滑线、千分螺丝、四个字轮、变速齿轮、
   * 星形检流计、热电堆与换向开关等件装配；零件与零件路线见
   * `data/machine/mech-dvm.ts`。
   */
  { id: 'std/dvm-general', name: '补偿式数字毫伏表', unit: '台', category: 'part',
    composedOf: [
      { item: 'std/dvm-general/base', qty: q(1) },
      { item: 'std/dvm-general/panel-frame', qty: q(1) },
      { item: 'std/dvm-general/wheel-cover', qty: q(1) },
      { item: 'std/dvm-general/galvanometer-cover', qty: q(1) },
      { item: 'std/dvm-general/scale', qty: q(1) },
      { item: 'std/dvm-general/micrometer-screw', qty: q(1) },
      { item: 'std/dvm-general/drum', qty: q(1) },
      { item: 'std/dvm-general/digit-wheel', qty: q(4) },
      { item: 'std/dvm-general/gear', qty: q(3) },
      { item: 'std/dvm-general/star-wheel', qty: q(1) },
      { item: 'std/dvm-general/slide-wire', qty: q(1) },
      { item: 'std/dvm-general/equalizing-bar', qty: q(1) },
      { item: 'std/dvm-general/ceramic-insulator', qty: q(6) },
      { item: 'std/dvm-general/wheel-bushing', qty: q(4) },
      { item: 'std/dvm-general/astatic-galvanometer', qty: q(1) },
      { item: 'std/dvm-general/changeover-switch', qty: q(1) },
      { item: 'std/dvm-general/terminal', qty: q(4) },
      { item: 'std/dvm-general/thermopile', qty: q(1) },
      { item: 'std/dvm-general/drying-agent', qty: q(1) },
    ] },

  /**
   * 电子式数字电压表（4 位）。双斜积分 ADC + 石英时钟 + 齐纳基准 + 机械计数器显示。
   *
   * 它是本层第一台**数字**仪器：读数不再是"指针在第几格"，而是一个数。
   * 而"数"能记、能传、能算 —— 这是指针做不到的。
   *
   * 元件为焊接/贴装装配，属于不可逆加工；零件输入写在路线 uses，不写 composedOf。
   */
  { id: 'std/dvm-electronic', name: '电子式数字电压表', unit: '台', category: 'part' },
];

export const CLOCK_ROUTES: readonly Route[] = [
  {
    /**
     * 石英谐振器：切晶 → 研磨到频率 → 镀电极 → 装架封帽。
     *
     *   高纯石英 1 + 铝 1 + 帽壳 1 → 谐振器 20 只
     *
     * ⚠️ 频率靠**磨薄**调：片子磨到多厚，频率就是多少。
     * 100 kHz 对应约 28 µm 厚 —— 这是本层最薄的一片东西，磨过头就废，
     * 所以先磨到略厚，再一边测一边磨（测频靠计数器）。
     */
    id: 'make/quartz-resonator',
    name: '石英谐振器制造',
    produces: [{ item: 'std/quartz-resonator-general', qty: q(20), gives: [{ param: 'frequency', kind: 'range', min: 32, max: 1000 }] }],
    uses: [
      // 注意：这里要的是**单晶**，不是提纯的砂 —— 砂没有压电性。
      { anyOf: [{ item: 'mat/quartz-crystal', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'std/metal-can-general', qty: q(20) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '定向切晶（X 切）', performedBy: 'plant/robot' },
      { note_zh: '研磨到 28 µm（边测频边磨）', performedBy: 'plant/grinder' },
      { note_zh: '镀铝电极', performedBy: 'plant/robot' },
      { note_zh: '装架与封帽', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '石英 1 + 铝 1 + 帽 20 → 谐振器 20 只；余 2 只是磨过头与频率超差',
  },
  {
    /**
     * 石英谐振器，5 MHz（AT 切）。
     *
     *   单晶石英 1 + 铝 1 + 帽壳 20 → 谐振器 20 只（4 900–5 100 kHz）
     *
     * 为什么单开一条路线：`make/quartz-resonator` 是 X 切（厚度伸缩），
     * N_X = 2.8 MHz·mm；它交付 32–1 000 kHz，100 kHz 的 28 µm 正是
     * 2.8 / 0.1 算出来的。同一切型要 5 MHz，片子只有 2.8 / 5 = 0.56 µm，
     * 那是薄膜，不是能磨的片子 —— 所以 5 MHz 不能靠放宽原路线的 `gives` 得到。
     *
     * 5 MHz QCM 用 AT 切（厚度剪切，35°15′），N_AT = 1.67 MHz·mm：
     *
     *   t = N_AT / f = 1.67 MHz·mm / 5 MHz = 0.334 mm = **334 µm**
     *
     * 4 900–5 100 kHz（±2 %）对应 1.67 / 4.9 = 340.8 µm 到
     * 1.67 / 5.1 = 327.5 µm。工序不是磨到 334 µm 就交，而是**边测频边磨**：
     * 先留厚，磨到 5 000 kHz 附近，再按 ±2 % 分选。334 µm 只是中心值，
     * 比本层已经在磨的 28 µm 厚 12 倍，磨制上反而更容易
     * （见 film-monitor.ts 第七节第 1 条）。
     *
     * 切型从 0° 换成 35°15′，所以这是一条新路线，不是原路线的窗口放宽。
     * 设备、料、批量都与 `make/quartz-resonator` 相同；测频沿用原路线的计数器。
     */
    id: 'make/quartz-resonator-5mhz',
    name: '石英谐振器制造',
    produces: [{ item: 'std/quartz-resonator-general', qty: q(20), gives: [{ param: 'frequency', kind: 'range', min: 4900, max: 5100 }] }],
    uses: [
      { anyOf: [{ item: 'mat/quartz-crystal', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
      { anyOf: [{ item: 'std/metal-can-general', qty: q(20) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '定向切晶（AT 切 35°15′；按 N_AT = 1.67 MHz·mm 留 334 µm 余量）', performedBy: 'plant/robot' },
      { note_zh: '研磨到 5 000 kHz（边测频边磨；4 900–5 100 kHz 对应 327.5–340.8 µm）', performedBy: 'plant/grinder' },
      { note_zh: '镀铝电极', performedBy: 'plant/robot' },
      { note_zh: '装架与封帽', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '单晶石英 1 + 铝 1 + 帽 20 → 谐振器 20 只；磨过头与频率超差的片子回炉，不另计',
  },
  {
    /**
     * 齐纳基准：取平面管的发射结反偏，配恒温与限流电阻。
     *
     *   运放芯片 1（取其中一对管子）+ 镍铬丝 + 表壳 → 基准 20 只
     *
     * 温度系数靠**恒温**压：装进小恒温盒（本层有恒温间，但这里是盒内自热恒温）。
     */
    id: 'make/zener-reference',
    name: '齐纳基准制造',
    produces: [{ item: 'std/zener-reference-general', qty: q(20) }],
    uses: [
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1) }] },
      { anyOf: [{ item: 'std/metal-can-general', qty: q(20) }] },
    ],
    needs: [],
    steps: [
      { note_zh: '挑管（反偏 6.2 V 附近击穿的）', performedBy: 'plant/robot' },
      { note_zh: '配限流电阻与恒温电阻', performedBy: 'plant/robot' },
      { note_zh: '老练与筛选（通电 100 小时看漂移）', performedBy: 'plant/robot' },
    ],
  },
  {
    /**
     * 数字电压表：积分器 + 比较器 + 计数器 + 时钟 + 基准 + 机械计数显示。
     *
     *   运放 2 + 计数器芯片 1 + 石英 1 + 齐纳 1 + 镍铬丝 + 机械计数器 1 + 表壳
     *
     * 双斜积分的妙处：**它不需要精密电阻**，只需要稳定的时间与基准。
     * 而时间有石英、基准有齐纳 —— 这两样恰好是这一层做得出来的。
     */
    id: 'make/dvm',
    name: '电子式数字电压表制造',
    produces: [{ item: 'std/dvm-electronic', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/quartz-resonator-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/zener-reference-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1) }] },
      { anyOf: [{ item: 'std/counter-mechanical-general', qty: q(4) }] },
      // 输入级用 MOS：栅极不取电流，所以表的内阻高到不加载被测源
      { anyOf: [{ item: 'std/mos-transistor-general', qty: q(2) }] },
      // 8 路模拟开关：一只表轮流看八个点
      { anyOf: [{ item: 'std/analog-mux-chip-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '装配（积分器、比较器、计数、时钟、显示）', performedBy: 'plant/robot' },
      { note_zh: '校准（用标准电池？没有 —— 用齐纳基准自身的 6.2 V 与电阻比）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '比对（与毫伏表、量块传递链交叉核对）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...CLOCK_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...CLOCK_ROUTES];
