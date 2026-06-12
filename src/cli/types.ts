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

export interface ContentTextResult {
  type: 'content-text'
  response: {
    message: string
  }
}

export interface ContentImageResult {
  type: 'content-image'
  response: {
    message: string
  }
  file: string
}

export interface TimezoneListResult {
  type: 'timezone-list'
  timezones: Awaited<ReturnType<import('../api/modules/timezone').default['list']>>
}

export type CliResult =
  | DeviceListResult
  | DeviceStatusResult
  | ContentNextResult
  | ContentTextResult
  | ContentImageResult
  | TimezoneListResult
