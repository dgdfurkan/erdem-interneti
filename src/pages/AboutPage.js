import gsap from 'gsap';

export class AboutPage {
  constructor(appContainer) {
    this.appContainer = appContainer;
    this.el = document.createElement('div');
    this.el.className = 'about-page';
    this.appContainer.appendChild(this.el);
    this.isBuilt = false;

    // Listen for language changes
    window.addEventListener('language-changed', (e) => {
      if (this.el.classList.contains('visible')) {
        this.updateContent(e.detail.lang);
      }
    });
  }

  build() {
    if (this.isBuilt) return;
    this.el.innerHTML = `
      <div class="about-container">
        <div class="about-image-side">
          <img src="https://loquacious-sable-4e2755.netlify.app/about/DSCF8772%20-%20Copy.png" alt="Erdem Temür">
        </div>
        <div class="about-text-side">
          <h1 class="about-name">Erdem Temür</h1>
          <p class="about-bio-text" id="about-bio-content"></p>
          <div class="about-socials">
            <a href="mailto:erdemtmrr@gmail.com" class="about-btn">Email</a>
            <a href="https://www.instagram.com/erdemtemurr" target="_blank" class="about-btn">Instagram</a>
            <a href="https://bolfgames.github.io/Portfolio" target="_blank" class="about-btn">Portfolio</a>
          </div>
        </div>
      </div>
    `;
    this.isBuilt = true;
  }

  updateContent(lang) {
    const bioEl = document.getElementById('about-bio-content');
    if (!bioEl) return;

    const bios = {
      tr: "2000 yılında Tokat'ta doğan Erdem Temür, şu an İstanbul Bilgi Üniversitesi Görsel İletişim Tasarımı'nda son sınıf öğrencisi ve İstanbul merkezli bir Hard Surface 3D tasarımcısıdır. Oyun dünyasına olan tutkusu, onu karmaşık mekanik yapılar ve detaylı endüstriyel tasarımlar oluşturmaya yöneltti. Çalışmalarında estetik ve işlevselliği birleştirerek, geleceğin teknolojilerini ve bilim kurgu dünyalarını hayata geçirmeyi amaçlıyor.",
      en: "Born in Tokat in 2000, Erdem Temür is currently a senior Visual Communication Design student at Istanbul Bilgi University and an Istanbul-based Hard Surface 3D designer. His passion for gaming led him to specialize in creating complex mechanical structures and detailed industrial designs. By blending aesthetics with functionality in his work, he aims to bring future technologies and science fiction worlds to life."
    };

    bioEl.textContent = bios[lang] || bios.en;
  }

  show() {
    this.build();
    this.updateContent(window.currentLang || 'tr');
    this.el.scrollTop = 0;
    this.el.classList.add('visible');
    gsap.fromTo(this.el, { opacity: 0 }, { opacity: 1, duration: 0.5 });
    
    // Hide canvas and cursor label
    gsap.to('#canvas-wrap', { opacity: 0, duration: 0.5 });
    document.getElementById('cursor-label')?.classList.remove('visible');
  }

  hide() {
    gsap.to(this.el, { 
      opacity: 0, 
      duration: 0.5, 
      onComplete: () => {
        this.el.classList.remove('visible');
      }
    });
  }
}
