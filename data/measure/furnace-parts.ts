/**
 * 熔炼炉六件零件的测量路线 —— 把「卷焊/捣实/绕制/装配完到底差多少」变成可判的数。
 *
 * 这六件在 `data/machine/process.ts` 里刚补了最小验收 props；本文件给它们
 * 各自的测量方法与收窄窗口。量具全部是既有的：
 *
 *   炉壳壁厚      std/micrometer-0-25（0–25 mm、0.001 mm）
 *   炉衬厚度      std/calibrated-scale-100（0–1000 mm）
 *   线圈电感/电阻 plant/lcr-meter-lf（1 µH–100 mH、0.001 Ω–10 MΩ）
 *   水套气密      plant/air-compressor + plant/hot-phosphoric-bath/gauge（50–300 kPa）
 *   倾转回差      std/autocollimator-precision（0.005–0.02″）
 *   电源输出      std/dvm-general + plant/scope-1ghz + std/divider-100to1-precision
 *
 * 窗口都是**能力域/验收带**，不是某一次实测读数；每条注释给 U(k=2) 与依据。
 * 测不了的（炉衬打结层的密度、线圈匝间绝缘、电源满载长时温升）不写窗口，
 * 留在注释与台账里，不冒充。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const FURNACE_PARTS_MEASURE_ROUTES: readonly Route[] = [
  {
    /**
     * **炉壳壁厚：千分尺沿筒体 10 点。**
     *
     * 炉壳是 3–12 mm 钢板卷焊；壁厚决定承压/承力矩与焊接工艺。测点选在
     * 两端开口、焊缝两侧与筒体中段，避开焊缝余高。19–21 °C 等温 4 h
     * （钢 11.5 µm/(m·K)，10 mm 差 1 K 只有 0.1 µm，等温主要是让千分尺
     * 与工件同温）。U(k=2) ≈ 0.02 mm：千分尺 0.01 + 重复 0.005 + 温度 0.005。
     */
    id: 'measure/furnace-shell-wall',
    name: '熔炼炉炉壳测量',
    produces: [{
      item: 'plant/melting-furnace/shell',
      qty: q(1),
      gives: [{ param: 'wallThickness', kind: 'range', min: 4, max: 10 }],
    }],
    uses: [{ anyOf: [{ item: 'plant/melting-furnace/shell', qty: q(1) }] }],
    needs: ['std/micrometer-0-25', 'plant/metrology-room'],
    rate: { hours: q(2) },
    steps: [
      { note_zh: '等温：炉壳与千分尺在 19–21 °C 放 4 h', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '测 10 点：两端开口、焊缝两侧、筒体中段；每点 3 次取中位', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '记 10 点壁厚与极差；壁厚 4–10 mm，U(k=2) ≈ 0.02 mm', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '炉壳 1 件（非破坏）→ 壁厚记录 1 份；千分尺是量具不是物料。',
  },

  {
    /**
     * **炉衬厚度：高度尺/校准尺沿炉膛 8 点。**
     *
     * 打结层 80–300 mm；测点在炉底、炉壁四向、炉喉，量的是捣实后的实际厚度
     * （不是图纸值）。用 `std/calibrated-scale-100` 的 0–1000 mm 档，配合
     * 炉口基准面；U(k=2) ≈ 3 mm：尺 0.5 + 基准面 1 + 捣实面不平 2。
     */
    id: 'measure/furnace-lining-thickness',
    name: '熔炼炉炉衬测量',
    produces: [{
      item: 'plant/melting-furnace/lining',
      qty: q(1),
      gives: [{ param: 'thickness', kind: 'range', min: 100, max: 250 }],
    }],
    uses: [{ anyOf: [{ item: 'plant/melting-furnace/lining', qty: q(1) }] }],
    needs: ['std/calibrated-scale-100', 'plant/metrology-room', 'plant/thickness-standard'],
    rate: { hours: q(3) },
    steps: [
      { note_zh: '以炉口法兰面为基准，校准尺 0–1000 mm 档量炉底与四壁 8 点', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '每点 3 次；捣实面不平按最深点记；厚度 100–250 mm，U(k=2) ≈ 3 mm', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '炉衬 1 件（非破坏）→ 厚度记录 1 份；尺是量具不是物料。',
  },

  {
    /**
     * **线圈电感/直流电阻：LCR 表 1 kHz、四线。**
     *
     * 感应圈是紫铜管绕制；电感决定谐振频率，电阻决定铜损。1 kHz 接近
     * 中频炉的工作频段（几百 Hz–几 kHz），四线开尔文夹消引线电阻。
     * U(k=2)：电感 1 %、电阻 0.5 mΩ（LCR 表 0.3–1.2 % 档 + 重复）。
     */
    id: 'measure/furnace-coil-electrical',
    name: '熔炼炉感应线圈测量',
    produces: [{
      item: 'plant/melting-furnace/coil',
      qty: q(1),
      gives: [
        { param: 'inductance', kind: 'range', min: 1, max: 40 },
        { param: 'resistance', kind: 'range', min: 0.05, max: 0.8 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'plant/melting-furnace/coil', qty: q(1) }] }],
    needs: ['plant/lcr-meter-lf', 'plant/metrology-room'],
    rate: { hours: q(2) },
    steps: [
      { note_zh: '四线接线圈两端，1 kHz、1 V 档；读电感与直流电阻各 10 次取中位', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '电感 1–40 mH（U 1 %）、电阻 0.05–0.8 Ω（U 0.5 mΩ）；记表号与温度', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '线圈 1 件（非破坏）→ 电参数记录 1 份；LCR 表是量具不是物料。',
  },

  {
    /**
     * **水套气密：0.2–0.25 MPa 保压 30 min 的压降法。**
     *
     * 水套只承压不导电，漏率上限 1e-3 Pa·m³/s。用空气压缩机升压，
     * 50–300 kPa 的 1.6 级表读压降；先肥皂水找大漏，再记 30 min 压降。
     * U(k=2) ≈ 20 %（表 1.6 级 + 温度漂移 + 30 min 读数）。
     */
    id: 'measure/furnace-coil-cooling-leak',
    name: '熔炼炉感应圈水冷套测量',
    produces: [{
      item: 'plant/melting-furnace/coil-cooling',
      qty: q(1),
      gives: [{ param: 'leakRate', kind: 'range', min: 0, max: 0.0008 }],
    }],
    uses: [{ anyOf: [{ item: 'plant/melting-furnace/coil-cooling', qty: q(1) }] }],
    needs: ['plant/air-compressor', 'plant/hot-phosphoric-bath/gauge', 'plant/metrology-room', 'plant/leak-rate-standard'],
    rate: { hours: q(2) },
    steps: [
      { note_zh: '封口、接压力表与气源；升到 0.2–0.25 MPa，肥皂水查焊缝与接头', performedBy: 'plant/robot' },
      { note_zh: '保压 30 min，记起止压力与温度；压降换算漏率 ≤1e-3 Pa·m³/s，U ≈ 20 %', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '水套 1 件（非破坏）→ 气密记录 1 份；空气与肥皂水不计质量。',
  },

  {
    /**
     * **倾转回差：自准直仪 + 输出轴反射镜。**
     *
     * 倾转减速机回差 0–10′。把反射镜夹在输出轴上，锁住输入，沿正反方向
     * 各加同一小扭矩，自准直仪读输出角差；不依赖分度台的承重（倾转机构
     * 可能超过 50 kg 台面载荷）。U(k=2) ≈ 1′：自准直 0.02″ + 镜面装夹 0.5′
     * + 扭矩重复 0.5′。
     */
    id: 'measure/furnace-tilt-backlash',
    name: '熔炼炉倾转机构测量',
    produces: [{
      item: 'plant/melting-furnace/tilt-drive',
      qty: q(1),
      gives: [{ param: 'backlash', kind: 'range', min: 3, max: 8 }],
    }],
    uses: [{ anyOf: [{ item: 'plant/melting-furnace/tilt-drive', qty: q(1) }] }],
    needs: ['std/autocollimator-precision', 'plant/metrology-room'],
    rate: { hours: q(3) },
    steps: [
      { note_zh: '输出轴夹反射镜，自准直仪对准；锁输入，正反各加 20 N·m 小扭矩', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '读正反输出角差 5 次取中位；回差 3–8′，U(k=2) ≈ 1′', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '倾转机构 1 件（非破坏）→ 回差记录 1 份；自准直仪是量具不是物料。',
  },

  {
    /**
     * **中频电源输出：数字表 + 示波器 + 100:1 分压。**
     *
     * 输出电压 10–80 V、纹波 ≤5%。空载与 50 % 阻性负载各读 10 次电压；
     * 示波器 AC 耦合经 100:1 分压读纹波峰峰值，除以直流分量。U(k=2)：
     * 电压 1 %、纹波 0.5 个百分点（表 0.5 级 + 分压比 1 % + 示波器 2 %）。
     */
    id: 'measure/furnace-psu-output',
    name: '熔炼炉中频电源测量',
    produces: [{
      item: 'plant/melting-furnace/psu',
      qty: q(1),
      gives: [
        { param: 'outputVoltage', kind: 'range', min: 20, max: 70 },
        { param: 'ripple', kind: 'range', min: 1, max: 4 },
      ],
    }],
    uses: [{ anyOf: [{ item: 'plant/melting-furnace/psu', qty: q(1) }] }],
    needs: ['std/dvm-general', 'plant/scope-1ghz', 'std/divider-100to1-precision', 'plant/metrology-room'],
    rate: { hours: q(3) },
    steps: [
      { note_zh: '空载与 50 % 阻性负载各读 10 次输出电压（数字表，经 100:1 分压的高压档另记）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '示波器 AC 耦合读纹波峰峰值，除以直流分量；纹波 1–4 %，U 0.5 个百分点', performedBy: 'plant/robot' },
      { note_zh: '记表号、分压比、负载电阻与温度；不写满载长时温升（没有负载箱）', performedBy: 'plant/robot' },
    ],
    unbalanced_zh: '电源 1 台（非破坏）→ 输出记录 1 份；电与负载电阻不计质量。',
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [];
export const DATA_ROUTES: readonly Route[] = [...FURNACE_PARTS_MEASURE_ROUTES];
