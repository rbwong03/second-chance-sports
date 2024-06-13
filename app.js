/**
 * Ryan Wong
 * June 2024
 *
 * This is the app.js file that contains the GET and POST requests for the server.
 */

'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs/promises');
const path = require('path');

const app = express();
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(multer().none());

const SERVER_ERR_CODE = 500;
const SERVER_ERROR =
  'Something went wrong on the server, please try again later.';
const DEBUG = true;

/**
 * This function loads the products from the json file.
 */
const loadProducts = async () => {
  const dataDir = path.join(__dirname, 'data');
  const categories = ['baseball', 'basketball', 'football', 'golf'];
  let products = [];

  for (let category of categories) {
    const categoryDir = path.join(dataDir, category);
    const files = await fs.readdir(categoryDir);
    for (let file of files) {
      const filePath = path.join(categoryDir, file);
      try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        const productData = JSON.parse(fileContent);
        products = products.concat(productData);
      } catch (err) {
        res.status(500).send('Server error');
      }
    }
  }
  return products;
};

let products = [];

/**
 * Loads the products.
 */
(async () => {
  try {
    products = await loadProducts();
  } catch (err) {
    res.status(500).send('Server error');
  }
})();

/**
 * Gets all products.
 */
app.get('/products', async (req, res) => {
  try {
    res.json(products);
  } catch (err) {
    res.status(SERVER_ERR_CODE).send(SERVER_ERROR);
  }
});

/**
 * Gets a product by id.
 */
app.get('/products/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const product = products.find((p) => p.id === productId);
    if (product) {
      res.json(product);
    } else {
      res.status(404).send('Product not found');
    }
  } catch (err) {
    res.status(SERVER_ERR_CODE).send(SERVER_ERROR);
  }
});

/**
 * Gets filtered products.
 */
app.get('/filtered-products', async (req, res) => {
  try {
    let filteredProducts = products;
    if (req.query.category) {
      filteredProducts = filteredProducts.filter(
        (p) => p.category.toLowerCase() === req.query.category.toLowerCase()
      );
    }
    if (req.query.type) {
      filteredProducts = filteredProducts.filter(
        (p) => p.type.toLowerCase() === req.query.type.toLowerCase()
      );
    }
    res.json(filteredProducts);
  } catch (err) {
    res.status(SERVER_ERR_CODE).send(SERVER_ERROR);
  }
});

/**
 * Gets the faqs
 */
app.get('/faqs', async (req, res) => {
  try {
    const faqsPath = path.join(__dirname, 'data', 'faqs.json');
    const faqs = await fs.readFile(faqsPath, 'utf8');
    res.json(JSON.parse(faqs));
  } catch (error) {
    res.status(500).send('Error reading FAQ data');
  }
});

/**
 * Updates the product quantity.
 */
app.post('/update-product-quantity', async (req, res) => {
  try {
    const { id, quantity } = req.body;
    const product = products.find((p) => p.id === id);
    if (!product) {
      return res.status(404).send('Product not found');
    }

    product.quantity = quantity;

    const categoryDir = path.join(
      __dirname,
      'data',
      product.category.toLowerCase()
    );
    const typeFile = product.type.toLowerCase() + '.json';
    const filePath = path.join(categoryDir, typeFile);

    const categoryProducts = JSON.parse(await fs.readFile(filePath, 'utf8'));

    const productIndex = categoryProducts.findIndex((p) => p.id === id);
    if (productIndex !== -1) {
      categoryProducts[productIndex].quantity = quantity;
      await fs.writeFile(
        filePath,
        JSON.stringify(categoryProducts, null, 2),
        'utf8'
      );
    }

    res.json({ success: true, product });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

/**
 * Submits an order to the server.
 */
app.post('/submit-order', async (req, res) => {
  try {
    const order = req.body;
    const ordersFilePath = path.join(__dirname, 'data', 'orders.json');

    let orders = [];
    try {
      const ordersData = await fs.readFile(ordersFilePath, 'utf8');
      orders = JSON.parse(ordersData);
    } catch (err) {
      res.status(500).send('Server error');
    }

    orders.push(order);

    await fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2), 'utf8');
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

/**
 * Submits feedback to the server.
 */
app.post('/submit-feedback', async (req, res) => {
  try {
    const feedback = req.body;
    const feedbackFilePath = path.join(__dirname, 'data', 'feedback.json');

    let feedbackList = [];
    try {
      const feedbackData = await fs.readFile(feedbackFilePath, 'utf8');
      feedbackList = JSON.parse(feedbackData);
    } catch (err) {
      res.status(500).send('Server error');
    }

    feedbackList.push(feedback);

    await fs.writeFile(
      feedbackFilePath,
      JSON.stringify(feedbackList, null, 2),
      'utf8'
    );
    res.json({ success: true, feedback });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);
