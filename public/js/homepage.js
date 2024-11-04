import ProductComponent from './productComponent.js';

class HomePage {
    constructor() {
        this.init();
    }

    async init() {
        try {
            // אתחול ה-ProductComponent
            await ProductComponent.init();
            
            // טעינת ה-header וה-footer
            await this.loadContent('header.html', 'header-container', this.initializeHeader);
            await this.loadContent('footer.html', 'footer-container');
            
            // טעינת המוצרים
            await this.loadLatestProducts();
        } catch (error) {
            console.error('Error during initialization:', error);
        }
    }

    async loadContent(url, containerId, callback) {
        try {
            const response = await fetch(url);
            const data = await response.text();
            document.getElementById(containerId).innerHTML = data;
            if (callback) callback();
        } catch (error) {
            console.error(`Error loading ${url}:`, error);
        }
    }

    async loadLatestProducts() {
        try {
            const response = await fetch('/api/shoes/latest');
            if (!response.ok) {
                throw new Error('Failed to fetch latest products');
            }
            
            const products = await response.json();
            const productGrid = document.querySelector('.product-grid');
            
            if (!productGrid) {
                console.error('Product grid container not found');
                return;
            }

            // ניקוי הגריד הקיים
            productGrid.innerHTML = '';

            if (products && products.length > 0) {
                // יצירת הכרטיסים
                products.forEach(product => {
                    productGrid.innerHTML += ProductComponent.createProductCard(product);
                });

                // אתחול האינטראקציות
                ProductComponent.initializeProductCards();
            } else {
                productGrid.innerHTML = '<p class="no-results">No products available at the moment.</p>';
            }
        } catch (error) {
            console.error('Error loading products:', error);
            const productGrid = document.querySelector('.product-grid');
            if (productGrid) {
                productGrid.innerHTML = '<p class="error-message">Error loading products. Please try again later.</p>';
            }
        }
    }

    initializeHeader() {
        updateAuthButton();
        loadAdminButtonIfNeeded();
        loadPersonalAreaButtonIfNeeded();
        initializeEventListeners();
    }
}
    function updateAuthButton() {
        const authButton = document.getElementById('authButton');
        if (sessionStorage.getItem('isLoggedIn') === "true") {
            authButton.textContent = 'Logout';
        } else {
            authButton.textContent = 'Login/Register';
        }
    }

    function loadAdminButtonIfNeeded() {
        if (sessionStorage.getItem('isLoggedIn') === "true" && sessionStorage.getItem('isAdmin') === "true") {
            addAdminButton();
        }
    }

    function addAdminButton() {
        const navLinks = document.querySelector(".nav-links");
        if (!document.querySelector(".admin-link")) {
            const adminItem = document.createElement("li");
            adminItem.classList.add("menu-item", "admin-link");
            adminItem.innerHTML = `<a href="admin.html" class="admin-button">Admin</a>`;
            navLinks.appendChild(adminItem);
        }
    }

    function loadPersonalAreaButtonIfNeeded() {
        if (sessionStorage.getItem('isLoggedIn') === "true") {
            addPersonalButton();
        }
    }

    function addPersonalButton() {
        const navLinks = document.querySelector(".nav-links");
        if (!document.querySelector(".personal-area-link")) {
            const personalAreaItem = document.createElement("li");
            personalAreaItem.classList.add("menu-item", "personal-area-link");
            personalAreaItem.innerHTML = `<a href="personalarea.html" class="personalarea-button">Personal Area</a>`;
            navLinks.appendChild(personalAreaItem);
        }
    }

    function initializeEventListeners() {
        // Modal functionality
        const modal = document.getElementById("loginModal");
        const loginLink = document.querySelector(".login-register a");
        const closeModal = document.querySelector(".close");

        if (modal) {
            modal.style.display = "none";
            
            if (loginLink) {
                loginLink.addEventListener("click", function(event) {
                    event.preventDefault();
                    modal.style.display = "flex";
                });
            }

            if (closeModal) {
                closeModal.addEventListener("click", function() {
                    modal.style.display = "none";
                });
            }

            window.addEventListener("click", function(event) {
                if (event.target === modal) {
                    modal.style.display = "none";
                }
            });
        }

        // Cart functionality
        const cartToggle = document.getElementById('cartToggle');
        const cartDropdown = document.getElementById('cartDropdown');
        const closeCart = document.getElementById('closeCart');

        if (cartToggle && cartDropdown) {
            cartToggle.addEventListener('click', function(e) {
                e.preventDefault();
                cartDropdown.classList.toggle('active');
            });

            if (closeCart) {
                closeCart.addEventListener('click', function() {
                    cartDropdown.classList.remove('active');
                });
            }

            document.addEventListener('click', function(e) {
                if (!cartDropdown.contains(e.target) && !cartToggle.contains(e.target)) {
                    cartDropdown.classList.remove('active');
                }
            });
        }

        const authButton = document.getElementById('authButton');
        if (authButton) {
            authButton.addEventListener('click', function(event) {
                event.preventDefault();
                if (sessionStorage.getItem('isLoggedIn') === "true") {
                    sessionStorage.removeItem('isLoggedIn');
                    sessionStorage.removeItem('isAdmin');
                    sessionStorage.removeItem('email');
                    updateAuthButton();
                    window.location.reload();
                } else {
                    modal.style.display = 'flex';
                }
            });
        }

        // Handle login form submission
        const loginForm = document.querySelector("#loginFormElement");
        if (loginForm) {
            loginForm.addEventListener("submit", async function(event) {
                event.preventDefault();

                const email = event.target.email.value;
                const password = event.target.password.value;

                try {
                    const response = await fetch('/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ email: email, password: password })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        sessionStorage.setItem("isLoggedIn", "true");
                        sessionStorage.setItem("email", email);

                        if (data.role === "admin") {
                            sessionStorage.setItem("isAdmin", "true");
                        } else {
                            sessionStorage.removeItem("isAdmin");
                        }

                        alert("התחברת בהצלחה!");
                        window.location.href = '/homepage.html';
                    } else {
                        alert(data.message);
                    }
                } catch (err) {
                    console.error("Error during login:", err);
                    alert("An error occurred while logging in.");
                }

                event.target.reset();
                modal.style.display = "none";
            });
        }
    }
    document.addEventListener('DOMContentLoaded', () => {
        new HomePage();
    });
    
    export default HomePage;