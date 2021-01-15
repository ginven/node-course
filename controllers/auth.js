const User = require('../models/user');

exports.getLogin = (req, res, next) => {
   // const isLoggedIn = req.get('Cookie').split('=')[1].trim() === 'true'
   res.render('auth/login', { 
      docTitle: 'Login to the shop', 
      path: '/login', 
      isAuthenticated: req.session.isLoggedIn
    })
}

exports.postLogin = (req, res, next) => {
   User.findById("5ffc3ea892dce11aa8a1800f")
   .then(user => {
        req.session.isLoggedIn = true;
        req.session.user = user;
        res.redirect('/')
   })
   .catch(err => {
       console.log(err);
   })
}

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    })
}