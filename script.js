document.addEventListener('DOMContentLoaded', () => {
    // Highlight active nav link
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath.split('/').pop() || 
            (currentPath.endsWith('/') && link.getAttribute('href') === 'index.html')) {
            link.classList.add('active');
        }
    });

    // Initialize Cart UI
    injectCartUI();
    updateCartBadge();
});

// Cart State
let cart = JSON.parse(localStorage.getItem('medical_clinic_cart')) || [];

function injectCartUI() {
    // Create Floating Button
    const floatBtn = document.createElement('div');
    floatBtn.className = 'cart-floating-btn';
    floatBtn.innerHTML = `
        <i class="fas fa-shopping-cart"></i>
        <span class="cart-badge" id="cartBadge">0</span>
    `;
    floatBtn.onclick = toggleCart;
    document.body.appendChild(floatBtn);

    // Create Sidebar
    const sidebar = document.createElement('div');
    sidebar.className = 'cart-sidebar';
    sidebar.id = 'cartSidebar';
    sidebar.innerHTML = `
        <div class="cart-header">
            <h3>Your Prescription Bag</h3>
            <i class="fas fa-times close-cart" onclick="toggleCart()"></i>
        </div>
        <div class="cart-items" id="cartItems">
            <!-- Items will be injected here -->
        </div>
        <div class="cart-footer">
            <div class="cart-total">
                <span>Total:</span>
                <span id="cartTotal">₹0.00</span>
            </div>
            <button class="checkout-btn" onclick="checkout()">Proceed to Checkout</button>
        </div>
    `;
    document.body.appendChild(sidebar);

    // Create Overlay
    const overlay = document.createElement('div');
    overlay.className = 'cart-overlay';
    overlay.id = 'cartOverlay';
    overlay.onclick = toggleCart;
    document.body.appendChild(overlay);

    renderCart();
}

function toggleCart() {
    document.getElementById('cartSidebar').classList.toggle('open');
    document.getElementById('cartOverlay').classList.toggle('open');
}

function addToCart(name, price) {
    cart.push({ name, price, id: Date.now() });
    saveCart();
    renderCart();
    updateCartBadge();
    
    // Optional: Show a small toast/feedback
    if (!document.getElementById('cartSidebar').classList.contains('open')) {
        // Just bounce the cart button
        const btn = document.querySelector('.cart-floating-btn');
        btn.style.transform = 'scale(1.2)';
        setTimeout(() => btn.style.transform = 'scale(1)', 200);
    }
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderCart();
    updateCartBadge();
}

function saveCart() {
    localStorage.setItem('medical_clinic_cart', JSON.stringify(cart));
}

function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (badge) badge.innerText = cart.length;
}

function renderCart() {
    const container = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); margin-top: 3rem;">
                <i class="fas fa-shopping-basket" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                <p>Your bag is empty.</p>
            </div>
        `;
        totalEl.innerText = '₹0.00';
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h5>${item.name}</h5>
                <p>₹${item.price.toFixed(2)}</p>
            </div>
            <i class="fas fa-trash remove-item" onclick="removeFromCart(${item.id})"></i>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    totalEl.innerText = `₹${total.toFixed(2)}`;
}

function checkout() {
    if (cart.length === 0) return;
    
    alert(`Thank you for your order!\nTotal: ₹${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}\n\nOur pharmacy team will verify your prescription if required and contact you for delivery.`);
    cart = [];
    saveCart();
    renderCart();
    updateCartBadge();
    toggleCart();
}

// Pharmacy Search and Filter Logic
function filterMedicines() {
    const input = document.getElementById('medicineSearch').value.toLowerCase();
    const cards = document.querySelectorAll('.medicine-card');
    
    cards.forEach(card => {
        const name = card.querySelector('h4').textContent.toLowerCase();
        const category = card.querySelector('.medicine-category').textContent.toLowerCase();
        const desc = card.querySelector('.medicine-desc').textContent.toLowerCase();
        
        if (name.includes(input) || category.includes(input) || desc.includes(input)) {
            card.style.display = 'flex';
            card.style.animation = 'fadeIn 0.4s ease-out';
        } else {
            card.style.display = 'none';
        }
    });
}

function filterByCategory(category, btn) {
    // Update active button
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const cards = document.querySelectorAll('.medicine-card');
    
    cards.forEach(card => {
        const cardCategory = card.querySelector('.medicine-category').textContent;
        
        if (category === 'All Products' || cardCategory === category) {
            card.style.display = 'flex';
            card.style.animation = 'fadeIn 0.4s ease-out';
        } else {
            card.style.display = 'none';
        }
    });

    // Clear search input when filtering by category
    const searchInput = document.getElementById('medicineSearch');
    if (searchInput) searchInput.value = '';
}

function submitForm(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    console.log('Form Submitted:', data);
    
    // Show success message with premium look
    const form = event.target;
    
    form.innerHTML = `
        <div style="text-align: center; padding: 3rem 0; animation: fadeIn 0.5s ease-out;">
            <div style="font-size: 4rem; color: var(--secondary); margin-bottom: 1.5rem;">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3 style="font-size: 1.5rem; margin-bottom: 1rem;">Booking Successful!</h3>
            <p style="color: var(--text-muted); margin-bottom: 2rem;">Thank you, ${data.name}. We've received your request and will contact you shortly at ${data.email}.</p>
            <button onclick="location.reload()" class="cta-button">Make Another Booking</button>
        </div>
    `;
}

// Add animation keyframes via JS
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);
