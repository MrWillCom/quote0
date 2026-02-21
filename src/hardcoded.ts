import 'dotenv/config'

const hardcoded = {
  quote0ApiKey: process.env.QUOTE0_API_KEY,
  quote0DeviceId: process.env.QUOTE0_DEVICEID,
  dotApiEndpoint: 'https://dot.mindreset.tech/api',
  composeApiUrl: (path: string) =>
    path.startsWith('/')
      ? hardcoded.dotApiEndpoint + path
      : hardcoded.dotApiEndpoint + '/' + path,
  fetchApi: async (path: string, options?: RequestInit) => {
    const url = hardcoded.composeApiUrl(path)
    const mergedOptions = Object.assign(
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + hardcoded.quote0ApiKey,
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
  },
}

export default hardcoded
