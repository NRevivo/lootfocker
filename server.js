require('dotenv').config();
const express = require('express');
const path = require('path');
const { connectToDB, Shoe, User, Order } = require('./config/db');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const port = 3000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server);

// Connect to the database
connectToDB().then(() => {
  // Middleware - Set server to work with JSON
  app.use(express.json());

  // Set public directory as static
  app.use(express.static(path.join(__dirname, 'public')));

  // Handle Socket.IO connections
  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  // Home page
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'homepage.html'));
  });

  // Route to get all shoes
  app.get('/api/shoes', async (req, res) => {
    try {
      const shoes = await Shoe.find();
      res.json(shoes);
    } catch (err) {
      res.status(500).send('Server Error');
    }
  });

// עדכון הנתיב בserver.js
app.get('/api/orders/:userId', async (req, res) => {
  try {
      const { userId } = req.params;
      console.log('Received userId:', userId); // לדיבוג

      // בדיקה שה-userId קיים
      if (!userId) {
          return res.status(400).json({ message: 'User ID is required' });
      }

      // מציאת ההזמנות שמתאימות ל-userId
      const userOrders = await Order.find()
          .populate({
              path: 'shoes.shoeId',
              model: 'Shoe',
              select: 'name price images'
          })
          .sort({ orderDate: -1 });

      // פילטור ההזמנות לפי userId
      const filteredOrders = userOrders.filter(order => 
          order.userId.toString() === userId
      );

      console.log('Found orders:', filteredOrders); // לדיבוג
      res.json(filteredOrders);
      
  } catch (err) {
      console.error('Error in /api/orders/:userId:', err);
      res.status(500).json({ 
          message: 'Server Error',
          error: err.message 
      });
  }
});

  // Route to create a new shoe
  app.post('/api/shoes', async (req, res) => {
    try {
      const { name, description, price, category, brand, sizes, colors, stock, images } = req.body;

      if (!name || !price || !stock) {
        return res.status(400).send('Name, price and stock are required.');
      }

      const shoe = new Shoe({
        name,
        description,
        price,
        category,
        brand,
        sizes,
        colors,
        stock,
        images
      });

      await shoe.save();
      res.status(201).send(shoe);
    } catch (err) {
      res.status(500).send('Server Error');
    }
  });

  // Route to update an existing shoe
  app.put('/api/shoes/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const shoe = await Shoe.findByIdAndUpdate(id, updates, { new: true });

      if (!shoe) {
        return res.status(404).send('Shoe not found');
      }

      res.status(200).send(shoe);
    } catch (err) {
      res.status(500).send('Server Error');
    }
  });

  

  // Route to delete a shoe
  app.delete('/api/shoes/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const shoe = await Shoe.findByIdAndDelete(id);

      if (!shoe) {
        return res.status(404).send('Shoe not found');
      }

      res.status(200).send('Shoe deleted successfully');
    } catch (err) {
      res.status(500).send('Server Error');
    }
  });

  // Route to create a new order
  app.post('/api/orders', async (req, res) => {
    try {
      const { userId, shoes, totalAmount, shippingAddress } = req.body;

      if (!userId || !shoes || !totalAmount || !shippingAddress) {
        return res.status(400).send('All fields are required.');
      }

      const order = new Order({
        userId,
        shoes,
        totalAmount,
        shippingAddress,
      });

      await order.save();
      res.status(201).send(order);

      // Emit event to clients that a new order has been created
      io.emit('orderCreated', order);
    } catch (err) {
      res.status(500).send('Server Error');
    }
  });

  // Route to get all orders
  app.get('/api/orders', async (req, res) => {
    try {
      const orders = await Order.find();
      res.json(orders);
    } catch (err) {
      res.status(500).send('Server Error');
    }
  });

  // Route to update an existing order
  app.put('/api/orders/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const order = await Order.findByIdAndUpdate(id, updates, { new: true });

      if (!order) {
        return res.status(404).send('Order not found');
      }

      res.status(200).send(order);
    } catch (err) {
      res.status(500).send('Server Error');
    }
  });

  // Route to delete an order
  app.delete('/api/orders/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const order = await Order.findByIdAndDelete(id);

      if (!order) {
        return res.status(404).send('Order not found');
      }

      res.status(200).send('Order deleted successfully');
    } catch (err) {
      res.status(500).send('Server Error');
    }
  });

  // Route to register a new user
  app.post('/register', async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        address,
        paymentMethod
      } = req.body;

      // Combine first and last name into full name
      const fullName = `${firstName} ${lastName}`;

      // Check if user already exists
      const existingUser = await User.findOne({ email: email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create new user object
      const newUser = new User({
        fullName,
        email,
        password,
        address,
        paymentMethod,
        role: 'user'
      });

      await newUser.save();
      res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ message: 'Server error occurred during registration' });
    }
  });

  // Route to get all users
  app.get('/api/users', async (req, res) => {
    try {
      const users = await User.find();
      res.json(users);
    } catch (err) {
      res.status(500).send('Server Error');
    }
  });

  // Route to update an existing user
  app.put('/api/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const user = await User.findByIdAndUpdate(id, updates, { new: true });

      if (!user) {
        return res.status(404).send('User not found');
      }

      res.status(200).send(user);
    } catch (err) {
      res.status(500).send('Server Error');
    }
  });

  // Route to delete a user
  app.delete('/api/users/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const user = await User.findByIdAndDelete(id);

      if (!user) {
        return res.status(404).send('User not found');
      }

      res.status(200).send('User deleted successfully');
    } catch (err) {
      res.status(500).send('Server Error');
    }
  });

  // Route to login
  app.post('/login', async (req, res) => {
    try {
        if (!req.body.email || !req.body.password) {
            return res.status(400).send({ message: "Email and password are required" });
        }

        const check = await User.findOne({ email: req.body.email });

        if (!check) {
            return res.status(404).send({ message: "User not found" });
        }

        if (req.body.password === check.password) {
            const role = check.role === 'admin' ? 'admin' : 'user';
            const redirectUrl = role === 'admin' ? '/admin.html' : '/homepage.html';

            res.status(200).json({ 
                message: 'Login successful', 
                role,
                userId: check._id,
                fullName: check.fullName, // הוספנו את השם המלא
                redirectUrl 
            });
        } else {
            res.status(401).send({ message: "Incorrect password" });
        }
    } catch (e) {
        console.error("Login error:", e);
        res.status(500).send({ message: "Server error occurred" });
    }
});

// Route to filter shoes
app.get('/api/shoes/filter', async (req, res) => {
  try {
      const { category, brand, sizes, minPrice, maxPrice } = req.query;
      let filter = {};
      
      // Updated category filtering to match URL parameters
      if (category) {
          // Handle specific categories exactly as they appear in the URL
          switch(category) {
              case 'Boy':
              case 'Girl':
              case 'Baby':
              case 'Men':
              case 'Women':
                  filter.category = category;
                  break;
              default:
                  filter.category = category;
          }
      }
      
      // Brand filtering
      if (brand) {
          filter.brand = { $in: brand.split(',') };
      }
      
      // Size filtering
      if (sizes) {
          filter.sizes = { $in: sizes.split(',').map(Number) };
      }
      
      // Price filtering
      if (minPrice || maxPrice) {
          filter.price = {};
          if (minPrice) filter.price.$gte = Number(minPrice);
          if (maxPrice) filter.price.$lte = Number(maxPrice);
      }

      console.log('Applied filter:', filter);

      const shoes = await Shoe.find(filter);
      res.json(shoes);
  } catch (err) {
      console.error('Filter error:', err);
      res.status(500).send('Server Error');
  }
});


// הוסף את הנתיב הזה בקובץ server.js
app.get('/api/shoes/latest', async (req, res) => {
  try {
      const latestShoes = await Shoe.find()
          .sort({ addedDate: -1 }) // מיון לפי תאריך הוספה בסדר יורד
          .limit(4);               // הגבלה ל-4 מוצרים אחרונים
      res.json(latestShoes);
  } catch (err) {
      console.error('Error fetching latest shoes:', err);
      res.status(500).send('Server Error');
  }
});

  // Route to get distinct brands
  app.get('/api/shoes/brands', async (req, res) => {
    try {
      const { category } = req.query;
      const filter = category ? { category } : {};
      const brands = await Shoe.distinct('brand', filter);
      res.json(brands);
    } catch (err) {
      console.error('Brands error:', err);
      res.status(500).send('Server Error');
    }
  });

  // Route to get distinct categories
  app.get('/api/shoes/categories', async (req, res) => {
    try {
      const categories = await Shoe.distinct('category');
      res.json(categories);
    } catch (err) {
      console.error('Categories error:', err);
      res.status(500).send('Server Error');
    }
  });

 // Routes for Shoes
app.route('/api/shoes')
.get(async (req, res) => { // Get all shoes or filter shoes
  try {
    const { category, brand, sizes, minPrice, maxPrice } = req.query;  // קבלת הפרמטרים מהבקשה

    let filter = {};
    if (category) filter.category = category; // סינון לפי קטגוריה
    if (brand) filter.brand = { $in: brand.split(',') }; // סינון לפי מותג
    if (sizes) filter.sizes = { $in: sizes.split(',').map(Number) }; // סינון לפי מידות
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice); // סינון לפי מחיר מינימלי
      if (maxPrice) filter.price.$lte = Number(maxPrice); // סינון לפי מחיר מקסימלי
    }

    const shoes = await Shoe.find(filter);  // שליפת המוצרים מהמסד נתונים לפי הפילטרים
    res.json(shoes);  // החזרת המוצרים כתגובה
  } catch (err) {
    console.error('Error fetching shoes:', err);
    res.status(500).send('Internal Server Error');
  }
})
.post(async (req, res) => { // Create a new shoe
  try {
    const { name, description, price, category, brand, sizes, color, stock, images } = req.body;
    if (!name || !price || !stock) {
      return res.status(400).send('Name, price, and stock are required.');
    }
    const shoe = new Shoe({ name, description, price, category, brand, sizes, color, stock, images });
    await shoe.save();
    res.status(201).send(shoe);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});
app.get('/api/sales/brands', async (req, res) => {
  try {
      const salesByBrand = await Order.aggregate([
          { $unwind: '$shoes' },
          { $group: { _id: '$shoes.brand', totalSales: { $sum: 1 } } }
      ]);
      
      res.json(salesByBrand);
  } catch (error) {
      console.error('Error fetching sales by brand:', error);
      res.status(500).json({ message: 'Failed to fetch sales by brand' });
  }
});

app.get('/api/sales/categories', async (req, res) => {
  try {
      const salesByCategory = await Order.aggregate([
          { $unwind: '$shoes' },
          { $group: { _id: '$shoes.category', totalSales: { $sum: 1 } } }
      ]);

      res.json(salesByCategory);
  } catch (error) {
      console.error('Error fetching sales by category:', error);
      res.status(500).json({ message: 'Failed to fetch sales by category' });
  }
});

// Route to create a new order
app.post('/api/orders', async (req, res) => {
  try {
      const { userId, shoes, totalAmount, shippingAddress } = req.body;

      if (!userId || !shoes || !totalAmount || !shippingAddress) {
          return res.status(400).send('All fields are required.');
      }

      const order = new Order({
          userId,
          shoes,
          totalAmount,
          shippingAddress,
      });

      await order.save();
      res.status(201).send(order);

      // Emit event to clients that a new order has been created
      io.emit('orderCreated', order);
  } catch (err) {
      res.status(500).send('Server Error');
  }
});


// Route to get a specific shoe by ID
app.get('/api/shoes/:id', async (req, res) => {
  try {
      const shoe = await Shoe.findById(req.params.id);
      if (!shoe) {
          return res.status(404).json({ message: 'Product not found' });
      }
      res.json(shoe);
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
  }
});

app.post("/api/cart", async (req, res) => {
  try {
      const { productId, size, quantity, userId } = req.body;

      // וידוא שכל השדות הנדרשים קיימים
      if (!productId || !size || !quantity || !userId) {
          return res.status(400).json({ 
              success: false, 
              message: "Missing required fields" 
          });
      }

      // בדיקה שהמוצר קיים
      const product = await Shoe.findById(productId);
      if (!product) {
          return res.status(404).json({ 
              success: false, 
              message: "Product not found" 
          });
      }

      // בדיקה שהמשתמש קיים
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ 
              success: false, 
              message: "User not found" 
          });
      }

      // בדיקה אם המוצר כבר קיים בעגלה
      const existingCartItem = user.cart.find(
          item => item.shoeId.toString() === productId && item.size === size
      );

      if (existingCartItem) {
          // עדכון כמות אם המוצר כבר קיים
          await User.updateOne(
              { 
                  _id: userId, 
                  'cart.shoeId': productId,
                  'cart.size': size 
              },
              { 
                  $inc: { 'cart.$.quantity': quantity } 
              }
          );
      } else {
          // הוספת מוצר חדש לעגלה
          await User.findByIdAndUpdate(
              userId,
              { 
                  $push: { 
                      cart: { 
                          shoeId: productId, 
                          size: size, 
                          quantity: quantity 
                      } 
                  } 
              }
          );
      }

      // שליפת העגלה המעודכנת עם פרטי המוצרים
      const updatedUser = await User.findById(userId).populate('cart.shoeId');
      
      res.json({ 
          success: true, 
          cart: updatedUser.cart 
      });

  } catch (error) {
      console.error('Error updating cart:', error);
      res.status(500).json({ 
          success: false, 
          message: "Error updating cart",
          error: error.message 
      });
  }
});

// נוסיף נתיב לקבלת תוכן העגלה
app.get("/api/cart/:userId", async (req, res) => {
  try {
      const { userId } = req.params;
      
      const user = await User.findById(userId).populate('cart.shoeId');
      if (!user) {
          return res.status(404).json({ 
              success: false, 
              message: "User not found" 
          });
      }

      res.json({ 
          success: true, 
          cart: user.cart 
      });

  } catch (error) {
      console.error('Error fetching cart:', error);
      res.status(500).json({ 
          success: false, 
          message: "Error fetching cart",
          error: error.message 
      });
  }
});

app.delete('/api/cart/:userId/:itemId', async (req, res) => {
  try {
      const { userId, itemId } = req.params;
      
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({
              success: false,
              message: "User not found"
          });
      }

      // מוצאים את האינדקס של הפריט בעגלה
      const itemIndex = user.cart.findIndex(item => item._id.toString() === itemId);
      
      if (itemIndex === -1) {
          return res.status(404).json({
              success: false,
              message: "Item not found in cart"
          });
      }

      // מסירים את הפריט מהעגלה
      user.cart.splice(itemIndex, 1);
      await user.save();

      // מחזירים את העגלה המעודכנת עם כל פרטי המוצרים
      const updatedUser = await User.findById(userId).populate('cart.shoeId');
      
      res.json({
          success: true,
          cart: updatedUser.cart
      });

  } catch (error) {
      console.error('Error removing item from cart:', error);
      res.status(500).json({
          success: false,
          message: "Error removing item from cart"
      });
  }
});


  // Start the server
  server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}).catch((err) => {
  console.error('Failed to connect to the database:', err);
  process.exit(1);
});

// Import the Branch model (assuming it's exported from db.js)
const { Branch } = require('./config/db');

// API לקבלת כל הסניפים
app.get('/api/branches', async (req, res) => {
  try {
    const branches = await Branch.find();
    res.json(branches);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});


// --------------------PayPal--------------------------------------------------------
app.get("/api/config/paypal", (req, res) => res.send({ clientId: process.env.PAYPAL_CLIENT_ID }));

const paypal = require('@paypal/checkout-server-sdk');

// קונפיגורציה של PayPal
function getPayPalClient() {
    return new paypal.core.PayPalHttpClient(new paypal.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
    ));
}

// יצירת הזמנה חדשה ב-PayPal
app.post('/api/create-paypal-order', async (req, res) => {
  const { totalAmount, shipping } = req.body;

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
          amount: {
              currency_code: 'USD',
              value: totalAmount
          },
          shipping: {
              name: { full_name: shipping.fullName },
              address: {
                  address_line_1: shipping.address,
                  admin_area_2: shipping.city,
                  postal_code: shipping.postalCode,
                  country_code: 'US'
              }
          }
      }]
  });

  try {
      const order = await getPayPalClient().execute(request);
      res.json({ orderID: order.result.id });
  } catch (error) {
      console.error('Error creating PayPal order:', error);
      res.status(500).json({ error: 'Failed to create order' });
  }
});


// לכידת הזמנה לאחר אישור תשלום מ-PayPal
app.post('/api/capture-paypal-order', async (req, res) => {
    const { orderID } = req.body;

    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    try {
        const capture = await getPayPalClient().execute(request);
        // אפשר לשמור את פרטי ההזמנה ב-DB אם יש צורך
        res.json({ success: true, order: capture.result });
    } catch (error) {
        console.error('Error capturing PayPal order:', error);
        res.status(500).json({ error: 'Failed to capture order' });
    }
});
