import { defineConfig } from 'tsdown'

export default defineConfig({
  root: 'src',
  entry: {
    index: './src/index.tsx',
    'client/index': './src/client/index.ts',
    client: './src/entries/client.ts',
  },
  unbundle: true,
  fixedExtension: false,
  sourcemap: true,
  target: false,
  publint: true,
  attw: {
    profile: 'esm-only',
  },
})
