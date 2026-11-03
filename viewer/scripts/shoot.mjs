/**
 * 用 Playwright 驱动本机 Chrome，打开 viewer 并留下截图与断言。
 *
 *   node scripts/shoot.mjs
 *
 * 不下载浏览器：channel 固定为 chrome（本机安装的 Chrome）。
 * 会顺带启动一个临时 Vite dev server，跑完自动关闭。
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { createServer } from 'vite';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SHOT_DIR = join(ROOT, 'shots');
const GRAPH_FILE = join(ROOT, 'public/graph.json');

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA ? join(process.env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe') : undefined,
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);

const chromePath = CHROME_CANDIDATES.find((candidate) => existsSync(candidate));

function log(message) {
  console.log(`[viewer:shoot] ${message}`);
}

async function launchChrome() {
  const args = ['--font-render-hinting=none', '--force-color-profile=srgb', '--hide-scrollbars'];
  try {
    return await chromium.launch({ channel: 'chrome', headless: true, args });
  } catch (error) {
    if (chromePath === undefined) throw error;
    log(`channel=chrome 启动失败，改用 ${chromePath}`);
    return chromium.launch({ executablePath: chromePath, headless: true, args });
  }
}

async function main() {
  log('生成 graph.json…');
  execFileSync(process.execPath, [join(ROOT, 'scripts/generate.ts'), '--out', GRAPH_FILE], {
    cwd: ROOT,
    stdio: 'inherit',
  });
  mkdirSync(SHOT_DIR, { recursive: true });

  log('启动 Vite…');
  const server = await createServer({
    root: ROOT,
    configFile: join(ROOT, 'vite.config.ts'),
    logLevel: 'warn',
    server: { host: '127.0.0.1', port: 5273, strictPort: false },
  });
  await server.listen();
  const url = server.resolvedUrls?.local?.[0] ?? 'http://127.0.0.1:5273/';
  log(`URL ${url}`);

  let browser;
  const errors = [];
  const checks = [];
  try {
    browser = await launchChrome();
    const context = await browser.newContext({
      viewport: { width: 1600, height: 1000 },
      deviceScaleFactor: 1,
      colorScheme: 'dark',
      locale: 'zh-CN',
    });
    const page = await context.newPage();
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(`console: ${message.text()}`);
    });
    page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
    page.on('requestfailed', (request) => {
      if (!request.url().includes('favicon')) errors.push(`requestfailed: ${request.url()} ${request.failure()?.errorText}`);
    });

    await page.goto(url, { waitUntil: 'load', timeout: 60000 });
    await page.waitForFunction(() => Boolean(window.__viewer?.ready), null, { timeout: 60000 });

    const counts = await page.evaluate(() => window.__viewer.counts);
    checks.push({ name: '数据规模', ok: counts.nodes > 5000 && counts.links > 20000, value: counts });

    const settled = await page
      .waitForFunction(() => window.__viewer?.settled() === true, null, { timeout: 30000 })
      .then(() => true)
      .catch(() => false);
    checks.push({ name: '布局就绪', ok: settled, value: settled ? 'precomputed 3D layout' : 'timeout (继续截图)' });
    log(settled ? '3D 布局已就绪' : '布局未在 30s 内就绪，继续截图');

    await page.waitForTimeout(700);
    await page.evaluate(() => window.__viewer.fit());
    await page.waitForTimeout(900);
    await page.screenshot({ path: join(SHOT_DIR, '01-overview.png') });

    const labelCount = await page.locator('.label3d').count();
    checks.push({ name: '标签数量', ok: labelCount >= 20, value: labelCount });
    const labelSpread = await page.evaluate(() => {
      const rects = Array.from(document.querySelectorAll('.label3d')).map((el) =>
        el.getBoundingClientRect(),
      );
      const graph = document.querySelector('#graph');
      return {
        minX: Math.min(...rects.map((r) => r.left)),
        maxX: Math.max(...rects.map((r) => r.right)),
        minY: Math.min(...rects.map((r) => r.top)),
        maxY: Math.max(...rects.map((r) => r.bottom)),
        width: graph instanceof HTMLElement ? graph.clientWidth : 0,
        height: graph instanceof HTMLElement ? graph.clientHeight : 0,
      };
    });
    checks.push({
      name: '标签覆盖范围',
      ok:
        labelSpread.maxX - labelSpread.minX > labelSpread.width * 0.6 &&
        labelSpread.maxY - labelSpread.minY > labelSpread.height * 0.4,
      value: labelSpread,
    });

    const canvasInfo = await page.evaluate(() => {
      const canvas = document.querySelector('#graph canvas');
      if (!(canvas instanceof HTMLCanvasElement)) return null;
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      return {
        width: canvas.width,
        height: canvas.height,
        webgl: Boolean(gl),
        render: window.__viewer.render(),
      };
    });
    checks.push({
      name: '3D 画布',
      ok: Boolean(
        canvasInfo?.webgl &&
          canvasInfo.width > 0 &&
          canvasInfo.render.nodes > 5000 &&
          canvasInfo.render.calls > 0,
      ),
      value: canvasInfo,
    });

    const status = await page.textContent('#status-text');
    checks.push({ name: '状态栏', ok: Boolean(status && status.length > 4), value: status });

    await page.mouse.move(700, 500);
    await page.waitForTimeout(350);
    const hoverTooltip = page.locator('.scene-tooltip');
    const hoverVisible = await hoverTooltip.isVisible();
    const hoverText = (await hoverTooltip.textContent())?.trim().slice(0, 60);
    checks.push({
      name: '3D 悬停提示',
      ok: Boolean(hoverVisible && hoverText && hoverText.includes('连接度')),
      value: { hoverVisible, hoverText },
    });
    await page.mouse.move(100, 400);
    await page.waitForTimeout(200);

    // 搜索交互
    await page.click('#search');
    await page.fill('#search', 'lathe');
    await page.waitForSelector('.search-row', { timeout: 5000 });
    const results = await page.locator('.search-row').count();
    checks.push({ name: '搜索结果', ok: results > 0, value: results });
    await page.fill('#search', '精密车床');
    await page.waitForTimeout(300);
    const zhResults = await page.locator('.search-row').count();
    checks.push({ name: '中文名搜索', ok: zhResults > 0, value: zhResults });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);

    // 选中 lathe，右侧应出现条目详情
    const selected = await page.evaluate(() => window.__viewer.select('lathe'));
    await page.waitForTimeout(1000);
    const detail = await page.textContent('#details-body');
    checks.push({
      name: '条目详情',
      ok: Boolean(
        selected &&
          detail &&
          detail.includes('lathe') &&
          detail.includes('精密车床') &&
          detail.includes('产出它的路线'),
      ),
      value: detail?.slice(0, 80),
    });
    await page.screenshot({ path: join(SHOT_DIR, '02-item-lathe.png') });

    // 过滤：关掉“执行”连线，可见连线应减少
    const beforeFilter = await page.evaluate(() => window.__viewer.stats());
    await page.locator('input[data-filter-edge="performs"]').uncheck();
    await page.waitForTimeout(400);
    const afterFilter = await page.evaluate(() => window.__viewer.stats());
    checks.push({
      name: '过滤生效',
      ok: afterFilter.visibleLinks < beforeFilter.visibleLinks,
      value: { before: beforeFilter.visibleLinks, after: afterFilter.visibleLinks },
    });
    await page.locator('input[data-filter-edge="performs"]').check();
    await page.waitForTimeout(300);

    // 聚焦：lathe 一跳邻域
    await page.evaluate(() => window.__viewer.focus('lathe', 1));
    await page.waitForTimeout(3200);
    const focusStats = await page.evaluate(() => window.__viewer.stats());
    checks.push({
      name: '聚焦邻域',
      ok: focusStats.focus !== null && focusStats.focus > 10 && focusStats.focus < counts.nodes,
      value: focusStats,
    });
    await page.evaluate(() => window.__viewer.fit());
    await page.waitForTimeout(800);
    await page.screenshot({ path: join(SHOT_DIR, '03-focus-lathe.png') });

    // 聚焦：量块（种子）二跳邻域，展示一张有上下游的局部网
    await page.evaluate(() => window.__viewer.focus('plant/gauge-block', 2));
    await page.waitForTimeout(3500);
    await page.evaluate(() => window.__viewer.fit());
    await page.waitForTimeout(900);
    const gaugeStats = await page.evaluate(() => window.__viewer.stats());
    checks.push({
      name: '种子聚焦',
      ok: gaugeStats.focus !== null && gaugeStats.focus > 100 && gaugeStats.focus < counts.nodes,
      value: gaugeStats,
    });
    await page.screenshot({ path: join(SHOT_DIR, '04-focus-gauge.png') });

    // 清除聚焦必须回到全库坐标，而不是带回聚焦子图的局部坐标
    await page.evaluate(() => window.__viewer.clear());
    await page.waitForTimeout(500);
    const restored = await page.evaluate(() => window.__viewer.stats());
    checks.push({
      name: '清除聚焦恢复全库',
      ok: restored.visibleNodes === counts.nodes && restored.visibleLinks === beforeFilter.visibleLinks,
      value: restored,
    });
    await page.evaluate(() => window.__viewer.fit());
    await page.waitForTimeout(500);
    await page.screenshot({ path: join(SHOT_DIR, '05-overview-restored.png') });

    // 标签密度必须随视口缩小，而不是依赖一个写死的数量
    await page.setViewportSize({ width: 900, height: 600 });
    await page.waitForTimeout(450);
    const smallLabelCount = await page.locator('.label3d').count();
    checks.push({
      name: '小屏标签密度',
      ok: smallLabelCount > 0 && smallLabelCount < labelCount,
      value: { large: labelCount, small: smallLabelCount },
    });
    await page.screenshot({ path: join(SHOT_DIR, '06-small-viewport.png') });

    const failed = checks.filter((check) => !check.ok);
    const summary = {
      url,
      chrome: chromePath ?? 'channel:chrome',
      shots: [
        '01-overview.png',
        '02-item-lathe.png',
        '03-focus-lathe.png',
        '04-focus-gauge.png',
        '05-overview-restored.png',
        '06-small-viewport.png',
      ],
      checks,
      errors,
      ok: failed.length === 0 && errors.length === 0,
    };
    log(JSON.stringify(summary, null, 2));
    if (!summary.ok) process.exitCode = 1;
  } finally {
    await browser?.close().catch(() => {});
    await server.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
