// results.js
import ProductComponent from './productComponent.js';


function initializeHeader() {
    const authButton = document.getElementById('authButton');
    if (authButton) {
        if (sessionStorage.getItem('isLoggedIn') === "true") {
            authButton.textContent = 'Logout';
        } else {
            authButton.textContent = 'Login/Register';
        }

        authButton.addEventListener('click', function(event) {
            event.preventDefault();
            if (sessionStorage.getItem('isLoggedIn') === "true") {
                sessionStorage.removeItem('isLoggedIn');
                sessionStorage.removeItem('isAdmin');
                sessionStorage.removeItem('email');
                window.location.reload();
            } else {
                document.getElementById('loginModal').style.display = 'flex';
            }
        });
    }

    // Admin Button functionality
    if (sessionStorage.getItem('isLoggedIn') === "true" && 
        sessionStorage.getItem('isAdmin') === "true") {
        const navLinks = document.querySelector(".nav-links");
        if (navLinks && !document.querySelector(".admin-link")) {
            const adminItem = document.createElement("li");
            adminItem.classList.add("menu-item", "admin-link");
            adminItem.innerHTML = `<a href="admin.html" class="admin-button">Admin</a>`;
            navLinks.appendChild(adminItem);
        }
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
        
        // Log initial filters
        console.log('Initial filters:', this.filters);
    }

    async init() {
        try {
            // Initialize product component
            await ProductComponent.init();
            
            // Load content
            await this.loadContent('header.html', 'header-container');
            await this.loadContent('footer.html', 'footer-container');
            
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
            
            // עדכון הלוגיקה לקטגוריות החדשות
            if (this.filters.category) {
                // בדיקה אם זו אחת מהקטגוריות הראשיות
                if (['Men', 'Women', 'Boys', 'Girls'].includes(this.filters.category)) {
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
            
            // הצגת התוצאות
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
            // Load brands based on category
            const brandsUrl = this.filters.category ? 
                `/api/shoes/brands?category=${this.filters.category}` : 
                '/api/shoes/brands';
            
            const brandsResponse = await fetch(brandsUrl);
            const brands = await brandsResponse.json();
            
            // Update brand filters
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
            
            // Setup size filters
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

    async loadContent(url, containerId) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.text();
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = data;
            }
            if (containerId === 'header-container') {
                initializeHeader();
            }
        } catch (error) {
            console.error(`Error loading ${url}:`, error);
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