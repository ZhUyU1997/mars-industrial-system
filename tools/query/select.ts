/**
 * 查询参数与选择器 —— 只做解析、id 解析与过滤，不读书据、不打印。
 */
import { readFileSync } from 'node:fs';

import { FAILURE_CODES } from '../lib/reach.ts';
import { model } from '../lib/index.ts';
import type { FailureCode } from '../lib/reach.ts';
import type { ReachIndex } from './index.ts';

export type Subject = 'items' | 'routes' | 'needs' | 'windows' | 'gaps' | 'why' | 'path';
export type Format = 'text' | 'json' | 'ndjson' | 'ids' | 'count';

export interface Filters {
  state: string[];
  kind: string[];
  failure: string[];
  category: string[];
  prop: string[];
  holds: string[];
  producer: string[];
  produces: string[];
  uses: string[];
  performer: string[];
  param: string[];
  relax: string[];
  reason: string[];
  seed: boolean;
  deferred: boolean;
  noRoute: boolean;
  design: boolean;
  scopeAll: boolean;
}

export interface ParsedQuery {
  readonly subject: Subject;
  readonly positionals: readonly string[];
  readonly filters: Filters;
  readonly format: Format;
  readonly all: boolean;
  readonly limit?: number;
  readonly depth?: number;
  readonly out?: string;
  readonly idsFiles: readonly string[];
  readonly failIfEmpty: boolean;
}

export type ParseResult =
  | { readonly ok: true; readonly help: true; readonly helpSubject?: Subject }
  | { readonly ok: true; readonly help: false; readonly query: ParsedQuery }
  | { readonly ok: false; readonly message: string };

export interface Selection {
  readonly ids: readonly string[];
  readonly warnings: readonly string[];
  readonly error?: string;
}

const SUBJECTS: Record<string, Subject> = {
  item: 'items',
  items: 'items',
  route: 'routes',
  routes: 'routes',
  needs: 'needs',
  windows: 'windows',
  gaps: 'gaps',
  why: 'why',
  path: 'path',
};

export const SUBJECT_LABEL: Record<Subject, string> = {
  items: '条目',
  routes: '路线',
  needs: '需求信封',
  windows: '交付窗口',
  gaps: '未覆盖窗口',
  why: '归因',
  path: '证明树',
};

const ITEM_STATES = ['given', 'clean', 'degraded', 'upgraded', 'unavailable', 'interface'];
const ROUTE_STATES = ['clean', 'degraded', 'blocked'];
const KINDS = ['frontier', 'alternative', 'outside'];
const REASONS = ['none', 'design-only', 'non-covering'];
const RELAX = ['functional-kept', 'functional-lost'];

const ALLOWED: Record<Subject, readonly string[]> = {
  items: ['state', 'category', 'prop', 'holds', 'producer', 'seed', 'deferred', 'no-route', 'scope'],
  routes: ['state', 'kind', 'failure', 'produces', 'uses', 'performer', 'design'],
  needs: ['param', 'design', 'relax', 'scope'],
  windows: ['param', 'design', 'scope'],
  gaps: ['param', 'reason', 'relax', 'scope'],
  why: ['depth'],
  path: ['depth'],
};

const FILTER_FLAGS = new Set([
  'state',
  'kind',
  'failure',
  'category',
  'prop',
  'holds',
  'producer',
  'produces',
  'uses',
  'performer',
  'param',
  'relax',
  'reason',
]);

const BOOL_FLAGS = new Set(['seed', 'deferred', 'no-route', 'design', 'all', 'fail-if-empty', 'help']);

const splitValues = (value: string): string[] =>
  value
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part !== '');

const defaultFilters = (): Filters => ({
  state: [],
  kind: [],
  failure: [],
  category: [],
  prop: [],
  holds: [],
  producer: [],
  produces: [],
  uses: [],
  performer: [],
  param: [],
  relax: [],
  reason: [],
  seed: false,
  deferred: false,
  noRoute: false,
  design: false,
  scopeAll: false,
});

const pushAll = (target: string[], values: readonly string[]): void => {
  for (const value of values) if (!target.includes(value)) target.push(value);
};

export function parseQuery(argv: readonly string[]): ParseResult {
  const positionals: string[] = [];
  const filters = defaultFilters();
  const idsFiles: string[] = [];
  const used = new Set<string>();
  let format: Format = 'text';
  let formatFlag: string | undefined;
  let all = false;
  let limit: number | undefined;
  let depth: number | undefined;
  let out: string | undefined;
  let failIfEmpty = false;
  let help = false;
  let endOfFlags = false;

  const setFormat = (name: string): string | undefined => {
    if (formatFlag !== undefined && formatFlag !== name) {
      return `--${formatFlag} 与 --${name} 只能二选一`;
    }
    formatFlag = name;
    format = name === 'json' ? 'json' : name === 'ndjson' ? 'ndjson' : name === 'ids' ? 'ids' : 'count';
    return undefined;
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]!;
    if (endOfFlags) {
      positionals.push(token);
      continue;
    }
    if (token === '--') {
      endOfFlags = true;
      continue;
    }
    if (!token.startsWith('--')) {
      positionals.push(token);
      continue;
    }

    const eq = token.indexOf('=');
    const name = eq < 0 ? token.slice(2) : token.slice(2, eq);
    let inline = eq < 0 ? undefined : token.slice(eq + 1);
    const readValue = (): string => {
      if (inline !== undefined) {
        const value = inline;
        inline = undefined;
        return value;
      }
      const value = argv[i + 1];
      if (value === undefined || value.startsWith('--')) return `--${name} 需要一个值`;
      i += 1;
      return value;
    };

    if (BOOL_FLAGS.has(name)) {
      if (inline !== undefined) return { ok: false, message: `--${name} 不接受值` };
      if (name === 'all') all = true;
      else if (name === 'fail-if-empty') failIfEmpty = true;
      else if (name === 'help') help = true;
      else {
        used.add(name);
        if (name === 'seed') filters.seed = true;
        else if (name === 'deferred') filters.deferred = true;
        else if (name === 'no-route') filters.noRoute = true;
        else if (name === 'design') filters.design = true;
      }
      continue;
    }

    if (name === 'json' || name === 'ndjson' || name === 'ids' || name === 'count') {
      if (inline !== undefined) return { ok: false, message: `--${name} 不接受值` };
      const error = setFormat(name);
      if (error !== undefined) return { ok: false, message: error };
      continue;
    }

    if (name === 'limit' || name === 'depth' || name === 'out' || name === 'ids-file' || name === 'scope') {
      const value = readValue();
      if (value.startsWith('--')) {
        return { ok: false, message: value };
      }
      if (name === 'limit') {
        const number = Number(value);
        if (!Number.isInteger(number) || number < 1) return { ok: false, message: '--limit 需要正整数' };
        limit = number;
      } else if (name === 'depth') {
        const number = Number(value);
        if (!Number.isInteger(number) || number < 0) return { ok: false, message: '--depth 需要非负整数' };
        depth = number;
      } else if (name === 'out') {
        out = value;
      } else if (name === 'ids-file') {
        idsFiles.push(value);
      } else {
        if (value !== 'all' && value !== 'concrete') {
          return { ok: false, message: '--scope 只接受 all 或 concrete' };
        }
        filters.scopeAll = value === 'all';
        used.add('scope');
      }
      continue;
    }

    if (FILTER_FLAGS.has(name)) {
      const value = readValue();
      if (value.startsWith('--')) {
        return { ok: false, message: value };
      }
      used.add(name);
      const values = splitValues(value);
      if (name === 'state') pushAll(filters.state, values);
      else if (name === 'kind') pushAll(filters.kind, values);
      else if (name === 'failure') pushAll(filters.failure, values);
      else if (name === 'category') pushAll(filters.category, values);
      else if (name === 'prop') pushAll(filters.prop, values);
      else if (name === 'holds') pushAll(filters.holds, values);
      else if (name === 'producer') pushAll(filters.producer, values);
      else if (name === 'produces') pushAll(filters.produces, values);
      else if (name === 'uses') pushAll(filters.uses, values);
      else if (name === 'performer') pushAll(filters.performer, values);
      else if (name === 'param') pushAll(filters.param, values);
      else if (name === 'relax') pushAll(filters.relax, values);
      else if (name === 'reason') pushAll(filters.reason, values);
      continue;
    }

    return { ok: false, message: `未知参数：--${name}` };
  }

  const first = positionals[0];
  const helpSubject = first !== undefined && SUBJECTS[first] !== undefined ? SUBJECTS[first] : undefined;
  if (help) return { ok: true, help: true, helpSubject };

  if (first === undefined || SUBJECTS[first] === undefined) {
    return {
      ok: false,
      message:
        first === undefined
          ? '缺少主题：item/items、route/routes、needs、windows、gaps、why、path'
          : `未知主题：${first}`,
    };
  }
  positionals.shift();
  const subject = SUBJECTS[first]!;

  for (const flag of used) {
    if (!ALLOWED[subject].includes(flag)) {
      return { ok: false, message: `--${flag} 不适用于 ${subject}` };
    }
  }

  if (filters.state.length > 0) {
    const allowed = subject === 'items' ? ITEM_STATES : subject === 'routes' ? ROUTE_STATES : [];
    const bad = filters.state.filter((state) => !allowed.includes(state));
    if (bad.length > 0) {
      return {
        ok: false,
        message: `--state 对 ${subject} 只接受 ${allowed.join(' / ')}；不认识 ${bad.join(', ')}`,
      };
    }
  }
  for (const kind of filters.kind) {
    if (!KINDS.includes(kind)) return { ok: false, message: `--kind 只接受 ${KINDS.join(' / ')}` };
  }
  for (const reason of filters.reason) {
    if (!REASONS.includes(reason)) {
      return { ok: false, message: `--reason 只接受 ${REASONS.join(' / ')}` };
    }
  }
  for (const relax of filters.relax) {
    if (!RELAX.includes(relax)) {
      return { ok: false, message: `--relax 只接受 ${RELAX.join(' / ')}` };
    }
  }
  for (const failure of filters.failure) {
    if (!(FAILURE_CODES as readonly string[]).includes(failure)) {
      return {
        ok: false,
        message: `未知 failure 代码：${failure}\n可用：${FAILURE_CODES.join(', ')}`,
      };
    }
  }

  if (subject === 'why' || subject === 'path') {
    if (positionals.length !== 1) {
      return { ok: false, message: `${subject} 只接受一个 id` };
    }
    if (positionals[0]!.includes('*') || positionals[0]!.includes('?')) {
      return { ok: false, message: `${subject} 只接受精确 id，不接受通配` };
    }
    if (idsFiles.length > 0) {
      return { ok: false, message: `${subject} 不接受 --ids-file` };
    }
    if (limit !== undefined) {
      return { ok: false, message: `${subject} 不接受 --limit；展开深度用 --depth` };
    }
    if (format !== 'text' && format !== 'json') {
      return { ok: false, message: `${subject} 只支持 --json，不支持 --${format}` };
    }
  }

  return {
    ok: true,
    help: false,
    query: {
      subject,
      positionals,
      filters,
      format,
      all,
      limit,
      depth,
      out,
      idsFiles,
      failIfEmpty,
    },
  };
}

const globToRegExp = (pattern: string): RegExp => {
  let source = '^';
  for (const char of pattern) {
    if (char === '*') source += '.*';
    else if (char === '?') source += '.';
    else source += char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`${source}$`);
};

const readIdFile = (path: string): string[] => {
  const text = readFileSync(path === '-' ? 0 : path, 'utf8');
  return text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== '' && !line.startsWith('#'));
};

const itemUniverse = (index: ReachIndex, scopeAll: boolean): string[] =>
  (scopeAll ? index.data.items : index.concreteItems).map((item) => item.id);

const universeOf = (subject: Subject, index: ReachIndex, scopeAll: boolean): string[] => {
  if (subject === 'routes') return index.data.routes.map((route) => route.id);
  return itemUniverse(index, scopeAll);
};

const hasFilters = (filters: Filters): boolean =>
  filters.state.length > 0 ||
  filters.kind.length > 0 ||
  filters.failure.length > 0 ||
  filters.category.length > 0 ||
  filters.prop.length > 0 ||
  filters.holds.length > 0 ||
  filters.producer.length > 0 ||
  filters.produces.length > 0 ||
  filters.uses.length > 0 ||
  filters.performer.length > 0 ||
  filters.param.length > 0 ||
  filters.relax.length > 0 ||
  filters.reason.length > 0 ||
  filters.seed ||
  filters.deferred ||
  filters.noRoute ||
  filters.design;

export function resolveSelection(query: ParsedQuery, index: ReachIndex): Selection {
  const warnings: string[] = [];
  const tokens = [...query.positionals];
  for (const path of query.idsFiles) {
    try {
      tokens.push(...readIdFile(path));
    } catch (error) {
      return {
        ids: [],
        warnings,
        error: `读不了 --ids-file ${path}：${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  if (query.subject === 'why') {
    const id = query.positionals[0]!;
    if (index.itemById.has(id) || index.routeById.has(id)) return { ids: [id], warnings };
    return { ids: [], warnings, error: suggestionsMessage(index, id) };
  }
  if (query.subject === 'path') {
    const id = query.positionals[0]!;
    if (index.itemById.has(id)) return { ids: [id], warnings };
    return { ids: [], warnings, error: suggestionsMessage(index, id) };
  }

  const scopeAll = query.filters.scopeAll;
  const universe = universeOf(query.subject, index, scopeAll);
  const known = new Set(universe);
  const other =
    query.subject === 'routes'
      ? new Set(index.data.items.map((item) => item.id))
      : new Set(index.data.routes.map((route) => route.id));
  const ids: string[] = [];
  const missing: string[] = [];
  let matchedGlob = false;
  let exactSeen = 0;

  for (const token of tokens) {
    if (token.includes('*') || token.includes('?')) {
      const regexp = globToRegExp(token);
      const hits = universe.filter((id) => regexp.test(id));
      if (hits.length > 0) matchedGlob = true;
      for (const id of hits) if (!ids.includes(id)) ids.push(id);
      continue;
    }
    exactSeen += 1;
    if (known.has(token)) {
      if (!ids.includes(token)) ids.push(token);
      continue;
    }
    // 显式点名 iface/ 时照查；默认集合仍只含具体条目。
    if (query.subject !== 'routes' && index.itemById.has(token)) {
      if (!ids.includes(token)) ids.push(token);
      continue;
    }
    if (other.has(token)) {
      warnings.push(
        query.subject === 'routes'
          ? `${token} 是条目 id，不是路线；用 items ${token}`
          : `${token} 是路线 id，不是条目；用 routes ${token}`,
      );
      continue;
    }
    missing.push(token);
  }

  for (const id of missing) {
    warnings.push(`没有这个 id：${id}${suggestions(index, id)}`);
  }

  if (ids.length === 0 && tokens.length === 0) {
    if (!hasFilters(query.filters) && !query.all) {
      return {
        ids: [],
        warnings,
        error: '至少给一个 id、通配或过滤条件；全量请加 --all',
      };
    }
    for (const id of universe) ids.push(id);
  } else if (ids.length === 0 && exactSeen > 0 && missing.length === exactSeen && !matchedGlob) {
    return { ids: [], warnings, error: `没有匹配的 id：${missing.join(', ')}` };
  }

  let filtered = ids;
  if (query.subject === 'items') filtered = applyItemFilters(filtered, query.filters, index);
  else if (query.subject === 'routes') filtered = applyRouteFilters(filtered, query.filters, index);
  return { ids: [...filtered].sort(), warnings };
}

function applyItemFilters(ids: readonly string[], filters: Filters, index: ReachIndex): string[] {
  const categories = new Set(filters.category);
  return ids.filter((id) => {
    const item = index.itemById.get(id);
    if (item === undefined) return false;
    if (filters.state.length > 0 && !filters.state.includes(index.itemState(id))) return false;
    if (categories.size > 0 && !categories.has(item.category ?? 'material')) return false;
    if (filters.seed && !index.seedById.has(id)) return false;
    if (filters.deferred && item.deferred !== true) return false;
    if (filters.noRoute && (modelProducers(index, id).length > 0)) return false;
    if (filters.prop.length > 0) {
      const params = new Set((item.props ?? []).map((prop) => prop.param));
      if (!filters.prop.some((param) => params.has(param))) return false;
    }
    if (filters.holds.length > 0) {
      const params = new Set((item.holds ?? []).map((condition) => condition.param));
      if (!filters.holds.some((param) => params.has(param))) return false;
    }
    if (filters.producer.length > 0) {
      const producers = new Set(modelProducers(index, id));
      if (!filters.producer.some((route) => producers.has(route))) return false;
    }
    return true;
  });
}

function applyRouteFilters(ids: readonly string[], filters: Filters, index: ReachIndex): string[] {
  const designRoutes = new Set(index.design.routes);
  return ids.filter((id) => {
    const route = index.routeById.get(id);
    if (route === undefined) return false;
    if (filters.state.length > 0 && !filters.state.includes(index.routeState(id))) return false;
    if (filters.kind.length > 0) {
      const kind = index.blockedById.get(id)?.kind;
      if (kind === undefined || !filters.kind.includes(kind)) return false;
    }
    if (filters.failure.length > 0) {
      const codes = new Set((index.blockedById.get(id)?.failures ?? []).map((failure) => failure.code));
      if (!filters.failure.some((code) => codes.has(code as FailureCode))) return false;
    }
    if (filters.produces.length > 0) {
      const products = new Set(route.produces.map((term) => term.item));
      if (!filters.produces.some((item) => products.has(item))) return false;
    }
    if (filters.uses.length > 0) {
      const used = new Set(route.uses.flatMap((clause) => clause.anyOf.map((option) => option.item)));
      if (!filters.uses.some((item) => used.has(item))) return false;
    }
    if (filters.performer.length > 0) {
      const performers = new Set(
        [route.performedBy, ...(route.steps ?? []).map((step) => step.performedBy)].filter(
          (value): value is string => value !== undefined,
        ),
      );
      if (!filters.performer.some((item) => performers.has(item))) return false;
    }
    if (filters.design && !designRoutes.has(id)) return false;
    return true;
  });
}

function modelProducers(index: ReachIndex, id: string): string[] {
  return model.graph.producers.get(id) ?? [];
}

function suggestions(index: ReachIndex, id: string): string {
  const known = [
    ...index.concreteItems.map((item) => item.id),
    ...index.data.routes.map((route) => route.id),
  ];
  const direct = known.filter((candidate) => candidate.includes(id)).slice(0, 6);
  if (direct.length === 0) {
    const tail = id.split('/').at(-1) ?? id;
    const near = tail === id ? [] : known.filter((candidate) => candidate.includes(tail)).slice(0, 6);
    return near.length === 0 ? '' : `（相近：${near.join(', ')}）`;
  }
  return `（相近：${direct.join(', ')}）`;
}

function suggestionsMessage(index: ReachIndex, id: string): string {
  return `没有条目或路线 ${id}${suggestions(index, id)}`;
}

export function renderHelp(subject?: Subject): string {
  const head = `用法：node tools/query.ts <主题> [选择器...] [选项]

主题：
  item | items   条目卡片 / 条目列表
  route | routes 路线卡片 / 路线列表
  needs          按条目的需求信封（要什么、谁满足、差多少）
  windows        已交付窗口（谁给的、什么状态）
  gaps           全库未覆盖的需求窗口
  why            不可达条目 / 阻断路线的归因树（一个 id）
  path           从给定到条目的证明树（一个条目 id）

选择器：
  <id> <id> ...  精确 id，可多个
  '<glob>'       含 * 或 ? 的模式，如 'plant/robot/*'
  --ids-file <f> 从文件读 id（- = stdin；空行与 # 开头行跳过）

过滤：
  --state ...    条目：${ITEM_STATES.join('|')}
                 路线：${ROUTE_STATES.join('|')}
  --kind ...     路线：${KINDS.join('|')}
  --failure ...  路线：${FAILURE_CODES.join('|')}
  --category ... 条目类别
  --prop / --holds <param>       条目声明了该属性 / 条件
  --producer <route>             条目由该路线产出
  --produces / --uses <item>     路线的产物 / 输入引用该条目
  --performer <item>             路线的执行者（含工序）
  --param <param>                needs / windows / gaps 的参数
  --relax ...                    needs / gaps：${RELAX.join('|')}
  --reason ...                   gaps：${REASONS.join('|')}
  --design                       含 design 的记录
  --seed / --deferred / --no-route
  --scope all                    含 iface/ 抽象接口（默认只查具体条目）

输出：
  --json | --ndjson | --ids | --count
  --all                          不截断记录数与卡片内列表
  --limit N                      限制记录数（人读默认 50）
  --depth N                      why / path 的深度（why 默认 4；path 默认 2；--all 不限）
  --out <file>                   UTF-8 写文件（避免 PowerShell 重定向编码）
  --fail-if-empty                零结果时退出 1
  --help [主题]                  本帮助

退出码：0 = 执行成功（含 0 条）；1 = --fail-if-empty 且 0 条；2 = 用法错 / 模型错误。

标记：★ 给定 · ✓ 干净 · △ 降级 · ↑ 先降级后升级 · ✗ 阻断 / 不可达`;

  if (subject === undefined) return head;
  const extra: Record<Subject, string> = {
    items: 'items：按条目查状态、产出、消费、装配、交付窗口。',
    routes: 'routes：按路线查输入、执行、条件、交付、失败与 kept。',
    needs: 'needs：按被需要的条目查每个窗口谁要、谁供、差在哪。',
    windows: 'windows：按交付方条目查已交付窗口；design 标“不算”。',
    gaps: 'gaps：全库未被严格交付覆盖的需求窗口；不给 id 时需 --all 或过滤。',
    why: 'why：沿缺失输入下钻；规格叶子显示现有窗口与阻断候选。',
    path: 'path：优先干净路线，其次首次可用路线；每步标轮次与 kept。',
  };
  return `${extra[subject]}\n\n${head}`;
}
