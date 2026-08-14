import { createClient, createConfig, type Client } from '../client/client'
import config from '../config'
import { CliError } from './errors'
import type { GlobalCommandOptions } from './types'

export interface CliContext {
  readonly json: boolean
  readonly config: typeof config
  createClient(): Client
}

export function createCliContext(options: GlobalCommandOptions = {}): CliContext {
  return {
    json: options.json === true,
    config,
    createClient() {
      const apiKey = config.get('apiKey', '')

      if (apiKey.length === 0) {
        throw new CliError('Missing API key. Run `quote0 auth` first.', {
          code: 'MISSING_API_KEY',
        })
      }

      return createClient(
        createConfig({
          auth: apiKey,
          baseUrl: 'https://dot.mindreset.tech',
          throwOnError: true,
        }),
      )
    },
  }
}
