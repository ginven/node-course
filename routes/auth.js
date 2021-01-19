const express = require('express');
const { check, body } = require('express-validator')

const router  = express.Router();
const authController = require('../controllers/auth');
const User = require('../models/user');


router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.get('/reset', authController.getReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/login',
body('email', 'Please enter a valid email')
.isEmail()
.normalizeEmail(), 
body('password', 'Please enter password minimum of 5 characters length, with only numbers and text')
.isAlphanumeric()
.trim()
.isLength({ min: 5 }),
authController.postLogin);

router.post('/signup', 
check('email')
.isEmail()
.withMessage('Email is invalid, please enter a new one.')
.custom((value, { req }) => {
    return User.findOne({ email: value })
    .then(userDoc => {
      if(userDoc){
        return Promise.reject('This email already exist, please pick a new one.');
      }
    })
})
.normalizeEmail(),
body('password', 'Please enter password minimum of 5 characters length, with only numbers and text')
.trim()
.isLength({ min: 5 })
.isAlphanumeric(),
body('confirmPassword')
.trim()
.custom((value, { req }) => {
    if(value !== req.body.password){
        throw new Error('Passwords must match');
    }
    return true;
}),
 authController.postSignup);

router.post('/logout', authController.postLogout);

router.post('/reset', authController.postReset);

router.post('/new-password', authController.postNewPassword);

module.exports = router;