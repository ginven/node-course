const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
    const products = Product.fetchAll((products) => {
        res.render('shop/product-list', 
        { prods: products, docTitle: 'All Products', 
        path: '/products', 
        activeShop: true, 
        productCSS: true })
    });
 }

 
exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId, product => {
        res.render('shop/product-detail', { docTitle: product.title, product: product, path: '/products'})
    })
 }

 exports.getIndex = (req, res, next) => {
    const products = Product.fetchAll((products) => {
        res.render('shop/index', { prods: products, docTitle: 'Shop', path: '/', hasProducts: products.length > 0, activeShop: true, productCSS: true })
    });
 }

 exports.getCart = (req, res, next) => {
    Cart.getCart(cart => {
        Product.fetchAll(products => {
            const cartProducts = [];
            for(product of products) {
                const cartProductsData = cart.products.find(prod => prod.id === product.id);
                if(cartProductsData) {
                    cartProducts.push({ productData: product, qty: cartProductsData.qty});
                }
            }
            res.render('shop/cart', { docTitle: 'Cart', cart: cart, products: cartProducts, path: '/shop/cart'})
        });

    })
}

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId, product => {
    Cart.addProduct(prodId, product.price);
  });
  res.redirect('/cart');
};

 exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', { docTitle: 'Checkout', path: '/checkout'})
}

exports.getOrders = (req, res, next) => {
    res.render('shop/orders', { docTitle: 'Previous Orders', path: '/orders'})
}

exports.deleteCartItem = (req, res, next) => {
    const prodId = req.body.productId;

    Product.findById(prodId, product => {
        Cart.deleteProduct(prodId, +product.price);
        res.redirect('/cart');
    })
 }