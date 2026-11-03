# Project Facts and Criteria

This document consolidates the project-level facts distilled from drafts and survey materials. Process details are governed by the comments in `data/**`.

## 1. Project Axioms

- **A1 Thermodynamics**: Reaction barriers can only be overcome through energy input and elevated temperature. Mars lacks a reducing atmosphere, fossil fuels, and limestone; carbon, hydrogen, chlorine, and fluorine must all be prepared first.
- **A2 Precision inheritance**: The precision of a manufacturing parent machine is not lower than that of the machine it produces. Precision cannot bootstrap itself; it can only be inherited.
- **A3 Closure**: Project progress is measured by the number of "import dependency items", not by capacity or tonnage.

## 2. Mars Environment

- Atmospheric pressure 610 Pa; CO₂ 95.3%, N₂ 2.7%, Ar 1.6%, O₂ 0.13%.
- Gravity 3.71 m/s²; mean temperature −63 °C (−125 to +20 °C).
- Solar constant 586 W/m²; dust storms can obscure 90% of the light, so photovoltaic systems must have 3–5× redundancy.
- Surface dust contains 0.5–1% perchlorates; it is toxic and abrasive, and contaminates optical and sealing systems.
- Surface radiation approximately 0.6–0.7 mSv/day.

## 3. Material Substrate

- Regolith thickness 3–10 m; SiO₂ 44–46%, FeO+Fe₂O₃ 17–20%, Al₂O₃ 8–10%, MgO 6–8%, CaO 5–7%, SO₃ 5–8%, Na₂O+K₂O 2–4%, TiO₂ 0.8–1.3%, Cl 0.5–1%.
- The iron phase can be magnetically separated; sulfates are abundant; phosphorus comes only from apatite; copper, nickel, and chromium contents are low.
- Water: polar cap ice approximately 1.6×10⁶ km³; mid-latitude shallow ice and hydrated minerals are usable; the first principle of site selection is water.
- There is no petroleum, coal, natural gas, or fluorite; rare earths are about a hundred ppm, tungsten less than 1 ppm.

## 4. Key Closure Links

1. Catalyst loop: ammonia, sulfuric acid, Fischer–Tropsch, methanol, hydrogenation.
2. Precision parts loop: bearings, seals, springs, lead screws, linear scales.
3. Reagent loop: electronic-grade HF, H₂O₂, photoresist, etching gases.
4. Organic loop: polymers, rubber, greases, resins; rebuilt from CO₂ and H₂.

## 5. Seeds and Bootstrapping

- 8 seeds (per `data/floor/seed.ts`): robot, lathe, grinder, melting furnace, gauge block, control board, high-voltage test bench, fusion device (ITER-class D-T tokamak + power generation module; continuous operation and power generation are assumptions, tritium breeding is not required).
- Nuclear raw material (deuterium, tritium, and other fusion fuels) is treated as **unlimited supply**; the local D/T route serves only as a capability backup and does not constitute a source constraint, and tritium breeding is no longer a requirement.
- Seed factory principle: what a lathe can make is not transported; equipment that determines precision must be transported in two sets.
- The equipment chain forms a closed loop; its entrance is a kiln built without metal parts, using only manual labor and earth materials.
- The electronics link can be replaced by degradation with four types of solutions: resistance furnaces, contactors, rotary converters, mechanical counters.

## 6. Key Bottlenecks

- The catalyst system cannot self-replicate; the cycle must be broken by one-time inputs and redundant inventory.
- At 6 mbar convective heat dissipation fails, and waste heat is rejected through radiator panels; 10 MWe of waste heat requires tens of thousands of square meters of radiating area.
- Perchlorate contamination affects the entire plant; the catalyst workshop must be independently clean.
- Carbon acts as a carrier in the system, not as a net consumable; CO and CO₂ must be closed-loop.
- External pressure is 6 mbar, and the pressure differential on a positive-pressure vessel is about 10 t/m²; flanges and seals are designed as external-pressure vessels.
- Under low gravity natural convection disappears, and distillation, boiling, and condensation degrade to diffusion control.
- Phosphorus and copper are scarce resources; nickel and chromium are long-term bottlenecks for stainless steel and heat-resistant alloys.

## 7. Process Level

- 200–400 nm gate length, 5 µm design rules, 100 mm wafers.
- 40 nm requires EUV; the 560 nm overlay step of `plant/euv-stepper` is measurable (`measure/euv-overlay`), field 2 mm, 9.7 wafers/h; 43 nm is a dedicated wafer-level budget, not a whole-machine metric, and does not mean that 40 nm has been achieved.
- Lithography capability reaches the 5–10 µm level; packaging still lacks gold wire and molding compound.

## 8. Energy Cost

The unit is MJ/t; orders of magnitude are as follows:

- Steel 2×10⁴; aluminum 1.5–2×10⁵; MG-Si 5×10⁴; SOG-Si 5×10⁵; monocrystalline silicon wafer 2×10⁶.
- Glass 1×10⁴; ammonia 3×10⁴; sulfuric acid 2×10³; liquid oxygen 2×10⁴; liquid hydrogen 1.5×10⁵.

## 9. Core Reactions

- **Water and gases**: ice sublimation/condensation; 2H₂O electrolysis → 2H₂ + O₂ (1.8–2.2 V); CO₂ + 4H₂ → CH₄ + 2H₂O (573–673 K); CO₂ + H₂ → CO + H₂O (673–1073 K); N₂ + 3H₂ → 2NH₃ (673–773 K, 15–30 MPa); NH₃ oxidation → HNO₃ (1073 K, Pt-Rh).
- **Iron**: Fe₂O₃ + 3H₂ → 2Fe + 3H₂O (773–1073 K, preferred); CO reduction; carbothermic reduction (1473–1673 K); magnetic separation to preconcentrate first.
- **Silicon**: SiO₂ + 2C → Si + 2CO↑ (1873–2073 K); Si + 3HCl → SiHCl₃ + H₂; SiHCl₃ + H₂ → Si + 3HCl (Siemens process); zone melting to 99.9999%.
- **Aluminum**: Bayer process → Al₂O₃; Hall–Héroult 2Al₂O₃ + 3C → 4Al + 3CO₂↑ (1233–1253 K, cryolite must be self-made).
- **Other metals**: Mg Pidgeon process/carbothermic (1473 K, vacuum 10 Pa); Ca silicothermic process; CaC₂ (2273 K); Ti chlorination + Mg reduction; Cr ferrochrome; Ni carbonyl process; Cu sulfide/hydrometallurgy; Zn carbothermic process; Na/K electrolysis or carbothermic process; W/Mo hydrogen reduction; rare earth acid leaching/extraction/molten salt electrolysis.
- **Acids, bases, and salts**: H₂SO₄ contact process; HCl salting-out/synthesis; HF fluorite + sulfuric acid (523 K, lead/PTFE); H₃PO₄ wet process; chlor-alkali; Solvay soda ash (requires ammonia).
- **Organics**: CO₂ + H₂ → CH₃OH; Fischer–Tropsch; MTO to ethylene/propylene; CaC₂ + H₂O → C₂H₂; acetylene cyclization → benzene; methanol carbonylation → acetic acid; formaldehyde, ethylene oxide, ethylene glycol, urea; silicone rubber, PTFE, grease, nitrocellulose.
- **Inorganic nonmetals**: soda-lime glass, borosilicate glass, quartz glass, corundum, SiC, Si₃N₄, refractories, magnesium cement/sulfoaluminate, gypsum, molecular sieves, activated carbon.
- **Semiconductors**: polysilicon → monocrystal (Czochralski/zone melting) → oxidation → doping (POCl₃/BBr₃/ion implantation) → photoresist → etching → metallization → packaging; ultrapure water 18.2 MΩ·cm.

## 10. Equipment Classification

- **A Mining and materials**: excavation, crushing and grinding, magnetic separation/flotation, air separation, water extraction, mechanical conveying.
- **B High temperature and metallurgy**: rotary kiln/shaft furnace/electric arc furnace/induction furnace/resistance furnace/solar furnace; refining; roasting; molten salt electrolysis; casting and forging; powder metallurgy; heat treatment.
- **C Cold working and machine tools**: lathe/milling machine/grinder/machining center/EDM; press/bending/roll forming/wire drawing; welding; surface treatment; measuring tools and inspection.
- **D Chemical plant**: reactors, distillation/extraction/crystallization/membrane separation, heat exchange and radiative heat rejection, pumps and valves, vacuum, filtration and separation, storage tanks, instrumentation.
- **E Electrical and electronics**: nuclear power/photovoltaics, power electronics, motors and reducers, cables, vacuum tubes/discrete devices/ICs, sensing, PLCs.
- **F Utilities**: microgrid energy storage, inert gas station, radiative heat rejection, refrigeration, gas recovery, water system, waste treatment, cleanroom.
- **G Survey and geology**: remote sensing, ground-penetrating radar, drilling rigs, in-situ analysis, surveying and navigation beacons.
- **H Life support and biological aids**: closed ecosystems, biorefining, microbial metallurgy, hydroponics.

## 11. Seed Factory and Implementation Phases

- Seed factory approximately **750–1000 t** (excluding the first fusion device): parent machines 120 t, measuring tools 8 t, metallurgy 80 t, chemical 90 t, robots 300 t, reagent seeds 50 t, spare parts 60 t, design data 0.1 t. The first ITER-class fusion device is approximately **23 000 t**, with the power island counted separately; the old table entry "energy 40 t" is void.
- The goal is not capacity, but to **replicate a second complete copy of itself within 5 years**; the first priority is the parent machine loop, the measuring tool loop, and bearings/seals.
- Four manufacturing chains: structural parts (magnetic separation → hydrogen reduction → electric arc furnace → continuous casting → rolling); electrical and electronic (copper/silicon → devices → packaging); chemical (CO₂/H₂O/N₂/regolith → ammonia/sulfuric acid/chlor-alkali/organics); precision parts (bearing steel → grinding → gauge block/interferometer inheritance).
- Implementation phases: P0 site selection → P1 survival power → P2 metallurgy → P3 parent machine replication → P4 full chemical loop → P5 precision electrical → P6 electronics and semiconductors → P7 industrial civilization (100–250 Mars years).
- Closure is calculated as a weighted combination of the mass share and the value share of a locally manufacturable BOM; looking at mass alone would overestimate it.
- Easily overlooked engineering details (15 items): ice refreezing blockage, lead lining for sulfuric acid, graphite electrodes, self-made cryolite, CaC₂ at 2273 K, glass furnace refractory bricks, distillation packing, electrolysis diaphragms, Sn solder, carbide cutting tools, cutting fluid, filter media, welding shielding gas, navigation/time reference, batch consistency.

## 12. Space and Time Breakdown

The fusion device and the subsequent plants are broken down along two axes: space (where) and time (when). The model has no location or scheduling fields: location appears only in comments and in the tables of this section, and time appears only in `Route.rate`, `Step` order, and `Component.wear`, and does not constitute a schedule or a construction period.

### Space

| Space | Content | Data status |
|---|---|---|
| Earth | First fusion device, 8 seeds, one-time inputs | 8 seeds; transport, landing, and unloading not modeled |
| Mars orbit/landing | Entry, descent, landing, unloading | No items, no routes |
| Plant site | Nuclear island, cryogenic island, fuel plant, power island, switchyard, hot cell | 14 first-level systems; the whole-machine assembly route is written in four stages |
| Mine/processing | Regolith, water ice, brine, gypsum | `mars/*` 6 entries; mining and processing routes already exist |
| Grid/load | Transmission, distribution, storage, load centers | No energy fields; per-route energy consumption not modeled |

### Time

| Phase | Content | Data status |
|---|---|---|
| Construction | Plant site and foundations, nuclear island final assembly, supporting islands, integrated commissioning | Assembly route in four stages; `rate` 43 800 h is an assumption |
| Commissioning | Vacuum, cryogenics, magnets, fuel, grid connection | Routes have steps; no commissioning records |
| Pulsed operation | 400–600 s pulses, Q≥10 | `pulseLength` is a published value; `dutyCycle` is an assumption |
| Continuous operation | Prerequisite for industrial power supply | Unverified; `dutyCycle = 1` is an assumption |
| Maintenance/replacement | Blanket, divertor, tritium plant | `wear` 5 years / 2 years are assumptions; refueling time not modeled |
| Replication | Second fusion device | Seed replication 7/8; 10 first-level systems unreachable |

Nuclear raw material (D/T) is treated as unlimited supply: the local D/T route is a capability backup, not a source constraint; tritium breeding is no longer a requirement. The gaps in space and time do not disappear because of this premise — location, scheduling, refueling time, and the grid still have no data.
