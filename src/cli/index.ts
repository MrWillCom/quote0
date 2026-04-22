import { buildCli } from './app'
import { CliError } from './errors'
import { handleCliError } from './output'

export async function runCli(argv = process.argv) {
  const cli = buildCli()

  try {
    cli.parse(argv, { run: false })

    if (cli.matchedCommand == null) {
      const [command] = cli.args

      if (command == null) {
        throw new CliError('Please specify a command.', {
          code: 'MISSING_COMMAND',
        })
      }

      throw new CliError(`Unknown command \`${command}\`.`, {
        code: 'UNKNOWN_COMMAND',
      })
    }

    await cli.runMatchedCommand()
  } catch (error) {
    handleCliError(error, argv.includes('--json'))
  }
}
