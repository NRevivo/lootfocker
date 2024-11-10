window.CartUtilities = {
    updateCartDisplay: function(cart) {
        const cartItems = document.querySelector('.cart-items');
        const cartCount = document.querySelector('.cart-count');
        const cartTotal = document.querySelector('.cart-total');
        
        if (!cartItems) return;

        // עדכון מספר הפריטים בעגלה
        if (cartCount) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }

        if (!cart || cart.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20.12 6.12L3 6l2.67 10.68a2 2 0 0 0 2 1.32h8.66a2 2 0 0 0 2-1.32L20.12 6.12z"/>
                    </svg>
                    <p>Your cart is empty</p>
                    <a href="#" class="start-shopping">Start Shopping</a>
                </div>
            `;
            if (cartTotal) {
                cartTotal.innerHTML = `
                    <span>Total</span>
                    <span>₪0.00</span>
                `;
            }
            return;
        }

        // עדכון תוכן העגלה
        let html = '';
        let total = 0;
        
        cart.forEach(item => {
            const shoe = item.shoeId;
            const itemTotal = shoe.price * item.quantity;
            total += itemTotal;

            html += `
                <div class="cart-item" data-item-id="${item._id}">
                    <div class="cart-item-image">
                        <img src="${shoe.images[0]}" alt="${shoe.name}">
                    </div>
                    <div class="cart-item-details">
                        <div class="cart-item-header">
                            <h4>${shoe.name}</h4>
                            <button class="remove-item" onclick="CartUtilities.removeItem('${item._id}')">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M18 6L6 18M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>
                        <p>Size: ${item.size}</p>
                        <p>Quantity: ${item.quantity}</p>
                        <p>Price: ₪${itemTotal.toFixed(2)}</p>
                    </div>
                </div>
            `;
        });

        cartItems.innerHTML = html;

        // עדכון הסכום הכולל
        if (cartTotal) {
            cartTotal.innerHTML = `
                <span>Total</span>
                <span>₪${total.toFixed(2)}</span>
            `;
        }
    },

    // פונקציה חדשה להסרת פריט
    removeItem: async function(itemId) {
        const userId = sessionStorage.getItem('userId');
        if (!userId) return;

        try {
            const response = await fetch(`/api/cart/${userId}/${itemId}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            
            if (data.success) {
                this.updateCartDisplay(data.cart);
                // הודעה למשתמש
                const notification = document.createElement('div');
                notification.className = 'cart-notification';
                notification.textContent = 'Item removed from cart';
                document.body.appendChild(notification);
                
                // הסרת ההודעה אחרי 2 שניות
                setTimeout(() => {
                    notification.remove();
                }, 2000);
            } else {
                alert('Error removing item from cart');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error removing item from cart');
        }
    },

    loadCart: async function() {
        const userId = sessionStorage.getItem('userId');
        if (!userId) {
            this.updateCartDisplay([]);
            return;
        }

        try {
            const response = await fetch(`/api/cart/${userId}`);
            const data = await response.json();
            
            if (data.success) {
                this.updateCartDisplay(data.cart);
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            this.updateCartDisplay([]);
        }
    }
};



document.addEventListener('DOMContentLoaded', async function() {
    // טוען את ה-Header מ-header.html ומוסיף אותו ל-document
    async function loadHeader() {
        try {
            const response = await fetch('header.html');
            if (!response.ok) throw new Error('Failed to load header');
            
            const headerHtml = await response.text();
            document.getElementById('header-container').innerHTML = headerHtml;
            initializeHeader();
            
            if (window.location.pathname.includes("admin.html")) {
                loadAdminScript();
            }
        } catch (error) {
            console.error('Error loading header:', error);
        }
    }

    // פונקציה לאתחול כל אירועי ה-Header והגדרות הכפתורים
    function initializeHeader() {
        updateAuthButton();
        loadAdminButtonIfNeeded();
        loadPersonalAreaButtonIfNeeded();
        initializeEventListeners();
        updateGreetingMessage();
        window.CartUtilities.loadCart();    }

    // עדכון כפתור ההתחברות/יציאה
    function updateAuthButton() {
        const authButton = document.getElementById('authButton');
        if (sessionStorage.getItem('isLoggedIn') === "true") {
            authButton.textContent = 'Logout';
        } else {
            authButton.textContent = 'Login/Register';
        }
    }

    // טעינת כפתור האדמין אם המשתמש הוא אדמין
    function loadAdminButtonIfNeeded() {
        if (sessionStorage.getItem('isLoggedIn') === "true" && 
            sessionStorage.getItem('isAdmin') === "true") {
            const navLinks = document.querySelector(".nav-links");
            if (!navLinks) return;

            if (!document.querySelector(".admin-link")) {
                const adminItem = document.createElement("li");
                adminItem.classList.add("menu-item", "admin-link");
                adminItem.innerHTML = '<a href="admin.html" class="admin-button">Admin</a>';
                navLinks.appendChild(adminItem);
            }
        }
    }

    // טעינת כפתור האזור האישי אם המשתמש מחובר
    function loadPersonalAreaButtonIfNeeded() {
        if (sessionStorage.getItem('isLoggedIn') === "true") {
            const navLinks = document.querySelector(".nav-links");
            if (!document.querySelector(".personal-area-link")) {
                const personalAreaItem = document.createElement("li");
                personalAreaItem.classList.add("menu-item", "personal-area-link");
                personalAreaItem.innerHTML = '<a href="personalarea.html" class="personalarea-button">Personal Area</a>';
                navLinks.appendChild(personalAreaItem);
            }
        }
    }

    // עדכון הודעת ברכה
    function updateGreetingMessage() {
        const greetingMessage = document.getElementById("greetingMessage");
        if (sessionStorage.getItem("isLoggedIn") === "true") {
            const userFullName = sessionStorage.getItem("fullName");
            greetingMessage.textContent = `Hello, ${userFullName}`;
        } else {
            greetingMessage.textContent = '';
        }
    }

    // פונקציה לאתחול כל אירועי ההדר
    function initializeEventListeners() {
        // אתחול אלמנטים
        const modal = document.getElementById("loginModal");
        const authButton = document.getElementById("authButton");
        const closeModal = document.querySelector(".close");
        const loginForm = document.getElementById("loginFormElement");
        const cartToggle = document.getElementById('cartToggle');
        const cartDropdown = document.getElementById('cartDropdown');
        const closeCart = document.getElementById('closeCart');

        // טיפול בכפתור התחברות/יציאה
        if (authButton) {
            authButton.addEventListener('click', function(event) {
                event.preventDefault();
                if (sessionStorage.getItem('isLoggedIn') === "true") {
                    sessionStorage.removeItem('isLoggedIn');
                    sessionStorage.removeItem('isAdmin');
                    sessionStorage.removeItem('email');
                    sessionStorage.removeItem('fullName');
                    sessionStorage.removeItem('userId');
                    updateAuthButton();
                    updateGreetingMessage();
                    window.location.reload();
                } else {
                    modal.style.display = 'flex';
                }
            });
        }

        // טיפול בטופס התחברות
        if (loginForm) {
            loginForm.addEventListener("submit", async function(event) {
                event.preventDefault();
                const email = document.getElementById('loginEmail').value;
                const password = document.getElementById('loginPassword').value;

                try {
                    const response = await fetch('/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ email, password })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        sessionStorage.setItem("isLoggedIn", "true");
                        sessionStorage.setItem("email", email);
                        sessionStorage.setItem("fullName", data.fullName);
                        
                        if (data.role === "admin") {
                            sessionStorage.setItem("isAdmin", "true");
                        }
                        
                        sessionStorage.setItem("userId", data.userId);
                        alert("התחברת בהצלחה!");
                        window.location.reload();
                    } else {
                        alert(data.message);
                    }
                } catch (err) {
                    console.error("Error during login:", err);
                    alert("An error occurred while logging in.");
                }

                loginForm.reset();
                modal.style.display = "none";
            });
        }

        // טיפול במודל
        if (closeModal) {
            closeModal.addEventListener("click", () => modal.style.display = "none");
        }

        window.addEventListener("click", function(event) {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });

        // טיפול בעגלת קניות
        if (cartToggle && cartDropdown) {
            cartToggle.addEventListener('click', function(e) {
                e.preventDefault();
                cartDropdown.classList.toggle('active');
            });

            if (closeCart) {
                closeCart.addEventListener('click', () => 
                    cartDropdown.classList.remove('active')
                );
            }

            document.addEventListener('click', function(e) {
                if (!cartDropdown.contains(e.target) && !cartToggle.contains(e.target)) {
                    cartDropdown.classList.remove('active');
                }
            });
        }
    }
  
    // פונקציה לטעינת admin.js
    function loadAdminScript() {
        const script = document.createElement('script');
        script.src = 'js/admin.js';
        script.defer = true;
        document.body.appendChild(script);
    }

    // קריאה לפונקציה לטעינת ה-Header
    await loadHeader();
});