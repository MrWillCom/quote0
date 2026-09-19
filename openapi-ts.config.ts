import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: 'https://github.com/MindReset/dot_skill/raw/refs/heads/main/openapi/dot-openapi.yaml',
  output: {
    path: './src/client',
    postProcess: ['oxfmt'],
  },
  plugins: [
    '@hey-api/typescript',
    {
      name: '@hey-api/transformers',
      dates: true,
    },
    {
      name: '@hey-api/sdk',
      transformer: true,
      paramsStructure: 'flat',
    },
  ],
})
