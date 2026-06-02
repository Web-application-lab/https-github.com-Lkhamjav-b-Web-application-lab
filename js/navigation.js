import {
  buildCategoryPath,
  categoryPathToParams,
  normalizeLegacyCategoryLocation
} from "./utils/categoryCatalog.js";
import { brandPathToParams } from "./utils/brandCatalog.js";

const HASH_ROUTES = new Set([
  "home",
  "high-rated",
  "sales",
  "wishlist",
  "cart",
  "about",
  "location",
  "privacy",
  "terms",
  "skin-coach",
  "delivery",
  "product-detail",
  "search",
  "checkout"
]);

function isModifiedClick(event) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function isExternalHref(href) {
  return /^(https?:|mailto:|tel:|javascript:)/i.test(href);
}

export function parseLocation() {
  const legacyPath = normalizeLegacyCategoryLocation();
  if (legacyPath) {
    history.replaceState(null, "", legacyPath);
  }

  const hash = window.location.hash || "";
  if (hash.startsWith("#")) {
    const [page, query] = hash.slice(1).split("?");
    const route = page || "home";

    if (route === "category") {
      return {
        page: "category",
        params: new URLSearchParams(query || "")
      };
    }

    if (HASH_ROUTES.has(route)) {
      return {
        page: route,
        params: new URLSearchParams(query || "")
      };
    }
  }

  const brandParams = brandPathToParams(window.location.pathname);
  if (brandParams !== null) {
    return { page: "brand", params: brandParams };
  }

  const categoryParams = categoryPathToParams(window.location.pathname);
  if (categoryParams !== null) {
    return { page: "category", params: categoryParams };
  }

  const path = window.location.pathname.replace(/\/index\.html$/i, "").replace(/\/$/, "") || "/";
  if (path === "/") {
    return { page: "home", params: new URLSearchParams() };
  }

  return { page: null, params: new URLSearchParams() };
}

export function navigateTo(path, { replace = false } = {}) {
  let next = path.startsWith("/") || path.startsWith("#") ? path : `/${path}`;

  if (next.startsWith("#")) {
    next = `/${next}`;
  }

  if (replace) {
    history.replaceState(null, "", next);
  } else {
    history.pushState(null, "", next);
  }
}

export function setupAppNavigation(products, router) {
  document.addEventListener("click", event => {
    const link = event.target.closest("a[href]");
    if (!link || link.target === "_blank" || isModifiedClick(event)) return;

    const href = link.getAttribute("href");
    if (!href || isExternalHref(href)) return;

    if (href === "/" || href === "/index.html") {
      event.preventDefault();
      navigateTo("#home");
      router(products);
      return;
    }

    if (href.startsWith("/c") || href.startsWith("/b")) {
      event.preventDefault();
      navigateTo(href.split("?")[0]);
      router(products);
      return;
    }

    if (!href.startsWith("#")) return;

    if (href.startsWith("#category")) {
      event.preventDefault();
      const query = href.includes("?") ? href.split("?")[1] : "";
      const params = new URLSearchParams(query);
      const path = buildCategoryPath({
        categorySlug: params.get("cat") || undefined,
        subCategorySlug: params.get("sub") || undefined
      });
      navigateTo(path);
      router(products);
      return;
    }

    const route = href.replace("#", "").split("?")[0] || "home";
    if (!HASH_ROUTES.has(route) && route !== "") return;

    event.preventDefault();
    navigateTo(href);
    router(products);
  });

  window.addEventListener("popstate", () => router(products));
}