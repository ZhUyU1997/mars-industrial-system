/**
 * CAR 的第二条消费者：把刻蚀片当 STI 隔离槽用。
 *
 * `mat/car-stripped-wafer` 现在只有 `make/car-line-test-structure` 一个消费者。
 * 本文件给它第二条：同一片刻蚀片，几何对得上 STI 的那一角（100–200 nm 宽、
 * 250–300 nm 深、≥85° 侧壁）先做成 STI 槽片，再进 data/machine/sti.ts 的
 * 衬里 → 填充 → CMP。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 边界：只到槽，不是器件；P2 仍未做
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * STI 只解决“器件之间怎么隔开”。阱、栅氧入口、源漏收口（P2）不在本文件，
 * 也不在 `data/machine/sti.ts`；这一片出了 CMP 仍然是**隔离片**，不是晶体管。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么只收 ≥85°、100–200 nm、250–300 nm
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 槽底宽 = w − 2d/tanθ。代入 car-strip.ts 的窗口（w 80–200、d 100–300、θ 70–85°）：
 *
 *   80 nm / 300 nm / 85°：80 − 2×300/tan85° = 80 − 52.5 = **27.5 nm**（窄，但还开）
 *   80 nm / 300 nm / 80°：80 − 105.8 = **−25.8 nm**（槽底闭合）
 *   80 nm / 300 nm / 70°：80 − 218.4 = **−138.4 nm**（早就闭合）
 *   100 nm / 300 nm / 85°：100 − 52.5 = **47.5 nm**（可填）
 *   100 nm / 300 nm / 80°：100 − 105.8 = **−5.8 nm**（闭合）
 *   200 nm / 300 nm / 85°：200 − 52.5 = **147.5 nm**（可填）
 *
 * ⇒ 80 nm 端在 300 nm 深时，即使 85° 也只剩 27.5 nm，TEOS 填充必出 seam；
 *   所以本路线**不收 80 nm 端**，只收 100–200 nm 宽。侧壁只收 ≥85°：
 *   80–85° 的片子不是“差一点”，是槽底正在闭合（100 nm/300 nm/80° 已是负值）。
 *
 * 深度只收 250–300 nm：100–200 nm 端比 100 keV P 的源漏结深 152 nm
 * （implant.ts:1587–1590）还浅，隔离不住；250–300 nm 才盖得住。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 预清洗：49 % HF 1–2 s，HF 对 Si 是停止层
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * HF 只去 1–2 nm 原生氧化层/残渣，不咬硅（gate-stack.ts:80–83 的同一句）。
 * 1–2 nm × 78.5 cm² × 2.27 g/cm³ = **0.018–0.036 mg SiO₂**；0.1 g 49 % HF
 * 是 1 000 倍过量，冲走即可。
 *
 * ⚠️ **没有残渣量具**：HF 后 0.5–2 nm 的残渣是估算；碳质残渣可能留 1–2 nm。
 * CD-SEM 只能看槽宽/槽底是否闭合，判不了残渣成分。这是本文件的缺口①。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const CAR_STI_ITEMS: readonly Item[] = [
  /**
   * STI 槽片（只有槽，没有填充）。**不是器件，也不是成品隔离。**
   *
   * 四个规格：
   *   lineWidth     100–200 nm（从 car-stripped 的 80–200 里筛；80 nm 端不收）
   *   etchDepth     250–300 nm（从 100–300 里筛；100–200 nm 端比结深 152 nm 浅）
   *   sidewallAngle 85–90°（只收 ≥85°；80–85° 的槽底正在闭合）
   *   residue       0.5–2 nm（HF 后估算；没有量具）
   */
  {
    id: 'mat/car-sti-trench-wafer',
    name: 'STI Trench Wafer', name_zh: 'STI 槽片',
    unit: '片',
    category: 'part',
    props: [
      { param: 'lineWidth', kind: 'range', min: 100, max: 200, unit: 'nm', dir: 'atMost' },
      { param: 'etchDepth', kind: 'range', min: 250, max: 300, unit: 'nm' },
      { param: 'sidewallAngle', kind: 'range', min: 85, max: 90, unit: '°', dir: 'atLeast' },
      { param: 'residue', kind: 'range', min: 0, max: 2, unit: 'nm', dir: 'atMost' },
    ],
  },
];

export const CAR_STI_ROUTES: readonly Route[] = [
  {
    /**
     * **CAR 刻蚀片 → HF 预清洗 → 甩干 → CD-SEM 筛 → STI 槽片。**
     *
     *   刻蚀片 1 + HF 0.1 g + 水 1 kg → STI 槽片 1
     *
     * 这不是“把 70–85° 变成 85–90°”：本路线**不改变侧壁角**，只筛掉 <85° 的片。
     * `make/car-sti-trench-hbr`（`data/machine/st-i-etcher.ts`）
     * 交 **86–89° / 0–1 nm** 的 `mat/car-stripped-wafer`；本路线仍只筛，
     * 两条 kept（≥85°、≤2 nm）由那个高侧壁/低残渣生产者覆盖。
     * `need` 写 ≥85° 后，报告会报 `prop_unfilled`（car-strip 的 gives 是 70–85），
     * 那是旧生产者的真缺口，不是笔误 —— CAR 的侧壁/残渣窗口比 STI 宽。
     *
     * 为什么 1 h 够：HF 1–2 s、水冲 30 s、甩干 30 s、CD-SEM 10–20 min，加装片/传片/记录。
     */
    id: 'make/car-sti-trench',
    name: 'STI Trench Wafer Manufacturing', name_zh: 'STI 槽片制造',
    produces: [
      {
        item: 'mat/car-sti-trench-wafer',
        qty: q(1),
        gives: [
          { param: 'lineWidth', kind: 'range', min: 100, max: 200 },
          { param: 'etchDepth', kind: 'range', min: 250, max: 300 },
          { param: 'sidewallAngle', kind: 'range', min: 85, max: 90 },
          { param: 'residue', kind: 'range', min: 0.5, max: 2 },
        ],
      },
    ],
    uses: [
      {
        anyOf: [
          {
            item: 'mat/car-stripped-wafer',
            qty: q(1),
            // 这是筛选窗口，不是工艺窗口：CAR 的 gives 不保证 ≥85° / ≤2 nm。
            // 低于 85° 的片在这里被判废，不靠“再刻一次”救回来。
            need: [
              { param: 'lineWidth', kind: 'range', min: 100, max: 200 },
              { param: 'etchDepth', kind: 'range', min: 250, max: 300 },
              { param: 'sidewallAngle', kind: 'range', min: 85, dir: 'atLeast' },
              { param: 'residue', kind: 'range', max: 2, dir: 'atMost' },
            ],
            // 放宽只是隔离变差/填充更难，槽还在 ⇒ functional-kept。
            onRelax: 'functional-kept',
          },
        ],
      },
      // 49 % HF：0.1 g，1–2 s；0.1 g 是 1 000 倍过量，冲走
      { anyOf: [{ item: 'mat/hf', qty: q(1, 10000) }] },
      // 冲洗：1 kg（实际几十 mL，取 1 kg 留冲洗余量）
      { anyOf: [{ item: 'mat/water', qty: q(1) }] },
    ],
    needs: ['plant/clean-room'],
    rate: { hours: q(1) },
    steps: [
      {
        note_zh:
          '① HF 预清洗：49 % HF 1–2 s + 水冲；HF 对 Si 是停止层，只去 1–2 nm 原生氧化层/残渣（0.018–0.036 mg SiO₂），不咬硅槽。碳质残渣可能留 1–2 nm，本层没有残渣量具（缺口①）',
        performedBy: 'plant/wet-bench',
        under: [
          { param: 'temperature', min: 20, max: 40 },
          { param: 'pressure', min: 100, max: 500 },
        ],
      },
      {
        note_zh:
          '② 甩干：氮气吹 + 100 °C / 30 s；水痕就是缺陷。这一步没有温压条件（机器人拿片、吹干），所以不写 under',
        performedBy: 'plant/robot',
      },
      {
        note_zh:
          '③ CD-SEM 筛：读槽宽与槽底是否闭合；只放 100–200 nm、250–300 nm、≥85° 的片。CD-SEM 的 cdRepeatability 0.3 nm、tiltRange ±60°（cd-sem.ts:1017–1021）够看“闭没闭”，不够把 85° 与 86° 分开 —— 所以判据是“槽底还开”，不是精确角度',
        performedBy: 'plant/cd-sem',
        under: [{ param: 'pressure', min: 1e-6, max: 1e-3 }],
      },
    ],
    unbalanced_zh:
      '刻蚀片 1 + HF 0.1 g + 水 1 kg → STI 槽片 1。HF 只去 1–2 nm 原生氧化层/残渣：78.5 cm² × 1–2 nm × 2.27 g/cm³ = 0.018–0.036 mg SiO₂；0.1 g 49 % HF 是 1 000 倍过量，随冲洗水走。硅槽本身不掉（HF 对 Si 停止），所以产物仍是 12.8 g 硅片 + 0.5–2 nm 残渣；产物按片计，差额是洗液。不是账不平，是清洗的固有损耗',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...CAR_STI_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...CAR_STI_ROUTES];
