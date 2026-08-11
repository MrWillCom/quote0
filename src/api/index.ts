import BaseClient, { type BaseClientArgs } from './base'
import CanvasModule from './modules/canvas'
import ContentModule from './modules/content'
import DeviceModule from './modules/device'
import TimezoneModule from './modules/timezone'

class Quote0 extends BaseClient {
  device: DeviceModule
  content: ContentModule
  canvas: CanvasModule
  timezone: TimezoneModule

  constructor(args: BaseClientArgs) {
    super(args)

    this.device = new DeviceModule(args)
    this.content = new ContentModule(args)
    this.canvas = new CanvasModule(args)
    this.timezone = new TimezoneModule(args)
  }

  readonly display = BaseClient.DISPLAY
}

export default Quote0

export {
  BORDER,
  DITHER_TYPES,
  DITHER_KERNELS,
  TEXT_API_FONT_FAMILIES,
  TASK_TYPES,
  type Border,
  type DitherType,
  type DitherKernel,
  type TextApiFontFamily,
  type TextStyle,
  type MessageTextStyle,
  type TextStyles,
  type TaskType,
  type TaskListItem,
} from './modules/content'
export { type PushCanvasOptions } from './modules/canvas'
export { type DeviceSettings } from './modules/device'
export { type Timezone } from './modules/timezone'
