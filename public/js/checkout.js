document.addEventListener('DOMContentLoaded', function () {
    loadCartItems();
    initializePayPalButton();
});

// Function to load cart items
async function loadCartItems() {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
        console.error("User ID not found.");
        return;
    }
    
    try {
        const response = await fetch(`/api/cart/${userId}`);
        const data = await response.json();
        console.log("Cart data:", data.cart); // בדיקה של נתוני העגלה
        if (data.success && data.cart) {
            displayCartItems(data.cart);
        } else {
            document.querySelector('.cart-items-list').innerHTML = '<p>Your cart is empty.</p>';
        }
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}


// Function to display cart items in the checkout page
// Function to display cart items in the checkout page
function displayCartItems(cart) {
    const cartItemsContainer = document.querySelector('.cart-items-list');
    let html = '';
    let totalPrice = 0;

    cart.forEach(item => {
        const itemTotal = item.shoeId.price * item.quantity;
        totalPrice += itemTotal;

        html += `
            <div class="cart-item">
                <img src="${item.shoeId.images[0]}" alt="${item.shoeId.name}">
                <div>
                    <h4>${item.shoeId.name}</h4>
                    <p>Quantity: ${item.quantity}</p>
                    <p>Price: $${itemTotal.toFixed(2)}</p>
                </div>
            </div>
        `;
    });

    // הוספת הסכום הכולל בסוף הרשימה
    html += `
        <div class="cart-total">
            <strong>Total Price:</strong> $${totalPrice.toFixed(2)}
        </div>
    `;

    cartItemsContainer.innerHTML = html;
}


// Function to initialize PayPal payment button
function initializePayPalButton() {
    paypal.Buttons({
        createOrder: function () {
            const form = document.getElementById('shippingForm');
            if (!form.checkValidity()) {
                alert('Please fill in all required shipping details.');
                return false;
            }

            return fetch('/api/create-paypal-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    items: getCartItemsForCheckout(),
                    shipping: getShippingDetails()
                })
            }).then(res => res.json()).then(data => {
                if (data && data.orderID) {
                    return data.orderID;
                } else {
                    throw new Error('Failed to create order');
                }
            });
        },
        onApprove: function (data) {
            return fetch('/api/capture-paypal-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    orderID: data.orderID
                })
            }).then(response => {
                if (response.ok) {
                    alert('Purchase completed successfully!');
                    window.location.href = '/confirmation.html';
                }
            });
        }
    }).render('#paypal-button-container');
}


// Helper function to gather cart items in a specific format for checkout
function getCartItemsForCheckout() {
    const items = [];
    document.querySelectorAll('.cart-item').forEach(itemElement => {
        console.log(itemElement.innerHTML); // בדוק את מבנה ה-HTML המלא של כל פריט בעגלה
        items.push({
            id: itemElement.getAttribute('data-item-id'),
            quantity: parseInt(itemElement.querySelector('.quantity').textContent)
        });
    });
    return items;
}

// Helper function to gather shipping details from the form
function getShippingDetails() {
    return {
        fullName: document.getElementById('fullName').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        postalCode: document.getElementById('postalCode').value,
        phone: document.getElementById('phone').value
    };
}
