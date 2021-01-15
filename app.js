const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const rootDir = require('./util/path');

const notFoundController = require('./controllers/error.js');
const User = require('./models/user');

const MONGODB_URI = 'mongodb+srv://ginven:v0rat1nkl1s@cluster0.shkcl.mongodb.net/shop'

const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded());
app.use(express.static(path.join(rootDir, 'public')));
app.use(session({
    secret: 's3cr3t', 
    resave: false, 
    saveUninitialized: false,
    store: store
}));

app.use((req, res, next) => {
    if (!req.session.user) {
      return next();
    }
    User.findById(req.session.user._id)
      .then(user => {
        req.user = user;
        next();
      })
      .catch(err => console.log(err));
  });

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use('/', notFoundController.get404);

mongoose.connect(MONGODB_URI)
.then(result => {
    User.findOne().then(user => {
        if(!user) {
            const user = new User({
                name: 'Gintare',
                email: 'gintare@bla.com',
                cart: {
                    items: []
                }
            });
            user.save();
        }
    })
    app.listen(3001);
})
.catch(err => {
    comsole.log(err);
});