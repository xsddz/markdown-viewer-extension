/**
 * Markdown Viewer SDK Build Script
 *
 * Output formats:
 * - ESM: For Vue/React/modern browsers
 * - IIFE: For <script> tags
 * - IIFE.min: For production CDN
 */
import * as esbuild from 'esbuild';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Read version from main project to keep in sync
const pkg = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf-8'));
const version = pkg.version;

// Ensure dist directory exists
const distDir = join(__dirname, 'dist');
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

// Common build options
const commonOptions = {
  entryPoints: [join(__dirname, 'src/index.ts')],
  bundle: true,
  sourcemap: true,
  define: {
    '__VERSION__': JSON.stringify(version),
  },
  platform: 'browser',
};

async function build() {
  console.log(`\n📦 Building markdown-viewer-sdk v${version}...\n`);

  // Generate SDK data (base styles from CSS + theme data from JSON)
  console.log('  ⏳ Generating SDK data...');
  execSync('node scripts/generate-themes.js', { cwd: __dirname, stdio: 'inherit' });

  // 1. ESM format
  await esbuild.build({
    ...commonOptions,
    format: 'esm',
    outfile: join(distDir, 'index.esm.js'),
  });
  console.log('  ✓ ESM build → dist/index.esm.js');

  // 2. IIFE format (development)
  await esbuild.build({
    ...commonOptions,
    format: 'iife',
    globalName: 'MarkdownViewer',
    outfile: join(distDir, 'index.iife.js'),
  });
  console.log('  ✓ IIFE build → dist/index.iife.js');

  // 3. IIFE format (production, minified)
  await esbuild.build({
    ...commonOptions,
    format: 'iife',
    globalName: 'MarkdownViewer',
    minify: true,
    outfile: join(distDir, 'index.iife.min.js'),
  });
  console.log('  ✓ IIFE minified → dist/index.iife.min.js');

  console.log(`\n✅ Build complete!\n`);
}

build().catch((err) => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
