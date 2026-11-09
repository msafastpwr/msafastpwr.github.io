/**
 * Microsoft Student Ambassadors - FAST NUCES Peshawar
 * Client Layout & Interaction Helper (base/layout.js)
 * 
 * NOTE: Header and footer components are natively rendered via Jekyll server-side
 * templating (_layouts/default.html and _includes/) to eliminate CORS null-origin
 * blocks during local testing and prevent Cumulative Layout Shift (CLS).
 * 
 * This script provides interactive behaviors: mobile navigation drawer toggle,
 * theme switching, and active link indication.
 */

document.addEventListener('DOMContentLoaded', function () {
  // 1. Mobile Navigation Toggle
  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.querySelector('.site-nav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isExpanded);
      siteNav.classList.toggle('is-open');
    });
  }

  // 2. Dark / Light Theme Toggle
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nextTheme);
      try {
        localStorage.setItem('msa-theme', nextTheme);
      } catch (e) {
        // Fallback if local storage is restricted
      }
    });
  }

  // 3. Active Navigation Highlighting
  const currentPath = window.location.pathname.replace(/\/$/, '');
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(function (link) {
    const href = link.getAttribute('href').replace(/\/$/, '');
    if (href === currentPath || (href !== '' && currentPath.endsWith(href))) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
});
