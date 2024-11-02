// results.js
console.log('Results.js loaded successfully');
console.log("Script Loaded");


import ProductComponent from './productComponent.js';

class ResultsPage {
    constructor() {
        // Get initial filters from URL parameters
        this.urlParams = new URLSearchParams(window.location.search);
        this.filters = {
            category: this.urlParams.get('category') || '',
            brand: this.urlParams.get('brand') ? [this.urlParams.get('brand')] : [],
            sizes: [],
            minPrice: null,
            maxPrice: null
        };
    }

    async init() {
        // Initialize product component
        ProductComponent.init();
        
        // Load content and setup page
        await loadContent('header.html', 'header-container');
        await loadContent('footer.html', 'footer-container');
        
        await this.initializeFilters();
        await this.loadProducts();
        this.setupFilterListeners();
        this.updateBreadcrumbs();
    }

    updateBreadcrumbs() {
        const breadcrumbs = document.getElementById('breadcrumbs');
        let html = '<a href="/">Home</a>';
        
        if (this.filters.category) {
            html += ` > <a href="/results.html?category=${this.filters.category}">${this.filters.category}</a>`;
        }
        
        if (this.filters.brand.length) {
            html += ` > ${this.filters.brand.join(', ')}`;
        }
        
        breadcrumbs.innerHTML = html;
    }

    async initializeFilters() {
        try {
            // Load brands (filtered by category if exists)
            const brandsUrl = this.filters.category ? 
                `/api/shoes/brands?category=${this.filters.category}` : 
                '/api/shoes/brands';
            
            const brandsResponse = await fetch(brandsUrl);
            const brands = await brandsResponse.json();

            // Render brand filters
            const brandFilters = document.getElementById('brandFilters');
            brandFilters.innerHTML = brands.map(brand => `
                <div class="filter-option">
                    <input type="checkbox" 
                           id="brand-${brand}" 
                           value="${brand}"
                           ${this.filters.brand.includes(brand) ? 'checked' : ''}>
                    <label for="brand-${brand}">${brand}</label>
                </div>
            `).join('');

            // Setup size filters
            const sizes = Array.from({ length: 13 }, (_, i) => i + 38); // Sizes 38-50
            const sizeFilters = document.getElementById('sizeFilters');
            sizeFilters.innerHTML = sizes.map(size => `
                <div class="filter-option">
                    <input type="checkbox" id="size-${size}" value="${size}">
                    <label for="size-${size}">${size}</label>
                </div>
            `).join('');

        } catch (error) {
            console.error('Error initializing filters:', error);
        }
    }

    async loadProducts() {
    try {
        const params = new URLSearchParams();
        
        // הוספת הפילטרים לפרמטרים
        if (this.filters.category) {
            params.append('category', this.filters.category);
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

        // טעינת המוצרים המסוננים
        const response = await fetch(`/api/shoes/filter?${params.toString()}`);
        const products = await response.json();

        // עדכון מספר התוצאות
        document.querySelector('.results-info').textContent = 
            `Showing ${products.length} results`;

        // רינדור המוצרים באמצעות ProductComponent
        const container = document.querySelector('.products-grid');
        if (products.length === 0) {
            container.innerHTML = '<p>No products found matching your criteria.</p>';
            return;
        }

        // שימוש ב-ProductComponent ליצירת כרטיסי המוצרים
        container.innerHTML = products
            .map(product => ProductComponent.createProductCard(product))
            .join('');

        // אתחול האינטראקציות של כרטיסי המוצרים
        ProductComponent.initializeProductCards();

    } catch (error) {
        console.error('Error loading products:', error);
        document.querySelector('.products-grid').innerHTML = 
            '<p>Error loading products. Please try again later.</p>';
    }
}

    setupFilterListeners() {
        // Brand filter changes
        document.getElementById('brandFilters').addEventListener('change', e => {
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

        // Size filter changes
        document.getElementById('sizeFilters').addEventListener('change', e => {
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

        // Price range changes
        const minPrice = document.getElementById('minPrice');
        const maxPrice = document.getElementById('maxPrice');
        const minDisplay = document.getElementById('minPriceDisplay');
        const maxDisplay = document.getElementById('maxPriceDisplay');

        minPrice.addEventListener('input', e => {
            minDisplay.textContent = `₪${e.target.value}`;
        });

        maxPrice.addEventListener('input', e => {
            maxDisplay.textContent = `₪${e.target.value}`;
        });

        minPrice.addEventListener('change', e => {
            this.filters.minPrice = Number(e.target.value);
            this.loadProducts();
        });

        maxPrice.addEventListener('change', e => {
            this.filters.maxPrice = Number(e.target.value);
            this.loadProducts();
        });
    }
}

// Helper function for loading content
async function loadContent(url, containerId) {
    try {
        const response = await fetch(url);
        const data = await response.text();
        document.getElementById(containerId).innerHTML = data;
    } catch (error) {
        console.error(`Error loading ${url}:`, error);
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    const page = new ResultsPage();
    page.init();
});

async function loadProducts() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    const brand = params.get('brand');

    console.log('Loading products with category:', category, 'and brand:', brand);

    try {
        // Fetch products based on category and brand
        const response = await fetch(`/api/shoes?category=${category}&brand=${brand}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const products = await response.json();

        console.log('Fetched products:', products);

        // Update the page with the fetched products
        const productsGrid = document.querySelector('.products-grid');
        productsGrid.innerHTML = '';

        if (products.length === 0) {
            productsGrid.innerHTML = '<p>No products found matching your criteria.</p>';
        } else {
            products.forEach(product => {
                productsGrid.innerHTML += ProductComponent.createProductCard(product);
            });

            // Initialize product cards
            ProductComponent.initializeProductCards();
        }
    } catch (error) {
        console.error('Error loading products:', error);
        document.querySelector('.products-grid').innerHTML = '<p>Error loading products. Please try again later.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});

