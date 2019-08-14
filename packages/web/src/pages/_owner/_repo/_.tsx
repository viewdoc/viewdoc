import { Context } from '@nuxt/vue-app'
import { DocContent, DocPageParams } from '@viewdoc/core/es6/doc'
import { SiteConfigResolver } from '@viewdoc/core/es6/site-config'
import { ExportFormat } from '@viewdoc/core/lib/doc'
import axios from 'axios'
import isRelativeUrl from 'is-relative-url'
import { Component, Vue, Watch } from 'nuxt-property-decorator'
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
  private hrefElementsList!: HTMLAnchorElement[]

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

  @Watch('$route', { immediate: true, deep: true })
  onUrlChange () {
    this.removeListeners()
  }

  navigate (event: MouseEvent) {
    const target: EventTarget | null = event.target
    if (!(target instanceof HTMLAnchorElement)) {
      return
    }
    const href = target.getAttribute('href')
    if (href && isRelativeUrl(href) && !href.startsWith('#')) {
      event.preventDefault()
      this.$router.push(href)
    }
  }

  addListeners () {
    this.removeListeners()
    const hrefElements: HTMLCollectionOf<HTMLAnchorElement> = this.$el.getElementsByTagName('a')
    this.hrefElementsList = Array.prototype.slice.call(hrefElements)
    this.hrefElementsList.forEach((hrefElement) => {
      hrefElement.addEventListener('click', this.navigate, false)
    })
  }

  removeListeners () {
    if (this.hrefElementsList) {
      this.hrefElementsList.forEach((hrefElement) => {
        hrefElement.removeEventListener('click', this.navigate, false)
      })
      this.hrefElementsList = []
    }
  }

  mounted () {
    this.sidebar = new SidebarElement({ responsive: true, mainContent: this.$refs.pageContentBody })
    // Fix scrolling with hash link https://forum.vuejs.org/t/how-to-handle-anchors-bookmarks-with-vue-router/14563
    if (this.$route.hash) {
      setTimeout(() => { location.href = this.$route.hash })
    }
    this.addListeners()
  }

  beforeDestroy () {
    this.removeListeners()
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
