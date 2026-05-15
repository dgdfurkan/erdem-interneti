// Custom Cursor — fare hareketini takip eder, hover/click state'leri yönetir

export class Cursor {
  constructor() {
    this.cursor = document.getElementById('cursor')
    this.dot = document.getElementById('cursor-dot')
    this.currentX = -100
    this.currentY = -100
    this.targetX = -100
    this.targetY = -100
    this.rafId = null

    this._init()
  }

  _init() {
    document.addEventListener('mousemove', (e) => {
      this.targetX = e.clientX
      this.targetY = e.clientY

      // Dot'u anında hareket ettir
      this.dot.style.transform = `translate(${this.targetX}px, ${this.targetY}px) translate(-50%, -50%)`
    })

    document.addEventListener('mousedown', () => {
      this.cursor.classList.add('click')
    })

    document.addEventListener('mouseup', () => {
      this.cursor.classList.remove('click')
    })

    // Hover detect — tüm tıklanabilir elementler
    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('a, button, [data-hover], .nav-link, .research-item, .contact-email, .contact-social-link')
      if (target) {
        this.cursor.classList.add('hover')
      }
    })

    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest('a, button, [data-hover], .nav-link, .research-item, .contact-email, .contact-social-link')
      if (target) {
        this.cursor.classList.remove('hover')
      }
    })

    this._animate()
  }

  _animate() {
    // Cursor'u lag ile hareket ettir (smooth trailing effect)
    this.currentX += (this.targetX - this.currentX) * 0.12
    this.currentY += (this.targetY - this.currentY) * 0.12

    this.cursor.style.transform = `translate(${this.currentX}px, ${this.currentY}px) translate(-50%, -50%)`

    this.rafId = requestAnimationFrame(() => this._animate())
  }

  destroy() {
    cancelAnimationFrame(this.rafId)
  }
}
