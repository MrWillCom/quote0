import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    // temporarily stop building src/index
    // 'src/index.tsx',
    'src/client/index.ts',
  ],
  format: ['esm'],
  clean: true,
  minify: true,
  dts: true,
  target: false,
  unbundle: true,
  fixedExtension: false,
})
