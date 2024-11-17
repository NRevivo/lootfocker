import ProductComponent from './productComponent.js';

class HomePage {
    constructor() {
        this.init();
    }

    async init() {
        try {
            // אתחול ה-ProductComponent
            await ProductComponent.init();
            
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
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const products = await response.json();
            const productGrid = document.querySelector('.product-grid');
            
            if (!productGrid) {
                console.error('Product grid container not found');
                return;
            }

            productGrid.innerHTML = '';

            if (products && products.length > 0) {
                products.forEach(product => {
                    productGrid.innerHTML += ProductComponent.createProductCard(product);
                });
                
                // אתחול האינטראקציות לאחר יצירת הכרטיסים
                ProductComponent.initializeProductCards();
            } else {
                productGrid.innerHTML = '<p class="no-results">No products available at the moment.</p>';
            }
        } catch (error) {
            console.error('Error loading latest products:', error);
            const productGrid = document.querySelector('.product-grid');
            if (productGrid) {
                productGrid.innerHTML = '<p class="error-message">Error loading products. Please try again later.</p>';
            }
        }
    }
}

    document.addEventListener('DOMContentLoaded', () => {
        new HomePage();
    });
    
    export default HomePage;