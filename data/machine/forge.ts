/**
 * 锻锤 —— 全表所有"锻件"背后的那一台。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 这个缺口是怎么露出来的
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 数据里"锻件"两个字出现过十次：40Cr 主轴、45 钢刀架、轧辊、颚板、
 * 剪板刀片、折弯滑块、滚刀、高压釜筒体、高压阀体、电机轴……
 *
 * 而"谁来锻"一次都没写。水压机、锻锤不在那八大类器具里，
 * 数据里也没有 —— 于是十处"锻件"都是悬空的。补高压釜的时候第一次撞上它
 * （30 MPa 的筒体不能卷，只能锻），这一轮把它补上。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 为什么选空气锤而不是水压机
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   水压机   几千吨压力，能锻大件；但要高压泵、蓄势器、阀组 —— 又是高压容器
 *   空气锤   靠落下部分的动能，几百公斤到几吨；结构简单，压缩缸自己造
 *
 * 本层只需要小锻件（主轴几十公斤、颚板几百公斤），空气锤够用。
 * 大型锻件（几吨以上的筒体）它做不了 —— 那是缺口，记在下面。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 全表最重的一个零件，功能只是"重"
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 砧座是几十吨的铸铁块。它不承力、不传动、不导向 —— 它的全部功能是
 * **吸收打击能量**：锤头砸下来，动能要靠它变成声音与热，否则会传给地基。
 *
 * 所以全表最重的单个零件，是一块不干活的铁。铸它要一次浇几十吨，
 * 本层的熔炼炉能浇，但那是它最勉强的一次。
 *
 * ⚠️ 锻这一步没有独立的路线：它折在零件路线里（"40Cr 锻件 → 粗车 → …"），
 * 只在 `needs` 上留了一个名字。真要分开，得给每种锻坯写一个条目 ——
 * 十种锻件就是十条新路线，而那不增加信息。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const FORGE_PARTS: readonly Item[] = [
  /**
   * 砧座。几十吨的铸铁块，装在最底下。
   *
   * 它不承力也不传动，功能只有一个：吸收锤头的动能。**全表最重的零件
   * 是一块不干活的铁。**
   */
  { id: 'plant/forge/anvil', name: '锻造砧座', unit: '件', category: 'part' },

  /** 锤头（落下部分）。铸钢件，下平面装模具；它自己也要够重才有动能。 */
  { id: 'plant/forge/tup', name: '锻造锤头', unit: '件', category: 'part' },

  /** 机身。两立柱加横梁，铸成一体；锤头在里面上下走。 */
  { id: 'plant/forge/frame', name: '锻造机身', unit: '件', category: 'part' },

  /** 压缩缸与活塞。空气锤的动力：活塞往下推，锤头才落得比自由落体快。 */
  { id: 'plant/forge/cylinder', name: '锻造压缩缸与活塞', unit: '件', category: 'part' },

  /** 传动与操纵。电机带曲柄，曲柄推活塞；操纵阀决定打击轻重。 */
  { id: 'plant/forge/drive', name: '锻造传动与操纵', unit: '件', category: 'part' },
];

export const FORGE_ROUTES: readonly Route[] = [
  {
    /** 砧座。HT250 一次浇成，几十吨 —— 本层熔炼炉最勉强的一次。 */
    id: 'make/forge-anvil',
    name: '锻造砧座制造',
    produces: [{ item: 'plant/forge/anvil', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht250', qty: q(1) }] }],
    // 砧座只有上平面与侧面要加工：车床花盘上装铣头就能铣平。
    // 本层一直用这个土办法（铣床工作台的 T 型槽就是这么出来的），所以**不写铣镗床** ——
    // 写了就打不开「锻炉要铣床、铣床要锻炉」那个环。
    needs: ['lathe'],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1300, max: 1500 }],
  },
  {
    /** 锤头。铸钢件（本层只有铸铁，用 HT300 代）+ 下平面铣平装模具。 */
    id: 'make/forge-tup',
    name: '锻造锤头制造',
    produces: [{ item: 'plant/forge/tup', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht300', qty: q(1) }] }],
    // 下平面：车床铣头 + 磨床磨平。同上，不写铣镗床。
    needs: ['lathe', 'plant/grinder'],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1300, max: 1500 }],
  },
  {
    /** 机身。HT250 浇成，立柱导轨面要磨 —— 锤头在里面走，间隙大了就晃。 */
    id: 'make/forge-frame',
    name: '锻造机身制造',
    produces: [{ item: 'plant/forge/frame', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht250', qty: q(1) }] }],
    // 立柱导轨面要磨，其余面不加工 —— 不需要铣镗床。
    needs: ['lathe', 'plant/grinder'],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1300, max: 1500 }],
  },
  {
    /** 压缩缸。铸铁缸筒镗磨 + 活塞配作；漏气就没劲。 */
    id: 'make/forge-cylinder',
    name: '锻造压缩缸与活塞制造',
    produces: [{ item: 'plant/forge/cylinder', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/iron-ht250', qty: q(1) }] }],
    // 缸筒内孔在车床花盘上镗（与铣床头主轴孔同一个办法），不写铣镗床。
    needs: ['lathe', 'plant/grinder'],
    performedBy: 'plant/melting-furnace',
    under: [{ param: 'temperature', min: 1300, max: 1500 }],
  },
  {
    /**
     * 传动与操纵。45 钢曲轴车磨 + 阀体配作，**由电机带**。
     *
     * 锻锤也要电机 —— 这是电机第一次以"别人的零件"的身份出现在 needs 里，
     * 而它本该装进每一台设备（见 data/machine/motor.ts 的缺口说明）。
     */
    id: 'make/forge-drive',
    name: '锻造传动与操纵制造',
    produces: [{ item: 'plant/forge/drive', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/steel-45', qty: q(1) }] }],
    // 曲轴车磨、阀体在车床上钻镗配作 —— 同样不需要铣镗床。
    needs: ['plant/grinder'],
    performedBy: 'lathe',
  },
];

/**
 * 空气锤。把加热到 1100–1250 °C 的钢坯砸成锻件。
 *
 * 它不改变材料的成分，也不给形状 —— 它给的是**纤维流线**：锻过的钢，
 * 内部缺陷被压合、晶粒沿流线排布，强度和疲劳寿命比同样成分的铸件高一截。
 * 所以主轴、轧辊、颚板这些"挨打的件"必须锻，不能铸。
 */
export const FORGE: Item = {
  id: 'plant/forge',
  name: '锻造设备',
  unit: '台',
  category: 'machine',
  composedOf: [...FORGE_PARTS.map((p) => ({ item: p.id, qty: q(1) })), { item: 'std/motor-7.5kw-4p', qty: q(1) }],
};

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...FORGE_PARTS, FORGE];
/**
 * 装配路线 —— 条目用 `composedOf` 定义由哪些零件组成，这里定义怎么造出来。
 *
 * `uses` 只写不可逆加工的消耗；装配是可逆组合，零件不进 `uses`。
 * `gives` 照条目声明的窗口交付（声明了就必须交）。
 */
export const ASSEMBLY_ROUTES: readonly Route[] = [
  {
    /** 装配：零件在条目的 `composedOf` 上（定义）；本路线只写生产。 */
    id: 'make/forge',
    name: '锻造设备装配',
    produces: [{
      item: 'plant/forge',
      qty: q(1),
    }],
    uses: [],
    needs: [],
    performedBy: 'plant/robot',
  },
];

export const DATA_ROUTES: readonly Route[] = [...FORGE_ROUTES, ...ASSEMBLY_ROUTES];
