const mongoose = require('mongoose');
const Joi = require('joi');
const bcrypt = require('bcrypt');

// התחברות ל-MongoDB Atlas
const connectionString = 'mongodb+srv://noamrevivo1:Noam1234@data.gcxe8.mongodb.net/';

mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB Atlas...'))
  .catch(err => console.error('Could not connect to MongoDB Atlas...', err));

// הגדרת סכמת מוצר (Product Schema)
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  stock: { type: Number, required: true },
  images: [String],
  sizes: [String],
  colors: [String],
  discountPercentage: { type: Number, min: 0, max: 90, default: 0 }, // אחוזי הנחה
  dateAdded: { type: Date, default: Date.now }
});

// יצירת מודל מוצר
const Product = mongoose.model('Product', productSchema);

// הגדרת סכמת משתמש (User Schema)
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return Joi.string().email().validate(v).error === undefined;
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  password: { type: String, required: true },
  address: {
    street: String,
    city: String,
    zip: String,
    country: String
  },
  paymentMethod: {
    cardNumber: {
      type: String,
      validate: {
        validator: function(v) {
          return /^[0-9]{13,19}$/.test(v); // כרטיס אשראי בפורמט תקין (13-19 ספרות)
        },
        message: props => `${props.value} is not a valid card number!`
      }
    },
    expiryDate: {
      type: String,
      validate: {
        validator: function(v) {
          return /^(0[1-9]|1[0-2])\/\d{2}$/.test(v); // תאריך תפוגה בפורמט MM/YY
        },
        message: props => `${props.value} is not a valid expiry date!`
      }
    },
    cardHolderName: String
  },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  cart: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      dateAddedToCart: { type: Date, default: Date.now }
    }
  ],
  dateJoined: { type: Date, default: Date.now }
});

// הצפנת סיסמה לפני שמירת משתמש
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
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
  status: { type: String, enum: ['Pending', 'Processed', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
  dateOrdered: { type: Date, default: Date.now }
});

// Middleware לניהול מלאי מוצרים בעת יצירת הזמנה
orderSchema.pre('validate', async function(next) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    for (const item of this.products) {
      const product = await Product.findById(item.productId).session(session);
      if (product.stock < item.quantity) {
        throw new Error(`Not enough stock for product: ${product.name}`);
      }
      product.stock -= item.quantity;
      await product.save({ session });
    }
    await session.commitTransaction();
    next();
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
});

// Middleware לניהול הרשאות משתמשים
userSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

// יצירת מודל הזמנה
const Order = mongoose.model('Order', orderSchema);

// ייצוא המודלים לשימוש בקבצים אחרים
module.exports = {
  Product,
  User,
  Order
};
