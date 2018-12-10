import Route from './route'
import Router from './router'

const RouterService = (() => {
  return {
    init() {
      new Router([
        new Route('home', 'home.html', true),
      ])
    },
  }
})()

export default RouterService
