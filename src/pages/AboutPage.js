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
          <div class="about-bio-text" id="about-bio-content"></div>
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
      tr: [
        "2000 yılında Tokat'ta doğan Erdem Temür, şu an İstanbul Bilgi Üniversitesi Görsel İletişim Tasarımı'nda son sınıf öğrencisi ve İstanbul merkezli bir Hard Surface 3D tasarımcısıdır.",
        "2023 yılında bir arkadaşıyla Fred Games'i kuran Erdem, bu girişimi yaklaşık 6 ay içinde Hollandalı bir girişimciye devretti. Ardından üç arkadaşıyla Bolf Games'i kurdu ve burada hem yönetici hem 3D artist olarak yaklaşık 2 yıl boyunca yer aldı. Bu süreçte Blender, Substance ve Adobe araçlarına olan hakimiyeti olgunlaştı ve odağı zamanla Hard Surface modellemeye kaydı.",
        "Mezuniyet projesi Eser Miktar, bu dönemde fark ettiği gözlemlerden doğdu. Erdem, ilham kaynağını fiziksel dünyaya taşıdı, gerçek nesneleri fotoğrafladı, formlarını soyutladı ve bunları oyun dünyasına uygun modüler Hard Surface assetlere dönüştürerek 3D tasarımcıların ilham alma süreçlerine yardımcı olmayı hedefledi."
      ],
      en: [
        "Born in Tokat in 2000, Erdem Temür is currently a senior Visual Communication Design student at Istanbul Bilgi University and an Istanbul-based Hard Surface 3D designer.",
        "He founded Fred Games with a friend in 2023 and transferred the startup to a Dutch entrepreneur within approximately six months. He then co-founded Bolf Games, where he served as both a manager and a 3D artist for about two years. Throughout this process, his proficiency in Blender, Substance, and Adobe tools matured, and his focus gradually shifted towards Hard Surface modeling.",
        "His graduation project, Eser Miktar, emerged from the observations he made during this period. He shifted his source of inspiration to the physical world, photographed real objects, abstracted their forms, and transformed them into modular Hard Surface assets suitable for game environments."
      ]
    };

    const lines = bios[lang] || bios.en;
    bioEl.innerHTML = lines.map(line => `<p style="margin-bottom: 24px;">${line}</p>`).join('');
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
