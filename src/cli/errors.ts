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
    return new CliError(error.message)
  }

  return new CliError('An unknown error occurred.')
}
