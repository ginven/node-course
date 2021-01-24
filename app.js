const { MONGODB_URI } = require('./config.js')

const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const rootDir = require('./util/path');

const notFoundController = require('./controllers/error.js');
const User = require('./models/user');


const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});
const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now()  + '-' + file.originalname)
  }
});

const fileFilter = (req, file, cb) => {
  if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    console.log(file);
    cb(null, true);
  } else {
    cb(null, false)
  }
};

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'))
app.use(express.static(path.join(rootDir, 'public')));
app.use('/images', express.static(path.join(rootDir, 'images')));
app.use(session({
    secret: 's3cr3t', 
    resave: false, 
    saveUninitialized: false,
    store: store
}));

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
})

app.use((req, res, next) => {
    if (!req.session.user) {
      return next();
    }
    User.findById(req.session.user._id)
      .then(user => {
        if(!user){
          return next();
        }
        req.user = user;
        next();
      })
      .catch(err => {
        next(new Error(err))
      });
  });

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use('/500', notFoundController.get500);

app.use(notFoundController.get404);

app.use((error, req, res, next) => {
  res.status(500).render('500', {
    docTitle: 'Error!', 
    path: '/500',
    isAuthenticated: req.session.isLoggedIn
});
})

mongoose.connect(MONGODB_URI)
.then(result => {
    app.listen(3001);
})
.catch(err => {
    console.log(err);
});