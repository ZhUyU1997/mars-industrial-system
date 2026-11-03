/**
 * 数据快照护栏（第 65 条测试）。
 *
 * 读 `test/id-snapshot.json`（由 `node tools/id-snapshot.ts --write` 生成），
 * 与当前装载结果逐条比对：**缺失 / 多余 / 内容变化 / 计数变化** 全为 0 才通过。
 *
 * 目的：以后谁再写 codemod、批量改数据、换加载器 —— 丢条目或悄悄改内容会立刻红，
 * 不依赖人记得比快照。要接受一次有意的数据变更：跑 `--write` 并一起提交。
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { model } from '../tools/lib/index.ts';
import { SNAPSHOT_PATH, compare, isClean, snapshotOf, type Snapshot } from '../tools/id-snapshot.ts';

describe('数据快照', () => {
  it('与 test/id-snapshot.json 一致（缺失/多余/内容变化/计数变化 全 0）', () => {
    const expected = JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf8')) as Snapshot;
    const actual = snapshotOf(model.data);
    const diff = compare(expected, actual);
    const lines = [
      diff.missing.length ? `缺失 ${diff.missing.length}：${diff.missing.slice(0, 20).join(', ')}` : '',
      diff.extra.length ? `多余 ${diff.extra.length}：${diff.extra.slice(0, 20).join(', ')}` : '',
      diff.changed.length ? `内容变化 ${diff.changed.length}：${diff.changed.slice(0, 20).join(', ')}` : '',
      diff.countChanged.length ? `计数变化 ${diff.countChanged.length}：${diff.countChanged.join(', ')}` : '',
    ].filter(Boolean);
    assert.ok(isClean(diff), `与快照不一致（接受变更请跑 node tools/id-snapshot.ts --write）：\n${lines.join('\n')}`);
  });
});
