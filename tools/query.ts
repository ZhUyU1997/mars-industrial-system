/**
 * 只读查询 —— 条目 / 路线 / 需求 / 窗口 / 缺口 / 归因 / 证明树。
 *
 * 判据不在这里：状态与窗口取自 `buildReach()` 的同一份快照；本文件只做
 * 选择、筛选与排版，不改 data，也不参与闸门判定。
 *
 * 退出码：0 = 执行成功（含 0 条）；1 = --fail-if-empty 且 0 条；
 * 2 = 用法错 / 模型校验失败 / id 不存在。
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  formatGapRow,
  formatItem,
  formatItemRow,
  formatNeeds,
  formatNeedsRow,
  formatRoute,
  formatRouteRow,
  formatWindowRow,
  itemReport as buildItemReport,
  needsReport as buildNeedsReport,
  routeReport as buildRouteReport,
} from './query/cards.ts';
import { reachIndex } from './query/index.ts';
import { parseQuery, renderHelp, resolveSelection } from './query/select.ts';
import { buildPath, buildWhy, formatPath, formatWhy } from './query/why.ts';
import type { ParsedQuery, Subject } from './query/select.ts';
import type { GapRow, NeedRow, ReachIndex, WindowRow } from './query/index.ts';
import type { Reach } from './lib/reach.ts';

export interface QueryRun {
  readonly status: 0 | 1 | 2;
  readonly stdout: string;
  readonly stderr: string;
  readonly out?: string;
}

/** 兼容旧调用：按 id 取单条报告。 */
export const itemReport = (id: string) => buildItemReport(reachIndex(), id);
export const routeReport = (id: string) => buildRouteReport(reachIndex(), id);
export const needsReport = (id: string) => buildNeedsReport(reachIndex(), id);

const withNewline = (text: string): string => (text === '' || text.endsWith('\n') ? text : `${text}\n`);

const chosenLimit = (query: ParsedQuery, machine: boolean): number => {
  if (query.limit !== undefined) return query.limit;
  if (query.all) return Number.POSITIVE_INFINITY;
  return machine ? Number.POSITIVE_INFINITY : 50;
};

const rowMatches = (row: NeedRow, query: ParsedQuery): boolean => {
  const { filters } = query;
  if (filters.param.length > 0 && !filters.param.includes(row.param)) return false;
  if (filters.design && row.need.design !== true) return false;
  if (filters.relax.length > 0) {
    if (!row.sites.some((site) => site.onRelax !== undefined && filters.relax.includes(site.onRelax))) {
      return false;
    }
  }
  return true;
};

const gapMatches = (row: GapRow, query: ParsedQuery): boolean => {
  if (!rowMatches(row, query)) return false;
  if (query.filters.reason.length > 0) {
    if (row.reason === undefined || !query.filters.reason.includes(row.reason)) return false;
  }
  return true;
};

const windowMatches = (row: WindowRow, query: ParsedQuery): boolean => {
  const { filters } = query;
  if (filters.param.length > 0 && !filters.param.includes(row.give.param)) return false;
  // 默认只列严格交付；--design 只列设计声明（含阻断路线上的声明）。
  if (query.filters.design) {
    if (!row.design) return false;
  } else if (row.design) {
    return false;
  }
  return true;
};

const uniqueIds = (ids: readonly string[]): string[] => [...new Set(ids)];

export function runQuery(argv: readonly string[], options: { readonly reach?: Reach } = {}): QueryRun {
  const parsed = parseQuery(argv);
  if (!parsed.ok) {
    return {
      status: 2,
      stdout: '',
      stderr: `${parsed.message}\n用 --help 看用法\n`,
    };
  }
  if (parsed.help) {
    return { status: 0, stdout: withNewline(renderHelp(parsed.helpSubject)), stderr: '' };
  }

  const query = parsed.query;
  let index: ReachIndex;
  try {
    index = reachIndex(options.reach);
  } catch (error) {
    return {
      status: 2,
      stdout: '',
      stderr: `${error instanceof Error ? error.message : String(error)}\n`,
    };
  }

  const selection = resolveSelection(query, index);
  const warnings = selection.warnings.map((warning) => `注意：${warning}\n`).join('');
  if (selection.error !== undefined) {
    return { status: 2, stdout: '', stderr: `${warnings}${selection.error}\n` };
  }
  if (selection.ids.length === 0) {
    return {
      status: query.failIfEmpty ? 1 : 0,
      stdout: '',
      stderr: `${warnings}没有匹配的记录\n`,
    };
  }

  const machine = query.format !== 'text';
  const limit = chosenLimit(query, machine);
  const out = query.out;

  if (query.subject === 'why' || query.subject === 'path') {
    const id = selection.ids[0]!;
    const defaultDepth = query.subject === 'path' ? 2 : 4;
    const depth = query.depth ?? (query.all ? Number.POSITIVE_INFINITY : defaultDepth);
    const maxChildren = query.all ? Number.POSITIVE_INFINITY : 5;
    if (query.subject === 'why') {
      const node = buildWhy(index, id, { depth, maxChildren });
      if (node === undefined) {
        return { status: 2, stdout: '', stderr: `没有条目或路线 ${id}\n` };
      }
      const stdout =
        query.format === 'json' ? `${JSON.stringify(node, null, 2)}\n` : `${formatWhy(node)}\n`;
      return { status: 0, stdout, stderr: warnings, out };
    }
    const node = buildPath(index, id, { depth, maxChildren });
    if (node === undefined) {
      return { status: 2, stdout: '', stderr: `没有条目 ${id}\n` };
    }
    const stdout =
      query.format === 'json' ? `${JSON.stringify(node, null, 2)}\n` : `${formatPath(node)}\n`;
    return { status: 0, stdout, stderr: warnings, out };
  }

  if (query.subject === 'items') {
    const reports = selection.ids
      .map((id) => buildItemReport(index, id))
      .filter((report): report is NonNullable<typeof report> => report !== undefined);
    return emitReports(reports, query, warnings, out, formatItem, formatItemRow);
  }
  if (query.subject === 'routes') {
    const reports = selection.ids
      .map((id) => buildRouteReport(index, id))
      .filter((report): report is NonNullable<typeof report> => report !== undefined);
    return emitReports(reports, query, warnings, out, formatRoute, formatRouteRow);
  }

  if (query.subject === 'needs') {
    const rowFiltered =
      query.filters.param.length > 0 || query.filters.design || query.filters.relax.length > 0;
    const base = selection.ids
      .map((id) => buildNeedsReport(index, id))
      .filter((report): report is NonNullable<typeof report> => report !== undefined);
    const reports = rowFiltered
      ? base
          .map((report) => ({ ...report, rows: report.rows.filter((row) => rowMatches(row, query)) }))
          .filter((report) => report.rows.length > 0)
      : base;

    if (query.format === 'count') {
      return { status: reports.length === 0 && query.failIfEmpty ? 1 : 0, stdout: `${reports.length}\n`, stderr: warnings, out };
    }
    if (query.format === 'ids') {
      return { status: reports.length === 0 && query.failIfEmpty ? 1 : 0, stdout: withNewline(reports.map((report) => report.id).join('\n')), stderr: warnings, out };
    }
    if (query.format === 'json' || query.format === 'ndjson') {
      const records = reports.slice(0, limit);
      const stdout =
        query.format === 'json'
          ? `${JSON.stringify(records.length === 1 ? records[0] : records, null, 2)}\n`
          : withNewline(records.map((record) => JSON.stringify(record)).join('\n'));
      return { status: reports.length === 0 && query.failIfEmpty ? 1 : 0, stdout, stderr: warnings, out };
    }
    const shown = reports.slice(0, limit);
    const text =
      shown.length === 0
        ? '没有匹配的记录'
        : shown.length === 1
          ? formatNeeds(shown[0]!, query.all)
          : shown.map((report) => formatNeedsRow(report)).join('\n');
    return {
      status: reports.length === 0 && query.failIfEmpty ? 1 : 0,
      stdout: `${text}\n`,
      stderr: warnings,
      out,
    };
  }

  if (query.subject === 'windows') {
    const rows = index.windowRows(selection.ids).filter((row) => windowMatches(row, query));
    return emitRows(
      rows,
      query,
      warnings,
      out,
      formatWindowRow,
      uniqueIds(rows.map((row) => row.item)),
      '\n',
    );
  }

  const rows = index.gapRows(selection.ids).filter((row) => gapMatches(row, query));
  return emitRows(
    rows,
    query,
    warnings,
    out,
    (row) => formatGapRow(row, query.all),
    uniqueIds(rows.map((row) => row.item)),
  );
}

function emitReports<T extends { readonly id: string }>(
  reports: readonly T[],
  query: ParsedQuery,
  warnings: string,
  out: string | undefined,
  card: (record: T, all: boolean) => string,
  row: (record: T) => string,
): QueryRun {
  const status: 0 | 1 = reports.length === 0 && query.failIfEmpty ? 1 : 0;
  if (query.format === 'count') {
    return { status, stdout: `${reports.length}\n`, stderr: warnings, out };
  }
  if (query.format === 'ids') {
    return {
      status,
      stdout: withNewline(reports.map((report) => report.id).join('\n')),
      stderr: warnings,
      out,
    };
  }
  if (query.format === 'json' || query.format === 'ndjson') {
    const records = reports.slice(0, chosenLimit(query, true));
    const stdout =
      query.format === 'json'
        ? `${JSON.stringify(records.length === 1 ? records[0] : records, null, 2)}\n`
        : withNewline(records.map((record) => JSON.stringify(record)).join('\n'));
    return { status, stdout, stderr: warnings, out };
  }

  const shown = reports.slice(0, chosenLimit(query, false));
  const text =
    shown.length === 1
      ? card(shown[0]!, query.all)
      : shown.map((record) => row(record)).join('\n');
  const tail =
    reports.length > shown.length
      ? `\n… 另有 ${reports.length - shown.length} 条（--all 展开，--limit 调整）`
      : '';
  return { status, stdout: withNewline(`${text}${tail}`), stderr: warnings, out };
}

function emitRows<T extends { readonly item: string }>(
  rows: readonly T[],
  query: ParsedQuery,
  warnings: string,
  out: string | undefined,
  format: (row: T) => string,
  ids: readonly string[],
  separator = '\n\n',
): QueryRun {
  const status: 0 | 1 = rows.length === 0 && query.failIfEmpty ? 1 : 0;
  if (query.format === 'count') {
    return { status, stdout: `${rows.length}\n`, stderr: warnings, out };
  }
  if (query.format === 'ids') {
    return { status, stdout: withNewline(ids.join('\n')), stderr: warnings, out };
  }
  if (query.format === 'json' || query.format === 'ndjson') {
    const limit = chosenLimit(query, true);
    const shown = rows.slice(0, limit);
    const stdout =
      query.format === 'json'
        ? `${JSON.stringify(shown.length === 1 ? shown[0] : shown, null, 2)}\n`
        : withNewline(shown.map((row) => JSON.stringify(row)).join('\n'));
    return { status, stdout, stderr: warnings, out };
  }
  const limit = chosenLimit(query, false);
  const shown = rows.slice(0, limit);
  const text = shown.length === 0 ? '没有匹配的记录' : shown.map(format).join(separator);
  const tail = rows.length > shown.length ? `\n… 另有 ${rows.length - shown.length} 条` : '';
  return { status, stdout: withNewline(`${text}${tail}`), stderr: warnings, out };
}

const isMain =
  process.argv[1] !== undefined &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (isMain) {
  const run = runQuery(process.argv.slice(2));
  if (run.out !== undefined) {
    try {
      writeFileSync(run.out, run.stdout, 'utf8');
    } catch (error) {
      process.stderr.write(
        `写不了 --out ${run.out}：${error instanceof Error ? error.message : String(error)}\n`,
      );
      process.exitCode = 2;
    }
  } else {
    process.stdout.write(run.stdout);
  }
  process.stderr.write(run.stderr);
  if (process.exitCode !== 2) process.exitCode = run.status;
}

export type { Subject };
