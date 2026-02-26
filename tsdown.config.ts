import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.tsx', 'src/api/index.ts'],
  format: ['esm'],
  clean: true,
  minify: true,
  dts: true,
  target: false,
  unbundle: true,
})
