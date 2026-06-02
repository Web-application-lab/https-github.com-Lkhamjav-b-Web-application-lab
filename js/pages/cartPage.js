import { updateNavbarCount } from "../utils/navbarCount.js";
import { showToast } from "../utils/toggle.js";
import { navigateTo } from "../navigation.js";

function getCart() {
  try {
    const raw = JSON.parse(localStorage.getItem("cart")) || [];
    if (raw.length && typeof raw[0] !== "object") {
      return raw.map(id => ({ id: Number(id), qty: 1 }));
    }
    return raw;
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateNavbarCount();
}

export function addToCart(productId) {
  const cart  = getCart();
  const index = cart.findIndex(i => i.id === Number(productId));
  if (index === -1) {
    cart.push({ id: Number(productId), qty: 1 });
  } else {
    cart[index].qty += 1;
  }
  saveCart(cart);
  CartPanelClass.refresh();
}

export function isInCart(productId) {
  return getCart().some(i => i.id === Number(productId));
}

class CartPanelClass {
  static _instance = null;
  static _products  = [];

  static init(products) {
    CartPanelClass._products = products;
    if (!CartPanelClass._instance) {
      CartPanelClass._instance = new CartPanelClass();
    }
    return CartPanelClass._instance;
  }

  static open() {
    if (!CartPanelClass._instance) {
      console.warn("CartPanel.init(products) дуудагдаагүй байна.");
      return;
    }
    CartPanelClass._instance._open();
  }

  static refresh() {
    if (CartPanelClass._instance) {
      CartPanelClass._instance._renderItems();
    }
  }

  static close() {
    CartPanelClass._instance?._close();
  }

  constructor() {
    this._overlay = this._el("div", "cart-overlay");
    this._panel   = this._el("div", "cart-panel");
    this._panel.setAttribute("role", "dialog");
    this._panel.setAttribute("aria-label", "Миний сагс");

    const header   = this._el("div", "cart-header");
    const left     = this._el("div", "cart-header-left");
    const iconWrap = this._el("div", "cart-header-icon");
    iconWrap.innerHTML = `<i class="fa-solid fa-bag-shopping"></i>`;
    const title = this._el("h2", "cart-title");
    title.textContent = "Миний сагс";
    this._badge = this._el("span", "cart-badge");
    this._badge.textContent = "0";
    left.append(iconWrap, title, this._badge);

    const closeBtn = this._el("button", "cart-close");
    closeBtn.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
    closeBtn.setAttribute("aria-label", "Хаах");
    closeBtn.addEventListener("click", () => this._close());
    header.append(left, closeBtn);

    this._body = this._el("div", "cart-body");

    const footer      = this._el("div", "cart-footer");
    const totalRow    = this._el("div", "cart-footer-total");
    const label       = this._el("span", "cart-footer-label");
    label.textContent = "Нийт дүн:";
    this._totalEl     = this._el("span", "cart-footer-amount");
    this._totalEl.textContent = "0₮";
    totalRow.append(label, this._totalEl);

    const checkoutBtn = this._el("button", "cart-checkout-btn");
    checkoutBtn.innerHTML = `<i class="fa-solid fa-credit-card"></i> Захиалга өгөх`;
    checkoutBtn.addEventListener("click", () => this._checkout());

    const clearBtn = this._el("button", "cart-clear-btn");
    clearBtn.innerHTML = `<i class="fa-regular fa-trash-can" style="margin-right:6px"></i>Сагс цэвэрлэх`;
    clearBtn.addEventListener("click", () => this._clearAll());

    footer.append(totalRow, checkoutBtn, clearBtn);
    this._panel.append(header, this._body, footer);
    document.body.append(this._overlay, this._panel);

    this._overlay.addEventListener("click", () => this._close());
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") this._close();
    });
  }

  _checkout() {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) {
      showToast("Захиалга өгөхийн тулд нэвтэрнэ үү!");
      setTimeout(() => { window.location.href = "/login"; }, 1500);
      return;
    }

    const cart = getCart();
    if (!cart.length) {
      showToast("Сагс хоосон байна!");
      return;
    }

    // Сагсыг хааж checkout руу navigate хийнэ
    this._close();
    navigateTo("#checkout");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  _open() {
    this._renderItems();
    this._overlay.classList.add("cart-open");
    this._panel.classList.add("cart-open");
    document.body.style.overflow = "hidden";
  }

  _close() {
    this._overlay.classList.remove("cart-open");
    this._panel.classList.remove("cart-open");
    document.body.style.overflow = "";
  }

  _renderItems() {
    const cart  = getCart();
    const items = CartPanelClass._products
      .map(p => {
        const entry = cart.find(i => i.id === Number(p.id));
        return entry ? { product: p, qty: entry.qty } : null;
      })
      .filter(Boolean);

    const totalQty = items.reduce((s, i) => s + i.qty, 0);
    this._badge.textContent = totalQty;

    const totalPrice = items.reduce((s, i) => {
      const price = i.product.discount > 0 ? i.product.newPrice : i.product.price;
      return s + price * i.qty;
    }, 0);
    this._totalEl.textContent = `${Math.round(totalPrice).toLocaleString("mn-MN")}₮`;

    this._body.innerHTML = "";

    if (items.length === 0) {
      this._body.appendChild(this._emptyState());
      return;
    }
    items.forEach(({ product, qty }, i) =>
      this._body.appendChild(this._itemEl(product, qty, i))
    );
  }

  _emptyState() {
    const wrap = this._el("div", "cart-empty");
    const icon = this._el("div", "cart-empty-icon");
    icon.innerHTML = `<i class="fa-solid fa-bag-shopping"></i>`;
    const t = this._el("p", "cart-empty-title");
    t.textContent = "Сагс хоосон байна";
    const s = this._el("p", "cart-empty-sub");
    s.textContent = "Бараа сонгоод сагсанд нэмээрэй";
    wrap.append(icon, t, s);
    return wrap;
  }

  _itemEl(p, qty, index) {
    const item = this._el("div", "cart-item");
    item.style.animationDelay = `${index * 0.055}s`;

    let imgEl;
    if (p.img) {
      const src = p.imageUrl || (p.img?.includes("/") ? p.img : `/images/${p.img}`);
      imgEl = Object.assign(this._el("img", "cart-item-img"), { src, alt: p.name ?? "" });
      imgEl.onerror = () => { imgEl.onerror = null; imgEl.src = "/images/placeholder.svg"; };
    } else {
      imgEl = this._el("div", "cart-item-img-placeholder");
      imgEl.innerHTML = `<i class="fa-solid fa-bottle-droplet"></i>`;
    }

    const info = this._el("div", "cart-item-info");

    if (p.brand) {
      const brand = this._el("span", "cart-item-brand");
      brand.textContent = p.brand;
      info.appendChild(brand);
    }

    const name = this._el("div", "cart-item-name");
    name.textContent = p.name ?? `Бараа #${p.id}`;
    name.title = p.name ?? "";
    info.appendChild(name);

    const priceRow     = this._el("div", "cart-item-price");
    const displayPrice = p.discount > 0 ? p.newPrice : p.price;
    priceRow.textContent = `${Math.round(displayPrice).toLocaleString("mn-MN")}₮`;
    if (p.discount > 0) {
      const old = this._el("span", "cart-item-price-old");
      old.textContent = `${Number(p.price).toLocaleString("mn-MN")}₮`;
      priceRow.appendChild(old);
    }
    info.appendChild(priceRow);

    const row     = this._el("div", "cart-item-row");
    const qtyWrap = this._el("div", "cart-qty");

    const minusBtn = this._el("button", "cart-qty-btn");
    minusBtn.innerHTML = `<i class="fa-solid fa-minus"></i>`;
    minusBtn.setAttribute("aria-label", "Хасах");
    minusBtn.addEventListener("click", () => this._changeQty(p.id, -1));

    const qtyVal = this._el("span", "cart-qty-val");
    qtyVal.textContent = qty;

    const plusBtn = this._el("button", "cart-qty-btn");
    plusBtn.innerHTML = `<i class="fa-solid fa-plus"></i>`;
    plusBtn.setAttribute("aria-label", "Нэмэх");
    plusBtn.addEventListener("click", () => this._changeQty(p.id, +1));

    qtyWrap.append(minusBtn, qtyVal, plusBtn);

    const removeBtn = this._el("button", "cart-item-remove");
    removeBtn.innerHTML = `<i class="fa-solid fa-trash-can"></i>`;
    removeBtn.setAttribute("aria-label", "Устгах");
    removeBtn.addEventListener("click", () => this._remove(p.id));

    row.append(qtyWrap, removeBtn);
    info.appendChild(row);
    item.append(imgEl, info);
    return item;
  }

  _changeQty(productId, delta) {
    const cart  = getCart();
    const index = cart.findIndex(i => i.id === Number(productId));
    if (index === -1) return;

    cart[index].qty += delta;

    if (cart[index].qty <= 0) {
      cart.splice(index, 1);
      showToast("Сагснаас хасагдлаа!");
    }

    saveCart(cart);
    this._renderItems();
  }

  _remove(productId) {
    const cart = getCart().filter(i => i.id !== Number(productId));
    saveCart(cart);
    showToast("Сагснаас хасагдлаа!");
    this._renderItems();
  }

  _clearAll() {
    saveCart([]);
    showToast("Сагс цэвэрлэгдлээ!");
    this._renderItems();
  }

  _el(tag, cls) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    return el;
  }
}

export const CartPanel = CartPanelClass;

export function renderCartPage(products, app) {
  CartPanel.open();
}

export { getCart, saveCart };