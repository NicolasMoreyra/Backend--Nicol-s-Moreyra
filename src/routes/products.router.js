const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); 

const router = express.Router();
const productsFilePath = path.join(__dirname, './products.json');


const readProducts = () => {
  const data = fs.readFileSync(productsFilePath, 'utf-8');
  return JSON.parse(data);
};


const writeProducts = (products) => {
  fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
};


router.get('/', (req, res) => {
  const products = readProducts();
  const limit = parseInt(req.query.limit, 10);
  if (limit && limit > 0) {
    res.json(products.slice(0, limit));
  } else {
    res.json(products);
  }
});


router.get('/:pid', (req, res) => {
  const products = readProducts();
  const pid = req.params.pid;
  const product = products.find(p => p.id === pid);
  if (product) {
    res.json(product);
  } else {
    res.status(404).send('Product not found');
  }
});


router.post('/', (req, res) => {
  const products = readProducts();
  const { title, description, code, price, status = true, stock, category, thumbnails = [] } = req.body;

 
  if (!title || !description || !code || price === undefined || stock === undefined || !category) {
    return res.status(400).send('All fields except thumbnails are required');
  }

  const newProduct = {
    id: uuidv4(),
    title,
    description,
    code,
    price,
    status,
    stock,
    category,
    thumbnails,
  };

  products.push(newProduct);
  writeProducts(products);
  res.status(201).json(newProduct);
});


router.put('/:pid', (req, res) => {
  const products = readProducts();
  const pid = req.params.pid;
  const productIndex = products.findIndex(p => p.id === pid);

  if (productIndex === -1) {
    return res.status(404).send('Product not found');
  }

  const { id, ...updateData } = req.body;

  products[productIndex] = {
    ...products[productIndex],
    ...updateData,
  };

  writeProducts(products);
  res.json(products[productIndex]);
});


router.delete('/:pid', (req, res) => {
  const products = readProducts();
  const pid = req.params.pid;
  const productIndex = products.findIndex(p => p.id === pid);

  if (productIndex === -1) {
    return res.status(404).send('Product not found');
  }

  const deletedProduct = products.splice(productIndex, 1);
  writeProducts(products);
  res.json(deletedProduct);
});

module.exports = router;
