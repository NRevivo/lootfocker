document.addEventListener('DOMContentLoaded', function() {
    // Load header and footer dynamically
    function loadContent(url, containerId, callback) {
        fetch(url)
            .then(response => response.text())
            .then(data => {
                document.getElementById(containerId).innerHTML = data;
                if (callback) callback(); // הפעלת הפונקציה לאחר הטעינה
            })
            .catch(error => console.error(`Error loading ${url}:`, error));
    }

    // Load header and footer with event listeners setup after loading
    loadContent('header.html', 'header-container', initializeEventListeners);
    loadContent('footer.html', 'footer-container');

    // Function to initialize event listeners after header is loaded
    function initializeEventListeners() {
        // Modal functionality for Login/Register
        const modal = document.getElementById("loginModal");
        const loginLink = document.querySelector(".login-register a");
        const closeModal = document.querySelector(".close");

        modal.style.display = "none";
        loginLink.addEventListener("click", function(event) {
            event.preventDefault();
            modal.style.display = "flex"; 
        });

        if (closeModal) {
            closeModal.addEventListener("click", function() {
                modal.style.display = "none";
            });
        }

        window.addEventListener("click", function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        });

        // Cart dropdown functionality
        const cartToggle = document.getElementById('cartToggle');
        const cartDropdown = document.getElementById('cartDropdown');
        const closeCart = document.getElementById('closeCart');

        cartToggle.addEventListener('click', function(e) {
            e.preventDefault();
            cartDropdown.classList.toggle('active');
        });

        closeCart.addEventListener('click', function() {
            cartDropdown.classList.remove('active');
        });

        document.addEventListener('click', function(e) {
            if (!cartDropdown.contains(e.target) && !cartToggle.contains(e.target)) {
                cartDropdown.classList.remove('active');
            }
        });
        
        // Admin button toggle (add this after modal and login functionality)
        function addAdminButton() {
    if (sessionStorage.getItem("isAdmin")) {
        const navLinks = document.querySelector(".nav-links");

        // בדוק אם כפתור Admin כבר קיים כדי למנוע כפילות
        if (!document.querySelector(".admin-link")) {
            const adminItem = document.createElement("li");
            adminItem.classList.add("menu-item", "admin-link");
            adminItem.innerHTML = `<a href="admin.html" class="admin-button">Admin</a>`;
            navLinks.appendChild(adminItem);
        }
    }
}


        const loginForm = modal.querySelector("form");
        loginForm.addEventListener("submit", function(event) {
            event.preventDefault();
            const email = event.target.email.value;
            const password = event.target.password.value;

            if (email === "admin@example.com" && password === "adminPassword") {
                sessionStorage.setItem("isAdmin", true);
                alert("התחברת כ-admin בהצלחה!");
                addAdminButton();
            } else {
                alert("פרטי ההתחברות שגויים.");
            }

            event.target.reset();
            modal.style.display = "none";
        });

        addAdminButton(); // קרא לפונקציה אם כבר ישנו כפתור admin
    }

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

    // Add to cart functionality
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

    
});


