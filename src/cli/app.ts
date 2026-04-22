import { cac } from 'cac'
import { version } from '../../package.json'
import { registerAuthCommand } from './commands/auth'
import { registerContentCommands } from './commands/content'
import { registerDeviceCommands } from './commands/device'

export function buildCli() {
  const cli = cac('quote0')

  cli.option('--json', 'Emit machine-readable JSON output.')

  registerAuthCommand(cli)
  registerDeviceCommands(cli)
  registerContentCommands(cli)

  cli.help()
  cli.version(version)

  return cli
}
