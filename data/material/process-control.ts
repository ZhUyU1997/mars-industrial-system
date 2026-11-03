/**
 * 数字过程控制器 —— 闭环从"模拟"进到"数字"，并且**记得住历史**。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 模拟 PID 缺什么
 * ═══════════════════════════════════════════════════════════════════════
 *
 * PID 是运放搭的：比例靠电阻比、积分靠 RC。它稳，但它有三个天花板：
 *
 *   参数改不了    比例带与积分时间由电阻电容定死 —— 换工艺要换板子
 *   不记历史      它只"当场调节"，不知道半小时前温度是多少
 *   不会判断      "到 830 保温 30 分钟再升到 860"这种流程它做不了（那要计数与判断）
 *
 * 而这三件恰好是计算机擅长的。
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 它怎么做
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   读     模拟开关选通道（8 路），数字表给出温度 —— 每 50 ms 读一次
 *   算     数字 PID：偏差 × Kp + 累计 × Ki（4 位字长，所以 Kp/Ki 都是小整数）
 *   出     比较结果驱动接触器（通/断），或给调压器档位
 *   记     读数存进动态存储（32 个点），满了就覆盖最旧的 —— **一台小型的黑匣子**
 *
 * 4 位字长在这里够用：温度范围 0–1023 °C（10 位），误差 ±1 °C，比例带 1–15 档。
 * **不是它精确，是它对"炉子"够精确。**
 *
 * ⚠️ 一处必须说的：动态存储一停电就丢。所以"黑匣子"只在通电时有效 ——
 * 断电那一刻的历史全没了。真正的断电保持要磁芯或磁带，那要另一条链。
 *
 * ⚠️ 另一处：程序仍在 PROM 里（一次性）。所以"换工艺"还是"换芯片" ——
 * 只是这次换的是控制器的一片 PROM，而不是整块板子。**进步了一点，没有全解决。**
 */

import type { Item, Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const PROCESS_CTRL_ITEMS: readonly Item[] = [
  /**
   * 机械式过程控制器，本层基线设计。
   *
   * 整机由铸铁底座、1 kg 重锤、8 段程序盘、45:1 齿轮、擒纵、5:1 刀口杠杆、
   * 高铝感温棒、石英参考棒、烟熏记录盘、四对触点与六块陶板机壳等件装配。
   * 零件与零件路线见 `data/machine/mech-process-controller.ts`。
   */
  { id: 'std/process-controller-general', name: '机械式过程控制器', unit: '台', category: 'part',
    composedOf: [
      { item: 'std/process-controller-general/base', qty: q(1) },
      { item: 'std/process-controller-general/weight', qty: q(1) },
      { item: 'std/process-controller-general/cam-disc', qty: q(1) },
      { item: 'std/process-controller-general/angle-brace', qty: q(4) },
      { item: 'std/process-controller-general/lever-seat', qty: q(1) },
      { item: 'std/process-controller-general/dial-bracket', qty: q(1) },
      { item: 'std/process-controller-general/follower-guide', qty: q(1) },
      { item: 'std/process-controller-general/toothed-wheel-set', qty: q(1) },
      { item: 'std/process-controller-general/micrometer-screw', qty: q(1) },
      { item: 'std/process-controller-general/lever-set', qty: q(1) },
      { item: 'std/process-controller-general/spring-set', qty: q(1) },
      { item: 'std/process-controller-general/gear-set', qty: q(1) },
      { item: 'std/process-controller-general/escapement-fork', qty: q(1) },
      { item: 'std/process-controller-general/shaft-pin-set', qty: q(1) },
      { item: 'std/process-controller-general/dial-pointer', qty: q(1) },
      { item: 'std/process-controller-general/clamp-key-set', qty: q(1) },
      { item: 'std/process-controller-general/weight-rod-drum', qty: q(1) },
      { item: 'std/process-controller-general/cam-roller', qty: q(1) },
      { item: 'std/process-controller-general/contact-set', qty: q(4) },
      { item: 'std/process-controller-general/busbar-set', qty: q(1) },
      { item: 'std/process-controller-general/terminal-set', qty: q(1) },
      { item: 'std/process-controller-general/copper-bushing-set', qty: q(1) },
      { item: 'std/process-controller-general/ceramic-case-set', qty: q(1) },
      { item: 'std/process-controller-general/guide-set', qty: q(1) },
      { item: 'std/process-controller-general/sensor-rod', qty: q(1) },
      { item: 'std/process-controller-general/quartz-reference-rod', qty: q(1) },
      { item: 'std/process-controller-general/recording-disk', qty: q(1) },
      { item: 'std/process-controller-general/observation-window', qty: q(2) },
      { item: 'std/process-controller-general/arc-chute', qty: q(4) },
      { item: 'std/process-controller-general/case-hardware-set', qty: q(1) },
    ] },

  /**
   * 电子式数字过程控制器。计算机 + 8 路开关 + 数字表接口 + 接触器驱动 + 32 点记录。
   *
   * 它是本层的控制链走到头的样子：**读一个数、算一下、动一下、记下来。**
   * 而这四步合起来，就是我们今天说的"自动控制"。
   *
   * 模块与板卡为装配/接线关系；芯片与元件属于不可逆加工，零件输入写在路线 uses。
   */
  { id: 'std/process-controller-electronic', name: '电子式数字过程控制器', unit: '台', category: 'part' },
];

export const PROCESS_CTRL_ROUTES: readonly Route[] = [
  {
    /**
     * 数字过程控制器：计算机 + 开关 + 表接口 + 驱动 + 面板。
     *
     *   计算机 1 + 模拟开关 1 + 数字表 1（当 ADC 用）+ 接触器 2 + 镍铬丝 + 薄钢板
     *
     * 数字表被当成 ADC 用 —— 它本来就是双斜积分 ADC，
     * 只是显示用机械字轮。这里把它的计数输出引出来，接进计算机。
     * **一台仪器的内部信号被另一台用了**，这是本层第一次"设备之间对话"。
     */
    id: 'make/process-controller',
    name: '电子式数字过程控制器制造',
    produces: [{ item: 'std/process-controller-electronic', qty: q(1) }],
    uses: [
      { anyOf: [{ item: 'std/computer-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/analog-mux-chip-general', qty: q(1) }] },
      { anyOf: [{ item: 'std/dvm-electronic', qty: q(1) }] },
      { anyOf: [{ item: 'std/contactor-general', qty: q(2) }] },
      { anyOf: [{ item: 'mat/resistance-wire', qty: q(1) }] },
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(1) }] },
    ],
    needs: ['plant/metrology-room'],
    steps: [
      { note_zh: '接口改造（把数字表的计数输出引出来）', performedBy: 'plant/robot' },
      { note_zh: '装配与接线（开关、驱动、面板）', performedBy: 'plant/robot' },
      { note_zh: '整定（Kp/Ki 从 1 开始试，看超调）', performedBy: 'plant/robot', under: [{ param: 'temperature', min: 19, max: 21 }] },
      { note_zh: '记录测试（跑一条升温曲线，把 32 个点读回来画在烟熏玻璃上）', performedBy: 'plant/robot' },
    ],
  },
];

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [...PROCESS_CTRL_ITEMS];
export const DATA_ROUTES: readonly Route[] = [...PROCESS_CTRL_ROUTES];
