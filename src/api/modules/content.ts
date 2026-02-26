import BaseClient from '../base'

export const BORDER = [0, 1] as const
export type Border = (typeof BORDER)[number]

export const DITHER_TYPES = ['DIFFUSION', 'ORDERED', 'NONE'] as const
export type DitherType = (typeof DITHER_TYPES)[number]

export const DITHER_KERNELS = [
  'THRESHOLD',
  'ATKINSON',
  'BURKES',
  'FLOYD_STEINBERG',
  'SIERRA2',
  'STUCKI',
  'JARVIS_JUDICE_NINKE',
  'DIFFUSION_ROW',
  'DIFFUSION_COLUMN',
  'DIFFUSION_2D',
] as const
export type DitherKernel = (typeof DITHER_KERNELS)[number]

class ContentModule extends BaseClient {
  async next({ deviceId }: { deviceId: string }) {
    const response = (await this.fetchApi(
      `/authV2/open/device/${deviceId}/next`,
      {
        method: 'POST',
      },
    )) as { code: number; message: string }

    return response
  }

  async pushImage(
    { deviceId }: { deviceId: string },
    options: {
      refreshNow?: boolean
      image: string
      link?: string
      border?: Border
      ditherType?: DitherType
      ditherKernel?: DitherKernel
      taskKey?: string
    },
  ) {
    const response = (await this.fetchApi(
      `/authV2/open/device/${deviceId}/image`,
      { method: 'POST', body: JSON.stringify(options) },
    )) as { code: number; message: string }

    return response
  }
}

export default ContentModule
