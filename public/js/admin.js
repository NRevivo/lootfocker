document.addEventListener('DOMContentLoaded', function() {
    // בדיקת הרשאות משתמש
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const isAdmin = sessionStorage.getItem('isAdmin');

    // אם המשתמש לא מחובר או לא אדמין, להפנות אותו חזרה לעמוד הבית
    if (isLoggedIn !== 'true' || isAdmin !== 'true') {
        alert('Access denied: Admins only.');
        window.location.href = '/homepage.html';
        return; // לעצור את המשך הקוד אם המשתמש לא מורשה
    }

    // אם המשתמש מורשה, המשך לטעינת תוכן ה-Admin
    initializeAdminPanel();
});

function initializeAdminPanel() {
    // קוד אתחול עבור פאנל הניהול
    // כאן נטען את כל הפונקציות הקיימות כמו loadShoes, loadUsers, וכו'
    loadShoes();
    loadUsers();
    loadOrders();
    loadGroupedOrders();
    // וכל פונקציה אחרת הדרושה לפאנל האדמין
}

// Loading state utilities
function showLoading(tableId) {
    const tbody = document.getElementById(`${tableId}TableBody`);
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">  <!-- שינוי מ-7 ל-8 -->
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </td>
            </tr>
        `;
    }
}

function showError(tableId, message) {
    const tbody = document.getElementById(`${tableId}TableBody`);
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-danger">  <!-- שינוי מ-7 ל-8 -->
                    ${message}
                </td>
            </tr>
        `;
    }
}
// API Functions
async function loadShoes() {
    showLoading('shoes');
    try {
        const response = await fetch('/api/shoes');
        if (!response.ok) throw new Error('Failed to load shoes');
        const shoes = await response.json();
        
        const tbody = document.getElementById('shoesTableBody');
        if (tbody) {
            tbody.innerHTML = shoes.map(shoe => `
                <tr>
                    <td>
                       <img 
    src="${shoe.images && shoe.images[0] ? shoe.images[0] : '/images/no-image.jpg'}" 
    alt="${shoe.name}"
>
                    </td>
                    <td>${shoe._id}</td>
                    <td>${shoe.brand || '-'}</td>
                    <td>${shoe.name}</td>
                    <td>$${shoe.price}</td>
                    <td>${shoe.sizes ? shoe.sizes.join(', ') : '-'}</td>
                    <td>${shoe.stock}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editShoe('${shoe._id}')">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteShoe('${shoe._id}')">Delete</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading shoes:', error);
        showError('shoes', 'Failed to load shoes. Please try again.');
    }
}

async function loadUsers() {
    showLoading('users');
    try {
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('Failed to load users');
        const users = await response.json();
        
        const tbody = document.getElementById('usersTableBody');
        if (tbody) {
            tbody.innerHTML = users.map(user => `
                <tr>
                    <td>${user._id}</td>
                    <td>${user.fullName}</td>
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="deleteUser('${user._id}')">Delete</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showError('users', 'Failed to load users. Please try again.');
    }
}

async function loadOrders() {
    showLoading('orders');
    try {
        const response = await fetch('/api/orders');
        if (!response.ok) throw new Error('Failed to load orders');
        const orders = await response.json();
        
        const tbody = document.getElementById('ordersTableBody');
        if (tbody) {
            tbody.innerHTML = orders.map(order => `
                <tr>
                    <td>${order._id}</td>
                    <td>${order.userId}</td>
                    <td>${new Date(order.orderDate).toLocaleDateString()}</td>
                    <td>$${order.totalAmount}</td>
                    <td>${order.status}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="deleteOrder('${order._id}')">Delete</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        showError('orders', 'Failed to load orders. Please try again.');
    }
}

async function loadGroupedOrders() {
    showLoading('groupedOrders');
    try {
        const response = await fetch('/api/orders');
        if (!response.ok) throw new Error('Failed to load orders');
        const orders = await response.json();
        
        const groupedOrders = orders.reduce((acc, order) => {
            if (!acc[order.userId]) {
                acc[order.userId] = {
                    userId: order.userId,
                    totalOrders: 0,
                    totalAmount: 0
                };
            }
            acc[order.userId].totalOrders++;
            acc[order.userId].totalAmount += order.totalAmount;
            return acc;
        }, {});

        const groupedArray = Object.values(groupedOrders).map(group => ({
            ...group,
            averageOrder: group.totalAmount / group.totalOrders
        }));
        
        const tbody = document.getElementById('groupedOrdersTableBody');
        if (tbody) {
            tbody.innerHTML = groupedArray.map(group => `
                <tr>
                    <td>${group.userId}</td>
                    <td>${group.totalOrders}</td>
                    <td>$${group.totalAmount.toFixed(2)}</td>
                    <td>$${group.averageOrder.toFixed(2)}</td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading grouped orders:', error);
        showError('groupedOrders', 'Failed to load grouped orders. Please try again.');
    }
}

// Delete functions
async function deleteShoe(id) {
    if (confirm('Are you sure you want to delete this shoe?')) {
        try {
            const response = await fetch(`/api/shoes/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Failed to delete shoe');
            
            // Reload the table
            loadShoes();
        } catch (error) {
            console.error('Error deleting shoe:', error);
            alert('Failed to delete shoe. Please try again.');
        }
    }
}

async function deleteUser(id) {
    if (confirm('Are you sure you want to delete this user?')) {
        try {
            const response = await fetch(`/api/users/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Failed to delete user');
            
            // Reload the table
            loadUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user. Please try again.');
        }
    }
}

async function deleteOrder(id) {
    if (confirm('Are you sure you want to delete this order?')) {
        try {
            const response = await fetch(`/api/orders/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Failed to delete order');
            
            // Reload the table
            loadOrders();
        } catch (error) {
            console.error('Error deleting order:', error);
            alert('Failed to delete order. Please try again.');
        }
    }
}

// Initialize admin panel functionality
document.addEventListener('DOMContentLoaded', function() {
    const buttons = {
        shoes: document.querySelector('.btn.blue'),
        users: document.querySelector('.btn.yellow'),
        orders: document.querySelector('.btn.black'),
        groupedOrders: document.querySelector('.btn.red')
    };

    function hideAllTables() {
        document.querySelectorAll('.dynamic-table').forEach(table => {
            table.style.display = 'none';
        });
        document.querySelector('.data-display-section').style.display = 'block';
    }

    if (buttons.shoes) {
        buttons.shoes.addEventListener('click', function() {
            hideAllTables();
            const shoesTable = document.getElementById('shoesTable');
            if (shoesTable) {
                shoesTable.style.display = 'block';
                loadShoes();
            }
        });
    }

    if (buttons.users) {
        buttons.users.addEventListener('click', function() {
            hideAllTables();
            const usersTable = document.getElementById('usersTable');
            if (usersTable) {
                usersTable.style.display = 'block';
                loadUsers();
            }
        });
    }

    if (buttons.orders) {
        buttons.orders.addEventListener('click', function() {
            hideAllTables();
            const ordersTable = document.getElementById('ordersTable');
            if (ordersTable) {
                ordersTable.style.display = 'block';
                loadOrders();
            }
        });
    }

    if (buttons.groupedOrders) {
        buttons.groupedOrders.addEventListener('click', function() {
            hideAllTables();
            const groupedOrdersTable = document.getElementById('groupedOrdersTable');
            if (groupedOrdersTable) {
                groupedOrdersTable.style.display = 'block';
                loadGroupedOrders();
            }
        });
    }
});

function openAddShoeModal() {
    const modal = new bootstrap.Modal(document.getElementById('addShoeModal'));
    modal.show();
}

function submitNewShoe() {
    // Get all form values
    const name = document.getElementById('shoeName').value;
    const description = document.getElementById('shoeDescription').value;
    const price = document.getElementById('shoePrice').value;
    const category = document.getElementById('shoeCategory').value;
    const brand = document.getElementById('shoeBrand').value;
    const sizesStr = document.getElementById('shoeSizes').value;
    const colorsStr = document.getElementById('shoeColors').value;
    const stock = document.getElementById('shoeStock').value;
    const imagesStr = document.getElementById('shoeImages').value;

    // Convert comma-separated strings to arrays
    const sizes = sizesStr.split(',').map(size => Number(size.trim())).filter(Boolean);
    const colors = colorsStr.split(',').map(color => color.trim()).filter(Boolean);
    const images = imagesStr.split(',').map(url => url.trim()).filter(Boolean);

    // Create shoe object exactly matching the schema
    const shoeData = {
        name,                    // required
        description,            // optional
        price: Number(price),   // required
        category,               // optional
        brand,                  // optional
        sizes,                  // optional array
        colors,                // optional array
        stock: Number(stock),  // required
        images                 // optional array
    };

    // Validate required fields
    if (!shoeData.name || !shoeData.price || !shoeData.stock) {
        alert('Name, price and stock are required fields');
        return;
    }

    // Send to server
    fetch('/api/shoes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(shoeData)
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to add shoe');
        return response.json();
    })
    .then(() => {
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addShoeModal'));
        modal.hide();
        
        // Clear form
        document.getElementById('addShoeForm').reset();
        
        // Reload shoes table
        loadShoes();
    })
    .catch(error => {
        console.error('Error adding shoe:', error);
        alert('Failed to add shoe. Please try again.');
    });
}
// פונקציה שנקראת כשלוחצים על כפתור Edit
async function editShoe(id) {
    try {
        const response = await fetch(`/api/shoes/${id}`);
        if (!response.ok) throw new Error('Failed to load shoe');
        const shoe = await response.json();
        
        // מילוי הטופס בנתונים הקיימים
        document.getElementById('editShoeId').value = shoe._id;
        document.getElementById('editShoeName').value = shoe.name || '';
        document.getElementById('editShoeDescription').value = shoe.description || '';
        document.getElementById('editShoePrice').value = shoe.price || '';
        document.getElementById('editShoeCategory').value = shoe.category || '';
        document.getElementById('editShoeBrand').value = shoe.brand || '';
        document.getElementById('editShoeSizes').value = shoe.sizes ? shoe.sizes.join(', ') : '';
        document.getElementById('editShoeColor').value = shoe.color || '';
        document.getElementById('editShoeStock').value = shoe.stock || '';
        document.getElementById('editShoeImages').value = shoe.images ? shoe.images.join(', ') : '';

        // פתיחת המודל
        const modal = new bootstrap.Modal(document.getElementById('editShoeModal'));
        modal.show();
    } catch (error) {
        console.error('Error loading shoe details:', error);
        alert('Failed to load shoe details. Please try again.');
    }
}

// פונקציה לשמירת השינויים
async function updateShoe() {
    const id = document.getElementById('editShoeId').value;
    
    // איסוף כל הנתונים מהטופס
    const name = document.getElementById('editShoeName').value;
    const description = document.getElementById('editShoeDescription').value;
    const price = document.getElementById('editShoePrice').value;
    const category = document.getElementById('editShoeCategory').value;
    const brand = document.getElementById('editShoeBrand').value;
    const sizesStr = document.getElementById('editShoeSizes').value;
    const color = document.getElementById('editShoeColor').value;
    const stock = document.getElementById('editShoeStock').value;
    const imagesStr = document.getElementById('editShoeImages').value;
    

    // המרת מחרוזות מופרדות בפסיקים למערכים
    const sizes = sizesStr.split(',').map(size => Number(size.trim())).filter(Boolean);
    const images = imagesStr.split(',').map(url => url.trim()).filter(Boolean);

    // יצירת אובייקט הנעל המעודכן
    const shoeData = {
        name,
        description,
        price: Number(price),
        category,
        brand,
        sizes,
        color,
        stock: Number(stock),
        images
    };

    // וולידציה של שדות חובה
    if (!shoeData.name || !shoeData.price || !shoeData.stock) {
        alert('Name, price and stock are required fields');
        return;
    }

    try {
        const response = await fetch(`/api/shoes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(shoeData)
        });
        
        if (!response.ok) throw new Error('Failed to update shoe');
        
        // סגירת המודל
        const modal = bootstrap.Modal.getInstance(document.getElementById('editShoeModal'));
        modal.hide();
        
        // טעינה מחדש של הטבלה
        loadShoes();
        
        alert('Shoe updated successfully!');
    } catch (error) {
        console.error('Error updating shoe:', error);
        alert('Failed to update shoe. Please try again.');
    }
}
// פונקציה לטעינת הגרפים והצגת כמות דגמי נעליים לפי מותג וקטגוריה
document.addEventListener('DOMContentLoaded', function () {
    loadCharts(); // קריאה לטעינת הגרפים
});

// פונקציה ליצירת גרף דגמי נעליים לפי מותג
function createBrandChart(data) {
    const svg = d3.select("#brandChart")
        .append("svg")
        .attr("width", 500)
        .attr("height", 400)
        .style("overflow", "visible");

    const brandCounts = d3.rollup(data, v => v.length, d => d.brand);
    const brands = Array.from(brandCounts.keys());
    const counts = Array.from(brandCounts.values());

    const x = d3.scaleBand()
        .domain(brands)
        .range([0, 400])
        .padding(0.3);

    const y = d3.scaleLinear()
        .domain([0, d3.max(counts) + 10])
        .range([300, 0]);

    // הוספת כותרת גרף
    svg.append("text")
        .attr("x", 250)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("fill", "#333")
        .text("Number of Shoe Models by Brand");

    // הוספת קווי רשת מעודנים
    svg.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(50,0)")
        .call(d3.axisLeft(y).ticks(6).tickSize(-400).tickFormat(''))
        .selectAll("line")
        .style("stroke", "#e0e0e0");

    // ציור עמודות עם צבע מעבר והצללה
    svg.append("g")
        .selectAll("rect")
        .data(brands)
        .enter()
        .append("rect")
        .attr("x", d => x(d) + 50)
        .attr("y", d => y(brandCounts.get(d)))
        .attr("width", x.bandwidth())
        .attr("height", d => 300 - y(brandCounts.get(d)))
        .attr("fill", "url(#gradientBrand)")
        .attr("rx", 5); // קצוות מעוגלים

    // הגדרת מעבר צבע לעמודות
    svg.append("defs")
        .append("linearGradient")
        .attr("id", "gradientBrand")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%")
        .selectAll("stop")
        .data([
            { offset: "0%", color: "#42a5f5" },
            { offset: "100%", color: "#bbdefb" }
        ])
        .enter().append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

    // הוספת ערכים מספריים מעל כל עמודה
    svg.selectAll("text.value")
        .data(brands)
        .enter()
        .append("text")
        .attr("class", "value")
        .attr("x", d => x(d) + x.bandwidth() / 2 + 50)
        .attr("y", d => y(brandCounts.get(d)) - 10)
        .attr("text-anchor", "middle")
        .style("fill", "#333")
        .style("font-weight", "bold")
        .text(d => brandCounts.get(d));

    // הוספת שמות המותגים מתחת לעמודות
    svg.append("g")
        .attr("transform", "translate(50,300)")
        .call(d3.axisBottom(x));
}

// פונקציה ליצירת גרף דגמי נעליים לפי קטגוריה
function createCategoryChart(data) {
    const svg = d3.select("#categoryChart")
        .append("svg")
        .attr("width", 500)
        .attr("height", 400)
        .style("overflow", "visible");

    const categoryCounts = d3.rollup(data, v => v.length, d => d.category);
    const categories = Array.from(categoryCounts.keys());
    const counts = Array.from(categoryCounts.values());

    const x = d3.scaleBand()
        .domain(categories)
        .range([0, 400])
        .padding(0.3);

    const y = d3.scaleLinear()
        .domain([0, d3.max(counts) + 10])
        .range([300, 0]);

    // הוספת כותרת גרף
    svg.append("text")
        .attr("x", 250)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("fill", "#333")
        .text("Number of Shoe Models by Category");

    // הוספת קווי רשת מעודנים
    svg.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(50,0)")
        .call(d3.axisLeft(y).ticks(6).tickSize(-400).tickFormat(''))
        .selectAll("line")
        .style("stroke", "#e0e0e0");

    // ציור עמודות עם צבע מעבר והצללה
    svg.append("g")
        .selectAll("rect")
        .data(categories)
        .enter()
        .append("rect")
        .attr("x", d => x(d) + 50)
        .attr("y", d => y(categoryCounts.get(d)))
        .attr("width", x.bandwidth())
        .attr("height", d => 300 - y(categoryCounts.get(d)))
        .attr("fill", "url(#gradientCategory)")
        .attr("rx", 5); // קצוות מעוגלים

    // הגדרת מעבר צבע לעמודות
    svg.append("defs")
        .append("linearGradient")
        .attr("id", "gradientCategory")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%")
        .selectAll("stop")
        .data([
            { offset: "0%", color: "#ab47bc" },
            { offset: "100%", color: "#e1bee7" }
        ])
        .enter().append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

    // הוספת ערכים מספריים מעל כל עמודה
    svg.selectAll("text.value")
        .data(categories)
        .enter()
        .append("text")
        .attr("class", "value")
        .attr("x", d => x(d) + x.bandwidth() / 2 + 50)
        .attr("y", d => y(categoryCounts.get(d)) - 10)
        .attr("text-anchor", "middle")
        .style("fill", "#333")
        .style("font-weight", "bold")
        .text(d => categoryCounts.get(d));

    // הוספת שמות הקטגוריות מתחת לעמודות
    svg.append("g")
        .attr("transform", "translate(50,300)")
        .call(d3.axisBottom(x));
}

// פונקציה לטעינת הנתונים ויצירת הגרפים
async function loadCharts() {
    try {
        const response = await fetch('/api/shoes');
        if (!response.ok) throw new Error('Failed to load shoe data');
        const shoes = await response.json();
        
        createBrandChart(shoes);
        createCategoryChart(shoes);
    } catch (error) {
        console.error('Error loading charts:', error);
    }
}
