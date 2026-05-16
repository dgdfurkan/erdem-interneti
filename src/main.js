import './style.css';
import gsap from 'gsap';
import { GalleryScene } from './three/Scene.js';
import { ProjectPage } from './pages/ProjectPage.js';
import { ResearchPage } from './pages/ResearchPage.js';
import { AboutPage } from './pages/AboutPage.js';
document.addEventListener('DOMContentLoaded', () => {
  // --- i18n (Language) System ---
  const translations = {
    tr: {
      nav_projects: 'Projeler',
      nav_research: 'Grid',
      nav_about: 'Hakkında',
      nav_back: 'Geri',
      mode_3d: '3D',
      mode_grid: 'GRID',
      layout_horiz: 'YATAY',
      layout_vert: 'DİKEY',
      about_bio: "2000 yılında Tokat'ta doğan Erdem Temür, şu an İstanbul Bilgi Üniversitesi Görsel İletişim Tasarımı'nda son sınıf öğrencisi ve İstanbul merkezli bir Hard Surface 3D tasarımcısıdır. Oyun dünyasına olan tutkusu, onu karmaşık mekanik yapılar ve detaylı endüstriyel tasarımlar oluşturmaya yöneltti. Çalışmalarında estetik ve işlevselliği birleştirerek, geleceğin teknolojilerini ve bilim kurgu dünyalarını hayata geçirmeyi amaçlıyor.",
      toggle_overview: 'Genel Bakış',
      toggle_index: 'İndeks',
      footer_cookie: 'Çerez Politikası',
      footer_privacy: 'Gizlilik Politikası',
      footer_legal: 'Yasal Uyarı'
    },
    en: {
      nav_projects: 'Projects',
      nav_research: 'Grid',
      nav_about: 'About',
      nav_back: 'Back',
      mode_3d: '3D',
      mode_grid: 'GRID',
      layout_horiz: 'HORIZ',
      layout_vert: 'VERT',
      about_bio: "Born in Tokat in 2000, Erdem Temür is currently a senior Visual Communication Design student at Istanbul Bilgi University and an Istanbul-based Hard Surface 3D designer. His passion for gaming led him to specialize in creating complex mechanical structures and detailed industrial designs. By blending aesthetics with functionality in his work, he aims to bring future technologies and science fiction worlds to life.",
      toggle_overview: 'Overview',
      toggle_index: 'Index',
      footer_cookie: 'Cookie Policy',
      footer_privacy: 'Privacy Policy',
      footer_legal: 'Legal Notice'
    }
  };

  window.currentLang = 'tr'; // Default language

  function updateLanguage(lang) {
    window.currentLang = lang;
    
    // Update active state on toggle buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Translate static UI elements
    document.querySelectorAll('[data-i18n-key]').forEach(el => {
      const key = el.getAttribute('data-i18n-key');
      if (translations[lang] && translations[lang][key]) {
        el.textContent = translations[lang][key];
      }
    });

    // Dispatch global event so dynamic components (like ProjectPage) can update
    window.dispatchEvent(new CustomEvent('language-changed', { detail: { lang } }));
  }

  // Setup language toggle buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const lang = e.currentTarget.dataset.lang;
      if (lang !== window.currentLang) {
        updateLanguage(lang);
      }
    });
  });

  // Initialize UI language
  updateLanguage(window.currentLang);

  // Setup DOM elements
  const appContainer = document.getElementById('app');
  
  // Create Canvas Wrap
  const canvasWrap = document.createElement('div');
  canvasWrap.id = 'canvas-wrap';
  appContainer.appendChild(canvasWrap);

  // Initialize Modules
  const gallery = new GalleryScene(canvasWrap);
  const projectPage = new ProjectPage(appContainer);
  const researchPage = new ResearchPage(appContainer);
  const aboutPage = new AboutPage(appContainer);

  // --- Header Hide/Show Logic ---
  let lastScrollY = 0;
  const header = document.querySelector('header');
  
  function handleHeaderScroll(currentScrollY) {
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      header.classList.add('header-hidden');
    } else {
      header.classList.remove('header-hidden');
    }
    lastScrollY = currentScrollY;
  }

  // Listen to scroll on containers
  const scrollContainers = ['.project-page', '.research-page', '.about-page'];
  scrollContainers.forEach(selector => {
    const el = document.querySelector(selector);
    if (el) {
      el.addEventListener('scroll', () => {
        handleHeaderScroll(el.scrollTop);
      }, { passive: true });
    }
  });

  // Also handle home page scroll (though it's 3D, we can use wheel/touch)
  window.addEventListener('wheel', (e) => {
    if (currentView === 'home') {
      if (e.deltaY > 0) header.classList.add('header-hidden');
      else header.classList.remove('header-hidden');
    }
  }, { passive: true });

  let touchStartY = 0;
  window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    const touchY = e.touches[0].clientY;
    if (currentView === 'home') {
      if (touchStartY - touchY > 20) header.classList.add('header-hidden');
      else if (touchY - touchStartY > 20) header.classList.remove('header-hidden');
    }
  }, { passive: true });

  let currentView = 'home'; // 'home', 'project', 'about'
  let currentMode = '3d'; // '3d', 'grid'

  function updateMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    if (currentView === 'home') {
      document.getElementById('mode-toggle').style.display = 'flex';
      document.getElementById('project-layout-toggle').style.display = 'none';
      if (mode === '3d') {
        researchPage.hide();
        gsap.to('#canvas-wrap', { opacity: 1, duration: 0.5, onComplete: () => {
          document.getElementById('canvas-wrap').style.pointerEvents = 'auto';
        }});
      } else {
        document.getElementById('canvas-wrap').style.pointerEvents = 'none';
        gsap.to('#canvas-wrap', { opacity: 0, duration: 0.5 });
        researchPage.show();
      }
    }
  }

  // --- Project Layout Logic ---
  let currentLayout = 'horiz';
  document.querySelectorAll('.layout-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const layout = e.currentTarget.dataset.layout;
      currentLayout = layout;
      document.querySelectorAll('.layout-btn').forEach(b => b.classList.toggle('active', b.dataset.layout === layout));
      
      const projectEl = document.querySelector('.project-page');
      if (projectEl) {
        if (layout === 'vert') projectEl.classList.add('vertical-mode');
        else projectEl.classList.remove('vertical-mode');
      }
    });
  });

  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const mode = e.currentTarget.dataset.mode;
      if (mode !== currentMode) {
        if (currentView === 'project') {
          // If in project, go back to home then switch mode
          projectPage.hide();
          currentView = 'home';
          setNavActive('btn-home');
        } else if (currentView === 'about') {
           aboutPage.hide();
           currentView = 'home';
           setNavActive('btn-home');
           document.body.classList.remove('about-open');
        }
        updateMode(mode);
      }
    });
  });

  // Global Event Bus
  window.addEventListener('project-click', (e) => {
    const project = e.detail;
    if (currentView === 'research') researchPage.hide();
    currentView = 'project';
    setNavActive(''); // Remove home active
    // Reset sound for new project visit
    window.isMuted = true;
    
    projectPage.show(project);
    document.body.classList.remove('about-open');
    document.getElementById('canvas-wrap').style.pointerEvents = 'none';
    
    // UI Toggles
    document.getElementById('mode-toggle').style.display = 'none';
    if (window.innerWidth > 600) {
      document.getElementById('project-layout-toggle').style.display = 'flex';
    } else {
      document.getElementById('project-layout-toggle').style.display = 'none';
    }
    document.getElementById('btn-back').style.display = 'flex';
    document.getElementById('btn-home').style.display = 'none';
    
    // Apply current layout choice
    const projectEl = document.querySelector('.project-page');
    if (projectEl) {
      if (currentLayout === 'vert') projectEl.classList.add('vertical-mode');
      else projectEl.classList.remove('vertical-mode');
    }
  });

  document.getElementById('btn-back').addEventListener('click', (e) => {
    e.preventDefault();
    if (currentView === 'project') projectPage.hide();
    
    // Reset sound on going back home
    window.isMuted = true;
    
    currentView = 'home';
    updateMode(currentMode);
    setNavActive('btn-home');
    document.getElementById('btn-back').style.display = 'none';
    document.getElementById('btn-home').style.display = 'flex';
    document.getElementById('mode-toggle').style.display = 'flex';
    document.getElementById('project-layout-toggle').style.display = 'none';
  });

  // Theme Toggle
  const themeToggle = document.getElementById('theme');
  if (themeToggle) {
    themeToggle.addEventListener('change', () => {
      const isDark = themeToggle.checked;
      document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
      // Dispatch event if Three.js needs to react
      window.dispatchEvent(new CustomEvent('theme-changed', { detail: { isDark } }));
    });
  }

  // Nav Interactions
  const btnHome = document.getElementById('btn-home');
  const btnAbout = document.getElementById('btn-about');
  const btnBack = document.getElementById('btn-back');

  function setNavActive(id) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if (id) {
      const el = document.getElementById(id);
      if (el) el.classList.add('active');
    }
  }

  btnHome.addEventListener('click', (e) => {
    e.preventDefault();
    setNavActive('btn-home');
    if (currentView === 'project') projectPage.hide();
    else if (currentView === 'research') researchPage.hide();
    else if (currentView === 'about') aboutPage.hide();
    
    // Reset sound on going back home
    window.isMuted = true;
    
    currentView = 'home';
    updateMode(currentMode);
    
    if (currentMode === '3d') {
      gsap.to('#canvas-wrap', { opacity: 1, duration: 0.5, onStart: () => {
        document.getElementById('canvas-wrap').style.pointerEvents = 'auto';
      }});
    }
    document.body.classList.remove('about-open');
    document.getElementById('mode-toggle').style.display = 'flex';
    document.getElementById('project-layout-toggle').style.display = 'none';
  });

  btnAbout.addEventListener('click', (e) => {
    e.preventDefault();
    setNavActive('btn-about');
    if (currentView === 'project') projectPage.hide();
    else if (currentView === 'research') researchPage.hide();
    
    if (currentView !== 'about') {
      currentView = 'about';
      aboutPage.show();
      document.body.classList.add('about-open');
      document.getElementById('canvas-wrap').style.pointerEvents = 'none';
    }
    document.getElementById('mode-toggle').style.display = 'none';
    document.getElementById('project-layout-toggle').style.display = 'none';
  });

  // Init Fade
  const whiteFade = document.getElementById('white-fade');
  if (whiteFade) {
    whiteFade.style.opacity = '1';
    setTimeout(() => {
      whiteFade.style.opacity = '0';
    }, 500);
  }
});
