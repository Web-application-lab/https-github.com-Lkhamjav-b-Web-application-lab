import nav from "./components/nav.js";
const routes = [
    { item: "Body", lnk: "#/products", component: "products" },
    { item: "ProductDetail", lnk: "#/", component: "home" },
    { item: "Products", lnk: "#/about", component: "about" }
    ];
function render() {
    const currentRoute = routes.find(r => r.lnk === document.location.hash)?.component || "home";

    import(`./pages/${currentRoute}.js`)
        .then(module => {
            const pageContent = module.default();
            document
                .querySelector("main")
                .innerHTML = pageContent;
        })
        .catch(err => {
            console.error("Error loading component:", err);
            document.querySelector("main").innerHTML = "<p>Error loading content.</p>";
        });

    return `<header>
                ${nav(routes)}
            </header>
            <main><main>
    <footer>
    <p>&copy; 2026 My Website</p>
</footer>`
}

document
    .querySelector("#app")
    .innerHTML = render();

window.addEventListener("hashchange",
    () => {
        document
            .querySelector("#app")
            .innerHTML = render();
    });