import fs from 'node:fs/promises'
import type { CAC } from 'cac'
import { createCliContext } from '../context'
import { CliError, toCliError } from '../errors'
import { sdkData } from '../sdk'
import type { GlobalCommandOptions } from '../types'

const API_PREFIX = '/api/authV2/open'
const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] as const

type HttpVerb = (typeof HTTP_METHODS)[number]

interface ApiCommandOptions extends GlobalCommandOptions {
  method?: string
  rawField?: string | string[]
  field?: string | string[]
  input?: string
  header?: string | string[]
}

export function registerApiCommand(cli: CAC) {
  cli
    .command('api [endpoint]', 'Make an authenticated HTTP request')
    .usage('api <endpoint> [options]')
    .example('api devices')
    .example('api device/ABCD1234/status')
    .example('api -X POST device/ABCD1234/text -f message="Hello"')
    .example('api --input body.json -X POST device/ABCD1234/canvas')
    .option(
      '-X, --method <method>',
      'The HTTP method for the request (default GET, or POST when fields are set)',
    )
    .option('-f, --raw-field <key=value>', 'Add a string parameter in key=value format')
    .option(
      '-F, --field <key=value>',
      'Add a typed parameter in key=value format (use "@file" or "@-" to read a value from a file or stdin)',
    )
    .option(
      '--input <file>',
      'The file to use as body for the HTTP request (use "-" to read from standard input)',
    )
    .option('-H, --header <header>', 'Add a HTTP request header in key:value format')
    .action(async (endpoint: string | undefined, options: ApiCommandOptions) => {
      try {
        await runApiCommand(endpoint, options)
      } catch (error) {
        writeApiError(error)
      }
    })
}

async function runApiCommand(endpoint: string | undefined, options: ApiCommandOptions) {
  if (typeof endpoint !== 'string' || endpoint.length === 0) {
    throw new CliError('Missing API endpoint. Usage: `quote0 api <endpoint>`.', {
      code: 'MISSING_ENDPOINT',
    })
  }

  const rawFields = asList(options.rawField)
  const typedFields = asList(options.field)
  const hasFields = rawFields.length > 0 || typedFields.length > 0
  const inputPath = typeof options.input === 'string' ? options.input : undefined
  const stdinUsed = { current: false }

  const method = resolveMethod(options.method, hasFields)
  const { baseUrl, url } = resolveEndpoint(endpoint)
  const headers = parseHeaders(asList(options.header))
  const params = await parseFields(rawFields, typedFields, stdinUsed)

  let body: unknown
  let query: Record<string, unknown> | undefined
  const fieldsAsQuery =
    inputPath != null || method === 'GET' || method === 'HEAD' || method === 'DELETE'

  if (inputPath != null) {
    body = await readRequestBody(inputPath, stdinUsed)
  }

  if (hasFields) {
    if (fieldsAsQuery) {
      query = params
    } else {
      body = params
    }
  }

  const client = createCliContext(options).createClient()
  const data = await sdkData(
    client.request({
      ...(baseUrl != null && { baseUrl }),
      ...(body !== undefined && { body }),
      headers,
      method,
      ...(query != null && { query }),
      throwOnError: true,
      url,
    }),
  )

  process.stdout.write(`${JSON.stringify(data, null, 2)}\n`)
}

function resolveMethod(method: string | undefined, hasFields: boolean): HttpVerb {
  if (method == null) {
    return hasFields ? 'POST' : 'GET'
  }

  const normalized = method.toUpperCase()

  if (!HTTP_METHODS.includes(normalized as HttpVerb)) {
    throw new CliError(
      `Invalid --method: ${method}. Expected one of: ${HTTP_METHODS.join(', ')}.`,
      {
        code: 'INVALID_METHOD',
      },
    )
  }

  return normalized as HttpVerb
}

function resolveEndpoint(endpoint: string): { baseUrl?: string; url: string } {
  if (/^https?:\/\//.test(endpoint)) {
    const parsed = new URL(endpoint)
    return {
      baseUrl: parsed.origin,
      url: `${parsed.pathname}${parsed.search}`,
    }
  }

  if (endpoint.startsWith('/')) {
    return { url: endpoint }
  }

  return { url: `${API_PREFIX}/${endpoint.replace(/^\/+/, '')}` }
}

function parseHeaders(values: string[]) {
  const headers: Record<string, string> = {}

  for (const value of values) {
    const separator = value.indexOf(':')

    if (separator <= 0) {
      throw new CliError(`Invalid --header: ${value}. Expected \`key:value\`.`, {
        code: 'INVALID_HEADER',
      })
    }

    const name = value.slice(0, separator).trim()
    const headerValue = value.slice(separator + 1).trim()

    if (name.length === 0) {
      throw new CliError(`Invalid --header: ${value}. Expected \`key:value\`.`, {
        code: 'INVALID_HEADER',
      })
    }

    headers[name] = headerValue
  }

  return headers
}

async function parseFields(
  rawFields: string[],
  typedFields: string[],
  stdinUsed: { current: boolean },
) {
  const params: Record<string, unknown> = {}

  for (const entry of rawFields) {
    const [key, value] = splitKeyValue(entry, 'raw-field')
    assignField(params, key, await resolveFieldValue(value, false, stdinUsed))
  }

  for (const entry of typedFields) {
    const [key, value] = splitKeyValue(entry, 'field')
    assignField(params, key, await resolveFieldValue(value, true, stdinUsed))
  }

  return params
}

function splitKeyValue(entry: string, flag: string): [string, string] {
  const separator = entry.indexOf('=')

  if (separator <= 0) {
    throw new CliError(`Invalid --${flag}: ${entry}. Expected \`key=value\`.`, {
      code: `INVALID_${flag.replaceAll('-', '_').toUpperCase()}`,
    })
  }

  return [entry.slice(0, separator), entry.slice(separator + 1)]
}

async function resolveFieldValue(
  value: string,
  typed: boolean,
  stdinUsed: { current: boolean },
): Promise<unknown> {
  if (!value.startsWith('@')) {
    return typed ? coerceTyped(value) : value
  }

  const source = value === '@-' ? '-' : value.slice(1)
  const raw = await readInput(source, stdinUsed)

  if (!typed) {
    return raw.toString('utf8')
  }

  const text = raw.toString('utf8')

  try {
    return JSON.parse(text) as unknown
  } catch {
    return coerceTyped(text.trimEnd())
  }
}

function coerceTyped(value: string) {
  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  if (value === 'null') {
    return null
  }

  if (/^-?\d+$/.test(value)) {
    return Number(value)
  }

  return value
}

function assignField(target: Record<string, unknown>, key: string, value: unknown) {
  const tokens = tokenizeFieldKey(key)
  let current: Record<string, unknown> | unknown[] = target

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]
    const next = tokens[index + 1]
    const isLast = next == null

    if (token == null) {
      continue
    }

    if (token.kind === 'append') {
      if (!Array.isArray(current)) {
        throw new CliError(`Invalid field key \`${key}\`.`, { code: 'INVALID_FIELD' })
      }

      current.push(value)
      return
    }

    if (Array.isArray(current)) {
      throw new CliError(`Invalid field key \`${key}\`.`, { code: 'INVALID_FIELD' })
    }

    if (isLast) {
      current[token.name] = value
      return
    }

    const shouldBeArray = next?.kind === 'append'
    const existing = current[token.name]

    if (shouldBeArray) {
      if (!Array.isArray(existing)) {
        current[token.name] = []
      }

      current = current[token.name] as unknown[]
      continue
    }

    if (existing == null || typeof existing !== 'object' || Array.isArray(existing)) {
      current[token.name] = {}
    }

    current = current[token.name] as Record<string, unknown>
  }
}

function tokenizeFieldKey(key: string) {
  const match = /^([^[]+)(.*)$/.exec(key)

  if (match == null || match[1] == null || match[1].length === 0) {
    throw new CliError(`Invalid field key \`${key}\`.`, { code: 'INVALID_FIELD' })
  }

  const tokens: Array<{ kind: 'key'; name: string } | { kind: 'append' }> = [
    { kind: 'key', name: match[1] },
  ]
  const rest = match[2] ?? ''
  const brackets = /\[([^\]]*)\]/g

  for (const bracket of rest.matchAll(brackets)) {
    const name = bracket[1]

    if (name == null || name.length === 0) {
      tokens.push({ kind: 'append' })
      continue
    }

    tokens.push({ kind: 'key', name })
  }

  if (rest.length > 0 && rest.replace(/\[[^\]]*\]/g, '').length > 0) {
    throw new CliError(`Invalid field key \`${key}\`.`, { code: 'INVALID_FIELD' })
  }

  return tokens
}

async function readRequestBody(filePath: string, stdinUsed: { current: boolean }) {
  const raw = await readInput(filePath, stdinUsed)
  const text = raw.toString('utf8')

  try {
    return JSON.parse(text) as unknown
  } catch {
    throw new CliError(
      `Invalid --input: ${filePath === '-' ? 'stdin' : filePath} is not valid JSON.`,
      {
        code: 'INVALID_INPUT',
      },
    )
  }
}

async function readInput(source: string, stdinUsed: { current: boolean }) {
  if (source === '-') {
    if (stdinUsed.current) {
      throw new CliError('Standard input can only be read once.', {
        code: 'STDIN_ALREADY_READ',
      })
    }

    stdinUsed.current = true
    const chunks: Buffer[] = []

    for await (const chunk of process.stdin) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }

    return Buffer.concat(chunks)
  }

  return fs.readFile(source)
}

function asList(value: string | string[] | undefined) {
  if (value == null) {
    return []
  }

  return Array.isArray(value) ? value : [value]
}

function writeApiError(error: unknown) {
  const cliError = toCliError(error)
  const body =
    error instanceof Error || error == null || typeof error !== 'object'
      ? { error: { code: cliError.code, message: cliError.message } }
      : error

  process.stderr.write(`${JSON.stringify(body, null, 2)}\n`)
  process.exitCode = cliError.exitCode
}
