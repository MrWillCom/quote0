import BaseClient from '../base'

export interface DeviceSettings {
  deviceId?: string
  alias?: string | null
  location?: string | null
  timezone?: string
  interval?: {
    powerMs?: number
    batteryMs?: number
  }
  sleep?: {
    enabled: boolean
    start: string
    end: string
  }
}

class DeviceModule extends BaseClient {
  async list() {
    const response = (await this.fetchApi(`/authV2/open/devices`)) as {
      id: string
      alias?: string | null
      location?: string | null
      series: string
      model: string
      edition: 1 | 2
    }[]

    return response
  }

  async status({ deviceId }: { deviceId: string }) {
    const response = (await this.fetchApi(`/authV2/open/device/${deviceId}/status`)) as {
      deviceId: string
      alias?: string | null
      location?: string | null
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
          image?: string[] | null
        }
        next: {
          battery: string
          power: string
        }
      }
    }

    return response
  }

  async getSettings({ deviceId }: { deviceId: string }) {
    const response = (await this.fetchApi(
      `/authV2/open/device/${deviceId}/settings`,
    )) as DeviceSettings

    return response
  }

  async updateSettings({ deviceId }: { deviceId: string }, settings: DeviceSettings) {
    const response = (await this.fetchApi(`/authV2/open/device/${deviceId}/settings`, {
      method: 'POST',
      body: JSON.stringify(settings),
    })) as { message: string }

    return response
  }
}

export default DeviceModule
