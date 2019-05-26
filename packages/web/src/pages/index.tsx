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
      <main>
        <h1>Welcome to ViewDoc!</h1>
        <ul>
          <li><nuxt-link to='/axios/axios'>axios</nuxt-link></li>
          <li><nuxt-link to='/asciidoc/asciidoc'>asciidoc</nuxt-link></li>
          <li><nuxt-link to='/ikatyang/emoji-cheat-sheet'>emoji</nuxt-link></li>
        </ul>
      </main>
    )
  }
}
