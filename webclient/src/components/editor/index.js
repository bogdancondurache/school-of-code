import './style.scss'

import '/lib/ace/src-min-noconflict/ace.js'
import '/lib/ace/src-min-noconflict/mode-c_cpp'
import '/lib/ace/src-min-noconflict/theme-monokai'
import { html, render } from 'lit-html'

class CodeEditor extends HTMLElement {
  constructor() {
    super()
    this.compile = this.compile.bind(this)
    this.conn = new WebSocket(`wss://${process.env.COMPILER_IP}:8080/ws`);
    this.editor = ace.edit('editor')
    this.editor.setTheme("ace/theme/monokai")
    this.editor.session.setMode("ace/mode/c_cpp")
    const compileButton = html`<mwc-fab class="compile-button" icon="send" label="compile"></mwc-fab>`
    render(compileButton, this)
    this.button = document.getElementsByClassName('compile-button')[0];
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
