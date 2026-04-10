fetch("../products.json")
  .then(res => res.json())
  .then(data => {
    const products = data.products;
    renderSale(products);
  });

function renderSale(products) {
  const container = document.getElementById("products");
  const saleProducts = products.filter(product => product.discount > 0);

  container.innerHTML = saleProducts.map(product => saleTemplate(product)).join("");
}

function saleTemplate(product) {
  return `
    <div class="product-card">
      <span class="sale-rate">-${product.discount}%</span>

      <a href="product-detail.html?id=${product.id}" class="product-detail">
        <div class="product-image">
          <img src="images/${product.img}" alt="${product.name}">
        </div>

        <div class="product-body">
          <h3 class="product-title">${product.name}</h3>
          <p class="product-brand">${product.brand}</p>
        </div>
      </a>

      <div class="product-rating">
        <span class="review-star"><i class="fa-solid fa-star"></i></span>
        <span class="rating">${product.rating}</span>
        <span class="reviews">(${product.reviews})</span>
      </div>

      <p class="product-price">
        <span class="new-price">${product.price.toLocaleString()}₮</span>
        <span class="old-price">${product.oldPrice.toLocaleString()}₮</span>
      </p>

      <div class="product-actions">
        <button class="add-cart"><i class="fa-regular fa-cart-shopping"></i></button>
        <button class="wishlist"><i class="fa-regular fa-heart"></i></button>
      </div>
    </div>
  `;
}