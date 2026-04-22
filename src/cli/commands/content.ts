import fs from 'node:fs/promises'
import type { CAC } from 'cac'
import { BORDER, DITHER_KERNELS, DITHER_TYPES } from '../../api'
import { createCliContext } from '../context'
import { CliError } from '../errors'
import { outputResult } from '../output'
import type { ContentImageResult, ContentNextResult, GlobalCommandOptions } from '../types'

interface ContentCommandOptions extends GlobalCommandOptions {
  file?: string
  refreshNow?: boolean
  link?: string
  border?: number
  ditherType?: string
  ditherKernel?: string
  taskKey?: string
}

export function registerContentCommands(cli: CAC) {
  cli
    .command('content [...args]', 'Manage content')
    .usage('content <command> [options]')
    .example('content next <deviceId>')
    .example('content image <deviceId> --file ./frame.png')
    .option('-f, --file <file>', 'Path to image file')
    .option('--refresh-now', 'Whether to refresh the device immediately')
    .option('--link <link>', 'Optional link to open when image is tapped')
    .option('--border <border>', `Whether to add a border around the image (${BORDER.join(', ')})`)
    .option('--dither-type <ditherType>', `Dithering algorithm to use (${DITHER_TYPES.join(', ')})`)
    .option(
      '--dither-kernel <ditherKernel>',
      `Dithering kernel to use (${DITHER_KERNELS.join(', ')})`,
    )
    .option('--task-key <taskKey>', 'Optional task key to track rendering status')
    .action(async (args: string[], options: ContentCommandOptions) => {
      const context = createCliContext(options)
      const [subcommand, ...rest] = args

      if (subcommand == null) {
        throw new CliError(
          'Missing content command. Use `content next <deviceId>` or `content image <deviceId>`.',
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
      code: `INVALID_${name.replace('-', '_').toUpperCase()}`,
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
