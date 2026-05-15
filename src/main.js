import './style.css';
import { GalleryScene } from './three/Scene.js';
import { ProjectPage } from './pages/ProjectPage.js';
import { ResearchPage } from './pages/ResearchPage.js';
document.addEventListener('DOMContentLoaded', () => {
  // --- i18n (Language) System ---
  const translations = {
    tr: {
      nav_projects: 'Projeler',
      nav_research: 'Araştırma',
      nav_studio: 'Stüdyo',
      nav_contact: 'İletişim',
      toggle_overview: 'Genel Bakış',
      toggle_index: 'İndeks',
      footer_cookie: 'Çerez Politikası',
      footer_privacy: 'Gizlilik Politikası',
      footer_legal: 'Yasal Uyarı'
    },
    en: {
      nav_projects: 'Projects',
      nav_research: 'Research',
      nav_studio: 'Studio',
      nav_contact: 'Contact',
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

  let currentView = 'home'; // 'home', 'project', 'research'

  // Global Event Bus
  window.addEventListener('project-click', (e) => {
    const project = e.detail;
    if (currentView === 'research') researchPage.hide();
    currentView = 'project';
    setNavActive(''); // Remove home active
    projectPage.show(project);
  });

  // Nav Interactions
  const btnHome = document.getElementById('btn-home');
  const btnContact = document.getElementById('btn-contact');
  const contactOverlay = document.getElementById('contact-overlay');
  const blurOverlay = document.getElementById('blur-overlay');
  const contactFooter = document.getElementById('contact-footer');

  let contactOpen = false;

  function setNavActive(id) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if (id) {
      const el = document.getElementById(id);
      if (el) el.classList.add('active');
    }
  }

  function closeContact() {
    contactOpen = false;
    blurOverlay.classList.remove('visible');
    contactOverlay.classList.remove('visible');
    contactFooter.classList.remove('visible');
  }

  btnContact.addEventListener('click', () => {
    if (contactOpen) {
      closeContact();
      setNavActive(currentView === 'home' ? 'btn-home' : '');
      return;
    }
    contactOpen = true;
    setNavActive('btn-contact');
    blurOverlay.classList.add('visible');
    contactOverlay.classList.add('visible');
    contactFooter.classList.add('visible');
  });

  btnHome.addEventListener('click', (e) => {
    e.preventDefault();
    closeContact();
    setNavActive('btn-home');
    if (currentView === 'project') {
      projectPage.hide();
    } else if (currentView === 'research') {
      researchPage.hide();
    }
    currentView = 'home';
  });

  document.getElementById('btn-research').addEventListener('click', (e) => {
    e.preventDefault();
    closeContact();
    setNavActive('btn-research');
    if (currentView === 'project') projectPage.hide();
    if (currentView !== 'research') {
      currentView = 'research';
      researchPage.show();
    }
  });

  ['btn-studio'].forEach(id => {
    document.getElementById(id).addEventListener('click', (e) => {
      e.preventDefault();
      closeContact();
      setNavActive(id);
    });
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
