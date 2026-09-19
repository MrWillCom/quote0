import type { CAC } from 'cac'
import { listTimezones } from '../../client'
import { createCliContext } from '../context'
import { CliError } from '../errors'
import { outputResult } from '../output'
import { sdkData } from '../sdk'
import type { GlobalCommandOptions, TimezoneListResult } from '../types'

export function registerTimezoneCommands(cli: CAC) {
  cli
    .command('timezone [...args]', 'Manage timezones')
    .usage('timezone <command> [options]')
    .example('timezone list')
    .action(async (args: string[], options: GlobalCommandOptions) => {
      const context = createCliContext(options)
      const [subcommand, ...rest] = args

      if (subcommand == null) {
        throw new CliError('Missing timezone command. Use `timezone list`.', {
          code: 'MISSING_SUBCOMMAND',
        })
      }

      if (subcommand === 'list') {
        if (rest.length > 0) {
          throw new CliError(`Unused args: ${rest.map(value => `\`${value}\``).join(', ')}`, {
            code: 'UNUSED_ARGS',
          })
        }

        const result: TimezoneListResult = {
          type: 'timezone-list',
          timezones: await sdkData(
            listTimezones({ client: context.createClient(), throwOnError: true }),
          ),
        }

        outputResult(context, result)
        return
      }

      throw new CliError(`Unknown timezone command \`${subcommand}\`.`, {
        code: 'UNKNOWN_SUBCOMMAND',
      })
    })
}
