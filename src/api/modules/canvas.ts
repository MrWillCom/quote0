import BaseClient from '../base'
import type { Border } from './content'

export interface PushCanvasOptions {
  refreshNow?: boolean
  taskKey?: string
  taskAlias?: string
  data?: Record<string, unknown>
  windowData: Record<string, unknown>
  layoutFull?: {
    tw?: string
    style?: Record<string, unknown>
  }
  link?: string
  border?: Border
}

class CanvasModule extends BaseClient {
  async pushCanvas({ deviceId }: { deviceId: string }, options: PushCanvasOptions) {
    const response = (await this.fetchApi(`/authV2/open/device/${deviceId}/canvas`, {
      method: 'POST',
      body: JSON.stringify(options),
    })) as { message: string }

    return response
  }
}

export default CanvasModule
