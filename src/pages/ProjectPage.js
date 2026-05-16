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
      // Eğer dikey mod aktifse, tekerlek doğal dikey scroll yapmalı
      if (window.innerWidth > 600 && e.deltaY !== 0 && !this.el.classList.contains('vertical-mode')) {
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
    this.el.scrollTop = 0;
    
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
        
        const muteIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`;
        const unmuteIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`;

        const updateBtnUI = () => {
          soundBtn.innerHTML = (window.isMuted === false) ? unmuteIcon : muteIcon;
          mediaEl.muted = window.isMuted !== false;
        };

        // Başlangıç durumu
        if (window.isMuted === undefined) window.isMuted = true;
        updateBtnUI();

        soundBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          window.isMuted = !window.isMuted;
          
          // Sayfadaki TÜM videoların sesini güncelle
          document.querySelectorAll('video').forEach(v => {
            v.muted = window.isMuted;
          });
          // TÜM ses butonlarını güncelle
          document.querySelectorAll('.video-sound-btn').forEach(btn => {
            btn.innerHTML = (window.isMuted === false) ? unmuteIcon : muteIcon;
          });
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
