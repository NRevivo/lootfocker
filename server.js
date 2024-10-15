const express = require('express');
const app = express();
const port = 3000;

// חיבור למסד הנתונים (יבוא קובץ החיבור שיצרת - db.js)
const { Product, User, Order } = require('./config/db'); // ייבוא כל המודלים כולל Product, User, Order

// Middleware - להגדיר את השרת לעבודה עם JSON
app.use(express.json());

// דוגמה לנתיב פשוט
app.get('/', (req, res) => {
  res.send('ברוך הבא לאתר LootFocker!');
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

// פונקציה ליצירת מוצר לדוגמה
async function createTestProduct() {
  const product = new Product({
    name: 'נעל ספורט',
    description: 'נעל קלה ונוחה לפעילות גופנית',
    price: 120,
    category: 'נעליים',
    stock: 30,
    images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    sizes: ['38', '39', '40'],
    colors: ['שחור', 'כחול']
  });

  try {
    const result = await product.save();
    console.log('Product created successfully:', result);
  } catch (error) {
    console.error('Error creating product:', error);
  }
}

// נתיב ליצירת מוצר חדש
app.post('/api/products', async (req, res) => {
  try {
    const { name, description, price, category, stock, images, sizes, colors } = req.body;

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
      colors
    });

    await product.save();
    res.status(201).send(product);
  } catch (err) {
    console.error('Error while saving product:', err);
    res.status(500).send('Server Error');
  }
});


// יצירת מוצר לדוגמה - ניתן להפעיל את הפונקציה הזו לצורך בדיקה
createTestProduct(); 

// הפעלת השרת
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});