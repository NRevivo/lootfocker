class ProductComponent {
    static init() {
        if (!document.getElementById('productModal')) {
            document.body.insertAdjacentHTML('beforeend', this.getModalHTML());
            this.addModalStyles();
            this.initializeModalEvents();
        }
    }

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

    static getModalHTML() {
        return `
            <div id="productModal" class="modal">
                <div class="modal-content">
                    <button class="close" aria-label="Close">×</button>
                    
                    <div class="modal-body">
                        <!-- חלק עליון - תמונות -->
                        <div class="modal-top">
                            <div class="product-images-section">
                                <div class="main-image-container">
                                    <img src="" alt="" class="main-image">
                                </div>
                                <div class="thumbnail-images"></div>
                            </div>
                        </div>

                        <!-- חלק תחתון -->
                        <div class="modal-bottom">
                            <!-- צד ימין - פרטי מוצר -->
                            <div class="product-info-section">
                                <h2 class="product-title"></h2>
                                <p class="product-price"></p>
                                <div class="product-description">
                                    <p></p>
                                </div>
                            </div>

                            <!-- צד שמאל - בחירות -->
                            <div class="product-selections">
                                <div class="size-selection">
                                    <h3>Size</h3>
                                    <div class="size-options"></div>
                                </div>

                                <div class="quantity-selection">
                                    <h3>Quantity</h3>
                                    <div class="quantity-controls">
                                        <button class="quantity-btn decrease">-</button>
                                        <input type="number" value="1" min="1" class="quantity-input">
                                        <button class="quantity-btn increase">+</button>
                                    </div>
                                </div>

                                <button class="add-to-cart-btn">Add to Cart</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static addModalStyles() {
        const styles = `
        /* סגנונות כרטיס המוצר - נשארים זהים */
        .product-card {
            background-color: #fff;
            padding: 1rem;
            text-align: center;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .product-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        .product-image-container {
            position: relative;
            width: 100%;
            height: 300px;
            overflow: hidden;
        }

        .product-image-container .main-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: opacity 0.3s ease;
        }

        .product-image-container .hover-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .product-card:hover .hover-image {
            opacity: 1;
        }

        .product-card:hover .main-image {
            opacity: 0;
        }

        .product-info {
            position: relative;
            z-index: 2;
            background: white;
            padding-top: 10px;
        }

        .product-info h3 {
            margin: 1rem 0 0.5rem;
        }

        .product-info .price {
            color: red;
            font-weight: bold;
            margin-bottom: 1rem;
        }

        /* סגנונות המודל החדש */
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
            border-radius: 12px;
            position: relative;
            padding: 20px;
        }

        .modal-body {
            display: flex;
            flex-direction: column;
            gap: 30px;
            max-height: 90vh;
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
            transition: transform 0.2s;
        }

        .close:hover {
            transform: scale(1.1);
        }

        .modal-top {
            flex: 1;
            min-height: 45vh;
            display: flex;
            justify-content: center;
        }

        .product-images-section {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
        }

        .main-image-container {
            width: 100%;
            max-width: 400px;  /* הקטנת הגודל המקסימלי */
            aspect-ratio: 1;
            border-radius: 8px;
            overflow: hidden;
            margin: 0 auto 15px;
        }

        .main-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
        }

        /* עדכון סגנונות לתמונות הממוזערות */
        .thumbnail-images {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-bottom: 15px;  /* מרווח מהתוכן שמתחת */
            padding: 0 10px;      /* מרווח מהצדדים */
        }

        .thumbnail-images img {
            width: 60px;          /* הקטנת גודל התמונות הממוזערות */
            height: 60px;
            border-radius: 8px;
            cursor: pointer;
            border: 2px solid transparent;
            transition: all 0.2s ease;
        }

        .thumbnail-images img:hover {
            border-color: #666;
        }

        .thumbnail-images img.active {
            border-color: #000;
        }

        .modal-bottom {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
        }

        .product-info-section {
            padding-right: 20px;
        }

        .product-title {
            font-size: 28px;
            margin: 0 0 10px 0;
            font-weight: 600;
        }

        .product-price {
            font-size: 24px;
            font-weight: bold;
            color: #000;
            margin-bottom: 20px;
        }

        .product-description {
            font-size: 16px;
            line-height: 1.6;
        }

        .product-selections {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .size-selection {
            text-align: center;
        }

        .size-options {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            justify-content: center;
            margin-top: 10px;
        }

        .size-options button {
            min-width: 50px;
            height: 50px;
            border: 2px solid #e0e0e0;
            background: white;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.2s;
        }

        .size-options button:hover {
            border-color: #000;
        }

        .size-options button.selected {
            background: #000;
            color: white;
            border-color: #000;
        }

        .quantity-selection {
            text-align: center;
        }

        .quantity-controls {
            display: flex;
            align-items: center;
            gap: 10px;
            max-width: 200px;
            margin: 10px auto 0;
            justify-content: center;
        }

        .quantity-btn {
            width: 40px;
            height: 40px;
            border: none;
            background: #f5f5f5;
            border-radius: 8px;
            cursor: pointer;
            font-size: 18px;
            transition: background-color 0.2s;
        }

        .quantity-btn:hover {
            background: #e0e0e0;
        }

        .quantity-input {
            width: 60px;
            height: 40px;
            text-align: center;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 16px;
        }

        .quantity-input::-webkit-inner-spin-button,
        .quantity-input::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }

        .quantity-input {
            -moz-appearance: textfield;
        }

        .add-to-cart-btn {
            width: fit-content;
            min-width: 200px;
            padding: 15px 30px;
            margin: 20px auto 0;
            display: block;
            background: #000;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            transition: transform 0.2s, background-color 0.2s;
        }

        .add-to-cart-btn:hover {
            transform: translateY(-2px);
            background: #333;
        }

        @media (max-width: 768px) {
            .modal-bottom {
                grid-template-columns: 1fr;
            }
            
            .product-info-section {
                padding-right: 0;
                text-align: center;
            }
        }
        `;

        const styleSheet = document.createElement("style");
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    static initializeModalEvents() {
        const modal = document.getElementById('productModal');
        const closeBtn = modal.querySelector('.close');

        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    static initializeProductCards() {
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('add-to-cart')) {
                    const productId = card.dataset.productId;
                    this.openProductModal(productId);
                }
            });
        });
    }

    static async openProductModal(productId) {
        try {
            const response = await fetch(`/api/shoes/${productId}`);
            const product = await response.json();
            const modal = document.getElementById('productModal');
    
            modal.querySelector('.product-title').textContent = product.name;
            modal.querySelector('.product-price').textContent = `₪${product.price.toFixed(2)}`;
            modal.querySelector('.product-description p').textContent = product.description;
    
            const mainImage = modal.querySelector('.main-image');
            mainImage.src = product.images[0];
            mainImage.alt = product.name;
    
            // עדכון התמונות הממוזערות בלי onclick במחרוזת
            const thumbnailsContainer = modal.querySelector('.thumbnail-images');
            thumbnailsContainer.innerHTML = product.images
                .map((img, index) => `
                    <img src="${img}" 
                         alt="${product.name}" 
                         class="${index === 0 ? 'active' : ''}"
                         data-index="${index}">
                `).join('');
    
            // הוספת event listeners לתמונות הממוזערות
            thumbnailsContainer.querySelectorAll('img').forEach(img => {
                img.addEventListener('click', () => {
                    const mainImage = modal.querySelector('.main-image');
                    mainImage.src = img.src;
                    
                    // הסרת active מכל התמונות והוספה לתמונה הנוכחית
                    thumbnailsContainer.querySelectorAll('img').forEach(thumb => {
                        thumb.classList.remove('active');
                    });
                    img.classList.add('active');
                });
            });
    
            const sizesContainer = modal.querySelector('.size-options');
            sizesContainer.innerHTML = product.sizes
                .map(size => `
                    <button data-size="${size}">${size}</button>
                `).join('');
    
            modal.classList.add('active');
            this.initializeModalInteractions(product);
    
        } catch (error) {
            console.error('Error loading product:', error);
        }
    }

    static initializeModalInteractions(product) {
        const modal = document.getElementById('productModal');
    
        // בחירת מידה - נשאר ללא שינוי
        modal.querySelectorAll('.size-options button').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.querySelectorAll('.size-options button').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });
    
        // עדכון בקרת הכמות
        const quantityInput = modal.querySelector('.quantity-input');
        const decreaseBtn = modal.querySelector('.decrease');
        const increaseBtn = modal.querySelector('.increase');
    
        // הגדרת מינימום ומקסימום לשדה הכמות
        quantityInput.setAttribute('max', product.stock);
        quantityInput.setAttribute('min', '1');
    
        // פונקציה לעדכון ערך הכמות
        const updateQuantity = (newValue) => {
            // וידוא שהערך בין 1 למלאי
            const value = Math.min(Math.max(1, newValue), product.stock);
            quantityInput.value = value;
            
            // עדכון מצב הכפתורים
            decreaseBtn.disabled = value <= 1;
            increaseBtn.disabled = value >= product.stock;
        };
    
        // טיפול בשינוי ערך ידני
        quantityInput.addEventListener('change', (e) => {
            const newValue = parseInt(e.target.value) || 1;
            updateQuantity(newValue);
        });
    
        // טיפול בהקלדה בשדה
        quantityInput.addEventListener('keyup', (e) => {
            const newValue = parseInt(e.target.value) || 1;
            updateQuantity(newValue);
        });
    
        // כפתור הפחתה
        decreaseBtn.addEventListener('click', () => {
            const currentValue = parseInt(quantityInput.value);
            updateQuantity(currentValue - 1);
        });
    
        // כפתור הוספה
        increaseBtn.addEventListener('click', () => {
            const currentValue = parseInt(quantityInput.value);
            updateQuantity(currentValue + 1);
        });
    
        // הגדרת ערך התחלתי
        updateQuantity(1);
    
        // הוספת סגנונות לכפתורים מושבתים
        const styles = `
            .quantity-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        `;
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    
        const addToCartBtn = modal.querySelector('.add-to-cart-btn');
        addToCartBtn.addEventListener('click', () => {
            const selectedSize = modal.querySelector('.size-options button.selected')?.dataset.size;
            const quantity = parseInt(quantityInput.value);
    
            if (!selectedSize) {
                alert('Please select size');
                return;
            }
    
            if (quantity < 1 || quantity > product.stock) {
                alert('Invalid quantity');
                return;
            }
    
            console.log('Adding to cart:', {
                productId: product._id,
                size: selectedSize,
                quantity: quantity
            });
        });
    }
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