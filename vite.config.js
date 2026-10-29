import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { transform } from 'esbuild';

const esbuildMinify = () => ({
  name: 'esbuild-minify',
  renderChunk: async (code) => {
    const result = await transform(code, { minify: true, sourcemap: true });
    return { code: result.code, map: result.map };
  }
});

const copyArtifacts = () => ({
  name: 'copy-artifacts',
  closeBundle: () => {
    try {
      const distDir = resolve(import.meta.dirname, 'dist');
      mkdirSync(distDir, { recursive: true });

      // Copy TypeScript declarations if exists
      const dtsPath = resolve(import.meta.dirname, 'src/index.d.ts');
      if (existsSync(dtsPath)) {
        copyFileSync(dtsPath, resolve(distDir, 'index.d.ts'));
      }

      // Create backward-compatible .cjs.js file if built
      const cjsPath = resolve(distDir, 'videojs-shuttle-controls.cjs');
      if (existsSync(cjsPath)) {
        copyFileSync(cjsPath, resolve(distDir, 'videojs-shuttle-controls.cjs.js'));
      }
    } catch (e) {
      console.warn('Failed to copy artifacts:', e);
    }
  }
});

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
    lib: {
      entry: resolve(import.meta.dirname, 'src/plugin.js'),
      name: 'videojsShuttleControls'
    },
    rollupOptions: {
      external: ['video.js'],
      output: [
        {
          format: 'es',
          entryFileNames: 'videojs-shuttle-controls.es.js'
        },
        {
          format: 'cjs',
          entryFileNames: 'videojs-shuttle-controls.cjs',
          exports: 'auto'
        },
        {
          format: 'umd',
          name: 'videojsShuttleControls',
          entryFileNames: 'videojs-shuttle-controls.js',
          globals: {
            'video.js': 'videojs'
          }
        },
        {
          format: 'umd',
          name: 'videojsShuttleControls',
          entryFileNames: 'videojs-shuttle-controls.min.js',
          globals: {
            'video.js': 'videojs'
          },
          plugins: [esbuildMinify()]
        }
      ]
    }
  },
  plugins: [copyArtifacts()],
  test: {
    environment: 'jsdom',
    globals: true
  }
});
