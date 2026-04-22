import { render } from 'ink'
import React from 'react'
import type { CAC } from 'cac'
import { createCliContext, type CliContext } from '../context'
import { CliError } from '../errors'
import type { GlobalCommandOptions } from '../types'
import AuthPrompt from '../views/AuthPrompt'

export function registerAuthCommand(cli: CAC) {
  cli.command('auth', 'Enter and save API key').action(async (options: GlobalCommandOptions) => {
    await runAuthCommand(createCliContext(options))
  })
}

async function runAuthCommand(context: CliContext) {
  if (context.json) {
    throw new CliError('The `auth` command is interactive only and does not support `--json`.', {
      code: 'UNSUPPORTED_OUTPUT_MODE',
    })
  }

  await new Promise<void>(resolve => {
    let submitted = false
    const app = render(
      <AuthSession
        initialValue={context.config.get('apiKey', '')}
        onSubmit={value => {
          if (value.length === 0) {
            context.config.delete('apiKey')
          } else {
            context.config.set('apiKey', value)
          }

          submitted = true
        }}
        isSubmitted={() => submitted}
        onComplete={() => {
          app.unmount()
          resolve()
        }}
      />,
    )
  })
}

function AuthSession({
  initialValue,
  onSubmit,
  isSubmitted,
  onComplete,
}: {
  initialValue: string
  onSubmit: (value: string) => void
  isSubmitted: () => boolean
  onComplete: () => void
}) {
  const [submitted, setSubmitted] = React.useState(false)

  React.useEffect(() => {
    if (!submitted || !isSubmitted()) {
      return
    }

    const timer = setTimeout(onComplete, 300)
    return () => clearTimeout(timer)
  }, [submitted, isSubmitted, onComplete])

  return (
    <AuthPrompt
      initialValue={initialValue}
      submitted={submitted}
      onSubmit={value => {
        onSubmit(value)
        setSubmitted(true)
      }}
    />
  )
}
