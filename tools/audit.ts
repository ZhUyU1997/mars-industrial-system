/**
 * 严格扩散审计 —— 只做一件事：
 *
 *   从 SEED_IDS + 火星地板 + R10 一次性输入出发，反复检查每一条路线；只有一条
 *   路线**所有**字段都严格成立，它的产物才算可达。跑到不动点，报告：
 *
 *     · 哪些条目从种子长不出来；
 *     · 哪些路线被阻断、阻断在哪一格；
 *     · 每颗种子自己还能不能被复制（R9）。
 *
 * 起点分三层：
 *   · 种子（SEED_IDS）—— 第一台必须运来，按给定处理；
 *   · 火星地板（mars/*）—— 到达即停，不要求有路线；
 *   · R10 一次性输入（`tools/lib/policy.ts`）—— 只列输入本身，不列依赖它们的
 *     下游产物；下游必须由路线可达性放行。
 *
 * 审计口径：
 *   · 不建“证明树”，不做贪心择路；所有路线逐条检查，不挑一条代表。
 *   · 不把“有产出路线”当成可产出；路线的每个输入、前提、执行者、工序执行者、
 *     设备规格、装配零件都要真的可达。
 *   · 规格只看**严格可用**的产出路线交付的窗口，不用“全库所有 producer 的 gives”
 *     兜底；`onRelax` 的降级放行一律不认。
 *   · 明确 `design: true` 的交付窗口、`holds`、`under`、`need` **不算满足**：
 *     design 是设计窗口，不是待补标记；窗口与条件全部进入闸门，不放行。
 *   · `record` 必须指向 `measure/*` 产出的记录条目，记录当前可达，且记录窗口落在
 *     被引用窗口内；`qual/*`、缺记录、窗口未收窄都不算读数。不合规的 give 从严格
 *     窗口剔除，下游 need 因此失败，不只记一条报告。
 *   · `bare`（`record` / `design` 都没有）是 `Provenance` 引入前的历史窗口，按当时
 *     口径接受；本工具不追补 bare，但会拒绝显式 `design` 窗口和不合规的 `record` 引用。
 *   · 规格比较本身沿用 core 的 `propCovers`：宽窗（give 包含 need）按 core 的
 *     `prop_widened` 放行；本工具不另立窗口包含口径。
 *   · `needs` 的 Option 窗口与 `Component.need` 进入判定（core 的 validate 不查这两处）。
 *   · 联产无去处单独列报告（`coproducts`），不拦路线、不进 passed。
 *   · `measure/*` 的 `noCap` / `capShort` / `condShort` 进入 gate；这是全库测量链，
 *     不只 robot 树上的窗口。
 *
 * 判据边界（本工具不判）：
 *   · 数量 / 质量 / 时间 / 成本（R1、R5）；
 *   · `Item.consumption` / `Component.wear` / `Route.rate`；
 *   · `record` 的出处等级（有 record 也不额外要求；bare 仍按原口径）。
 *
 * 用法：
 *   node tools/audit.ts                         # 审计（闸门）
 *   node tools/audit.ts --json
 *   node tools/audit.ts --out <file>
 *   node tools/audit.ts --round correction      # 闸门输出按纠正轮描述
 *   node tools/audit.ts --round supplement      # 闸门输出按补充轮描述
 *   node tools/audit.ts --tasks [--all] [--json]
 *   node tools/audit.ts --status [--json]
 *
 * 查询（只读）：node tools/query.ts --help
 *
 * 退出码：默认/--json 0 = 放行，1 = 待补（闸门未放行）；--tasks/--status 是报告，成功 0；
 * 2 = 参数/模型错误。
 */
import { closeSync, openSync, writeSync } from 'node:fs';

import { buildResult } from './lib/reach.ts';
import { scanDesign } from './lib/reach.ts';
import type { AuditResult, BlockedRoute } from './lib/reach.ts';
import {
  buildStatusSummary,
  buildTaskReport,
  printStatusSummary,
  printTasks,
} from './audit/views.ts';

const printText = (result: AuditResult): void => {
  const r = result.reachable;
  const blocked = result.routes.blocked;
  const frontier = blocked.filter((entry) => entry.kind === 'frontier');
  const alternative = blocked.filter((entry) => entry.kind === 'alternative');
  const outside = blocked.length - frontier.length - alternative.length;
  const designRoots = frontier.filter((entry) =>
    entry.failures.some((failure) => failure.code === 'DESIGN_CONDITION'),
  );
  const otherFrontier = frontier.filter((entry) => !designRoots.includes(entry));
  const seedFailed = result.seeds.filter((seed) => !seed.replicable);
  const degradedUsable = result.routes.usable.length - result.routes.clean.length;
  const design = scanDesign();

  const line = (text = ''): void => console.log(text);
  const title = (text: string): void => {
    line();
    line(text);
  };
  const rest = (shown: number, total: number, indent = '     ', hint = '--json'): void => {
    if (shown < total) line(`${indent}… 另有 ${total - shown} 条（${hint}）`);
  };

  line('严格审计');
  line(`闸门：${result.passed ? '放行' : '待放行'}`);
  line(
    `四组：待解路线 ${blocked.length} · 降级可用 ${degradedUsable} · ` +
      `待验证 design ${result.designGives} 窗口 / ${result.designConditions} 条件 · ` +
      `待产条目 ${r.unavailable.length}`,
  );
  line('口径：闭包 / 可达 / 种子 / 测量链；design 与 record 出处都进入闸门');
  if (result.round !== undefined) {
    const correction = result.round === 'correction';
    const tail = result.passed
      ? correction
        ? '；放行只说明当前无待解路线，增量仍与基线比'
        : '；放行只说明当前闭包成立'
      : '；与改前基线比';
    line(
      `轮次：${correction ? '纠正轮' : '补充轮'} —— ` +
        `判据：四组任一组${correction ? '增加' : '减少'}即成立${tail}`,
    );
  }

  title('一、起点与规模');
  line(
    `  起点：种子 ${result.start.seeds.length} · 火星地板 ${result.start.floor.length} · ` +
      `R10 一次性输入 ${result.start.oneTime.length}`,
  );
  if (result.start.oneTime.length > 0) {
    line(`  R10：${result.start.oneTime.join(', ')}（已批准，按给定处理）`);
  }
  line(
    `  模型：${result.model.items} 条目 · ${result.model.routes} 路线 · ` +
      `validate 错误 ${result.model.errors} / 提示 ${result.model.notes}`,
  );
  line(
    `  扩散：${result.rounds} 轮 · 条目 ${r.items} / ${r.total} · ` +
      `设备 ${r.machines} / ${r.machinesTotal}`,
  );
  line(
    `  路线：可执行 ${result.routes.clean.length} / ${result.routes.total}` +
      `（干净 ${result.routes.clean.length} · 降级 ${degradedUsable}）`,
  );
  line(
    `  种子复制：${result.seeds.length - seedFailed.length} / ${result.seeds.length}` +
      (seedFailed.length > 0 ? `（未复制：${seedFailed.map((seed) => seed.id).join('、')}）` : ''),
  );
  line(
    result.measure.total === 0
      ? '  测量链：全覆盖'
      : `  测量链：${result.measure.total} 条待覆盖（noCap ${result.measure.noCap} · ` +
          `capShort ${result.measure.capShort} · condShort ${result.measure.condShort}）`,
  );

  title('二、四组待办');
  line(`  1. 待解路线 ${blocked.length}`);
  if (blocked.length === 0) {
    line('     无');
  } else {
    line(`     前沿 ${frontier.length} · 备选 ${alternative.length} · 闭包外 ${outside}`);
    const byCode = new Map<string, number>();
    for (const entry of blocked) {
      for (const failure of entry.failures) {
        byCode.set(failure.code, (byCode.get(failure.code) ?? 0) + 1);
      }
    }
    line(
      `     failure：${[...byCode.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([code, count]) => `${code} ${count}`)
        .join(' · ')}`,
    );

    const printRoute = (entry: BlockedRoute, mark: string): void => {
      line(`     ${mark} ${entry.id} → ${entry.products.join(' / ') || '(无产物)'}`);
      for (const failure of entry.failures) {
        line(`         [${failure.code}] ${failure.detail}`);
      }
    };

    if (frontier.length > 0) {
      line(`     前沿 ${frontier.length}（设计窗口根因 ${designRoots.length}）：`);
      for (const entry of otherFrontier.slice(0, 20)) printRoute(entry, '·');
      if (otherFrontier.length > 20) {
        line(`       … 另有 ${otherFrontier.length - 20} 条其他前沿（--json）`);
      }
      for (const entry of designRoots) printRoute(entry, '[设计]');
    }
    if (alternative.length > 0) {
      line(`     备选 ${alternative.length}（产物另有可用路线，不影响可达性）：`);
      for (const entry of alternative.slice(0, 10)) printRoute(entry, '·');
      if (alternative.length > 10) line(`       … 另有 ${alternative.length - 10} 条（--json）`);
    }
    if (outside > 0) {
      line(`     闭包外 ${outside} 条：输入与产物都不在种子可达集内，未逐条展开。`);
    }
  }

  line(`  2. 降级可用 ${degradedUsable}`);
  if (degradedUsable === 0 && result.degraded.length === 0) {
    line('     无');
  } else {
    const degradedRoutes = result.routes.usable.filter(
      (id) => !result.routes.clean.includes(id),
    );
    if (degradedRoutes.length > 0) {
      line(`     路线：${degradedRoutes.slice(0, 20).join(', ')}${degradedRoutes.length > 20 ? ' …' : ''}`);
    }
    for (const item of result.degraded.slice(0, 30)) {
      line(`     ${item.id}  [${item.category}]  ← ${item.route}（第 ${item.firstRound} 轮）`);
      for (const site of item.sites.slice(0, 2)) {
        const available = site.available.length > 0 ? site.available.join(' / ') : '无';
        line(`         [${site.where}] ${site.item} · ${site.param}：要 ${site.need}，只有 ${available}`);
      }
      if (item.sites.length > 2) line(`         … 另有 ${item.sites.length - 2} 处`);
    }
    if (result.degraded.length > 30) {
      line(`     … 另有 ${result.degraded.length - 30} 个（--json）`);
    }
  }

  line(`  3. 待验证 design：${result.designGives} 个交付窗口 · ${result.designConditions} 处条件`);
  if (design.routes.length === 0) {
    line('     无');
  } else {
    line(
      `     ${design.routes.length} 条路线 · ${design.routeConditions} 处路线条件 · ` +
        `${design.requirements} 处需求条件 · ${design.gives} 个交付窗口（不算交付）`,
    );
    for (const id of design.routes.slice(0, 20)) line(`     · ${id}`);
    if (design.routes.length > 20) line(`     … 另有 ${design.routes.length - 20} 条（--json）`);
  }

  line(`  4. 待产条目 ${r.unavailable.length}`);
  if (r.unavailable.length === 0) {
    line('     无');
  } else {
    const byCategory = new Map<string, number>();
    for (const item of r.unavailable) {
      byCategory.set(item.category, (byCategory.get(item.category) ?? 0) + 1);
    }
    line(
      `     按类别：${[...byCategory.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([category, count]) => `${category} ${count}`)
        .join(' · ')}`,
    );
    for (const item of r.unavailable.slice(0, 40)) {
      const producers =
        item.producers.length > 0 ? `← ${item.producers.join(', ')}` : '无产出路线';
      line(`     ${item.id}  [${item.category}]  ${producers}`);
    }
    if (r.unavailable.length > 40) line(`     … 另有 ${r.unavailable.length - 40} 条（--json）`);
  }

  title('三、种子复制');
  if (seedFailed.length === 0) {
    line('  全部可复制。');
  } else {
    for (const seed of seedFailed) {
      line(`  ${seed.id}  ✗`);
      if (seed.producers.length === 0) line('     ✗ 没有任何产出路线');
      for (const producer of seed.producers) {
        const label = producer.usable ? (producer.clean ? '✓' : '△') : '✗';
        line(`     ${label} ${producer.id}`);
        if (producer.usable && !producer.clean) {
          line('         [SEED_DEGRADED] 路线可用，但靠 kept 放宽 —— 不是干净复制');
        }
        if (producer.usable && producer.clean && !producer.specOk) {
          line('         [SEED_SPEC] 路线可用，但交付窗口不覆盖种子 props —— 不是同规格复制');
        }
        if (producer.usable && producer.clean && producer.specOk && !producer.componentsOk) {
          line('         [SEED_COMPONENT] 种子 composedOf 的零件缺非 design 窗口 —— 不是可复制');
        }
        for (const failure of producer.failures) {
          line(`         [${failure.code}] ${failure.detail}`);
        }
      }
    }
  }

  title('四、其他报告');
  if (result.deferred.length > 0) {
    line(`  待定义条目 ${result.deferred.length}（deferred，不得由路线产出）：`);
    for (const item of result.deferred.slice(0, 30)) line(`     ${item.id}  [${item.category}]`);
    rest(Math.min(30, result.deferred.length), result.deferred.length, '     ');
  }
  if (result.upgradedItems.length > 0) {
    line(
      `  先降级、后升级 ${result.upgradedItems.length}：` +
        `${result.upgradedItems.slice(0, 12).join('、')}` +
        (result.upgradedItems.length > 12 ? ' …' : ''),
    );
  }
  if (result.coproducts.unclaimed.length > 0) {
    line(
      `  联产无去处 ${result.coproducts.unclaimed.length}（不计入闸门；` +
        `${result.coproducts.routes} 条多产物路线）：`,
    );
    for (const pair of result.coproducts.unclaimed.slice(0, 20)) {
      line(`     ${pair.route} → ${pair.item}`);
    }
    if (result.coproducts.unclaimed.length > 20) {
      line(`     … 另有 ${result.coproducts.unclaimed.length - 20} 项（--json）`);
    }
  }
  if (result.warnings.length > 0) {
    const shown = result.warnings.filter((warning) => !warning.startsWith('未验证窗口：'));
    if (shown.length > 0) {
      line(`  不计入闸门的输出 ${shown.length} 条：`);
      for (const warning of shown) line(`     ${warning}`);
    }
  }

  title('五、记录出处');
  if (result.recordProblems.length === 0) {
    line('  无');
  } else {
    const records = new Set(result.recordProblems.map((problem) => problem.record));
    line(
      `  ${result.recordProblems.length} 处不合规引用（${records.size} 个记录；不算读数）：`,
    );
    for (const problem of result.recordProblems.slice(0, 20)) {
      line(`     ${problem.record} ← ${problem.where}  [${problem.reason}] ${problem.detail}`);
    }
    rest(Math.min(20, result.recordProblems.length), result.recordProblems.length, '     ');
  }

  line();
  line(
    result.passed
      ? '结论：放行。'
      : `结论：待放行 —— 待解路线 ${blocked.length} · ` +
          `待验证 design ${result.designGives} 窗口 / ${result.designConditions} 条件 · ` +
          `待产条目 ${r.unavailable.length}` +
          `${result.recordProblems.length > 0 ? ` · 记录出处 ${result.recordProblems.length}` : ''}` +
          `${seedFailed.length > 0 ? ` · 种子未复制 ${seedFailed.length}` : ''}` +
          `${result.measure.total > 0 ? ` · 测量链 ${result.measure.total}` : ''}。`,
  );
  line('查询：node tools/query.ts --help（items / routes / needs / windows / gaps / why / path）');
};

const redirectToFile = (): boolean => {
  const index = process.argv.indexOf('--out');
  if (index < 0) return true;
  const path = process.argv[index + 1];
  if (path === undefined || path.startsWith('--')) {
    console.error('用法：--out <file>');
    return false;
  }
  const fd = openSync(path, 'w');
  console.log = (...args: unknown[]) => {
    writeSync(fd, args.map((arg) => String(arg)).join(' ') + '\n');
  };
  process.on('exit', () => {
    try {
      closeSync(fd);
    } catch {
      // 已关闭或写失败：退出阶段不再抛。
    }
  });
  return true;
};

const USAGE = `用法：
  node tools/audit.ts                                  闸门
  node tools/audit.ts --json                           闸门，结构化输出
  node tools/audit.ts --out <file>                     任意模式存成文件
  node tools/audit.ts --round correction|supplement    闸门按纠正/补充轮描述
  node tools/audit.ts --tasks [--all] [--json]         报告：下一步任务
  node tools/audit.ts --status [--json]                报告：状态总结

查询（只读）：node tools/query.ts --help`;

const main = (): void => {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log(USAGE);
    return;
  }
  const flags = args.filter((arg) => arg.startsWith('--'));
  const allowed = new Set(['--json', '--out', '--tasks', '--status', '--all', '--round']);
  const unknown = flags.filter((flag) => !allowed.has(flag));
  const tasks = args.includes('--tasks');
  const summary = args.includes('--status');
  if (unknown.length > 0) {
    console.error(`未知参数：${unknown.join(' ')}`);
    console.error(USAGE);
    process.exitCode = 2;
    return;
  }
  let round: AuditResult['round'];
  const roundIndex = args.indexOf('--round');
  if (roundIndex >= 0) {
    const value = args[roundIndex + 1];
    if (value !== 'correction' && value !== 'supplement') {
      console.error('用法：--round <correction|supplement>');
      process.exitCode = 2;
      return;
    }
    round = value;
  }
  if (tasks && summary) {
    console.error('--tasks 与 --status 只能二选一');
    process.exitCode = 2;
    return;
  }
  if (args.includes('--all') && !tasks) {
    console.error('--all 只用于 --tasks');
    process.exitCode = 2;
    return;
  }

  if (!redirectToFile()) {
    process.exitCode = 2;
    return;
  }

  let result: AuditResult;
  try {
    result = buildResult();
  } catch (error) {
    console.error((error as Error).message);
    process.exitCode = 2;
    return;
  }
  if (round !== undefined) result = { ...result, round };

  if (tasks) {
    const report = buildTaskReport(result, { all: args.includes('--all') });
    if (args.includes('--json')) console.log(JSON.stringify(report, null, 2));
    else printTasks(report);
    return;
  }
  if (summary) {
    const report = buildStatusSummary(result);
    if (args.includes('--json')) console.log(JSON.stringify(report, null, 2));
    else printStatusSummary(report);
    return;
  }

  if (args.includes('--json')) console.log(JSON.stringify(result, null, 2));
  else printText(result);
  if (!result.passed) process.exitCode = 1;};

const invoked = process.argv[1]?.replace(/\\/g, '/') ?? '';
if (/(?:^|\/)audit\.(?:ts|js)$/.test(invoked)) {
  main();
}
