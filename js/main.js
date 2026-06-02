import "./components/cartButton.js";
import "./components/wishlistButton.js";

import { router } from "./router.js";
import { updateNavbarCount } from "./utils/navbarCount.js";
import { setupCardActions } from "./utils/cardAction.js";
import { WishlistPanel } from "./pages/wishlistPage.js";
import { CartPanel } from "./pages/cartPage.js";
import { setupCategoryNav } from "./utils/categoryNav.js";
import { setupBrandNav } from "./utils/brandNav.js";
import { initCategoryCatalog } from "./utils/categoryCatalog.js";
import { initBrandCatalog } from "./utils/brandCatalog.js";
import { navigateTo, setupAppNavigation } from "./navigation.js";
import { productImageSrc } from "./utils/assets.js";
import { AuthModal } from "./pages/authPage.js";
import { setupUserDropdown, updateUserBtn } from "./components/userDropdown.js";

class Product {
  constructor(product) {
    this.id            = product.id;
    this.name          = product.name;
    this.brand         = product.brand;
    this.price         = product.price;
    this.discount      = product.discount || 0;
    this.newPrice      = product.price - (product.price * this.discount / 100);
    this.rating        = product.rating;
    this.reviews       = product.reviews;
    this.categoryId    = product.categoryId;
    this.subCategoryId = product.subCategoryId;
    this.concernIds    = product.concernIds || [];
    this.description   = product.description;
    this.ingredients   = product.ingredients;
    this.usage         = product.usage;
    this.img           = product.img;
    this.imageUrl      = productImageSrc(product.img);
  }
}

async function getData(dataUrl) {
  try {
    const res = await fetch(dataUrl);
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return { products: [], categories: [], subCategories: [], concerns: [] };
  }
}

function syncSearchInputWithHash() {
  const input = document.querySelector(".search-box__input");
  if (!input) return;

  const hash = window.location.hash || "";
  const [page, query] = hash.replace("#", "").split("?");

  if (page !== "search") return;

  const params = new URLSearchParams(query || "");
  input.value = params.get("q") || "";
}

function setupSearch(products) {
  const input     = document.querySelector(".search-box__input");
  const icon      = document.querySelector(".search-box__icon");
  const searchBox = document.querySelector(".search-box");
  if (!input || !searchBox) return;

  // Dropdown үүсгэх
  const dropdown = document.createElement("div");
  dropdown.className = "search-dropdown hidden";
  searchBox.appendChild(dropdown);

  const runSearch = () => {
    const query = input.value.trim();
    dropdown.classList.add("hidden");
    dropdown.innerHTML = "";

    const nextHash = `#search?q=${encodeURIComponent(query)}`;
    if (window.location.pathname + window.location.hash === `/${nextHash}`) {
      router(products);
      return;
    }
    navigateTo(nextHash);
    router(products);
  };

  const showSuggestions = (query) => {
    dropdown.innerHTML = "";
    if (!query || query.length < 1) {
      dropdown.classList.add("hidden");
      return;
    }

    const q = query.toLowerCase();
    const matched = products
      .filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q)
      )
      .slice(0, 8);

    if (!matched.length) {
      dropdown.classList.add("hidden");
      return;
    }

    matched.forEach(p => {
      const item = document.createElement("div");
      item.className = "search-dropdown__item";
      item.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <span>${p.name}</span>
      `;
      item.addEventListener("mousedown", (e) => {
        e.preventDefault();
        input.value = p.name;
        dropdown.classList.add("hidden");
        navigateTo(`#product-detail?id=${p.id}`);
        router(products);
      });
      dropdown.appendChild(item);
    });

    dropdown.classList.remove("hidden");
  };

  input.addEventListener("input", () => {
    showSuggestions(input.value.trim());
  });

  input.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      runSearch();
    }
    if (event.key === "Escape") {
      dropdown.classList.add("hidden");
    }
  });

  input.addEventListener("focus", () => {
    if (input.value.trim()) showSuggestions(input.value.trim());
  });

  input.addEventListener("blur", () => {
    setTimeout(() => dropdown.classList.add("hidden"), 150);
  });

  icon?.addEventListener("click", runSearch);
  syncSearchInputWithHash();
}

function setupFooterNavigation(products) {
  const footer = document.querySelector(".footer");
  if (!footer) return;

  footer.querySelectorAll("[data-route]").forEach(link => {
    link.addEventListener("click", () => {
      const route = link.dataset.route;
      if (!route) return;

      const nextHash = `#${route}`;

      if (window.location.pathname + window.location.hash === `/${nextHash}`) {
        router(products);
        return;
      }

      navigateTo(nextHash);
      router(products);
    });
  });

  const footerYear = document.querySelector("#footer-year");
  if (footerYear) {
    footerYear.textContent = String(new Date().getFullYear());
  }
}

async function initApp() {
  const app = document.querySelector("#app");

  try {
    const data = await getData("/api/data");
    initCategoryCatalog(data);
    const list = data.products || [];
    const products = list.map(product => new Product(product));
    initBrandCatalog(products);

    WishlistPanel.init(products);
    document.addEventListener("wishlist:addToCart", (e) => {
      const product  = e.detail;
      const cart     = JSON.parse(localStorage.getItem("cart")) || [];
      const existing = cart.find(item => Number(item.id) === Number(product.id));

      if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
      } else {
        cart.push({ id: product.id, quantity: 1 });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      updateNavbarCount();
    });

    CartPanel.init(products);

    document.querySelector("#wishlistToggle")
      ?.addEventListener("click", () => {
        CartPanel.close();
        WishlistPanel.open();
      });

    document.querySelector("#cartToggle")
      ?.addEventListener("click", () => {
        WishlistPanel.close();
        CartPanel.open();
      });

    setupUserDropdown();
    updateUserBtn();

    setupCardActions(products);
    setupSearch(products);
    setupFooterNavigation(products);
    setupCategoryNav();
    setupBrandNav();
    setupAppNavigation(products, router);
    router(products);
    updateNavbarCount();

    window.addEventListener("hashchange", () => {
      syncSearchInputWithHash();
      router(products);
      updateNavbarCount();
    });
  } catch (err) {
    console.error(err);
    if (app) {
      app.innerHTML = "<p style='padding:2rem'>Апп ачаалахад алдаа гарлаа. Console-оо шалгана уу.</p>";
    }
  }
}

initApp();