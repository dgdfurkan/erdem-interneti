import * as THREE from 'three'
import { gsap } from 'gsap'

// 3D Kart Destesi — projenin kalbi
// Her proje bir PlaneGeometry mesh'i, Z-ekseni boyunca dizili
// Scroll → aktif kart değişimi, Mouse → parallax tilt

export class CardDeck {
  constructor(scene3d, projects) {
    this.scene3d = scene3d       // Scene instance
    this.scene = scene3d.scene   // THREE.Scene
    this.camera = scene3d.camera
    this.projects = projects

    this.cards = []
    this.activeIndex = 0
    this.isAnimating = false
    this.group = new THREE.Group()

    // Parallax state
    this.mouseX = 0
    this.mouseY = 0
    this.targetRotX = 0
    this.targetRotY = 0

    // Z spacing kart başına
    this.Z_OFFSET = 2.2
    this.CARD_W = 2.6
    this.CARD_H = 3.6

    // Callbacks
    this.onIndexChange = null
    this.onCardClick = null
    this.onCardHover = null

    this._build()
    this._bindEvents()
  }

  _build() {
    this.scene.add(this.group)

    this.projects.forEach((proj, i) => {
      const card = this._createCard(proj, i)
      this.cards.push(card)
      this.group.add(card.mesh)
    })

    this._updatePositions(false)
  }

  _createCard(proj, index) {
    const geo = new THREE.PlaneGeometry(this.CARD_W, this.CARD_H, 1, 1)

    // Renkten texture oluştur (canvas)
    const texture = this._createColorTexture(proj)

    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 1,
    })

    const mesh = new THREE.Mesh(geo, mat)

    // Z-ekseni boyunca stack — en üstteki (index=0) en ön
    mesh.position.z = -index * this.Z_OFFSET

    // Slight random rotation for natural deck feel
    mesh.rotation.z = (Math.random() - 0.5) * 0.04

    return { mesh, mat, proj, index }
  }

  _createColorTexture(proj) {
    const size = 512
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = Math.round(size * (this.CARD_H / this.CARD_W))
    const ctx = canvas.getContext('2d')

    // Arka plan — proje rengi
    ctx.fillStyle = proj.color
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // İnce noise dokusu
    for (let i = 0; i < 8000; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      const a = Math.random() * 0.08
      ctx.fillStyle = `rgba(255,255,255,${a})`
      ctx.fillRect(x, y, 1, 1)
    }

    // Proje başlığını karta yaz
    ctx.fillStyle = 'rgba(10,10,10,0.85)'
    ctx.font = `300 ${size * 0.08}px Inter, Helvetica Neue, sans-serif`
    ctx.letterSpacing = `${size * 0.003}px`
    ctx.textAlign = 'left'
    ctx.fillText(proj.title.toUpperCase(), size * 0.1, canvas.height * 0.82)

    ctx.fillStyle = 'rgba(10,10,10,0.4)'
    ctx.font = `300 ${size * 0.045}px Inter, Helvetica Neue, sans-serif`
    ctx.fillText(proj.category, size * 0.1, canvas.height * 0.88)

    // İnce border
    ctx.strokeStyle = 'rgba(10,10,10,0.1)'
    ctx.lineWidth = 1
    ctx.strokeRect(0.5, 0.5, canvas.width - 1, canvas.height - 1)

    return new THREE.CanvasTexture(canvas)
  }

  _updatePositions(animate = true) {
    this.cards.forEach((card, i) => {
      const relIndex = i - this.activeIndex
      const targetZ = -relIndex * this.Z_OFFSET
      const targetOpacity = relIndex < 0
        ? 0               // Geçilmiş kartlar görünmez
        : relIndex === 0
        ? 1               // Aktif kart tam görünür
        : Math.max(0, 1 - relIndex * 0.35) // Arkadakiler soluklaşıyor

      const targetScale = relIndex === 0 ? 1 : Math.max(0.88, 1 - relIndex * 0.04)
      const targetY = relIndex === 0 ? 0 : relIndex * -0.06

      if (animate) {
        gsap.to(card.mesh.position, {
          z: targetZ,
          y: targetY,
          duration: 1.0,
          ease: 'expo.out',
        })
        gsap.to(card.mat, {
          opacity: targetOpacity,
          duration: 0.6,
          ease: 'power2.out',
        })
        gsap.to(card.mesh.scale, {
          x: targetScale,
          y: targetScale,
          duration: 1.0,
          ease: 'expo.out',
        })
      } else {
        card.mesh.position.z = targetZ
        card.mesh.position.y = targetY
        card.mat.opacity = targetOpacity
        card.mesh.scale.setScalar(targetScale)
      }
    })
  }

  _bindEvents() {
    this._wheelHandler = (e) => this._onWheel(e)
    this._mouseMoveHandler = (e) => this._onMouseMove(e)
    this._clickHandler = (e) => this._onClick(e)

    // wheel sadece canvas üzerindeyken çalışsın (diğer sayfaları bozmaz)
    this.scene3d.canvas.addEventListener('wheel', this._wheelHandler, { passive: false })
    window.addEventListener('mousemove', this._mouseMoveHandler)
    this.scene3d.canvas.addEventListener('click', this._clickHandler)

    // Parallax update callback
    this.scene3d.addUpdateCallback(() => this._updateParallax())
  }

  _onWheel(e) {
    e.preventDefault()
    if (this.isAnimating) return

    const delta = e.deltaY > 0 ? 1 : -1
    const newIndex = this.activeIndex + delta

    if (newIndex < 0 || newIndex >= this.projects.length) return

    this.isAnimating = true
    this.activeIndex = newIndex
    this._updatePositions(true)

    if (this.onIndexChange) this.onIndexChange(this.activeIndex)

    setTimeout(() => { this.isAnimating = false }, 700)
  }

  _onMouseMove(e) {
    // -1 to 1 normalize (parallax için)
    this.mouseX = (e.clientX / window.innerWidth) * 2 - 1
    this.mouseY = -(e.clientY / window.innerHeight) * 2 + 1

    // Raycaster hover detect
    const rect = this.scene3d.canvas.getBoundingClientRect()
    if (!rect.width) return
    const rx = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const ry = -((e.clientY - rect.top) / rect.height) * 2 + 1

    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera({ x: rx, y: ry }, this.camera)
    const intersects = raycaster.intersectObjects(this.cards.map(c => c.mesh))

    if (intersects.length > 0 && this.onCardHover) {
      const mesh = intersects[0].object
      const card = this.cards.find(c => c.mesh === mesh)
      if (card) this.onCardHover(card.proj)
    }
  }

  _onClick(e) {
    const rect = this.scene3d.canvas.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1

    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera({ x, y }, this.camera)
    const intersects = raycaster.intersectObjects(this.cards.map(c => c.mesh))

    if (intersects.length > 0) {
      const mesh = intersects[0].object
      const card = this.cards.find(c => c.mesh === mesh)
      if (card && this.onCardClick) {
        this.onCardClick(card.proj, card.index)
      }
    }
  }

  _updateParallax() {
    // Smooth lerp kamera rotation'ı
    const maxAngle = 0.06
    this.targetRotY = this.mouseX * maxAngle
    this.targetRotX = this.mouseY * maxAngle * 0.6

    this.group.rotation.y += (this.targetRotY - this.group.rotation.y) * 0.06
    this.group.rotation.x += (this.targetRotX - this.group.rotation.x) * 0.06
  }

  // Proje açılış animasyonu — aktif kart öne çıkar, diğerleri kaybolur
  zoomOutToProject(activeIndex, onComplete) {
    this.cards.forEach((card, i) => {
      if (i === activeIndex) {
        // Aktif kart büyür ve öne gelir
        gsap.to(card.mesh.scale, {
          x: 1.8,
          y: 1.8,
          duration: 0.7,
          ease: 'expo.in',
        })
        gsap.to(card.mat, {
          opacity: 0,
          duration: 0.5,
          delay: 0.2,
          ease: 'power2.in',
        })
      } else {
        // Diğerleri geriye çekilip kaybolur
        gsap.to(card.mat, {
          opacity: 0,
          duration: 0.4,
          ease: 'power2.in',
        })
        gsap.to(card.mesh.position, {
          z: card.mesh.position.z - 1.5,
          duration: 0.6,
          ease: 'power2.in',
        })
      }
    })

    // Group rotation da sıfırlanır
    gsap.to(this.group.rotation, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'power2.out',
    })

    setTimeout(() => { if (onComplete) onComplete() }, 700)
  }

  // Ana sayfaya geri dönüş animasyonu
  zoomInFromProject(onComplete) {
    // Önce pozisyonları reset et (görünmez)
    this._updatePositions(false)
    this.cards.forEach(card => { card.mat.opacity = 0 })

    // Sonra animate et
    setTimeout(() => {
      this._updatePositions(true)
      if (onComplete) setTimeout(onComplete, 800)
    }, 100)
  }

  goTo(index) {
    if (index < 0 || index >= this.projects.length) return
    this.activeIndex = index
    this._updatePositions(true)
    if (this.onIndexChange) this.onIndexChange(this.activeIndex)
  }

  destroy() {
    this.scene3d.canvas.removeEventListener('wheel', this._wheelHandler)
    window.removeEventListener('mousemove', this._mouseMoveHandler)
    if (this.scene3d.canvas) {
      this.scene3d.canvas.removeEventListener('click', this._clickHandler)
    }
    this.cards.forEach(card => {
      card.mesh.geometry.dispose()
      card.mat.map?.dispose()
      card.mat.dispose()
    })
    this.scene.remove(this.group)
  }
}
