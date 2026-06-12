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

export const TEXT_API_FONT_FAMILIES = [
  'ChillDuanSans',
  'ChillKSans',
  'ChillOrganic',
  'ChillRoundF',
  'ChillRoundGothic',
  'Cusong16',
  'DotGothic16',
  'FusionPixel8',
  'FusionPixel10',
  'FusionPixel12',
  'Liusong24',
  'LogoSCUnboundedSans',
  'MaokenYingBiKaiShuJ0.09',
  'PlayfairDisplay',
  'Quan8',
  'Unifont16',
  'UnifontExMono16',
  'XiaoyaPixel12',
  'Zihunzhoukesong',
  'Zpix12',
] as const
export type TextApiFontFamily = (typeof TEXT_API_FONT_FAMILIES)[number]

export const TASK_TYPES = ['fixed', 'loop'] as const
export type TaskType = (typeof TASK_TYPES)[number]

export interface TextStyle {
  fontFamily?: TextApiFontFamily
  fontSize?: number
  fontWeight?: number
}

export interface MessageTextStyle extends TextStyle {
  lineHeight?: number
}

export interface TextStyles {
  title?: TextStyle
  message?: MessageTextStyle
  signature?: TextStyle
}

type NextApiResponse = { code: number; message: string }
type ApiResponse = { message: string }

class ContentModule extends BaseClient {
  async next({ deviceId }: { deviceId: string }) {
    const response = (await this.fetchApi(`/authV2/open/device/${deviceId}/next`, {
      method: 'POST',
    })) as NextApiResponse

    return response
  }

  async list({ deviceId, taskType }: { deviceId: string; taskType: TaskType }) {
    const response = (await this.fetchApi(`/authV2/open/device/${deviceId}/${taskType}/list`)) as {
      type: 'TEXT_API' | 'IMAGE_API' | 'GENERAL'
      key: string | null
      refreshNow?: boolean
      title?: string
      message?: string
      signature?: string
      icon?: string
      link?: string
      image?: string
      border?: Border
      ditherType?: string
      ditherKernel?: string
    }

    return response
  }

  async pushText(
    { deviceId }: { deviceId: string },
    options: {
      refreshNow?: boolean
      title?: string
      message?: string
      signature?: string
      icon?: string
      link?: string
      taskKey?: string
      taskAlias?: string | number
      styles?: TextStyles
    },
  ) {
    const response = (await this.fetchApi(`/authV2/open/device/${deviceId}/text`, {
      method: 'POST',
      body: JSON.stringify(options),
    })) as ApiResponse

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
      taskAlias?: string | number
    },
  ) {
    const response = (await this.fetchApi(`/authV2/open/device/${deviceId}/image`, {
      method: 'POST',
      body: JSON.stringify(options),
    })) as ApiResponse

    return response
  }
}

export default ContentModule
