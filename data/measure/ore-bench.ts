/**
 * 选矿厂加压舱的舱压 commissioning。
 *
 * 破碎、球磨与水选都在选矿厂的加压舱里做：火星大气 0.6 kPa，水在那一档
 * 会沸，所以舱内必须维持在 1 atm 以上。舱压 100–300 kPa 是设计窗口，
 * 本路线用一只 1.6 级波登管表把它读成 140–180 kPa：这是实测窗口，比
 * 设计窗口窄，带表本身的 ±3.2 kPa 不确定度与 30 min 保压压降。
 *
 * 表是借的：`plant/hot-phosphoric-bath/gauge` 量程 50–300 kPa、1.6 级，
 * 从热磷酸槽上拆下来接舱体取样口，读完装回。本层没有第二只压力表。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const ORE_BENCH_MEASURE_ITEMS: readonly Item[] = [
  /**
   * 选矿厂加压舱舱压记录。**一份记录对应一次保压。**
   *
   *   cabinPressure  140–180 kPa  实测工作窗口（设计窗口 100–300）
   *   uncertainty    3–5 kPa      1.6 级表满量程 ±1.6 %（300 kPa 档 ±4.8）
   *   holdTime       20–40 min    保压观察时长
   *   method         bourdon-gauge
   *
   * ⚠️ 这是舱压，不是浮选槽液柱压力；槽内压力由舱压与液深共同决定，
   *    本记录不把它折成槽压。
   */
  {
    id: 'mat/ore-bench-pressure-record',
    name: '选矿厂加压舱舱压记录',
    unit: '份',
    category: 'part',
    props: [
      { param: 'cabinPressure', kind: 'range', min: 140, max: 180, unit: 'kPa' },
      // 生产 give 同名别名：舱压（ore-beneficiary 用 pressure）。
      { param: 'pressure', kind: 'range', min: 140, max: 180, unit: 'kPa' },
      { param: 'uncertainty', kind: 'range', min: 3, max: 5, unit: 'kPa' },
      { param: 'holdTime', kind: 'range', min: 20, max: 40, unit: 'min' },
      { param: 'method', kind: 'enum', values: ['bourdon-gauge'] },
    ],
  },
];

export const ORE_BENCH_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **舱压：接表 → 升压到工作点 → 读 140–180 kPa → 保压 30 min。**
     *
     * 表接在舱体取样口，读完拆下装回热磷酸槽；读数含 1.6 级表的
     * ±3.2 kPa（满量程 300 kPa 档）。保压压降 ≤5 kPa 才算舱体密封。
     */
    id: 'measure/ore-bench-cabin-pressure',
    name: '选矿厂加压舱舱压测量',
    produces: [
      {
        item: 'mat/ore-bench-pressure-record',
        qty: q(1),
        gives: [
          { param: 'cabinPressure', kind: 'range', min: 140, max: 180 },
          { param: 'pressure', kind: 'range', min: 140, max: 180 },
          { param: 'uncertainty', kind: 'range', min: 3, max: 5 },
          { param: 'holdTime', kind: 'range', min: 20, max: 40 },
          { param: 'method', kind: 'enum', oneOf: ['bourdon-gauge'] },
        ],
      },
    ],
    uses: [],
    needs: [
      // 被校机器：选矿厂浮选槽的加压舱；窗口落在机器 100–300 kPa 内。
      { item: 'plant/ore-beneficiary', qty: q(1), need: [{ param: 'pressure', kind: 'range', min: 140, max: 180 }], onRelax: 'functional-kept' },
      'plant/hot-phosphoric-bath/gauge',
    ],
    rate: { hours: q(3) },
    steps: [
      {
        note_zh: '把 1.6 级波登管表（50–300 kPa）接到舱体取样口，皂液查接头',
        performedBy: 'plant/ore-beneficiary',
      },
      {
        note_zh: '升压到工作点，读舱压 140–180 kPa；表满量程 ±1.6 % 即 ±4.8 kPa',
        performedBy: 'plant/ore-beneficiary',
      },
      {
        note_zh: '保压 30 min，压降 ≤5 kPa 记合格；拆表、装回热磷酸槽',
        performedBy: 'plant/robot',
      },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...ORE_BENCH_MEASURE_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...ORE_BENCH_MEASURE_ROUTES];
