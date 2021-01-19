const { validationResult } = require('express-validator');

const Product = require('../models/product');
const { getProducts } = require('./shop');

exports.getAddProduct = (req, res, next) => {
    if(!req.session.isLoggedIn) {
        return res.redirect('/login')
    }
    res.render('admin/edit-product', { 
        docTitle: 'Add products', 
        path: '/admin/add-product',
        editing: false,
        hasError: false,
        errorMessage: [],
        validationErrors: [] 
    })
}

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).render('admin/edit-product', { 
            docTitle: 'Add product', 
            path: '/admin/edit-product',
            editing: false,
            hasError: true,
            product: {
                title: title,
                imageUrl: imageUrl,
                price: price,
                description: description
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array() 
            })
    }

    const product = new Product({
        title: title, 
        imageUrl: imageUrl, 
        price: price, 
        description: description,
        userId: req.user
    })
    product.save()
    .then(result => {
        console.log('Created Product')
        res.redirect('/admin/products')
    })
    .catch(err => console.log(err))
}

exports.showProducts = (req, res, next) => {
    Product.find( { userId: req.user._id })
     .then(products => {
        res.render('admin/products', { 
            prods: products, 
            docTitle: 'Admin products', 
            path: '/admin/products',  
            activeAdminProducts: true
        })
     })
     .catch(err => {
         console.log(err);
     })
 }

 
exports.editProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if(!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.productId;
    Product.findById(prodId)
    .then(product => {
        if (!product) {
            return res.redirect('/');
        }
        res.render('admin/edit-product', { 
            docTitle: 'Edit product', 
            path: '/admin/edit-product',
            editing: editMode,
            product: product,
            hasError: false,
            errorMessage: [],
            validationErrors: []
            })
    })
    .catch(err => {
        console.log(err)
    })
 }

 exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedImageUrl = req.body.imageUrl;
    const updatedPrice = req.body.price;
    const updatedDescription = req.body.description;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).render('admin/edit-product', { 
            docTitle: 'Edit product', 
            path: '/admin/edit-product',
            editing: true,
            hasError: true,
            product: {
                title: updatedTitle,
                imageUrl: updatedImageUrl,
                price: updatedPrice,
                description: updatedDescription,
                _id: prodId
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array() 
            })
    }
    Product.findById(prodId)
    .then(product => {
        if (product.userId.toString() !== req.user._id.toString()) {
            return res.redirect('/');
        }
        product.title = updatedTitle;
        product.imageUrl = updatedImageUrl;
        product.price = updatedPrice;
        product.description = updatedDescription;
        return product.save()
        .then(result => {
            console.log('Product updated');
            res.redirect('/admin/products');   
        })
        .catch(err => {
            console.log(err);
        }) 
    })
    .catch(err => {
        console.log(err);
    }) 
 }


 exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.deleteOne({_id: prodId, userId: req.user._id})
    .then(() => {
        res.redirect('/admin/products')
    })
    .catch(err => {
        console.log(err);
    })
 }

