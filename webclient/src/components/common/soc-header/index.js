import { html, render } from 'lit-html'
import '@material/top-app-bar'
import '@material/mwc-icon'
import '../../../../node_modules/@material/top-app-bar/dist/mdc.top-app-bar.css'


class SocHeader extends HTMLElement {
    constructor() {
      super()
      const element = html`
      <header class="mdc-top-app-bar">
        <div class="mdc-top-app-bar__row">
            <section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">
            <!-- <mwc-icon class="mdc-top-app-bar__navigation-icon">menu</mwc-icon> -->
          <span class="mdc-top-app-bar__title">
            <h5 class="mdc-typography--headline5">School of Code</h5>
          </span>
        </section>
      </div>
    </header>`
      render(element, this)
    }
  
    connectedCallback() {
    }
  }
  
  customElements.define('soc-header', SocHeader)