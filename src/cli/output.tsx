import { render } from 'ink'
import React from 'react'
import { toCliError } from './errors'
import type { CliContext } from './context'
import type { CliResult } from './types'
import { ErrorView, ResultView } from './views/ResultView'

export function outputResult(context: CliContext, result: CliResult) {
  if (context.json) {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n')
    return
  }

  render(<ResultView result={result} />)
}

export function handleCliError(error: unknown, json = process.argv.includes('--json')) {
  const cliError = toCliError(error)

  if (json) {
    process.stderr.write(
      JSON.stringify(
        {
          error: {
            code: cliError.code,
            message: cliError.message,
          },
        },
        null,
        2,
      ) + '\n',
    )
  } else {
    render(<ErrorView message={cliError.message} code={cliError.code} />)
  }

  process.exitCode = cliError.exitCode
}
