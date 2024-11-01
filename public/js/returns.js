document.addEventListener('DOMContentLoaded', function() {
    // Load header and footer dynamically with callback for event listeners
    
    
    
    function loadContent(url, containerId, callback) {
        fetch(url)
            .then(response => response.text())
            .then(data => {
                document.getElementById(containerId).innerHTML = data;
                if (callback) callback(); // הפעלת הפונקציה לאחר טעינת התוכן
            })
            .catch(error => console.error(`Error loading ${url}:`, error));
    }

    // Load header and footer, then initialize event listeners
    loadContent('header.html', 'header-container', initializeEventListeners);
    loadContent('footer.html', 'footer-container');

    // Function to initialize event listeners for modal and cart
    function initializeEventListeners() {
        // Modal functionality for Login/Register
        const modal = document.getElementById("loginModal");
        const loginLink = document.querySelector(".login-register a");

        if (modal) {
            modal.style.display = "none";

            // Show modal when clicking Login/Register
            if (loginLink) {
                loginLink.addEventListener("click", function(event) {
                    event.preventDefault();
                    modal.style.display = "flex";
                });
            }

            // Close modal on "X" button click
            const closeModal = modal.querySelector(".close");
            if (closeModal) {
                closeModal.addEventListener("click", function() {
                    modal.style.display = "none";
                });
            }

            // Close modal when clicking outside of it
            window.addEventListener("click", function(event) {
                if (event.target === modal) {
                    modal.style.display = "none";
                }
            });
        }

        // Cart dropdown functionality
        const cartToggle = document.getElementById('cartToggle');
        const cartDropdown = document.getElementById('cartDropdown');
        const closeCart = document.getElementById('closeCart');

        if (cartToggle && cartDropdown) {
            cartToggle.addEventListener('click', function(e) {
                e.preventDefault();
                cartDropdown.classList.toggle('active');
            });

            if (closeCart) {
                closeCart.addEventListener('click', function() {
                    cartDropdown.classList.remove('active');
                });
            }

            document.addEventListener('click', function(e) {
                if (!cartDropdown.contains(e.target) && !cartToggle.contains(e.target)) {
                    cartDropdown.classList.remove('active');
                }
            });
        }
    }
});
