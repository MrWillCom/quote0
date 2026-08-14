import type {
  Device,
  DeviceSettingsResponse,
  DeviceStatusResponse,
  DeviceTask,
  MessageResponse,
  Timezone,
} from '../client'

export interface GlobalCommandOptions {
  json?: boolean
}

export interface DeviceListResult {
  type: 'device-list'
  devices: Device[]
}

export interface DeviceStatusResult {
  type: 'device-status'
  device: DeviceStatusResponse
}

export interface DeviceSettingsResult {
  type: 'device-settings'
  deviceId: string
  settings: DeviceSettingsResponse
}

export interface DeviceSettingsUpdateResult {
  type: 'device-settings-update'
  response: MessageResponse
}

export interface ContentNextResult {
  type: 'content-next'
  response: MessageResponse
}

export interface ContentListResult {
  type: 'content-list'
  tasks: DeviceTask[]
}

export interface ContentTextResult {
  type: 'content-text'
  response: MessageResponse
}

export interface ContentImageResult {
  type: 'content-image'
  response: MessageResponse
  file: string
}

export interface ContentCanvasResult {
  type: 'content-canvas'
  response: MessageResponse
  file: string
}

export interface TimezoneListResult {
  type: 'timezone-list'
  timezones: Timezone[]
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
