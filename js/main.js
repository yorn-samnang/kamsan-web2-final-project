import { initTripPlannerControls } from './features/tripPlanner.js';
import { initRecommendationQuiz } from './features/recommendationQuiz.js';
import { initWeatherPanel } from './features/weather.js';

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('body > header');
  if (header) {
    const updateHeaderHeight = () => {
      document.documentElement.style.setProperty(
        '--header-height',
        `${header.getBoundingClientRect().height}px`
      );
    };
    updateHeaderHeight();
    new window.ResizeObserver(updateHeaderHeight).observe(header);
  }

  initTripPlannerControls();
  initRecommendationQuiz();
  initWeatherPanel();

  const showReveal = (el) => {
    el.classList.add('in-view');
    el.classList.add('is-visible');
  };

  /* 1. MOBILE NAV TOGGLE */
  const navToggle = document.querySelector('.nav-toggle');
  const navPill = document.querySelector('.nav-pill');

  if (header) {
    const mobileNav = window.matchMedia('(max-width: 900px)');
    let previousScroll = Math.max(0, window.scrollY);
    let scrollDirection = 0;
    let scrollDistance = 0;

    const showNav = () => {
      header.classList.remove('nav-hidden');
      scrollDistance = 0;
    };

    const updateNavVisibility = () => {
      const currentScroll = Math.max(
        0,
        Math.min(window.scrollY, document.documentElement.scrollHeight - window.innerHeight)
      );
      const delta = currentScroll - previousScroll;
      previousScroll = currentScroll;

      if (
        !mobileNav.matches ||
        currentScroll <= 100 ||
        navPill?.classList.contains('menu-open') ||
        header.querySelector(':focus-visible')
      ) {
        showNav();
        return;
      }

      if (!delta) return;
      const direction = Math.sign(delta);
      if (direction !== scrollDirection) scrollDistance = 0;
      scrollDirection = direction;
      scrollDistance += Math.abs(delta);

      if (direction > 0 && scrollDistance >= 24) header.classList.add('nav-hidden');
      if (direction < 0 && scrollDistance >= 12) showNav();
    };

    window.addEventListener('scroll', updateNavVisibility, { passive: true });
    mobileNav.addEventListener('change', () => {
      previousScroll = Math.max(0, window.scrollY);
      showNav();
    });
    header.addEventListener('focusin', showNav);
    navToggle?.addEventListener('click', showNav);
  }

  if (navToggle && navPill) {
    navToggle.addEventListener('click', () => {
      const isOpen = navPill.classList.toggle('menu-open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    document.querySelectorAll('.site-nav a').forEach((link) => {
      link.addEventListener('click', () => {
        navPill.classList.remove('menu-open');
        navToggle.setAttribute('aria-expanded', false);
      });
    });
  }

  /* 2. SCROLL REVEAL */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              showReveal(entry.target);
            }, i * 60);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => showReveal(el));
  }

  /* 4. SMOOTH SCROLL */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});
