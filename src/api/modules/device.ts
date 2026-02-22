import BaseClient from '../base'

class DeviceModule extends BaseClient {
  async list() {
    const response = (await this.fetchApi(`/api/authV2/open/devices`)) as {
      id: string
      series: string
      model: string
      edition: 1 | 2
    }[]

    return response
  }

  async status({ deviceId }: { deviceId: string }) {
    const response = (await this.fetchApi(
      `/authV2/open/device/${deviceId}/status`,
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
}

export default DeviceModule
