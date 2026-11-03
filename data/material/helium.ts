/**
 * 氦：只作为闭式制冷机的一次性充装输入，不建本地路线。
 *
 * 火星大气 He 2.5–7 ppm；1 kg 要 1.1×10⁶ m³ 空气，分离要 20 K 精馏，
 * 而 20 K 冷源本身就是制冷机 —— 循环依赖。所以按 R10 一次性输入：
 * 建条目、列入 ONE_TIME，GM 0.8–1.5 kg/台、JT 0.1–0.3 kg/台，
 * 分别写在 `make/gm-cryocooler`、`make/jt-cooler` 的 `uses` 上。
 *
 * 以前不建条目，只把充装量写在 `heliumCharge` 的 props 上；结果是缺料只
 * 存在于注释和文档里，audit 看不见。现在条目存在，缺本地路线这件事由
 * ONE_TIME 明确记录，不再藏在 props 里。
 */
import type { Item, Route } from '../../src/index.ts';

export const HELIUM_ITEMS: readonly Item[] = [
  {
    id: 'mat/helium',
    name: 'Helium', name_zh: '氦',
    unit: 'kg',
    category: 'material',
    // 不声明 purity：没有本地交付，也没有写成 need；先只登记材料本身。
  },
];

export const HELIUM_ROUTES: readonly Route[] = [];

export const DATA_ITEMS: readonly Item[] = [...HELIUM_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...HELIUM_ROUTES];
