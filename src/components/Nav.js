// Navigation Component
export class Nav {
  constructor(navEl, router) {
    this.navEl = navEl
    this.router = router
    this._build()
  }

  _build() {
    this.navEl.innerHTML = `
      <div class="nav-logo">Erdem İnterneti<sup>®</sup></div>
      <div class="nav-links">
        <a class="nav-link" href="#home" data-route="home" id="nav-home">Projects</a>
        <a class="nav-link" href="#research" data-route="research" id="nav-research">Research</a>
        <a class="nav-link" href="#studio" data-route="studio" id="nav-studio">Studio</a>
        <a class="nav-link" href="#contact" data-route="contact" id="nav-contact">Contact</a>
      </div>
      <div class="nav-right" id="nav-right-info">2024</div>
    `
  }

  setActive(route) {
    const links = this.navEl.querySelectorAll('.nav-link')
    links.forEach(link => {
      link.classList.toggle('active', link.dataset.route === route)
    })
  }

  showBackButton() {
    // Back button nav'ın içinde değil, ayrı sabit pozisyonda
  }
}
