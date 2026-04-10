fetch("products.json")
    .then(res => res.json())
    .then(data => {
        const products = data.products;
        const params = new URLSearchParams(window.location.search);
        const productId = Number(params.get("id"));
        console.log(window.location.search);
        console.log(productId);
        console.log(products.map(p => ({ id: p.id, name: p.name })));

        const product = products.find(item => Number(item.id) === productId);

        const container = document.getElementById("product-detail");

        if (!product) {
            container.innerHTML = `<p>Product not found.</p>`;
            return;
        }

        container.innerHTML = `
            <div class="detail-left">
                <img src="images/${product.img}" alt="${product.name}">
            </div>

            <div class="detail-right">
                <div class="product-body">
                    <p class="product-brand">${product.brand}</p>
                    <h3 class="product-title">${product.name}</h3>
                </div>

                <div class="product-rating">
                    <i class="fa-solid fa-star"></i>
                    <span class="rating">${product.rating}</span>
                    <span class="reviews">(${product.reviews})</span>
                    <p class="product-price">${product.price.toLocaleString()}₮</p>
                </div>

                <div class="product-count">
                    <button class="plus"><i class="fa-solid fa-plus"></i></button>
                    <span class="count">1</span>
                    <button class="minus"><i class="fa-solid fa-minus"></i></button>
                </div>

                <div class="product-actions">
                    <button class="add-cart">Сагслах</button>
                    <button class="order">Захиалах</button>
                    <button class="wishlist"><i class="fa-regular fa-heart"></i></button>
                </div>

                <div class="product-description">
                    <div class="tabs">
                        <button class="tab-btn active" onclick="openTab('usage', this)">Хэрэглэх заавар</button>
                        <button class="tab-btn" onclick="openTab('description', this)">Тайлбар</button>
                        <button class="tab-btn" onclick="openTab('ingredients', this)">Найрлага</button>
                    </div>

                    <div id="usage" class="tab-content">
                        <p>${product.usage}</p>
                    </div>

                    <div id="description" class="tab-content" style="display: none;">
                        <p>${product.description}</p>
                    </div>

                    <div id="ingredients" class="tab-content" style="display: none;">
                        <p>${Array.isArray(product.ingredients) ? product.ingredients.join(", ") : product.ingredients}</p>
                    </div>
                </div>
            </div>
        `;
    })
    .catch(error => {
        console.error("Error loading product detail:", error);
    });