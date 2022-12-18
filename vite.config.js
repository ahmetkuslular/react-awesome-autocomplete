import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import dts from 'vite-plugin-dts'
import vitePluginLinter from 'vite-plugin-linter'
import * as packageJson from './package.json'

const { EsLinter, linterPlugin } = vitePluginLinter

export default defineConfig((configEnv) => ({
  plugins: [
    react(),
    linterPlugin({
      include: ['./src}/**/*.{js,jsx}'],
      linters: [new EsLinter({ configEnv })],
    }),
    dts({
      include: ['src/'],
    }),
  ],
  build: {
    lib: {
      entry: resolve('src/', 'index.js'),
      name: 'ReactAwesomeAutocomplete',
      formats: ['es', 'umd'],
      fileName: (format) => `react-awesome-autocomplete.${format}.js`,
    },
    rollupOptions: {
      external: [...Object.keys(packageJson.peerDependencies)],
    },
  },
}))
