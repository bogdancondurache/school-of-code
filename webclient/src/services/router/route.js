class Route {
  constructor(name, htmlName, defaultRoute) {
    if (!name || !htmlName) {
      throw new Error('name and htmlName params are mandatories')
    }
    this.name = name
    this.htmlName = htmlName
    this.default = defaultRoute
  }

  isActiveRoute(hashedPath) {
    return hashedPath.replace('#', '') === this.name
  }
}

export default Route
