/**
 * audit 的只读视图：--tasks / --status。
 *
 * 只读 AuditResult，不另算判据。
 */
import { model } from '../lib/index.ts';
import { scanDesign } from '../lib/reach.ts';
import type { AuditResult } from '../lib/reach.ts';

type BlockedRoute = AuditResult['routes']['blocked'][number];
const data = model.data;
// ── 任务视图 / 状态视图 ──────────────────────────────────────────────────────
//
// 这两个视图只读 buildResult() 的结果，不另算判据。任务组可以重叠：

export type TaskKey =
  | 'deferred'
  | 'no_route'
  | 'blocked'
  | 'design'
  | 'record'
  | 'seed'
  | 'measure';

export interface TaskCategory {
  readonly key: string;
  readonly label: string;
  /** 这条 failure 实际检查的 core 字段。 */
  readonly field: string;
  readonly count: number;
  readonly ids: readonly string[];
  readonly total: number;
  readonly truncated: boolean;
}

export interface TaskGroup {
  readonly key: TaskKey;
  readonly label: string;
  readonly count: number;
  readonly fix: string;
  readonly ids: readonly string[];
  readonly total: number;
  readonly truncated: boolean;
  readonly detail?: string;
  /** 仅 blocked 组：按第一堵点分出的子类。 */
  readonly categories?: readonly TaskCategory[];
}

export interface TaskTotals {
  readonly items: number;
  readonly unavailable: number;
  readonly seedTotal: number;
  readonly seedReplicable: number;
  readonly seedFailed: number;
  readonly designRoutes: number;
  readonly designConditions: number;
  readonly designGives: number;
  readonly recordProblems: number;
  readonly blocked: number;
  readonly noRoute: number;
  readonly alternative: number;
  readonly measure: number;
  readonly deferred: number;
}

export interface TaskReport {
  readonly groups: readonly TaskGroup[];
  readonly totals: TaskTotals;
}

const TASK_ID_LIMIT = 20;
const CATEGORY_ID_LIMIT = 5;

const FAILURE_LABEL: Record<string, string> = {
  MISSING_INPUT: '缺输入',
  MISSING_NEED: '缺前提',
  MISSING_HOLDER: '缺条件承担者',
  MISSING_STEP_PERFORMER: '缺工序执行者',
  MISSING_COMPONENT: '缺装配零件',
  MISSING_EQUIPMENT: '缺设备',
  MISSING_PERFORMER: '缺执行者',
  UNMET_OPTION_NEED: '规格不满足',
  BAD_EQUIPMENT_REQUIRE: '设备规格写法错',
  BAD_COMPONENT_NEED: '装配规格写法错',
  UNKNOWN_COMPONENT_PROP: '装配属性未声明',
  DEFERRED_PRODUCT: '产物待定义',
};

const failureLabel = (code: string): string => FAILURE_LABEL[code] ?? code;

const FAILURE_FIELD: Record<string, string> = {
  MISSING_INPUT: 'Route.uses',
  MISSING_NEED: 'Route.needs',
  MISSING_HOLDER: 'Condition.under / Item.holds',
  MISSING_STEP_PERFORMER: 'Route.steps[].performedBy',
  MISSING_COMPONENT: 'Item.composedOf',
  MISSING_EQUIPMENT: 'Route.equipmentRequire',
  MISSING_PERFORMER: 'Route.performedBy',
  UNMET_OPTION_NEED: 'Option.need',
  BAD_EQUIPMENT_REQUIRE: 'Route.equipmentRequire',
  BAD_COMPONENT_NEED: 'Item.composedOf[].need',
  UNKNOWN_COMPONENT_PROP: 'Item.props',
  DEFERRED_PRODUCT: 'Item.deferred',
};

const failureField = (code: string): string => FAILURE_FIELD[code] ?? code;

const designStats = (): {
  readonly routeIds: readonly string[];
  readonly conditions: number;
  readonly gives: number;
} => {
  const design = scanDesign(data);
  return {
    routeIds: design.routes,
    conditions: design.allConditions,
    gives: design.gives,
  };
};

export function buildTaskReport(
  result: AuditResult,
  options: { readonly all?: boolean } = {},
): TaskReport {
  const design = designStats();
  const blockedByItem = new Map<string, BlockedRoute[]>();
  for (const route of result.routes.blocked) {
    for (const product of route.products) {
      const list = blockedByItem.get(product) ?? [];
      list.push(route);
      blockedByItem.set(product, list);
    }
  }

  const noRoute: string[] = [];
  const blocked: string[] = [];
  const designItems: string[] = [];
  for (const item of result.reachable.unavailable) {
    if (item.producers.length === 0) {
      noRoute.push(item.id);
      continue;
    }
    const routes = blockedByItem.get(item.id) ?? [];
    const isDesign = routes.some((b) =>
      b.failures.some((f) => f.code === 'DESIGN_CONDITION'),
    );
    if (isDesign) designItems.push(item.id);
    else blocked.push(item.id);
  }

  const blockedByCode = new Map<string, string[]>();
  for (const id of blocked) {
    const first = blockedByItem.get(id)?.[0]?.failures[0];
    const code = first?.code ?? 'UNKNOWN';
    const list = blockedByCode.get(code) ?? [];
    list.push(id);
    blockedByCode.set(code, list);
  }
  const blockedCategories: TaskCategory[] = [...blockedByCode.entries()]
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
    .map(([code, ids]) => {
      const sorted = [...ids].sort();
      const shown = options.all === true ? sorted : sorted.slice(0, CATEGORY_ID_LIMIT);
      return {
        key: code,
        label: failureLabel(code),
        field: failureField(code),
        count: sorted.length,
        ids: shown,
        total: sorted.length,
        truncated: shown.length < sorted.length,
      };
    });
  const blockedDetail =
    '按第一堵点分类；括号里是检查的字段；每个类别默认列前 5 个 id，--tasks --all 全量';

  const seedFailed = result.seeds.filter((s) => !s.replicable).map((s) => s.id);
  const groups: TaskGroup[] = [];
  const addGroup = (
    key: TaskKey,
    label: string,
    fix: string,
    allIds: readonly string[],
    detail?: string,
    categories?: readonly TaskCategory[],
  ): void => {
    const ids = options.all === true ? [...allIds] : allIds.slice(0, TASK_ID_LIMIT);
    groups.push({
      key,
      label,
      count: allIds.length,
      fix,
      ids,
      total: allIds.length,
      truncated: ids.length < allIds.length,
      detail,
      categories,
    });
  };

  addGroup(
    'deferred',
    '待定义条目',
    '补 `composedOf` 或拆子件；完成后去掉 `deferred`',
    result.deferred.map((item) => item.id),
    '产出路线按 DEFERRED_PRODUCT 阻断；补 composedOf 后去掉 deferred',
  );
  addGroup(
    'no_route',
    '建生产路线',
    '补一条 `make/*` 产出路线；零件在条目的 `composedOf` 上',
    noRoute,
  );
  addGroup(
    'blocked',
    '路线待解',
    '先解第一堵点（输入 / 执行者 / 条件 / 设备规格）；完整 failure 用 --json',
    blocked,
    blockedDetail,
    blockedCategories,
  );
  addGroup(
    'design',
    '待验证窗口',
    '补 `measure/*` 记录后再删 `design`；补不出就记停点跳过 —— 保留 `design` 不是收口，窗口仍算未交付',
    design.routeIds,
    `${design.conditions} 处条件 · ${design.gives} 个交付窗口` +
      (designItems.length > 0 ? ` · 影响 ${designItems.length} 条待产条目` : ''),
  );
  addGroup(
    'record',
    '记录出处',
    '记录须由 `measure/*` 产出、当前可达，且窗口落在被引用窗口内；`qual/*`、缺记录、窗口不放宽都不算读数',
    result.recordProblems.map((problem) => `${problem.record} ← ${problem.where}`),
    `${result.recordProblems.length} 处不合规引用` +
      (result.recordProblems.length > 0
        ? ` · ${new Set(result.recordProblems.map((problem) => problem.record)).size} 个记录`
        : ''),
  );
  addGroup(
    'seed',
    '种子复制（R9）',
    '修 `make/<seed>` 或它的组件，直到种子复制成立',
    seedFailed,
    result.seeds
      .filter((s) => !s.replicable)
      .map((s) => s.id)
      .join(', '),
  );
  addGroup(
    'measure',
    '测量链覆盖',
    '补测量路线或机器量程；noCap / capShort / condShort 明细待接入',
    [],
    `noCap ${result.measure.noCap} · capShort ${result.measure.capShort} · condShort ${result.measure.condShort}`,
  );

  const measureGroup = groups.find((g) => g.key === 'measure');
  if (measureGroup !== undefined) {
    groups[groups.indexOf(measureGroup)] = {
      ...measureGroup,
      count: result.measure.total,
      total: result.measure.total,
    };
  }

  return {
    groups,
    totals: {
      items: result.model.items,
      unavailable: result.reachable.unavailable.length,
      seedTotal: result.seeds.length,
      seedReplicable: result.seeds.filter((s) => s.replicable).length,
      seedFailed: seedFailed.length,
      designRoutes: design.routeIds.length,
      designConditions: design.conditions,
      designGives: design.gives,
      recordProblems: result.recordProblems.length,
      blocked: blocked.length,
      noRoute: noRoute.length,
      alternative: result.routes.blocked.filter((b) => b.kind === 'alternative').length,
      measure: result.measure.total,
      deferred: result.deferred.length,
    },
  };
}

export interface StatusSummary {
  readonly target: string;
  readonly passed: boolean;
  readonly validateErrors: number;
  readonly seeds: { readonly total: number; readonly replicable: number };
  readonly reachable: {
    readonly items: number;
    readonly total: number;
    readonly machines: number;
    readonly machinesTotal: number;
  };
  readonly routes: {
    readonly usable: number;
    readonly clean: number;
    readonly total: number;
    readonly blocked: number;
    readonly frontier: number;
    readonly alternative: number;
  };
  readonly degraded: number;
  readonly deferred: number;
  readonly unavailable: number;
  readonly designRoutes: number;
  readonly designConditions: number;
  readonly designGives: number;
  readonly recordProblems: number;
  readonly measure: AuditResult['measure'];
}

export function buildStatusSummary(result: AuditResult): StatusSummary {
  const design = designStats();
  return {
    target: 'plant/robot',
    passed: result.passed,
    validateErrors: result.model.errors,
    seeds: {
      total: result.seeds.length,
      replicable: result.seeds.filter((s) => s.replicable).length,
    },
    reachable: {
      items: result.reachable.items,
      total: result.reachable.total,
      machines: result.reachable.machines,
      machinesTotal: result.reachable.machinesTotal,
    },
    routes: {
      usable: result.routes.usable.length,
      clean: result.routes.clean.length,
      total: result.routes.total,
      blocked: result.routes.blocked.length,
      frontier: result.routes.blocked.filter((b) => b.kind === 'frontier').length,
      alternative: result.routes.blocked.filter((b) => b.kind === 'alternative').length,
    },
    degraded: result.degraded.length,
    deferred: result.deferred.length,
    unavailable: result.reachable.unavailable.length,
    designRoutes: design.routeIds.length,
    designConditions: design.conditions,
    designGives: design.gives,
    recordProblems: result.recordProblems.length,
    measure: result.measure,
  };
}

export function printTasks(report: TaskReport): void {
  const t = report.totals;
  console.log('严格审计任务');
  console.log(
    `条目 ${t.items} · 待产 ${t.unavailable} · ` +
      `种子可复制 ${t.seedReplicable}/${t.seedTotal} · 测量链待覆盖 ${t.measure}`,
  );
  console.log('任务组可重叠；合计不是条目数。');
  console.log('');
  report.groups.forEach((group, index) => {
    console.log(`${index + 1}. ${group.label}  ${group.count} 条`);
    console.log(`   修法：${group.fix}`);
    if (group.detail !== undefined && group.detail !== '') {
      console.log(`   明细：${group.detail}`);
    }
    if (group.categories !== undefined && group.categories.length > 0) {
      for (const category of group.categories) {
        console.log(
          `   - ${category.label}（${category.field}）  ${category.count} 条`,
        );
        for (const id of category.ids) console.log(`       ${id}`);
        if (category.truncated) {
          console.log(
            `       … 另有 ${category.total - category.ids.length} 条`,
          );
        }
      }
    } else {
      for (const id of group.ids) console.log(`   - ${id}`);
      if (group.truncated) {
        console.log(`   … 另有 ${group.total - group.ids.length} 条，用 --tasks --all 看全部`);
      }
    }
    if (index < report.groups.length - 1) console.log('');
  });
}

export function printStatusSummary(status: StatusSummary): void {
  console.log('严格审计状态');
  console.log(`目标：${status.target}`);
  console.log(`闸门：${status.passed ? '放行' : '待放行'}`);
  console.log('  放行口径：闭包 / 可达 / 种子 / 测量链 / design / record 出处');
  console.log(`validate 错误：${status.validateErrors}`);
  console.log(`种子复制：${status.seeds.replicable}/${status.seeds.total}`);
  console.log(`条目可达：${status.reachable.items}/${status.reachable.total}`);
  console.log(`设备可达：${status.reachable.machines}/${status.reachable.machinesTotal}`);
  console.log(
    `可执行路线：${status.routes.clean}/${status.routes.total}` +
      `（降级可用 ${status.routes.usable - status.routes.clean}；不等于规格已验证）`,
  );
  console.log(`待产条目：${status.unavailable}`);
  console.log(`降级可用：${status.degraded}`);
  console.log(`待定义条目：${status.deferred}`);
  console.log(
    `待解路线：${status.routes.blocked}` +
      `（前沿 ${status.routes.frontier} / 备选 ${status.routes.alternative}）`,
  );
  console.log(
    `待验证窗口：${status.designRoutes} 条路线 · ` +
      `${status.designConditions} 处条件 · ${status.designGives} 个交付窗口（不算交付）`,
  );
  console.log(`记录出处：${status.recordProblems} 处（不算读数）`);
  console.log(
    status.measure.total === 0 ? '测量链：全覆盖' : `测量链：${status.measure.total} 条待覆盖`,
  );
}
