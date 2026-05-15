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
      nav_about: 'Hakkında',
      about_bio: "2000 yılında Tokat'ta doğan Erdem Temür, şu an İstanbul Bilgi Üniversitesi Görsel İletişim Tasarımı'nda son sınıf öğrencisi ve İstanbul merkezli bir Hard Surface 3D tasarımcısıdır. Oyun dünyasına olan tutkusu, onu karmaşık mekanik yapılar ve detaylı endüstriyel tasarımlar oluşturmaya yöneltti. Çalışmalarında estetik ve işlevselliği birleştirerek, geleceğin teknolojilerini ve bilim kurgu dünyalarını hayata geçirmeyi amaçlıyor.",
      toggle_overview: 'Genel Bakış',
      toggle_index: 'İndeks',
      footer_cookie: 'Çerez Politikası',
      footer_privacy: 'Gizlilik Politikası',
      footer_legal: 'Yasal Uyarı'
    },
    en: {
      nav_projects: 'Projects',
      nav_research: 'Research',
      nav_about: 'About',
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
  const btnAbout = document.getElementById('btn-about');
  const aboutOverlay = document.getElementById('about-overlay');
  const blurOverlay = document.getElementById('blur-overlay');
  const aboutFooter = document.getElementById('contact-footer'); // Footer id can stay same

  let aboutOpen = false;

  function setNavActive(id) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if (id) {
      const el = document.getElementById(id);
      if (el) el.classList.add('active');
    }
  }

  function closeAbout() {
    aboutOpen = false;
    blurOverlay.classList.remove('visible');
    aboutOverlay.classList.remove('visible');
    aboutFooter.classList.remove('visible');
  }

  btnAbout.addEventListener('click', () => {
    if (aboutOpen) {
      closeAbout();
      setNavActive(currentView === 'home' ? 'btn-home' : '');
      return;
    }
    aboutOpen = true;
    setNavActive('btn-about');
    blurOverlay.classList.add('visible');
    aboutOverlay.classList.add('visible');
    aboutFooter.classList.add('visible');
  });

  btnHome.addEventListener('click', (e) => {
    e.preventDefault();
    closeAbout();
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
    closeAbout();
    setNavActive('btn-research');
    if (currentView === 'project') projectPage.hide();
    if (currentView !== 'research') {
      currentView = 'research';
      researchPage.show();
    }
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
