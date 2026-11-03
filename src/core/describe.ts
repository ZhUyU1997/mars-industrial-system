/**
 * 描述语言：一份系统能写成什么样。
 *
 * ⚠️ 这个文件是模型本身。**任何改动都要先经用户同意** ——
 *    加字段、删字段、改类型、改校验、加错误码，全部算改动。
 *    模型一变，所有数据与测试的含义都跟着变；而这类改动最容易在"顺手修一下"里发生。
 *
 * 这一层只解决"能说什么"，不解决"怎么算"。
 *
 * 能说的五件事：
 *   ① 一个东西在系统里扮演什么角色                  Item.category
 *   ② 它可以有多条做法                            多条 Route 产出同一 Item（OR）
 *   ③ 一条做法消耗什么，数量挂在选项上，可任选其一  Route.uses（AND of OR）
 *   ④ 一条做法需要什么先存在，但不被消耗            Route.needs（AND）
 *   ⑤ 一条做法在什么条件下进行，以及谁能维持它      Route.under / Item.holds
 *
 * ③④⑤ 是三件不同的事，混成一类就会算错：
 *   ③ 消耗 —— 被吃掉，需要持续供给
 *   ④ 前提 —— 只要存在过就够，不被吃掉
 *   ⑤ 条件 —— 不是东西，是必须被维持的状态；维持它必须有承担者
 */

// ─────────────────────────────────────────────────────────────────────────────
// 数量：有理数
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 一个正有理数数量。
 *
 * 为什么不用浮点：真实单耗是 0.42 这样的值。若只允许整数，就得把整张表放大
 * 一千倍去凑公倍数 —— 那是把单位混进模型。有理数不需要任何放大，
 * 也不会有 0.42 × 3 = 1.2600000000000002 这类问题。
 */
export interface Qty {
  /** 正整数。 */
  readonly num: number;
  /** 正整数。 */
  readonly den: number;
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/** 构造并约分。不接受非正、非整数。 */
export function q(num: number, den = 1): Qty {
  if (!Number.isInteger(num) || !Number.isInteger(den) || num <= 0 || den <= 0) {
    throw new Error(`数量必须是正有理数，得到 ${num}/${den}`);
  }
  const g = gcd(num, den);
  return { num: num / g, den: den / g };
}

/** 转成数字，仅用于展示与断言。 */
export function toNumber(x: Qty): number {
  return x.num / x.den;
}

/** `3` 或 `21/50`。 */
export function formatQty(x: Qty): string {
  return x.den === 1 ? String(x.num) : `${x.num}/${x.den}`;
}

/** 精确相等。交叉相乘，不经过浮点。 */
export function qEq(a: Qty, b: Qty): boolean {
  return a.num * b.den === b.num * a.den;
}

/** 精确相乘。 */
export function qMul(a: Qty, b: Qty): Qty {
  return q(a.num * b.num, a.den * b.den);
}

/** 精确相加。 */
export function qAdd(a: Qty, b: Qty): Qty {
  return q(a.num * b.den + b.num * a.den, a.den * b.den);
}

/** 单位归一：去空白、转小写。不做换算 —— 换算需要单位代数，见 README。 */
export function normUnit(u: string | undefined): string {
  return (u ?? '').trim().toLowerCase();
}

// ─────────────────────────────────────────────────────────────────────────────
// 条目
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 一个条目 —— **定义**：它是什麼。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 定义与制造分开
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   Item   定义   它是什麼：类别、单位、质量、由哪些零件组成、能维持什么条件
 *   Route  制造   它怎么来的：材料、设备、条件、联产
 *
 * 分界线是**能不能从条目本身答出来**。一条床身"重 820 kg、由 HT250 铸铁构成"，
 * 是定义；"用 820 kg 铁水浇成"是制造。两者混在一起时，改一次工艺就要动定义。
 *
 * 因此条目上**不写材料**：材料一律在 `Route.uses` 里。装配是例外 ——
 * `composedOf` 写的是"由哪些零件构成"，这是定义，而且可逆（拆下来还能装）。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 设备写在哪 —— 只有两处
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① 本条目的 `category: 'machine'`      它是一台设备，不是物料
 *   ② `Route.performedBy: <id>`           这条路线由哪台设备执行
 *
 * 只此两处。设备的**能力**不写成 `can: ['turning']` 那样的清单，
 * 而是体现在"有哪条 route 指名了它"—— 清单靠人维护，指名的关系由结构强制。
 *
 * 三条随之而来的硬约束（由 `validate` 检查）：
 *   · 设备**不出现在 `uses` 里** —— 它不会被用掉（`machine_consumed`）
 *   · `performedBy` 只能指向设备（`not_a_machine`）
 *   · 只有设备能提供条件 `holds`（材料 / 载体提供条件 → `bad_category`）
 *
 * 典型写法：
 * ```ts
 * // 定义：它是一台设备
 * { id: 'lathe', category: 'machine' }
 *
 * // 制造：这条路线由它执行
 * { id: 'make_lathe', produces: [{ item: 'lathe', qty: q(1) }],
 *   uses: [{ anyOf: [{ item: 'iron', qty: q(3) }] }],
 *   performedBy: 'lathe' }        // ← 自指：母机制造母机，合法
 * ```
 */
export interface Item {
  readonly id: string;
  /**
   * 英文名。只给人看，模型不用它做任何判定。
   *
   * 名字与 id 分工：id 是身份，稳定、可引用；name 是给人读的标签，
   * 允许重名，也允许随认识加深而修改 —— 改它不影响任何引用。
   */
  readonly name: string;
  /**
   * 中文名。与 `name` 同义，供中文界面与检索使用。
   *
   * 两个名字都不是身份：引用一律用 id。`name` 必须是不含汉字的英文，
   * `name_zh` 保留原始中文名，二者都由 `validate` 检查非空。
   */
  readonly name_zh: string;
  /**
   * 它在系统里的角色。缺省视为 `material`。
   *
   * | 取值 | 被消耗？ | 说明 |
   * |---|---|---|
   * | `material` | 是 | 原料。熔炼、车削、磨削的对象，被加工成别的形状 |
   * | `part` | 是 | **零件**。装在机器上，可以换下来修复 |
   * | `consumable` | 是 | **消耗件**。用的时候被吃掉，不装在机器上 |
   * | `carrier` | 是 | 能量载体。「能量不限量」这类**前提**落在它上面 |
   * | `machine` | **否** | 设备。可被 `performedBy` 指名，也可作为子机器装进别的设备 |
   *
   * `material` 与 `part` 都出现在 `uses` 里，区别在那条路线产出什么：
   * 消耗原料的路线产出的是另一个物件（生铁 → 床身毛坯），
   * 消耗零件的路线产出的是**机器**（床身 + 主轴 + 齿轮 → 车床）。
   * 这条区别不是命名习惯，是可校验的：见 `part_as_raw_material`。
   *
   * ⚠️ `machine` 曾经叫 `holder`，而旧语义要求"设备必须有 `holds`"。
   * 那是错的：车床不提供温度或压力，它提供的是加工能力。
   * 现在 `holds` 是**可选**能力（提供条件），`performedBy` 才是设备的作用。
   */
  readonly category?: ItemCategory;
  /**
   * **抽象接口**：只能有 `props`，不能有 `category` / `mass` / `composedOf` / `holds`。
   *
   * id 必须以 `iface/` 开头 —— 名字上就能看出它是接口，不靠翻字段。
   * 具体条目用单条 `extends` 指向它；不写 `interface` 就是具体条目。
   */
  readonly interface?: true;
  /**
   * **单继承**：具体条目指向它的抽象父接口。
   *
   * 只允许具体条目 extends 一个 `iface/` 接口；接口不能再 extends，
   * 也不支持多级继承。不写 = 自己是根（legacy 单设计条目）。
   */
  readonly extends?: string;
  /**
   * **单体条目**：从材料直接加工出整件，没有装配 BOM。
   *
   * 对 `machine` 与 `part` 都有意义：机器走 `machine_without_parts` 放行，
   * 零件本来就不要求 BOM；两者都不能同时写 `composedOf`。
   *
   * ⚠️ 每处 `monolithic: true` 的字段上方必须写一行理由注释：为什么这件东西
   * 没有可拆的子件、为什么按整件制造。注释是记录，不参与校验。
   */
  readonly monolithic?: boolean;
  /**
   * **未定义**：知道有这么个东西，细节留到后面再推导。
   *
   * 逐层推导时，链条先撞到的不是"这项不存在"，而是"这项还没拆开"。
   * 带上这个标记，条目可以先占住位置，校验把它单列成一份清单，
   * 不算写错 —— 这样才不会为了补一个局部细节而卡住整条链。
   *
   * 三种状态必须分得开，否则"忘了写"和"确实没有"又混成一个：
   *
   * | 状态 | 含义 | 谁报 |
   * |---|---|---|
   * | 有标记 | 明确知道它还没定义，是**待办** | `deferred` 提示，列出清单 |
   * | 无标记、无路线 | 要么外部输入，要么忘了写 | `unproduced` 提示，同样列出来 |
   * | 无标记、有路线 | 定义完了 | —— |
   *
   * 只落在零件与消耗件上：机器要承担条件与零件清单，未定义的机器什么也证明不了。
   *
   * 不要滥用 —— 一个条目长期挂着这个标记，说明那条链一直没动。
   */
  readonly deferred?: boolean;
  /**
   * **这个条目有哪些属性**（类型声明，不含值）。
   *
   * 属性系统要解决的问题见 `docs/考察/05-半导体链.md` 第 104 节，一句话：
   * 同一个 id 会被不同路线交付成不同等级，所以**值不能写在条目上**。
   *
   * ```ts
   * // 条目只声明"硫酸有浓度这个属性，取 0–100 %"
   * props: [{ param: 'concentration', kind: 'range', min: 0, max: 100, unit: '%' }]
   * // 路线才说"我给 98 %" / "我要 98±0.5 %"
   * produces: [{ item: 'mat/sulfuric-acid', qty: q(1000), gives: [{ param: 'concentration', kind: 'range', min: 98, max: 98 }] }]
   * uses: [{ anyOf: [{ item: 'mat/sulfuric-acid', qty: q(645), need: [{ param: 'concentration', kind: 'range', min: 97.5, max: 98.5 }] }] }]
   * ```
   *
   * 三种形状：`range`（浓度、纯度、tier、门数、耐温）、`enum`（牌号、类型）、
   * `set`（气氛、可选组分）。
   *
   * **全部可选**：不声明 `props` 的条目行为完全不变，现有数据零改动。
   */
  readonly props?: readonly PropDecl[];

  /**
   * 计量单位：这东西怎么数。`'件'`、`'台'`、`'套'`。
   *
   * 一台铣床是 **1 台**，不是 2568 kg —— kg 是它的重量，不是它的计量单位。
   * 数量回答"几个"，质量回答"多重"，是两件事。
   */
  readonly unit?: string;
  /**
   * 单件质量，单位 kg。
   *
   * 与 `unit` 分开：`{ unit: '台', mass: q(2568) }` 读作"一台，重 2568 kg"。
   * 若把质量当计量单位，BOM 就会变成"装 820 kg 床身"，而 BOM 说的是"装 1 个床身"。
   *
   * 只用 kg，不给换算 —— 与运行小时同理：可换算而不给换算的单位只会制造错误。
   */
  readonly mass?: Qty;
  /**
   * 它能维持的条件区间。
   *
   * 只有 `category: 'machine'` 可以填。一台设备可以既被 `performedBy` 指名、
   * 又通过 `holds` 提供条件（电解槽既执行电解，又维持 940–980 °C）。
   *
   * ⚠️ 条件不是免费的：维持它要烧燃料、要耗电。但模型没有时间维，
   * 所以维持消耗只能写在**批次**里 —— 由执行该路线的 `uses` 承担。
   * 换句话说：`holds` 只声明能力，不声明代价。
   */
  readonly holds?: readonly Condition[];
  /**
   * 消耗件：**运行时每小时消耗什么**。
   *
   * 与零件的区别是根本性的：
   *   零件   装在机器上，用久了磨损，**换下来机器就恢复**（见 Component.wear）
   *   消耗件 不装在机器上，用的时候**被吃掉**，换不下来 —— 刀具、切削液、润滑油、滤芯
   *
   * 同样绑运行小时，同样一个刻度。
   */
  readonly consumption?: readonly Consumption[];
  /**
   * 组成清单。**机器的组成写在这里，不写在别处。**
   *
   * 每一项是：哪个零件或子机器、装几个、什么材料、什么工序做成。
   * 这是描述一台机器“由什么构成”的全部内容。子机器也是组成件：
   * 计量间装万用表、产线装机床，都是包含关系，不要求它们先变成零件。
   */
  readonly composedOf?: readonly Component[];
}

export type ItemCategory = 'material' | 'part' | 'consumable' | 'carrier' | 'machine';

/**
 * 磨损：每经过 `per` **运行小时**，损耗自身的 `amount`。
 *
 * 时间绑定是这个字段的全部意义。没有时长，"损耗 1/12000" 什么也没说 ——
 * 12000 个什么？批次数不是时间，路线才有批次，零件没有。
 *
 * 只用运行小时，不给单位选择：日、月、年之间可以换算，而模型不做换算。
 * 摆四个可换算的单位却不给换算，只会把 40000 小时和 5 年这种比较变成错误。
 * 一条时间轴，一个刻度。
 */
export interface Wear {
  /** 损耗比例，(0, 1]。1 表示这段时长到了就整件报废。 */
  readonly amount: Qty;
  /** 运行时长的门槛，单位：运行小时。 */
  readonly per: Qty;
}

/**
 * 一项消耗：每经过 `per` 运行小时，用掉 `qty`。
 */
export interface Consumption {
  /** 消耗件条目 id。必须是 `category: 'consumable'`。 */
  readonly item: string;
  /** 每 `per` 小时用掉多少。 */
  readonly qty: Qty;
  /** 多少运行小时。 */
  readonly per: Qty;
}

/**
 * 一个组成件 —— 机器由零件组成。**只装零件，不装材料。**
 *
 * 这是**空间组合**：可拆。拆下来的零件还是那个零件，还能装到别处去。
 *
 * 与加工的区别是根本性的：
 *   组合  composedOf  可逆 —— 拆下来还能用
 *   加工  Route       不可逆 —— 材料变成零件，回不去了
 *
 * 零件的材料由**制造方式**（产出它的那条 route）决定，不写在这里。
 */
export interface Component {
  /**
   * 组成件：零件或子机器。
   *
   * 子机器的 id 已经全局唯一，不需要再挂父机器前缀；路径规则只约束零件。
   * 名字用路径，两种形态、两种消歧方式：
   *
   * ```
   * <machine>/<name>    专用件，规格由机器决定
   *                     mill/spindle 是 φ80 铣床主轴，lathe/spindle 是 φ50 车床主轴 ——
   *                     同名不同物，所以归属必须写进名字
   * std/<type>-<spec>   标准件，规格写在名字里
   *                     std/bearing-6205 装在哪台机器上都是 6205，不需要归属
   * ```
   *
   * 扁平名不可处理 —— `machine_base` 看不出属于哪台机器，也看不出尺寸。
   *
   * 前缀**不是"归属"，是消歧**。专用件的规格由机器决定，所以绑定机器；
   * 标准件的规格独立于使用者，所以绑定规格号。两种都保证"一个 id 唯一对应
   * 一种规格"，这才是这条规则真正保护的东西。
   */
  readonly item: string;
  /**
   * `item` 是 `iface/` 抽象接口时，落到哪个具体实现。
   *
   * 不写且该接口只有一个具体实现 = 自动选它；
   * 多个实现又没写 select = `ambiguous_abstract_part`。
   */
  readonly select?: string;
  /** 装几个。零件按件计。 */
  readonly qty: Qty;
  /**
   * 磨损。**定义在零件上，绑定时长。**
   *
   * 床身与立柱不写这个字段 —— 它们不磨损。磨损的是贴在床身上的导轨，
   * 而导轨是单独一件，有自己的路径与寿命。这也是路径而非扁平名的用处：
   * `mill/way` 磨了，换的是它，不是 `mill/base`。
   */
  readonly wear?: Wear;
  /**
   * **装配这一步要求的规格窗口**。不写 = 不限。
   *
   * 与 `Option.need` 同一份判据、同一个 `propCovers`。之所以要它：装配这一步
   * 的规格要求只能挂在“装上去的那一件”上 —— 于是“整机要 20 轴、零件只交 6 轴”
   * 这种话以前无处可写，任何一张表都看不见。
   */
  readonly need?: readonly PropReq[];
  /** 放宽窗口之后的后果。与 `Option.onRelax` 同义，写了 need 就必须表态。 */
  readonly onRelax?: 'functional-kept' | 'functional-lost';
}

/**
 * 把一个引用解析成具体条目 id。
 *
 * - 具体条目：原样返回；
 * - `iface/` 接口：有 `select` 就用 select，否则只在接口恰好一个实现时自动选；
 * - 零个实现、多个实现、select 不是直接子类，都抛错。
 *
 * 单继承：只认 `impl.extends === ifaceId`，不沿链走。
 */
export function resolveItemRef(
  itemId: string,
  select: string | undefined,
  items: ReadonlyMap<string, Item>,
): string {
  const it = items.get(itemId);
  if (it === undefined) throw new Error(`unknown_item: ${itemId}`);
  if (it.interface !== true) return it.id;

  if (select !== undefined) {
    const impl = items.get(select);
    if (impl === undefined || impl.interface === true || impl.extends !== itemId) {
      throw new Error(`bad_implementation: ${select} 不是 ${itemId} 的直接实现`);
    }
    return select;
  }

  const impls = [...items.values()].filter(
    (x) => x.interface !== true && x.extends === itemId,
  );
  if (impls.length === 1) return impls[0]!.id;
  if (impls.length === 0) throw new Error(`no_implementation: ${itemId}`);
  throw new Error(`ambiguous_abstract_part: ${itemId} 有 ${impls.length} 个实现`);
}

/** 带数量的一项产出。 */
export interface Term {
  readonly item: string;
  /**
   * 数量是**配比**，不是绝对产量：一条路线的全部数量同乘一个数，语义不变。
   * 批次规模由 `produces` 给出，消耗按同一批次折算。
   */
  readonly qty: Qty;
  /**
   * **这条路线交付的规格窗口**。不写 = 不限（现有数据全部如此）。
   *
   * 属性的类型声明在 `Item.props` 上，值只在这里 —— 因为同一个 id
   * 会被不同路线交付成不同等级（98 % 的酸与 30–50 % 的酸是同一个条目）。
   */
  readonly gives?: readonly PropReq[];
}

/**
 * 一个选项：某个东西，带它自己的数量。
 *
 * 数量必须挂在选项上，不能挂在子句上 —— 真实替代比几乎从不是 1:1。
 */
export interface Option {
  readonly item: string;
  readonly qty: Qty;
  /** **这条路线要求的规格窗口**。不写 = 不限。 */
  readonly need?: readonly PropReq[];
  /**
   * 放宽窗口之后的后果（第 103 节好降级的三个要件之一）。
   *
   * `functional-kept`（缺省）—— 还能做原来那件事，只是差几倍；
   * `functional-lost` —— **不会做了**。这种子句不算满足，
   * 报告要把它单列在「不是降级，是换了东西」一节下。
   *
   * 判据：**问"换完之后它还会不会做原来那件事"。**
   */
  readonly onRelax?: 'functional-kept' | 'functional-lost';
}

/**
 * 一个"任选其一"的输入子句。
 *
 * 一条 Route 的 `uses` 是若干子句的 AND，每个子句是若干 Option 的 OR。
 */
export interface Clause {
  readonly anyOf: readonly Option[];
}

/**
 * 前提：字符串是旧写法（只说明“谁必须在场”）；`Option` 可以再带数量与规格窗口。
 *
 * 对 `Option`，`qty` 是**至少几件同时在场**，不是消耗量 —— 它不会被用掉。
 */
export type Need = string | Option;

/** 把一条前提归一成 Option 列表；字符串按 qty = 1 处理。 */
export function needOptions(need: Need): readonly Option[] {
  return typeof need === 'string' ? [{ item: need, qty: q(1) }] : [need];
}

/** 一条路线所有前提的 item id（展开字符串与 Option）。 */
export function needItems(needs: readonly Need[]): readonly string[] {
  return needs.flatMap((n) => needOptions(n).map((o) => o.item));
}

/**
 * 一个数值的**出处**。
 *
 * 条件里的温度/压力，以及路线交付窗口里的尺寸/纯度，原先都只是一对数字。
 * 数字要能核，必须回答"谁量过"：
 *
 *   record  指向 `data/measure/` 产出的记录条目（由 `measure/*` 路线产出）；
 *           记录里的窗口才是读数，路线 `gives` 是量程
 *   design  明标**设计窗口**：这是设计给的区间，本层没有读数
 *
 * **两者都没有 = 裸数字（bare）**。这不是错误，是一个可被审计工具数出来的缺口：
 * 条件写得再全，数没有出处，复制判定里也不算"有读数"。
 *
 * ⚠️ 出处等级是**单向**的：`bare → design → record`，不可逆。
 *   · bare 可以向前补 design，再补 record；
 *   · design 可以被测量替换为 record；
 *   · record 一旦写入，不得回退为 design 或 bare，记录条目也不得删除。
 * 反向改写会抹掉证据；只允许向前补测量、收窄窗口或补消费者。
 *
 * ⚠️ `design` 不是"待补"标记，而是"不算满足"：审计对 design 的交付窗口与条件
 * 一票否决。去掉它等于声称这个窗口已由测量收窄——**设备 `holds` 覆盖同一区间
 * 不算测量**，holds 是能力声明，不是读数。`record` 是这一声称的凭据；审计校验
 * 记录条目存在、由 `measure/*` 产出、当前可达，且记录窗口落在引用窗口内。
 * 删掉 design 后窗口落回 bare 仍按历史口径放行，所以"去 design"不能只靠删字段。
 *
 * 全部可选：不写这两个字段的对象行为完全不变。
 */
export interface Provenance {
  /**
   * 记录条目 id，如 `mat/manganin-tcr-record`。必须由 `data/measure/` 的
   * `measure/*` 路线产出，记录里的窗口才是读数。
   *
   * 审计校验这个指针的出处；写了它也不等于窗口已经收窄，记录窗口还须
   * 落在被引用的窗口内。
   */
  readonly record?: string;
  /**
   * 明标**设计窗口**：设计给的区间，不是读数。
   *
   * 审计对 design 的交付窗口与条件都不算满足。去掉它必须以一条 `measure/*`
   * 记录为凭据，且记录要给出窗口内的实测区间；设备的 `holds` 覆盖同一区间
   * 也不能替代——能力不是测量。
   */
  readonly design?: true;
}

/**
 * 一个条件：某个参数必须被维持在区间内。
 *
 * 参数名不预设 —— 温度、压力、气氛、pH 都只是字符串。模型不认识它们，
 * 只认识"有一个区间必须被维持住"。
 */
export interface Condition extends Provenance {
  readonly param: string;
  readonly min: number;
  readonly max: number;
}

/**
 * 属性的**类型声明**：这个条目有哪个属性、可取什么。
 *
 * 与 `Condition` 分开，因为用途不同：`Condition` 是"某个参数必须被维持在区间内"
 * （温度、压力，由设备的 `holds` 承担），`PropDecl` 是"这个物件本身的规格"
 * （浓度、牌号、芯片等级），由路线交付。
 *
 * 区别在谁承担：条件要一台设备维持，属性由**产出它的那条路线**保证。
 */
export type PropDecl =
  | {
      readonly param: string;
      readonly kind: 'range';
      readonly min: number;
      readonly max: number;
      /** 单位只给人看，不参与比较 —— 量纲统一不在这一层。 */
      readonly unit: string;
      /**
       * 比较方向。缺省 `within`。
       *
       * `atLeast` = 越大越好（纯度、耐温、硬度）；`atMost` = 越小越好（杂质、粗糙度）。
       *
       * 为什么必须有这一项：第一版只有"窗口包含"，于是
       * 纯度交付 99.99、要求 99.5 会被判成不满足（因为 99.99 不含 99.5），
       * 耐温砖 1650、窑要 1550 同样判错。**方向错了，判据再严也是错的。**
       */
      readonly dir?: 'within' | 'atLeast' | 'atMost';
    }
  | { readonly param: string; readonly kind: 'enum'; readonly values: readonly string[] }
  | { readonly param: string; readonly kind: 'set'; readonly values: readonly string[] };

/**
 * 属性的**窗口**：这条路线给什么、要什么。缺省字段 = 不限那一侧。
 *
 * 匹配规则见 `propCovers`：交付窗口必须**落在**要求窗口内（区间包含，与 `covers` 同一个判据）。
 */
export type PropReq =
  | ({
      readonly param: string;
      readonly kind: 'range';
      readonly min?: number;
      readonly max?: number;
      /** 见 `PropDecl.dir`：缺省 `within`（窗口包含），`atLeast` / `atMost` 只比一侧。 */
      readonly dir?: 'within' | 'atLeast' | 'atMost';
    } & Provenance)
  | ({ readonly param: string; readonly kind: 'enum'; readonly oneOf: readonly string[] } & Provenance)
  | ({ readonly param: string; readonly kind: 'set'; readonly atLeast?: readonly string[] } & Provenance);

/** 交付窗口是否落在要求窗口内。`give` 是交付，`need` 是要求。 */
export function propCovers(give: PropReq, need: PropReq): boolean {
  if (give.param !== need.param || give.kind !== need.kind) return false;
  if (give.kind === 'range' && need.kind === 'range') {
    const gmin = give.min ?? Number.NEGATIVE_INFINITY;
    const gmax = give.max ?? Number.POSITIVE_INFINITY;
    const nmin = need.min ?? Number.NEGATIVE_INFINITY;
    const nmax = need.max ?? Number.POSITIVE_INFINITY;
    const dir = need.dir ?? 'within';
    if (dir === 'atLeast') return gmin >= nmin;
    if (dir === 'atMost') return gmax <= nmax;
    return gmin <= nmin && gmax >= nmax;
  }
  if (give.kind === 'enum' && need.kind === 'enum') {
    return need.oneOf.every((v) => give.oneOf.includes(v));
  }
  if (give.kind === 'set' && need.kind === 'set') {
    const atLeast = need.atLeast ?? [];
    const got = give.atLeast ?? [];
    return atLeast.every((v) => got.includes(v));
  }
  return false;
}


/**
 * 一道工序 —— 路线里的一段连续作业，由**一台**设备执行，可能带自己的条件。
 *
 * 为什么需要它：很多路线本来就是工序链 —— 「车 → 滚齿 → 调质 → 磨」，四道工序、
 * 四台设备，而 `performedBy` 只有一个位置。以前的做法是把其余机床塞进 `needs`，
 * 于是"另一道工序的执行者"被写成了"在场的前提"：磨床看起来根本不用干活，
 * 820 °C 的条件看起来整条路线都要维持。
 *
 * 分工写清：
 *   物料流（`uses` / `produces`）仍写在路线上，**只写一处**
 *   工序只回答"这一段谁干、什么条件"
 *
 * 所以有 `steps` 的路线不许再写 `performedBy` / `under`（`step_conflict`）——
 * 同一件事不能有两个说法。
 */
export interface Step {
  /** 这道工序叫什么。只给人看，模型不用它。 */
  readonly note_zh?: string;
  /** 执行这一段的设备。与路线级 `performedBy` 同一判据：必须是 `category: 'machine'`。 */
  readonly performedBy?: string;
  /** 这一段的要求。承担者必须是本段的执行者，或路线 `needs` 里列明的设备。 */
  readonly under?: readonly Condition[];
}

/**
 * 一条做法 —— **不可逆的加工**。
 *
 * 投入的材料被用掉了，出来的是另一个东西；把产物拆开也拿不回原来的材料。
 * 需要可逆的空间组合，用 `Item.composedOf`。
 *
 * **定义与制造的分界**：条目回答"它是什麼"，路线回答"它怎么来的"。
 * 材料只出现在这里（`uses`），不写在条目上；改工艺只动路线，不动定义。
 */
export interface Route {
  readonly id: string;
  /**
   * 英文名。只给人看，模型不用它做任何判定。
   *
   * 同一条产物可以有多条路线，名字允许重复；区分靠 id。
   */
  readonly name: string;
  /**
   * 中文名。与 `name` 同义，供中文界面与检索使用。
   *
   * 路线名不参与求解；同一条产物可以有多条路线，名字允许重复。
   */
  readonly name_zh: string;
  readonly produces: readonly Term[];
  /**
   * **一批占用多少小时**（第 108 节）。
   *
   * 批次由 `produces[0].qty` 定义：它是一批的产量，`hours` 是这一批从开工到出活
   * 占住设备的时间（含装夹、等温、冷却），**不含排队**。
   *
   * ```
   * 一件研磨平板 3 块一批：rate: { hours: q(24) }
   * → 读作"一批 24 小时，出 3 块"
   * → 折算 8 小时/块
   * ```
   *
   * 为什么需要它：**在这之前模型完全看不见时间。** 所有产能都写在注释里
   * （"22–26 工时""360 h""12 kg 水/天"），而注释不会被计算，也不会被比较。
   *
   * ⚠️ 它**不回答"一年能产多少"** —— 那要台数与排班，是另一层。
   * 它只回答"这一批占用多久"，而"单位产品的设备台时"已经足以排瓶颈。
   *
   * 全部可选：不写就是"未声明"，现有路线零改动。
   */
  readonly rate?: { readonly hours: Qty };
  /** 消耗：会被用掉，因此需要持续供给。 */
  readonly uses: readonly Clause[];
  /**
   * 前提：必须已经存在，但不被消耗。
   *
   * 字符串是旧写法；`Option` 可以带 `qty`（至少几件同时在场）、`need`（规格窗口）
   * 与 `onRelax`（达不到时的后果）。
   */
  readonly needs: readonly Need[];
  /**
   * 由哪台设备执行 —— **设备的第二处、也是最后一处落点**（第一处是 `Item.category`）。
   *
   * 必须指向 `category: 'machine'` 的条目。它表达的是「这条路线靠什么做」，
   * 而不是「做的时候需要什么在旁边」—— 后者写 `needs`。
   *
   * 三个要点：
   *   · 设备不被消耗，所以 `performedBy` 出现一次即可覆盖任意多次生产
   *     （产能与次数不在描述层，见 README「还缺什么」）
   *   · 一台设备可以执行多条路线（电解槽既做电解，也做别的）
   *   · 允许自指：`make_lathe` 由 `lathe` 执行而产出 `lathe` —— 这就是母机
   *
   * **只用于单工序路线。** 多工序写 `steps`，两处不许同时写。
   */
  readonly performedBy?: string;
  /**
   * 声明这条路线在质量上不平衡，并说明原因。
   *
   * 与元素守恒的豁免同理：与其放宽校验，不如让豁免变成必须填、且会被点名的字段。
   * 只对 `unit: 'kg'` 的项算质量；不同量纲不可能相加。
   */
  readonly unbalanced_zh?: string;
  /** 条件：进行期间必须被维持。每一项都要有承担者。**单工序路线用；多工序写进 `steps`。** */
  readonly under?: readonly Condition[];
  /** 工序链：每段一台设备、一组条件。有它就不写 `performedBy` / `under`。 */
  readonly steps?: readonly Step[];
}

/** 一份完整的系统描述。 */
export interface Description {
  readonly items: readonly Item[];
  readonly routes: readonly Route[];
  /**
   * 环境条件 —— **现场本来就在维持的东西**，不需要哪台设备提供。
   *
   * 为什么需要它：火星大气压 0.6 kPa 是既成事实，而路线里那些"要在几百 kPa 下做的"
   * 工序（精馏、电解、合成）需要一个地方说明"这个条件环境给不了，必须由设备给"。
   * 没有 ambient 这一项时，两条路都写不出来：
   *
   *   写了 under: [pressure] —— 校验会说"没有设备维持得了"，而其实车里也有压力容器；
   *   不写 —— 那就等于默认所有反应都在常压下做，而火星没有常压。
   *
   * 有了 ambient，"够不够"第一次变成可查的：路线要求的压力若落在 ambient 里，
   * 不需要设备；若落在外面，就必须有一台设备 holds 它（否则 no_machine）。
   */
  readonly ambient?: readonly Condition[];
}

// ─────────────────────────────────────────────────────────────────────────────

export type ProblemCode =
  | 'unknown_item'
  | 'bad_quantity'
  | 'duplicate_id'
  | 'bad_name'
  | 'empty_route'
  | 'empty_clause'
  | 'bad_condition'
  | 'no_machine'
  | 'bad_category'
  | 'interface_flag_mismatch' // interface: true 与 iface/ 前缀不一致
  | 'abstract_has_concrete_fields' // 抽象接口带了 category/mass/composedOf/holds
  | 'extends_invalid' // extends 指向的不是 iface/，或多级继承
  | 'route_produces_interface' // 路线不能产出抽象接口
  | 'ambiguous_abstract_part' // 抽象接口有多个实现，又没写 select
  | 'bad_implementation' // select 不是该接口的直接实现
  | 'unit_mismatch' // 同一子句内选项单位不可通约
  | 'not_a_machine' // performedBy 指向的不是设备
  | 'machine_consumed' // 设备被当成消耗品
  | 'redundant_need' // needs 里裸重复了执行设备（没有规格窗口）
  | 'unbalanced' // 质量不守恒，且没有声明原因
  | 'condition_cycle' // 条件的唯一承担者，本身要靠该条件造出来
  | 'no_product' // 有消耗却没有产出 —— 批次无从定义
  | 'part_as_raw_material' // 零件被当成原料消耗，而该路线不产出机器
  | 'machine_without_parts' // 自制机器没有零件 —— 那是个黑箱
  | 'machine_unit_mismatch' // 用 kg 零件装出无量纲的机器 —— 质量对不上
  | 'bad_component' // 组成件写错：不是零件/子机器、重复、自指、路径不对、磨损非法
  | 'composed_cycle' // 子机器组成成环
  | 'std_without_spec' // std/ 标准件没写规格 —— 规格号是它唯一的消歧方式
  | 'mass_mismatch' // 声明质量与组成件之和不等
  | 'step_conflict' // 同时写了 steps 与路线级 performedBy/under
  | 'empty_steps' // steps 是空数组
  | 'bad_prop' // 属性窗口写错：区间不成立、枚举为空、kind 与声明不符
  | 'prop_unknown' // 要求/交付了条目没声明的属性
  | 'prop_missing_gives' // 条目声明了属性，而某条产出路线没给窗口 —— 声明了就必须交付
  | 'prop_dup_decl' // 同一条目对同一属性声明了两次
  | 'prop_no_onrelax' // 写了 need 却没声明放宽后的后果 —— 降级必须表态
  | 'give_out_of_props' // 路线交付的窗口落在条目声明之外
  | 'multi_spec'; // 同一个 std/ 被多条路线交成互相冲突的规格
;

export interface Problem {
  readonly code: ProblemCode;
  readonly where: string;
  readonly detail: string;
}

/** 提示码。与错误码分开，否则统计时会把提示算成错误。 */
export type NoteCode =
  | 'unproduced'
  | 'self_reference'
  | 'idle_machine'
  | 'declared_unbalanced'
  | 'std_single_use' // 标准件只被一台机器用到 —— 它大概不是标准件
  | 'deferred' // 标了未定义、等着后面推导的条目
  | 'prop_undeclared' // 有人提了要求，但没有任何生产者声明这个属性 —— 老路线的常态
  | 'prop_unfilled' // 生产者都声明了，但没一条交付的窗口够得着要求
  | 'prop_widened' // 交付窗口比要求宽 —— 允许，但差多少要看见
  | 'prop_not_functional' // onRelax: functional-lost —— 不是降级，是换了东西
  | 'prop_transforms' // 同一条路线进出的规格不同 —— 加工本来就会改规格，不是错
  | 'props_missing_dir'; // props 没写 dir，单边交付判不了方向 —— 越界可能被掩盖
;

export interface Note {
  readonly code: NoteCode;
  readonly where: string;
  readonly detail: string;
}

export interface Validation {
  readonly errors: readonly Problem[];
  /** 描述成立，但值得知道的事。 */
  readonly notes: readonly Note[];
}

/** 某个承担者能否覆盖某个条件。区间必须完全包含。 */
export function covers(holder: Condition, need: Condition): boolean {
  return holder.param === need.param && holder.min <= need.min && holder.max >= need.max;
}

/** 一个 range 窗口的可读写法（核心侧，不带单位）。 */
const fmtRange = (w: { readonly min?: number; readonly max?: number }): string => {
  const lo = w.min === undefined ? '−∞' : String(w.min);
  const hi = w.max === undefined ? '+∞' : String(w.max);
  return w.min === w.max ? lo : `${lo}–${hi}`;
};


/** 任一汉字。英文名里不应出现。 */
const HAN = /\p{Script=Han}/u;

/** 校验一份描述。只检查"写没写对"，不做任何求解。 */
export function validate(d: Description): Validation {
  const errors: Problem[] = [];
  const notes: Note[] = [];

  const itemIds = new Set<string>();
  for (const it of d.items) {
    if (itemIds.has(it.id)) {
      errors.push({ code: 'duplicate_id', where: it.id, detail: 'item id 重复' });
    }
    if (typeof it.name !== 'string' || it.name.trim() === '') {
      errors.push({ code: 'bad_name', where: it.id, detail: '条目英文名为空' });
    } else if (HAN.test(it.name)) {
      errors.push({ code: 'bad_name', where: it.id, detail: '条目英文名含中文' });
    }
    if (typeof it.name_zh !== 'string' || it.name_zh.trim() === '') {
      errors.push({ code: 'bad_name', where: it.id, detail: '条目中文名为空' });
    }
    itemIds.add(it.id);
  }

  const routeIds = new Set<string>();
  for (const r of d.routes) {
    if (routeIds.has(r.id)) {
      errors.push({ code: 'duplicate_id', where: r.id, detail: 'route id 重复' });
    }
    if (typeof r.name !== 'string' || r.name.trim() === '') {
      errors.push({ code: 'bad_name', where: r.id, detail: '路线英文名为空' });
    } else if (HAN.test(r.name)) {
      errors.push({ code: 'bad_name', where: r.id, detail: '路线英文名含中文' });
    }
    if (typeof r.name_zh !== 'string' || r.name_zh.trim() === '') {
      errors.push({ code: 'bad_name', where: r.id, detail: '路线中文名为空' });
    }
    routeIds.add(r.id);
  }

  const byItem = new Map<string, Item>(d.items.map((it) => [it.id, it]));
  const producers = new Map<string, string[]>();
  for (const r of d.routes) {
    for (const t of r.produces) producers.set(t.item, [...(producers.get(t.item) ?? []), r.id]);
  }
  const routeById = new Map<string, Route>(d.routes.map((r) => [r.id, r]));

  // ── 属性窗口（第 104 节）────────────────────────────────────────────────
  //
  // 只在"有人真的写了 need / gives"时才跑 —— 现有数据全都没写，因此零改动。
  //
  // 值与类型分开：`Item.props` 声明"有这个属性"，`gives` / `need` 才给窗口。
  // 匹配用 `propCovers`（区间包含），与 `covers` 同一个判据。
  //
  // 三个码分得很清，否则一上来就是几百条报错：
  //   prop_unknown    要求/交付了条目没声明的属性            → 写错
  //   prop_conflict   同一条路线对同一属性自相矛盾            → 写错
  //   prop_undeclared 有人要求，没有生产者声明这个属性        → 提示（老路线的常态）
  //   prop_unfilled   生产者声明了，但窗口够不着              → 提示（带"差多少"）
  //   prop_widened    交付比要求宽                            → 提示（允许）
  const fmtReq = (r: PropReq): string => {
    if (r.kind === 'range') {
      const lo = r.min === undefined ? '−∞' : String(r.min);
      const hi = r.max === undefined ? '+∞' : String(r.max);
      return `${r.param} ${lo}–${hi}`;
    }
    if (r.kind === 'enum') return `${r.param} ∈ {${r.oneOf.join('/')}}`;
    return `${r.param} ⊇ {${(r.atLeast ?? []).join('/')}}`;
  };

  const isWider = (give: PropReq, need: PropReq): boolean => {
    if (give.kind === 'range' && need.kind === 'range') {
      const gmin = give.min ?? Number.NEGATIVE_INFINITY;
      const gmax = give.max ?? Number.POSITIVE_INFINITY;
      const nmin = need.min ?? Number.NEGATIVE_INFINITY;
      const nmax = need.max ?? Number.POSITIVE_INFINITY;
      return gmin < nmin || gmax > nmax;
    }
    if (give.kind === 'enum' && need.kind === 'enum') return give.oneOf.length > need.oneOf.length;
    if (give.kind === 'set' && need.kind === 'set') {
      return (give.atLeast ?? []).length > (need.atLeast ?? []).length;
    }
    return false;
  };

  const checkPropShape = (p: PropReq, where: string): void => {
    if (p.kind === 'range') {
      const min = p.min ?? Number.NEGATIVE_INFINITY;
      const max = p.max ?? Number.POSITIVE_INFINITY;
      if (min > max) {
        errors.push({ code: 'bad_prop', where, detail: `${p.param} 窗口不成立：${fmtReq(p)}` });
      }
    } else if (p.kind === 'enum') {
      if (p.oneOf.length === 0) {
        errors.push({ code: 'bad_prop', where, detail: `${p.param} 的 oneOf 为空` });
      }
    }
  };

  const declOf = (itemId: string, param: string) =>
    (byItem.get(itemId)?.props ?? []).find((x) => x.param === param);

  // ── 必选：声明了属性，就必须交付；写了要求，就必须表态 ─────────────────
  //
  // 三条规则把"可选"变成"不能不回答"，但不强求老数据先补：
  //
  //   prop_dup_decl        同一条目对同一属性声明两次            → 写错
  //   prop_missing_gives   **条目声明了属性，而某条产出路线没给窗口** → 写错
  //   prop_no_onrelax      写了 need 却没写 onRelax             → 写错（降级必须表态）
  //
  // 第二条是关键：它把"我只声明、不交付"这条路堵死 —— 一旦给了属性，
  // 每条产出路线都必须回答"我给的是什么规格"。
  for (const it of d.items) {
    const seen = new Set<string>();
    for (const p of it.props ?? []) {
      if (seen.has(p.param)) {
        errors.push({
          code: 'prop_dup_decl',
          where: it.id,
          detail: `属性 ${p.param} 声明了两次`,
        });
      }
      seen.add(p.param);
      if (p.kind === 'range' && p.min > p.max) {
        errors.push({ code: 'bad_prop', where: it.id, detail: `${p.param} 的声明区间不成立` });
      }
      if (p.kind !== 'range' && p.values.length === 0) {
        errors.push({ code: 'bad_prop', where: it.id, detail: `${p.param} 的取值表为空` });
      }
    }
  }

  const checkQty = (x: Qty, where: string): void => {
    const ok =
      Number.isInteger(x.num) && Number.isInteger(x.den) && x.num > 0 && x.den > 0;
    if (!ok) {
      errors.push({ code: 'bad_quantity', where, detail: `数量 ${x.num}/${x.den} 不是正有理数` });
    }
  };

  const checkCond = (c: Condition, where: string): void => {
    if (!Number.isFinite(c.min) || !Number.isFinite(c.max) || c.min > c.max) {
      errors.push({ code: 'bad_condition', where, detail: `${c.param} 区间不成立` });
    }
  };

  // 环境条件：现场本来就在维持的那些（火星大气压），只能有一处声明，且区间必须成立。
  for (const a of d.ambient ?? []) checkCond(a, 'ambient');

  for (const it of d.items) {
    const namedInterface = it.id.startsWith('iface/');
    if (namedInterface !== (it.interface === true)) {
      errors.push({
        code: 'interface_flag_mismatch',
        where: it.id,
        detail: namedInterface
          ? 'iface/ 条目必须写 interface: true'
          : 'interface: true 的条目必须用 iface/ 前缀',
      });
    }
    if (it.interface === true) {
      if (it.category !== undefined) {
        errors.push({
          code: 'abstract_has_concrete_fields',
          where: it.id,
          detail: '抽象接口不能有 category',
        });
      }
      if (it.mass !== undefined) {
        errors.push({
          code: 'abstract_has_concrete_fields',
          where: it.id,
          detail: '抽象接口不能有 mass',
        });
      }
      if ((it.composedOf ?? []).length > 0) {
        errors.push({
          code: 'abstract_has_concrete_fields',
          where: it.id,
          detail: '抽象接口不能有 composedOf',
        });
      }
      if ((it.holds ?? []).length > 0) {
        errors.push({
          code: 'abstract_has_concrete_fields',
          where: it.id,
          detail: '抽象接口不能提供条件（holds）',
        });
      }
      if (it.extends !== undefined) {
        errors.push({
          code: 'extends_invalid',
          where: it.id,
          detail: '先只支持单继承：接口不能再 extends 另一个接口',
        });
      }
    } else if (it.extends !== undefined) {
      const parent = byItem.get(it.extends);
      if (parent === undefined) {
        errors.push({
          code: 'unknown_item',
          where: it.id,
          detail: 'extends 指向未声明条目 ' + it.extends,
        });
      } else if (parent.interface !== true) {
        errors.push({
          code: 'extends_invalid',
          where: it.id,
          detail: 'extends 只能指向 iface/ 抽象接口，而 ' + it.extends + ' 不是接口',
        });
      }
    }

    if (it.monolithic === true) {
      if (it.category !== 'machine' && it.category !== 'part') {
        errors.push({
          code: 'bad_category',
          where: it.id,
          detail: 'monolithic 只对机器与零件有意义',
        });
      }
      if ((it.composedOf ?? []).length > 0) {
        errors.push({
          code: 'bad_component',
          where: it.id,
          detail: 'monolithic 条目由材料直接加工，不能同时写 composedOf',
        });
      }
    }

    for (const c of it.holds ?? []) checkCond(c, `item ${it.id}`);
    // 标准件的规格号是它唯一的消歧方式 —— 没有规格的 std/ 就是"没写规格的标准件"，
    // 和扁平的 machine_base 一样不可处理。
    if (it.id.startsWith('std/')) {
      const head = it.id.slice('std/'.length).split('/')[0] ?? '';
      if (!head.includes('-')) {
        errors.push({
          code: 'std_without_spec',
          where: it.id,
          detail: '标准件要在名字里带规格号（std/类型-规格），而 "' + head + '" 没有规格段',
        });
      }
    }
    // 只有设备能提供条件
    if (
      (it.holds ?? []).length > 0 &&
      it.category !== undefined &&
      it.category !== 'machine'
    ) {
      errors.push({
        code: 'bad_category',
        where: it.id,
        detail: '标为 ' + it.category + '，却在维持条件 —— 只有设备能提供条件',
      });
    }
    // 未定义只落在零件与消耗上 —— 机器要承担条件与零件清单，
    // 一台"未定义的机器"什么也证明不了，等于把黑洞写成了占位。
    if (it.deferred === true && it.category !== 'part' && it.category !== 'consumable') {
      errors.push({
        code: 'bad_category',
        where: it.id,
        detail:
          '标为未定义，但它是 ' + (it.category ?? '未标类别') + ' —— 未定义只落在零件与消耗件上',
      });
    }

    // ⚠️ 「自制机器必须有零件」与「装配质量账」是**路线级**的检查，
    // 曾经写在这个条目循环里 —— 于是同一条坏路线会被报 N 次（N = 条目数）。
    // 它们现在在路线循环里，见下面的 `machine_without_parts` 那一段。


    // 消耗件：必须是消耗件条目，数量与时长都为正
    for (const c of it.consumption ?? []) {
      const target = byItem.get(c.item);
      if (target === undefined) {
        errors.push({ code: 'unknown_item', where: it.id, detail: '消耗件 ' + c.item + ' 未声明' });
      } else if (target.category !== 'consumable') {
        errors.push({
          code: 'bad_component',
          where: it.id,
          detail: c.item + ' 不是消耗件（category = ' + (target.category ?? '未标') + '）',
        });
      }
      checkQty(c.qty, it.id + ' 消耗 ' + c.item);
      checkQty(c.per, it.id + ' 消耗周期');
    }

    // 装配与加工是两件事，但不再互斥：条目用 `composedOf` 定义“由哪些零件组成”，
    // 路线回答“怎么造出来”。`uses` 只写**加工**消耗的东西（不可逆）；装配的
    // 零件是可逆的组合，留在 `composedOf`，不重复进 `uses`。

    // 组成：零件或材料。不重复，不自指，零件走路径，质量要对得上。
    // 递归结构：机器由零件组成，零件由材料组成 —— 材料不再有 composedOf。
    const seenParts = new Set<string>();
    let componentMass: Qty = { num: 0, den: 1 };
    let massComplete = true;
    for (const comp of it.composedOf ?? []) {
      // 装配也是一步：装上去的东西可以带"要求"。判据与 `uses` 里那条同一份 ——
      // 写了要求就必须表态放宽之后是 kept 还是 lost。
      // 为什么要有这一格：装配的规格要求只能挂在“装上去的那一件”上，
      // 于是"整机要 20 轴、零件只交 6 轴"这种话以前无处可写，任何一张表都看不见。
      if ((comp.need ?? []).length > 0 && comp.onRelax === undefined) {
        errors.push({
          code: 'prop_no_onrelax',
          where: `${it.id} ← ${comp.item}`,
          detail: '零件清单里写了 need 却没写 onRelax —— 降级必须表态：functional-kept 还是 functional-lost',
        });
      }
      const declaredTarget = byItem.get(comp.item);
      let target: Item | undefined;
      if (declaredTarget === undefined) {
        errors.push({ code: 'unknown_item', where: it.id, detail: '组成件 ' + comp.item + ' 未声明' });
      } else if (declaredTarget.interface === true) {
        try {
          const resolvedId = resolveItemRef(comp.item, comp.select, byItem);
          target = byItem.get(resolvedId);
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          const code = msg.startsWith('ambiguous')
            ? 'ambiguous_abstract_part'
            : msg.startsWith('bad_implementation')
              ? 'bad_implementation'
              : 'bad_component';
          errors.push({ code, where: it.id, detail: msg });
        }
      } else {
        target = declaredTarget;
        if (comp.select !== undefined) {
          errors.push({
            code: 'bad_implementation',
            where: it.id,
            detail: comp.item + ' 是具体条目，不能写 select',
          });
        }
      }

      if (target !== undefined) {
        if (target.category !== 'part' && target.category !== 'machine') {
          errors.push({
            code: 'bad_component',
            where: it.id,
            detail:
              target.id +
              ' 既不是零件也不是子机器（category = ' +
              (target.category ?? '未标') +
              '）—— composedOf 只装零件或子机器',
          });
        } else if (
          declaredTarget?.interface !== true &&
          target.category === 'part' &&
          !comp.item.startsWith(it.id + '/') &&
          !comp.item.startsWith('std/')
        ) {
          // 零件 id 两种形态，两种消歧方式：
          //   <machine>/<name>   专用件，规格由机器决定（车床主轴与铣床主轴不是同一个东西）
          //   std/<type>-<spec>  标准件，规格写在名字里（6205 轴承装在哪台机器上都是 6205）
          // 前缀不是"归属"，是消歧；标准件用规格号消歧，所以不需要机器前缀。
          // 子机器不适用：机器 id 本身全局唯一，不需要父前缀。
          errors.push({
            code: 'bad_component',
            where: it.id,
            detail:
              '零件 ' + comp.item + ' 既不是以 ' + it.id + '/ 开头的路径，也不是 std/ 标准件',
          });
        }
      }
      if (target?.category === 'machine' && comp.wear !== undefined) {
        errors.push({
          code: 'bad_component',
          where: it.id,
          detail: comp.item + ' 是子机器，不能按零件写 wear —— 整机寿命另算',
        });
      }
      const resolvedKey = target?.id ?? comp.item;
      if (resolvedKey === it.id) {
        errors.push({ code: 'bad_component', where: it.id, detail: '自己由自己组成' });
      }
      if (seenParts.has(resolvedKey)) {
        errors.push({ code: 'bad_component', where: it.id, detail: '组成件 ' + resolvedKey + ' 重复' });
      }
      seenParts.add(resolvedKey);
      checkQty(comp.qty, it.id + ' 组成件 ' + comp.item);

      // 质量：一律按「件数 × 单件质量」计
      if (target !== undefined) {
        if (target.mass !== undefined) {
          componentMass = qAdd(componentMass, qMul(comp.qty, target.mass));
        } else {
          massComplete = false;
        }
      }

      if (comp.wear !== undefined) {
        const w = comp.wear;
        if (!(w.amount.num > 0) || w.amount.num > w.amount.den) {
          errors.push({
            code: 'bad_component',
            where: it.id,
            detail: comp.item + ' 的磨损比例必须在 (0, 1] 内',
          });
        }
        if (!(w.per.num > 0)) {
          errors.push({
            code: 'bad_component',
            where: it.id,
            detail: comp.item + ' 的磨损时长必须为正（运行小时）',
          });
        }
      }
    }

    // 材料由制造方式决定：产出这个零件的路线消耗了多少 kg 材料，
    // 就等于它有多重。两边对不上，说明材料写错了或质量写错了。
    if (it.mass !== undefined && it.category === 'part') {
      for (const r of d.routes) {
        if (!r.produces.some((x) => x.item === it.id)) continue;
        const inputMass = r.uses
          .flatMap((c) => c.anyOf)
          .filter((o) => normUnit(byItem.get(o.item)?.unit) === 'kg')
          .reduce((acc, o) => qAdd(acc, o.qty), { num: 0, den: 1 } as Qty);
        if (inputMass.num === 0) continue; // 纯装配，没有材料投入
        if (inputMass.num !== it.mass.num || inputMass.den !== it.mass.den) {
          errors.push({
            code: 'mass_mismatch',
            where: r.id,
            detail:
              it.id + ' 声明质量 ' + formatQty(it.mass) + ' kg，这条路线投入 ' + formatQty(inputMass) + ' kg',
          });
        }
      }
    }

    // 质量账：有 composedOf 的条目，自己声明的 mass 必须等于组成件之和。
    // 否则 mass 只是另一个地方的数字，改一个零件它就不声不响地错了。
    if ((it.composedOf ?? []).length > 0 && it.mass !== undefined) {
      if (!massComplete) {
        errors.push({
          code: 'bad_component',
          where: it.id,
          detail: '组成件里有既非 kg 计、又没有 mass 的条目 —— 质量核不出来',
        });
      } else if (componentMass.num !== it.mass.num || componentMass.den !== it.mass.den) {
        errors.push({
          code: 'mass_mismatch',
          where: it.id,
          detail:
            '声明质量 ' + formatQty(it.mass) + ' kg，组成件合计 ' + formatQty(componentMass) + ' kg',
        });
      }
    }

    // 零件只能被"装配"消耗 —— 装配的产出必须是机器。
    // 消耗生铁产出床身的路线也可能拿零件当原料，那是把成品拆了回炉，必须显式承认。
    if (it.category === 'part') {
      for (const r of d.routes) {
        const usedHere = r.uses.some((c) => c.anyOf.some((o) => o.item === it.id));
        if (!usedHere) continue;
        // 装配的产出可以是机器（总装），也可以是另一个零件（子装配：
        // 轴承装进主轴单元，主轴单元再装进铣床）。两者都不算把零件当原料。
        const assembles = r.produces.some((x) => {
          const c = byItem.get(x.item)?.category;
          return c === 'machine' || c === 'part';
        });
        if (assembles) continue;
        errors.push({
          code: 'part_as_raw_material',
          where: r.id,
          detail:
            '零件 ' + it.id + ' 被当成原料 —— 这条路线不产出机器，装不起来',
        });
      }
    }

    // 设备被当成消耗品 —— 最容易误写的一处，必须拦
    const consumed = d.routes.some((r) =>
      r.uses.some((c) => c.anyOf.some((o) => o.item === it.id)),
    );
    if (it.category === 'machine' && consumed) {
      errors.push({
        code: 'machine_consumed',
        where: it.id,
        detail: '设备出现在 uses 里 —— 设备不被消耗，只能在 performedBy 里被指名',
      });
    }

  }

  // D1: 子机器可以进 composedOf，但不能成环（A 装 B、B 又装 A）。
  // 只沿 machine 边 DFS；零件/材料不能有 composedOf，天然不参与。
  const reportedInCycle = new Set<string>();
  for (const it of d.items) {
    if (it.category !== 'machine') continue;
    const stack = new Set<string>();
    const visit = (id: string): boolean => {
      if (stack.has(id)) return true;
      const node = byItem.get(id);
      if (node === undefined || node.category !== 'machine') return false;
      stack.add(id);
      for (const c of node.composedOf ?? []) {
        if (c.item === node.id) continue; // 自指已由 bad_component 报
        const t = byItem.get(c.item);
        if (t?.category === 'machine' && visit(t.id)) return true;
      }
      stack.delete(id);
      return false;
    };
    if (visit(it.id)) {
      const nodes = [...stack];
      if (!nodes.some((n) => reportedInCycle.has(n))) {
        for (const n of nodes) reportedInCycle.add(n);
        errors.push({
          code: 'composed_cycle',
          where: it.id,
          detail: '子机器组成成环 —— 拆不开也装不上',
        });
      }
    }
  }

  /**
   * 条件必须有承担者 —— 单工序路线与工序链的每一段都走这一条判据。
   *
   * 不做全表搜索：承担者必须是这条路线自己写出来的（本段执行者，或 `needs` 里的
   * 设备）。推断出来的持有者无法在描述里被追责。
   */
  const checkConditions = (
    conditions: readonly Condition[],
    performer: string | undefined,
    needs: readonly Need[],
    routeId: string,
    label: string,
  ): void => {
    const where = label === '' ? routeId : routeId + ' · ' + label;
    if (conditions.length > 0 && performer === undefined) {
      errors.push({
        code: 'no_machine',
        where,
        detail: '要求了条件，却没有指定由哪台设备维持 —— 条件必须有执行者',
      });
    }
    for (const need of conditions) {
      checkCond(need, where);
      // 环境本身就满足的，不要求设备 —— 但环境条件要单独校验过（见 validate 末尾）。
      //
      // 判据是**区间相交**，不是 covers：环境是一个确定的值（火星 0.6 kPa），
      // 而路线写的是一条允许带（"0.5–0.6 就行"）。用 covers 会要求
      // "环境的区间包住需求的区间"，那对点值永远不成立。
      const byAmbient = (d.ambient ?? []).some(
        (a) => a.param === need.param && a.max >= need.min && a.min <= need.max,
      );
      if (byAmbient) continue;
      const candidates = [performer, ...needItems(needs)]
        .filter((x): x is string => x !== undefined)
        .map((id) => byItem.get(id))
        .filter((x): x is Item => x !== undefined && x.category === 'machine');

      const holder = candidates.find((m) => (m.holds ?? []).some((h) => covers(h, need)));
      if (holder === undefined) {
        const who = candidates.map((m) => m.id).join(' / ') || '（没有设备）';
        errors.push({
          code: 'no_machine',
          where,
          detail:
            '候选设备 ' + who + ' 都维持不了 ' + need.param +
            ' ∈ [' + need.min + ', ' + need.max + ']',
        });
      }
      // 条件自举：真正维持该条件的设备，本身是被造出来的，而造它又需要同一个条件。
      // 只对**确实 hold 了该条件**的设备判 —— 执行者可能并不提供条件（车床不提供恒温）。
      for (const m of candidates.filter((x) => (x.holds ?? []).some((h) => covers(h, need)))) {
        if ((producers.get(m.id) ?? []).length === 0) continue;
        for (const maker of d.routes) {
          if (!maker.produces.some((x) => x.item === m.id)) continue;
          const makerConditions = [
            ...(maker.under ?? []),
            ...(maker.steps ?? []).flatMap((s) => s.under ?? []),
          ];
          const circular = makerConditions.some(
            (c) => c.param === need.param && c.min <= need.max && c.max >= need.min,
          );
          if (circular) {
            errors.push({
              code: 'condition_cycle',
              where,
              detail:
                '条件 ' + need.param + ' 由 ' + m.id + ' 提供，而造 ' + m.id + ' 又需要同一个条件',
            });
          }
        }
      }
    }
  };

  for (const r of d.routes) {
    // 自制机器必须有组成件（零件或子机器）。造一台机器却一个组成件都不写，
    // 说明它是个黑箱：要么根本没拆开写，要么它不是这台机器而是一堆原料的直接浇铸。
    // 外购的机器不受这条约束 —— 体系内不造它，自然没有它的组成件。
    //
    // ⚠️ 这两条是**路线级**判据。曾经误写在条目循环里：同一条坏路线会被报
    // N 次（N = 条目数），条目越多错误越多，而"错了几条"这个数就没意义了。
    const madeMachines = r.produces
      .map((x) => x.item)
      .filter((id) => byItem.get(id)?.category === 'machine');
    if (madeMachines.length > 0) {
      const hasPart = r.uses
        .flatMap((c) => c.anyOf)
        .some((o) => byItem.get(o.item)?.category === 'part');
      for (const m of madeMachines) {
        // 组成件的来源有两处：路线的 `uses`（加工投入的零件），或条目的
        // `composedOf`（装配定义，零件或子机器）。装配路线不把组成件写进 uses，
        // 所以这里要认条目那份。
        const declared =
          (byItem.get(m)?.composedOf ?? []).length > 0 ||
          byItem.get(m)?.monolithic === true;
        if (hasPart || declared) continue;
        errors.push({
          code: 'machine_without_parts',
          where: r.id,
          detail: '造 ' + m + ' 却没有任何组成件（零件或子机器）—— 这台机器是个黑箱',
        });
      }

      // 装配的质量账必须算得通：零件以 kg 计，装出来的机器也必须以 kg 计。
      // 若机器没有 unit，产出量就成了"台数" —— 把 2568 kg 写成 2568 台，
      // 说的完全不是一件事。这种错必须写不出来。
      const kgParts = r.uses
        .flatMap((c) => c.anyOf)
        .filter((o) => byItem.get(o.item)?.category === 'part')
        .filter((o) => normUnit(byItem.get(o.item)?.unit) === 'kg');
      if (kgParts.length > 0) {
        for (const m of madeMachines) {
          const target = byItem.get(m);
          if (normUnit(target?.unit) === 'kg') continue;
          errors.push({
            code: 'machine_unit_mismatch',
            where: r.id,
            detail: '用 kg 零件装配 ' + m + '，但它没有以 kg 计 —— 产出量会被读成台数',
          });
        }
      }
    }

    if (r.produces.length === 0 && r.uses.length === 0) {
      errors.push({ code: 'empty_route', where: r.id, detail: '既不产出也不消耗' });
    }
    if (r.produces.length === 0 && r.uses.length > 0) {
      errors.push({
        code: 'no_product',
        where: r.id,
        detail: '有消耗却没有产出 —— 批次规模无从定义，所有数量都成了绝对量',
      });
    }
    for (const t of r.produces) {
      if (!itemIds.has(t.item)) {
        errors.push({ code: 'unknown_item', where: r.id, detail: `产出 ${t.item} 未声明` });
      } else if (byItem.get(t.item)?.interface === true) {
        errors.push({
          code: 'route_produces_interface',
          where: r.id,
          detail: `路线不能产出抽象接口 ${t.item} —— 只能产出它的具体实现`,
        });
      }
      checkQty(t.qty, `${r.id} → ${t.item}`);
      // 交付窗口：形状要对，属性要先在条目上声明
      for (const g of t.gives ?? []) {
        const where = `${r.id} → ${t.item}`;
        checkPropShape(g, where);
        const decl = declOf(t.item, g.param);
        if (decl === undefined) {
          errors.push({
            code: 'prop_unknown',
            where,
            detail: `交付了未声明的属性 ${g.param} —— 先在 ${t.item} 的 props 里声明它`,
          });
        } else if (decl.kind !== g.kind) {
          errors.push({
            code: 'bad_prop',
            where,
            detail: `${g.param} 声明为 ${decl.kind}，交付写成 ${g.kind}`,
          });
        } else if (decl.kind === 'range' && g.kind === 'range') {
          // ── 交付必须落在声明窗口内 ────────────────────────────────────
          // 方向由 props.dir 决定：atMost 比上界、atLeast 比下界、within 比两端。
          // 空窗口 = "不限"，什么都没约束，没有越界可判。
          // 声明没写 dir 而交付是单边窗口时，方向判不了 —— 单独提示，不算越界。
          if (g.min !== undefined || g.max !== undefined) {
            const oneSided = (g.min === undefined) !== (g.max === undefined);
            if (decl.dir === undefined && oneSided) {
              notes.push({
                code: 'props_missing_dir',
                where,
                detail: `${g.param} 在 ${t.item} 的 props 里没写 dir，而交付是单边窗口 —— 方向判不了`,
              });
            } else {
              const dir = decl.dir ?? 'within';
              const lo = g.min ?? Number.NEGATIVE_INFINITY;
              const hi = g.max ?? Number.POSITIVE_INFINITY;
              const dmin = decl.min ?? Number.NEGATIVE_INFINITY;
              const dmax = decl.max ?? Number.POSITIVE_INFINITY;
              const inside =
                dir === 'atMost'
                  ? hi <= dmax
                  : dir === 'atLeast'
                    ? lo >= dmin
                    : lo >= dmin && hi <= dmax;
              if (!inside) {
                const declText =
                  dir === 'atMost' ? `≤${dmax}` : dir === 'atLeast' ? `≥${dmin}` : `${dmin}–${dmax}`;
                errors.push({
                  code: 'give_out_of_props',
                  where,
                  detail: `交付 ${fmtReq(g)} 落在声明 ${declText}（${dir}）之外`,
                });
              }
            }
          }
        }
      }
      // **必选**：条目声明了属性，这条产出路线就必须逐项交付窗口
      for (const decl of byItem.get(t.item)?.props ?? []) {
        const given = (t.gives ?? []).some((g) => g.param === decl.param);
        if (!given) {
          errors.push({
            code: 'prop_missing_gives',
            where: `${r.id} → ${t.item}`,
            detail: `${t.item} 声明了 ${decl.param}，而这条路线没给窗口 —— 声明了就必须交付（写 gives，不限也要写空窗口）`,
          });
        }
      }
    }
    for (const c of r.uses) {
      if (c.anyOf.length === 0) {
        errors.push({ code: 'empty_clause', where: r.id, detail: '输入子句为空' });
      }
      for (const opt of c.anyOf) {
        if (!itemIds.has(opt.item)) {
          errors.push({ code: 'unknown_item', where: r.id, detail: `消耗 ${opt.item} 未声明` });
        }
        checkQty(opt.qty, `${r.id} 消耗 ${opt.item}`);
      }
      // 同一子句是"任选其一"，因此各项必须可通约。
      const units = new Set(c.anyOf.map((o) => normUnit(byItem.get(o.item)?.unit) || '?'));
      if (units.size > 1) {
        errors.push({
          code: 'unit_mismatch',
          where: r.id,
          detail: `同一子句内单位不一致：${[...units].join(' / ')} —— 它们不能互相替代`,
        });
      }
      // 要求窗口：逐个选项查"有没有人能交付得了"
      for (const opt of c.anyOf) {
        // **必选**：写了要求，就必须声明放宽后的后果（第 103 节好降级的第一个要件）
        if ((opt.need ?? []).length > 0 && opt.onRelax === undefined) {
          errors.push({
            code: 'prop_no_onrelax',
            where: `${r.id} ← ${opt.item}`,
            detail: '写了 need 却没写 onRelax —— 降级必须表态：functional-kept 还是 functional-lost',
          });
        }
        for (const need of opt.need ?? []) {
          const where = `${r.id} ← ${opt.item}`;
          checkPropShape(need, where);
          const decl = declOf(opt.item, need.param);
          if (decl === undefined) {
            errors.push({
              code: 'prop_unknown',
              where,
              detail: `要求了未声明的属性 ${need.param} —— 先在 ${opt.item} 的 props 里声明它`,
            });
            continue;
          }
          if (decl.kind !== need.kind) {
            errors.push({
              code: 'bad_prop',
              where,
              detail: `${need.param} 声明为 ${decl.kind}，要求写成 ${need.kind}`,
            });
            continue;
          }
          // `functional-lost` 的报法：只在**真的满足不了**时才说
          // "只能靠放宽实现"。一旦有路线能交付，它就不再是一条降级，
          // 而是一条正常要求 —— 否则提示会永远挂着，读到的人会当成噪声。
          const producerIds = producers.get(opt.item) ?? [];
          if (producerIds.length === 0) continue; // 无生产者归 unproduced，不重复报
          const windows: PropReq[] = [];
          let covered = false;
          let widened: PropReq | undefined;
          for (const pid of producerIds) {
            const pr = routeById.get(pid);
            const term = pr?.produces.find((x) => x.item === opt.item);
            if (term === undefined) continue;
            for (const g of term.gives ?? []) {
              if (g.param !== need.param || g.kind !== need.kind) continue;
              windows.push(g);
              if (propCovers(g, need)) {
                covered = true;
                if (widened === undefined && isWider(g, need)) widened = g;
              }
            }
          }
          if (windows.length === 0) {
            notes.push({
              code: 'prop_undeclared',
              where: r.id,
              detail: `要 ${opt.item} 的 ${fmtReq(need)}，而它的 ${producerIds.length} 条路线都没声明这个属性`,
            });
          } else if (!covered) {
            notes.push({
              code: 'prop_unfilled',
              where: r.id,
              detail: `要 ${fmtReq(need)}，现有窗口只有 ${windows.map(fmtReq).join(' / ')}`,
            });
            if (opt.onRelax === 'functional-lost') {
              notes.push({
                code: 'prop_not_functional',
                where: r.id,
                detail: `${opt.item} 的 ${fmtReq(need)} 满足不了，而放宽会**丢掉功能** —— 进「不是降级，是换了东西」`,
              });
            }
          } else if (widened !== undefined) {
            notes.push({
              code: 'prop_widened',
              where: r.id,
              detail: `要 ${fmtReq(need)}，交付 ${fmtReq(widened)} —— 够用，但窗口更宽`,
            });
          }
        }
      }
    }
    // 同一条路线对同一属性有两个窗口：进 96–98、出 10–20。
    //
    // **这不是错误** —— 加工本来就会改变规格（兑水就是干这个的）。
    // 所以只作提示：让"哪条路线在改规格"浮出来，而不是当成矛盾拦下。
    // 第一版把它写成 prop_conflict（错误），结果第一条稀酸路线就被自己拦住了 ——
    // 那正说明"属性守恒"这个前提不成立：属性会被工艺改变，而且常常必须被改变。
    for (const t of r.produces) {
      for (const c of r.uses) {
        for (const opt of c.anyOf) {
          if (opt.item !== t.item) continue;
          for (const need of opt.need ?? []) {
            const g = (t.gives ?? []).find((x) => x.param === need.param && x.kind === need.kind);
            if (g === undefined) continue;
            if (!propCovers(g, need)) {
              notes.push({
                code: 'prop_transforms',
                where: r.id,
                detail: `${t.item} 的 ${need.param}：进 ${fmtReq(need)}、出 ${fmtReq(g)} —— 这条路线在改变规格`,
              });
            }
          }
        }
      }
    }
    for (const need of r.needs) {
      for (const o of needOptions(need)) {
        if (!itemIds.has(o.item)) {
          errors.push({ code: 'unknown_item', where: r.id, detail: `前提 ${o.item} 未声明` });
        }
        if (r.produces.some((t) => t.item === o.item)) {
          notes.push({ code: 'self_reference', where: r.id, detail: `自指：以自己产出的 ${o.item} 为前提` });
        }
        checkQty(o.qty, r.id + ' 前提 ' + o.item);
        if ((o.need ?? []).length > 0 && o.onRelax === undefined) {
          errors.push({
            code: 'prop_no_onrelax',
            where: `${r.id} ← ${o.item}`,
            detail: '前提写了 need 却没写 onRelax —— 降级必须表态：functional-kept 还是 functional-lost',
          });
        }
        for (const req of o.need ?? []) {
          const where = `${r.id} ← ${o.item}`;
          checkPropShape(req, where);
          if (!itemIds.has(o.item)) continue;
          const decl = declOf(o.item, req.param);
          if (decl === undefined) {
            errors.push({
              code: 'prop_unknown',
              where,
              detail: `前提要求了未声明的属性 ${req.param}`,
            });
          } else if (decl.kind !== req.kind) {
            errors.push({
              code: 'bad_prop',
              where,
              detail: `${req.param} 声明为 ${decl.kind}，要求写成 ${req.kind}`,
            });
          }
        }
      }
    }
    // 母机自指：由自己产出的设备来执行自己。这不是循环定义，是工业史的事实。
    if (r.performedBy !== undefined && r.produces.some((x) => x.item === r.performedBy)) {
      notes.push({
        code: 'self_reference',
        where: r.id,
        detail: '自指：由自己产出的 ' + r.performedBy + ' 来执行 —— 母机',
      });
    }
    if (r.performedBy !== undefined) {
      const m = byItem.get(r.performedBy);
      if (m === undefined) {
        errors.push({ code: 'unknown_item', where: r.id, detail: '执行者 ' + r.performedBy + ' 未声明' });
      } else if (m.category !== 'machine') {
        errors.push({
          code: 'not_a_machine',
          where: r.id,
          detail: '执行者 ' + r.performedBy + ' 不是设备（category = ' + (m.category ?? '未标') + '）',
        });
      }
    }
    // needs 里可以出现执行设备，但必须带规格窗口：performedBy 只指名，不定义设备。
    // 裸重复才算冗余；带 need 的那条是执行设备的窗口落点。
    if (r.performedBy !== undefined) {
      const opts = r.needs
        .flatMap(needOptions)
        .filter((o) => o.item === r.performedBy);
      if (opts.length > 0 && !opts.some((o) => (o.need ?? []).length > 0)) {
        errors.push({
          code: 'redundant_need',
          where: r.id,
          detail:
            'needs 里重复了执行设备 ' +
            r.performedBy +
            ' 且没有规格窗口 —— 设备只由 performedBy 表达',
        });
      }
    }

    // 质量守恒：只对 unit 为 kg 的项求和。不同量纲不可能相加。
    // 零用字面量：q(0) 被构造器拒绝
    const zero: Qty = { num: 0, den: 1 };
    const sum = (xs: readonly { item: string; qty: Qty }[]): Qty =>
      xs
        .filter((x) => normUnit(byItem.get(x.item)?.unit) === 'kg')
        .reduce((acc, x) => qAdd(acc, x.qty), zero);
    const inMass = sum(r.uses.flatMap((c) => c.anyOf));
    const outMass = sum(r.produces);
    // 只有产出全部以 kg 计量时才断言质量守恒。
    // 若产出里有别的量纲（例如设备按台计），进料与出料本来就不可比 —— 断言它就是瞎判。
    const allProducedKg = r.produces.every(
      (x) => normUnit(byItem.get(x.item)?.unit) === 'kg',
    );
    const hasMass = allProducedKg && (inMass.num > 0 || outMass.num > 0);
    if (hasMass && !(inMass.num * outMass.den === outMass.num * inMass.den)) {
      const detail =
        '质量不守恒：进 ' + formatQty(inMass) + ' kg，出 ' + formatQty(outMass) + ' kg（只算 kg 项）';
      if (r.unbalanced_zh === undefined) {
        errors.push({ code: 'unbalanced', where: r.id, detail });
      } else {
        notes.push({ code: 'declared_unbalanced', where: r.id, detail: r.unbalanced_zh });
      }
    }

    // 条件由执行者提供 —— 不做事后搜索。单工序路线用 `under`，多工序写进 `steps`。
    checkConditions(r.under ?? [], r.performedBy, r.needs, r.id, '');

    // ── 工序链 ────────────────────────────────────────────────────────
    // 一条路线可以是几道工序接力：每段一台设备、一组条件；物料流仍写在这条路线上。
    // 有 steps 就不许再写路线级的 performedBy / under —— 同一件事不能两个说法。
    if (r.steps !== undefined) {
      if (r.steps.length === 0) {
        errors.push({
          code: 'empty_steps',
          where: r.id,
          detail: 'steps 是空数组 —— 不写这个字段比写空好',
        });
      }
      if (r.performedBy !== undefined || (r.under ?? []).length > 0) {
        errors.push({
          code: 'step_conflict',
          where: r.id,
          detail: '同时写了 steps 与路线级 performedBy/under —— 那条路线到底几道工序？',
        });
      }
    }
    for (const st of r.steps ?? []) {
      const label = st.note_zh ?? '工序';
      const where = r.id + ' · ' + label;
      if (st.performedBy !== undefined) {
        const m = byItem.get(st.performedBy);
        if (m === undefined) {
          errors.push({ code: 'unknown_item', where, detail: '执行者 ' + st.performedBy + ' 未声明' });
        } else if (m.category !== 'machine') {
          errors.push({
            code: 'not_a_machine',
            where,
            detail: '执行者 ' + st.performedBy + ' 不是设备（category = ' + (m.category ?? '未标') + '）',
          });
        }
        if (st.performedBy !== undefined) {
          const opts = r.needs
            .flatMap(needOptions)
            .filter((o) => o.item === st.performedBy);
          if (opts.length > 0 && !opts.some((o) => (o.need ?? []).length > 0)) {
            errors.push({
              code: 'redundant_need',
              where,
              detail:
                'needs 里重复了这一段执行设备 ' +
                st.performedBy +
                ' 且没有规格窗口 —— 设备只由工序表达',
            });
          }
        }
        if (r.produces.some((x) => x.item === st.performedBy)) {
          notes.push({
            code: 'self_reference',
            where,
            detail: '自指：由自己产出的 ' + st.performedBy + ' 来执行 —— 母机',
          });
        }
      }
      checkConditions(st.under ?? [], st.performedBy, r.needs, r.id, label);
    }
  }

  // ── 同一 std/ 被多条路线交成不同规格 ────────────────────────────────────
  //
  // 判据：同一条目被 ≥2 条路线产出时，lineWidth / node / layers 三个参数的
  // 同侧端点相对差 > 20 %（0 与非零算 100 %），或 within 两端不重叠，即不一致。
  // 只查这三个参数：它们定义芯片与工艺世代，别处窗口不同是正常的。
  const SPEC_PARAMS: ReadonlySet<string> = new Set(['lineWidth', 'node', 'layers']);
  const relGap = (a: number | undefined, b: number | undefined): number => {
    if (a === undefined && b === undefined) return 0;
    if (a === undefined || b === undefined) return Number.POSITIVE_INFINITY;
    if (a === b) return 0;
    if (a === 0 || b === 0) return 1;
    return Math.abs(a - b) / Math.max(Math.abs(a), Math.abs(b));
  };

  for (const it of d.items) {
    if (!it.id.startsWith('std/')) continue;
    const routeIds = [...new Set(producers.get(it.id) ?? [])];
    if (routeIds.length < 2) continue;
    for (const decl of it.props ?? []) {
      if (decl.kind !== 'range' || !SPEC_PARAMS.has(decl.param)) continue;
      const groups = new Map<string, { min?: number; max?: number; routes: string[] }>();
      for (const rid of routeIds) {
        const term = routeById.get(rid)?.produces.find((x) => x.item === it.id);
        for (const g of term?.gives ?? []) {
          if (g.kind !== 'range' || g.param !== decl.param) continue;
          const key = `${g.min ?? '−∞'}|${g.max ?? '+∞'}`;
          const grp = groups.get(key) ?? { min: g.min, max: g.max, routes: [] };
          if (!grp.routes.includes(rid)) grp.routes.push(rid);
          groups.set(key, grp);
        }
      }
      const wins = [...groups.values()];
      for (let i = 0; i < wins.length; i++) {
        for (let j = i + 1; j < wins.length; j++) {
          const a = wins[i]!;
          const b = wins[j]!;
          const dir = decl.dir ?? 'within';
          const bad =
            dir === 'atMost'
              ? relGap(a.max, b.max) > 0.2
              : dir === 'atLeast'
                ? relGap(a.min, b.min) > 0.2
                : Math.max(relGap(a.min, b.min), relGap(a.max, b.max)) > 0.2 ||
                  (a.max ?? Number.POSITIVE_INFINITY) < (b.min ?? Number.NEGATIVE_INFINITY) ||
                  (b.max ?? Number.POSITIVE_INFINITY) < (a.min ?? Number.NEGATIVE_INFINITY);
          if (!bad) continue;
          errors.push({
            code: 'multi_spec',
            where: `${it.id} ${decl.param}`,
            detail: `${a.routes.join('·')} 交 ${fmtRange(a)} vs ${b.routes.join('·')} 交 ${fmtRange(b)}`,
          });
        }
      }
    }
  }

  // 标了未定义、等着后面推导的条目 —— 必须列出来。
  // 占位的用处是"先放着"，不是"放完就忘"。
  const deferred = d.items.filter((it) => it.deferred === true);
  if (deferred.length > 0) {
    notes.push({
      code: 'deferred',
      where: '(description)',
      detail: deferred.map((x) => x.id).join(', '),
    });
  }

  // 有没有产出路线不是声明，是事实：没路线的就是从外面来的。
  // 但把它列出来 —— 否则"忘了写某条路线"与"确实要进口"长得一模一样。
  // 有 composedOf 的是装配体 —— 它的来历是零件清单，不是产出路线
  const unproduced = d.items.filter(
    (it) =>
      it.interface !== true &&
      (producers.get(it.id) ?? []).length === 0 &&
      (it.composedOf ?? []).length === 0,
  );
  if (unproduced.length > 0) {
    notes.push({
      code: 'unproduced',
      where: '(description)',
      detail: unproduced.map((x) => x.id).join(', '),
    });
  }

  // 被 performedBy 指名、或在 needs 里被列为前提的设备，都算在用。
  // 只查 route 级 performedBy 会把两类设备误报为闲置：
  //   ① 只提供环境、不执行工序的（恒温车间、量块）—— 它们在 needs 里；
  //   ② **只在某道工序里出场的**（高频炉、线锯、曝光机）—— 它们在 steps 里。
  // 第 ② 类是 2026-08 修的一次真误报：五台设备明明在 steps 里干活，全被报成闲置。
  const usedMachines = new Set(
    d.routes
      .flatMap((r) => [
        r.performedBy,
        ...needItems(r.needs),
        ...(r.steps ?? []).flatMap((s) => [s.performedBy, ...(s.under ?? []).map(() => undefined)]),
      ])
      .filter((x): x is string => x !== undefined),
  );
  for (const it of d.items) {
    if (it.category !== 'machine') continue;
    if (usedMachines.has(it.id)) continue;
    notes.push({
      code: 'idle_machine',
      where: it.id,
      detail: '没有任何 route 由它执行 —— 这台设备在描述里不起作用',
    });
  }

  // 标准件只被一台机器用到 —— 大概率是命名错了，而不是真的标准件。
  // 用提示不用错误：判据是"规格是否独立于使用者"，用量只是症状。
  // 一个描述里只用一次，也可能只是这个描述小。
  //
  // 例外：标准装配体的子件。`std/motor-7.5kw-4p/stator` 只被那只电机用到，
  // 但它的规格由电机决定，是对的 —— 前缀是父件的 id，规格从父亲继承。
  const stdIds = new Set(d.items.filter((it) => it.id.startsWith('std/')).map((it) => it.id));
  const inherited = (id: string): boolean => {
    for (const parent of stdIds) {
      if (parent !== id && id.startsWith(parent + '/')) return true;
    }
    return false;
  };
  const stdUsers = new Map<string, string[]>();
  for (const it of d.items) {
    for (const comp of it.composedOf ?? []) {
      if (!comp.item.startsWith('std/')) continue;
      stdUsers.set(comp.item, [...(stdUsers.get(comp.item) ?? []), it.id]);
    }
  }
  for (const [part, users] of stdUsers) {
    if (users.length > 1 || inherited(part)) continue;
    notes.push({
      code: 'std_single_use',
      where: part,
      detail: '只被 ' + (users[0] ?? '?') + ' 用到 —— 如果它的规格由那台机器决定，它不该是 std/',
    });
  }

  return { errors, notes };
}
