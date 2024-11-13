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
        .product-card {
            background-color: #fff;
            padding: 1rem;
            text-align: center;
            box-shadow: 0 0.125rem 0.3125rem rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .product-card:hover {
            transform: translateY(-0.3125rem);
            box-shadow: 0 0.3125rem 0.9375rem rgba(0, 0, 0, 0.2);
        }

        .product-image-container {
            position: relative;
            width: 100%;
            height: 30vh;
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
            padding-top: 0.625rem;
        }

        .product-info h3 {
            margin: 1rem 0 0.5rem;
        }

        .product-info .price {
            color: red;
            font-weight: bold;
            margin-bottom: 1rem;
        }

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
            max-width: 60rem;
            border-radius: 0.75rem;
            position: relative;
            padding: 1.25rem;
            max-height: 90vh;
            overflow-y: auto;
        }

        .modal-body {
            display: flex;
            flex-direction: column;
            gap: 1.875rem;
        }

        .close {
            position: absolute;
            right: 1.25rem;
            top: 1.25rem;
            font-size: 1.5rem;
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
            max-width: 37.5rem;
            margin: 0 auto;
        }

        .main-image-container {
            width: 100%;
            max-width: 25rem;
            aspect-ratio: 1;
            border-radius: 0.5rem;
            overflow: hidden;
            margin: 0 auto 0.9375rem;
        }

        .main-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
        }

        .thumbnail-images {
            display: flex;
            gap: 0.625rem;
            justify-content: center;
            margin-bottom: 0.9375rem;
            padding: 0 0.625rem;
            flex-wrap: wrap;
        }

        .thumbnail-images img {
            width: 3.75rem;
            height: 3.75rem;
            border-radius: 0.5rem;
            cursor: pointer;
            border: 0.125rem solid transparent;
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
            gap: 1.875rem;
            padding-top: 1.25rem;
            border-top: 0.0625rem solid #e0e0e0;
        }

        .product-info-section {
            padding-right: 1.25rem;
        }

        .product-title {
            font-size: 1.75rem;
            margin: 0 0 0.625rem 0;
            font-weight: 600;
        }

        .product-price {
            font-size: 1.5rem;
            font-weight: bold;
            color: #000;
            margin-bottom: 1.25rem;
        }

        .product-description {
            font-size: 1rem;
            line-height: 1.6;
        }

        .product-selections {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
        }

        .size-selection {
            text-align: center;
        }

        .size-options {
            display: flex;
            gap: 0.625rem;
            flex-wrap: wrap;
            justify-content: center;
            margin-top: 0.625rem;
        }

        .size-options button {
            min-width: 3.125rem;
            height: 3.125rem;
            border: 0.125rem solid #e0e0e0;
            background: white;
            border-radius: 0.5rem;
            cursor: pointer;
            font-size: 1rem;
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
            gap: 0.625rem;
            max-width: 12.5rem;
            margin: 0.625rem auto 0;
            justify-content: center;
        }

        .quantity-btn {
            width: 2.5rem;
            height: 2.5rem;
            border: none;
            background: #f5f5f5;
            border-radius: 0.5rem;
            cursor: pointer;
            font-size: 1.125rem;
            transition: background-color 0.2s;
        }

        .quantity-btn:hover {
            background: #e0e0e0;
        }

        .quantity-input {
            width: 3.75rem;
            height: 2.5rem;
            text-align: center;
            border: 0.125rem solid #e0e0e0;
            border-radius: 0.5rem;
            font-size: 1rem;
        }

        .add-to-cart-btn {
            width: fit-content;
            min-width: 12.5rem;
            padding: 0.9375rem 1.875rem;
            margin: 1.25rem auto 0;
            display: block;
            background: #000;
            color: white;
            border: none;
            border-radius: 0.5rem;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 600;
            transition: transform 0.2s, background-color 0.2s;
        }

        .add-to-cart-btn:hover {
            transform: translateY(-0.125rem);
            background: #333;
        }

        @media (max-width: 48rem) {
            .modal-content {
                width: 95%;
                padding: 1rem;
                max-height: 95vh;
            }

            .modal-bottom {
                grid-template-columns: 1fr;
                gap: 1rem;
            }
            
            .product-info-section {
                padding-right: 0;
                text-align: center;
            }

            .product-selections {
                gap: 2rem;
                padding: 1rem 0;
            }

            .size-options {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(3.125rem, 1fr));
                gap: 0.5rem;
                padding: 0 1rem;
            }

            .size-options button {
                width: 100%;
                min-width: 2.5rem;
                height: 2.5rem;
            }

            .quantity-controls {
                margin: 1rem auto;
            }

            .add-to-cart-btn {
                width: 100%;
                margin: 1rem 0;
            }

            .product-title {
                font-size: 1.5rem;
            }

            .product-price {
                font-size: 1.25rem;
            }
        }

        @media (max-width: 30rem) {
            .modal-content {
                padding: 0.75rem;
            }

            .main-image-container {
                max-width: 100%;
            }

            .thumbnail-images img {
                width: 3rem;
                height: 3rem;
            }

            .size-options {
                grid-template-columns: repeat(3, 1fr);
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
    
        // פונקציה לניקוי כל האירועים והחזרת המודל למצב התחלתי
        const resetModal = () => {
            modal.classList.remove('active');
            
            // איפוס כפתורי הכמות
            const quantityControls = modal.querySelector('.quantity-controls');
            const newControls = quantityControls.cloneNode(true);
            quantityControls.parentNode.replaceChild(newControls, quantityControls);
            
            // איפוס כפתור ההוספה לעגלה
            const addToCartBtn = modal.querySelector('.add-to-cart-btn');
            const newAddToCartBtn = addToCartBtn.cloneNode(true);
            addToCartBtn.parentNode.replaceChild(newAddToCartBtn, addToCartBtn);
        };
    
        closeBtn.addEventListener('click', resetModal);
    
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                resetModal();
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
            modal.querySelector('.product-price').textContent = `$${product.price.toFixed(2)}`;
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
    
        // Size selection
        const sizeOptions = modal.querySelector('.size-options');
        const newSizeOptions = sizeOptions.cloneNode(true);
        sizeOptions.parentNode.replaceChild(newSizeOptions, sizeOptions);
    
        newSizeOptions.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                newSizeOptions.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });
    
        // Quantity controls
        const quantityControls = modal.querySelector('.quantity-controls');
        const newQuantityControls = quantityControls.cloneNode(true);
        quantityControls.parentNode.replaceChild(newQuantityControls, quantityControls);
    
        const quantityInput = newQuantityControls.querySelector('.quantity-input');
        const decreaseBtn = newQuantityControls.querySelector('.decrease');
        const increaseBtn = newQuantityControls.querySelector('.increase');
    
        // Set min/max
        quantityInput.min = 1;
        quantityInput.max = product.stock;
        quantityInput.value = 1;
    
        const updateQuantity = (newValue) => {
            let value = Math.min(Math.max(1, newValue), product.stock);
            quantityInput.value = value;
            decreaseBtn.disabled = value <= 1;
            increaseBtn.disabled = value >= product.stock;
        };
    
        // Handle direct input
        quantityInput.addEventListener('input', (e) => {
            let newValue = parseInt(e.target.value) || 1;
            updateQuantity(newValue);
        });
    
        // Single event listener for decrease button
        decreaseBtn.addEventListener('click', () => {
            const currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) {
                updateQuantity(currentValue - 1);
            }
        });
    
        // Single event listener for increase button
        increaseBtn.addEventListener('click', () => {
            const currentValue = parseInt(quantityInput.value);
            if (currentValue < product.stock) {
                updateQuantity(currentValue + 1);
            }
        });
        // Add to cart button
    const addToCartBtn = modal.querySelector('.add-to-cart-btn');
    const newAddToCartBtn = addToCartBtn.cloneNode(true);
    addToCartBtn.parentNode.replaceChild(newAddToCartBtn, addToCartBtn);

    newAddToCartBtn.addEventListener('click', async () => {
        const selectedSize = newSizeOptions.querySelector('button.selected')?.dataset.size;
        const quantity = parseInt(quantityInput.value);
        const userId = sessionStorage.getItem('userId');

        if (!userId) {
            alert('Please log in to add items to cart');
            return;
        }

        if (!selectedSize) {
            alert('Please select size');
            return;
        }

        if (quantity < 1 || quantity > product.stock) {
            alert('Invalid quantity');
            return;
        }

        try {
            const response = await fetch('/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId: product._id,
                    size: selectedSize,
                    quantity: quantity,
                    userId: userId
                }),
            });

            const data = await response.json();
            if (data.success) {
                window.CartUtilities.updateCartDisplay(data.cart);
                modal.classList.remove('active');
                alert('Product added to cart successfully!');
            } else {
                alert(data.message || 'Error adding to cart');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error adding to cart');
        }
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