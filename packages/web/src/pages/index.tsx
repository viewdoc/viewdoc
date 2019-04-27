import { Component, Vue } from 'nuxt-property-decorator'
import { MetaInfo } from 'vue-meta'

@Component<HomePage>({})
export default class HomePage extends Vue {
  head (): MetaInfo {
    return {
      title: 'Home',
    }
  }

  render () {
    return (
      <div class='ma-3'>
        <h1 class='display-3'>Welcome to ViewDoc!</h1>
        <ul>
          <li><nuxt-link to='/axios/axios'>axios</nuxt-link></li>
          <li><nuxt-link to='/asciidoc/asciidoc'>asciidoc</nuxt-link></li>
        </ul>
      </div>
    )
  }
}
