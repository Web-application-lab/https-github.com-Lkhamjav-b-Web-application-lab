import { renderHomePage } from "./pages/homePage.js";
import { renderHighRatedPage } from "./pages/highRatedPage.js";
import { renderSalePage } from "./pages/salePage.js";
import { renderAboutPage } from "./pages/aboutPage.js";
import { renderLocationPage } from "./pages/locationPage.js";
import { renderPrivacyPage } from "./pages/privacyPage.js";
import { renderTermsPage } from "./pages/termsPage.js";
import { renderSkinCoachPage } from "./pages/skinCoachPage.js";
import { renderDeliveryPage } from "./pages/deliveryPage.js";
import { renderProductDetailPage } from "./pages/productDetailPage.js";
import { renderWishlistPage } from "./pages/wishlistPage.js";
import { renderCartPage } from "./pages/cartPage.js";
import { renderSearchPage } from "./pages/searchPage.js";
import { renderCategoryPage } from "./pages/categoryPage.js";
import { renderBrandPage } from "./pages/brandPage.js";
import { renderAccountPage } from "./pages/accountPage.js";
import { parseLocation } from "./navigation.js";
import { AuthModal } from "./pages/authPage.js";
import { renderAdminPage } from "./pages/adminPage.js";
import { renderCheckoutPage } from "./pages/checkoutPage.js";


export function router(products) {
  const app = document.querySelector("#app");

  const pathname = window.location.pathname;

  if (pathname === "/login") {
    AuthModal.render("login");
    return;
  }
  if (pathname === "/signup") {
    AuthModal.render("register");
    return;
  }
  if (pathname === "/account/profile") {
    renderAccountPage(app, "profile");
    return;
  }
  if (pathname === "/account/orders") {
    renderAccountPage(app, "orders");
    return;
  }
  if (pathname === "/admin") {
  renderAdminPage(app);
  return;
  }

  const { page, params } = parseLocation();

  window.scrollTo(0, 0);

  switch (page) {
    case "home":
      renderHomePage(products, app);
      break;
    case "high-rated":
      renderHighRatedPage(products, app);
      break;
    case "sales":
      renderSalePage(products, app);
      break;
    case "concern":
      renderCategoryPage(products, app, params);
      break;
    case "wishlist":
      renderHomePage(products, app);
      renderWishlistPage(products, app);
      break;
    case "cart":
      renderCartPage(products, app);
      break;
    case "about":
      renderAboutPage(app);
      break;
    case "location":
      renderLocationPage(app);
      break;
    case "privacy":
      renderPrivacyPage(app);
      break;
    case "terms":
      renderTermsPage(app);
      break;
    case "skin-coach":
      renderSkinCoachPage(products, app);
      break;
    case "delivery":
      renderDeliveryPage(app);
      break;
    case "product-detail":
      renderProductDetailPage(products, app, params);
      break;
    case "search":
      renderSearchPage(products, app, params);
      break;
    case "category":
      renderCategoryPage(products, app, params);
      break;
    case "brand":
      renderBrandPage(products, app, params);
      break;
    case "checkout":
     renderCheckoutPage(products, app);
     break;
    default:
      app.innerHTML = `
        <section class="page">
          <h2>Page not found</h2>
          <a href="/">Back to home</a>
        </section>
      `;
  }
}