const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
    Product.find()
    .then(products => {
        res.render('shop/product-list', { prods: products, docTitle: 'Products', path: '/products' })
    })
    .catch(err => {
        console.log(err);
    });
 }

 
exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
    .then(product => {
        res.render('shop/product-detail', { 
            docTitle: product.title, 
            product: product, 
            path: '/products'})
    })
    .catch(err => console.log(err))
 }

 exports.getIndex = (req, res, next) => {
    Product.find()
    .then(products => {
        res.render('shop/index', { prods: products, docTitle: 'Shop', path: '/' })
    })
    .catch(err => {
        console.log(err);
    });
 }

 exports.getCart = (req, res, next) => {
     req.user.populate('cart.items.productId')
        .then(products => {
        res.render('shop/cart', { 
            docTitle: 'Cart', 
            products: products, 
            path: '/shop/cart'})
        })
        .catch(err => {
            console.log(err);
        });
}

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
    .then(product => {
        return req.user.addToCart(product);
    })
    .then(result => {
        res.redirect('/cart')
        // console.log(result);
    })
    .catch(err => {
        console.log(err);
    })
};

 exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', { docTitle: 'Checkout', path: '/checkout'})
}

exports.getOrders = (req, res, next) => {
    req.user.getOrders()
    .then(orders => {
        res.render('shop/orders', { docTitle: 'Previous Orders', path: '/orders', orders: orders})
    })
    .catch(err => {
        console.log(err)
    })
}

exports.postOrder = (req, res, next) => {
    req.user.addOrder()
    .then(result => {
        res.redirect('/orders');
    })
    .catch(err => {
        console.log(err)
    })
    // res.render('shop/orders', { docTitle: 'Previous Orders', path: '/orders'})
}

exports.deleteCartItem = (req, res, next) => {
    const prodId = req.body.productId;
    req.user.deleteCartItem(prodId)
    .then(result => {
        res.redirect('/cart');
    })
    .catch(err => {
        console.log(err)
    });
 }