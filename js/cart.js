const CART_KEY = "amazon_clone_cart";
const ORDER_KEY = "amazon_clone_last_order";

function readCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
        return [];
    }
}

function saveCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    updateCartCount();
}

function formatPrice(value) {
    return `Rs. ${Number(value).toLocaleString("en-IN")}`;
}

function getCartCount() {
    return readCart().reduce((sum, item) => sum + item.quantity, 0);
}

function updateCartCount() {
    const count = getCartCount();
    document.querySelectorAll("[data-cart-count]").forEach((node) => {
        node.textContent = count;
    });
}

function showToast(message) {
    const toast = document.getElementById("cartToast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => toast.classList.remove("show"), 1800);
}

function addToCart(product) {
    const cart = readCart();
    const existing = cart.find((item) => item.id === product.id);

    if (existing) existing.quantity += 1;
    else cart.push({ ...product, quantity: 1 });

    saveCart(cart);
    showToast(`${product.name} added to cart`);
}

function bindAddToCartButtons() {
    document.querySelectorAll(".add-cart-btn").forEach((button) => {
        button.addEventListener("click", () => {
            addToCart({
                id: button.dataset.id,
                name: button.dataset.name,
                category: button.dataset.category,
                description: button.dataset.description,
                price: Number(button.dataset.price),
                artClass: button.dataset.artClass,
                artIcon: button.dataset.artIcon,
                badge: button.dataset.badge,
            });
        });
    });
}

function renderCartPage() {
    const cartContainer = document.getElementById("cartItems");
    if (!cartContainer) return;

    const cart = readCart();
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = cart.length ? 40 : 0;
    const total = subtotal + shipping;

    if (!cart.length) {
        cartContainer.innerHTML = `
            <div class="empty-state">
                <h2>Your Amazon cart is empty</h2>
                <p>Add products from Mobiles, Electronics or Fashion to continue.</p>
                <a class="primary-button" href="clone.html">Continue shopping</a>
            </div>
        `;
    } else {
        cartContainer.innerHTML = cart.map((item) => `
            <article class="cart-item">
                <div class="cart-art ${item.artClass}">${item.artIcon}</div>
                <div>
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <div class="cart-meta">
                        <div class="qty-control">
                            <button type="button" data-action="decrease" data-id="${item.id}">-</button>
                            <span>${item.quantity}</span>
                            <button type="button" data-action="increase" data-id="${item.id}">+</button>
                        </div>
                        <button type="button" class="remove-btn" data-action="remove" data-id="${item.id}">Remove</button>
                    </div>
                </div>
                <div class="item-price">${formatPrice(item.price * item.quantity)}</div>
            </article>
        `).join("");
    }

    const subtotalNode = document.getElementById("cartSubtotal");
    const shippingNode = document.getElementById("cartShipping");
    const totalNode = document.getElementById("cartTotal");
    const checkoutButton = document.getElementById("goCheckout");

    if (subtotalNode) subtotalNode.textContent = formatPrice(subtotal);
    if (shippingNode) shippingNode.textContent = formatPrice(shipping);
    if (totalNode) totalNode.textContent = formatPrice(total);
    if (checkoutButton) checkoutButton.style.display = cart.length ? "inline-block" : "none";

    cartContainer.querySelectorAll("[data-action]").forEach((button) => {
        button.addEventListener("click", () => {
            const nextCart = readCart().map((item) => ({ ...item }));
            const target = nextCart.find((item) => item.id === button.dataset.id);
            if (!target) return;

            if (button.dataset.action === "increase") target.quantity += 1;
            if (button.dataset.action === "decrease") target.quantity = Math.max(1, target.quantity - 1);
            if (button.dataset.action === "remove") {
                saveCart(nextCart.filter((item) => item.id !== button.dataset.id));
                renderCartPage();
                return;
            }

            saveCart(nextCart);
            renderCartPage();
        });
    });
}

function renderCheckoutPage() {
    const checkoutItems = document.getElementById("checkoutItems");
    if (!checkoutItems) return;

    const cart = readCart();
    if (!cart.length) {
        window.location.href = "cart.html";
        return;
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = 40;
    const total = subtotal + shipping;

    checkoutItems.innerHTML = cart.map((item) => `
        <div class="summary-row">
            <span>${item.name} x ${item.quantity}</span>
            <strong>${formatPrice(item.price * item.quantity)}</strong>
        </div>
    `).join("");

    document.getElementById("checkoutSubtotal").textContent = formatPrice(subtotal);
    document.getElementById("checkoutShipping").textContent = formatPrice(shipping);
    document.getElementById("checkoutTotal").textContent = formatPrice(total);

    const form = document.getElementById("checkoutForm");
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const order = {
            orderId: `AMZ${Date.now().toString().slice(-8)}`,
            items: cart,
            subtotal,
            shipping,
            total,
            payment: "Cash on Delivery",
            address: {
                fullName: formData.get("fullName"),
                phone: formData.get("phone"),
                addressLine: formData.get("addressLine"),
                city: formData.get("city"),
                state: formData.get("state"),
                pincode: formData.get("pincode"),
            },
        };

        localStorage.setItem(ORDER_KEY, JSON.stringify(order));
        localStorage.removeItem(CART_KEY);
        window.location.href = "order-success.html";
    });
}

function renderSuccessPage() {
    const orderNode = document.getElementById("orderSuccessDetails");
    if (!orderNode) return;

    const raw = localStorage.getItem(ORDER_KEY);
    if (!raw) {
        window.location.href = "clone.html";
        return;
    }

    const order = JSON.parse(raw);
    orderNode.innerHTML = `
        <h3>Order details</h3>
        <div class="summary-row"><span>Order ID</span><strong>${order.orderId}</strong></div>
        <div class="summary-row"><span>Payment method</span><strong>${order.payment}</strong></div>
        <div class="summary-row"><span>Total paid</span><strong>${formatPrice(order.total)}</strong></div>
        <div class="summary-row"><span>Deliver to</span><strong>${order.address.fullName}</strong></div>
        <p>${order.address.addressLine}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}<br>Phone: ${order.address.phone}</p>
    `;
}

document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    bindAddToCartButtons();
    renderCartPage();
    renderCheckoutPage();
    renderSuccessPage();
});
