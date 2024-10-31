const mongoose = require('mongoose');

// Shoe Schema
const shoeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  price: {
    type: Number,
    required: true,
  },
  category: String,
  brand: String,
  sizes: [Number],
  colors: [String],
  stock: {
    type: Number,
    required: true,
  },
  images: [String],
  addedDate: {
    type: Date,
    default: Date.now,
  }
});

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    street: String,
    city: String,
    country: String,
    postalCode: String,
  },
  paymentMethod: {
    cardNumber: String,
    expirationDate: String,
    cvv: String,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  }
});

// Order Schema
const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  shoes: [
    {
      shoeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shoe',
      },
      quantity: Number,
    },
  ],
  totalAmount: Number,
  shippingAddress: {
    street: String,
    city: String,
    country: String,
    postalCode: String,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  }
});

// Create models
const Shoe = mongoose.model('Shoe', shoeSchema);
const User = mongoose.model('User', userSchema);
const Order = mongoose.model('Order', orderSchema);

// Connect to MongoDB function
const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.DB_MONGODB);  // הסרנו את האפשרויות המיותרות
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

module.exports = {
  connectToDB,
  Shoe,
  User,
  Order
};