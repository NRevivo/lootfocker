// results.js
import ProductComponent from './productComponent.js';

// Helper function to load content with callback support
async function loadContent(url, containerId, callback) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.text();
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = data;
            if (callback) callback();
        }
    } catch (error) {
        console.error(`Error loading ${url}:`, error);
    }
}

// Header initialization and related functions
function initializeHeader() {
    updateAuthButton();
    loadAdminButtonIfNeeded();
    loadPersonalAreaButtonIfNeeded();
    initializeEventListeners();
}

function updateAuthButton() {
    const authButton = document.getElementById('authButton');
    if (authButton) {
        if (sessionStorage.getItem('isLoggedIn') === "true") {
            authButton.textContent = 'Logout';
        } else {
            authButton.textContent = 'Login/Register';
        }
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

    // Auth Button functionality
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

// Main ResultsPage class
class ResultsPage {
    constructor() {
        this.urlParams = new URLSearchParams(window.location.search);
        this.filters = {
            category: this.urlParams.get('category') || '',
            brand: this.urlParams.get('brand') ? [this.urlParams.get('brand')] : [],
            sizes: [],
            minPrice: null,
            maxPrice: null
        };
        
        console.log('Initial filters:', this.filters);
    }

    async init() {
        try {
            // Initialize product component
            await ProductComponent.init();
            
            // Load content with proper initialization
            await loadContent('header.html', 'header-container', initializeHeader);
            await loadContent('footer.html', 'footer-container');
            
            // Initialize filters and load products
            await this.initializeFilters();
            await this.loadProducts();
            
            // Setup event listeners
            this.setupFilterListeners();
            this.updateBreadcrumbs();
            
            console.log('Page initialized successfully');
        } catch (error) {
            console.error('Error during initialization:', error);
        }
    }

    async loadProducts() {
        try {
            const params = new URLSearchParams();
            
            if (this.filters.category) {
                const mainCategories = ['Men', 'Women', 'Boy', 'Girl', 'Baby'];
                if (mainCategories.includes(this.filters.category)) {
                    params.append('category', this.filters.category);
                }
            }
            
            if (this.filters.brand.length) {
                params.append('brand', this.filters.brand.join(','));
            }
            
            if (this.filters.sizes.length) {
                params.append('sizes', this.filters.sizes.join(','));
            }
            
            if (this.filters.minPrice !== null) {
                params.append('minPrice', this.filters.minPrice);
            }
            
            if (this.filters.maxPrice !== null) {
                params.append('maxPrice', this.filters.maxPrice);
            }
            
            console.log('Fetching products with params:', params.toString());
            
            const response = await fetch(`/api/shoes/filter?${params.toString()}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const products = await response.json();
            console.log('Fetched products:', products);
            
            const container = document.querySelector('.products-grid');
            const resultsInfo = document.querySelector('.results-info');
            
            if (resultsInfo) {
                resultsInfo.textContent = `Showing ${products.length} results`;
            }
            
            if (!container) {
                console.error('Products grid container not found');
                return;
            }
            
            if (products.length === 0) {
                container.innerHTML = '<p class="no-results">No products found matching your criteria.</p>';
                return;
            }
            
            container.innerHTML = products
                .map(product => ProductComponent.createProductCard(product))
                .join('');
            
            ProductComponent.initializeProductCards();
            
        } catch (error) {
            console.error('Error loading products:', error);
            const container = document.querySelector('.products-grid');
            if (container) {
                container.innerHTML = '<p class="error-message">Error loading products. Please try again later.</p>';
            }
        }
    }

    async initializeFilters() {
        try {
            const brandsUrl = this.filters.category ? 
                `/api/shoes/brands?category=${this.filters.category}` : 
                '/api/shoes/brands';
            
            const brandsResponse = await fetch(brandsUrl);
            const brands = await brandsResponse.json();
            
            const brandsList = document.querySelector('.brands-list');
            if (brandsList) {
                brandsList.innerHTML = brands.map(brand => `
                    <div class="filter-option">
                        <input type="checkbox" 
                               id="brand-${brand}" 
                               value="${brand}"
                               ${this.filters.brand.includes(brand) ? 'checked' : ''}>
                        <label for="brand-${brand}">${brand}</label>
                    </div>
                `).join('');
            }
            
            const sizeOptions = document.querySelector('.size-options');
            if (sizeOptions) {
                const sizes = Array.from({ length: 13 }, (_, i) => i + 38); // Sizes 38-50
                sizeOptions.innerHTML = sizes.map(size => `
                    <div class="filter-option">
                        <input type="checkbox" 
                               id="size-${size}" 
                               value="${size}"
                               ${this.filters.sizes.includes(size) ? 'checked' : ''}>
                        <label for="size-${size}">${size}</label>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error initializing filters:', error);
        }
    }

    setupFilterListeners() {
        // Brand filter changes
        const brandsList = document.querySelector('.brands-list');
        if (brandsList) {
            brandsList.addEventListener('change', e => {
                if (e.target.type === 'checkbox') {
                    if (e.target.checked) {
                        this.filters.brand.push(e.target.value);
                    } else {
                        this.filters.brand = this.filters.brand
                            .filter(b => b !== e.target.value);
                    }
                    this.loadProducts();
                }
            });
        }

        // Size filter changes
        const sizeOptions = document.querySelector('.size-options');
        if (sizeOptions) {
            sizeOptions.addEventListener('change', e => {
                if (e.target.type === 'checkbox') {
                    const size = Number(e.target.value);
                    if (e.target.checked) {
                        this.filters.sizes.push(size);
                    } else {
                        this.filters.sizes = this.filters.sizes
                            .filter(s => s !== size);
                    }
                    this.loadProducts();
                }
            });
        }

        // Price range changes
        const priceFilter = document.querySelector('.price-filter');
        if (priceFilter) {
            const range = priceFilter.querySelector('input[type="range"]');
            if (range) {
                range.addEventListener('change', e => {
                    this.filters.maxPrice = Number(e.target.value);
                    this.loadProducts();
                });
            }
        }
    }

    updateBreadcrumbs() {
        const breadcrumbs = document.getElementById('breadcrumbs');
        if (breadcrumbs) {
            let html = '<a href="/">Home</a>';
            
            if (this.filters.category) {
                html += ` > <a href="/results.html?category=${this.filters.category}">${this.filters.category}</a>`;
            }
            
            if (this.filters.brand.length) {
                html += ` > ${this.filters.brand.join(', ')}`;
            }
            
            breadcrumbs.innerHTML = html;
        }
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing Results Page');
    const page = new ResultsPage();
    page.init().catch(error => {
        console.error('Error initializing page:', error);
    });
});

export default ResultsPage;