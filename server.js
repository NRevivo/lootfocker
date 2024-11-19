require('dotenv').config();
const express = require('express');
const path = require('path');
const { connectToDB, Shoe, User, Order } = require('./config/db');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const port = 3000;
const bcrypt = require('bcrypt');


app.use(express.json());
// Create HTTP server

const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server);

// Connect to the database
connectToDB().then(() => {

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
        const orders = await Order.find()
            .populate('userId', 'email') // Populate email only
            .sort({ orderDate: -1 });

        res.json(orders);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).send('Server Error');
    }
});

  // Route to update an existing order
  app.put('/api/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'shipped', 'delivered', 'cancelled'].includes(status)) {
            return res.status(400).send('Invalid status');
        }

        const order = await Order.findByIdAndUpdate(id, { status }, { new: true });

        if (!order) {
            return res.status(404).send('Order not found');
        }

        res.status(200).json(order);
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
      } = req.body;
  
      const fullName = `${firstName} ${lastName}`;
  
      const existingUser = await User.findOne({ email: email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      // הצפנת הסיסמה
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      const newUser = new User({
        fullName,
        email,
        password: hashedPassword, // שים לב שהסיסמה המוצפנת נשמרת כאן
        address,
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
  
      // מצא את המשתמש לפני המחיקה
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      // החזר את המוצרים מהעגלה למלאי לפני מחיקת המשתמש
      if (user.cart && user.cart.length > 0) {
        // עבור על כל פריט בעגלה
        for (const cartItem of user.cart) {
          try {
            // מצא את הנעל במערכת
            const shoe = await Shoe.findById(cartItem.shoeId);
            if (shoe) {
              // החזר את הכמות למלאי
              shoe.stock += cartItem.quantity;
              await shoe.save();
              console.log(`Restored ${cartItem.quantity} items to stock for shoe ${shoe._id}`);
            }
          } catch (error) {
            console.error(`Error restoring stock for shoe ${cartItem.shoeId}:`, error);
          }
        }
      }
  
      // מחק את המשתמש
      await User.findByIdAndDelete(id);
      
      res.status(200).send('User and their cart items deleted successfully, stock restored');
    } catch (err) {
      console.error('Error deleting user:', err);
      res.status(500).send('Server Error');
    }
  });
  

  // Route to login
  app.post('/login', async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) {
      return res.status(400).send({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // השוואת הסיסמה
    const match = await bcrypt.compare(req.body.password, user.password);

    if (match) {
      const role = user.role === 'admin' ? 'admin' : 'user';
      const redirectUrl = role === 'admin' ? '/admin.html' : '/homepage.html';

      res.status(200).json({
        message: 'Login successful',
        role,
        userId: user._id,
        fullName: user.fullName,
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
      const { category, brand, sizes, minPrice, maxPrice, searchQuery } = req.query;
      let filter = {};

      // חיפוש לפי שם ומותג
      if (searchQuery) {
          filter.$or = [
              { name: { $regex: searchQuery, $options: 'i' }},
              { brand: { $regex: searchQuery, $options: 'i' }}
          ];
      }

      // קטגוריה
      if (category) {
          switch(category) {
              case 'Boy':
              case 'Girl':
              case 'Baby':
              case 'Men':
              case 'Women':
                  if (filter.$or) {
                      filter.$and = [{ $or: filter.$or }, { category: category }];
                      delete filter.$or;
                  } else {
                      filter.category = category;
                  }
                  break;
              default:
                  if (filter.$or) {
                      filter.$and = [{ $or: filter.$or }, { category: category }];
                      delete filter.$or;
                  } else {
                      filter.category = category;
                  }
          }
      }

      // מותג
      if (brand) {
          const brandFilter = { brand: { $in: brand.split(',') } };
          if (filter.$and) {
              filter.$and.push(brandFilter);
          } else if (filter.$or) {
              filter.$and = [{ $or: filter.$or }, brandFilter];
              delete filter.$or;
          } else {
              filter.brand = brandFilter.brand;
          }
      }

      // מידות
      if (sizes) {
          const sizesFilter = { sizes: { $in: sizes.split(',').map(Number) } };
          if (filter.$and) {
              filter.$and.push(sizesFilter);
          } else if (filter.$or) {
              filter.$and = [{ $or: filter.$or }, sizesFilter];
              delete filter.$or;
          } else {
              filter.sizes = sizesFilter.sizes;
          }
      }

      // מחיר
      if (minPrice || maxPrice) {
          const priceFilter = {};
          if (minPrice) priceFilter.$gte = Number(minPrice);
          if (maxPrice) priceFilter.$lte = Number(maxPrice);

          if (filter.$and) {
              filter.$and.push({ price: priceFilter });
          } else if (filter.$or) {
              filter.$and = [{ $or: filter.$or }, { price: priceFilter }];
              delete filter.$or;
          } else {
              filter.price = priceFilter;
          }
      }

      console.log('Applied filter:', filter);

      // שינוי כאן - הוספת select כדי לוודא שכל השדות הנדרשים מוחזרים
      const shoes = await Shoe.find(filter)
          .select('name brand price images sizes description stock')  // בחירת השדות הספציפיים שאנחנו רוצים
          .lean()  // המרה לאובייקט JavaScript רגיל לביצועים טובים יותר
          .exec();

      // לוג לבדיקת המידע שמוחזר
      console.log('Returning shoes data:', shoes.slice(0, 2));  // מדפיס רק את 2 המוצרים הראשונים ללוג

      res.json(shoes);
  } catch (err) {
      console.error('Filter error:', err);
      res.status(500).json({
          message: 'Server Error',
          error: err.message
      });
  }
});

// הוסף את הנתיב הזה בקובץ server.js
app.get('/api/shoes/latest', async (req, res) => {
  try {
      const latestShoes = await Shoe.find()
          .select('name brand price images description stock _id') // הוספנו _id
          .sort({ addedDate: -1 }) // שינוי ל-addedDate
          .limit(4);

      if (!latestShoes || latestShoes.length === 0) {
          return res.status(404).json({ message: 'No products found' });
      }

      res.json(latestShoes);
  } catch (err) {
      console.error('Error fetching latest shoes:', err);
      res.status(500).json({ message: 'Server Error' });
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
 .get(async (req, res) => {
     try {
         const { category, brand, sizes, minPrice, maxPrice } = req.query;

         let filter = {};
         if (category) filter.category = category;
         if (brand) filter.brand = { $in: brand.split(',') };
         if (sizes) filter.sizes = { $in: sizes.split(',').map(Number) };
         if (minPrice || maxPrice) {
             filter.price = {};
             if (minPrice) filter.price.$gte = Number(minPrice);
             if (maxPrice) filter.price.$lte = Number(maxPrice);
         }

         const shoes = await Shoe.find(filter).select('name brand price images sizes description stock');  // הוספת stock
         res.json(shoes);
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

      if (!productId || !size || !quantity || !userId) {
          return res.status(400).json({ 
              success: false, 
              message: "Missing required fields" 
          });
      }

      // בדיקה שהמוצר קיים ויש מספיק מלאי
      const shoe = await Shoe.findById(productId);
      if (!shoe) {
          return res.status(404).json({ 
              success: false, 
              message: "Product not found" 
          });
      }

      // בדיקת מלאי
      if (shoe.stock < quantity) {
          return res.status(400).json({
              success: false,
              message: "Not enough stock available"
          });
      }

      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ 
              success: false, 
              message: "User not found" 
          });
      }

      // עדכון המלאי
      shoe.stock -= quantity;
      await shoe.save();

      // הוספה לעגלה - הקוד הקיים שלך
      const existingCartItem = user.cart.find(
          item => item.shoeId.toString() === productId && item.size === size
      );

      if (existingCartItem) {
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

      // מציאת הפריט בעגלה לפני הסרתו
      const cartItem = user.cart.find(item => item._id.toString() === itemId);
      if (!cartItem) {
          return res.status(404).json({
              success: false,
              message: "Item not found in cart"
          });
      }

      // עדכון המלאי - החזרת הכמות למלאי
      const shoe = await Shoe.findById(cartItem.shoeId);
      if (shoe) {
          shoe.stock += cartItem.quantity;
          await shoe.save();
      }

      // הסרת הפריט מהעגלה
      user.cart = user.cart.filter(item => item._id.toString() !== itemId);
      await user.save();

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

app.post('/api/cart/:userId/clean', async (req, res) => {
  try {
      const { userId } = req.params;
      const { cart } = req.body;
      
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({
              success: false,
              message: "User not found"
          });
      }

      // עדכון העגלה עם הפריטים התקינים בלבד
      user.cart = cart;
      await user.save();

      res.json({
          success: true,
          message: "Cart cleaned successfully",
          cart: user.cart
      });
  } catch (error) {
      console.error('Error cleaning cart:', error);
      res.status(500).json({
          success: false,
          message: "Error cleaning cart"
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

// PayPal configuration
async function getPayPalClient() {
    return new paypal.core.PayPalHttpClient(new paypal.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
    ));
}

// Endpoint to create a new PayPal order
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
        const client = await getPayPalClient();
        const order = await client.execute(request);        
        res.json({ orderID: order.result.id });
    } catch (error) {
        console.error('Error creating PayPal order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Endpoint to capture a PayPal order and save it to MongoDB
app.post('/api/capture-paypal-order', async (req, res) => {
  console.log('Request body:', req.body);

  const { orderID, userId, shoes, totalAmount, shipping } = req.body;
  const request = new paypal.orders.OrdersCaptureRequest(orderID);

  try {
      // Capture the PayPal order
      const client = await getPayPalClient();
      const capture = await client.execute(request);
      console.log('PayPal Capture Result:', capture.result);

      // Save the order to MongoDB
      try {
          const newOrder = new Order({
              userId,
              shoes,
              totalAmount,
              shippingAddress: {
                  street: shipping.address,
                  city: shipping.city,
                  country: 'Israel',
                  postalCode: shipping.postalCode
              },
              status: 'pending',
              orderDate: new Date()
          });

          await newOrder.save();
          console.log('Order saved successfully:', newOrder);

           // Clear the user's cart
           await User.updateOne(
            { _id: userId },
            { $set: { cart: [] } }
        );
        console.log('Cart cleared successfully for user:', userId);

          res.json({ success: true, order: capture.result });
      } catch (dbError) {
          console.error('Error saving order to MongoDB:', dbError);
          res.status(500).json({ error: 'Failed to save order to database' });
      }
  } catch (error) {
      console.error('Error capturing PayPal order:', error.message || error.response);
      res.status(500).json({ error: 'Failed to capture order' });
  }
});
