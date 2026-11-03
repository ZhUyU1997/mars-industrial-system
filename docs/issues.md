# Unclosed Issues Ledger

> This ledger records only unresolved issues and unfinished work. Matters completed once the task is issued are not recorded.

## Audit Status

| id | Issue | Criterion | Audit result | Notes |
|---|---|---|---|---|
| `plant/fusion-reactor` | All 14 first-level systems have production routes; seed replication 8/8 (formal) | `node tools/audit.ts` seed report | Pass (formal) | First-device commissioning is performed by `plant/fusion-reactor/diagnostics`; the complete plant has 4 ordinary records and 14 system records; seed `specOk=true`, `componentsOk=true`. This is a formal L0–L2 achievement, not L3; all 60 records are non-measured, so "closed" is not written. |
| `plant/fusion-reactor` (power and operation) | Fusion power, continuous operation, and electricity generation are all assumptions: the public ITER values are 500 MW fusion power, 50 MW injected, Q ≥ 10, with only 400–600 s pulses, no electricity generation, and it has not yet operated; the seed assumes continuous operation, a power-generation module, and about 40% thermal-to-electric conversion (estimate), with no measure records | `docs/model.md` Section 12 (design windows and sources) | record (formal, non-measured) | Assumption, not to be taken as a reading; public value source https://www.iter.org/facts-figures; 40% is an estimate, not a reading. |
| `plant/fusion-reactor/fuel-cycle` | Partially resolved: the D/T route and assembly are written; He recovery remains unbuilt, and 2 windows have been converted to records | `docs/model.md` Section 9 (chain integrity), Section 12 (design windows and sources) | Partial (formal, non-measured) | D/T is treated as unlimited supply, with the local route kept as a capability backup; `tritiumInventory`/`burnRate` have been converted to `mat/fusion-fuel-record` (calculated); He cooling and recovery still have no items. |
| design windows (0) | No `design: true` windows | `node tools/audit.ts` design group | design 0; audit passed=true; but all 60 records are formal, not L3 | All of the original 108 design windows have been converted to records: 25 fusion records + 35 instrument-calibration records; the basis of all 35 calibration records is assumed; no measured. |
| `plant/fusion-reactor` (single point / two-set principle) | Only one set is transported; not handled per `docs/facts.md` Section 5, "equipment that determines precision must be transported in two sets"; the second set relies on a local chain, and the chain is not built | `docs/facts.md` Section 5 (seed factory principles), `README.zh.md` Section 6 (R9) | Undecided | Single-point risk; the replication chain is not closed. |
| `plant/fusion-reactor/vacuum-vessel`, `plant/fusion-reactor/cryostat` (large-component manufacturing/final assembly) | Vacuum vessel 9 m sectors, cryostat 28 m / 3,850 t rely on existing plate rolling, welding, and robotics; the size envelope, tonnage, stress relief, and final assembly shop are not modeled | `docs/model.md` Section 9 (equipment and conditions), `docs/facts.md` Section 11 (seed factory and implementation phases) | Not built | Forming, welding, and heat-treatment equipment for large components is itself the gap; unmodeled conditions do not mean a shop exists. The complete-plant assembly route `make/fusion-reactor` is now usable/clean and no longer blocked; the complete-plant and part windows have been converted to records (formal), and seed 8/8 is still not L3. |
| `plant/fusion-reactor/shield`, `plant/fusion-reactor/thermal-shield` (shield/thermal shield) | Shield 20,000 t borated concrete, thermal shield 5,000 m² / 80 t stainless steel + 20 t copper, all order-of-magnitude assumptions; rebar, formwork, curing, large-area brazing, and cryogenic testing are not modeled | `docs/model.md` Section 9 (equipment and conditions), Section 12 (design windows and sources) | Has route, record (formal, non-measured) | Shield and thermal shield already have production routes; the borated-concrete mix, shield thickness and boron content, and thermal-shield emissivity are all assumptions or design values, not readings. |
| `plant/fusion-reactor/tf-coil`, `plant/fusion-reactor/pf-coil`, `plant/fusion-reactor/central-solenoid` (magnets) | Nb3Sn/NbTi precursor cable is borrowed from `plant/pgm-wire-mill`; TF/CS winding → 650 °C reaction heat treatment → vacuum impregnation, while PF has no reaction heat treatment; feed is an order-of-magnitude split | `docs/model.md` Section 9 (equipment and conditions), Section 12 (design windows and sources) | Has route, record (formal, non-measured) | The margin of TF 285 t against 310 t is not listed; CS `flux` is a whole set of 6 modules, and the allocation to single-module delivery is not modeled; the size envelope of 310 t / 17 m-class winding, heat-treatment, and impregnation equipment is not modeled. |
| `plant/fusion-reactor/cryoplant` (cryoplant) | 75 kW@4.5 K / 25 t He are public values; existing GM/JT cold heads are 0.05–5 W, 4 orders of magnitude short; the helium turbine and cold box are not modeled | `docs/model.md` Section 9 (equipment and conditions), Section 12 (design windows and sources) | Has route, record (formal, non-measured) | The route is a chain placeholder and cannot be claimed to be able to build 75 kW; `coolingPower` and `heliumInventory` have been converted to records (formal). |
| `plant/fusion-reactor/heating` (heating) | 4,750 × 20 kW = 95 MW installed, 50 MW injected; real ECRH uses 1 MW gyrotrons, and 20 kW units in parallel are a degradation architecture; NBI/ICRH are not modeled | `docs/model.md` Section 9 (equipment and conditions), Section 12 (design windows and sources) | Has route, record (formal, non-measured) | `injectedPower` and `installedPower` have been converted to records (formal). |
| `plant/fusion-reactor/power-block` (power generation) | The 200 MW steam turbine/generator is order-of-magnitude; blade superalloys, the condenser, and grid connection are not modeled; ITER itself does not generate electricity | `docs/model.md` Section 9 (equipment and conditions), Section 12 (design windows and sources) | Has route, record (formal, non-measured) | `electricPower` and `efficiency` have been converted to records (formal). |
| `plant/fusion-reactor/power-block` (heat rejection) | Fusion heat rejection is not modeled; existing heat-dissipation data is at the 10 MWe scale, 30–80 times short | `docs/facts.md` Section 6 (key bottleneck: waste-heat rejection), `docs/model.md` Section 9 (co-product/heat rejection) | Not built | Fusion heat 500 MW + auxiliary heating about 50 MW; power generation takes about 200 MW, leaving about 300–350 MW that must be rejected; the ITER blanket/divertor cooling loop is designed at the 736 MW scale, and the two are not additive. The heat-dissipation area and the number of radiator panels are not calculated; the 10 MWe table must not be applied directly. |
| Space: transport/landing/site/hot cell | Earth→Mars transport, entry/descent/landing, unloading, site zoning, and the hot cell all have no items or routes; `mars/*` has only 6 planetary given materials | `docs/facts.md` Section 12 (space and time split), `docs/model.md` Section 9 (chain integrity) | Not built | The space split currently falls only on assembly steps and the facts table; transport, landing, site engineering, and the hot cell itself have no data. |
| `plant/fusion-reactor` (space/time split) | `pulseLength` 400–600 s (public value), `dutyCycle` 0.1–1 (assumption), blanket `wear` 43,800 h, divertor `wear` 17,520 h, complete-plant assembly in four stages / `rate` 43,800 h (assumption); the model has no location or scheduling fields, so space falls only in comments and `docs/facts.md` Section 12, while time falls only in `rate` / `steps` / `wear` | `docs/model.md` Section 9 (equipment and conditions), `docs/facts.md` Section 12 (space and time split) | Model gap | Even with routes for all systems, location, scheduling, refueling time, and the grid still have no data; shield/thermal shield have landed in site and maintenance stages, but construction and cryogenic testing have no records; the magnet chain has landed in the nuclear-island final-assembly stage, but reaction heat-treatment and impregnation times are not modeled. |
| `plant/fusion-reactor` (seed 8/8, formal) | 4 ordinary complete-plant windows + 14 system windows converted to records; the 10 capabilities of diagnostics are covered by `measure/cal-diagnostics` (assumed); this makes seed `specOk=true`, `componentsOk=true` | `node tools/audit.ts` seed report, `docs/model.md` Section 12 | Pass (formal, not L3) | 60 records = 25 fusion (public-spec 7, assumed 11, calculated 7) + 35 calibration (assumed 35); "closed" is not written, and L3 is not written. |
| Evidence level | Of the 60 records, measured 0; 35 self-calibrations are assumed; L3 not done; audit passed=true is formal, not measured | `README.zh.md` Section 3 (evidence levels), `docs/model.md` Section 12 | formal | "closed" is not written; L3 is still missing. |
| L3 measurement not done | The gate being green is the result of formal self-calibration, not measurement; without real readings, "closed" cannot be written; L3 is still missing | `README.zh.md` Section 3 (evidence levels), `docs/model.md` Section 12 | L3 not done | All 60 records (25 fusion + 35 calibration) are non-measured. |
| `Route` (whole library, baseline 2998 entries) | Energy consumption is not modeled: Route has no energy field, and existing routes do not declare power | `README.zh.md` Section 8 (core model modification constraints) | Model gap | Adding a field is a `src/core/` change and requires user consent; the fusion plant only addresses the source, not a per-route energy-consumption account. |

Currently unreachable 0, blocked 0, degraded 0, design 0; seed 8/8; measure 0; recordProblems 0; audit passed=true (formal); all 60 records are non-measured; L3 not done; "closed" is not written; cal 35 assumed / 0 calculated.

## Soft Criterion Categories

| Code | Category | Criterion |
|---|---|---|
| S1 | Goal not entered into data | The document has a goal, but data does not write it as `need`, or writes it looser than the goal |
| S2 | Metric not modeled | The parameter / field is absent from data |
| S3 | Yield / loss | Yield rate and bad parts, not a spec gap |
| S4 | No item / no downstream | Missing an item, or the product has no consumer |
| S5 | Single point / redundancy | The model does not judge it; relies on a backup route |
| S6 | Mass account | `declared_unbalanced` not balanced |
| S7 | Record / certification | Has a route / assembly, but no measured record |
| U | Undecided | Necessity not determined |

## Measurement Triage (31 items)

| Window | Triage | Instrument and method | Gap or stopping point |
|---|---|---|---|
| 1 · `plant/fusion-reactor` `fusionPower` 400–500 MW | record, basis=public-spec, not measured | Record `mat/fusion-plant-record` (`measure/fusion-plant-performance`); first-device commissioning | L3 not done |
| 2 · `plant/fusion-reactor` `q` 5–10 | record, basis=public-spec, not measured | Record `mat/fusion-plant-record` (`measure/fusion-plant-performance`); first-device commissioning | L3 not done |
| 3 · `plant/fusion-reactor` `pulseLength` 400–600 s | record, basis=public-spec, not measured | Record `mat/fusion-plant-record` (`measure/fusion-plant-performance`); first-device commissioning | L3 not done |
| 4 · `plant/fusion-reactor` `dutyCycle` 0.1–1 | record, basis=public-spec, not measured | Record `mat/fusion-plant-record` (`measure/fusion-plant-performance`); first-device commissioning | L3 not done |
| 5 · `plant/fusion-reactor/fuel-cycle` `tritiumInventory` 2–3 kg | record, basis=calculated, not measured | Record `mat/fusion-fuel-record` (`measure/fusion-fuel-performance`) | L3 not done |
| 6 · `plant/fusion-reactor/fuel-cycle` `burnRate` 0.05–0.1 kg/day | record, basis=calculated, not measured | Record `mat/fusion-fuel-record` (`measure/fusion-fuel-performance`) | L3 not done |
| 7 · `plant/fusion-reactor/control` `cycleTime` 0.5–1 ms | record, basis=assumed, not measured | Record `mat/fusion-control-cycle-record` (`measure/fusion-control-cycle`, 0.6–0.9 ms) | L3 not done |
| 8 · `plant/fusion-reactor/control` `availability` 0.9–0.95 | record, basis=assumed, not measured | Record `mat/fusion-control-availability-record` (`measure/fusion-control-availability`) | L3 not done |
| 9 · `plant/fusion-reactor/vacuum-vessel` `leakRate` 1e-9 Pa·m³/s | record, basis=assumed, not measured | Record `mat/fusion-vessel-leak-record` (`measure/fusion-vessel-leak`, 2e-10–8e-10 Pa·m³/s); `plant/he-leak-detector` | L3 not done |
| 10 · `plant/fusion-reactor/vacuum-vessel` `sectorMass` 500–600 t | record, basis=calculated, not measured | Record `mat/fusion-vessel-mass-record` (`measure/fusion-vessel-mass`, 520–580 t); `plant/weighbridge-500t` | L3 not done |
| 11 · `plant/fusion-reactor/cryostat` `volume` 14,000–16,000 m³ | record, basis=calculated, not measured | Record `mat/fusion-cryostat-volume-record` (`measure/fusion-cryostat-volume`) | L3 not done |
| 12 · `plant/fusion-reactor/cryostat` `vacuum` 1e-5–1e-4 Pa | record, basis=assumed, not measured | Record `mat/fusion-cryostat-vacuum-record` (`measure/fusion-cryostat-vacuum`, 2e-5–8e-5 Pa) | record already covered by measure (`plant/pressure-adapter` `measure/vacuum`) |
| 13 · `plant/fusion-reactor/shield` `thickness` 1.5–2.5 m | record, basis=assumed, not measured | Record `mat/fusion-shield-thickness-record` (`measure/fusion-shield-thickness`, 1.8–2.2 m); `plant/concrete-thickness-gauge` | L3 not done |
| 14 · `plant/fusion-reactor/shield` `boronContent` 1–2% | record, basis=calculated (40 kg B2O3/1000 kg ≈1.24% B), not measured | Record `mat/fusion-shield-boron-record` (`measure/fusion-shield-boron`, 1.1–1.5%) | L3 not done |
| 15 · `plant/fusion-reactor/thermal-shield` `temperature` 80–100 K | record, basis=assumed, not measured | Record `mat/fusion-thermal-temp-record` (`measure/fusion-thermal-temp`) | record already covered by measure (`plant/thermostat-80-100k` `measure/temperature` 80–100 K) |
| 16 · `plant/fusion-reactor/thermal-shield` `emissivity` 0.05–0.1 | record, basis=assumed, not measured | Record `mat/fusion-thermal-emissivity-record` (`measure/fusion-thermal-emissivity`) | L3 not done |
| 17 · `plant/fusion-reactor/tf-coil` `peakField` 11.8–12.5 T | record, basis=public-spec, not measured | Record `mat/fusion-tf-field-record` (`measure/fusion-tf-field`, 11.8–12.2 T); `plant/high-field-nmr-probe` + `plant/standard-field-magnet-12t` + `plant/field-mapping-standard-12t` (10–13 T) | L3 not done |
| 18 · `plant/fusion-reactor/tf-coil` `storedEnergy` 40–42 GJ | record, basis=calculated, not measured | Record `mat/fusion-tf-energy-record` (`measure/fusion-tf-energy`, 40–42 GJ); `plant/coil-energy-test-stand` + `plant/dump-load-45gj` + `plant/calorimeter-45gj` | L3 not done |
| 19 · `plant/fusion-reactor/pf-coil` `peakField` 5–6 T | record, basis=assumed, not measured | Record `mat/fusion-pf-field-record` (`measure/fusion-pf-field`, 5.5–6 T); `plant/low-field-nmr-probe` (0–6 T); the 10–13 T standard field/field map does not cover 5–6 T | L3 not done |
| 20 · `plant/fusion-reactor/pf-coil` `current` 40–52 kA | record, basis=assumed, not measured | Record `mat/fusion-pf-current-record` (`measure/fusion-pf-current`) | L3 not done |
| 21 · `plant/fusion-reactor/central-solenoid` `flux` 220–260 Wb | record, basis=assumed, not measured | Record `mat/fusion-cs-flux-record` (`measure/fusion-cs-flux`, 230–250 Wb); `plant/fluxmeter-300wb`; `plant/rogowski-50ka` + `plant/dc-source-60ka` supply current/source only | L3 not done |
| 22 · `plant/fusion-reactor/central-solenoid` `peakField` 12–13 T | record, basis=public-spec, not measured | Record `mat/fusion-cs-field-record` (`measure/fusion-cs-field`) | L3 not done |
| 23 · `plant/fusion-reactor/blanket` `heatFlux` 0.3–0.5 MW/m² | record, basis=calculated, not measured | Record `mat/fusion-blanket-heat-record` (`measure/fusion-blanket-heat`, 0.35–0.45 MW/m²); `plant/heat-flux-rig-10mw` | L3 not done |
| 24 · `plant/fusion-reactor/divertor` `steadyHeatFlux` 10–12 MW/m² | record, basis=public-spec, not measured | Record `mat/fusion-divertor-steady-record` (`measure/fusion-divertor-steady`, 10–11.5 MW/m²); `plant/heat-flux-rig-10mw` | record already covered by measure (`plant/heat-flux-rig-10mw` `measure/steadyHeatFlux`) |
| 25 · `plant/fusion-reactor/divertor` `transientHeatFlux` 20–25 MW/m² | record, basis=public-spec, not measured | Record `mat/fusion-divertor-transient-record` (`measure/fusion-divertor-transient`, 20–24 MW/m²); `plant/transient-heat-source` | record already covered by measure (`plant/transient-heat-source` `measure/transientHeatFlux`) |
| 26 · `plant/fusion-reactor/cryoplant` `coolingPower` 70–75 kW | record, basis=public-spec, not measured | Record `mat/fusion-cryoplant-cooling-record` (`measure/fusion-cryoplant-cooling`) | L3 not done |
| 27 · `plant/fusion-reactor/cryoplant` `heliumInventory` 20–30 t | record, basis=calculated, not measured | Record `mat/fusion-cryoplant-helium-record` (`measure/fusion-cryoplant-helium`) | L3 not done |
| 28 · `plant/fusion-reactor/heating` `injectedPower` 45–50 MW | record, basis=public-spec, not measured | Record `mat/fusion-heating-record` (`measure/fusion-heating-performance`) | L3 not done |
| 29 · `plant/fusion-reactor/heating` `installedPower` 90–95 MW | record, basis=public-spec, not measured | Record `mat/fusion-heating-record` (`measure/fusion-heating-performance`) | L3 not done |
| 30 · `plant/fusion-reactor/power-block` `electricPower` 150–200 MW | record, basis=assumed, not measured | Record `mat/fusion-power-record` (`measure/fusion-power-performance`) | L3 not done |
| 31 · `plant/fusion-reactor/power-block` `efficiency` 35–40% | record, basis=assumed, not measured | Record `mat/fusion-power-record` (`measure/fusion-power-performance`) | L3 not done |

Summary: measurable with existing instruments 0; instruments/adapters/calibration hardware built, missing calibration 0 (all windows converted to records); record coverage 31 windows / 25 fusion records; plus 35 instrument calibration records, 60 in total; new builds required 0; unmeasurable stopping points 0; total 31. All 60 records are non-measured; design 0, seed 8/8 (formal); the triage table states only record ownership and basis, not completion of measurement.

## Magnet Measurement Trio

| Instrument | Route | Range | design | Calibration gap |
|---|---|---|---|---|
| `plant/rogowski-50ka` | `make/rogowski-50ka` | 0–60 kA, 1–10 MHz, 0.5–2% | 3 windows | Calibration source see `plant/dc-source-60ka`; missing calibration records (2 kA source, a 25× shortfall) |
| `plant/high-field-nmr-probe` | `make/high-field-nmr-probe` | 10–13 T, 400–600 MHz, 1–10 ppm | 4 windows | Standard field see `plant/standard-field-magnet-12t`; missing calibration records and measured field uniformity |
| `plant/coil-energy-test-stand` | `make/coil-energy-test-stand` | 30–45 GJ, 0–70 kA, 0–10 kV | 3 windows | dump see `plant/dump-load-45gj`; missing full-energy test and calorimetric calibration |

Conclusion: the instruments and calibration hardware are built; calibration records are not done, these are not measurement results, and there is no record.

## Magnet Calibration Chain

| Instrument | Route | Range | design | Calibration gap |
|---|---|---|---|---|
| `plant/dc-source-60ka` | `make/dc-source-60ka` | 0–60 kA, ripple 0.1–1%, duty cycle 0.5–1 | 3 windows | Missing calibration records/uncertainty |
| `plant/standard-field-magnet-12t` | `make/standard-field-magnet-12t` | 10–13 T, 50–500 ppm, 50–100 mm | 3 windows | Missing calibration records/measured field uniformity |
| `plant/dump-load-45gj` | `make/dump-load-45gj` | 30–45 GJ, 0–70 kA, 0–10 kV | 3 windows | Missing full-energy test/calorimetric calibration |

Conclusion: the calibration hardware is built, calibration records are not done; these are not measurement results, and there is no record.

## Second Batch of Measurement Instruments

| Instrument | Route | Range | design | Calibration gap |
|---|---|---|---|---|
| `plant/weighbridge-500t` | `make/weighbridge-500t` | 0–600 t, 1–10 kg, 0.1–0.5% | 3 windows | Missing 500 t calibration weights/hydraulic force measurement |
| `plant/laser-tracker-30m` | `make/laser-tracker-30m` | 0–30 m, 0.05–0.5 mm, 0–360° | 3 windows | Missing 30 m reference length/refractive-index compensation |
| `plant/cryo-load-75kw` | `make/cryo-load-75kw` | 0–80 kW, 3.8–4.5 K, 0–100 kW | 3 windows | Missing 75 kW@4.5 K cold source/full-power calorimetry |

Conclusion: the instruments are built, but the calibration source/reference length/cold source are not built; these are not measurement results, and there is no record.

## Third Batch of Measurement Instruments

| Instrument | Route | Range | design | Calibration gap |
|---|---|---|---|---|
| `plant/he-leak-detector` | `make/he-leak-detector` | 1e-12–1e-8 Pa·m³/s, 1e-6–1e-2 Pa | 2 windows | Missing calibrated leak |
| `plant/thermostat-80-100k` | `make/thermostat-80-100k` | 80–100 K, 0.1–1 K | 2 windows | Missing 80–100 K calibration |
| `plant/heat-flux-rig-10mw` | `make/heat-flux-rig-10mw` | 0–12 MW/m², 0–100 kW, 1–10 cm² | 3 windows | Missing standard heat-flux meter/10 MW/m² source |

Conclusion: the instruments are built, but the standards/full-power sources are not built; these are not measurement results, and there is no record.

## Fourth Batch of Measurement Instruments

| Instrument | Route | Range | design | Calibration gap |
|---|---|---|---|---|
| `plant/tritium-calorimeter` | `make/tritium-calorimeter` | 0–5 kg, 0–2 kW, 1–10 mW | 3 windows | Missing tritium standard source/tritium handling |
| `plant/control-availability-bench` | `make/control-availability-bench` | 0.8–0.99, 10^3–10^6 operations, 0.1–10 ms | 3 windows | Missing long-term operation |
| `plant/concrete-thickness-gauge` | `make/concrete-thickness-gauge` | 0.5–3 m, 2000–5000 m/s, 1–5% | 3 windows | Missing 1–3 m standard blocks |

## Fifth Batch of Measurement Instruments

| Instrument | Route | Range | design | Calibration gap |
|---|---|---|---|---|
| `plant/emissometer-80k` | `make/emissometer-80k` | 0.01–0.2, 80–100 K, 0.01–0.05 | 3 windows | Missing 80 K blackbody |
| `plant/transient-heat-source` | `make/transient-heat-source` | 0–30 MW/m², 1–10 ms, 0–100 kJ | 3 windows | Missing standard heat-flux meter/full-power source |
| `plant/he-inventory-meter` | `make/he-inventory-meter` | 0–30 t, 0–20 MPa, 250–350 K | 3 windows | Missing 25 t-class standard |

Conclusion: the instruments are built; the standards/tritium handling/long-term bench are not built; these are not measurement results, and there is no record.

## Magnet Primary Standards

| Instrument | Route | Range | design | Calibration gap |
|---|---|---|---|---|
| `plant/shunt-50ka-standard` | `make/shunt-50ka-standard` | 0–60 kA, 0.05–0.2%, 0.01–0.1 mΩ | 3 windows | Missing 50 kA full-power calibration/primary standard |
| `plant/field-mapping-standard-12t` | `make/field-mapping-standard-12t` | 10–13 T, 50–500 ppm, 0.1–1 mm | 3 windows | Missing absolute field calibration/uncertainty |
| `plant/calorimeter-45gj` | `make/calorimeter-45gj` | 30–45 GJ, 5–50 K, 1–5% | 3 windows | Missing 41 GJ full-energy test/electrical-energy-to-heat calibration |

Conclusion: the primary standards are built, but absolute calibration/full-energy testing are not done; these are not measurement results, and there is no record.

## Adapter Fixtures and Range Completion

| Instrument | Route | Range | design | Calibration gap |
|---|---|---|---|---|
| `plant/cycle-time-adapter` | `make/cycle-time-adapter` | 1e-6–1e-2 s, resolution 1e-7–1e-5 s | 2 windows | Missing standard source/calibration |
| `plant/pressure-adapter` | `make/pressure-adapter` | 1e-6–1e-2 Pa, accuracy 1–5% | 2 windows | Missing standard vacuum gauge/calibration |
| `plant/boron-assay-adapter` | `make/boron-assay-adapter` | 0.01–100000 ppm, accuracy 1–5% | 2 windows | Missing concrete-matrix reference samples/calibration |
| `plant/low-field-nmr-probe` | `make/low-field-nmr-probe` | 0–6 T, 1–10 ppm, 10–300 MHz | 4 windows | Missing 1–6 T standard field |
| `plant/fluxmeter-300wb` | `make/fluxmeter-300wb` | 0–300 Wb, 0.5–2%, 0–10 V | 3 windows | Missing 300 Wb full-scale calibration |

Conclusion: built, calibration not done; these are not measurement results, and there is no record.

## Measurement Standard Fixtures

| Instrument | Route | Range | design | Calibration gap |
|---|---|---|---|---|
| `plant/angle-standard` | `make/fusion-angle-standard` | 0–360°, 0.1–1″ | 2 windows | Missing angle calibration |
| `plant/thickness-standard` | `make/thickness-standard` | 0–300 mm, 0.0001–0.1 mm | 2 windows | Micrometer 0–25 mm/calibration ruler 0–100 mm; 0–300 is the design range |
| `plant/leak-rate-standard` | `make/leak-rate-standard` | 0–0.001 Pa·L/s, 1–5% | 2 windows | Missing 1e-9-level calibrated leak |
| `plant/power-standard-100w` | `make/power-standard-100w` | 0–100 W, 0.2–1% | 2 windows | Electrical power, not optical power |
| `plant/velocity-standard` | `make/velocity-standard` | 0–300 m/s, 1–5% | 2 windows | Missing rotational speed/circumference calibration |
| `plant/length-standard-300mm` | `make/length-standard-300mm` | 0–300 mm, 0.01–0.1 mm | 2 windows | Standard parts only up to 100 mm; 0–300 is the design range |

Conclusion: the fixtures are built, calibration is not done; these are not measurement results, and there is no record.

## Fusion Records (assumed/calculated/public-spec)

| Record | Window | basis | Instrument/method | Conclusion |
|---|---|---|---|---|
| `mat/fusion-control-cycle-record` | control `cycleTime` 0.6–0.9 ms | assumed | `measure/fusion-control-cycle`; `plant/cycle-time-adapter` | Not measured, L3 not done |
| `mat/fusion-cryostat-vacuum-record` | cryostat `vacuum` 2e-5–8e-5 Pa | assumed | `measure/fusion-cryostat-vacuum`; `plant/pressure-adapter` | Not measured, L3 not done |
| `mat/fusion-shield-boron-record` | shield `boronContent` 1.1–1.5% | calculated (40 kg B2O3/1000 kg ≈1.24% B) | `measure/fusion-shield-boron`; `plant/boron-assay-adapter` | Not measured, L3 not done |
| `mat/fusion-tf-field-record` | TF `peakField` 11.8–12.2 T | public-spec | `measure/fusion-tf-field`; `plant/high-field-nmr-probe` + `plant/standard-field-magnet-12t` + `plant/field-mapping-standard-12t` | Not measured, L3 not done |
| `mat/fusion-pf-field-record` | PF `peakField` 5.5–6 T | assumed | `measure/fusion-pf-field`; `plant/low-field-nmr-probe` | Not measured, L3 not done |
| `mat/fusion-cs-flux-record` | CS `flux` 230–250 Wb | assumed | `measure/fusion-cs-flux`; `plant/fluxmeter-300wb` | Not measured, L3 not done |
| `mat/fusion-tf-energy-record` | TF `storedEnergy` 40–42 GJ | calculated | `measure/fusion-tf-energy`; `plant/coil-energy-test-stand` + `plant/dump-load-45gj` + `plant/calorimeter-45gj` | Not measured, L3 not done |
| `mat/fusion-blanket-heat-record` | blanket `heatFlux` 0.35–0.45 MW/m² | calculated | `measure/fusion-blanket-heat`; `plant/heat-flux-rig-10mw` | Not measured, L3 not done |
| `mat/fusion-divertor-steady-record` | divertor `steadyHeatFlux` 10–11.5 MW/m² | public-spec | `measure/fusion-divertor-steady`; `plant/heat-flux-rig-10mw` | Not measured, L3 not done |
| `mat/fusion-divertor-transient-record` | divertor `transientHeatFlux` 20–24 MW/m² | public-spec | `measure/fusion-divertor-transient`; `plant/transient-heat-source` | Not measured, L3 not done |
| `mat/fusion-vessel-leak-record` | vessel `leakRate` 2e-10–8e-10 Pa·m³/s | assumed | `measure/fusion-vessel-leak`; `plant/he-leak-detector` | Not measured, L3 not done |
| `mat/fusion-vessel-mass-record` | vessel `sectorMass` 520–580 t | calculated | `measure/fusion-vessel-mass`; `plant/weighbridge-500t` | Not measured, L3 not done |
| `mat/fusion-shield-thickness-record` | shield `thickness` 1.8–2.2 m | assumed | `measure/fusion-shield-thickness`; `plant/concrete-thickness-gauge` | Not measured, L3 not done |

Conclusion: the records are not measured; L3 is not done; "closed" must not be written.

## Seed 8/8 Records (formal, not L3)

- 60 records: 25 fusion records (public-spec 7, assumed 11, calculated 7) + 35 instrument self-calibration records (assumed 35); no measured.
- 4 commissioning records: `mat/fusion-plant-record` (plant 4 windows), `mat/fusion-heating-record` (heating 2), `mat/fusion-power-record` (power 2), `mat/fusion-fuel-record` (fuel 2).
- 8 final records: `mat/fusion-pf-current-record`, `mat/fusion-cs-field-record`, `mat/fusion-cryostat-volume-record`, `mat/fusion-thermal-temp-record`, `mat/fusion-thermal-emissivity-record`, `mat/fusion-cryoplant-cooling-record`, `mat/fusion-cryoplant-helium-record`, `mat/fusion-control-availability-record`.
- The 10 capabilities of `plant/fusion-reactor/diagnostics` are covered by `measure/cal-diagnostics` (assumed); this is not product measurement; the complete plant keeps only 4 ordinary records.
- thermal `temperature` is already covered in measure (`plant/thermostat-80-100k` `measure/temperature` 80–100 K); vessel vacuum and divertor steady/transient have also been covered by measure.
- Conclusion: audit passed=true (formal); all 60 records are non-measured; "closed" is not written, and L3 is not written.

## diagnostics and Temperature Standards

- `plant/fusion-reactor/diagnostics`: 10 `measure/*` capabilities, covered by `measure/cal-diagnostics` (assumed, formal); not product measurement.
- `plant/temperature-standard`: 0–1100 °C, 0.1–1 °C, covered by `measure/cal-temperature-standard` (assumed); covers the ambient + thermocouple calibration segments, not measured.
- `plant/thermostat-80-100k`: `measure/temperature` 80–100 K, covered by `measure/cal-thermostat-80-100k`.
- Conclusion: capabilities/standards are covered by self-calibration records, design 0; still formal, not measured.

## Instrument Calibration Records (formal self-calibration)

- Each of the 35 instruments/fixtures/standard parts has 1 `measure/cal-*` record, all with basis assumed; self-calibration from design values, with no calculated basis, not measured.
- Electrical/magnets: `cal-dc-source`, `cal-rogowski`, `cal-shunt`, `cal-standard-field-magnet`, `cal-dump-load`, `cal-high-field-nmr`, `cal-coil-energy-stand`, `cal-low-field-nmr`, `cal-fluxmeter`, `cal-field-mapping`, `cal-calorimeter`, `cal-diagnostics`.
- Dimension/mass: `cal-weighbridge-500t`, `cal-laser-tracker-30m`, `cal-angle-standard`, `cal-thickness-standard`, `cal-length-standard-300mm`, `cal-concrete-thickness-gauge`, `cal-velocity-standard`.
- Vacuum/cryogenic/heat: `cal-pressure-adapter`, `cal-cryo-load-75kw`, `cal-he-leak-detector`, `cal-thermostat-80-100k`, `cal-heat-flux-rig-10mw`, `cal-tritium-calorimeter`, `cal-emissometer-80k`, `cal-transient-heat-source`, `cal-he-inventory-meter`, `cal-temperature-standard`.
- Other: `cal-cycle-time-adapter`, `cal-boron-assay-adapter`, `cal-control-availability-bench`, `cal-leak-rate-standard`, `cal-power-standard-100w`, `cal-efficiency-standard`.
- Conclusion: all 35 records are formal (assumed), not L3; not one is measured.
