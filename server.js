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

  // Route to create a new user
  app.post('/api/users', async (req, res) => {
    try {
      const { email, password, address, paymentMethod, role } = req.body;

      if (!email || !password) {
        return res.status(400).send('Email and password are required.');
      }

      const user = new User({
        email,
        password,
        address,
        paymentMethod,
        role,
      });

      await user.save();
      res.status(201).send(user);

      // Emit event to clients that a new user has been created
      io.emit('userCreated', user);
    } catch (err) {
      res.status(500).send('Server Error');
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

  // Start the server
  server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}).catch((err) => {
  console.error('Failed to connect to the database:', err);
  process.exit(1);
});