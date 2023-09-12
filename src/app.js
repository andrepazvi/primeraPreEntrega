const express = require("express");
const app = express();
const PORT = 8080;
const fs = require('fs');

// Array de productos (simulando una base de datos)
let productos = [
  {
    id: 1,
    title: "Producto 1",
    description: "Descripción del producto 1",
    code: "P1",
    price: 10000,
    status: true,
    stock: 50,
    category: "Categoría 1",
    thumbnails: ["image1.jpg"],
  },

  {
    id: 2,
    title: "Producto 2",
    description: "Descripción del producto 2",
    code: "P2",
    price: 25000,
    status: true,
    stock: 20,
    category: "Categoría 2",
    thumbnails: ["image2.jpg"],
  },

  {
    id: 3,
    title: "Producto 3",
    description: "Descripción del producto 3",
    code: "P3",
    price: 16000,
    status: true,
    stock: 30,
    category: "Categoría 3",
    thumbnails: ["image3.jpg"],
  },
  
];


let carritos = [];

app.use(express.json());

// Rutas para productos
app.get("/api/products", (req, res) => {
  const limit = req.query.limit; 
  if (limit) {
    const limitedProducts = productos.slice(0, limit);
    res.json(limitedProducts);
  } else {
    res.json(productos);
  }
});

app.get("/api/products/:pid", (req, res) => {
  const productId = req.params.pid;
  const product = productos.find((p) => p.id === parseInt(productId));
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: "Producto no encontrado" });
  }
});

app.post("/api/products", (req, res) => {
  const newProduct = req.body;
  newProduct.id = productos.length + 1; 
  productos.push(newProduct);
  fs.writeFileSync('productos.json', JSON.stringify(productos)); 
  res.json(newProduct);
});

app.put("/api/products/:pid", (req, res) => {
  const productId = req.params.pid;
  const updatedProduct = req.body;
  productos = productos.map((product) => {
    if (product.id === parseInt(productId)) {
      return { ...product, ...updatedProduct, id: parseInt(productId) };
    }
    return product;
  });
  fs.writeFileSync('productos.json', JSON.stringify(productos)); // Actualiza los productos en el archivo
  res.json(updatedProduct);
});

app.delete("/api/products/:pid", (req, res) => {
  const productId = req.params.pid;
  productos = productos.filter((product) => product.id !== parseInt(productId));
  fs.writeFileSync('productos.json', JSON.stringify(productos)); // Actualiza los productos en el archivo
  res.json({ message: "Producto eliminado" });
});

// Rutas para carritos
app.post("/api/carts", (req, res) => {
  const newCart = {
    id: Date.now().toString(), // Genera un nuevo ID para el carrito
    products: [],
  };
  carritos.push(newCart);
  fs.writeFileSync('carritos.json', JSON.stringify(carritos)); // Guarda los carritos en un archivo
  res.json(newCart);
});

app.get("/api/carts/:cid", (req, res) => {
  const cartId = req.params.cid;
  const cart = carritos.find((c) => c.id === cartId);
  if (cart) {
    res.json(cart);
  } else {
    res.status(404).json({ message: "Carrito no encontrado" });
  }
});

app.post("/api/carts/:cid/product/:pid", (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;
  const quantity = req.body.quantity || 1; // Por defecto, agrega una cantidad de 1 si no se especifica
  const cart = carritos.find((c) => c.id === cartId);
  if (!cart) {
    res.status(404).json({ message: "Carrito no encontrado" });
    return;
  }
  const product = productos.find((p) => p.id === parseInt(productId));
  if (!product) {
    res.status(404).json({ message: "Producto no encontrado" });
    return;
  }
  if (quantity <= 0 || quantity > product.stock) {
    res.status(400).json({ message: "Cantidad no válida" });
    return;
  }

  const existingCartItem = cart.products.find((item) => item.product === productId);
  if (existingCartItem) {
    existingCartItem.quantity += quantity;
  } else {
    cart.products.push({ product: productId, quantity });
  }
  fs.writeFileSync('carritos.json', JSON.stringify(carritos)); // Actualiza los carritos en el archivo
  res.json(cart);
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en ${PORT}`);
});
