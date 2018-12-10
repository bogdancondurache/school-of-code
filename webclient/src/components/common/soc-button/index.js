import '@material/mwc-button'
import { html, render } from 'lit-html'

class SocButton extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    const wrapper = html`<mwc-button></mwc-button>`
    render(wrapper, this.shadowRoot)
  }

  connectedCallback() {
    const text = this.getAttribute('text')
    const wrapper = this.shadowRoot.querySelector('mwc-button')
    wrapper.innerHTML = text
  }
}

customElements.define('soc-button', SocButton)
