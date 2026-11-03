import type { CondLite, ItemRaw, PropLite, RouteRaw, ViewerModel } from './model.ts';
import { formatQty, formatRange, labelOf } from './model.ts';
import { CATEGORIES } from './theme.ts';
import { escapeHtml as esc } from './render.ts';

function catLabel(cat: string): string {
  return CATEGORIES[cat]?.label ?? cat;
}

function badge(text: string, color?: string, cls = ''): string {
  return `<span class="badge ${cls}"${color ? ` style="--badge:${color}"` : ''}>${esc(text)}</span>`;
}

function navRow(model: ViewerModel, id: string, meta = ''): string {
  const node = model.nodeById.get(id);
  const color = node?.color ?? '#64748b';
  const label = node?.label ?? labelOf(id);
  const kind = node?.kind === 'route' ? (node.route?.kind === 'measure' ? '测量' : '路线') : catLabel(node?.cat ?? '');
  return `<button class="nav-row" data-nav="${esc(id)}" title="${esc(id)}">
    <span class="nav-dot" style="background:${color}"></span>
    <span class="nav-label">${esc(label)}</span>
    <span class="nav-kind">${esc(kind)}</span>
    <span class="nav-meta">${esc(meta)}</span>
  </button>`;
}

function navList(model: ViewerModel, ids: readonly string[], limit: number, empty = '无'): string {
  if (ids.length === 0) return `<p class="empty">${esc(empty)}</p>`;
  const shown = ids.slice(0, limit).map((id) => navRow(model, id));
  const rest = ids.length - limit;
  return `<div class="nav-list">${shown.join('')}${
    rest > 0 ? `<p class="more">另有 ${rest} 项 · 用搜索或聚焦查看</p>` : ''
  }</div>`;
}

function declValue(p: PropLite): string {
  if (p.k === 'range') return `${formatRange(p.min, p.max, p.u)}${p.d ? ` · ${dirLabel(p.d)}` : ''}`;
  if (p.k === 'enum') return (p.v ?? []).join(' / ');
  return `≥ ${(p.v ?? []).join(' / ')}`;
}

function reqValue(p: PropLite): string {
  if (p.k === 'range') {
    const dir = p.d === 'atLeast' ? ' ↑' : p.d === 'atMost' ? ' ↓' : '';
    return `${formatRange(p.min, p.max)}${dir}${p.design ? ' · 设计' : ''}`;
  }
  if (p.k === 'enum') return (p.oneOf ?? []).join(' / ');
  return `≥ ${(p.atLeast ?? []).join(' / ')}`;
}

function dirLabel(dir: string): string {
  if (dir === 'atLeast') return '越大越好';
  if (dir === 'atMost') return '越小越好';
  return '窗口';
}

function condRows(conds: readonly CondLite[]): string {
  return `<div class="cond-list">${conds
    .map(
      (c) => `<div class="cond-row">
        <span class="cond-name">${esc(c.p)}</span>
        <span class="cond-val">${esc(formatRange(c.min, c.max))}</span>
        ${c.design ? '<span class="tag design">设计</span>' : ''}
      </div>`,
    )
    .join('')}</div>`;
}

function section(title: string, body: string, note = ''): string {
  return `<section class="section">
    <h4>${esc(title)}${note ? `<span class="h4-note">${esc(note)}</span>` : ''}</h4>
    ${body}
  </section>`;
}

function propSection(props: readonly PropLite[] | undefined): string {
  if (props === undefined || props.length === 0) {
    return section('规格声明', '<p class="empty">未声明属性</p>');
  }
  const rows = props
    .map(
      (p) => `<div class="prop-row">
        <span class="prop-name">${esc(p.p)}</span>
        <span class="prop-kind">${esc(p.k)}</span>
        <span class="prop-val">${esc(declValue(p))}</span>
      </div>`,
    )
    .join('');
  return section('规格声明', `<div class="prop-list">${rows}</div>`, `${props.length} 项`);
}

function tags(item: ItemRaw): string {
  const out: string[] = [badge(catLabel(item.iface ? 'interface' : item.cat), CATEGORIES[item.iface ? 'interface' : item.cat]?.color)];
  if (item.seed) out.push(badge('种子', '#fbbf24', 'outline'));
  if (item.mars) out.push(badge('火星地板', '#34d399', 'outline'));
  if (item.iface) out.push(badge('抽象接口', '#94a3b8', 'outline'));
  if (item.mono) out.push(badge('单体', '#94a3b8', 'outline'));
  if (item.deferred) out.push(badge('未定义', '#fb7185', 'outline'));
  return `<div class="badges">${out.join('')}</div>`;
}

function kv(key: string, value: string): string {
  return `<div class="kv"><span class="kv-key">${esc(key)}</span><span class="kv-val">${value}</span></div>`;
}

export function itemDetailsHtml(model: ViewerModel, id: string): string {
  const node = model.nodeById.get(id);
  const item = node?.item;
  if (!node || !item) return `<p class="empty">未找到条目 ${esc(id)}</p>`;

  const producers = model.producersByItem.get(id) ?? [];
  const consumers = model.consumersByItem.get(id) ?? [];
  const needers = model.needersByItem.get(id) ?? [];
  const performers = model.performersByItem.get(id) ?? [];
  const parents = model.parentsByComponent.get(id) ?? [];

  const metaRows = [
    item.unit ? kv('计量单位', esc(item.unit)) : '',
    item.mass !== undefined ? kv('单件质量', `${esc(formatQty(item.mass))} kg`) : '',
    kv('连接度', String(node.degree)),
    item.ext ? kv('实现接口', `<code>${esc(item.ext)}</code>`) : '',
  ].join('');

  const comp = item.comp?.length
    ? `<div class="nav-list">${item.comp
        .map((c) => {
          const row = navRow(model, c.sel ?? c.i, `× ${formatQty(c.q)}`);
          return row;
        })
        .join('')}</div>`
    : '<p class="empty">无组成清单</p>';

  const holds = item.holds?.length
    ? condRows(item.holds)
    : '<p class="empty">不维持条件</p>';

  const note = item.seed
    ? '<p class="note">种子条目：第一件从地球运来，从第二件起必须有本地路线（R9）。</p>'
    : item.mars
      ? '<p class="note">火星地板：不需要路线，现场即可取。</p>'
      : '';

  return `<div class="entity">
    <div class="entity-head">
      <h2 class="entity-label">${esc(node.label)}</h2>
      <code class="entity-id">${esc(item.id)}</code>
      ${tags(item)}
      <div class="entity-actions">
        <button class="btn primary small" data-focus="${esc(item.id)}">在图中聚焦</button>
      </div>
    </div>
    ${note}
    <div class="kv-grid">${metaRows}</div>
    ${propSection(item.props)}
    ${item.cat === 'machine' ? section('维持条件', holds) : ''}
    ${section('组成', comp, item.comp ? `${item.comp.length} 件` : '')}
    ${section('产出它的路线', navList(model, producers, 10, '没有产出路线（外部输入或待补）'), `${producers.length} 条`)}
    ${section('消耗它的路线', navList(model, consumers, 10), `${consumers.length} 条`)}
    ${needers.length ? section('把它当前提的路线', navList(model, needers, 6), `${needers.length} 条`) : ''}
    ${performers.length ? section('由它执行的路线', navList(model, performers, 6), `${performers.length} 条`) : ''}
    ${parents.length ? section('装进哪些条目', navList(model, parents, 8), `${parents.length} 件`) : ''}
  </div>`;
}

export function routeDetailsHtml(model: ViewerModel, id: string): string {
  const node = model.nodeById.get(id);
  const route = node?.route;
  if (!node || !route) return `<p class="empty">未找到路线 ${esc(id)}</p>`;

  const kindBadge = badge(route.kind === 'measure' ? '测量路线' : '制造路线', route.kind === 'measure' ? '#2dd4bf' : '#8fa1bd');
  const metaRows = [
    kv('批量工时', route.rate !== undefined ? `${esc(formatQty(route.rate))} h / 批` : '未声明'),
    kv('投料子句', String(route.u.length)),
    kv('产物', String(route.p.length)),
    kv('前提', String(route.n.length)),
    kv('执行设备', String(route.pb.length)),
    kv('工序段', String(route.steps.length)),
  ].join('');

  const produces = route.p.length
    ? `<div class="nav-list">${route.p
        .map((t) => {
          const gives = t.g?.length
            ? `<details class="fold"><summary>交付规格 ${t.g.length} 项</summary><div class="cond-list">${t.g
                .map(
                  (g) => `<div class="cond-row"><span class="cond-name">${esc(g.p)}</span><span class="cond-val">${esc(reqValue(g))}</span></div>`,
                )
                .join('')}</div></details>`
            : '';
          return `<div class="term"><div class="term-row">${navRow(model, t.i, `× ${formatQty(t.q)}`)}</div>${gives}</div>`;
        })
        .join('')}</div>`
    : '<p class="empty">无产物</p>';

  const uses = route.u.length
    ? route.u
        .map(
          (cl, i) => `<div class="clause">
            <div class="clause-head">子句 ${i + 1}${cl.anyOf.length > 1 ? ' · 任选其一' : ''}</div>
            ${cl.anyOf
              .map((o) => {
                const need = o.need?.length
                  ? `<details class="fold"><summary>要求规格 ${o.need.length} 项</summary><div class="cond-list">${o.need
                      .map(
                        (g) => `<div class="cond-row"><span class="cond-name">${esc(g.p)}</span><span class="cond-val">${esc(reqValue(g))}</span></div>`,
                      )
                      .join('')}</div></details>`
                  : '';
                return `<div class="term">${navRow(model, o.i, `× ${formatQty(o.q)}`)}${need}</div>`;
              })
              .join('')}
          </div>`,
        )
        .join('')
    : '<p class="empty">无投料</p>';

  const needs = route.n.length
    ? `<div class="nav-list">${route.n
        .map((n) => navRow(model, n.i, n.q !== 1 ? `× ${formatQty(n.q)}` : ''))
        .join('')}</div>`
    : '<p class="empty">无前提</p>';

  const performers = route.pb.length
    ? `<div class="chip-list">${route.pb.map((p) => navRow(model, p)).join('')}</div>`
    : '<p class="empty">未指定执行设备</p>';

  const steps = route.steps.length
    ? `<ol class="step-list">${route.steps
        .map(
          (s) =>
            `<li>${s.b ? navRow(model, s.b) : '<span class="empty">未写执行者</span>'}${
              s.u?.length ? `<span class="step-cond">${s.u.length} 项条件</span>` : ''
            }${s.n ? `<span class="step-note">${esc(s.n)}</span>` : ''}</li>`,
        )
        .join('')}</ol>`
    : '<p class="empty">未写工序链</p>';

  const under = route.under.length ? condRows(route.under) : '<p class="empty">无路线级条件</p>';

  return `<div class="entity">
    <div class="entity-head">
      <h2 class="entity-label">${esc(node.label)}</h2>
      <code class="entity-id">${esc(route.id)}</code>
      <div class="badges">${kindBadge}${badge(`${route.p.length} 产物`, '#2dd4bf', 'outline')}${badge(`${route.u.length} 投料`, '#fb923c', 'outline')}</div>
      <div class="entity-actions">
        <button class="btn primary small" data-focus="${esc(route.id)}">在图中聚焦</button>
      </div>
    </div>
    <div class="kv-grid">${metaRows}</div>
    ${section('产物', produces, `${route.p.length} 项`)}
    ${section('投料', uses, `${route.u.length} 子句`)}
    ${section('前提', needs, `${route.n.length} 项`)}
    ${section('执行设备', performers, `${route.pb.length} 台`)}
    ${section('工序链', steps, `${route.steps.length} 段`)}
    ${section('条件', under, `${route.under.length} 项`)}
    ${route.unbal ? `<section class="section"><h4>质量账说明</h4><p class="quote">${esc(route.unbal)}</p></section>` : ''}
  </div>`;
}

export function overviewHtml(model: ViewerModel): string {
  const { meta } = model.file;
  const counts = meta.counts;
  const totalCats = Object.values(counts.categories).reduce((a, b) => a + b, 0) || 1;
  const categories = (['material', 'part', 'machine', 'consumable', 'carrier'] as const)
    .map((cat) => {
      const n = counts.categories[cat] ?? 0;
      const pct = (n / totalCats) * 100;
      const c = CATEGORIES[cat]!;
      return `<div class="dist-row">
        <span class="dist-name"><i style="background:${c.color}"></i>${esc(c.label)}</span>
        <span class="dist-bar"><i style="width:${pct.toFixed(2)}%;background:${c.color}"></i></span>
        <span class="dist-num">${n}</span>
      </div>`;
    })
    .join('');

  const hubs = [...model.nodes]
    .filter((n) => n.kind === 'item')
    .sort((a, b) => b.degree - a.degree)
    .slice(0, 9);

  const seeds = model.nodes.filter((n) => n.item?.seed);
  const routes = model.routes.length;
  const links = model.links.length;

  return `<div class="overview">
    <p class="intro">把 <code>data/</code> 的全部条目与路线摊成一张网：圆点是物件，菱形是路线；连线是投料、产出、前提、执行与组成。点任意节点查看原文与规格。</p>
    <div class="stat-grid">
      <div class="stat"><b>${counts.items.toLocaleString('zh-CN')}</b><span>条目</span></div>
      <div class="stat"><b>${routes.toLocaleString('zh-CN')}</b><span>路线</span></div>
      <div class="stat"><b>${links.toLocaleString('zh-CN')}</b><span>连线</span></div>
      <div class="stat ${meta.validation.errors ? 'bad' : 'good'}"><b>${meta.validation.errors}</b><span>校验错误</span></div>
    </div>
    ${section('类别分布', `<div class="dist">${categories}</div>`, `${counts.items} 条目`)}
    ${section(
      '种子 · 第一件从地球来',
      `<div class="seed-chips">${seeds
        .map((n) => `<button class="seed-chip" data-nav="${esc(n.id)}">${esc(n.label)}</button>`)
        .join('')}</div>`,
      `${seeds.length} 件`,
    )}
    ${section(
      '连接度最高',
      `<div class="nav-list">${hubs.map((n) => navRow(model, n.id, `连接 ${n.degree}`)).join('')}</div>`,
      '点击跳转',
    )}
    ${section(
      '读法',
      `<p class="hint-block">滚轮缩放、拖拽旋转、右键平移；单击节点在右侧看详情。左侧可以按类别与连线类型过滤，也可以把某个节点的一至三跳邻域单独摊开。橙色是投料、青色是产出、紫色是执行、蓝色是组成；「前提」默认关闭。选中节点后按「聚焦选中节点」，只留下它的邻域重排，用来顺着上下游读一张局部网。</p>`,
    )}
    <p class="generated">数据生成于 ${esc(new Date(meta.generatedAt).toLocaleString('zh-CN', { hour12: false }))} · ${meta.validation.notes} 条校验提示</p>
  </div>`;
}
