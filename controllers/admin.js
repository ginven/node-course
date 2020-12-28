const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/add-product', { docTitle: 'Add products', path: '/admin/add-product', activeAddProduct: true, formsCSS: true, productCSS: true})
}

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    const product = new Product(title, imageUrl, price, description);
    product.save();
    res.redirect('/');
}

 
exports.editProduct = (req, res, next) => {
    res.render('admin/edit-product', { docTitle: 'Edit product', path: '/admin/edit-product'})
    console.log('trying to edit product');
 }

 exports.showProducts = (req, res, next) => {
    const products = Product.fetchAll((products) => {
        res.render('admin/products', { prods: products, docTitle: 'Admin products', path: '/admin/products',  activeAdminProducts: true })
    });
 }
