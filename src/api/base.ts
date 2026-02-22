export interface BaseClientArgs {
  apiKey: string
}

class BaseClient {
  apiKey: string
  constructor({ apiKey }: BaseClientArgs) {
    this.apiKey = apiKey
  }

  static readonly API_ENDPOINT = 'https://dot.mindreset.tech/api'
  protected readonly apiEndpoint = BaseClient.API_ENDPOINT

  static readonly DISPLAY = { width: 296, height: 152 }
  readonly display = BaseClient.DISPLAY

  protected composeApiUrl(path: string) {
    return path.startsWith('/')
      ? this.apiEndpoint + path
      : this.apiEndpoint + '/' + path
  }

  protected async fetchApi(path: string, options?: RequestInit) {
    const url = this.composeApiUrl(path)
    const mergedOptions = Object.assign(
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + this.apiKey,
        },
      },
      options ?? {},
    )

    try {
      const response = await fetch(url, mergedOptions)

      if (response.ok) {
        return await response.json()
      } else {
        throw new Error(
          `API request failed with status ${response.status}: ${response.statusText}`,
        )
      }
    } catch (error) {
      throw error
    }
  }
}

export default BaseClient
