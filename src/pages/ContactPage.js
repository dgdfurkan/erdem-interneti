import { gsap } from 'gsap'

// Contact Sayfası — minimalist, tam ekran ortalanmış
export class ContactPage {
  constructor(container) {
    this.container = container
    this._build()
  }

  _build() {
    this.container.innerHTML = `
      <div class="contact-wrapper">
        <p class="contact-eyebrow">Get in touch</p>
        <a href="mailto:merhaba@erdem.co" class="contact-email" id="contact-email">
          merhaba@erdem.co
        </a>
        <div class="contact-divider"></div>
        <div class="contact-socials">
          <a href="#" class="contact-social-link">Instagram</a>
          <a href="#" class="contact-social-link">Twitter</a>
          <a href="#" class="contact-social-link">LinkedIn</a>
          <a href="#" class="contact-social-link">Behance</a>
        </div>
      </div>
    `
  }

  _animateIn() {
    const els = this.container.querySelectorAll('.contact-eyebrow, .contact-email, .contact-divider, .contact-social-link')
    gsap.fromTo(els,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'expo.out',
        stagger: 0.08,
        delay: 0.1,
      }
    )
  }

  show() {
    this.container.classList.add('active')
    this._animateIn()
  }

  hide() {
    this.container.classList.remove('active')
  }
}
