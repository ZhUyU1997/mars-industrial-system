# Model: Description Structure, Field Semantics, and Validation

> README defines project goals and rules; this document defines the description structure, field semantics, and validation.
> Writing conventions, process, and project conventions are in [CONVENTIONS.md](CONVENTIONS.md).

## 1. Description Structure

```
Description = { items, routes, ambient? }

Item        = { id, name, category, unit, mass?, props?, holds?, consumption?, composedOf?,
                interface?, extends?, monolithic?, deferred? }
Component   = { item, select?, qty, wear?, need?, onRelax? }
Consumption = { item, qty, per }

Route       = { id, name, produces, uses, needs, performedBy?, under?, steps?, rate?,
                unbalanced_zh? }
Clause      = { anyOf: Option[] }
Option      = { item, qty, need?, onRelax? }
Step        = { note_zh?, performedBy?, under? }
Condition   = { param, min, max, record?, design? }
Qty         = { num, den }
```

### Field Summary

| Owner | Field | Type | Meaning |
|---|---|---|---|
| Description | `items` | `Item[]` | Item table |
| Description | `routes` | `Route[]` | Route table |
| Description | `ambient` | `Condition[]` | On-site environmental conditions; equipment is not needed while inside the interval |
| Item | `id` | `string` | Unique identifier |
| Item | `name` | `string` | Display name (Chinese); for humans only, not used in decisions; duplicates allowed |
| Item | `category` | `ItemCategory` | `material` / `part` / `consumable` / `carrier` / `machine`; defaults to `material` |
| Item | `unit` | `string` | Unit of measure: piece, unit, set, etc. |
| Item | `mass` | `Qty` | Mass per piece, in kg |
| Item | `props` | `PropDecl[]` | Property type declarations (range / enum / set) |
| Item | `holds` | `Condition[]` | Condition intervals the equipment can maintain; only `machine` may fill this |
| Item | `consumption` | `Consumption[]` | Consumables used per operating hour |
| Item | `composedOf` | `Component[]` | Reversible composition list: parts or sub-machines; no materials |
| Item | `interface` | `true` | Abstract interface; id must start with `iface/` and may have only `props` |
| Item | `extends` | `string` | Single inheritance from one `iface/` interface; multi-level inheritance is not supported |
| Item | `monolithic` | `boolean` | One-piece item with no assembly BOM; available to `machine` / `part`; requires a rationale comment; cannot be combined with `composedOf` |
| Item | `deferred` | `boolean` | Explicitly not yet decomposed; only `part` / `consumable` may use it |
| Component | `item` | `string` | Component id: part, sub-machine, or `iface/` interface |
| Component | `select` | `string` | When `item` is an abstract interface, the concrete implementation |
| Component | `qty` | `Qty` | How many are installed |
| Component | `wear` | `Wear` | Wear during operation |
| Component | `need` | `PropReq[]` | Spec window required by this assembly step |
| Component | `onRelax` | `'functional-kept' / 'functional-lost'` | Consequence when `need` cannot be met; writing `need` requires a statement |
| Consumption | `item` | `string` | Consumable id |
| Consumption | `qty` | `Qty` | Amount used per `per` hours |
| Consumption | `per` | `Qty` | Operating hours |
| Route | `id` | `string` | Unique identifier |
| Route | `name` | `string` | Display name (Chinese); for humans only, not used in decisions; duplicates allowed |
| Route | `produces` | `Term[]` | Output terms; `produces[0].qty` defines the batch output |
| Route | `uses` | `Clause[]` | Consumption per batch; clauses are AND, options within a clause are OR |
| Route | `needs` | `Need[]` | Prerequisites that must exist but are not consumed |
| Route | `performedBy` | `string` | Executing equipment for a single-step route; must be `machine` |
| Route | `under` | `Condition[]` | Conditions that must be maintained during a single-step route |
| Route | `steps` | `Step[]` | Multi-step chain; mutually exclusive with route-level `performedBy` / `under` |
| Route | `rate` | `{ hours: Qty }` | Hours occupied by one batch; excludes queueing |
| Route | `unbalanced_zh` | `string` | Declares a mass imbalance and explains why |
| Term | `item` | `string` | Output item id |
| Term | `qty` | `Qty` | Output quantity (ratio) |
| Term | `gives` | `PropReq[]` | Spec window delivered by this route |
| Clause | `anyOf` | `Option[]` | Input options, any one of which suffices |
| Option | `item` | `string` | Option item id |
| Option | `qty` | `Qty` | Quantity of this option |
| Option | `need` | `PropReq[]` | Spec window required by this option |
| Option | `onRelax` | `'functional-kept' / 'functional-lost'` | Consequence of relaxing the window |
| Step | `note_zh` | `string` | Step name; for humans only |
| Step | `performedBy` | `string` | Equipment executing this segment |
| Step | `under` | `Condition[]` | Conditions that must be maintained during this segment |
| Condition | `param` | `string` | Parameter name: temperature, pressure, atmosphere, etc. |
| Condition | `min` / `max` | `number` | Lower / upper bound of the condition interval |
| Provenance | `record` | `string` | Reading provenance: a record item produced by `measure/*`; inherited by `Condition` / `PropReq` |
| Provenance | `design` | `true` | Explicitly marked design window; not measured, and the audit does not count it as satisfied |
| Qty | `num` / `den` | `number` | Numerator / denominator of a positive rational number |
| Wear | `amount` | `Qty` | Fraction lost per `per` hours, in (0, 1] |
| Wear | `per` | `Qty` | Operating-hour threshold |

`Need` is `string | Option`: a string means "at least one present"; `Option` may additionally carry a quantity and a spec window.
`Option.qty` means consumption in `uses` and a minimum on-hand quantity in `needs`.

`name` is the display name and `id` is identity: renaming does not affect references, and the id must not change when the name changes.
`validate` rejects only empty names; it does not require names to be unique.

`PropDecl` `range` uses `min` / `max` / `unit` / `dir`; `enum` / `set` use `values`.
The corresponding `PropReq` window uses `min` / `max` / `dir`, `oneOf`, `atLeast`, and may carry `record` / `design`.

## 2. Separation of Definition and Manufacturing

| Category | Answers | Carrier |
|---|---|---|
| **Definition** | What the object is | `Item`: category, unit, mass, components, maintainable conditions |
| **Manufacturing** | How the object is produced | `Route`: materials, equipment, conditions, co-products |

The boundary between definition and manufacturing is whether the item itself can answer the fact.

```
A bed weighs 820 kg and is made of HT300 cast iron   → definition (Item.mass)
Poured from molten iron                               → manufacturing (Route.uses)
```

Mixing the two makes a process change force a definition change. After separation, a process change modifies only the route; the item stays unchanged.

Items must not contain materials; materials appear only in `Route.uses`. Writing `material: '40Cr'` on an item
duplicates the input already present in the route, and duplicated content is hard to validate.

A known exception is `Item.consumption`: this field describes the consumables a machine uses per operating hour, which belongs to the manufacturing side;
but its unit is operating hours while routes are measured in batches. The scales differ, so it remains on the item for now.

## 3. Assembly and Machining

The fundamental reason `items` and `routes` are separate is two kinds of relation, not a noun/verb distinction:

| Relation | Carrier | Reversibility | State after disassembly |
|---|---|---|---|
| **Spatial composition** | `Item.composedOf` | Reversible | Each part remains a part and can be installed elsewhere |
| **Machining** | `Route` | Irreversible | Material changes shape and cannot be restored |

```ts
// Assembly: eleven parts, all reusable after disassembly
{ id: 'plant/milling-machine', composedOf: [{ item: 'plant/milling-machine/bed', qty: q(1) }, ...] }

// Machined part: the bed is poured from molten iron; irreversible
{ id: 'make/mill-bed',
  produces: [{ item: 'plant/milling-machine/bed', qty: q(1) }],
  uses: [{ anyOf: [{ item: 'mat/iron-ht300', qty: q(1) }] }] }
```

The two may coexist: `composedOf` says "which parts it is made of", and a producing route says "how it is made".
Assembly routes carry the process (`performedBy` / `steps` / `under`); parts do not enter `uses`;
`uses` records only the consumption of irreversible machining.

Items without a producing route are gaps: `composedOf` answers only "what it is", not "how it is produced".
The "build assembly route" count in `--tasks` refers to these items.

## 4. Quantity and Mass

```ts
{ id: 'plant/milling-machine/bed', unit: '件', mass: q(820), category: 'part' }
{ item: 'plant/milling-machine/bed', qty: q(1) }     // install 1 piece, not 820 kg
```

- `qty` is the assembly quantity, measured in pieces.
- `mass` is the mass per piece, in kg.

A milling machine is **1 unit** with a mass of 2568 kg; it must not be written as a "2568 kg milling machine".
Writing `unit` as `'kg'` makes the BOM read "install 820 kg of bed"; the correct BOM meaning is
"install 1 bed, whose mass is 820 kg".

There are only three scales of measurement: time in operating hours, mass in kg, quantity in pieces or units; the model provides no conversion table.

When a part declares `mass`, the total material mass input by its producing route must be equal, otherwise `mass_mismatch` is raised.
Parts without `mass` (castings whose mass varies with process and allowance) are not subject to this constraint.

## 5. Identifier Rules

Part identifiers use paths, not flat names. `machine_base` cannot show which machine it belongs to;
when two machines each have a bed, they cannot be distinguished. Paths carry ownership and can be processed programmatically:

```ts
leaf('plant/milling-machine/tool-changer')   // 'tool-changer'   part name
owner('plant/milling-machine/tool-changer')  // 'plant/milling-machine'  owning machine
```

Validation requires a part path to start with the owning machine id, otherwise `bad_component` is raised.

An id represents object identity only, not origin. A seed is a list, not a prefix; `seed/robot` is an incorrect spelling.
Criterion: can the fact be modified elsewhere? If so, it must not be written into the name.

Part ids have two forms:

```
<machine>/<name>   dedicated part, spec determined by the machine
std/<type>-<spec>  standard part, spec independent of the user
```

The criterion is who determines the spec. `std_without_spec` rejects standard parts without a spec; `std_single_use` only emits a note.
"Used by only one machine" is a usage symptom, not a criterion. The existing 8 entries are unchanged; split only when a second machine appears with a different spec requirement.

## 6. Consumables and Wear

| Category | Mounting location | Handling when exhausted | Carrier |
|---|---|---|---|
| **Part** | Mounted on the machine | Replaced after wear; the machine recovers | `Component.wear` |
| **Consumable** | Not mounted on the machine | Consumed; cannot be restored | `Item.consumption` |

```ts
// Part: the wear record belongs to the part that actually wears, not to the whole machine
{ item: 'plant/milling-machine/way', qty: q(1),
  wear: { amount: q(1), per: q(40000) } }     // scrapped after 40,000 operating hours

// Consumable: not in the parts list; consumed per operating hour
consumption: [{ item: 'consumable/insert', qty: q(1), per: q(20) }]
```

A wear record should be attached to the part that actually wears. The bed does not wear; the guideway on it wears. The replacement object is the guideway, not the bed;
this is the purpose of path identifiers relative to flat names.

Wear must be tied to operating duration. `wear: q(1, 12000)` attached to a whole machine cannot say what 12000 counts:
batch count is not time; routes have batches, parts do not.

The model uses only one time scale: operating hours. Days, months, and years are convertible, but the model provides no conversion.
Providing multiple convertible units without conversion makes `40000 hours` and `5 years` incomparable values.

## 7. Process Steps

The model has no separate process-step field. If a step is recorded only as free text, it can neither be compared nor executed.
`Component` expresses only components, quantities, assembly requirements, and wear; it does not express steps.
A material grade is a checkable string; a process step is not. Steps are written into `Route`.

`performedBy` has only one position, so it is used only for **single-step** routes. Relay steps (turning, hobbing, hardening and tempering, grinding)
use `steps`: one machine and one set of conditions per segment, while the material flow remains at the route level.
Route-level `performedBy` / `under` and `steps` must not appear together; writing both raises `step_conflict`.
Each segment's performer must be equipment (`not_a_machine`), and must not also be written bare in `needs` (`redundant_need`).
Materials are written only at the route level.

```ts
steps: [
  { note_zh: 'turning', performedBy: 'lathe' },
  { note_zh: 'hardening and tempering', performedBy: 'plant/reduction-furnace', under: [...] },
  { note_zh: 'grinding', performedBy: 'plant/grinder' },
]
```

Cases with no performer fall into three classes:

```
① Natural completion (solar salt, self-sintering, in-furnace curing)
② The prerequisite is equipment (kiln firing; the kiln is written in needs)
③ Missing equipment (press, wire die): this is a gap, not an exemption
```

For steps that require manual work, such as assembly, bricklaying, and solution mixing, the performer is written as `plant/robot`.

## 8. Validation

`validate(d)` only checks whether the description is written correctly; it does not solve anything. Error codes directly related to items are:

| Error code | What it rejects |
|---|---|
| `bad_component` | Invalid parts list: not a part, duplicate, path does not start with the owning machine |
| `unknown_item` | Reference to an undeclared item |
| `bad_quantity` | Quantity is not a positive rational number |
| `mass_mismatch` | A part declaring `mass` does not balance against route inputs |
| `part_as_raw_material` | A part is used as raw material in a route; it should be in `needs` |

The same criterion reports once per object: route-level checks live in the route loop, item-level checks in the item loop.
Counterexample tests should ensure "the error count does not change with the number of items".

The complete list of remaining error codes and notes is in the `pnpm check` output.

## 9. Chain Integrity Check

A complete chain must pass four checks:

```
Material   Route.uses      every input has a producer, down to Martian surface material (R6)
Condition  Route.under     every param is maintained by some equipment in holds
Equipment  performedBy     every machine is reachable (except seeds), and is not referenced by the needs of its own product route
Co-product produces        every by-product has a destination; otherwise the gap is moved, not removed
```

Only when all four pass is the chain complete. Missing links and their magnitudes are recorded under R7; do not write "infeasible" (R4).

## 10. Degradation

```
Can degrade: precision, efficiency, lifetime, automation, throughput, material grade
Cannot degrade: perception, decision, force control, and any action requiring "judgment"
```

Criterion: after replacement, can it still perform the original function?

- `onRelax: 'functional-kept'`: performs the same function at a lower spec; this is degradation and requires an upgrade route;
- `onRelax: 'functional-lost'`: replaced by another object; this is not degradation but another problem (R3).

The robot is the only item that cannot be degraded; the seed self-sufficiency table uses an explicit `NOT_BUILDABLE` list.

## 11. node and lineWidth

`node` is the nominal gate length (nm) of the process generation, with ±25% tolerance. Interconnect line width is an independent criterion, `lineWidth`,
and does not participate in `node` calculation. The 40 nm class criterion is ≤50; the 8 nm class criterion is ≤10.

## 12. Design Windows and Provenance

Windows have only two provenances: `record` and `design`; when neither is written, the window is `bare` (historical convention).

- `record` points to a record item produced by `measure/*`. The window in the record is a reading; the route's `gives` is a range.
- `design: true` explicitly marks a design window: the interval comes from design, and this layer has no reading. The audit does not count it as satisfied;
  delivery windows, `holds`, and `under` do not constitute satisfaction.

The only basis for removing `design` is measurement: a `measure/*` route narrows the window and produces a record.
Equipment `holds` covering the same interval does not constitute measurement; `holds` is a capability declaration, not a reading.
It can make non-`design` conditions hold, but cannot make a `design` window measured.

The audit checks the provenance of `record`: the record item must exist, be produced by `measure/*`, be currently reachable, and its record window must fall within the referenced window; a non-compliant `give` does not count as delivery.
After `design` is removed, the window falls back to `bare` and still passes under the historical convention; therefore "removing design" cannot rely on deleting the field alone, but requires data discipline:

1. Add the measurement route and record first, then remove `design`;
2. The record must give a measured interval inside the window and its uncertainty; it must not restate the design window;
3. The diff that removes `design` must point to the corresponding `measure/*` and record item.

Example: a condition written as 20–30 °C is a design window; only a record reading 23–27 °C constitutes narrowing.
Removing `design` because "equipment holds 20–30" treats a capability declaration as a reading.

## 13. Description Truthfulness Requirements

The model permits omission, but not omission that hides a gap. Field-level requirements are:

1. **Items traceable**: an item should have a traceable design basis, producing route, or source; undecomposed items are marked `deferred`, and producers must not be fabricated.
2. **Routes match the process**: `uses` is actual consumption; `composedOf` is actual components; type, quantity, and source should agree; anything without a source is marked as an assumption.
3. **Consistent granularity**: use `composedOf` when components exist, and `deferred` when not decomposed; `monolithic` is limited to one-piece items with no independent components.
4. **Audit necessary but not sufficient**: the audit does not prove BOM, process, or quantity; on failure, add description or record the gap, and do not change identifiers, merge items, or fabricate inputs.
5. **Closure decision**: audit pass, L0–L3 evidence support, and traceability of key items must all hold.

The audit reports `deferred` items separately; their producing routes are blocked as `DEFERRED_PRODUCT` and must not be treated as manufacturable.

Avoid:

| Practice | Consequence |
|---|---|
| Changing identifiers or merging items to achieve reachability | Substituting audit results for factual judgment |
| Using `monolithic` for an assembly with multiple components | Hiding an undecomposed structure behind a flag |
| Writing unverified parts or quantities in `composedOf` | The audit passes while the BOM is distorted |
| Using `deferred` as a long-term omission | Gaps are not recorded and cannot be further derived |
| Reporting only the audit pass, not L1–L3 evidence | Treating a necessary condition as sufficient |
