/**
 * 氢气传感器 + 压缩空气 —— 把两件“到处被引用、却一直没有条目”的小缺口补上。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、氢气传感器：TCD 基线 + pellistor ppm 档（两条路线）
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 三处引用都指向同一个缺口：
 *
 *   `trace-analysis.ts §八 ⑧`、`nh3-ch4.ts ⑧`、GC 柱箱 300 °C / H₂ 火焰
 *
 * pellistor 是 LEL 报警的常规做法：Pt 丝线圈 + γ-Al₂O₃ 珠 + 补偿珠。
 * 本机选 TCD 时，本层**还没有铂、没有钯**（`mat/platinum` / `mat/palladium` 当时 0 条；
 * 贵金属链只到银/金/硒）。现在那条湿法冶金已经补上（`data/material/pgm.ts`：
 * 阳极泥 → 铂族精矿 → 氯化浸出 → NH₄Cl 沉淀 → 海绵 Pt/Pd 99.9–99.99 %），
 * 但 pellistor 器件后来补上了（`data/machine/pellistor.ts`：Pt 丝线圈 + γ-Al₂O₃
 * 珠 + Pd/Pt 浸渍 + 补偿珠 + 防爆烧结罩）。它不是替代 TCD，而是**第二条产出
 * 路线**：TCD 管 0–100 vol% / LEL，pellistor 管 10–100 ppm 的 ppm 检漏。
 *
 * TCD 走的是另一条已有工艺：`plant/gc-tcd/tcd-cell` 的四丝钨丝池
 * （`nh3-gas.ts:390`，5–20 mV·mL/µg、80–150 °C、80–150 µL），
 * 钨丝、池体、桥路、载气板全在。氢气与空气的热导率差是这里最大的：
 *
 *   k(H₂) 0.1869 W/(m·K)   k(air) 0.0262   k(CH₄) 0.0340   k(CO) 0.0250
 *
 * 所以 TCD 对 H₂ 的响应远大于 CH₄/CO —— 这不是“灵敏度更高”，是
 * **选择性更好**。1 vol% H₂ 的 Δk = 0.00161；同样 1 vol% CH₄ 只有
 * 0.000078（4.9 %），CO 是 −0.000012（−0.75 %）。CH₄/CO 交叉因此只有
 * 3–8 % / −2…+2 %（TCD，设计值）；pellistor 路线是 5–15 % / 2–5 %。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、量程：0–100 vol% 盖住爆炸区间，4 vol% 是 LEL 报警点
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * H₂ 的爆炸区间是 **4–75 vol%**，自燃点 560 °C。传感器不能只做 0–4 vol%
 * 就完事：4 vol% 以上若饱和，就分不清“刚好到 LEL”与“已经 75 vol%”，
 * 而这两件事的处置完全不同。TCD 的 0–100 vol% 宽档就是为此：
 *
 *   0–5 vol%     LEL 档，4 vol% 报警（100 % LEL）
 *   0–100 vol%   高浓度档，吹扫/置换/确认用；4–75 % 不饱和
 *
 * 4 vol% 在 TCD 上的信号：Δk = 0.00643，混合气 k = 0.0326，比空气高
 * **24.5 %**；0.4 vol%（10 % LEL）只有 **2.45 %**，接近桥路噪声
 * （0.1 % 级）。所以 TCD 这台是**4 % LEL 报警器**，不是 ppm 检漏仪；
 * ppm 档由 `make/pellistor-h2-sensor` 补上（10–100 ppm、0.001–0.01 vol%），
 * 不改 TCD 这条路线。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、防爆：TCD 也要 Ex d，不是只有 pellistor 要
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * TCD 池在 100–140 °C 工作，低于 H₂ 自燃点 560 °C，但电子板、接线、
 * 采样口都可能打火；而样气本身可能就在 4–75 % 的爆炸区间里。所以：
 *
 *   Ex d IIC T1（最高表面 450 °C，对 560 °C 有 110 K 余量）
 *   火焰通路间隙 ≤0.15 mm、长度 ≥25 mm，8 颗螺栓压紧
 *   1.5 MPa 水压试验（`plant/mid-pressure-autoclave` 的 100–3000 kPa 窗口）
 *   烧结不锈钢火焰捕获器：孔径 20–40 µm、流量 50–100 mL/min
 *
 * ⚠️ 本层没有爆炸试验舱、没有 IECEx/ATEX 认证机构；Ex d 是**设计**，
 * 不是证书。要签字得补：爆炸性混合气试验（4–75 % H₂）、压力/间隙复测、
 * 认证标签三样。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、压缩空气：火星大气不是 21 % O₂ 的“空气”
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 火星大气 95 % 是 CO₂，直接压缩它是 CO₂ 气，不是 FID 助燃气。本层的
 * “压缩空气”是**合成空气**：
 *
 *   O₂ 232 kg + N₂ 755 kg + Ar 13 kg → 1000 kg 空气
 *   （干空气质量分数：O₂ 23.2 %、N₂ 75.5 %、Ar 1.3 %）
 *
 * O₂ 来自电解/空分，N₂/Ar 来自 `plant/air-separator` 的低温精馏。
 * “空气本来就在”指的是这三个组分都在链上，不是指火星大气可以直接当
 * 21 % O₂ 的空气用 —— 这一句必须写清，否则 FID 的助燃气会变成 CO₂。
 *
 * 压缩/干燥/除油之后：0.6–1.0 MPa、露点 ≤−40 °C、油 ≤0.1 mg/m³、
 * CO₂ ≤300 ppm、THC ≤1 ppm。FID 助燃气要的就是“无烃、无水、无油”：
 * 烃会抬基线，水会熄火，油会堵喷嘴。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、只用已有 id
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 复用：`plant/gc-tcd/tcd-cell`、`plant/mfc`、`plant/mid-pressure-autoclave`、
 * `plant/oxygen-probe`、`plant/dew-point-meter`、`plant/sheet-shop`、
 * `plant/milling-machine`、`plant/metrology-room`、`std/opamp-chip-general`、
 * `std/zener-reference-general`、`std/dvm-general`、`std/control-board-general`、
 * `std/contactor-general`、`std/motor-7.5kw-4p`、`std/thermocouple-t-general`、
 * `mat/oxygen`、`mat/nitrogen`、`mat/argon`、`mat/hydrogen`、`mat/methane`、
 * `mat/co`、`mat/steel-45`、`mat/stainless-steel`、`mat/aluminium`、
 * `mat/copper`、`mat/copper-wire`、`mat/sheet-steel`、`mat/ptfe`、
 * `mat/resistance-wire`、`mat/alumina`、`mat/carbon`、`mat/glass-fiber`。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

// ═══════════════════════════════════════════════════════════════════════════
// 一、氢气传感器条目
// ═══════════════════════════════════════════════════════════════════════════

export const H2_SENSOR_ITEMS: readonly Item[] = [
  /**
   * 氢气传感器（TCD 基线 + pellistor 升级）。**0–100 vol%、LEL 报警、Ex d IIC T1。**
   *
   *   0–5 vol%     LEL 档，4 vol% 报警（100 % LEL）
   *   0–100 vol%   TCD 高浓度档，4–75 % 不饱和
   *   交叉         TCD：CH₄ 3–8 %、CO −2…+2 %；
   *                pellistor：CH₄ 5–15 %、CO 2–5 %
   *   resolution   TCD 0.01–0.04 vol%；pellistor 0.001–0.01 vol%
   *   detectionLimit TCD 1000–4000 ppm；pellistor 10–100 ppm
   *
   * 两条产出路线：`make/h2-sensor`（TCD，复用 `plant/gc-tcd/tcd-cell`）与
   * `make/pellistor-h2-sensor`（pellistor，见 `data/machine/pellistor.ts`）。
   */
  {
    id: 'plant/h2-sensor',
    name: '氢气传感器',
    unit: '台',
    category: 'machine',
    props: [
      { param: 'measure/range', kind: 'range', min: 0, max: 100, unit: 'vol%' },
      { param: 'measure/lelRange', kind: 'range', min: 0, max: 5, unit: 'vol%' },
      { param: 'measure/lelAlarm', kind: 'range', min: 4, max: 4, unit: 'vol%' },
      { param: 'measure/response', kind: 'range', min: 1, max: 10, unit: 's', dir: 'atMost' },
      { param: 'measure/accuracy', kind: 'range', min: 2, max: 10, unit: '%', dir: 'atMost' },
      { param: 'measure/crossCH4', kind: 'range', min: 0, max: 20, unit: '%', dir: 'atMost' },
      { param: 'measure/crossCO', kind: 'range', min: -10, max: 10, unit: '%' },
      { param: 'measure/zeroDrift', kind: 'range', min: 0, max: 2, unit: '%/月', dir: 'atMost' },
      { param: 'temperature', kind: 'range', min: 0, max: 50, unit: '°C' },
      { param: 'protection', kind: 'enum', values: ['Ex d IIC T1'] },
      { param: 'measure/resolution', kind: 'range', min: 0.001, max: 0.04, unit: 'vol%', dir: 'atMost' },
      { param: 'measure/detectionLimit', kind: 'range', min: 10, max: 4000, unit: 'ppm', dir: 'atMost' },
      { param: 'measure/bridgeOutput', kind: 'range', min: 0.1, max: 2, unit: 'V' },
    ],
  },

  /**
   * 烧结不锈钢火焰捕获器。**孔径 20–40 µm、火焰通路 0.15–0.25 mm、流量 50–100 mL/min。**
   *
   * 它把“壳内可能爆炸”变成“壳内爆炸不传出去”：火焰在微孔里淬熄，
   * 外壳承受 1.5 MPa 的内压。没有它，Ex d 只是一个铁盒子。
   */
  {
    id: 'plant/h2-sensor/flame-arrestor',
    name: '烧结不锈钢火焰捕获器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'poreSize', kind: 'range', min: 10, max: 50, unit: 'µm', dir: 'atMost' },
      { param: 'flamePath', kind: 'range', min: 0.1, max: 0.3, unit: 'mm', dir: 'atMost' },
      { param: 'flow', kind: 'range', min: 20, max: 100, unit: 'mL/min', dir: 'atLeast' },
    ],
  },

  /**
   * 防爆壳。**Ex d IIC T1、1.5–2 MPa、间隙 0.10–0.15 mm、通路 25–30 mm。**
   *
   * 材质用铝/不锈钢；火焰通路是**金属对金属**，不准加 PTFE 垫 —— 垫片烧掉
   * 就变成一条直通大气的缝。8 颗 M8 螺栓，拧紧力矩 25 N·m。
   */
  {
    id: 'plant/h2-sensor/flameproof-housing',
    name: '氢气传感器防爆壳',
    unit: '件',
    category: 'part',
    props: [
      { param: 'protection', kind: 'enum', values: ['Ex d IIC T1'] },
      { param: 'pressure', kind: 'range', min: 1, max: 2, unit: 'MPa' },
      { param: 'gap', kind: 'range', min: 0.1, max: 0.2, unit: 'mm', dir: 'atMost' },
      { param: 'length', kind: 'range', min: 20, max: 30, unit: 'mm', dir: 'atLeast' },
    ],
  },

  /**
   * TCD 加热块。**100–140 °C、±0.2–0.5 °C、10–20 W。**
   *
   * TCD 的灵敏度靠池温稳定：池温漂 1 K，零点漂 0.1–0.3 % FS。
   * 加热块用电阻丝绕氧化铝骨架，热电偶读温，接触器通断。
   */
  {
    id: 'plant/h2-sensor/oven',
    name: 'TCD 加热块',
    unit: '件',
    category: 'part',
    props: [
      { param: 'temperature', kind: 'range', min: 80, max: 160, unit: '°C' },
      { param: 'stability', kind: 'range', min: 0.1, max: 1, unit: '°C', dir: 'atMost' },
      { param: 'power', kind: 'range', min: 5, max: 30, unit: 'W' },
    ],
  },

  /**
   * 双档桥路 + 报警。**0–5 % / 0–100 % 两档、4 vol% 报警、0.5–2 V 输出。**
   *
   * 两档共用同一只 TCD 池：LEL 档放大 20 倍，高浓度档直通。报警是
   * 硬件比较器（齐纳定阈），不经过软件 —— 软件死了也要响。
   */
  {
    id: 'plant/h2-sensor/bridge',
    name: '氢气传感器桥路',
    unit: '件',
    category: 'part',
    props: [
      { param: 'range', kind: 'range', min: 0, max: 100, unit: 'vol%' },
      { param: 'lelRange', kind: 'range', min: 0, max: 5, unit: 'vol%' },
      { param: 'output', kind: 'range', min: 0.1, max: 5, unit: 'V' },
      { param: 'alarm', kind: 'range', min: 4, max: 4, unit: 'vol%' },
      { param: 'response', kind: 'range', min: 1, max: 10, unit: 's', dir: 'atMost' },
      { param: 'accuracy', kind: 'range', min: 2, max: 10, unit: '%', dir: 'atMost' },
    ],
  },

];

// ═══════════════════════════════════════════════════════════════════════════
// 二、氢气传感器路线
// ═══════════════════════════════════════════════════════════════════════════

export const H2_SENSOR_ROUTES: readonly Route[] = [
  /**
   * 火焰捕获器：316L 粉末压制 → 烧结 → 车配 → 流量/淬熄检验。
   *
   *   不锈钢 0.5 + 铜 0.1 + 铝 0.2 → 捕获器 1
   */
  {
    id: 'make/h2-flame-arrestor',
    name: '烧结不锈钢火焰捕获器制造',
    produces: [
      {
        item: 'plant/h2-sensor/flame-arrestor',
        qty: q(1),
        gives: [
          { param: 'poreSize', kind: 'range', min: 20, max: 40 },
          { param: 'flamePath', kind: 'range', min: 0.15, max: 0.25 },
          { param: 'flow', kind: 'range', min: 50, max: 100 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 5) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '316L 粉末 20–40 µm 压制成 φ30×10 片，压 200 MPa', performedBy: 'plant/press' },
      { note_zh: '烧结 1050–1150 °C / 1 h，孔隙率 35–45 %；无氧/微还原气氛', performedBy: 'plant/atmosphere-furnace', under: [{ param: 'temperature', min: 1050, max: 1150 }, { param: 'oxygen_ppm', min: 0, max: 50 }] },
      { note_zh: '车外圆/压装到防爆壳进气口，流量 50–100 mL/min @1 kPa', performedBy: 'lathe' },
      { note_zh: '淬熄检验：4 % H₂ 点火不传爆（设计值；本层没有爆炸试验舱）', performedBy: 'plant/robot' },
    ],
    rate: { hours: q(8) },
    unbalanced_zh: '不锈钢 0.5 + 铜 0.1 + 铝 0.2 → 捕获器 1；余是压制/车削废料。淬熄是设计值，不是爆炸试验',
  },

  /**
   * 防爆壳：铝/不锈钢壳 → 铣火焰通路 → 8 螺栓压紧 → 1.5 MPa 水压。
   *
   *   铝 3 + 不锈钢 0.5 + 铜 0.1 → 壳 1
   */
  {
    id: 'make/h2-flameproof-housing',
    name: '氢气传感器防爆壳制造',
    produces: [
      {
        item: 'plant/h2-sensor/flameproof-housing',
        qty: q(1),
        gives: [
          { param: 'protection', kind: 'enum', oneOf: ['Ex d IIC T1'] },
          { param: 'pressure', kind: 'range', min: 1.5, max: 2 },
          { param: 'gap', kind: 'range', min: 0.1, max: 0.15 },
          { param: 'length', kind: 'range', min: 25, max: 30 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/aluminium', qty: q(3) }] },
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1, 10) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '铣壳体和盖的火焰通路：间隙 0.10–0.15 mm、通路 25–30 mm、8 颗 M8', performedBy: 'plant/milling-machine' },
      { note_zh: '焊进气/出线口，装烧结捕获器座；金属对金属，不加 PTFE 垫', performedBy: 'plant/sheet-shop' },
      { note_zh: '1.5 MPa 水压 30 min，保压不降（中压釜 100–3000 kPa 窗口）', performedBy: 'plant/mid-pressure-autoclave', under: [{ param: 'pressure', min: 1500, max: 1600 }] },
    ],
    rate: { hours: q(16) },
    unbalanced_zh: '铝 3 + 不锈钢 0.5 + 铜 0.1 → 防爆壳 1；余是铣屑。Ex d 是设计，没有 IECEx/ATEX 证书',
  },

  /**
   * TCD 加热块：电阻丝绕氧化铝骨架 + 热电偶 + 接触器。
   *
   *   电阻丝 0.1 + 氧化铝 0.5 + 钢板 1 + 热电偶 1 + 接触器 1 → 加热块 1
   */
  {
    id: 'make/h2-oven',
    name: 'TCD 加热块制造',
    produces: [
      {
        item: 'plant/h2-sensor/oven',
        qty: q(1),
        gives: [
          { param: 'temperature', kind: 'range', min: 100, max: 140 },
          { param: 'stability', kind: 'range', min: 0.2, max: 0.5 },
          { param: 'power', kind: 'range', min: 10, max: 20 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(1, 2) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
      { anyOf: [{ item: 'std/thermocouple-t-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/robot',
    under: [{ param: 'temperature', min: 19, max: 21 }],
    rate: { hours: q(8) },
    unbalanced_zh: '电阻丝 0.1 + 氧化铝 0.5 + 钢板 1 + 热电偶 1 + 接触器 1 → 加热块 1；余是绕线/保温边角。100–140 °C 是设计值，用热电偶与 DVM 标',
  },

  /**
   * 双档桥路 + 报警：四只运放 + 齐纳 + DVM + 控制板 + PCB。
   *
   *   运放 4 + 齐纳 1 + DVM 1 + 控制板 1 + PCB 1 + 铜线 0.1 + 铝 1 → 桥路 1
   */
  {
    id: 'make/h2-bridge',
    name: '氢气传感器桥路制造',
    produces: [
      {
        item: 'plant/h2-sensor/bridge',
        qty: q(1),
        gives: [
          { param: 'range', kind: 'range', min: 0, max: 100 },
          { param: 'lelRange', kind: 'range', min: 0, max: 5 },
          { param: 'output', kind: 'range', min: 0.5, max: 2 },
          { param: 'alarm', kind: 'range', min: 4, max: 4 },
          { param: 'response', kind: 'range', min: 3, max: 8 },
          { param: 'accuracy', kind: 'range', min: 2, max: 5 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(4) }] },
      { anyOf: [{ item: 'std/zener-reference-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/dvm-general', qty: q(1) }] },
      // SMT 主路保持通用板；OR 备路：手工焊（4 运放 + 硬件比较器，0603/0805）
      {
        anyOf: [
          { item: 'std/control-board-general', qty: q(1) },
          { item: 'std/control-board-simple-manual-general', qty: q(1) },
        ],
      },
      { anyOf: [{ item: 'mat/pcb-2layer', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 10) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/robot',
    under: [{ param: 'temperature', min: 19, max: 21 }],
    rate: { hours: q(16) },
    unbalanced_zh: '运放 4 + 齐纳 1 + DVM 1 + 控制板 1 + PCB 1 + 铜线 0.1 + 铝 1 → 桥路 1；余是屏蔽盒边角。4 vol% 报警是硬件比较器，不经软件',
  },

  /**
   * 整机：TCD 池 + 加热块 + 火焰捕获器 + 防爆壳 + 桥路。
   *
   *   TCD 池 1 + 加热块 1 + 捕获器 1 + 防爆壳 1 + 桥路 1
   *   + 控制板 1 + DVM 1 + 接触器 1 + 钢板 2 + 铜线 0.5 → 传感器 1 台
   */
  {
    id: 'make/h2-sensor',
    name: '氢气传感器装配',
    produces: [
      {
        item: 'plant/h2-sensor',
        qty: q(1),
        gives: [
          { param: 'measure/range', kind: 'range', min: 0, max: 100 },
          { param: 'measure/lelRange', kind: 'range', min: 0, max: 5 },
          { param: 'measure/lelAlarm', kind: 'range', min: 4, max: 4 },
          { param: 'measure/response', kind: 'range', min: 3, max: 8 },
          { param: 'measure/accuracy', kind: 'range', min: 2, max: 5 },
          { param: 'measure/crossCH4', kind: 'range', min: 3, max: 8 },
          { param: 'measure/crossCO', kind: 'range', min: -2, max: 2 },
          { param: 'measure/zeroDrift', kind: 'range', min: 0.5, max: 1.5 },
          { param: 'temperature', kind: 'range', min: 5, max: 40, record: 'mat/h2-sensor-record' },
          { param: 'protection', kind: 'enum', oneOf: ['Ex d IIC T1'], record: 'mat/h2-sensor-record' },
          { param: 'measure/resolution', kind: 'range', min: 0.01, max: 0.04 },
          { param: 'measure/detectionLimit', kind: 'range', min: 1000, max: 4000 },
          { param: 'measure/bridgeOutput', kind: 'range', min: 0.5, max: 2 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/gc-tcd/tcd-cell', qty: q(1) }] },
      { anyOf: [{ item: 'plant/h2-sensor/oven', qty: q(1) }] },
      { anyOf: [{ item: 'plant/h2-sensor/flame-arrestor', qty: q(1) }] },
      { anyOf: [{ item: 'plant/h2-sensor/flameproof-housing', qty: q(1) }] },
      { anyOf: [{ item: 'plant/h2-sensor/bridge', qty: q(1) }] },
      // C 组 OR：主路仍是通用板；4 vol% 安全比较器在 h2-bridge 硬件回路，板只做显示/继电器（I/O 8–16），
      // 8–12 MHz 对 <1 kHz 报警/显示有 >10^4 余量 → 二层简版够用。
      { anyOf: [{ item: 'std/control-board-general', qty: q(1) }, { item: 'std/control-board-simple-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/dvm-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(2) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1, 2) }] },
    ],
    needs: ['plant/metrology-room', 'plant/mfc'],
    steps: [
      { note_zh: '装 TCD 池与加热块：池温 100–140 °C，热电偶贴池壁；池体与壳绝缘', performedBy: 'plant/robot' },
      { note_zh: '装火焰捕获器与防爆壳：间隙 0.10–0.15 mm、8 颗 M8 25 N·m；1.5 MPa 水压', performedBy: 'plant/sheet-shop' },
      { note_zh: '装桥路/报警/电源：LEL 档 20 倍、高浓度档直通；4 vol% 比较器动作', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '用 4 % H₂ / 空气标定：零点、量程、响应 <10 s；CH₄/CO 交叉各测一点', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(40) },
    unbalanced_zh:
      'TCD 池 1 + 加热块 1 + 捕获器 1 + 防爆壳 1 + 桥路 1 + 控制板 1 + DVM 1 + 接触器 1 + 钢板 2 + 铜线 0.5 → 传感器 1 台；余是钣金边角与线头。0–100 vol%、4 vol% 报警、3–8 s、3–8 % CH₄ 交叉是设计值',
  },

];

// ═══════════════════════════════════════════════════════════════════════════
// 三、压缩空气条目
// ═══════════════════════════════════════════════════════════════════════════

export const AIR_ITEMS: readonly Item[] = [
  /**
   * 压缩空气（合成空气）。**O₂ 21±0.5 vol%、露点 ≤−40 °C、油 ≤0.1 mg/m³。**
   *
   * 它不是火星大气的直接压缩：火星大气 95 % 是 CO₂。本条目是
   * O₂（电解/空分）+ N₂/Ar（空分）按干空气质量比配成的合成空气，
   * 再做压缩、干燥、除油。
   *
   *   o2        20.5–21.5 vol%
   *   dewPoint  ≤−40 °C
   *   oil       ≤0.1 mg/m³
   *   co2       ≤300 ppm
   *   thc       ≤1 ppm（FID 助燃气）
   */
  {
    id: 'mat/air',
    name: '压缩空气',
    unit: 'kg',
    category: 'material',
    props: [
      { param: 'o2', kind: 'range', min: 20.5, max: 21.5, unit: 'vol%' },
      { param: 'dewPoint', kind: 'range', min: -80, max: -40, unit: '°C', dir: 'atMost' },
      { param: 'oil', kind: 'range', min: 0.001, max: 1, unit: 'mg/m³', dir: 'atMost' },
      { param: 'co2', kind: 'range', min: 0, max: 1000, unit: 'ppm', dir: 'atMost' },
      { param: 'thc', kind: 'range', min: 0.01, max: 100, unit: 'ppm', dir: 'atMost' },
    ],
  },

  /**
   * 压缩空气机组。**0.6–1.0 MPa、20–100 m³/h、露点 −50…−45 °C、油 0.01–0.1 mg/m³。**
   *
   * 五件：压缩机 1 + 冷冻/吸附干燥器 1 + 除油过滤器 1 + 储气罐 1 + 机架 1。
   * 它只做“压缩 + 干燥 + 除油”，不做空分；O₂/N₂/Ar 的配比在
   * `make/compressed-air` 里完成。
   */
  {
    id: 'plant/air-compressor',
    name: '压缩空气机组',
    unit: '台',
    category: 'machine',
    holds: [{ param: 'pressure', min: 0.6, max: 1.0 }],
    props: [
      { param: 'pressure', kind: 'range', min: 0.6, max: 1.0, unit: 'MPa' },
      { param: 'flow', kind: 'range', min: 10, max: 100, unit: 'm³/h', dir: 'atLeast' },
      { param: 'dewPoint', kind: 'range', min: -60, max: -40, unit: '°C', dir: 'atMost' },
      { param: 'oil', kind: 'range', min: 0.01, max: 1, unit: 'mg/m³', dir: 'atMost' },
      { param: 'o2', kind: 'range', min: 20.5, max: 21.5, unit: 'vol%' },
      { param: 'co2', kind: 'range', min: 0, max: 1000, unit: 'ppm', dir: 'atMost' },
      { param: 'thc', kind: 'range', min: 0.01, max: 100, unit: 'ppm', dir: 'atMost' },
    ],
  },

  /** 压缩机。两级活塞/螺杆，0.6–1.0 MPa、20–100 m³/h、7.5–11 kW。 */
  {
    id: 'plant/air-compressor/compressor',
    name: '压缩空气机组压缩机',
    unit: '件',
    category: 'part',
    props: [
      { param: 'pressure', kind: 'range', min: 0.6, max: 1.0, unit: 'MPa' },
      { param: 'flow', kind: 'range', min: 10, max: 100, unit: 'm³/h', dir: 'atLeast' },
      { param: 'power', kind: 'range', min: 5, max: 15, unit: 'kW' },
    ],
  },

  /** 冷冻/吸附干燥器。露点 −50…−45 °C、20–100 m³/h。 */
  {
    id: 'plant/air-compressor/dryer',
    name: '压缩空气机组冷冻/吸附干燥器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'dewPoint', kind: 'range', min: -60, max: -40, unit: '°C', dir: 'atMost' },
      { param: 'flow', kind: 'range', min: 10, max: 100, unit: 'm³/h', dir: 'atLeast' },
    ],
  },

  /** 除油过滤器。活性炭 + 玻璃纤维，油 0.01–0.1 mg/m³、THC 0.1–1 ppm。 */
  {
    id: 'plant/air-compressor/oil-filter',
    name: '压缩空气机组除油过滤器',
    unit: '件',
    category: 'part',
    props: [
      { param: 'oil', kind: 'range', min: 0.01, max: 1, unit: 'mg/m³', dir: 'atMost' },
      { param: 'thc', kind: 'range', min: 0.1, max: 10, unit: 'ppm', dir: 'atMost' },
    ],
  },

  /** 储气罐。0.5–1.0 m³、1.2–1.6 MPa，带安全阀与排水阀。 */
  {
    id: 'plant/air-compressor/receiver',
    name: '压缩空气机组储气罐',
    unit: '件',
    category: 'part',
    props: [
      { param: 'volume', kind: 'range', min: 0.3, max: 2, unit: 'm³' },
      { param: 'pressure', kind: 'range', min: 1.0, max: 1.6, unit: 'MPa' },
    ],
  },

  /** 机架与管路。型材焊接 + 法兰 + 阀门。 */
  { id: 'plant/air-compressor/frame', name: '压缩空气机组机架与管路', unit: '件', category: 'part' },
];

// ═══════════════════════════════════════════════════════════════════════════
// 四、压缩空气路线
// ═══════════════════════════════════════════════════════════════════════════

export const AIR_ROUTES: readonly Route[] = [
  /**
   * 压缩机：45 钢缸体/曲轴 → 车/铣 → 装电机/阀 → 空载试车。
   *
   *   45 钢 50 + 电机 1 + 接触器 1 + 铜线 1 + 铝 5 → 压缩机 1
   */
  {
    id: 'make/air-compressor-compressor',
    name: '压缩空气机组压缩机制造',
    produces: [
      {
        item: 'plant/air-compressor/compressor',
        qty: q(1),
        gives: [
          { param: 'pressure', kind: 'range', min: 0.6, max: 1.0 },
          { param: 'flow', kind: 'range', min: 20, max: 100 },
          { param: 'power', kind: 'range', min: 7.5, max: 11 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/steel-45', qty: q(50) }] },
      { anyOf: [{ item: 'std/motor-7.5kw-4p', qty: q(1) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(5) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '车缸体/曲轴、铣阀板；45 钢调质 28–32 HRC', performedBy: 'lathe' },
      { note_zh: '装两级活塞/阀片/电机/接触器，皮带对中', performedBy: 'plant/robot' },
      { note_zh: '空载 2 h、0.8 MPa 负载 1 h；排气温度 ≤180 °C', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
    rate: { hours: q(40) },
    unbalanced_zh: '45 钢 50 + 电机 1 + 接触器 1 + 铜线 1 + 铝 5 → 压缩机 1；余是车/铣屑。0.6–1.0 MPa、20–100 m³/h 是设计值',
  },

  /**
   * 干燥器：铜管束 + 不锈钢壳 + 氧化铝/分子筛 + 排水阀。
   *
   *   不锈钢 20 + 铜 5 + 氧化铝 5 + PTFE 0.5 → 干燥器 1
   */
  {
    id: 'make/air-compressor-dryer',
    name: '压缩空气机组冷冻/吸附干燥器制造',
    produces: [
      {
        item: 'plant/air-compressor/dryer',
        qty: q(1),
        gives: [
          { param: 'dewPoint', kind: 'range', min: -50, max: -45 },
          { param: 'flow', kind: 'range', min: 20, max: 100 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(20) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(5) }] },
      { anyOf: [{ item: 'mat/alumina', qty: q(5) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 2) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/sheet-shop',
    rate: { hours: q(24) },
    unbalanced_zh: '不锈钢 20 + 铜 5 + 氧化铝 5 + PTFE 0.5 → 干燥器 1；余是管/板边角。−50…−45 °C 露点是设计值，用露点仪抽检',
  },

  /**
   * 除油过滤器：不锈钢壳 + 活性炭 + 玻璃纤维滤芯。
   *
   *   不锈钢 5 + 碳 1 + 玻璃纤维 0.2 + PTFE 0.1 → 过滤器 1
   */
  {
    id: 'make/air-compressor-oil-filter',
    name: '压缩空气机组除油过滤器制造',
    produces: [
      {
        item: 'plant/air-compressor/oil-filter',
        qty: q(1),
        gives: [
          { param: 'oil', kind: 'range', min: 0.01, max: 0.1 },
          { param: 'thc', kind: 'range', min: 0.1, max: 1 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/stainless-steel', qty: q(5) }] },
      { anyOf: [{ item: 'mat/carbon', qty: q(1) }] },
      { anyOf: [{ item: 'mat/glass-fiber', qty: q(1, 5) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 10) }] },
    ],
    needs: ['plant/metrology-room'],
    performedBy: 'plant/sheet-shop',
    rate: { hours: q(12) },
    unbalanced_zh: '不锈钢 5 + 碳 1 + 玻璃纤维 0.2 + PTFE 0.1 → 过滤器 1；余是边角。0.01–0.1 mg/m³ 油、0.1–1 ppm THC 是设计值，没有在线 THC 分析',
  },

  /**
   * 储气罐：钢板卷焊 + 封头 + 法兰 + 安全阀 + 1.6 MPa 水压。
   *
   *   钢板 80 + 铜 1 + PTFE 0.1 → 储气罐 1
   */
  {
    id: 'make/air-compressor-receiver',
    name: '压缩空气机组储气罐制造',
    produces: [
      {
        item: 'plant/air-compressor/receiver',
        qty: q(1),
        gives: [
          { param: 'volume', kind: 'range', min: 0.5, max: 1.0 },
          { param: 'pressure', kind: 'range', min: 1.2, max: 1.6 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(80) }] },
      { anyOf: [{ item: 'mat/copper', qty: q(1) }] },
      { anyOf: [{ item: 'mat/ptfe', qty: q(1, 10) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '卷焊 φ600×1800 罐体 + 封头，环缝连续焊', performedBy: 'plant/sheet-shop' },
      { note_zh: '装安全阀/排水阀/压力表；1.6 MPa 水压 30 min', performedBy: 'plant/mid-pressure-autoclave', under: [{ param: 'pressure', min: 1600, max: 1600 }] },
    ],
    rate: { hours: q(24) },
    unbalanced_zh: '钢板 80 + 铜 1 + PTFE 0.1 → 储气罐 1；余是边角/焊材。1.6 MPa 水压，没有射线探伤',
  },

  /** 机架与管路：型材焊接 + 法兰 + 阀门。 */
  {
    id: 'make/air-compressor-frame',
    name: '压缩空气机组机架与管路制造',
    produces: [{ item: 'plant/air-compressor/frame', qty: q(1) }],
    uses: [{ anyOf: [{ item: 'mat/sheet-steel', qty: q(30) }] }],
    needs: [],
    performedBy: 'plant/sheet-shop',
    rate: { hours: q(16) },
    unbalanced_zh: '钢板 30 → 机架 1；余是边角/焊条',
  },

  /**
   * 整机：压缩机 + 干燥器 + 除油器 + 储气罐 + 机架 + 控制。
   *
   *   压缩机 1 + 干燥器 1 + 除油器 1 + 储气罐 1 + 机架 1
   *   + 控制板 1 + 接触器 1 + DVM 1 + 钢板 10 + 铜线 1 → 机组 1 台
   */
  {
    id: 'make/air-compressor',
    name: '压缩空气机组装配',
    produces: [
      {
        item: 'plant/air-compressor',
        qty: q(1),
        gives: [
          { param: 'pressure', kind: 'range', min: 0.6, max: 1.0 },
          { param: 'flow', kind: 'range', min: 20, max: 100 },
          { param: 'dewPoint', kind: 'range', min: -50, max: -45 },
          { param: 'oil', kind: 'range', min: 0.01, max: 0.1 },
          { param: 'o2', kind: 'range', min: 20.8, max: 21.2 },
          { param: 'co2', kind: 'range', min: 100, max: 300 },
          { param: 'thc', kind: 'range', min: 0.1, max: 1 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'plant/air-compressor/compressor', qty: q(1) }] },
      { anyOf: [{ item: 'plant/air-compressor/dryer', qty: q(1) }] },
      { anyOf: [{ item: 'plant/air-compressor/oil-filter', qty: q(1) }] },
      { anyOf: [{ item: 'plant/air-compressor/receiver', qty: q(1) }] },
      { anyOf: [{ item: 'plant/air-compressor/frame', qty: q(1) }] },
      // SMT 主路保持通用板；OR 备路：手工焊（压力/接触器/计时，60 点内）
      {
        anyOf: [
          { item: 'std/control-board-general', qty: q(1) },
          { item: 'std/control-board-simple-manual-general', qty: q(1) },
        ],
      },
      { anyOf: [{ item: 'std/contactor-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/dvm-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(10) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '装压缩机/干燥器/除油器/储气罐到机架，管路法兰对接', performedBy: 'plant/sheet-shop' },
      { note_zh: '电气/控制/压力开关/安全阀；0.8 MPa 联调（19–21 °C）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '1.6 MPa 水压试验（储气罐）与 0.8 MPa 气密 24 h', performedBy: 'plant/mid-pressure-autoclave', under: [{ param: 'pressure', min: 1600, max: 1600 }] },
    ],
    rate: { hours: q(80) },
    unbalanced_zh:
      '压缩机 1 + 干燥器 1 + 除油器 1 + 储气罐 1 + 机架 1 + 控制板 1 + 接触器 1 + DVM 1 + 钢板 10 + 铜线 1 → 机组 1 台；余是钣金/管件边角',
  },

  /**
   * 压缩空气：O₂ 232 + N₂ 755 + Ar 13 → 空气 1000。
   *
   * 干空气质量分数：O₂ 23.2 %、N₂ 75.5 %、Ar 1.3 %。O₂ 的 90–99 % 纯度
   * 会把 O₂ 分数压到 20.8–21.2 %，仍在 21±0.5 % 内；N₂/Ar 带进来的
   * CO₂/THC 由除油/干燥段压到 ≤300 ppm / ≤1 ppm。
   *
   * 0.6–1.0 MPa 压缩、露点 −50…−45 °C、油 0.01–0.1 mg/m³。
   * 质量账：232 + 755 + 13 = 1000 → 1000，精确平衡。
   */
  {
    id: 'make/compressed-air',
    name: '压缩空气制备',
    produces: [
      {
        item: 'mat/air',
        qty: q(1000),
        gives: [
          { param: 'o2', kind: 'range', min: 20.8, max: 21.2 },
          { param: 'dewPoint', kind: 'range', min: -50, max: -45 },
          { param: 'oil', kind: 'range', min: 0.01, max: 0.1 },
          { param: 'co2', kind: 'range', min: 100, max: 300 },
          { param: 'thc', kind: 'range', min: 0.1, max: 1 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/oxygen', qty: q(232) }] },
      { anyOf: [{ item: 'mat/nitrogen', qty: q(755) }] },
      { anyOf: [{ item: 'mat/argon', qty: q(13) }] },
    ],
    needs: ['plant/metrology-room', 'plant/oxygen-probe', 'plant/dew-point-meter'],
    performedBy: 'plant/air-compressor',
    under: [{ param: 'pressure', min: 0.6, max: 1.0 }],
    rate: { hours: q(2) },
  },
];

/**
 * 一个出口：把两套数组按注册顺序拼好，父任务若不想写四个 spread，可以直接用
 * `H2_AIR_ITEMS` / `H2_AIR_ROUTES` 两个数组（但仍要两个 spread）。
 */
export const H2_AIR_ITEMS: readonly Item[] = [...H2_SENSOR_ITEMS, ...AIR_ITEMS];
export const H2_AIR_ROUTES: readonly Route[] = [...H2_SENSOR_ROUTES, ...AIR_ROUTES];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...H2_AIR_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...H2_AIR_ROUTES];
