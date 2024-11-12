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
            // אם העגלה ריקה, הצגת הודעה רלוונטית
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20.12 6.12L3 6l2.67 10.68a2 2 0 0 0 2 1.32h8.66a2 2 0 0 0 2-1.32L20.12 6.12z"/>
                    </svg>
                    <p>Your cart is empty</p>
                </div>
            `;
            if (cartTotal) {
                cartTotal.innerHTML = `
                    <span>Total</span>
                    <span>$0.00</span>
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

            // יצירת פריטים לעגלה
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
                        <p>Price: $${itemTotal.toFixed(2)}</p>
                    </div>
                </div>
            `;
        });

        cartItems.innerHTML = html;

        // עדכון הסכום הכולל
        if (cartTotal) {
            cartTotal.innerHTML = `
                <span>Total</span>
                <span>$${total.toFixed(2)}</span>
            `;
        }
    },

    // פונקציה להסרת פריט מהעגלה
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
                // הצגת הודעה על הסרת הפריט
                const notification = document.createElement('div');
                notification.className = 'cart-notification';
                notification.textContent = 'Item removed from cart';
                document.body.appendChild(notification);
                
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

    // טעינת העגלה עבור המשתמש
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
    // טעינת ה-Header מהקובץ header.html
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

    // אתחול פונקציות ה-Header
    function initializeHeader() {
        updateAuthButton();
        loadAdminButtonIfNeeded();
        loadPersonalAreaButtonIfNeeded();
        initializeEventListeners();
        updateGreetingMessage();
        window.CartUtilities.loadCart();    
    }

    // עדכון טקסט הכפתור התחברות/התנתקות
    function updateAuthButton() {
        const authButton = document.getElementById('authButton');
        if (sessionStorage.getItem('isLoggedIn') === "true") {
            authButton.textContent = 'Logout';
        } else {
            authButton.textContent = 'Login/Register';
        }
    }

    // הצגת כפתור האדמין אם המשתמש הוא אדמין
    function loadAdminButtonIfNeeded() {
        if (sessionStorage.getItem('isLoggedIn') === "true" && 
            sessionStorage.getItem('isAdmin') === "true") {
            const navLinks = document.querySelector(".nav-links");
            if (!navLinks) return;
    
            if (!document.querySelector(".admin-link")) {
                const adminItem = document.createElement("li");
                adminItem.classList.add("menu-item", "admin-link");
                adminItem.innerHTML = '<a href="#" class="admin-button">Admin</a>';
                navLinks.appendChild(adminItem);
                
                // לחיבור כפתור ה-Admin לפונקציה navigateToAdmin
                const adminButton = document.querySelector('.admin-button');
                if (adminButton) {
                    adminButton.addEventListener('click', function(event) {
                        event.preventDefault();
                        navigateToAdmin();
                    });
                }
            }
        }
    }
    

    // פונקציה למניעת גישה לעמוד האדמין אם המשתמש אינו מורשה
    function navigateToAdmin() {
        if (sessionStorage.getItem("isLoggedIn") === "true" && sessionStorage.getItem("isAdmin") === "true") {
            // משתמש מורשה - מעבר לעמוד האדמין
            window.location.href = "/admin.html";
        } else {
            // משתמש לא מורשה - הצגת הודעה וניווט לעמוד הבית
            alert("Access denied: Admins only.");
            window.location.href = "/homepage.html";
        }
    }
    

    // הצגת כפתור אזור אישי אם המשתמש מחובר
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

    // עדכון הודעת ברכה למשתמש
    function updateGreetingMessage() {
        const greetingMessage = document.getElementById("greetingMessage");
        if (sessionStorage.getItem("isLoggedIn") === "true") {
            const userFullName = sessionStorage.getItem("fullName");
            greetingMessage.textContent = `Hello, ${userFullName}`;
        } else {
            greetingMessage.textContent = '';
        }
    }

    // אתחול כל האירועים הדרושים ב-Header
    function initializeEventListeners() {
        const modal = document.getElementById("loginModal");
        const authButton = document.getElementById("authButton");
        const closeModal = document.querySelector(".close");
        const loginForm = document.getElementById("loginFormElement");
        const cartToggle = document.getElementById('cartToggle');
        const cartDropdown = document.getElementById('cartDropdown');
        const closeCart = document.getElementById('closeCart');

        // טיפול בכפתור התחברות/התנתקות
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

        // טיפול במודל התחברות
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

    // הפעלת פונקציה לטעינת קובץ admin.js אם המשתמש בעמוד האדמין
    const adminButton = document.querySelector('.admin-button');
    if (adminButton) {
        adminButton.addEventListener('click', function(event) {
            event.preventDefault();
            navigateToAdmin();
        });
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

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.container input[type="text"]');
    const searchButton = document.querySelector('.container .search');

    // טיפול בלחיצה על כפתור החיפוש
    searchButton.addEventListener('click', function() {
        handleSearch();
    });

    // טיפול בלחיצה על Enter
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // חיפוש אוטומטי בזמן הקלדה עם השהייה
    let debounceTimer;
    searchInput.addEventListener('input', function(e) {
        clearTimeout(debounceTimer);
        const searchTerm = e.target.value.trim();
        
        if (searchTerm.length < 2) return;

        debounceTimer = setTimeout(async () => {
            try {
                const response = await fetch(`/api/shoes/filter?name=${encodeURIComponent(searchTerm)}`);
                const shoes = await response.json();
                
                // מציג עד 5 תוצאות בהשלמה האוטומטית
                displayAutoComplete(shoes.slice(0, 5));
            } catch (error) {
                console.error('Search error:', error);
            }
        }, 300);
    });

    function handleSearch() {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            // משתמש באותו נתיב שמשמש לסינון קטגוריות
            window.location.href = `/results.html?name=${encodeURIComponent(searchTerm)}`;
        }
    }

    function displayAutoComplete(shoes) {
        let resultsDiv = document.querySelector('.search-results');
        if (!resultsDiv) {
            resultsDiv = document.createElement('div');
            resultsDiv.className = 'search-results';
            searchInput.parentNode.appendChild(resultsDiv);
        }

        if (shoes.length === 0) {
            resultsDiv.style.display = 'none';
            return;
        }

        const html = shoes.map(shoe => `
            <div class="search-result-item" onclick="window.location.href='/product.html?id=${shoe._id}'">
                <div class="search-result-image">
                    ${shoe.images && shoe.images[0] ? 
                        `<img src="${shoe.images[0]}" alt="${shoe.name}">` :
                        '<div class="no-image"></div>'
                    }
                </div>
                <div class="search-result-info">
                    <div class="search-result-name">${shoe.name}</div>
                    <div class="search-result-price">$${shoe.price.toFixed(2)}</div>
                </div>
            </div>
        `).join('');

        resultsDiv.innerHTML = html;
        resultsDiv.style.display = 'block';
    }

    // סגירת תוצאות בלחיצה מחוץ לאזור החיפוש
    document.addEventListener('click', function(e) {
        const resultsDiv = document.querySelector('.search-results');
        if (resultsDiv && !searchInput.parentNode.contains(e.target)) {
            resultsDiv.style.display = 'none';
        }
    });
});
