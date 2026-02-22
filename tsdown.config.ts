import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['esm'],
  clean: true,
  minify: true,
  dts: false,
  target: false,
})
