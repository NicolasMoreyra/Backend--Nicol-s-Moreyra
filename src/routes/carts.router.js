const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');  

const router = express.Router();
const cartsFilePath = path.join(__dirname, './carts.json');


const readCarts = () => {
  const data = fs.readFileSync(cartsFilePath, 'utf-8');
  return JSON.parse(data);
};


const writeCarts = (carts) => {
  fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2));
};


router.post('/', (req, res) => {
  const carts = readCarts();
  const newCart = {
    id: uuidv4(),
    products: [],
  };

  carts.push(newCart);
  writeCarts(carts);
  res.status(201).json(newCart);
});


router.get('/:cid', (req, res) => {
  const carts = readCarts();
  const cid = req.params.cid;
  const cart = carts.find(c => c.id === cid);

  if (cart) {
    res.json(cart);
  } else {
    res.status(404).send('Cart not found');
  }
});


router.post('/:cid/products', (req, res) => {
  const carts = readCarts();
  const cid = req.params.cid;
  const { productId, quantity } = req.body;
  const cart = carts.find(c => c.id === cid);

  if (!cart) {
    return res.status(404).send('Cart not found');
  }

  const productIndex = cart.products.findIndex(p => p.productId === productId);

  if (productIndex !== -1) {
    cart.products[productIndex].quantity += quantity;
  } else {
    cart.products.push({ productId, quantity });
  }

  writeCarts(carts);
  res.status(201).json(cart);
});

module.exports = router;
