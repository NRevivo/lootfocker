// יצירת סגנונות CSS
const style = document.createElement('style');
style.textContent = `
    .search-results {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        max-height: 400px;
        overflow-y: auto;
        display: none;
        z-index: 1000;
        margin-top: 5px;
    }
    .search-result-item {
        display: flex;
        padding: 10px;
        cursor: pointer;
        border-bottom: 1px solid #eee;
        align-items: center;
    }

    .search-result-item:hover {
        background-color: #f5f5f5;
    }

    .search-result-image {
        width: 50px;
        height: 50px;
        object-fit: cover;
        margin-right: 10px;
    }

    .search-result-details {
        flex-grow: 1;
    }

    .search-result-name {
        font-weight: bold;
        margin-bottom: 4px;
        color: #333;
        white-space: normal;
        line-height: 1.2;
    }

    .search-result-item span.highlight {
        background-color: #f0f0f0;
        font-weight: bold;
    }

    .search-result-price {
        color: #666;
        margin-top: 4px;
    }

    .no-results {
        padding: 10px;
        text-align: center;
        color: #333;          
        background: #f5f5f5;  
        border-radius: 4px;   
        margin: 5px 0;        
        font-weight: 500;     
    }

    .error {
        padding: 10px;
        text-align: center;
        color: red;
    }

    .view-all-results {
        padding: 10px;
        text-align: center;
        background-color: #f5f5f5;
        cursor: pointer;
        font-weight: bold;
    }

    .view-all-results:hover {
        background-color: #e5e5e5;
    }
        
`;

document.head.appendChild(style);

export default class Search {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.searchButton = document.getElementById('searchButton');
        this.searchResults = document.getElementById('searchResults');
        this.setupEventListeners();
        console.log('Search class initialized');
    }

    setupEventListeners() {
        // מאזין יחיד ללחיצה על enter
        this.searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                const query = this.searchInput.value.trim();
                if (query) {
                    window.location.href = `/results.html?searchQuery=${encodeURIComponent(query)}`;
                }
            }
        });
    
        // מאזין לכפתור החיפוש
        this.searchButton.addEventListener('click', () => {
            const query = this.searchInput.value.trim();
            if (query) {
                window.location.href = `/results.html?searchQuery=${encodeURIComponent(query)}`;
            }
        });
    
        // מאזין לשינויים בשדה החיפוש (להצגת תוצאות חיפוש מיידיות)
        this.searchInput.addEventListener('input', () => {
            this.handleSearchInput();
        });
    
        // סגירת תוצאות החיפוש בלחיצה מחוץ לאזור החיפוש
        document.addEventListener('click', (event) => {
            if (!event.target.closest('.container')) {
                this.searchResults.style.display = 'none';
            }
        });
    
        console.log('Event listeners set up');
    }
    
    async handleSearchInput() {
        const query = this.searchInput.value.trim();
        console.log('Search query:', query);
        
        if (query.length >= 2) {
            try {
                const response = await fetch(`/api/shoes/search?searchQuery=${encodeURIComponent(query)}`);
                const products = await response.json();
                console.log('Search results:', products);
                
                if (products.length > 0) {
                    this.displayResults(products, query);
                } else {
                    this.searchResults.innerHTML = '<div class="no-results">No products found</div>';
                }
                
                this.searchResults.style.display = 'block';
            } catch (error) {
                console.error('Search error:', error);
                this.searchResults.innerHTML = '<div class="error">Error searching products</div>';
            }
        } else {
            this.searchResults.style.display = 'none';
        }
    }

    displayResults(products, query) {
        const limitedProducts = products.slice(0, 3);
        
        this.searchResults.innerHTML = limitedProducts.map(product => {
            const fullProductName = `${product.brand} ${product.name}`;
            
            // שינוי - הסרת ה-onclick והוספת data-product-id
            return `
                <div class="search-result-item" data-product-id="${product._id}">
                    <img src="${product.images[0]}" alt="${fullProductName}" class="search-result-image">
                    <div class="search-result-details">
                        <div class="search-result-name">${fullProductName}</div>
                        <div class="search-result-price">$${product.price.toFixed(2)}</div>
                    </div>
                </div>
            `;
        }).join('');
        
        // הוספת כפתור "הצג הכל" רק אם יש יותר מ-3 תוצאות
        if (products.length > 3) {
            this.searchResults.innerHTML += `
                <div class="view-all-results" onclick="window.location.href='/results.html?searchQuery=${encodeURIComponent(this.searchInput.value)}'>
                    View all ${products.length} results
                </div>
            `;
        }
    
        // הוספת מאזיני לחיצה לכל תוצאת חיפוש
        const searchResultItems = this.searchResults.querySelectorAll('.search-result-item');
        searchResultItems.forEach(item => {
            item.addEventListener('click', async () => {
                const productId = item.dataset.productId;
                
                try {
                    // טעינת ProductComponent
                    const ProductComponent = await loadProductComponent();
                    
                    // אתחול ProductComponent אם לא אותחל
                    if (!document.getElementById('productModal')) {
                        await ProductComponent.init();
                    }
                    
                    // פתיחת המודל עם המוצר
                    await ProductComponent.openProductModal(productId);
                    
                    // סגירת תוצאות החיפוש
                    this.searchResults.style.display = 'none';
                    
                } catch (error) {
                    console.error('Error opening product modal:', error);
                }
            });
        });
    }

    performSearch() {
        const searchQuery = this.searchInput.value.trim();
        console.log('Performing search for:', searchQuery);
        
        if (searchQuery) {
            window.location.href = `/results.html?searchQuery=${encodeURIComponent(searchQuery)}`;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Search class');
    new Search();
});