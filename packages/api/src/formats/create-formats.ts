import { FormatInterface } from '@viewdoc/core/lib/doc'
import { MarkupService } from './markup-service'
import { SimpleFormat } from './simple-format'

export const createFormats = (markupService: MarkupService): FormatInterface[] => {
  // https://github.com/github/markup#markups
  return [
    new SimpleFormat('markdown', ['.md', '.mkdn', '.mdown', '.markdown'], markupService),
    new SimpleFormat('asciidoc', ['.asc', '.adoc', '.asciidoc'], markupService),
    new SimpleFormat('rst', ['.rst'], markupService),
    new SimpleFormat('rdoc', ['.rdoc'], markupService),
    new SimpleFormat('mediawiki', ['.wiki', '.mediawiki'], markupService),
    new SimpleFormat('textile', ['.textile'], markupService),
    new SimpleFormat('creole', ['.creole'], markupService),
    new SimpleFormat('org', ['.org'], markupService),
    new SimpleFormat('pod', ['.pod'], markupService),
  ]
}
