import './style.scss'

import 'ace-builds/src-min-noconflict/ace.js'
import 'ace-builds/src-min-noconflict/mode-c_cpp'
import 'ace-builds/src-min-noconflict/theme-monokai'
import { html, render } from 'lit-html'

class CodeEditor extends HTMLElement {
  constructor() {
    super()
    this.compile = this.compile.bind(this)
    this.conn = new WebSocket(`wss://compiler.schoolof.codes:8080/ws`)
    const compileButton = html`<mwc-fab class="compile-button" icon="send" label="compile"></mwc-fab>`
    render(compileButton, this)
  }

  connectedCallback() {
    const el = document.getElementById('editor')
    this.editor = ace.edit(el)
    this.editor.setTheme("ace/theme/monokai")
    this.editor.session.setMode("ace/mode/c_cpp")
    this.button = document.getElementsByClassName('compile-button')[0]
    this.button.addEventListener('click', this.compile)
  }

  compile() {
    const msg = this.editor.getValue();
    this.conn.onmessage = evt => {
      const compileOutput = (msg) => html`<div class="compile-output">${msg}</div>`
      const div = document.createElement('div')
      this.appendChild(div)
      this.button.style.top = '80vh'
      render(compileOutput(evt.data), div)
    }
    if (!msg) {
      return;
    }
    this.conn.send(msg);
  }
}

customElements.define('code-editor', CodeEditor)
