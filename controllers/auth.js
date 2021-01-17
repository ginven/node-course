const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator')

const { sendgridApi } = require('../config');
const User = require('../models/user');
const user = require('../models/user');

const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: sendgridApi
  }
}))

exports.getLogin = (req, res, next) => {
   res.render('auth/login', { 
      docTitle: 'Login to the shop', 
      path: '/login', 
      errorMessage: req.flash('error') 
    })
}

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
      path: '/signup',
      docTitle: 'Signup',
      errorMessage: req.flash('error') 
    });
  };

  
exports.getReset = (req, res, next) => {
  res.render('auth/reset', { 
     docTitle: 'Update your password', 
     path: '/reset', 
     errorMessage: req.flash('error') 
   })
}

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: {$gt: Date.now() } })
  .then(user => {
    if (!user) {
      req.flash(
        'error',
        'Oops! That reset password link has already been used. If you still need to reset your password, submit a new request.'
      )
      return res.redirect('/login');
    }
    res.render('auth/new-password', { 
      docTitle: 'Reset your password', 
      path: '/new-password', 
      errorMessage: req.flash('error'),
      userId: user._id.toString(),
      passwordToken: token
    })
  })
  .catch(err => {
    console.log(err);
  })
}


exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
   User.findOne( { email: email })
   .then(user => {
      if (!user) {
        req.flash('error', 'Invalid email or password')
        return res.redirect('/login');
      }
      bcrypt.compare(password, user.password)
      .then(doMatch => {
        if(doMatch){
          req.session.isLoggedIn = true;
          req.session.user = user;
           return req.session.save((err) => {
              console.log(err);
              res.redirect('/');
          })
        }
        req.flash('error', 'Invalid email or password')
        res.redirect('/login')
      })
      .catch(err => {
        console.log(err);
        res.redirect('/login');
      })
   })
   .catch(err => {
       console.log(err);
   })
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResults(req);
  if(!errors.isEmpty()) {
    console.log(errors.array())
    return res.status(422).render('auth/signup', {
      path: '/signup',
      docTitle: 'Signup',
      errorMessage: errors.array()
    });
  }

  User.findOne({ email: email })
  .then(userDoc => {
    if(userDoc){
      req.flash('error', 'This email already exists.')
      return res.redirect('/signup');
    }
    return bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] }
      });
      return user.save();
    })
    .then(result => {
      res.redirect('/login');
      return transporter.sendMail({
        to: email,
        from: 'gintare.ragelyte@nfq.lt',
        subject: 'Signup suceeded',
        html: '<h1>You created account</h1>'
      })
    })
    .catch(err => console.log(err))
  })
  .catch(err => {
    console.log(err);
  })
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    })
}

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err)
      return res.redirect('/login');
    }
    const token = buffer.toString('hex');
    User.findOne( {email: req.body.email })
    .then(user => {
      if(!user) {
        req.flash('error', 'This email doesn\'t exist.')
        return res.redirect('/reset');
      }
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() +  3600000;
      return user.save()
      .then(result => {
        res.redirect('/');
        transporter.sendMail({
          to: req.body.email,
          from: 'gintare.ragelyte@nfq.lt',
          subject: 'Password reset',
          html: `<h1> You requested password reset</h1>
                <p>Click this link to set a new password (valid for one hour):</p>     
                <a href="http://localhost:3001/reset/${token}">Reset password</a>   
          `
        })
      })
      .catch(err => {
        console.log(err);
      })
    })
    .catch(err => {
      console.log(err);
    })
  })
}

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({ resetToken: passwordToken, resetTokenExpiration: {$gt: Date.now() }, _id: userId })
  .then(user => {
    resetUser = user;
    return bcrypt.hash(newPassword, 12)  
  })
  .then(hashedPassword => {
    resetUser.password = hashedPassword;
    resetUser.resetToken = undefined;
    resetUser.resetTokenExpiration = undefined;
    return resetUser.save();
  })
  .then(result => {
    res.redirect('/login');
  })
  .catch(err => {
    console.log(err);
  })
}
