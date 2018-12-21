class Router {
  constructor(routes) {
    if (!routes) {
      throw new Error('routes param is mandatory')
    }
    this.routes = routes
    this.rootElem = document.getElementById('app')
    this.init()
  }

  init() {
    const r = this.routes;
    ((scope, r) => {
      window.addEventListener('hashchange', () => {
        scope.hasChanged(scope, r)
      })
    })(this, r)
    this.hasChanged(this, r)
  }

  hasChanged(scope, r) {
    if (window.location.hash.length > 0) {
      for (let i = 0, length = r.length; i < length; i++) {
        const route = r[i]
        if (route.isActiveRoute(window.location.hash.substr(1))) {
          scope.goToRoute(route.htmlName)
        }
      }
    } else {
      for (let i = 0, length = r.length; i < length; i++) {
        const route = r[i]
        if (route.default) {
          scope.goToRoute(route.htmlName)
        }
      }
    }
  }

  goToRoute(htmlName) {
    (function () {
      const url = `views/${htmlName}`


      const xhttp = new XMLHttpRequest()
      xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
          const template = document.getElementById('page')
          template.innerHTML = this.responseText
          document.getElementById('app').appendChild(template.content.cloneNode(true))
        }
      }
      xhttp.open('GET', url, true)
      xhttp.send()
    }())
  }
}

export default Router