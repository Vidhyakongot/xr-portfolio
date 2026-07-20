(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");

  /* ---------------- Theme toggle ---------------- */
  var THEME_KEY = "xr-portfolio-theme";
  var themeToggle = document.getElementById("theme-toggle");

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
  }

  var storedTheme = null;
  try {
    storedTheme = localStorage.getItem(THEME_KEY);
  } catch (e) {
    /* localStorage unavailable (private mode etc.) — fall back to default theme */
  }

  if (storedTheme === "light" || storedTheme === "dark") {
    applyTheme(storedTheme);
  } else {
    var prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    applyTheme(prefersLight ? "light" : "dark");
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var current = root.getAttribute("data-theme") === "light" ? "light" : "dark";
      var next = current === "light" ? "dark" : "light";
      applyTheme(next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (e) {
        /* ignore write failures */
      }
    });
  }

  /* ---------------- Mobile nav ---------------- */
  var navToggle = document.getElementById("nav-toggle");
  var navLinks = document.getElementById("nav-links");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var isOpen = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      navToggle.innerHTML = isOpen
        ? '<svg class="icon" aria-hidden="true"><use href="#icon-close"></use></svg>'
        : '<svg class="icon" aria-hidden="true"><use href="#icon-menu"></use></svg>';
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#icon-menu"></use></svg>';
      });
    });
  }

  /* ---------------- Active section highlighting ---------------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
  var navAnchors = navLinks ? Array.prototype.slice.call(navLinks.querySelectorAll("a")) : [];

  if (sections.length && navAnchors.length && "IntersectionObserver" in window) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var id = entry.target.getAttribute("id");
          var anchor = navAnchors.filter(function (a) {
            return a.getAttribute("href") === "#" + id;
          })[0];
          if (!anchor) return;
          if (entry.isIntersecting) {
            navAnchors.forEach(function (a) { a.classList.remove("active"); });
            anchor.classList.add("active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (s) { sectionObserver.observe(s); });
  }

  /* ---------------- Reveal on scroll ---------------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (revealEls.length && "IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------------- Image gallery lightbox ---------------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightbox-img");
  var lightboxCaption = document.getElementById("lightbox-caption");
  var lightboxClose = document.getElementById("lightbox-close");
  var galleryTriggers = Array.prototype.slice.call(document.querySelectorAll(".gallery-trigger"));
  var lightboxLastTrigger = null;
  var lightboxScrollY = 0;

  function openLightbox(btn) {
    var full = btn.getAttribute("data-full");
    var caption = btn.getAttribute("data-caption") || "";
    var img = btn.querySelector("img");
    lightboxImg.src = full;
    lightboxImg.alt = img ? img.alt : caption;
    lightboxCaption.textContent = caption;

    lightboxLastTrigger = btn;
    lightboxScrollY = window.scrollY || window.pageYOffset || 0;

    document.body.style.position = "fixed";
    document.body.style.top = (-lightboxScrollY) + "px";
    document.body.style.left = "0";
    document.body.style.right = "0";

    lightbox.hidden = false;
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;

    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    window.scrollTo({ top: lightboxScrollY, left: 0, behavior: "instant" });

    lightboxImg.src = "";
    if (lightboxLastTrigger) lightboxLastTrigger.focus();
  }

  if (lightbox && lightboxImg && lightboxClose && galleryTriggers.length) {
    galleryTriggers.forEach(function (btn) {
      btn.addEventListener("click", function () {
        openLightbox(btn);
      });
    });

    lightboxClose.addEventListener("click", closeLightbox);

    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !lightbox.hidden) closeLightbox();
    });
  }

  /* ---------------- Footer year ---------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
