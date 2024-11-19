window.CartUtilities = {
    updateCartDisplay: function(cart) {
        const cartItems = document.querySelector('.cart-items');
        const cartCount = document.querySelector('.cart-count');
        const cartTotal = document.querySelector('.cart-total');
        
        if (!cartItems) return;

        // סינון פריטים שאינם קיימים במערכת
        const validCart = cart.filter(item => item.shoeId != null);

        // עדכון מספר הפריטים בעגלה
        if (cartCount) {
            const totalItems = validCart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }

        if (!validCart || validCart.length === 0) {
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
        
        validCart.forEach(item => {
            const shoe = item.shoeId;
            // בדיקה נוספת שהנעל קיימת
            if (!shoe) return;

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
                // סינון פריטים לא תקינים לפני הצגת העגלה
                const validCart = data.cart.filter(item => item.shoeId != null);
                
                // אם נמצאו פריטים לא תקינים, עדכן את העגלה בשרת
                if (validCart.length !== data.cart.length) {
                    const updateResponse = await fetch(`/api/cart/${userId}/clean`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ cart: validCart })
                    });
                    
                    if (!updateResponse.ok) {
                        console.error('Failed to clean cart on server');
                    }
                }
                
                this.updateCartDisplay(validCart);
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
        initializeSearch(); 
  
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
                    localStorage.clear(); 
                    updateAuthButton();
                    updateGreetingMessage();
                    window.location.reload();
                } else {
                    modal.style.display = 'flex';
                }
            });
        }

         // מאזין ללחיצה על כפתור ה-Checkout
        const checkoutButton = document.querySelector('.checkout-btn');
             if (checkoutButton) {
                 checkoutButton.addEventListener('click', function() {
                 window.location.href = 'checkout.html';
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



async function loadProductComponent() {
    // בדיקה אם הקומפוננטה כבר טעונה
    if (window.ProductComponent) {
        return window.ProductComponent;
    }

    // טעינת הסקריפט אם לא נטען
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = '/js/productComponent.js';
        script.type = 'module';  // חשוב! מכיוון שיש export בקובץ

        script.onload = async () => {
            try {
                // יבוא דינמי של המודול
                const module = await import('/js/productComponent.js');
                window.ProductComponent = module.default;
                resolve(window.ProductComponent);
            } catch (error) {
                reject(error);
            }
        };

        script.onerror = () => {
            reject(new Error('Failed to load ProductComponent'));
        };

        document.head.appendChild(script);
    });
}


// פונקציית החיפוש המעודכנת
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');

    if (!searchInput || !searchButton || !searchResults) {
        console.error('Search elements not found');
        return;
    }

    async function displayResults(products, query) {
        if (!Array.isArray(products) || products.length === 0) {
            searchResults.innerHTML = `
                <div class="no-results">
                    <p>No products found</p>
                </div>
            `;
            searchResults.style.display = 'block';
            return;
        }
    
        const limitedProducts = products.slice(0, 3);
        
        const html = limitedProducts.map(product => {
            const productName = product.name || '';
            const brandName = product.brand || '';
            const fullProductName = `${brandName} ${productName}`.trim();
            const price = product.price ? `$${product.price.toFixed(2)}` : 'Price not available';
            const imageUrl = product.images && product.images.length > 0 ? product.images[0] : '';
            const size = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'N/A';
    
            return `
                <div class="search-result-item" data-product-id="${product._id}">
                    <img src="${imageUrl}" alt="${fullProductName}" class="search-result-image">
                    <div class="search-result-details">
                        <div class="search-result-name" style="font-weight: bold; color: #333; margin-bottom: 5px;">
                            ${fullProductName}
                        </div>
                        <div class="search-result-info">
                            <div class="search-result-size">Size: ${size}</div>
                            <div class="search-result-price">${price}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    
        const viewAllButton = products.length > 3 ? `
            <div class="view-all-results" onclick="window.location.href='/results.html?searchQuery=${encodeURIComponent(query)}'">
                View all ${products.length} results
            </div>
        ` : '';
    
        searchResults.innerHTML = html + viewAllButton;
        searchResults.style.display = 'block';

        // הוספת מאזיני לחיצה לכל תוצאת חיפוש
        const searchResultItems = searchResults.querySelectorAll('.search-result-item');
        searchResultItems.forEach(item => {
            item.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                try {
                    const productId = this.dataset.productId;
                    const ProductComponent = await loadProductComponent();
                    
                    // אתחול ProductComponent אם צריך
                    if (ProductComponent.init) {
                        await ProductComponent.init();
                    }
                    
                    // פתיחת המודל
                    await ProductComponent.openProductModal(productId);
                } catch (error) {
                    console.error('Error handling product click:', error);
                }
            });
        });
    }

    let debounceTimer;
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        const query = searchInput.value.trim();
        
        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }

        debounceTimer = setTimeout(async () => {
            try {
                const response = await fetch(`/api/shoes/filter?searchQuery=${encodeURIComponent(query)}`);
                if (!response.ok) throw new Error('Search request failed');
                
                const products = await response.json();
                displayResults(products, query);
            } catch (error) {
                console.error('Search error:', error);
                searchResults.style.display = 'none';
            }
        }, 300);
    });

    // סגירת תוצאות בלחיצה מחוץ לאזור החיפוש
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
}

// הוספת הפונקציה לאובייקט החלון
window.initializeSearch = initializeSearch;


//  מניעת גישה לעמוד admin.html לאחר חזרה אחורה
document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
    const isAdmin = sessionStorage.getItem("isAdmin") === "true";

    // מאזין לאירוע חזרה אחורה (כמו כפתור חזרה בדפדפן)
    window.addEventListener("pageshow", function(event) {
        if (event.persisted) {
            // בדיקת הרשאות
            const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
            const isAdmin = sessionStorage.getItem("isAdmin") === "true";

            // אם המשתמש אינו מחובר או שאינו אדמין
            if (!isLoggedIn || !isAdmin) {
                alert("Session expired. Redirecting to homepage.");
                window.location.href = "/homepage.html";
            }
        }
    });
});
