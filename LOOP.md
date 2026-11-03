# Work Loop

This file is subordinate to [AGENTS.md](AGENTS.md); project goals, field semantics, and writing rules are in [README.zh.md](README.zh.md), [model.md](docs/model.md), and [CONVENTIONS.md](docs/CONVENTIONS.md).

## 1. Task Categories and Priority

| Priority | Category | Nature | Criterion | Action |
|---|---|---|---|---|
| 1 | Inaccurate | Correction | Data contradicts reality or its source; unit or quantity is wrong | Fix the data fact |
| 2 | Missing | Supplement | The goal is not in the data; item, parameter, or downstream is missing | Add the chain or data |
| 3 | Untested | Supplement | `design` window, S7 record | Add measurement route and instruments |
| 4 | Unbalanced | Correction / supplement | Mass account, co-product, or by-product | Correct a false account; add a missing by-product |
| — | Single point / redundancy | Monitor | Single point, redundancy | Monitor only |
| — | Permission boundary | Stop | Model, seeds, R10 exemption, protected design | The user decides |

Category criteria are in [issues.md](docs/issues.md).

Scale = importance × impact. Importance: 3 = seed, robot, protected design, seed replication chain; 2 = key process; 1 = general. Impact: 3 = affected routes ≥ 10; 2 = 3–9; 1 = 1–2. Scale ranges from 1 to 9.

## 2. Task Order

1. By priority 1 → 4.
2. Within the same priority, by scale descending. At the same scale: seed, robot, protected design, seed replication chain first; then key process; then general.
3. Record an unfillable gap as a stop point and skip it. Stop at permission boundaries.
4. Do one task per round. Only change data facts; comments change with the data and do not form a separate round.

## 3. Progress Criteria

- Correction round: progress = the scale of newly exposed gaps. If the audit does not get worse, progress for the round is 0. Getting worse is evidence that gaps have surfaced; commit while red, and do not record the round as closed.
- Supplement round: progress = the scale of gaps closed. If the audit does not get better, progress for the round is 0. Commit after the audit improves, under [AGENTS.md](AGENTS.md) Article 20.
- Count only factual constraints; reference errors, spelling errors, and validator false positives do not count.
- Do not delete `need`, delete `design`, widen windows, or fabricate readings.
- Settle in pairs: expose unclosed debt; maximize the scale of closed gaps globally.
- Ledger: before each round ends, update the audit problem table in [issues.md](docs/issues.md). In a correction round, add each newly exposed gap (`id`, `problem`, `criterion`, `audit result`, `note`); in a supplement round, delete closed items. If items are added or closed without updating the ledger, the round is not complete.
- Run typecheck, audit, and tests before and after each round; compare the increase and decrease of `blocked`, `degraded`, `design`, and unreachable.

## 4. Stopping

1. The change exceeds user authority (model, seeds, R10 exemption, robot protected design).
2. Under real-world constraints, mutually exclusive approaches exist, and the choice would change project goals, seed strategy, or protected design.
3. Two consecutive rounds show no change in gap scale.

Missing instruments, missing readings, pending audit, uncertainty, and an audit pass are not reasons to stop.

## 5. Puzzle Method

1. Each round, add one real device or process step: first research how that device/process is actually done on Earth, then write the path from Martian surface materials to it.
2. Do not require everything at once; mark what is unknown as an assumption or unresolved, and do not write it as established fact.
3. Cut circular dependencies historically: first break the cycle with a degraded or earlier process, then write the upgrade route and the gap magnitude; do not declare the chain infeasible because of a "cycle".
4. The audit is only a connectivity check; do not write data to change the four groups `blocked`, `degraded`, `design`, and unreachable.
5. Write `record` only when there is a measured or derivable interval; otherwise keep `design`, and never use `record` to pass off a design value as a reading.
6. Prioritize complex equipment: analyzing one high-precision device is better than laying out one hundred simple devices. Simple parts only fill in the material/parts of that device; they do not form a separate round and are not counted as "small parts we can make".
7. For equipment analysis, answer four questions first: (1) what product/process does this device make; (2) what is hardest to manufacture about it (precision, material, assembly, environment); (3) what equipment measures/calibrates this device; (4) what are those measurement devices missing. If the four answers are incomplete, do not write the product yet.
8. The product is the output of the equipment, not the end of the analysis. Write the equipment itself and its measurement chain first, then the product; do not use "the product is reachable" in place of "the equipment can be built/measured".
9. Prioritize high-precision equipment: lithography, metrology, coating, etching, ion beam, ultra-precision stages. Each round, take one device deep and fill in its BOM, process, and calibration chain; the hard part of complex equipment is usually measurement/calibration, not assembly.
10. Replication/reachability must close on materials, parts, and performers; zero-input, self-executing, and unverified parts do not count.
11. `design` propagates along the BOM; if a key part has only design, the parent does not pass.
12. Local counts do not replace evidence; a metric must be falsifiable by zero-input/self-reference counterexamples.
13. Before reporting a count, reachability, or pass, check the dependency chain for counterexamples; if a downstream blocked/degraded/design state can refute it, do not report a pass.

Case: 7/7 once counted the zero-input `make/robot` as replication; the NPU's 8 nm chain did not pass, so 7/7 was wrong; after verifying by components it was 3/7.
