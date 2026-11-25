document.addEventListener("DOMContentLoaded", function () {

    // =========================================
    // ANIMATION HELPERS
    // =========================================

    function playAnimation(elements, className) {
        elements.forEach(element => {
            element.classList.remove(className);
            void element.offsetWidth; // restart the animation
            element.classList.add(className);
            element.addEventListener(
                "animationend",
                () => element.classList.remove(className),
                { once: true }
            );
        });
    }

    // Fade-in on scroll for static sections
    const revealTargets = document.querySelectorAll(
        ".product-card, .category-card, .benefit, .mission-card, " +
        ".about-benefit, .faq-item, .contact-item, .special-offer, " +
        ".story-content, .story-image"
    );

    if ("IntersectionObserver" in window && revealTargets.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("revealed");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        revealTargets.forEach((element, index) => {
            element.classList.add("reveal");
            element.style.setProperty("--reveal-delay", (index % 4) * 70 + "ms");
            observer.observe(element);
        });
    }


    // =========================================
    // 1. STORAGE FUNCTIONS
    // =========================================

    const CART_KEY = "drishyaLuxeCart";
    const WISHLIST_KEY = "drishyaLuxeWishlist";
    const THEME_KEY = "drishyaLuxeTheme";

    function readStorage(key) {
        try {
            const data = JSON.parse(localStorage.getItem(key) || "[]");
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Storage read error:", error);
            return [];
        }
    }

    function getCart() {
        return readStorage(CART_KEY);
    }

    function saveCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }

    function getWishlist() {
        return readStorage(WISHLIST_KEY);
    }

    function saveWishlist(wishlist) {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    }

    function updateCartCount() {
        const count = getCart().reduce(
            (sum, item) => sum + Number(item.quantity || 0),
            0
        );

        document.querySelectorAll("#cart-count").forEach(element => {
            element.textContent = count;
        });
    }

    function updateWishlistCount() {
        const count = getWishlist().length;

        document.querySelectorAll("#wishlist-count").forEach(element => {
            element.textContent = count;
        });
    }


    // =========================================
    // 2. DARK MODE FOR ALL PAGES
    // =========================================

    // =========================================
// 2. DARK MODE FOR ALL PAGES
// =========================================

function applyTheme(theme) {
    document.body.classList.toggle("dark-mode", theme === "dark");

    document.querySelectorAll("#theme-toggle").forEach(button => {
        button.innerHTML = theme === "dark"
            ? '<i class="fa-solid fa-sun"></i>'
            : '<i class="fa-solid fa-moon"></i>';

        button.setAttribute(
            "aria-label",
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
        );
    });
}

// Load the saved theme
applyTheme(localStorage.getItem(THEME_KEY) || "light");

// Listen for clicks on the theme button
const themeToggle = document.getElementById("theme-toggle");

if (themeToggle) {
    themeToggle.addEventListener("click", function () {
        const isDark = document.body.classList.contains("dark-mode");
        const newTheme = isDark ? "light" : "dark";

        localStorage.setItem(THEME_KEY, newTheme);
        applyTheme(newTheme);
    });
}

    // =========================================
    // TOAST NOTIFICATIONS
    // =========================================

    function showToast(message, options) {
        options = options || {};

        let stack = document.getElementById("toast-stack");

        if (!stack) {
            stack = document.createElement("div");
            stack.id = "toast-stack";
            stack.setAttribute("aria-live", "polite");
            document.body.appendChild(stack);
        }

        const toast = document.createElement("div");
        toast.className = "toast toast-" + (options.type || "success");
        toast.setAttribute("role", "status");

        const icon = document.createElement("i");
        icon.className =
            options.type === "error"
                ? "fa-solid fa-circle-exclamation"
                : options.type === "wishlist"
                    ? "fa-solid fa-heart"
                    : "fa-solid fa-circle-check";

        const text = document.createElement("span");
        text.className = "toast-text";
        text.textContent = message;

        toast.append(icon, text);

        if (options.linkHref) {
            const link = document.createElement("a");
            link.href = options.linkHref;
            link.className = "toast-link";
            link.textContent = options.linkText || "View";
            toast.appendChild(link);
        }

        const close = document.createElement("button");
        close.type = "button";
        close.className = "toast-close";
        close.setAttribute("aria-label", "Dismiss");
        close.innerHTML = "&times;";
        toast.appendChild(close);

        stack.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add("show"));

        function dismiss() {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 300);
        }

        close.addEventListener("click", dismiss);
        setTimeout(dismiss, 3000);
    }


    // =========================================
    // 3. SEARCH AND FILTER PRODUCTS
    // =========================================

    const searchInput = document.querySelector(".search-box input");
    const categoryInputs = document.querySelectorAll('input[name="category"]');
    const priceInputs = document.querySelectorAll('input[name="price"]');
    const clearButton = document.querySelector("#clear-filters");

    const productGroups = document.querySelectorAll(
        ".product-container, .listing-grid"
    );

    function updateProducts() {
        const searchText = searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

        const selectedCategories = Array.from(categoryInputs)
            .filter(input => input.checked)
            .map(input => input.value);

        const selectedPriceInput = document.querySelector(
            'input[name="price"]:checked'
        );

        const selectedPrice = selectedPriceInput
            ? selectedPriceInput.value
            : "";

        productGroups.forEach(group => {
            const products = group.querySelectorAll(".product-card");
            let visibleCount = 0;

            products.forEach(product => {
                const heading = product.querySelector("h3");

                const name = heading
                    ? heading.textContent.toLowerCase()
                    : "";

                const category = product.dataset.category;
                const price = Number(product.dataset.price);

                const matchesSearch = name.includes(searchText);

                const matchesCategory =
                    selectedCategories.length === 0 ||
                    (
                        category &&
                        selectedCategories.includes(category)
                    );

                let matchesPrice = true;

                if (
                    selectedPrice &&
                    product.dataset.price !== undefined
                ) {
                    if (selectedPrice === "under-500") {
                        matchesPrice = price < 500;
                    } else if (selectedPrice === "500-1500") {
                        matchesPrice = price >= 500 && price <= 1500;
                    } else if (selectedPrice === "1500-3000") {
                        matchesPrice = price > 1500 && price <= 3000;
                    } else if (selectedPrice === "above-3000") {
                        matchesPrice = price > 3000;
                    }
                }

                const visible =
                    matchesSearch && matchesCategory && matchesPrice;

                product.hidden = !visible;

                if (visible) {
                    visibleCount++;
                }
            });

            let emptyMessage = group.querySelector(".search-empty-state");

            if (visibleCount === 0 && products.length > 0) {
                if (!emptyMessage) {
                    emptyMessage = document.createElement("p");
                    emptyMessage.className = "search-empty-state";
                    group.appendChild(emptyMessage);
                }

                emptyMessage.textContent = "No matching products found.";
                emptyMessage.hidden = false;
            } else if (emptyMessage) {
                emptyMessage.hidden = true;
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", updateProducts);
    }

    categoryInputs.forEach(input => {
        input.addEventListener("change", updateProducts);
    });

    priceInputs.forEach(input => {
        input.addEventListener("change", updateProducts);
    });

    if (clearButton) {
        clearButton.addEventListener("click", function () {
            categoryInputs.forEach(input => {
                input.checked = false;
            });

            priceInputs.forEach(input => {
                input.checked = false;
            });

            if (searchInput) {
                searchInput.value = "";
            }

            updateProducts();
        });
    }


    // =========================================
    // 4. SORT PRODUCTS
    // =========================================

    const productGrid = document.querySelector(".listing-grid");
    const sortSelect = document.querySelector(".listing-heading select");

    if (productGrid && sortSelect) {
        const originalProducts = Array.from(
            productGrid.querySelectorAll(".product-card")
        );

        sortSelect.addEventListener("change", function () {
            const option = sortSelect.value;
            const sortedProducts = [...originalProducts];

            if (option === "Price: Low to High") {
                sortedProducts.sort(
                    (a, b) => Number(a.dataset.price) - Number(b.dataset.price)
                );
            } else if (option === "Price: High to Low") {
                sortedProducts.sort(
                    (a, b) => Number(b.dataset.price) - Number(a.dataset.price)
                );
            }

            sortedProducts.forEach(product => {
                productGrid.appendChild(product);
            });
        });
    }


    // =========================================
    // 5. ADD TO CART
    // =========================================

    function updateAddToCartButtons() {
        const cart = getCart();

        document.querySelectorAll(".add-to-cart").forEach(button => {
            const card = button.closest(".product-card");

            if (!card) return;

            const exists = cart.some(
                item => item.id === card.dataset.productId
            );

            button.disabled = false;

            button.textContent = exists
                ? "Add More to Cart"
                : "Add to Cart";

            button.classList.toggle("is-added", exists);
        });
    }

    function addProductToCart(product) {
        const cart = getCart();

        const existing = cart.find(item => item.id === product.id);

        if (existing) {
            existing.quantity = Number(existing.quantity || 0) + 1;
        } else {
            cart.push({
                ...product,
                quantity: 1
            });
        }

        saveCart(cart);
        updateCartCount();
        updateAddToCartButtons();
        playAnimation(document.querySelectorAll("#cart-count"), "bump");
    }

    document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", function () {
            const card = button.closest(".product-card");

            if (!card) return;

            const heading = card.querySelector("h3");
            const image = card.querySelector("img");

            const id = card.dataset.productId;
            const price = Number(card.dataset.price);

            if (
                !id ||
                !heading ||
                card.dataset.price === undefined ||
                !Number.isFinite(price)
            ) {
                console.error(
                    "Product card is missing its ID, name, or price.",
                    card
                );

                showToast("This product is missing its ID or price.", { type: "error" });
                return;
            }

            addProductToCart({
                id: id,
                name: heading.textContent.trim(),
                price: price,
                image: image ? image.src : ""
            });
            const productName = heading.textContent.trim();
            showToast(`"${productName}" added to your cart`, {
                linkHref: "cart.html",
                linkText: "View Cart"
            });

      
            button.textContent = "Added ✓";
            

            setTimeout(updateAddToCartButtons, 1000);
        });
    });


    // =========================================
    // 6. CART PAGE
    // =========================================

    const cartItemsContainer = document.querySelector("#cart-items");

    function renderCart() {
        if (!cartItemsContainer) return;

        const cart = getCart();

        cartItemsContainer.replaceChildren();

        let totalItems = 0;
        let totalPrice = 0;

        cart.forEach(item => {
            totalItems += Number(item.quantity);
            totalPrice += Number(item.price) * Number(item.quantity);

            const row = document.createElement("div");
            row.className = "cart-item";

            if (item.image) {
                const image = document.createElement("img");

                image.src = item.image;
                image.alt = item.name;

                row.appendChild(image);
            }

            const details = document.createElement("div");
            details.className = "cart-item-details";

            const name = document.createElement("h3");
            name.textContent = item.name;

            const price = document.createElement("p");

            price.textContent =
                "₹" + Number(item.price).toLocaleString("en-IN");

            const quantity = document.createElement("div");
            quantity.className = "cart-quantity";

            const decrease = document.createElement("button");
            decrease.type = "button";
            decrease.textContent = "−";
            decrease.setAttribute("aria-label", "Decrease quantity");

            const quantityText = document.createElement("span");
            quantityText.textContent = item.quantity;

            const increase = document.createElement("button");
            increase.type = "button";
            increase.textContent = "+";
            increase.setAttribute("aria-label", "Increase quantity");

            const remove = document.createElement("button");
            remove.type = "button";
            remove.className = "remove-cart-item";
            remove.textContent = "Remove";

            decrease.addEventListener("click", function () {
                changeQuantity(item.id, -1);
            });

            increase.addEventListener("click", function () {
                changeQuantity(item.id, 1);
            });

            remove.addEventListener("click", function () {
                const updatedCart = getCart().filter(
                    product => product.id !== item.id
                );

                saveCart(updatedCart);

                renderCart();
                updateCartCount();
                updateAddToCartButtons();
            });

            quantity.append(decrease, quantityText, increase);
            details.append(name, price, quantity, remove);

            row.appendChild(details);
            cartItemsContainer.appendChild(row);
        });

        const emptyMessage = document.querySelector("#empty-cart-message");
        const itemsCount = document.querySelector("#cart-total-items");
        const totalElement = document.querySelector("#cart-total-price");
        const checkoutButton = document.querySelector("#checkout-btn");

        if (emptyMessage) {
            emptyMessage.hidden = cart.length > 0;
        }

        if (itemsCount) {
            itemsCount.textContent = totalItems;
        }

        if (totalElement) {
            totalElement.textContent =
                "₹" + totalPrice.toLocaleString("en-IN");
        }

        if (checkoutButton) {
            checkoutButton.disabled = cart.length === 0;
        }
    }

    function changeQuantity(id, change) {
        const cart = getCart();

        const product = cart.find(item => item.id === id);

        if (!product) return;

        product.quantity = Number(product.quantity) + change;

        const updatedCart = cart.filter(item => item.quantity > 0);

        saveCart(updatedCart);

        renderCart();
        updateCartCount();
        updateAddToCartButtons();
    }

    const checkoutButton = document.querySelector("#checkout-btn");

    if (checkoutButton) {
        checkoutButton.addEventListener("click", function () {
            if (getCart().length > 0) {
                window.location.href = "checkout.html";
            }
        });
    }


    // =========================================
    // 7. CHECKOUT PAGE
    // =========================================

    const checkoutForm = document.querySelector("#checkout-form");

    function renderCheckout() {
        const checkoutItems = document.querySelector("#checkout-items");
        const checkoutTotal = document.querySelector("#checkout-total");

        if (!checkoutItems || !checkoutTotal) return;

        const cart = getCart();

        checkoutItems.replaceChildren();

        let total = 0;

        if (cart.length === 0) {
            checkoutItems.textContent = "Your cart is empty.";
            checkoutTotal.textContent = "₹0";

            if (checkoutForm) {
                const submitButton = checkoutForm.querySelector(
                    'button[type="submit"]'
                );

                if (submitButton) {
                    submitButton.disabled = true;
                }
            }

            return;
        }

        cart.forEach(item => {
            const itemTotal = Number(item.price) * Number(item.quantity);

            total += itemTotal;

            const row = document.createElement("p");

            row.textContent =
                `${item.name} × ${item.quantity} — ₹${itemTotal.toLocaleString("en-IN")}`;

            checkoutItems.appendChild(row);
        });

        checkoutTotal.textContent =
            "₹" + total.toLocaleString("en-IN");
    }

    if (checkoutForm) {
        renderCheckout();

        checkoutForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const cart = getCart();

            if (cart.length === 0) {
                showToast("Your cart is empty. Please add a product first.", { type: "error" });
                return;
            }

            const nameField = document.querySelector("#customer-name");
            const emailField = document.querySelector("#customer-email");
            const phoneField = document.querySelector("#customer-phone");
            const addressField = document.querySelector("#customer-address");

            if (!nameField || !emailField || !phoneField || !addressField) {
                showToast("Customer detail fields are missing on this page.", { type: "error" });
                return;
            }

            const customerName = nameField.value.trim();
            const customerEmail = emailField.value.trim();
            const customerPhone = phoneField.value.trim();
            const customerAddress = addressField.value.trim();

            const order = {
                id: "DL" + Date.now().toString().slice(-8),
                customer: customerName,
                email: customerEmail,
                phone: customerPhone,
                address: customerAddress,
                items: cart,
                total: cart.reduce(
                    (sum, item) =>
                        sum + Number(item.price) * Number(item.quantity),
                    0
                ),
                date: new Date().toLocaleString()
            };

            localStorage.setItem(
                "drishyaLuxeLastOrder",
                JSON.stringify(order)
            );

            localStorage.removeItem(CART_KEY);

            window.location.href = "order-success.html";
        });
    }


    // =========================================
    // 8. WISHLIST
    // =========================================

    function updateWishlistButtons() {
        const wishlist = getWishlist();

        document.querySelectorAll(".wishlist-btn").forEach(button => {
            const card = button.closest(".product-card");

            if (!card) return;

            const isSaved = wishlist.some(
                item => item.id === card.dataset.productId
            );

            button.classList.toggle("is-wishlisted", isSaved);

            button.setAttribute(
                "aria-label",
                isSaved ? "Remove from wishlist" : "Add to wishlist"
            );

            button.setAttribute("aria-pressed", String(isSaved));

            const heart = button.querySelector("i");

            if (heart) {
                heart.classList.toggle("fa-solid", isSaved);
                heart.classList.toggle("fa-regular", !isSaved);
            }
        });
    }

    const wishlistContainer = document.querySelector("#wishlist-items");
    const wishlistEmpty = document.querySelector("#wishlist-empty");

    function renderWishlist() {
        if (!wishlistContainer) return;

        const wishlist = getWishlist();

        wishlistContainer.replaceChildren();

        wishlist.forEach(item => {
            const card = document.createElement("div");
            card.className = "wishlist-card";

            if (item.image) {
                const image = document.createElement("img");

                image.src = item.image;
                image.alt = item.name;

                card.appendChild(image);
            }

            const name = document.createElement("h3");
            name.textContent = item.name;

            const price = document.createElement("p");

            price.textContent =
                "₹" + Number(item.price).toLocaleString("en-IN");

            const addButton = document.createElement("button");

            addButton.type = "button";
            addButton.textContent = "Add to Cart";

            addButton.addEventListener("click", function () {
                addProductToCart(item);
                addButton.textContent = "Added to Cart ✓";
            });

            const removeButton = document.createElement("button");

            removeButton.type = "button";
            removeButton.className = "remove-wishlist";
            removeButton.textContent = "Remove";

            removeButton.addEventListener("click", function () {
                const updatedWishlist = getWishlist().filter(
                    product => product.id !== item.id
                );

                saveWishlist(updatedWishlist);

                updateWishlistCount();
                updateWishlistButtons();
                renderWishlist();
            });

            card.append(name, price, addButton, removeButton);

            wishlistContainer.appendChild(card);
        });

        if (wishlistEmpty) {
            wishlistEmpty.hidden = wishlist.length > 0;
        }
    }

    document.querySelectorAll(".wishlist-btn").forEach(button => {
        button.addEventListener("click", function () {
            const card = button.closest(".product-card");

            if (!card) return;

            const heading = card.querySelector("h3");
            const image = card.querySelector("img");

            const id = card.dataset.productId;
            const price = Number(card.dataset.price);

            if (
                !id ||
                !heading ||
                card.dataset.price === undefined ||
                !Number.isFinite(price)
            ) {
                showToast("This product is missing its ID or price.", { type: "error" });
                return;
            }

            let wishlist = getWishlist();

            const alreadySaved = wishlist.some(item => item.id === id);

            if (alreadySaved) {
                wishlist = wishlist.filter(item => item.id !== id);
                showToast("Removed from wishlist", { type: "wishlist" });
            } else {
                showToast(`"${heading.textContent.trim()}" added to wishlist`, {
                    type: "wishlist",
                    linkHref: "wishlist.html",
                    linkText: "View"
                });
                wishlist.push({
                    id: id,
                    name: heading.textContent.trim(),
                    price: price,
                    image: image ? image.src : ""
                });
            }

            saveWishlist(wishlist);

            updateWishlistCount();
            updateWishlistButtons();
            renderWishlist();

            if (!alreadySaved) {
                playAnimation([button], "heart-pop");
            }
            playAnimation(document.querySelectorAll("#wishlist-count"), "bump");
        });
    });


    // =========================================
    // 9. INITIALIZE ALL FEATURES
    // =========================================

    updateProducts();

    updateCartCount();
    updateAddToCartButtons();

    updateWishlistCount();
    updateWishlistButtons();

    renderCart();
    renderWishlist();

});