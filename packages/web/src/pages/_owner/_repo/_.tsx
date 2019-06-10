import { Context } from '@nuxt/vue-app'
import { DocContent, DocPageParams } from '@viewdoc/core/es6/doc'
import { SiteConfigResolver } from '@viewdoc/core/es6/site-config'
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
    return {
      pageContent,
    }
  },
})
export default class DocPage extends Vue {
  private readonly siteConfigResolver = new SiteConfigResolver()
  private readonly pageContent!: DocContent
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
        <div sidebarjs class='overflow-y-auto' domProps={{ innerHTML: this.pageContent.toc }}/>
        <div ref='pageContentBody' domProps={{ innerHTML: this.pageContent.body }}/>
      </main>
    )
  }
}