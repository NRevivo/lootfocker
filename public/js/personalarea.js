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

    // Fetch orders for the logged-in user based on userId
    async function fetchUserOrders(userId) {
        try {
            const response = await fetch(`/api/orders/${userId}`);
            if (!response.ok) throw new Error('Error fetching orders');
            
            const orders = await response.json();
            displayUserOrders(orders); // פונקציה שמציגה את ההזמנות למשתמש
        } catch (error) {
            console.error(error);
            document.getElementById('error-message').style.display = 'block';
        }
    }

    // Display orders function
    function displayUserOrders(orders) {
        const ordersList = document.getElementById('orders-list');
        ordersList.innerHTML = ''; // Clear previous content

        if (orders.length === 0) {
            ordersList.innerHTML = '<p>אין הזמנות זמינות.</p>';
            return;
        }

        orders.forEach(order => {
            const orderDiv = document.createElement('div');
            orderDiv.classList.add('order-card');

            const orderDate = new Date(order.orderDate).toLocaleDateString();
            const orderImages = order.shoes.map(shoe => 
                `<img src="${shoe.shoeId.images[0] || '/images/no-image.jpg'}" class="order-image" alt="Product Image">`
            ).join('');

            orderDiv.innerHTML = `
                <div class="order-header">
                    <h2>הזמנה #${order._id}</h2>
                    <span class="status">${order.status}</span>
                </div>
                <div class="order-content">
                    <p class="order-info">תאריך: ${orderDate}</p>
                    <p class="order-summary">סה"כ הזמנה: ₪${order.totalAmount.toFixed(2)}</p>
                    <div class="order-details">
                        ${orderImages}
                    </div>
                </div>
            `;

            ordersList.appendChild(orderDiv);
        });
    }

    // Check for userId and fetch orders if available
    const userId = sessionStorage.getItem('userId'); // נניח שה-id נשמר ב-session לאחר הכניסה
    if (userId) {
        document.getElementById('loading-message').style.display = 'block';
        fetchUserOrders(userId).then(() => {
            document.getElementById('loading-message').style.display = 'none';
        });
    } else {
        console.error("User ID not found. Please login again.");
        document.getElementById('orders-list').innerHTML = '<p>אנא התחבר כדי לראות את ההזמנות שלך.</p>';
    }
});
