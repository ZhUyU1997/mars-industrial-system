/**
 * 24 轴控制柜 —— 把“机器人要 20 轴”那一格从 lost 变成覆盖。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 六轴到二十四轴，多出来的是什么
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * `make/robot-controller-32bit` 是六轴：2 片 CPU、16 片 RAM、8 片 PROM、
 * 2 只自整角机、6 只接触器。二十四轴不是把 CPU 换快，是**通道数 ×4**：
 *
 *   每轴一路功率级   2 只晶闸管（正/反）      24 × 2 = 48 只
 *   每轴一路位置计数 1 片计数芯片（编码器脉冲） 24 片
 *   每轴一路电流采样 1 片运放（现有的 opamp）
 *
 * 算力够不够，算一遍：20 轴 × 100 Hz × 每点 ~50 条指令 = 10 万条/秒；
 * 32 位那套是 5 MIPS（500 万条/秒），余 50 倍。**所以瓶颈不是算力，是通道**。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 为什么不用 DAC
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 伺服驱动要的是"给多少电流"，传统做法是 DAC 出模拟量、功率级线性放大。
 * 但本层没有 DAC 芯片，也不必用：**晶闸管斩波（PWM）**直接把占空比变成
 * 平均电压，配一级 LC 滤波就是等效的模拟量。代价是转矩脉动大（几百 Hz
 * 斩波在低速时听得见），而本层没有测振仪，脉动这一项判不了。
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 已知缺口
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ① **24 路的位置环没有调试工装**：本层靠"逐轴接、逐轴转、逐轴记"（十台
 *     机器人一起干），没有多轴联调台。
 *  ② **斩波脉动没有量具**：没有示波器/测振仪，只能听声音判断。
 *  ③ **同步性判不了**：24 轴插补的同步误差要 µs 级示波器，本层没有。
 */

import type { Route } from '../../src/index.ts';
import { q } from '../../src/index.ts';

export const CONTROLLER_24AXIS_ROUTES: readonly Route[] = [
  {
    /**
     * 32 位机 + 24 路通道。柜体、配线、通电老化与六轴那版同一套工序。
     *
     * 交出：`dof = 24`。
     */
    id: 'make/robot-controller-32bit-24axis',
    name: '机器人控制柜制造',
    produces: [
      {
        item: 'plant/robot/controller',
        qty: q(1),
        gives: [
          { param: 'dof', kind: 'range', min: 24, max: 24 },
        ],
      },
    ],
    uses: [
      { anyOf: [{ item: 'mat/sheet-steel', qty: q(3) }] },
      // 两片主控（与六轴那版相同），轴卡用计数芯片堆。
      { anyOf: [{ item: 'std/cpu-32bit-general', qty: q(2) }] },
      { anyOf: [{ item: 'std/ram-chip-general', qty: q(16) }] },
      { anyOf: [{ item: 'std/prom-chip-general', qty: q(8) }] },
      // 24 路位置计数
      { anyOf: [{ item: 'std/counter-chip-general', qty: q(24) }] },
      // 24 × 2 只晶闸管做斩波功率级
      { anyOf: [{ item: 'std/thyristor-general', qty: q(48) }] },
      // 每路一级运放做电流采样
      { anyOf: [{ item: 'std/opamp-chip-general', qty: q(24) }] },
      { anyOf: [{ item: 'std/quartz-resonator-general', qty: q(1) }] },
      { anyOf: [{ item: 'mat/copper-wire', qty: q(3) }] },
      { anyOf: [{ item: 'mat/aluminium', qty: q(1) }] },
    ],
    needs: [],
    performedBy: 'plant/sheet-shop',
  },
];

import type { Item } from '../../src/index.ts';

// ── 规范出口（由 tools/normalize-exports.mjs 生成；新文件照这两行写，勿手改） ──
export const DATA_ITEMS: readonly Item[] = [];
export const DATA_ROUTES: readonly Route[] = [...CONTROLLER_24AXIS_ROUTES];
