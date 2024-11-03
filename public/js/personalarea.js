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

    // Fetch orders for the logged-in user
async function fetchOrders() {
    try {
        const response = await fetch('/api/orders'); // Assuming you have an endpoint to fetch orders
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const orders = await response.json();
        displayOrders(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        document.getElementById('orders-list').innerHTML = '<p>שגיאה בעת טעינת ההזמנות</p>';
    }
}

// Function to display orders on the page
function displayOrders(orders) {
    const ordersList = document.getElementById('orders-list');
    ordersList.innerHTML = ''; // Clear existing content

    if (orders.length === 0) {
        ordersList.innerHTML = '<p>אין הזמנות זמינות</p>';
        return;
    }

    orders.forEach(order => {
        const orderDiv = document.createElement('div');
        orderDiv.classList.add('order-card');

        const orderDate = new Date(order.orderDate).toLocaleDateString();
        const orderImages = order.shoes.map(shoe => `<img src="${shoe.shoeId.images[0]}" class="order-image" alt="Product Image">`).join('');

        orderDiv.innerHTML = `
            <div class="order-header">
                <h2>הזמנה #${order._id}</h2>
                <span class="status">${order.status}</span>
            </div>
            <div class="order-content">
                <div>
                    <p class="order-info">נשלח אל: ${order.shippingAddress.street}, ${order.shippingAddress.city}</p>
                    <p class="order-info">תאריך: ${orderDate}</p>
                    <p class="order-summary">סה"כ הזמנה: ₪${order.totalAmount.toFixed(2)}</p>
                </div>
                <div class="order-details">
                    ${orderImages}
                </div>
            </div>
        `;

        ordersList.appendChild(orderDiv);
    });
}

// Call fetchOrders when the page loads
window.onload = fetchOrders;

});
