// Hash-tabanlı SPA Router
// URL: /#home, /#research, /#studio, /#contact, /#project/atlas

export class Router {
  constructor(onNavigate) {
    this.onNavigate = onNavigate
    this.currentRoute = null
  }

  // Sayfalar hazır olduktan sonra çağrılır
  start() {
    window.addEventListener('hashchange', () => this._handleRoute())
    this._handleRoute()
  }

  _handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'home'
    const parts = hash.split('/')
    const route = parts[0]
    const param = parts[1] || null

    if (route === this.currentRoute && !param) return

    this.currentRoute = route
    this.onNavigate(route, param)
  }

  navigate(route, param = null) {
    const hash = param ? `#${route}/${param}` : `#${route}`
    window.location.hash = hash
  }

  getCurrentRoute() {
    const hash = window.location.hash.replace('#', '') || 'home'
    return hash.split('/')[0]
  }
}
