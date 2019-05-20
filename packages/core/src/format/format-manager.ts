import path from 'path'
import { FormatInterface } from './format-interface'

export class FormatManager {
  constructor (private readonly formats: FormatInterface[]) {}

  findFormatByFileName (fileName: string): FormatInterface | undefined {
    const extName = path.extname(fileName).toLowerCase()
    return this.formats.find((format) => format.extensions.includes(extName))
  }
}
