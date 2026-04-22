export interface GlobalCommandOptions {
  json?: boolean
}

export interface DeviceListResult {
  type: 'device-list'
  devices: {
    id: string
    series: string
    model: string
    edition: 1 | 2
  }[]
}

export interface DeviceStatusResult {
  type: 'device-status'
  device: Awaited<ReturnType<import('../api/modules/device').default['status']>>
}

export interface ContentNextResult {
  type: 'content-next'
  response: {
    code: number
    message: string
  }
}

export interface ContentImageResult {
  type: 'content-image'
  response: {
    code: number
    message: string
  }
  file: string
}

export type CliResult =
  | DeviceListResult
  | DeviceStatusResult
  | ContentNextResult
  | ContentImageResult
