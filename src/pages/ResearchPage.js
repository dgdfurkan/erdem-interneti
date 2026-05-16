import gsap from 'gsap';
import { PROJECTS } from '../data/projects.js';

export class ResearchPage {
  constructor(appContainer) {
    this.appContainer = appContainer;
    this.el = document.createElement('div');
    this.el.className = 'research-page';
    this.appContainer.appendChild(this.el);
    this.baseURL = import.meta.env.BASE_URL || '/';
    this.isBuilt = false;
  }

  build() {
    if (this.isBuilt) return;
    this.el.innerHTML = '';
    
    // Header spacing
    const headerSpace = document.createElement('div');
    headerSpace.style.height = '120px';
    this.el.appendChild(headerSpace);

    PROJECTS.forEach(project => {
      const section = document.createElement('div');
      section.className = 'research-project-section';

      const title = document.createElement('h2');
      title.className = 'research-project-title';
      title.textContent = project.title;
      section.appendChild(title);
      title.style.cursor = 'pointer';
      title.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('project-click', { detail: project }));
      });

      const masonry = document.createElement('div');
      masonry.className = 'research-masonry';

      project.images.forEach(img => {
        const item = document.createElement('div');
        item.className = 'research-item';
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => {
          window.dispatchEvent(new CustomEvent('project-click', { detail: project }));
        });

        const isVideo = img.type === 'video';
        const mediaEl = document.createElement(isVideo ? 'video' : 'img');
        mediaEl.src = this.baseURL + img.src;
        
        // Optimize loading
        if (!isVideo) {
          mediaEl.loading = 'lazy';
        }

        if (isVideo) {
          mediaEl.autoplay = true;
          mediaEl.loop = true;
          mediaEl.muted = true;
          mediaEl.playsInline = true;
        }

        item.appendChild(mediaEl);
        masonry.appendChild(item);
      });

      section.appendChild(masonry);
      this.el.appendChild(section);
    });

    this.isBuilt = true;
  }

  show() {
    this.build();
    this.el.scrollTop = 0;
    this.el.classList.add('visible');
    gsap.fromTo(this.el, { opacity: 0 }, { opacity: 1, duration: 0.5 });
    
    // Hide canvas
    gsap.to('#canvas-wrap', { opacity: 0, duration: 0.5 });
    document.getElementById('canvas-wrap').style.pointerEvents = 'none';
    document.getElementById('cursor-label')?.classList.remove('visible');
  }

  hide() {
    gsap.to(this.el, { 
      opacity: 0, 
      duration: 0.5, 
      onComplete: () => {
        this.el.classList.remove('visible');
        document.getElementById('canvas-wrap').style.pointerEvents = 'auto';
      }
    });
  }
}
