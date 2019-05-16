import { Context } from '@nuxt/vue-app'
import { DocContent, DocPageParams } from '@viewdoc/core/es6/doc'
import { createTheme } from '@viewdoc/tiny.css/es6'
import axios from 'axios'
import { Component, Vue } from 'nuxt-property-decorator'
import { MetaInfo } from 'vue-meta'

@Component<DocPage>({
  validate (context: Context) {
    const { params } = context
    if (params.owner === 'viewdoc' && params.repo === 'x-api') {
      return false
    }
    return true
  },
  async asyncData (context: Context) {
    const { params } = context
    const pageParams: DocPageParams = {
      owner: params.owner,
      repoId: params.repo,
      docPath: `/${params.path || ''}`,
    }
    const pageContent: DocContent = (await axios.get('http://localhost:4000/viewdoc/x-api/doc-content', { params: pageParams })).data
    return {
      pageContent,
    }
  },
})
export default class DocPage extends Vue {
  private readonly pageContent!: DocContent

  head (): MetaInfo {
    const { info, siteConfig } = this.pageContent
    const title = siteConfig && siteConfig.title || `${info.owner}/${info.repo}${info.description ? `: ${info.description}` : ''}`
    const themeBase = siteConfig && siteConfig.theme && siteConfig.theme.base || 'light'
    const themeOptions = siteConfig && siteConfig.theme && siteConfig.theme.options
    return {
      title,
      style: [
        { cssText: createTheme(themeBase, themeOptions), type: 'text/css' },
      ],
    }
  }

  render () {
    return (
      <main domProps={{ innerHTML: this.pageContent.body }}/>
    )
  }
}
