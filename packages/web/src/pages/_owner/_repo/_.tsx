import { Context } from '@nuxt/vue-app'
import { DocContent, DocPageParams } from '@viewdoc/core/es6/doc'
import { SiteConfigResolver } from '@viewdoc/core/es6/site-config'
import axios from 'axios'
import { Component, Vue } from 'nuxt-property-decorator'
import { MetaInfo } from 'vue-meta'

@Component<DocPage>({
  validate (context: Context) {
    const { params } = context
    if (params.owner === 'viewdoc' && params.repo === 'x-api') {
      return false
    }
    return !!(params.repo || params.pathMatch)
  },
  async asyncData (context: Context) {
    const { params } = context
    const pageParams: DocPageParams = {
      owner: params.owner,
      repoId: params.repo || params.pathMatch,
      path: `/${(params.repo && params.pathMatch) || ''}`,
    }
    const pageContent: DocContent = (await axios.get('http://localhost:4000/viewdoc/x-api/doc-content', { params: pageParams })).data
    return {
      pageContent,
    }
  },
})
export default class DocPage extends Vue {
  private readonly siteConfigResolver = new SiteConfigResolver()
  private readonly pageContent!: DocContent

  head (): MetaInfo {
    const { info, siteConfig } = this.pageContent
    return {
      title: this.siteConfigResolver.getTitle(info, siteConfig),
      style: [
        { cssText: this.siteConfigResolver.getTheme(siteConfig), type: 'text/css' },
      ],
    }
  }

  render () {
    return (
      <main domProps={{ innerHTML: this.pageContent.body }}/>
    )
  }
}
