import { Context } from '@nuxt/vue-app'
import { DocContent, DocPageParams } from '@viewdoc/core/es6/doc'
import { SiteConfigResolver } from '@viewdoc/core/es6/site-config'
import { ExportFormat } from '@viewdoc/core/lib/doc'
import axios from 'axios'
import { Component, Vue } from 'nuxt-property-decorator'
import { SidebarElement } from 'sidebarjs'
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
    const { req, params } = context
    const pageParams: DocPageParams = {
      owner: params.owner,
      repoId: params.repo || params.pathMatch,
      path: `/${(params.repo && params.pathMatch) || ''}`,
    }
    const protocol = req ? 'http:' : window.location.protocol
    const host = req ? req.headers.host : window.location.host
    const pageContent: DocContent = (await axios.get(`${protocol}//${host}/viewdoc/x-api/doc-content`, { params: pageParams })).data
    const baseExportUrl = `${protocol}//${host}/viewdoc/x-api/export?owner=${pageParams.owner}&repoId=${pageParams.repoId}&path=${pageParams.path}`
    return {
      baseExportUrl,
      pageContent,
    }
  },
})
export default class DocPage extends Vue {
  private readonly siteConfigResolver = new SiteConfigResolver()
  private readonly pageContent!: DocContent
  private readonly baseExportUrl!: string

  // TODO make this field private when used to open/close sidebar
  public sidebar!: SidebarElement
  readonly $refs!: {
    pageContentBody: HTMLElement,
  }

  head (): MetaInfo {
    const { info, siteConfig } = this.pageContent
    return {
      title: this.siteConfigResolver.getTitle(info, siteConfig),
      style: [
        { cssText: this.siteConfigResolver.getTheme(siteConfig), type: 'text/css' },
      ],
    }
  }

  mounted () {
    this.sidebar = new SidebarElement({ responsive: true, mainContent: this.$refs.pageContentBody })
    // Fix scrolling with hash link https://forum.vuejs.org/t/how-to-handle-anchors-bookmarks-with-vue-router/14563
    if (this.$route.hash) {
      setTimeout(() => { location.href = this.$route.hash })
    }
  }

  render () {
    return (
      <main>
        <div sidebarjs class='overflow-y-auto'>
          <div>
            {
              Object.keys(ExportFormat).filter((key) => typeof ExportFormat[key] === 'number').map((format: string) =>
                <a key={format} href={`${this.baseExportUrl}&format=${format}`} style='margin: 1em' download>{format}</a>,
              )
            }
          </div>
          <div style='margin-top: 1rem;' domProps={{ innerHTML: this.pageContent.toc }}/>
        </div>
        <div ref='pageContentBody' domProps={{ innerHTML: this.pageContent.body }}/>
      </main>
    )
  }
}
