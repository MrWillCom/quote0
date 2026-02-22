import BaseClient from '../base'

class ContentModule extends BaseClient {
  async pushImage(
    { deviceId }: { deviceId: string },
    options: {
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
