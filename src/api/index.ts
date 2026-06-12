import BaseClient, { type BaseClientArgs } from './base'
import ContentModule from './modules/content'
import DeviceModule from './modules/device'
import TimezoneModule from './modules/timezone'

class Quote0 extends BaseClient {
  device: DeviceModule
  content: ContentModule
  timezone: TimezoneModule

  constructor(args: BaseClientArgs) {
    super(args)

    this.device = new DeviceModule(args)
    this.content = new ContentModule(args)
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
  type Border,
  type DitherType,
  type DitherKernel,
  type TextApiFontFamily,
  type TextStyle,
  type MessageTextStyle,
  type TextStyles,
} from './modules/content'
export { type Timezone } from './modules/timezone'
