/**
 * 程序升温控制器 —— 让炉子按"曲线"走，而不是按"设定值"走。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * PID 缺一半
 * ═══════════════════════════════════════════════════════════════════════
 *
 * PID 会"保持一个温度"。而热处理要的常常不是"保持"，是**按曲线变**：
 *
 *   淬火前预热   以 5 °C/min 升到 830，保温 30 分钟
 *   球化退火     以 10 °C/min 升到 780，保温 4 小时，再以 20 °C/min 冷
 *   氮化         升到 540，保温 8 小时（这一段不能快）
 *
 * 所以需要的是"**设定值本身随时间走**" —— 这叫程序升温，英文 ramp/soak。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 硬件：PROM + 计数器 + DAC（梯形电阻网络）
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   时基     计数器芯片对石英时钟分频 → 每 6 秒一个脉冲（0.1 分钟）
 *   程序     PROM：每个地址存一步的"升温速率 + 目标温度 + 保温时间"
 *   设定值   DAC（梯形电阻网络）把数字变成电压 → 送给 PID 的设定端
 *   切换     PROM 里的下一段由"到温"信号（比较器）触发
 *
 * DAC 用**梯形电阻网络**而不是薄膜电阻：梯形网络只要"同一批电阻彼此比值对"，
 * 不要求绝对值准 —— 这个要求本层做得到（同一卷镍铬丝绕出来的一批电阻，
 * 比值一致性好）。**这是"匹配"在模拟电路里的第二次应用**（第一次是运放的差分对）。
 *
 * ⚠️ 一处降级：梯形网络没有修调，所以 DAC 的线性度只有 1% 级 ——
 * 对"每分钟升几度"够，对"精确到 0.1 度"不够。
 *
 * ⚠️ 另一处：PROM 是一次性的。**改曲线就要换芯片** ——
 * 所以每换一个热处理工艺，都要烧一片新的。这不是缺点，是"工艺卡片的实体化"。
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const RAMP_ITEMS: readonly Item[] = [
  {
    id: 'iface/ramp-controller',
    name: 'Ramp Controller Interface', name_zh: '斜率控制器接口',
    interface: true,
  },
  {
    /**
     * 机械式凸轮程序升温控制器，本层基线设计。
     *
     * 整机由铸铁底座与立柱、2 kg 重锤、8 段凸轮盘、45/90 齿棘轮、
     * 差动杠杆、刚玉感温棒、石英参考支架、四对触点与三层超温保护等件装配。
     * 零件与零件路线见 `data/machine/mech-ramp-controller.ts`。
     */
    id: 'std/ramp-controller-general',
    name: 'Mechanical Cam-Programmed Temperature Controller', name_zh: '机械式凸轮程序升温控制器',
    extends: 'iface/ramp-controller',
    unit: '台',
    category: 'part',
    composedOf: [
      { item: 'std/ramp-controller-general/base', qty: q(1) },
      { item: 'std/ramp-controller-general/frame-set', qty: q(1) },
      { item: 'std/ramp-controller-general/weight', qty: q(1) },
      { item: 'std/ramp-controller-general/lever-seat', qty: q(1) },
      { item: 'std/ramp-controller-general/follower-guide', qty: q(1) },
      { item: 'std/ramp-controller-general/pointer-seat', qty: q(1) },
      { item: 'std/ramp-controller-general/toothed-wheel-set', qty: q(1) },
      { item: 'std/ramp-controller-general/micrometer-screw', qty: q(1) },
      { item: 'std/ramp-controller-general/differential-lever', qty: q(1) },
      { item: 'std/ramp-controller-general/shaft-pin-set', qty: q(1) },
      { item: 'std/ramp-controller-general/gear-set', qty: q(1) },
      { item: 'std/ramp-controller-general/escapement-set', qty: q(1) },
      { item: 'std/ramp-controller-general/spring-set', qty: q(1) },
      { item: 'std/ramp-controller-general/pointer', qty: q(1) },
      { item: 'std/ramp-controller-general/flag', qty: q(1) },
      { item: 'std/ramp-controller-general/weight-rod-drum', qty: q(1) },
      { item: 'std/ramp-controller-general/cam-disc', qty: q(1) },
      { item: 'std/ramp-controller-general/cam-cover-key', qty: q(1) },
      { item: 'std/ramp-controller-general/ceramic-case-set', qty: q(1) },
      { item: 'std/ramp-controller-general/guide-ring', qty: q(2) },
      { item: 'std/ramp-controller-general/sensor-rod', qty: q(1) },
      { item: 'std/ramp-controller-general/contact-set', qty: q(4) },
      { item: 'std/ramp-controller-general/copper-strip-set', qty: q(1) },
      { item: 'std/ramp-controller-general/knife-switch', qty: q(1) },
      { item: 'std/ramp-controller-general/dial', qty: q(1) },
      { item: 'std/ramp-controller-general/quartz-reference', qty: q(1) },
      { item: 'std/ramp-controller-general/observation-window', qty: q(2) },
      { item: 'std/ramp-controller-general/case-hardware-set', qty: q(1) },
      { item: 'std/ramp-controller-general/fuse-wire', qty: q(1) },
    ],
  },
  {
    id: 'std/ramp-controller/electronic',
    name: 'Electronic Unit', name_zh: '电子单元',
    extends: 'iface/ramp-controller',
    unit: '台',
    category: 'machine',
    composedOf: [
      { item: 'std/prom-chip-general', qty: q(1) },
      { item: 'std/counter-chip-general', qty: q(1) },
      { item: 'std/opamp-chip-general', qty: q(1) },
      { item: 'std/temp-controller-general', qty: q(1) },
    ],
  },
];

export const RAMP_ROUTES: readonly Route[] = [
  {
    /**
     * 程序升温控制器：时基 + 程序存储 + DAC + 接口。
     *
     *   PROM 1 + 计数器 1 + 运放 1（做 DAC 缓冲与比较）+ 镍铬丝（梯形网络）
     *   + 温控器 1（PID 那半）+ 表壳
     *
     * 装配之后要**整机走一遍曲线**：拿一支热电偶贴在被控炉子上，把 830 °C 的
     * 升温曲线画在烟熏玻璃上（图示仪，一机两用），跟计划曲线比 ——
     * 差得多就重烧 PROM 或修梯形网络。
     */
    id: 'make/ramp-controller',
    name: 'Electronic Unit Manufacturing', name_zh: '电子单元制造',
    produces: [{ item: 'std/ramp-controller/electronic', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'std/prom-chip-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1) }] },
      { anyOf: [{ item: 'std/temp-controller-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room', 'std/curve-tracer-general'],
    steps: [
      { note_zh: '时基与 PROM 座（分频、地址计数）', performedBy: 'plant/robot' },
      { note_zh: 'DAC：梯形电阻网络的绕制与配对（比值一致）', performedBy: 'plant/winder' },
      { note_zh: '整机走曲线（烟熏玻璃上比计划与实际）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...RAMP_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...RAMP_ROUTES];
