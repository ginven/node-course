const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const rootDir = require('./util/path');

const notFoundController = require('./controllers/error.js');
const User = require('./models/user');
const { BADFLAGS } = require('dns');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded());
app.use(express.static(path.join(rootDir, 'public')));

app.use((req, res, next) => {
    User.findById("5ffc3ea892dce11aa8a1800f")
    .then(user => {
        req.user = user;
        next();
    })
    .catch(err => {
        console.log(err);
    })
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use('/', notFoundController.get404);

mongoose.connect('mongodb+srv://ginven:v0rat1nkl1s@cluster0.shkcl.mongodb.net/shop?retryWrites=true&w=majority')
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