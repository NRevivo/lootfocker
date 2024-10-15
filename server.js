const express = require('express');
const app = express();
const port = 3000;

// חיבור למסד הנתונים (יבוא קובץ החיבור שיצרת - db.js)
const { Product } = require('./config/db');
; // ייבוא כל המודלים כולל Product

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

// יצירת מוצר לדוגמה - ניתן להפעיל את הפונקציה הזו לצורך בדיקה
createTestProduct(); 

// הפעלת השרת
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
