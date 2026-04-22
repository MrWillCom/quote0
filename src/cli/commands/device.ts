import type { CAC } from 'cac'
import { createCliContext } from '../context'
import { CliError } from '../errors'
import { outputResult } from '../output'
import type { DeviceListResult, DeviceStatusResult, GlobalCommandOptions } from '../types'

export function registerDeviceCommands(cli: CAC) {
  cli
    .command('device [...args]', 'Manage devices')
    .usage('device <command> [options]')
    .example('device list')
    .example('device status <deviceId>')
    .action(async (args: string[], options: GlobalCommandOptions) => {
      const context = createCliContext(options)
      const [subcommand, ...rest] = args

      if (subcommand == null) {
        throw new CliError(
          'Missing device command. Use `device list` or `device status <deviceId>`.',
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
          throw new CliError('Missing device ID. Usage: `device status <deviceId>`.', {
            code: 'MISSING_DEVICE_ID',
          })
        }

        if (unused.length > 0) {
          throw new CliError(`Unused args: ${unused.map(value => `\`${value}\``).join(', ')}`, {
            code: 'UNUSED_ARGS',
          })
        }

        const result: DeviceStatusResult = {
          type: 'device-status',
          device: await context.createClient().device.status({ deviceId }),
        }

        outputResult(context, result)
        return
      }

      throw new CliError(`Unknown device command \`${subcommand}\`.`, {
        code: 'UNKNOWN_SUBCOMMAND',
      })
    })
}
