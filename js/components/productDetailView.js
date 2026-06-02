import { starRating } from "./starRating.js";
import { priceTemplate } from "./priceTemplate.js";
import { productImageSrc } from "../utils/assets.js";
import "./quantitySelector.js";
import "./cartButton.js";
import "./wishlistButton.js";

export function renderProductDetailView(product, container) {
    const imageSrc = product.imageUrl || productImageSrc(product.img);
    const outOfStock = (product.stock ?? 1) === 0;
    
    container.innerHTML = `
    <section class="product-detail" id="product-detail">
    
      <div class="detail-left">
        <img src="${imageSrc}" alt="${product.name}"
             onerror="this.onerror=null;this.src='/images/placeholder.svg'">
      </div>
    
      <div class="detail-right">
        <p class="product-brand">${product.brand}</p>
        <h3 class="product-title">${product.name}</h3>
    
        <div class="product-rating">
          ${starRating(Math.round(product.rating))}
          <span class="rating">${product.rating}</span>
          <span class="reviews">(${product.reviews})</span>
        </div>
    
        ${priceTemplate(product)}
    
        ${outOfStock ? `<p class="detail-out-of-stock">Дууссан байна</p>` : ""}
    
<div class="product-actions">
  <wishlist-button product-id="${product.id}"></wishlist-button>
  <button class="detail-order-btn ${outOfStock ? "detail-order-btn--disabled" : ""}"
          id="detail-order-btn"
          ${outOfStock ? "disabled" : ""}>
    <i class="fa-solid fa-bag-shopping"></i>
    Захиалах
  </button>
</div>  
    
        <div class="product-description">
          <div class="tabs">
            <button class="tab-btn active" data-tab="usage">Хэрэглэх заавар</button>
            <button class="tab-btn" data-tab="description">Тайлбар</button>
            <button class="tab-btn" data-tab="ingredients">Найрлага</button>
          </div>
          <div id="usage" class="tab-content">
            <p>${product.usage || "–"}</p>
          </div>
          <div id="description" class="tab-content hidden">
            <p>${product.description || "–"}</p>
          </div>
          <div id="ingredients" class="tab-content hidden">
            <p>${Array.isArray(product.ingredients)
    ? product.ingredients.join(", ")
    : (product.ingredients || "–")}</p>
          </div>
        </div>
      </div>
    
    </section>
    
    <section class="product-reviews">
      <h3 class="reviews-heading">Сэтгэгдэл</h3>
      <div class="reviews-layout">
    
        <!-- Сэтгэгдэл бичих -->
        <div class="review-write-card" id="review-write-card">
          <h4>Таны үнэлгээ</h4>
          <div class="review-star-select" id="review-star-select">
            ${[1,2,3,4,5].map(n => `
              <i class="fa-regular fa-star review-star-icon" data-value="${n}"></i>
            `).join("")}
            <span class="review-star-label" id="review-star-label">0/5</span>
          </div>
          <textarea class="review-textarea" id="review-textarea"
            rows="5" placeholder="Таны сэтгэгдэл..." maxlength="500"></textarea>
          <p class="review-error hidden" id="review-error"></p>
          <button class="review-submit-btn" id="review-submit-btn">
            Илгээх
          </button>
        </div>
    
        <!-- Сэтгэгдлийн жагсаалт -->
        <div class="review-list" id="review-list">
          <div class="review-loading">Ачаалж байна...</div>
        </div>
    
      </div>
    </section>
  `;
    
    _bindTabs();
    _bindOrderBtn(product);
    _bindReviewStars();
    _loadReviews(product.id);
    _bindReviewSubmit(product.id);
}

function _bindTabs() {
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach(c => c.classList.add("hidden"));
            btn.classList.add("active");
            document.getElementById(btn.dataset.tab)?.classList.remove("hidden");
        });
    });
}

function _bindOrderBtn(product) {
    const btn = document.getElementById("detail-order-btn");
    if (!btn || btn.disabled) return;
    
    btn.addEventListener("click", async () => {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (!user) {
            window.location.href = "/login";
            return;
        }
        
        const price = product.discount > 0 ? product.newPrice : product.price;
        
        const res = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId:    user.id,
                userName:  user.name,
                userEmail: user.email,
                userPhone: user.phone || "",
                items: [{
                    productId: product.id,
                    name:      product.name,
                    price,
                    qty:       1,
                    img:       product.img || ""
                }],
                totalPrice: price
            })
        });
        
        const data = await res.json();
        if (res.ok) {
            btn.textContent = "✓ Захиалагдлаа!";
            btn.disabled = true;
            setTimeout(() => {
                btn.innerHTML = `<i class="fa-solid fa-bag-shopping"></i> Захиалах`;
                btn.disabled = false;
            }, 2500);
        } else {
            alert(data.error || "Алдаа гарлаа");
        }
    });
}

function _bindReviewStars() {
    const stars  = document.querySelectorAll(".review-star-icon");
    const label  = document.getElementById("review-star-label");
    let selected = 0;
    
    stars.forEach(star => {
        star.addEventListener("mouseover", () => {
            const val = Number(star.dataset.value);
            stars.forEach(s => {
                s.classList.toggle("fa-solid", Number(s.dataset.value) <= val);
                s.classList.toggle("fa-regular", Number(s.dataset.value) > val);
            });
        });
        
        star.addEventListener("mouseleave", () => {
            stars.forEach(s => {
                s.classList.toggle("fa-solid", Number(s.dataset.value) <= selected);
                s.classList.toggle("fa-regular", Number(s.dataset.value) > selected);
            });
        });
        
        star.addEventListener("click", () => {
            selected = Number(star.dataset.value);
            label.textContent = `${selected}/5`;
        });
    });
}

async function _loadReviews(productId) {
    const list = document.getElementById("review-list");
    if (!list) return;
    
    try {
        const res     = await fetch(`/api/reviews/${productId}`);
        const reviews = await res.json();
        
        if (!reviews.length) {
            list.innerHTML = `<p class="review-empty">Одоогоор сэтгэгдэл байхгүй байна</p>`;
            return;
        }
        
        list.innerHTML = reviews.map(r => `
      <div class="review-item">
        <div class="review-item__header">
          <div class="review-item__avatar">${r.userName.charAt(0).toUpperCase()}</div>
          <div>
            <p class="review-item__name">${r.userName}</p>
            <p class="review-item__date">${new Date(r.createdAt).toLocaleDateString("mn-MN")}</p>
          </div>
          <div class="review-item__stars">
            ${[1,2,3,4,5].map(n =>
            `<i class="${n <= r.rating ? "fa-solid" : "fa-regular"} fa-star"></i>`
        ).join("")}
          </div>
        </div>
        <p class="review-item__text">${r.comment}</p>
      </div>
    `).join("");
    } catch {
        list.innerHTML = `<p class="review-empty">Сэтгэгдэл ачаалахад алдаа гарлаа</p>`;
    }
}

async function _bindReviewSubmit(productId) {
    const btn     = document.getElementById("review-submit-btn");
    const errorEl = document.getElementById("review-error");
    if (!btn) return;
    
    btn.addEventListener("click", async () => {
        const user    = JSON.parse(localStorage.getItem("user") || "null");
        const comment = document.getElementById("review-textarea")?.value.trim();
        const label   = document.getElementById("review-star-label")?.textContent || "0/5";
        const rating  = Number(label.split("/")[0]);
        
        errorEl.classList.add("hidden");
        
        if (!user) {
            window.location.href = "/login";
            return;
        }
        
        if (!rating) {
            errorEl.textContent = "Үнэлгээ өгнө үү";
            errorEl.classList.remove("hidden");
            return;
        }
        
        if (!comment || comment.length < 5) {
            errorEl.textContent = "Сэтгэгдэл хамгийн багадаа 5 тэмдэгт байна";
            errorEl.classList.remove("hidden");
            return;
        }
        
        const res = await fetch("/api/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                productId,
                userId:   user.id,
                userName: user.name,
                rating,
                comment
            })
        });
        
        const data = await res.json();
        if (res.ok) {
            document.getElementById("review-textarea").value = "";
            document.getElementById("review-star-label").textContent = "0/5";
            document.querySelectorAll(".review-star-icon").forEach(s => {
                s.classList.remove("fa-solid");
                s.classList.add("fa-regular");
            });
            _loadReviews(productId);
        } else {
            errorEl.textContent = data.error || "Алдаа гарлаа";
            errorEl.classList.remove("hidden");
        }
    });
}