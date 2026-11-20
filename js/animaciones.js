(function () {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reduce = motion.matches;
  const header = document.querySelector("[data-header]");
  const layer = document.querySelector("[data-parallax]");
  const nav = document.querySelector("[data-nav]");
  const menuButton = document.querySelector("[data-menu]");
  let ticking = false;

  document.documentElement.classList.add("js");

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      const y = window.scrollY || 0;
      if (header) header.classList.toggle("is-scrolled", y > 8);
      if (layer) {
        if (reduce) layer.style.transform = "none";
        else layer.style.transform = "translate3d(0, " + Math.min(36, y * 0.06) + "px, 0)";
      }
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (motion.addEventListener) {
    motion.addEventListener("change", function () {
      reduce = motion.matches;
      if (reduce && layer) layer.style.transform = "none";
    });
  }

  const mobileQuery = window.matchMedia("(max-width: 800px)");

  function closeMenu() {
    if (!nav || !menuButton) return;
    nav.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menú");
    syncNav();
  }

  function syncNav() {
    if (!nav || !menuButton) return;
    const mobile = mobileQuery.matches;
    const open = nav.classList.contains("is-open");
    if (!mobile) {
      nav.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
      nav.removeAttribute("aria-hidden");
      return;
    }
    nav.setAttribute("aria-hidden", open ? "false" : "true");
  }

  if (menuButton && nav) {
    menuButton.addEventListener("click", function () {
      const open = nav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      syncNav();
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) closeMenu();
    });
    if (mobileQuery.addEventListener) mobileQuery.addEventListener("change", syncNav);
    syncNav();
  }

  document.querySelectorAll("[data-acc]").forEach(function (item) {
    const button = item.querySelector("button");
    const region = item.querySelector(".acc-panel");
    if (!button) return;
    button.addEventListener("click", function () {
      const open = item.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(open));
      if (region) {
        if (open) region.removeAttribute("aria-hidden");
        else region.setAttribute("aria-hidden", "true");
      }
    });
  });

  function stepSize(track) {
    const card = track.firstElementChild;
    if (!card) return 280;
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || "16") || 16;
    return card.getBoundingClientRect().width + gap;
  }

  document.querySelectorAll("[data-carousel]").forEach(function (root) {
    const track = root.querySelector("[data-track]");
    const prev = root.querySelector("[data-prev]");
    const next = root.querySelector("[data-next]");
    if (!track || !prev || !next) return;
    function update() {
      const max = track.scrollWidth - track.clientWidth;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max - 2;
    }
    function move(direction) {
      track.scrollBy({ left: stepSize(track) * direction, behavior: reduce ? "auto" : "smooth" });
    }
    prev.addEventListener("click", function () { move(-1); });
    next.addEventListener("click", function () { move(1); });
    track.addEventListener("scroll", update, { passive: true });
    track.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        move(1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        move(-1);
      }
    });
    window.addEventListener("resize", update);
    update();
  });

  if (reduce) {
    document.querySelectorAll("[data-reveal]").forEach(function (node) {
      node.classList.add("is-visible");
    });
    document.querySelectorAll("[data-count]").forEach(function (node) {
      node.textContent = node.getAttribute("data-count");
    });
    return;
  }

  const seen = new WeakSet();
  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });

  document.querySelectorAll("[data-reveal]").forEach(function (node) {
    revealObserver.observe(node);
  });

  function runCount(node) {
    if (seen.has(node)) return;
    seen.add(node);
    const target = Number(node.getAttribute("data-count"));
    if (!Number.isFinite(target)) return;
    const start = performance.now();
    const duration = 800;
    function frame(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      node.textContent = String(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  const countObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      runCount(entry.target);
      countObserver.unobserve(entry.target);
    });
  }, { threshold: 0.05 });

  document.querySelectorAll("[data-count]").forEach(function (node) {
    countObserver.observe(node);
  });
})();
