/**
 * CAR 线电阻测试结构 —— 把“刻蚀片没人吃”变成“有电学读数”。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 〇、它接的是哪一段
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `make/car-stripped-wafer`（car-strip.ts）交 1 片刻蚀片：
 *   lineWidth 80–200 nm、etchDepth 100–300 nm、sidewallAngle 70–85°、residue 1–10 nm。
 *
 * 在此之前，`mat/car-stripped-wafer` **没有任何路线吃它** ——
 * `car-resist-pag.ts` 缺口⑤与 `car-resist.ts` R8① 都点名了这一格。
 * 本文件给它一条消费路线：
 *
 *   刻蚀片 1 + 铝 0.01 kg + 光刻胶 0.001 kg + 水 1 kg
 *     → 四道工序 → 线电阻测试结构 1 片（4 个 pad、一条线、一个四线法读数）
 *
 * 它不是器件。它只是把“这片刻蚀片有没有人用”变成“这片刻蚀片能不能读出数”。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 一、四道工序
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① 探针盘光刻   胶 0.8–1.0 µm、4 个 100×100 µm pad、pitch 100–200 µm
 *                  `plant/mask-aligner` + `std/photomask-general`（版在 needs）
 *   ② 蒸铝 + 剥离  0.5–1 µm 铝、1e-3–1e-2 Pa
 *                  `plant/evaporator`
 *   ③ 合金         400–450 °C / 30 min
 *                  `plant/resistance-furnace`
 *   ④ 四线法       0.1–100 Ω
 *                  `plant/probe-station`（19–21 °C，`plant/metrology-room` 在 needs）
 *
 * 四件都是既有设备、既有料：没有新增一台机器，也没有新增一种材料。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 二、四线法为什么只要 4 个 pad
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 四线法把“电流”与“电压”分成两对：
 *
 *   外侧两个 pad 进电流 I，内侧两个 pad 取电压 V；R = V / I。
 *   探针与引线的电阻在电流回路里，不在电压回路里，所以被消掉。
 *
 * 4 个 pad 正好是 2 + 2。它只能测**一条线**的电阻；要测接触电阻（TLM）至少还要
 * 两组不同间距的 pad，要测 CMOS 还要栅、源、漏、体与隔离 —— 这 4 个 pad 一个都不够。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 三、质量账
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   进：
 *     刻蚀片 1 片（φ100 × 0.7 mm，78.5 cm² × 0.07 cm × 2.33 g/cm³ = 12.8 g）
 *     铝 0.01 kg（10 g，一次装料；见下）
 *     光刻胶 0.001 kg（1 g；0.8–1.0 µm × 78.5 cm² × 1.2 g/cm³ = 7.5–9.4 mg，
 *       旋涂甩掉 95 % ⇒ 0.15–0.19 g，取 1 g 留过滤、边珠与返工）
 *     水 1 kg（显影、冲洗、甩干；没有回收）
 *   出：
 *     测试结构 1 片 = 12.8 g 硅片 + 4 个 pad 的铝 0.05–0.11 µg
 *
 *   铝的账要单独说：4 个 pad 只占 4 × 100 × 100 µm² = 4e-4 cm²，1 µm 厚只有
 *   0.11 µg；整片 78.5 cm² 全面蒸 0.5–1 µm 是 10.6–21.2 mg，腔壁与挡板再吃 3–5 倍
 *   ⇒ 32–106 mg。10 g 是**蒸发舟的一次装料下限**（钨丝篮装铝丝、通电到 1200 °C），
 *   不是这 4 个 pad 的净耗；剩下的 9.9 g 留在舟里，下一批接着用。模型没有“装料”
 *   这个字段，所以它按 `uses` 记 10 g，差额写在 `unbalanced_zh` 里。
 *
 *   ⚠️ 水 1 kg 也是“一次配液/冲洗”的量，不是化学计量：显影 1 片只用几十 mL，
 *   其余是冲洗与甩干。本层没有水回收，按 1 kg 一次性记。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 四、R8 —— 四处必须说清的缺口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   ① **这是测试结构，不是器件。** 4 个 pad 只够四线法测一条线：
 *      2 个进电流、2 个取电压。它没有栅、没有源漏、没有掺杂、没有隔离，
 *      不能做 CMOS，也不能做任何三端器件。它读出的是一个**总串联电阻**，
 *      不是器件参数。
 *
 *   ② **lineWidth 80–200 nm 是 193 nm 接触曝光的 CAR 线。**
 *      193 nm ArF 接触曝光的极限约 0.1–0.15 µm（litho-m3.ts），CAR 的酸扩散
 *      6–11 nm 再压一道 ⇒ 80–200 nm 是这条组合能给到的窗口。16–32 nm 仍要
 *      EUV 投影（13.5 nm、NA 0.33），本层没有；本文件不改善光刻，只继承 80–200。
 *
 *   ③ **铝 pad 与 CAR 线的接触电阻未单独标定。**
 *      四线法消掉的是探针/引线电阻，消不掉两个内侧 pad 的 Al/CAR 接触电阻：
 *      R_read = R_line + 2·R_contact。本层没有 TLM（要更多 pad、更多间距）、
 *      也没有独立的接触电阻量具，所以 `lineResistance` 里含接触电阻，
 *      按经验记 **±20–50 %**；接触电阻占大头时，线电阻本身分不出来。
 *
 *   ④ **它只把“刻蚀片没人吃”变成“有电学读数”，不解决器件集成。**
 *      本文件让 `mat/car-stripped-wafer` 有了消费者、让 80–200 nm 的线第一次
 *      进了电学回路；器件集成要栅氧、掺杂、结、隔离、多层互连与第二块版。
 *      **隔离这一段已另开一条线**：`car-sti.ts`（槽）→ `sti.ts`（衬里/填充/CMP）
 *      → `sti-integration.ts`（STI 片 → 干氧 → 现有 poly/LDD/device-wafer）。
 *      仍缺：阱/CMOS、第二块版、栅长 200–400 nm 这一档（CAR 只定义隔离）。
 *      按 R7，这是一格“接上了”，不是“做完了”。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 五、已知缺口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ① 没有独立的线宽/接触电阻标定：`lineWidth` 从 car-strip.ts 继承，
 *     本文件不再量；`lineResistance` 是四线法读数，含接触电阻 ±20–50 %（R8③）。
 *  ② 没有 TLM 结构：4 个 pad 只能测一条线，不能把接触电阻与线电阻分开。
 *  ③ 没有在线掺杂/方阻：CAR 线是刻蚀出来的硅线，本文件不改变它的掺杂；
 *     `lineResistance` 是“这一片、这一批”的相对读数，不是材料电阻率。
 *  ④ 合金 400–450 °C 是**固相烧结/互扩散**，不是 Al–Si 共晶熔融（共晶 577 °C）；
 *     30 min 的互扩散长度只有亚微米量级，接触电阻不会因合金化而消失。
 *  ⑤ 没有 pad 对准精度的在线量具：接触式曝光 + 人眼对准，pad 与线的套刻
 *     误差没有数；本文件只能按“4 个 pad 都落在线上”判合格。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const CAR_DEVICE_ITEMS: readonly Item[] = [
  /**
   * CAR 线电阻测试结构。**一片刻蚀片 + 4 个铝 pad + 一条线。**
   *
   * 四个规格：
   *   lineWidth       80–200 nm（从 car-strip.ts 继承；193 nm 接触曝光的 CAR 线）
   *   lineResistance  0.1–100 Ω（四线法读数；含两个 Al/CAR 接触电阻，±20–50 %）
   *   pads            4 个（2 个进电流 + 2 个取电压，正好一条线）
   *   pitch           100–200 µm（100×100 µm 的 pad 中心距；再密就并线，再疏引线电阻上来）
   *
   * ⚠️ 它不是器件：没有栅、没有源漏、没有掺杂、没有隔离。见文件头 R8①。
   */
  {
    id: 'mat/car-line-test-structure',
    name: 'CAR 线电阻测试结构',
    unit: '片',
    category: 'part',
    props: [
      { param: 'lineWidth', kind: 'range', min: 80, max: 200, unit: 'nm', dir: 'atMost' },
      { param: 'lineResistance', kind: 'range', min: 0.1, max: 100, unit: 'Ω' },
      { param: 'pads', kind: 'range', min: 4, max: 4, unit: '个' },
      { param: 'pitch', kind: 'range', min: 100, max: 200, unit: 'µm' },
    ],
  },
];

export const CAR_DEVICE_ROUTES: readonly Route[] = [
  {
    /**
     * **刻蚀片 → 4 个探针 pad → 蒸铝/剥离 → 合金 → 四线法。**
     *
     *   刻蚀片 1 + 铝 0.01 + 光刻胶 0.001 + 水 1 → 测试结构 1
     *
     * 四道工序：
     *   ① pad 光刻  0.8–1.0 µm 胶、4 个 100×100 µm、pitch 100–200 µm；
     *                版 `std/photomask-general` 在 needs
     *   ② 蒸铝      0.5–1 µm、1e-3–1e-2 Pa；lift-off 只留 pad
     *   ③ 合金      400–450 °C / 30 min（固相烧结，不是共晶）
     *   ④ 四线法    0.1–100 Ω；19–21 °C
     *
     * 为什么 rate 是 3 h：光刻 0.5 h + 蒸铝/剥离 1 h + 合金 1 h + 测量 0.5 h。
     */
    id: 'make/car-line-test-structure',
    name: 'CAR 线电阻测试结构制造',
    produces: [
      {
        item: 'mat/car-line-test-structure',
        qty: q(1),
        gives: [
          { param: 'lineWidth', kind: 'range', min: 80, max: 200 },
          { param: 'lineResistance', kind: 'range', min: 0.1, max: 100 },
          { param: 'pads', kind: 'range', min: 4, max: 4 },
          { param: 'pitch', kind: 'range', min: 100, max: 200 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/car-stripped-wafer', qty: q(1) }] },
      // 10 g：蒸发舟的一次装料下限；净耗见 unbalanced_zh
      { anyOf: [{ item: 'mat/aluminium', qty: q(1, 100) }] },
      // 1 g：0.8–1.0 µm 膜只需 7.5–9.4 mg，旋涂甩掉 95 % ⇒ 0.15–0.19 g，取 1 g 留返工
      { anyOf: [{ item: 'mat/photoresist', qty: q(1, 1000) }] },
      // 1 kg：显影 + 冲洗 + 甩干，按一次配液记
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: [
      // 接触曝光的版；minFeature 0.1–10 µm，pad 的 100 µm 远在它的能力内
      'std/photomask-general',
      // 四线法的 19–21 °C：probe-station 自己不 holds 温度，恒温间在 needs 里
      'plant/metrology-room',
    ],
    rate: { hours: q(3) },
    steps: [
      {
        note_zh:
          '① 探针盘光刻：胶 0.8–1.0 µm、4 个 100×100 µm pad、pitch 100–200 µm；接触曝光用 `std/photomask-general`（版在 needs）。**这一步只定义 pad，不定义 80–200 nm 的线** —— 线是 car-strip.ts 刻出来的；0.8–1.0 µm 的胶对 80–200 nm 的线也没有分辨力，所以不能把这一步说成“光刻出线”',
        performedBy: 'plant/mask-aligner',
      },
      {
        note_zh:
          '② 蒸铝 0.5–1 µm + 剥离：`plant/evaporator` 的 1e-3–1e-2 Pa；铝在钨舟里 1200 °C 蒸发。lift-off 只留 4 个 pad 的铝（胶 0.8–1.0 µm 让 pad 边缘断开）。**铝不填线**：线仍是 CAR 刻出的硅线，pad 只在线端/抽头处接触。整片蒸 0.5–1 µm 的铝是 10.6–21.2 mg，腔壁再吃 3–5 倍 ⇒ 32–106 mg；10 g 是装料，不是净耗',
        performedBy: 'plant/evaporator',
        under: [{ param: 'pressure', min: 0.001, max: 0.01 }],
      },
      {
        note_zh:
          '③ 合金 400–450 °C / 30 min：Al–Si 共晶 577 °C，400–450 是**固相烧结/互扩散**，不是熔融；它把 Al pad 与 CAR 线的接触从“压接”变成“合金化接触”，接触电阻降低但不消失。温度上限 450 留给 Al 的熔点 660 °C 与共晶 577 °C 之间的余量；下限 400 是互扩散开始明显的温度。30 min 的扩散长度亚微米，别指望它把整条线变成 Al',
        performedBy: 'plant/resistance-furnace',
        under: [{ param: 'temperature', min: 400, max: 450 }],
      },
      {
        note_zh:
          '④ 四线法：外侧 2 个 pad 进 0.1–10 mA，内侧 2 个 pad 读电压；R = V/I，窗口 0.1–100 Ω。`plant/probe-station` 的电压分辨率 ≤10 µV：0.1 Ω × 10 mA = 1 mV（100 个分辨单位），100 Ω × 0.1 mA = 10 mV（1 000 个分辨单位）—— 两头都落在 0–30 mV 的毫伏表里。19–21 °C 由 `plant/metrology-room` 维持（在 needs）。**读的是总串联电阻：线 + 两个内侧接触**，接触电阻没有单独标定（R8③）',
        performedBy: 'plant/probe-station',
        under: [{ param: 'temperature', min: 19, max: 21 }],
      },
    ],
    unbalanced_zh:
      '刻蚀片 1 + 铝 0.01 + 光刻胶 0.001 + 水 1 → 测试结构 1。产物按片计（12.8 g 硅 + 4 个 pad 的铝 0.05–0.11 µg），进料里的 10 g 铝是蒸发舟装料、1 g 胶是旋涂装料、1 kg 水是配液/冲洗 —— 三者都没有回收路线，净耗远小于投料（铝蒸到片上的 10.6–21.2 mg 里 99.999 % 随胶剥离，加腔壁共 32–106 mg；胶净耗 0.15–0.19 g），差额留在舟/甩胶/废水里。这是装料与清洗的固有损耗，不是账不平',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...CAR_DEVICE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...CAR_DEVICE_ROUTES];
