import BaseClient, { type BaseClientArgs } from './base'
import ContentModule from './modules/content'
import DeviceModule from './modules/device'

class Quote0 extends BaseClient {
  device: DeviceModule
  content: ContentModule

  constructor(args: BaseClientArgs) {
    super(args)

    this.device = new DeviceModule(args)
    this.content = new ContentModule(args)
  }

  readonly display = BaseClient.DISPLAY
}

export default Quote0

export {
  BORDER,
  DITHER_TYPES,
  DITHER_KERNELS,
  type Border,
  type DitherType,
  type DitherKernel,
} from './modules/content'
