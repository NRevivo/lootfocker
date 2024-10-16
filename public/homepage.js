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

// Add this outside of the DOMContentLoaded event listener
window.addEventListener('load', function() {
    const modal = document.getElementById("loginModal");
    if (modal) {
        modal.style.display = "none";
    }
});