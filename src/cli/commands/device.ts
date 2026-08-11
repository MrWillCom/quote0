import type { CAC } from 'cac'
import type { DeviceSettings } from '../../api/modules/device'
import { createCliContext } from '../context'
import { CliError } from '../errors'
import { outputResult } from '../output'
import type {
  DeviceListResult,
  DeviceSettingsResult,
  DeviceSettingsUpdateResult,
  DeviceStatusResult,
  GlobalCommandOptions,
} from '../types'

interface DeviceCommandOptions extends GlobalCommandOptions {
  alias?: string
  location?: string
  timezone?: string
  powerMs?: string
  batteryMs?: string
  sleepStart?: string
  sleepEnd?: string
  sleepDisabled?: boolean
}

export function registerDeviceCommands(cli: CAC) {
  cli
    .command('device [...args]', 'Manage devices')
    .usage('device <command> [options]')
    .example('device list')
    .example('device status <deviceId>')
    .example('device settings <deviceId>')
    .example('device settings <deviceId> --alias "Desk" --timezone Asia/Shanghai')
    .option('--alias <alias>', 'Device alias (pass an empty string to clear)')
    .option('--location <location>', 'Device location (pass an empty string to clear)')
    .option('--timezone <timezone>', 'Timezone key from `timezone list`')
    .option('--power-ms <powerMs>', 'Refresh interval on power, in milliseconds (60000-43200000)')
    .option(
      '--battery-ms <batteryMs>',
      'Wake-up refresh interval on battery, in milliseconds (60000-43200000)',
    )
    .option('--sleep-start <sleepStart>', 'Sleep start time in HH:mm (device local time)')
    .option('--sleep-end <sleepEnd>', 'Sleep end time in HH:mm (device local time)')
    .option('--sleep-disabled', 'Disable sleep mode')
    .action(async (args: string[], options: DeviceCommandOptions) => {
      const context = createCliContext(options)
      const [subcommand, ...rest] = args

      if (subcommand == null) {
        throw new CliError(
          'Missing device command. Use `device list`, `device status <deviceId>`, or `device settings <deviceId>`.',
          {
            code: 'MISSING_SUBCOMMAND',
          },
        )
      }

      if (subcommand === 'list') {
        if (rest.length > 0) {
          throw new CliError(`Unused args: ${rest.map(value => `\`${value}\``).join(', ')}`, {
            code: 'UNUSED_ARGS',
          })
        }

        assertNoSettingsOptions(options, 'device list')

        const result: DeviceListResult = {
          type: 'device-list',
          devices: await context.createClient().device.list(),
        }

        outputResult(context, result)
        return
      }

      if (subcommand === 'status') {
        const [deviceId, ...unused] = rest

        if (typeof deviceId !== 'string' || deviceId.length === 0) {
          throw new CliError('Missing device serial number. Usage: `device status <deviceId>`.', {
            code: 'MISSING_DEVICE_ID',
          })
        }

        if (unused.length > 0) {
          throw new CliError(`Unused args: ${unused.map(value => `\`${value}\``).join(', ')}`, {
            code: 'UNUSED_ARGS',
          })
        }

        assertNoSettingsOptions(options, 'device status')

        const result: DeviceStatusResult = {
          type: 'device-status',
          device: await context.createClient().device.status({ deviceId }),
        }

        outputResult(context, result)
        return
      }

      if (subcommand === 'settings') {
        const [deviceId, ...unused] = rest

        if (typeof deviceId !== 'string' || deviceId.length === 0) {
          throw new CliError('Missing device serial number. Usage: `device settings <deviceId>`.', {
            code: 'MISSING_DEVICE_ID',
          })
        }

        if (unused.length > 0) {
          throw new CliError(`Unused args: ${unused.map(value => `\`${value}\``).join(', ')}`, {
            code: 'UNUSED_ARGS',
          })
        }

        // When disabling sleep without explicit times, reuse the device's current
        // sleep window: the API requires all three sleep fields and start !== end.
        let currentSleep: { start: string; end: string } | undefined
        if (
          options.sleepDisabled === true &&
          options.sleepStart == null &&
          options.sleepEnd == null
        ) {
          const current = await context.createClient().device.getSettings({ deviceId })
          currentSleep =
            current.sleep != null
              ? { start: current.sleep.start, end: current.sleep.end }
              : undefined
        }

        const settings = buildDeviceSettings(options, currentSleep)

        if (settings == null) {
          const result: DeviceSettingsResult = {
            type: 'device-settings',
            deviceId,
            settings: await context.createClient().device.getSettings({ deviceId }),
          }

          outputResult(context, result)
          return
        }

        const result: DeviceSettingsUpdateResult = {
          type: 'device-settings-update',
          response: await context.createClient().device.updateSettings({ deviceId }, settings),
        }

        outputResult(context, result)
        return
      }

      throw new CliError(`Unknown device command \`${subcommand}\`.`, {
        code: 'UNKNOWN_SUBCOMMAND',
      })
    })
}

function buildDeviceSettings(
  options: DeviceCommandOptions,
  currentSleep?: { start: string; end: string },
): DeviceSettings | undefined {
  const settings: DeviceSettings = {}

  if (options.alias != null) {
    if (options.alias.length > 100) {
      throw new CliError(
        'Invalid --alias. Expected a string with a maximum length of 100 characters.',
        {
          code: 'INVALID_ALIAS',
        },
      )
    }

    settings.alias = options.alias
  }

  if (options.location != null) {
    if (options.location.length > 100) {
      throw new CliError(
        'Invalid --location. Expected a string with a maximum length of 100 characters.',
        {
          code: 'INVALID_LOCATION',
        },
      )
    }

    settings.location = options.location
  }

  if (options.timezone != null) {
    settings.timezone = options.timezone
  }

  const powerMs = parseInterval('power-ms', options.powerMs)
  const batteryMs = parseInterval('battery-ms', options.batteryMs)

  if (powerMs != null || batteryMs != null) {
    settings.interval = {
      ...(powerMs != null && { powerMs }),
      ...(batteryMs != null && { batteryMs }),
    }
  }

  if (options.sleepDisabled === true) {
    if (options.sleepStart != null || options.sleepEnd != null) {
      throw new CliError(
        'Option `--sleep-disabled` cannot be used together with `--sleep-start` or `--sleep-end`.',
        {
          code: 'CONFLICTING_OPTIONS',
        },
      )
    }

    settings.sleep = {
      enabled: false,
      start: currentSleep?.start ?? '00:00',
      end: currentSleep?.end ?? '23:59',
    }
  } else if (options.sleepStart != null || options.sleepEnd != null) {
    if (options.sleepStart == null || options.sleepEnd == null) {
      throw new CliError('Options `--sleep-start` and `--sleep-end` must be provided together.', {
        code: 'MISSING_SLEEP_TIME',
      })
    }

    assertSleepTime('sleep-start', options.sleepStart)
    assertSleepTime('sleep-end', options.sleepEnd)

    if (options.sleepStart === options.sleepEnd) {
      throw new CliError('Invalid sleep time: `--sleep-start` and `--sleep-end` cannot be equal.', {
        code: 'INVALID_SLEEP_TIME',
      })
    }

    settings.sleep = { enabled: true, start: options.sleepStart, end: options.sleepEnd }
  }

  if (Object.keys(settings).length === 0) {
    return undefined
  }

  return settings
}

function parseInterval(name: string, value: unknown) {
  if (value == null) {
    return undefined
  }

  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed < 60000 || parsed > 43200000 || parsed % 60000 !== 0) {
    throw new CliError(
      `Invalid --${name}: ${value}. Expected a multiple of 60000 between 60000 and 43200000.`,
      {
        code: `INVALID_${name.replaceAll('-', '_').toUpperCase()}`,
      },
    )
  }

  return parsed
}

function assertSleepTime(name: string, value: string) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    throw new CliError(`Invalid --${name}: ${value}. Expected a time in HH:mm (24-hour) format.`, {
      code: `INVALID_${name.replaceAll('-', '_').toUpperCase()}`,
    })
  }
}

function assertNoSettingsOptions(options: DeviceCommandOptions, command: string) {
  const unsupportedOptions = [
    ['alias', options.alias],
    ['location', options.location],
    ['timezone', options.timezone],
    ['power-ms', options.powerMs],
    ['battery-ms', options.batteryMs],
    ['sleep-start', options.sleepStart],
    ['sleep-end', options.sleepEnd],
    ['sleep-disabled', options.sleepDisabled],
  ].flatMap(([name, value]) => (value == null ? [] : [name]))

  if (unsupportedOptions.length === 0) {
    return
  }

  throw new CliError(
    `Unsupported option for \`${command}\`: ${unsupportedOptions
      .map(name => `--${name}`)
      .join(', ')}.`,
    {
      code: 'UNSUPPORTED_OPTION',
    },
  )
}
