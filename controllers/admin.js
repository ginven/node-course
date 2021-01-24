const fileHelper = require('../util/file');

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
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    console.log(image)
    if(!image){
        return res.status(422).render('admin/edit-product', { 
            docTitle: 'Add product', 
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            product: {
                title: title,
                price: price,
                description: description
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array() 
            })
    }
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).render('admin/edit-product', { 
            docTitle: 'Add product', 
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            product: {
                title: title,
                price: price,
                description: description
            },
            errorMessage: 'Attached file is not an image',
            validationErrors: []
            })
    }

    const imageUrl = image.path;

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
    .catch(err => {
        // return res.status(500).render('admin/edit-product', { 
        //     docTitle: 'Add product', 
        //     path: '/admin/add-product',
        //     editing: false,
        //     hasError: true,
        //     product: {
        //         title: title,
        //         imageUrl: imageUrl,
        //         price: price,
        //         description: description
        //     },
        //     errorMessage: 'Database operation failed, please try again',
        //     validationErrors: []
        //     })
        // REDIRECTING
        // res.redirect('/500');
        // NEW ERROR
        const error = new Error();
        error.httpStatusCode = 500;
        return next(error);
        })
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
        const error = new Error();
        error.httpStatusCode = 500;
        return next(error);
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
        const error = new Error();
        error.httpStatusCode = 500;
        return next(error);
    })
 }

 exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const image = req.file;
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
        product.price = updatedPrice;
        product.description = updatedDescription;
        if(image){
            fileHelper.deleteFile(product.imageUrl);
            product.imageUrl = image.path;
        }
        return product.save()
        .then(result => {
            console.log('Product updated');
            res.redirect('/admin/products');   
        })
        .catch(err => {
            const error = new Error();
            error.httpStatusCode = 500;
            return next(error);
        })
    })
    .catch(err => {
        const error = new Error();
        error.httpStatusCode = 500;
        return next(error);
    })
 }


 exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
    .then(product => {
        if(!product){
            return next(new Error('Product not found!'))
        }
        fileHelper.deleteFile(product.imageUrl);
        return Product.deleteOne({_id: prodId, userId: req.user._id});
    })
    .then(() => {
        res.redirect('/admin/products')
    })
    .catch(err => {
        const error = new Error();
        error.httpStatusCode = 500;
        return next(error);
    })
 }

