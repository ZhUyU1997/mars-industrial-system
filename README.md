<p align="right"><a href="README.zh.md">中文</a> | English</p>

# Building a Mars Industrial System from Scratch: An Open-Source ISRU and Self-Replication Model

> **With unlimited robots, fusion power, and unlimited nuclear fuel, how do you build an industrial system on Mars from zero?**

**Keywords:** Mars industry · in-situ resource utilization (ISRU) · self-replicating machines · industrial ecology · manufacturing BOM · material balance · process chain · TypeScript

This is the English translation of [README.zh.md](README.zh.md). The Chinese version prevails if they differ.

![Mars industrial model view](docs/images/viewer-overview.png)

*Browser view (`pnpm viewer`, English by default): filter nodes and links on the left; inspect items, specs, and composition on the right. Chinese names are kept as subtitles.*

**Live viewer:** https://zhuyu1997.github.io/mars-industrial-system/

The viewer is bilingual: use the EN / 中文 switch in the header, or append `?lang=zh` to the URL.

## 1. Project Definition

This project is the **description layer** of the problem: it answers only "what is needed, how it comes about, and who does it". It does not solve the problem, estimate cost, or judge use. Without a clear description, any calculation lacks a reliable premise.

The primary criterion for the description layer is **truthful, verifiable, and further derivable**, not a formal model that merely satisfies an audit procedure. `node tools/audit.ts` is a necessary audit gate, not an objective function; passing the audit only means that closure, reachability, specs, and the measurement chain are satisfied. It does not prove that composition, process, or quantities are correct.

Judging a chain "closed" requires all three: the audit passes, L0–L3 evidence supports it, and key items are traceable to design and process sources. If any condition fails, the chain is not closed. Field-level requirements are in [model.md](docs/model.md).

## 2. Premises and Scope

The number of robots is given by the premise and is not about **origin**: it is a seed item ([data/floor/seed.ts](data/floor/seed.ts)). The **first unit** is an external input and wears out; from the second unit on, it must be buildable (R9). Energy is no longer a source-less flow: its source is the ITER-class fusion device in the seed (`plant/fusion-reactor`). The first unit is shipped in; from the second unit on it is built locally. "Unlimited" means replicable and expandable, not free. Nuclear fuel (deuterium, tritium, and other fusion fuels) is treated as **unlimited supply**: the local D/T route is only a capability backup, not a source constraint; tritium breeding is no longer a premise requirement.

The **only non-given** is the transformation chain of material forms. A chain is complete if and only if all four are present:

```
material · conditions · equipment · co-products
```

**Scope**: the chain from Martian surface materials to a specified object (for example, a milling machine).

## 3. Evidence Levels

| Level | Criterion | What it establishes |
|---|---|---|
| **L0 Structure** | `pnpm typecheck` passes; `validate` has 0 errors; material/equipment/conditions/co-products are all present | The description is self-consistent; physical validity is not proven |
| **L1 Balance** | Mass and element accounts of `uses`/`produces` reconcile | The material account holds |
| **L2 Engineering** | Equipment `holds` covers `under`; no missing equipment; rate/purity within window | The chain can run on existing equipment |
| **L3 Measurement** | `measure/*` produces records; measured interval ⊆ design window | There are readings, not design values |

Fixed wording:

- L0 only → **route built**
- L0 + L1 → **balance established**
- L0–L2 → **buildable/degradation established**
- L0–L3 → **measured**

Use these terms according to the evidence level. Writing "closed" requires the criteria in Section 1; no separate standard is defined.

`Route.gives` is a design window, not a measured value; `measure/*` `gives` is a range, and only values in record items are readings. A window without `measure/*` is Class B and cannot be counted as closed.

## 4. Usage

```bash
pnpm typecheck                 # type check
pnpm stats                     # data statistics: scale, items, routes, props, reference density, orphans
pnpm test                      # tests
pnpm viewer                    # browser view: 3D graph, English/Chinese names, search and filters

node tools/audit.ts            # gate
node tools/audit.ts --json     # gate, structured output
node tools/audit.ts --round correction   # gate, commit criteria for a correction round
node tools/audit.ts --round supplement   # gate, commit criteria for a supplement round
node tools/audit.ts --tasks    # report: next tasks (--all / --json)
node tools/audit.ts --status   # report: status summary
node tools/audit.ts --out <file>  # save any mode to a file

node tools/query.ts items --state unavailable      # batch: all unreachable items
node tools/query.ts routes --kind frontier         # list routes by blocker kind
node tools/query.ts needs <id> <id> --json         # needs envelope: who needs what, who supplies, where it is short
node tools/query.ts windows <id> --param node      # delivered windows: who gave it, what state
node tools/query.ts gaps --param node              # windows not strictly covered
node tools/query.ts why <id>                       # attribution tree: blocked / spec / design / cycle
node tools/query.ts path <id> --depth 3            # proof tree: which route, which round, kept
node tools/query.ts items 'plant/robot/*' --ids    # wildcard + ids only
```

Reading the output: `gate` reports pass or pending; `four groups` reports routes to resolve, degraded usable, windows to verify, and items to produce; `Section 2, four groups to-do` lists details; `conclusion` restates the to-do counts. The increase or decrease of the four groups is the commit criterion: correction rounds should increase them, supplement rounds should decrease them; see [AGENTS.md](AGENTS.md) Article 20.

Queries are read-only: state, strict delivery windows, and `kept` come from the same diffusion in [tools/lib/reach.ts](tools/lib/reach.ts); queries only select and format, and do not participate in pass/fail (R15 unchanged). A batch query starts one process; multiple ids / wildcards / filters share one snapshot. Machine formats are `--json`, `--ndjson`, `--ids`, `--count`; `--out` writes a UTF-8 file. Exit codes: 0 = success (including 0 results); 1 = `--fail-if-empty` with 0 results; 2 = usage error, missing id, or model validation failure.

![Item detail](docs/images/viewer-item-detail.png)

*Item detail: English name with Chinese subtitle, declared specs, composition, and upstream/downstream routes.*

## 5. Audit Criteria

The audit starts from `SEED_IDS`, the Mars floor, and R10 one-time inputs, and checks each route. A route passes only when all of the following fields are reachable and their specs hold:

```
uses / needs / performedBy / steps[].performedBy / under /
equipmentRequire / composedOf
```

`design` windows and conditions do not count as satisfied. A `record` must be produced by `measure/*`, currently reachable, and its window must fall within the referenced window; non-compliant gives do not count as delivery. `measure` noCap / capShort / condShort enter the gate. `deferred` items must not be produced by routes; their producing routes are blocked as `DEFERRED_PRODUCT`; remove the marker after adding `composedOf`.

Co-products are reported but do not enter the gate: in a multi-product route, co-products not referenced by `uses`, `composedOf`, `needs`, a performer, `equipmentRequire`, or `consumption` are listed in the default "co-products" section; in `--json` they are `coproducts`, and they do not affect `passed` or the exit code.

## 6. Rules

**R1** Quantity is not a constraint. Do not argue that a chain is feasible because "demand is small".

**R2** The completeness criterion is whether the four items are written, not whether a single machine's metrics suit one use.

**R3** Do not replace the question with a substitute product. The question fixes the product; a substitute belongs to another question.

**R4** Do not output "infeasible" conclusions. The output form is: which link is missing, and by how much.

**R5** Do not evaluate cost, labor hours, or economics. Labor hours are only recorded as an attribute (`Route.rate`).

**R6** Anything that exists on Earth must have a reachable path starting from Martian surface materials.

**R7** A break in the current chain only means that segment has not been written; it is not a counterexample to R6. Record gaps by order of magnitude (how many times short, what conditions are needed), not as a termination condition.

**R8** Degradation is a stage, not a final state. Every degradation must also record its upgrade path: the conditions needed to restore the original spec, and the gap magnitude of that upgrade itself. A degradation without an upgrade path is treated under R7 as a chain not yet finished.

**R9** Seed equipment must be reproducible: for every machine on the seed list, there must be a path from Martian surface materials to building a second unit. The seed explains where the first unit comes from, not that "there is only one".

**R10** The exemption list applies only to **non-equipment** items that currently must be imported from Earth; equipment cannot be exempted; additions and removals require user confirmation.

**R11** `data` allows only two entity types, Item / Route; do not add registries, list files, or other structures.

**R12** Design windows must be narrowed by `measure/` routes that produce records; a window without a measurement route is treated as unclosed.

**R13** `measure/*` routes and `*-record` items live only in `data/measure/`; machine/material files must not define measurement routes or records.

**R14** Description and manufacturing are separated:

- Description (`props` / `need` / `gives`) declares only "what is required"; it is the acceptance target.
- Do not shrink a requirement to accommodate the line (for example, writing "arbitrary compute" as `min 0`); shrinking hides the gap.
- Whether it can be built is decided by `produces` routes and closure, not by the description.
- When supply is insufficient, the item becomes unreachable and consumers report missing parts; the description does not change.
- Conversely, the manufacturing layer must not relax `need` because the description is demanding, nor adjust the description to fit.

**R15** "Can it be copied" has only one exit: `node tools/audit.ts`. The default mode is the gate: any failure in `validate` / `measure` / `design` / `record` provenance / reachability / seeds is non-zero; `--tasks` / `--status` are reports, not pass criteria.

**R16** Robot part definitions are design input; agents must not modify them.

- Protected: `composedOf`, `props`, `uses`, and `gives` of `plant/robot` and its parts;
- Allowed: add `performedBy`/`under` to steps (conditions), add comments documenting gaps;
- Design changes require explicit user instruction; present the diff and review it first; do not auto-commit.

**Basis for R9**: the premise is unlimited robots and energy from a reproducible fusion device; seed equipment wears out. If seeds could only be purchased, quantity would be determined by imports—which contradicts the premise. Therefore "seed self-sufficiency" is not a progress metric but the R9 criterion.

**Degradation types**: the decision belongs to the `functional-*` fields ([model.md](docs/model.md), Section 10). `functional-kept` performs the same function at a lower spec and **is degradation**; an upgrade path is required. `functional-lost` replaces it with something else; that is not degradation but another problem (R3).

**Mass-production criterion**: a chain can be mass-produced if and only if every link can be carried by **parallel replication** of equipment of the same spec. If parallelism is limited by factors other than the number of robots, that link is recorded as unresolved.

## 7. Documents and Directories

| Document | Role | Does not contain |
|---|---|---|
| [README.md](README.md) | English README: project definition: goals, premises, seeds, R rules | Status, progress, concrete data |
| [README.zh.md](README.zh.md) | Chinese README: same content as the English version | Status, progress, concrete data |
| [AGENTS.md](AGENTS.md) | Agent behavior: roles, replies, sub-agents, discipline | Project facts, R rules |
| [LOOP.md](LOOP.md) | Agent work loop: rounds, steps, order, stopping | Project goals, field definitions, concrete data |
| [issues.md](docs/issues.md) | Unclosed issues: location, reason, criterion, decision method | Task plans, specs, closed items |
| [CONVENTIONS.md](docs/CONVENTIONS.md) | Project conventions: writing, process, principles | Field definitions, error codes, concrete data |
| [model.md](docs/model.md) | Model: Item / Route structure, field semantics, validation | Concrete chains, data items |
| [facts.md](docs/facts.md) | Project facts and criteria: environment, substrate, bottlenecks, nodes | Status, progress |
| `data/**` | Data: Item / Route | Rules, registries |
| `data/measure/**` | Measurement routes and records | Machine / material definitions |

The English version is a translation of the Chinese version; where they differ, the Chinese version prevails.

Status records, progress tables, and statistics blocks are not added; old records live only in git history.

Placement process:

1. Check the table above before writing.
2. If the content belongs there, write only there.
3. If it is not in the table, stop and ask the user; do not create files or sections.

```
src/core/describe.ts   description language + validation   ← modification constraints see Section 8
src/index.ts           exports
data/floor/seed.ts     seeds: 8
data/material/*.ts     materials
data/machine/*.ts      machines and parts
tools/audit.ts         strict audit: gate and exit code (the only gate)
tools/query.ts         read-only queries: batch / needs / windows / gaps / why / path
tools/audit/views.ts   --tasks / --status views
tools/lib/reach.ts     reachability: diffusion, strict windows, keep, rounds (single source)
tools/lib/             loading, closure, spec analysis
test/*.test.ts         6 test files
```

## 8. Core Model Modification Constraints

`src/core/describe.ts` is the model itself: adding or removing fields, changing types, changing validation, or adding error codes all count as modifications and **require user consent first**. Process, rationale, and provenance are in [CONVENTIONS.md](docs/CONVENTIONS.md) #1.

Data and tests may change; `src/core/` may not. `src/index.ts` is only the export surface and follows core changes.

Data is read in exactly one place: `tools/lib/data.ts` expands all `data/` exports and passes them to `validate()`. **Adding a data file = one import + two spreads**; do not build another list anywhere else.
