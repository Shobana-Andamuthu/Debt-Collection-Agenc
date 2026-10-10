<<<<<<< HEAD
/* ==========================================================================
   MERIDIAN PAYROLL — JS FOUNDATION (Phase 1)
   Theme toggle | Mobile nav | Dropdown (desktop+mobile) | Active nav state
   Back-to-top | Scroll reveal | Header scroll state
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------
     0. PAGE LOADER
     ------------------------------------------------------------------ */
  function bindPageLoader() {
    const loader = document.getElementById("page-loader");
    if (!loader) return;
    const minDisplay = 450;
    const shownAt = performance.now();

    function hide() {
      const elapsed = performance.now() - shownAt;
      const wait = Math.max(0, minDisplay - elapsed);
      setTimeout(() => loader.classList.add("is-hidden"), wait);
    }

    if (document.readyState === "complete") {
      hide();
    } else {
      window.addEventListener("load", hide);
      // Safety net in case some asset never fires 'load'
      setTimeout(hide, 2500);
    }
  }

  /* ------------------------------------------------------------------
     1. THEME (Light/Dark) — persisted via localStorage
     ------------------------------------------------------------------ */
  const THEME_KEY = "meridian-theme";
  const root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
    document.querySelectorAll(".theme-toggle").forEach((btn) => {
      btn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
      const label = btn.querySelector(".theme-label");
      if (label) {
        label.textContent = theme === "dark" ? "Light Mode" : "Dark Mode";
      }
    });
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(saved || (prefersDark ? "dark" : "light"));
  }

  function bindThemeToggle() {
    document.querySelectorAll(".theme-toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        const current = root.getAttribute("data-theme");
        applyTheme(current === "dark" ? "light" : "dark");
      });
    });
  }

  /* ------------------------------------------------------------------
     1b. DIRECTION (LTR / RTL) — persisted via localStorage
     ------------------------------------------------------------------ */
  const DIR_KEY = "meridian-dir";

  function applyDir(dir) {
    root.setAttribute("dir", dir);
    root.setAttribute("lang", dir === "rtl" ? "ar" : "en");
    localStorage.setItem(DIR_KEY, dir);
    document.querySelectorAll(".dir-toggle .dir-label").forEach((el) => {
      el.textContent = dir === "rtl" ? "LTR" : "RTL";
    });
    document.querySelectorAll(".dir-toggle").forEach((btn) => {
      btn.setAttribute("aria-label", dir === "rtl" ? "Switch to left-to-right" : "Switch to right-to-left");
    });
  }

  function initDir() {
    const saved = localStorage.getItem(DIR_KEY);
    applyDir(saved || "ltr");
  }

  function bindDirToggle() {
    document.querySelectorAll(".dir-toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        const current = root.getAttribute("dir") || "ltr";
        applyDir(current === "rtl" ? "ltr" : "rtl");
      });
    });
  }

  /* ------------------------------------------------------------------
     2. MOBILE NAVIGATION
     ------------------------------------------------------------------ */
  function bindMobileNav() {
    const hamburger = document.querySelector(".hamburger");
    const mobileNav = document.querySelector(".mobile-nav");
    if (!hamburger || !mobileNav) return;

    function closeMenu() {
      hamburger.classList.remove("is-active");
      mobileNav.classList.remove("is-open");
      mobileNav.style.removeProperty("top");
      hamburger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }

    function openMenu() {
      hamburger.classList.add("is-active");
      mobileNav.classList.add("is-open");
      hamburger.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    }

    hamburger.addEventListener("click", () => {
      const isOpen = mobileNav.classList.contains("is-open");
      isOpen ? closeMenu() : openMenu();
    });

    const closeBtn = mobileNav.querySelector(".mobile-nav-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", closeMenu);
    }

    // Close on escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    // Close when a plain link (non-dropdown-toggle) is clicked
    mobileNav.querySelectorAll("a:not(.mobile-dropdown-toggle)").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });
  }

  /* ------------------------------------------------------------------
     3. DROPDOWN (Home 1 / Home 2 style submenus) — desktop click + mobile expand
     Works generically for any .nav-item.has-dropdown / .mobile-dropdown-toggle
     ------------------------------------------------------------------ */
  function bindDropdowns() {
    // Desktop: allow click-to-toggle in addition to hover (keyboard/touch friendly)
    document.querySelectorAll(".nav-item.has-dropdown > .nav-link").forEach((trigger) => {
      trigger.addEventListener("click", (e) => {
        const parent = trigger.closest(".nav-item");
        const isTouchOrKeyboard = matchMedia("(hover: none)").matches;
        if (isTouchOrKeyboard) {
          e.preventDefault();
          document.querySelectorAll(".nav-item.has-dropdown").forEach((item) => {
            if (item !== parent) item.classList.remove("is-open");
          });
          parent.classList.toggle("is-open");
        }
      });
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".nav-item.has-dropdown")) {
        document.querySelectorAll(".nav-item.has-dropdown").forEach((item) => item.classList.remove("is-open"));
      }
    });

    // Mobile: expand/collapse submenu
    document.querySelectorAll(".mobile-dropdown-toggle").forEach((toggle) => {
      const activate = (e) => {
        e.preventDefault();
        const submenu = toggle.nextElementSibling;
        const isOpen = toggle.classList.contains("is-open");

        toggle.classList.toggle("is-open");
        if (submenu) {
          submenu.style.maxHeight = isOpen ? "0px" : submenu.scrollHeight + "px";
        }
      };
      toggle.addEventListener("click", activate);
      toggle.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") activate(e);
      });
    });
  }

  /* ------------------------------------------------------------------
     4. ACTIVE NAV STATE (based on current file name)
     ------------------------------------------------------------------ */
  function setActiveNav() {
    const path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll("[data-nav-page]").forEach((link) => {
      if (link.getAttribute("data-nav-page") === path) {
        link.classList.add("is-active");
      }
    });
    // If the active page lives inside a dropdown (e.g. Home 2), also
    // highlight the parent trigger so "Home" reads as active.
    document.querySelectorAll(".nav-dropdown [data-nav-page].is-active").forEach((sub) => {
      const parentLink = sub.closest(".nav-item")?.querySelector(":scope > .nav-link");
      if (parentLink) parentLink.classList.add("is-active");
    });
    document.querySelectorAll(".mobile-submenu [data-nav-page].is-active").forEach((sub) => {
      const toggle = sub.closest(".mobile-submenu")?.previousElementSibling;
      if (toggle && toggle.classList.contains("mobile-dropdown-toggle")) toggle.classList.add("is-active");
    });
  }

  /* ------------------------------------------------------------------
     5. HEADER SCROLL STATE (subtle elevation on scroll)
     ------------------------------------------------------------------ */
  function bindHeaderScroll() {
    const header = document.querySelector(".site-header");
    if (!header) return;
    function update() {
      if (window.scrollY > 12) header.style.boxShadow = "var(--shadow-sm)";
      else header.style.boxShadow = "none";
    }
    document.addEventListener("scroll", update, { passive: true });
    update();
  }

  /* ------------------------------------------------------------------
     6. BACK TO TOP
     ------------------------------------------------------------------ */
  function bindBackToTop() {
    const btn = document.querySelector(".back-to-top");
    if (!btn) return;
    function toggle() {
      if (window.scrollY > 500) btn.classList.add("is-visible");
      else btn.classList.remove("is-visible");
    }
    document.addEventListener("scroll", toggle, { passive: true });
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    toggle();
  }

  /* ------------------------------------------------------------------
     7. SCROLL REVEAL (IntersectionObserver)
     ------------------------------------------------------------------ */
  function bindScrollReveal() {
    const items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach((el) => observer.observe(el));
  }

  /* ------------------------------------------------------------------
     8. FAQ ACCORDION
     ------------------------------------------------------------------ */
  function bindFaq() {
    document.querySelectorAll(".faq-question").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".faq-item");
        const answer = item.querySelector(".faq-answer");
        const isOpen = item.classList.contains("is-open");

        // Close siblings within the same faq-list for a focused reading experience
        const list = item.closest(".faq-list");
        if (list) {
          list.querySelectorAll(".faq-item.is-open").forEach((openItem) => {
            if (openItem !== item) {
              openItem.classList.remove("is-open");
              const openAnswer = openItem.querySelector(".faq-answer");
              if (openAnswer) openAnswer.style.maxHeight = "0px";
            }
          });
        }

        item.classList.toggle("is-open");
        answer.style.maxHeight = isOpen ? "0px" : answer.scrollHeight + "px";
      });
    });
  }

  /* ------------------------------------------------------------------
     9. TABS
     ------------------------------------------------------------------ */
  function bindTabs() {
    document.querySelectorAll(".tabs").forEach((tabGroup) => {
      const buttons = tabGroup.querySelectorAll(".tab-btn");
      const targetId = tabGroup.getAttribute("data-tabs-for");
      const panelContainer = targetId ? document.getElementById(targetId) : tabGroup.parentElement;

      buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
          const target = btn.getAttribute("data-tab");
          buttons.forEach((b) => b.classList.remove("is-active"));
          btn.classList.add("is-active");
          if (panelContainer) {
            panelContainer.querySelectorAll(".tab-panel").forEach((panel) => {
              panel.classList.toggle("is-active", panel.getAttribute("data-panel") === target);
            });
          }
=======
/**
 * Equitas Recovery Partners - Main JavaScript
 * Handles Theme Toggling (Light/Dark), RTL Toggling, Mobile Drawer Navigation,
 * Back to Top button, Header Scroll State, and Form Interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
  const pageLoader = document.createElement('div');
  pageLoader.className = 'page-loader';
  pageLoader.setAttribute('role', 'status');
  pageLoader.setAttribute('aria-live', 'polite');
  pageLoader.setAttribute('aria-hidden', 'true');
  pageLoader.innerHTML = `
    <div class="page-loader-card">
      <span class="page-loader-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="m9 12 2 2 4-4"/>
        </svg>
      </span>
      <span class="page-loader-brand">EQUITAS <span>RECOVERY</span></span>
      <span class="page-loader-spinner" aria-hidden="true"></span>
      <span class="page-loader-caption">Preparing your experience</span>
    </div>`;
  document.body.prepend(pageLoader);

  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest('a[href]');
    if (
      !link ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      link.target && link.target !== '_self' ||
      link.hasAttribute('download')
    ) return;

    const destination = new URL(link.href, window.location.href);
    if (
      destination.origin !== window.location.origin ||
      destination.pathname === window.location.pathname &&
        destination.search === window.location.search
    ) return;

    event.preventDefault();
    pageLoader.classList.add('is-active');
    pageLoader.setAttribute('aria-hidden', 'false');
    window.setTimeout(() => {
      window.location.assign(destination.href);
    }, 220);
  }, true);

  // 1. Theme Toggle (Light / Dark)
  const themeToggles = document.querySelectorAll('.theme-toggle-btn');
  const savedTheme = localStorage.getItem('equitas_theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('equitas_theme', theme);
    themeToggles.forEach(btn => {
      btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`);
      btn.innerHTML = theme === 'dark' 
        ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`
        : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
    });
  }

  applyTheme(savedTheme);

  themeToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
    });
  });

  // 2. RTL / LTR Toggle
  const rtlToggles = document.querySelectorAll('.rtl-toggle-btn');
  const savedDir = localStorage.getItem('equitas_dir') || 'ltr';

  function applyDirection(dir) {
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', dir === 'rtl' ? 'ar' : 'en');
    localStorage.setItem('equitas_dir', dir);
    rtlToggles.forEach(btn => {
      btn.setAttribute('aria-label', `Switch to ${dir === 'rtl' ? 'LTR' : 'RTL'} layout`);
      btn.innerHTML = `<span class="rtl-badge">${dir === 'rtl' ? 'LTR' : 'RTL'}</span>`;
    });
  }

  applyDirection(savedDir);

  rtlToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentDir = document.documentElement.getAttribute('dir') || 'ltr';
      const newDir = currentDir === 'rtl' ? 'ltr' : 'rtl';
      applyDirection(newDir);
    });
  });

  // 3. Header Scroll Elevation
  const siteHeader = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      siteHeader?.classList.add('is-scrolled');
    } else {
      siteHeader?.classList.remove('is-scrolled');
    }
  }, { passive: true });

  // 4. Mobile Navigation Drawer
  const hamburgerBtn = document.querySelector('.hamburger-btn');
  const drawer = document.querySelector('.mobile-nav-drawer');
  const drawerOverlay = document.querySelector('.mobile-nav-overlay');
  const drawerCloseBtn = document.querySelector('.drawer-close-btn');
  const drawerLinks = document.querySelectorAll('.drawer-link');
  const drawerHomeToggle = document.querySelector('.drawer-home-toggle');
  const drawerHomeMenu = document.querySelector('.drawer-home-menu');
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const isHomePage = currentPage === 'index.html' || currentPage === 'home-2.html';
  const desktopHomeLink = document.getElementById('homeDropdownBtn');

  desktopHomeLink?.classList.toggle('active', isHomePage);
  if (isHomePage) {
    desktopHomeLink?.setAttribute('aria-current', 'page');
  } else {
    desktopHomeLink?.removeAttribute('aria-current');
  }
  document.querySelectorAll('.nav-dropdown-menu .dropdown-item').forEach(link => {
    const isCurrentPage = link.getAttribute('href') === currentPage;
    link.classList.toggle('active', isCurrentPage);
    if (isCurrentPage) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
  document.querySelectorAll('.drawer-home-menu [data-home-page]').forEach(link => {
    const isCurrentPage = link.getAttribute('data-home-page') === currentPage;
    link.classList.toggle('active', isCurrentPage);
    if (isCurrentPage) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
  drawerHomeToggle?.classList.toggle('active', isHomePage);
  if (isHomePage) {
    drawerHomeToggle?.setAttribute('aria-current', 'page');
  }

  drawer?.setAttribute('aria-hidden', 'true');

  function openDrawer() {
    if (drawerHomeToggle && drawerHomeMenu) {
      drawerHomeToggle.setAttribute('aria-expanded', 'false');
      drawerHomeMenu.hidden = true;
    }
    drawer?.classList.add('is-active');
    drawerOverlay?.classList.add('is-active');
    drawer?.setAttribute('aria-hidden', 'false');
    drawerOverlay?.setAttribute('aria-hidden', 'false');
    hamburgerBtn?.classList.add('is-active');
    hamburgerBtn?.setAttribute('aria-expanded', 'true');
    hamburgerBtn?.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
    drawerCloseBtn?.focus();
  }

  function closeDrawer(restoreFocus = true) {
    if (drawerHomeToggle && drawerHomeMenu) {
      drawerHomeToggle.setAttribute('aria-expanded', 'false');
      drawerHomeMenu.hidden = true;
    }
    drawer?.classList.remove('is-active');
    drawerOverlay?.classList.remove('is-active');
    drawer?.setAttribute('aria-hidden', 'true');
    drawerOverlay?.setAttribute('aria-hidden', 'true');
    hamburgerBtn?.classList.remove('is-active');
    hamburgerBtn?.setAttribute('aria-expanded', 'false');
    hamburgerBtn?.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
    if (restoreFocus) hamburgerBtn?.focus();
  }

  hamburgerBtn?.addEventListener('click', () => {
    const isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  drawerCloseBtn?.addEventListener('click', () => closeDrawer());
  drawerOverlay?.addEventListener('click', () => closeDrawer());

  drawerLinks.forEach(link => {
    if (link !== drawerHomeToggle) {
      link.addEventListener('click', closeDrawer);
    }
  });

  drawerHomeToggle?.addEventListener('click', () => {
    if (!drawerHomeMenu) return;
    const isExpanded = drawerHomeToggle.getAttribute('aria-expanded') === 'true';
    drawerHomeToggle.setAttribute('aria-expanded', String(!isExpanded));
    drawerHomeMenu.hidden = isExpanded;
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer?.classList.contains('is-active')) {
      closeDrawer();
    }
  });

  const desktopNavigationBreakpoint = window.matchMedia('(min-width: 1201px)');
  function closeDrawerOnDesktop() {
    if (desktopNavigationBreakpoint.matches && drawer?.classList.contains('is-active')) {
      closeDrawer(false);
    }
  }

  desktopNavigationBreakpoint.addEventListener('change', closeDrawerOnDesktop);
  window.addEventListener('resize', closeDrawerOnDesktop);

  // 5. Back to Top Button
  const backToTopBtn = document.querySelector('.back-to-top-btn');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopBtn?.classList.add('is-visible');
    } else {
      backToTopBtn?.classList.remove('is-visible');
    }
  }, { passive: true });

  backToTopBtn?.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // 6. Form Handling for Website Consultation Forms
  const webForms = document.querySelectorAll('.cta-quick-form, #mainContactForm, #aboutConsultForm');

  webForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const formStatusMsg = form.querySelector('.form-status-msg') || form.parentElement.querySelector('.form-status-msg');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Submit Request';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Processing Request...</span>`;
      }

      setTimeout(() => {
        if (formStatusMsg) {
          formStatusMsg.classList.add('is-success');
          formStatusMsg.textContent = 'Thank you! Your confidential consultation request has been received. A senior account specialist will contact you within 1 business day.';
        }
        form.reset();

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }

        if (formStatusMsg) {
          setTimeout(() => {
            formStatusMsg.classList.remove('is-success');
          }, 8000);
        }
      }, 700);
    });
  });

  // 7. Login Page: Password Visibility Toggle
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const loginPasswordInput = document.getElementById('loginPassword');

  if (togglePasswordBtn && loginPasswordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = loginPasswordInput.type === 'password';
      loginPasswordInput.type = isPassword ? 'text' : 'password';
      togglePasswordBtn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
      togglePasswordBtn.innerHTML = isPassword
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
    });
  }

  // 8. Login Page: Form Submit & Authentication Simulation
  const portalLoginForm = document.getElementById('portalLoginForm');
  const loginStatusMsg = document.getElementById('loginStatusMsg');

  if (portalLoginForm) {
    portalLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('loginEmail');
      const passwordInput = document.getElementById('loginPassword');
      const submitBtn = document.getElementById('loginSubmitBtn');

      if (!emailInput?.value.trim() || !passwordInput?.value.trim()) {
        if (loginStatusMsg) {
          loginStatusMsg.style.display = 'block';
          loginStatusMsg.style.backgroundColor = 'var(--error-bg)';
          loginStatusMsg.style.color = 'var(--error)';
          loginStatusMsg.textContent = 'Please enter both your business email and password.';
        }
        return;
      }

      if (!portalLoginForm.checkValidity()) {
        portalLoginForm.reportValidity();
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Authenticating Credentials...</span>`;
      }

      if (loginStatusMsg) {
        loginStatusMsg.style.display = 'block';
        loginStatusMsg.style.backgroundColor = 'var(--badge-bg)';
        loginStatusMsg.style.color = 'var(--primary-600)';
        loginStatusMsg.textContent = 'Verifying SOC 2 session tokens...';
      }

      setTimeout(() => {
        if (loginStatusMsg) {
          loginStatusMsg.style.backgroundColor = 'var(--success-bg)';
          loginStatusMsg.style.color = 'var(--success)';
          loginStatusMsg.textContent = 'Authentication successful! Loading client workspace...';
        }
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 800);
      }, 900);
    });

    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    if (forgotPasswordBtn) {
      forgotPasswordBtn.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Password Reset: A secure reset link has been dispatched to your corporate email on file.');
      });
    }
  }

  const googleSignInBtn = document.getElementById('googleSignInBtn');
  if (googleSignInBtn) {
    googleSignInBtn.addEventListener('click', () => {
      if (loginStatusMsg) {
        loginStatusMsg.style.display = 'block';
        loginStatusMsg.style.backgroundColor = 'var(--error-bg)';
        loginStatusMsg.style.color = 'var(--error)';
        loginStatusMsg.textContent = 'Google sign-in is not configured for this portal yet. Please sign in with your business email and password.';
      }
    });
  }

  // 9. Dashboard: Sidebar Navigation & Drawer
  const dashHamburgerBtn = document.getElementById('dashHamburgerBtn');
  const dashSidebar = document.getElementById('dashSidebar');
  const dashSidebarCloseBtn = document.getElementById('dashSidebarCloseBtn');
  const dashNavLinks = document.querySelectorAll('.dash-nav-link');
  const dashProfileTrigger = document.getElementById('dashProfileTrigger');
  const dashProfileMenu = document.getElementById('dashProfileMenu');

  function assignDashboardTableLabels() {
    document.querySelectorAll('.dash-table').forEach(table => {
      const headers = [...table.querySelectorAll('thead th')].map(header => header.textContent.trim());
      table.querySelectorAll('tbody tr').forEach(row => {
        row.querySelectorAll('td').forEach((cell, index) => {
          if (headers[index]) cell.dataset.label = headers[index];
>>>>>>> f8cb4a1 (first commit)
        });
      });
    });
  }

<<<<<<< HEAD
  /* ------------------------------------------------------------------
     10. PRICING TOGGLE (Monthly / Annual)
     ------------------------------------------------------------------ */
  function bindPricingToggle() {
    const toggle = document.querySelector(".toggle-switch[data-pricing-toggle]");
    if (!toggle) return;
    const monthlyLabel = document.querySelector('[data-pricing-label="monthly"]');
    const annualLabel = document.querySelector('[data-pricing-label="annual"]');

    toggle.addEventListener("click", () => {
      const isOn = toggle.classList.toggle("is-on");
      document.querySelectorAll("[data-price-monthly]").forEach((el) => {
        const monthly = el.getAttribute("data-price-monthly");
        const annual = el.getAttribute("data-price-annual");
        el.textContent = isOn ? annual : monthly;
      });
      if (monthlyLabel) monthlyLabel.classList.toggle("is-active", !isOn);
      if (annualLabel) annualLabel.classList.toggle("is-active", isOn);
    });
  }

  /* ------------------------------------------------------------------
     11. ANIMATED COUNTERS (stat numbers count up when revealed)
     ------------------------------------------------------------------ */
  function bindCounters() {
    const counters = document.querySelectorAll("[data-count-to]");
    if (!counters.length || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseFloat(el.getAttribute("data-count-to"));
          const suffix = el.getAttribute("data-count-suffix") || "";
          const duration = 1400;
          const start = performance.now();

          function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = Math.round(target * eased * 10) / 10;
            el.textContent = (Number.isInteger(target) ? Math.round(value) : value) + suffix;
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          observer.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );

    counters.forEach((el) => observer.observe(el));
  }

  /* ------------------------------------------------------------------
     12. DASHBOARD SIDEBAR (mobile toggle)
     ------------------------------------------------------------------ */
  function bindDashSidebar() {
    const toggle = document.querySelector(".dash-menu-toggle");
    const sidebar = document.querySelector(".dash-sidebar");
    if (!sidebar) return;

    function setSidebarOpen(isOpen) {
      sidebar.classList.toggle("is-open", isOpen);
      if (toggle) toggle.setAttribute("aria-expanded", String(isOpen));
    }

    if (toggle) {
      toggle.addEventListener("click", () => setSidebarOpen(!sidebar.classList.contains("is-open")));
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") setSidebarOpen(false);
      });
    }

    document.addEventListener("click", (e) => {
      if (window.innerWidth > 1023) return;
      if (!sidebar.contains(e.target) && toggle && !toggle.contains(e.target)) {
        setSidebarOpen(false);
      }
    });

    bindDashboardViews(sidebar, () => setSidebarOpen(false));
  }

  function bindDashboardViews(sidebar, closeSidebar) {
    const main = document.querySelector(".dash-main");
    if (!main) return;

    const views = {
      overview: [".dash-topbar", ".dash-widget-grid"],
      payroll: ["#payroll"],
      tax: ["#tax"],
      employees: ["#employees"],
      reports: ["#reports"],
      billing: ["#billing"],
      settings: ["#billing"]
    };
    const contentSelectors = [".dash-topbar", ".dash-widget-grid", "#payroll", "#tax", "#employees", "#reports", "#billing"];
    const paymentMethods = document.querySelector("#billing > .dash-panel:first-child");
    const settings = document.querySelector("#settings");

    function showView(viewName, updateHash) {
      const activeView = views[viewName] ? viewName : "overview";
      contentSelectors.forEach((selector) => {
        const element = main.querySelector(selector);
        if (element) element.hidden = true;
      });

      views[activeView].forEach((selector) => {
        const element = main.querySelector(selector);
        if (element) element.hidden = false;
      });

      if (paymentMethods) paymentMethods.hidden = activeView === "settings";
      if (settings) settings.hidden = activeView !== "settings";

      sidebar.querySelectorAll(".dash-nav-link").forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${activeView}`);
      });
      main.querySelectorAll("[data-reveal]").forEach((element) => element.classList.add("is-visible"));

      if (updateHash) history.replaceState(null, "", `#${activeView}`);
    }

    sidebar.querySelectorAll(".dash-nav-link").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        showView(link.getAttribute("href").slice(1), true);
        closeSidebar();
      });
    });

    window.addEventListener("hashchange", () => showView(window.location.hash.slice(1), false));
    showView(window.location.hash.slice(1), false);
  }

  /* ------------------------------------------------------------------
     15. INDUSTRY CHIP FILTER (Home 2 dynamic image & banner updates)
     ------------------------------------------------------------------ */
  function bindIndustryChips() {
    const chipRow = document.querySelector(".industry-chip-row");
    const bannerImg = document.getElementById("industry-banner-img");
    const bannerTitle = document.getElementById("industry-banner-title");
    const bannerDesc = document.getElementById("industry-banner-desc");
    if (!chipRow || !bannerImg) return;

    const chips = chipRow.querySelectorAll(".chip");
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((c) => c.classList.remove("is-active"));
        chip.classList.add("is-active");

        const imgUrl = chip.getAttribute("data-img");
        const altText = chip.getAttribute("data-alt");
        const titleText = chip.getAttribute("data-title");
        const descText = chip.getAttribute("data-desc");

        bannerImg.style.opacity = "0.3";
        bannerImg.style.transform = "scale(0.98)";

        setTimeout(() => {
          if (imgUrl) bannerImg.src = imgUrl;
          if (altText) bannerImg.alt = altText;
          if (titleText && bannerTitle) bannerTitle.textContent = titleText;
          if (descText && bannerDesc) bannerDesc.textContent = descText;

          bannerImg.style.opacity = "1";
          bannerImg.style.transform = "scale(1)";
        }, 150);
=======
  assignDashboardTableLabels();

  if (dashProfileTrigger && dashProfileMenu) {
    function setProfileMenuOpen(isOpen, restoreFocus = false) {
      dashProfileMenu.hidden = !isOpen;
      dashProfileTrigger.setAttribute('aria-expanded', String(isOpen));
      dashProfileTrigger.setAttribute('aria-label', isOpen ? 'Close profile menu' : 'Open profile menu');

      if (isOpen) {
        dashProfileMenu.querySelector('[role="menuitem"]')?.focus();
      } else if (restoreFocus) {
        dashProfileTrigger.focus();
      }
    }

    dashProfileTrigger.addEventListener('click', () => {
      setProfileMenuOpen(dashProfileMenu.hidden);
    });

    dashProfileMenu.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setProfileMenuOpen(false, true);
      }
    });

    document.addEventListener('click', event => {
      if (!dashProfileMenu.hidden && event.target instanceof Element && !event.target.closest('.dash-profile')) {
        setProfileMenuOpen(false);
      }
    });
  }

  const dashboardSections = [...document.querySelectorAll('.dash-section[id]')];
  const dashboardSectionIds = new Set(dashboardSections.map(section => section.id));

  if (dashboardSections.length) {
    function showDashboardSection(sectionId, updateHistory = false) {
      const selectedId = dashboardSectionIds.has(sectionId) ? sectionId : 'overview';

      dashboardSections.forEach(section => {
        section.hidden = section.id !== selectedId;
      });
      dashNavLinks.forEach(link => {
        const isActive = link.dataset.section === selectedId;
        link.classList.toggle('active', isActive);
        if (isActive) {
          link.setAttribute('aria-current', 'page');
        } else {
          link.removeAttribute('aria-current');
        }
      });

      if (updateHistory && window.location.hash !== `#${selectedId}`) {
        window.history.pushState(null, '', `#${selectedId}`);
      } else if (!window.location.hash || !dashboardSectionIds.has(window.location.hash.slice(1))) {
        window.history.replaceState(null, '', `#${selectedId}`);
      }
      window.scrollTo(0, 0);
    }

    document.querySelectorAll('a[href^="#"]').forEach(link => {
      const sectionId = link.getAttribute('href')?.slice(1);
      if (!sectionId || !dashboardSectionIds.has(sectionId)) return;

      link.addEventListener('click', event => {
        event.preventDefault();
        showDashboardSection(sectionId, true);
      });
    });

    function showSectionFromLocation() {
      showDashboardSection(window.location.hash.slice(1));
    }

    showSectionFromLocation();
    window.addEventListener('popstate', showSectionFromLocation);
    window.addEventListener('hashchange', showSectionFromLocation);
  }

  if (dashHamburgerBtn && dashSidebar) {
    const dashboardSidebarBreakpoint = window.matchMedia('(max-width: 1024.98px)');

    function setDashboardSidebarOpen(isOpen) {
      dashSidebar.classList.toggle('is-open', isOpen);
      dashHamburgerBtn.classList.toggle('is-active', isOpen);
      dashSidebar.setAttribute('aria-hidden', String(!isOpen && dashboardSidebarBreakpoint.matches));
      dashHamburgerBtn.setAttribute('aria-expanded', String(isOpen));
      dashHamburgerBtn.setAttribute('aria-label', isOpen ? 'Close sidebar navigation' : 'Open sidebar navigation');
      document.body.style.overflow = isOpen ? 'hidden' : '';

      if (isOpen) {
        dashSidebarCloseBtn?.focus();
      } else if (dashboardSidebarBreakpoint.matches) {
        dashHamburgerBtn.focus();
      }
    }

    dashSidebar.setAttribute('aria-hidden', String(dashboardSidebarBreakpoint.matches));

    dashHamburgerBtn.addEventListener('click', () => {
      setDashboardSidebarOpen(!dashSidebar.classList.contains('is-open'));
    });

    dashSidebarCloseBtn?.addEventListener('click', () => {
      setDashboardSidebarOpen(false);
    });

    dashNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        setDashboardSidebarOpen(false);
      });
    });

    dashSidebar.querySelector('.dash-sidebar-primary-action')?.addEventListener('click', () => {
      setDashboardSidebarOpen(false);
    });

    document.addEventListener('click', event => {
      if (
        dashboardSidebarBreakpoint.matches &&
        dashSidebar.classList.contains('is-open') &&
        event.target instanceof Element &&
        !event.target.closest('#dashSidebar, #dashHamburgerBtn')
      ) {
        setDashboardSidebarOpen(false);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dashSidebar.classList.contains('is-open')) {
        setDashboardSidebarOpen(false);
      }
    });

    dashboardSidebarBreakpoint.addEventListener('change', (e) => {
      if (!e.matches && dashSidebar.classList.contains('is-open')) {
        setDashboardSidebarOpen(false);
      } else {
        dashSidebar.setAttribute('aria-hidden', String(e.matches && !dashSidebar.classList.contains('is-open')));
      }
    });
  }

  // 10. Dashboard: Dropzone File Upload
  const fileDropzone = document.getElementById('fileDropzone');
  const subDocFileInput = document.getElementById('subDocFile');
  const fileSelectedMsg = document.getElementById('fileSelectedMsg');
  const fileNameDisplay = document.getElementById('fileNameDisplay');

  if (fileDropzone && subDocFileInput) {
    fileDropzone.addEventListener('click', () => {
      subDocFileInput.click();
    });

    subDocFileInput.addEventListener('change', () => {
      if (subDocFileInput.files && subDocFileInput.files[0]) {
        if (fileSelectedMsg && fileNameDisplay) {
          fileNameDisplay.textContent = subDocFileInput.files[0].name;
          fileSelectedMsg.style.display = 'block';
        }
      }
    });

    fileDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      fileDropzone.style.borderColor = 'var(--primary-600)';
    });

    fileDropzone.addEventListener('dragleave', () => {
      fileDropzone.style.borderColor = 'var(--border-color)';
    });

    fileDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      fileDropzone.style.borderColor = 'var(--border-color)';
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        if (fileSelectedMsg && fileNameDisplay) {
          fileNameDisplay.textContent = e.dataTransfer.files[0].name;
          fileSelectedMsg.style.display = 'block';
        }
      }
    });
  }

  // 11. Dashboard: Submit New Account Form (Interactive Client State)
  const dashSubmitAccountForm = document.getElementById('dashSubmitAccountForm');
  const submitAccountStatus = document.getElementById('submitAccountStatus');
  const caseTableBody = document.getElementById('caseTableBody');
  const metricActiveCount = document.getElementById('metricActiveCount');

  if (dashSubmitAccountForm && caseTableBody) {
    dashSubmitAccountForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!dashSubmitAccountForm.checkValidity()) {
        dashSubmitAccountForm.reportValidity();
        return;
      }

      const accountRef = document.getElementById('subAccountRef').value.trim();
      const accountType = document.getElementById('subAccountType').value;
      const balance = parseFloat(document.getElementById('subAccountBalance').value) || 12000;
      const submitBtn = document.getElementById('submitNewAccountBtn');

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Validating &amp; Onboarding File...</span>`;
      }

      setTimeout(() => {
        // Generate random case ID
        const newCaseId = `EQ-${Math.floor(84930 + Math.random() * 50)}`;
        const formattedBalance = `$${balance.toLocaleString()}`;

        // Create new table row at top of Case Tracking
        const newRow = document.createElement('tr');
        newRow.setAttribute('data-status', 'In Mediation');
        newRow.setAttribute('data-category', accountType.includes('Commercial') ? 'Commercial B2B' : 'Services');
        newRow.innerHTML = `
          <td><strong>#${newCaseId}</strong></td>
          <td>${accountRef}</td>
          <td>${accountType}</td>
          <td>${formattedBalance}</td>
          <td style="color: var(--text-muted);">$0 (0%)</td>
          <td><span class="status-pill status-mediation"><span class="status-dot-sm"></span>In Mediation</span></td>
          <td>Just now</td>
          <td>
            <button type="button" class="btn btn-outline-white btn-sm view-case-btn" data-id="${newCaseId}" data-debtor="${accountRef}" data-balance="${formattedBalance}" data-status="In Mediation" data-lead="Eleanor Vance" data-date="Today">
              Details
            </button>
          </td>
        `;

        caseTableBody.insertBefore(newRow, caseTableBody.firstChild);

        assignDashboardTableLabels();

        // Attach event listener to new row button
        attachModalTriggers();

        // Increment metric
        if (metricActiveCount) {
          const currentCount = parseInt(metricActiveCount.textContent) || 124;
          metricActiveCount.textContent = (currentCount + 1).toString();
        }

        if (submitAccountStatus) {
          submitAccountStatus.classList.add('is-success');
          submitAccountStatus.textContent = `Success! Account ${accountRef} (#${newCaseId}) successfully onboarded to mediation queue.`;
        }

        dashSubmitAccountForm.reset();
        if (fileSelectedMsg) fileSelectedMsg.style.display = 'none';

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Submit Account for Recovery</span>`;
        }

        setTimeout(() => {
          submitAccountStatus?.classList.remove('is-success');
        }, 8000);
      }, 750);
    });
  }

  // 12. Dashboard: Case Search & Filtering
  const caseFilterInput = document.getElementById('caseFilterInput');
  const caseStatusFilter = document.getElementById('caseStatusFilter');
  const caseCategoryFilter = document.getElementById('caseCategoryFilter');

  function filterCases() {
    const searchText = (caseFilterInput?.value || '').toLowerCase().trim();
    const statusVal = caseStatusFilter?.value || 'ALL';
    const catVal = caseCategoryFilter?.value || 'ALL';

    const rows = document.querySelectorAll('#caseTableBody tr');
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      const status = row.getAttribute('data-status') || '';
      const category = row.getAttribute('data-category') || '';

      const matchesSearch = !searchText || text.includes(searchText);
      const matchesStatus = statusVal === 'ALL' || status === statusVal;
      const matchesCategory = catVal === 'ALL' || category.includes(catVal);

      if (matchesSearch && matchesStatus && matchesCategory) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }

  caseFilterInput?.addEventListener('input', filterCases);
  caseStatusFilter?.addEventListener('change', filterCases);
  caseCategoryFilter?.addEventListener('change', filterCases);

  // 13. Dashboard: Interactive Case Details Modal
  const caseDetailsModal = document.getElementById('caseDetailsModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalDismissBtn = document.getElementById('modalDismissBtn');

  function closeCaseDetailsModal() {
    caseDetailsModal?.classList.remove('is-active');
    caseDetailsModal?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function attachModalTriggers() {
    const viewButtons = document.querySelectorAll('.view-case-btn');
    viewButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const debtor = btn.getAttribute('data-debtor');
        const balance = btn.getAttribute('data-balance');
        const status = btn.getAttribute('data-status');
        const lead = btn.getAttribute('data-lead');
        const date = btn.getAttribute('data-date');

        document.getElementById('modalCaseTitle').textContent = `Case Details: #${id}`;
        document.getElementById('modalDebtorName').textContent = debtor;
        document.getElementById('modalBalance').textContent = balance;
        document.getElementById('modalStatus').textContent = status;
        document.getElementById('modalLead').textContent = lead;
        document.getElementById('modalDate').textContent = date;

        caseDetailsModal?.classList.add('is-active');
        caseDetailsModal?.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        modalCloseBtn?.focus();
>>>>>>> f8cb4a1 (first commit)
      });
    });
  }

<<<<<<< HEAD
  /* ------------------------------------------------------------------
     INIT
     ------------------------------------------------------------------ */
  // Register the loader hide-logic immediately — the #page-loader element
  // already exists in the DOM by the time this script tag runs (it's placed
  // right after <body>), so there's no need to wait for DOMContentLoaded.
  bindPageLoader();

  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    bindThemeToggle();
    initDir();
    bindDirToggle();
    bindMobileNav();
    bindDropdowns();
    setActiveNav();
    bindHeaderScroll();
    bindBackToTop();
    bindScrollReveal();
    bindFaq();
    bindTabs();
    bindPricingToggle();
    bindCounters();
    bindDashSidebar();
    bindIndustryChips();
  });
})();
=======
  attachModalTriggers();

  modalCloseBtn?.addEventListener('click', closeCaseDetailsModal);
  modalDismissBtn?.addEventListener('click', closeCaseDetailsModal);
  caseDetailsModal?.addEventListener('click', (e) => {
    if (e.target === caseDetailsModal) closeCaseDetailsModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && caseDetailsModal?.classList.contains('is-active')) {
      closeCaseDetailsModal();
    }
  });

  // 14. Dashboard: Support Inquiry Note
  const dashSupportInquiryForm = document.getElementById('dashSupportInquiryForm');
  const dashSupportStatus = document.getElementById('dashSupportStatus');

  if (dashSupportInquiryForm) {
    dashSupportInquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = dashSupportInquiryForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Transmitting Message...</span>`;
      }

      setTimeout(() => {
        if (dashSupportStatus) {
          dashSupportStatus.classList.add('is-success');
          dashSupportStatus.textContent = 'Note sent to Eleanor Vance. You will receive an email response shortly.';
        }
        dashSupportInquiryForm.reset();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Send Message</span>`;
        }

        setTimeout(() => {
          dashSupportStatus?.classList.remove('is-success');
        }, 6000);
      }, 600);
    });
  }
});
>>>>>>> f8cb4a1 (first commit)
