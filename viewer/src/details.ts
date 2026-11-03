import type { CondLite, ItemRaw, PropLite, ViewerModel } from './model.ts';
import { formatQty, formatRange, labelOf } from './model.ts';
import { CATEGORIES } from './theme.ts';
import { escapeHtml as esc } from './render.ts';
import { catLabel, getLang, n as fmtN, nodeKindLabel, nodeLabel, t, unitLabel } from './i18n.ts';

function badge(text: string, color?: string, cls = ''): string {
  return `<span class="badge ${cls}"${color ? ` style="--badge:${color}"` : ''}>${esc(text)}</span>`;
}

function navRow(model: ViewerModel, id: string, meta = ''): string {
  const node = model.nodeById.get(id);
  const color = node?.color ?? '#64748b';
  const label = node !== undefined ? nodeLabel(node) : labelOf(id);
  const kind = node !== undefined ? nodeKindLabel(node) : '';
  return `<button class="nav-row" data-nav="${esc(id)}" title="${esc(id)}">
    <span class="nav-dot" style="background:${color}"></span>
    <span class="nav-label">${esc(label)}</span>
    <span class="nav-kind">${esc(kind)}</span>
    <span class="nav-meta">${esc(meta)}</span>
  </button>`;
}

function navList(model: ViewerModel, ids: readonly string[], limit: number, empty = t('details.none')): string {
  if (ids.length === 0) return `<p class="empty">${esc(empty)}</p>`;
  const shown = ids.slice(0, limit).map((id) => navRow(model, id));
  const rest = ids.length - limit;
  return `<div class="nav-list">${shown.join('')}${
    rest > 0 ? `<p class="more">${esc(t('details.more', { n: fmtN(rest) }))}</p>` : ''
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
    return `${formatRange(p.min, p.max)}${dir}${p.design ? ` · ${t('details.prop.design')}` : ''}`;
  }
  if (p.k === 'enum') return (p.oneOf ?? []).join(' / ');
  return `≥ ${(p.atLeast ?? []).join(' / ')}`;
}

function dirLabel(dir: string): string {
  if (dir === 'atLeast') return t('details.prop.atLeast');
  if (dir === 'atMost') return t('details.prop.atMost');
  return t('details.prop.window');
}

function condRows(conds: readonly CondLite[]): string {
  return `<div class="cond-list">${conds
    .map(
      (c) => `<div class="cond-row">
        <span class="cond-name">${esc(c.p)}</span>
        <span class="cond-val">${esc(formatRange(c.min, c.max))}</span>
        ${c.design ? `<span class="tag design">${esc(t('details.prop.design'))}</span>` : ''}
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
    return section(t('details.specs'), `<p class="empty">${esc(t('details.noProps'))}</p>`);
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
  return section(
    t('details.specs'),
    `<div class="prop-list">${rows}</div>`,
    t('details.propsCount', { n: fmtN(props.length) }),
  );
}

function tags(item: ItemRaw): string {
  const cat = item.iface ? 'interface' : item.cat;
  const out: string[] = [badge(catLabel(cat), CATEGORIES[cat]?.color)];
  if (item.seed) out.push(badge(t('details.seed'), '#fbbf24', 'outline'));
  if (item.mars) out.push(badge(t('details.mars'), '#34d399', 'outline'));
  if (item.iface) out.push(badge(t('details.abstract'), '#94a3b8', 'outline'));
  if (item.mono) out.push(badge(t('details.monolithic'), '#94a3b8', 'outline'));
  if (item.deferred) out.push(badge(t('details.deferred'), '#fb7185', 'outline'));
  return `<div class="badges">${out.join('')}</div>`;
}

function kv(key: string, value: string): string {
  return `<div class="kv"><span class="kv-key">${esc(key)}</span><span class="kv-val">${value}</span></div>`;
}

export function itemDetailsHtml(model: ViewerModel, id: string): string {
  const node = model.nodeById.get(id);
  const item = node?.item;
  if (!node || !item) return `<p class="empty">${esc(t('details.notFoundItem', { id }))}</p>`;

  const producers = model.producersByItem.get(id) ?? [];
  const consumers = model.consumersByItem.get(id) ?? [];
  const needers = model.needersByItem.get(id) ?? [];
  const performers = model.performersByItem.get(id) ?? [];
  const parents = model.parentsByComponent.get(id) ?? [];

  const metaRows = [
    item.unit ? kv(t('details.unit'), esc(unitLabel(item.unit))) : '',
    item.mass !== undefined ? kv(t('details.mass'), `${esc(formatQty(item.mass))} kg`) : '',
    kv(t('details.degree'), fmtN(node.degree)),
    item.ext ? kv(t('details.interface'), `<code>${esc(item.ext)}</code>`) : '',
  ].join('');

  const comp = item.comp?.length
    ? `<div class="nav-list">${item.comp
        .map((c) => navRow(model, c.sel ?? c.i, `× ${formatQty(c.q)}`))
        .join('')}</div>`
    : `<p class="empty">${esc(t('details.noComponents'))}</p>`;

  const holds = item.holds?.length
    ? condRows(item.holds)
    : `<p class="empty">${esc(t('details.noHolds'))}</p>`;

  const note = item.seed
    ? `<p class="note">${esc(t('details.seedNote'))}</p>`
    : item.mars
      ? `<p class="note">${esc(t('details.marsNote'))}</p>`
      : '';

  return `<div class="entity">
    <div class="entity-head">
      <h2 class="entity-label">${esc(nodeLabel(node))}</h2>
      ${node.label === node.labelZh ? '' : `<p class="entity-alt">${esc(getLang() === 'en' ? node.labelZh : node.label)}</p>`}
      <code class="entity-id">${esc(item.id)}</code>
      ${tags(item)}
      <div class="entity-actions">
        <button class="btn primary small" data-focus="${esc(item.id)}">${esc(t('details.focusGraph'))}</button>
      </div>
    </div>
    ${note}
    <div class="kv-grid">${metaRows}</div>
    ${propSection(item.props)}
    ${item.cat === 'machine' ? section(t('details.holds'), holds) : ''}
    ${section(t('details.composition'), comp, item.comp ? t('details.compositionCount', { n: fmtN(item.comp.length) }) : '')}
    ${section(t('details.producers'), navList(model, producers, 10, t('details.noProducers')), t('details.producersCount', { n: fmtN(producers.length) }))}
    ${section(t('details.consumers'), navList(model, consumers, 10), t('details.consumersCount', { n: fmtN(consumers.length) }))}
    ${needers.length ? section(t('details.needers'), navList(model, needers, 6), t('details.needersCount', { n: fmtN(needers.length) })) : ''}
    ${performers.length ? section(t('details.performers'), navList(model, performers, 6), t('details.performersCount', { n: fmtN(performers.length) })) : ''}
    ${parents.length ? section(t('details.parents'), navList(model, parents, 8), t('details.parentsCount', { n: fmtN(parents.length) })) : ''}
  </div>`;
}

export function routeDetailsHtml(model: ViewerModel, id: string): string {
  const node = model.nodeById.get(id);
  const route = node?.route;
  if (!node || !route) return `<p class="empty">${esc(t('details.notFoundRoute', { id }))}</p>`;

  const kindBadge = badge(
    route.kind === 'measure' ? t('details.route.measure') : t('details.route.make'),
    route.kind === 'measure' ? '#2dd4bf' : '#8fa1bd',
  );
  const metaRows = [
    kv(
      t('details.route.batchHours'),
      route.rate !== undefined
        ? esc(t('details.route.batch', { n: formatQty(route.rate) }))
        : esc(t('details.route.notDeclared')),
    ),
    kv(t('details.route.inputClauses'), fmtN(route.u.length)),
    kv(t('details.route.outputs'), fmtN(route.p.length)),
    kv(t('details.route.prerequisites'), fmtN(route.n.length)),
    kv(t('details.route.equipment'), fmtN(route.pb.length)),
    kv(t('details.route.steps'), fmtN(route.steps.length)),
  ].join('');

  const produces = route.p.length
    ? `<div class="nav-list">${route.p
        .map((term) => {
          const gives = term.g?.length
            ? `<details class="fold"><summary>${esc(t('details.route.deliverySpecs', { n: fmtN(term.g.length) }))}</summary><div class="cond-list">${term.g
                .map(
                  (g) => `<div class="cond-row"><span class="cond-name">${esc(g.p)}</span><span class="cond-val">${esc(reqValue(g))}</span></div>`,
                )
                .join('')}</div></details>`
            : '';
          return `<div class="term"><div class="term-row">${navRow(model, term.i, `× ${formatQty(term.q)}`)}</div>${gives}</div>`;
        })
        .join('')}</div>`
    : `<p class="empty">${esc(t('details.route.noOutputs'))}</p>`;

  const uses = route.u.length
    ? route.u
        .map(
          (clause, i) => `<div class="clause">
            <div class="clause-head">${esc(t('details.route.clause', { n: fmtN(i + 1) }))}${clause.anyOf.length > 1 ? ` · ${esc(t('details.route.anyOf'))}` : ''}</div>
            ${clause.anyOf
              .map((option) => {
                const need = option.need?.length
                  ? `<details class="fold"><summary>${esc(t('details.route.requiredSpecs', { n: fmtN(option.need.length) }))}</summary><div class="cond-list">${option.need
                      .map(
                        (g) => `<div class="cond-row"><span class="cond-name">${esc(g.p)}</span><span class="cond-val">${esc(reqValue(g))}</span></div>`,
                      )
                      .join('')}</div></details>`
                  : '';
                return `<div class="term">${navRow(model, option.i, `× ${formatQty(option.q)}`)}${need}</div>`;
              })
              .join('')}
          </div>`,
        )
        .join('')
    : `<p class="empty">${esc(t('details.route.noInputs'))}</p>`;

  const needs = route.n.length
    ? `<div class="nav-list">${route.n
        .map((need) => navRow(model, need.i, need.q !== 1 ? `× ${formatQty(need.q)}` : ''))
        .join('')}</div>`
    : `<p class="empty">${esc(t('details.route.noPrereq'))}</p>`;

  const performers = route.pb.length
    ? `<div class="chip-list">${route.pb.map((p) => navRow(model, p)).join('')}</div>`
    : `<p class="empty">${esc(t('details.route.noEquipment'))}</p>`;

  const steps = route.steps.length
    ? `<ol class="step-list">${route.steps
        .map(
          (step) =>
            `<li>${step.b ? navRow(model, step.b) : `<span class="empty">${esc(t('details.noPerformer'))}</span>`}${
              step.u?.length ? `<span class="step-cond">${esc(t('details.stepConditions', { n: fmtN(step.u.length) }))}</span>` : ''
            }${step.n ? `<span class="step-note">${esc(step.n)}</span>` : ''}</li>`,
        )
        .join('')}</ol>`
    : `<p class="empty">${esc(t('details.route.noSteps'))}</p>`;

  const under = route.under.length
    ? condRows(route.under)
    : `<p class="empty">${esc(t('details.route.noConditions'))}</p>`;

  return `<div class="entity">
    <div class="entity-head">
      <h2 class="entity-label">${esc(nodeLabel(node))}</h2>
      ${node.label === node.labelZh ? '' : `<p class="entity-alt">${esc(getLang() === 'en' ? node.labelZh : node.label)}</p>`}
      <code class="entity-id">${esc(route.id)}</code>
      <div class="badges">${kindBadge}${badge(t('details.route.outputsBadge', { n: fmtN(route.p.length) }), '#2dd4bf', 'outline')}${badge(t('details.route.inputsBadge', { n: fmtN(route.u.length) }), '#fb923c', 'outline')}</div>
      <div class="entity-actions">
        <button class="btn primary small" data-focus="${esc(route.id)}">${esc(t('details.focusGraph'))}</button>
      </div>
    </div>
    <div class="kv-grid">${metaRows}</div>
    ${section(t('details.route.outputs'), produces, t('details.route.outputsCount', { n: fmtN(route.p.length) }))}
    ${section(t('details.route.inputs'), uses, t('details.route.inputsCount', { n: fmtN(route.u.length) }))}
    ${section(t('details.route.prerequisites'), needs, t('details.route.prereqCount', { n: fmtN(route.n.length) }))}
    ${section(t('details.route.equipment'), performers, t('details.route.equipmentCount', { n: fmtN(route.pb.length) }))}
    ${section(t('details.route.steps'), steps, t('details.route.stepsCount', { n: fmtN(route.steps.length) }))}
    ${section(t('details.route.conditions'), under, t('details.route.conditionsCount', { n: fmtN(route.under.length) }))}
    ${route.unbal ? `<section class="section"><h4>${esc(t('details.route.massNote'))}</h4><p class="quote">${esc(route.unbal)}</p></section>` : ''}
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
        <span class="dist-name"><i style="background:${c.color}"></i>${esc(catLabel(cat))}</span>
        <span class="dist-bar"><i style="width:${pct.toFixed(2)}%;background:${c.color}"></i></span>
        <span class="dist-num">${fmtN(n)}</span>
      </div>`;
    })
    .join('');

  const hubs = [...model.nodes]
    .filter((node) => node.kind === 'item')
    .sort((a, b) => b.degree - a.degree)
    .slice(0, 9);

  const seeds = model.nodes.filter((node) => node.item?.seed);
  const routes = model.routes.length;
  const links = model.links.length;
  const date = new Date(meta.generatedAt).toLocaleString(getLang() === 'en' ? 'en-US' : 'zh-CN', {
    hour12: false,
  });

  return `<div class="overview">
    <p class="intro">${t('overview.intro')}</p>
    <div class="stat-grid">
      <div class="stat"><b>${fmtN(counts.items)}</b><span>${esc(t('overview.items'))}</span></div>
      <div class="stat"><b>${fmtN(routes)}</b><span>${esc(t('overview.routes'))}</span></div>
      <div class="stat"><b>${fmtN(links)}</b><span>${esc(t('overview.links'))}</span></div>
      <div class="stat ${meta.validation.errors ? 'bad' : 'good'}"><b>${fmtN(meta.validation.errors)}</b><span>${esc(t('overview.errors'))}</span></div>
    </div>
    ${section(t('overview.categories'), `<div class="dist">${categories}</div>`, t('overview.categoriesCount', { n: fmtN(counts.items) }))}
    ${section(
      t('overview.seeds'),
      `<div class="seed-chips">${seeds
        .map((node) => `<button class="seed-chip" data-nav="${esc(node.id)}">${esc(nodeLabel(node))}</button>`)
        .join('')}</div>`,
      t('overview.seedsCount', { n: fmtN(seeds.length) }),
    )}
    ${section(
      t('overview.hubs'),
      `<div class="nav-list">${hubs.map((node) => navRow(model, node.id, t('overview.degree', { n: fmtN(node.degree) }))).join('')}</div>`,
      t('overview.hubsCount'),
    )}
    ${section(t('overview.reading'), `<p class="hint-block">${esc(t('overview.readingText'))}</p>`)}
    <p class="generated">${esc(t('overview.generated', { date, n: fmtN(meta.validation.notes) }))}</p>
  </div>`;
}
