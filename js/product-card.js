export const template = {
    cardTemplate(product) {
        return `
            <div class="product-card">
                <a href="../product-detail.html?id=${product.id}" class="product-link">
                    <div class="product-image">
                        <img src="../images/${product.img}" alt="${product.name}">
                    </div>

                    <div class="product-body">
                        <h3 class="product-title">${product.name}</h3>
                        <p class="product-brand">${product.brand}</p>
                    </div>

                    <div class="product-rating">
                        <span class="review-star"><i class="fa-solid fa-star"></i></span>
                        <span class="rating">${product.rating}</span>
                        <span class="reviews">(${product.reviews})</span>
                    </div>
                    <p class="product-price">${product.price.toLocaleString()}₮</p>
                </a>
                <div class="product-actions">
                    <button class="add-cart"><i class="fa-regular fa-cart-shopping"></i></button>
                    <button class="wishlist"><i class="fa-regular fa-heart"></i></button>
                </div>
            </div>
        `;
    }, saleTemplate(product) {
        return`
            <div class="product-card">
                <span class="sale-rate">-${product.discount}%</span>
                <a href="../product-detail.html?id=${product.id}" class="product-detail">
                    <div class="product-image">
                    <img src="../images/${product.img}" alt="${product.name}">
                    </div>

                    <div class="product-body">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-brand">${product.brand}</p>
                    </div>

                    <div class="product-rating">
                        <span class="review-star"><i class="fa-solid fa-star"></i></span>
                        <span class="rating">${product.rating}</span>
                        <span class="reviews">(${product.reviews})</span>
                    </div><p class="product-price">
                        <span class="new-price">${product.newPrice.toLocaleString()}₮</span>
                        <span class="old-price">${product.price.toLocaleString()}₮</span>
                    </p>
                </a>
                <div class="product-actions">
                    <button class="add-cart"><i class="fa-regular fa-cart-shopping"></i></button>
                    <button class="wishlist"><i class="fa-regular fa-heart"></i></button>
                </div>
            </div>
            `
        } 
};