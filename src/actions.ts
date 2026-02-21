import hardcoded from './hardcoded.js'

export const getDeviceStatus = async () => {
  const response = (await hardcoded.fetchApi(
    `/authV2/open/device/${hardcoded.quote0DeviceId}/status`,
  )) as {
    deviceId: string
    alias: string | null
    location: string | null
    status: {
      version: string
      current: string
      description: string
      battery: string
      wifi: string
    }
    renderInfo: {
      last: string
      current: {
        rotated: boolean
        border: number
        image: string[]
      }
      next: {
        battery: string
        power: string
      }
    }
  }

  return response
}
