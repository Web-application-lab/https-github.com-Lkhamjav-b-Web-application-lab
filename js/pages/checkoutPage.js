import { getCart, saveCart } from "./cartPage.js";
import { showToast } from "../utils/toggle.js";
import { navigateTo } from "../navigation.js";

export function renderCheckoutPage(products, container) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const cart = getCart();

  const items = cart.map(c => {
    const p = products.find(pr => Number(pr.id) === Number(c.id));
    if (!p) return null;
    return {
      product: p,
      qty: c.qty,
      price: p.discount > 0 ? p.newPrice : p.price
    };
  }).filter(Boolean);

  const subtotal   = items.reduce((s, i) => s + i.price * i.qty, 0);
  const totalPrice = subtotal;

  container.innerHTML = `
    <div class="checkout-page">
      <h1 class="checkout-page__title">Захиалга баталгаажуулах</h1>

      <div class="checkout-page__layout">

        <!-- Зүүн: хүргэлтийн мэдээлэл -->
        <div class="checkout-page__left">

          <div class="checkout-section">
            <h2 class="checkout-section__title">Хүргэлтийн мэдээлэл</h2>
            <div class="checkout-form">
              <div class="checkout-form__field">
                <label>Нэр *</label>
                <input type="text" id="co-name" value="${user?.name || ""}" placeholder="Таны нэр" />
              </div>
              <div class="checkout-form__row">
                <div class="checkout-form__field">
                  <label>Утас *</label>
                  <input type="tel" id="co-phone" value="${user?.phone || ""}" placeholder="Утасны дугаар" />
                </div>
                <div class="checkout-form__field">
                  <label>И-мэйл</label>
                  <input type="email" id="co-email" value="${user?.email || ""}" placeholder="И-мэйл" />
                </div>
              </div>
              <div class="checkout-form__field">
                <label>Хаяг *</label>
                <input type="text" id="co-address" placeholder="Хүргэлтийн хаяг" />
              </div>
              <div class="checkout-form__field">
                <label>Нэмэлт тэмдэглэл</label>
                <textarea id="co-note" rows="3" placeholder="Хүргэлттэй холбоотой тэмдэглэл"></textarea>
              </div>
            </div>
          </div>

          <div class="checkout-section">
            <h2 class="checkout-section__title">Төлбөрийн хэлбэр</h2>
            <div class="checkout-payment">
              <label class="checkout-payment__option">
                <input type="radio" name="payment" value="qpay" checked />
                <div class="checkout-payment__card">
                  <img src="/images/qpay.png" onerror="this.style.display='none'" alt="QPay" />
                  <div>
                    <p class="checkout-payment__name">QPay</p>
                    <p class="checkout-payment__desc">QR кодоор төлөх</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

        </div>

        <!-- Баруун: захиалгын дүн -->
        <div class="checkout-page__right">
          <div class="checkout-summary">
            <h2 class="checkout-summary__title">Захиалгын дүн</h2>

            <div class="checkout-summary__items">
              ${items.map(i => `
                <div class="checkout-summary__item">
                  <img src="/images/${i.product.img}" onerror="this.src='/images/placeholder.svg'" />
                  <div class="checkout-summary__item-info">
                    <p class="checkout-summary__item-name">${i.product.name}</p>
                    <p class="checkout-summary__item-meta">${i.qty} × ${Math.round(i.price).toLocaleString("mn-MN")}₮</p>
                  </div>
                </div>
              `).join("")}
            </div>

            <div class="checkout-summary__totals">
              <div class="checkout-summary__row">
                <span>Дэд дүн:</span>
                <span>${Math.round(subtotal).toLocaleString("mn-MN")}₮</span>
              </div>
              <div class="checkout-summary__row">
                <span>Хүргэлт:</span>
                <span class="checkout-summary__free">Үнэгүй</span>
              </div>
              <div class="checkout-summary__row checkout-summary__row--total">
                <span>Нийт:</span>
                <span>${Math.round(totalPrice).toLocaleString("mn-MN")}₮</span>
              </div>
            </div>

            <button class="checkout-submit-btn" id="checkout-submit-btn">
              Захиалга батлах
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- QPay modal -->
    <div class="qpay-modal hidden" id="qpay-modal">
      <div class="qpay-modal__box">
        <div class="qpay-modal__header">
          <h3>QPay төлбөр</h3>
          <button class="qpay-modal__close" id="qpay-close">✕</button>
        </div>
        <p class="qpay-modal__amount">${Math.round(totalPrice).toLocaleString("mn-MN")}₮</p>
        <div class="qpay-modal__qr" id="qpay-qr">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=QPay:BeautyShop:${totalPrice}" alt="QR код" />
        </div>
        <p class="qpay-modal__hint">QPay апп-аар QR кодыг уншуулна уу</p>
        <button class="qpay-confirm-btn" id="qpay-confirm-btn">
          ✓ Шалгах
        </button>
      </div>
    </div>
  `;

  // Захиалга батлах
  document.getElementById("checkout-submit-btn")?.addEventListener("click", () => {
    const name    = document.getElementById("co-name")?.value.trim();
    const phone   = document.getElementById("co-phone")?.value.trim();
    const address = document.getElementById("co-address")?.value.trim();

    if (!name || !phone || !address) {
      showToast("Нэр, утас, хаягаа бөглөнө үү!");
      return;
    }

    // QPay modal нээх
    document.getElementById("qpay-modal")?.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  });

  // QPay modal хаах
  document.getElementById("qpay-close")?.addEventListener("click", () => {
    document.getElementById("qpay-modal")?.classList.add("hidden");
    document.body.style.overflow = "";
  });

  // Шалгах — захиалга үүсгэх
  document.getElementById("qpay-confirm-btn")?.addEventListener("click", async () => {
    const btn = document.getElementById("qpay-confirm-btn");
    btn.textContent = "Шалгаж байна...";
    btn.disabled = true;

    const name    = document.getElementById("co-name")?.value.trim();
    const phone   = document.getElementById("co-phone")?.value.trim();
    const email   = document.getElementById("co-email")?.value.trim();
    const address = document.getElementById("co-address")?.value.trim();
    const note    = document.getElementById("co-note")?.value.trim();

    const orderItems = items.map(i => ({
      productId: i.product.id,
      name:      i.product.name,
      price:     i.price,
      qty:       i.qty,
      img:       i.product.img || ""
    }));

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId:    user?.id    || "guest",
          userName:  name,
          userEmail: email || user?.email || "",
          userPhone: phone,
          items:     orderItems,
          totalPrice,
          address:   address + (note ? ` (${note})` : ""),
          status:    "confirmed"
        })
      });

      const data = await res.json();

      if (res.ok) {
        document.getElementById("qpay-modal")?.classList.add("hidden");
        document.body.style.overflow = "";
        saveCart([]);

        // Амжилттай хуудас
        container.innerHTML = `
          <div class="checkout-success">
            <div class="checkout-success__icon">✓</div>
            <h2>Захиалга амжилттай баталгаажлаа!</h2>
            <p>Таны захиалга хүлээн авагдлаа. Бид удахгүй холбогдох болно.</p>
            <a href="/" class="checkout-success__btn">Нүүр хуудас руу буцах</a>
          </div>
        `;
      } else {
        showToast(data.error || "Алдаа гарлаа");
        btn.textContent = "✓ Шалгах";
        btn.disabled = false;
      }
    } catch {
      showToast("Сервертэй холбогдоход алдаа гарлаа");
      btn.textContent = "✓ Шалгах";
      btn.disabled = false;
    }
  });
}