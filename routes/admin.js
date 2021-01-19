const express = require('express');
const { body } = require('express-validator')

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router  = express.Router();

router.get('/add-product', isAuth, adminController.getAddProduct);

router.get('/edit-product/:productId', isAuth, adminController.editProduct);

router.get('/products', isAuth, adminController.showProducts);

router.post('/add-product', [
    body('title').isString().trim().isLength({min: 3}),
    body('imageUrl').isURL(),
    body('price').isFloat(),
    body('description').trim().isLength({min: 5, max: 200}),
], isAuth, adminController.postAddProduct);

router.post('/edit-product', [
    body('title').isString().trim().isLength({min: 3}),
    body('imageUrl').isURL(),
    body('price').isFloat(),
    body('description').trim().isLength({min: 5, max: 200}),
], isAuth, adminController.postEditProduct);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
