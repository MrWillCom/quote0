import Conf from 'conf'
import { parse, stringify } from 'yaml'
import { name } from '../package.json'

const config = new Conf({
  projectName: name,
  fileExtension: 'yaml',
  serialize: stringify,
  deserialize: parse,
})

export default config
