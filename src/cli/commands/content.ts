import fs from 'node:fs/promises'
import type { CAC } from 'cac'
import {
  displayCanvas,
  displayImage,
  displayText,
  listDeviceTasks,
  switchNextContent,
  type Border,
  type CanvasContentRequest,
  type CanvasWindowData,
  type ImageContentRequest,
  type TextContentRequest,
  type TextStyle,
} from '../../client'
import { BORDER, DITHER_KERNELS, DITHER_TYPES, TASK_TYPES } from '../constants'
import { createCliContext } from '../context'
import { CliError } from '../errors'
import { outputResult } from '../output'
import { sdkData } from '../sdk'
import type {
  ContentCanvasResult,
  ContentImageResult,
  ContentListResult,
  ContentNextResult,
  ContentTextResult,
  GlobalCommandOptions,
} from '../types'

interface ContentCommandOptions extends GlobalCommandOptions {
  file?: string
  url?: string
  data?: string
  layoutFullTw?: string
  taskType?: string
  refreshNow?: boolean
  link?: string
  border?: string
  ditherType?: string
  ditherKernel?: string
  taskKey?: string
  taskAlias?: string
  message?: string
  title?: string
  signature?: string
  icon?: string
  titleFontFamily?: string
  titleFontSize?: string
  titleFontWeight?: string
  messageFontFamily?: string
  messageFontSize?: string
  messageFontWeight?: string
  messageLineHeight?: string
  signatureFontFamily?: string
  signatureFontSize?: string
  signatureFontWeight?: string
}

export function registerContentCommands(cli: CAC) {
  cli
    .command('content [...args]', 'Manage content')
    .usage('content <command> [options]')
    .example('content next <deviceId>')
    .example('content list <deviceId> --task-type fixed')
    .example('content text <deviceId> --message "Hello"')
    .example('content image <deviceId> --file ./frame.png')
    .example('content image <deviceId> --url https://example.com/frame.png')
    .example('content canvas <deviceId> --file ./window.json')
    .option('-f, --file <file>', 'Path to image file, or windowData JSON file for `content canvas`')
    .option('--url <url>', 'http(s) image URL to push directly (alternative to --file)')
    .option('--data <data>', 'Path to data JSON file for `content canvas`')
    .option(
      '--layout-full-tw <layoutFullTw>',
      'Tailwind classes overriding the FULL layout for `content canvas`',
    )
    .option('--task-type <taskType>', `Task type to list (${TASK_TYPES.join(', ')})`)
    .option('--refresh-now', 'Whether to refresh the device immediately')
    .option('--link <link>', 'Optional link to open when content is tapped')
    .option('--border <border>', 'Screen border color: 0 for white, 1 for black')
    .option('--dither-type <ditherType>', `Dithering algorithm to use (${DITHER_TYPES.join(', ')})`)
    .option(
      '--dither-kernel <ditherKernel>',
      `Dithering kernel to use (${DITHER_KERNELS.join(', ')})`,
    )
    .option(
      '--task-key <taskKey>',
      'Task key to identify the target Text/Image API content when multiple exist on the device',
    )
    .option('--task-alias <taskAlias>', 'Alias to distinguish the task in the device task list')
    .option('--message <message>', 'Text message body')
    .option('--title <title>', 'Text title')
    .option('--signature <signature>', 'Text signature')
    .option('--icon <icon>', 'PNG Base64 icon data or http(s) image URL')
    .option('--title-font-family <titleFontFamily>', 'Title font family')
    .option('--title-font-size <titleFontSize>', 'Title font size (8-48 px)')
    .option('--title-font-weight <titleFontWeight>', 'Title font weight (100-900)')
    .option('--message-font-family <messageFontFamily>', 'Message font family')
    .option('--message-font-size <messageFontSize>', 'Message font size (8-48 px)')
    .option('--message-font-weight <messageFontWeight>', 'Message font weight (100-900)')
    .option('--message-line-height <messageLineHeight>', 'Message line height (0.8-3)')
    .option('--signature-font-family <signatureFontFamily>', 'Signature font family')
    .option('--signature-font-size <signatureFontSize>', 'Signature font size (8-48 px)')
    .option('--signature-font-weight <signatureFontWeight>', 'Signature font weight (100-900)')
    .action(async (args: string[], options: ContentCommandOptions) => {
      const context = createCliContext(options)
      const [subcommand, ...rest] = args

      if (subcommand == null) {
        throw new CliError(
          'Missing content command. Use `content next <deviceId>`, `content list <deviceId>`, `content text <deviceId>`, `content image <deviceId>`, or `content canvas <deviceId>`.',
          {
            code: 'MISSING_SUBCOMMAND',
          },
        )
      }

      if (subcommand === 'next') {
        const [deviceId, ...unused] = rest

        if (typeof deviceId !== 'string' || deviceId.length === 0) {
          throw new CliError('Missing device serial number. Usage: `content next <deviceId>`.', {
            code: 'MISSING_DEVICE_ID',
          })
        }

        if (unused.length > 0) {
          throw new CliError(`Unused args: ${unused.map(value => `\`${value}\``).join(', ')}`, {
            code: 'UNUSED_ARGS',
          })
        }

        assertNoNextOptions(options)

        const result: ContentNextResult = {
          type: 'content-next',
          response: await sdkData(
            switchNextContent({ deviceId }, { client: context.createClient(), throwOnError: true }),
          ),
        }

        outputResult(context, result)
        return
      }

      if (subcommand === 'list') {
        const [deviceId, ...unused] = rest

        if (typeof deviceId !== 'string' || deviceId.length === 0) {
          throw new CliError(
            'Missing device serial number. Usage: `content list <deviceId> --task-type <fixed|loop>`.',
            {
              code: 'MISSING_DEVICE_ID',
            },
          )
        }

        if (unused.length > 0) {
          throw new CliError(`Unused args: ${unused.map(value => `\`${value}\``).join(', ')}`, {
            code: 'UNUSED_ARGS',
          })
        }

        const taskType = parseChoice('task-type', options.taskType, TASK_TYPES)

        if (taskType == null) {
          throw new CliError(
            `Missing required option \`--task-type <taskType>\`. Expected one of: ${TASK_TYPES.join(', ')}.`,
            {
              code: 'MISSING_TASK_TYPE',
            },
          )
        }

        assertNoListOptions(options)

        const result: ContentListResult = {
          type: 'content-list',
          tasks: await sdkData(
            listDeviceTasks(
              { deviceId, taskType },
              { client: context.createClient(), throwOnError: true },
            ),
          ),
        }

        outputResult(context, result)
        return
      }

      if (subcommand === 'text') {
        const [deviceId, ...unused] = rest

        if (typeof deviceId !== 'string' || deviceId.length === 0) {
          throw new CliError(
            'Missing device serial number. Usage: `content text <deviceId> --message <message>`.',
            {
              code: 'MISSING_DEVICE_ID',
            },
          )
        }

        if (unused.length > 0) {
          throw new CliError(`Unused args: ${unused.map(value => `\`${value}\``).join(', ')}`, {
            code: 'UNUSED_ARGS',
          })
        }

        assertAtLeastOneTextField(options)

        const styles = buildTextStyles(options)
        const taskAlias = parseTaskAlias(options.taskAlias)

        const result: ContentTextResult = {
          type: 'content-text',
          response: await sdkData(
            displayText(
              {
                deviceId,
                textContentRequest: {
                  message: options.message,
                  title: options.title,
                  signature: options.signature,
                  icon: options.icon,
                  link: options.link,
                  refreshNow: options.refreshNow,
                  taskKey: options.taskKey,
                  taskAlias,
                  styles,
                },
              },
              { client: context.createClient(), throwOnError: true },
            ),
          ),
        }

        outputResult(context, result)
        return
      }

      if (subcommand === 'image') {
        const [deviceId, ...unused] = rest

        if (typeof deviceId !== 'string' || deviceId.length === 0) {
          throw new CliError(
            'Missing device serial number. Usage: `content image <deviceId> --file <file>`.',
            {
              code: 'MISSING_DEVICE_ID',
            },
          )
        }

        if (unused.length > 0) {
          throw new CliError(`Unused args: ${unused.map(value => `\`${value}\``).join(', ')}`, {
            code: 'UNUSED_ARGS',
          })
        }

        const border = parseBorder(options.border)
        const ditherType = parseChoice('dither-type', options.ditherType, DITHER_TYPES)
        const ditherKernel = parseChoice('dither-kernel', options.ditherKernel, DITHER_KERNELS)
        const taskAlias = parseTaskAlias(options.taskAlias)
        const { image, source } = await resolveImageSource(options)

        const imageContentRequest: ImageContentRequest = {
          image,
          refreshNow: options.refreshNow,
          link: options.link,
          border,
          ditherType,
          ditherKernel,
          taskKey: options.taskKey,
          taskAlias,
        }

        const result: ContentImageResult = {
          type: 'content-image',
          file: source,
          response: await sdkData(
            displayImage(
              { deviceId, imageContentRequest },
              { client: context.createClient(), throwOnError: true },
            ),
          ),
        }

        outputResult(context, result)
        return
      }

      if (subcommand === 'canvas') {
        const [deviceId, ...unused] = rest

        if (typeof deviceId !== 'string' || deviceId.length === 0) {
          throw new CliError(
            'Missing device serial number. Usage: `content canvas <deviceId> --file <windowData.json>`.',
            {
              code: 'MISSING_DEVICE_ID',
            },
          )
        }

        if (unused.length > 0) {
          throw new CliError(`Unused args: ${unused.map(value => `\`${value}\``).join(', ')}`, {
            code: 'UNUSED_ARGS',
          })
        }

        const filePath = options.file

        if (typeof filePath !== 'string' || filePath.length === 0) {
          throw new CliError('Missing required option `--file <windowData.json>`.', {
            code: 'MISSING_FILE',
          })
        }

        const border = parseBorder(options.border)
        const taskAlias = parseTaskAlias(options.taskAlias)
        const windowData = await readJsonFile('file', filePath)
        const data =
          typeof options.data === 'string' && options.data.length > 0
            ? await readJsonFile('data', options.data)
            : undefined
        const layoutFull =
          typeof options.layoutFullTw === 'string' && options.layoutFullTw.length > 0
            ? { tw: options.layoutFullTw }
            : undefined

        const canvasContentRequest: CanvasContentRequest = {
          windowData: windowData as CanvasWindowData,
          data,
          layoutFull,
          refreshNow: options.refreshNow,
          link: options.link,
          border,
          taskKey: options.taskKey,
          taskAlias,
        }

        const result: ContentCanvasResult = {
          type: 'content-canvas',
          file: filePath,
          response: await sdkData(
            displayCanvas(
              { deviceId, canvasContentRequest },
              { client: context.createClient(), throwOnError: true },
            ),
          ),
        }

        outputResult(context, result)
        return
      }

      throw new CliError(`Unknown content command \`${subcommand}\`.`, {
        code: 'UNKNOWN_SUBCOMMAND',
      })
    })
}

function assertAtLeastOneTextField(options: ContentCommandOptions) {
  const hasField = [options.title, options.message, options.signature].some(
    value => typeof value === 'string' && value.length > 0,
  )

  if (!hasField) {
    throw new CliError(
      'At least one of `--title`, `--message`, or `--signature` must be provided for `content text`.',
      {
        code: 'MISSING_TEXT_CONTENT',
      },
    )
  }
}

function buildTextStyles(options: ContentCommandOptions): TextContentRequest['styles'] {
  const title = definedEntries({
    fontFamily: parseOptionalString('title-font-family', options.titleFontFamily),
    fontSize: parseOptionalNumberInRange('title-font-size', options.titleFontSize, {
      min: 8,
      max: 48,
    }),
    fontWeight: parseOptionalFontWeight('title-font-weight', options.titleFontWeight),
  })

  const message = definedEntries({
    fontFamily: parseOptionalString('message-font-family', options.messageFontFamily),
    fontSize: parseOptionalNumberInRange('message-font-size', options.messageFontSize, {
      min: 8,
      max: 48,
    }),
    fontWeight: parseOptionalFontWeight('message-font-weight', options.messageFontWeight),
    lineHeight: parseOptionalNumberInRange('message-line-height', options.messageLineHeight, {
      min: 0.8,
      max: 3,
    }),
  })

  const signature = definedEntries({
    fontFamily: parseOptionalString('signature-font-family', options.signatureFontFamily),
    fontSize: parseOptionalNumberInRange('signature-font-size', options.signatureFontSize, {
      min: 8,
      max: 48,
    }),
    fontWeight: parseOptionalFontWeight('signature-font-weight', options.signatureFontWeight),
  })

  const hasTitle = Object.keys(title).length > 0
  const hasMessage = Object.keys(message).length > 0
  const hasSignature = Object.keys(signature).length > 0

  if (!hasTitle && !hasMessage && !hasSignature) {
    return undefined
  }

  return {
    ...(hasTitle && { title }),
    ...(hasMessage && { message }),
    ...(hasSignature && { signature }),
  }
}

function definedEntries<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Partial<T> = {}

  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key as keyof T] = value as T[keyof T]
    }
  }

  return result
}

function parseOptionalString(name: string, value: unknown) {
  if (value == null) {
    return undefined
  }

  if (typeof value !== 'string' || value.length === 0) {
    throw new CliError(`Invalid --${name}. Expected a non-empty string.`, {
      code: `INVALID_${name.replaceAll('-', '_').toUpperCase()}`,
    })
  }

  return value
}

function parseOptionalNumberInRange(
  name: string,
  value: unknown,
  range: { min: number; max: number },
) {
  if (value == null) {
    return undefined
  }

  const parsed = Number(value)

  if (Number.isNaN(parsed) || parsed < range.min || parsed > range.max) {
    throw new CliError(
      `Invalid --${name}: ${value}. Expected a number between ${range.min} and ${range.max}.`,
      {
        code: `INVALID_${name.replaceAll('-', '_').toUpperCase()}`,
      },
    )
  }

  return parsed
}

function parseOptionalFontWeight(name: string, value: unknown): TextStyle['fontWeight'] {
  if (value == null) {
    return undefined
  }

  const parsed = Number(value)

  if (Number.isNaN(parsed) || parsed < 100 || parsed > 900 || parsed % 100 !== 0) {
    throw new CliError(
      `Invalid --${name}: ${value}. Expected a font weight between 100 and 900 and divisible by 100.`,
      {
        code: `INVALID_${name.replaceAll('-', '_').toUpperCase()}`,
      },
    )
  }

  return parsed as TextStyle['fontWeight']
}

function parseTaskAlias(value: unknown) {
  if (value == null) {
    return undefined
  }

  if (typeof value !== 'string' || value.length > 100) {
    throw new CliError(
      'Invalid --task-alias. Expected a string with a maximum length of 100 characters.',
      {
        code: 'INVALID_TASK_ALIAS',
      },
    )
  }

  return value
}

function parseBorder(value: unknown) {
  if (value == null) {
    return undefined
  }

  const parsed = Number(value)

  if (Number.isNaN(parsed) || !BORDER.includes(parsed as (typeof BORDER)[number])) {
    throw new CliError(`Invalid value for --border. Expected one of: ${BORDER.join(', ')}.`, {
      code: 'INVALID_BORDER',
    })
  }

  return parsed as Border
}

function parseChoice<T extends readonly string[]>(name: string, value: unknown, choices: T) {
  if (value == null) {
    return undefined
  }

  if (typeof value !== 'string' || !choices.includes(value as T[number])) {
    throw new CliError(`Invalid value for --${name}. Expected one of: ${choices.join(', ')}.`, {
      code: `INVALID_${name.replaceAll('-', '_').toUpperCase()}`,
    })
  }

  return value as T[number]
}

function assertNoNextOptions(options: ContentCommandOptions) {
  assertNoOptionsFor('content next', options, [
    'taskType',
    'refreshNow',
    'link',
    'border',
    'ditherType',
    'ditherKernel',
    'taskKey',
    'taskAlias',
    'message',
    'title',
    'signature',
    'icon',
    'titleFontFamily',
    'titleFontSize',
    'titleFontWeight',
    'messageFontFamily',
    'messageFontSize',
    'messageFontWeight',
    'messageLineHeight',
    'signatureFontFamily',
    'signatureFontSize',
    'signatureFontWeight',
    ...SHARED_FILE_OPTIONS,
  ])
}

function assertNoListOptions(options: ContentCommandOptions) {
  assertNoOptionsFor('content list', options, [
    'refreshNow',
    'link',
    'border',
    'ditherType',
    'ditherKernel',
    'taskKey',
    'taskAlias',
    'message',
    'title',
    'signature',
    'icon',
    'titleFontFamily',
    'titleFontSize',
    'titleFontWeight',
    'messageFontFamily',
    'messageFontSize',
    'messageFontWeight',
    'messageLineHeight',
    'signatureFontFamily',
    'signatureFontSize',
    'signatureFontWeight',
    ...SHARED_FILE_OPTIONS,
  ])
}

const SHARED_FILE_OPTIONS = ['file', 'url', 'data', 'layoutFullTw'] as const

const OPTION_FLAG_NAMES: Record<string, string> = {
  taskType: 'task-type',
  refreshNow: 'refresh-now',
  ditherType: 'dither-type',
  ditherKernel: 'dither-kernel',
  taskKey: 'task-key',
  taskAlias: 'task-alias',
  layoutFullTw: 'layout-full-tw',
  titleFontFamily: 'title-font-family',
  titleFontSize: 'title-font-size',
  titleFontWeight: 'title-font-weight',
  messageFontFamily: 'message-font-family',
  messageFontSize: 'message-font-size',
  messageFontWeight: 'message-font-weight',
  messageLineHeight: 'message-line-height',
  signatureFontFamily: 'signature-font-family',
  signatureFontSize: 'signature-font-size',
  signatureFontWeight: 'signature-font-weight',
}

function assertNoOptionsFor(
  command: string,
  options: ContentCommandOptions,
  keys: readonly string[],
) {
  const unsupportedOptions = keys.flatMap(key =>
    options[key as keyof ContentCommandOptions] == null
      ? []
      : [`--${OPTION_FLAG_NAMES[key] ?? key}`],
  )

  if (unsupportedOptions.length === 0) {
    return
  }

  throw new CliError(`Unsupported option for \`${command}\`: ${unsupportedOptions.join(', ')}.`, {
    code: 'UNSUPPORTED_OPTION',
  })
}

async function resolveImageSource(options: ContentCommandOptions) {
  const filePath = typeof options.file === 'string' && options.file.length > 0 ? options.file : null
  const url = typeof options.url === 'string' && options.url.length > 0 ? options.url : null

  if (filePath != null && url != null) {
    throw new CliError('Options `--file` and `--url` cannot be used together.', {
      code: 'CONFLICTING_OPTIONS',
    })
  }

  if (url != null) {
    if (!/^https?:\/\//.test(url) || url.length > 2048) {
      throw new CliError(
        'Invalid --url. Expected an http(s) URL with a maximum length of 2048 characters.',
        {
          code: 'INVALID_URL',
        },
      )
    }

    return { image: url, source: url }
  }

  if (filePath == null) {
    throw new CliError('Missing required option `--file <file>` or `--url <url>`.', {
      code: 'MISSING_FILE',
    })
  }

  const file = await fs.readFile(filePath)

  return { image: file.toString('base64'), source: filePath }
}

async function readJsonFile(name: string, filePath: string) {
  const raw = await fs.readFile(filePath, 'utf8')

  try {
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    throw new CliError(`Invalid --${name}: ${filePath} is not valid JSON.`, {
      code: `INVALID_${name.replaceAll('-', '_').toUpperCase()}`,
    })
  }
}
