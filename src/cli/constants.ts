import type { Border, DitherKernel } from '../client'

export const BORDER = [0, 1] as const satisfies readonly Border[]

export const DITHER_TYPES = ['DIFFUSION', 'ORDERED', 'NONE'] as const

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
] as const satisfies readonly DitherKernel[]

export const TASK_TYPES = ['loop', 'fixed'] as const
