import { initTripPlannerControls } from './features/tripPlanner.js';
import { initRecommendationQuiz } from './features/recommendationQuiz.js';

document.addEventListener('DOMContentLoaded', () => {
  initTripPlannerControls();
  initRecommendationQuiz();

  const showReveal = (el) => {
    el.classList.add('in-view');
    el.classList.add('is-visible');
  };

  /* 1. MOBILE NAV TOGGLE */
  const navToggle = document.querySelector('.nav-toggle');
  const navPill = document.querySelector('.nav-pill');

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
