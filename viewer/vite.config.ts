import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import type { Plugin, ViteDevServer } from 'vite';

const ROOT = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(ROOT, '../data');
const CORE_DIR = resolve(ROOT, '../src/core');
const GRAPH_FILE = join(ROOT, 'public/graph.json');

function isUnder(dir: string, file: string): boolean {
  const rel = relative(dir, resolve(file));
  return rel !== '' && !rel.startsWith('..') && !isAbsolute(rel);
}

function isWatched(file: string): boolean {
  return isUnder(DATA_DIR, file) || isUnder(CORE_DIR, file);
}

function generateGraph(): Promise<boolean> {
  return new Promise((done) => {
    const child = spawn(
      process.execPath,
      [join(ROOT, 'scripts/generate.ts'), '--out', GRAPH_FILE],
      { cwd: ROOT, stdio: 'inherit' },
    );
    child.on('error', (error) => {
      console.error('[viewer] 无法启动数据生成器:', error.message);
      done(false);
    });
    child.on('close', (code) => {
      if (code !== 0) console.error(`[viewer] 数据生成失败，退出码 ${code}`);
      done(code === 0);
    });
  });
}

function dataPlugin(): Plugin {
  let server: ViteDevServer | undefined;
  let timer: NodeJS.Timeout | undefined;
  let chain: Promise<boolean> = Promise.resolve(true);

  const regenerate = (): Promise<boolean> => {
    chain = chain.then(() => generateGraph());
    return chain;
  };

  const schedule = (): void => {
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(() => {
      console.log('[viewer] data/ 变化，重建 graph.json…');
      void regenerate().then((ok) => {
        if (ok) server?.ws.send({ type: 'full-reload' });
      });
    }, 650);
  };

  return {
    name: 'mygame30-viewer-data',
    async buildStart() {
      // `pnpm build` 已先跑过 generate.ts；这里只兜底“直接 vite build 且没有 graph.json”。
      if (existsSync(GRAPH_FILE)) return;
      const ok = await regenerate();
      if (!ok) throw new Error('graph.json 生成失败，构建中止');
    },
    configureServer(devServer) {
      server = devServer;
      devServer.watcher.add([DATA_DIR, CORE_DIR]);
      for (const event of ['change', 'add', 'unlink'] as const) {
        devServer.watcher.on(event, (file: string) => {
          if (isWatched(file)) schedule();
        });
      }
      if (!existsSync(GRAPH_FILE)) {
        console.warn(`[viewer] 缺少 ${relative(ROOT, GRAPH_FILE)}，正在生成…`);
        void regenerate();
      }
    },
  };
}

export default defineConfig({
  root: ROOT,
  base: './',
  plugins: [dataPlugin()],
  server: {
    host: '127.0.0.1',
    port: 5273,
    strictPort: false,
    watch: {
      ignored: ['**/public/graph.json', '**/shots/**', '**/.chrome-profile/**'],
    },
  },
  preview: {
    host: '127.0.0.1',
    port: 5273,
  },
  optimizeDeps: {
    include: ['three', 'd3-force-3d'],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
    chunkSizeWarningLimit: 800,
  },
});
