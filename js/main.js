import { template } from "./product-card.js";

function renderHighRated(products, container) {
    const highRatedProducts = products.filter(product => product.rating >= 4.5);
    container.innerHTML = highRatedProducts
        .map(product => template.cardTemplate(product))
        .join("");
}

function renderSale(products, container) {
    const saleProducts = products.filter(product => product.discount > 0);
    container.innerHTML = saleProducts
        .map(product => template.saleTemplate(product))
        .join("");
}

function getData(dataUrl) {
    return fetch(dataUrl)
        .then(r => r.json())
        .then(d => d)
        .catch(error => {
            console.error("Error fetching data:", error);
            return { products: [] };
        });
}

class Product {
    constructor(product) {
        this.id = product.id;
        this.name = product.name;
        this.brand = product.brand;
        this.price = product.price;
        this.discount = product.discount || 0;
        this.newPrice = product.price - (product.price * this.discount / 100);
        this.rating = product.rating;
        this.reviews = product.reviews;
        this.categoryId = product.categoryId;
        this.description = product.description;
        this.ingredients = product.ingredients;
        this.usage = product.usage;
        this.img = product.img;
    }
}

async function render() {
    const data = await getData("../products.json");
    const products = data.products.map(product => new Product(product));
    const containers = document.querySelectorAll(".products");

    containers.forEach(c => {
        switch (c.dataset.page) {
            case "high-rated":
                renderHighRated(products, c);
                break;

            case "sales":
                renderSale(products, c);
                break;
        }
    });
}

render();