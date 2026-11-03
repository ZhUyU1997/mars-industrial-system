# Project Conventions

## 1. Scope

**1.1 Applicability**
These conventions apply to document writing, data organization, and change process in this project.
Agent behavior is specified in [AGENTS.md](../AGENTS.md); project goals and R rules are in [README.zh.md](../README.zh.md);
fields, structure, and error codes are in [model.md](model.md).

**1.2 Division of Documents**
Fields, structure, and validation belong in the model document; writing, process, and principles belong in this file.
The complete division is in the "Documents and Directories" section of [README.zh.md](../README.zh.md).

## 2. Model and Data Boundaries

**2.1 Core Model Changes**
Adding or removing fields, changing types, changing validation, and adding or removing error codes in `src/core/describe.ts` are all model changes.
Model changes follow the order "proposal, user consent, implementation". Once the model changes, the meaning of all data and assertions changes with it.

**2.2 Separation of Data, Tests, and Rules**

```
test/*.test.ts         assertions and minimal test data
src/core/describe.ts   rules
```

Data files contain only data; test files must not inline large blocks of data.

**2.3 `unblock-*.ts` Files**
"blocked" means an item that cannot be produced under strict arithmetic; "unblock" means adding an alternative route.
Such files contain only the alternative route, producing an existing id; comments should explain why the original route does not work and what it costs.
The filename prefix carries no semantics.

**2.4 Seed Criterion**
There is only one seed criterion: whether the item has a producing route. An item that can be replicated leaves the seed list;
it is not kept because it is "important", "a reference", or "an initial asset". The criterion applies to items, not parts.
The first set must still be shipped in.

**2.5 Scope of Premises**
Premises provide "hands" and "compute", not "materials" and "process".

Can be bypassed: computers, storage, controllers, interpolation.
Cannot be bypassed: devices, sensors, power electronics, materials, and processes.

Criterion: what the premise brings and does not connect to the controlled object may be bypassed; what must be installed elsewhere or consumed must be made locally.

## 3. Document Writing

**3.1 Item Comments**
ids are in English, comments are in Chinese; ids carry no semantics. Machines, parts, and routes should all have comments explaining their meaning.

Comments must not contain:

| Category | Example |
|---|---|
| Status and progress | built, closed, to-do, this round, previous version, `20xx-xx-xx` |
| Rules and literature | `R9`, `§5`, `#23`, README and CONVENTIONS article numbers |
| Tools and assembly | `tools/*` paths, imports, registration, exports |
| Cross-file ledgers | global gaps, next steps, to be unified |
| Repeated statements | the same sentence repeated across files (templates, chapter boilerplate) |
| Decorative formatting | pure horizontal rules such as `═══`, `───`; tables drawn with vertical bars or `┌─┬─┐`; emoji |
| Line references | `filename:line` (line numbers drift with edits) |

**3.2 Verifiable Numbers**
Every value should be cross-checkable or have a source. Fabricated data and data without a basis must not be written.

**3.3 Tense Distinction**
"Not now" and "not then" must not be mixed. Criterion: when the current code produces a report, is the item still missing?
If it has been filled in, use the past tense and point to the corresponding route.

**3.4 Chinese Text Editing**
Under Windows PowerShell 5.1, `Get-Content -Raw` may silently corrupt content when parsing UTF-8.
Use an editing tool for Chinese text, or explicitly specify UTF-8 on both read and write.
Acceptance condition: both U+FFFD and BOM are False, and the line count is unchanged. `pnpm check` cannot detect garbled comments.

**3.5 Honest Wording**
When something cannot be done, write "cannot be done", not "not yet done"; mark out-of-scope fields; correct rules refuted by data and state the basis.

## 4. Verification and Evidence

**4.1 Validation Needs Counterexamples**
Every validation must have a test proving that it reports an error on invalid input; positive cases alone do not prove validation.

**4.2 Instrument Coverage**
Use only instruments that have been established. What an instrument cannot cover is treated as unmeasured, and the degradation is recorded honestly; do not write "measured".

**4.3 Mechanisms Need Data Support**
A new capability needs real data or a valid use case; otherwise it is a paper capability.

## 5. Changes and Commits

**5.1 Deletion First**
Evaluate deletion before addition; keep the number of mechanisms minimal.

**5.2 Commit Granularity**
One commit handles one thing. The commit message should state the current conclusion, boundary, and verification result of the model or data, not narrate the correction process.

## 6. Collaboration

**6.1 Sub-agent Boundaries**
Unless the user explicitly requests it, sub-agents are used only for tasks unrelated to the main line that can be completed independently, such as creating a new data file under `data/`.
They must not be used for:

- read-only analysis, audit reports, or option comparison—the main agent does these directly;
- modifying existing files, continuous changes in the same module, or work requiring this session's context;
- concurrent writes to the same file or `test/id-snapshot.json`.

Reason: sub-agents do not share this session's context and share the workspace with the main agent;
outsourcing serial work or work requiring judgment only adds handoffs and half-finished work.
When the user explicitly requests sub-agents, follow the scope the user specifies.

Before opening a new sub-agent, still query `list_agents` under AGENTS Article 10, and judge under Article 11 whether the task is truly independent;
if no independent parallel task exists, do not open one.
