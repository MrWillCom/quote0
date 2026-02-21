import hardcoded from './hardcoded.js'

export async function getDeviceStatus() {
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

export async function pushImage(params: { image: string }) {
  const response = (await hardcoded.fetchApi(
    `/authV2/open/device/${hardcoded.quote0DeviceId}/image`,
    { method: 'POST', body: JSON.stringify({ image: params.image }) },
  )) as { code: number; message: string }

  return response
}
