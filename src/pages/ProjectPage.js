import gsap from 'gsap';

export class ProjectPage {
  constructor(appContainer) {
    this.appContainer = appContainer;
    this.el = document.createElement('div');
    this.el.className = 'project-page';
    this.appContainer.appendChild(this.el);

    // Vite base URL — public klasörüne erişim için gerekli
    this.baseURL = import.meta.env.BASE_URL || '/';

    // Fare tekerleğini (vertical scroll) yatay kaydırmaya (horizontal) çeviriyoruz (Sadece Desktop için)
    this.el.addEventListener('wheel', (e) => {
      if (window.innerWidth > 600 && e.deltaY !== 0) {
        e.preventDefault();
        this.el.scrollLeft += e.deltaY;
      }
    }, { passive: false });

    // Listen for language changes to dynamically update description
    window.addEventListener('language-changed', (e) => {
      if (this.currentProject && this.el.classList.contains('visible')) {
        const descEl = this.el.querySelector('.project-desc');
        if (descEl) {
          const lang = e.detail.lang;
          descEl.textContent = this.currentProject[`description_${lang}`];
        }
      }
    });
  }

  show(project) {
    this.currentProject = project;
    this.el.innerHTML = '';
    this.el.scrollLeft = 0;
    
    // Info Slide (ilk ekran — başlık ve açıklama)
    const infoSlide = document.createElement('div');
    infoSlide.className = 'project-info-slide';
    
    const lang = window.currentLang || 'tr';
    const currentDesc = project[`description_${lang}`];

    infoSlide.innerHTML = `
      <h1 class="project-title">${project.title}</h1>
      <p class="project-desc">${currentDesc}</p>
    `;
    this.el.appendChild(infoSlide);

    // Gallery — tüm görseller ve videolar peş peşe, boşluksuz
    const gallery = document.createElement('div');
    gallery.className = 'project-gallery';

    project.images.forEach((img) => {
      const isVideo = img.type === 'video';
      const mediaEl = document.createElement(isVideo ? 'video' : 'img');
      
      // Doğru yol: /erdem-interneti/ + esermiktar/deuce/1/bomb4.jpg
      mediaEl.src = this.baseURL + img.src;
      
      if (isVideo) {
        mediaEl.autoplay = true;
        mediaEl.loop = true;
        mediaEl.muted = true;
        mediaEl.playsInline = true;

        // Video'yu bir wrapper'a sar — ses butonu için gerekli
        const wrapper = document.createElement('div');
        wrapper.className = 'video-wrapper';

        // 🔊 Ses butonu — sağ alt köşe
        const soundBtn = document.createElement('button');
        soundBtn.className = 'video-sound-btn';
        soundBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`;

        soundBtn.addEventListener('click', () => {
          // Sesli, tek seferlik, baştan çal
          mediaEl.loop = false;
          mediaEl.muted = false;
          mediaEl.currentTime = 0;
          mediaEl.play();
          soundBtn.classList.add('hidden');
        });

        // Video bittiğinde → sessiz loop'a dön, buton geri gelsin
        mediaEl.addEventListener('ended', () => {
          mediaEl.muted = true;
          mediaEl.loop = true;
          mediaEl.play();
          soundBtn.classList.remove('hidden');
        });

        wrapper.appendChild(mediaEl);
        wrapper.appendChild(soundBtn);
        gallery.appendChild(wrapper);
      } else {
        gallery.appendChild(mediaEl);
      }
    });

    this.el.appendChild(gallery);

    // CSS class ile göster (display:flex korunsun, display:block OLMAMALI)
    this.el.classList.add('visible');
    gsap.fromTo(this.el, { opacity: 0 }, { opacity: 1, duration: 0.5 });
    
    // 3D canvas'ı gizle
    gsap.to('#canvas-wrap', { opacity: 0, duration: 0.5 });
    document.getElementById('cursor-label')?.classList.remove('visible');
  }

  hide() {
    gsap.to(this.el, { 
      opacity: 0, 
      duration: 0.5, 
      onComplete: () => {
        this.el.classList.remove('visible');
        this.el.innerHTML = '';
      }
    });
    
    // 3D canvas'ı geri getir
    gsap.to('#canvas-wrap', { opacity: 1, duration: 0.5 });
  }
}
