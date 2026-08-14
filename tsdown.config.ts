import { defineConfig } from 'tsdown'

export default defineConfig({
  root: 'src',
  entry: ['src/index.tsx', 'src/client/index.ts', 'src/client/client.gen.ts'],
  unbundle: true,
  fixedExtension: false,
  sourcemap: true,
  target: false,
  publint: true,
  attw: {
    profile: 'esm-only',
  },
})
