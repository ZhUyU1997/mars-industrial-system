<p align="right"><a href="README.md">English</a> | 中文</p>

# 火星工业体系从零搭建：开源原位资源利用（ISRU）与自复制工业链模型

> **在不限量机器人、聚变供能与核原料无限供应的前提下，火星上的工业体系怎么从零搭起来。**

**关键词：** 火星工业 · 原位资源利用（ISRU） · 自复制机器 · 工业生态 · 制造 BOM · 物料配平 · 工艺链 · TypeScript

![火星工业体系模型视图](docs/images/viewer-overview.png)

*浏览器视图（`pnpm viewer`）：左侧按类别与连线过滤，右侧查看条目、规格与组成。*

## 一、项目定义

本项目是问题的**描述层**：只回答“要什么、怎么来、谁来做”，不做求解、不做成本评估、
不做用途判断。描述不清时，任何计算都缺乏可靠前提。

描述层的首要判据是**真实、可复核、可继续推导**，而非仅满足审计程序的形式化模型。
`node tools/audit.ts` 是必要审计关口，不是目标函数；审计通过仅表示满足闭包、可达性、
规格与测量链要求，不证明组成关系、工艺或数量正确。

判定“闭合”须同时满足：审计通过、L0–L3 证据支持、关键条目可追溯至设计与工艺来源。
任一条件不满足，不得判定闭合。字段级要求见 [model.md](docs/model.md)。

## 二、前提与研究对象

机器人数量由前提给定，不涉及**来源**：它是种子条目
（[data/floor/seed.ts](data/floor/seed.ts)），**第一台**外部输入、有磨损，
从第二台起必须能造（R9）。能源不再是无源流：来源是种子中的 ITER 级聚变装置
（`plant/fusion-reactor`），第一台运来，第二台起本地造；“不限量”只表示可复制扩容，
不表示免费。核原料（氘、氚等聚变燃料）按**无限供应**处理：本地 D/T 路线只是能力备份，
不作为来源约束；氚增殖不再是前提要求。

**唯一非给定项**是物质形态的转化链。一条链称为完整，当且仅当四项俱全：

```
料 · 条件 · 设备 · 联产产物
```

**研究对象**：从火星表面物质出发，到指定物件（例如一台铣床）的链。

## 三、证据等级

| 等级 | 判据 | 能说明什么 |
|---|---|---|
| **L0 结构** | `pnpm typecheck` 通过；`validate` 错误 0；料/设备/条件/联产齐全 | 描述自洽，不证明物理成立 |
| **L1 配平** | `uses`/`produces` 的质量与元素账能对上 | 物料账成立 |
| **L2 工程** | 设备 `holds` 覆盖 `under`；无缺失设备；速率/纯度在窗口内 | 按现有设备能走通 |
| **L3 实测** | `measure/*` 产记录，实测区间 ⊆ 设计窗口 | 有读数，不是设计值 |

用词固定：

- 只有 L0 → **路线已建**
- L0 + L1 → **配平成立**
- L0–L2 → **可造/降级成立**
- L0–L3 → **已测**

以上用词按证据等级使用；写“闭合”须满足第一节的判据，不另设口径。

`Route.gives` 是设计窗口，不是实测值；`measure/*` 的 `gives` 是量程，记录条目里的值才是读数。没有 `measure/*` 的窗口按 B 类，不得算闭合。

## 四、使用方式

```bash
pnpm typecheck                 # 类型检查
pnpm stats                     # 数据统计：规模、条目、路线、属性、引用密度、孤儿
pnpm test                      # 测试文件
pnpm viewer                    # 浏览器视图：3D 网、中文名、搜索与过滤

node tools/audit.ts            # 闸门
node tools/audit.ts --json     # 闸门，结构化输出
node tools/audit.ts --round correction   # 闸门，按纠正轮描述提交判据
node tools/audit.ts --round supplement   # 闸门，按补充轮描述提交判据
node tools/audit.ts --tasks    # 报告：下一步任务（--all / --json）
node tools/audit.ts --status   # 报告：状态总结
node tools/audit.ts --out <file>  # 任意模式存成文件

node tools/query.ts items --state unavailable      # 批量：全部不可达条目
node tools/query.ts routes --kind frontier         # 按阻断分类列路线
node tools/query.ts needs <id> <id> --json         # 需求信封：谁要什么、谁供、差在哪
node tools/query.ts windows <id> --param node      # 已交付窗口：谁给的、什么状态
node tools/query.ts gaps --param node              # 全库未被严格交付覆盖的窗口
node tools/query.ts why <id>                       # 归因树：阻断 / 规格 / design / 循环
node tools/query.ts path <id> --depth 3            # 证明树：哪条路线、第几轮、kept
node tools/query.ts items 'plant/robot/*' --ids    # 通配 + 只输出 id
```

输出读法：`闸门` 报放行或待放行；`四组` 报待解路线、降级可用、待验证窗口、待产条目；`二、四组待办` 列明细；`结论` 重述待办数。四组的增减是提交判据：纠正轮看增加、补充轮看减少，见 [AGENTS.md](AGENTS.md) 第二十条。

查询是只读的：状态、严格交付窗口与 kept 取自 [tools/lib/reach.ts](tools/lib/reach.ts) 的同一次扩散；
查询只做选择与排版，不参与通过判定（R15 不变）。批量查询只起一个进程，多 id / 通配 / 过滤条件
共用同一份快照；机器格式为 `--json`、`--ndjson`、`--ids`、`--count`，`--out` 写 UTF-8 文件。
退出码：0 = 执行成功（含 0 条）；1 = `--fail-if-empty` 且 0 条；2 = 用法错、id 不存在或模型校验失败。

![条目详情](docs/images/viewer-item-detail.png)

*条目详情：中文名、规格声明、组成清单与上下游路线。*

## 五、审计口径

审计的输入起点与检查范围如下；复制性结论的唯一出口见 R15。

审计从 `SEED_IDS`、火星地板与 R10 一次性输入出发，逐条检查路线；下列字段全部可达且规格成立，路线才放行：

```
uses / needs / performedBy / steps[].performedBy / under /
equipmentRequire / composedOf
```

`design` 的窗口与条件不算满足；`record` 必须由 `measure/*` 产出、当前可达，且窗口落在引用窗口内，不合规的 give 不算交付。
`measure` 的 noCap / capShort / condShort 进入闸门。
`deferred` 条目不得由路线产出；其产出路线按 `DEFERRED_PRODUCT` 阻断，补 `composedOf` 后去掉标记。

联产只报告、不进闸门：多产物路线中，未被 `uses`、`composedOf`、`needs`、执行者、
`equipmentRequire`、`consumption` 引用的联产项，列入默认输出的“联产”一节；
`--json` 中为 `coproducts`，不影响 `passed` 与退出码。

## 六、规则

**R1** 数量不构成约束。不得以“需求量小”论证链路的可行性。

**R2** 完整性判据是四项是否写全，不是单台指标是否满足某一用途。

**R3** 不得以替代产物替换待答问题。问题给定产物；替代产物属于另一个问题。

**R4** 不输出“不可行”结论。输出形式为：该链缺哪一环、缺多少。

**R5** 不作成本、工时、经济性评价。工时只作属性记录（`Route.rate`）。

**R6** 地球上已存在之物，必存在从火星表面物质出发的可达路径。

**R7** 当前链的断裂只表示该段尚未写出，不构成对 R6 的反例。
缺口按量级记录（差几倍、要什么条件），不作为终止条件。

**R8** 降级是阶段性状态，不是终态。每一处降级须同时记录其升级路线：
恢复原规格所需的条件，以及该升级本身的缺口量级。
未写升级路线的降级，按 R7 视为该链尚未写完。

**R9** 种子设备必须可复制：种子清单上每一台设备，必须存在一条从火星表面物质
出发、造出第二台的路径。种子解释的是“第一台从哪来”，不是“只有一台”。

**R10** 豁免清单只适用目前必须从地球传递的**非设备**条目；设备不得豁免；增删须用户确认。

**R11** data 只允许 Item / Route 两种实体；不得新增注册表、清单文件或其他结构。

**R12** 设计窗口必须由 `measure/` 路线收窄并产出记录；没有测量路线的窗口按未闭合项处理。

**R13** `measure/*` 路线与 `*-record` 条目只放 `data/measure/`；机器/材料文件不得定义测量路线或记录。

**R14** 描述与制造分离：

- 描述（`props` / `need` / `gives`）只声明“要什么”，是验收目标；
- 不得为迁就产线把需求改小（如把“算力任意”写成 `min 0`），改小即掩盖缺口；
- 能不能造由 `produces` 路线与闭包判定，不由描述判定；
- 供不上时，表现为该条目不可达、消费方报缺零件，描述不动；
- 反过来，制造层不得因描述高就放宽 `need`，也不得改描述凑合。

**R15** “能不能复制”只有一个出口：`node tools/audit.ts`。
默认模式是闸门：`validate` / `measure` / `design` / `record` 出处 / 可达 / 种子任一失败即非零；
`--tasks` / `--status` 是报告，不作为通过依据。

**R16** 机器人的零件定义属设计输入，agent 不得自行修改。

- 受保护：`plant/robot` 及其零件的 `composedOf`、`props`、`uses`、`gives`；
- 允许：补 step 的 `performedBy`/`under`（补条件）、补注释说明缺口；
- 需用户明确指示才能改设计；改动先给出差异并评审，不自动提交。

**R9 的依据**：前提是机器人不限量、能源由可复制的聚变装置提供；种子设备有磨损。
若种子只能外购，数量就由进口决定 —— 与前提冲突。因此“种子自给率”不是进度指标，
而是 R9 的判据。

**降级类型**：判定归 `functional-*` 字段（[model.md](docs/model.md) 第十节）。
`functional-kept` 以较低规格承担同一功能，**是降级**，须给升级路线；
`functional-lost` 换成了另一个东西，不是降级，是另一个问题（R3）。

**量产判据**：一条链可量产，当且仅当每一环均可由同规格设备的**并行复制**承担。
并行受限于机器人数量以外的因素时，该环记为待解环节。

## 七、文档与目录

| 文档 | 作用 | 不写什么 |
|---|---|---|
| [README.zh.md](README.zh.md) | 中文版 README：项目定义、目标、前提、种子、R 规则 | 状态、进度、具体数据 |
| [README.md](README.md) | 英文版 README：与中文版同内容 | 状态、进度、具体数据 |
| [AGENTS.md](AGENTS.md) | agent 行为规范：角色、回复、子 agent、纪律 | 项目事实、R 规则 |
| [LOOP.md](LOOP.md) | agent 工作循环：轮次、步骤、顺序、中止 | 项目目标、字段定义、具体数据 |
| [issues.md](docs/issues.md) | 未闭合问题记录：位置、原因、判据与判定方式 | 任务计划、规范、已闭合项 |
| [CONVENTIONS.md](docs/CONVENTIONS.md) | 项目级约定：写作、流程、原则 | 字段定义、错误码、具体数据 |
| [model.md](docs/model.md) | 模型：Item / Route 结构、字段语义、校验 | 具体链、数据条目 |
| [facts.md](docs/facts.md) | 项目级事实与判据：环境、基底、瓶颈、节点 | 状态、进度 |
| `data/**` | 数据：Item / Route | 规则、注册表 |
| `data/measure/**` | 测量路线与记录 | 机器 / 材料定义 |

英文版是中文版的翻译；两者冲突时，以中文版为准。

状态记录、进度表、统计块不新增；旧记录只在 git 历史。

放置流程：

1. 写之前先查上表。
2. 表里有 → 只写那个位置。
3. 表里没有 → 停下，问用户确认，不新建文件、不新开章节。

```
src/core/describe.ts   描述语言 + 校验      ← 修改约束见第八节
src/index.ts           出口
data/floor/seed.ts     种子：8 条
data/material/*.ts     料
data/machine/*.ts      设备与零件
tools/audit.ts         严格审计：闸门与退出码（唯一闸门）
tools/query.ts         只读查询：批量 / 需求 / 窗口 / 缺口 / 归因 / 证明树
tools/audit/views.ts   --tasks / --status 视图
tools/lib/reach.ts     可达判据：扩散、严格窗口、keep、轮次（唯一一份）
tools/lib/             装载、闭包、规格分析
test/*.test.ts         6 个测试文件
```

## 八、核心模型修改约束

`src/core/describe.ts` 是模型本身：加字段、删字段、改类型、改校验、加错误码，
全部算改动，**须先经用户同意**。流程、理由与来由见
[CONVENTIONS.md](docs/CONVENTIONS.md) #1。

数据与测试可以改；`src/core/` 不行。`src/index.ts` 只是出口，跟随 core 变化。

数据的读取只有一处：`tools/lib/data.ts` 展开全部 `data/` 导出后交给 `validate()`。
**新增一个数据文件 = 加一行 import + 两处展开**，不得在其他位置另建清单。
