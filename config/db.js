const mongoose = require('mongoose');

// התחברות ל-MongoDB
mongoose.connect('mongodb://localhost:27017/lootfocker')
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

// הגדרת סכמת מוצר (Product Schema)
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  stock: { type: Number, required: true },
  images: [String], // מערך של כתובות תמונות
  sizes: [String], // מידות זמינות
  colors: [String], // צבעים זמינים
  dateAdded: { type: Date, default: Date.now }
});

// יצירת מודל מוצר
const Product = mongoose.model('Product', productSchema);

// הגדרת סכמת משתמש (User Schema)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: {
    street: String,
    city: String,
    zip: String,
    country: String
  },
  phone: String,
  isAdmin: { type: Boolean, default: false },
  dateJoined: { type: Date, default: Date.now }
});

// יצירת מודל משתמש
const User = mongoose.model('User', userSchema);

// הגדרת סכמת הזמנה (Order Schema)
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true }
    }
  ],
  totalAmount: { type: Number, required: true },
  shippingAddress: {
    street: String,
    city: String,
    zip: String,
    country: String
  },
  status: { type: String, default: 'Pending' }, // סטטוס הזמנה: Pending, Shipped, Delivered
  dateOrdered: { type: Date, default: Date.now }
});

// יצירת מודל הזמנה
const Order = mongoose.model('Order', orderSchema);

// ייצוא המודלים לשימוש בקבצים אחרים
module.exports = {
  Product,
  User,
  Order
};
