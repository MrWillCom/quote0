import hardcoded from './hardcoded'

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

export async function pushImage(params: {
  refreshNow?: boolean
  image: string
  link?: string
  border?: 0 | 1
  ditherType?: 'DIFFUSION' | 'ORDERED' | 'NONE'
  ditherKernel?:
    | 'THRESHOLD'
    | 'ATKINSON'
    | 'BURKES'
    | 'FLOYD_STEINBERG'
    | 'SIERRA2'
    | 'STUCKI'
    | 'JARVIS_JUDICE_NINKE'
    | 'DIFFUSION_ROW'
    | 'DIFFUSION_COLUMN'
    | 'DIFFUSION_2D'
  taskKey?: string
}) {
  const response = (await hardcoded.fetchApi(
    `/authV2/open/device/${hardcoded.quote0DeviceId}/image`,
    { method: 'POST', body: JSON.stringify(params) },
  )) as { code: number; message: string }

  return response
}
