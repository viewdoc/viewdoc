import { Context } from '@nuxt/vue-app'
import { DocContent, DocPageParams } from '@viewdoc/core/lib/doc'
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
    const { info } = this.pageContent
    const title = `${info.owner}/${info.repo}${info.description ? `: ${info.description}` : ''}`
    return {
      title,
    }
  }

  render () {
    return <div domProps={{ innerHTML: this.pageContent.body }}/>
  }
}
