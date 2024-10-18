document.addEventListener('DOMContentLoaded', function() {
    // Hero carousel functionality
    const slides = document.querySelectorAll('.carousel-slide');
    let currentSlide = 0;

    function showSlide(n) {
        slides[currentSlide].classList.remove('active');
        currentSlide = (n + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    setInterval(nextSlide, 7000); // Change slide every 7 seconds

    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Add to cart functionality (for demonstration)
    const addToCartButtons = document.querySelectorAll('.add-to-cart');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productName = this.parentElement.querySelector('h3').textContent;
            alert(`Added ${productName} to cart!`);
        });
    });

    // Parallax effect for featured products section
    const featuredProducts = document.querySelector('.featured-products');

    window.addEventListener('scroll', () => {
        const scrollPosition = window.pageYOffset;
        featuredProducts.style.backgroundPositionY = `${scrollPosition * 0.5}px`;
    });

    // Sticky header
    const header = document.querySelector('.sticky-header');
    const headerHeight = header.offsetHeight;

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > headerHeight) {
            header.classList.add('sticky');
        } else {
            header.classList.remove('sticky');
        }
    });

    // Smooth scroll for navigation links
    const navLinksAnchors = document.querySelectorAll('.nav-links a');

    navLinksAnchors.forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - headerHeight,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Hover effect for product images
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach(card => {
        const mainImage = card.querySelector('img:not(.hover-image)');
        const hoverImage = card.querySelector('.hover-image');

        card.addEventListener('mouseenter', () => {
            mainImage.style.opacity = '0';
            hoverImage.style.opacity = '1';
        });

        card.addEventListener('mouseleave', () => {
            mainImage.style.opacity = '1';
            hoverImage.style.opacity = '0';
        });
    });

    // Lazy loading for product images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const image = entry.target;
                    image.src = image.dataset.src;
                    image.classList.remove('lazy');
                    observer.unobserve(image);
                }
            });
        });

        const lazyImages = document.querySelectorAll('img.lazy');
        lazyImages.forEach(img => imageObserver.observe(img));
    }

    // Modal functionality for Login/Register
    const modal = document.getElementById("loginModal");
    const loginLink = document.querySelector(".login-register a");
    const closeModal = document.querySelector(".close");

    // Ensure the modal is hidden by default
    modal.style.display = "none";

    // Show the modal only when clicking the "Login/Register" link
    loginLink.addEventListener("click", function(event) {
        event.preventDefault();
        modal.style.display = "flex"; // Display modal as flex to center it
    });

    // Hide the modal when clicking the "X" button
    if (closeModal) {
        closeModal.addEventListener("click", function() {
            modal.style.display = "none";
        });
    }

    // Hide the modal when clicking outside of it
    window.addEventListener("click", function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });

    // ... (rest of the code remains the same)
});

document.addEventListener('DOMContentLoaded', function() {
    const cartToggle = document.getElementById('cartToggle');
    const cartDropdown = document.getElementById('cartDropdown');
    const closeCart = document.getElementById('closeCart');
    
    // Toggle cart dropdown
    cartToggle.addEventListener('click', function(e) {
        e.preventDefault();
        cartDropdown.classList.toggle('active');
    });
    
    // Close cart when clicking the close button
    closeCart.addEventListener('click', function() {
        cartDropdown.classList.remove('active');
    });
    
    // Close cart when clicking outside
    document.addEventListener('click', function(e) {
        if (!cartDropdown.contains(e.target) && !cartToggle.contains(e.target)) {
            cartDropdown.classList.remove('active');
        }
    });

    // Example function to add item to cart
    function addToCart(item) {
        const cartItems = document.querySelector('.cart-items');
        const emptyCart = document.querySelector('.empty-cart');
        
        if (emptyCart) {
            emptyCart.style.display = 'none';
        }
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">₪${item.price}</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn">-</button>
                    <span class="quantity-number">1</span>
                    <button class="quantity-btn">+</button>
                </div>
            </div>
            <button class="remove-item">×</button>
        `;
        
        cartItems.appendChild(cartItem);
        updateCartCount();
    }
    
    // Update cart count
    function updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        const itemCount = document.querySelectorAll('.cart-item').length;
        cartCount.textContent = itemCount;
    }
});

//nav menu
document.addEventListener('DOMContentLoaded', function() {
    // Handle mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Handle mobile submenu toggles
    const menuItems = document.querySelectorAll('.has-submenu');
    
    if (window.innerWidth <= 768) {
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.has-submenu')) {
                    e.preventDefault();
                    item.classList.toggle('active');
                }
            });
        });
    }

    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-links')) {
            menuItems.forEach(item => {
                item.classList.remove('active');
            });
            if (window.innerWidth <= 768) {
                navLinks.classList.remove('active');
            }
        }
    });
});