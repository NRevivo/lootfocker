const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// חיבור למסד הנתונים (יבוא קובץ החיבור שיצרת - db.js)
const { Product, User, Order } = require('./config/db'); // ייבוא כל המודלים כולל Product, User, Order

// Middleware - להגדיר את השרת לעבודה עם JSON
app.use(express.json());

// הגדרת תיקיית public כסטטית
app.use(express.static(path.join(__dirname, 'public')));

// דף ראשי
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'homepage.html'));
});

// נתיב לקבלת רשימת כל המוצרים
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find(); // שליפת כל המוצרים ממסד הנתונים
    res.json(products); // שליחה של המוצרים כ-JSON
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// נתיב ליצירת הזמנה חדשה
app.post('/api/orders', async (req, res) => {
  try {
    const { userId, products, totalAmount, shippingAddress } = req.body;

    // בדוק שכל השדות קיימים ובתקינות
    if (!userId || !products || !totalAmount || !shippingAddress) {
      return res.status(400).send('All fields are required.');
    }

    // צור אובייקט הזמנה חדש ושמור אותו
    const order = new Order({
      userId,
      products,
      totalAmount,
      shippingAddress
    });

    await order.save();
    res.status(201).send(order);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// נתיב ליצירת משתמש חדש
app.post('/api/users', async (req, res) => {
  try {
    const { email, password, address, paymentMethod, role } = req.body;

    // בדוק שכל השדות קיימים ובתקינות
    if (!email || !password) {
      return res.status(400).send('Email and password are required.');
    }

    // צור משתמש חדש ושמור אותו
    const user = new User({
      email,
      password,
      address,
      paymentMethod,
      role
    });

    await user.save();
    res.status(201).send(user);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// נתיב ליצירת מוצר חדש
app.post('/api/products', async (req, res) => {
  try {
    const { name, description, price, category, stock, images, sizes, colors, discountPercentage } = req.body;

    // בדוק שכל השדות הנדרשים קיימים
    if (!name || !description || !price || !category || !stock) {
      return res.status(400).send('All required fields must be provided.');
    }

    // צור מוצר חדש ושמור אותו במסד הנתונים
    const product = new Product({
      name,
      description,
      price,
      category,
      stock,
      images,
      sizes,
      colors,
      discountPercentage
    }); 

    await product.save();
    res.status(201).send(product);
  } catch (err) {
    console.error('Error while saving product:', err);
    res.status(500).send('Server Error');
  }
}); 

// נתיב לקבלת מוצרים במבצע
app.get('/api/products/discounts', async (req, res) => {
  try {
    const discountedProducts = await Product.find({ discountPercentage: { $gt: 0 } });
    res.json(discountedProducts);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// הפעלת השרת
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});