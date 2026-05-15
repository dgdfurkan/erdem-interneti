import { gsap } from 'gsap'

// Sayfa Geçiş Animasyonları
export class Transition {
  constructor() {
    this.overlay = document.getElementById('page-transition')
    this.isRunning = false
  }

  // Siyah overlay → içeri girer (sayfa değişimi başlar)
  enter(onMidpoint) {
    return new Promise(resolve => {
      if (this.isRunning) {
        onMidpoint?.()
        resolve()
        return
      }
      this.isRunning = true

      gsap.timeline({
        onComplete: () => {
          this.isRunning = false
          resolve()
        }
      })
        .set(this.overlay, { scaleY: 0, transformOrigin: 'bottom' })
        .to(this.overlay, {
          scaleY: 1,
          duration: 0.55,
          ease: 'expo.inOut',
        })
        .call(() => onMidpoint?.())
        .to(this.overlay, {
          scaleY: 0,
          transformOrigin: 'top',
          duration: 0.55,
          ease: 'expo.inOut',
          delay: 0.05,
        })
    })
  }

  // Sadece half-in (proje geçişinde canvas fade ile birlikte)
  halfIn(onMidpoint) {
    return new Promise(resolve => {
      gsap.timeline({ onComplete: resolve })
        .set(this.overlay, { scaleY: 0, transformOrigin: 'bottom' })
        .to(this.overlay, {
          scaleY: 1,
          duration: 0.65,
          ease: 'expo.inOut',
          onComplete: () => onMidpoint?.(),
        })
    })
  }

  // Half-out
  halfOut() {
    return new Promise(resolve => {
      gsap.to(this.overlay, {
        scaleY: 0,
        transformOrigin: 'top',
        duration: 0.65,
        ease: 'expo.inOut',
        onComplete: resolve,
      })
    })
  }
}
