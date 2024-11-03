class ProductComponent {
    static init() {
        if (!document.getElementById('productModal')) {
            document.body.insertAdjacentHTML('beforeend', this.getModalHTML());
            this.addModalStyles();
            this.initializeModalEvents();
        }
    }

    // יצירת כרטיס מוצר בסיסי שמוצג בדף
    static createProductCard(product) {
        return `
            <div class="product-card" data-product-id="${product._id}">
                <div class="product-image-container">
                    <img src="${product.images[0]}" alt="${product.name}" class="main-image">
                    ${product.images[1] ? 
                        `<img src="${product.images[1]}" alt="${product.name}" class="hover-image">` 
                        : ''}
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="price">$${product.price.toFixed(2)}</p>
                    ${product.stock > 0 ? 
                        '<button class="add-to-cart">Add to Cart</button>' : 
                        '<span class="out-of-stock">Out of Stock</span>'}
                </div>
            </div>
        `;
    }

    // HTML של המודל (החלון הקופץ)
    static getModalHTML() {
        return `
            <div id="productModal" class="modal">
                <div class="modal-content">
                    <button class="close" aria-label="Close">×</button>
                    
                    <div class="modal-body">
                        <!-- תמונות המוצר -->
                        <div class="product-images">
                            <img src="" alt="" class="main-image">
                            <div class="thumbnail-images"></div>
                        </div>

                        <!-- פרטי המוצר -->
                        <div class="product-details">
                            <h2 class="product-title"></h2>
                            <p class="product-price"></p>
                            
                            <div class="product-description">
                                <p></p>
                            </div>

                            <!-- בחירת מידה -->
                            <div class="size-selection">
                                <h3>Size</h3>
                                <div class="size-options"></div>
                            </div>

                            <!-- בחירת צבע -->
                            <div class="color-selection">
                                <h3>Color</h3>
                                <div class="color-options"></div>
                            </div>

                            <!-- בחירת כמות -->
                            <div class="quantity-selection">
                                <h3>Quantity</h3>
                                <div class="quantity-controls">
                                    <button class="decrease">-</button>
                                    <input type="number" value="1" min="1">
                                    <button class="increase">+</button>
                                </div>
                            </div>

                            <button class="add-to-cart-btn">Add to Cart</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // סגנונות המודל
    static addModalStyles() {
        const styles = `
            .modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 1000;
                justify-content: center;
                align-items: center;
            }

            .modal.active {
                display: flex;
            }

            .modal-content {
                background: white;
                width: 90%;
                max-width: 1000px;
                max-height: 90vh;
                overflow-y: auto;
                border-radius: 8px;
                position: relative;
            }

            .close {
                position: absolute;
                right: 20px;
                top: 20px;
                font-size: 24px;
                cursor: pointer;
                border: none;
                background: none;
                z-index: 1;
            }

            .modal-body {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                padding: 30px;
            }

            /* סגנונות לתמונות */
            .product-images {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }

            .main-image {
                width: 100%;
                height: auto;
                border-radius: 8px;
            }

            .thumbnail-images {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }

            .thumbnail-images img {
                width: 60px;
                height: 60px;
                border-radius: 4px;
                cursor: pointer;
                border: 2px solid transparent;
            }

            .thumbnail-images img.active {
                border-color: black;
            }

            /* סגנונות לפרטי המוצר */
            .product-details {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }

            .product-title {
                font-size: 24px;
                margin: 0;
            }

            .product-price {
                font-size: 20px;
                font-weight: bold;
            }

            /* סגנונות למידות */
            .size-options {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }

            .size-options button {
                width: 50px;
                height: 40px;
                border: 1px solid #ddd;
                background: white;
                cursor: pointer;
                border-radius: 4px;
            }

            .size-options button.selected {
                background: black;
                color: white;
            }

            /* סגנונות לצבעים */
            .color-options {
                display: flex;
                gap: 10px;
            }

            .color-option {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                cursor: pointer;
                border: 2px solid transparent;
            }

            .color-option.selected {
                border-color: black;
            }

            /* סגנונות לבחירת כמות */
            .quantity-controls {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .quantity-controls button {
                width: 30px;
                height: 30px;
                border: 1px solid #ddd;
                background: white;
                cursor: pointer;
            }

            .quantity-controls input {
                width: 50px;
                text-align: center;
                border: 1px solid #ddd;
                padding: 5px;
            }

            .add-to-cart-btn {
                width: 100%;
                padding: 15px;
                background: black;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 20px;
            }

            @media (max-width: 768px) {
                .modal-body {
                    grid-template-columns: 1fr;
                }
            }
        `;

        const styleSheet = document.createElement("style");
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    // אתחול אירועי המודל
    static initializeModalEvents() {
        const modal = document.getElementById('productModal');
        const closeBtn = modal.querySelector('.close');

        // סגירת המודל
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        // סגירה בלחיצה מחוץ למודל
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    // אתחול כרטיסי המוצרים
    static initializeProductCards() {
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('add-to-cart-btn')) {
                    const productId = card.dataset.productId;
                    this.openProductModal(productId);
                }
            });
        });
    }

    // פתיחת המודל עם נתוני המוצר
    static async openProductModal(productId) {
        try {
            const response = await fetch(`/api/shoes/${productId}`);
            const product = await response.json();
            const modal = document.getElementById('productModal');

            // עדכון תוכן המודל
            modal.querySelector('.product-title').textContent = product.name;
            modal.querySelector('.product-price').textContent = `₪${product.price.toFixed(2)}`;
            modal.querySelector('.product-description p').textContent = product.description;

            // עדכון תמונות
            const mainImage = modal.querySelector('.main-image');
            mainImage.src = product.images[0];
            mainImage.alt = product.name;

            // תמונות ממוזערות
            const thumbnailsContainer = modal.querySelector('.thumbnail-images');
            thumbnailsContainer.innerHTML = product.images
                .map((img, index) => `
                    <img src="${img}" 
                         alt="${product.name}" 
                         class="${index === 0 ? 'active' : ''}"
                         onclick="ProductComponent.changeMainImage(this)">
                `).join('');

            // עדכון מידות
            const sizesContainer = modal.querySelector('.size-options');
            sizesContainer.innerHTML = product.sizes
                .map(size => `
                    <button data-size="${size}">${size}</button>
                `).join('');

            // עדכון צבעים
            const colorsContainer = modal.querySelector('.color-options');
            colorsContainer.innerHTML = product.colors
                .map(color => `
                    <div class="color-option" 
                         style="background-color: ${color}"
                         data-color="${color}">
                    </div>
                `).join('');

            // הצגת המודל
            modal.classList.add('active');
            this.initializeModalInteractions(product);

        } catch (error) {
            console.error('Error loading product:', error);
        }
    }

    // אתחול האינטראקציות במודל
    static initializeModalInteractions(product) {
        const modal = document.getElementById('productModal');

        // בחירת מידה
        modal.querySelectorAll('.size-options button').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.querySelectorAll('.size-options button').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });

        // בחירת צבע
        modal.querySelectorAll('.color-option').forEach(color => {
            color.addEventListener('click', () => {
                modal.querySelectorAll('.color-option').forEach(c => c.classList.remove('selected'));
                color.classList.add('selected');
            });
        });

        // כפתורי כמות
        const quantityInput = modal.querySelector('.quantity-controls input');
        const decreaseBtn = modal.querySelector('.decrease');
        const increaseBtn = modal.querySelector('.increase');

        decreaseBtn.addEventListener('click', () => {
            const currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        });

        increaseBtn.addEventListener('click', () => {
            const currentValue = parseInt(quantityInput.value);
            if (currentValue < product.stock) {
                quantityInput.value = currentValue + 1;
            }
        });

        // הוספה לסל
        const addToCartBtn = modal.querySelector('.add-to-cart-btn');
        addToCartBtn.addEventListener('click', () => {
            const selectedSize = modal.querySelector('.size-options button.selected')?.dataset.size;
            const selectedColor = modal.querySelector('.color-option.selected')?.dataset.color;
            const quantity = parseInt(quantityInput.value);

            if (!selectedSize || !selectedColor) {
                alert('Please select size and color');
                return;
            }

            // כאן תוסיף את הלוגיקה של הוספה לסל
            console.log('Adding to cart:', {
                productId: product._id,
                size: selectedSize,
                color: selectedColor,
                quantity: quantity
            });
        });
    }

    // החלפת תמונה ראשית
    static changeMainImage(thumbnailImg) {
        const modal = document.getElementById('productModal');
        const mainImage = modal.querySelector('.main-image');
        mainImage.src = thumbnailImg.src;
        
        modal.querySelectorAll('.thumbnail-images img').forEach(img => {
            img.classList.remove('active');
        });
        thumbnailImg.classList.add('active');
    }
}

export default ProductComponent;