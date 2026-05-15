import * as THREE from 'three'
import { gsap } from 'gsap'
import { Scene } from '../three/Scene.js'
import { CardDeck } from '../three/CardDeck.js'

// Ana Sayfa — 3D kart destesi
export class HomePage {
  constructor(container, projects, router) {
    this.container = container
    this.projects = projects
    this.router = router
    this.scene3d = null
    this.deck = null
    this._build()
  }

  _build() {
    this.container.innerHTML = `
      <div id="scroll-hint" class="scroll-hint">
        <span class="scroll-hint-text">Scroll</span>
        <div class="scroll-hint-line"></div>
      </div>
      <div id="project-name-overlay">
        <div class="proj-title"></div>
        <div class="proj-category"></div>
      </div>
    `

    // Three.js sahneyi oluştur
    this.scene3d = new Scene(this.container)
    const threeScene = new THREE.Scene()
    this.scene3d.scene = threeScene

    // Kart destesini oluştur
    this.deck = new CardDeck(this.scene3d, this.projects)

    // Index overlay güncelle
    this.deck.onIndexChange = (i) => this._onIndexChange(i)

    // Kart hover
    this.deck.onCardHover = (proj) => this._showProjectName(proj)

    // Kart tıklama → proje sayfasına geç
    this.deck.onCardClick = (proj) => {
      this.router.navigate('project', proj.id)
    }

    // Animation loop başlat
    this.scene3d.start(threeScene)

    // İlk index güncelle
    this._onIndexChange(0)

    // Scroll hint göster
    setTimeout(() => {
      const hint = document.getElementById('scroll-hint')
      if (hint) hint.classList.add('visible')
    }, 1500)

    // İlk kartın adını göster
    setTimeout(() => {
      this._showProjectName(this.projects[0])
    }, 600)
  }

  _onIndexChange(i) {
    // Index overlay
    const numEl = document.getElementById('project-index-number')
    const totalEl = document.getElementById('project-index-total')
    if (numEl) numEl.textContent = this.projects[i].index
    if (totalEl) totalEl.textContent = String(this.projects.length).padStart(2, '0')

    // Nav'daki yıl bilgisini güncelle
    const navRight = document.getElementById('nav-right-info')
    if (navRight) navRight.textContent = this.projects[i].year

    // Overlay güncelle
    this._showProjectName(this.projects[i])
  }

  _showProjectName(proj) {
    const titleEl = this.container.querySelector('.proj-title')
    const catEl = this.container.querySelector('.proj-category')
    if (!titleEl || !catEl) return

    titleEl.textContent = proj.title
    catEl.textContent = proj.category

    titleEl.classList.add('visible')
    catEl.classList.add('visible')
  }

  // Proje açılış öncesi diğer kartları gizle
  exitToProject(projIndex, onComplete) {
    this.deck.zoomOutToProject(projIndex, onComplete)
  }

  // Proje kapandığında geri dön
  enterFromProject(onComplete) {
    this.deck.zoomInFromProject(onComplete)
  }

  show() {
    this.container.classList.add('active')
  }

  hide() {
    this.container.classList.remove('active')
  }

  destroy() {
    this.deck?.destroy()
    this.scene3d?.destroy()
  }
}
