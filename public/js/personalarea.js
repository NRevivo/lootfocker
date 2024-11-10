document.addEventListener('DOMContentLoaded', function() {
    const loadingMessage = document.getElementById('loading-message');
    const errorMessage = document.getElementById('error-message');
    const ordersList = document.getElementById('orders-list');

    async function loadOrders() {
        // מסתיר את שתי ההודעות בהתחלה
        errorMessage.style.display = 'none';
        loadingMessage.style.display = 'block';
        
        try {
            const rawUserId = sessionStorage.getItem('userId');
            console.log('Raw userId from session:', rawUserId);

            if (!rawUserId) {
                ordersList.innerHTML = '<p>אנא התחבר כדי לצפות בהזמנות שלך</p>';
                loadingMessage.style.display = 'none';
                return;
            }

            const userId = rawUserId.replace(/^"|"$/g, '');
            const response = await fetch(`/api/orders/${userId}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const orders = await response.json();
            
            // מציג את ההזמנות ומסתיר את הודעת השגיאה
            displayOrders(orders);
            errorMessage.style.display = 'none';

        } catch (error) {
            console.error('Error loading orders:', error);
            // מציג את הודעת השגיאה רק במקרה של שגיאה
            errorMessage.style.display = 'block';
            ordersList.innerHTML = ''; // מנקה את רשימת ההזמנות במקרה של שגיאה
        } finally {
            // מסתיר את הודעת הטעינה בכל מקרה
            loadingMessage.style.display = 'none';
        }
    }

    function displayOrders(orders) {
        ordersList.innerHTML = '';

        if (!orders || orders.length === 0) {
            ordersList.innerHTML = '<p class="no-orders">אין הזמנות זמינות</p>';
            return;
        }

        orders.forEach(order => {
            const orderDiv = document.createElement('div');
            orderDiv.classList.add('order-card');

            // יצירת מספר הזמנה קצר מה-ID המלא
            const shortOrderId = order._id.slice(-6).toUpperCase();
            
            const orderDate = order.orderDate ? 
                new Date(order.orderDate).toLocaleDateString('he-IL') : 
                'תאריך לא זמין';

            let shoesContent = '';
            if (order.shoes && Array.isArray(order.shoes)) {
                shoesContent = order.shoes.map(shoe => {
                    const shoeData = shoe.shoeId || {};
                    return `
                        <div class="shoe-item">
                            <img src="${shoeData.images?.[0] || '/images/no-image.jpg'}" 
                                 class="order-image" 
                                 alt="תמונת מוצר">
                            <div class="shoe-details">
                                <p class="shoe-name">${shoeData.name || 'שם לא זמין'}</p>
                                <p class="shoe-quantity">כמות: ${shoe.quantity || 0}</p>
                                <p class="shoe-price">מחיר: ₪${shoeData.price?.toFixed(2) || '0.00'}</p>
                            </div>
                        </div>
                    `;
                }).join('');
            }

            orderDiv.innerHTML = `
                <div class="order-header">
                    <div class="order-title">
                        <div class="order-id"> ${shortOrderId} הזמנה מס׳</div>
                        <span class="order-date">${orderDate}</span>
                        <span class="status ${order.status}">${getStatusText(order.status)}</span>
                    </div>
                    <p class="order-summary">סה"כ הזמנה: ₪${order.totalAmount?.toFixed(2) || '0.00'}</p>
                </div>
                <div class="order-content">
                    <div class="order-main">
                        <div class="products-section">
                            ${shoesContent}
                        </div>
                        <div class="shipping-info">
                            <h3>כתובת למשלוח:</h3>
                            <p>${order.shippingAddress?.street || ''}</p>
                            <p>${order.shippingAddress?.city || ''}</p>
                        </div>
                    </div>
                </div>
            `;

            ordersList.appendChild(orderDiv);
        });
    }

    function getStatusText(status) {
        const statusMap = {
            'pending': 'ממתין לאישור',
            'shipped': 'נשלח',
            'delivered': 'נמסר',
            'cancelled': 'בוטל'
        };
        return statusMap[status] || status;
    }

    // התחלת טעינת ההזמנות
    loadOrders();
});