(() => {
  const products = window.VISION_PRODUCTS || [];
  const grid = document.getElementById("productGrid");
  const filters = document.getElementById("filters");
  const searchInput = document.getElementById("searchInput");
  const emptyState = document.getElementById("emptyState");
  const mobileMenu = document.getElementById("mobileMenu");
  const appShell = document.getElementById("appShell");
  const weekLabel = document.getElementById("weekLabel");

  let activeFilter = "all";
  let query = "";

  const weekNumber = date => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  weekLabel.textContent = `Неделя ${String(weekNumber(new Date())).padStart(2, "0")}`;

  function productCard(product, index) {
    const tags = product.tags.map(tag => `<span>${tag}</span>`).join("");
    return `
      <article class="product-card" data-category="${product.category}" style="--delay:${index * 65}ms">
        <div class="card-head">
          <span class="card-number">${product.number}</span>
          <span class="card-category">${product.categoryLabel}</span>
        </div>
        <a class="product-media" href="${product.url}" target="_blank" rel="sponsored noopener noreferrer" aria-label="Открыть ${product.brand} ${product.name} на маркетплейсе">
          <img src="${product.image}" alt="${product.brand} ${product.name}" loading="${index < 2 ? "eager" : "lazy"}" />
          <span class="media-scan" aria-hidden="true"></span>
        </a>
        <div class="card-body">
          <p class="product-brand">${product.brand}</p>
          <h3>${product.name}</h3>
          <p class="product-subtitle">${product.subtitle}</p>
          <p class="product-description">${product.description}</p>
          <div class="product-tags">${tags}</div>
        </div>
        <div class="card-foot">
          <a class="buy-button" href="${product.url}" target="_blank" rel="sponsored noopener noreferrer">
            <span>Смотреть товар</span><b>↗</b>
          </a>
          <span class="microcopy">${product.microcopy}</span>
        </div>
      </article>`;
  }

  function render() {
    const normalized = query.trim().toLowerCase();
    const visible = products.filter(product => {
      const matchesFilter = activeFilter === "all" || product.category === activeFilter;
      const haystack = [product.brand, product.name, product.subtitle, product.description, ...product.tags].join(" ").toLowerCase();
      return matchesFilter && (!normalized || haystack.includes(normalized));
    });

    grid.innerHTML = visible.map(productCard).join("");
    emptyState.hidden = visible.length !== 0;

    requestAnimationFrame(() => {
      grid.querySelectorAll(".product-card").forEach(card => card.classList.add("visible"));
    });
  }

  filters.addEventListener("click", event => {
    const button = event.target.closest(".filter");
    if (!button) return;
    activeFilter = button.dataset.filter;
    filters.querySelectorAll(".filter").forEach(item => item.classList.toggle("active", item === button));
    render();
  });

  searchInput.addEventListener("input", () => {
    query = searchInput.value;
    render();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "/" && document.activeElement !== searchInput) {
      event.preventDefault();
      searchInput.focus();
    }
    if (event.key === "Escape") {
      searchInput.blur();
      appShell.classList.remove("menu-open");
      mobileMenu.setAttribute("aria-expanded", "false");
    }
  });

  mobileMenu.addEventListener("click", () => {
    const open = appShell.classList.toggle("menu-open");
    mobileMenu.setAttribute("aria-expanded", String(open));
  });

  document.querySelectorAll(".nav a").forEach(link => link.addEventListener("click", () => {
    appShell.classList.remove("menu-open");
    mobileMenu.setAttribute("aria-expanded", "false");
  }));

  let raf = 0;
  document.addEventListener("pointermove", event => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      document.documentElement.style.setProperty("--mx", `${event.clientX}px`);
      document.documentElement.style.setProperty("--my", `${event.clientY}px`);
    });
  }, { passive: true });

  const isStandalone = window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
  if (isStandalone) document.documentElement.classList.add("is-standalone");

  document.addEventListener("click", event => {
    if (!appShell.classList.contains("menu-open")) return;
    if (event.target.closest(".topbar")) return;
    appShell.classList.remove("menu-open");
    mobileMenu.setAttribute("aria-expanded", "false");
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        const registration = await navigator.serviceWorker.register("./sw.js");
        registration.update();
      } catch (_) {}
    });
  }

  render();
})();