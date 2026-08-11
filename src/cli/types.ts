export interface GlobalCommandOptions {
  json?: boolean
}

export interface DeviceListResult {
  type: 'device-list'
  devices: Awaited<ReturnType<import('../api/modules/device').default['list']>>
}

export interface DeviceStatusResult {
  type: 'device-status'
  device: Awaited<ReturnType<import('../api/modules/device').default['status']>>
}

export interface DeviceSettingsResult {
  type: 'device-settings'
  deviceId: string
  settings: Awaited<ReturnType<import('../api/modules/device').default['getSettings']>>
}

export interface DeviceSettingsUpdateResult {
  type: 'device-settings-update'
  response: {
    message: string
  }
}

export interface ContentNextResult {
  type: 'content-next'
  response: {
    message: string
  }
}

export interface ContentListResult {
  type: 'content-list'
  tasks: Awaited<ReturnType<import('../api/modules/content').default['list']>>
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

export interface ContentCanvasResult {
  type: 'content-canvas'
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
  | DeviceSettingsResult
  | DeviceSettingsUpdateResult
  | ContentNextResult
  | ContentListResult
  | ContentTextResult
  | ContentImageResult
  | ContentCanvasResult
  | TimezoneListResult
