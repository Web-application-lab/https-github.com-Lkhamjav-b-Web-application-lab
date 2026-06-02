import { template } from "../components/productCard.js";
import { navigateTo } from "../navigation.js";

export function renderHomePage(products, container) {
  // reviews байгаа бөгөөд rating 4.5-аас дээш бүтээгдэхүүн
  const highRated = products
    .filter(p => p.reviews > 0 && p.rating >= 4.5)
    .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
    .slice(0, 5);

  const sales = products
    .filter(p => p.discount > 0)
    .slice(0, 5);

  container.innerHTML = `
    <section class="hero" aria-label="hero">
      <img src="/images/hero.webp" class="hero-img" 
        width="1440" height="460"
        onerror="this.style.display='none'">
    </section>

    <main class="container">

      <section class="skin-concern-heading">
        <h2 id="skin-concern-heading">Үйлчилгээний төрлөөр</h2>

        <ul class="strip">
          <li class="strip-item">
            <button class="strip-button" data-concern="1">
              <span class="strip-circle">
                <img src="/icons/Hydrating.svg" alt="Hydrating">
              </span>
              <span class="strip-label">Чийгшүүлэх</span>
            </button>
          </li>

          <li class="strip-item">
            <button class="strip-button" data-concern="2">
              <span class="strip-circle">
                <img src="/icons/Calming.svg" alt="Calming">
              </span>
              <span class="strip-label">Тайвшруулах</span>
            </button>
          </li>

          <li class="strip-item">
            <button class="strip-button" data-concern="3">
              <span class="strip-circle">
                <img src="/icons/Nutrition.svg" alt="Nutrition">
              </span>
              <span class="strip-label">Тэжээл өгөх</span>
            </button>
          </li>

          <li class="strip-item">
            <button class="strip-button" data-concern="4">
              <span class="strip-circle">
                <img src="/icons/Whitening.svg" alt="Whitening">
              </span>
              <span class="strip-label">Цайруулах</span>
            </button>
          </li>

          <li class="strip-item">
            <button class="strip-button" data-concern="5">
              <span class="strip-circle">
                <img src="/icons/Pores.svg" alt="Pores">
              </span>
              <span class="strip-label">Нүхжилтийн эсрэг</span>
            </button>
          </li>

          <li class="strip-item">
            <button class="strip-button" data-concern="6">
              <span class="strip-circle">
                <img src="/icons/pH-balancing.svg" alt="pH-balancing">
              </span>
              <span class="strip-label">pH тэнцвэржүүлэх</span>
            </button>
          </li>

          <li class="strip-item">
            <button class="strip-button" data-concern="7">
              <span class="strip-circle">
                <img src="/icons/Anti-aging.svg" alt="Anti-aging">
              </span>
              <span class="strip-label">Үрчлээний эсрэг</span>
            </button>
          </li>
        </ul>
      </section>

      <section class="high-rated">
        <div class="heading-high-rated">
          <h2 id="high-rated-product">Үнэлгээ өндөр бүтээгдэхүүн</h2>
          <a href="#high-rated" class="view-all">Бүгдийг үзэх</a>
        </div>

        <div class="products">
          ${highRated.map(product => template.cardTemplate(product)).join("")}
        </div>
      </section>

      <section class="discount-product">
        <div class="heading-sale-product">
          <h2>Хямдралтай бүтээгдэхүүн</h2>
          <a href="#sales" class="view-all">Бүгдийг үзэх</a>
        </div>
        <div class="products">
          ${sales.length
            ? sales.map(p => template.saleTemplate(p)).join("")
            : `<p class="home-empty">Хямдрал байхгүй байна</p>`
          }
        </div>
      </section>

    </main>
  `;

  container.querySelectorAll(".strip-button[data-concern]").forEach(btn => {
    btn.addEventListener("click", () => {
      const concernId = Number(btn.dataset.concern);
      const url = `#category?concern=${concernId}`;
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
  });
}