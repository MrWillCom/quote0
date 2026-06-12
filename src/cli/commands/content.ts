import fs from 'node:fs/promises'
import type { CAC } from 'cac'
import { BORDER, DITHER_KERNELS, DITHER_TYPES, TEXT_API_FONT_FAMILIES } from '../../api'
import type { TextStyles } from '../../api/modules/content'
import { createCliContext } from '../context'
import { CliError } from '../errors'
import { outputResult } from '../output'
import type {
  ContentImageResult,
  ContentNextResult,
  ContentTextResult,
  GlobalCommandOptions,
} from '../types'

interface ContentCommandOptions extends GlobalCommandOptions {
  file?: string
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
    .example('content text <deviceId> --message "Hello"')
    .example('content image <deviceId> --file ./frame.png')
    .option('-f, --file <file>', 'Path to image file')
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
    .option(
      '--title-font-family <titleFontFamily>',
      `Title font family (${TEXT_API_FONT_FAMILIES.join(', ')})`,
    )
    .option('--title-font-size <titleFontSize>', 'Title font size (8-48 px)')
    .option('--title-font-weight <titleFontWeight>', 'Title font weight (100-900)')
    .option(
      '--message-font-family <messageFontFamily>',
      `Message font family (${TEXT_API_FONT_FAMILIES.join(', ')})`,
    )
    .option('--message-font-size <messageFontSize>', 'Message font size (8-48 px)')
    .option('--message-font-weight <messageFontWeight>', 'Message font weight (100-900)')
    .option('--message-line-height <messageLineHeight>', 'Message line height (0.8-3)')
    .option(
      '--signature-font-family <signatureFontFamily>',
      `Signature font family (${TEXT_API_FONT_FAMILIES.join(', ')})`,
    )
    .option('--signature-font-size <signatureFontSize>', 'Signature font size (8-48 px)')
    .option('--signature-font-weight <signatureFontWeight>', 'Signature font weight (100-900)')
    .action(async (args: string[], options: ContentCommandOptions) => {
      const context = createCliContext(options)
      const [subcommand, ...rest] = args

      if (subcommand == null) {
        throw new CliError(
          'Missing content command. Use `content next <deviceId>`, `content text <deviceId>`, or `content image <deviceId>`.',
          {
            code: 'MISSING_SUBCOMMAND',
          },
        )
      }

      if (subcommand === 'next') {
        const [deviceId, ...unused] = rest

        if (typeof deviceId !== 'string' || deviceId.length === 0) {
          throw new CliError('Missing device ID. Usage: `content next <deviceId>`.', {
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
          response: await context.createClient().content.next({ deviceId }),
        }

        outputResult(context, result)
        return
      }

      if (subcommand === 'text') {
        const [deviceId, ...unused] = rest

        if (typeof deviceId !== 'string' || deviceId.length === 0) {
          throw new CliError(
            'Missing device ID. Usage: `content text <deviceId> --message <message>`.',
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
          response: await context.createClient().content.pushText(
            { deviceId },
            {
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
          ),
        }

        outputResult(context, result)
        return
      }

      if (subcommand === 'image') {
        const [deviceId, ...unused] = rest

        if (typeof deviceId !== 'string' || deviceId.length === 0) {
          throw new CliError(
            'Missing device ID. Usage: `content image <deviceId> --file <file>`.',
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
          throw new CliError('Missing required option `--file <file>`.', {
            code: 'MISSING_FILE',
          })
        }

        const border = parseBorder(options.border)
        const ditherType = parseChoice('dither-type', options.ditherType, DITHER_TYPES)
        const ditherKernel = parseChoice('dither-kernel', options.ditherKernel, DITHER_KERNELS)
        const taskAlias = parseTaskAlias(options.taskAlias)
        const file = await fs.readFile(filePath)

        const result: ContentImageResult = {
          type: 'content-image',
          file: filePath,
          response: await context.createClient().content.pushImage(
            { deviceId },
            {
              image: file.toString('base64'),
              refreshNow: options.refreshNow,
              link: options.link,
              border,
              ditherType,
              ditherKernel,
              taskKey: options.taskKey,
              taskAlias,
            },
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

function buildTextStyles(options: ContentCommandOptions): TextStyles | undefined {
  const title = definedEntries({
    fontFamily: parseOptionalFontFamily('title-font-family', options.titleFontFamily),
    fontSize: parseOptionalNumberInRange('title-font-size', options.titleFontSize, {
      min: 8,
      max: 48,
    }),
    fontWeight: parseOptionalFontWeight('title-font-weight', options.titleFontWeight),
  })

  const message = definedEntries({
    fontFamily: parseOptionalFontFamily('message-font-family', options.messageFontFamily),
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
    fontFamily: parseOptionalFontFamily('signature-font-family', options.signatureFontFamily),
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
  } as TextStyles
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

function parseOptionalFontFamily(name: string, value: unknown) {
  if (value == null) {
    return undefined
  }

  if (
    typeof value !== 'string' ||
    !TEXT_API_FONT_FAMILIES.includes(value as (typeof TEXT_API_FONT_FAMILIES)[number])
  ) {
    throw new CliError(
      `Invalid --${name}. Expected one of: ${TEXT_API_FONT_FAMILIES.join(', ')}.`,
      {
        code: `INVALID_${name.replaceAll('-', '_').toUpperCase()}`,
      },
    )
  }

  return value as (typeof TEXT_API_FONT_FAMILIES)[number]
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

function parseOptionalFontWeight(name: string, value: unknown) {
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

  return parsed
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

  return parsed as (typeof BORDER)[number]
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
  const unsupportedOptions = [
    ['file', options.file],
    ['refresh-now', options.refreshNow],
    ['link', options.link],
    ['border', options.border],
    ['dither-type', options.ditherType],
    ['dither-kernel', options.ditherKernel],
    ['task-key', options.taskKey],
    ['task-alias', options.taskAlias],
    ['message', options.message],
    ['title', options.title],
    ['signature', options.signature],
    ['icon', options.icon],
    ['title-font-family', options.titleFontFamily],
    ['title-font-size', options.titleFontSize],
    ['title-font-weight', options.titleFontWeight],
    ['message-font-family', options.messageFontFamily],
    ['message-font-size', options.messageFontSize],
    ['message-font-weight', options.messageFontWeight],
    ['message-line-height', options.messageLineHeight],
    ['signature-font-family', options.signatureFontFamily],
    ['signature-font-size', options.signatureFontSize],
    ['signature-font-weight', options.signatureFontWeight],
  ].flatMap(([name, value]) => (value == null ? [] : [name]))

  if (unsupportedOptions.length === 0) {
    return
  }

  throw new CliError(
    `Unsupported option for \`content next\`: ${unsupportedOptions
      .map(name => `--${name}`)
      .join(', ')}.`,
    {
      code: 'UNSUPPORTED_OPTION',
    },
  )
}
