export class CliError extends Error {
  readonly code: string
  readonly exitCode: number

  constructor(message: string, options?: { code?: string; exitCode?: number }) {
    super(message)
    this.name = 'CliError'
    this.code = options?.code ?? 'CLI_ERROR'
    this.exitCode = options?.exitCode ?? 1
  }
}

export function toCliError(error: unknown) {
  if (error instanceof CliError) {
    return error
  }

  if (error instanceof Error) {
    return new CliError(error.message, { code: 'API_ERROR' })
  }

  if (typeof error === 'string' && error.length > 0) {
    return new CliError(error, { code: 'API_ERROR' })
  }

  if (isMessageRecord(error)) {
    return new CliError(error.message, { code: 'API_ERROR' })
  }

  return new CliError('An unknown error occurred.')
}

function isMessageRecord(error: unknown): error is { message: string } {
  return (
    error != null &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string' &&
    error.message.length > 0
  )
}
