document.addEventListener('DOMContentLoaded', function () {
    loadCartItems();
    initializePayPalButton();
});

async function loadCartItems() {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
        console.error("User ID not found.");
        return;
    }

    try {
        const response = await fetch(`/api/cart/${userId}`);
        const data = await response.json();

        if (data.success && data.cart) {
            displayCartItems(data.cart);
        } else {
            document.querySelector('.cart-items-list').innerHTML = '<p>Your cart is empty.</p>';
        }
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

function displayCartItems(cart) {
    const cartItemsContainer = document.querySelector('.cart-items-list');
    let html = '';
    let totalPrice = 0;
    const shoes = cart.map(item => ({ shoeId: item.shoeId._id, quantity: item.quantity }));

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

    html += `
        <div class="cart-total">
            <strong>Total Price:</strong> $${totalPrice.toFixed(2)}
        </div>
    `;
    cartItemsContainer.innerHTML = html;
    
    // Store total price and shoes for checkout
    sessionStorage.setItem('totalPrice', totalPrice.toFixed(2));
    sessionStorage.setItem('shoes', JSON.stringify(shoes));
}

function initializePayPalButton() {
    paypal.Buttons({
        createOrder: async function () {
            const totalPrice = sessionStorage.getItem('totalPrice');
            if (!totalPrice) {
                alert("Total price not found.");
                return false;
            }
            const response = await fetch('/api/create-paypal-order', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    totalAmount: totalPrice,
                    shipping: getShippingDetails()
                })
            });
    
            const data = await response.json();
            return data.orderID;
        },
        onApprove: async function (data) {
            // אסוף פרטי משלוח מהטופס
            const shippingDetails = getShippingDetails();
        
            // הוסף לוג לפני שליחת הנתונים לשרת
            console.log('Sending data to server:', {
                orderID: data.orderID,
                userId: sessionStorage.getItem('userId'),
                shoes: JSON.parse(sessionStorage.getItem('shoes')),
                totalAmount: sessionStorage.getItem('totalPrice'),
                shipping: shippingDetails
            });
        
            try {
                // שלח את הבקשה לשרת
                const response = await fetch('/api/capture-paypal-order', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        orderID: data.orderID,
                        userId: sessionStorage.getItem('userId'),
                        shoes: JSON.parse(sessionStorage.getItem('shoes')),
                        totalAmount: sessionStorage.getItem('totalPrice'),
                        shipping: shippingDetails
                    })
                });
        
                const result = await response.json();
        
                if (result.success) {
                    alert(`ההזמנה בוצעה בהצלחה! מספר ההזמנה שלך: ${data.orderID}`);
                 
                    // איפוס העגלה בצד הלקוח
                    sessionStorage.removeItem('shoes');
                    sessionStorage.removeItem('totalPrice');
                    document.querySelector('.cart-items-list').innerHTML = '<p>Your cart is empty.</p>';
                    
                } else {
                    alert(`שגיאה באישור התשלום: ${result.error || 'Unknown error'}`);
                }
            } catch (error) {
                console.error('Error capturing PayPal order:', error);
                alert("שגיאה בביצוע ההזמנה. אנא נסה שוב.");
            }
        }
        
    }).render('#paypal-button-container');    
}

function getShippingDetails() {
    const shippingDetails = {
        fullName: document.getElementById('fullName').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        postalCode: document.getElementById('postalCode').value,
        phone: document.getElementById('phone').value
    };
    console.log('Shipping details being sent:', shippingDetails);
    return shippingDetails;
}


