import { gsap } from 'gsap'

// Studio Sayfası — metin + tablo
export class StudioPage {
  constructor(container) {
    this.container = container
    this._build()
  }

  _build() {
    this.container.innerHTML = `
      <div class="studio-wrapper">

        <div class="studio-section">
          <div class="studio-section-label">About</div>
          <p class="studio-intro">
            Erdem İnterneti — tasarım, strateji ve dijital deneyimler alanında çalışan
            bağımsız bir stüdyo. Anlam taşıyan işler üretiyoruz.
          </p>
        </div>

        <div class="studio-section">
          <div class="studio-section-label">Services</div>
          <table class="studio-table">
            <tr><td>Brand Identity</td><td>Kurumsal kimlik, logo, renk ve tipografi sistemleri</td></tr>
            <tr><td>Digital Design</td><td>Web tasarım, kullanıcı deneyimi, interaktif prototipler</td></tr>
            <tr><td>Art Direction</td><td>Fotoğraf yönetimi, editoryal tasarım, kampanya konsepti</td></tr>
            <tr><td>Motion Design</td><td>2D/3D animasyon, video prodüksiyonu, sosyal medya görselleri</td></tr>
            <tr><td>Strategy</td><td>Marka konumlandırma, pazar analizi, içerik stratejisi</td></tr>
          </table>
        </div>

        <div class="studio-section">
          <div class="studio-section-label">Selected Clients</div>
          <div class="studio-clients">
            <div class="studio-client-item">Atlas Mimarlık</div>
            <div class="studio-client-item">Venn Studio</div>
            <div class="studio-client-item">Forme Galeri</div>
            <div class="studio-client-item">Nuage Creative</div>
            <div class="studio-client-item">Terra Foods</div>
            <div class="studio-client-item">Soleil Cosmetics</div>
            <div class="studio-client-item">Meridyen Yayınları</div>
            <div class="studio-client-item">Boşluk Dergisi</div>
          </div>
        </div>

        <div class="studio-section">
          <div class="studio-section-label">Awards & Recognition</div>
          <table class="studio-table">
            <tr><td>Awwwards — SOTD</td><td>2024</td></tr>
            <tr><td>Behance — Featured</td><td>2024, 2023</td></tr>
            <tr><td>CSS Design Awards</td><td>2023</td></tr>
            <tr><td>Creativerly — Top 10</td><td>2023</td></tr>
          </table>
        </div>

      </div>
    `
  }

  _animateIn() {
    const sections = this.container.querySelectorAll('.studio-section')
    gsap.fromTo(sections,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'expo.out',
        stagger: 0.1,
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
