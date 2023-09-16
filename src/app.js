const express = require("express");
const app = express();
const PORT = 8080;
const fs = require("fs");

class Product {
  constructor() {
    this.products = [
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
  }

  getAll() {
    return this.products;
  }

  getById(id) {
    const product = this.products.find((p) => p.id === parseInt(id));
    return product;
  }

  create(newProduct) {
    newProduct.id = this.products.length + 1;
    this.products.push(newProduct);
    fs.writeFileSync("productos.json", JSON.stringify(this.products));
    return newProduct;
  }

  update(id, updatedProduct) {
    this.products = this.products.map((product) => {
      if (product.id === parseInt(id)) {
        return { ...product, ...updatedProduct, id: parseInt(id) };
      }
      return product;
    });
    fs.writeFileSync("productos.json", JSON.stringify(this.products));
    return updatedProduct;
  }

  delete(id) {
    this.products = this.products.filter((product) => product.id !== parseInt(id));
    fs.writeFileSync("productos.json", JSON.stringify(this.products));
    return { message: "Producto eliminado" };
  }
}

class Cart {
  constructor() {
    this.carts = [];
  }

  getAll() {
    return this.carts;
  }

  getById(cartId) {
    const cart = this.carts.find((c) => c.id === cartId);
    return cart;
  }

  create() {
    const newCart = {
      id: Date.now().toString(),
      products: [],
    };
    this.carts.push(newCart);
    fs.writeFileSync("carritos.json", JSON.stringify(this.carts));
    return newCart;
  }

  addProduct(cartId, productId, quantity = 1) {
    const cart = this.carts.find((c) => c.id === cartId);
    const product = productController.getById(productId);
    if (!cart || !product) {
      return null;
    }
    if (quantity <= 0 || quantity > product.stock) {
      return null;
    }
    const existingCartItem = cart.products.find((item) => item.product === productId);
    if (existingCartItem) {
      existingCartItem.quantity += quantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }
    fs.writeFileSync("carritos.json", JSON.stringify(this.carts));
    return cart;
  }
}

const productController = new Product();
const cartController = new Cart();

app.use(express.json());

// Rutas para productos
app.get("/api/products", (req, res) => {
  const limit = req.query.limit;
  if (limit) {
    const limitedProducts = productController.getAll().slice(0, limit);
    res.json(limitedProducts);
  } else {
    res.json(productController.getAll());
  }
});

app.get("/api/products/:pid", (req, res) => {
  const productId = req.params.pid;
  const product = productController.getById(productId);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: "Producto no encontrado" });
  }
});

app.post("/api/products", (req, res) => {
  const newProduct = req.body;
  const createdProduct = productController.create(newProduct);
  if (createdProduct) {
    res.json(createdProduct);
  } else {
    res.status(400).json({ message: "Error al crear el producto" });
  }
});

app.put("/api/products/:pid", (req, res) => {
  const productId = req.params.pid;
  const updatedProduct = req.body;
  const product = productController.update(productId, updatedProduct);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: "Producto no encontrado" });
  }
});

app.delete("/api/products/:pid", (req, res) => {
  const productId = req.params.pid;
  const result = productController.delete(productId);
  res.json(result);
});

// Rutas para carritos
app.post("/api/carts", (req, res) => {
  const newCart = cartController.create();
  if (newCart) {
    res.json(newCart);
  } else {
    res.status(400).json({ message: "Error al crear el carrito" });
  }
});

app.get("/api/carts/:cid", (req, res) => {
  const cartId = req.params.cid;
  const cart = cartController.getById(cartId);
  if (cart) {
    res.json(cart);
  } else {
    res.status(404).json({ message: "Carrito no encontrado" });
  }
});

app.post("/api/carts/:cid/product/:pid", (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;
  const quantity = req.body.quantity || 1;
  const updatedCart = cartController.addProduct(cartId, productId, quantity);
  if (updatedCart) {
    res.json(updatedCart);
  } else {
    res.status(400).json({ message: "Error al agregar el producto al carrito" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en ${PORT}`);
});
